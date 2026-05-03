// ═══════════════════════════════════════════════════════════════
// PENUTUP.TS — Closing / Summary screen template
// Generates a celebratory closing page with icon, title,
// subtitle, message, action button, and optional confetti.
// ═══════════════════════════════════════════════════════════════

import type { PenutupSlotData } from '../engine/slot-types';

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
// MAIN EXPORT — renderPenutupHTML
// ═══════════════════════════════════════════════════════════════
export function renderPenutupHTML(data: PenutupSlotData, screenId: string): string {
  const icon = data.icon || '🎓';
  const title = data.title || 'Pembelajaran Selesai!';
  const subtitle = data.subtitle || '';
  const message = data.message || '';
  const nextAction = data.nextAction || '';

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">${esc(title)}</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:100%"></div></div>
    <span class="nav-score">⭐</span>
  </nav>
  <div class="main" style="text-align:center">
    <!-- Celebratory hero area -->
    <div style="background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(52,211,153,.15),transparent 60%),var(--card);border:1px solid var(--border);border-radius:var(--rad);padding:36px 24px;margin-bottom:14px">
      <div style="font-size:4.5rem;animation:floatPenutup 3s ease-in-out infinite">${esc(icon)}</div>
      <div style="font-family:'Fredoka One',cursive;font-size:clamp(1.5rem,4vw,2.2rem);line-height:1.2;margin:12px 0 8px;color:var(--g)">${esc(title)}</div>
      ${subtitle ? `<div style="font-size:.92rem;color:var(--muted);max-width:480px;margin:0 auto;line-height:1.5">${esc(subtitle)}</div>` : ''}
    </div>

    ${message ? `<div class="card" style="text-align:left">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">📝 Pesan untuk Siswa</div>
      <div style="font-size:.9rem;line-height:1.7">${esc(message)}</div>
    </div>` : ''}

    <!-- Summary stats -->
    <div class="card mt14">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">📊 Ringkasan Pembelajaran</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px">
        <div style="background:rgba(249,193,46,.06);border:1px solid rgba(249,193,46,.2);border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:1.8rem">📚</div>
          <div style="font-weight:900;font-size:.82rem;margin-top:4px">Materi</div>
          <div style="font-size:.72rem;color:var(--muted)">Selesai dipelajari</div>
        </div>
        <div style="background:rgba(62,207,207,.06);border:1px solid rgba(62,207,207,.2);border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:1.8rem">🎭</div>
          <div style="font-weight:900;font-size:.82rem;margin-top:4px">Skenario</div>
          <div style="font-size:.72rem;color:var(--muted)">Telah dieksplorasi</div>
        </div>
        <div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.2);border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:1.8rem">❓</div>
          <div style="font-weight:900;font-size:.82rem;margin-top:4px">Kuis</div>
          <div style="font-size:.72rem;color:var(--muted)">Telah dikerjakan</div>
        </div>
      </div>
    </div>

    <!-- Motivational quote -->
    <div class="card mt14" style="border-left:4px solid var(--g);background:rgba(52,211,153,.04)">
      <div style="font-size:1.6rem;opacity:.5;margin-bottom:6px">"</div>
      <p style="font-size:.92rem;font-style:italic;line-height:1.7">Belajar bukan hanya soal nilai, tapi soal membangun pemahaman yang bermakna.</p>
      <div style="margin-top:8px;font-size:.78rem;color:var(--muted)">— Semangat terus! 💪</div>
    </div>

    <!-- Action buttons -->
    <div class="btn-row btn-center mt20">
      ${nextAction
        ? `<button class="btn btn-y" onclick="goNextScreen()">${esc(nextAction)} →</button>`
        : `<button class="btn btn-y" onclick="launchPenutupConfetti()">🎉 Selesai!</button>`}
      <button class="btn btn-ghost" onclick="goScreen('s-cover')">↩ Ulangi dari Awal</button>
    </div>
  </div>

  <!-- Confetti container -->
  <div id="penutupConfWrap" style="position:fixed;inset:0;pointer-events:none;z-index:9998"></div>

  <style>
    @keyframes floatPenutup{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
  </style>

  <script data-penutup-init="${esc(screenId)}">
  (function(){
    // ── Confetti launcher ───────────────────────────────
    window.launchPenutupConfetti = function(){
      var w = document.getElementById('penutupConfWrap');
      if(!w) return;
      var cols = ['#f9c12e','#3ecfcf','#ff6b6b','#a78bfa','#34d399','#fb923c'];
      for(var i = 0; i < 100; i++){
        var c = document.createElement('div');
        c.className = 'conf';
        var sz = 4 + Math.random() * 9;
        c.style.cssText = 'left:'+Math.random()*100+'%;top:'+(-20-Math.random()*40)+'px;width:'+sz+'px;height:'+sz+'px;background:'+cols[Math.floor(Math.random()*cols.length)]+';border-radius:'+(Math.random()>.5?'50%':'2px')+';animation-duration:'+(2+Math.random()*3)+'s;animation-delay:'+(Math.random()*.8)+'s;';
        w.appendChild(c);
      }
      setTimeout(function(){ w.innerHTML = ''; }, 6000);
    };

    // Auto-launch confetti on screen activation
    var screenEl = document.getElementById('${esc(screenId)}');
    var autoLaunched = false;
    if(screenEl){
      var observer = new MutationObserver(function(mutations){
        mutations.forEach(function(m){
          if(m.target.classList && m.target.classList.contains('active') && !autoLaunched){
            autoLaunched = true;
            setTimeout(launchPenutupConfetti, 500);
          }
        });
      });
      observer.observe(screenEl, { attributes: true, attributeFilter: ['class'] });

      // If already active
      if(screenEl.classList.contains('active') && !autoLaunched){
        autoLaunched = true;
        setTimeout(launchPenutupConfetti, 500);
      }
    }
  })();
  </script>
</div>`;
}
