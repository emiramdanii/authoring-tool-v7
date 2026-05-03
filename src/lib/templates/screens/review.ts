// ═══════════════════════════════════════════════════════════════
// REVIEW.TS — Review / Recall screen template for MPI export
// Generates a review page with rich sub-components:
// - Question-answer flip card pairs (with staggered entrance, 3D tilt, glow)
// - Diskusi Kelompok Banner
// - Card Grid 2×2 for comparison (with hover lift)
// - Diskusi box with textarea + save (with typing indicator)
// - Interactive scoring, flip tracking, "Putar Semua" auto-flip
// ═══════════════════════════════════════════════════════════════

import type { ReviewSlotData, DiskusiKelompokBanner, CardGridItem, DiskusiBoxData } from '../engine/slot-types';

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
    <div class="diskusi-kelompok ${esc(tipeClass)} rv-anim-item" style="animation-delay:${0.15 + i * 0.1}s">
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

// ── Render Card Grid ──────────────────────────────────────────
function renderCardGrid(cards: CardGridItem[]): string {
  if (!cards || cards.length === 0) return '';
  const cardsHTML = cards.map((c, i) => {
    const accent = getAccent(c.accentVar || '--y');
    return `<div class="nc rv-nc-lift" style="background:${accent.rgba}.06);border-color:${accent.rgba}.2);animation-delay:${0.2 + i * 0.08}s">
      <div class="nc-head">
        <div class="nc-icon">${esc(c.icon)}</div>
        <div class="nc-title" style="color:var(${esc(c.accentVar || '--y')})">${esc(c.title)}</div>
      </div>
      <div class="nc-body">${esc(c.body)}</div>
    </div>`;
  }).join('\n');
  return `<div class="nc-grid">${cardsHTML}</div>`;
}

