#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
nuclearwar_engine.py — Motor para simulación estilo "WarGames"
- Sin dependencias externas.
- Genera una línea de tiempo (eventos) para animar en frontend.
- Añade controles para evitar “friendly fire” visual (p. ej., USA -> USA),
  imponiendo una distancia mínima y una matriz de probabilidad de objetivos.

API principal
-------------
generate_simulation(
    num_missiles: int = 180,
    waves: int = 6,
    seed: Optional[int] = None,
    blocs: Optional[List[str]] = None,
    # extras opcionales
    no_friendly_fire: bool = True,
    min_range_km: float = 1500.0,
    prob_matrix: Optional[Dict[str, Dict[str, float]]] = None
) -> Dict[str, Any]
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import List, Dict, Tuple, Any, Optional
import math
import random

# ------------------------------------------------------------
# Sitios aproximados (sintéticos) por bloque — (lon, lat)
# ------------------------------------------------------------
BLOC_SITES: Dict[str, List[Tuple[float, float]]] = {
    "USA":    [(-123, 38), (-120, 37), (-112, 46), (-105, 39), (-97, 40), (-90, 41), (-77, 39), (-100, 32)],
    "RUSSIA": [(30, 60), (37, 56), (55, 55), (60, 55), (75, 55), (90, 56), (105, 57), (120, 56), (135, 48)],
    "CHINA":  [(116, 40), (106, 30), (87, 43), (121, 31), (113, 23), (104, 36)],
    "EU":     [(-8, 52), (2, 48), (6, 50), (10, 46), (14, 52), (24, 60), (-3, 52), (8, 50)],
    "INDIA":  [(77, 28), (73, 18), (88, 22)],
    "PAK":    [(67, 24), (74, 31)],
    "DPRK":   [(125, 39), (129, 41)],
    "ISR":    [(35, 32)],
}
ALL_BLOCS = list(BLOC_SITES.keys())

# ------------------------------------------------------------
# Matriz por defecto de probabilidades (peso) de objetivos
# (no tiene por qué sumar 1, se normaliza)
# ------------------------------------------------------------
DEFAULT_PROB_MATRIX: Dict[str, Dict[str, float]] = {
    "USA":    {"RUSSIA": 4.0, "CHINA": 3.0, "EU": 1.0, "INDIA": 0.2, "PAK": 0.2, "DPRK": 1.4, "ISR": 0.1},
    "RUSSIA": {"USA": 4.0, "EU": 3.0, "CHINA": 1.0, "INDIA": 0.3, "PAK": 0.3, "DPRK": 0.8, "ISR": 0.1},
    "CHINA":  {"USA": 3.0, "INDIA": 2.0, "EU": 1.0, "RUSSIA": 1.0, "PAK": 1.2, "DPRK": 0.6, "ISR": 0.1},
    "EU":     {"RUSSIA": 4.0, "USA": 2.0, "CHINA": 1.0, "INDIA": 0.2, "PAK": 0.2, "DPRK": 0.2, "ISR": 0.2},
    "INDIA":  {"PAK": 4.0, "CHINA": 2.0, "USA": 0.2, "EU": 0.2, "RUSSIA": 0.5, "DPRK": 0.2, "ISR": 0.2},
    "PAK":    {"INDIA": 4.0, "CHINA": 0.8, "USA": 0.2, "EU": 0.2, "RUSSIA": 0.5, "DPRK": 0.2, "ISR": 0.2},
    "DPRK":   {"USA": 3.5, "RUSSIA": 0.6, "CHINA": 0.6, "EU": 0.7, "INDIA": 0.2, "PAK": 0.2, "ISR": 0.2},
    "ISR":    {"RUSSIA": 0.5, "CHINA": 0.5, "EU": 0.8, "INDIA": 0.6, "PAK": 1.2, "USA": 0.5, "DPRK": 0.3},
}

# ------------------------------------------------------------
# Datos / Cálculos básicos
# ------------------------------------------------------------
@dataclass
class Event:
    t_depart: float
    t_flight: float
    attacker: str
    defender: str
    from_lon: float
    from_lat: float
    to_lon: float
    to_lat: float
    yield_kt: int

