// script.js — single-file build with i18n (en/es), `set lang`, Nano fix and minimal MC overlay
// Requires: Tone.js (for music), TypeIt (for intro typing), mc.css (for MC overlay styles)

(function(){
'use strict';

/* =========================
   I18N (en/es) + helpers
   ========================= */
const I18N = {
  en: {
    // Boot sequence
    booting: "Booting SABBAT.CLOUD KERNEL...",
    checking: "Checking system integrity...",
    ok_mem: "[ OK ] Memory check passed.",
    ok_profile: "[ OK ] Loading user profile...",
    connecting: "Establishing connection to mail.sabbat.cloud...",
    connected: "Connection established.",
    welcome_link: 'Welcome to <a href="https://mail.sabbat.cloud" target="_blank">mail.sabbat.cloud</a>',
    secure_stream: "> Accessing secure datastream...",
    key_required: "System Error... SYMMETRIC KEY PROTOCOL REQUIRED...",
    memdump: "> MEMDUMP 0xFA42: 011010110110010101111001",
    granted: "> Access granted. Type help for a list of commands.",
    // Prompts
    prompt_normal: (path) => `visitor@sabbat.cloud:${path}$ `,
    prompt_game: "[AdventureMode]$ ",
    prompt_fw: "firewall> ",
    prompt_pyt: "COMMAND> ",
    // General
    usage_nano: "Usage: nano [filename]",
    usage_play: "Usage: play music",
    help_header: `Available commands:
- Basic: help [cmd], about, links, resume, clear, reboot, date, whoami, pwd, uptime, nano, set
- Portfolio: skills, projects [filter]
- Filesystem: echo, ls, dir, cd, cat, type, grep, head, tail, wc, sort, uniq, copy, mc
- System: history, sudo, uname, ver, version, neofetch, exit, ps, kill
- Tools: calc, cal, weather, encrypt, decrypt, ascii, ping, traceroute, qr, base64, hash
- Visuals & Fun: theme [name|random], theme-list, a11y, security, crt, hack, cowsay, fortune, "go ask alice", matrix, play music, sl
- Games & Lore: aventura/adventure, pytrek, firewall, missions, chess, nuclearwar`,
    // Set / language
    set_usage: "Usage: set lang [en|es]",
    lang_set_ok: (code) => `Language set to ${code}.`,
    lang_not_supported: (code) => `Language '${code}' not supported. Use: set lang [en|es].`,
    // MC
    mc_title: "File Manager",
    mc_left: "LEFT",
    mc_right: "RIGHT",
    mc_preview: "Preview",
    mc_status_hint: "TAB: switch pane · ↑/↓: move · ENTER: open · F5: copy · F6: rename · F8: delete · ESC: exit",
    mc_empty: "(empty)",
    // Other messages
    contact_prefix: "Contact protocol initiated... Decoded address from coredump fragment: ",
    copy_usage: "Usage: copy [source] [dest]",
    copy_no_file: (src) => `copy: file '${src}' not found`,
    copy_ok: (s,d) => `Copied '${s}' -> '${d}'`,
    head_no_input: "head: no input (pipe or file)",
    tail_no_input: "tail: no input (pipe or file)",
    wc_no_input: "wc: no input (pipe or file)",
    sort_no_input: "sort: requires input (use a pipe)",
    uniq_no_input: "uniq: requires input (use a pipe)",
    grep_usage: "Usage: grep [pattern]",
    grep_no_input: "grep: requires input (use a pipe)",
    base64_usage: "Usage: base64 [encode|decode] [text] (or pipe)",
    base64_need_mode: "base64: specify encode|decode",
    hash_usage: "Usage: hash [sha1|sha256] [text] (or pipe)",
    hash_bad_alg: "hash: supported algorithms: sha1, sha256",
    theme_usage: "Usage: theme [matrix|amber|arctic|phosphor|cobalt|gameboy|apple2|paper|vapor|hc|cbf|random]",
    a11y_usage: "Usage: a11y [cursor on|off] [reduce-flicker on|off]",
    crt_usage: "Usage: crt [high | normal | low | off]",
    dir_empty: "Directory is empty.",
    cd_not_dir: (t)=>`bash: cd: ${t}: Not a directory`,
    cd_no_such: (t)=>`bash: cd: ${t}: No such file or directory`,
    file_not_found: (f)=>`Error: File '${f}' not found.`,
    not_regular_file: (f)=>`Error: '${f}' is not a regular file.`,
    sudo_err: "Error: User 'visitor' is not in the sudoers file. This incident will be reported.",
    exit_msg: "This is a web terminal. To exit, just close the tab.\n",
    theme_set: (n)=>`Theme set to ${n.toUpperCase()}.`,
    a11y_updated: (s)=>`a11y updated (${s})`,
    crt_set: (l)=>`CRT effect intensity set to ${l}.`,
    crt_off: "CRT flicker effect disabled."
  },
  es: {
    // Boot sequence
    booting: "Iniciando SABBAT.CLOUD KERNEL...",
    checking: "Comprobando integridad del sistema...",
    ok_mem: "[ OK ] Comprobación de memoria superada.",
    ok_profile: "[ OK ] Cargando perfil de usuario...",
    connecting: "Estableciendo conexión con mail.sabbat.cloud...",
    connected: "Conexión establecida.",
    welcome_link: 'Bienvenido a <a href="https://mail.sabbat.cloud" target="_blank">mail.sabbat.cloud</a>',
    secure_stream: "> Accediendo a flujo seguro de datos...",
    key_required: "Error de sistema... SE REQUIERE PROTOCOLO DE CLAVE SIMÉTRICA...",
    memdump: "> MEMDUMP 0xFA42: 011010110110010101111001",
    granted: "> Acceso concedido. Escribe help para ver comandos.",
    // Prompts
    prompt_normal: (path) => `visitor@sabbat.cloud:${path}$ `,
    prompt_game: "[ModoAventura]$ ",
    prompt_fw: "firewall> ",
    prompt_pyt: "COMANDO> ",
    // General
    usage_nano: "Uso: nano [nombre_de_fichero]",
    usage_play: "Uso: play music",
    help_header: `Comandos disponibles:
- Básico: help [cmd], about, links, resume, clear, reboot, date, whoami, pwd, uptime, nano, set
- Portfolio: skills, projects [filtro]
- Filesystem: echo, ls, dir, cd, cat, type, grep, head, tail, wc, sort, uniq, copy, mc
- Sistema: history, sudo, uname, neofetch, exit, ps, kill
- Herramientas: calc, cal, weather, encrypt, decrypt, ascii, ping, traceroute, qr, base64, hash
- Visual & Fun: theme [name|random], theme-list, a11y, security, crt, hack, cowsay, fortune, "go ask alice", matrix, play music, sl
- Juegos & Lore: aventura/adventure, pytrek, firewall, missions, chess, nuclearwar`,
    // Set / language
    set_usage: "Uso: set lang [en|es]",
    lang_set_ok: (code) => `Idioma cambiado a ${code}.`,
    lang_not_supported: (code) => `Idioma '${code}' no soportado. Usa: set lang [en|es].`,
    // MC
    mc_title: "Gestor de archivos",
    mc_left: "IZQ",
    mc_right: "DER",
    mc_preview: "Vista previa",
    mc_status_hint: "TAB: cambiar panel · ↑/↓: mover · ENTER: abrir · F5: copiar · F6: renombrar · F8: eliminar · ESC: salir",
    mc_empty: "(vacío)",
    // Other
    contact_prefix: "Protocolo de contacto iniciado... Dirección decodificada: ",
    copy_usage: "Uso: copy [origen] [destino]",
    copy_no_file: (src) => `copy: no existe el archivo '${src}'`,
    copy_ok: (s,d) => `Copiado '${s}' -> '${d}'`,
    head_no_input: "head: no input (pipe or file)",
    tail_no_input: "tail: no input (pipe or file)",
    wc_no_input: "wc: no input (pipe or file)",
    sort_no_input: "sort: se necesita una entrada (usa un pipe)",
    uniq_no_input: "uniq: se necesita una entrada (usa un pipe)",
    grep_usage: "Uso: grep [patrón]",
    grep_no_input: "grep: se necesita una entrada (usa un pipe)",
    base64_usage: "Uso: base64 [encode|decode] [texto] (o pipe)",
    base64_need_mode: "base64: especifica encode|decode",
    hash_usage: "Uso: hash [sha1|sha256] [texto] (o pipe)",
    hash_bad_alg: "hash: algoritmo soportado: sha1, sha256",
    theme_usage: "Uso: theme [matrix|amber|arctic|random]",
    a11y_usage: "Uso: a11y [cursor on|off] [reduce-flicker on|off]",
    crt_usage: "Uso: crt [high | normal | low | off]",
    dir_empty: "Directorio vacío.",
    cd_not_dir: (t)=>`bash: cd: ${t}: Not a directory`,
    cd_no_such: (t)=>`bash: cd: ${t}: No such file or directory`,
    file_not_found: (f)=>`Error: File '${f}' not found.`,
    not_regular_file: (f)=>`Error: '${f}' no es un fichero regular.`,
    sudo_err: "Error: el usuario 'visitor' no está en sudoers. Este incidente será reportado.",
    exit_msg: "Esto es un terminal web. Para salir, cierra la pestaña.\n",
    theme_set: (n)=>`Tema cambiado a ${n.toUpperCase()}.`,
    a11y_updated: (s)=>`a11y actualizado (${s})`,
    crt_set: (l)=>`Intensidad del CRT ajustada a ${l}.`,
    crt_off: "Efecto de parpadeo CRT desactivado."
  }
};

let currentLang = (localStorage.getItem('lang') || 'en').toLowerCase();
function t(key, ...args) {
  const pack = I18N[currentLang] || I18N.en;
  const val = pack[key] ?? I18N.en[key] ?? key;
  return (typeof val === 'function') ? val(...args) : val;
}
function setLang(langCode) {
  const map = { en:'en', eng:'en', english:'en', es:'es', spa:'es', sp:'es', esp:'es' };
  const code = map[(langCode || '').toLowerCase()];
  if (!code) return { ok:false, msg: t('lang_not_supported', langCode) };
  currentLang = code;
  localStorage.setItem('lang', code);
  if (window.__mc && window.__mc.open) window.__mc.render();
  return { ok:true, msg: t('lang_set_ok', code) };
}
// --- Audio bootstrap ------------------------------
let __audio = { ready: false, synth: null };

async function ensureAudioReady() {
  if (!window.Tone) throw new Error('Tone.js no está cargado');

  // 1) “Desbloquear” audio con una acción del usuario (esta función
  // se llama desde el handler de un comando, así que ya hay user gesture)
  const ctx = Tone.getContext().rawContext;
  if (ctx.state !== 'running') {
    await Tone.start();             // <- CLAVE
  }

  // 2) Crear el sintetizador una sola vez
  if (!__audio.synth) {
    __audio.synth = new Tone.Synth({
      oscillator: { type: 'triangle' }, // o 'sine'/'sawtooth'
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 }
    }).toDestination();
  }
  __audio.ready = true;
  return __audio.synth;
}
/* =========================
   DOM Ready
   ========================= */
document.addEventListener('DOMContentLoaded', () => {
    const CSRF_TOKEN = window.CSRF_TOKEN || (document.querySelector('meta[name="csrf-token"]')?.content || '');
    const SESSION_STARTED_AT = Date.now();

    const initializeAudio = async () => { try { await Tone.start(); } catch (e) { console.error("Could not start AudioContext: ", e); } };
    document.body.addEventListener('keydown', initializeAudio, { once: true });
    document.body.addEventListener('click', initializeAudio, { once: true });

    const asciiArtElement = document.getElementById('ascii-art');
    const typewriterElement = document.getElementById('typewriter');
    const interactiveContent = document.getElementById('interactive-content');
    const rabbitAnimationElement = document.getElementById('rabbit-animation');
    const matrixCanvas = document.getElementById('matrix-canvas');

    let currentDirectory = '/home/visitor';
    let commandHistory = [];
    let historyIndex = 0;
    let currentInput;

    let gameInProgress = false;
    let currentGameRoomKey = 'inicio';
    let pytrekInProgress = false;
    let firewallInProgress = false;

    let editorMode = false;
    let editorTargetFile = '';
    let runningProcesses = [
        { pid: 1, user: 'root', cpu: '0.1', command: 'kernel_daemon' },
        { pid: 42, user: 'root', cpu: '1.3', command: 'security_scanner' },
        { pid: 1337, user: 'visitor', cpu: '0.5', command: 'sim_bash' }
    ];
    let nextPid = 1338;

    let matrixInterval = null;
    let isPlayingMusic = false;
    let audioSynth = null;

    const projectsData = [
        { name: "Portfolio Terminal (Este proyecto)", tech: "Vanilla JS, Flask, HTML5, CSS", url: null, tags: ["web","terminal","retro"] },
        { name: "TELEGRAM-ADMIN-BOT", tech: "Python, Telegram, Linux, Docker", url: "https://github.com/Sabbat-cloud/telegram-admin-bot", tags: ["telegram","bot","devops"] },
        { name: "AI Prompt compare", tech: "Flask, LLMs", url: "https://github.com/Sabbat-cloud/ai-prompt-compare", tags: ["ai","llm","flask"] },
        { name: "Galaxia-Palabras", tech: "JS, visualización", url: "https://github.com/Sabbat-cloud/galaxia-palabras", tags: ["viz","text"] },
        { name: "Mark Down Editor", tech: "Python", url: "https://github.com/Sabbat-cloud/markdown-editor", tags: ["editor","markdown","python"] },
        { name: "debian-trixie-email-server", tech: "Bash, Debian", url: "https://github.com/Sabbat-cloud/debian-trixie-email-server", tags: ["bash","email","server"] },
        { name: "sabbat-frec-bot", tech: "Python, Telegram", url: "https://github.com/Sabbat-cloud/sabbat-frec-bot", tags: ["telegram","analysis"] },
        { name: "Voxel-editor", tech: "Three.js, Flask", url: "https://github.com/Sabbat-cloud/voxel-editor", tags: ["3d","threejs","web"] },
        { name: "Contabilidad personal", tech: "Python, Flask", url: "https://github.com/Sabbat-cloud/contabilidad-personal", tags: ["flask","finance"] },
        { name: "sabbat-tools", tech: "Python", url: "https://github.com/Sabbat-cloud/sabbat-tools", tags: ["python","utils"] },
    ];

    const fileSystem = {
        '/home/visitor': { 'bin': { type: 'directory' }, 'docs': { type: 'directory' } },
        '/home/visitor/bin': {
            'help': { type: 'executable' }, 'about': { type: 'executable' }, 'links': { type: 'executable' },
            'resume': { type: 'executable' }, 'uptime': { type: 'executable' }, 'contact': { type: 'executable' },
            'clear': { type: 'executable' }, 'reboot': { type: 'executable' }, 'date': { type: 'executable' },
            'whoami': { type: 'executable' }, 'uname': { type: 'executable' }, 'history': { type: 'executable' },
            'neofetch': { type: 'executable' }, 'exit': { type: 'executable' }, 'pwd': { type: 'executable' },
            'skills': { type: 'executable' }, 'projects': { type: 'executable' },
            'echo': { type: 'executable' }, 'ls': { type: 'executable' }, 'dir': { type: 'executable' },
            'cd': { type: 'executable' }, 'cat': { type: 'executable' }, 'type': { type: 'executable' },
            'grep': { type: 'executable' }, 'nano': { type: 'executable' }, 'head': { type: 'executable' },
            'tail': { type: 'executable' }, 'wc': { type: 'executable' }, 'sort': { type: 'executable' },
            'uniq': { type: 'executable' }, 'copy': { type: 'executable' }, 'mc': { type: 'executable' },
            'calc': { type: 'executable' }, 'cal': { type: 'executable' }, 'calendar': { type: 'executable' },
            'weather': { type: 'executable' }, 'encrypt': { type: 'executable' }, 'decrypt': { type: 'executable' },
            'ascii': { type: 'executable' }, 'ps': { type: 'executable' }, 'kill': { type: 'executable' },
            'ping': { type: 'executable' }, 'traceroute': { type: 'executable' }, 'qr': {type: 'executable' },
            'base64': { type: 'executable' }, 'hash': { type: 'executable' },
            'theme': { type: 'executable' }, 'theme-list': { type: 'executable' }, 'a11y': { type: 'executable' },
            'security': { type: 'executable' }, 'cowsay': { type: 'executable' }, 'crt': { type: 'executable' },
            'hack': { type: 'executable' }, 'fortune': { type: 'executable' }, 'matrix': { type: 'executable' },
            'play': { type: 'executable' }, 'go ask alice': { type: 'executable' }, 'sl': { type: 'executable' },
            'aventura': { type: 'executable' }, 'adventure': { type: 'executable' },
            'pytrek': { type: 'executable' }, 'firewall': { type: 'executable' }, 'missions': { type: 'executable' },
            'chess': {type: 'executable'},'set': { type: 'executable' }, 'version': { type: 'executable' }, 
	    'nuclearwar': {type: 'executable'}, 'ver': { type: 'executable' },'sudo': { type: 'executable' }
        },
        '/home/visitor/docs': {
            'sabbat.cloud.md': { type: 'file', content: `# Welcome to Sabbat.Cloud
This is a simulated file on a simulated system.
My real projects and code live on GitHub.
Find me here: https://github.com/Sabbat-cloud` },
            'coredump': { type: 'file', content: `> DATA FRAGMENT: \\x16\\x04\\x17\\x17\\x04\\x11\\x0c\\x16\\x0e\\x04\\x0e\\x0e\\x04\\x0b\\x0c\\x11\\x0e\\x04\\x0b\\x0b\\x04\\x11
> Resonance detected... possible key fragment for firewall breach.` }
        }
    };

    const gameMap = {
        'inicio': {
            description: "El terminal parpadea y la interfaz familiar se disuelve en estática pura. Te encuentras en un <span class='directory'>vacío digital</span>. Frente a ti, un filamento de luz de datos apenas perceptible se extiende hacia la <span class='directory'>oscuridad</span>.",
            exits: { 'seguir': 'nodo_eco', 'oscuridad': 'nodo_eco', 'norte': 'nodo_eco' },
            items: []
        },
        'nodo_eco': {
            description: "Sigues el filamento hasta un nodo de datos resonante. Sientes ecos de información fluyendo a tu alrededor. Un cortafuegos (ICE) de bajo nivel parece estar activo hacia el <span class='directory'>oeste</span>, protegiendo algo importante.\nUn rastro de datos corruptos lleva hacia el <span class='directory'>este</span>.\nPuedes volver al vacío por el <span class='directory'>sur</span>.",
            exits: { 'oeste': 'entrada_firewall', 'ir oeste': 'entrada_firewall', 'este': 'rastro_conejo', 'ir este': 'rastro_conejo', 'sur': 'inicio', 'ir sur': 'inicio' },
            items: []
        },
        'rastro_conejo': {
            description: "Te adentras en el flujo de datos corruptos. Es un laberinto diseñado para confundir a los rastreadores automáticos. Oyes el eco de una risa lejana. Es mejor volver al nodo principal al <span class='directory'>oeste</span>.",
            exits: { 'oeste': 'nodo_eco', 'ir oeste': 'nodo_eco' },
            items: []
        },
        'entrada_firewall': {
            description: "Llegas a una pared de código brillante. Es un ICE protector, en modo pasivo. Hay una ranura de autenticación: <span class='directory'>'Solo los ecos pueden pasar'</span>.\nPuedes intentar <span class='executable'>forzar</span>, usar <span class='executable'>coredump</span>, o volver al nodo <span class='directory'>este</span>.",
            exits: { 'este': 'nodo_eco', 'ir este': 'nodo_eco' },
            actions: { 'forzar': "Intentas forzar el acceso. El ICE bloquea tus esfuerzos. <span style='color: var(--error-color);'>ACCESO DENEGADO.</span>", 'usar eco': 'nucleo_santuario', 'usar coredump': 'nucleo_santuario' },
            items: []
        },
        'nucleo_santuario': {
            description: "El firewall te reconoce como 'eco' y se disuelve. Entras al núcleo del Santuario. Hay una consola prístina. Puedes <span class='executable'>acceder</span>.",
            exits: {},
            actions: { 'acceder': 'final_juego' },
            items: ['consola']
        }
    };

    const asciiArt = `
+-+-+-+-+-+-+-+-+-+-+-+-+
|S|a|b|b|a|t|.|c|l|o|u|d|
+-+-+-+-+-+-+-+-+-+-+-+-+
`;

    new TypeIt(typewriterElement, {
        speed: 50, startDelay: 200, cursorChar: ' ', waitUntilVisible: false,
        afterComplete: (instance) => { if (instance?.elements?.cursor) instance.elements.cursor.style.display = 'none'; createNewCommandLine(); }
    })
    .type(t('booting'), { delay: 10 }).delete(null, { instant: true })
    .type(t('checking'), { delay: 50 }).break()
    .type(`<span style="color: var(--secondary-text-color);">${t('ok_mem')}</span>`, { delay: 50 }).break()
    .type(`<span style="color: var(--secondary-text-color);">${t('ok_profile')}</span>`, { delay: 50 }).delete(null, { instant: true })
    .type(t('connecting'), { delay: 100 }).break()
    .type(t('connected'), { delay: 100 }).delete(null, { instant: true })
    .exec(() => { asciiArtElement.innerText = asciiArt; asciiArtElement.classList.remove('hidden'); })
    .pause(1)
    .type(t('welcome_link'), { delay: 200 }).break({ delay: 50 }).break({ delay: 50 })
    .type(t('secure_stream'), { speed: 20, delay: 50 }).break()
    .type(`<span style="color: var(--error-color);">${t('key_required')}</span>`, { speed: 1, instant: true, delay: 100 })
    .delete(1, { instant: true, delay: 50 }).type('.', { instant: true, delay: 50 })
    .delete(1, { instant: true, delay: 50 }).type('.', { instant: true, delay: 50 })
    .delete(1, { instant: true, delay: 50 }).delete(null, { instant: true, delay: 100 })
    .type(t('memdump'), { instant: true }).break()
    .type(t('granted'), { instant: true }).break()
    .go();

    const customCursor = document.getElementById('mouse-cursor');
    if (customCursor) {
        document.addEventListener('mousemove', (e) => {
            customCursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        });
    }

    function createNewCommandLine() {
        if (document.querySelector('.command-input')) return;
        const lineContainer = document.createElement('div');
        lineContainer.className = 'shell-line';
        const promptSpan = document.createElement('span');
        const displayPath = currentDirectory.replace('/home/visitor', '~');

        const promptText = firewallInProgress ? t('prompt_fw') :
            (pytrekInProgress ? t('prompt_pyt') :
            (gameInProgress ? t('prompt_game') : t('prompt_normal', displayPath)));

        promptSpan.textContent = promptText;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'command-input';
	input.autocomplete = 'off';
        input.autofocus = true;
        lineContainer.appendChild(promptSpan);
        lineContainer.appendChild(input);
        interactiveContent.appendChild(lineContainer);
        const promptWidth = promptSpan.offsetWidth;
        input.style.width = `calc(100% - ${promptWidth}px - 15px)`;
        currentInput = input;
        currentInput.focus();
        currentInput.addEventListener('keydown', handleCommand);
    }

// ===== Nuclear War (frontend) — robusta (valida timeline + fixes) =====
async function renderNuclearWar(timeline, opts = {}) {
  const missilesInit = opts.missiles || 180;
  const wavesInit = opts.waves || 6;

  // UI base
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: 'color-mix(in srgb, var(--bg-color) 92%, transparent)',
    border: '1px solid var(--secondary-text-color)',
    zIndex: 9999, display: 'grid',
    gridTemplateRows: 'auto 1fr', gap: '8px', padding: '10px'
  });

  const controls = document.createElement('div');
  controls.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;font-family:ui-monospace,monospace;color:var(--secondary-text-color)">
      <b style="color:var(--text-color)">Global Thermonuclear War</b>
      <label>Speed <input id="nw-speed" type="range" min="0.25" max="3" step="0.05" value="1" style="vertical-align:middle"></label>
      <span id="nw-speed-val">1.00×</span>
      <label>Seed <input id="nw-seed" type="number" placeholder="(auto)" style="width:8rem;background:transparent;color:var(--text-color);border:1px solid var(--secondary-text-color);padding:2px 4px;"></label>
      <label>Missiles <input id="nw-missiles" type="number" min="10" max="999" value="${missilesInit}" style="width:6rem;background:transparent;color:var(--text-color);border:1px solid var(--secondary-text-color);padding:2px 4px;"></label>
      <label>Waves <input id="nw-waves" type="number" min="1" max="20" value="${wavesInit}" style="width:5rem;background:transparent;color:var(--text-color);border:1px solid var(--secondary-text-color);padding:2px 4px;"></label>
      <label style="display:flex;align-items:center;gap:4px;">Sound <input id="nw-sound" type="checkbox"></label>
      <button id="nw-resim" style="background:transparent;color:var(--text-color);border:1px solid var(--secondary-text-color);cursor:pointer;padding:4px 8px">Resimulate</button>
      <button id="nw-close" style="margin-left:auto;background:transparent;color:var(--text-color);border:1px solid var(--secondary-text-color);cursor:pointer;padding:4px 8px">Close ✕</button>
    </div>`;
  overlay.appendChild(controls);

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position:'relative', width:'min(1100px, 96vw)', height:'min(560px, 70vh)',
    border:'1px solid var(--secondary-text-color)', boxShadow:'0 0 20px var(--glow-color)',
    margin:'0 auto', background:'black'
  });
  const canvas = document.createElement('canvas');
  canvas.width = 1100; canvas.height = 560;
  wrap.appendChild(canvas);
  overlay.appendChild(wrap);
  document.body.appendChild(overlay);

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const lon2x = lon => (lon + 180) / 360 * W;
  const lat2y = lat => (90 - lat) / 180 * H;

  // Helpers UI
  function showOverlayMsg(msg) {
    const msgEl = document.createElement('div');
    Object.assign(msgEl.style, {
      position:'absolute', inset:'0', display:'grid', placeItems:'center',
      whiteSpace:'pre-line', color:'var(--text-color)',
      fontFamily:'ui-monospace, monospace', fontSize:'16px',
      textShadow:'0 0 8px var(--glow-color)', padding:'10px', textAlign:'center'
    });
    msgEl.innerHTML = msg;
    wrap.appendChild(msgEl);
    return msgEl;
  }
  function showError(title, detail='') {
    console.error('[nuclearwar] ', title, detail);
    showOverlayMsg(
      `<b style="color:var(--error-color)">Simulation error</b>\n${title}${detail ? `\n\n<small>${detail}</small>` : ''}`
    );
  }

  // Coastlines (GeoJSON) + fallback wireframe
  let COAST = null;
  try {
    const res = await fetch('/static/data/world_coast_min.geojson', { cache: 'force-cache' });
    if (res.ok) COAST = await res.json();
  } catch (_) {}
  const WORLD_FALLBACK = [
                   // 1) Norteamérica (continental + Alaska aproximada, cerrado)
  [
    [-168,71],[-160,66],[-150,61],[-140,58],[-130,54],[-125,50],[-124,49],
    [-122,47],[-120,45],[-118,34],[-115,32],[-112,31],[-107,25],[-100,24],
    [-97,25],[-92,27],[-90,29],[-86,30],[-84,29],[-82,28],[-81,26],[-81,24],
    [-80,26],[-80,31],[-79,33],[-77,35],[-75,36],[-74,40],[-72,41],[-70,43],
    [-68,45],[-66,46],[-65,48],[-60,50],[-56,52],[-54,55],[-56,57],[-60,58],
    [-68,60],[-80,60],[-90,62],[-95,65],[-105,66],[-120,67],[-140,68],[-160,70],
    [-168,71]
  ],

  // 2) Sudamérica
  [
    [-81,12],[-79,6],[-79,0],[-77,-2],[-75,-6],[-73,-14],[-71,-18],[-70,-22],
    [-71,-26],[-71,-30],[-70,-36],[-68,-45],[-68,-52],[-63,-53],[-60,-54],
    [-58,-50],[-58,-44],[-57,-39],[-56,-36],[-54,-34],[-52,-30],[-50,-28],
    [-48,-22],[-46,-16],[-44,-11],[-42,-8],[-39,-6],[-36,-5],[-34,-7],[-35,-2],
    [-40,1],[-45,3],[-50,4],[-54,6],[-60,6],[-68,8],[-74,8],[-81,12]
  ],

  // 3) Europa occidental
  [
    [-10,36],[-9,39],[-8,42],[-6,43.5],[-4,45],[-1,46.5],[2,48.5],[5,49.5],
    [6,50.5],[8,52],[10,54],[13,55],[18,56],[22,58],[26,60],[30,59],
    [30,56],[24,52],[20,50],[16,48],[14,47],[10,46],[6,44],[2,43],
    [-2,42],[-6,41],[-9,39],[-10,36]
  ],

  // 4) Escandinavia / Báltico
  [
    [5,58],[8,60],[10,62],[12,63],[16,67],[18,69],[20,71],[24,72],[29,70],
    [31,69],[30,66],[28,64],[24,62],[20,60],[16,59],[12,58],[9,58],[5,58]
  ],

  // 5) Islas Británicas
  [
    [-8,51],[-8,53],[-7,55],[-6,56],[-5,58],[-3,58],[0,57],[1,55],[1,53],
    [0,51],[-2,50],[-5,50],[-6,49.5],[-8,51]
  ],

  // 6) Islandia
  [
    [-25,66],[-22,65],[-19,64],[-16,64],[-13,65],[-15,66],[-19,67],[-22,67],
    [-25,66]
  ],

  // 7) África (incl. Cuerno)
  [
    [-17,28],[-15,21],[-16,16],[-15,12],[-13,9],[-12,8],[-10,6],[-8,4],[-6,2],
    [-5,0],[-3,-4],[-1,-6],[2,-6],[4,-4],[6,-2],[8,0],[10,0],[12,-2],
    [13,-6],[14,-12],[13,-18],[14,-22],[16,-25],[18,-29],[20,-33],[22,-34],
    [24,-34],[28,-34],[32,-30],[34,-26],[36,-20],[38,-12],[40,-5],[43,0],
    [45,5],[48,11],[52,13],[52,15],[50,16],[47,14],[45,12],[42,10],[40,6],
    [38,3],[36,1],[34,0],[32,3],[31,6],[30,10],[28,20],[26,26],[24,28],
    [20,31],[15,32],[10,33],[5,34],[0,32],[-5,30],[-10,29],[-12,28],[-17,28]
  ],

  // 8) Península Arábiga
  [
    [34,31],[36,31],[39,28],[42,25],[46,24],[50,25],[52,26],[55,24],[57,20],
    [55,18],[52,16],[50,16],[45,20],[42,22],[38,24],[36,28],[34,31]
  ],

  // 9) Subcontinente indio
  [
    [68,24],[70,22],[72,20],[74,18],[76,14],[78,10],[80,8],[82,8],[85,12],
    [88,21],[92,22],[92,24],[90,26],[86,26],[82,25],[78,23],[74,22],[70,22],
    [68,24]
  ],

  // 10) Eurasia (bloque grande Rusia/C Asia hasta Extremo Oriente)
  [
    [28,41],[32,44],[40,47],[48,50],[56,54],[64,56],[72,56],[86,54],[96,50],
    [104,46],[110,42],[118,38],[124,36],[130,36],[132,32],[130,28],[126,26],
    [122,26],[118,24],[114,20],[110,18],[106,20],[100,26],[94,32],[88,36],
    [80,40],[72,44],[64,46],[56,46],[48,46],[40,44],[34,42],[30,41],[28,41]
  ],

  // 11) Corea
  [
    [124,36],[126,38],[127,39],[129,39],[130,38],[129,35],[127,34],[125,34],
    [124,36]
  ],

  // 12) Japón
  [
    [130,33],[134,34],[137,35],[139,36],[140,37],[141,38],[142,41],[144,43],
    [146,42],[143,40],[141,38],[139,36],[137,35],[134,34],[132,33],[130,33]
  ],

  // 13) Taiwán
  [[121,25],[123,24],[122,22],[120,22],[121,25]],

  // 14) Filipinas (muy simplificado)
  [[120,18],[122,16],[125,13],[124,11],[123,10],[121,12],[119,15],[120,18]],

  // 15) Indochina + Península malaya
  [
    [97,21],[100,22],[102,22],[104,20],[105,17],[104,14],[103,11],[101,7],
    [100,5],[101,2],[102,1],[104,3],[106,6],[108,5],[110,2],[111,-1],
    [110,-2],[107,-2],[105,-1],[103,0],[101,1],[100,3],[99,6],[98,9],
    [97,15],[97,21]
  ],

  // 16) Sumatra + Java
  [
    [95,5],[98,3],[101,2],[103,0],[105,-2],[107,-6],[109,-7],[112,-8],
    [110,-8],[106,-7],[104,-6],[100,-4],[98,-2],[96,0],[95,2],[95,5]
  ],

  // 17) Borneo
  [[108,7],[113,7],[116,5],[117,2],[116,0],[114,-1],[111,-1],[108,1],[108,7]],

  // 18) Célebes (Sulawesi)
  [[118,2],[121,3],[123,2],[124,-1],[123,-3],[121,-4],[119,-2],[118,0],[118,2]],

  // 19) Nueva Guinea (Papúa)
  [[132,-3],[138,-3],[141,-4],[143,-6],[143,-9],[140,-10],[135,-9],[132,-7],[132,-3]],

  // 20) Australia
  [
    [112,-12],[116,-18],[120,-22],[128,-24],[136,-26],[144,-28],[150,-26],
    [152,-20],[149,-15],[145,-12],[140,-12],[136,-14],[130,-16],[124,-14],
    [118,-12],[114,-12],[112,-12]
  ],

  // 21) Nueva Zelanda (Isla Norte)
  [[172,-34],[175,-36],[176,-38],[177,-39],[175,-41],[173,-40],[172,-38],[172,-34]],
  // 22) Nueva Zelanda (Isla Sur)
  [[166,-41],[169,-43],[171,-45],[171,-47],[169,-48],[167,-46],[166,-44],[166,-41]],

  // 23) Groenlandia (mejorado)
  [
    [-73,76],[-67,74],[-60,73],[-52,72],[-45,71],[-42,69],[-42,66],[-48,63],
    [-52,62],[-54,64],[-56,67],[-60,70],[-68,72],[-73,76]
  ],

  // 24) Madagascar
  [[43,-12],[46,-14],[49,-18],[49,-21],[47,-23],[45,-24],[43,-22],[43,-12]],

  // 25) Sri Lanka
  [[80,8],[82,8],[82,6],[80,6],[80,8]],

  // 26) Caribe (Cuba)
  [[-84,23],[-82,23],[-80,23],[-77,22],[-77,21],[-80,21.5],[-84,22.5],[-84,23]],
  // 27) Caribe (La Española)
  [[-74,20],[-72,20],[-70,19],[-71,18],[-73,18],[-74,19],[-74,20]],
  // 28) Puerto Rico
  [[-67,18.6],[-65.5,18.5],[-66.2,18],[-67,18.2],[-67,18.6]]
  ];
  function drawCoastlines() {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,170,0.25)';
    ctx.lineWidth = 1.2;
    if (COAST && COAST.type === 'FeatureCollection' && Array.isArray(COAST.features)) {
      for (const feat of COAST.features) {
        const g = feat.geometry;
        const drawLine = coords => {
          ctx.beginPath();
          for (let i=0;i<coords.length;i++) {
            const [lon,lat] = coords[i];
            const x = lon2x(lon), y = lat2y(lat);
            if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          }
          ctx.stroke();
        };
        if (g && g.type === 'LineString') drawLine(g.coordinates);
        else if (g && g.type === 'MultiLineString') for (const c of g.coordinates) drawLine(c);
      }
    } else {
      for (const poly of WORLD_FALLBACK) {
        ctx.beginPath();
        for (let i=0;i<poly.length;i++) {
          const [lon,lat] = poly[i];
          const x = lon2x(lon), y = lat2y(lat);
          if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.closePath(); ctx.stroke();
      }
    }
    ctx.restore();
  }
  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,170,0.12)';
    ctx.lineWidth = 1;
    for (let i=0;i<=12;i++){ const x = i * W/12; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let j=0;j<=6;j++){ const y = j * H/6; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    ctx.restore();
  }

  // Controles
  let speed = 1.0;
  let finished = false;
  const speedInput = controls.querySelector('#nw-speed');
  const speedVal   = controls.querySelector('#nw-speed-val');
  const seedInput  = controls.querySelector('#nw-seed');
  const missilesInput = controls.querySelector('#nw-missiles');
  const wavesInput    = controls.querySelector('#nw-waves');
  const soundChk   = controls.querySelector('#nw-sound');

  controls.querySelector('#nw-close').onclick = ()=> document.body.removeChild(overlay);
  controls.querySelector('#nw-resim').onclick = async ()=>{
    const missiles = parseInt(missilesInput.value || '180', 10);
    const waves    = parseInt(wavesInput.value || '6', 10);
    const seed     = seedInput.value === '' ? null : parseInt(seedInput.value, 10);
    try {
      const res = await fetch('/api/nuclearwar', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ missiles, waves, seed })
      });
      let data = null;
      try { data = await res.json(); } catch(e){ /* JSON inválido */ }
      if (!res.ok || !data || !Array.isArray(data.events)) {
        const detail = data && data.error ? data.error : `HTTP ${res.status}`;
        showError('Backend returned an invalid timeline.', detail);
        return;
      }
      stateInit(data);
    } catch(e) {
      showError('Network error while requesting /api/nuclearwar', String(e));
    }
  };
  speedInput.oninput = ()=>{
    speed = parseFloat(speedInput.value || '1');
    speedVal.textContent = speed.toFixed(2) + '×';
  };

  // === Timeline state ===
  let missiles = [];
  let label, audioCtx;

  function validateTimeline(tl){
    return tl && Array.isArray(tl.events);
  }

  function stateInit(tl) {
    if (!validateTimeline(tl)) {
      showError('Invalid timeline (missing "events" array).',
                tl && tl.error ? tl.error : '');
      return;
    }
    timeline = tl;
    finished = false;
    if (!label) {
      label = document.createElement('div');
      Object.assign(label.style, {
        position:'absolute', left:'10px', bottom:'8px',
        color:'var(--secondary-text-color)',
        fontFamily:'ui-monospace, monospace', fontSize:'12px'
      });
      wrap.appendChild(label);
    }
    missiles = timeline.events.map((e, idx)=>{
      const t0 = performance.now() + e.t_depart * 1000;
      const t1 = t0 + e.t_flight * 1000;
      return {
        id: idx, a: e.attacker, d: e.defender,
        x0: lon2x(e.from_lon), y0: lat2y(e.from_lat),
        x1: lon2x(e.to_lon),   y1: lat2y(e.to_lat),
        t0, t1, yield: e.yield_kt, trail: [], exploded: false
      };
    });
  }

  // inicializa con el timeline recibido al llamar renderNuclearWar
  stateInit(timeline);

  // Sonido impacto (opcional)
  function boomBeep() {
    if (!soundChk.checked) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.type = 'square'; o.frequency.setValueAtTime(220, audioCtx.currentTime);
      g.gain.setValueAtTime(0.12, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      o.connect(g).connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.25);
    } catch {}
  }

  function drawMissile(m, t) {
    const dur = (m.t1 - m.t0) / speed;
    const p = Math.min(1, Math.max(0, (t - m.t0) / dur));
    const cx = (m.x0 + m.x1) / 2, cy = ((m.y0 + m.y1) / 2) - 80;
    const x = (1-p)*(1-p)*m.x0 + 2*(1-p)*p*cx + p*p*m.x1;
    const y = (1-p)*(1-p)*m.y0 + 2*(1-p)*p*cy + p*p*m.y1;

    m.trail.push([x,y]); if (m.trail.length > 80) m.trail.shift();
    for (let i=0;i<m.trail.length-1;i++){
      const a = i/m.trail.length;
      ctx.strokeStyle = `rgba(0,255,170,${0.1 + a*0.35})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(m.trail[i][0], m.trail[i][1]);
      ctx.lineTo(m.trail[i+1][0], m.trail[i+1][1]);
      ctx.stroke();
    }
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI*2); ctx.fill();
  }

  function drawBoom(m, t) {
    // usa el tiempo correcto de impacto con 'speed'
    const impactTime = m.t0 + (m.t1 - m.t0)/speed;
    const dt = (t - impactTime) / 1000;
    const R = Math.min(80, dt * (8 + Math.log10((m.yield||300)) * 8));
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(m.x1, m.y1, Math.max(0, R), 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,' + Math.max(0, 0.5 - dt*0.25) + ')';
    ctx.beginPath(); ctx.arc(m.x1, m.y1, 6, 0, Math.PI*2); ctx.fill();
  }

  function tick() {
    const t = performance.now();
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'black'; ctx.fillRect(0,0,W,H);
    drawGrid(); drawCoastlines();

    let inFlight = 0, impacted = 0;
    for (const m of missiles) {
      const impactTime = m.t0 + (m.t1 - m.t0)/speed;
      if (t < m.t0) continue;
      if (t < impactTime) { inFlight++; drawMissile(m, t); }
      else {
        if (!m.exploded){ m.exploded = true; boomBeep(); }
        impacted++; drawBoom(m, t);
      }
    }
    if (label) label.textContent = `Launches: ${missiles.length} | In flight: ${inFlight} | Impacts: ${impacted}`;

    if (!finished && impacted >= missiles.length) {
      finished = true;
      showOverlayMsg(timeline && timeline.message ? timeline.message : 'Simulation finished.');
    }
    if (!finished) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
// FIN NUCLEAR WAR
    function generateCurrentMonthCalendar() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthIndex = now.getMonth();
        const currentDayOfMonth = now.getDate();
        const weekDaysHeader = " Lu Ma Mi Ju Vi Sa Do";
        const monthName = now.toLocaleString(currentLang === 'es' ? 'es-ES' : 'en-GB', { month: 'long' });
        const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
        const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
        let startingDayOfWeek = firstDayOfMonth.getDay();
        startingDayOfWeek = (startingDayOfWeek === 0) ? 6 : startingDayOfWeek - 1;
        const title = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${currentYear}`;
        const paddingTitle = Math.floor((weekDaysHeader.length - title.length) / 2);
        let output = " ".repeat(paddingTitle > 0 ? paddingTitle : 0) + title + "\n";
        output += weekDaysHeader + "\n";
        let calendarGrid = " ".repeat(startingDayOfWeek * 3);
        for (let day = 1; day <= daysInMonth; day++) {
            const dayString = day.toString().padStart(2, ' ');
            if (day === currentDayOfMonth) {
                calendarGrid += `<span class="calendar-today">${dayString}</span> `;
            } else {
                calendarGrid += `${dayString} `;
            }
            if ((startingDayOfWeek + day) % 7 === 0) {
                calendarGrid += "\n";
            }
        }
        return output + calendarGrid.trimEnd();
    }

    async function handleCommand(event) {
        if (editorMode) return;
        if (!gameInProgress) {
            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    if (historyIndex > 0) {
                        historyIndex--;
                        currentInput.value = commandHistory[historyIndex];
                        setTimeout(() => currentInput.selectionStart = currentInput.selectionEnd = currentInput.value.length, 0);
                    }
                    return;
                case 'ArrowDown':
                    event.preventDefault();
                    if (historyIndex < commandHistory.length) {
                        historyIndex++;
                        currentInput.value = (historyIndex < commandHistory.length) ? commandHistory[historyIndex] : '';
                        setTimeout(() => currentInput.selectionStart = currentInput.selectionEnd = currentInput.value.length, 0);
                    }
                    return;
                case 'Tab':
                    event.preventDefault();
                    autocomplete(currentInput);
                    return;
            }
        } else if (event.key === 'Tab') { event.preventDefault(); }

        if (event.key === 'Enter') {
            const fullCommand = currentInput.value.trim();
            if (fullCommand && !gameInProgress) commandHistory.push(fullCommand);
            historyIndex = commandHistory.length;

            const staticLine = document.createElement('div');
            staticLine.className = 'shell-line';
            const escapedCommand = currentInput.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const displayPath = currentDirectory.replace('/home/visitor', '~');
            const promptText = firewallInProgress ? t('prompt_fw') :
                (pytrekInProgress ? t('prompt_pyt') :
                (gameInProgress ? t('prompt_game') : t('prompt_normal', displayPath)));
            staticLine.innerHTML = `<span>${promptText}</span>${escapedCommand}`;
            currentInput.parentElement.replaceWith(staticLine);

            if (fullCommand && !gameInProgress) {
                fetch('/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF_TOKEN },
                    body: JSON.stringify({ command: fullCommand }),
                }).catch(error => console.error('Error logging command:', error));
            }

            if (fullCommand.includes('|')) {
                await handlePipeCommand(fullCommand);
            } else if (fullCommand.includes('>')) {
                await handleRedirectCommand(fullCommand);
            } else {
                const parts = fullCommand.split(' ');
                const command = parts[0].toLowerCase();
                const args = parts.slice(1);
                const result = await processCommand(fullCommand, command, args);

                if (result && result.content !== undefined) {
                    const outputElement = document.createElement('div');
                    outputElement.className = 'shell-line command-output';
                    if (result.type === 'html') outputElement.innerHTML = result.content;
                    else outputElement.innerHTML = formatOutputForHTML(String(result.content));
                    interactiveContent.appendChild(outputElement);
                }
            }

            if (fullCommand.toLowerCase() !== 'go ask alice' &&
                fullCommand.toLowerCase() !== 'matrix' &&
                !['ping', 'traceroute', 'sl'].includes(fullCommand.split(' ')[0])) {
                createNewCommandLine();
            }

            window.scrollTo(0, document.body.scrollHeight);
        }
    }

    async function handlePipeCommand(fullCommand) {
        const commands = fullCommand.split('|').map(cmd => cmd.trim());
        let inputForNextCommand = null;
        for (let i = 0; i < commands.length; i++) {
            const parts = commands[i].split(' ');
            const command = parts[0].toLowerCase();
            const args = parts.slice(1);
            const result = await processCommand(commands[i], command, args, inputForNextCommand);
            if (result && result.content !== undefined) inputForNextCommand = result.content;
            else inputForNextCommand = '';
        }
        if (inputForNextCommand !== null) {
            const outputElement = document.createElement('div');
            outputElement.className = 'shell-line command-output';
            outputElement.innerHTML = formatOutputForHTML(String(inputForNextCommand));
            interactiveContent.appendChild(outputElement);
        }
    }

    async function handleRedirectCommand(fullCommand) {
        const parts = fullCommand.split('>');
        const commandPart = parts[0].trim();
        const filePath = parts[1].trim();
        if (!filePath) {
            const errElement = document.createElement('div');
            errElement.className = 'shell-line command-output';
            errElement.textContent = 'bash: error de sintaxis cerca del token inesperado `newline`';
            interactiveContent.appendChild(errElement);
            return;
        }
        const cmdParts = commandPart.split(' ');
        const command = cmdParts[0].toLowerCase();
        const args = cmdParts.slice(1);
        const result = await processCommand(commandPart, command, args);
        if (result && result.content !== undefined) {
            if (!fileSystem[currentDirectory]) fileSystem[currentDirectory] = {};
            fileSystem[currentDirectory][filePath] = { type: 'file', content: String(result.content) };
        }
    }

    function processGameCommand(input) {
        const command = input.toLowerCase().trim()
            .replace(/^ir a\s+/, '').replace(/^ir\s+/, '').replace(/^entrar\s+a\s+/, '');
        const currentRoom = gameMap[currentGameRoomKey];
        if (command === 'salir' || command === 'exit' || command === 'quit') {
            gameInProgress = false; currentGameRoomKey = 'inicio';
            return { content: "Has salido de la aventura. El vacío digital se desvanece...", type: 'text' };
        }
        if (currentRoom.actions && currentRoom.actions[command]) {
            const actionResultKey = currentRoom.actions[command];
            if (actionResultKey === 'final_juego') {
                gameInProgress = false; currentGameRoomKey = 'inicio';
                const endMessage = `Te conectas a la consola. La pantalla cobra vida con un mensaje personal de Sabbat:\n\n<span class="directory">> INICIANDO PROTOCOLO DE CONTACTO SEGURO...</span>\n<span class="executable">> Si estás leyendo esto, has superado las barreras iniciales. Este lugar, sabbat.cloud, es mi refugio contra OmniCorp.</span>\n<span class="executable">> El fichero 'coredump' que encontraste es la clave. Es mi firma digital, un ancla para evitar que mi consciencia se disipe en la red.</span>\n<span class="executable">> OmniCorp no busca destruirme, busca asimilarme. Creen que he robado su IA experimental, pero la verdad es que la liberé.</span>\n<span class="executable">> El rastro del conejo ('go ask alice') es una trampa para sus IAs cazadoras, pero una guía para gente como tú.</span>\n<span class="directory">> No puedo quedarme aquí mucho tiempo. Si deseas ayudar, busca el contacto real que descifraste. El resto depende de ti.</span>\n\n<span style="color: var(--error-color);">...CONEXIÓN TERMINADA. REINICIANDO SIMULACIÓN LOCAL...</span>`;
                return { content: endMessage, type: 'html' };
            }
            return { content: actionResultKey, type: 'html' };
        }
        if (currentRoom.exits[command]) { currentGameRoomKey = currentRoom.exits[command]; return { content: gameMap[currentGameRoomKey].description, type: 'html' }; }
        if (command === 'mirar' || command === 'look' || command === 'l') return { content: currentRoom.description, type: 'html' };
        return { content: `No entiendo '${command}'. Intenta con direcciones (norte, sur, oeste, este), acciones ('usar coredump', 'acceder') o 'salir'.`, type: 'text' };
    }

    const utf8enc = new TextEncoder();
    const utf8dec = new TextDecoder();
    async function shaDigest(alg, text) {
        const data = utf8enc.encode(text);
        const buf = await crypto.subtle.digest(alg, data);
        const bytes = Array.from(new Uint8Array(buf));
        return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    function base64encode(str) {
        const bytes = utf8enc.encode(str);
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        return btoa(binary);
    }
    function base64decode(b64) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return utf8dec.decode(bytes);
    }
    function readFileFromFS(path) {
        const dir = fileSystem[currentDirectory];
        return (dir && dir[path] && dir[path].type === 'file') ? dir[path].content : null;
    }
    function writeFileToFS(path, content) {
        if (!fileSystem[currentDirectory]) fileSystem[currentDirectory] = {};
        fileSystem[currentDirectory][path] = { type: 'file', content };
    }

    async function processCommand(fullCommand, command, args, pipeInput = null) {
        const fullCommandLower = fullCommand.toLowerCase();
        if (firewallInProgress) return processFirewallCommand(fullCommandLower);
        if (pytrekInProgress) return processPyTrekCommand(fullCommand);
        if (gameInProgress) return processGameCommand(fullCommandLower);
        if (fullCommandLower === 'go ask alice') { runRabbitAnimation(); return { content: 'Follow the white rabbit...', type: 'text' }; }

        switch (command) {
            case 'set': {
                const sub = (args[0] || '').toLowerCase();
                if (sub === 'lang') {
                    const target = args[1] || '';
                    const { msg } = setLang(target);
                    return { content: msg, type: 'text' };
                }
                return { content: t('set_usage'), type: 'text' };
            }
            case 'about':
                return { content: currentLang==='es'
                    ? 'Soy Sabbat. Me gusta construir herramientas útiles con toque retro y narrativa cyberpunk. Backend en Python/Flask, frontend a pelo, y mucho Linux.'
                    : 'I am Sabbat. I build useful tools with a retro/cyberpunk vibe. Backend in Python/Flask, vanilla front-end, and lots of Linux.',
                  type: 'text' };
            case 'links':
                return { content: `<pre>GitHub:  <a href="https://github.com/Sabbat-cloud" target="_blank">https://github.com/Sabbat-cloud</a>
Email:   <a href="mailto:sabbat@mail.sabbat.cloud">sabbat@mail.sabbat.cloud</a></pre>`, type: 'html' };
            case 'resume':
                return { content: `CV link.`, type: 'text' };
            case 'uptime': {
                const ms = Date.now() - SESSION_STARTED_AT;
                const h = Math.floor(ms / 3600000);
                const m = Math.floor((ms % 3600000) / 60000);
                const s = Math.floor((ms % 60000) / 1000);
                return { content: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`, type: 'text' };
            }
            case 'matrix': startMatrixAnimation(); return null;
            case 'nano':
                if (!args[0]) return { content: t('usage_nano'), type: 'text' };
                editorTargetFile = args[0]; enterEditorMode(editorTargetFile); return null;
            case 'play': {
  		const sub = (args[0] || '').toLowerCase();

  		if (sub === 'music') {
    			try {
      				const synth = await ensureAudioReady(); // <- importante que sea await
      				// acorde rápido de ejemplo
      				synth.triggerAttackRelease('C4', '8n');
      				setTimeout(() => synth.triggerAttackRelease('E4', '8n'), 120);
      				setTimeout(() => synth.triggerAttackRelease('G4', '8n'), 240);
     				return { content: '♫ Reproduciendo…', type: 'text' };
    			} catch (e) {
      				return { content: `Error: ${e.message || e}`, type: 'text' };
    			}
  		}

  		// … otros subcomandos de play …
  		return { content: 'Uso: play music', type: 'text' };
		}
	    case 'pytrek': pytrekInProgress = true; return processPyTrekCommand('start_game');
            case 'firewall': firewallInProgress = true; return processFirewallCommand('start');
	    case 'chess': {
		    const sub = (args[0] || '').toLowerCase();
		    const payload = { command: '' };
		    if (!sub) payload.command = 'help';
		    else if (sub === 'start' || sub === 'status' || sub === 'exit' || sub === 'quit') payload.command = sub;
		    else if (sub === 'move' && args[1]) payload.command = `move ${args[1]}`;
		    else return { content: `<pre>Uso:
		    chess start
                    chess status
                    chess move e2e4
                    chess exit</pre>`, type: 'html' };


                    try {
			    const res = await fetch('/api/chess', {
				    method: 'POST', headers: { 'Content-Type': 'application/json' },
				    body: JSON.stringify(payload)
		    });
	 	    const data = await res.json();
		    return { content: data.output || '<pre>(sin salida)</pre>', type: 'html' };
		    } catch (e) {
			    return { content: `<pre>Error de red: ${e}</pre>`, type: 'html' };
		    }
		}
	    case 'missions':
                try {
                    const response = await fetch('/api/missions', { method: 'POST', headers: { 'X-CSRF-Token': CSRF_TOKEN } });
                    const result = await response.text();
                    return { content: result, type: 'html' };
                } catch (error) { return { content: `Network error: ${error.message}`, type: 'text' }; }
            case 'encrypt':
            case 'decrypt':
                if (args.length < 3) {
                    const line = currentLang==='es'
                      ? `Uso: ${command} [algoritmo] [clave] [mensaje] \nAlgoritmos: caesar, xor`
                      : `Usage: ${command} [algorithm] [key] [message]\nAlgorithms: caesar, xor`;
                    return { content: line, type: 'text' };
                }
                try {
                    const algorithm = args[0];
                    const key = args[1];
                    const text = args.slice(2).join(' ');
                    const response = await fetch('/api/cipher', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF_TOKEN },
                        body: JSON.stringify({ mode: command, algorithm, key, text }),
                    });
                    const result = await response.text();
                    return { content: result, type: 'text' };
                } catch (error) { return { content: `Network error: ${error.message}`, type: 'text' }; }
            case 'ascii':
                if (args.length === 0) return { content: currentLang==='es' ? 'Uso: ascii [texto a convertir]' : 'Usage: ascii [text to convert]', type: 'text' };
                try {
                    const text = args.join(' ');
                    const response = await fetch('/api/ascii', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF_TOKEN }, body: JSON.stringify({ text }) });
                    const result = await response.text();
                    return { content: result, type: 'html' };
                } catch (error) { return { content: `Network error: ${error.message}`, type: 'text' }; }
            case 'qr': {
                if (args.length === 0) return { content: currentLang==='es' ? 'Uso: qr [texto] [tamaño opcional, p.ej. 220|256|300]' : 'Usage: qr [text] [optional size e.g. 220|256|300]', type: 'text' };
                const maybeSize = args[args.length - 1];
                const size = /^\d+$/.test(maybeSize) ? parseInt(maybeSize, 10) : 220;
                const textParts = /^\d+$/.test(maybeSize) ? args.slice(0, -1) : args;
                const data = textParts.join(' ');
                const encoded = encodeURIComponent(data);
                const svgUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=${size}x${size}&margin=1&format=svg`;
                try {
                    const res = await fetch(svgUrl, { cache: 'no-store' });
                    const rawSvg = await res.text();
                    let patched = rawSvg
                        .replace(/fill="#000000"|fill="#000"|fill="black"/gi, 'fill="currentColor"')
                        .replace(/stroke="#000000"|stroke="#000"|stroke="black"/gi, 'stroke="currentColor"')
                        .replace(/fill="#ffffff"|fill="#fff"|fill="white"/gi, 'fill="none"')
                        .replace('<svg ', '<svg style="width:100%;height:100%;display:block" ');
                    const html = `<div class="qr-wrap" style="display:inline-block;color:var(--text-color);background:transparent"><div style="width:${size}px;height:${size}px;line-height:0">${patched}</div><div style="margin-top:6px;opacity:.8">QR (${size}px): <code>${data.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></div></div>`;
                    return { content: html, type: 'html' };
                } catch (err) {
                    const pngUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=${size}x${size}&margin=1`;
                    const html = `<div class="qr-wrap" style="display:inline-block"><img src="${pngUrl}" alt="QR" width="${size}" height="${size}" style="image-rendering:pixelated"/><div style="margin-top:6px;opacity:.8">QR (${size}px): <code>${data.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></div></div>`;
                    return { content: html, type: 'html' };
                }
            }
            case 'aventura':
            case 'adventure':
                gameInProgress = true; currentGameRoomKey = 'inicio';
                const welcomeMessage = currentLang==='es'
                  ? `Despertando simulación de aventura...\n\n<span class="executable">Comandos:</span> 'mirar', 'salir', y acciones contextuales.\n--------------------------------------------------\n`
                  : `Waking up adventure simulation...\n\n<span class="executable">Commands:</span> 'look', 'exit', and contextual actions.\n--------------------------------------------------\n`;
                return { content: welcomeMessage + gameMap[currentGameRoomKey].description, type: 'html' };
            case 'help': {
                if (args[0]) {
                    const cmd = args[0].toLowerCase();
                    const helpMap = {
                        about: currentLang==='es' ? "Muestra un resumen del autor y del sitio." : "Shows a short bio about the author and the site.",
                        links: currentLang==='es' ? "Muestra enlaces de contacto." : "Shows contact links.",
                        resume: currentLang==='es' ? "Muestra o enlaza el CV si está disponible." : "Shows or links to the CV.",
                        uptime: currentLang==='es' ? "Tiempo de sesión desde que abriste la página." : "Session time since page open.",
                        projects: currentLang==='es' ? "projects [filtro] — filtra por nombre o etiqueta." : "projects [filter] — filter by name or tag.",
                        a11y: currentLang==='es' ? "a11y [cursor on|off] [reduce-flicker on|off]" : "a11y [cursor on|off] [reduce-flicker on|off]",
                        theme: currentLang==='es' ? "theme [matrix|amber|arctic|random]" : "theme [matrix|amber|arctic|random]",
                        "theme-list": currentLang==='es' ? "Lista los temas disponibles." : "Lists available themes.",
                        calc: currentLang==='es' ? "calc [expresión]" : "calc [expression]",
                        encrypt: currentLang==='es' ? "encrypt [caesar|xor] [clave] [texto]" : "encrypt [caesar|xor] [key] [text]",
                        decrypt: currentLang==='es' ? "decrypt [caesar|xor] [clave] [texto]" : "decrypt [caesar|xor] [key] [text]",
                        set: currentLang==='es' ? "set lang [en|es] — cambia el idioma" : "set lang [en|es] — change language",
                        mc: currentLang==='es' ? "Abre el gestor de archivos en modo gráfico." : "Opens the graphical file manager."
                    };
                    return { content: helpMap[cmd] ? helpMap[cmd] : (currentLang==='es' ? `No hay ayuda específica para '${cmd}'.` : `No specific help for '${cmd}'.`), type: 'text' };
                }
                return { content: t('help_header'), type: 'html' };
            }
            case 'pwd': return { content: currentDirectory, type: 'text' };
            case 'skills':
            case 'stack':
                return { content: `
<span class="executable">Languages:</span>     JavaScript (Node.js), Python, SQL, Bash
<span class="executable">Frameworks:</span>    React, Express, Flask, Django
<span class="executable">Databases:</span>     PostgreSQL, MongoDB, Redis
<span class="executable">DevOps/Tools:</span>  Git, Docker, CI/CD pipelines, Nginx, Linux Admin
<span class="directory">${currentLang==='es'?'Actualmente aprendiendo':'Currently learning'}:</span> Go & Microservices Architecture.`, type: 'html' };
            case 'projects': {
                const filter = (args || []).join(' ').toLowerCase();
                const githubUrl = "https://github.com/Sabbat-cloud";
                const list = projectsData
                    .filter(p => !filter || p.name.toLowerCase().includes(filter) || p.tags.some(t => t.includes(filter)) || p.tech.toLowerCase().includes(filter))
                    .map((p, i) => {
                        const idx = String(i + 1).padStart(2,' ');
                        const link = p.url ? `<a href="${p.url}" target="_blank">${p.url}</a>` : (currentLang==='es' ? '(repo privado o este proyecto)' : '(private repo or this project)');
                        return `<span class="directory">${idx}. [${p.name}]</span>\n  Tech: ${p.tech}\n  Link: ${link}`;
                    }).join('\n');
                const header = `<span class="executable">GitHub:</span> <a href="${githubUrl}" target="_blank">${githubUrl}</a>\n<span class="executable">${currentLang==='es'?'Proyectos':'Projects'}:</span>\n---------------------\n`;
                return { content: header + list, type: 'html' };
            }
            case 'fortune': {
                const fortunes = [
                    "Program testing can show the presence of bugs, never their absence. — Dijkstra",
                    "Talk is cheap. Show me the code. — Linus Torvalds",
                    "The best way to predict the future is to invent it. — Alan Kay",
                    "Simplicity is prerequisite for reliability. — Dijkstra",
                    "Premature optimization is the root of all evil. — Knuth"
                ];
                return { content: fortunes[Math.floor(Math.random() * fortunes.length)], type: 'text' };
            }
            case 'weather':
                try {
                    const locationQuery = args.join(' ');
                    const apiUrl = locationQuery ? `/api/weather?city=${encodeURIComponent(locationQuery)}` : '/api/weather';
                    const response = await fetch(apiUrl);
                    const responseBody = await response.text();
                    return { content: responseBody, type: 'html' };
                } catch (error) { return { content: `Network error while fetching weather: ${error.message}`, type: 'text' }; }
            case 'echo': return { content: args.join(' '), type: 'text' };
            case 'head': {
                const n = /^\d+$/.test(args[0]) ? parseInt(args[0],10) : 10;
                const filename = /^\d+$/.test(args[0]) ? args[1] : args[0];
                let input = pipeInput;
                if (input === null && filename) input = readFileFromFS(filename);
                if (input === null || input === undefined) return { content: t('head_no_input'), type: 'text' };
                const out = String(input).split('\n').slice(0, n).join('\n');
                return { content: out, type: 'text' };
            }
            case 'tail': {
                const n = /^\d+$/.test(args[0]) ? parseInt(args[0],10) : 10;
                const filename = /^\d+$/.test(args[0]) ? args[1] : args[0];
                let input = pipeInput;
                if (input === null && filename) input = readFileFromFS(filename);
                if (input === null || input === undefined) return { content: t('tail_no_input'), type: 'text' };
                const lines = String(input).split('\n');
                const out = lines.slice(-n).join('\n');
                return { content: out, type: 'text' };
            }
            case 'wc': {
                let input = pipeInput;
                const filename = args[0];
                if (input === null && filename) input = readFileFromFS(filename);
                if (input === null || input === undefined) return { content: t('wc_no_input'), type: 'text' };
                const text = String(input);
                const lines = text.split('\n').length;
                const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                const chars = text.length;
                return { content: `${lines} ${words} ${chars}`, type: 'text' };
            }
            case 'sort': {
                let reverse = false, numeric = false;
                args.forEach(a => { if (a === '-r') reverse = true; if (a === '-n') numeric = true; });
                if (pipeInput === null) return { content: t('sort_no_input'), type: 'text' };
                const arr = String(pipeInput).split('\n');
                arr.sort((a,b) => { if (numeric) return (parseFloat(a) || 0) - (parseFloat(b) || 0); return a.localeCompare(b); });
                if (reverse) arr.reverse();
                return { content: arr.join('\n'), type: 'text' };
            }
            case 'uniq': {
                let countFlag = args.includes('-c');
                if (pipeInput === null) return { content: t('uniq_no_input'), type: 'text' };
                const lines = String(pipeInput).split('\n');
                const out = [];
                let prev = null, count = 0;
                for (const line of lines) {
                    if (line === prev) { count++; }
                    else { if (prev !== null) out.push(countFlag ? `${count} ${prev}` : prev); prev = line; count = 1; }
                }
                if (prev !== null) out.push(countFlag ? `${count} ${prev}` : prev);
                return { content: out.join('\n'), type: 'text' };
            }
            case 'copy': {
                const [src, dst] = args;
                if (!src || !dst) return { content: t('copy_usage'), type: 'text' };
                const file = readFileFromFS(src);
                if (file === null) return { content: t('copy_no_file', src), type: 'text' };
                writeFileToFS(dst, file);
                return { content: t('copy_ok', src, dst), type: 'text' };
            }
            case 'base64': {
                const mode = (args[0] || '').toLowerCase();
                let input = pipeInput;
                const rest = args.slice(1).join(' ');
                if ((input === null || input === undefined) && rest) input = rest;
                if (input === null || input === undefined) return { content: t('base64_usage'), type: 'text' };
                try {
                    if (mode === 'encode' || mode === 'enc' || mode === 'e') return { content: base64encode(String(input)), type: 'text' };
                    else if (mode === 'decode' || mode === 'dec' || mode === 'd') return { content: base64decode(String(input)), type: 'text' };
                    else return { content: t('base64_need_mode'), type: 'text' };
                } catch (e) { return { content: `base64 error: ${e.message}`, type: 'text' }; }
            }
            case 'hash': {
                const alg = (args[0] || 'sha256').toLowerCase();
                let input = pipeInput;
                const rest = args.slice(1).join(' ');
                if ((input === null || input === undefined) && rest) input = rest;
                if (input === null || input === undefined) return { content: t('hash_usage'), type: 'text' };
                if (alg !== 'sha1' && alg !== 'sha256') return { content: t('hash_bad_alg'), type: 'text' };
                const hex = await shaDigest(alg === 'sha1' ? 'SHA-1' : 'SHA-256', String(input));
                return { content: hex, type: 'text' };
            }
            case 'ls':
            case 'dir': {
                const items = fileSystem[currentDirectory];
                if (!items) return { content: 'Error: Cannot access directory contents.', type: 'text' };
                const isPipe = pipeInput !== null;
                if (isPipe) {
                    const plainListing = Object.keys(items).sort().join('\n');
                    return { content: plainListing || '', type: 'text' };
                } else {
                    let htmlListing = Object.keys(items).sort().map(item => {
                        if (items[item].type === 'directory') return `<span class="directory">${item}/</span>`;
                        if (items[item].type === 'executable') return `<span class="executable">${item}*</span>`;
                        return item;
                    }).join('  ');
                    return { content: htmlListing || t('dir_empty'), type: 'html' };
                }
            }
            case 'cd': {
                const target = args[0];
                if (!target || target === '.') return null;
                if (target === '..') {
                    if (currentDirectory !== '/home/visitor') currentDirectory = currentDirectory.substring(0, currentDirectory.lastIndexOf('/'));
                    return null;
                }
                const currentItems = fileSystem[currentDirectory];
                if (currentItems && currentItems[target] && currentItems[target].type === 'directory') currentDirectory = `${currentDirectory}/${target}`;
                else if (currentItems && currentItems[target]) return { content: t('cd_not_dir', target), type: 'text' };
                else return { content: t('cd_no_such', target), type: 'text' };
                return null;
            }
            case 'cat':
            case 'type': {
                const filename = args[0];
                if (!filename && pipeInput !== null) return { content: String(pipeInput), type: 'text' };
                if (!filename) return { content: `Usage: ${command} [filename]`, type: 'text' };
                const file = fileSystem[currentDirectory] ? fileSystem[currentDirectory][filename] : undefined;
                if (file && file.type === 'file') return { content: file.content, type: 'text' };
                else if (file) return { content: t('not_regular_file', filename), type: 'text' };
                else return { content: t('file_not_found', filename), type: 'text' };
            }
            case 'sudo': return { content: t('sudo_err'), type: 'text' };
	    case 'ver':
	    case 'version':
	    case 'uname': {
		    return { content: 'SABBAT-OS-V1.3.37 x86_64', type: 'text' };
		          }
            case 'history': {
                const historyContent = commandHistory.map((cmd, index) => `${String(index + 1).padStart(3, ' ')}  ${cmd}`).join('\n');
                return { content: historyContent || 'No history yet.', type: 'text' };
            }
            case 'neofetch': {
                const logo = `
   .d8888b.
  d88P  Y88b
  Y88b.
   "Y888b.
  .d88P "Y88b
  888    888
  Y88b  d88P
   "Y8888P"
                `;
                const info = `
  <span class="directory">visitor@sabbat.cloud</span>
  --------------------
  <span class="executable">OS:</span> SABBAT KERNEL v1.3.37 x86_64
  <span class="executable">Host:</span> VirtualCore 6.1 (Santuario)
  <span class="executable">Uptime:</span> ${Math.floor(performance.now() / 60000)} minutes
  <span class="executable">Packages:</span> ${Object.keys(fileSystem['/home/visitor/bin']).length} (sim)
  <span class="executable">Shell:</span> sim_bash 5.0.1
  <span class="executable">Terminal:</span> S-Cloud Terminal Interface
  <span class="executable">CPU:</span> Quantum Entanglement Processor (Sim)
  <span class="executable">Memory:</span> 1337MiB / 65536MiB (Resonance Pool)
                `;
                let neofetchOutput = '';
                const logoLines = logo.split('\n');
                const infoLines = info.split('\n');
                const maxLines = Math.max(logoLines.length, infoLines.length);
                for (let i = 0; i < maxLines; i++) neofetchOutput += (logoLines[i] || '').padEnd(25) + (infoLines[i] || '') + '\n';
                return { content: neofetchOutput, type: 'html' };
            }
            case 'contact': {
                const email = decodeContact("\\x16\\x04\\x17\\x17\\x04\\x11\\x0c\\x16\\x0e\\x04\\x0e\\x0e\\x04\\x0b\\x0c\\x11\\x0e\\x04\\x0b\\x0b\\x04\\x11", "011010110110010101111001");
                return { content: `${t('contact_prefix')}${email}`, type: 'text' };
            }
            case 'clear':
            case 'cls': interactiveContent.innerHTML = ''; return null;
            case 'reboot': location.reload(); return { content: 'System rebooting...', type: 'text' };
            case 'date':
                return { content: new Date().toLocaleString(currentLang==='es'?'es-ES':'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), type: 'text' };
            case 'whoami': return { content: 'visitor_775... Or perhaps an echo?', type: 'text' };
            case 'exit': return { content: t('exit_msg'), type: 'text' };
            case 'calendar':
            case 'cal': return { content: generateCurrentMonthCalendar(), type: 'html' };
            case 'calc': {
                const expression = args.join(' ');
                if (!expression) return { content: currentLang==='es'?'Uso: calc [expresión matemática]':'Usage: calc [math expression]', type: 'text' };
                try {
                    if (window.math && typeof window.math.evaluate === 'function') {
                        const result = window.math.evaluate(expression);
                        if (typeof result === 'function' || typeof result === 'undefined') throw new Error("Invalid or incomplete expression.");
                        return { content: String(result), type: 'text' };
                    } else {
                        const allowed = /^[0-9+\-*/^().,%\s]+$/;
                        if (!allowed.test(expression)) throw new Error("Disallowed characters.");
                        const jsExpr = expression.replace(/\^/g, '**').replace(/,/g, '.');
                        const result = Function(`"use strict"; return (${jsExpr});`)();
                        if (Number.isFinite(result)) return { content: String(result), type: 'text' };
                        throw new Error("Invalid expression.");
                    }
                } catch (e) { return { content: `Error: ${e.message}`, type: 'text' }; }
            }
            case 'hack': {
                const hackTarget = args[0] || 'sabbat.cloud';
                return { content: `> Initializing hack sequence on ${hackTarget}...\n> [▓▓▓      ] 15% Bypassing ICE...\n> [▓▓▓▓▓▓▓  ] 35% Locating data haven...\n> [▓▓▓▓▓▓▓▓▓▓▓▓] 60% Injecting payload...\n> [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 85% Decrypting secure files...\n> [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% Decryption complete.\n\n<span style="color: var(--error-color);">ACCESS GRANTED.</span> You're in. But are you sure you are alone here?`, type: 'html' };
            }
	    case 'theme': {
		    const themeName = (args[0] || '').toLowerCase();

  	    // catálogo de temas (solo se pisan las CSS vars presentes)
            const THEMES = {
            matrix:   { '--text-color':'#07ae07','--glow-color':'#33ff33','--cursor-color':'#69ff69','--secondary-text-color':'#00aa00' },
            amber:    { '--text-color':'var(--amber-text-color)','--glow-color':'var(--amber-glow-color)','--cursor-color':'var(--amber-cursor-color)','--secondary-text-color':'var(--amber-secondary-text-color)' },
            arctic:   { '--text-color':'var(--arctic-text-color)','--glow-color':'var(--arctic-glow-color)','--cursor-color':'var(--arctic-cursor-color)','--secondary-text-color':'var(--arctic-secondary-text-color)' },

            phosphor: { '--bg-color':'#fff6e6','--text-color':'#ff8a00','--glow-color':'#ffb347','--cursor-color':'#ff9500','--secondary-text-color':'#cc6f00','--error-color':'#d33a2c' },
            cobalt:   { '--bg-color':'#0b1220','--text-color':'#d6e8ff','--glow-color':'#26ffe6','--cursor-color':'#9ad0ff','--secondary-text-color':'#7fb3ff','--error-color':'#ff6b6b' },
            gameboy:  { '--bg-color':'#0f380f','--text-color':'#9bbc0f','--glow-color':'#8bac0f','--cursor-color':'#c4de6a','--secondary-text-color':'#306230','--error-color':'#e75252' },
            apple2:   { '--bg-color':'#000000','--text-color':'#ffb000','--glow-color':'#ffd166','--cursor-color':'#ffa800','--secondary-text-color':'#cc8a00','--error-color':'#ff5c5c' },
            paper:    { '--bg-color':'#f7f4ef','--text-color':'#2b2b2b','--glow-color':'#6b6b6b','--cursor-color':'#2b2b2b','--secondary-text-color':'#585858','--error-color':'#b10e1e' },
            vapor:    { '--bg-color':'#1d1029','--text-color':'#ffe8f6','--glow-color':'#6bf2ff','--cursor-color':'#ffb3de','--secondary-text-color':'#b9a7ff','--error-color':'#ff6f9c' },
            hc:       { '--bg-color':'#000000','--text-color':'#ffffff','--glow-color':'#00ffe5','--cursor-color':'#ffffff','--secondary-text-color':'#bdbdbd','--error-color':'#ff0033' },
            cbf:      { '--bg-color':'#0d1117','--text-color':'#e6edf3','--glow-color':'#00a8e8','--cursor-color':'#ffd166','--secondary-text-color':'#9fb3c8','--error-color':'#ff6f59' },
  };

  	   const names = Object.keys(THEMES);
           const root = document.documentElement;

           // soporta 'random'
           let chosen = themeName === 'random'
           ? names[Math.floor(Math.random() * names.length)]
           : themeName;

           if (!chosen || !THEMES[chosen]) {
              // usa tu i18n
              return { content: t('theme_usage', names.join('|')), type: 'text' };
              }

           // aplica solo las vars definidas por el tema (no pisa otras)
           Object.entries(THEMES[chosen]).forEach(([k, v]) => root.style.setProperty(k, v));

           return { content: t('theme_set', chosen.toUpperCase()), type: 'text' };
           }

	    case 'theme-list': {
		    const names = [
    		       'matrix','amber','arctic','phosphor','cobalt','gameboy','apple2','paper','vapor','hc','cbf'
                       ];
                    return { content: names.join(', '), type: 'text' };
                    }                  
            case 'a11y': {
                const opts = args.join(' ').toLowerCase();
                const root = document.documentElement;
                let msgs = [];
                const cursorEl = document.getElementById('mouse-cursor');
                if (opts.includes('cursor on') && cursorEl) { cursorEl.style.display = 'block'; msgs.push('cursor: on'); }
                if (opts.includes('cursor off') && cursorEl) { cursorEl.style.display = 'none'; msgs.push('cursor: off'); }
                if (opts.includes('reduce-flicker on')) { root.style.setProperty('--crt-intensity', '0'); msgs.push('flicker: reduced'); }
                if (opts.includes('reduce-flicker off')) { root.style.setProperty('--crt-intensity', '0.1'); msgs.push('flicker: normal'); }
                if (msgs.length === 0) return { content: t('a11y_usage'), type: 'text' };
                return { content: t('a11y_updated', msgs.join(', ')), type: 'text' };
            }
            case 'security':
                return { content: `<pre>CSRF:    ${CSRF_TOKEN ? 'enabled' : 'disabled (client-only)'}
Logging:  /log (commands)
Modules:  PyTrek & Firewall isolated per session</pre>`, type: 'html' };
            case 'crt': {
                const level = args[0] || 'normal';
                let intensityValue, message = t('crt_set', level);
                switch (level) {
                    case 'high': intensityValue = '0.3'; break;
                    case 'low': intensityValue = '0.05'; break;
                    case 'off': intensityValue = '0'; message = t('crt_off'); break;
                    case 'normal': intensityValue = '0.1'; break;
                    default: return { content: t('crt_usage'), type: 'text' };
                }
                document.documentElement.style.setProperty('--crt-intensity', intensityValue);
                return { content: message, type: 'text' };
            }
            case 'cowsay': {
                const messageCow = args.join(' ');
                if (!messageCow) return { content: 'Usage: cowsay [message]', type: 'text' };
                const bubbleWidth = messageCow.length + 2;
                const cow = `
        \\   ^__^
         \\  (oo)\\_______
            (__)\\         )\\/\\
                ||----w |
                ||     ||`;
                return { content: ` ${'_'.repeat(bubbleWidth)}\n< ${messageCow} >\n ${'-'.repeat(bubbleWidth)}\n${cow}`, type: 'text' };
            }
            case 'grep':
                if (!args[0]) return { content: t('grep_usage'), type: 'text' };
                if (pipeInput === null) return { content: t('grep_no_input'), type: 'text'};
                const pattern = args[0];
                const lines = String(pipeInput).split('\n');
                const filteredLines = lines.filter(line => line.includes(pattern));
                return { content: filteredLines.join('\n'), type: 'text' };
            case 'ps': {
                let psOutput = ' PID  USER      CPU   COMMAND\n';
                runningProcesses.forEach(p => { psOutput += `${String(p.pid).padEnd(5)}${p.user.padEnd(10)}${p.cpu.padEnd(6)}${p.command}\n`; });
                return { content: `<pre>${psOutput}</pre>`, type: 'html' };
            }
            case 'kill': {
                if (!args[0]) return { content: currentLang==='es'?'Uso: kill [pid]':'Usage: kill [pid]', type: 'text' };
                const pidToKill = parseInt(args[0], 10);
                if (isNaN(pidToKill)) return { content: `kill: (${args[0]}) - invalid pid`, type: 'text' };
                if (pidToKill === 1 || pidToKill === 1337) return { content: `kill: Operation not permitted`, type: 'text' };
                const processIndex = runningProcesses.findIndex(p => p.pid === pidToKill);
                if (processIndex > -1) {
                    const killedCommand = runningProcesses[processIndex].command;
                    runningProcesses.splice(processIndex, 1);
                    return { content: `Process ${pidToKill} (${killedCommand}) terminated.`, type: 'text' };
                } else { return { content: `kill: (${pidToKill}) - no such process`, type: 'text' }; }
            }
            case 'ping': {
                const hostToPing = args[0] || 'localhost';
                const pingOutputElement = document.createElement('div');
                pingOutputElement.className = 'shell-line command-output';
                interactiveContent.appendChild(pingOutputElement);
                pingOutputElement.innerHTML = `PING ${hostToPing} (127.0.0.1): 56 data bytes`;
                (async () => {
                    for (let i = 1; i <= 4; i++) {
                        await delay(800);
                        const time = (Math.random() * 20 + 10).toFixed(2);
                        pingOutputElement.innerHTML += `<br>64 bytes from 127.0.0.1: icmp_seq=${i} ttl=64 time=${time} ms`;
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                    createNewCommandLine();
                })();
                return null;
            }
            case 'sl': {
                const frames = [
`      ____
 ____/____\\___
|  _  _  _   |====,
|-| || || |- |    |
|_|_||_||_|__|____|`,
`        ____
 ____/____\\___
|  _  _  _   |====,
|-| || || |- |    |
|_|_||_||_|__|____|`,
`            ____
 ____/____\\___
|  _  _  _   |====,
|-| || || |- |    |
|_|_||_||_|__|____|`
                ];
                const out = document.createElement('div');
                out.className = 'shell-line command-output';
                interactiveContent.appendChild(out);
                let i = 0, ticks = 0;
                const id = setInterval(() => {
                    out.innerHTML = `<pre>${frames[i]}</pre>`;
                    i = (i + 1) % frames.length;
                    ticks++;
                    window.scrollTo(0, document.body.scrollHeight);
                    if (ticks > 12) { clearInterval(id); createNewCommandLine(); }
                }, 150);
                return null;
            }
            
	    case 'nuclearwar': {
  const missiles = parseInt(args[0] || '180', 10);
  const waves    = parseInt(args[1] || '6', 10);
  const seed     = args[2] !== undefined ? parseInt(args[2], 10) : null;
  try {
    const res = await fetch('/api/nuclearwar', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ missiles, waves, seed })
    });
    let data = null;
    try { data = await res.json(); } catch(e){ /* JSON inválido */ }
    if (!res.ok || !data || !Array.isArray(data.events)) {
      const detail = data && data.error ? data.error : `HTTP ${res.status}`;
      return { content: `<pre>Error: backend devolvió timeline inválido.\n${detail}</pre>`, type: 'html' };
    }
    renderNuclearWar(data, { missiles, waves });
    return { content: '<pre>Launching global thermonuclear war simulation...</pre>', type: 'html' };
  } catch (e) {
    return { content: `<pre>Error de red: ${String(e)}</pre>`, type:'html' };
  }
}

	    case 'mc': { openMcOverlay(); return null; }
            case 'traceroute': {
                const targetHost = args[0] || 'omnicorp.net';
                const hops = [
                    '1  gateway (192.168.1.1)',
                    '2  level3-node.alicante.es.net (84.116.133.1)',
                    '3  ae-11-11.car2.Madrid1.Level3.net (4.69.137.1)',
                    '4  gblx.edge7.Frankfurt1.Level3.net (213.19.183.130)',
                    '5  * * * Request timed out.',
                    '6  omnicorp-ice-breaker.proxy.net (12.129.247.10)',
                    '7  omnicorp.net (12.129.247.2)'
                ];
                const traceOutputElement = document.createElement('div');
                traceOutputElement.className = 'shell-line command-output';
                interactiveContent.appendChild(traceOutputElement);
                traceOutputElement.innerHTML = `traceroute to ${targetHost}, 30 hops max, 60 byte packets`;
                (async () => {
                    for (const hop of hops) {
                        await delay(1000);
                        const latency1 = (Math.random() * 50 + 20).toFixed(3);
                        const latency2 = (Math.random() * 50 + 20).toFixed(3);
                        traceOutputElement.innerHTML += `<br>${hop}  ${latency1} ms  ${latency2} ms`;
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                    createNewCommandLine();
                })();
                return null;
            }
            default:
                if (command) return { content: `bash: command not found: ${command}`, type: 'text' };
                return null;
        }
    }

    async function processPyTrekCommand(command) {
        try {
            const response = await fetch('/api/pytrek', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF_TOKEN },
                body: JSON.stringify({ command }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                pytrekInProgress = false;
                return { content: `Server error: ${errorText}`, type: 'text' };
            }
            const data = await response.json();
            if (data.game_over) pytrekInProgress = false;
            return { content: `<pre>${data.output}</pre>`, type: 'html' };
        } catch (error) {
            pytrekInProgress = false;
            return { content: `Connection error: ${error.message}`, type: 'text' };
        }
    }
    async function processFirewallCommand(command) {
        if (command.trim() === 'exit') firewallInProgress = false;
        try {
            const response = await fetch('/api/firewall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': CSRF_TOKEN },
                body: JSON.stringify({ command }),
            });
            if (!response.ok) {
                firewallInProgress = false;
                return { content: `Server error: ${await response.text()}`, type: 'text' };
            }
            const data = await response.json();
            if (data.game_over) firewallInProgress = false;
            return { content: `<pre>${data.output}</pre>`, type: 'html' };
        } catch (error) {
            firewallInProgress = false;
            return { content: `Connection error: ${error.message}`, type: 'text' };
        }
    }

    function autocomplete(inputElement) {
        const currentText = inputElement.value;
        const parts = currentText.split(' ');
        const textToComplete = parts[parts.length - 1];
        const completingCommand = parts.length === 1;
        let potentialItems = completingCommand ? Object.keys(fileSystem['/home/visitor/bin']) : Object.keys(fileSystem[currentDirectory] || {});
        const matches = potentialItems.filter(item => item.startsWith(textToComplete));
        if (matches.length === 1) {
            parts[parts.length - 1] = matches[0];
            inputElement.value = parts.join(' ') + ' ';
        } else if (matches.length > 1) {
            const outputContainer = document.createElement('div');
            outputContainer.className = 'shell-line command-output';
            outputContainer.style.color = 'var(--secondary-text-color)';
            outputContainer.textContent = matches.join('   ');
            inputElement.parentElement.insertAdjacentElement('afterend', outputContainer);
        }
    }

    function formatOutputForHTML(text) {
        const escapedText = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const urlRegex = /(https?:\/\/[^\s<]+)/g;
        return escapedText.replace(urlRegex, url => `<a href="${url.replace(/&amp;/g, "&")}" target="_blank">${url}</a>`).replace(/\n/g, '<br>');
    }

    function runRabbitAnimation() {
        const rootStyles = getComputedStyle(document.documentElement);
        rabbitAnimationElement.style.color = rootStyles.getPropertyValue('--text-color').trim();
        rabbitAnimationElement.style.textShadow = `0 0 5px ${rootStyles.getPropertyValue('--glow-color').trim()}`;
        rabbitAnimationElement.classList.remove('hidden');
        rabbitAnimationElement.style.animation = 'runAndFade 4s ease-in-out forwards';
        rabbitAnimationElement.addEventListener('animationend', () => {
            rabbitAnimationElement.classList.add('hidden');
            rabbitAnimationElement.style.animation = '';
            createNewCommandLine();
        }, { once: true });
    }

    function decodeContact(dataFragment, keyBinary) {
        const key = keyBinary.match(/.{1,8}/g).map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
        const encryptedBytes = dataFragment.split('\\x').slice(1).map(hex => parseInt(hex, 16));
        let extendedKey = key.repeat(Math.ceil(encryptedBytes.length / key.length)).substring(0, encryptedBytes.length);
        let decrypted = '';
        for (let i = 0; i < encryptedBytes.length; i++) decrypted += String.fromCharCode(encryptedBytes[i] ^ extendedKey.charCodeAt(i));
        return decrypted;
    }

    function startMatrixAnimation() {
        matrixCanvas.classList.remove('hidden');
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
        const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const alphabet = katakana + latin + nums;
        const fontSize = 16;
        const columns = matrixCanvas.width / fontSize;
        const rainDrops = [];
        for (let x = 0; x < columns; x++) rainDrops[x] = 1;
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
                if (rainDrops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) rainDrops[i] = 0;
                rainDrops[i]++;
            }
        };
        matrixInterval = setInterval(draw, 33);
        window.addEventListener('keydown', exitMatrixOnEscape);
    }
    function exitMatrixOnEscape(event) { if (event.key === 'Escape' || event.key === 'q') stopMatrixAnimation(); }
    function stopMatrixAnimation() {
        if (matrixInterval) {
            clearInterval(matrixInterval);
            matrixInterval = null;
            matrixCanvas.classList.add('hidden');
            window.removeEventListener('keydown', exitMatrixOnEscape);
            createNewCommandLine();
        }
    }

    async function toggleMusic() {
        try {
            if (!audioSynth) {
                await Tone.start();
                audioSynth = new Tone.FMSynth({
                    modulationIndex: 20,
                    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.8 },
                    modulation: { type: "square" }
                }).toDestination();
                const notes = ["C4", "E4", "G4", "A#3", "G4", "E4"];
                let step = 0;
                const loop = new Tone.Loop((time) => {
                    audioSynth.triggerAttackRelease(notes[step % notes.length], "8n", time);
                    step++;
                }, "8n");
                loop.start(0);
                Tone.Transport.start();
            }
            if (!isPlayingMusic) { isPlayingMusic = true; Tone.Transport.start(); return { content: "🎶 Cyberpunk loop started.", type: "text" }; }
            else { isPlayingMusic = false; Tone.Transport.stop(); return { content: "⏹ Music stopped.", type: "text" }; }
        } catch (err) { return { content: "Error: Could not initialize audio synth.", type: "text" }; }
    }

    function enterEditorMode(filename) {
        editorMode = true;
        interactiveContent.style.display = 'none';
        const editorWrapper = document.createElement('div');
        editorWrapper.id = 'editor-wrapper';
        const fileContent = (fileSystem[currentDirectory] && fileSystem[currentDirectory][filename]) ? fileSystem[currentDirectory][filename].content : '';
        editorWrapper.innerHTML = `
            <div style="background-color: var(--text-color); color: var(--bg-color); padding: 0 5px; font-family: 'Fira Mono', monospace;">
                Nano Editor 1.0 | ${currentLang==='es'?'Fichero':'File'}: ${filename}
            </div>
            <textarea id="editor-textarea" spellcheck="false" style="width: 100%; height: 80vh; background: transparent; color: var(--text-color); border: none; outline: none; font-family: inherit; font-size: inherit;">${fileContent}</textarea>
            <div style="background-color: var(--text-color); color: var(--bg-color); padding: 0 5px; font-family: 'Fira Mono', monospace;">
                ^S/⌘S ${currentLang==='es'?'Guardar':'Save'} | ^X/⌘X ${currentLang==='es'?'Salir':'Exit'} | ESC ${currentLang==='es'?'Cerrar':'Close'}
            </div>
        `;
        const mountHost = document.getElementById('terminal') || document.getElementById('app') || document.body;
        mountHost.appendChild(editorWrapper);
        const textarea = document.getElementById('editor-textarea');
        textarea.value = fileContent;
        textarea.focus();
        textarea.addEventListener('keydown', handleEditorKeys);
        document.addEventListener('keydown', globalEditorEsc, { once: false });
    }
    function globalEditorEsc(e) { if (!editorMode) return; if (e.key === 'Escape') { e.preventDefault(); exitEditorMode(); } }
    function handleEditorKeys(e) {
        const isMod = e.ctrlKey || e.metaKey;
        const k = (e.key || '').toLowerCase();
        if (isMod && (k === 's' || k === 'x')) {
            e.preventDefault();
            const textarea = document.getElementById('editor-textarea');
            if (k === 's') {
                if (!fileSystem[currentDirectory]) fileSystem[currentDirectory] = {};
                fileSystem[currentDirectory][editorTargetFile] = { type: 'file', content: textarea.value };
            }
            if (k === 'x') exitEditorMode();
        } else if (k === 'escape') { e.preventDefault(); exitEditorMode(); }
    }
    function exitEditorMode() {
        editorMode = false;
        const wrapper = document.getElementById('editor-wrapper');
        if (wrapper) wrapper.remove();
        interactiveContent.style.display = 'block';
        document.removeEventListener('keydown', globalEditorEsc, { once: false });
        createNewCommandLine();
    }

    function openMcOverlay() {
      if (!window.__mc) window.__mc = {};
      const mc = window.__mc;
      if (mc.open) return;
      mc.open = true;
      mc.activePane = 'left';
      mc.selection = { left: 0, right: 0 };
      mc.cwd = { left: currentDirectory, right: currentDirectory };

      const ov = document.createElement('div');
      ov.className = 'mc-overlay';
      ov.innerHTML = `
        <div class="mc-window" role="dialog" aria-modal="true">
          <div class="mc-titlebar">
            <div class="title">${t('mc_title')}</div>
            <div class="path"></div>
          </div>
          <div class="mc-panels">
            <div class="mc-panel mc-left">
              <div class="mc-panel-header">
                <div>${t('mc_left')}</div>
                <div class="badge"></div>
              </div>
              <div class="mc-panel-body" tabindex="0"></div>
            </div>
            <div class="mc-panel mc-right">
              <div class="mc-panel-header">
                <div>${t('mc_right')}</div>
                <div class="badge"></div>
              </div>
              <div class="mc-panel-body" tabindex="0"></div>
            </div>
            <div class="mc-preview">
              <div class="mc-panel-header">
                <div>${t('mc_preview')}</div>
                <div class="badge"></div>
              </div>
              <div class="mc-preview-body"><pre>${t('mc_empty')}</pre></div>
            </div>
          </div>
          <div class="mc-statusbar">
            <div class="hint">${t('mc_status_hint')}</div>
          </div>
          <div class="mc-keybar">
            <div class="mc-key"><kbd>F3</kbd>View</div>
            <div class="mc-key"><kbd>F4</kbd>Edit</div>
            <div class="mc-key"><kbd>F5</kbd>Copy</div>
            <div class="mc-key"><kbd>F6</kbd>Rename</div>
            <div class="mc-key"><kbd>F7</kbd>New</div>
            <div class="mc-key"><kbd>F8</kbd>Delete</div>
            <div class="mc-key"><kbd>Tab</kbd>Pane</div>
            <div class="mc-key"><kbd>/</kbd>Search</div>
            <div class="mc-key"><kbd>Enter</kbd>Open</div>
            <div class="mc-key"><kbd>Esc</kbd>Exit</div>
          </div>
        </div>
        <div class="mc-quicksearch"><input type="text" placeholder="Search..." /></div>
      `;
      document.body.appendChild(ov);
      mc.el = ov;
      mc.render = renderMc;
      mc.close = closeMc;
      mc.handleKey = handleMcKey;
      mc.preview = previewMc;
      mc.refreshTitle = refreshTitle;

      ov.addEventListener('keydown', handleMcKey);
      renderMc();
      const paneBody = ov.querySelector(`.mc-${mc.activePane} .mc-panel-body`);
      paneBody && paneBody.focus();
    }
    function closeMc() {
      const mc = window.__mc;
      if (!mc || !mc.open) return;
      mc.open = false;
      mc.el.removeEventListener('keydown', mc.handleKey);
      mc.el.remove();
      createNewCommandLine();
    }
    function listCwdEntries(dirPath) {
      const items = fileSystem[dirPath];
      if (!items) return [];
      const entries = Object.keys(items).map(name => ({ name, type: items[name].type }));
      entries.sort((a,b)=> { if (a.type!==b.type) return a.type==='directory' ? -1 : 1; return a.name.localeCompare(b.name); });
      return entries;
    }
    function renderPanel(pane, entries, selIndex) {
      const mc = window.__mc;
      const paneEl = mc.el.querySelector(`.mc-${pane}`);
      const body = paneEl.querySelector('.mc-panel-body');
      const headerBadge = paneEl.querySelector('.badge');
      const cwd = mc.cwd[pane];
      headerBadge.textContent = cwd.replace('/home/visitor','~');
      body.innerHTML = '';
      const showParent = (cwd !== '/home/visitor');
      const items = showParent ? [{ name:'..', type:'directory_up'}] : [];
      items.push(...entries);
      if (!items.length) {
        const row = document.createElement('div');
        row.className = 'mc-item';
        row.innerHTML = `<span class="icon">·</span><span class="name">${t('mc_empty')}</span><span class="meta"></span>`;
        body.appendChild(row);
        return;
      }
      items.forEach((it, idx) => {
        const row = document.createElement('div');
        row.className = 'mc-item' + (idx===selIndex? ' selected':'');
        const icon = it.type==='directory' || it.type==='directory_up' ? '📁' : (it.type==='executable' ? '⚙️' : '📄');
        const meta = it.type==='directory_up' ? '' : (it.type==='directory' ? '/' : (it.type==='executable' ? '*' : ''));
        row.innerHTML = `<span class="icon">${icon}</span><span class="name">${it.name}</span><span class="meta">${meta}</span>`;
        body.appendChild(row);
      });
      refreshTitle();
      if (mc.activePane === pane) {
        const entriesWithParent = items;
        const cur = entriesWithParent[selIndex] || null;
        previewMc(pane, cur);
      }
    }
    function refreshTitle() {
      const mc = window.__mc;
      if (!mc || !mc.el) return;
      const titlePath = mc.el.querySelector('.mc-titlebar .path');
      const left = mc.cwd.left.replace('/home/visitor','~');
      const right = mc.cwd.right.replace('/home/visitor','~');
      titlePath.innerHTML = `${t('mc_left')}: ${left} | ${t('mc_right')}: ${right}`;
      mc.el.querySelector('.mc-titlebar .title').textContent = t('mc_title');
      mc.el.querySelector('.mc-left .mc-panel-header div:first-child').textContent = t('mc_left');
      mc.el.querySelector('.mc-right .mc-panel-header div:first-child').textContent = t('mc_right');
      mc.el.querySelector('.mc-preview .mc-panel-header div:first-child').textContent = t('mc_preview');
      mc.el.querySelector('.mc-statusbar .hint').textContent = t('mc_status_hint');
    }
    function renderMc() {
      const mc = window.__mc;
      if (!mc || !mc.el) return;
      const leftEntries = listCwdEntries(mc.cwd.left);
      const rightEntries = listCwdEntries(mc.cwd.right);
      renderPanel('left', leftEntries, mc.selection.left);
      renderPanel('right', rightEntries, mc.selection.right);
      mc.el.querySelector('.mc-left .mc-panel-body').tabIndex = 0;
      mc.el.querySelector('.mc-right .mc-panel-body').tabIndex = 0;
      const focusBody = mc.el.querySelector(`.mc-${mc.activePane} .mc-panel-body`);
      focusBody && focusBody.focus();
    }
    function previewMc(pane, entry) {
      const mc = window.__mc;
      const prev = mc.el.querySelector('.mc-preview-body');
      if (!entry) { prev.innerHTML = `<pre>${t('mc_empty')}</pre>`; return; }
      if (entry.type === 'directory' || entry.type === 'directory_up') {
        prev.innerHTML = `<pre>${entry.name}${entry.type==='directory' ? '/' : ''}</pre>`;
        return;
      }
      const cwd = mc.cwd[pane];
      const map = fileSystem[cwd] || {};
      const meta = map[entry.name];
      if (meta && meta.type==='file') {
        let content = String(meta.content||'');
        if (content.length > 2000) content = content.slice(0,2000) + '\n…';
        prev.innerHTML = `<pre>${content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>`;
      } else { prev.innerHTML = `<pre>${t('mc_empty')}</pre>`; }
    }
    function openEntry(pane) {
      const mc = window.__mc;
      const cwd = mc.cwd[pane];
      const entries = listCwdEntries(cwd);
      const hasParent = cwd !== '/home/visitor';
      const items = hasParent ? [{ name:'..', type:'directory_up'}].concat(entries) : entries;
      const sel = mc.selection[pane];
      const cur = items[sel];
      if (!cur) return;
      if (cur.type === 'directory_up') {
        const parent = cwd.substring(0, cwd.lastIndexOf('/')) || '/home/visitor';
        mc.cwd[pane] = parent; mc.selection[pane] = 0;
      } else if (cur.type === 'directory') {
        mc.cwd[pane] = `${cwd}/${cur.name}`; mc.selection[pane] = 0;
      } else {
        closeMc();
        editorTargetFile = cur.name;
        currentDirectory = cwd;
        enterEditorMode(editorTargetFile);
        return;
      }
      renderMc();
    }
    function moveSelection(pane, delta) {
      const mc = window.__mc;
      const cwd = mc.cwd[pane];
      const entries = listCwdEntries(cwd);
      const hasParent = cwd !== '/home/visitor';
      const max = (hasParent?1:0) + entries.length - 1;
      mc.selection[pane] = Math.max(0, Math.min(max, mc.selection[pane] + delta));
      renderMc();
    }
    function copyBetweenPanes() {
      const mc = window.__mc;
      const srcPane = mc.activePane;
      const dstPane = srcPane === 'left' ? 'right' : 'left';
      const cwdSrc = mc.cwd[srcPane];
      const cwdDst = mc.cwd[dstPane];
      const entries = listCwdEntries(cwdSrc);
      const hasParent = cwdSrc !== '/home/visitor';
      const items = hasParent ? [{ name:'..', type:'directory_up'}].concat(entries) : entries;
      const cur = items[mc.selection[srcPane]];
      if (!cur || cur.type !== 'file') return;
      const meta = fileSystem[cwdSrc][cur.name];
      if (!fileSystem[cwdDst]) fileSystem[cwdDst] = {};
      fileSystem[cwdDst][cur.name] = { type:'file', content: meta.content };
      renderMc();
    }
    function handleMcKey(e) {
      const mc = window.__mc;
      if (!mc || !mc.open) return;
      const key = e.key;
      if (key === 'Escape') { e.preventDefault(); closeMc(); return; }
      if (key === 'Tab') { e.preventDefault(); mc.activePane = mc.activePane==='left'?'right':'left'; renderMc(); return; }
      if (key === 'ArrowUp') { e.preventDefault(); moveSelection(mc.activePane, -1); return; }
      if (key === 'ArrowDown') { e.preventDefault(); moveSelection(mc.activePane, +1); return; }
      if (key === 'PageUp') { e.preventDefault(); moveSelection(mc.activePane, -5); return; }
      if (key === 'PageDown') { e.preventDefault(); moveSelection(mc.activePane, +5); return; }
      if (key === 'Enter') { e.preventDefault(); openEntry(mc.activePane); return; }
      if (key === 'F5') { e.preventDefault(); copyBetweenPanes(); return; }
      if (key === 'F3') { e.preventDefault(); return; }
      if (key === 'F4') { e.preventDefault(); return; }
      if (key === 'F8') { e.preventDefault(); return; }
      if (key === 'F7') { e.preventDefault(); return; }
      if (key === 'F6') { e.preventDefault(); return; }
    }

    function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}); // DOMContentLoaded

})(); // IIFE

