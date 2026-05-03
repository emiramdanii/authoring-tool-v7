// ═══════════════════════════════════════════════════════════════
// SKENARIO.TS — Interactive scenario screen template (PRESET QUALITY)
// Generates an interactive scenario with character, scene
// backgrounds, dialogue, typed text animation, and choices
// with consequences. Matches the s-sk design from export-html.ts.
//
// UPGRADE: Entrance animations, visual polish, interactive
// improvements, better scene quality, skip functionality,
// detailed end summary, animated progress dots, and more.
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

  // Build chapter progress dots with stagger delays
  const progressDotsHTML = chapters
    .map(
      (_, i) =>
        `<div class="sk-prog-dot" style="flex:1;--sk-dot-i:${i};transition:all .3s"></div>`,
    )
    .join('');

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Skenario">
  <style>
    /* ═══════════════════════════════════════════════════════════
       SKENARIO PRESET QUALITY — Scoped CSS (.sk- prefix)
       ═══════════════════════════════════════════════════════════ */

    /* ── Entrance animations ──────────────────────────── */
    @keyframes skShellIn{from{opacity:0;transform:scale(.92);}to{opacity:1;transform:scale(1);}}
    @keyframes skHudIn{from{opacity:0;transform:translateY(-100%);}to{opacity:1;transform:translateY(0);}}
    @keyframes skDotStagger{from{opacity:0;transform:scaleX(0);}to{opacity:1;transform:scaleX(1);}}
    @keyframes skCharIdle{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(-4px);}}
    @keyframes skCharWalk{0%{transform:translateX(-50%) translateX(-30px);}100%{transform:translateX(-50%) translateX(0);}}
    @keyframes skBlink{0%,100%{opacity:1;}50%{opacity:0;}}
    @keyframes skHudGradient{0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
    @keyframes skBadgePulse{0%{transform:scale(1);}50%{transform:scale(1.2);}100%{transform:scale(1);}}
    @keyframes skBadgeFlash{0%{background:rgba(249,193,46,.15);}30%{background:rgba(52,211,153,.35);}100%{background:rgba(249,193,46,.15);}}
    @keyframes skResultIn{from{opacity:0;transform:translateY(-20px);}to{opacity:1;transform:translateY(0);}}
    @keyframes skChoiceGlow{0%{box-shadow:0 0 0 0 rgba(62,207,207,.4);}70%{box-shadow:0 0 18px 6px rgba(62,207,207,.15);}100%{box-shadow:0 0 0 0 rgba(62,207,207,0);}}
    @keyframes skDotComplete{0%{transform:scaleX(1);}40%{transform:scaleX(1.3);background:var(--g);}100%{transform:scaleX(1);background:var(--g);}}
    @keyframes skCloudDrift{from{transform:translateX(-120%);}to{transform:translateX(200%);}}
    @keyframes skTreeSway{0%,100%{transform:rotate(-1deg);}50%{transform:rotate(1deg);}}
    @keyframes skSunPulse{0%,100%{opacity:.85;transform:scale(1);}50%{opacity:1;transform:scale(1.05);}}
    @keyframes skSceneFadeIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}

    /* ── Shell entrance ───────────────────────────────── */
    .sk-shell{
      background:#0a0f1a;border:3px solid #1e3a5a;border-radius:16px;overflow:hidden;margin:12px 0;
      opacity:0;animation:none;
    }
    .sk-screen-active .sk-shell{
      animation:skShellIn .5s cubic-bezier(.23,1,.32,1) forwards;
    }

    /* ── HUD with gradient animation ──────────────────── */
    .sk-hud{
      background:linear-gradient(90deg,#0d1b2f,#0f2340,#162d50,#0f2340,#0d1b2f);
      background-size:300% 100%;
      animation:none;
      padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1e3a5a;gap:12px;
    }
    .sk-screen-active .sk-hud{
      animation:skHudIn .4s cubic-bezier(.23,1,.32,1) forwards,skHudGradient 8s ease infinite;
      animation-delay:0s,.4s;
    }

    .sk-hud-title{font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--y);}
    .sk-badge{padding:3px 10px;border-radius:99px;font-size:.7rem;font-weight:800;transition:all .3s;}
    .sk-badge.pulse{animation:skBadgePulse .4s ease,skBadgeFlash .6s ease;}

    /* ── Skip skenario button ─────────────────────────── */
    .sk-skip-btn{
      background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:99px;
      padding:3px 10px;font-size:.65rem;font-weight:800;color:var(--muted);cursor:pointer;
      transition:all .2s;font-family:'Nunito',sans-serif;white-space:nowrap;
    }
    .sk-skip-btn:hover{background:rgba(255,107,107,.15);border-color:var(--r);color:var(--r);}

    /* ── Progress dots with stagger ───────────────────── */
    .sk-prog-wrap{display:flex;gap:4px;padding:8px 14px;background:#060d18;border-top:1px solid #1e3a5a;}
    .sk-prog-dot{
      height:4px;border-radius:99px;
      background:#1e3a5a;
      opacity:0;transform:scaleX(0);
    }
    .sk-screen-active .sk-prog-dot{
      animation:skDotStagger .4s cubic-bezier(.23,1,.32,1) forwards;
      animation-delay:calc(.6s + var(--sk-dot-i) * .08s);
    }
    .sk-prog-dot.sk-dot-active{background:#f9c12e;box-shadow:0 0 6px #f9c12e;}
    .sk-prog-dot.sk-dot-done{background:var(--g);}
    .sk-prog-dot.sk-dot-completing{animation:skDotComplete .5s ease forwards !important;}

    /* ── Scene backgrounds ────────────────────────────── */
    .sk-scene{position:relative;width:100%;height:180px;overflow:hidden;animation:skSceneFadeIn .4s ease;}

    /* Existing backgrounds */
    .sbg-pasar{background:linear-gradient(180deg,#87CEEB 0%,#b0d4f0 45%,#999 60%,#a08050 100%);}
    .sbg-masjid{background:linear-gradient(180deg,#fce4ec 0%,#f8d7e3 45%,#81c784 100%);}
    .sbg-kelas{background:linear-gradient(180deg,#e8f4fd,#d0eaf8 100%);}
    .sbg-kampung{background:linear-gradient(180deg,#c8e6c9 0%,#81c784 48%,#b09060 100%);}
    .sbg-hutan{background:linear-gradient(180deg,#a8d5ba 0%,#2d6a4f 48%,#1a3a2a 100%);}
    .sbg-pantai{background:linear-gradient(180deg,#87ceeb 0%,#4ea8de 40%,#f2cc8f 75%,#deb887 100%);}

    /* New scene backgrounds */
    .sbg-sekolah{background:linear-gradient(180deg,#b3e5fc 0%,#81d4fa 40%,#e0e0e0 60%,#bdbdbd 100%);}
    .sbg-rumah{background:linear-gradient(180deg,#ffe0b2 0%,#ffcc80 30%,#a5d6a7 70%,#81c784 100%);}
    .sbg-jalan{background:linear-gradient(180deg,#90caf9 0%,#64b5f6 35%,#9e9e9e 55%,#757575 75%,#616161 100%);}

    /* ── Ambient decorative elements ──────────────────── */
    .sk-deco-sun{
      position:absolute;top:10px;right:18px;width:36px;height:36px;border-radius:50%;
      background:radial-gradient(circle,#ffd54f 40%,#ffb300 100%);
      box-shadow:0 0 20px rgba(255,213,79,.5);
      animation:skSunPulse 4s ease-in-out infinite;
      pointer-events:none;
    }
    .sk-deco-cloud{
      position:absolute;top:14px;width:50px;height:18px;border-radius:99px;
      background:rgba(255,255,255,.7);pointer-events:none;
      animation:skCloudDrift 20s linear infinite;
    }
    .sk-deco-cloud::before{
      content:'';position:absolute;top:-7px;left:10px;width:22px;height:14px;border-radius:50%;
      background:rgba(255,255,255,.7);
    }
    .sk-deco-cloud::after{
      content:'';position:absolute;top:-5px;left:24px;width:18px;height:12px;border-radius:50%;
      background:rgba(255,255,255,.7);
    }
    .sk-deco-cloud.sk-cloud-2{top:8px;animation-duration:26s;animation-delay:-8s;width:40px;height:14px;opacity:.6;}
    .sk-deco-grass{
      position:absolute;bottom:0;left:0;right:0;height:16px;pointer-events:none;
      background:repeating-linear-gradient(90deg,transparent 0,transparent 6px,#4caf50 6px,#4caf50 8px,transparent 8px,transparent 12px);
      opacity:.35;
    }
    .sk-deco-tree{
      position:absolute;bottom:8px;pointer-events:none;
      transform-origin:bottom center;animation:skTreeSway 4s ease-in-out infinite;
    }
    .sk-deco-tree .sk-tree-trunk{width:8px;height:22px;background:#795548;margin:0 auto;border-radius:2px;}
    .sk-deco-tree .sk-tree-top{width:28px;height:28px;border-radius:50%;background:#43a047;margin-bottom:-6px;margin-left:-10px;}

    /* ── Character with idle animation ────────────────── */
    .sk-char{position:absolute;bottom:28%;display:flex;flex-direction:column;align-items:center;animation:skCharIdle 2.5s ease-in-out infinite;}
    .sk-char.sk-char-walking{animation:skCharWalk .5s ease-out forwards,skCharIdle 2.5s ease-in-out .5s infinite;}
    .sk-head{width:32px;height:32px;border-radius:50%;border:2px solid rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;}
    .sk-body{width:24px;height:26px;border-radius:5px 5px 3px 3px;border:2px solid rgba(0,0,0,.1);margin-top:-2px;}
    .sk-legs{display:flex;gap:3px;margin-top:1px;}
    .sk-leg{width:8px;height:16px;border-radius:0 0 4px 4px;border:1px solid rgba(0,0,0,.1);}

    /* ── Dialogue box with typing cursor ──────────────── */
    .sk-dialogue{position:absolute;bottom:0;left:0;right:0;background:rgba(8,16,30,.92);border-top:2px solid #1e3a5a;padding:12px 14px;min-height:76px;}
    .sk-speaker{font-size:.7rem;font-weight:800;color:var(--c);margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em;}
    .sk-text{font-size:.85rem;font-weight:700;line-height:1.5;color:#e8f2ff;display:inline;}
    .sk-cursor{
      display:inline-block;width:2px;height:1em;background:var(--c);margin-left:2px;
      vertical-align:text-bottom;animation:skBlink .7s step-end infinite;
    }
    .sk-tap{font-size:.68rem;color:var(--muted);margin-top:5px;animation:tapP 1.4s ease-in-out infinite;}
    @keyframes tapP{0%,100%{opacity:1;}50%{opacity:.3;}}

    /* ── Choices with color borders on hover ──────────── */
    .sk-choices{padding:14px;}
    .sk-choice-prompt{font-size:.83rem;font-weight:800;color:var(--y);margin-bottom:10px;text-align:center;}
    .sk-choice{
      background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:12px;
      padding:11px 14px;cursor:pointer;transition:all .25s cubic-bezier(.23,1,.32,1);
      display:flex;align-items:center;gap:10px;font-size:.83rem;font-weight:700;margin-bottom:8px;
    }
    .sk-choice:hover{background:rgba(255,255,255,.1);border-color:var(--c);transform:translateX(4px);}
    .sk-choice:active{transform:translateX(4px) scale(.97);}
    .sk-choice.sk-choice-good:hover{border-color:var(--g);}
    .sk-choice.sk-choice-bad:hover{border-color:var(--r);}
    .sk-choice.sk-choice-mid:hover{border-color:var(--y);}
    .sk-choice.sk-choice-selected{
      animation:skChoiceGlow .5s ease;
      border-color:var(--c);
      background:rgba(62,207,207,.12);
      transform:scale(1.03);
    }

    /* ── Result banner with entrance animation ────────── */
    .sk-result{padding:14px;}
    .sk-result-banner{
      border-radius:12px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;
      animation:skResultIn .45s cubic-bezier(.23,1,.32,1);
    }
    .sk-result-banner.good{background:rgba(52,211,153,.1);border:2px solid rgba(52,211,153,.3);}
    .sk-result-banner.bad{background:rgba(255,107,107,.1);border:2px solid rgba(255,107,107,.3);}
    .sk-result-banner.mid{background:rgba(249,193,46,.1);border:2px solid rgba(249,193,46,.3);}
    .sk-result-title{font-weight:900;font-size:.92rem;margin-bottom:3px;}
    .sk-result-body{font-size:.8rem;line-height:1.5;color:var(--muted);}
    .sk-result-banner.good .sk-result-title{color:var(--g);}
    .sk-result-banner.bad .sk-result-title{color:var(--r);}
    .sk-result-banner.mid .sk-result-title{color:var(--y);}

    /* ── Norma box entrance ───────────────────────────── */
    .sk-norma-box{
      background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:11px;padding:11px 13px;margin-bottom:10px;
      animation:skResultIn .45s cubic-bezier(.23,1,.32,1) .1s both;
    }

    /* ── End screen summary ───────────────────────────── */
    .sk-end{padding:20px;text-align:center;background:#060d18;border-top:2px solid #1e3a5f;animation:skResultIn .5s ease;}
    .sk-end-icon{font-size:3rem;margin-bottom:10px;}
    .sk-end-title{font-family:'Fredoka One',cursive;font-size:1.2rem;margin-bottom:6px;}
    .sk-end-score{font-family:'Fredoka One',cursive;font-size:1.8rem;color:var(--g);}
    .sk-summary{margin-top:14px;text-align:left;}
    .sk-summary-title{font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:8px;text-align:center;}
    .sk-summary-item{
      display:flex;align-items:flex-start;gap:8px;padding:8px 10px;
      border-radius:9px;margin-bottom:6px;font-size:.8rem;line-height:1.4;
      border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);
      animation:skResultIn .35s ease both;
    }
    .sk-summary-item:nth-child(2){animation-delay:.05s;}
    .sk-summary-item:nth-child(3){animation-delay:.1s;}
    .sk-summary-item:nth-child(4){animation-delay:.15s;}
    .sk-summary-item:nth-child(5){animation-delay:.2s;}
    .sk-summary-item:nth-child(6){animation-delay:.25s;}
    .sk-summary-item:nth-child(7){animation-delay:.3s;}
    .sk-summary-item:nth-child(8){animation-delay:.35s;}
    .sk-summary-ch{font-weight:800;color:var(--c);font-size:.72rem;min-width:50px;flex-shrink:0;margin-top:1px;}
    .sk-summary-choice{font-weight:700;}
    .sk-summary-level{font-size:.68rem;font-weight:800;padding:1px 6px;border-radius:99px;margin-left:auto;flex-shrink:0;}
    .sk-summary-level.good{background:rgba(52,211,153,.15);color:var(--g);}
    .sk-summary-level.mid{background:rgba(249,193,46,.15);color:var(--y);}
    .sk-summary-level.bad{background:rgba(255,107,107,.15);color:var(--r);}
  </style>

  <div class="main">
    <!-- Skenario shell -->
    <div class="sk-shell">
      <!-- HUD bar -->
      <div class="sk-hud">
        <div class="sk-hud-title">🎭 Skenario Interaktif</div>
        <span id="skTitle" style="font-size:.78rem;color:var(--muted)"></span>
        <span class="sk-badge" id="skScoreBadge" style="background:rgba(249,193,46,.15);color:var(--y)">0 poin</span>
        <button class="sk-skip-btn" id="skSkipBtn" onclick="skipSk()" title="Lewati skenario">⏩ Lewati</button>
      </div>

      <!-- Dynamic body area -->
      <div id="skBody">
        ${chapters.length
          ? '<div style="padding:30px;text-align:center;color:var(--muted)">Klik untuk memulai skenario…</div>'
          : '<div style="padding:30px;text-align:center;color:var(--muted)">Skenario belum diisi.</div>'}
      </div>

      <!-- Chapter progress -->
      <div class="sk-prog-wrap" id="skProgress">
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
    var typeTimer = null;
    var typeDone = false;
    var currentTypingId = null;
    var currentFullText = '';
    var choiceLog = []; // track choices for summary

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
      S.skScore = 0;
      choiceLog = [];
      updateNavbarScore();
      renderSkProg();
      startChapter();
    }

    // ── Render chapter progress dots ───────────────────
    function renderSkProg(){
      var el = document.getElementById('skProgress');
      if(!el) return;
      el.innerHTML = CHAPTERS.map(function(_, i){
        var cls = i < skCh ? 'sk-dot-done' : i === skCh ? 'sk-dot-active' : '';
        return '<div class="sk-prog-dot '+cls+'" style="flex:1;--sk-dot-i:'+i+';transition:all .3s"></div>';
      }).join('');
    }

    // ── Animate progress dot completion ────────────────
    function completeCurrentDot(){
      var dots = document.querySelectorAll('#skProgress .sk-prog-dot');
      if(dots[skCh]){
        dots[skCh].classList.remove('sk-dot-active');
        dots[skCh].classList.add('sk-dot-completing');
        var dot = dots[skCh];
        setTimeout(function(){
          dot.classList.remove('sk-dot-completing');
          dot.classList.add('sk-dot-done');
        }, 500);
      }
    }

    // ── Build ambient decorations for a scene ──────────
    function buildDecos(bg){
      var html = '';
      // Sun for outdoor scenes
      if(/sbg-(kampung|pasar|pantai|jalan|sekolah|rumah)/.test(bg)){
        html += '<div class="sk-deco-sun"></div>';
      }
      // Clouds for sky scenes
      if(/sbg-(kampung|pasar|pantai|jalan|sekolah|hutan)/.test(bg)){
        html += '<div class="sk-deco-cloud" style="left:10%"></div>';
        html += '<div class="sk-deco-cloud sk-cloud-2" style="left:55%"></div>';
      }
      // Grass for nature scenes
      if(/sbg-(kampung|hutan|rumah)/.test(bg)){
        html += '<div class="sk-deco-grass"></div>';
      }
      // Trees for village/forest scenes
      if(/sbg-(kampung|hutan)/.test(bg)){
        html += '<div class="sk-deco-tree" style="left:12%"><div class="sk-tree-top"></div><div class="sk-tree-trunk"></div></div>';
        html += '<div class="sk-deco-tree" style="left:82%;animation-delay:-2s"><div class="sk-tree-top"></div><div class="sk-tree-trunk"></div></div>';
      }
      return html;
    }

    // ── Start a chapter ────────────────────────────────
    function startChapter(){
      var ch = CHAPTERS[skCh];
      if(!ch) return;
      document.getElementById('skTitle').textContent = ch.title || '';
      skStep = 0;
      showSetup(true);
    }

    // ── Show setup dialogue step ───────────────────────
    function showSetup(withWalk){
      var ch = CHAPTERS[skCh];
      var step = ch.setup[skStep];
      if(!step) return showChoices();

      var walkClass = (withWalk && skStep === 0) ? ' sk-char-walking' : '';

      document.getElementById('skBody').innerHTML =
        '<div class="sk-scene '+(ch.bg || 'sbg-kampung')+'">'+
          buildDecos(ch.bg || 'sbg-kampung')+
          '<div class="sk-char'+walkClass+'" style="left:50%">'+
            '<div class="sk-head" style="background:#fff2d9">'+(ch.charEmoji || '😊')+'</div>'+
            '<div class="sk-body" style="background:'+(ch.charColor || '#3a7a9a')+'"></div>'+
            '<div class="sk-legs"><div class="sk-leg" style="background:'+(ch.charPants || '#3a5a7a')+'"></div><div class="sk-leg" style="background:'+(ch.charPants || '#3a5a7a')+'"></div></div>'+
          '</div>'+
        '</div>'+
        '<div class="sk-dialogue">'+
          '<div class="sk-speaker">'+escH(step.speaker)+'</div>'+
          '<div><span class="sk-text" id="skTypedText"></span><span class="sk-cursor" id="skCursor"></span></div>'+
          '<div class="sk-tap" id="skTapHint" style="display:none">Ketuk untuk lanjut ▶</div>'+
        '</div>';

      typeText('skTypedText', step.text || '');
      document.getElementById('skBody').onclick = handleSkBodyClick;
    }

    // ── Handle body click (skip typewriter or advance) ─
    function handleSkBodyClick(){
      if(!typeDone){
        // Skip typewriter — show full text instantly
        skipTypewriter();
      } else {
        advanceSetup();
      }
    }

    // ── Skip typewriter ────────────────────────────────
    function skipTypewriter(){
      if(typeTimer){ clearInterval(typeTimer); typeTimer = null; }
      var el = document.getElementById(currentTypingId);
      if(el) el.textContent = currentFullText;
      typeDone = true;
      // Hide cursor
      var cursor = document.getElementById('skCursor');
      if(cursor) cursor.style.display = 'none';
      // Show tap hint
      var hint = document.getElementById('skTapHint');
      if(hint) hint.style.display = 'block';
    }

    // ── Typewriter effect (15ms) ───────────────────────
    function typeText(id, text){
      if(typeTimer) clearInterval(typeTimer);
      var el = document.getElementById(id);
      if(!el) return;
      el.textContent = '';
      typeDone = false;
      currentTypingId = id;
      currentFullText = text;
      // Show cursor
      var cursor = document.getElementById('skCursor');
      if(cursor) cursor.style.display = 'inline-block';
      // Hide tap hint
      var hint = document.getElementById('skTapHint');
      if(hint) hint.style.display = 'none';

      var i = 0;
      typeTimer = setInterval(function(){
        if(i >= text.length){
          clearInterval(typeTimer);
          typeTimer = null;
          typeDone = true;
          // Hide cursor after typing done
          var c = document.getElementById('skCursor');
          if(c) c.style.display = 'none';
          // Show tap hint
          var h = document.getElementById('skTapHint');
          if(h) h.style.display = 'block';
          return;
        }
        el.textContent += text[i++];
      }, 15);
    }

    // ── Advance to next setup step ─────────────────────
    function advanceSetup(){
      document.getElementById('skBody').onclick = null;
      skStep++;
      if(skStep < CHAPTERS[skCh].setup.length) showSetup(false);
      else showChoices();
    }

    // ── Show choices ───────────────────────────────────
    function showChoices(){
      var ch = CHAPTERS[skCh];
      document.getElementById('skBody').innerHTML =
        '<div class="sk-choices">'+
          '<div class="sk-choice-prompt">'+escH(ch.choicePrompt || 'Apa yang kamu lakukan?')+'</div>'+
          ch.choices.map(function(c, i){
            var levelCls = c.level === 'good' ? 'sk-choice-good' : c.level === 'bad' ? 'sk-choice-bad' : 'sk-choice-mid';
            return '<div class="sk-choice '+levelCls+'" data-sk-choice="'+i+'" onclick="pickSkChoice('+i+',this)">'+
              '<span style="font-size:1.3rem">'+(c.icon || '')+'</span>'+
              '<div><div>'+escH(c.label || '')+'</div>'+
              '<div style="font-size:.72rem;color:var(--muted);font-weight:600">'+escH(c.detail || '')+'</div></div>'+
            '</div>';
          }).join('')+
        '</div>';
    }

    // ── Handle choice selection with animation ─────────
    window.pickSkChoice = function(i, el){
      var ch = CHAPTERS[skCh];
      var c = ch.choices[i];

      // Selection animation: scale + glow
      if(el){
        el.classList.add('sk-choice-selected');
        // Disable other choices
        var allChoices = document.querySelectorAll('.sk-choice');
        for(var j = 0; j < allChoices.length; j++){
          if(allChoices[j] !== el){
            allChoices[j].style.opacity = '.4';
            allChoices[j].style.pointerEvents = 'none';
          }
        }
      }

      // Log choice for summary
      choiceLog.push({
        chapter: ch.title || ('Bab ' + (skCh + 1)),
        label: c.label || '',
        level: c.level || 'mid',
        pts: c.pts || 0
      });

      // Delay showing result to let animation play
      setTimeout(function(){
        S.skScore += (c.pts || 0);
        updateNavbarScore();

        var icons = { good: '🌟', mid: '🤔', bad: '⚠️' };
        var levelClass = c.level || 'mid';

        document.getElementById('skBody').innerHTML =
          '<div class="sk-result">'+
            // Result banner with entrance animation
            '<div class="sk-result-banner '+levelClass+'">'+
              '<div style="font-size:2rem">'+(icons[c.level] || '💡')+'</div>'+
              '<div>'+
                '<div class="sk-result-title">'+escH(c.resultTitle || '')+'</div>'+
                '<div class="sk-result-body">'+escH(c.resultBody || '')+'</div>'+
              '</div>'+
            '</div>'+

            // Norma connection
            '<div class="sk-norma-box">'+
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
      }, 400);
    };

    // ── Move to next chapter ───────────────────────────
    window.nextSkChapter = function(){
      completeCurrentDot();
      setTimeout(function(){
        skCh++;
        renderSkProg();
        startChapter();
      }, 350);
    };

    // ── End scenario with detailed summary ─────────────
    window.endSk = function(){
      completeCurrentDot();
      setTimeout(function(){
        // Build summary of choices
        var summaryHTML = '';
        if(choiceLog.length > 0){
          summaryHTML = '<div class="sk-summary">'+
            '<div class="sk-summary-title">📊 Ringkasan Pilihan</div>'+
            choiceLog.map(function(log, idx){
              var levelCls = log.level || 'mid';
              var levelLabel = log.level === 'good' ? 'Baik' : log.level === 'bad' ? 'Kurang' : 'Cukup';
              return '<div class="sk-summary-item" style="animation-delay:'+(idx*.06)+'s">'+
                '<span class="sk-summary-ch">'+escH(log.chapter)+'</span>'+
                '<span class="sk-summary-choice">'+escH(log.label)+'</span>'+
                '<span class="sk-summary-level '+levelCls+'">'+levelLabel+'</span>'+
              '</div>';
            }).join('')+
          '</div>';
        }

        document.getElementById('skBody').innerHTML =
          '<div class="sk-end">'+
            '<div class="sk-end-icon">🎭</div>'+
            '<div class="sk-end-title">Skenario Selesai!</div>'+
            '<div class="sk-end-score">'+S.skScore+' poin</div>'+
            summaryHTML+
          '</div>';
        var btn = document.getElementById('btnNextAfterSk');
        if(btn) btn.style.display = 'inline-flex';
      }, 400);
    };

    // ── Skip skenario ──────────────────────────────────
    window.skipSk = function(){
      // Tally all possible scores quickly and jump to end
      var totalPts = 0;
      for(var i = skCh; i < CHAPTERS.length; i++){
        var ch = CHAPTERS[i];
        if(ch.choices && ch.choices.length > 0){
          // Pick the first choice (neutral skip)
          var c = ch.choices[0];
          totalPts += (c.pts || 0);
          choiceLog.push({
            chapter: ch.title || ('Bab ' + (i + 1)),
            label: (c.label || '') + ' (dilewati)',
            level: c.level || 'mid',
            pts: c.pts || 0
          });
        }
      }
      S.skScore += totalPts;
      updateNavbarScore();
      skCh = CHAPTERS.length - 1;
      renderSkProg();
      // Mark all dots as done
      var dots = document.querySelectorAll('#skProgress .sk-prog-dot');
      for(var d = 0; d < dots.length; d++){
        dots[d].classList.remove('sk-dot-active');
        dots[d].classList.add('sk-dot-done');
      }
      endSk();
    };

    // ── Update score badge with animation ──────────────
    function updateScoreBadge(){
      var badge = document.getElementById('skScoreBadge');
      if(!badge) return;
      var oldText = badge.textContent;
      var newText = S.skScore + ' poin';
      badge.textContent = newText;
      // Trigger pulse animation if score changed
      if(oldText !== newText){
        badge.classList.remove('pulse');
        // Force reflow
        void badge.offsetWidth;
        badge.classList.add('pulse');
        setTimeout(function(){ badge.classList.remove('pulse'); }, 600);
      }
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
      screenEl.addEventListener('screenActivate', function() {
        // Add sk-screen-active class to trigger entrance animations
        screenEl.classList.add('sk-screen-active');

        if(!hasInit){
          hasInit = true;
          initSk();
        }
      });

      // If already active
      if(screenEl.classList.contains('active') && !hasInit){
        screenEl.classList.add('sk-screen-active');
        hasInit = true;
        initSk();
      }
    }
  })();
  </script>
</div>`;
}
