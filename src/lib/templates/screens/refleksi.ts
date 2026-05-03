// ═══════════════════════════════════════════════════════════════
// REFLEKSI.TS — Reflection page screen template (Preset Quality)
// Generates a reflection page with:
// - Portofolio section (auto-show saved discussion answers from localStorage)
// - Flashcard ringkasan (mini flashcard summary with hover effects)
// - Prompted text areas for student self-assessment
// - Character counter with color coding + progress tracking
// - Auto-save to localStorage (debounced 1s) with restore on load
// - Completion celebration with confetti burst
// - Staggered entrance animations triggered by screenActivate
// ═══════════════════════════════════════════════════════════════

import type { RefleksiSlotData, FlashcardItem } from '../engine/slot-types';
import { esc } from '../engine/esc';

// ── Default reflection prompts if none provided ───────────────
const DEFAULT_PROMPTS = [
  {
    question: '💭 Apa hal terpenting yang kamu pelajari hari ini?',
    placeholder: 'Tuliskan poin utama yang kamu ingat…',
  },
  {
    question: '🎯 Seberapa baik kamu memahami materi hari ini?',
    placeholder: 'Nilai dirimu: 1 (kurang) sampai 5 (sangat paham)…',
  },
  {
    question: '🌟 Bagaimana kamu akan menerapkan apa yang dipelajari?',
    placeholder: 'Tuliskan rencana aksi nyata…',
  },
];

// ── Reflection icons cycling ──────────────────────────────────
const PROMPT_ICONS = ['💭', '🎯', '🌟', '📝', '🔍', '💡', '🤔', '💬', '📚', '✨'];

