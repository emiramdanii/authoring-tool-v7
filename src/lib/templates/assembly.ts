// ═══════════════════════════════════════════════════════════════
// ASSEMBLY.TS — Assembly pipeline for MPI template system
// Combines individual screen templates into a complete standalone
// HTML document with shared CSS, JS, navigation, and fonts.
// ═══════════════════════════════════════════════════════════════

import { getBaseCSS, type CSSVars } from './engine/base-css';
import { getBaseJS, type BaseJSData } from './engine/base-js';
import { renderNavbarCSS, renderSharedNavbarHTML } from './engine/navbar-html';
import { renderTemplateHTML } from '../template-registry';
import type { TemplateId, ScreenSlotData } from './engine/slot-types';

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

/** A single screen in the assembly pipeline */
export interface AssemblyScreen {
  /** Unique DOM id for this screen (e.g. 's-cover') */
  id: string;
  /** Which template to use */
  templateId: TemplateId;
  /** Slot data for the template */
  data: ScreenSlotData;
  /** Optional navbar scene label for this screen (shown in navScene element) */
  navLabel?: string;
}

/** Configuration for the full HTML assembly */
export interface AssemblyConfig {
  /** Document title (shown in browser tab) */
  title: string;
  /** Ordered list of screens to include */
  screens: AssemblyScreen[];
  /** Optional CSS variable overrides for theming */
  cssVars?: Partial<CSSVars>;
  /** Optional navbar configuration overrides */
  navbarConfig?: Record<string, unknown>;
  /** Whether to include confetti library/scripts (default: true) */
  includeConfetti?: boolean;
  /** Logo text displayed in the shared navbar (e.g. '📚 MPI', '🧑‍🤝‍🧑 Hakikat Norma') */
  navbarLogo?: string;
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Build screen ID list for JS navigation
// ═══════════════════════════════════════════════════════════════

function buildScreenIds(screens: AssemblyScreen[]): string[] {
  return screens.map((s) => s.id);
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Strip per-screen navbar from screen HTML
// ═══════════════════════════════════════════════════════════════

/**
 * Remove duplicate `<nav class="navbar">...</nav>` from a screen's HTML.
 *
 * Each screen template may include its own navbar, but the assembly pipeline
 * places a single shared navbar at the top of the document. This function
 * strips the per-screen navbar to avoid duplicates.
 *
 * Handles both multi-line nav blocks and single-line nav elements.
 */
function stripNavbarFromScreen(html: string): string {
  // Match <nav class="navbar"...>...</nav> including multiline content.
  // The [\s\S]*? ensures non-greedy matching across newlines.
  return html.replace(/<nav\s+class="navbar[^"]*"[^>]*>[\s\S]*?<\/nav>/g, '');
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: assembleHTML
// ═══════════════════════════════════════════════════════════════

/**
 * Assemble a complete standalone HTML document from an AssemblyConfig.
 *
 * Produces a self-contained HTML file with:
 * - DOCTYPE and proper `<head>` with meta, title, Google Fonts
 * - Shared CSS from getBaseCSS()
 * - Navbar CSS from renderNavbarCSS()
 * - Confetti wrapper div in the body
 * - Each screen rendered via its template's renderHTML function
 * - First screen gets `class="screen active"`
 * - Shared JS from getBaseJS() for screen navigation + scoring + confetti
 * - Each template's inline <script> handles its own interactivity
 *
 * @param config - Assembly configuration with title, screens, and optional theming
 * @returns Complete HTML document string
 */
export function assembleHTML(config: AssemblyConfig): string {
  const { title, screens, cssVars, includeConfetti = true, navbarLogo } = config;

  if (!screens.length) {
    return '<!DOCTYPE html><html><body><p>No screens to assemble.</p></body></html>';
  }

  // ── 1. Build CSS ──────────────────────────────────────────────
  const baseCSS = getBaseCSS(cssVars);
  const navbarCSS = renderNavbarCSS();

  // ── 2. Build shared navbar HTML ───────────────────────────────
  const sharedNavbarHTML = renderSharedNavbarHTML(navbarLogo);

  // ── 3. Build screen HTML ──────────────────────────────────────
  const screenIds = buildScreenIds(screens);
  const screensHTML = screens
    .map((screen, index) => {
      const isActive = index === 0;
      let html = renderTemplateHTML(screen.templateId, screen.data, screen.id);

      // Strip per-screen duplicate navbar — the shared navbar handles all nav
      html = stripNavbarFromScreen(html);

      // Override data-nav-label attribute if navLabel is provided in config.
      // Templates already include a default data-nav-label, but the assembly
      // config can override it per-screen for customization.
      if (screen.navLabel) {
        // If template already has data-nav-label="...", replace its value
        html = html.replace(
          /data-nav-label="[^"]*"/,
          `data-nav-label="${escapeHTML(screen.navLabel)}"`,
        );
      }

      // First screen gets "active" class; others remain hidden by CSS
      if (isActive) {
        html = html.replace(
          'class="screen"',
          'class="screen active"',
        );
      }
      return html;
    })
    .join('\n');

  // ── 4. Build JS ───────────────────────────────────────────────
  const jsData: BaseJSData = {
    screens: screenIds,
  };

  const baseJS = getBaseJS(jsData);

  // ── 5. Assemble complete HTML ─────────────────────────────────
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
${baseCSS}
  </style>
${navbarCSS}
</head>
<body>
  <div id="confWrap" style="position:fixed;inset:0;pointer-events:none;z-index:9998"></div>
${sharedNavbarHTML}
${screensHTML}
  <script>
${baseJS}
  </script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// HELPER EXPORT: assembleSingleScreen
// ═══════════════════════════════════════════════════════════════

/**
 * Assemble a single-page HTML document for just one screen template.
 * No navigation, no multi-screen JS — just a standalone preview.
 *
 * @param templateId - Which template to render
 * @param data       - Slot data for the template
 * @param cssVars    - Optional CSS variable overrides
 * @returns Complete single-page HTML document string
 */
export function assembleSingleScreen(
  templateId: TemplateId,
  data: ScreenSlotData,
  cssVars?: Partial<CSSVars>,
): string {
  const baseCSS = getBaseCSS(cssVars);
  const navbarCSS = renderNavbarCSS();

  // Render the screen with "active" class so it's visible
  const screenId = 's-' + templateId;
  let html = renderTemplateHTML(templateId, data, screenId);

  // Strip per-screen duplicate navbar (shared navbar not needed for single-screen preview)
  html = stripNavbarFromScreen(html);

  html = html.replace('class="screen"', 'class="screen active"');

  // Minimal JS for single-screen preview
  const jsData: BaseJSData = {
    screens: [screenId],
  };
  const baseJS = getBaseJS(jsData);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(templateId)} — Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
${baseCSS}
  </style>
${navbarCSS}
</head>
<body>
  <div id="confWrap" style="position:fixed;inset:0;pointer-events:none;z-index:9998"></div>
${html}
  <script>
${baseJS}
  </script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL: HTML escape for title and meta content
// ═══════════════════════════════════════════════════════════════

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
