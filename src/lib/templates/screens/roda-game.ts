// ═══════════════════════════════════════════════════════════════
// RODA-GAME.TS — Spinning wheel game screen template (PRESET QUALITY)
// Generates a complete HTML block for the Roda Game interactive
// spinning wheel with entrance animations, visual polish, tick
// effects, dramatic question reveal, animated score counter,
// confetti burst, multiple spins, and progress tracking.
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

// ── Generate SVG Wheel Segments (Enhanced) ───────────────────
function buildWheelSVG(segments: RodaGameSlotData['segments']): string {
  const count = segments.length || 1;
  const anglePerSegment = 360 / count;
  const radius = 140;
  const cx = 160;
  const cy = 160;
  const outerR = 156; // decorative outer ring radius

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

    // Segment with shadow/depth via filter and hover brightness
    paths += `<path d="${pathD}" fill="${esc(seg.color || '#3ecfcf')}" stroke="rgba(14,28,47,.6)" stroke-width="2" style="cursor:pointer;transition:filter .2s,opacity .2s" onmouseenter="this.style.filter='brightness(1.3) drop-shadow(0 0 6px rgba(255,255,255,.2))'" onmouseleave="this.style.filter='brightness(1)'" data-seg-idx="${i}" />`;

    // Label positioned at midpoint of arc
    const midAngle = startAngle + anglePerSegment / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelR = radius * 0.62;
    const lx = cx + labelR * Math.cos(midRad);
    const ly = cy + labelR * Math.sin(midRad);

    labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" fill="#0e1c2f" font-size="${count > 8 ? '.55rem' : '.7rem'}" font-weight="900" font-family="Nunito,sans-serif" style="pointer-events:none;text-shadow:0 1px 2px rgba(255,255,255,.3)">${esc(seg.label)}</text>`;
  });

  return `<svg viewBox="0 0 320 320" style="width:100%;max-width:320px;display:block;margin:0 auto">
    <defs>
      <filter id="rdGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <radialGradient id="rdCenterGrad" cx="40%" cy="35%">
        <stop offset="0%" stop-color="#1a3a5c"/>
        <stop offset="100%" stop-color="#0e1c2f"/>
      </radialGradient>
      <linearGradient id="rdPointerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffe066"/>
        <stop offset="100%" stop-color="#f9c12e"/>
      </linearGradient>
      <filter id="rdSegShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,.35)"/>
      </filter>
    </defs>

    <!-- Decorative outer glow ring -->
    <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="rgba(62,207,207,.25)" stroke-width="4" filter="url(#rdGlow)" class="rd-glow-ring"/>
    <!-- Decorative circular border -->
    <circle cx="${cx}" cy="${cy}" r="${outerR + 2}" fill="none" stroke="rgba(249,193,46,.4)" stroke-width="2.5" stroke-dasharray="6 4" class="rd-deco-border"/>

    <!-- Segment group with shadow -->
    <g id="rodaWheelGroup" filter="url(#rdSegShadow)">${paths}${labels}</g>

    <!-- Center button with gradient and shadow -->
    <circle cx="${cx}" cy="${cy}" r="24" fill="url(#rdCenterGrad)" stroke="#f9c12e" stroke-width="3" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))"/>
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#f9c12e" font-size="1.1rem" font-weight="900" font-family="Fredoka One,cursive">🎡</text>

    <!-- Pointer/arrow at top with bounce animation -->
    <g class="rd-pointer-bounce">
      <polygon points="${cx},${cy - radius - 16} ${cx - 10},${cy - radius - 1} ${cx + 10},${cy - radius - 1}" fill="url(#rdPointerGrad)" stroke="#0e1c2f" stroke-width="1.5" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))"/>
    </g>
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

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Game Roda">
  <div class="main" style="text-align:center">

    <!-- Title card with fade-in entrance -->
    <div class="card rd-entrance-fade" style="margin-bottom:14px">
      <div class="h2">🎡 <span class="hl">Roda</span> Pertanyaan</div>
      <p class="sub mt8">Putar roda dan jawab pertanyaan yang muncul!</p>
      <!-- Progress bar tracking completed segments -->
      ${segments.length ? `<div class="rd-progress-wrap">
        <div class="rd-progress-bar" id="rdProgressBar"></div>
      </div>
      <div class="rd-progress-text" id="rdProgressText">0 / ${segments.length} segmen</div>` : ''}
    </div>

    <div class="card rd-entrance-scale" id="rdWheelCard" style="padding:20px;position:relative;overflow:hidden">
      ${segments.length
        ? `<div id="rodaWheelWrap" style="position:relative;perspective:800px">
            ${wheelSVG}
          </div>
          <button class="btn btn-y mt14 rd-btn-pulse" id="btnSpinRoda" onclick="spinRoda()">
            <span id="rdSpinIcon" class="rd-spin-icon">🌀</span> Putar Roda!
          </button>`
        : '<p style="color:var(--muted);font-size:.86rem">Segmen roda belum diisi.</p>'}

      <!-- Question reveal box (dramatic entrance) -->
      <div id="rodaQuestionBox" class="rd-question-box" style="display:none">
        <div class="rd-question-label">📌 Pertanyaan</div>
        <div id="rodaQuestionText" class="rd-question-text"></div>
        <div id="rodaAnswerArea" style="margin-top:12px">
          <textarea id="rodaAnswerInput" placeholder="Tulis jawabanmu di sini..." class="rd-answer-input"></textarea>
          <button class="btn btn-c btn-sm mt8" onclick="submitRodaAnswer()">Kirim Jawaban ✅</button>
        </div>
      </div>

      <!-- Result display with animated score -->
      <div id="rodaResultBox" class="rd-result-box" style="display:none">
        <div class="rd-result-emoji">🎉</div>
        <div class="rd-result-title">Jawaban Tercatat!</div>
        <div class="rd-score-wrap">
          <span class="rd-score-label">Poin:</span>
          <span class="rd-score-value" id="rodaPointsEarned">+0</span>
        </div>
        <button class="btn btn-y rd-btn-spin-again" id="btnSpinAgain" onclick="spinAgainRoda()" style="display:none">🎡 Spin Lagi?</button>
      </div>
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" id="btnRodaNext" onclick="goNextScreen()" style="display:none">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <style>
    /* ── Entrance animations ──────────────────────────────────── */
    .rd-entrance-fade{opacity:0;transform:translateY(12px);transition:opacity .6s ease,transform .6s ease;}
    .rd-entrance-scale{opacity:0;transform:scale(.85);transition:opacity .7s cubic-bezier(.34,1.56,.64,1),transform .7s cubic-bezier(.34,1.56,.64,1);}
    .rd-active .rd-entrance-fade{opacity:1;transform:translateY(0);}
    .rd-active .rd-entrance-scale{opacity:1;transform:scale(1);}

    /* ── Spin button pulse ────────────────────────────────────── */
    .rd-btn-pulse{animation:rdPulse 2s ease-in-out infinite;position:relative;}
    .rd-btn-pulse:disabled{animation:none;opacity:.7;}
    @keyframes rdPulse{0%,100%{box-shadow:0 0 0 0 rgba(249,193,46,.4);}50%{box-shadow:0 0 0 10px rgba(249,193,46,0);}}

    /* ── Spinning icon animation ──────────────────────────────── */
    .rd-spin-icon{display:inline-block;transition:transform .3s;}
    .rd-spin-icon.spinning{animation:rdIconSpin .6s linear infinite;}
    @keyframes rdIconSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}

    /* ── Pointer bounce ───────────────────────────────────────── */
    .rd-pointer-bounce{animation:rdPointerBounce 1.5s ease-in-out infinite;}
    .rd-pointer-bounce.tick{animation:rdPointerTick .15s ease;}
    @keyframes rdPointerBounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
    @keyframes rdPointerTick{0%{transform:translateY(0) rotate(0deg);}50%{transform:translateY(-6px) rotate(-8deg);}100%{transform:translateY(0) rotate(0deg);}}

    /* ── Glow ring pulse ──────────────────────────────────────── */
    .rd-glow-ring{animation:rdGlowPulse 3s ease-in-out infinite;}
    @keyframes rdGlowPulse{0%,100%{stroke:rgba(62,207,207,.2);stroke-width:4;}50%{stroke:rgba(62,207,207,.5);stroke-width:6;}}
    .rd-active .rd-glow-ring{animation:rdGlowPulse 3s ease-in-out infinite;}

    /* ── Deco border rotation ─────────────────────────────────── */
    .rd-deco-border{animation:rdBorderSpin 20s linear infinite;transform-origin:160px 160px;}
    @keyframes rdBorderSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}

    /* ── Progress bar ─────────────────────────────────────────── */
    .rd-progress-wrap{height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:12px;}
    .rd-progress-bar{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;transition:width .5s cubic-bezier(.34,1.56,.64,1);width:0%;}
    .rd-progress-text{font-size:.72rem;color:var(--muted);margin-top:4px;text-align:center;font-weight:800;}

    /* ── Question box dramatic entrance ───────────────────────── */
    .rd-question-box{margin-top:16px;background:rgba(62,207,207,.06);border:1px solid rgba(62,207,207,.2);border-radius:12px;padding:16px;text-align:left;animation:rdDramaticIn .5s cubic-bezier(.34,1.56,.64,1);}
    .rd-question-label{font-size:.72rem;font-weight:800;color:var(--c);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
    .rd-question-text{font-size:.92rem;font-weight:700;line-height:1.6;}
    @keyframes rdDramaticIn{0%{opacity:0;transform:scale(0);transform-origin:center top;}100%{opacity:1;transform:scale(1);}}

    /* ── Answer textarea ──────────────────────────────────────── */
    .rd-answer-input{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text);font-family:'Nunito',sans-serif;font-size:.84rem;resize:vertical;min-height:70px;transition:border-color .3s,box-shadow .3s;}
    .rd-answer-input:focus{outline:none;border-color:var(--c);box-shadow:0 0 0 3px rgba(62,207,207,.15);}

    /* ── Result box ───────────────────────────────────────────── */
    .rd-result-box{margin-top:14px;text-align:center;animation:rdDramaticIn .5s cubic-bezier(.34,1.56,.64,1);}
    .rd-result-emoji{font-size:2.5rem;margin-bottom:6px;animation:rdBounceEmoji .6s ease;}
    .rd-result-title{font-family:'Fredoka One',cursive;font-size:1.2rem;color:var(--g);}
    .rd-score-wrap{margin-top:8px;font-size:.92rem;color:var(--muted);}
    .rd-score-label{font-weight:700;}
    .rd-score-value{color:var(--y);font-weight:900;font-size:1.1rem;transition:all .3s;}
    @keyframes rdBounceEmoji{0%{transform:scale(0) rotate(-20deg);}60%{transform:scale(1.3) rotate(5deg);}100%{transform:scale(1) rotate(0deg);}}

    /* ── Spin again button ────────────────────────────────────── */
    .rd-btn-spin-again{margin-top:14px;animation:rdPulse 2s ease-in-out infinite;}

    /* ── Card shake on wheel stop ─────────────────────────────── */
    @keyframes rdShake{0%,100%{transform:translateX(0);}10%{transform:translateX(-4px) rotate(-.3deg);}20%{transform:translateX(4px) rotate(.3deg);}30%{transform:translateX(-3px) rotate(-.2deg);}40%{transform:translateX(3px) rotate(.2deg);}50%{transform:translateX(-2px);}60%{transform:translateX(2px);}70%{transform:translateX(-1px);}80%{transform:translateX(1px);}}
    .rd-shake{animation:rdShake .5s ease;}

    /* ── Segment flash/pulse on selection ─────────────────────── */
    @keyframes rdSegFlash{0%,100%{filter:brightness(1);}50%{filter:brightness(1.8) drop-shadow(0 0 10px rgba(255,255,255,.5));}}
    .rd-seg-selected{animation:rdSegFlash .6s ease 3;}

    /* ── Confetti canvas ──────────────────────────────────────── */
    #rdConfettiCanvas{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;}
  </style>

  <script data-roda-init="${esc(screenId)}">
  (function(){
    var SEGMENTS = ${segmentJS};
    var QUESTION = ${JSON.stringify(data.question || '')};
    var spinning = false;
    var completedSegments = {};
    var totalCompleted = 0;
    var currentRotation = 0;
    var SCREEN_ID = '${esc(screenId)}';

    // ── Screen Activation Hook ──────────────────────────────────
    function activateScreen(){
      var el = document.getElementById(SCREEN_ID);
      if(el) el.classList.add('rd-active');
    }

    // Listen for screenActivate event
    document.addEventListener('screenActivate', function(e){
      if(e.detail && e.detail.id === SCREEN_ID) activateScreen();
    });

    // Check initial state (in case already visible)
    var screenEl = document.getElementById(SCREEN_ID);
    if(screenEl && screenEl.classList.contains('active')) activateScreen();
    // Also activate if screen is currently displayed
    if(screenEl){
      var parent = screenEl.parentElement;
      if(parent && parent.style.display !== 'none' && !parent.classList.contains('hidden')){
        setTimeout(activateScreen, 100);
      }
    }

    // ── Tick effect during spin ─────────────────────────────────
    var tickInterval = null;
    function startTickEffect(durationMs){
      var pointerEl = screenEl ? screenEl.querySelector('.rd-pointer-bounce') : null;
      if(tickInterval) clearInterval(tickInterval);
      // Ticks get slower as we approach the end
      var elapsed = 0;
      var baseInterval = 80;
      tickInterval = setInterval(function(){
        elapsed += baseInterval;
        if(pointerEl){
          pointerEl.classList.remove('tick');
          void pointerEl.offsetWidth; // force reflow
          pointerEl.classList.add('tick');
        }
        // Slow down ticks towards end
        if(elapsed > durationMs * 0.6){
          baseInterval = Math.min(baseInterval + 15, 300);
        }
      }, baseInterval);
      setTimeout(function(){
        if(tickInterval){ clearInterval(tickInterval); tickInterval = null; }
      }, durationMs);
    }

    // ── Score animation counter ─────────────────────────────────
    function animateScore(elementId, from, to, durationMs){
      var el = document.getElementById(elementId);
      if(!el) return;
      var start = performance.now();
      function step(now){
        var progress = Math.min((now - start) / durationMs, 1);
        // Ease out cubic
        var ease = 1 - Math.pow(1 - progress, 3);
        var val = Math.round(from + (to - from) * ease);
        el.textContent = '+' + val;
        if(progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // ── Mini confetti burst ─────────────────────────────────────
    function rdConfettiBurst(){
      // Use global launchConfetti if available
      if(typeof launchConfetti === 'function'){
        launchConfetti();
        return;
      }
      // Fallback: create a simple canvas confetti
      var card = document.getElementById('rdWheelCard');
      if(!card) return;
      var canvas = document.createElement('canvas');
      canvas.id = 'rdConfettiCanvas';
      canvas.width = card.offsetWidth;
      canvas.height = card.offsetHeight;
      card.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      if(!ctx) return;
      var particles = [];
      var colors = ['#f9c12e','#3ecfcf','#34d399','#ff6b6b','#a78bfa','#fb923c'];
      for(var p=0;p<50;p++){
        particles.push({
          x: canvas.width/2,
          y: canvas.height/3,
          vx: (Math.random()-0.5)*8,
          vy: -Math.random()*6 - 2,
          size: Math.random()*6+3,
          color: colors[Math.floor(Math.random()*colors.length)],
          life: 1,
          decay: Math.random()*0.015+0.01
        });
      }
      function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var alive = false;
        for(var i=0;i<particles.length;i++){
          var pt = particles[i];
          if(pt.life <= 0) continue;
          alive = true;
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.15;
          pt.life -= pt.decay;
          ctx.globalAlpha = pt.life;
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        if(alive) requestAnimationFrame(draw);
        else canvas.remove();
      }
      draw();
    }

    // ── Update progress bar ─────────────────────────────────────
    function updateProgress(){
      totalCompleted = Object.keys(completedSegments).length;
      var bar = document.getElementById('rdProgressBar');
      var txt = document.getElementById('rdProgressText');
      if(bar) bar.style.width = (totalCompleted / SEGMENTS.length * 100) + '%';
      if(txt) txt.textContent = totalCompleted + ' / ' + SEGMENTS.length + ' segmen';
    }

    // ── Spin the wheel ──────────────────────────────────────────
    window.spinRoda = function(){
      if(spinning) return;
      spinning = true;
      var btn = document.getElementById('btnSpinRoda');
      var icon = document.getElementById('rdSpinIcon');
      if(btn) btn.disabled = true;
      if(icon) icon.classList.add('spinning');

      // Hide previous result/question
      var qbox = document.getElementById('rodaQuestionBox');
      var rbox = document.getElementById('rodaResultBox');
      if(qbox) qbox.style.display = 'none';
      if(rbox) rbox.style.display = 'none';
      var spinAgainBtn = document.getElementById('btnSpinAgain');
      if(spinAgainBtn) spinAgainBtn.style.display = 'none';

      var group = document.getElementById('rodaWheelGroup');
      if(!group){ spinning=false; return; }

      // Remove previous selected segment highlight
      var prevSelected = group.querySelector('.rd-seg-selected');
      if(prevSelected) prevSelected.classList.remove('rd-seg-selected');

      var segCount = SEGMENTS.length || 1;
      var anglePerSeg = 360 / segCount;
      var targetIdx = Math.floor(Math.random() * segCount);
      var targetAngle = 360 - (targetIdx * anglePerSeg + anglePerSeg / 2);
      var extraSpins = 4 + Math.floor(Math.random() * 3);
      var finalAngle = currentRotation + extraSpins * 360 + targetAngle;

      // More satisfying easing: fast start, long deceleration
      var spinDuration = 4000;
      group.style.transition = 'transform ' + (spinDuration/1000) + 's cubic-bezier(.15,.6,.15,1)';
      group.style.transformOrigin = '160px 160px';
      group.style.transform = 'rotate(' + finalAngle + 'deg)';
      currentRotation = finalAngle;

      // Start tick effect
      startTickEffect(spinDuration);

      setTimeout(function(){
        spinning = false;
        if(icon) icon.classList.remove('spinning');

        // Shake the card on stop
        var card = document.getElementById('rdWheelCard');
        if(card){
          card.classList.remove('rd-shake');
          void card.offsetWidth;
          card.classList.add('rd-shake');
          setTimeout(function(){ card.classList.remove('rd-shake'); }, 500);
        }

        // Flash the selected segment
        var selectedPath = group.querySelector('[data-seg-idx="' + targetIdx + '"]');
        if(selectedPath) selectedPath.classList.add('rd-seg-selected');

        showRodaQuestion(targetIdx);
      }, spinDuration + 200);
    };

    // ── Show question ───────────────────────────────────────────
    function showRodaQuestion(idx){
      var box = document.getElementById('rodaQuestionBox');
      var textEl = document.getElementById('rodaQuestionText');
      if(!box || !textEl) return;
      textEl.textContent = QUESTION || 'Pertanyaan untuk segmen: ' + (SEGMENTS[idx] ? SEGMENTS[idx].label : '');
      box.style.display = 'block';
      box.style.animation = 'none';
      void box.offsetWidth;
      box.style.animation = 'rdDramaticIn .5s cubic-bezier(.34,1.56,.64,1)';

      // Auto-focus textarea
      setTimeout(function(){
        var input = document.getElementById('rodaAnswerInput');
        if(input){ input.value = ''; input.focus(); }
      }, 300);
    }

    // ── Submit answer ───────────────────────────────────────────
    window.submitRodaAnswer = function(){
      var input = document.getElementById('rodaAnswerInput');
      var answer = input ? input.value.trim() : '';
      var pointsEarned = answer.length > 0 ? 10 : 5;

      addScore(pointsEarned);

      // Mark segment as completed
      var group = document.getElementById('rodaWheelGroup');
      if(group){
        var selectedPath = group.querySelector('.rd-seg-selected');
        if(selectedPath){
          var idx = selectedPath.getAttribute('data-seg-idx');
          if(idx !== null) completedSegments[idx] = true;
        }
      }

      updateProgress();

      var qbox = document.getElementById('rodaQuestionBox');
      if(qbox) qbox.style.display = 'none';

      var rbox = document.getElementById('rodaResultBox');
      if(rbox){
        rbox.style.display = 'block';
        rbox.style.animation = 'none';
        void rbox.offsetWidth;
        rbox.style.animation = 'rdDramaticIn .5s cubic-bezier(.34,1.56,.64,1)';
      }

      // Animated score counter
      animateScore('rodaPointsEarned', 0, pointsEarned, 800);

      // Confetti burst
      rdConfettiBurst();

      // Show "Spin lagi?" if there are uncompleted segments
      var totalCompleted = Object.keys(completedSegments).length;
      var spinAgainBtn = document.getElementById('btnSpinAgain');
      var nextBtn = document.getElementById('btnRodaNext');

      if(totalCompleted < SEGMENTS.length){
        if(spinAgainBtn) spinAgainBtn.style.display = 'inline-flex';
        if(nextBtn) nextBtn.style.display = 'none';
      } else {
        // All segments completed
        if(spinAgainBtn) spinAgainBtn.style.display = 'none';
        if(nextBtn) nextBtn.style.display = 'inline-flex';
      }
    };

    // ── Spin again ──────────────────────────────────────────────
    window.spinAgainRoda = function(){
      var rbox = document.getElementById('rodaResultBox');
      if(rbox) rbox.style.display = 'none';
      spinRoda();
    };

    // ── Initialize progress ─────────────────────────────────────
    updateProgress();
  })();
  </script>
</div>`;
}
