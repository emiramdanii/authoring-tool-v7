// ═══════════════════════════════════════════════════════════════
// BASE-CSS.TS — Shared CSS for the MPI export HTML
// Extracted from export-html.ts into a reusable module.
// The getBaseCSS() function returns the full CSS string with
// optional variable overrides for theming.
// ═══════════════════════════════════════════════════════════════

// ── CSS Variable Interface ──────────────────────────────────────
export interface CSSVars {
  '--bg': string;
  '--bg2': string;
  '--card': string;
  '--border': string;
  '--y': string;
  '--c': string;
  '--r': string;
  '--p': string;
  '--g': string;
  '--o': string;
  '--accent': string;
  '--text': string;
  '--muted': string;
  '--rad': string;
}

// ── Default variable values ─────────────────────────────────────
const DEFAULT_VARS: CSSVars = {
  '--bg': '#0e1c2f',
  '--bg2': '#13243a',
  '--card': '#182d45',
  '--border': 'rgba(255,255,255,.09)',
  '--y': '#f9c12e',
  '--c': '#3ecfcf',
  '--r': '#ff6b6b',
  '--p': '#a78bfa',
  '--g': '#34d399',
  '--o': '#fb923c',
  '--accent': '#f9c12e',
  '--text': '#e8f2ff',
  '--muted': '#6e90b5',
  '--rad': '16px',
};

// ── Build :root declaration from vars ───────────────────────────
function buildRootBlock(vars: CSSVars): string {
  const entries = Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  return `:root{${entries};}`;
}

// ═══════════════════════════════════════════════════════════════
// SHARED CSS — all styles extracted from export-html.ts
// ═══════════════════════════════════════════════════════════════

const SHARED_CSS = `\
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;}

/* ── Screen system ────────────────────────────── */
.screen{display:none;min-height:100vh;animation:fadeIn .4s ease;}
.screen.active{display:flex;flex-direction:column;}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}

/* ── Navbar ───────────────────────────────────── */
.navbar{background:rgba(14,28,47,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:10px 18px;display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:200;}
.nav-logo{font-family:'Fredoka One',cursive;font-size:.95rem;color:var(--y);white-space:nowrap;}
.nav-prog{flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin:0 8px;}
.nav-prog-fill{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;transition:width .5s;}
.nav-score{font-size:.8rem;font-weight:800;color:var(--y);white-space:nowrap;}

/* ── Layout ───────────────────────────────────── */
.main{flex:1;padding:22px 16px;max-width:860px;width:100%;margin:0 auto;}

/* ── Card ─────────────────────────────────────── */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--rad);padding:20px;}

/* ── Buttons ──────────────────────────────────── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 24px;border-radius:99px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.9rem;border:none;cursor:pointer;transition:all .18s;}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.3);}
.btn-y{background:var(--y);color:#0e1c2f;}
.btn-c{background:var(--c);color:#0e1c2f;}
.btn-g{background:var(--g);color:#0e1c2f;}
.btn-p{background:var(--p);color:#fff;}
.btn-r{background:var(--r);color:#fff;}
.btn-o{background:var(--o);color:#0e1c2f;}
.btn-ghost{background:rgba(255,255,255,.08);color:var(--text);border:1px solid var(--border);}
.btn-sm{padding:7px 15px;font-size:.78rem;}
.btn-row{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px;}
.btn-center{justify-content:center;}

/* ── Chip ─────────────────────────────────────── */
.chip{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:99px;font-size:.74rem;font-weight:800;}

/* ── Typography ───────────────────────────────── */
.h2{font-family:'Fredoka One',cursive;font-size:1.6rem;line-height:1.2;}
.sub{color:var(--muted);font-size:.86rem;line-height:1.6;}
.hl{color:var(--y);}

/* ── Spacing helpers ──────────────────────────── */
.mt8{margin-top:8px;}
.mt14{margin-top:14px;}
.mt20{margin-top:20px;}

/* ── Score popup ──────────────────────────────── */
.score-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--y);color:#0e1c2f;border-radius:16px;padding:14px 26px;font-family:'Fredoka One',cursive;font-size:1.6rem;animation:popIn .3s ease;z-index:999;pointer-events:none;}
@keyframes popIn{from{transform:translate(-50%,-50%) scale(.4);opacity:0;}to{transform:translate(-50%,-50%) scale(1);opacity:1;}}

/* ── Nav scene label ──────────────────────────── */
.nav-scene{font-size:.7rem;color:var(--muted);font-weight:700;white-space:nowrap;}

/* ── Confetti ─────────────────────────────────── */
.conf{position:fixed;border-radius:2px;animation:confFall linear both;pointer-events:none;z-index:9999;}
@keyframes confFall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}}
#confWrap{position:fixed;inset:0;pointer-events:none;z-index:9998;}

/* ── Responsive ───────────────────────────────── */
@media(max-width:540px){
.puzzle-opts{grid-template-columns:1fr;}
}
`;

// ═══════════════════════════════════════════════════════════════
// getBaseCSS — returns the complete shared CSS string
// Accepts optional custom variable overrides for theming.
// ═══════════════════════════════════════════════════════════════
export function getBaseCSS(customVars?: Partial<CSSVars>): string {
  const vars: CSSVars = { ...DEFAULT_VARS, ...customVars };
  const rootBlock = buildRootBlock(vars);
  return `${rootBlock}\n${SHARED_CSS}`;
}

// ── Re-export default vars for direct access ────────────────────
export { DEFAULT_VARS };
