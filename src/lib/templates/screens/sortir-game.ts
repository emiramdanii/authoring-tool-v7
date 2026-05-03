// ═══════════════════════════════════════════════════════════════
// SORTIR-GAME.TS — Sortir Game screen template for MPI export
// Generates a sorting/categorization game where students click
// items to assign them to the correct category. Includes score
// tracking, feedback, and a results summary.
// ═══════════════════════════════════════════════════════════════

import type { SortirGameSlotData } from '../engine/slot-types';

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
// renderSortirGameHTML
// ═══════════════════════════════════════════════════════════════
/**
 * Generate the Sortir Game screen HTML.
 *
 * Game mechanics:
 * 1. Items appear in a pool at the top
 * 2. Category zones are displayed below
 * 3. Player clicks an item, then clicks a category to place it
 * 4. Immediate feedback: correct = green, wrong = red + item returns to pool
 * 5. Score is tracked and shown in the navbar
 * 6. Results summary shown after all items are placed
 *
 * @param data     - SortirGameSlotData with title, items[], categories[]
 * @param screenId - DOM id for this screen (e.g. 's-sortir')
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderSortirGameHTML(data: SortirGameSlotData, screenId: string): string {
  const title = data.title || 'Game Sortir';
  const items = data.items || [];
  const categories = data.categories || [];
  const prefix = screenId;

  // Serialize data for inline JS
  const itemsJS = JSON.stringify(items.map(it => ({ text: it.text, category: it.category })));
  const categoriesJS = JSON.stringify(categories.map(c => ({ name: c.name, color: c.color })));

  const categoryZonesHtml = categories.map((c, i) => {
    return `<div class="sg-zone" id="${esc(prefix)}-zone-${i}"
      onclick="sgAssignItem('${esc(prefix)}',${i})"
      style="border-color:${esc(c.color)}44;background:${esc(c.color)}0a">
      <div class="sg-zone-header">
        <span class="sg-zone-dot" style="background:${esc(c.color)}"></span>
        <span class="sg-zone-label" style="color:${esc(c.color)}">${esc(c.name)}</span>
      </div>
      <div class="sg-zone-items" id="${esc(prefix)}-zone-items-${i}"></div>
    </div>`;
  }).join('');

  const itemsPoolHtml = items.map((it, i) => {
    return `<div class="sg-item" id="${esc(prefix)}-item-${i}"
      onclick="sgSelectItem('${esc(prefix)}',${i})">${esc(it.text)}</div>`;
  }).join('');

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">🔢 Sortir</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:35%"></div></div>
    <span class="nav-score" id="${esc(prefix)}-nav-score">0 ⭐</span>
  </nav>
  <div class="main">
    <div class="card">
      <div class="h2">🔢 <span class="hl">Game</span> Sortir</div>
      <p class="sub mt8">${esc(title)} — Klik item, lalu klik kategori yang tepat!</p>
      <div class="sg-progress" id="${esc(prefix)}-progress">
        <div class="sg-progress-bar" id="${esc(prefix)}-progress-bar"></div>
      </div>
      <div class="sg-progress-text" id="${esc(prefix)}-progress-text">0 / ${items.length} item</div>
    </div>

    <div class="card mt14">
      <div class="sg-section-label">📦 Pilih Item</div>
      <div class="sg-pool" id="${esc(prefix)}-pool">
        ${itemsPoolHtml || '<p style="color:var(--muted);font-size:.82rem">Item belum diisi.</p>'}
      </div>
    </div>

    <div class="sg-section-label mt14">🏷️ Kategori</div>
    <div class="sg-zones">
      ${categoryZonesHtml || '<p style="color:var(--muted);font-size:.82rem;padding:12px">Kategori belum diisi.</p>'}
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
    .sg-section-label{font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;padding:0 4px;}
    .sg-progress{height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:12px;}
    .sg-progress-bar{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;transition:width .4s;width:0%;}
    .sg-progress-text{font-size:.72rem;color:var(--muted);margin-top:4px;text-align:center;font-weight:800;}
    .sg-pool{display:flex;flex-wrap:wrap;gap:8px;min-height:40px;}
    .sg-item{padding:8px 16px;border-radius:10px;background:rgba(255,255,255,.06);border:2px solid var(--border);cursor:pointer;font-size:.84rem;font-weight:700;transition:all .18s;user-select:none;}
    .sg-item:hover{border-color:var(--c);background:rgba(62,207,207,.06);}
    .sg-item.sg-selected{border-color:var(--y);background:rgba(249,193,46,.1);box-shadow:0 0 12px rgba(249,193,46,.2);}
    .sg-item.sg-placed{opacity:.3;pointer-events:none;border-style:dashed;}
    .sg-item.sg-correct{border-color:var(--g);background:rgba(52,211,153,.1);opacity:1;}
    .sg-item.sg-wrong{border-color:var(--r);background:rgba(255,107,107,.1);animation:sgShake .4s ease;}
    @keyframes sgShake{0%,100%{transform:translateX(0);}25%{transform:translateX(-6px);}75%{transform:translateX(6px);}}
    .sg-zones{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;}
    .sg-zone{border:2px dashed var(--border);border-radius:14px;padding:14px;min-height:100px;transition:all .2s;cursor:pointer;}
    .sg-zone:hover{box-shadow:0 0 12px rgba(255,255,255,.05);}
    .sg-zone.sg-zone-highlight{box-shadow:0 0 16px rgba(249,193,46,.25);}
    .sg-zone-header{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
    .sg-zone-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
    .sg-zone-label{font-weight:900;font-size:.86rem;}
    .sg-zone-items{display:flex;flex-wrap:wrap;gap:6px;}
    .sg-zone-item{padding:5px 10px;border-radius:8px;font-size:.76rem;font-weight:700;}
    .sg-feedback{margin-top:12px;padding:10px 14px;border-radius:10px;font-size:.84rem;font-weight:700;text-align:center;animation:fadeIn .3s ease;}
    .sg-feedback.sg-fb-correct{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g);}
    .sg-feedback.sg-fb-wrong{background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--r);}
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
        if (prev) prev.classList.remove('sg-selected');
        sgState.selected = idx;
        var el = document.getElementById(pfx + '-item-' + idx);
        if (el) el.classList.add('sg-selected');
        var zones = document.querySelectorAll('#' + pfx + ' .sg-zone');
        for (var i = 0; i < zones.length; i++) zones[i].classList.add('sg-zone-highlight');
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
        sgState.placed[itemIdx] = catIdx;
        sgState.selected = -1;
        var zones = document.querySelectorAll('#' + pfx + ' .sg-zone');
        for (var i = 0; i < zones.length; i++) zones[i].classList.remove('sg-zone-highlight');
        if (isCorrect) {
          sgState.score++;
          itemEl.classList.remove('sg-selected');
          itemEl.classList.add('sg-placed', 'sg-correct');
          zoneItemsEl.innerHTML += '<span class="sg-zone-item" style="background:' + cat.color + '18;color:' + cat.color + '">' + item.text + '</span>';
          if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'sg-feedback sg-fb-correct';
            feedback.textContent = '✅ Benar! "' + item.text + '" masuk kategori ' + cat.name;
          }
        } else {
          itemEl.classList.remove('sg-selected');
          itemEl.classList.add('sg-wrong');
          if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'sg-feedback sg-fb-wrong';
            feedback.textContent = '❌ Salah! "' + item.text + '" bukan bagian dari ' + cat.name;
          }
          setTimeout(function() {
            itemEl.classList.remove('sg-wrong');
            delete sgState.placed[itemIdx];
          }, 800);
        }
        var placed = Object.keys(sgState.placed).length;
        var bar = document.getElementById(pfx + '-progress-bar');
        var ptxt = document.getElementById(pfx + '-progress-text');
        if (bar) bar.style.width = (placed / sgState.total * 100) + '%';
        if (ptxt) ptxt.textContent = placed + ' / ' + sgState.total + ' item';
        var navScore = document.getElementById(pfx + '-nav-score');
        if (navScore) navScore.textContent = sgState.score + ' ⭐';
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
        setTimeout(function() { feedback.style.display = 'none'; }, 100);
        var fb = document.getElementById(pfx + '-feedback');
        if (fb) fb.style.display = 'none';
      }
      window.sgResetGame = function(pfx) {
        sgState = { selected: -1, placed: {}, score: 0, total: ITEMS.length };
        for (var i = 0; i < ITEMS.length; i++) {
          var el = document.getElementById(pfx + '-item-' + i);
          if (el) el.className = 'sg-item';
        }
        for (var j = 0; j < CATEGORIES.length; j++) {
          var z = document.getElementById(pfx + '-zone-items-' + j);
          if (z) z.innerHTML = '';
        }
        var bar = document.getElementById(pfx + '-progress-bar');
        var ptxt = document.getElementById(pfx + '-progress-text');
        var fb = document.getElementById(pfx + '-feedback');
        var res = document.getElementById(pfx + '-result');
        var nav = document.getElementById(pfx + '-nav-score');
        if (bar) bar.style.width = '0%';
        if (ptxt) ptxt.textContent = '0 / ' + sgState.total + ' item';
        if (fb) fb.style.display = 'none';
        if (res) res.style.display = 'none';
        if (nav) nav.textContent = '0 ⭐';
      };
    })();
  </script>
</div>`;
}