// ── Render Diskusi Box ────────────────────────────────────────
function renderDiskusiBox(box: DiskusiBoxData | undefined): string {
  if (!box) return '';
  const btnClass = box.accentVar === '--y' ? 'btn-y' : box.accentVar === '--g' ? 'btn-g' : 'btn-c';
  return `
  <div class="diskusi-box rv-anim-item rv-diskusi-box" style="margin-top:14px;animation-delay:0.4s">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="color:var(${esc(box.accentVar || '--c')});font-weight:800;font-size:.86rem">📝 Pertanyaan Diskusi</span>
      <span class="rv-typing-indicator"><span></span><span></span><span></span></span>
    </div>
    <p style="margin-top:7px;font-size:.86rem;line-height:1.6;font-weight:700">${esc(box.prompt)}</p>
    <textarea id="${esc(box.textareaId)}" placeholder="${esc(box.placeholder)}"></textarea>
    <div style="display:flex;align-items:center;flex-wrap:wrap;margin-top:9px;gap:8px">
      <button class="btn ${btnClass} btn-sm" onclick="saveDiskusi('${esc(box.textareaId)}','${esc(box.saveKey)}','${esc(box.saveLabel)}')">💾 Simpan (+5 poin)</button>
      <span id="badge-${esc(box.saveKey)}" style="display:none" class="saved-badge">✅ Tersimpan</span>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderReviewHTML
// ═══════════════════════════════════════════════════════════════
export function renderReviewHTML(data: ReviewSlotData, screenId: string): string {
  const title = data.title || 'Review Materi';
  const questions = data.questions || [];
  const prefix = screenId;

  const accentColors = ['#f9c12e', '#3ecfcf', '#34d399', '#a78bfa', '#ff6b6b', '#fb923c'];

  // ── Sub-components ────────────────────────────────────────────
  const bannersHTML = renderDiskusiKelompokBanners(data.diskusiKelompok || [], prefix);
  const cardGridHTML = renderCardGrid(data.cardGrid || []);
  const diskusiBoxHTML = renderDiskusiBox(data.diskusiBox);

  // ── Flip cards ────────────────────────────────────────────────
  const cardsHtml = questions.length
    ? questions.map((q, i) => {
        const col = accentColors[i % accentColors.length];
        const side = i % 2 === 0 ? 'left' : 'right';
        return `<div class="rv-flip-card rv-anim-card rv-slide-${side}" data-rv-idx="${i}" data-rv-col="${col}" style="animation-delay:${0.08 + i * 0.12}s">
      <div class="rv-flip-inner">
        <div class="rv-flip-front" style="border-color:${col}44;background:${col}0a">
          <div class="rv-flip-badge" style="background:${col}22;color:${col}">${i + 1}</div>
          <div class="rv-flip-question">${esc(q.q)}</div>
          <div class="rv-flip-hint">Ketuk untuk melihat jawaban</div>
        </div>
        <div class="rv-flip-back" style="--rv-back-c1:${col}33;--rv-back-c2:${col}0a">
          <div class="rv-flip-answer-icon">💡</div>
          <div class="rv-flip-answer">${esc(q.answer)}</div>
          <div class="rv-flip-hint">Ketuk untuk kembali</div>
        </div>
      </div>
    </div>`;
      }).join('')
    : '<p style="color:var(--muted);font-size:.82rem">Review belum diisi.</p>';

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Review">
  <div class="main">
    <!-- Title card with entrance animation -->
    <div class="card rv-anim-item" style="animation-delay:0s">
      <div class="rv-title-row">
        <div class="rv-flashback-icon" aria-hidden="true">🔄</div>
        <div class="h2"><span class="hl">Review</span> Materi</div>
      </div>
      <p class="sub mt8">${esc(title)} — Ketuk kartu untuk melihat jawaban.</p>
      ${questions.length ? `<div class="rv-counter" id="${esc(prefix)}-counter">Dibaca: <strong>0/${questions.length}</strong></div>` : ''}
    </div>

    <!-- Diskusi Kelompok Banners -->
    ${bannersHTML}

    <!-- Card Grid (comparison cards) -->
    ${cardGridHTML}

    <!-- Flip cards -->
    <div class="rv-flip-grid">${cardsHtml}</div>

    <!-- Action row: Putar Semua + celebration area -->
    ${questions.length ? `
    <div class="rv-action-row rv-anim-item" style="animation-delay:${0.08 + questions.length * 0.12 + 0.1}s">
      <button class="btn btn-c btn-sm rv-btn-putar" id="${esc(prefix)}-btn-putar" onclick="rvPutarSemua_${esc(prefix)}()">🔄 Putar Semua</button>
    </div>
    <div class="rv-celebration" id="${esc(prefix)}-celebration"></div>
    ` : ''}

    <!-- Diskusi Box -->
    ${diskusiBoxHTML}

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <style>
    /* ── Entrance animations ──────────────────────────── */
    @keyframes rvSlideFromLeft {
      from { opacity: 0; transform: translateX(-40px) scale(0.95); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes rvSlideFromRight {
      from { opacity: 0; transform: translateX(40px) scale(0.95); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes rvFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes rvSpinSlow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes rvGlowPulse {
      0%, 100% { box-shadow: 0 0 8px var(--rv-glow, rgba(249,193,46,.3)), 0 0 20px var(--rv-glow, rgba(249,193,46,.1)); }
      50%     { box-shadow: 0 0 14px var(--rv-glow, rgba(249,193,46,.5)), 0 0 36px var(--rv-glow, rgba(249,193,46,.2)); }
    }
    @keyframes rvCelebBounce {
      0%   { opacity: 0; transform: scale(0.3); }
      50%  { transform: scale(1.08); }
      70%  { transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes rvTypingDot {
      0%, 60%, 100% { opacity: .2; transform: translateY(0); }
      30%           { opacity: 1;  transform: translateY(-4px); }
    }

    /* ── Hidden by default — wait for .rv-active ──── */
    .rv-anim-item,
    .rv-anim-card {
      opacity: 0;
      animation-fill-mode: both;
      animation-play-state: paused;
    }

    /* ── When screen is active, play animations ───── */
    .rv-active .rv-anim-item {
      animation-name: rvFadeUp;
      animation-duration: .5s;
      animation-timing-function: cubic-bezier(.22,1,.36,1);
      animation-play-state: running;
    }
    .rv-active .rv-anim-card.rv-slide-left {
      animation-name: rvSlideFromLeft;
      animation-duration: .5s;
      animation-timing-function: cubic-bezier(.22,1,.36,1);
      animation-play-state: running;
    }
    .rv-active .rv-anim-card.rv-slide-right {
      animation-name: rvSlideFromRight;
      animation-duration: .5s;
      animation-timing-function: cubic-bezier(.22,1,.36,1);
      animation-play-state: running;
    }

    /* ── Title row ────────────────────────────────── */
    .rv-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* ── Flashback watermark icon ─────────────────── */
    .rv-flashback-icon {
      font-size: 1.6rem;
      line-height: 1;
      animation: rvSpinSlow 6s linear infinite;
      opacity: .55;
      flex-shrink: 0;
    }

    /* ── Counter ──────────────────────────────────── */
    .rv-counter {
      margin-top: 10px;
      font-size: .78rem;
      font-weight: 700;
      color: var(--muted);
      padding: 5px 12px;
      background: rgba(255,255,255,.04);
      border: 1px solid var(--border);
      border-radius: 99px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .rv-counter strong {
      color: var(--c);
      font-weight: 900;
    }

    /* ── Flip card grid ───────────────────────────── */
    .rv-flip-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 14px;
      margin-top: 16px;
    }
    .rv-flip-card {
      perspective: 800px;
      min-height: 170px;
      cursor: pointer;
      border-radius: 14px;
      transition: box-shadow .3s;
    }
    .rv-flip-inner {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 170px;
      transition: transform .5s cubic-bezier(.4,.2,.2,1);
      transform-style: preserve-3d;
    }
    .rv-flip-card.rv-flipped .rv-flip-inner {
      transform: rotateY(180deg);
    }
    .rv-flip-front,
    .rv-flip-back {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      border-radius: 14px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .rv-flip-front {
      border: 1px solid var(--border);
      transition: border-color .3s, box-shadow .3s;
    }
    .rv-flip-back {
      transform: rotateY(180deg);
      background: linear-gradient(135deg, var(--rv-back-c1, rgba(52,211,153,.12)), var(--rv-back-c2, rgba(52,211,153,.03)));
      border: 1px solid rgba(52,211,153,.25);
    }

    /* ── 3D tilt on hover (set via JS) ────────────── */
    .rv-flip-card.rv-tilting .rv-flip-front {
      transition: border-color .2s, box-shadow .2s;
    }

    /* ── Glow border on hover ─────────────────────── */
    .rv-flip-card:hover .rv-flip-front {
      border-color: var(--rv-glow, rgba(249,193,46,.35));
      animation: rvGlowPulse 2s ease-in-out infinite;
    }
    .rv-flip-card:hover .rv-flip-back {
      border-color: var(--rv-glow, rgba(249,193,46,.35));
    }

    /* ── Flip card internals ──────────────────────── */
    .rv-flip-badge {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: .75rem;
      font-weight: 900;
      margin-bottom: 10px;
    }
    .rv-flip-question {
      font-size: .92rem;
      font-weight: 800;
      line-height: 1.5;
    }
    .rv-flip-answer-icon {
      font-size: 2rem;
      margin-bottom: 8px;
    }
    .rv-flip-answer {
      font-size: .9rem;
      font-weight: 700;
      line-height: 1.6;
      color: var(--g);
    }
    .rv-flip-hint {
      font-size: .7rem;
      color: var(--muted);
      margin-top: 10px;
      font-weight: 700;
    }

    /* ── Card grid lift ───────────────────────────── */
    .rv-nc-lift {
      transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s;
    }
    .rv-nc-lift:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 8px 24px rgba(0,0,0,.2);
    }

    /* ── Action row ───────────────────────────────── */
    .rv-action-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .rv-btn-putar {
      position: relative;
      overflow: hidden;
    }
    .rv-btn-putar::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent);
      transform: translateX(-100%);
      transition: none;
    }
    .rv-btn-putar:hover::after {
      animation: rvShine .6s ease forwards;
    }
    @keyframes rvShine {
      to { transform: translateX(100%); }
    }

    /* ── Celebration message ──────────────────────── */
    .rv-celebration {
      text-align: center;
      margin-top: 12px;
    }
    .rv-celeb-msg {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, rgba(52,211,153,.15), rgba(249,193,46,.15));
      border: 2px solid rgba(52,211,153,.35);
      border-radius: 14px;
      padding: 12px 22px;
      font-weight: 900;
      font-size: .92rem;
      color: var(--g);
      animation: rvCelebBounce .6s cubic-bezier(.22,1,.36,1) both;
    }

    /* ── Typing indicator ─────────────────────────── */
    .rv-typing-indicator {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      margin-left: 4px;
    }
    .rv-typing-indicator span {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--c);
      animation: rvTypingDot 1.4s ease-in-out infinite;
    }
    .rv-typing-indicator span:nth-child(2) { animation-delay: .2s; }
    .rv-typing-indicator span:nth-child(3) { animation-delay: .4s; }

    /* ── Diskusi box enhanced ─────────────────────── */
    .rv-diskusi-box {
      transition: border-color .3s, box-shadow .3s;
    }
    .rv-diskusi-box:focus-within {
      border-color: rgba(62,207,207,.45);
      box-shadow: 0 0 0 3px rgba(62,207,207,.1);
    }

    /* ── Responsive ───────────────────────────────── */
    @media (max-width: 540px) {
      .rv-flip-grid { grid-template-columns: 1fr; }
    }
  </style>

  <script data-rv-init="${esc(screenId)}">
  (function(){
    var SID = ${JSON.stringify(screenId)};
    var TOTAL = ${questions.length};
    var flipped = {};
    var flipCount = 0;
    var celebShown = false;

    // ── Screen activation hook ────────────────────────
    function activateAnimations() {
      var el = document.getElementById(SID);
      if (el && !el.classList.contains('rv-active')) {
        el.classList.add('rv-active');
      }
    }

    // Listen for screenActivate event
    var screenEl = document.getElementById(SID);
    if (screenEl) {
      screenEl.addEventListener('screenActivate', function() {
        activateAnimations();
      });
      // Check if already active on init
      if (screenEl.classList.contains('active')) {
        activateAnimations();
      }
    }

    // ── Flip card interaction ─────────────────────────
    function handleFlip(card) {
      var idx = parseInt(card.getAttribute('data-rv-idx'), 10);
      var isFlipped = card.classList.contains('rv-flipped');
      card.classList.toggle('rv-flipped');

      // If flipping to back (first time only), award points
      if (!isFlipped && !flipped[idx]) {
        flipped[idx] = true;
        flipCount++;
        if (typeof addScore === 'function') addScore(3);
        updateCounter();
        if (flipCount === TOTAL && !celebShown) {
          showCelebration();
        }
      }
    }

    function updateCounter() {
      var counter = document.getElementById(SID + '-counter');
      if (counter) {
        counter.innerHTML = 'Dibaca: <strong>' + flipCount + '/' + TOTAL + '</strong>';
      }
    }

    function showCelebration() {
      celebShown = true;
      var cel = document.getElementById(SID + '-celebration');
      if (!cel) return;
      cel.innerHTML = '<div class="rv-celeb-msg">🎉 Semua kartu sudah dibuka!</div>';
      if (typeof launchConfetti === 'function') launchConfetti();
    }

    // Attach click handlers to all flip cards
    function bindCards() {
      var cards = document.querySelectorAll('#' + SID + ' .rv-flip-card');
      for (var i = 0; i < cards.length; i++) {
        (function(card) {
          card.addEventListener('click', function(e) {
            // Don't flip if we were just tilting
            handleFlip(card);
          });
        })(cards[i]);
      }
    }

    // ── 3D perspective tilt on hover ──────────────────
    function bindTilt() {
      var cards = document.querySelectorAll('#' + SID + ' .rv-flip-card');
      for (var i = 0; i < cards.length; i++) {
        (function(card) {
          var col = card.getAttribute('data-rv-col') || '#f9c12e';

          card.addEventListener('mousemove', function(e) {
            if (card.classList.contains('rv-flipped')) return;
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var midX = rect.width / 2;
            var midY = rect.height / 2;
            var rotateY = ((x - midX) / midX) * 8;  // max 8deg
            var rotateX = ((midY - y) / midY) * 6;   // max 6deg
            var inner = card.querySelector('.rv-flip-inner');
            if (inner) {
              inner.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
            }
            // Set glow color
            card.style.setProperty('--rv-glow', col + '55');
            card.classList.add('rv-tilting');
          });

          card.addEventListener('mouseleave', function() {
            var inner = card.querySelector('.rv-flip-inner');
            if (inner) {
              if (card.classList.contains('rv-flipped')) {
                inner.style.transform = 'rotateY(180deg)';
              } else {
                inner.style.transform = '';
              }
            }
            card.classList.remove('rv-tilting');
          });
        })(cards[i]);
      }
    }

    // ── Putar Semua (auto-flip all) ───────────────────
    window['rvPutarSemua_' + SID] = function() {
      var cards = document.querySelectorAll('#' + SID + ' .rv-flip-card');
      var delay = 0;
      var btn = document.getElementById(SID + '-btn-putar');
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '.5';
        btn.style.pointerEvents = 'none';
      }
      for (var i = 0; i < cards.length; i++) {
        (function(card, idx) {
          if (!card.classList.contains('rv-flipped')) {
            delay += 350;
            setTimeout(function() {
              // Reset tilt before flipping
              var inner = card.querySelector('.rv-flip-inner');
              if (inner) inner.style.transform = '';
              handleFlip(card);
            }, delay);
          }
        })(cards[i], i);
      }
    };

    // ── Init ──────────────────────────────────────────
    bindCards();
    bindTilt();
  })();
  </script>

</div>`;
}
