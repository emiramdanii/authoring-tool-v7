// ═══════════════════════════════════════════════════════════════
// ASSEMBLY.TS — Assembly pipeline for MPI template system
// Combines individual screen templates into a complete standalone
// HTML document with shared CSS, JS, navigation, and fonts.
// ═══════════════════════════════════════════════════════════════

import { getBaseCSS, type CSSVars } from './engine/base-css';
import { getBaseJS, type BaseJSData } from './engine/base-js';
import { renderNavbarCSS } from './engine/navbar-html';
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
  /** Whether to include confetti library/scripts */
  includeConfetti?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Build the confetti script block
// ═══════════════════════════════════════════════════════════════

function getConfettiScript(): string {
  return `
// ── Confetti launcher ───────────────────────────────
function launchConfetti(){
  var w=document.getElementById('confWrap');
  if(!w)return;
  var cols=['#f9c12e','#3ecfcf','#ff6b6b','#a78bfa','#34d399','#fb923c'];
  for(var i=0;i<100;i++){
    var c=document.createElement('div');
    c.className='conf';
    var sz=4+Math.random()*9;
    c.style.cssText='left:'+Math.random()*100+'%;top:'+(-20-Math.random()*40)+'px;width:'+sz+'px;height:'+sz+'px;background:'+cols[Math.floor(Math.random()*cols.length)]+';border-radius:'+(Math.random()>.5?'50%':'2px')+';animation-duration:'+(2+Math.random()*3)+'s;animation-delay:'+(Math.random()*.8)+'s;';
    w.appendChild(c);
  }
  setTimeout(function(){w.innerHTML='';},6000);
}
`;
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Build screen ID list for JS navigation
// ═══════════════════════════════════════════════════════════════

function buildScreenIds(screens: AssemblyScreen[]): string[] {
  return screens.map((s) => s.id);
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Extract skenario data from screens for the base JS
// ═══════════════════════════════════════════════════════════════

function extractSkenarioData(screens: AssemblyScreen[]): unknown[] {
  for (const s of screens) {
    if (s.templateId === 'skenario' && s.data._templateId === 'skenario') {
      const data = s.data as import('./engine/slot-types').SkenarioSlotData;
      return data.skenario || [];
    }
  }
  return [];
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Extract kuis data from screens for the base JS
// ═══════════════════════════════════════════════════════════════

function extractKuisData(screens: AssemblyScreen[]): unknown[] {
  for (const s of screens) {
    if (s.templateId === 'kuis' && s.data._templateId === 'kuis') {
      const data = s.data as import('./engine/slot-types').KuisSlotData;
      return data.kuis || [];
    }
  }
  return [];
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
 * - Shared JS from getBaseJS() for screen navigation
 * - Confetti launcher script
 *
 * @param config - Assembly configuration with title, screens, and optional theming
 * @returns Complete HTML document string
 */
export function assembleHTML(config: AssemblyConfig): string {
  const { title, screens, cssVars, includeConfetti = true } = config;

  if (!screens.length) {
    return '<!DOCTYPE html><html><body><p>No screens to assemble.</p></body></html>';
  }

  // ── 1. Build CSS ──────────────────────────────────────────────
  const baseCSS = getBaseCSS(cssVars);
  const navbarCSS = renderNavbarCSS();

  // ── 2. Build screen HTML ──────────────────────────────────────
  const screenIds = buildScreenIds(screens);
  const screensHTML = screens
    .map((screen, index) => {
      const isActive = index === 0;
      const html = renderTemplateHTML(screen.templateId, screen.data, screen.id);

      // First screen gets "active" class; others remain hidden by CSS
      if (isActive) {
        return html.replace(
          'class="screen"',
          'class="screen active"',
        );
      }
      return html;
    })
    .join('\n');

  // ── 3. Build JS ───────────────────────────────────────────────
  const hasSkenario = screens.some((s) => s.templateId === 'skenario');
  const hasMateri = screens.some(
    (s) => s.templateId === 'materi-tabicons' || s.templateId === 'materi-accordion',
  );
  const hasKuis = screens.some((s) => s.templateId === 'kuis');
  const hasModules = screens.some(
    (s) =>
      s.templateId === 'sortir-game' ||
      s.templateId === 'roda-game' ||
      s.templateId === 'flashcard' ||
      s.templateId === 'hubungan-konsep' ||
      s.templateId === 'diskusi-timer',
  );

  const jsData: BaseJSData = {
    screens: screenIds,
    skenarioData: extractSkenarioData(screens) as BaseJSData['skenarioData'],
    kuisData: extractKuisData(screens) as BaseJSData['kuisData'],
    modulesData: [],
    fungsiData: [],
    hasSkenario,
    hasMateri,
    hasKuis,
    hasModules,
  };

  const baseJS = getBaseJS(jsData);
  const confettiScript = includeConfetti ? getConfettiScript() : '';

  // ── 4. Assemble complete HTML ─────────────────────────────────
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
${screensHTML}
  <script>
${baseJS}
${confettiScript}
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
  html = html.replace('class="screen"', 'class="screen active"');

  // Minimal JS for single-screen (just confetti support)
  const confettiScript = getConfettiScript();

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
// Single-screen mode: no navigation
function goScreen(id){}
function goNextScreen(){}
function goPrevScreen(){}
function switchKtab(id,el){
  var tabs=document.querySelectorAll('.ktab');
  for(var i=0;i<tabs.length;i++)tabs[i].classList.remove('active');
  var conts=document.querySelectorAll('.ktab-content');
  for(var i=0;i<conts.length;i++)conts[i].classList.remove('active');
  if(el)el.classList.add('active');
  var cont=document.getElementById(id);
  if(cont)cont.classList.add('active');
}
${confettiScript}
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
