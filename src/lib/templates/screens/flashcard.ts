// ═══════════════════════════════════════════════════════════════
// FLASHCARD.TS — Flashcard deck screen template (PRESET QUALITY)
// Generates an interactive flashcard deck with flip animation,
// next/prev navigation, mastery tracking, swipe/keyboard gestures,
// entrance animations, celebration, and visual polish.
// ═══════════════════════════════════════════════════════════════

import type { FlashcardSlotData } from '../engine/slot-types';
import { esc } from '../engine/esc';

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

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Kartu Kilat">
<style>
/* ── Entrance Animations ──────────────────────────────────── */
#${esc(screenId)} .fc-deck-wrap {
  opacity: 0;
  transform: scale(0.9);
  transition: opacity .5s cubic-bezier(.4,0,.2,1), transform .5s cubic-bezier(.4,0,.2,1);
}
#${esc(screenId)}.fc-active .fc-deck-wrap {
  opacity: 1;
  transform: scale(1);
}
#${esc(screenId)} .fc-title-card {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity .45s ease, transform .45s ease;
  transition-delay: .05s;
}
#${esc(screenId)}.fc-active .fc-title-card {
  opacity: 1;
  transform: translateY(0);
}
#${esc(screenId)} .fc-counter-row {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .4s ease, transform .4s ease;
  transition-delay: .2s;
}
#${esc(screenId)}.fc-active .fc-counter-row {
  opacity: 1;
  transform: translateY(0);
}
#${esc(screenId)} .fc-dots-row {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .4s ease, transform .4s ease;
  transition-delay: .3s;
}
#${esc(screenId)}.fc-active .fc-dots-row {
  opacity: 1;
  transform: translateY(0);
}
#${esc(screenId)} .fc-mastery-row {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .4s ease, transform .4s ease;
  transition-delay: .4s;
}
#${esc(screenId)}.fc-active .fc-mastery-row {
  opacity: 1;
  transform: translateY(0);
}

/* ── Card Depth Layers ────────────────────────────────────── */
.fc-depth-layer {
  position: absolute;
  inset: 0;
  border-radius: var(--rad);
  background: var(--card);
  border: 2px solid var(--border);
  pointer-events: none;
  transition: transform .35s cubic-bezier(.4,0,.2,1), opacity .35s ease, box-shadow .35s ease;
}
.fc-depth-1 { transform: translateY(6px) scale(.97); opacity: .4; z-index: 0; }
.fc-depth-2 { transform: translateY(12px) scale(.94); opacity: .2; z-index: -1; }

/* ── Card Flip & 3D Shadow ────────────────────────────────── */
.fc-card-perspective {
  position: relative;
  perspective: 1200px;
  max-width: 400px;
  margin: 0 auto;
  min-height: 280px;
}
.fc-card-flipper {
  position: relative;
  width: 100%;
  min-height: 280px;
  cursor: pointer;
  transition: transform .6s cubic-bezier(.4,.2,.2,1), box-shadow .6s cubic-bezier(.4,.2,.2,1);
  transform-style: preserve-3d;
  z-index: 1;
}
.fc-card-flipper.fc-slide-left {
  animation: fcSlideLeft .35s cubic-bezier(.4,0,.2,1);
}
.fc-card-flipper.fc-slide-right {
  animation: fcSlideRight .35s cubic-bezier(.4,0,.2,1);
}
@keyframes fcSlideLeft {
  0% { transform: translateX(60px) scale(.95); opacity: .5; }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}
@keyframes fcSlideRight {
  0% { transform: translateX(-60px) scale(.95); opacity: .5; }
  100% { transform: translateX(0) scale(1); opacity: 1; }
}

/* ── Card Faces ───────────────────────────────────────────── */
.fc-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--rad);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}
.fc-face-front {
  background: var(--card);
  border: 2px solid var(--border);
  z-index: 2;
}
.fc-face-front::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 50%, rgba(255,255,255,.02) 100%);
  pointer-events: none;
  border-radius: inherit;
  z-index: 1;
}
/* Subtle texture pattern */
.fc-face-front::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,.03) 1px, transparent 1px);
  background-size: 16px 16px;
  pointer-events: none;
  border-radius: inherit;
  z-index: 1;
}
.fc-face-back {
  background: linear-gradient(135deg, rgba(52,211,153,.08) 0%, rgba(62,207,207,.06) 50%, rgba(52,211,153,.1) 100%);
  border: 2px solid rgba(52,211,153,.3);
  transform: rotateY(180deg);
}
.fc-face-back::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(52,211,153,.04), transparent 40%);
  pointer-events: none;
  border-radius: inherit;
}

