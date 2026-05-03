// ═══════════════════════════════════════════════════════════════
// BASE-JS.TS — Shared JavaScript engine for MPI student export
// Generates navigation, scoring, confetti, and shared utilities.
// Each template handles its own interactivity via inline scripts.
// ═══════════════════════════════════════════════════════════════

// ── Input Data Interface ──────────────────────────────────────
export interface BaseJSData {
  /** Ordered list of screen IDs that determine navigation flow */
  screens: string[];
  /** Optional custom mapping: screenId → position override for progress calc */
  customScreenOrder?: Record<string, number>;
}

// ── Main Export ────────────────────────────────────────────────
/**
 * Generate the shared JavaScript for navigation, scoring, and utilities.
 * Each template handles its own interactivity (kuis, sortir, skenario, etc.)
 * via inline <script> blocks inside the template HTML.
 */
export function getBaseJS(data: BaseJSData): string {
  const screensJS = JSON.stringify(data.screens);
  const customOrderJS = JSON.stringify(data.customScreenOrder || {});

  return `// ── MPI Base JS Engine (auto-generated) ──────────────

// ── SCREEN ORDER ────────────────────────────────────
var SCREENS = ${screensJS};
var CUSTOM_ORDER = ${customOrderJS};

// ── GLOBAL STATE ────────────────────────────────────
var S = { score: 0, skScore: 0 };
var currentScreenIndex = 0;

// ── SCORE SYSTEM ────────────────────────────────────
function addScore(pts) {
  S.score += pts;
  updateNavbarScore();
  scoreFlash(pts);
}

function updateNavbarScore() {
  var total = S.score + S.skScore;
  // Update the shared navbar score element (id='navScore')
  var navScoreEl = document.getElementById('navScore');
  if (navScoreEl) {
    navScoreEl.textContent = total;
  }
  // Also update any per-screen .nav-score elements for backward compat
  var scoreEls = document.querySelectorAll('.nav-score');
  for (var i = 0; i < scoreEls.length; i++) {
    scoreEls[i].textContent = total + ' \\u2B50';
  }
}

function scoreFlash(pts) {
  if (pts <= 0) return;
  var popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.textContent = '+' + pts;
  document.body.appendChild(popup);
  setTimeout(function() { popup.remove(); }, 900);
}

// ── NAVBAR PROGRESS ─────────────────────────────────
function updateNavbarProgress(screenId) {
  var pct = 0;
  if (CUSTOM_ORDER && CUSTOM_ORDER[screenId] !== undefined) {
    pct = CUSTOM_ORDER[screenId];
  } else {
    var idx = SCREENS.indexOf(screenId);
    if (idx >= 0) {
      pct = Math.round(((idx + 1) / SCREENS.length) * 100);
    }
  }
  // Update the shared navbar progress fill (id='progFill')
  var progFillEl = document.getElementById('progFill');
  if (progFillEl) {
    progFillEl.style.width = pct + '%';
  }
  // Also update any per-screen .nav-prog-fill elements for backward compat
  var fills = document.querySelectorAll('.nav-prog-fill');
  for (var i = 0; i < fills.length; i++) {
    fills[i].style.width = pct + '%';
  }
  updateNavbarScore();
}

// ── SCREEN NAVIGATION ───────────────────────────────
function goScreen(id) {
  var allScreens = document.querySelectorAll('.screen');
  for (var i = 0; i < allScreens.length; i++) {
    allScreens[i].classList.remove('active');
  }
  var el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    window.scrollTo(0, 0);
  }
  currentScreenIndex = SCREENS.indexOf(id);
  updateNavbarProgress(id);

  // ── Shared navbar visibility ──────────────────────
  // Show the shared navbar on all screens except the first (cover) screen.
  // The shared navbar element is <nav id="navbar" ...> placed by assembly.
  var navbar = document.getElementById('navbar');
  if (navbar) {
    if (currentScreenIndex === 0) {
      navbar.style.display = 'none';
    } else {
      navbar.style.display = 'flex';
    }
  }

  // ── Update navScene label from data-nav-label ────
  // Each screen div can have a data-nav-label attribute that specifies
  // what text to show in the navScene element of the shared navbar.
  var navSceneEl = document.getElementById('navScene');
  if (navSceneEl && el) {
    var label = el.getAttribute('data-nav-label') || '';
    navSceneEl.textContent = label;
  }

  // Dispatch custom event for templates to hook into
  var evt = document.createEvent('Event');
  evt.initEvent('screenActivate', true, true);
  evt.screenId = id;
  if (el) el.dispatchEvent(evt);
}

function goNextScreen() {
  if (currentScreenIndex < SCREENS.length - 1) {
    goScreen(SCREENS[currentScreenIndex + 1]);
  }
}

function goPrevScreen() {
  if (currentScreenIndex > 0) {
    goScreen(SCREENS[currentScreenIndex - 1]);
  }
}

// ── CONFETTI LAUNCHER ───────────────────────────────
function launchConfetti() {
  var w = document.getElementById('confWrap');
  if (!w) return;
  var cols = ['#f9c12e','#3ecfcf','#ff6b6b','#a78bfa','#34d399','#fb923c'];
  for (var i = 0; i < 100; i++) {
    var c = document.createElement('div');
    c.className = 'conf';
    var sz = 4 + Math.random() * 9;
    c.style.cssText = 'left:' + Math.random()*100 + '%;top:' + (-20-Math.random()*40) + 'px;width:' + sz + 'px;height:' + sz + 'px;background:' + cols[Math.floor(Math.random()*cols.length)] + ';border-radius:' + (Math.random()>.5?'50%':'2px') + ';animation-duration:' + (2+Math.random()*3) + 's;animation-delay:' + (Math.random()*.8) + 's;';
    w.appendChild(c);
  }
  setTimeout(function() { w.innerHTML = ''; }, 6000);
}

// ── SHARED DISKUSI SAVE (used by multiple templates) ──
if (!window.PORTO) window.PORTO = {};
if (!window._diskusiState) window._diskusiState = {};

function saveDiskusi(textareaId, key, label) {
  var val = document.getElementById(textareaId);
  if (!val) return;
  var text = val.value.trim();
  if (!text) { alert('Tulis jawabanmu dulu ya!'); return; }
  if (!window._diskusiState[key]) {
    window._diskusiState[key] = true;
    window.PORTO[key] = { label: label, text: text };
    addScore(5);
    var badge = document.getElementById('badge-' + key);
    if (badge) badge.style.display = 'inline-flex';
  } else {
    window.PORTO[key].text = text;
  }
}

// ── SWITCH KTAB (CP/Dokumen) ────────────────────────
function switchKtab(id, el) {
  var tabs = document.querySelectorAll('.ktab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  var conts = document.querySelectorAll('.ktab-content');
  for (var i = 0; i < conts.length; i++) conts[i].classList.remove('active');
  if (el) el.classList.add('active');
  var cont = document.getElementById(id);
  if (cont) cont.classList.add('active');
}

// ── INIT: Activate first screen ─────────────────────
(function() {
  // Find the already-active screen and set currentScreenIndex
  var allScreens = document.querySelectorAll('.screen');
  for (var i = 0; i < allScreens.length; i++) {
    if (allScreens[i].classList.contains('active')) {
      currentScreenIndex = i;
      updateNavbarProgress(allScreens[i].id);

      // Set initial navbar visibility — hidden on first (cover) screen
      var navbar = document.getElementById('navbar');
      if (navbar) {
        navbar.style.display = (i === 0) ? 'none' : 'flex';
      }

      // Set initial navScene label from data-nav-label
      var navSceneEl = document.getElementById('navScene');
      if (navSceneEl) {
        navSceneEl.textContent = allScreens[i].getAttribute('data-nav-label') || '';
      }
      break;
    }
  }
})();
`;
}
