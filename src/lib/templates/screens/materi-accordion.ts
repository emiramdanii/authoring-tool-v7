// ═══════════════════════════════════════════════════════════════
// MATERI-ACCORDION.TS — Materi Accordion screen template for MPI export
// Generates a materi screen with rich sub-components:
// - Chip-sc header with icon + estimated duration
// - Collapsible accordion sections with icon+title header
// - Step-by-step numbered list inside sections
// - Def-boxes & card grids inside sections
// - Top-level Def-boxes, Card Grid, Diskusi Kelompok Banner
// - Diskusi box with textarea + save
// - Smooth accordion open/close CSS transitions
// ═══════════════════════════════════════════════════════════════

import type { MateriAccordionSlotData, MateriAccordionStep, DefBoxItem, CardGridItem, DiskusiKelompokBanner, DiskusiBoxData } from '../engine/slot-types';

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

// ── Accent color map ──────────────────────────────────────────
const ACCENT_MAP: Record<string, { hex: string; rgba: string }> = {
  '--y': { hex: '#f9c12e', rgba: 'rgba(249,193,46,' },
  '--c': { hex: '#3ecfcf', rgba: 'rgba(62,207,207,' },
  '--g': { hex: '#34d399', rgba: 'rgba(52,211,153,' },
  '--p': { hex: '#a78bfa', rgba: 'rgba(167,139,250,' },
  '--r': { hex: '#ff6b6b', rgba: 'rgba(255,107,107,' },
  '--o': { hex: '#fb923c', rgba: 'rgba(251,146,60,' },
};
function getAccent(varName: string) {
  return ACCENT_MAP[varName] || ACCENT_MAP['--y'];
}

// ── Render Def-boxes ──────────────────────────────────────────
function renderDefBoxes(defBoxes: DefBoxItem[]): string {
  if (!defBoxes || defBoxes.length === 0) return '';
  return defBoxes.map(d => {
    const accent = getAccent(d.accentVar || '--y');
    return `<div class="def-box" style="border-color:var(${esc(d.accentVar || '--y')});background:${accent.rgba}.07)">
      ${d.text}
    </div>`;
  }).join('\n');
}

// ── Render Card Grid ──────────────────────────────────────────
function renderCardGrid(cards: CardGridItem[]): string {
  if (!cards || cards.length === 0) return '';
  const cardsHTML = cards.map(c => {
    const accent = getAccent(c.accentVar || '--y');
    return `<div class="nc" style="background:${accent.rgba}.06);border-color:${accent.rgba}.2)">
      <div class="nc-head">
        <div class="nc-icon">${esc(c.icon)}</div>
        <div class="nc-title" style="color:var(${esc(c.accentVar || '--y')})">${esc(c.title)}</div>
      </div>
      <div class="nc-body">${c.body}</div>
    </div>`;
  }).join('\n');
  return `<div class="nc-grid">${cardsHTML}</div>`;
}

// ── Render Diskusi Kelompok Banners ───────────────────────────
function renderDiskusiKelompokBanners(banners: DiskusiKelompokBanner[], prefix: string): string {
  if (!banners || banners.length === 0) return '';
  return banners.map((b, i) => {
    const tipeClass = `tipe-${b.tipe}`;
    const labelClass = b.tipe === 1 ? 'hijau' : b.tipe === 2 ? 'kuning' : 'ungu';
    const timerId = `${prefix}-dk-timer-${i}`;
    const timerHTML = b.timerDetik
      ? `<div id="${esc(timerId)}" style="margin-top:10px"></div>`
      : '';
    return `
    <div class="diskusi-kelompok ${esc(tipeClass)}">
      <div class="dk-ikon">${esc(b.ikon || '👥')}</div>
      <div class="dk-body">
        <div class="dk-label ${esc(labelClass)}">${esc(b.label)}</div>
        <div class="dk-judul">${esc(b.judul)}</div>
        <div class="dk-isi">${esc(b.isi)}</div>
        ${timerHTML}
      </div>
    </div>`;
  }).join('\n');
}

