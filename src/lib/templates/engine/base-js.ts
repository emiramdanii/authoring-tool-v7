// ═══════════════════════════════════════════════════════════════
// BASE-JS.TS — Shared JavaScript engine for MPI student export
// Generates a self-contained JS string that handles screen nav,
// skenario engine, kuis engine, fungsi tabs, confetti, and more.
// ═══════════════════════════════════════════════════════════════

// ── Skenario Chapter Type ──────────────────────────────────────
interface SkenarioChoice {
  icon?: string;
  label?: string;
  detail?: string;
  pts?: number;
  level?: 'good' | 'mid' | 'bad';
  resultTitle?: string;
  resultBody?: string;
  norma?: string;
  consequences?: Array<{ icon: string; text: string }>;
}

interface SkenarioSetupStep {
  speaker: string;
  text: string;
}

interface SkenarioChapter {
  title?: string;
  bg?: string;
  charEmoji?: string;
  charColor?: string;
  charPants?: string;
  setup: SkenarioSetupStep[];
  choicePrompt?: string;
  choices: SkenarioChoice[];
}

// ── Kuis Soal Type ─────────────────────────────────────────────
interface KuisSoal {
  q: string;
  opts: string[];
  ans: number;
  ex?: string;
}

// ── Fungsi Item Type ──────────────────────────────────────────
interface FungsiItem {
  icon: string;
  label: string;
  color: string;
  bg: string;
  bc: string;
  desc: string;
  contoh: string[];
  tanya: string;
}

// ── Module Item Type (loose) ──────────────────────────────────
type ModuleItem = Record<string, unknown>;

// ── Input Data Interface ──────────────────────────────────────
export interface BaseJSData {
  /** Ordered list of screen IDs that determine navigation flow */
  screens: string[];
  /** Skenario chapter data (empty array if no skenario) */
  skenarioData: SkenarioChapter[];
  /** Kuis soal data (empty array if no kuis) */
  kuisData: KuisSoal[];
  /** Modules data (empty array if no modules) */
  modulesData: ModuleItem[];
  /** Fungsi tab data (empty array if no fungsi) */
  fungsiData: FungsiItem[];
  /** Whether the export includes a skenario section */
  hasSkenario: boolean;
  /** Whether the export includes a materi section */
  hasMateri: boolean;
  /** Whether the export includes a kuis section */
  hasKuis: boolean;
  /** Whether the export includes modules */
  hasModules: boolean;
  /** Optional custom mapping: screenId → position override for progress calc */
  customScreenOrder?: Record<string, number>;
}

// ── Main Export ────────────────────────────────────────────────
/**
 * Generate the complete self-contained JavaScript for the student
 * export HTML. The returned string should be placed inside a
 * `<script>` tag in the final HTML output.
 */
