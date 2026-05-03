// ═══════════════════════════════════════════════════════════════
// SKENARIO.TS — Interactive scenario screen template
// Generates an interactive scenario with character, scene
// backgrounds, dialogue, typed text animation, and choices
// with consequences. Matches the s-sk design from export-html.ts.
// ═══════════════════════════════════════════════════════════════

import type { SkenarioSlotData } from '../engine/slot-types';

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
// MAIN EXPORT — renderSkenarioHTML
// ═══════════════════════════════════════════════════════════════
export function renderSkenarioHTML(data: SkenarioSlotData, screenId: string): string {
  const chapters = data.skenario || [];

  // Serialize chapter data for client-side JS
  const chaptersJS = JSON.stringify(
    chapters.map((ch) => ({
      charEmoji: ch.charEmoji || '😊',
      charColor: ch.charColor || '#3a7a9a',
      charPants: ch.charPants || '#3a5a7a',
      bg: ch.bg || 'sbg-kampung',
      title: ch.title || '',
      setup: (ch.setup || []).map((s) => ({
        speaker: s.speaker,
        text: s.text,
      })),
      choicePrompt: ch.choicePrompt || 'Apa yang kamu lakukan?',
      choices: (ch.choices || []).map((c) => ({
        icon: c.icon || '',
        label: c.label || '',
        detail: c.detail || '',
        good: c.good,
        pts: c.pts || 0,
        level: c.level || 'mid',
        resultTitle: c.resultTitle || '',
        resultBody: c.resultBody || '',
        norma: c.norma || '',
        consequences: (c.consequences || []).map((k) => ({
          icon: k.icon,
          text: k.text,
        })),
      })),
    })),
  );

  // Build chapter progress dots
  const progressDotsHTML = chapters
    .map(
      (_, i) =>
        `<div style="flex:1;height:4px;border-radius:99px;background:${i === 0 ? '#f9c12e' : '#1e3a5a'};transition:all .3s${i === 0 ? ';box-shadow:0 0 6px #f9c12e' : ''}"></div>`,
    )
    .join('');

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">${esc(data.title || 'Skenario')}</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:33%"></div></div>
    <span class="nav-score" id="skNavScore">0 ⭐</span>
  </nav>
  <div class="main">
    <!-- Skenario shell -->
    <div class="sk-shell">
      <!-- HUD bar -->
      <div class="sk-hud">
        <div class="sk-hud-title">🎭 Skenario Interaktif</div>
        <span id="skTitle" style="font-size:.78rem;color:var(--muted)"></span>
        <span class="sk-badge" id="skScoreBadge" style="background:rgba(249,193,46,.15);color:var(--y)">0 poin</span>
      </div>

      <!-- Dynamic body area -->
      <div id="skBody">
        ${chapters.length
          ? '<div style="padding:30px;text-align:center;color:var(--muted)">Klik untuk memulai skenario…</div>'
          : '<div style="padding:30px;text-align:center;color:var(--muted)">Skenario belum diisi.</div>'}
      </div>

      <!-- Chapter progress -->
      <div id="skProgress" style="display:flex;gap:4px;padding:8px 14px;background:#060d18;border-top:1px solid #1e3a5a;">
        ${progressDotsHTML}
      </div>
    </div>

    <!-- Next button (shown after all chapters complete) -->
    <button id="btnNextAfterSk" style="display:none" class="btn btn-y mt14" onclick="goNextScreen()">Lanjut →</button>

    <div class="btn-row btn-center mt14">
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <script data-sk-init="${esc(screenId)}">
  (function(){
    var CHAPTERS = ${chaptersJS};
    var skCh = 0;
    var skStep = 0;
    var skScore = 0;
    var typeTimer = null;

    // ── Initialize scenario ────────────────────────────
    function initSk(){
      if(!CHAPTERS.length){
        document.getElementById('skBody').innerHTML =
          '<div style="padding:30px;text-align:center;color:var(--muted)">Skenario belum diisi.</div>';
        var btn = document.getElementById('btnNextAfterSk');
        if(btn) btn.style.display = 'inline-flex';
        return;
      }
      skCh = 0;
      skScore = 0;
      updateScoreBadge();
      renderSkProg();
      startChapter();
    }

    // ── Render chapter progress dots ───────────────────
    function renderSkProg(){
      var el = document.getElementById('skProgress');
      if(!el) return;
      el.innerHTML = CHAPTERS.map(function(_, i){
        var bg = i < skCh ? '#34d399' : i === skCh ? '#f9c12e' : '#1e3a5a';
        var shadow = i === skCh ? ';box-shadow:0 0 6px #f9c12e' : '';
        return '<div style="flex:1;height:4px;border-radius:99px;background:'+bg+';transition:all .3s'+shadow+'"></div>';
      }).join('');
    }

    // ── Start a chapter ────────────────────────────────
    function startChapter(){
      var ch = CHAPTERS[skCh];
      if(!ch) return;
      document.getElementById('skTitle').textContent = ch.title || '';
      skStep = 0;
      showSetup();
    }

    // ── Show setup dialogue step ───────────────────────
    function showSetup(){
      var ch = CHAPTERS[skCh];
      var step = ch.setup[skStep];
      if(!step) return showChoices();

      document.getElementById('skBody').innerHTML =
        '<div class="sk-scene '+(ch.bg || 'sbg-kampung')+'">'+
          '<div class="sk-char" style="left:50%;transform:translateX(-50%)">'+
            '<div class="sk-head" style="background:#fff2d9">'+(ch.charEmoji || '😊')+'</div>'+
            '<div class="sk-body" style="background:'+(ch.charColor || '#3a7a9a')+'"></div>'+
            '<div class="sk-legs"><div class="sk-leg" style="background:'+(ch.charPants || '#3a5a7a')+'"></div><div class="sk-leg" style="background:'+(ch.charPants || '#3a5a7a')+'"></div></div>'+
          '</div>'+
        '</div>'+
        '<div class="sk-dialogue">'+
          '<div class="sk-speaker">'+escH(step.speaker)+'</div>'+
          '<div class="sk-text" id="skTypedText"></div>'+
          '<div class="sk-tap">Ketuk untuk lanjut ▶</div>'+
        '</div>';
      document.getElementById('skBody').onclick = advanceSetup;
      typeText('skTypedText', step.text || '');
    }

    // ── Typewriter effect ──────────────────────────────
    function typeText(id, text){
      if(typeTimer) clearInterval(typeTimer);
      var el = document.getElementById(id);
      if(!el) return;
      el.textContent = '';
      var i = 0;
      typeTimer = setInterval(function(){
        if(i >= text.length){ clearInterval(typeTimer); typeTimer = null; return; }
        el.textContent += text[i++];
      }, 22);
    }

    // ── Advance to next setup step ─────────────────────
    function advanceSetup(){
      document.getElementById('skBody').onclick = null;
      skStep++;
      if(skStep < CHAPTERS[skCh].setup.length) showSetup();
      else showChoices();
    }

    // ── Show choices ───────────────────────────────────
    function showChoices(){
      var ch = CHAPTERS[skCh];
      document.getElementById('skBody').innerHTML =
        '<div class="sk-choices">'+
          '<div class="sk-choice-prompt">'+escH(ch.choicePrompt || 'Apa yang kamu lakukan?')+'</div>'+
          ch.choices.map(function(c, i){
            return '<div class="sk-choice" onclick="pickSkChoice('+i+')">'+
              '<span style="font-size:1.3rem">'+(c.icon || '')+'</span>'+
              '<div><div>'+escH(c.label || '')+'</div>'+
              '<div style="font-size:.72rem;color:var(--muted);font-weight:600">'+escH(c.detail || '')+'</div></div>'+
            '</div>';
          }).join('')+
        '</div>';
    }

    // ── Handle choice selection ────────────────────────
    window.pickSkChoice = function(i){
      var ch = CHAPTERS[skCh];
      var c = ch.choices[i];
      skScore += (c.pts || 0);

      var icons = { good: '🌟', mid: '🤔', bad: '⚠️' };
      var levelClass = c.level || 'mid';

      document.getElementById('skBody').innerHTML =
        '<div class="sk-result">'+
          // Result banner
          '<div class="sk-result-banner '+levelClass+'">'+
            '<div style="font-size:2rem">'+(icons[c.level] || '💡')+'</div>'+
            '<div>'+
              '<div class="sk-result-title">'+escH(c.resultTitle || '')+'</div>'+
              '<div class="sk-result-body">'+escH(c.resultBody || '')+'</div>'+
            '</div>'+
          '</div>'+

          // Norma connection
          '<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:11px;padding:11px 13px;margin-bottom:10px">'+
            '<div style="font-size:.72rem;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:5px">🔍 Kaitannya dengan Norma</div>'+
            '<div style="font-size:.8rem;font-weight:700;color:var(--c);margin-bottom:6px">'+escH(c.norma || '')+'</div>'+
            (c.consequences || []).map(function(k){
              return '<div style="display:flex;gap:8px;font-size:.8rem;margin-bottom:4px">'+k.icon+' '+escH(k.text)+'</div>';
            }).join('')+
          '</div>'+

          // Next/Finish button
          '<div style="text-align:center">'+
            (skCh < CHAPTERS.length - 1
              ? '<button class="btn btn-y btn-sm" onclick="nextSkChapter()">Skenario Berikutnya →</button>'
              : '<button class="btn btn-g btn-sm" onclick="endSk()">Selesai! 🎉</button>')+
          '</div>'+
        '</div>';

      updateScoreBadge();
    };

    // ── Move to next chapter ───────────────────────────
    window.nextSkChapter = function(){
      skCh++;
      renderSkProg();
      startChapter();
    };

    // ── End scenario ───────────────────────────────────
    window.endSk = function(){
      document.getElementById('skBody').innerHTML =
        '<div style="padding:20px;text-align:center;background:#060d18;border-top:2px solid #1e3a5a">'+
          '<div style="font-size:3rem;margin-bottom:10px">🎭</div>'+
          '<div style="font-family:Fredoka One,cursive;font-size:1.2rem;margin-bottom:6px">Skenario Selesai!</div>'+
          '<div style="font-family:Fredoka One,cursive;font-size:1.8rem;color:var(--g)">'+skScore+' poin</div>'+
        '</div>';
      var btn = document.getElementById('btnNextAfterSk');
      if(btn) btn.style.display = 'inline-flex';

      // Update all nav scores
      var scoreEls = document.querySelectorAll('.nav-score');
      for(var i=0;i<scoreEls.length;i++){
        scoreEls[i].textContent = skScore + ' ⭐';
      }
    };

    // ── Update score badge ─────────────────────────────
    function updateScoreBadge(){
      var badge = document.getElementById('skScoreBadge');
      if(badge) badge.textContent = skScore + ' poin';
      var navEl = document.getElementById('skNavScore');
      if(navEl) navEl.textContent = skScore + ' ⭐';
    }

    // ── HTML escape for JS strings ─────────────────────
    function escH(str){
      if(str == null) return '';
      return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ── Auto-init when screen becomes active ───────────
    var screenEl = document.getElementById('${esc(screenId)}');
    var hasInit = false;
    if(screenEl){
      var observer = new MutationObserver(function(mutations){
        mutations.forEach(function(m){
          if(m.target.classList && m.target.classList.contains('active') && !hasInit){
            hasInit = true;
            initSk();
          }
        });
      });
      observer.observe(screenEl, { attributes: true, attributeFilter: ['class'] });

      // If already active
      if(screenEl.classList.contains('active') && !hasInit){
        hasInit = true;
        initSk();
      }
    }
  })();
  </script>
</div>`;
}
