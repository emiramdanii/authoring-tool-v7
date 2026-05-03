// ═══════════════════════════════════════════════════════════════
// HASIL.TS — Results / Score screen template
// Generates the results page with animated score circle,
// appreciation level badges, reflection textareas, and confetti.
// Matches the s-hasil design from export-html.ts.
// ═══════════════════════════════════════════════════════════════

import type { HasilSlotData } from '../engine/slot-types';

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

// ── Determine level info from score ───────────────────────────
interface LevelInfo {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

function getLevelInfo(score: number, level?: string): LevelInfo {
  // If explicit level is provided, use it; otherwise derive from score
  if (level === 'sangat-baik' || score >= 85) {
    return {
      label: 'Sangat Baik!',
      emoji: '🌟',
      color: 'var(--g)',
      bgColor: 'rgba(52,211,153,.1)',
      borderColor: 'rgba(52,211,153,.3)',
    };
  }
  if (level === 'baik' || score >= 70) {
    return {
      label: 'Baik',
      emoji: '👍',
      color: 'var(--y)',
      bgColor: 'rgba(249,193,46,.1)',
      borderColor: 'rgba(249,193,46,.3)',
    };
  }
  return {
    label: 'Perlu Latihan',
    emoji: '💪',
    color: 'var(--r)',
    bgColor: 'rgba(255,107,107,.1)',
    borderColor: 'rgba(255,107,107,.3)',
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderHasilHTML
// ═══════════════════════════════════════════════════════════════
export function renderHasilHTML(data: HasilSlotData, screenId: string): string {
  const score = data.score || 0;
  const levelInfo = getLevelInfo(score, data.level);
  const shouldConfetti = score >= 70;

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">${esc(data.namaBab || data.title || 'Hasil')}</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:100%"></div></div>
    <span class="nav-score">${score} ⭐</span>
  </nav>
  <div class="main" style="text-align:center">
    <div class="card" style="margin-bottom:14px">
      <div class="h2">🏆 <span class="hl">Hasil</span> Belajar</div>
      <p class="sub mt8">${esc(data.namaBab || 'Bab ini')} · ${esc(data.totalKuis || 0)} soal</p>
    </div>

    <!-- Score Circle -->
    <div class="hasil-circle" id="hasilCircle" style="--prog:0%">
      <div class="hasil-score">
        <div style="font-family:'Fredoka One',cursive;font-size:2rem;color:${esc(levelInfo.color)}" id="hasilNum">0</div>
        <div style="font-size:.7rem;color:var(--muted)">SKOR</div>
      </div>
    </div>

    <!-- Level Badge -->
    <div id="hasilLevel" style="padding:10px 20px;border-radius:12px;font-weight:800;font-size:.92rem;margin:12px 0;display:inline-block;background:${esc(levelInfo.bgColor)};border:1px solid ${esc(levelInfo.borderColor)};color:${esc(levelInfo.color)}">
      ${esc(levelInfo.emoji)} ${esc(levelInfo.label)}
    </div>

    <!-- Score Breakdown -->
    <div class="card mt14" style="text-align:left">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">📊 Rincian Skor</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:120px;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2);border-radius:10px;padding:12px;text-align:center">
          <div style="font-family:'Fredoka One',cursive;font-size:1.4rem;color:var(--g)" id="hasilCorrect">0</div>
          <div style="font-size:.72rem;color:var(--muted)">Benar</div>
        </div>
        <div style="flex:1;min-width:120px;background:rgba(255,107,107,.06);border:1px solid rgba(255,107,107,.2);border-radius:10px;padding:12px;text-align:center">
          <div style="font-family:'Fredoka One',cursive;font-size:1.4rem;color:var(--r)" id="hasilWrong">0</div>
          <div style="font-size:.72rem;color:var(--muted)">Salah</div>
        </div>
        <div style="flex:1;min-width:120px;background:rgba(249,193,46,.06);border:1px solid rgba(249,193,46,.2);border-radius:10px;padding:12px;text-align:center">
          <div style="font-family:'Fredoka One',cursive;font-size:1.4rem;color:var(--y)">${esc(data.totalKuis || 0)}</div>
          <div style="font-size:.72rem;color:var(--muted)">Total Soal</div>
        </div>
      </div>
    </div>

    <!-- Reflection -->
    <div class="card mt14" style="text-align:left">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">💭 Refleksi Pembelajaran</div>
      <div class="refl-item">
        <label>💭 Apa yang paling kamu pelajari hari ini?</label>
        <textarea placeholder="Tuliskan refleksimu…"></textarea>
      </div>
      <div class="refl-item">
        <label>🌟 Bagaimana kamu akan menerapkannya?</label>
        <textarea placeholder="Rencana aksi nyata…"></textarea>
      </div>
      <div class="refl-item">
        <label>🎯 Apa yang masih ingin kamu pelajari lebih lanjut?</label>
        <textarea placeholder="Topik yang ingin dieksplorasi…"></textarea>
      </div>
    </div>

    <div class="btn-row btn-center mt14">
      <button class="btn btn-y" onclick="launchConfetti()">🎉 Selesai!</button>
      <button class="btn btn-ghost" onclick="goScreen('s-cover')">↩ Ulangi</button>
    </div>
  </div>

  <!-- Confetti container -->
  <div id="confWrap" style="position:fixed;inset:0;pointer-events:none;z-index:9998"></div>

  <script data-hasil-init="${esc(screenId)}">
  (function(){
    var TARGET_SCORE = ${score};
    var TOTAL_KUIS = ${data.totalKuis || 0};
    var SHOULD_CONFETTI = ${shouldConfetti};

    // ── Animate score counter ───────────────────────────
    function animateScore(){
      var circle = document.getElementById('hasilCircle');
      var numEl = document.getElementById('hasilNum');
      var correctEl = document.getElementById('hasilCorrect');
      var wrongEl = document.getElementById('hasilWrong');
      if(!circle || !numEl) return;

      var current = 0;
      var step = Math.max(1, Math.round(TARGET_SCORE / 40));
      var interval = setInterval(function(){
        current += step;
        if(current >= TARGET_SCORE){
          current = TARGET_SCORE;
          clearInterval(interval);
          if(SHOULD_CONFETTI) setTimeout(launchConfetti, 300);
        }
        numEl.textContent = current;
        circle.style.setProperty('--prog', current + '%');
        if(correctEl) correctEl.textContent = Math.round((current / 100) * TOTAL_KUIS);
        if(wrongEl) wrongEl.textContent = TOTAL_KUIS - Math.round((current / 100) * TOTAL_KUIS);
      }, 30);
    }

    // ── Confetti launcher ───────────────────────────────
    window.launchConfetti = function(){
      var w = document.getElementById('confWrap');
      if(!w) return;
      var cols = ['#f9c12e','#3ecfcf','#ff6b6b','#a78bfa','#34d399'];
      for(var i = 0; i < 80; i++){
        var c = document.createElement('div');
        c.className = 'conf';
        var sz = 4 + Math.random() * 9;
        c.style.cssText = 'left:'+Math.random()*100+'%;top:'+(-20-Math.random()*30)+'px;width:'+sz+'px;height:'+sz+'px;background:'+cols[Math.floor(Math.random()*cols.length)]+';border-radius:'+(Math.random()>.5?'50%':'2px')+';animation-duration:'+(2+Math.random()*2)+'s;animation-delay:'+(Math.random()*.6)+'s;';
        w.appendChild(c);
      }
      setTimeout(function(){ w.innerHTML = ''; }, 5000);
    };

    // ── Auto-trigger animation when screen becomes active ──
    var observer = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        if(m.target.classList && m.target.classList.contains('active')){
          setTimeout(animateScore, 200);
        }
      });
    });
    var screenEl = document.getElementById('${esc(screenId)}');
    if(screenEl){
      observer.observe(screenEl, { attributes: true, attributeFilter: ['class'] });
    }

    // Also run if already visible
    if(screenEl && screenEl.classList.contains('active')){
      setTimeout(animateScore, 200);
    }
  })();
  </script>
</div>`;
}
