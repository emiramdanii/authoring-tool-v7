// ═══════════════════════════════════════════════════════════════
// NAVBAR-HTML.TS — Navbar HTML generator for MPI student export
// Generates the top navigation bar with progress, score, and
// prev/next buttons, supporting multiple visual styles.
// ═══════════════════════════════════════════════════════════════

// ── Navbar Style Type ─────────────────────────────────────────
export type NavbarStyle = 'colorful' | 'minimal' | 'glass';

// ── Navbar Config Interface ───────────────────────────────────
export interface NavbarConfig {
  /** Whether to show the navbar at all */
  showNavbar: boolean;
  /** Whether to show prev/next navigation buttons */
  showPrevNext: boolean;
  /** Whether to show the score display */
  showScore: boolean;
  /** Whether to show the progress bar */
  showProgress: boolean;
  /** Visual style variant */
  navbarStyle: NavbarStyle;
  /** Logo / title text displayed on the left */
  logo: string;
  /** Current numeric score */
  score: number;
  /** Progress percentage (0-100) */
  progressPct: number;
}

// ── HTML Escaping ─────────────────────────────────────────────
function esc(str: string | number | null | undefined): string {
  if (str == null) return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Colorful Style (matches existing dark theme) ──────────────
function renderColorfulNavbar(
  config: NavbarConfig,
  screenId: string,
  prevScreenId?: string,
  nextScreenId?: string,
): string {
  if (!config.showNavbar) return '';

  const logoHtml = `<span class="nav-logo">${esc(config.logo || 'Media')}</span>`;

  const progressHtml = config.showProgress
    ? `<div class="nav-prog"><div class="nav-prog-fill" style="width:${config.progressPct}%"></div></div>`
    : '';

  const scoreHtml = config.showScore
    ? `<span class="nav-score">${config.score} ⭐</span>`
    : '';

  const prevBtn = config.showPrevNext && prevScreenId
    ? `<button class="btn btn-ghost btn-sm nav-prev" onclick="goScreen('${esc(prevScreenId)}')" aria-label="Layar sebelumnya">←</button>`
    : '';

  const nextBtn = config.showPrevNext && nextScreenId
    ? `<button class="btn btn-y btn-sm nav-next" onclick="goScreen('${esc(nextScreenId)}')" aria-label="Layar berikutnya">→</button>`
    : '';

  const navButtons = config.showPrevNext && (prevScreenId || nextScreenId)
    ? `<div class="nav-btns">${prevBtn}${nextBtn}</div>`
    : '';

  return `<nav class="navbar" data-screen="${esc(screenId)}">
  ${logoHtml}${progressHtml}${scoreHtml}${navButtons}
</nav>`;
}

// ── Minimal Style (lighter visual weight) ─────────────────────
function renderMinimalNavbar(
  config: NavbarConfig,
  screenId: string,
  prevScreenId?: string,
  nextScreenId?: string,
): string {
  if (!config.showNavbar) return '';

  const logoHtml = `<span class="nav-logo nav-logo--minimal">${esc(config.logo || 'Media')}</span>`;

  const progressHtml = config.showProgress
    ? `<div class="nav-prog nav-prog--minimal"><div class="nav-prog-fill nav-prog-fill--minimal" style="width:${config.progressPct}%"></div></div>`
    : '';

  const scoreHtml = config.showScore
    ? `<span class="nav-score nav-score--minimal">${config.score} ⭐</span>`
    : '';

  const prevBtn = config.showPrevNext && prevScreenId
    ? `<button class="nav-btn-minimal nav-btn-minimal--prev" onclick="goScreen('${esc(prevScreenId)}')" aria-label="Layar sebelumnya">‹</button>`
    : '';

  const nextBtn = config.showPrevNext && nextScreenId
    ? `<button class="nav-btn-minimal nav-btn-minimal--next" onclick="goScreen('${esc(nextScreenId)}')" aria-label="Layar berikutnya">›</button>`
    : '';

  const navButtons = config.showPrevNext && (prevScreenId || nextScreenId)
    ? `<div class="nav-btns-minimal">${prevBtn}${nextBtn}</div>`
    : '';

  return `<nav class="navbar navbar--minimal" data-screen="${esc(screenId)}">
  ${logoHtml}${progressHtml}${scoreHtml}${navButtons}
</nav>`;
}

// ── Glass Style (backdrop-filter blur) ────────────────────────
function renderGlassNavbar(
  config: NavbarConfig,
  screenId: string,
  prevScreenId?: string,
  nextScreenId?: string,
): string {
  if (!config.showNavbar) return '';

  const logoHtml = `<span class="nav-logo nav-logo--glass">${esc(config.logo || 'Media')}</span>`;

  const progressHtml = config.showProgress
    ? `<div class="nav-prog nav-prog--glass"><div class="nav-prog-fill nav-prog-fill--glass" style="width:${config.progressPct}%"></div></div>`
    : '';

  const scoreHtml = config.showScore
    ? `<span class="nav-score nav-score--glass">${config.score} ⭐</span>`
    : '';

  const prevBtn = config.showPrevNext && prevScreenId
    ? `<button class="btn btn-ghost btn-sm nav-prev nav-prev--glass" onclick="goScreen('${esc(prevScreenId)}')" aria-label="Layar sebelumnya">←</button>`
    : '';

  const nextBtn = config.showPrevNext && nextScreenId
    ? `<button class="btn btn-sm nav-next nav-next--glass" onclick="goScreen('${esc(nextScreenId)}')" aria-label="Layar berikutnya">→</button>`
    : '';

  const navButtons = config.showPrevNext && (prevScreenId || nextScreenId)
    ? `<div class="nav-btns nav-btns--glass">${prevBtn}${nextBtn}</div>`
    : '';

  return `<nav class="navbar navbar--glass" data-screen="${esc(screenId)}">
  ${logoHtml}${progressHtml}${scoreHtml}${navButtons}
</nav>`;
}

// ── Main Export ────────────────────────────────────────────────
/**
 * Render the navbar HTML for a given screen.
 *
 * @param config      - Navbar configuration (style, flags, content)
 * @param screenId    - The current screen's DOM id (e.g. 's-cp')
 * @param prevScreenId - Optional previous screen id for the back button
 * @param nextScreenId - Optional next screen id for the forward button
 * @returns HTML string for the `<nav>` element (empty string if hidden)
 */
export function renderNavbarHTML(
  config: NavbarConfig,
  screenId: string,
  prevScreenId?: string,
  nextScreenId?: string,
): string {
  switch (config.navbarStyle) {
    case 'minimal':
      return renderMinimalNavbar(config, screenId, prevScreenId, nextScreenId);
    case 'glass':
      return renderGlassNavbar(config, screenId, prevScreenId, nextScreenId);
    case 'colorful':
    default:
      return renderColorfulNavbar(config, screenId, prevScreenId, nextScreenId);
  }
}

// ── Navbar CSS Generator ──────────────────────────────────────
/**
 * Generate the `<style>` block containing all navbar CSS.
 * This should be included once in the document `<head>`.
 *
 * Includes styles for all three variants (colorful, minimal, glass)
 * so the same stylesheet works regardless of which style is chosen.
 */
export function renderNavbarCSS(): string {
  return `<style>
/* ═══ NAVBAR BASE (shared) ═══ */
.navbar{padding:10px 18px;display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:200;}
.nav-logo{font-family:'Fredoka One',cursive;font-size:.95rem;white-space:nowrap;}
.nav-prog{flex:1;height:6px;border-radius:99px;overflow:hidden;margin:0 8px;}
.nav-prog-fill{height:100%;border-radius:99px;transition:width .5s;}
.nav-score{font-size:.8rem;font-weight:800;white-space:nowrap;}
.nav-btns{display:flex;gap:6px;align-items:center;flex-shrink:0;}

/* ═══ COLORFUL (default dark theme) ═══ */
.navbar{background:rgba(14,28,47,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.nav-logo{color:var(--y);}
.nav-prog{background:rgba(255,255,255,.08);}
.nav-prog-fill{background:linear-gradient(90deg,var(--y),var(--c));}
.nav-score{color:var(--y);}
.nav-prev,.nav-next{font-size:.78rem;}

/* ═══ MINIMAL ═══ */
.navbar--minimal{background:var(--bg2);border-bottom:1px solid var(--border);padding:8px 14px;}
.nav-logo--minimal{color:var(--text);font-size:.82rem;font-family:'Nunito',sans-serif;font-weight:800;letter-spacing:.02em;}
.nav-prog--minimal{background:rgba(255,255,255,.05);height:3px;}
.nav-prog-fill--minimal{background:var(--muted);height:100%;}
.nav-score--minimal{color:var(--muted);font-size:.72rem;font-weight:700;}
.nav-btns-minimal{display:flex;gap:4px;flex-shrink:0;}
.nav-btn-minimal{background:none;border:1px solid var(--border);color:var(--muted);width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;cursor:pointer;transition:all .15s;padding:0;line-height:1;}
.nav-btn-minimal:hover{border-color:var(--y);color:var(--y);}
.nav-btn-minimal--prev{font-size:1.1rem;}
.nav-btn-minimal--next{font-size:1.1rem;}

/* ═══ GLASS ═══ */
.navbar--glass{background:rgba(14,28,47,.45);backdrop-filter:blur(18px) saturate(1.6);-webkit-backdrop-filter:blur(18px) saturate(1.6);border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 1px 12px rgba(0,0,0,.2);}
.nav-logo--glass{color:var(--c);font-size:.9rem;}
.nav-prog--glass{background:rgba(255,255,255,.06);height:5px;border-radius:99px;}
.nav-prog-fill--glass{background:linear-gradient(90deg,var(--c),var(--p));height:100%;}
.nav-score--glass{color:var(--c);font-size:.78rem;}
.nav-btns--glass{gap:6px;}
.nav-prev--glass{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);}
.nav-next--glass{background:rgba(62,207,207,.85);color:#0e1c2f;border:none;}
.nav-next--glass:hover{background:var(--c);}
</style>`;
}

// ── Shared Navbar HTML Generator ──────────────────────────────
/**
 * Generate the single shared navbar HTML that sits at the top of the
 * assembled HTML document, right after `<body>`. This replaces the
 * per-screen duplicate navbars that were previously embedded inside
 * each screen template.
 *
 * The navbar is hidden initially (display:none) and shown/hidden
 * dynamically by the goScreen() function in base-js.ts.
 *
 * @param logoText - Text to display in the nav-logo span (e.g. '📚 MPI')
 * @returns HTML string for the shared `<nav>` element
 */
export function renderSharedNavbarHTML(logoText: string = '📚 MPI'): string {
  return `<nav class="navbar" id="navbar" style="display:none">
  <span class="nav-logo" id="navLogo">${esc(logoText)}</span>
  <div class="nav-prog"><div class="nav-prog-fill" id="progFill" style="width:0%"></div></div>
  <span class="nav-scene" id="navScene"></span>
  <span class="nav-score">🌟 <span id="navScore">0</span></span>
</nav>`;
}

// ── Default Config Helper ─────────────────────────────────────
/**
 * Create a NavbarConfig with sensible defaults.
 * All boolean flags default to true; progress and score default to 0.
 */
export function createDefaultNavbarConfig(
  overrides: Partial<NavbarConfig> = {},
): NavbarConfig {
  return {
    showNavbar: true,
    showPrevNext: true,
    showScore: true,
    showProgress: true,
    navbarStyle: 'colorful',
    logo: 'Media',
    score: 0,
    progressPct: 0,
    ...overrides,
  };
}
