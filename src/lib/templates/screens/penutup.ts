// ═══════════════════════════════════════════════════════════════
// PENUTUP.TS — Closing / Summary screen template (PRESET QUALITY)
// Generates a celebratory closing page with:
// - Animated gradient hero with floating icon + particle trail
// - Title & subtitle with dramatic scale entrance
// - Optional message card
// - Summary stats grid with staggered entrance & count-up
// - Progress journey visual (dots per screen visited)
// - Sertifikat Mini section (student name + score)
// - Preview next pertemuan (rich cards with icons, descriptions, hover)
// - Motivational quote with animated decorative marks & typewriter
// - Action buttons with ripple effect
// - "Bagikan Hasil" mock share card
// - "Ulangi dari Awal" with confirmation step
// - Multi-burst staggered confetti
// - Screen activation hook (pt-active class)
// ═══════════════════════════════════════════════════════════════

import type { PenutupSlotData } from '../engine/slot-types';
import { esc } from '../engine/esc';

// ── Accent color map ──────────────────────────────────────────
const ACCENT_MAP: Record<string, { hex: string; rgba: string }> = {
  '--y': { hex: '#f9c12e', rgba: 'rgba(249,193,46,' },
  '--c': { hex: '#3ecfcf', rgba: 'rgba(62,207,207,' },
  '--g': { hex: '#34d399', rgba: 'rgba(52,211,153,' },
  '--p': { hex: '#a78bfa', rgba: 'rgba(167,139,250,' },
  '--r': { hex: '#ff6b6b', rgba: 'rgba(255,107,107,' },
  '--o': { hex: '#fb923c', rgba: 'rgba(251,146,60,' },
};
function getAccent(varName: string) {
  return ACCENT_MAP[varName] || ACCENT_MAP['--y'];
}

