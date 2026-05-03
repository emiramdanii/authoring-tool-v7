// ═══════════════════════════════════════════════════════════════
// KUIS.TS — Interactive quiz screen template
// Generates an interactive quiz page with question cards,
// option buttons, feedback, progress dots, and score tracking.
// Matches the preset s-kuis design quality.
// ═══════════════════════════════════════════════════════════════

import type { KuisSlotData } from '../engine/slot-types';

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
// MAIN EXPORT — renderKuisHTML
// ═══════════════════════════════════════════════════════════════
export function renderKuisHTML(data: KuisSlotData, screenId: string): string {
  const kuis = data.kuis || [];
  const kuisJS = JSON.stringify(
    kuis.map((s) => ({
      q: s.q,
      opts: s.opts || ['', '', '', ''],
      ans: s.ans,
      ex: s.ex,
    })),
  );

  // Build progress dots HTML
  const progressDotsHTML = kuis.length > 0
    ? `<div class="puzzle-prog" id="kuisProgDots">${kuis.map((_, i) => `<div class="puzzle-dot${i === 0 ? ' cur' : ''}" id="pdot_${i}"></div>`).join('')}</div>`
    : '';

  // Build the question card HTML statically (for SSR), but JS will also
  // re-render on init for dynamic interactivity.
  const questionCardsHTML = kuis
    .map((s, i) => {
      return `<div class="q-card" id="qCard_${i}" style="animation:fadeIn .4s ease ${i * 0.08}s both">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <span style="font-size:.72rem;font-weight:900;color:var(--c);background:rgba(62,207,207,.1);padding:3px 10px;border-radius:99px">❓ Soal ${i + 1}</span>
          <span id="qStatus_${i}" style="font-size:.72rem;font-weight:800;margin-left:auto;display:none"></span>
        </div>
        <div class="q-text">${esc(s.q)}</div>
        <div class="q-opts">
          ${(s.opts || []).map((o, j) => `<div class="q-opt" id="qo_${i}_${j}" onclick="answerQ(${i},${j})">
            <span style="font-weight:900;color:var(--c);min-width:20px">${'ABCD'[j]}.</span>
            <span>${esc(o)}</span>
          </div>`).join('')}
        </div>
        <div id="qfb_${i}" style="display:none" class="q-fb"></div>
      </div>`;
    })
    .join('');

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Kuis">
  <div class="main">
    <!-- Header card -->
    <div class="card" style="margin-bottom:14px">
      <span class="chip-sc" style="background:rgba(249,193,46,.15);color:var(--y)">❓ Kuis Pengetahuan</span>
      <div class="h2">❓ <span class="hl">Kuis</span> Pengetahuan</div>
      <p class="sub mt8">${kuis.length} soal · Jawab dan lihat penjelasannya langsung.</p>
      <!-- Score tracking bar -->
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        <div style="background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:6px 12px;font-size:.76rem;font-weight:800;color:var(--g)">
          ✅ Benar: <span id="kuisCorrectCount">0</span>
        </div>
        <div style="background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.2);border-radius:8px;padding:6px 12px;font-size:.76rem;font-weight:800;color:var(--r)">
          ❌ Salah: <span id="kuisWrongCount">0</span>
        </div>
        <div style="background:rgba(249,193,46,.08);border:1px solid rgba(249,193,46,.2);border-radius:8px;padding:6px 12px;font-size:.76rem;font-weight:800;color:var(--y)">
          ⏳ Sisa: <span id="kuisRemainingCount">${kuis.length}</span>
        </div>
      </div>
    </div>

    <!-- Progress dots -->
    ${progressDotsHTML}

    <!-- Question container -->
    <div id="kuisContainer">
      ${kuis.length
        ? questionCardsHTML
        : '<div class="card" style="text-align:center;padding:30px;color:var(--muted)">Kuis belum diisi.</div>'}
    </div>

    <!-- Submit button -->
    <div class="btn-row btn-center mt14">
      <button class="btn btn-y" id="btnKuisSubmit" onclick="submitKuis()" style="display:none">Lihat Hasil 📊</button>
    </div>

    <div class="btn-row btn-center">
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <script data-kuis-init="${esc(screenId)}">
  (function(){
    var KUIS_SOAL = ${kuisJS};
    var kuisAnswers = {};
    var kuisCorrect = 0;
    var kuisWrong = 0;
    var kuisScore = 0;

    // ── Update progress dots ─────────────────────────
    function updateProgressDots(){
      for(var i = 0; i < KUIS_SOAL.length; i++){
        var dot = document.getElementById('pdot_' + i);
        if(!dot) continue;
        dot.className = 'puzzle-dot';
        if(kuisAnswers[i] !== undefined){
          dot.classList.add('done');
        } else {
          // Find the next unanswered question
          var nextUnanswered = -1;
          for(var j = 0; j < KUIS_SOAL.length; j++){
            if(kuisAnswers[j] === undefined){ nextUnanswered = j; break; }
          }
          if(i === nextUnanswered) dot.classList.add('cur');
        }
      }
    }

    window.answerQ = function(qi, choice){
      if(kuisAnswers[qi] !== undefined) return; // already answered
      kuisAnswers[qi] = choice;
      var correct = KUIS_SOAL[qi].ans;

      // Disable all options for this question
      var opts = document.querySelectorAll('[id^="qo_'+qi+'_"]');
      for(var i=0;i<opts.length;i++) opts[i].classList.add('dis');

      // Mark selected
      var picked = document.getElementById('qo_'+qi+'_'+choice);
      if(picked) picked.classList.add(choice === correct ? 'ok' : 'no');

      // Show correct answer if wrong
      if(choice !== correct){
        var correctEl = document.getElementById('qo_'+qi+'_'+correct);
        if(correctEl) correctEl.classList.add('shok');
        kuisWrong++;
      } else {
        kuisCorrect++;
        kuisScore += 10;
        // Use global scoring system
        if(typeof addScore === 'function') addScore(10);
      }

      // Show feedback
      var fb = document.getElementById('qfb_'+qi);
      if(fb){
        fb.style.display = 'block';
        fb.className = 'q-fb '+(choice===correct?'ok':'no');
        fb.textContent = (choice===correct?'✅ Benar! ':'❌ Salah. ')+(KUIS_SOAL[qi].ex||'');
      }

      // Update status badge
      var statusEl = document.getElementById('qStatus_'+qi);
      if(statusEl){
        statusEl.style.display = 'inline-block';
        statusEl.textContent = choice===correct ? '✅' : '❌';
        statusEl.style.color = choice===correct ? 'var(--g)' : 'var(--r)';
      }

      // Update counters
      var correctEl2 = document.getElementById('kuisCorrectCount');
      var wrongEl2 = document.getElementById('kuisWrongCount');
      var remainEl = document.getElementById('kuisRemainingCount');
      if(correctEl2) correctEl2.textContent = kuisCorrect;
      if(wrongEl2) wrongEl2.textContent = kuisWrong;
      if(remainEl) remainEl.textContent = KUIS_SOAL.length - Object.keys(kuisAnswers).length;

      // Update progress dots
      updateProgressDots();

      // Update nav score via global system
      if(typeof updateNavbarScore === 'function') updateNavbarScore();

      // Show submit button when all answered
      if(Object.keys(kuisAnswers).length === KUIS_SOAL.length){
        var submitBtn = document.getElementById('btnKuisSubmit');
        if(submitBtn) submitBtn.style.display = 'inline-flex';
      }
    };

    window.submitKuis = function(){
      var skor = Math.round((kuisCorrect / KUIS_SOAL.length) * 100);
      // Store quiz result globally so hasil screen can read it
      window._kuisResult = { skor: skor, correct: kuisCorrect, wrong: kuisWrong, total: KUIS_SOAL.length };
      // Navigate to hasil screen if it exists, otherwise show inline result
      var hasilScreen = document.getElementById('s-hasil');
      if(hasilScreen){
        // Navigate — hasil screenActivate will call animateScore which reads _kuisResult
        goScreen('s-hasil');
      } else {
        // No hasil screen — show inline result
        var container = document.getElementById('kuisContainer');
        if(container){
          var levelEmoji = skor >= 85 ? '🌟' : skor >= 70 ? '👍' : '💪';
          var levelText = skor >= 85 ? 'Sangat Baik!' : skor >= 70 ? 'Baik' : 'Perlu Latihan';
          var levelColor = skor >= 85 ? 'var(--g)' : skor >= 70 ? 'var(--y)' : 'var(--r)';
          container.innerHTML =
            '<div style="text-align:center;padding:30px">' +
              '<div style="font-size:3rem;margin-bottom:12px">'+levelEmoji+'</div>' +
              '<div style="font-family:Fredoka One,cursive;font-size:2.4rem;color:'+levelColor+'">'+skor+'</div>' +
              '<div style="font-size:.8rem;color:var(--muted);margin-top:2px">SKOR</div>' +
              '<div style="margin-top:12px;padding:10px 20px;border-radius:12px;font-weight:800;display:inline-block;background:'+levelColor+'18;color:'+levelColor+';border:1px solid '+levelColor+'33">'+levelEmoji+' '+levelText+'</div>' +
              '<div style="margin-top:18px;display:flex;gap:12px;justify-content:center">' +
                '<div style="font-size:.86rem"><strong style="color:var(--g)">'+kuisCorrect+'</strong> benar</div>' +
                '<div style="font-size:.86rem"><strong style="color:var(--r)">'+kuisWrong+'</strong> salah</div>' +
              '</div>' +
            '</div>';
        }
      }
    };

    // Initialize progress dots
    updateProgressDots();
  })();
  </script>
  <style>
    .puzzle-prog{display:flex;gap:5px;margin:10px 0 6px;}
    .puzzle-dot{width:22px;height:5px;border-radius:99px;background:rgba(255,255,255,.1);transition:background .3s;}
    .puzzle-dot.done{background:var(--g);}
    .puzzle-dot.cur{background:var(--y);}
  </style>
</div>`;
}
