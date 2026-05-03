// ═══════════════════════════════════════════════════════════════
// REFLEKSI.TS — Reflection page screen template
// Generates a reflection page with prompted text areas for
// student self-assessment and personal reflection.
// ═══════════════════════════════════════════════════════════════

import type { RefleksiSlotData } from '../engine/slot-types';

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

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderRefleksiHTML
// ═══════════════════════════════════════════════════════════════
export function renderRefleksiHTML(data: RefleksiSlotData, screenId: string): string {
  const prompts = data.prompts && data.prompts.length > 0
    ? data.prompts
    : DEFAULT_PROMPTS;

  // Build reflection prompt items
  const promptItemsHTML = prompts
    .map((p, i) => {
      const icon = PROMPT_ICONS[i % PROMPT_ICONS.length];
      return `<div class="refl-item" style="animation:fadeIn .4s ease ${i * 0.1}s both">
        <label>${icon} ${esc(p.question)}</label>
        <textarea placeholder="${esc(p.placeholder)}" data-refl-idx="${i}" oninput="onReflInput(${i},this)"></textarea>
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
          <div id="reflCharCount${i}" style="font-size:.68rem;color:var(--muted)">0 karakter</div>
          <div style="flex:1"></div>
          <div id="reflCheck${i}" style="font-size:.78rem;opacity:0;transition:opacity .3s;color:var(--g)">✅</div>
        </div>
      </div>`;
    })
    .join('');

  // Completion progress bar
  const totalPrompts = prompts.length;

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">${esc(data.title || 'Refleksi')}</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:85%"></div></div>
    <span class="nav-score" id="reflNavScore">0 ⭐</span>
  </nav>
  <div class="main">
    <div class="card" style="margin-bottom:14px">
      <div class="h2">💭 <span class="hl">Refleksi</span> Pembelajaran</div>
      <p class="sub mt8">Luangkan waktu untuk merefleksikan pembelajaranmu hari ini.</p>
    </div>

    <!-- Progress indicator -->
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:99px;padding:8px 16px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted)">Progress</div>
      <div style="flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden">
        <div id="reflProgressBar" style="height:100%;background:linear-gradient(90deg,var(--c),var(--g));border-radius:99px;transition:width .5s;width:0%"></div>
      </div>
      <div id="reflProgressText" style="font-size:.78rem;font-weight:900;color:var(--c)">0/${esc(totalPrompts)}</div>
    </div>

    <!-- Prompt cards -->
    <div class="card">
      ${promptItemsHTML}
    </div>

    <!-- Completion message -->
    <div id="reflCompleteMsg" class="card mt14" style="display:none;text-align:center;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2)">
      <div style="font-size:2.5rem;margin-bottom:8px">🎉</div>
      <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:var(--g)">Refleksi Selesai!</div>
      <p style="font-size:.84rem;color:var(--muted);margin-top:6px">Terima kasih sudah merefleksikan pembelajaranmu.</p>
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" id="btnReflNext" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <script data-refl-init="${esc(screenId)}">
  (function(){
    var TOTAL = ${totalPrompts};
    var answered = {};
    var reflScore = 0;

    window.onReflInput = function(idx, el){
      var val = (el.value || '').trim();
      var charEl = document.getElementById('reflCharCount'+idx);
      var checkEl = document.getElementById('reflCheck'+idx);

      if(charEl) charEl.textContent = val.length + ' karakter';

      var wasAnswered = !!answered[idx];
      var isAnswered = val.length >= 5; // minimum 5 chars to count

      if(isAnswered && !wasAnswered){
        answered[idx] = true;
        reflScore += 5;
        if(checkEl) checkEl.style.opacity = '1';
        el.style.borderColor = 'rgba(52,211,153,.3)';
      } else if(!isAnswered && wasAnswered){
        delete answered[idx];
        reflScore = Math.max(0, reflScore - 5);
        if(checkEl) checkEl.style.opacity = '0';
        el.style.borderColor = 'var(--border)';
      }

      updateReflProgress();
    };

    function updateReflProgress(){
      var count = Object.keys(answered).length;
      var pct = Math.round((count / TOTAL) * 100);
      var bar = document.getElementById('reflProgressBar');
      var text = document.getElementById('reflProgressText');
      if(bar) bar.style.width = pct + '%';
      if(text) text.textContent = count + '/' + TOTAL;

      var navEl = document.getElementById('reflNavScore');
      if(navEl) navEl.textContent = reflScore + ' ⭐';

      // Update all nav scores
      var scoreEls = document.querySelectorAll('.nav-score');
      for(var i=0;i<scoreEls.length;i++){
        scoreEls[i].textContent = reflScore + ' ⭐';
      }

      // Show completion message
      var msg = document.getElementById('reflCompleteMsg');
      if(msg){
        msg.style.display = count >= TOTAL ? 'block' : 'none';
      }
    }
  })();
  </script>
</div>`;
}
