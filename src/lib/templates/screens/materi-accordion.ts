// ═══════════════════════════════════════════════════════════════
// MATERI-ACCORDION.TS — Materi Accordion screen template for MPI export
// Generates a materi screen with collapsible accordion sections.
// Each section has an icon, title, and expandable content area.
// ═══════════════════════════════════════════════════════════════

import type { MateriAccordionSlotData } from '../engine/slot-types';

// ── HTML Entity Escaping ──────────────────────────────────────
function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ═══════════════════════════════════════════════════════════════
// renderMateriAccordionHTML
// ═══════════════════════════════════════════════════════════════
/**
 * Generate the Materi Accordion screen HTML.
 *
 * @param data     - MateriAccordionSlotData with title and sections[]
 * @param screenId - DOM id for this screen (e.g. 's-materi-accordion')
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderMateriAccordionHTML(data: MateriAccordionSlotData, screenId: string): string {
  const title = data.title || 'Materi Pembelajaran';
  const sections = data.sections || [];
  const prefix = screenId;

  const accentColors = ['#f9c12e', '#3ecfcf', '#34d399', '#a78bfa', '#ff6b6b', '#fb923c'];

  const sectionsHtml = sections.length
    ? sections.map((sec, i) => {
        const col = accentColors[i % accentColors.length];
        return `<div class="ma-item" id="${esc(prefix)}-ma-${i}">
      <button class="ma-trigger" onclick="toggleMa('${esc(prefix)}',${i})" id="${esc(prefix)}-ma-trigger-${i}">
        <span class="ma-trigger-icon" style="background:${col}18;color:${col}">${esc(sec.icon || '📌')}</span>
        <span class="ma-trigger-title">${esc(sec.title || 'Bagian ' + (i + 1))}</span>
        <span class="ma-trigger-arrow" id="${esc(prefix)}-ma-arrow-${i}">▼</span>
      </button>
      <div class="ma-body" id="${esc(prefix)}-ma-body-${i}">
        <div class="ma-body-inner">${esc(sec.content || 'Konten belum diisi.')}</div>
      </div>
    </div>`;
      }).join('')
    : '<p style="color:var(--muted);font-size:.82rem;margin-top:12px">Materi belum diisi.</p>';

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">📂 Materi</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:50%"></div></div>
    <span class="nav-score">0 ⭐</span>
  </nav>
  <div class="main">
    <div class="card">
      <div class="h2">📂 <span class="hl">Materi</span> Pembelajaran</div>
      <p class="sub mt8">${esc(title)} — Ketuk setiap bagian untuk membuka materinya.</p>
      <div class="ma-list">${sectionsHtml}</div>
    </div>
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
  <style>
    .ma-list{display:flex;flex-direction:column;gap:8px;margin-top:16px;}
    .ma-item{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;}
    .ma-trigger{width:100%;padding:14px 16px;background:none;border:none;color:var(--text);font-size:.88rem;font-weight:800;text-align:left;cursor:pointer;display:flex;align-items:center;gap:10px;font-family:'Nunito',sans-serif;transition:background .15s;}
    .ma-trigger:hover{background:rgba(255,255,255,.03);}
    .ma-trigger-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
    .ma-trigger-title{flex:1;font-size:.88rem;font-weight:800;}
    .ma-trigger-arrow{font-size:.7rem;color:var(--muted);transition:transform .25s;flex-shrink:0;}
    .ma-trigger-arrow.ma-arrow-open{transform:rotate(180deg);}
    .ma-body{max-height:0;overflow:hidden;transition:max-height .35s ease;}
    .ma-body.ma-body-open{max-height:2000px;}
    .ma-body-inner{padding:0 16px 16px;font-size:.84rem;color:var(--muted);line-height:1.8;border-top:1px solid var(--border);}
  </style>
  <script>
    function toggleMa(prefix, idx) {
      var body = document.getElementById(prefix + '-ma-body-' + idx);
      var arrow = document.getElementById(prefix + '-ma-arrow-' + idx);
      if (!body) return;
      var isOpen = body.classList.contains('ma-body-open');
      if (isOpen) {
        body.classList.remove('ma-body-open');
        if (arrow) arrow.classList.remove('ma-arrow-open');
      } else {
        body.classList.add('ma-body-open');
        if (arrow) arrow.classList.add('ma-arrow-open');
      }
    }
  </script>
</div>`;
}