/* ── Corner Accent ────────────────────────────────────────── */
.fc-corner-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 48px;
  height: 48px;
  overflow: hidden;
  pointer-events: none;
  z-index: 3;
}
.fc-corner-accent::before {
  content: '';
  position: absolute;
  top: -24px;
  right: -24px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, transparent 50%, rgba(255,200,50,.12) 50%);
  border-radius: 0 0 0 4px;
}

/* ── Progress Dots ────────────────────────────────────────── */
.fc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,.12);
  transition: all .3s ease;
}
.fc-dot.fc-dot-active {
  background: var(--y);
  width: 12px;
  animation: fcDotPulse 2s ease-in-out infinite;
}
.fc-dot.fc-dot-mastered {
  background: var(--g);
}
@keyframes fcDotPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,200,50,.4); }
  50% { box-shadow: 0 0 0 4px rgba(255,200,50,.1); }
}

/* ── Mastery Toggle ───────────────────────────────────────── */
.fc-mastery-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 999px;
  font-size: .85rem;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid var(--border);
  background: rgba(255,255,255,.06);
  color: var(--muted);
  transition: all .35s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
.fc-mastery-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(52,211,153,.15), rgba(52,211,153,.05));
  opacity: 0;
  transition: opacity .35s ease;
}
.fc-mastery-btn.fc-mastered {
  border-color: rgba(52,211,153,.4);
  color: var(--g);
}
.fc-mastery-btn.fc-mastered::before {
  opacity: 1;
}

/* ── Streak Badge ─────────────────────────────────────────── */
.fc-streak {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255,200,50,.12), rgba(255,150,50,.08));
  border: 1px solid rgba(255,200,50,.2);
  font-size: .75rem;
  font-weight: 800;
  color: var(--y);
  transition: all .3s ease;
}
.fc-streak.fc-streak-high {
  background: linear-gradient(135deg, rgba(255,150,50,.18), rgba(255,100,50,.12));
  border-color: rgba(255,150,50,.3);
  animation: fcStreakGlow 1.5s ease-in-out infinite;
}
@keyframes fcStreakGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,200,50,.2); }
  50% { box-shadow: 0 0 8px 2px rgba(255,200,50,.15); }
}

/* ── Celebration Overlay ──────────────────────────────────── */
.fc-celebration {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.6);
  backdrop-filter: blur(4px);
  border-radius: var(--rad);
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity .4s ease;
}
.fc-celebration.fc-show {
  opacity: 1;
  pointer-events: auto;
}
.fc-celebration-text {
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--y);
  text-shadow: 0 2px 12px rgba(255,200,50,.3);
  animation: fcCelebrateBounce .6s cubic-bezier(.4,0,.2,1);
}
@keyframes fcCelebrateBounce {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

/* ── Shuffle Button ───────────────────────────────────────── */
.fc-shuffle-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: .72rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.04);
  color: var(--muted);
  transition: all .25s ease;
}
.fc-shuffle-btn:hover {
  background: rgba(255,255,255,.08);
  color: var(--fg);
  border-color: rgba(255,255,255,.15);
}

/* ── Swipe Hint ───────────────────────────────────────────── */
.fc-swipe-hint {
  font-size: .68rem;
  color: var(--muted);
  margin-top: 6px;
  opacity: .6;
}