export function getBaseJS(data: BaseJSData): string {
  const screensJS = JSON.stringify(data.screens);
  const chaptersJS = JSON.stringify(data.skenarioData);
  const kuisJS = JSON.stringify(data.kuisData);
  const fungsiJS = JSON.stringify(data.fungsiData);
  const modulesJS = JSON.stringify(data.modulesData);
  const customOrderJS = JSON.stringify(data.customScreenOrder || {});

  return `// ── MPI Base JS Engine (auto-generated) ──────────────

// ── SCREEN ORDER ────────────────────────────────────
const SCREENS = ${screensJS};
const CUSTOM_ORDER = ${customOrderJS};

// ── FEATURE FLAGS ───────────────────────────────────
const HAS_SKENARIO = ${data.hasSkenario};
const HAS_MATERI   = ${data.hasMateri};
const HAS_KUIS     = ${data.hasKuis};
const HAS_MODULES  = ${data.hasModules};

// ── DATA ────────────────────────────────────────────
const CHAPTERS    = ${chaptersJS};
const KUIS_SOAL   = ${kuisJS};
const FUNGSI      = ${fungsiJS};
const MODULES_DATA = ${modulesJS};

// ── STATE ────────────────────────────────────────────
var S = { score: 0, skScore: 0 };
var kuisAnswers = {};
var currentScreenIndex = 0;

// ── NAVBAR PROGRESS UPDATE ──────────────────────────
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
  var fills = document.querySelectorAll('.nav-prog-fill');
  for (var i = 0; i < fills.length; i++) {
    fills[i].style.width = pct + '%';
  }
  updateNavbarScore();
}

function updateNavbarScore() {
  var total = S.score + S.skScore;
  var scoreEls = document.querySelectorAll('.nav-score');
  for (var i = 0; i < scoreEls.length; i++) {
    scoreEls[i].textContent = total + ' ⭐';
  }
}

// ── SCREEN NAV ──────────────────────────────────────
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
  if (id === 's-sk')      initSk();
  if (id === 's-modules') renderModules();
  if (id === 's-materi')  initFtab();
  if (id === 's-kuis')    renderKuis();
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

// ── CP TABS (switchKtab) ────────────────────────────
function switchKtab(id, el) {
  var tabs = document.querySelectorAll('.ktab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  var conts = document.querySelectorAll('.ktab-content');
  for (var i = 0; i < conts.length; i++) conts[i].classList.remove('active');
  if (el) el.classList.add('active');
  var cont = document.getElementById(id);
  if (cont) cont.classList.add('active');
}

// ── SKENARIO ENGINE ─────────────────────────────────
var skCh = 0, skStep = 0;

function initSk() {
  if (!CHAPTERS.length) {
    document.getElementById('skBody').innerHTML =
      '<div style="padding:30px;text-align:center;color:var(--muted)">Skenario belum diisi.</div>';
    var btn = document.getElementById('btnNextAfterSk');
    if (btn) btn.style.display = 'inline-flex';
    return;
  }
  skCh = 0;
  renderSkProg();
  startChapter();
}

function renderSkProg() {
  var el = document.getElementById('skProgress');
  if (!el) return;
  el.innerHTML = CHAPTERS.map(function(_, i) {
    var bg = i < skCh ? '#34d399' : i === skCh ? '#f9c12e' : '#1e3a5a';
    var shadow = i === skCh ? ';box-shadow:0 0 6px #f9c12e' : '';
    return '<div style="flex:1;height:4px;border-radius:99px;background:' + bg + ';transition:all .3s' + shadow + '"></div>';
  }).join('');
}

function startChapter() {
  var ch = CHAPTERS[skCh];
  if (!ch) return;
  document.getElementById('skTitle').textContent = ch.title || '';
  skStep = 0;
  showSetup();
}

function showSetup() {
  var ch = CHAPTERS[skCh];
  var step = ch.setup[skStep];
  if (!step) return showChoices();
  document.getElementById('skBody').innerHTML =
    '<div class="sk-scene ' + (ch.bg || 'sbg-kampung') + '">' +
      '<div class="sk-char" style="left:50%;transform:translateX(-50%)">' +
        '<div class="sk-head" style="background:#fff2d9">' + (ch.charEmoji || '😊') + '</div>' +
        '<div class="sk-body" style="background:' + (ch.charColor || '#3a7a9a') + '"></div>' +
        '<div class="sk-legs"><div class="sk-leg" style="background:' + (ch.charPants || '#3a5a7a') + '"></div><div class="sk-leg" style="background:' + (ch.charPants || '#3a5a7a') + '"></div></div>' +
      '</div>' +
    '</div>' +
    '<div class="sk-dialogue">' +
      '<div class="sk-speaker">' + step.speaker + '</div>' +
      '<div class="sk-text" id="skTypedText"></div>' +
      '<div class="sk-tap">Ketuk untuk lanjut ▶</div>' +
    '</div>';
  document.getElementById('skBody').onclick = advanceSetup;
  typeText('skTypedText', step.text || '');
}

function typeText(id, text) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  var i = 0;
  var t = setInterval(function() {
    if (i >= text.length) { clearInterval(t); return; }
    el.textContent += text[i++];
  }, 22);
}

function advanceSetup() {
  document.getElementById('skBody').onclick = null;
  skStep++;
  if (skStep < CHAPTERS[skCh].setup.length) showSetup();
  else showChoices();
}

function showChoices() {
  var ch = CHAPTERS[skCh];
  document.getElementById('skBody').innerHTML =
    '<div class="sk-choices">' +
      '<div class="sk-choice-prompt">' + (ch.choicePrompt || 'Apa yang kamu lakukan?') + '</div>' +
      ch.choices.map(function(c, i) {
        return '<div class="sk-choice" onclick="pickChoice(' + i + ')">' +
          '<span style="font-size:1.3rem">' + (c.icon || '') + '</span>' +
          '<div><div>' + (c.label || '') + '</div>' +
          '<div style="font-size:.72rem;color:var(--muted);font-weight:600">' + (c.detail || '') + '</div></div>' +
        '</div>';
      }).join('') +
    '</div>';
}

function pickChoice(i) {
  var ch = CHAPTERS[skCh];
  var c = ch.choices[i];
  S.skScore += (c.pts || 0);
  var icons = { good: '🌟', mid: '🤔', bad: '⚠️' };
  document.getElementById('skBody').innerHTML =
    '<div class="sk-result">' +
      '<div class="sk-result-banner ' + (c.level || 'mid') + '">' +
        '<div style="font-size:2rem">' + (icons[c.level] || '💡') + '</div>' +
        '<div>' +
          '<div class="sk-result-title">' + (c.resultTitle || '') + '</div>' +
          '<div class="sk-result-body">' + (c.resultBody || '') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:11px;padding:11px 13px;margin-bottom:10px">' +
        '<div style="font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:5px">🔍 Kaitannya dengan Norma</div>' +
        '<div style="font-size:.8rem;font-weight:700;color:var(--c);margin-bottom:6px">' + (c.norma || '') + '</div>' +
        (c.consequences || []).map(function(k) {
          return '<div style="display:flex;gap:8px;font-size:.8rem;margin-bottom:4px">' + k.icon + ' ' + k.text + '</div>';
        }).join('') +
      '</div>' +
      '<div style="text-align:center">' +
        (skCh < CHAPTERS.length - 1
          ? '<button class="btn btn-y btn-sm" onclick="skCh++;renderSkProg();startChapter()">Skenario Berikutnya →</button>'
          : '<button class="btn btn-g btn-sm" onclick="endSk()">Selesai! 🎉</button>') +
      '</div>' +
    '</div>';
  var badge = document.getElementById('skScoreBadge');
  if (badge) badge.textContent = S.skScore + ' poin';
  updateNavbarScore();
}

function endSk() {
  document.getElementById('skBody').innerHTML =
    '<div style="padding:20px;text-align:center;background:#060d18;border-top:2px solid #1e3a5a">' +
      '<div style="font-size:3rem;margin-bottom:10px">🎭</div>' +
      '<div style="font-family:Fredoka One,cursive;font-size:1.2rem;margin-bottom:6px">Skenario Selesai!</div>' +
      '<div style="font-family:Fredoka One,cursive;font-size:1.8rem;color:var(--g)">' + S.skScore + ' poin</div>' +
    '</div>';
  var btn = document.getElementById('btnNextAfterSk');
  if (btn) btn.style.display = 'inline-flex';
}

// ── FUNGSI TABS ─────────────────────────────────────
var curFtab = 0;

function initFtab() {
  curFtab = 0;
  renderFtabUI();
}

function renderFtabUI() {
  if (!FUNGSI.length) return;
  var row = document.getElementById('ftabRow');
  if (!row) return;
  row.innerHTML = FUNGSI.map(function(f, i) {
    var activeStyle = i === curFtab ? 'background:' + f.color + ';color:#0e1c2f;border-color:transparent;' : '';
    return '<div class="ftab' + (i === curFtab ? ' active' : '') + '" onclick="switchFtabF(' + i + ')" style="' + activeStyle + '">'
      + f.icon + ' ' + f.label + '</div>';
  }).join('');
  var f = FUNGSI[curFtab];
  var content = document.getElementById('ftabContent');
  if (!content) return;
  content.innerHTML =
    '<div style="background:' + f.bg + ';border:1px solid ' + f.bc + ';border-radius:14px;padding:16px;animation:fadeIn .3s ease">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<span style="font-size:2rem">' + f.icon + '</span>' +
        '<div style="font-weight:900;font-size:1rem;color:' + f.color + '">' + f.label + '</div>' +
      '</div>' +
      '<p style="font-size:.84rem;line-height:1.7;margin-bottom:12px">' + f.desc + '</p>' +
      f.contoh.map(function(c) {
        return '<div style="display:flex;gap:8px;font-size:.8rem;margin-bottom:5px;line-height:1.5"><span style="color:' + f.color + ';font-weight:900">→</span><span>' + c + '</span></div>';
      }).join('') +
      '<div style="background:rgba(255,255,255,.05);border-radius:9px;padding:10px;margin-top:10px;font-size:.8rem">' +
        '<span style="font-weight:800;color:' + f.color + '">💬 Diskusi:</span> ' + f.tanya +
      '</div>' +
    '</div>';
}

function switchFtabF(i) {
  curFtab = i;
  renderFtabUI();
}

// ── KUIS ENGINE ─────────────────────────────────────
function renderKuis() {
  kuisAnswers = {};
  if (!KUIS_SOAL.length) {
    document.getElementById('kuisContainer').innerHTML =
      '<div class="card" style="text-align:center;padding:30px;color:var(--muted)">Kuis belum diisi.</div>';
    return;
  }
  document.getElementById('kuisContainer').innerHTML = KUIS_SOAL.map(function(s, i) {
    return '<div class="q-card">' +
      '<div class="q-text">' + (i + 1) + '. ' + s.q + '</div>' +
      '<div class="q-opts">' +
        (s.opts || []).map(function(o, j) {
          return '<div class="q-opt" id="qo_' + i + '_' + j + '" onclick="answerQ(' + i + ',' + j + ',' + s.ans + ')">' +
            '<span style="font-weight:900;color:var(--c)">' + 'ABCD'[j] + '.</span> ' + o +
          '</div>';
        }).join('') +
      '</div>' +
      '<div id="qfb_' + i + '" style="display:none" class="q-fb"></div>' +
    '</div>';
  }).join('');
}

function answerQ(qi, choice, correct) {
  if (kuisAnswers[qi] !== undefined) return;
  kuisAnswers[qi] = choice;
  var opts = document.querySelectorAll('[id^="qo_' + qi + '_"]');
  for (var i = 0; i < opts.length; i++) opts[i].classList.add('dis');
  var picked = document.getElementById('qo_' + qi + '_' + choice);
  if (picked) picked.classList.add(choice === correct ? 'ok' : 'no');
  if (choice !== correct) {
    var correctEl = document.getElementById('qo_' + qi + '_' + correct);
    if (correctEl) correctEl.classList.add('shok');
  }
  var fb = document.getElementById('qfb_' + qi);
  if (fb) {
    fb.style.display = 'block';
    fb.className = 'q-fb ' + (choice === correct ? 'ok' : 'no');
    fb.textContent = (choice === correct ? '✅ Benar! ' : '❌ Salah. ') + (KUIS_SOAL[qi].ex || '');
  }
  if (Object.keys(kuisAnswers).length === KUIS_SOAL.length) {
    var submitBtn = document.getElementById('btnKuisSubmit');
    if (submitBtn) submitBtn.style.display = 'inline-flex';
  }
}

function submitKuis() {
  var correct = 0;
  for (var i = 0; i < KUIS_SOAL.length; i++) {
    if (kuisAnswers[i] === KUIS_SOAL[i].ans) correct++;
  }
  var skor = Math.round((correct / KUIS_SOAL.length) * 100);
  S.score = skor;
  goScreen('s-hasil');
  var hc = document.getElementById('hasilCircle');
  if (hc) hc.style.setProperty('--prog', skor + '%');
  var numEl = document.getElementById('hasilNum');
  if (numEl) numEl.textContent = skor;
  var lv = document.getElementById('hasilLevel');
  if (lv) {
    if (skor >= 85) {
      lv.textContent = '🌟 Sangat Baik!';
      lv.style.cssText = 'background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g);padding:10px 20px;border-radius:12px;display:inline-block';
    } else if (skor >= 70) {
      lv.textContent = '👍 Baik';
      lv.style.cssText = 'background:rgba(249,193,46,.1);border:1px solid rgba(249,193,46,.3);color:var(--y);padding:10px 20px;border-radius:12px;display:inline-block';
    } else {
      lv.textContent = '💪 Perlu Latihan';
      lv.style.cssText = 'background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--r);padding:10px 20px;border-radius:12px;display:inline-block';
    }
  }
  if (skor >= 70) launchConfetti();
  updateNavbarScore();
}

// ── MODULES RENDERER ────────────────────────────────
function renderModules() {
  var c = document.getElementById('modulesContainer');
  if (!c) return;
  if (!MODULES_DATA.length) {
    c.innerHTML = '<div class="card" style="text-align:center;padding:30px;color:var(--muted)">Belum ada modul.</div>';
    return;
  }
  c.innerHTML = MODULES_DATA.map(function(m, i) {
    var title = m.title || 'Modul ' + (i + 1);
    var type = m.type || '';
    var body = '';
    switch (type) {
      case 'video':         body = renderModVideo(m); break;
      case 'flashcard':     body = renderModFlashcard(m); break;
      case 'infografis':    body = renderModInfografis(m); break;
      case 'matching':      body = renderModMatching(m); break;
      case 'hero':          body = renderModHero(m); break;
      case 'kutipan':       body = renderModKutipan(m); break;
      case 'langkah':       body = renderModLangkah(m); break;
      case 'accordion':     body = renderModAccordion(m); break;
      case 'statistik':     body = renderModStatistik(m); break;
      case 'polling':       body = renderModPolling(m); break;
      case 'embed':         body = renderModEmbed(m); break;
      case 'tab-icons':     body = renderModTabIcons(m); break;
      case 'icon-explore':  body = renderModIconExplore(m); break;
      case 'comparison':    body = renderModComparison(m); break;
      case 'card-showcase': body = renderModCardShowcase(m); break;
      case 'timeline':      body = renderModTimeline(m); break;
      case 'studi-kasus':   body = renderModStudiKasus(m); break;
      case 'debat':         body = renderModDebat(m); break;
      case 'truefalse':     body = renderModTrueFalse(m); break;
      case 'memory':        body = renderModMemory(m); break;
      case 'roda':          body = renderModRoda(m); break;
      case 'sorting':       body = renderModSorting(m); break;
      case 'spinwheel':     body = renderModSpinwheel(m); break;
      case 'teambuzzer':    body = renderModTeambuzzer(m); break;
      case 'wordsearch':    body = renderModWordsearch(m); break;
      case 'hotspot-image': body = renderModHotspot(m); break;
      case 'materi': body = '<div style="color:var(--muted);font-size:.84rem">Materi blok ditampilkan di tab Materi.</div>'; break;
      default: body = '<div style="color:var(--muted);font-size:.84rem">Tipe modul tidak dikenali.</div>';
    }
    return '<div class="card mt14" id="mod-' + i + '"><div class="h2" style="font-size:1.2rem">' + escH(title) + '</div>' + body + '</div>';
  }).join('') +
    '<div class="btn-row btn-center mt20">' +
      '<button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>' +
      '<button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>' +
    '</div>';
}

// ── MODULE RENDER FUNCTIONS ─────────────────────────
function renderModVideo(m) {
  var url = m.url || '';
  var platform = m.platform || 'youtube';
  var embed = url;
  if (platform === 'youtube' && url.indexOf('watch?v=') !== -1)
    embed = 'https://www.youtube.com/embed/' + url.split('watch?v=')[1].split('&')[0];
  else if (platform === 'youtube' && url.indexOf('youtu.be/') !== -1)
    embed = 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0];
  var pertanyaan = m.pertanyaan || [];
  return '<div style="margin-top:12px">' +
    (m.instruksi ? '<p style="font-size:.84rem;color:var(--muted);margin-bottom:10px">' + escH(m.instruksi) + '</p>' : '') +
    (embed ? '<iframe src="' + escH(embed) + '" style="width:100%;aspect-ratio:16/9;border:none;border-radius:12px;background:#000" allowfullscreen></iframe>' : '<p style="color:var(--muted)">URL video belum diisi.</p>') +
    (pertanyaan.length ? '<div style="margin-top:14px"><div style="font-weight:800;font-size:.88rem;margin-bottom:8px">📝 Pertanyaan Refleksi</div>' +
      pertanyaan.map(function(p, i) {
        return '<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px"><p style="font-size:.84rem;font-weight:700">' + (i + 1) + '. ' + escH(p.teks || '') + '</p>' + (p.wajib ? '<span style="font-size:.7rem;color:var(--r);font-weight:800">* Wajib dijawab</span>' : '') + '</div>';
      }).join('') + '</div>' : '') +
  '</div>';
}

function renderModFlashcard(m) {
  var kartu = m.kartu || [];
  return '<p style="font-size:.84rem;color:var(--muted);margin-top:8px">' + (escH(m.instruksi) || 'Klik kartu untuk membalik.') + '</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:12px">' +
    kartu.map(function(k, i) {
      return '<div class="fc-card" id="fc-' + i + '" onclick="this.classList.toggle(\\'flipped\\')" style="perspective:800px;min-height:140px;cursor:pointer">' +
        '<div style="position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d" class="fc-inner">' +
          '<div style="position:absolute;inset:0;backface-visibility:hidden;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">' +
            '<div style="font-size:.82rem;font-weight:700">' + escH(k.depan || '') + '</div>' +
            (k.hint ? '<div style="font-size:.72rem;color:var(--muted);margin-top:6px">' + escH(k.hint) + '</div>' : '') +
          '</div>' +
          '<div style="position:absolute;inset:0;backface-visibility:hidden;background:rgba(62,207,207,.08);border:1px solid rgba(62,207,207,.3);border-radius:12px;padding:16px;display:flex;align-items:center;justify-content:center;text-align:center;transform:rotateY(180deg)">' +
            '<div style="font-size:.84rem;font-weight:700;color:var(--c)">' + escH(k.belakang || '') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div><style>.fc-card.flipped .fc-inner{transform:rotateY(180deg)}</style>';
}

function renderModInfografis(m) {
  var kartu = m.kartu || [];
  return (m.intro ? '<p style="font-size:.84rem;color:var(--muted);margin-top:8px;line-height:1.6">' + escH(m.intro) + '</p>' : '') +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:12px">' +
    kartu.map(function(k) {
      var col = k.color || '#3ecfcf';
      return '<div style="background:' + col + '0a;border:1px solid ' + col + '22;border-radius:12px;padding:16px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:1.4rem">' + escH(k.icon || '📌') + '</span><span style="font-weight:900;font-size:.88rem;color:' + col + '">' + escH(k.judul || '') + '</span></div>' +
        '<p style="font-size:.82rem;color:var(--muted);line-height:1.6">' + escH(k.isi || '') + '</p></div>';
    }).join('') +
  '</div>';
}

function renderModMatching(m) {
  var pasangan = m.pasangan || [];
  var shuffled = pasangan.map(function(p, i) { return { kiri: p.kiri, kanan: p.kanan, origIdx: i, side: Math.random() > .5 ? 'left' : 'right' }; }).sort(function() { return Math.random() - .5; });
  var leftItems = shuffled.filter(function(s) { return s.side === 'left'; });
  var rightItems = shuffled.filter(function(s) { return s.side === 'right'; });
  return '<p style="font-size:.84rem;color:var(--muted);margin-top:8px">' + (escH(m.instruksi) || 'Cocokkan pasangan berikut.') + '</p>' +
    '<div style="display:grid;grid-template-columns:1fr 40px 1fr;gap:8px;margin-top:12px;align-items:start">' +
    leftItems.map(function(l) { return '<div style="background:rgba(255,255,255,.04);border:2px solid var(--border);border-radius:10px;padding:10px;font-size:.84rem;font-weight:700" data-mid="l-' + l.origIdx + '">' + escH(l.kiri || '') + '</div>'; }).join('') +
    '<div></div>' +
    rightItems.map(function(r) { return '<div style="background:rgba(255,255,255,.04);border:2px solid var(--border);border-radius:10px;padding:10px;font-size:.84rem;font-weight:700" data-mid="r-' + r.origIdx + '">' + escH(r.kanan || '') + '</div>'; }).join('') +
  '</div><div id="matchResult" style="margin-top:12px"></div><button class="btn btn-y btn-sm mt14" onclick="checkMatching()">Periksa Jawaban</button>';
}

function renderModHero(m) {
  var gradients = {
    sunset: 'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)',
    ocean: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
    forest: 'linear-gradient(135deg,#22c55e,#14b8a6)',
    royal: 'linear-gradient(135deg,#a855f7,#6366f1)',
    fire: 'linear-gradient(135deg,#ef4444,#f97316)',
    aurora: 'linear-gradient(135deg,#06b6d4,#a855f7,#ec4899)'
  };
  var g = gradients[m.gradient] || gradients.sunset;
  return '<div style="background:' + g + ';border-radius:16px;padding:32px 24px;text-align:center;margin-top:12px;color:#fff">' +
    '<div style="font-size:3rem;margin-bottom:8px">' + escH(m.icon || '🚀') + '</div>' +
    (m.subjudul ? '<p style="font-size:.9rem;opacity:.9;margin-bottom:12px">' + escH(m.subjudul) + '</p>' : '') +
    (m.cta ? '<button class="btn btn-sm" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)">' + escH(m.cta) + '</button>' : '') +
    (m.chips ? '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-top:14px">' + String(m.chips).split(',').map(function(c) { return '<span class="chip" style="background:rgba(255,255,255,.15);color:#fff">' + escH(c.trim()) + '</span>'; }).join('') + '</div>' : '') +
  '</div>';
}

function renderModKutipan(m) {
  var displays = { card: 'rgba(52,211,153,.05)', big: 'rgba(249,193,46,.05)', minimal: 'transparent' };
  var bg = displays[m.display] || displays.card;
  return '<div style="background:' + bg + ';border-radius:14px;padding:24px;margin-top:12px;border-left:4px solid ' + (m.accent || '#f9c82e') + '">' +
    '<div style="font-size:2rem;margin-bottom:8px;opacity:.5">"</div>' +
    '<p style="font-size:1rem;font-style:italic;line-height:1.8">' + escH(m.quote || '') + '</p>' +
    (m.source ? '<div style="margin-top:10px;font-size:.82rem;color:var(--muted)">— ' + escH(m.source) + (m.title ? ', ' + escH(m.title) : '') + '</div>' : '') +
  '</div>';
}

function renderModLangkah(m) {
  var steps = m.steps || [];
  return (m.intro ? '<p style="font-size:.84rem;color:var(--muted);margin-top:8px;line-height:1.6">' + escH(m.intro) + '</p>' : '') +
    '<div style="margin-top:12px">' + steps.map(function(s, i) {
      var col = s.color || '#3ecfcf';
      return '<div style="display:flex;gap:14px;margin-bottom:16px;align-items:flex-start">' +
        '<div style="min-width:36px;height:36px;border-radius:50%;background:' + col + '18;color:' + col + ';display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.85rem;flex-shrink:0">' + (i + 1) + '</div>' +
        '<div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:1.1rem">' + escH(s.icon || '📌') + '</span><span style="font-weight:900;font-size:.9rem">' + escH(s.judul || '') + '</span></div><p style="font-size:.82rem;color:var(--muted);line-height:1.6;margin-top:3px">' + escH(s.isi || '') + '</p></div></div>';
    }).join('') + '</div>';
}

function renderModAccordion(m) {
  var items = m.items || [];
  return (m.intro ? '<p style="font-size:.84rem;color:var(--muted);margin-top:8px;line-height:1.6">' + escH(m.intro) + '</p>' : '') +
    '<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">' +
    items.map(function(item, i) {
      return '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden">' +
        '<button onclick="var c=this.nextElementSibling;c.style.display=c.style.display===\\'none\\'?\\'block\\':\\'none\\';this.querySelector(\\'.acc-arrow\\').classList.toggle(\\'rotated\\')" style="width:100%;padding:14px 16px;background:none;border:none;color:var(--text);font-size:.88rem;font-weight:800;text-align:left;cursor:pointer;display:flex;align-items:center;gap:10px;font-family:Nunito,sans-serif"><span>' + escH(item.icon || '📌') + '</span>' + escH(item.judul || 'Item ' + (i + 1)) + '<span class="acc-arrow" style="margin-left:auto;transition:transform .2s;font-size:.7rem">▼</span></button>' +
        '<div style="display:none;padding:0 16px 14px;font-size:.84rem;color:var(--muted);line-height:1.7;border-top:1px solid var(--border)">' + escH(item.isi || '') + '</div></div>';
    }).join('') +
  '</div><style>.acc-arrow.rotated{transform:rotate(180deg)}</style>';
}

function renderModStatistik(m) {
  var items = m.items || [];
  var layout = m.layout || 'grid';
  return (m.intro ? '<p style="font-size:.84rem;color:var(--muted);margin-top:8px;line-height:1.6">' + escH(m.intro) + '</p>' : '') +
    '<div style="display:grid;grid-template-columns:' + (layout === 'row' ? 'repeat(auto-fit,minmax(180px,1fr))' : 'repeat(auto-fit,minmax(140px,1fr))') + ';gap:12px;margin-top:12px">' +
    items.map(function(it) {
      var col = it.color || '#3ecfcf';
      return '<div style="background:' + col + '0a;border:1px solid ' + col + '22;border-radius:12px;padding:16px;text-align:center">' +
        '<div style="font-size:2rem">' + escH(it.icon || '📊') + '</div>' +
        '<div style="font-family:Fredoka One,cursive;font-size:1.6rem;color:' + col + '">' + escH(it.angka || '') + (it.satuan ? '<span style="font-size:.8rem;font-weight:600">' + escH(it.satuan) + '</span>' : '') + '</div>' +
        '<div style="font-size:.78rem;color:var(--muted);margin-top:4px">' + escH(it.label || '') + '</div></div>';
    }).join('') + '</div>';
}

function renderModPolling(m) {
  var opsi = m.opsi || [];
  return '<p style="font-size:.84rem;color:var(--muted);margin-top:8px">' + (escH(m.instruksi) || 'Pilih salah satu opsi.') + '</p>' +
    '<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px" id="pollOptions">' +
    opsi.map(function(o, i) {
      var col = o.warna || '#3ecfcf';
      return '<button onclick="votePoll(' + i + ')" style="background:' + col + '0a;border:2px solid ' + col + '33;border-radius:12px;padding:14px 16px;cursor:pointer;text-align:left;font-family:Nunito,sans-serif;display:flex;align-items:center;gap:10px;transition:all .2s" class="poll-opt"><span style="font-size:1.2rem">' + escH(o.icon || '📊') + '</span><span style="font-size:.88rem;font-weight:700;color:var(--text)">' + escH(o.teks || '') + '</span></button>';
    }).join('') + '</div>';
}

function renderModEmbed(m) {
  return m.url ? '<div style="margin-top:12px">' + (m.label ? '<p style="font-size:.78rem;color:var(--muted);margin-bottom:6px">' + escH(m.label) + '</p>' : '') + '<iframe src="' + escH(m.url) + '" style="width:100%;height:' + (m.height || 400) + 'px;border:none;border-radius:12px;background:#f0f0f0" allowfullscreen></iframe></div>' : '<p style="color:var(--muted);margin-top:12px">URL embed belum diisi.</p>';
}

function renderModTabIcons(m) {
  var tabs = m.tabs || [];
  return '<div style="margin-top:12px"><div style="display:flex;gap:4px;border-bottom:2px solid var(--border);margin-bottom:14px;overflow-x:auto">' +
    tabs.map(function(t, i) {
      return '<button onclick="switchModTab(' + i + ')" class="mod-tab' + (i === 0 ? ' active' : '') + '" id="modtab-' + i + '" style="padding:8px 16px;font-size:.78rem;font-weight:800;cursor:pointer;color:var(--muted);border:none;border-bottom:2px solid transparent;margin-bottom:-2px;background:none;font-family:Nunito,sans-serif;white-space:nowrap;transition:all .2s">' + escH(t.icon || '📌') + ' ' + escH(t.judul || 'Tab ' + (i + 1)) + '</button>';
    }).join('') + '</div>' +
    tabs.map(function(t, i) {
      return '<div class="mod-tab-content" id="modtabcontent-' + i + '" style="' + (i === 0 ? '' : 'display:none;') + 'animation:fadeIn .3s ease"><p style="font-size:.84rem;line-height:1.7;color:var(--muted)">' + escH(t.isi || '') + '</p></div>';
    }).join('') +
  '</div><style>.mod-tab.active{color:var(--y)!important;border-bottom-color:var(--y)!important;}</style>';
}

function renderModIconExplore(m) {
  var items = m.items || [];
  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin-top:12px">' +
    items.map(function(it) {
      return '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;cursor:pointer;transition:all .2s" onclick="var d=this.querySelector(\\'.ie-desc\\');d.style.display=d.style.display===\\'none\\'?\\'block\\':\\'none\\'">' +
        '<div style="font-size:2rem;margin-bottom:6px">' + escH(it.icon || '🔍') + '</div>' +
        '<div style="font-size:.82rem;font-weight:800">' + escH(it.judul || '') + '</div>' +
        '<div class="ie-desc" style="display:none;font-size:.76rem;color:var(--muted);margin-top:6px;line-height:1.5">' + escH(it.isi || '') + '</div></div>';
    }).join('') + '</div>';
}

function renderModComparison(m) {
  var baris = m.baris || [];
  if (!baris.length) return '<p style="color:var(--muted);margin-top:12px">Belum ada data perbandingan.</p>';
  var headers = m.headers || baris[0] || [];
  return '<div style="overflow-x:auto;margin-top:12px"><table style="width:100%;border-collapse:collapse;font-size:.82rem"><thead><tr>' +
    headers.map(function(h) { return '<th style="padding:10px 14px;background:rgba(249,193,46,.1);border:1px solid var(--border);text-align:left;font-weight:800">' + escH(h) + '</th>'; }).join('') +
    '</tr></thead><tbody>' +
    baris.slice(1).map(function(row) { return '<tr>' + row.map(function(cell) { return '<td style="padding:10px 14px;border:1px solid var(--border)">' + escH(cell) + '</td>'; }).join('') + '</tr>'; }).join('') +
    '</tbody></table></div>';
}

function renderModCardShowcase(m) {
  var cards = m.cards || [];
  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin-top:12px">' +
    cards.map(function(c) {
      return '<div style="background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden"><div style="height:120px;background:' + (c.bgGrad || 'linear-gradient(135deg,var(--y),var(--c))') + ';display:flex;align-items:center;justify-content:center;font-size:3rem">' + escH(c.icon || '🃏') + '</div><div style="padding:14px"><div style="font-weight:900;font-size:.9rem">' + escH(c.judul || '') + '</div><p style="font-size:.8rem;color:var(--muted);line-height:1.6;margin-top:4px">' + escH(c.isi || '') + '</p></div></div>';
    }).join('') + '</div>';
}

function renderModTimeline(m) {
  var events = m.events || [];
  return (m.intro ? '<p style="font-size:.84rem;color:var(--muted);margin-top:8px;line-height:1.6">' + escH(m.intro) + '</p>' : '') +
    '<div style="margin-top:12px">' + events.map(function(ev) {
      return '<div style="display:flex;gap:14px;margin-bottom:16px;align-items:flex-start"><div style="min-width:36px;height:36px;border-radius:50%;background:var(--c)18;color:var(--c);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">' + escH(ev.icon || '📌') + '</div><div><div style="font-size:.72rem;font-weight:900;color:var(--y);margin-bottom:2px">' + escH(ev.tahun || '') + '</div><div style="font-weight:900;font-size:.88rem">' + escH(ev.judul || '') + '</div><p style="font-size:.8rem;color:var(--muted);line-height:1.5;margin-top:3px">' + escH(ev.isi || '') + '</p></div></div>';
    }).join('') + '</div>';
}

function renderModStudiKasus(m) {
  var pertanyaan = m.pertanyaan || [];
  return '<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:16px;margin-top:12px"><p style="font-size:.88rem;line-height:1.8">' + escH(m.teks || '') + '</p>' + (m.sumber ? '<p style="font-size:.72rem;color:var(--muted);margin-top:8px">Sumber: ' + escH(m.sumber) + '</p>' : '') + '</div>' +
    (pertanyaan.length ? '<div style="margin-top:14px"><div style="font-weight:800;font-size:.88rem;margin-bottom:8px">📝 Pertanyaan Analisis</div>' +
      pertanyaan.map(function(p, i) {
        return '<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px"><span style="font-size:.7rem;font-weight:900;color:var(--p);background:var(--p)18;padding:2px 8px;border-radius:99px">' + escH(p.level || 'C2') + '</span><p style="font-size:.84rem;margin-top:6px;font-weight:700">' + escH(p.teks || p.label || '') + '</p></div>';
      }).join('') + '</div>' : '');
}

function renderModDebat(m) {
  var pA = m.pihakA || {};
  var pB = m.pihakB || {};
  return '<div style="background:rgba(255,255,255,.04);border-radius:12px;padding:16px;margin-top:12px"><div style="font-weight:900;font-size:.92rem;margin-bottom:8px">🗣️ Mosi:</div><p style="font-size:.86rem;line-height:1.7">' + escH(m.pertanyaan || '') + '</p>' +
    (m.konteks ? '<div style="margin-top:10px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px"><span style="font-size:.72rem;font-weight:800;color:var(--muted)">KONTEKS:</span><p style="font-size:.82rem;color:var(--muted);margin-top:4px;line-height:1.6">' + escH(m.konteks) + '</p></div>' : '') +
  '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px"><div style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2);border-radius:12px;padding:14px"><div style="font-weight:900;font-size:.88rem;color:var(--g);margin-bottom:6px">✅ ' + escH(pA.label || 'Pro') + '</div></div><div style="background:rgba(255,107,107,.06);border:1px solid rgba(255,107,107,.2);border-radius:12px;padding:14px"><div style="font-weight:900;font-size:.88rem;color:var(--r);margin-bottom:6px">❌ ' + escH(pB.label || 'Kontra') + '</div></div></div>';
}

function renderModTrueFalse(m) {
  var soal = m.soal || [];
  return '<p style="font-size:.84rem;color:var(--muted);margin-top:8px">' + (escH(m.instruksi) || 'Tentukan benar atau salah.') + '</p><div style="margin-top:12px">' +
    soal.map(function(s, i) {
      return '<div class="card mt14" style="padding:14px"><p style="font-size:.86rem;font-weight:700;margin-bottom:10px">' + (i + 1) + '. ' + escH(s.teks || '') + '</p><div style="display:flex;gap:8px"><button onclick="tfAnswer(this,' + i + ',true,' + s.jawaban + ')" class="btn btn-sm btn-ghost tf-btn" style="flex:1;justify-content:center">✅ Benar</button><button onclick="tfAnswer(this,' + i + ',false,' + s.jawaban + ')" class="btn btn-sm btn-ghost tf-btn" style="flex:1;justify-content:center">❌ Salah</button></div><div id="tf-fb-' + i + '" style="display:none;margin-top:8px;font-size:.8rem;font-weight:700;padding:8px 12px;border-radius:8px"></div></div>';
    }).join('') + '</div>';
}

function renderModMemory(m) {
  var pasangan = m.pasangan || [];
  var cards = [];
  pasangan.forEach(function(p, i) { cards.push({ id: i, type: 'a', text: p.a }); cards.push({ id: i, type: 'b', text: p.b }); });
  var shuffled = cards.sort(function() { return Math.random() - .5; });
  return '<div style="margin-top:12px"><p style="font-size:.84rem;color:var(--muted);margin-bottom:12px">Cocokkan pasangan kartu!</p><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px">' +
    shuffled.map(function(c, i) {
      return '<div class="mem-card" id="mem-' + i + '" onclick="memFlip(' + i + ')" style="aspect-ratio:1;background:var(--card);border:2px solid var(--border);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.78rem;font-weight:700;padding:8px;text-align:center;perspective:800px;transition:all .3s">' + escH(c.text) + '</div>';
    }).join('') + '</div></div>';
}

function renderModRoda(m) {
  var opsi = m.opsi || [];
  if (!opsi.length) return '<p style="color:var(--muted);margin-top:12px">Belum ada opsi.</p>';
  var colors = ['#f9c12e','#3ecfcf','#ff6b6b','#a78bfa','#34d399','#fb923c','#60a5fa','#f472b6'];
  return '<div style="text-align:center;margin-top:12px"><svg id="rodaSvg" viewBox="0 0 200 200" style="width:240px;height:240px;margin:0 auto;display:block;cursor:pointer" onclick="spinRoda()"><g transform="translate(100,100)">' +
    opsi.map(function(o, i) {
      var a1 = (i / opsi.length) * 360; var a2 = ((i + 1) / opsi.length) * 360;
      var r1 = a1 * Math.PI / 180; var r2 = a2 * Math.PI / 180; var col = colors[i % colors.length];
      return '<path d="M0,0 L' + (100 * Math.cos(r1)) + ',' + (100 * Math.sin(r1)) + ' A100,100 0 0,1 ' + (100 * Math.cos(r2)) + ',' + (100 * Math.sin(r2)) + ' Z" fill="' + col + '" stroke="#0e1c2f" stroke-width="2"/><text x="' + (60 * Math.cos((r1 + r2) / 2)) + '" y="' + (60 * Math.sin((r1 + r2) / 2)) + '" fill="#0e1c2f" font-size="10" font-weight="800" text-anchor="middle" dominant-baseline="middle">' + escH(String(o).substring(0, 12)) + '</text>';
    }).join('') +
  '</g></svg><div id="rodaResult" style="margin-top:14px;font-size:1rem;font-weight:900;min-height:40px"></div><button class="btn btn-y btn-sm mt8" onclick="spinRoda()">🎡 Putar Roda!</button></div>';
}

function renderModSorting(m) {
  var items = m.items || []; var kategori = m.kategori || [];
  return '<p style="font-size:.84rem;color:var(--muted);margin-top:8px">' + (escH(m.instruksi) || 'Kelompokkan item ke kategori yang tepat.') + '</p>' +
    (kategori.length ? '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:12px">' + kategori.map(function(k) {
      var col = k.color || '#3ecfcf';
      return '<div style="background:' + col + '0a;border:2px dashed ' + col + '33;border-radius:12px;padding:14px;min-height:80px"><div style="font-weight:900;font-size:.85rem;color:' + col + ';margin-bottom:8px">' + escH(k.judul || '') + '</div><div class="sort-zone" data-cat="' + escH(k.judul || '') + '"></div></div>';
    }).join('') + '</div>' : '') +
    (items.length ? '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px" id="sortItems">' + items.map(function(it, i) {
      return '<span class="sort-item" data-idx="' + i + '" style="background:var(--card);border:1px solid var(--border);border-radius:99px;padding:6px 14px;font-size:.8rem;font-weight:700;cursor:grab">' + escH(it.text || it) + '</span>';
    }).join('') + '</div>' : '');
}

function renderModSpinwheel(m) {
  var items = m.items || [];
  if (!items.length) return '<p style="color:var(--muted);margin-top:12px">Belum ada item.</p>';
  var colors = ['#f9c12e','#3ecfcf','#ff6b6b','#a78bfa','#34d399','#fb923c','#60a5fa','#f472b6'];
  return '<div style="text-align:center;margin-top:12px"><svg id="swSvg" viewBox="0 0 200 200" style="width:240px;height:240px;margin:0 auto;display:block;cursor:pointer" onclick="spinWheel()"><g transform="translate(100,100)">' +
    items.map(function(it, i) {
      var a1 = (i / items.length) * 360; var a2 = ((i + 1) / items.length) * 360;
      var r1 = a1 * Math.PI / 180; var r2 = a2 * Math.PI / 180; var col = colors[i % colors.length];
      return '<path d="M0,0 L' + (100 * Math.cos(r1)) + ',' + (100 * Math.sin(r1)) + ' A100,100 0 0,1 ' + (100 * Math.cos(r2)) + ',' + (100 * Math.sin(r2)) + ' Z" fill="' + col + '" stroke="#0e1c2f" stroke-width="2"/><text x="' + (60 * Math.cos((r1 + r2) / 2)) + '" y="' + (60 * Math.sin((r1 + r2) / 2)) + '" fill="#0e1c2f" font-size="10" font-weight="800" text-anchor="middle" dominant-baseline="middle">' + escH(String(it.question || it.text || it).substring(0, 12)) + '</text>';
    }).join('') +
  '</g><circle cx="100" cy="100" r="15" fill="#0e1c2f" stroke="var(--y)" stroke-width="3"/></svg><div id="swResult" style="margin-top:14px;font-size:.9rem;font-weight:700;min-height:60px"></div><button class="btn btn-y btn-sm mt8" onclick="spinWheel()">🎡 Putar!</button></div>';
}

function renderModTeambuzzer(m) {
  var teams = m.teams || [];
  return '<div style="margin-top:12px"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px">' +
    teams.map(function(t, i) {
      var col = t.color || '#3ecfcf';
      return '<div style="background:' + col + '12;border:2px solid ' + col + '33;border-radius:14px;padding:20px;text-align:center"><div style="font-size:1.5rem">' + escH(t.icon || '🏆') + '</div><div style="font-weight:900;font-size:.9rem;margin-top:4px">' + escH(t.name || 'Tim ' + (i + 1)) + '</div><div style="font-family:Fredoka One,cursive;font-size:2rem;color:' + col + ';margin-top:6px" id="team-score-' + i + '">' + (t.score || 0) + '</div><button onclick="buzzTeam(' + i + ')" class="btn btn-sm mt8" style="background:' + col + ';color:#0e1c2f">🔔 BUZZER!</button></div>';
    }).join('') +
  '</div><div id="buzzerResult" style="margin-top:12px;text-align:center;min-height:40px"></div></div>';
}

function renderModWordsearch(m) {
  var kata = m.kata || [];
  return '<div style="text-align:center;margin-top:12px"><p style="font-size:.84rem;color:var(--muted);margin-bottom:12px">Temukan kata tersembunyi!</p><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px">' +
    kata.map(function(k) { return '<span class="chip" style="background:rgba(249,193,46,.12);color:var(--y)">' + escH(k) + '</span>'; }).join('') +
  '</div><div id="wsGrid" style="display:inline-grid;grid-template-columns:repeat(' + Math.ceil(Math.sqrt(kata.join('').length * 3)) + ',1fr);gap:2px;max-width:400px;margin:0 auto"></div></div>';
}

function renderModHotspot(m) {
  var hotspots = m.hotspots || [];
  var img = m.imageUrl || '';
  return '<div style="position:relative;margin-top:12px;border-radius:12px;overflow:hidden">' +
    (img ? '<img src="' + escH(img) + '" style="width:100%;display:block" onerror="this.style.display=\\'none\\'" />' : '<div style="background:var(--card);height:200px;display:flex;align-items:center;justify-content:center;color:var(--muted)">Gambar belum diisi</div>') +
    '<div style="position:relative">' +
    hotspots.map(function(h, i) {
      return '<div style="position:absolute;left:' + (h.x || 0) + '%;top:' + (h.y || 0) + '%;transform:translate(-50%,-50%);width:32px;height:32px;border-radius:50%;background:var(--y);display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:900;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3)" onclick="var t=this.nextElementSibling;t.style.display=t.style.display===\\'none\\'?\\'block\\':\\'none\\'">' + (i + 1) + '</div>' +
      '<div style="display:none;position:absolute;left:' + (h.x || 0) + '%;top:' + (h.y || 0) + '%;transform:translate(-50%,20px);background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;width:200px;font-size:.78rem;color:var(--muted);z-index:10;box-shadow:0 4px 16px rgba(0,0,0,.4)">' + escH(h.text || h.judul || '') + '</div>';
    }).join('') +
  '</div></div>';
}

// ── MODULE HELPER FUNCTIONS ─────────────────────────
function switchModTab(i) {
  var tabs = document.querySelectorAll('.mod-tab');
  var conts = document.querySelectorAll('.mod-tab-content');
  for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
  for (var j = 0; j < conts.length; j++) conts[j].style.display = 'none';
  var tab = document.getElementById('modtab-' + i);
  var cont = document.getElementById('modtabcontent-' + i);
  if (tab) tab.classList.add('active');
  if (cont) cont.style.display = 'block';
}

function checkMatching() {
  var res = document.getElementById('matchResult');
  if (res) res.innerHTML = '<span style="color:var(--g)">✔ Jawaban tersimpan!</span>';
}

function tfAnswer(btn, qi, ans, correct) {
  var p = btn.parentNode;
  var fb = document.getElementById('tf-fb-' + qi);
  var btns = p.querySelectorAll('.tf-btn');
  for (var j = 0; j < btns.length; j++) { btns[j].disabled = true; btns[j].style.opacity = '.5'; }
  fb.style.display = 'block';
  if (ans === correct) {
    btn.style.borderColor = 'var(--g)'; btn.style.color = 'var(--g)';
    fb.style.background = 'rgba(52,211,153,.1)'; fb.style.color = 'var(--g)';
    fb.textContent = '✅ Benar!';
  } else {
    btn.style.borderColor = 'var(--r)'; btn.style.color = 'var(--r)';
    fb.style.background = 'rgba(255,107,107,.1)'; fb.style.color = 'var(--r)';
    fb.textContent = '❌ Salah.';
    btns[ans ? 0 : 1].style.borderColor = 'var(--g)';
    btns[ans ? 0 : 1].style.color = 'var(--g)';
  }
}

function votePoll(i) {
  var opts = document.querySelectorAll('.poll-opt');
  for (var j = 0; j < opts.length; j++) {
    opts[j].style.borderColor = j === i ? 'var(--y)' : 'var(--border)';
    opts[j].style.background = j === i ? 'rgba(249,193,46,.12)' : 'rgba(255,255,255,.04)';
  }
}

function memFlip(i) {
  var el = document.getElementById('mem-' + i);
  if (el) {
    el.style.background = el.style.background === 'transparent' ? 'var(--card)' : 'transparent';
    el.style.color = el.style.color === 'transparent' ? 'var(--text)' : 'transparent';
  }
}

function spinRoda() {
  var svg = document.getElementById('rodaSvg');
  if (svg) { svg.style.transition = 'transform 3s cubic-bezier(0.17,0.67,0.12,0.99)'; svg.style.transform = 'rotate(' + (1440 + Math.random() * 360) + 'deg)'; }
  var res = document.getElementById('rodaResult');
  if (res) res.textContent = '🎡 Memutar...';
  setTimeout(function() { if (res) res.textContent = '✅ Selesai!'; }, 3200);
}

function spinWheel() {
  var svg = document.getElementById('swSvg');
  if (svg) { svg.style.transition = 'transform 3s cubic-bezier(0.17,0.67,0.12,0.99)'; svg.style.transform = 'rotate(' + (1440 + Math.random() * 360) + 'deg)'; }
  var res = document.getElementById('swResult');
  if (res) res.textContent = '🎡 Memutar...';
  setTimeout(function() { if (res) res.textContent = '✅ Selesai!'; }, 3200);
}

function buzzTeam(i) {
  var el = document.getElementById('team-score-' + i);
  if (el) { var cur = parseInt(el.textContent) || 0; el.textContent = cur + 10; }
  var res = document.getElementById('buzzerResult');
  if (res) { res.textContent = '🔔 Tim ' + (i + 1) + ' menjawab!'; res.style.animation = 'none'; setTimeout(function() { res.style.animation = 'fadeIn .3s ease'; }, 10); }
}

// ── CONFETTI ────────────────────────────────────────
function launchConfetti() {
  var w = document.getElementById('confWrap');
  if (!w) return;
  var cols = ['#f9c12e', '#3ecfcf', '#ff6b6b', '#a78bfa', '#34d399'];
  for (var i = 0; i < 80; i++) {
    var c = document.createElement('div');
    c.className = 'conf';
    var sz = 4 + Math.random() * 9;
    c.style.cssText = 'left:' + Math.random() * 100 + '%;top:' + (-20 - Math.random() * 30) + 'px;width:' + sz + 'px;height:' + sz + 'px;background:' + cols[Math.floor(Math.random() * cols.length)] + ';border-radius:' + (Math.random() > .5 ? '50%' : '2px') + ';animation-duration:' + (2 + Math.random() * 2) + 's;animation-delay:' + (Math.random() * .6) + 's;';
    w.appendChild(c);
  }
  setTimeout(function() { w.innerHTML = ''; }, 5000);
}

// ── HTML ESCAPE HELPER (browser-side) ──────────────
function escH(s) {
  if (s == null) return '';
  var str = String(s);
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── INIT ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  updateNavbarProgress('s-cover');
});`;
}
