# sabbat‑cyberpunk‑console

A retro cyberpunk web terminal built with **Flask** (backend) and a lightweight **vanilla JS** frontend. Type commands, switch neon themes, and launch built‑in mini‑apps like **Chess** and a **Nuclear War** timeline simulator.

<p align="center">
  <img src="static/img/og.png" alt="Cyberpunk Console" width="640"/>
</p>

---

## ✨ Features
* **Secure by default**: CSP/HSTS, hardened cookies, and optional rate limiting.
* **Realistic Terminal Interface:** An interactive shell with command history, autocompletion (Tab), pipes (`|`), and output redirection (`>`).
* **Virtual File System:** Navigate a simulated file system with commands like `ls`, `cd`, `cat`, `grep`, `wc`, etc...
* **List of commands:**
    * **- Basic:** `help [cmd]`, `about`, `links`, `resume`, `clear`, `reboot`, `date`, `whoami`, `pwd`, `uptime`, `nano`, `set lang`
    * **- Portfolio:** `skills`, `projects [filter]`
    * **- Filesystem:** `echo`, `ls`, `dir`, `cd`, `cat`, `type`, `grep`, `head`, `tail`, `wc`, `sort`, `uniq`, `copy`, `mc`
    * **- System:** `history`, `sudo`, `uname`, `ver`, `version`, `neofetch`, `exit`, `ps`, `kill`
    * **- Tools:** `calc`, `cal`, `weather`, `encrypt`, `decrypt`, `ascii`, `ping`, `traceroute`, `qr`, `base64`, `hash`
    * **- Visuals & Fun:** `theme [name|random`], `theme-list`, `a11y`, `security`, `crt`, `hack`, `cowsay`, `fortune`, `go ask alice`, `matrix`, `play music`, `sl`
    * **- Games & Lore:** `aventura/adventure`, `pytrek`, `firewall`, `missions`, `chess`, `nuclearwar`

* **Integrated Games:**
    * **Chess:** Play a game of chess against a simple AI directly in the terminal.
    * **Global Thermonuclear War:** A strategic simulator inspired by the movie "WarGames".
    * **Firewall Breach:** A minigame where you must exploit vulnerabilities to disable a firewall.
    * **PyTrek:** A classic space strategy game. 
    * **Text Adventure:** Explore a mysterious digital void.
* **Encryption Utilities:** Encrypt and decrypt messages using classic algorithms like **Caesar** and **XOR**.
* **Tools & Toys:**
    * Real-time **weather** lookup.
    * **ASCII art** generator with `pyfiglet`.
    * A calculator, calendar, and fun commands like `cowsay` and `fortune`.
    * A terminal-based text editor (`nano`).
    * A visual, dual-panel file manager (`mc`).
* **Customization:** Change the terminal's appearance with multiple **color themes** (`theme matrix`, `theme amber`, etc.).
* **Secrets:** The terminal hides many secrets. Can you find them all?
* **Internationalization (i18n):** Full support for **English** and **Spanish** (`set lang en`).
> Looking for Spanish? **[README‑ES.md](README-ES.md)**

---

## 🚀 Quickstart (Local Dev)

### Prereqs
- Python **3.11+** (3.13 OK)
- Node optional (only if you want to bundle/minify assets)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=app.py
export SECRET_KEY=$(python - <<<'import os;print(os.urandom(32).hex())')
flask run --port 8000
```
Browse **http://127.0.0.1:8000**

### Gunicorn (dev)
```bash
gunicorn --workers 2 --threads 2 --bind 127.0.0.1:8000 wsgi:app
```

---

## 🧩 Project layout
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

## ⌨️ Commands (examples)
- `help` – show help
- `theme matrix|amber|arctic|random` – set theme
- `chess fen <FEN>` – load position
- `chess move <uci>` – make move (e.g. `e2e4`)
- `nuclear [seed]` – run the simulation with optional numeric seed

---

## 🔒 Security
- **App config**: secret from `SECRET_KEY` env; cookies are `Secure`, `HttpOnly`, `SameSite=Lax`.
- **Headers**: CSP + HSTS + Referrer‑Policy + X‑Content‑Type‑Options + X‑Frame‑Options (via `flask-talisman` or `after_request`).
- **Frontend**: no `innerHTML` for user content; prefer `textContent` / DOM building; if HTML is needed, sanitize using DOMPurify.
- **Rate limiting**: optional via `Flask-Limiter`.

---

## 🛠 API (JSON)

### `GET /api/nuclear?seed=<int>`
Returns `{ seed, events: [...], summary: {...} }`. Always returns arrays (may be empty).

### `POST /api/chess` (JSON)
- `{ action: "legal", fen }` → `{ moves: ["e2e4", ...] }`
- `{ action: "push", fen, move }` → `{ fen, last_move, status }`

> Exact schema may evolve; see `chess_engine.py` and `nuclearwar_engine.py`.

---

## 📦 Production

### Gunicorn + nginx
- Run Gunicorn: `gunicorn --workers 3 --threads 2 --bind 127.0.0.1:8000 wsgi:app`
- nginx: reverse proxy to Gunicorn; cache `/static/` for 30d; enable HSTS and HTTP/2. Sample included in the audit report.

### systemd (excerpt)
```ini
[Service]
Environment="SECRET_KEY=/run/secrets/myweb.key"
ExecStart=/var/www/myweb/venv/bin/gunicorn --workers 3 --threads 2 --bind 127.0.0.1:8000 wsgi:app
Restart=always
```

---

## 🧪 Tests
- Python: unit tests for chess perft and nuclear determinism.
- Web: Playwright smoke tests for `help`, `theme`, `nuclear`, and CSP compliance.

---

## 🧭 Roadmap
- Audio bootstrap behind user gesture; optional AudioWorklet.
- Add opening book for chess; export PGN.
- PWA manifest + offline mini‑game.

---

## 🤝 Contributing
PRs are welcome. Please run linters and tests before sending a PR.

```bash
ruff check . && black --check .
eslint static/js --ext .js
pytest -q
```

---

## 📝 License
MIT See `LICENSE`.