/* ── Reduced Motion ───────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .fc-card-flipper,
  .fc-dot,
  .fc-mastery-btn,
  .fc-mastery-btn::before,
  .fc-depth-layer,
  .fc-deck-wrap,
  .fc-title-card,
  .fc-counter-row,
  .fc-dots-row,
  .fc-mastery-row {
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
</style>

<div class="main" style="text-align:center">
  <!-- Title Card -->
  <div class="card fc-title-card" style="margin-bottom:14px">
    <div class="h2">🃏 <span class="hl">Flashcard</span></div>
    <p class="sub mt8">${cards.length} kartu · Klik kartu untuk membalik, lalu navigasi dengan tombol.</p>
  </div>

  <div id="fcDeckContainer">
    ${cards.length
      ? `<div class="fc-deck-wrap">
          <div class="fc-card-perspective" id="fcPerspective">
            <!-- Depth layers behind card -->
            <div class="fc-depth-layer fc-depth-2" id="fcDepth2"></div>
            <div class="fc-depth-layer fc-depth-1" id="fcDepth1"></div>

            <div id="fcCard" class="fc-card-flipper" onclick="fcFlip()" style="box-shadow: 0 4px 20px rgba(0,0,0,.15)">
              <!-- Front -->
              <div class="fc-face fc-face-front">
                <div class="fc-corner-accent"></div>
                <div id="fcFrontIcon" style="font-size:3rem;margin-bottom:12px;position:relative;z-index:2">🃏</div>
                <div id="fcFrontText" style="font-size:1.1rem;font-weight:800;line-height:1.5;position:relative;z-index:2"></div>
                <div style="margin-top:16px;font-size:.72rem;color:var(--muted);font-weight:700;position:relative;z-index:2">👆 Ketuk untuk membalik</div>
              </div>
              <!-- Back -->
              <div class="fc-face fc-face-back">
                <div id="fcBackIcon" style="font-size:1.6rem;margin-bottom:10px">✅</div>
                <div id="fcBackText" style="font-size:1rem;font-weight:700;line-height:1.6;color:var(--c)"></div>
                <div style="margin-top:16px;font-size:.72rem;color:var(--muted);font-weight:700">👆 Ketuk untuk kembali</div>
              </div>
            </div>

            <!-- Celebration overlay -->
            <div class="fc-celebration" id="fcCelebration">
              <div class="fc-celebration-text">Semua Dihafal! 🎉</div>
              <div style="margin-top:10px;font-size:.85rem;color:var(--muted)">Keren sekali!</div>
            </div>
          </div>

          <!-- Card counter & navigation -->
          <div class="fc-counter-row" style="display:flex;align-items:center;justify-content:center;gap:16px;margin-top:18px">
            <button class="btn btn-ghost btn-sm" onclick="fcPrev()" id="btnFcPrev" style="opacity:.4">← Sebelumnya</button>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="font-weight:900;font-size:.88rem;color:var(--muted)">
                <span id="fcCurrentNum">1</span> / <span id="fcTotalNum">${cards.length}</span>
              </div>
              <div class="fc-streak" id="fcStreak" style="display:none">
                🔥 <span id="fcStreakNum">0</span>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="fcNext()" id="btnFcNext">Selanjutnya →</button>
          </div>

          <!-- Progress dots -->
          <div class="fc-dots-row" id="fcDots" style="display:flex;gap:6px;justify-content:center;margin-top:12px;flex-wrap:wrap">
            ${cards.map((_, i) => `<div id="fcDot${i}" class="fc-dot${i === 0 ? ' fc-dot-active' : ''}"></div>`).join('')}
          </div>

          <!-- Mastery toggle & Shuffle -->
          <div class="fc-mastery-row" style="margin-top:16px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap">
            <button class="fc-mastery-btn" id="btnFcMaster" onclick="fcToggleMaster()">
              <span id="fcMasterIcon">🤔</span> <span id="fcMasterLabel">Belum Hafal</span>
            </button>
            <button class="fc-shuffle-btn" onclick="fcShuffle()">🔀 Acak</button>
          </div>

          <div class="fc-swipe-hint">Geser kiri/kanan untuk navigasi · Spasi untuk membalik</div>
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
  var streak = 0;
  var celebrationShown = false;

  // ── Swipe Gesture State ──────────────────────────────────
  var touchStartX = 0;
  var touchStartY = 0;
  var touchDeltaX = 0;
  var isSwiping = false;

  // ── Shadow Intensity for 3D Flip ────────────────────────
  function getShadowForAngle(angle) {
    var abs = Math.abs(angle);
    var intensity = abs / 180;
    var blur = 10 + intensity * 20;
    var spread = intensity * 4;
    var yOff = 4 + intensity * 8;
    return '0 ' + yOff + 'px ' + blur + 'px rgba(0,0,0,' + (0.12 + intensity * 0.15) + '), 0 ' + (spread) + 'px ' + (blur * 0.5) + 'px rgba(0,0,0,' + (0.05 + intensity * 0.08) + ')';
  }

  // ── Render Card ─────────────────────────────────────────
  function renderCard(direction) {
    if (!CARDS.length) return;
    var c = CARDS[cur];
    var frontIcon = document.getElementById('fcFrontIcon');
    var frontText = document.getElementById('fcFrontText');
    var backText = document.getElementById('fcBackText');
    var backIcon = document.getElementById('fcBackIcon');
    if (frontIcon) frontIcon.textContent = c.icon || '🃏';
    if (frontText) frontText.textContent = c.front || '';
    if (backText) backText.textContent = c.back || '';
    if (backIcon) backIcon.textContent = '✅';

    // Reset flip
    flipped = false;
    var card = document.getElementById('fcCard');
    if (card) {
      card.style.transform = 'rotateY(0deg)';
      card.style.boxShadow = getShadowForAngle(0);
    }

    // Slide animation
    if (card && direction) {
      card.classList.remove('fc-slide-left', 'fc-slide-right');
      void card.offsetWidth; // reflow
      card.classList.add(direction === 'next' ? 'fc-slide-left' : 'fc-slide-right');
      setTimeout(function() {
        card.classList.remove('fc-slide-left', 'fc-slide-right');
      }, 360);
    }

    // Update depth layers
    var d1 = document.getElementById('fcDepth1');
    var d2 = document.getElementById('fcDepth2');
    if (d1) d1.style.display = (cur < CARDS.length - 1) ? '' : 'none';
    if (d2) d2.style.display = (cur < CARDS.length - 2) ? '' : 'none';

    // Update counter
    var numEl = document.getElementById('fcCurrentNum');
    if (numEl) numEl.textContent = (cur + 1);

    // Update dots
    for (var i = 0; i < CARDS.length; i++) {
      var dot = document.getElementById('fcDot' + i);
      if (dot) {
        dot.className = 'fc-dot';
        if (i === cur) dot.className += ' fc-dot-active';
        else if (mastered[i]) dot.className += ' fc-dot-mastered';
      }
    }

    // Update prev/next opacity
    var prevBtn = document.getElementById('btnFcPrev');
    var nextBtn = document.getElementById('btnFcNext');
    if (prevBtn) prevBtn.style.opacity = cur === 0 ? '.4' : '1';
    if (nextBtn) nextBtn.style.opacity = cur === CARDS.length - 1 ? '.4' : '1';

    // Update mastery button
    updateMasterBtn();

    // Update streak
    updateStreak();

    // Check celebration
    checkCelebration();
  }

  // ── Update Mastery Button ───────────────────────────────
  function updateMasterBtn() {
    var btn = document.getElementById('btnFcMaster');
    var iconEl = document.getElementById('fcMasterIcon');
    var labelEl = document.getElementById('fcMasterLabel');
    if (!btn) return;
    if (mastered[cur]) {
      if (iconEl) iconEl.textContent = '✅';
      if (labelEl) labelEl.textContent = 'Sudah Hafal';
      btn.classList.add('fc-mastered');
    } else {
      if (iconEl) iconEl.textContent = '🤔';
      if (labelEl) labelEl.textContent = 'Belum Hafal';
      btn.classList.remove('fc-mastered');
    }
  }

  // ── Update Streak ───────────────────────────────────────
  function updateStreak() {
    var s = 0;
    // Count consecutive mastered from current position going backwards
    for (var i = cur; i >= 0; i--) {
      if (mastered[i]) s++;
      else break;
    }
    streak = s;
    var streakEl = document.getElementById('fcStreak');
    var streakNum = document.getElementById('fcStreakNum');
    if (streakEl) {
      if (streak >= 2) {
        streakEl.style.display = 'inline-flex';
        if (streakNum) streakNum.textContent = streak;
        if (streak >= 5) {
          streakEl.classList.add('fc-streak-high');
        } else {
          streakEl.classList.remove('fc-streak-high');
        }
      } else {
        streakEl.style.display = 'none';
      }
    }
  }

  // ── Check Celebration ───────────────────────────────────
  function checkCelebration() {
    if (celebrationShown) return;
    var allMastered = true;
    for (var i = 0; i < CARDS.length; i++) {
      if (!mastered[i]) { allMastered = false; break; }
    }
    if (allMastered && CARDS.length > 0) {
      celebrationShown = true;
      var cel = document.getElementById('fcCelebration');
      if (cel) {
        cel.classList.add('fc-show');
        if (typeof launchConfetti === 'function') launchConfetti();
      }
    }
  }

  // ── Flip ────────────────────────────────────────────────
  window.fcFlip = function() {
    flipped = !flipped;
    var card = document.getElementById('fcCard');
    if (card) {
      var angle = flipped ? 180 : 0;
      card.style.transform = 'rotateY(' + angle + 'deg)';
      card.style.boxShadow = getShadowForAngle(angle);
    }
  };

  // Animate shadow mid-flip
  var flipShadowInterval = null;
  var origFlip = window.fcFlip;
  window.fcFlip = function() {
    origFlip();
    var card = document.getElementById('fcCard');
    if (!card) return;
    if (flipShadowInterval) clearInterval(flipShadowInterval);
    var startAngle = flipped ? 0 : 180;
    var endAngle = flipped ? 180 : 0;
    var startTime = Date.now();
    var duration = 600;
    flipShadowInterval = setInterval(function() {
      var elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(flipShadowInterval);
        flipShadowInterval = null;
        card.style.boxShadow = getShadowForAngle(endAngle);
        return;
      }
      var t = elapsed / duration;
      // Ease out cubic
      t = 1 - Math.pow(1 - t, 3);
      var currentAngle = startAngle + (endAngle - startAngle) * t;
      card.style.boxShadow = getShadowForAngle(currentAngle);
    }, 16);
  };

  // ── Next / Prev ─────────────────────────────────────────
  window.fcNext = function() {
    if (cur < CARDS.length - 1) { cur++; renderCard('next'); }
  };

  window.fcPrev = function() {
    if (cur > 0) { cur--; renderCard('prev'); }
  };

  // ── Toggle Mastery ──────────────────────────────────────
  window.fcToggleMaster = function() {
    mastered[cur] = !mastered[cur];
    if (mastered[cur]) {
      addScore(5);
    } else {
      S.score = Math.max(0, S.score - 5);
      if (typeof updateNavbarScore === 'function') updateNavbarScore();
    }
    updateMasterBtn();
    updateStreak();

    // Update dots
    var dot = document.getElementById('fcDot' + cur);
    if (dot) {
      dot.className = 'fc-dot';
      if (mastered[cur]) dot.className += ' fc-dot-mastered';
      else if (dot) dot.className += ' fc-dot-active';
    }

    checkCelebration();
  };

  // ── Shuffle ─────────────────────────────────────────────
  window.fcShuffle = function() {
    // Fisher-Yates shuffle preserving mastery by card identity
    var masteryByCard = {};
    for (var i = 0; i < CARDS.length; i++) {
      var key = CARDS[i].front + '|' + CARDS[i].back;
      if (mastered[i]) masteryByCard[key] = true;
    }

    for (var j = CARDS.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var temp = CARDS[j];
      CARDS[j] = CARDS[k];
      CARDS[k] = temp;
    }

    // Restore mastery by card identity
    mastered = {};
    for (var m = 0; m < CARDS.length; m++) {
      var key2 = CARDS[m].front + '|' + CARDS[m].back;
      if (masteryByCard[key2]) mastered[m] = true;
    }

    cur = 0;
    celebrationShown = false;
    var cel = document.getElementById('fcCelebration');
    if (cel) cel.classList.remove('fc-show');
    renderCard(null);
  };

  // ── Swipe Gestures ──────────────────────────────────────
  var perspective = document.getElementById('fcPerspective');
  if (perspective) {
    perspective.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDeltaX = 0;
      isSwiping = false;
    }, { passive: true });

    perspective.addEventListener('touchmove', function(e) {
      touchDeltaX = e.touches[0].clientX - touchStartX;
      var deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      if (Math.abs(touchDeltaX) > deltaY && Math.abs(touchDeltaX) > 10) {
        isSwiping = true;
      }
    }, { passive: true });

    perspective.addEventListener('touchend', function() {
      if (!isSwiping) return;
      var threshold = 50;
      if (touchDeltaX < -threshold) {
        window.fcNext();
      } else if (touchDeltaX > threshold) {
        window.fcPrev();
      }
      touchDeltaX = 0;
      isSwiping = false;
    }, { passive: true });
  }

  // ── Keyboard Navigation ─────────────────────────────────
  var screenEl = document.getElementById('${esc(screenId)}');
  function handleKey(e) {
    // Only handle if this screen is active
    if (!screenEl || !screenEl.classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === 'Right') {
      e.preventDefault();
      window.fcNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
      e.preventDefault();
      window.fcPrev();
    } else if (e.key === ' ') {
      e.preventDefault();
      window.fcFlip();
    }
  }
  document.addEventListener('keydown', handleKey);

  // ── Screen Activate Hook ────────────────────────────────
  function activate() {
    if (screenEl) screenEl.classList.add('fc-active');
  }

  // Check initial state
  if (screenEl && screenEl.classList.contains('active')) {
    activate();
  }

  // Listen for screenActivate event
  document.addEventListener('screenActivate', function(e) {
    if (e.detail && e.detail.screenId === '${esc(screenId)}') {
      activate();
    }
  });

  // Fallback: also listen for direct class addition
  var activateObserver = new MutationObserver(function() {
    if (screenEl && screenEl.classList.contains('active') && !screenEl.classList.contains('fc-active')) {
      activate();
    }
  });
  if (screenEl) {
    activateObserver.observe(screenEl, { attributes: true, attributeFilter: ['class'] });
  }

  // ── Initialize first card ───────────────────────────────
  if (CARDS.length) renderCard(null);
})();
</script>
</div>`;
}
