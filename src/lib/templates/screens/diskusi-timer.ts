// ═══════════════════════════════════════════════════════════════
// DISKUSI-TIMER.TS — Diskusi + Timer screen template for MPI export
// Generates a discussion page with a visual countdown timer and
// discussion prompt cards for guided group discussion.
// ═══════════════════════════════════════════════════════════════

import type { DiskusiTimerSlotData } from '../engine/slot-types';

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
// renderDiskusiTimerHTML
// ═══════════════════════════════════════════════════════════════
/**
 * Generate the Diskusi + Timer screen HTML.
 *
 * Features:
 * - Large circular countdown timer (JS-driven)
 * - Start/Pause/Reset controls
 * - Discussion prompt with contextual instructions
 * - Question cards for guided discussion
 *
 * @param data     - DiskusiTimerSlotData with title, prompt, duration, questions
 * @param screenId - DOM id for this screen (e.g. 's-diskusi')
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderDiskusiTimerHTML(data: DiskusiTimerSlotData, screenId: string): string {
  const title = data.title || 'Diskusi Kelompok';
  const prompt = data.prompt || 'Diskusikan pertanyaan berikut bersama kelompokmu!';
  const duration = data.duration || 10; // minutes
  const questions = data.questions || [];
  const prefix = screenId;
  const totalSeconds = duration * 60;

  const questionCardsHtml = questions.length
    ? questions.map((q, i) => {
        return `<div class="dt-question-card">
      <div class="dt-question-num">${i + 1}</div>
      <div class="dt-question-text">${esc(q)}</div>
    </div>`;
      }).join('')
    : '<p style="color:var(--muted);font-size:.82rem">Pertanyaan diskusi belum diisi.</p>';

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">💬 Diskusi</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:40%"></div></div>
    <span class="nav-score">0 ⭐</span>
  </nav>
  <div class="main">
    <div class="card">
      <div class="h2">💬 <span class="hl">Diskusi</span> Kelompok</div>
      <p class="sub mt8">${esc(title)}</p>
    </div>

    <div class="card mt14" style="text-align:center">
      <div class="dt-timer-ring" id="${esc(prefix)}-timer-ring">
        <svg viewBox="0 0 140 140" class="dt-timer-svg">
          <circle cx="70" cy="70" r="62" stroke="rgba(255,255,255,.06)" stroke-width="6" fill="none"/>
          <circle cx="70" cy="70" r="62" stroke="var(--c)" stroke-width="6" fill="none"
            stroke-dasharray="389.56" stroke-dashoffset="0" stroke-linecap="round"
            transform="rotate(-90 70 70)" id="${esc(prefix)}-timer-circle"
            style="transition:stroke-dashoffset .5s"/>
        </svg>
        <div class="dt-timer-display">
          <div class="dt-timer-minutes" id="${esc(prefix)}-timer-min">${duration}</div>
          <div class="dt-timer-label">menit</div>
        </div>
      </div>
      <div class="dt-timer-controls">
        <button class="btn btn-c btn-sm" id="${esc(prefix)}-btn-start" onclick="dtStartTimer('${esc(prefix)}',${totalSeconds})">▶ Mulai</button>
        <button class="btn btn-ghost btn-sm" id="${esc(prefix)}-btn-pause" onclick="dtPauseTimer('${esc(prefix)}')" style="display:none">⏸ Jeda</button>
        <button class="btn btn-ghost btn-sm" id="${esc(prefix)}-btn-reset" onclick="dtResetTimer('${esc(prefix)}',${totalSeconds})">↻ Reset</button>
      </div>
    </div>

    <div class="card mt14">
      <div class="dt-prompt-label">📝 Pertanyaan Diskusi</div>
      <div class="dt-prompt-text">${esc(prompt)}</div>
      <div class="dt-questions-list">${questionCardsHtml}</div>
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
  <style>
    .dt-timer-ring{position:relative;width:140px;height:140px;margin:0 auto 14px;}
    .dt-timer-svg{width:140px;height:140px;}
    .dt-timer-display{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
    .dt-timer-minutes{font-family:'Fredoka One',cursive;font-size:2.2rem;color:var(--c);line-height:1;}
    .dt-timer-label{font-size:.7rem;color:var(--muted);font-weight:800;margin-top:2px;}
    .dt-timer-controls{display:flex;gap:8px;justify-content:center;margin-top:10px;}
    .dt-prompt-label{font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}
    .dt-prompt-text{font-size:.9rem;font-weight:700;line-height:1.6;margin-bottom:14px;color:var(--text);}
    .dt-questions-list{display:flex;flex-direction:column;gap:10px;}
    .dt-question-card{display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:12px 14px;}
    .dt-question-num{width:28px;height:28px;border-radius:50%;background:rgba(62,207,207,.15);color:var(--c);display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:900;flex-shrink:0;}
    .dt-question-text{font-size:.86rem;font-weight:700;line-height:1.5;color:var(--text);}
  </style>
  <script>
    var dtTimers = {};
    function dtStartTimer(prefix, totalSec) {
      if (dtTimers[prefix]) return;
      var circle = document.getElementById(prefix + '-timer-circle');
      var minEl = document.getElementById(prefix + '-timer-min');
      var startBtn = document.getElementById(prefix + '-btn-start');
      var pauseBtn = document.getElementById(prefix + '-btn-pause');
      if (!circle || !minEl) return;
      if (startBtn) startBtn.style.display = 'none';
      if (pauseBtn) pauseBtn.style.display = 'inline-flex';
      var remaining = totalSec;
      if (dtTimers[prefix + '_remaining'] !== undefined) {
        remaining = dtTimers[prefix + '_remaining'];
      } else {
        dtTimers[prefix + '_remaining'] = totalSec;
      }
      var circumference = 2 * Math.PI * 62;
      dtTimers[prefix] = setInterval(function() {
        remaining--;
        dtTimers[prefix + '_remaining'] = remaining;
        if (remaining <= 0) {
          clearInterval(dtTimers[prefix]);
          delete dtTimers[prefix];
          remaining = 0;
          if (startBtn) startBtn.style.display = 'inline-flex';
          if (pauseBtn) pauseBtn.style.display = 'none';
          minEl.textContent = '0';
          minEl.style.color = 'var(--r)';
          circle.style.stroke = 'var(--r)';
          circle.style.strokeDashoffset = circumference;
          return;
        }
        var m = Math.floor(remaining / 60);
        var s = remaining % 60;
        minEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
        var pct = 1 - (remaining / totalSec);
        circle.style.strokeDashoffset = (pct * circumference);
        if (remaining < 60) {
          minEl.style.color = 'var(--r)';
          circle.style.stroke = 'var(--r)';
        } else if (remaining < totalSec * 0.25) {
          minEl.style.color = 'var(--y)';
          circle.style.stroke = 'var(--y)';
        }
      }, 1000);
    }
    function dtPauseTimer(prefix) {
      if (dtTimers[prefix]) {
        clearInterval(dtTimers[prefix]);
        delete dtTimers[prefix];
      }
      var startBtn = document.getElementById(prefix + '-btn-start');
      var pauseBtn = document.getElementById(prefix + '-btn-pause');
      if (startBtn) startBtn.style.display = 'inline-flex';
      if (pauseBtn) pauseBtn.style.display = 'none';
    }
    function dtResetTimer(prefix, totalSec) {
      dtPauseTimer(prefix);
      dtTimers[prefix + '_remaining'] = totalSec;
      var circle = document.getElementById(prefix + '-timer-circle');
      var minEl = document.getElementById(prefix + '-timer-min');
      if (circle) { circle.style.strokeDashoffset = 0; circle.style.stroke = 'var(--c)'; }
      if (minEl) { var d = Math.ceil(totalSec / 60); minEl.textContent = d; minEl.style.color = 'var(--c)'; }
    }
  </script>
</div>`;
}