// ── Color map for prompt glow effects ─────────────────────────
const PROMPT_GLOW_COLORS = [
  'rgba(62,207,207,.35)',   // 💭 cyan
  'rgba(249,193,46,.35)',   // 🎯 yellow
  'rgba(52,211,153,.35)',   // 🌟 green
  'rgba(167,139,250,.35)',  // 📝 purple
  'rgba(255,107,107,.35)',  // 🔍 red
  'rgba(251,146,60,.35)',   // 💡 orange
  'rgba(62,207,207,.35)',   // 🤔 cyan
  'rgba(249,193,46,.35)',   // 💬 yellow
  'rgba(52,211,153,.35)',   // 📚 green
  'rgba(167,139,250,.35)',  // ✨ purple
];

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderRefleksiHTML
// ═══════════════════════════════════════════════════════════════
export function renderRefleksiHTML(data: RefleksiSlotData, screenId: string): string {
  const prompts = data.prompts && data.prompts.length > 0
    ? data.prompts
    : DEFAULT_PROMPTS;
  const portofolio = data.portofolio || [];
  const flashcardRingkasan = data.flashcardRingkasan || [];
  const useLocalStorage = data.useLocalStorage === true || data.useLocalStorage === 'yes' || data.useLocalStorage === 'true';

  // Build portofolio section — either static or localStorage-driven
  let portofolioHTML = '';

  if (useLocalStorage) {
    // Auto-populate from localStorage PORTO object (populated by diskusi boxes)
    portofolioHTML = `
    <div class="rf-porto-section rf-stagger" style="--rf-delay:1">
      <div style="margin-top:16px;background:rgba(62,207,207,.06);border:1px solid rgba(62,207,207,.2);border-radius:13px;padding:14px">
        <div class="rf-section-header">
          <span class="rf-quote-mark">"</span>
          <span style="font-weight:800;font-size:.86rem;color:var(--c)">📂 Portofolio Jawabanmu Hari Ini</span>
        </div>
        <div id="portofolio"></div>
      </div>
    </div>`;
  } else if (portofolio.length > 0) {
    // Static portofolio from slot data
    const portoCardsHTML = portofolio.map((p, i) => `
      <div class="porto-card rf-porto-card" style="--rf-porto-delay:${i * 0.08}s">
        <div class="porto-label">${esc(p.label || 'Jawaban Diskusi')}</div>
        <div class="porto-val" id="porto-${esc(p.id || '')}">${esc(p.value || '(Belum dijawab)')}</div>
      </div>`).join('');

    portofolioHTML = `
    <div class="rf-porto-section rf-stagger" style="--rf-delay:1">
      <div style="margin-top:16px;background:rgba(62,207,207,.06);border:1px solid rgba(62,207,207,.2);border-radius:13px;padding:14px">
        <div class="rf-section-header">
          <span class="rf-quote-mark">"</span>
          <span style="font-weight:800;font-size:.86rem;color:var(--c)">📂 Portofolio Jawabanmu</span>
        </div>
        ${portoCardsHTML}
      </div>
    </div>`;
  }

  // Build flashcard ringkasan
  let flashcardHTML = '';
  if (flashcardRingkasan.length > 0) {
    const fcCards = flashcardRingkasan.map((c, i) => {
      const colors = ['var(--y)', 'var(--c)', 'var(--g)', 'var(--p)', 'var(--r)', 'var(--o)'];
      const col = colors[i % colors.length];
      return `<div class="refl-fc rf-fc-card" style="animation:rfFadeUp .4s ease ${i * 0.1}s both" onclick="this.classList.toggle('refl-fc-flip')">
        <div class="refl-fc-inner">
          <div class="refl-fc-front" style="border-color:${col}44">
            <div style="font-size:1.6rem;margin-bottom:6px">${esc(c.icon || '📌')}</div>
            <div style="font-weight:800;font-size:.84rem;line-height:1.4">${esc(c.front)}</div>
            <div style="font-size:.68rem;color:var(--muted);margin-top:8px">Ketuk untuk lihat jawaban</div>
          </div>
          <div class="refl-fc-back">
            <div style="font-size:.84rem;font-weight:700;line-height:1.6">${esc(c.back)}</div>
          </div>
        </div>
      </div>`;
    }).join('');

    flashcardHTML = `
    <div class="card mt14 rf-stagger" style="--rf-delay:2">
      <div class="rf-section-header">
        <span class="rf-quote-mark">"</span>
        <span style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">🃏 Ringkasan Materi</span>
      </div>
      <div class="refl-fc-grid">${fcCards}</div>
    </div>`;
  }

  // Build reflection prompt items
  const promptItemsHTML = prompts
    .map((p, i) => {
      const icon = PROMPT_ICONS[i % PROMPT_ICONS.length];
      const glowColor = PROMPT_GLOW_COLORS[i % PROMPT_GLOW_COLORS.length];
      return `<div class="refl-item rf-stagger rf-prompt-card" style="--rf-delay:${4 + i}">
        <label>${icon} ${esc(p.question)}</label>
        <textarea class="rf-textarea" placeholder="${esc(p.placeholder)}" data-refl-idx="${i}" style="--rf-glow:${glowColor}" oninput="onReflInput(${i},this)"></textarea>
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
          <div id="reflCharCount${i}" class="rf-char-count" data-idx="${i}">0 karakter</div>
          <div style="flex:1"></div>
          <div id="reflAutoSave${i}" class="rf-autosave-badge">✓ Tersimpan otomatis</div>
          <div id="reflCheck${i}" style="font-size:.78rem;opacity:0;transition:opacity .3s;color:var(--g)">✅</div>
        </div>
      </div>`;
    })
    .join('');

  // Completion progress bar
  const totalPrompts = prompts.length;

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Refleksi">
  <div class="main">
    <!-- Title card -->
    <div class="card rf-stagger" style="margin-bottom:14px;--rf-delay:0">
      <div class="h2">💭 <span class="hl">Refleksi</span> Pembelajaran</div>
      <p class="sub mt8">Luangkan waktu untuk merefleksikan pembelajaranmu hari ini.</p>
    </div>

    ${portofolioHTML}

    ${flashcardHTML}

    <!-- Progress indicator -->
    <div class="rf-stagger rf-progress-wrap" style="--rf-delay:3;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:99px;padding:8px 16px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted)">Progress</div>
      <div class="rf-progress-track" style="flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden">
        <div id="reflProgressBar" class="rf-progress-fill" style="height:100%;border-radius:99px;transition:width .5s;width:0%"></div>
      </div>
      <div id="reflProgressText" style="font-size:.78rem;font-weight:900;color:var(--c)">0/${esc(totalPrompts)}</div>
    </div>

    <!-- Prompt cards -->
    <div class="card rf-stagger" style="--rf-delay:4">
      ${promptItemsHTML}
    </div>

    <!-- Completion message -->
    <div id="reflCompleteMsg" class="card mt14 rf-complete-card" style="display:none;text-align:center;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2)">
      <div class="rf-complete-emoji" style="font-size:2.5rem;margin-bottom:8px">🎉</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:var(--g)">Refleksi Selesai!</div>
      <p style="font-size:.84rem;color:var(--muted);margin-top:6px">Terima kasih sudah merefleksikan pembelajaranmu.</p>
      <button class="btn btn-c btn-sm rf-btn-porto" onclick="document.getElementById('portofolio')&&document.getElementById('portofolio').closest('.rf-porto-section').scrollIntoView({behavior:'smooth',block:'center'})" style="margin-top:12px">📂 Lihat Portofolio Lengkap</button>
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y rf-btn-next" id="btnReflNext" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" id="btnReflReset" onclick="resetReflAnswers()">🔄 Reset Jawaban</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <style>
    /* ── Entrance animations ──────────────────────────────── */
    @keyframes rfFadeUp{
      from{opacity:0;transform:translateY(18px);}
      to{opacity:1;transform:translateY(0);}
    }
    @keyframes rfScaleIn{
      from{opacity:0;transform:scale(.85);}
      to{opacity:1;transform:scale(1);}
    }
    @keyframes rfShimmer{
      0%{background-position:-200% center;}
      100%{background-position:200% center;}
    }
    @keyframes rfPulse{
      0%,100%{transform:scale(1);}
      50%{transform:scale(1.05);}
    }
    @keyframes rfConfettiPop{
      0%{opacity:0;transform:scale(0) rotate(0deg);}
      50%{opacity:1;transform:scale(1.15) rotate(5deg);}
      100%{opacity:1;transform:scale(1) rotate(0deg);}
    }

    /* ── Staggered entrance: hidden by default, revealed by .rf-active ── */
    .rf-stagger{
      opacity:0;
      transform:translateY(18px);
      transition:opacity .5s ease,transform .5s ease;
      transition-delay:calc(var(--rf-delay,0) * .1s);
    }
    .rf-active .rf-stagger{
      opacity:1;
      transform:translateY(0);
    }

    /* ── Section headers with decorative quote ────────────── */
    .rf-section-header{display:flex;align-items:center;gap:6px;margin-bottom:10px;}
    .rf-quote-mark{font-size:1.3rem;opacity:.3;color:var(--c);font-family:Georgia,serif;line-height:1;}

    /* ── Portofolio cards entrance ────────────────────────── */
    .rf-porto-card{
      opacity:0;
      transform:translateX(-8px);
      transition:opacity .35s ease,transform .35s ease;
      transition-delay:var(--rf-porto-delay,0s);
    }
    .rf-active .rf-porto-card{
      opacity:1;
      transform:translateX(0);
    }

    /* ── Flashcard hover effects ──────────────────────────── */
    .rf-fc-card{
      transition:transform .2s ease,box-shadow .2s ease;
    }
    .rf-fc-card:hover{
      transform:translateY(-3px);
      box-shadow:0 6px 20px rgba(0,0,0,.15);
    }

    /* ── Progress bar gradient + shimmer ──────────────────── */
    .rf-progress-fill{
      background:linear-gradient(90deg,var(--c),var(--g),var(--c));
      background-size:200% 100%;
      animation:rfShimmer 2.5s linear infinite;
    }
    .rf-progress-fill.rf-complete-anim{
      background:linear-gradient(90deg,var(--g),var(--c),var(--y),var(--g));
      background-size:200% 100%;
      animation:rfShimmer 1.5s linear infinite;
    }

    /* ── Textarea focus glow ──────────────────────────────── */
    .rf-textarea{
      transition:border-color .25s ease,box-shadow .25s ease;
    }
    .rf-textarea:focus{
      outline:none;
      border-color:var(--rf-glow,rgba(62,207,207,.3));
      box-shadow:0 0 0 3px var(--rf-glow,rgba(62,207,207,.15));
    }

    /* ── Character count color coding ─────────────────────── */
    .rf-char-count{font-size:.68rem;color:var(--muted);transition:color .25s ease;}
    .rf-char-count.rf-char-ok{color:var(--g);}
    .rf-char-count.rf-char-warn{color:var(--y);}
    .rf-char-count.rf-char-limit{color:var(--r);}

    /* ── Auto-save badge ──────────────────────────────────── */
    .rf-autosave-badge{
      font-size:.64rem;
      color:var(--g);
      opacity:0;
      transition:opacity .3s ease;
      pointer-events:none;
      white-space:nowrap;
    }
    .rf-autosave-badge.rf-show{opacity:1;}

    /* ── Completion card ──────────────────────────────────── */
    .rf-complete-card{
      transition:opacity .4s ease,transform .4s ease;
    }
    .rf-complete-card.rf-celebrate{
      animation:rfConfettiPop .6s ease both;
    }
    .rf-complete-emoji{
      animation:rfPulse 1.5s ease-in-out infinite;
    }
    .rf-complete-card.rf-celebrate .rf-complete-emoji{
      animation:rfConfettiPop .5s ease both, rfPulse 1.5s ease-in-out .5s infinite;
    }

    /* ── Next button when complete ────────────────────────── */
    .rf-btn-next.rf-btn-done{
      animation:rfPulse 1.5s ease-in-out infinite;
      background:var(--g) !important;
      border-color:var(--g) !important;
      color:#fff !important;
      box-shadow:0 0 16px rgba(52,211,153,.4);
    }

    /* ── Reset button ─────────────────────────────────────── */
    .rf-btn-reset-confirm{
      font-size:.72rem;
      color:var(--r);
      cursor:pointer;
    }
  </style>

  <script data-refl-init="${esc(screenId)}">
  (function(){
    var TOTAL = ${totalPrompts};
    var SCREEN_ID = '${esc(screenId)}';
    var LS_KEY = 'rf-refleksi-' + SCREEN_ID;
    var answered = {};
    var saveTimers = {};
    var hasConfettied = false;

    // ── Debounced auto-save ──────────────────────────────────
    function scheduleSave(idx){
      if(saveTimers[idx]) clearTimeout(saveTimers[idx]);
      saveTimers[idx] = setTimeout(function(){
        saveToLS();
        showAutoSaveBadge(idx);
      }, 1000);
    }

    function saveToLS(){
      try{
        var data = {};
        for(var i = 0; i < TOTAL; i++){
          var ta = document.querySelector('[data-refl-idx="'+i+'"]');
          if(ta && ta.value.trim()){
            data[i] = ta.value;
          }
        }
        localStorage.setItem(LS_KEY, JSON.stringify(data));
      }catch(e){}
    }

    function restoreFromLS(){
      try{
        var raw = localStorage.getItem(LS_KEY);
        if(!raw) return;
        var data = JSON.parse(raw);
        for(var i = 0; i < TOTAL; i++){
          if(data[i]){
            var ta = document.querySelector('[data-refl-idx="'+i+'"]');
            if(ta){
              ta.value = data[i];
              // Trigger input handler to restore state
              onReflInput(i, ta);
            }
          }
        }
      }catch(e){}
    }

    function clearLS(){
      try{ localStorage.removeItem(LS_KEY); }catch(e){}
    }

    function showAutoSaveBadge(idx){
      var badge = document.getElementById('reflAutoSave'+idx);
      if(!badge) return;
      badge.classList.add('rf-show');
      setTimeout(function(){ badge.classList.remove('rf-show'); }, 2000);
    }

    // ── Character count color coding ────────────────────────
    function updateCharCount(idx, len){
      var el = document.getElementById('reflCharCount'+idx);
      if(!el) return;
      el.textContent = len + ' karakter';
      el.classList.remove('rf-char-ok','rf-char-warn','rf-char-limit');
      if(len >= 5 && len < 50){
        el.classList.add('rf-char-ok');
      } else if(len >= 50 && len < 200){
        el.classList.add('rf-char-ok');
      } else if(len >= 200){
        el.classList.add('rf-char-warn');
      } else if(len > 0 && len < 5){
        el.classList.add('rf-char-limit');
      }
    }

    // ── Enhanced input handler ──────────────────────────────
    window.onReflInput = function(idx, el){
      var val = (el.value || '').trim();
      var len = val.length;
      var checkEl = document.getElementById('reflCheck'+idx);

      updateCharCount(idx, len);

      var wasAnswered = !!answered[idx];
      var isAnswered = len >= 5;

      if(isAnswered && !wasAnswered){
        answered[idx] = true;
        addScore(5);
        if(checkEl){
          checkEl.style.opacity = '1';
          checkEl.style.transform = 'scale(1.3)';
          setTimeout(function(){ checkEl.style.transform = 'scale(1)'; }, 200);
        }
        el.style.borderColor = 'rgba(52,211,153,.3)';
      } else if(!isAnswered && wasAnswered){
        delete answered[idx];
        S.score = Math.max(0, S.score - 5);
        updateNavbarScore();
        if(checkEl) checkEl.style.opacity = '0';
        el.style.borderColor = 'var(--border)';
      }

      updateReflProgress();
      scheduleSave(idx);
    };

    function updateReflProgress(){
      var count = Object.keys(answered).length;
      var pct = Math.round((count / TOTAL) * 100);
      var bar = document.getElementById('reflProgressBar');
      var text = document.getElementById('reflProgressText');
      if(bar){
        bar.style.width = pct + '%';
        if(count >= TOTAL){
          bar.classList.add('rf-complete-anim');
        } else {
          bar.classList.remove('rf-complete-anim');
        }
      }
      if(text) text.textContent = count + '/' + TOTAL;

      var msg = document.getElementById('reflCompleteMsg');
      if(msg){
        if(count >= TOTAL){
          msg.style.display = 'block';
          // Dramatic entrance on first completion
          if(!hasConfettied){
            hasConfettied = true;
            msg.classList.add('rf-celebrate');
            if(typeof launchConfetti === 'function') launchConfetti();
          }
        } else {
          msg.style.display = 'none';
          msg.classList.remove('rf-celebrate');
          hasConfettied = false;
        }
      }

      // Make "Lanjut" button prominent when all done
      var nextBtn = document.getElementById('btnReflNext');
      if(nextBtn){
        if(count >= TOTAL){
          nextBtn.classList.add('rf-btn-done');
        } else {
          nextBtn.classList.remove('rf-btn-done');
        }
      }
    }

    // ── Reset with confirmation ─────────────────────────────
    window.resetReflAnswers = function(){
      var confirmed = false;
      // Build a simple inline confirmation UI instead of alert
      var resetBtn = document.getElementById('btnReflReset');
      if(!resetBtn) return;

      if(resetBtn.dataset.confirming === 'true'){
        // Second click = confirmed
        confirmed = true;
      } else {
        // First click = ask confirmation
        resetBtn.dataset.confirming = 'true';
        resetBtn.textContent = '⚠️ Yakin Reset?';
        resetBtn.style.color = 'var(--r)';
        resetBtn.style.borderColor = 'var(--r)';
        setTimeout(function(){
          resetBtn.dataset.confirming = 'false';
          resetBtn.textContent = '🔄 Reset Jawaban';
          resetBtn.style.color = '';
          resetBtn.style.borderColor = '';
        }, 3000);
        return;
      }

      if(!confirmed) return;

      // Reset all textareas
      for(var i = 0; i < TOTAL; i++){
        var ta = document.querySelector('[data-refl-idx="'+i+'"]');
        if(ta){
          ta.value = '';
          ta.style.borderColor = 'var(--border)';
        }
        var checkEl = document.getElementById('reflCheck'+i);
        if(checkEl) checkEl.style.opacity = '0';
        var charEl = document.getElementById('reflCharCount'+i);
        if(charEl){
          charEl.textContent = '0 karakter';
          charEl.classList.remove('rf-char-ok','rf-char-warn','rf-char-limit');
        }
      }

      // Deduct score for answered items
      var answeredCount = Object.keys(answered).length;
      if(answeredCount > 0){
        S.score = Math.max(0, S.score - (answeredCount * 5));
        updateNavbarScore();
      }
      answered = {};
      clearLS();
      updateReflProgress();

      // Reset button state
      resetBtn.dataset.confirming = 'false';
      resetBtn.textContent = '🔄 Reset Jawaban';
      resetBtn.style.color = '';
      resetBtn.style.borderColor = '';
    };

    /* ── Portofolio from localStorage ───────────────────────────── */
    if(${useLocalStorage}) {
      window.showPortofolio = function() {
        var el = document.getElementById('portofolio');
        if(!el) return;
        var PORTO = window.PORTO || {};
        var keys = Object.keys(PORTO);
        if(keys.length === 0){
          el.innerHTML = '<div style="font-size:.82rem;color:var(--muted);font-style:italic">Belum ada jawaban yang tersimpan. Kembali dan isi pertanyaan diskusi dulu ya!</div>';
          return;
        }
        el.innerHTML = keys.map(function(k, i){
          return '<div class="porto-card rf-porto-card" style="--rf-porto-delay:'+i*0.08+'s">' +
            '<div class="porto-label">' + PORTO[k].label + '</div>' +
            '<div class="porto-val">"' + PORTO[k].text + '"</div>' +
          '</div>';
        }).join('');
      };
      showPortofolio();
    }

    // ── Screen activation hook ──────────────────────────────
    function activate(){
      var screenEl = document.getElementById(SCREEN_ID);
      if(screenEl) screenEl.classList.add('rf-active');
    }

    var screenEl = document.getElementById(SCREEN_ID);
    if(screenEl){
      screenEl.addEventListener('screenActivate', function(){
        activate();
        restoreFromLS();
        if(${useLocalStorage}) showPortofolio();
      });

      // Check initial state
      if(screenEl.classList.contains('active')){
        activate();
        restoreFromLS();
      }
    }
  })();
  </script>
</div>`;
}
