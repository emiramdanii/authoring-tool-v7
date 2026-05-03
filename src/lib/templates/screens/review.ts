// ═══════════════════════════════════════════════════════════════
// REVIEW.TS — Review / Recall screen template for MPI export
// Generates a review page with question-answer flip card pairs.
// Students tap a card to reveal the answer on the back.
// ═══════════════════════════════════════════════════════════════

import type { ReviewSlotData } from '../engine/slot-types';

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
// renderReviewHTML
// ═══════════════════════════════════════════════════════════════
/**
 * Generate the Review / Recall screen HTML.
 *
 * Uses flip-card interaction: each card shows the question on the
 * front and reveals the answer when tapped.
 *
 * @param data     - ReviewSlotData with title and questions[]
 * @param screenId - DOM id for this screen (e.g. 's-review')
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderReviewHTML(data: ReviewSlotData, screenId: string): string {
  const title = data.title || 'Review Materi';
  const questions = data.questions || [];

  const accentColors = ['#f9c12e', '#3ecfcf', '#34d399', '#a78bfa', '#ff6b6b', '#fb923c'];

  const cardsHtml = questions.length
    ? questions.map((q, i) => {
        const col = accentColors[i % accentColors.length];
        return `<div class="rv-flip-card" onclick="this.classList.toggle('rv-flipped')">
      <div class="rv-flip-inner">
        <div class="rv-flip-front" style="border-color:${col}44;background:${col}0a">
          <div class="rv-flip-badge" style="background:${col}22;color:${col}">${i + 1}</div>
          <div class="rv-flip-question">${esc(q.q)}</div>
          <div class="rv-flip-hint">Ketuk untuk melihat jawaban</div>
        </div>
        <div class="rv-flip-back" style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.25)">
          <div class="rv-flip-answer-icon">💡</div>
          <div class="rv-flip-answer">${esc(q.answer)}</div>
          <div class="rv-flip-hint">Ketuk untuk kembali</div>
        </div>
      </div>
    </div>`;
      }).join('')
    : '<p style="color:var(--muted);font-size:.82rem">Review belum diisi.</p>';

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">🔄 Review</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:20%"></div></div>
    <span class="nav-score">0 ⭐</span>
  </nav>
  <div class="main">
    <div class="card">
      <div class="h2">🔄 <span class="hl">Review</span> Materi</div>
      <p class="sub mt8">${esc(title)} — Ketuk kartu untuk melihat jawaban.</p>
    </div>
    <div class="rv-flip-grid">${cardsHtml}</div>
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
  <style>
    .rv-flip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-top:16px;}
    .rv-flip-card{perspective:800px;min-height:170px;cursor:pointer;}
    .rv-flip-inner{position:relative;width:100%;height:100%;min-height:170px;transition:transform .5s;transform-style:preserve-3d;}
    .rv-flip-card.rv-flipped .rv-flip-inner{transform:rotateY(180deg);}
    .rv-flip-front,.rv-flip-back{position:absolute;inset:0;backface-visibility:hidden;border-radius:14px;padding:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}
    .rv-flip-front{border:1px solid var(--border);}
    .rv-flip-back{transform:rotateY(180deg);}
    .rv-flip-badge{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:900;margin-bottom:10px;}
    .rv-flip-question{font-size:.92rem;font-weight:800;line-height:1.5;}
    .rv-flip-answer-icon{font-size:2rem;margin-bottom:8px;}
    .rv-flip-answer{font-size:.9rem;font-weight:700;line-height:1.6;color:var(--g);}
    .rv-flip-hint{font-size:.7rem;color:var(--muted);margin-top:10px;font-weight:700;}
  </style>
</div>`;
}
