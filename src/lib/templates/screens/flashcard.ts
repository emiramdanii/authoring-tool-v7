// ═══════════════════════════════════════════════════════════════
// FLASHCARD.TS — Flashcard deck screen template
// Generates an interactive flashcard deck with flip animation,
// next/prev navigation, and card counter.
// ═══════════════════════════════════════════════════════════════

import type { FlashcardSlotData } from '../engine/slot-types';

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
// MAIN EXPORT — renderFlashcardHTML
// ═══════════════════════════════════════════════════════════════
export function renderFlashcardHTML(data: FlashcardSlotData, screenId: string): string {
  const cards = data.cards || [];
  const cardsJS = JSON.stringify(
    cards.map((c) => ({
      front: c.front,
      back: c.back,
      icon: c.icon || '🃏',
    })),
  );

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">${esc(data.title || 'Flashcard')}</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:50%"></div></div>
    <span class="nav-score" id="fcNavScore">0 ⭐</span>
  </nav>
  <div class="main" style="text-align:center">
    <div class="card" style="margin-bottom:14px">
      <div class="h2">🃏 <span class="hl">Flashcard</span></div>
      <p class="sub mt8">${cards.length} kartu · Klik kartu untuk membalik, lalu navigasi dengan tombol.</p>
    </div>

    <div id="fcDeckContainer">
      ${cards.length
        ? `<div style="position:relative;perspective:1200px;max-width:400px;margin:0 auto;min-height:260px">
            <div id="fcCard" class="fc-card-flipper" onclick="fcFlip()" style="position:relative;width:100%;min-height:260px;cursor:pointer;transition:transform .6s cubic-bezier(.4,.2,.2,1);transform-style:preserve-3d">
              <!-- Front -->
              <div style="position:absolute;inset:0;backface-visibility:hidden;background:var(--card);border:2px solid var(--border);border-radius:var(--rad);padding:28px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
                <div id="fcFrontIcon" style="font-size:3rem;margin-bottom:12px">🃏</div>
                <div id="fcFrontText" style="font-size:1.1rem;font-weight:800;line-height:1.5"></div>
                <div style="margin-top:16px;font-size:.72rem;color:var(--muted);font-weight:700">👆 Ketuk untuk membalik</div>
              </div>
              <!-- Back -->
              <div style="position:absolute;inset:0;backface-visibility:hidden;background:rgba(62,207,207,.06);border:2px solid rgba(62,207,207,.25);border-radius:var(--rad);padding:28px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transform:rotateY(180deg)">
                <div id="fcBackIcon" style="font-size:1.6rem;margin-bottom:10px">✅</div>
                <div id="fcBackText" style="font-size:1rem;font-weight:700;line-height:1.6;color:var(--c)"></div>
                <div style="margin-top:16px;font-size:.72rem;color:var(--muted);font-weight:700">👆 Ketuk untuk kembali</div>
              </div>
            </div>
          </div>

          <!-- Card counter & navigation -->
          <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-top:18px">
            <button class="btn btn-ghost btn-sm" onclick="fcPrev()" id="btnFcPrev" style="opacity:.4">← Sebelumnya</button>
            <div style="font-weight:900;font-size:.88rem;color:var(--muted)">
              <span id="fcCurrentNum">1</span> / <span id="fcTotalNum">${cards.length}</span>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="fcNext()" id="btnFcNext">Selanjutnya →</button>
          </div>

          <!-- Progress dots -->
          <div id="fcDots" style="display:flex;gap:6px;justify-content:center;margin-top:12px;flex-wrap:wrap">
            ${cards.map((_, i) => `<div id="fcDot${i}" style="width:8px;height:8px;border-radius:50%;background:${i === 0 ? 'var(--y)' : 'rgba(255,255,255,.12)'};transition:all .3s"></div>`).join('')}
          </div>

          <!-- Mastery toggle -->
          <div style="margin-top:16px">
            <button class="btn btn-sm" id="btnFcMaster" onclick="fcToggleMaster()" style="background:rgba(255,255,255,.06);border:1px solid var(--border);color:var(--muted)">
              🤔 Belum Hafal
            </button>
          </div>`
        : '<div class="card" style="text-align:center;padding:30px;color:var(--muted)">Kartu flashcard belum diisi.</div>'}
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" id="btnFcDone" onclick="goNextScreen()" style="display:${cards.length ? 'inline-flex' : 'inline-flex'}">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <script data-fc-init="${esc(screenId)}">
  (function(){
    var CARDS = ${cardsJS};
    var cur = 0;
    var flipped = false;
    var mastered = {};
    var fcScore = 0;

    function renderCard(){
      if(!CARDS.length) return;
      var c = CARDS[cur];
      var frontIcon = document.getElementById('fcFrontIcon');
      var frontText = document.getElementById('fcFrontText');
      var backText = document.getElementById('fcBackText');
      var backIcon = document.getElementById('fcBackIcon');
      if(frontIcon) frontIcon.textContent = c.icon || '🃏';
      if(frontText) frontText.textContent = c.front || '';
      if(backText) backText.textContent = c.back || '';
      if(backIcon) backIcon.textContent = '✅';

      // Reset flip
      flipped = false;
      var card = document.getElementById('fcCard');
      if(card) card.style.transform = 'rotateY(0deg)';

      // Update counter
      var numEl = document.getElementById('fcCurrentNum');
      if(numEl) numEl.textContent = (cur + 1);

      // Update dots
      for(var i=0;i<CARDS.length;i++){
        var dot = document.getElementById('fcDot'+i);
        if(dot){
          dot.style.background = i===cur ? 'var(--y)' : (mastered[i] ? 'var(--g)' : 'rgba(255,255,255,.12)');
          dot.style.width = i===cur ? '12px' : '8px';
        }
      }

      // Update prev/next opacity
      var prevBtn = document.getElementById('btnFcPrev');
      var nextBtn = document.getElementById('btnFcNext');
      if(prevBtn) prevBtn.style.opacity = cur===0 ? '.4' : '1';
      if(nextBtn) nextBtn.style.opacity = cur===CARDS.length-1 ? '.4' : '1';

      // Update mastery button
      updateMasterBtn();
    }

    function updateMasterBtn(){
      var btn = document.getElementById('btnFcMaster');
      if(!btn) return;
      if(mastered[cur]){
        btn.innerHTML = '✅ Sudah Hafal';
        btn.style.background = 'rgba(52,211,153,.1)';
        btn.style.borderColor = 'rgba(52,211,153,.3)';
        btn.style.color = 'var(--g)';
      } else {
        btn.innerHTML = '🤔 Belum Hafal';
        btn.style.background = 'rgba(255,255,255,.06)';
        btn.style.borderColor = 'var(--border)';
        btn.style.color = 'var(--muted)';
      }
    }

    window.fcFlip = function(){
      flipped = !flipped;
      var card = document.getElementById('fcCard');
      if(card) card.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    };

    window.fcNext = function(){
      if(cur < CARDS.length - 1){ cur++; renderCard(); }
    };

    window.fcPrev = function(){
      if(cur > 0){ cur--; renderCard(); }
    };

    window.fcToggleMaster = function(){
      mastered[cur] = !mastered[cur];
      if(mastered[cur]) fcScore += 5;
      else fcScore = Math.max(0, fcScore - 5);

      var navEl = document.getElementById('fcNavScore');
      if(navEl) navEl.textContent = fcScore + ' ⭐';

      updateMasterBtn();

      // Update dots
      var dot = document.getElementById('fcDot'+cur);
      if(dot) dot.style.background = mastered[cur] ? 'var(--g)' : 'var(--y)';

      // Update global navbar scores
      var scoreEls = document.querySelectorAll('.nav-score');
      for(var i=0;i<scoreEls.length;i++){
        scoreEls[i].textContent = fcScore + ' ⭐';
      }
    };

    // Initialize first card
    if(CARDS.length) renderCard();
  })();
  </script>
</div>`;
}
