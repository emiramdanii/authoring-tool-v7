// ═══════════════════════════════════════════════════════════════
// SORTIR-GAME.TS — Sortir Game screen template for MPI export
// Generates a sorting/categorization game where students click
// pill-style items to assign them to category columns. Includes
// flyOut animation, highlight states, score tracking, feedback,
// and a results summary. Visual style matches the preset HTML.
// ═══════════════════════════════════════════════════════════════

import type { SortirGameSlotData } from '../engine/slot-types';
import { esc } from '../engine/esc';

// ═══════════════════════════════════════════════════════════════
// renderSortirGameHTML
// ═══════════════════════════════════════════════════════════════
/**
 * Generate the Sortir Game screen HTML.
 *
 * Game mechanics:
 * 1. Items appear as pills in a dashed-border pool at the top
 * 2. Category columns are displayed in a 2-column grid below
 * 3. Player clicks an item (gets selected outline), then clicks a category
 * 4. Correct: item plays flyOut animation, pill appears in category column
 * 5. Wrong: item shakes and returns to pool
 * 6. Score is tracked and shown in the navbar
 * 7. Results summary shown after all items are placed
 *
 * @param data     - SortirGameSlotData with title, items[], categories[], diskusiHint?
 * @param screenId - DOM id for this screen (e.g. 's-sortir')
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderSortirGameHTML(data: SortirGameSlotData, screenId: string): string {
  const title = data.title || 'Game Sortir';
  const items = data.items || [];
  const categories = data.categories || [];
  const diskusiHint = data.diskusiHint || '';
  const prefix = screenId;

  // Serialize data for inline JS
  const itemsJS = JSON.stringify(items.map(it => ({ text: it.text, category: it.category })));
  const categoriesJS = JSON.stringify(categories.map(c => ({ name: c.name, color: c.color })));

  // ── Diskusi hint banner ──────────────────────────────────────
  const diskusiHintHtml = diskusiHint
    ? `<div class="game-diskusi-hint">
        <strong>Diskusi kelompok:</strong> ${esc(diskusiHint)}
      </div>`
    : '';

  // ── Item pills in pool ───────────────────────────────────────
  const itemsPoolHtml = items.map((it, i) => {
    return `<div class="sortir-kartu" id="${esc(prefix)}-item-${i}"
      onclick="sgSelectItem('${esc(prefix)}',${i})">${esc(it.text)}</div>`;
  }).join('');

  // ── Category columns ─────────────────────────────────────────
  const categoryColumnsHtml = categories.map((c, i) => {
    return `<div class="sortir-kolom" id="${esc(prefix)}-zone-${i}"
      onclick="sgAssignItem('${esc(prefix)}',${i})"
      style="border-color:${esc(c.color)}33">
      <div class="sortir-kolom-title" style="color:${esc(c.color)}">${esc(c.name)}</div>
      <div class="sortir-kolom-items" id="${esc(prefix)}-zone-items-${i}"></div>
    </div>`;
  }).join('');

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Game Sortir">
  <div class="main">
    <span class="chip-sc" style="background:rgba(62,207,207,.15);color:var(--c)">🎮 Game Sortir · ±15 Menit</span>

    <div class="card">
      <div class="h2">🔢 <span class="hl">Game</span> Sortir</div>
      <p class="sub mt8">${esc(title)} — Klik item, lalu klik kategori yang tepat!</p>
      <div class="sg-progress" id="${esc(prefix)}-progress">
        <div class="sg-progress-bar" id="${esc(prefix)}-progress-bar"></div>
      </div>
      <div class="sg-progress-text" id="${esc(prefix)}-progress-text">0 / ${items.length} item</div>
    </div>

    ${diskusiHintHtml}

    <div class="card mt14">
      <div class="sg-section-label">📦 Pilih Item</div>
      <div class="sortir-kartu-pool" id="${esc(prefix)}-pool">
        ${itemsPoolHtml || '<p style="color:var(--muted);font-size:.82rem">Item belum diisi.</p>'}
      </div>
    </div>

    <div class="sg-section-label mt14">🏷️ Kategori</div>
    <div class="sortir-kolom-grid" id="${esc(prefix)}-zones">
      ${categoryColumnsHtml || '<p style="color:var(--muted);font-size:.82rem;padding:12px">Kategori belum diisi.</p>'}
    </div>

    <div class="sg-feedback" id="${esc(prefix)}-feedback" style="display:none"></div>

    <div class="sg-result" id="${esc(prefix)}-result" style="display:none">
      <div class="card" style="text-align:center">
        <div style="font-size:3rem;margin-bottom:8px">🎉</div>
        <div class="h2" style="font-size:1.3rem">Hasil Game Sortir</div>
        <div class="sg-result-score" id="${esc(prefix)}-result-score">0</div>
        <div class="sg-result-label">jawaban benar</div>
        <div class="sg-result-detail" id="${esc(prefix)}-result-detail"></div>
      </div>
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-ghost" onclick="sgResetGame('${esc(prefix)}')">↻ Ulangi</button>
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
  <style>
    /* ── Section chip ──────────────────────────────────────────── */
    .chip-sc{display:inline-block;padding:5px 12px;border-radius:99px;font-size:.72rem;font-weight:800;letter-spacing:.03em;margin-bottom:10px;}
    /* ── Section label ─────────────────────────────────────────── */
    .sg-section-label{font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;padding:0 4px;}
    /* ── Progress bar ──────────────────────────────────────────── */
    .sg-progress{height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:12px;}
    .sg-progress-bar{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;transition:width .4s;width:0%;}
    .sg-progress-text{font-size:.72rem;color:var(--muted);margin-top:4px;text-align:center;font-weight:800;}
    /* ── Discussion hint banner ────────────────────────────────── */
    .game-diskusi-hint{background:rgba(249,193,46,.08);border:1px solid rgba(249,193,46,.2);border-radius:13px;padding:12px 16px;font-size:.82rem;line-height:1.6;color:var(--text);margin-top:12px;}
    .game-diskusi-hint strong{color:var(--y);}
    /* ── Item pool (dashed border) ────────────────────────────── */
    .sortir-kartu-pool{display:flex;flex-wrap:wrap;gap:8px;min-height:52px;padding:12px;background:rgba(255,255,255,.03);border:2px dashed rgba(255,255,255,.1);border-radius:13px;margin-bottom:14px;}
    /* ── Item pills ───────────────────────────────────────────── */
    .sortir-kartu{padding:8px 14px;border-radius:99px;font-size:.8rem;font-weight:800;cursor:pointer;border:2px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:var(--text);transition:all .25s;user-select:none;}
    .sortir-kartu:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.4);}
    .sortir-kartu.selected{outline:3px solid var(--y);outline-offset:2px;transform:scale(1.06);}
    .sortir-kartu.placed{opacity:.25;pointer-events:none;border-style:dashed;}
    .sortir-kartu.wrong{border-color:var(--r);background:rgba(255,107,107,.1);animation:sgShake .4s ease;}
    @keyframes flyOut{0%{opacity:1;transform:scale(1);}60%{opacity:.8;transform:scale(1.15) translateY(-8px);}100%{opacity:0;transform:scale(.4) translateY(-20px);}}
    .sortir-kartu.flying{animation:flyOut .38s ease forwards;pointer-events:none;}
    @keyframes sgShake{0%,100%{transform:translateX(0);}25%{transform:translateX(-6px);}75%{transform:translateX(6px);}}
    /* ── Category column grid ─────────────────────────────────── */
    .sortir-kolom-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
    .sortir-kolom{border-radius:13px;padding:12px;min-height:80px;border:2px solid rgba(255,255,255,.1);cursor:pointer;transition:all .2s;}
    .sortir-kolom:hover{border-color:var(--c);}
    .sortir-kolom.highlight{border-color:var(--y);background:rgba(249,193,46,.05);transform:scale(1.01);}
    .sortir-kolom-title{font-size:.74rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}
    .sortir-kolom-items{display:flex;flex-wrap:wrap;gap:5px;min-height:32px;}
    .sortir-item-placed{padding:5px 10px;border-radius:99px;font-size:.75rem;font-weight:700;animation:fadeIn .3s ease;}
    /* ── Feedback toast ────────────────────────────────────────── */
    .sg-feedback{margin-top:12px;padding:10px 14px;border-radius:10px;font-size:.84rem;font-weight:700;text-align:center;animation:fadeIn .3s ease;}
    .sg-feedback.sg-fb-correct{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g);}
    .sg-feedback.sg-fb-wrong{background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--r);}
    /* ── Result card ───────────────────────────────────────────── */
    .sg-result-score{font-family:'Fredoka One',cursive;font-size:2.4rem;color:var(--g);margin:10px 0 2px;}
    .sg-result-label{font-size:.8rem;color:var(--muted);font-weight:800;margin-bottom:10px;}
    .sg-result-detail{font-size:.84rem;color:var(--muted);line-height:1.6;}
  </style>
  <script>
    (function() {
      var prefix = '${esc(prefix)}';
      var ITEMS = ${itemsJS};
      var CATEGORIES = ${categoriesJS};
      var sgState = { selected: -1, placed: {}, score: 0, total: ITEMS.length };

      window.sgSelectItem = function(pfx, idx) {
        if (sgState.placed[idx] !== undefined) return;
        var prev = document.getElementById(pfx + '-item-' + sgState.selected);
        if (prev) prev.classList.remove('selected');
        sgState.selected = idx;
        var el = document.getElementById(pfx + '-item-' + idx);
        if (el) el.classList.add('selected');
        // Highlight all category columns
        var cols = document.querySelectorAll('#' + pfx + ' .sortir-kolom');
        for (var i = 0; i < cols.length; i++) cols[i].classList.add('highlight');
      };

      window.sgAssignItem = function(pfx, catIdx) {
        if (sgState.selected < 0) return;
        var itemIdx = sgState.selected;
        var item = ITEMS[itemIdx];
        var cat = CATEGORIES[catIdx];
        var feedback = document.getElementById(pfx + '-feedback');
        var itemEl = document.getElementById(pfx + '-item-' + itemIdx);
        var zoneItemsEl = document.getElementById(pfx + '-zone-items-' + catIdx);
        if (!item || !cat || !itemEl || !zoneItemsEl) return;
        var isCorrect = item.category === cat.name;

        sgState.selected = -1;
        // Remove highlight from all columns
        var cols = document.querySelectorAll('#' + pfx + ' .sortir-kolom');
        for (var i = 0; i < cols.length; i++) cols[i].classList.remove('highlight');

        if (isCorrect) {
          sgState.score++;
          sgState.placed[itemIdx] = catIdx;
          itemEl.classList.remove('selected');
          // Play flyOut animation, then mark as placed
          itemEl.classList.add('flying');
          setTimeout(function() {
            itemEl.classList.remove('flying');
            itemEl.classList.add('placed');
          }, 380);
          // Add placed pill into the category column
          zoneItemsEl.innerHTML += '<span class="sortir-item-placed" style="background:' + cat.color + '18;color:' + cat.color + '">' + item.text + '</span>';
          if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'sg-feedback sg-fb-correct';
            feedback.textContent = '✅ Benar! "' + item.text + '" masuk kategori ' + cat.name;
          }
          // Use global scoring system
          if (typeof addScore === 'function') addScore(10);
        } else {
          itemEl.classList.remove('selected');
          itemEl.classList.add('wrong');
          if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'sg-feedback sg-fb-wrong';
            feedback.textContent = '❌ Salah! "' + item.text + '" bukan bagian dari ' + cat.name;
          }
          setTimeout(function() {
            itemEl.classList.remove('wrong');
          }, 800);
        }

        var placed = Object.keys(sgState.placed).length;
        var bar = document.getElementById(pfx + '-progress-bar');
        var ptxt = document.getElementById(pfx + '-progress-text');
        if (bar) bar.style.width = (placed / sgState.total * 100) + '%';
        if (ptxt) ptxt.textContent = placed + ' / ' + sgState.total + ' item';
        if (typeof updateNavbarScore === 'function') updateNavbarScore();
        if (placed >= sgState.total) sgShowResult(pfx);
      };

      function sgShowResult(pfx) {
        var resultEl = document.getElementById(pfx + '-result');
        var scoreEl = document.getElementById(pfx + '-result-score');
        var detailEl = document.getElementById(pfx + '-result-detail');
        if (resultEl) resultEl.style.display = 'block';
        if (scoreEl) scoreEl.textContent = sgState.score + ' / ' + sgState.total;
        if (detailEl) {
          var pct = Math.round((sgState.score / sgState.total) * 100);
          var msg = pct >= 85 ? '🌟 Luar biasa!' : pct >= 70 ? '👍 Bagus!' : '💪 Ayo coba lagi!';
          detailEl.textContent = msg + ' Skor: ' + pct + '%';
        }
        var fb = document.getElementById(pfx + '-feedback');
        if (fb) fb.style.display = 'none';
      }

      window.sgResetGame = function(pfx) {
        sgState = { selected: -1, placed: {}, score: 0, total: ITEMS.length };
        for (var i = 0; i < ITEMS.length; i++) {
          var el = document.getElementById(pfx + '-item-' + i);
          if (el) el.className = 'sortir-kartu';
        }
        for (var j = 0; j < CATEGORIES.length; j++) {
          var z = document.getElementById(pfx + '-zone-items-' + j);
          if (z) z.innerHTML = '';
          var col = document.getElementById(pfx + '-zone-' + j);
          if (col) col.classList.remove('highlight');
        }
        var bar = document.getElementById(pfx + '-progress-bar');
        var ptxt = document.getElementById(pfx + '-progress-text');
        var fb = document.getElementById(pfx + '-feedback');
        var res = document.getElementById(pfx + '-result');

        if (bar) bar.style.width = '0%';
        if (ptxt) ptxt.textContent = '0 / ' + sgState.total + ' item';
        if (fb) fb.style.display = 'none';
        if (res) res.style.display = 'none';
        if (typeof updateNavbarScore === 'function') updateNavbarScore();
      };
    })();
  </script>
</div>`;
}
