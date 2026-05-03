// ═══════════════════════════════════════════════════════════════
// PETUNJUK.TS — Petunjuk/Panduan screen template (Preset Quality)
// Generates a "How to Use This Media" page with:
// - Section chip with subtle glow
// - Title with gradient background
// - 2x2 grid of instructions with entrance animations
// - Tips box with pulse border animation
// - Navigation buttons
// - Score integration: +2 when all 4 items are viewed
// ═══════════════════════════════════════════════════════════════

import type { PetunjukSlotData } from '../engine/slot-types';

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
// renderPetunjukHTML
// ═══════════════════════════════════════════════════════════════
export function renderPetunjukHTML(data: PetunjukSlotData, screenId: string): string {
  const title = data.title || 'Cara Menggunakan Media Ini';
  const titleHighlight = data.titleHighlight || 'Media Ini';
  const items = data.items || [];
  const tips = data.tips || '';

  // Build instruction grid items
  const itemsHTML = items.length > 0
    ? items.map((item, i) => `
      <div class="pj-item" data-pj-idx="${i}" style="animation-delay:${i * 0.1}s">
        <div class="pj-icon">${esc(item.icon || '📌')}</div>
        <div class="pj-title">${esc(item.title || '')}</div>
        <div class="pj-body">${esc(item.body || '')}</div>
        <div class="pj-viewed-check" aria-hidden="true">✓</div>
      </div>`).join('\n      ')
    : `<div class="pj-item" data-pj-idx="0" style="animation-delay:0s"><div class="pj-icon">📖</div><div class="pj-title">Baca & Eksplorasi</div><div class="pj-body">Pelajari setiap halaman dengan saksama. Ikuti alur dari awal sampai akhir.</div><div class="pj-viewed-check" aria-hidden="true">✓</div></div>
      <div class="pj-item" data-pj-idx="1" style="animation-delay:0.1s"><div class="pj-icon">💬</div><div class="pj-title">Diskusi & Tulis</div><div class="pj-body">Jawab pertanyaan diskusi — jawabanmu otomatis tersimpan.</div><div class="pj-viewed-check" aria-hidden="true">✓</div></div>
      <div class="pj-item" data-pj-idx="2" style="animation-delay:0.2s"><div class="pj-icon">🎮</div><div class="pj-title">Game Interaktif</div><div class="pj-body">Uji pemahamanmu dengan game seru. Setiap jawaban benar memberi poin!</div><div class="pj-viewed-check" aria-hidden="true">✓</div></div>
      <div class="pj-item" data-pj-idx="3" style="animation-delay:0.3s"><div class="pj-icon">📝</div><div class="pj-title">Refleksi</div><div class="pj-body">Tuliskan refleksimu di akhir pembelajaran. Jawaban akan jadi portofoliomu.</div><div class="pj-viewed-check" aria-hidden="true">✓</div></div>`;

  // Tips box
  const tipsHTML = tips
    ? `<div class="pj-tips">
      💡 <strong class="pj-tips-label">Tips:</strong> ${esc(tips)}
    </div>`
    : '';

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Petunjuk">
  <style>
    /* ── Petunjuk scoped styles (.pj- prefix) ─────────────── */

    /* Title gradient background */
    .pj-title-area {
      background: linear-gradient(135deg, rgba(62,207,207,.06) 0%, rgba(249,193,46,.06) 100%);
      border-radius: 14px;
      padding: 16px 18px 14px;
      margin-bottom: 16px;
    }

    /* Chip with subtle glow */
    .pj-chip {
      background: rgba(62,207,207,.15);
      color: var(--c);
      box-shadow: 0 0 10px rgba(62,207,207,.2), 0 0 3px rgba(62,207,207,.1);
    }

    /* Instruction grid */
    .pj-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    /* Individual instruction item */
    .pj-item {
      position: relative;
      background: rgba(255,255,255,.04);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      cursor: pointer;
      transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
      user-select: none;
      -webkit-user-select: none;

      /* Entrance animation — hidden until .pj-active */
      opacity: 0;
      transform: translateY(16px);
    }

    /* Entrance animation trigger */
    .pj-active .pj-item {
      animation: pjFadeInUp .45s ease forwards;
    }

    /* Hover: lift + shadow */
    .pj-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,.25), 0 0 0 1px rgba(62,207,207,.15);
      background: rgba(62,207,207,.06);
      border-color: rgba(62,207,207,.25);
    }

    /* Active / pressed: scale down */
    .pj-item.pj-pressed {
      transform: scale(.95) !important;
      transition: transform .1s ease;
    }

    /* Viewed state */
    .pj-item.pj-viewed {
      border-color: rgba(52,211,153,.3);
      background: rgba(52,211,153,.04);
    }
    .pj-item.pj-viewed:hover {
      background: rgba(52,211,153,.08);
      border-color: rgba(52,211,153,.4);
    }

    /* Viewed checkmark */
    .pj-viewed-check {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(52,211,153,.2);
      color: var(--g, #34d399);
      font-size: .6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0);
      transition: opacity .3s ease, transform .3s ease;
    }
    .pj-item.pj-viewed .pj-viewed-check {
      opacity: 1;
      transform: scale(1);
    }

    /* Icon */
    .pj-icon {
      font-size: 1.6rem;
      margin-bottom: 6px;
    }

    /* Item title */
    .pj-item > .pj-title {
      font-family: 'Fredoka One', cursive, sans-serif;
      font-size: .88rem;
      font-weight: 700;
      margin-bottom: 4px;
      color: var(--fg, #e0e0e0);
    }

    /* Item body */
    .pj-body {
      font-size: .76rem;
      line-height: 1.5;
      color: var(--muted, #8899aa);
    }

    /* Tips box */
    .pj-tips {
      background: rgba(249,193,46,.07);
      border: 1px solid rgba(249,193,46,.25);
      border-radius: 12px;
      padding: 13px 14px;
      font-size: .82rem;
      line-height: 1.6;

      /* Entrance — hidden until .pj-active */
      opacity: 0;
      transform: translateY(12px);
    }
    .pj-active .pj-tips {
      animation: pjFadeInUp .45s ease forwards, pjPulseBorder 2.5s ease-in-out infinite .9s;
      animation-delay: .45s, .9s;
    }
    .pj-tips-label {
      color: var(--y, #f9c12e);
    }

    /* Title entrance */
    .pj-title-area {
      opacity: 0;
      transform: translateY(12px);
    }
    .pj-active .pj-title-area {
      animation: pjFadeInUp .5s ease forwards;
      animation-delay: 0s;
    }

    /* ── Keyframes ──────────────────────────────────────────── */
    @keyframes pjFadeInUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pjPulseBorder {
      0%, 100% {
        border-color: rgba(249,193,46,.25);
      }
      50% {
        border-color: rgba(249,193,46,.55);
      }
    }

    /* Score toast */
    .pj-score-toast {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(52,211,153,.15);
      border: 1px solid rgba(52,211,153,.3);
      color: var(--g, #34d399);
      font-family: 'Fredoka One', cursive, sans-serif;
      font-size: .85rem;
      padding: 8px 18px;
      border-radius: 99px;
      opacity: 0;
      transition: opacity .3s ease, transform .3s ease;
      z-index: 100;
      pointer-events: none;
    }
    .pj-score-toast.pj-toast-show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* Responsive: single column on narrow screens */
    @media (max-width: 480px) {
      .pj-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>

  <div class="main pj-container">
    <span class="chip-sc pj-chip">📌 Petunjuk</span>

    <div class="pj-title-area">
      <h2 class="h2" style="margin:0">${esc(title.replace(titleHighlight, ''))}<br><span class="hl">${esc(titleHighlight)}</span></h2>
    </div>

    <div class="pj-grid">
      ${itemsHTML}
    </div>

    ${tipsHTML}

    <div class="btn-row">
      <button class="btn btn-ghost btn-sm" onclick="goPrevScreen()">← Kembali</button>
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
    </div>
  </div>

  <div class="pj-score-toast" id="pjScoreToast-${esc(screenId)}">+2 poin 🎉 Semua petunjuk dibaca!</div>

  <script data-pj-init="${esc(screenId)}">
  (function(){
    var screenEl = document.getElementById('${esc(screenId)}');
    if (!screenEl) return;

    var container = screenEl.querySelector('.pj-container');
    var scoreToast = document.getElementById('pjScoreToast-${esc(screenId)}');

    // ── Score tracking ─────────────────────────────────
    var viewedItems = {};
    var totalItems = screenEl.querySelectorAll('.pj-item').length;
    var scoreAwarded = false;

    function checkAllViewed() {
      if (scoreAwarded) return;
      var count = 0;
      for (var k in viewedItems) {
        if (viewedItems[k]) count++;
      }
      if (count >= totalItems && totalItems > 0) {
        scoreAwarded = true;
        if (typeof addScore === 'function') addScore(2);
        // Show toast
        if (scoreToast) {
          scoreToast.classList.add('pj-toast-show');
          setTimeout(function() {
            scoreToast.classList.remove('pj-toast-show');
          }, 2200);
        }
      }
    }

    // ── Item click handling ────────────────────────────
    var pjItems = screenEl.querySelectorAll('.pj-item');
    for (var i = 0; i < pjItems.length; i++) {
      (function(el, idx) {
        el.addEventListener('click', function() {
          // Card press animation
          el.classList.add('pj-pressed');
          setTimeout(function() {
            el.classList.remove('pj-pressed');
          }, 150);

          // Mark as viewed
          if (!viewedItems[idx]) {
            viewedItems[idx] = true;
            el.classList.add('pj-viewed');
            checkAllViewed();
          }
        });
      })(pjItems[i], i);
    }

    // ── Activate entrance animations ───────────────────
    function activateAnimations() {
      if (container) {
        container.classList.add('pj-active');
      }
    }

    // ── screenActivate event listener ──────────────────
    var hasActivated = false;
    screenEl.addEventListener('screenActivate', function() {
      if (!hasActivated) {
        hasActivated = true;
        activateAnimations();
      }
    });

    // If already active on init
    if (screenEl.classList.contains('active') && !hasActivated) {
      hasActivated = true;
      activateAnimations();
    }
  })();
  </script>
</div>`;
}
