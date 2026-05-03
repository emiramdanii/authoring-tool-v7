// ═══════════════════════════════════════════════════════════════
// HASIL.TS — Results / Score screen template for MPI export
// Generates the results page with animated conic-gradient score
// circle, appreciation level badges, score breakdown, reflection
// textareas, portofolio section, and confetti.
// Matches the preset s-hasil design quality.
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

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Hasil">
  <div class="main" style="text-align:center">

    <!-- Header -->
    <div class="card" style="margin-bottom:14px">
      <div class="h2">🏆 <span class="hl">Hasil</span> Belajar</div>
      <p class="sub mt8">${esc(data.namaBab || 'Bab ini')} · ${esc(data.totalKuis || 0)} soal</p>
    </div>

    <!-- Score Circle — conic-gradient only, no SVG overlay -->
    <div class="hasil-circle" id="hasilCircle" style="--prog:0%">
      <div class="hasil-score">
        <div class="hs-num" id="hasilNum" style="color:${esc(levelInfo.color)}">0</div>
        <div class="hs-label">SKOR</div>
      </div>
    </div>

    <!-- Level Badge -->
    <div id="hasilLevel" class="level-badge" style="background:${esc(levelInfo.bgColor)};border:1px solid ${esc(levelInfo.borderColor)};color:${esc(levelInfo.color)}">
      ${esc(levelInfo.emoji)} ${esc(levelInfo.label)}
    </div>

    <!-- Score Breakdown -->
    <div class="card mt14" style="text-align:left">
      <div class="hs-section-title">📊 Rincian Skor</div>
      <div class="hs-breakdown">
        <div class="hs-stat" style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2)">
          <div class="hs-stat-num" style="color:var(--g)" id="hasilCorrect">0</div>
          <div class="hs-stat-label">Benar</div>
        </div>
        <div class="hs-stat" style="background:rgba(255,107,107,.06);border:1px solid rgba(255,107,107,.2)">
          <div class="hs-stat-num" style="color:var(--r)" id="hasilWrong">0</div>
          <div class="hs-stat-label">Salah</div>
        </div>
        <div class="hs-stat" style="background:rgba(249,193,46,.06);border:1px solid rgba(249,193,46,.2)">
          <div class="hs-stat-num" style="color:var(--y)">${esc(data.totalKuis || 0)}</div>
          <div class="hs-stat-label">Total Soal</div>
        </div>
      </div>
    </div>

    <!-- Portofolio Jawaban -->
    <div class="card mt14" style="text-align:left">
      <div class="hs-section-title">📋 Portofolio Jawaban</div>
      <div id="hasilPorto"></div>
    </div>

    <!-- Reflection -->
    <div class="card mt14" style="text-align:left">
      <div class="hs-section-title">💭 Refleksi Pembelajaran</div>
      <div class="refl-item">
        <label>💭 Apa yang paling kamu pelajari hari ini?</label>
        <textarea placeholder="Tuliskan refleksimu…" id="refl-1"></textarea>
      </div>
      <div class="refl-item">
        <label>🌟 Bagaimana kamu akan menerapkannya?</label>
        <textarea placeholder="Rencana aksi nyata…" id="refl-2"></textarea>
      </div>
      <div class="refl-item">
        <label>🎯 Apa yang masih ingin kamu pelajari lebih lanjut?</label>
        <textarea placeholder="Topik yang ingin dieksplorasi…" id="refl-3"></textarea>
      </div>
      <button class="btn btn-c btn-sm" onclick="saveReflections()" style="margin-top:8px">💾 Simpan Refleksi</button>
      <span id="reflSaved" class="saved-badge" style="display:none;margin-left:8px">✅ Tersimpan</span>
    </div>

    <div class="btn-row btn-center mt14">
      <button class="btn btn-y" onclick="launchConfetti()">🎉 Selesai!</button>
      <button class="btn btn-ghost" onclick="goScreen('s-cover')">↩ Ulangi</button>
    </div>
  </div>

  <script data-hasil-init="${esc(screenId)}">
  (function(){
    var STATIC_SCORE = ${score};
    var STATIC_TOTAL = ${data.totalKuis || 0};
    var SHOULD_CONFETTI_STATIC = ${shouldConfetti};

    // ── Resolve actual score from runtime or static ──────
    // Kuis.ts sets window._kuisResult before navigating here.
    // Fall back to static data if no quiz was taken.
    function resolveScore() {
      if (window._kuisResult && typeof window._kuisResult.skor === 'number') {
        return window._kuisResult;
      }
      return { skor: STATIC_SCORE, correct: Math.round((STATIC_SCORE / 100) * STATIC_TOTAL), wrong: STATIC_TOTAL - Math.round((STATIC_SCORE / 100) * STATIC_TOTAL), total: STATIC_TOTAL };
    }

    // ── Animate score counter & conic gradient ──────────
    function animateScore(){
      var result = resolveScore();
      var targetScore = result.skor;
      var totalKuis = result.total;
      var targetCorrect = result.correct;
      var targetWrong = result.wrong;
      var shouldConfetti = targetScore >= 70;

      var circle = document.getElementById('hasilCircle');
      var numEl = document.getElementById('hasilNum');
      var correctEl = document.getElementById('hasilCorrect');
      var wrongEl = document.getElementById('hasilWrong');
      var totalEl = document.querySelector('#' + '${esc(screenId)}' + ' .hs-stat:last-child .hs-stat-num');
      if (!circle || !numEl) return;

      // Apply level colors immediately
      if (typeof updateHasilLevel === 'function') updateHasilLevel(targetScore);

      // Animate number and --prog variable
      var current = 0;
      var step = Math.max(1, Math.round(targetScore / 40));
      var interval = setInterval(function(){
        current += step;
        if (current >= targetScore) {
          current = targetScore;
          clearInterval(interval);
          if (shouldConfetti) setTimeout(launchConfetti, 300);
        }
        numEl.textContent = current;
        circle.style.setProperty('--prog', current + '%');
        if (correctEl) correctEl.textContent = Math.round((current / 100) * totalKuis);
        if (wrongEl) wrongEl.textContent = totalKuis - Math.round((current / 100) * totalKuis);
      }, 30);

      // Set total soal if available
      if (totalEl && totalKuis) totalEl.textContent = totalKuis;
    }

    // ── Populate portofolio from window.PORTO ──────────
    function populatePorto(){
      var portoEl = document.getElementById('hasilPorto');
      if (!portoEl) return;
      if (window.PORTO) {
        var keys = Object.keys(window.PORTO);
        if (keys.length === 0) {
          portoEl.innerHTML = '<p style="color:var(--muted);font-size:.82rem">Belum ada jawaban yang disimpan.</p>';
        } else {
          portoEl.innerHTML = keys.map(function(k) {
            return '<div class="porto-card"><div class="porto-label">' + window.PORTO[k].label + '</div><div class="porto-val">' + window.PORTO[k].text + '</div></div>';
          }).join('');
        }
      } else {
        portoEl.innerHTML = '<p style="color:var(--muted);font-size:.82rem">Belum ada jawaban yang disimpan.</p>';
      }
    }

    // ── Save reflections to PORTO ────────────────────
    function saveReflections() {
      var r1 = document.getElementById('refl-1');
      var r2 = document.getElementById('refl-2');
      var r3 = document.getElementById('refl-3');
      var hasContent = false;
      if (!window.PORTO) window.PORTO = {};
      if (r1 && r1.value.trim()) { window.PORTO['refleksi-1'] = { label: 'Apa yang dipelajari', text: r1.value.trim() }; hasContent = true; }
      if (r2 && r2.value.trim()) { window.PORTO['refleksi-2'] = { label: 'Rencana aksi', text: r2.value.trim() }; hasContent = true; }
      if (r3 && r3.value.trim()) { window.PORTO['refleksi-3'] = { label: 'Ingin pelajari', text: r3.value.trim() }; hasContent = true; }
      if (!hasContent) { alert('Tulis minimal 1 refleksi ya!'); return; }
      if (typeof addScore === 'function') addScore(5);
      var badge = document.getElementById('reflSaved');
      if (badge) badge.style.display = 'inline-flex';
      // Re-populate portofolio after saving
      populatePorto();
    }
    window.saveReflections = saveReflections;

    // ── Update level from external (kuis submit) ──────
    window.updateHasilLevel = function(skor) {
      var lv = document.getElementById('hasilLevel');
      if (!lv) return;
      var level, emoji, color, bg, bc;
      if (skor >= 85) {
        level = 'Sangat Baik!'; emoji = '🌟'; color = 'var(--g)'; bg = 'rgba(52,211,153,.1)'; bc = 'rgba(52,211,153,.3)';
      } else if (skor >= 70) {
        level = 'Baik'; emoji = '👍'; color = 'var(--y)'; bg = 'rgba(249,193,46,.1)'; bc = 'rgba(249,193,46,.3)';
      } else {
        level = 'Perlu Latihan'; emoji = '💪'; color = 'var(--r)'; bg = 'rgba(255,107,107,.1)'; bc = 'rgba(255,107,107,.3)';
      }
      lv.textContent = emoji + ' ' + level;
      lv.style.background = bg;
      lv.style.borderColor = bc;
      lv.style.color = color;
      var numEl = document.getElementById('hasilNum');
      if (numEl) { numEl.style.color = color; numEl.textContent = skor; }
      // Also update the conic gradient color
      var circle = document.getElementById('hasilCircle');
      if (circle) {
        circle.style.setProperty('--prog', skor + '%');
        var colorValue = skor >= 85 ? '#34d399' : skor >= 70 ? '#f9c12e' : '#ff6b6b';
        circle.style.background = 'conic-gradient(' + colorValue + ' 0%,' + colorValue + ' ' + skor + '%,rgba(255,255,255,.06) ' + skor + '% 100%)';
      }
      // Update breakdown from kuis result
      if (window._kuisResult) {
        var correctEl = document.getElementById('hasilCorrect');
        var wrongEl = document.getElementById('hasilWrong');
        if (correctEl) correctEl.textContent = window._kuisResult.correct;
        if (wrongEl) wrongEl.textContent = window._kuisResult.wrong;
      }
    };

    // ── Auto-trigger when screen becomes active ───────
    var el = document.getElementById('${esc(screenId)}');
    if (el) {
      el.addEventListener('screenActivate', function() {
        setTimeout(animateScore, 200);
        populatePorto();
      });
    }
    // Also run if already visible
    if (el && el.classList.contains('active')) {
      setTimeout(animateScore, 200);
      populatePorto();
    }
  })();
  </script>
  <style>
    .hs-num{font-family:'Fredoka One',cursive;font-size:2.1rem;}
    .hs-label{font-size:.72rem;color:var(--muted);margin-top:2px;}
    .level-badge{padding:10px 20px;border-radius:12px;text-align:center;font-weight:800;font-size:.92rem;margin:12px 0;display:inline-block;transition:all .3s;}
    .hs-section-title{font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;}
    .hs-breakdown{display:flex;gap:12px;flex-wrap:wrap;}
    .hs-stat{flex:1;min-width:120px;border-radius:10px;padding:12px;text-align:center;}
    .hs-stat-num{font-family:'Fredoka One',cursive;font-size:1.4rem;}
    .hs-stat-label{font-size:.72rem;color:var(--muted);}
  </style>
</div>`;
}
