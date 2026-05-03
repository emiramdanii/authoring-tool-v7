// ═══════════════════════════════════════════════════════════════
// DISKUSI-TIMER.TS — Diskusi + Timer screen template for MPI export
// Generates a discussion page with rich sub-components:
// - Section chip + title
// - Diskusi Kelompok Banner (3 tipe warna)
// - Def-box (definition callout with accent border)
// - Card Grid 2×2 (colored info cards)
// - Visual countdown timer (JS-driven) — PRESET QUALITY
// - Discussion prompt + question cards
// - Diskusi box with textarea + localStorage save
// - Navigation buttons
//
// v5.Z UPGRADE: entrance animations, screen activation hook,
// timer visual polish, interactive improvements, visual hierarchy
// ═══════════════════════════════════════════════════════════════

import type { DiskusiTimerSlotData, DiskusiKelompokBanner, DefBoxItem, CardGridItem, DiskusiBoxData } from '../engine/slot-types';
import { esc } from '../engine/esc';

// ── Accent color map for CSS variable → hex + rgba ────────────
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

// ── Render Diskusi Kelompok Banner ────────────────────────────
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
    <div class="diskusi-kelompok ${esc(tipeClass)} dt-anim-item">
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

// ── Render Def-boxes ──────────────────────────────────────────
function renderDefBoxes(defBoxes: DefBoxItem[]): string {
  if (!defBoxes || defBoxes.length === 0) return '';
  return defBoxes.map(d => {
    const accent = getAccent(d.accentVar || '--y');
    return `<div class="def-box dt-anim-item" style="border-color:var(${esc(d.accentVar || '--y')});background:${accent.rgba}.07)">
      ${esc(d.text)}
    </div>`;
  }).join('\n');
}

// ── Render Card Grid 2×2 ─────────────────────────────────────
function renderCardGrid(cards: CardGridItem[]): string {
  if (!cards || cards.length === 0) return '';
  const cardsHTML = cards.map(c => {
    const accent = getAccent(c.accentVar || '--y');
    return `<div class="nc dt-anim-item" style="background:${accent.rgba}.06);border-color:${accent.rgba}.2)">
      <div class="nc-head">
        <div class="nc-icon">${esc(c.icon)}</div>
        <div class="nc-title" style="color:var(${esc(c.accentVar || '--y')})">${esc(c.title)}</div>
      </div>
      <div class="nc-body">${esc(c.body)}</div>
    </div>`;
  }).join('\n');
  return `<div class="nc-grid dt-anim-item">${cardsHTML}</div>`;
}