def haversine_km(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    """Distancia del gran círculo (km)."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    # normaliza diferencia de longitudes a [-180, 180]
    dlon_raw = (lon2 - lon1 + 540) % 360 - 180
    dlambda = math.radians(dlon_raw)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.asin(math.sqrt(a))

def estimate_flight_time(distance_km: float) -> float:
    """Tiempo de vuelo (s) pseudo-realista — saturado entre 6 y 24 s."""
    d = max(0.0, min(15000.0, distance_km))
    return 6.0 + (18.0 * (d / 15000.0))  # 6..24 s

def km_to_deg_lat(km: float) -> float:
    return km / 111.32

def km_to_deg_lon(km: float, at_lat_deg: float) -> float:
    return km / (111.32 * max(0.1, math.cos(math.radians(at_lat_deg))))

def pick_weighted(defenders: Dict[str, float]) -> Optional[str]:
    items = [(k, float(v)) for k, v in defenders.items() if v > 0]
    if not items:
        return None
    total = sum(w for _, w in items)
    r = random.random() * total
    acc = 0.0
    for name, w in items:
        acc += w
        if r <= acc:
            return name
    return items[-1][0]

# ------------------------------------------------------------
# Lógica principal
# ------------------------------------------------------------
def generate_simulation(
    num_missiles: int = 180,
    waves: int = 6,
    seed: Optional[int] = None,
    blocs: Optional[List[str]] = None,
    # opciones anti “self-hit” / realismo
    no_friendly_fire: bool = True,
    min_range_km: float = 1500.0,
    prob_matrix: Optional[Dict[str, Dict[str, float]]] = None,
) -> Dict[str, Any]:
    """
    Genera una línea de tiempo de eventos.
    - no_friendly_fire: evita elegir el mismo bloque como defensor.
    - min_range_km: fuerza que el objetivo esté a >= min_range_km.
    - prob_matrix: pesos por atacante para elegir defensores (dict anidado).
    """
    if seed is not None:
        random.seed(seed)

    use_blocs = blocs[:] if blocs else ALL_BLOCS[:]
    if not use_blocs:
        raise ValueError("No hay bloques disponibles.")

    # Mezcla orden base para olas
    random.shuffle(use_blocs)

    # Normaliza matriz de prob si se pasa, o usa la por defecto
    pmatrix = prob_matrix or DEFAULT_PROB_MATRIX

    # Config de reparto y timeline
    missiles_per_wave = max(1, num_missiles // max(1, waves))
    events: List[Event] = []
    t_cursor = 0.0

    # Helper: elige defensor con pesos y restricciones
    def choose_defender(attacker: str) -> str:
        weights = dict(pmatrix.get(attacker, {}))

        # Si falta alguno en la matriz, añade con peso mínimo
        for b in use_blocs:
            if b == attacker and no_friendly_fire:
                continue
            if b not in weights:
                weights[b] = 0.5

        # Evita self si así se pide
        if no_friendly_fire and attacker in weights:
            weights.pop(attacker, None)

        # Si tras filtrado no queda nada, elige uniforme entre otros
        if not weights:
            choices = [b for b in use_blocs if b != attacker] if no_friendly_fire else use_blocs[:]
            return random.choice(choices)

        d = pick_weighted(weights)
        if d is None or (no_friendly_fire and d == attacker):
            # Fallback uniforme
            choices = [b for b in use_blocs if b != attacker] if no_friendly_fire else use_blocs[:]
            return random.choice(choices)
        return d

    # Helper: selecciona par de sitios cumpliendo distancia mínima
    def pick_sites_with_range(attacker: str, defender: str, min_km: float) -> Tuple[Tuple[float, float], Tuple[float, float]]:
        src_sites = BLOC_SITES[attacker]
        dst_sites = BLOC_SITES[defender]

        # Intenta varias veces; si no consigue el rango, va reduciendo
        attempts = 0
        current_min = float(min_km)
        while attempts < 20:
            fr_lon, fr_lat = random.choice(src_sites)
            to_lon, to_lat = random.choice(dst_sites)
            dist = haversine_km(fr_lon, fr_lat, to_lon, to_lat)
            if dist >= current_min:
                return (fr_lon, fr_lat), (to_lon, to_lat)
            attempts += 1
            # al 10º intento reduce exigencia un 20% y luego otro 20%
            if attempts in (10, 15):
                current_min *= 0.8
        # Fallback: sin condición de rango si todo falla
        return random.choice(src_sites), random.choice(dst_sites)

    for w in range(waves):
        # Rueda el orden de atacantes en cada ola
        attacker_order = use_blocs[w % len(use_blocs):] + use_blocs[: w % len(use_blocs)]

        # Stagger entre olas para solapamiento
        if w > 0:
            t_cursor -= 1.2

        for attacker in attacker_order:
            # Lote por atacante en esta ola
            sub_batch = max(1, int(round(missiles_per_wave / max(1, len(use_blocs)))))

            for _ in range(sub_batch):
                defender = choose_defender(attacker)
                (fr_lon, fr_lat), (to_lon, to_lat) = pick_sites_with_range(attacker, defender, min_range_km)

                # Distancia / tiempo de vuelo
                dist = haversine_km(fr_lon, fr_lat, to_lon, to_lat)
                t_flight = estimate_flight_time(dist)

                # Potencia orientativa por distancia (ligeramente mayor a larga distancia)
                if dist >= 8000:
                    yld = random.choice([800, 1000, 1500, 2000])
                elif dist >= 4000:
                    yld = random.choice([500, 800, 1000, 1500])
                else:
                    yld = random.choice([150, 300, 500, 800])

                jitter = random.uniform(0.05, 0.6)

                events.append(
                    Event(
                        t_depart=round(t_cursor + jitter, 2),
                        t_flight=round(t_flight, 2),
                        attacker=attacker,
                        defender=defender,
                        from_lon=round(fr_lon, 3),
                        from_lat=round(fr_lat, 3),
                        to_lon=round(to_lon, 3),
                        to_lat=round(to_lat, 3),
                        yield_kt=int(yld),
                    )
                )

            # Avanza el cursor temporal para el siguiente atacante
            t_cursor += random.uniform(0.6, 1.4)

    # Ordena eventos por salida
    events.sort(key=lambda e: e.t_depart)

    final_message = (
        "Simulation complete.\n"
        "Unacceptable casualties.\n"
        "Total annihilation of the human race.\n"
        "Curious game, the only way to win is by not playing."
    )

    return {
        "meta": {
            "missiles": len(events),
            "waves": waves,
            "order": use_blocs,
            "no_friendly_fire": no_friendly_fire,
            "min_range_km": min_range_km,
        },
        "events": [asdict(e) for e in events],
        "message": final_message,
    }


# Pequeña prueba manual (opcional):
if __name__ == "__main__":
    tl = generate_simulation(num_missiles=60, waves=3, seed=42, min_range_km=2000.0)
    print(f"Missiles: {tl['meta']['missiles']}  Waves: {tl['meta']['waves']}")
    print("First 3 events:")
    for ev in tl["events"][:3]:
        print(ev)

