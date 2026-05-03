// ═══════════════════════════════════════════════════════════════
// RODA-GAME.TS — Spinning wheel game screen template
// Generates a complete HTML block for the Roda Game interactive
// spinning wheel with clickable segments and question reveal.
// ═══════════════════════════════════════════════════════════════

import type { RodaGameSlotData } from '../engine/slot-types';

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

// ── Generate SVG Wheel Segments ───────────────────────────────
function buildWheelSVG(segments: RodaGameSlotData['segments']): string {
  const count = segments.length || 1;
  const anglePerSegment = 360 / count;
  const radius = 140;
  const cx = 160;
  const cy = 160;

  let paths = '';
  let labels = '';

  segments.forEach((seg, i) => {
    const startAngle = i * anglePerSegment - 90; // start from top
    const endAngle = startAngle + anglePerSegment;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = anglePerSegment > 180 ? 1 : 0;

    const pathD = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;

    paths += `<path d="${pathD}" fill="${esc(seg.color || '#3ecfcf')}" stroke="rgba(14,28,47,.6)" stroke-width="2" style="cursor:pointer;transition:opacity .2s,filter .2s" onmouseenter="this.style.filter='brightness(1.3)'" onmouseleave="this.style.filter='brightness(1)'" data-seg-idx="${i}" />`;

    // Label positioned at midpoint of arc
    const midAngle = startAngle + anglePerSegment / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelR = radius * 0.62;
    const lx = cx + labelR * Math.cos(midRad);
    const ly = cy + labelR * Math.sin(midRad);

    labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" fill="#0e1c2f" font-size="${count > 8 ? '.55rem' : '.7rem'}" font-weight="900" font-family="Nunito,sans-serif" style="pointer-events:none">${esc(seg.label)}</text>`;
  });

  return `<svg viewBox="0 0 320 320" style="width:100%;max-width:320px;display:block;margin:0 auto">
    <g id="rodaWheelGroup">${paths}${labels}</g>
    <circle cx="${cx}" cy="${cy}" r="22" fill="#0e1c2f" stroke="#f9c12e" stroke-width="3" />
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#f9c12e" font-size="1.1rem" font-weight="900" font-family="Fredoka One,cursive">🎡</text>
    <polygon points="${cx},${cy - radius - 14} ${cx - 8},${cy - radius - 2} ${cx + 8},${cy - radius - 2}" fill="#f9c12e" stroke="#0e1c2f" stroke-width="1.5" />
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderRodaGameHTML
// ═══════════════════════════════════════════════════════════════
export function renderRodaGameHTML(data: RodaGameSlotData, screenId: string): string {
  const segments = data.segments || [];
  const segmentJS = JSON.stringify(segments.map((s, i) => ({
    label: s.label,
    color: s.color || '#3ecfcf',
    idx: i,
  })));

  const wheelSVG = segments.length ? buildWheelSVG(segments) : '';

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">${esc(data.title || 'Roda Game')}</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:60%"></div></div>
    <span class="nav-score" id="rodaNavScore">0 ⭐</span>
  </nav>
  <div class="main" style="text-align:center">
    <div class="card" style="margin-bottom:14px">
      <div class="h2">🎡 <span class="hl">Roda</span> Pertanyaan</div>
      <p class="sub mt8">Putar roda dan jawab pertanyaan yang muncul!</p>
    </div>

    <div class="card" style="padding:20px;position:relative">
      ${segments.length
        ? `<div id="rodaWheelWrap" style="position:relative;perspective:800px">
            ${wheelSVG}
          </div>
          <button class="btn btn-y mt14" id="btnSpinRoda" onclick="spinRoda()">🌀 Putar Roda!</button>`
        : '<p style="color:var(--muted);font-size:.86rem">Segmen roda belum diisi.</p>'}

      <div id="rodaQuestionBox" style="display:none;margin-top:16px;background:rgba(62,207,207,.06);border:1px solid rgba(62,207,207,.2);border-radius:12px;padding:16px;text-align:left;animation:fadeIn .4s ease">
        <div style="font-size:.72rem;font-weight:800;color:var(--c);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">📌 Pertanyaan</div>
        <div id="rodaQuestionText" style="font-size:.92rem;font-weight:700;line-height:1.6"></div>
        <div id="rodaAnswerArea" style="margin-top:12px">
          <textarea id="rodaAnswerInput" placeholder="Tulis jawabanmu di sini..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-family:'Nunito',sans-serif;font-size:.84rem;resize:vertical;min-height:70px"></textarea>
          <button class="btn btn-c btn-sm mt8" onclick="submitRodaAnswer()">Kirim Jawaban ✅</button>
        </div>
      </div>

      <div id="rodaResultBox" style="display:none;margin-top:14px;text-align:center;animation:fadeIn .4s ease">
        <div style="font-size:2.5rem;margin-bottom:6px">🎉</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:var(--g)">Jawaban Tercatat!</div>
        <div style="font-size:.84rem;color:var(--muted);margin-top:4px">Poin: <span id="rodaPointsEarned" style="color:var(--y);font-weight:900">+10</span></div>
      </div>
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" id="btnRodaNext" onclick="goNextScreen()" style="display:none">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <script data-roda-init="${esc(screenId)}">
  (function(){
    var SEGMENTS = ${segmentJS};
    var QUESTION = ${JSON.stringify(data.question || '')};
    var rodScore = 0;
    var spinning = false;

    window.spinRoda = function(){
      if(spinning) return;
      spinning = true;
      var btn = document.getElementById('btnSpinRoda');
      if(btn) btn.disabled = true;

      var group = document.getElementById('rodaWheelGroup');
      if(!group){ spinning=false; return; }

      var segCount = SEGMENTS.length || 1;
      var anglePerSeg = 360 / segCount;
      var targetIdx = Math.floor(Math.random() * segCount);
      var targetAngle = 360 - (targetIdx * anglePerSeg + anglePerSeg / 2);
      var extraSpins = 3 + Math.floor(Math.random() * 3);
      var finalAngle = extraSpins * 360 + targetAngle;

      group.style.transition = 'transform 3s cubic-bezier(.17,.67,.12,.99)';
      group.style.transformOrigin = '160px 160px';
      group.style.transform = 'rotate(' + finalAngle + 'deg)';

      setTimeout(function(){
        spinning = false;
        showRodaQuestion(targetIdx);
      }, 3200);
    };

    function showRodaQuestion(idx){
      var box = document.getElementById('rodaQuestionBox');
      var textEl = document.getElementById('rodaQuestionText');
      if(!box || !textEl) return;
      textEl.textContent = QUESTION || 'Pertanyaan untuk segmen: ' + (SEGMENTS[idx] ? SEGMENTS[idx].label : '');
      box.style.display = 'block';
      var input = document.getElementById('rodaAnswerInput');
      if(input) input.value = '';
    }

    window.submitRodaAnswer = function(){
      rodScore += 10;
      var navEl = document.getElementById('rodaNavScore');
      if(navEl) navEl.textContent = rodScore + ' ⭐';

      var qbox = document.getElementById('rodaQuestionBox');
      if(qbox) qbox.style.display = 'none';

      var rbox = document.getElementById('rodaResultBox');
      if(rbox) rbox.style.display = 'block';

      var nextBtn = document.getElementById('btnRodaNext');
      if(nextBtn) nextBtn.style.display = 'inline-flex';

      updateNavbarScore();
    };

    function updateNavbarScore(){
      var scoreEls = document.querySelectorAll('.nav-score');
      for(var i=0;i<scoreEls.length;i++){
        scoreEls[i].textContent = rodScore + ' ⭐';
      }
    }
  })();
  </script>
</div>`;
}