// ── Render Diskusi Box ────────────────────────────────────────
function renderDiskusiBox(box: DiskusiBoxData | undefined): string {
  if (!box) return '';
  const btnClass = box.accentVar === '--y' ? 'btn-y' : box.accentVar === '--g' ? 'btn-g' : 'btn-c';
  return `
  <div class="diskusi-box" style="margin-top:14px">
    <div style="color:var(${esc(box.accentVar || '--c')});font-weight:800;font-size:.86rem">💬 Pertanyaan Diskusi</div>
    <p style="margin-top:7px;font-size:.86rem;line-height:1.6;font-weight:700">${esc(box.prompt)}</p>
    <textarea id="${esc(box.textareaId)}" placeholder="${esc(box.placeholder)}"></textarea>
    <div style="display:flex;align-items:center;flex-wrap:wrap;margin-top:9px;gap:8px">
      <button class="btn ${btnClass} btn-sm" onclick="saveDiskusi('${esc(box.textareaId)}','${esc(box.saveKey)}','${esc(box.saveLabel)}')">💾 Simpan (+5 poin)</button>
      <span id="badge-${esc(box.saveKey)}" style="display:none" class="saved-badge">✅ Tersimpan</span>
    </div>
  </div>`;
}

// ── Render Step-by-step list ──────────────────────────────────
function renderSteps(steps: MateriAccordionStep[]): string {
  if (!steps || steps.length === 0) return '';
  const stepsHTML = steps.map(s => {
    return `<div style="display:flex;gap:10px;margin-bottom:8px"><span style="font-size:1.3rem;flex-shrink:0">${esc(s.emoji)}</span><span>${s.text}</span></div>`;
  }).join('\n');
  return `<div class="ma-steps">${stepsHTML}</div>`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderMateriAccordionHTML
// ═══════════════════════════════════════════════════════════════
export function renderMateriAccordionHTML(data: MateriAccordionSlotData, screenId: string): string {
  const title = data.title || 'Materi Pembelajaran';
  const sections = data.sections || [];
  const prefix = screenId;
  const estimatedMinutes = data.estimatedMinutes || 15;

  const accentColors = ['#f9c12e', '#3ecfcf', '#34d399', '#a78bfa', '#ff6b6b', '#fb923c'];
  const accentVarNames = ['--y', '--c', '--g', '--p', '--r', '--o'];

  // ── Top-level sub-components ──────────────────────────────────
  const defBoxesHTML = renderDefBoxes(data.defBoxes || []);
  const cardGridHTML = renderCardGrid(data.cardGrid || []);
  const bannersHTML = renderDiskusiKelompokBanners(data.diskusiKelompok || [], prefix);
  const diskusiBoxHTML = renderDiskusiBox(data.diskusiBox);

  // ── Accordion sections ────────────────────────────────────────
  const sectionsHtml = sections.length
    ? sections.map((sec, i) => {
        const col = accentColors[i % accentColors.length];
        const aVar = accentVarNames[i % accentVarNames.length];

        // Section icon + title header (matching preset layout)
        const titleHTML = sec.titleHighlight
          ? `${esc(sec.title)}<br><span class="hl">${esc(sec.titleHighlight)}</span>`
          : `${esc(sec.title)}`;

        const sectionHeader = `<div class="ma-section-header">
  <div class="ma-section-icon" style="background:${col}18;color:${col}">${esc(sec.icon || '📖')}</div>
  <div><h2 class="h2 ma-section-h2">${titleHTML}</h2>${sec.subtitle ? `<p class="sub">${esc(sec.subtitle)}</p>` : ''}</div>
</div>`;

        // Sub-components inside each section
        const secDefBoxes = renderDefBoxes(sec.defBoxes || []);
        const secCardGrid = renderCardGrid(sec.cardGrid || []);
        const secSteps = renderSteps(sec.steps || []);

        return `<div class="ma-item" id="${esc(prefix)}-ma-${i}">
      <button class="ma-trigger" onclick="toggleMa('${esc(prefix)}',${i})" id="${esc(prefix)}-ma-trigger-${i}">
        <span class="ma-trigger-icon" style="background:${col}18;color:${col}">${esc(sec.icon || '📌')}</span>
        <span class="ma-trigger-title">${esc(sec.title || 'Bagian ' + (i + 1))}${sec.titleHighlight ? ` — <span class="hl">${esc(sec.titleHighlight)}</span>` : ''}</span>
        <span class="ma-trigger-arrow" id="${esc(prefix)}-ma-arrow-${i}">▼</span>
      </button>
      <div class="ma-body" id="${esc(prefix)}-ma-body-${i}">
        <div class="ma-body-inner">
          ${sectionHeader}
          ${secSteps}
          ${sec.content || ''}
          ${secDefBoxes}
          ${secCardGrid}
        </div>
      </div>
    </div>`;
      }).join('')
    : '<p style="color:var(--muted);font-size:.82rem;margin-top:12px">Materi belum diisi.</p>';

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Materi">
  <div class="main">
    <span class="chip-sc" style="background:rgba(249,193,46,.15);color:var(--y)">📖 Materi · ±${esc(estimatedMinutes)} Menit</span>

    <div class="card">
      <div class="h2">📂 <span class="hl">Materi</span> Pembelajaran</div>
      <p class="sub mt8">${esc(title)} — Ketuk setiap bagian untuk membuka materinya.</p>
    </div>

    <!-- Top-level sub-components -->
    ${bannersHTML}
    ${defBoxesHTML}
    ${cardGridHTML}

    <!-- Accordion sections -->
    <div class="card mt14">
      <div class="ma-list">${sectionsHtml}</div>
    </div>

    <!-- Diskusi box -->
    ${diskusiBoxHTML}

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
  <style>
    .chip-sc{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:99px;font-size:.76rem;font-weight:800;margin-bottom:10px;}
    .ma-list{display:flex;flex-direction:column;gap:8px;}
    .ma-item{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color .2s;}
    .ma-item:hover{border-color:rgba(255,255,255,.1);}
    .ma-trigger{width:100%;padding:14px 16px;background:none;border:none;color:var(--text);font-size:.88rem;font-weight:800;text-align:left;cursor:pointer;display:flex;align-items:center;gap:10px;font-family:'Nunito',sans-serif;transition:background .15s;}
    .ma-trigger:hover{background:rgba(255,255,255,.03);}
    .ma-trigger-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
    .ma-trigger-title{flex:1;font-size:.88rem;font-weight:800;}
    .ma-trigger-arrow{font-size:.7rem;color:var(--muted);transition:transform .3s cubic-bezier(.4,0,.2,1);flex-shrink:0;}
    .ma-trigger-arrow.ma-arrow-open{transform:rotate(180deg);}
    .ma-body{max-height:0;overflow:hidden;transition:max-height .4s cubic-bezier(.4,0,.2,1),opacity .3s ease;opacity:0;}
    .ma-body.ma-body-open{max-height:5000px;opacity:1;}
    .ma-body-inner{padding:0 16px 16px;font-size:.84rem;color:var(--muted);line-height:1.8;border-top:1px solid var(--border);}
    /* Section header inside accordion body */
    .ma-section-header{display:flex;align-items:center;gap:12px;margin:14px 0;}
    .ma-section-icon{width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;}
    .ma-section-h2{font-size:1.1rem;margin:0;line-height:1.3;}
    /* Step-by-step list */
    .ma-steps{background:rgba(255,255,255,.04);border-radius:12px;padding:14px;margin-top:10px;font-size:.85rem;line-height:1.8;}
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
        // Add score for opening a section (first time only)
        if (!body.dataset.opened) {
          body.dataset.opened = '1';
          if (typeof addScore === 'function') addScore(2);
          if (typeof updateNavbarScore === 'function') updateNavbarScore();
        }
      }
    }
  </script>
</div>`;
}
