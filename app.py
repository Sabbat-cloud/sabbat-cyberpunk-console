# app.py
from flask import Flask, render_template, request, session
import csv
import datetime as dt
import re
import os
import subprocess
import requests
import random
from ansi2html import Ansi2HTMLConverter
from dotenv import load_dotenv
from flask_session import Session

# --- Misiones & Logros -------------------------------------------------------

MISSIONS_DATA = {
    '01_HACK_FIREWALL': {
        'name': 'Rompe las barreras',
        'description': 'Completa con éxito el minijuego de intrusión de firewall.',
        'is_complete': lambda s: s.get('achievements', {}).get('firewall_hacked', False)
    },
    '02_DECRYPT_SECRET': {
        'name': 'Criptoanalista',
        'description': 'Usa el comando `decrypt` para descifrar un mensaje oculto.',
        'is_complete': lambda s: s.get('achievements', {}).get('decrypted_secret', False)
    }
}

ACHIEVEMENTS_DATA = {
    'firewall_hacked': 'Hacker de Cortafuegos',
    'decrypted_secret': 'Revelador de Secretos',
}

# --- PyTrek (opcional) -------------------------------------------------------

import sys
sys.path.insert(0, os.path.dirname(__file__))

try:
    from PyTrek.PyTrek1 import Game
    import io
    from contextlib import redirect_stdout
    PYTREK_AVAILABLE = True
except ImportError as e:
    print(f"[pytrek] Error al importar PyTrek: {e}. Asegúrate de que la estructura de carpetas es correcta.")
    PYTREK_AVAILABLE = False

# --- Ajedrez (opcional) ------------------------------------------------------

try:
    from chess_engine import ChessGame
    CHESS_AVAILABLE = True
except ImportError as e:
    print(f"[chess] Error al importar chess_engine: {e}. Coloca 'chess_engine.py' junto a app.py.")
    CHESS_AVAILABLE = False

# --- Flask & Sesiones --------------------------------------------------------

load_dotenv()

app = Flask(__name__, static_url_path="/static", static_folder="static", template_folder="templates")

# Clave de sesión obligatoria
app.secret_key = os.getenv("FLASK_SECRET_KEY")
if not app.secret_key:
    raise RuntimeError("❌ Falta la variable de entorno FLASK_SECRET_KEY")

# Config de sesiones (Filesystem por defecto)
app.config["SESSION_TYPE"] = "filesystem"
# app.config["SESSION_PERMANENT"] = False
# app.config["SESSION_USE_SIGNER"] = True
Session(app)

# Ficheros de logs mínimos
VISITORS_FILE = 'visitors.csv'
CSV_HEADER = ['timestamp', 'ip_address', 'user_agent', 'referrer']
LOG_FILE = 'log.txt'

# Almacenamiento simple en memoria para juegos
game_instances = {}   # PyTrek
chess_sessions = {}   # Ajedrez

# --- Utilidades --------------------------------------------------------------

def client_ip(req) -> str:
    xfwd = req.headers.get('X-Forwarded-For', '')
    if xfwd:
        # coge el primer IP si hay lista
        return xfwd.split(',')[0].strip()
    return req.remote_addr or "0.0.0.0"

# --- Rutas -------------------------------------------------------------------

