# sabbat‑cyberpunk‑console (ES)

Consola web retro estilo **cyberpunk** con **Flask** (backend) y **JavaScript** ligero en el frontend. Escribe comandos, cambia de tema y lanza mini‑apps integradas como **Ajedrez** y el simulador de **Guerra Nuclear**.

<p align="center">
  <img src="static/img/og.png" alt="Cyberpunk Console" width="640"/>
</p>

---

## ✨ Características
* **Segura por defecto**: CSP/HSTS, cookies endurecidas y *rate limiting* opcional.
* **Interfaz de Terminal Realista:** Un shell interactivo con historial de comandos, autocompletado (Tab), tuberías (`|`) y redirección de salida (`>`).
* **Sistema de Archivos Virtual:** Navega por un sistema de archivos simulado con comandos como `ls`, `cd`, `cat`, `grep` y `wc`.
* **Juegos Integrados:**
    * **Ajedrez:** Juega una partida de ajedrez contra una IA simple directamente en la terminal.
    * **Guerra Termonuclear Global:** Un simulador estratégico inspirado en la película "WarGames".
    * **Firewall Breach:** Un minijuego donde debes explotar vulnerabilidades para desactivar un cortafuegos.
    * **PyTrek:** Un clásico juego de estrategia espacial.
    * **Aventura de Texto:** Explora un misterioso vacío digital.
* **Utilidades de Cifrado:** Cifra y descifra mensajes usando algoritmos clásicos como **César** y **XOR**.
* **Herramientas y Juguetes:**
    * Consulta del **clima** en tiempo real.
    * Generador de **arte ASCII** con `pyfiglet`.
    * Calculadora, calendario y comandos divertidos como `cowsay` y `fortune`.
    * Un editor de texto en terminal (`nano`).
    * Un gestor de archivos visual de doble panel (`mc`).
* **Personalización:** Cambia la apariencia de la terminal con múltiples **temas de color** (`theme matrix`, `theme amber`, etc.).
* **Secretos:** El terminal esconde muchos secretos. Podras escontarlos todos?
* **Internacionalización (i18n):** Soporte completo para **Inglés** y **Español** (`set lang es`).
> Versión en inglés: **[README.md](README.md)**

---

## 🚀 Puesta en marcha (desarrollo)

### Requisitos
- Python **3.11+** (3.13 OK)
- Node opcional (si quieres empaquetar/minificar assets)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=app.py
export SECRET_KEY=$(python - <<<'import os;print(os.urandom(32).hex())')
flask run --port 8000
```
Abre **http://127.0.0.1:8000**

### Gunicorn (desarrollo)
```bash
gunicorn --workers 2 --threads 2 --bind 127.0.0.1:8000 wsgi:app
```

---

## 🧩 Estructura
```
/sabbat-cyberpunk-console
├── LICENSE
├── PyTrek (https://github.com/Python3-Training/PyTrek)
│  
├── README-ES.md
├── README.md
├── app.py
├── chess_engine.py
├── myweb.service.example
├── nuclearwar_engine.py
├── requirements.txt
├── robots.txt
├── sessions
├── sitemap.xml
├── static
│   ├── css
│   │   ├── mc.css
│   │   └── style.css
│   ├── data
│   │   └── world_coast_min.geojson
│   └── js
│       ├── csrf-init.js
│       ├── script.js
│       ├── tone-14.7.77.min.js
│       └── typeit.min.js
├── templates
│   └── index.html
├── tree.txt
├── weather_cache.py
├── wsgi.py
└── xor_generator.py

```

---

## ⌨️ Comandos
- `help` – ayuda
- `theme matrix|amber|arctic|random` – cambia tema
- `chess fen <FEN>` – carga posición
- `chess move <uci>` – mueve (p.ej. `e2e4`)
- `nuclear [seed]` – ejecuta simulación con semilla numérica opcional

---

## 🔒 Seguridad
- **App**: clave desde `SECRET_KEY` (env); cookies `Secure`, `HttpOnly`, `SameSite=Lax`.
- **Cabeceras**: CSP + HSTS + Referrer‑Policy + X‑Content‑Type‑Options + X‑Frame‑Options (con `flask-talisman` o `after_request`).
- **Frontend**: evitar `innerHTML` para contenido dinámico; preferir `textContent` / DOM; si necesitas HTML, sanitiza con DOMPurify.
- **Rate limiting**: opcional con `Flask-Limiter`.

---

## 🛠 API (JSON)

### `GET /api/nuclear?seed=<int>`
Devuelve `{ seed, events: [...], summary: {...} }`. Siempre arrays (posible vacío).

### `POST /api/chess` (JSON)
- `{ action: "legal", fen }` → `{ moves: ["e2e4", ...] }`
- `{ action: "push", fen, move }` → `{ fen, last_move, status }`

> El esquema puede evolucionar; ver `chess_engine.py` y `nuclearwar_engine.py`.

---

## 📦 Producción

### Gunicorn + nginx
- Gunicorn: `gunicorn --workers 3 --threads 2 --bind 127.0.0.1:8000 wsgi:app`
- nginx: *reverse proxy* a Gunicorn; cache de `/static/` 30 días; habilitar HSTS y HTTP/2.

### systemd (extracto)
```ini
[Service]
Environment="SECRET_KEY=/run/secrets/myweb.key"
ExecStart=/var/www/myweb/venv/bin/gunicorn --workers 3 --threads 2 --bind 127.0.0.1:8000 wsgi:app
Restart=always
```

---

## 🧪 Pruebas
- Python: perft para ajedrez y determinismo para nuclear.
- Web: Playwright (comandos `help`, `theme`, `nuclear`) y cumplimiento CSP.

---

## 🧭 Hoja de ruta
- *Bootstrap* de audio tras gesto del usuario; soporte opcional de AudioWorklet.
- Añadir libro de aperturas y exportación PGN.
- PWA + *offline* con mini‑juego.

---

## 🤝 Contribuir
PRs bienvenidos. Ejecuta linters y tests antes del PR.

```bash
ruff check . && black --check .
eslint static/js --ext .js
pytest -q
```

---

## 📝 Licencia
MIT Ver `LICENSE`.