// ── Gradient presets for stat items ────────────────────────────
const STAT_GRADIENTS = [
  'linear-gradient(135deg,rgba(249,193,46,.12),rgba(249,193,46,.04))',
  'linear-gradient(135deg,rgba(62,207,207,.12),rgba(62,207,207,.04))',
  'linear-gradient(135deg,rgba(167,139,250,.12),rgba(167,139,250,.04))',
  'linear-gradient(135deg,rgba(255,107,107,.12),rgba(255,107,107,.04))',
  'linear-gradient(135deg,rgba(52,211,153,.12),rgba(52,211,153,.04))',
  'linear-gradient(135deg,rgba(251,146,60,.12),rgba(251,146,60,.04))',
];

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderPenutupHTML
// ═══════════════════════════════════════════════════════════════
export function renderPenutupHTML(data: PenutupSlotData, screenId: string): string {
  const icon = data.icon || '🎓';
  const title = data.title || 'Pembelajaran Selesai!';
  const subtitle = data.subtitle || '';
  const message = data.message || '';
  const nextAction = data.nextAction || '';
  const nextPreview = data.nextPreview || null;
  const quote = data.quote || 'Belajar bukan hanya soal nilai, tapi soal membangun pemahaman yang bermakna.';
  const stats = data.stats || [];

  // Build summary stats with gradient backgrounds
  const defaultStats = [
    { icon: '📚', label: 'Materi', desc: 'Selesai dipelajari', bg: 'rgba(249,193,46,.06)', border: 'rgba(249,193,46,.2)' },
    { icon: '🎭', label: 'Skenario', desc: 'Telah dieksplorasi', bg: 'rgba(62,207,207,.06)', border: 'rgba(62,207,207,.2)' },
    { icon: '❓', label: 'Kuis', desc: 'Telah dikerjakan', bg: 'rgba(167,139,250,.06)', border: 'rgba(167,139,250,.2)' },
  ];
  const statsData = stats.length > 0 ? stats : defaultStats;

  const statsHTML = statsData.map((s, i) => `
        <div class="pt-stat-item" style="--stat-idx:${i};background:${esc(STAT_GRADIENTS[i % STAT_GRADIENTS.length])};border:1px solid ${esc(s.border)};border-radius:10px;padding:14px;text-align:center;opacity:0;transform:translateY(16px)">
          <div style="font-size:1.8rem">${esc(s.icon)}</div>
          <div style="font-weight:900;font-size:.82rem;margin-top:4px">${esc(s.label)}</div>
          <div style="font-size:.72rem;color:var(--muted)">${esc(s.desc)}</div>
        </div>`).join('');

  // Build next pertemuan preview — with rich cards + hover effects
  let nextPreviewHTML = '';
  if (nextPreview) {
    const gradientFrom = nextPreview.gradientFrom || 'rgba(62,207,207,.1)';
    const gradientTo = nextPreview.gradientTo || 'rgba(167,139,250,.1)';
    const borderColor = nextPreview.gradientFrom ? 'rgba(62,207,207,.25)' : 'rgba(62,207,207,.25)';

    // Build preview item cards with hover
    const itemColors = [
      { bg: 'rgba(249,193,46,.1)', border: 'rgba(249,193,46,.25)', color: 'var(--y)' },
      { bg: 'rgba(62,207,207,.1)', border: 'rgba(62,207,207,.25)', color: 'var(--c)' },
      { bg: 'rgba(255,107,107,.1)', border: 'rgba(255,107,107,.25)', color: 'var(--r)' },
      { bg: 'rgba(167,139,250,.1)', border: 'rgba(167,139,250,.25)', color: 'var(--p)' },
      { bg: 'rgba(52,211,153,.1)', border: 'rgba(52,211,153,.25)', color: 'var(--g)' },
      { bg: 'rgba(251,146,60,.1)', border: 'rgba(251,146,60,.25)', color: 'var(--o)' },
    ];

    const itemsHTML = nextPreview.items && nextPreview.items.length > 0
      ? nextPreview.items.map((item, i) => {
          let bg: string, border: string, color: string;
          if (item.accentVar) {
            const accent = getAccent(item.accentVar);
            bg = `${accent.rgba}.1)`;
            border = `${accent.rgba}.25)`;
            color = `var(${item.accentVar})`;
          } else {
            const defaultCol = itemColors[i % itemColors.length];
            bg = defaultCol.bg;
            border = defaultCol.border;
            color = defaultCol.color;
          }
          const descHTML = item.desc
            ? `<br><span style="font-weight:600;color:var(--muted);font-size:.75rem">${esc(item.desc)}</span>`
            : '';
          return `<div class="pt-preview-card p2-norma" style="background:${bg};border:1px solid ${border};color:${color};transition:transform .2s,box-shadow .2s;cursor:default">
            <div style="font-size:1.6rem;margin-bottom:5px">${esc(item.icon || '')}</div>
            ${esc(item.label)}${descHTML}
          </div>`;
        }).join('')
      : '';

    nextPreviewHTML = `
    <div class="card mt14">
      <div class="p2-preview" style="background:linear-gradient(135deg,${esc(gradientFrom)},${esc(gradientTo)});border:1px solid ${esc(borderColor)}">
        <div style="font-weight:900;font-size:1rem;color:var(--c);margin-bottom:4px">🔍 ${esc(nextPreview.title || 'Pertemuan Berikutnya')}</div>
        ${nextPreview.desc ? `<div style="font-size:.83rem;color:var(--muted);margin-bottom:14px;line-height:1.6">${esc(nextPreview.desc)}</div>` : ''}
        ${itemsHTML ? `<div class="p2-norma-grid">${itemsHTML}</div>` : ''}
      </div>
    </div>`;
  }

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Penutup">
  <div class="main" style="text-align:center">

    <!-- ═══ Celebratory hero area with animated gradient ═══ -->
    <div class="pt-hero" style="opacity:0;transform:scale(.85)">
      <!-- Animated gradient background -->
      <div class="pt-hero-gradient"></div>

      <!-- Floating icon with particle trail -->
      <div class="pt-icon-wrap">
        <div class="pt-icon-particle pt-icon-p1"></div>
        <div class="pt-icon-particle pt-icon-p2"></div>
        <div class="pt-icon-particle pt-icon-p3"></div>
        <div class="pt-floating-icon">${esc(icon)}</div>
      </div>
      <div style="font-family:'Fredoka One',cursive;font-size:clamp(1.5rem,4vw,2.2rem);line-height:1.2;margin:12px 0 8px;color:var(--g)">${esc(title)}</div>
      ${subtitle ? `<div style="font-size:.92rem;color:var(--muted);max-width:480px;margin:0 auto;line-height:1.5">${esc(subtitle)}</div>` : ''}
    </div>

    ${message ? `<div class="card" style="text-align:left">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">📝 Pesan untuk Siswa</div>
      <div style="font-size:.9rem;line-height:1.7">${esc(message)}</div>
    </div>` : ''}

    <!-- ═══ Summary stats with stagger entrance ═══ -->
    <div class="card mt14">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">📊 Ringkasan Pembelajaran</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px">
        ${statsHTML}
      </div>
    </div>

    <!-- ═══ Progress Journey — dots for screens visited ═══ -->
    <div class="card mt14">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">🗺️ Perjalanan Belajar</div>
      <div class="pt-journey" id="ptJourney-${esc(screenId)}"></div>
    </div>

    <!-- ═══ Sertifikat Mini ═══ -->
    <div class="card mt14">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">📜 Sertifikat Mini</div>
      <div class="pt-certificate" id="ptCert-${esc(screenId)}">
        <div class="pt-cert-border">
          <div class="pt-cert-ornament">✦</div>
          <div class="pt-cert-icon">🏆</div>
          <div class="pt-cert-title">Sertifikat Pembelajaran</div>
          <div class="pt-cert-name" id="ptCertName-${esc(screenId)}">Siswa Hebat</div>
          <div class="pt-cert-desc">Telah menyelesaikan pembelajaran ini</div>
          <div class="pt-cert-score">
            <span style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:var(--g)" id="ptCertScore-${esc(screenId)}">0</span>
            <span style="font-size:.72rem;color:var(--muted);margin-left:4px">poin</span>
          </div>
          <div class="pt-cert-ornament">✦</div>
        </div>
      </div>
    </div>

    <!-- ═══ Next pertemuan preview ═══ -->
    ${nextPreviewHTML}

    <!-- ═══ Motivational quote with animated marks & typewriter ═══ -->
    <div class="card mt14 pt-quote-card" style="border-left:4px solid var(--g);background:rgba(52,211,153,.04);opacity:0;transform:translateX(-24px)">
      <div class="pt-quote-mark pt-quote-mark-open">"</div>
      <p class="pt-quote-text" style="font-size:.92rem;font-style:italic;line-height:1.7"><span id="ptTypewriter-${esc(screenId)}"></span><span class="pt-cursor">|</span></p>
      <div class="pt-quote-mark pt-quote-mark-close">"</div>
      <div style="margin-top:8px;font-size:.78rem;color:var(--muted)">— Semangat terus! 💪</div>
    </div>

    <!-- ═══ Action buttons with ripple ═══ -->
    <div class="btn-row btn-center mt20">
      ${nextAction
        ? `<button class="btn btn-y pt-ripple-btn" onclick="goNextScreen()">${esc(nextAction)} →</button>`
        : `<button class="btn btn-y pt-ripple-btn" onclick="ptSelesaiClick('${esc(screenId)}')">🎉 Selesai!</button>`}
      <button class="btn btn-c pt-ripple-btn" onclick="ptBagikanHasil('${esc(screenId)}')">📤 Bagikan Hasil</button>
      <button class="btn btn-ghost pt-ripple-btn" id="ptUlangiBtn-${esc(screenId)}" onclick="ptUlangiConfirm('${esc(screenId)}')">↩ Ulangi dari Awal</button>
    </div>

    <!-- ═══ Share card overlay ═══ -->
    <div class="pt-share-overlay" id="ptShareOverlay-${esc(screenId)}" style="display:none">
      <div class="pt-share-card">
        <div style="font-weight:900;font-size:1.05rem;margin-bottom:8px">📤 Bagikan Hasil Belajar</div>
        <div style="font-size:.82rem;color:var(--muted);margin-bottom:14px">Salin hasil di bawah untuk dibagikan!</div>
        <div class="pt-share-preview" id="ptSharePreview-${esc(screenId)}"></div>
        <div style="display:flex;gap:8px;margin-top:12px;justify-content:center">
          <button class="btn btn-g btn-sm" onclick="ptCopyShare('${esc(screenId)}')">📋 Salin</button>
          <button class="btn btn-ghost btn-sm" onclick="ptCloseShare('${esc(screenId)}')">✕ Tutup</button>
        </div>
      </div>
    </div>
  </div>

  <style>
    /* ── Hero animated gradient ──────────────────────────── */
    .pt-hero{
      position:relative;overflow:hidden;
      border:1px solid var(--border);border-radius:var(--rad);
      padding:36px 24px;margin-bottom:14px;
      transition:opacity .6s ease,transform .7s cubic-bezier(.34,1.56,.64,1);
    }
    .pt-hero-gradient{
      position:absolute;inset:0;z-index:0;
      background:linear-gradient(135deg,rgba(52,211,153,.18),rgba(62,207,207,.12),rgba(249,193,46,.12),rgba(167,139,250,.10));
      background-size:300% 300%;
      animation:ptGradientShift 8s ease infinite;
    }
    .pt-hero > *:not(.pt-hero-gradient){position:relative;z-index:1;}
    @keyframes ptGradientShift{
      0%{background-position:0% 50%;}
      50%{background-position:100% 50%;}
      100%{background-position:0% 50%;}
    }

    /* ── Floating icon with rotation ────────────────────── */
    .pt-icon-wrap{
      position:relative;display:inline-block;
      margin-bottom:8px;
    }
    .pt-floating-icon{
      font-size:4.5rem;
      animation:ptFloatRotate 4s ease-in-out infinite;
      position:relative;z-index:2;
    }
    @keyframes ptFloatRotate{
      0%,100%{transform:translateY(0) rotate(0deg);}
      25%{transform:translateY(-10px) rotate(5deg);}
      50%{transform:translateY(-16px) rotate(0deg);}
      75%{transform:translateY(-8px) rotate(-5deg);}
    }

    /* ── Icon particle trail (CSS-only pseudo-elements) ── */
    .pt-icon-particle{
      position:absolute;border-radius:50%;z-index:1;
      opacity:0;pointer-events:none;
      animation:ptParticleDrift 3s ease-in-out infinite;
    }
    .pt-icon-p1{
      width:8px;height:8px;top:20%;left:10%;
      background:rgba(52,211,153,.5);
      animation-delay:0s;
    }
    .pt-icon-p2{
      width:6px;height:6px;top:50%;right:5%;
      background:rgba(249,193,46,.5);
      animation-delay:1s;
    }
    .pt-icon-p3{
      width:10px;height:10px;bottom:15%;left:20%;
      background:rgba(167,139,250,.4);
      animation-delay:2s;
    }
    @keyframes ptParticleDrift{
      0%{opacity:0;transform:translate(0,0) scale(.5);}
      30%{opacity:.7;transform:translate(-8px,-12px) scale(1);}
      70%{opacity:.4;transform:translate(5px,-20px) scale(.8);}
      100%{opacity:0;transform:translate(-3px,-28px) scale(.3);}
    }

    /* ── Stat items stagger entrance ─────────────────────── */
    .pt-stat-item{
      transition:opacity .5s ease,transform .5s ease;
    }
    .pt-active .pt-stat-item{
      opacity:1 !important;
      transform:translateY(0) !important;
      transition-delay:calc(var(--stat-idx) * 0.12s + 0.3s);
    }

    /* ── Quote animated marks ────────────────────────────── */
    .pt-quote-card{
      transition:opacity .6s ease,transform .6s ease;
    }
    .pt-active .pt-quote-card{
      opacity:1 !important;
      transform:translateX(0) !important;
      transition-delay:.6s;
    }
    .pt-quote-mark{
      font-size:2.4rem;line-height:1;
      color:var(--g);opacity:.25;
      font-family:Georgia,serif;
      animation:ptQuotePulse 3s ease-in-out infinite;
    }
    .pt-quote-mark-open{margin-bottom:-10px;}
    .pt-quote-mark-close{margin-top:-8px;text-align:right;}
    @keyframes ptQuotePulse{
      0%,100%{opacity:.2;transform:scale(1);}
      50%{opacity:.45;transform:scale(1.1);}
    }

    /* ── Typewriter cursor ───────────────────────────────── */
    .pt-cursor{
      animation:ptBlink .7s step-end infinite;
      color:var(--g);font-weight:300;
    }
    @keyframes ptBlink{
      0%,100%{opacity:1;}50%{opacity:0;}
    }

    /* ── Preview card hover ──────────────────────────────── */
    .pt-preview-card:hover{
      transform:translateY(-3px) !important;
      box-shadow:0 6px 20px rgba(0,0,0,.08);
    }

    /* ── Ripple button effect ────────────────────────────── */
    .pt-ripple-btn{position:relative;overflow:hidden;}
    .pt-ripple{
      position:absolute;border-radius:50%;
      background:rgba(255,255,255,.35);
      transform:scale(0);animation:ptRipple .6s ease-out;
      pointer-events:none;
    }
    @keyframes ptRipple{to{transform:scale(4);opacity:0;}}

    /* ── Progress journey dots ───────────────────────────── */
    .pt-journey{
      display:flex;align-items:center;gap:0;
      overflow-x:auto;padding:8px 0;
      scrollbar-width:thin;
    }
    .pt-journey-dot{
      width:10px;height:10px;border-radius:50%;
      background:var(--border);
      transition:background .3s,transform .3s;
      flex-shrink:0;
    }
    .pt-journey-dot.pt-visited{
      background:var(--g);transform:scale(1.15);
    }
    .pt-journey-dot.pt-current{
      background:var(--y);transform:scale(1.35);
      box-shadow:0 0 8px rgba(249,193,46,.4);
    }
    .pt-journey-line{
      width:16px;height:2px;background:var(--border);
      flex-shrink:0;transition:background .3s;
    }
    .pt-journey-line.pt-visited-line{
      background:var(--g);
    }

    /* ── Sertifikat Mini ─────────────────────────────────── */
    .pt-certificate{
      display:flex;justify-content:center;
    }
    .pt-cert-border{
      position:relative;
      background:linear-gradient(135deg,rgba(52,211,153,.06),rgba(249,193,46,.06));
      border:2px solid rgba(52,211,153,.2);
      border-radius:12px;padding:20px 28px;
      text-align:center;max-width:320px;width:100%;
    }
    .pt-cert-ornament{
      color:rgba(52,211,153,.25);font-size:1.1rem;
      letter-spacing:.5em;user-select:none;
    }
    .pt-cert-icon{font-size:2.2rem;margin:4px 0;}
    .pt-cert-title{
      font-weight:900;font-size:.88rem;
      color:var(--g);margin-bottom:8px;
      letter-spacing:.04em;
    }
    .pt-cert-name{
      font-family:'Fredoka One',cursive;
      font-size:1.15rem;color:var(--fg);
      margin-bottom:4px;
    }
    .pt-cert-desc{
      font-size:.76rem;color:var(--muted);
      margin-bottom:10px;
    }
    .pt-cert-score{
      display:flex;align-items:baseline;
      justify-content:center;
    }

    /* ── Share overlay ───────────────────────────────────── */
    .pt-share-overlay{
      position:fixed;inset:0;z-index:9999;
      background:rgba(0,0,0,.45);
      display:flex;align-items:center;justify-content:center;
      animation:ptFadeIn .25s ease;
    }
    @keyframes ptFadeIn{from{opacity:0;}to{opacity:1;}}
    .pt-share-card{
      background:var(--card);border:1px solid var(--border);
      border-radius:var(--rad);padding:24px;
      max-width:380px;width:90%;text-align:center;
      animation:ptSlideUp .3s ease;
    }
    @keyframes ptSlideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    .pt-share-preview{
      background:var(--bg);border:1px solid var(--border);
      border-radius:8px;padding:14px;text-align:left;
      font-size:.82rem;line-height:1.6;color:var(--fg);
    }

    /* ── Active state entrance for hero ──────────────────── */
    .pt-active .pt-hero{
      opacity:1 !important;
      transform:scale(1) !important;
    }
  </style>

  <script data-penutup-init="${esc(screenId)}">
  (function(){
    var SID = '${esc(screenId)}';
    var QUOTE = ${JSON.stringify(quote)};
    var screenEl = document.getElementById(SID);

    // ── Ripple effect on buttons ────────────────────────────
    function addRipple(e) {
      var btn = e.currentTarget;
      var rect = btn.getBoundingClientRect();
      var ripple = document.createElement('span');
      ripple.className = 'pt-ripple';
      var size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function() { ripple.remove(); }, 600);
    }
    var rippleBtns = screenEl ? screenEl.querySelectorAll('.pt-ripple-btn') : [];
    for (var rb = 0; rb < rippleBtns.length; rb++) {
      rippleBtns[rb].addEventListener('click', addRipple);
    }

    // ── Typewriter effect ───────────────────────────────────
    var twDone = false;
    function startTypewriter() {
      if (twDone) return;
      twDone = true;
      var el = document.getElementById('ptTypewriter-' + SID);
      if (!el) return;
      var txt = QUOTE;
      var idx = 0;
      el.textContent = '';
      function type() {
        if (idx < txt.length) {
          el.textContent += txt.charAt(idx);
          idx++;
          setTimeout(type, 28);
        }
      }
      setTimeout(type, 800);
    }

    // ── Progress journey dots ───────────────────────────────
    function buildJourney() {
      var container = document.getElementById('ptJourney-' + SID);
      if (!container) return;
      var allScreens = document.querySelectorAll('.screen');
      var activeScreen = document.getElementById(SID);
      var foundCurrent = false;
      var html = '';
      for (var i = 0; i < allScreens.length; i++) {
        var s = allScreens[i];
        var isActive = s === activeScreen;
        var wasActive = s.classList.contains('active') || s.classList.contains('visited');
        if (isActive) foundCurrent = true;
        var dotClass = 'pt-journey-dot';
        if (isActive) dotClass += ' pt-current';
        else if (wasActive || foundCurrent === false) dotClass += ' pt-visited';
        html += '<div class="' + dotClass + '" title="' + (s.getAttribute('data-nav-label') || 'Screen') + '"></div>';
        if (i < allScreens.length - 1) {
          var lineClass = 'pt-journey-line';
          if (wasActive || isActive) lineClass += ' pt-visited-line';
          html += '<div class="' + lineClass + '"></div>';
        }
      }
      container.innerHTML = html;
    }

    // ── Sertifikat Mini — populate name & score ─────────────
    function populateCert() {
      var nameEl = document.getElementById('ptCertName-' + SID);
      var scoreEl = document.getElementById('ptCertScore-' + SID);
      var studentName = 'Siswa Hebat';
      // Try to get name from global PORTO or prompt
      if (window.PORTO && window.PORTO['nama-siswa']) {
        studentName = window.PORTO['nama-siswa'].text || window.PORTO['nama-siswa'];
      }
      if (nameEl) nameEl.textContent = studentName;
      // Animate score count-up
      var targetScore = (typeof S !== 'undefined' && S && S.score) ? S.score : 0;
      if (scoreEl && targetScore > 0) {
        var cur = 0;
        var step = Math.max(1, Math.round(targetScore / 30));
        var iv = setInterval(function() {
          cur += step;
          if (cur >= targetScore) { cur = targetScore; clearInterval(iv); }
          scoreEl.textContent = cur;
        }, 35);
      }
    }

    // ── Multi-burst staggered confetti ──────────────────────
    function launchMultiConfetti() {
      if (typeof launchConfetti !== 'function') return;
      launchConfetti();
      setTimeout(launchConfetti, 400);
      setTimeout(launchConfetti, 900);
    }

    // ── "Selesai!" button handler ───────────────────────────
    window.ptSelesaiClick = function(sid) {
      if (sid !== SID) return;
      launchMultiConfetti();
    };

    // ── "Bagikan Hasil" ─────────────────────────────────────
    window.ptBagikanHasil = function(sid) {
      if (sid !== SID) return;
      var overlay = document.getElementById('ptShareOverlay-' + SID);
      var preview = document.getElementById('ptSharePreview-' + SID);
      if (!overlay || !preview) return;
      var score = (typeof S !== 'undefined' && S && S.score) ? S.score : 0;
      var name = 'Siswa Hebat';
      if (window.PORTO && window.PORTO['nama-siswa']) {
        name = window.PORTO['nama-siswa'].text || window.PORTO['nama-siswa'];
      }
      preview.innerHTML =
        '🎓 <b>' + name + '</b><br>' +
        '📊 Skor: <b>' + score + '</b> poin<br>' +
        '📝 ' + ${JSON.stringify(title)} + '<br>' +
        '💪 Semangat terus belajar!';
      overlay.style.display = 'flex';
    };

    window.ptCopyShare = function(sid) {
      if (sid !== SID) return;
      var preview = document.getElementById('ptSharePreview-' + SID);
      if (!preview) return;
      var text = preview.innerText || preview.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
          alert('✅ Hasil berhasil disalin!');
        });
      } else {
        // Fallback
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('✅ Hasil berhasil disalin!');
      }
    };

    window.ptCloseShare = function(sid) {
      if (sid !== SID) return;
      var overlay = document.getElementById('ptShareOverlay-' + SID);
      if (overlay) overlay.style.display = 'none';
    };

    // ── "Ulangi dari Awal" with confirmation ────────────────
    var ulangiConfirmed = false;
    window.ptUlangiConfirm = function(sid) {
      if (sid !== SID) return;
      var btn = document.getElementById('ptUlangiBtn-' + SID);
      if (!btn) return;
      if (ulangiConfirmed) {
        ulangiConfirmed = false;
        btn.textContent = '↩ Ulangi dari Awal';
        btn.classList.remove('btn-r');
        btn.classList.add('btn-ghost');
        goScreen('s-cover');
        return;
      }
      ulangiConfirmed = true;
      btn.textContent = '⚠️ Yakin? Tekan lagi';
      btn.classList.remove('btn-ghost');
      btn.classList.add('btn-r');
      setTimeout(function() {
        if (ulangiConfirmed) {
          ulangiConfirmed = false;
          btn.textContent = '↩ Ulangi dari Awal';
          btn.classList.remove('btn-r');
          btn.classList.add('btn-ghost');
        }
      }, 3000);
    };

    // ── Screen activation hook ──────────────────────────────
    function onActivate() {
      if (!screenEl) return;
      // Add pt-active class to trigger CSS animations
      screenEl.classList.add('pt-active');
      // Build journey dots
      buildJourney();
      // Populate certificate
      populateCert();
      // Start typewriter
      startTypewriter();
      // Auto-launch multi-burst confetti with dramatic delay
      setTimeout(launchMultiConfetti, 700);
    }

    if (screenEl) {
      screenEl.addEventListener('screenActivate', onActivate);
      // If already active on render
      if (screenEl.classList.contains('active')) {
        onActivate();
      }
    }
  })();
  </script>
</div>`;
}