@app.route('/')
def index():
    # Log visitante
    try:
        timestamp = dt.datetime.now().isoformat()
        ip_address = client_ip(request)
        user_agent = request.headers.get('User-Agent', '')
        referrer = request.headers.get('Referer', '')
        file_exists = os.path.exists(VISITORS_FILE)
        with open(VISITORS_FILE, 'a', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            if not file_exists:
                writer.writerow(CSV_HEADER)
            writer.writerow([timestamp, ip_address, user_agent, referrer])
    except IOError as e:
        print(f"[visitors] Error escribiendo {VISITORS_FILE}: {e}")

    # Limpia sesión PyTrek previa
    if 'game_session_id' in session:
        sid = session.pop('game_session_id', None)
        if sid and sid in game_instances:
            game_instances.pop(sid, None)

    # Limpia sesión Ajedrez previa
    if 'chess_session_id' in session:
        sid = session.pop('chess_session_id', None)
        if sid and sid in chess_sessions:
            chess_sessions.pop(sid, None)

    return render_template('index.html')

@app.route('/healthz')
def healthz():
    return {"ok": True, "time": dt.datetime.utcnow().isoformat() + "Z"}, 200

# --- Weather -----------------------------------------------------------------

@app.route('/api/weather', methods=['GET'])
def get_weather():
    api_key = os.getenv('OWM_API_KEY', '').strip()
    if not api_key:
        return "Error: OWM_API_KEY no configurada.", 500

    location = request.args.get('city', 'Alicante,ES')
    sanitized_city = re.sub(r'[^\w\s,-]', '', location)[:50].strip() or 'Alicante,ES'

    api_url = "http://api.openweathermap.org/data/2.5/weather"
    params = {'q': sanitized_city, 'appid': api_key, 'units': 'metric'}

    try:
        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status()
        weather_json_string = response.text
    except requests.RequestException as e:
        return f"Error de red contactando OpenWeatherMap: {e}", 500

    try:
        result = subprocess.run(
            ['ansiweather', '-i', '-F', '-u', 'metric'],
            input=weather_json_string, capture_output=True, text=True, timeout=15, check=True
        )
        conv = Ansi2HTMLConverter(inline=True, scheme='xterm')
        return conv.convert(result.stdout, full=False), 200, {'Content-Type': 'text/html; charset=utf-8'}
    except Exception as e:
        return f"Error del formateador ansiweather: {e}", 500

# --- PyTrek API --------------------------------------------------------------

@app.route('/api/pytrek', methods=['POST'])
def handle_pytrek():
    if not PYTREK_AVAILABLE:
        return {"output": "Error: Módulo PyTrek no encontrado en el servidor.", "game_over": True}, 500

    data = request.get_json(silent=True) or {}
    command = (data.get('command') or '').strip().lower()
    session_id = session.get('game_session_id')

    if command == 'start_game':
        session_id = os.urandom(16).hex()
        session['game_session_id'] = session_id

        f = io.StringIO()
        with redirect_stdout(f):
            game_instance = Game()
            # Necesita que PyTrek1.py acepte run(init_only=True)
            game_instance.run(init_only=True)
        game_instances[session_id] = game_instance
        return {"output": f.getvalue(), "game_over": False}

    if not session_id or session_id not in game_instances:
        return {"output": "Error: No hay sesión de juego activa.", "game_over": True}, 400

    game = game_instances[session_id]

    if command in ['quit', 'exit']:
        del game_instances[session_id]
        session.pop('game_session_id', None)
        return {"output": "\nSaliendo de PyTrek...", "game_over": True}

    f = io.StringIO()
    with redirect_stdout(f):
        # Requiere que command_prompt procese la cadena
        game.command_prompt(command)

    output = f.getvalue()
    game_over = not game.game_on()

    if game_over:
        del game_instances[session_id]
        session.pop('game_session_id', None)
        f_exit = io.StringIO()
        with redirect_stdout(f_exit):
            game.show_exit_status()
        output += f_exit.getvalue()

    return {"output": output, "game_over": game_over}

# --- Ajedrez API -------------------------------------------------------------

@app.route('/api/chess', methods=['POST'])
def handle_chess():
    if not CHESS_AVAILABLE:
        return {"ok": False, "output": "<pre>Error: 'chess_engine.py' no está disponible en el servidor.</pre>", "game_over": True}, 500

    data = request.get_json(silent=True) or {}
    cmd = (data.get('command') or '').strip().lower()
    sid = session.get('chess_session_id')

    def start_new():
        game = ChessGame()
        newsid = os.urandom(8).hex()
        session['chess_session_id'] = newsid
        chess_sessions[newsid] = game
        html = ("<pre>Game created, you play with <b>White</b>. "
                "Mueve con <code>chess move e2e4</code> · salir: <code>chess exit</code></pre>") + game.board_html()
        return {"ok": True, "output": html, "game_over": False}, 200

    if cmd == 'start':
        return start_new()

    if cmd == 'status':
        if not sid or sid not in chess_sessions:
            return {"ok": False, "output": "<pre>No active game. Use <code>chess start</code>.</pre>", "game_over": True}, 200
        game = chess_sessions[sid]
        return {"ok": True, "output": game.board_html(), "game_over": False}, 200

    if cmd in ('exit', 'quit'):
        if sid in chess_sessions:
            del chess_sessions[sid]
        session.pop('chess_session_id', None)
        return {"ok": True, "output": "<pre>Closed chess game.</pre>", "game_over": True}, 200

    if cmd.startswith('move'):
        if not sid or sid not in chess_sessions:
            return {"ok": False, "output": "<pre>No game. Use <code>chess start</code>.</pre>", "game_over": True}, 200
        game = chess_sessions[sid]
        parts = cmd.split()
        if len(parts) < 2:
            return {"ok": False, "output": "<pre>Use: chess move e2e4</pre>" + game.board_html(), "game_over": False}, 200

        mv = game.move_from_str(parts[1])
        if not mv:
            return {"ok": False, "output": f"<pre>Invalidad movement: {parts[1]} · Formato: e2e4</pre>" + game.board_html(), "game_over": False}, 200

        # Jugada humana (blancas)
        game.apply(mv)
        over, white_won = game.status()
        if over:
            html = game.board_html()
            msg = "<pre>Chekmate. ¡You won!</pre>" if white_won else "<pre>End of the game (draw or checkmate).</pre>"
            del chess_sessions[sid]
            session.pop('chess_session_id', None)
            return {"ok": True, "output": html + msg, "game_over": True}, 200

        # Respuesta motor (negras)
        em = game.engine_move()
        if em is None:
            html = game.board_html()
            end = "<pre>End game.</pre>"
            del chess_sessions[sid]
            session.pop('chess_session_id', None)
            return {"ok": True, "output": html + end, "game_over": True}, 200

        game.apply(em)
        over, white_won = game.status()
        html = game.board_html()
        if over:
            msg = "<pre>Checkmate. <b>Black</b> win.</pre>" if not white_won else "<pre>Chekmate. <b>White</b> wins.</pre>"
            del chess_sessions[sid]
            session.pop('chess_session_id', None)
            return {"ok": True, "output": html + msg, "game_over": True}, 200

        return {"ok": True, "output": html, "game_over": False}, 200

    if cmd in ('help', ''):
        help_html = """
<pre>
AJEDREZ — Comandos:
  chess start            # nueva partida (juegas con Blancas) / new game (U play with white)
  chess status           # redibuja el tablero / redraw the board
  chess move e2e4        # realiza un movimiento / make a move
  chess exit             # termina la partida / end game

Formato de movimiento: algebraico simple origen-destino, ej. e2e4, b1c3, e7e8q (promo)
Movement format: simple algebraic origin-destination, ej. e2e4, b1c3, e7e8q (promo)
</pre>
"""
        return {"ok": True, "output": help_html, "game_over": False}, 200

    return {"ok": False, "output": "<pre>Unrecognized or invalid movement.</pre>", "game_over": False}, 200

# --- Command logger ----------------------------------------------------------

@app.route('/log', methods=['POST'])
def log_command():
    try:
        data = request.get_json(silent=True) or {}
        command_raw = data.get('command')
        if not command_raw:
            return '', 400
        command_sanitized = re.sub(r'[\r\n\t\x00-\x1f]', ' ', command_raw).strip()[:500]
        timestamp = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        ip_address = client_ip(request)
        log_entry = f"[{timestamp}] (IP: {ip_address}) > {command_sanitized}\n"
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(log_entry)
        return '', 204
    except Exception as e:
        print(f"[log] Error logging command: {e}")
        return '', 500

# --- Ciphers -----------------------------------------------------------------

from pyfiglet import Figlet, FigletError

def cipher_xor(text, key):
    """Cifra/descifra XOR con clave numérica."""
    try:
        key_num = int(key)
        return "".join(chr(ord(c) ^ key_num) for c in text)
    except (ValueError, TypeError):
        return "Error: La clave para XOR debe ser un número."

def cipher_caesar(text, key, decrypt=False):
    """Cifra/descifra César con desplazamiento numérico."""
    try:
        key_num = int(key)
        if decrypt:
            key_num = -key_num

        result = ""
        for char in text:
            if 'a' <= char <= 'z':
                result += chr((ord(char) - ord('a') + key_num) % 26 + ord('a'))
            elif 'A' <= char <= 'Z':
                result += chr((ord(char) - ord('A') + key_num) % 26 + ord('A'))
            else:
                result += char
        return result
    except (ValueError, TypeError):
        return "Error: La clave para César debe ser un número."

@app.route('/api/cipher', methods=['POST'])
def handle_cipher():
    data = request.get_json(silent=True) or {}
    mode = data.get('mode')
    algorithm = (data.get('algorithm') or '').lower()
    text = data.get('text')
    key = data.get('key')

    if not all([mode, algorithm, text, key]):
        return "Error: Faltan parámetros (mode, algorithm, text, key).", 400

    if algorithm == 'xor':
        result = cipher_xor(text, key)
    elif algorithm == 'caesar':
        result = cipher_caesar(text, key, decrypt=(mode == 'decrypt'))
    else:
        return f"Error: Algoritmo '{algorithm}' no soportado.", 400

    return result, 200, {'Content-Type': 'text/plain; charset=utf-8'}

@app.route('/api/ascii', methods=['POST'])
def handle_ascii():
    data = request.get_json(silent=True) or {}
    text = data.get('text')
    font = data.get('font', 'standard')

    if not text:
        return "Error: No se ha proporcionado texto.", 400

    try:
        f = Figlet(font=font)
        ascii_art = f.renderText(text)
        return f"<pre>{ascii_art}</pre>", 200, {'Content-Type': 'text/html; charset=utf-8'}
    except FigletError:
        return f"Error: Fuente '{font}' no encontrada.", 400

# --- Firewall mini-game ------------------------------------------------------

@app.route('/api/firewall', methods=['POST'])
def handle_firewall():
    command = (request.get_json(silent=True) or {}).get('command', '').lower().strip()

    # Iniciar el juego
    if command == 'start' or 'firewall_game' not in session:
        session['firewall_game'] = {
            'integrity': 100,
            'time_left': 30,
            'vulnerabilities': {'http': 'SQLi', 'rpc': 'buffer_overflow'},
            'discovered': [],
            'game_over': False
        }
        output = ("Iniciando simulación de intrusión en OmniCorp Firewall v3.1\n"
                  "> Integridad del firewall: 100% | Tiempo restante: 30s\n"
                  "> Comandos disponibles: scan, bruteforce [puerta], exploit [vulnerabilidad], exit")
        return {"output": output, "game_over": False}

    game = session['firewall_game']
    if game['game_over']:
        return {"output": "La simulación ha terminado. Usa 'firewall' para empezar de nuevo.", "game_over": True}

    output = ""
    parts = command.split()
    action = parts[0] if parts else ''

    if action == 'scan':
        game['time_left'] -= 5
        if not game['discovered']:
            discovered_vuln = random.choice(list(game['vulnerabilities'].keys()))
            game['discovered'].append(discovered_vuln)
            output = f"> Escaneo completado. Puertas detectadas: [ssh, http, rpc]\n> Vulnerabilidad descubierta: [{discovered_vuln}: {game['vulnerabilities'][discovered_vuln]}]"
        else:
            output = "> Ya has escaneado. No se han encontrado más vulnerabilidades."

    elif action == 'bruteforce':
        game['time_left'] -= 5
        if random.random() < 0.3:  # 30% de éxito
            damage = 10
            game['integrity'] -= damage
            output = f"> ¡Éxito! El ataque de fuerza bruta ha dañado el firewall. Integridad: -{damage}%"
        else:
            output = "> Ataque fallido. El firewall contraataca: -5s de tiempo."

    elif action == 'exploit':
        game['time_left'] -= 5
        try:
            vuln_key = parts[1].lower()
            if vuln_key in game['discovered']:
                damage = 35 + random.randint(0, 10)
                game['integrity'] -= damage
                output = f"> ¡Vulnerabilidad explotada con éxito! Daño masivo al firewall. Integridad: -{damage}%"
                game['discovered'].remove(vuln_key)
            else:
                output = "> Error: La vulnerabilidad no ha sido descubierta o no existe."
        except (IndexError, ValueError):
            output = "> Uso: exploit [vulnerabilidad]"

    elif action == 'exit':
        session.pop('firewall_game', None)
        return {"output": "Saliendo de la simulación de intrusión...", "game_over": True}

    else:
        output = f"> Comando '{action}' no reconocido."
        game['time_left'] -= 2

    # Estado final
    if game['integrity'] <= 0:
        game['game_over'] = True
        output += "\n> ¡Firewall comprometido! Acceso concedido."
        session.setdefault('achievements', {})
        session['achievements']['firewall_hacked'] = True
        session.modified = True
    elif game['time_left'] <= 0:
        game['game_over'] = True
        output += "\n> ¡Tiempo agotado! La intrusión ha fallado."

    if not game['game_over']:
        output += f"\n> Integridad: {game['integrity']}% | Tiempo: {game['time_left']}s"

    session['firewall_game'] = game
    return {"output": output, "game_over": game['game_over']}

# --- Misiones ----------------------------------------------------------------

@app.route('/api/missions', methods=['POST'])
def handle_missions():
    session.setdefault('missions', {})
    session.setdefault('achievements', {})

    output = "--- Misiones Disponibles ---\n"
    for mid, mdata in MISSIONS_DATA.items():
        is_complete = mdata['is_complete'](session)
        status = "[X]" if is_complete else "[ ]"
        output += f"{status} {mdata['name']}: {mdata['description']}\n"

    output += "\n--- Logros Desbloqueados ---\n"
    if not session['achievements']:
        output += "Ninguno todavía. ¡Sigue explorando!\n"
    else:
        for ach_id, completed in session['achievements'].items():
            if completed:
                output += f"- {ACHIEVEMENTS_DATA.get(ach_id, 'Logro Secreto')}\n"

    return f"<pre>{output}</pre>", 200, {'Content-Type': 'text/html; charset=utf-8'}

# --- Nuclear War API ---------------------------------------------------------

# admitimos dos nombres de módulo por comodidad:
_generate_simulation = None
try:
    from nuclearwar_engine import generate_simulation as _gen
    _generate_simulation = _gen
    print("[nuclearwar] Cargado desde nuclearwar_engine.py")
except Exception as e:
    try:
        from nuclear_war import generate_simulation as _gen2
        _generate_simulation = _gen2
        print("[nuclearwar] Cargado desde nuclear_war.py")
    except Exception as e2:
        print(f"[nuclearwar] No disponible: {e} | {e2}")

NUCLEAR_AVAILABLE = _generate_simulation is not None

@app.post("/api/nuclearwar")
def api_nuclearwar():
    if not NUCLEAR_AVAILABLE:
        return {"ok": False, "error": "nuclearwar_engine no disponible"}, 500

    data = request.get_json(silent=True) or {}
    missiles = int(data.get("missiles", 180))
    waves = int(data.get("waves", 6))
    seed_raw = data.get("seed", None)
    seed = None
    if seed_raw is not None:
        try:
            seed = int(seed_raw)
        except (ValueError, TypeError):
            seed = None

    # Pasamos parámetros opcionales si tu motor los admite (no-friendlies, min_range_km, etc.)
    kwargs = {"num_missiles": missiles, "waves": waves, "seed": seed}
    for k in ("no_friendly_fire", "min_range_km", "prob_matrix"):
        if k in data:
            kwargs[k] = data[k]

    try:
        timeline = _generate_simulation(**kwargs)
    except TypeError:
        # compat: si el motor no acepta kwargs extra
        timeline = _generate_simulation(num_missiles=missiles, waves=waves, seed=seed)

    return timeline, 200

# --- Main --------------------------------------------------------------------

if __name__ == '__main__':
    # Nota: El modo debug de Flask puede causar que los módulos se carguen dos veces.
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=False)