// ── Render Diskusi Box with save ──────────────────────────────
function renderDiskusiBox(box: DiskusiBoxData | undefined, prefix: string): string {
  if (!box) return '';
  const accent = getAccent(box.accentVar || '--c');
  const btnClass = box.accentVar === '--y' ? 'btn-y' : box.accentVar === '--g' ? 'btn-g' : 'btn-c';
  return `
  <div class="diskusi-box dt-anim-item" style="margin-top:16px">
    <div style="color:var(${esc(box.accentVar || '--c')});font-weight:800;font-size:.86rem">💬 Pertanyaan Diskusi</div>
    <p style="margin-top:8px;font-size:.86rem;line-height:1.6;font-weight:700">${esc(box.prompt)}</p>
    <textarea id="${esc(box.textareaId)}" class="dt-textarea" placeholder="${esc(box.placeholder)}"></textarea>
    <div style="display:flex;align-items:center;flex-wrap:wrap;margin-top:9px;gap:8px">
      <button class="btn ${btnClass} btn-sm dt-save-btn" onclick="saveDiskusi('${esc(box.textareaId)}','${esc(box.saveKey)}','${esc(box.saveLabel)}');if(typeof addScore==='function'){addScore(5);}">💾 Simpan Jawaban (+5 poin)</button>
      <span id="badge-${esc(box.saveKey)}" style="display:none" class="saved-badge">✅ Tersimpan</span>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderDiskusiTimerHTML
// ═══════════════════════════════════════════════════════════════
export function renderDiskusiTimerHTML(data: DiskusiTimerSlotData, screenId: string): string {
  const title = data.title || 'Diskusi Kelompok';
  const prompt = data.prompt || 'Diskusikan pertanyaan berikut bersama kelompokmu!';
  const duration = data.duration || 10;
  const questions = data.questions || [];
  const prefix = screenId;
  const totalSeconds = duration * 60;

  // ── Sub-components ────────────────────────────────────────────
  const bannersHTML = renderDiskusiKelompokBanners(data.diskusiKelompok || [], prefix);
  const defBoxesHTML = renderDefBoxes(data.defBoxes || []);
  const cardGridHTML = renderCardGrid(data.cardGrid || []);
  const diskusiBoxHTML = renderDiskusiBox(data.diskusiBox, prefix);

  // ── Question cards with numbered badges ───────────────────────
  const questionCardsHtml = questions.length
    ? questions.map((q, i) => `
      <div class="dt-question-card dt-anim-item">
        <div class="dt-question-num">${i + 1}</div>
        <div class="dt-question-text">${esc(q)}</div>
      </div>`).join('')
    : '';

  // ── Determine if we need the timer (show if questions or duration > 0) ──
  const showTimer = duration > 0;

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Diskusi">
  <div class="main">
    <!-- Title card -->
    <div class="card dt-anim-item dt-anim-1">
      <div class="h2">💬 <span class="hl">Diskusi</span> Kelompok</div>
      <p class="sub mt8">${esc(title)}</p>
    </div>

    <!-- Section separator -->
    <div class="dt-separator"></div>

    <!-- Diskusi Kelompok Banners -->
    ${bannersHTML}

    <!-- Section separator -->
    ${defBoxesHTML || cardGridHTML ? '<div class="dt-separator"></div>' : ''}

    <!-- Def-boxes -->
    ${defBoxesHTML}

    <!-- Card Grid -->
    ${cardGridHTML}

    ${showTimer ? `
    <!-- Section separator -->
    <div class="dt-separator"></div>

    <!-- Timer — Visual Centerpiece -->
    <div class="card mt14 dt-timer-card dt-anim-item" style="text-align:center;position:relative;overflow:hidden">
      <div class="dt-timer-card-bg"></div>
      <div style="position:relative;z-index:1">
        <div class="dt-timer-ring" id="${esc(prefix)}-timer-ring">
          <div class="dt-timer-glow" id="${esc(prefix)}-timer-glow"></div>
          <svg viewBox="0 0 140 140" class="dt-timer-svg">
            <circle cx="70" cy="70" r="62" stroke="rgba(255,255,255,.06)" stroke-width="6" fill="none"/>
            <circle cx="70" cy="70" r="62" stroke="var(--c)" stroke-width="6" fill="none"
              stroke-dasharray="389.56" stroke-dashoffset="0" stroke-linecap="round"
              transform="rotate(-90 70 70)" id="${esc(prefix)}-timer-circle"
              style="transition:stroke-dashoffset 1s linear, stroke .4s ease"/>
          </svg>
          <div class="dt-timer-display">
            <div class="dt-timer-minutes" id="${esc(prefix)}-timer-min">${duration}</div>
            <div class="dt-timer-label">menit</div>
          </div>
          <!-- "Waktu Habis!" overlay -->
          <div class="dt-timeup-overlay" id="${esc(prefix)}-timeup-overlay" style="display:none">
            <div class="dt-timeup-text">Waktu Habis!</div>
          </div>
        </div>
        <div class="dt-timer-controls">
          <button class="btn btn-c btn-sm dt-btn-pulse" id="${esc(prefix)}-btn-start" onclick="dtStartTimer('${esc(prefix)}',${totalSeconds})">▶ Mulai</button>
          <button class="btn btn-ghost btn-sm" id="${esc(prefix)}-btn-pause" onclick="dtPauseTimer('${esc(prefix)}')" style="display:none">⏸ Jeda</button>
          <button class="btn btn-ghost btn-sm" id="${esc(prefix)}-btn-reset" onclick="dtResetTimer('${esc(prefix)}',${totalSeconds})">↻ Reset</button>
        </div>
      </div>
    </div>` : ''}

    <!-- Section separator -->
    <div class="dt-separator"></div>

    <!-- Discussion prompt + questions -->
    <div class="card mt14 dt-anim-item" id="${esc(prefix)}-questions-area">
      <div class="dt-prompt-label">📝 Pertanyaan Diskusi</div>
      <div class="dt-prompt-text">${esc(prompt)}</div>
      ${questionCardsHtml ? `<div class="dt-questions-list">${questionCardsHtml}</div>` : ''}
      <div style="text-align:center;margin-top:14px">
        <button class="btn btn-c btn-sm dt-btn-mulai" onclick="(function(){var el=document.getElementById('${esc(prefix)}-diskusi-area');if(el)el.scrollIntoView({behavior:'smooth',block:'center'})})()">✍️ Mulai Diskusi</button>
      </div>
    </div>

    <!-- Section separator -->
    <div class="dt-separator"></div>

    <!-- Diskusi box with save -->
    <div id="${esc(prefix)}-diskusi-area">
      ${diskusiBoxHTML}
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
  <style>
    /* ═══════════════════════════════════════════════════════════
       ENTRANCE ANIMATIONS — staggered fade-in from bottom
       ═══════════════════════════════════════════════════════════ */
    @keyframes dtFadeInUp {
      from { opacity:0; transform:translateY(18px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes dtScaleIn {
      from { opacity:0; transform:scale(.92); }
      to   { opacity:1; transform:scale(1); }
    }
    @keyframes dtRingPulse {
      0%,100% { filter:drop-shadow(0 0 4px rgba(62,207,207,.25)); }
      50%     { filter:drop-shadow(0 0 14px rgba(62,207,207,.55)); }
    }
    @keyframes dtRingPulseRed {
      0%,100% { filter:drop-shadow(0 0 4px rgba(255,107,107,.3)); }
      50%     { filter:drop-shadow(0 0 18px rgba(255,107,107,.7)); }
    }
    @keyframes dtRingPulseYellow {
      0%,100% { filter:drop-shadow(0 0 4px rgba(249,193,46,.3)); }
      50%     { filter:drop-shadow(0 0 16px rgba(249,193,46,.65)); }
    }
    @keyframes dtBtnPulse {
      0%,100% { box-shadow:0 0 0 0 rgba(62,207,207,.45); }
      50%     { box-shadow:0 0 0 8px rgba(62,207,207,0); }
    }
    @keyframes dtTickScale {
      0%   { transform:scale(1); }
      30%  { transform:scale(1.08); }
      100% { transform:scale(1); }
    }
    @keyframes dtRingFlash {
      0%   { opacity:1; }
      25%  { opacity:.3; }
      50%  { opacity:1; }
      75%  { opacity:.3; }
      100% { opacity:1; }
    }
    @keyframes dtTimeupPop {
      0%   { opacity:0; transform:scale(.5); }
      60%  { opacity:1; transform:scale(1.15); }
      100% { opacity:1; transform:scale(1); }
    }
    @keyframes dtTextareaFocusGlow {
      0%,100% { box-shadow:0 0 0 2px rgba(62,207,207,.2); }
      50%     { box-shadow:0 0 0 4px rgba(62,207,207,.35); }
    }

    /* ── Base: items hidden before .dt-active ─────────────────── */
    .dt-anim-item {
      opacity: 0;
      transform: translateY(18px);
      transition: none;
    }
    /* ── Staggered reveal when parent has .dt-active ─────────── */
    .dt-active .dt-anim-item {
      animation: dtFadeInUp .5s ease-out forwards;
    }
    .dt-active .dt-anim-item:nth-child(1)  { animation-delay: .00s; }
    .dt-active .dt-anim-item:nth-child(2)  { animation-delay: .08s; }
    .dt-active .dt-anim-item:nth-child(3)  { animation-delay: .16s; }
    .dt-active .dt-anim-item:nth-child(4)  { animation-delay: .24s; }
    .dt-active .dt-anim-item:nth-child(5)  { animation-delay: .32s; }
    .dt-active .dt-anim-item:nth-child(6)  { animation-delay: .40s; }
    .dt-active .dt-anim-item:nth-child(7)  { animation-delay: .48s; }
    .dt-active .dt-anim-item:nth-child(8)  { animation-delay: .56s; }
    .dt-active .dt-anim-item:nth-child(9)  { animation-delay: .64s; }
    .dt-active .dt-anim-item:nth-child(10) { animation-delay: .72s; }

    /* ═══════════════════════════════════════════════════════════
       SECTION SEPARATORS — subtle gradient lines
       ═══════════════════════════════════════════════════════════ */
    .dt-separator {
      height: 1px;
      margin: 10px 0;
      background: linear-gradient(90deg, transparent, rgba(62,207,207,.2) 30%, rgba(62,207,207,.2) 70%, transparent);
      border: none;
    }

    /* ═══════════════════════════════════════════════════════════
       TIMER CARD — visual centerpiece, elevated
       ═══════════════════════════════════════════════════════════ */
    .dt-timer-card {
      border: 1px solid rgba(62,207,207,.18) !important;
      box-shadow: 0 4px 24px rgba(62,207,207,.1), 0 1px 4px rgba(0,0,0,.12) !important;
      border-radius: 18px !important;
    }
    .dt-timer-card-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(160deg, rgba(62,207,207,.06) 0%, rgba(62,207,207,.01) 50%, rgba(167,139,250,.04) 100%);
      border-radius: 18px;
      pointer-events: none;
      z-index: 0;
    }

    /* ── Timer ring ───────────────────────────────────────────── */
    .dt-timer-ring {
      position: relative;
      width: 140px;
      height: 140px;
      margin: 0 auto 14px;
    }
    .dt-timer-svg {
      width: 140px;
      height: 140px;
    }
    .dt-timer-display {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .dt-timer-minutes {
      font-family: 'Fredoka One', cursive;
      font-size: 2.2rem;
      color: var(--c);
      line-height: 1;
      transition: color .4s ease;
    }
    .dt-timer-label {
      font-size: .7rem;
      color: var(--muted);
      font-weight: 800;
      margin-top: 2px;
    }

    /* ── Timer glow ring (behind SVG) ─────────────────────────── */
    .dt-timer-glow {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      pointer-events: none;
      z-index: -1;
    }
    .dt-timer-glow.dt-glow-running {
      animation: dtRingPulse 2s ease-in-out infinite;
    }
    .dt-timer-glow.dt-glow-red {
      animation: dtRingPulseRed 1s ease-in-out infinite !important;
      background: radial-gradient(circle, rgba(255,107,107,.08) 0%, transparent 70%);
    }
    .dt-timer-glow.dt-glow-yellow {
      animation: dtRingPulseYellow 1.4s ease-in-out infinite !important;
      background: radial-gradient(circle, rgba(249,193,46,.08) 0%, transparent 70%);
    }

    /* ── Timer tick animation on numbers ──────────────────────── */
    .dt-timer-minutes.dt-tick {
      animation: dtTickScale .35s ease-out;
    }

    /* ── Time-up overlay ──────────────────────────────────────── */
    .dt-timeup-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,.35);
      border-radius: 50%;
      z-index: 2;
    }
    .dt-timeup-text {
      font-family: 'Fredoka One', cursive;
      font-size: .78rem;
      color: #ff6b6b;
      font-weight: 800;
      text-align: center;
      animation: dtTimeupPop .6s ease-out forwards;
      text-shadow: 0 0 8px rgba(255,107,107,.5);
    }

    /* ── Timer ring flash on end ──────────────────────────────── */
    .dt-timer-svg.dt-flash {
      animation: dtRingFlash .6s ease-out;
    }

    /* ── Timer controls ───────────────────────────────────────── */
    .dt-timer-controls {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 10px;
    }

    /* ── Start button pulse ───────────────────────────────────── */
    .dt-btn-pulse {
      animation: dtBtnPulse 2s ease-in-out infinite;
    }
    .dt-btn-pulse.dt-pulse-stop {
      animation: none;
    }

    /* ═══════════════════════════════════════════════════════════
       QUESTION CARDS — hover effects + numbered badges
       ═══════════════════════════════════════════════════════════ */
    .dt-prompt-label {
      font-size: .78rem;
      font-weight: 800;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: .06em;
      margin-bottom: 8px;
    }
    .dt-prompt-text {
      font-size: .9rem;
      font-weight: 700;
      line-height: 1.6;
      margin-bottom: 14px;
      color: var(--text);
    }
    .dt-questions-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .dt-question-card {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      background: rgba(255,255,255,.04);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
      cursor: default;
    }
    .dt-question-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,.1);
      border-color: rgba(62,207,207,.3);
    }
    .dt-question-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(62,207,207,.15);
      color: var(--c);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .75rem;
      font-weight: 900;
      flex-shrink: 0;
      transition: background .2s ease;
    }
    .dt-question-card:hover .dt-question-num {
      background: rgba(62,207,207,.28);
    }
    .dt-question-text {
      font-size: .86rem;
      font-weight: 700;
      line-height: 1.5;
      color: var(--text);
    }

    /* ═══════════════════════════════════════════════════════════
       TEXTAREA — focus glow effect
       ═══════════════════════════════════════════════════════════ */
    .dt-textarea {
      width: 100%;
      min-height: 72px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,.03);
      color: var(--text);
      font-size: .86rem;
      padding: 10px 12px;
      resize: vertical;
      transition: border-color .25s ease, box-shadow .25s ease;
      font-family: inherit;
    }
    .dt-textarea:focus {
      outline: none;
      border-color: var(--c);
      animation: dtTextareaFocusGlow 2s ease-in-out infinite;
    }

    /* ── Mulai Diskusi button ─────────────────────────────────── */
    .dt-btn-mulai {
      margin-top: 6px;
    }

    /* ── Save button subtle feedback ──────────────────────────── */
    .dt-save-btn:active {
      transform: scale(.96);
    }
  </style>
  <script>
    /* ── Timer logic (preserved + enhanced) ────────────────────── */
    var dtTimers = {};
    function dtStartTimer(prefix, totalSec) {
      if (dtTimers[prefix]) return;
      var circle = document.getElementById(prefix + '-timer-circle');
      var minEl = document.getElementById(prefix + '-timer-min');
      var startBtn = document.getElementById(prefix + '-btn-start');
      var pauseBtn = document.getElementById(prefix + '-btn-pause');
      var glowEl = document.getElementById(prefix + '-timer-glow');
      var overlayEl = document.getElementById(prefix + '-timeup-overlay');
      var svgEl = circle ? circle.closest('svg') : null;
      if (!circle || !minEl) return;
      if (startBtn) { startBtn.style.display = 'none'; startBtn.classList.add('dt-pulse-stop'); }
      if (pauseBtn) pauseBtn.style.display = 'inline-flex';
      if (overlayEl) overlayEl.style.display = 'none';
      if (svgEl) svgEl.classList.remove('dt-flash');
      /* Activate running glow */
      if (glowEl) { glowEl.classList.add('dt-glow-running'); glowEl.classList.remove('dt-glow-red','dt-glow-yellow'); }
      var remaining = totalSec;
      if(dtTimers[prefix + '_remaining'] !== undefined) {
        remaining = dtTimers[prefix + '_remaining'];
      } else {
        dtTimers[prefix + '_remaining'] = totalSec;
      }
      var circumference = 2 * Math.PI * 62;
      dtTimers[prefix] = setInterval(function() {
        remaining--;
        dtTimers[prefix + '_remaining'] = remaining;
        /* Tick scale animation */
        minEl.classList.remove('dt-tick');
        void minEl.offsetWidth; /* reflow to restart animation */
        minEl.classList.add('dt-tick');

        if (remaining <= 0) {
          clearInterval(dtTimers[prefix]);
          delete dtTimers[prefix];
          remaining = 0;
          if (startBtn) { startBtn.style.display = 'inline-flex'; startBtn.classList.remove('dt-pulse-stop'); }
          if (pauseBtn) pauseBtn.style.display = 'none';
          minEl.textContent = '0:00';
          minEl.style.color = 'var(--r)';
          circle.style.stroke = 'var(--r)';
          circle.style.strokeDashoffset = circumference;
          /* Glow: red final */
          if (glowEl) { glowEl.classList.remove('dt-glow-running','dt-glow-yellow'); glowEl.classList.add('dt-glow-red'); }
          /* Ring flash */
          if (svgEl) { svgEl.classList.add('dt-flash'); setTimeout(function(){ svgEl.classList.remove('dt-flash'); }, 600); }
          /* Time-up overlay */
          if (overlayEl) { overlayEl.style.display = 'flex'; }
          return;
        }
        var m = Math.floor(remaining / 60);
        var s = remaining % 60;
        minEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
        var pct = 1 - (remaining / totalSec);
        circle.style.strokeDashoffset = (pct * circumference);
        if (remaining < 60) {
          minEl.style.color = 'var(--r)';
          circle.style.stroke = 'var(--r)';
          if (glowEl) { glowEl.classList.remove('dt-glow-running','dt-glow-yellow'); glowEl.classList.add('dt-glow-red'); }
        } else if (remaining < totalSec * 0.25) {
          minEl.style.color = 'var(--y)';
          circle.style.stroke = 'var(--y)';
          if (glowEl) { glowEl.classList.remove('dt-glow-running','dt-glow-red'); glowEl.classList.add('dt-glow-yellow'); }
        }
      }, 1000);
    }
    function dtPauseTimer(prefix) {
      if (dtTimers[prefix]) {
        clearInterval(dtTimers[prefix]);
        delete dtTimers[prefix];
      }
      var startBtn = document.getElementById(prefix + '-btn-start');
      var pauseBtn = document.getElementById(prefix + '-btn-pause');
      var glowEl = document.getElementById(prefix + '-timer-glow');
      if (startBtn) { startBtn.style.display = 'inline-flex'; startBtn.classList.remove('dt-pulse-stop'); }
      if (pauseBtn) pauseBtn.style.display = 'none';
      /* Pause glow animation by removing running class */
      if (glowEl) glowEl.classList.remove('dt-glow-running');
    }
    function dtResetTimer(prefix, totalSec) {
      dtPauseTimer(prefix);
      dtTimers[prefix + '_remaining'] = totalSec;
      var circle = document.getElementById(prefix + '-timer-circle');
      var minEl = document.getElementById(prefix + '-timer-min');
      var glowEl = document.getElementById(prefix + '-timer-glow');
      var overlayEl = document.getElementById(prefix + '-timeup-overlay');
      var svgEl = circle ? circle.closest('svg') : null;
      if (circle) { circle.style.strokeDashoffset = 0; circle.style.stroke = 'var(--c)'; }
      if (minEl) { var d = Math.ceil(totalSec / 60); minEl.textContent = d; minEl.style.color = 'var(--c)'; minEl.classList.remove('dt-tick'); }
      if (glowEl) { glowEl.classList.remove('dt-glow-running','dt-glow-red','dt-glow-yellow'); }
      if (overlayEl) overlayEl.style.display = 'none';
      if (svgEl) svgEl.classList.remove('dt-flash');
    }
  </script>
  <script>
    /* ── Screen activation hook — triggers entrance animations ── */
    (function(){
      var el = document.getElementById('${esc(screenId)}');
      if (!el) return;
      function activate() {
        el.classList.add('dt-active');
      }
      /* Listen for screenActivate event */
      document.addEventListener('screenActivate', function(e) {
        if (e.detail && e.detail.screenId === '${esc(screenId)}') {
          activate();
        }
      });
      /* Also check if already active (e.g. first screen) */
      if (el.classList.contains('active') || el.style.display !== 'none') {
        /* Small delay so CSS is ready */
        setTimeout(activate, 80);
      }
    })();
  </script>
</div>`;
}
