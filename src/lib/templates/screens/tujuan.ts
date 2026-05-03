// ═══════════════════════════════════════════════════════════════
// TUJUAN.TS — Tujuan Pembelajaran screen template for MPI export
// Generates a standalone TP page showing learning objectives
// with colored number badges, navbar, and navigation buttons.
// Upgraded to preset quality with:
// - Staggered entrance animations triggered by screenActivate
// - Decorative accent bars & gradient header
// - Hover effects with colored glow
// - Click-to-expand detail with checkmark acknowledge
// - Progress tracking ("Dibaca: 2/5")
// ═══════════════════════════════════════════════════════════════

import type { TujuanSlotData } from '../engine/slot-types';

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
// renderTujuanHTML
// ═══════════════════════════════════════════════════════════════
/**
 * Generate the Tujuan Pembelajaran screen HTML.
 *
 * @param data     - TujuanSlotData with title and tpItems
 * @param screenId - DOM id for this screen (e.g. 's-tujuan')
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderTujuanHTML(data: TujuanSlotData, screenId: string): string {
  const title = data.title || 'Tujuan Pembelajaran';
  const tpItems = data.tpItems || [];
  const total = tpItems.length;

  const tpColors = ['var(--y)', 'var(--c)', 'var(--g)', 'var(--p)', 'var(--r)', 'var(--o)'];

  const itemsHtml = tpItems.length
    ? tpItems.map((t, i) => {
        const col = t.color || tpColors[i % tpColors.length];
        const delay = (0.15 + i * 0.1).toFixed(2);
        return `<div class="tj-tp-item" data-tj-idx="${i}" style="--tj-c:${esc(col)};animation-delay:${delay}s">
      <div class="tj-accent-bar"></div>
      <div class="tj-tp-body">
        <div class="tj-tp-row">
          <div class="tj-tp-num">${i + 1}</div>
          <div class="tj-tp-text">
            <div class="tj-tp-verb">${esc(t.verb)}</div>
            <div class="tj-tp-desc">${esc(t.desc)}</div>
          </div>
          <div class="tj-check" id="tjCheck-${esc(screenId)}-${i}">✓</div>
        </div>
        <div class="tj-tp-detail" id="tjDetail-${esc(screenId)}-${i}">
          <span class="tj-pill">→ Pertemuan ${t.pertemuan || 1}</span>
        </div>
      </div>
    </div>`;
      }).join('')
    : '<p class="tj-empty">Tujuan Pembelajaran belum diisi.</p>';

  // Progress indicator HTML (only if there are items)
  const progressHtml = total > 0
    ? `<div class="tj-progress">
      <span class="tj-progress-label">Dibaca:</span>
      <span class="tj-progress-count" id="tjCount-${esc(screenId)}">0/${esc(total)}</span>
      <div class="tj-progress-track">
        <div class="tj-progress-fill" id="tjFill-${esc(screenId)}" style="width:0%"></div>
      </div>
    </div>`
    : '';

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Tujuan">
  <div class="main">
    <!-- Gradient header card -->
    <div class="card tj-header">
      <div class="tj-gradient-bar"></div>
      <div class="tj-title tj-title-animate">🎯 <span class="hl">Tujuan</span> Pembelajaran</div>
      <p class="sub mt8">${esc(title)}</p>
    </div>

    <!-- Progress indicator -->
    ${progressHtml}

    <!-- TP Items card -->
    <div class="card mt14">
      ${itemsHtml}
    </div>

    <!-- Navigation buttons -->
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <style>
    /* ── Header gradient bar ──────────────────── */
    .tj-header{position:relative;overflow:hidden;}
    .tj-gradient-bar{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--y),var(--c),var(--g),var(--p),var(--r),var(--o));border-radius:var(--rad) var(--rad) 0 0;}

    /* ── Title animation ──────────────────────── */
    .tj-title{font-family:'Fredoka One',cursive;font-size:1.6rem;line-height:1.2;}
    .tj-title-animate{opacity:0;transform:translateY(16px);}
    .tj-active .tj-title-animate{animation:tjSlideUp .5s ease both;}

    /* ── Keyframes ────────────────────────────── */
    @keyframes tjSlideUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
    @keyframes tjCheckPop{0%{transform:scale(0);}50%{transform:scale(1.35);}100%{transform:scale(1);}}
    @keyframes tjGlowPulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--tj-c) 20%,transparent);}50%{box-shadow:0 0 12px 2px color-mix(in srgb,var(--tj-c) 25%,transparent);}}

    /* ── TP Item ──────────────────────────────── */
    .tj-tp-item{position:relative;display:flex;gap:0;padding:0;margin-bottom:8px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.03);overflow:hidden;cursor:pointer;opacity:0;transform:translateY(24px);transition:transform .2s ease,box-shadow .25s ease,border-color .25s ease,background .25s ease;}
    .tj-active .tj-tp-item{animation:tjSlideUp .5s ease both;}
    .tj-tp-item:last-child{margin-bottom:0;}

    /* ── Accent bar (left sidebar) ────────────── */
    .tj-accent-bar{width:4px;flex-shrink:0;background:var(--tj-c);border-radius:2px 0 0 2px;opacity:.6;transition:opacity .25s,width .25s;}
    .tj-tp-item:hover .tj-accent-bar{opacity:1;width:5px;}
    .tj-tp-item.tj-acknowledged .tj-accent-bar{opacity:1;width:5px;}

    /* ── TP body ──────────────────────────────── */
    .tj-tp-body{flex:1;padding:12px 14px;min-width:0;}

    /* ── TP row ───────────────────────────────── */
    .tj-tp-row{display:flex;align-items:flex-start;gap:10px;}

    /* ── TP number badge ──────────────────────── */
    .tj-tp-num{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:900;flex-shrink:0;margin-top:1px;background:color-mix(in srgb,var(--tj-c) 15%,transparent);color:var(--tj-c);}

    /* ── TP text ──────────────────────────────── */
    .tj-tp-text{flex:1;min-width:0;}
    .tj-tp-verb{font-weight:900;font-size:.86rem;color:var(--tj-c);margin-bottom:2px;}
    .tj-tp-desc{font-size:.8rem;color:var(--muted);line-height:1.5;}

    /* ── Checkmark ────────────────────────────── */
    .tj-check{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0;transform:scale(0);font-size:.72rem;font-weight:900;color:#0e1c2f;background:var(--g);margin-top:2px;transition:none;}
    .tj-tp-item.tj-acknowledged .tj-check{opacity:1;transform:scale(1);animation:tjCheckPop .4s ease both;}

    /* ── Detail section (expandable) ──────────── */
    .tj-tp-detail{max-height:0;overflow:hidden;transition:max-height .3s ease,opacity .3s ease,padding .3s ease;opacity:0;padding:0;}
    .tj-tp-item.tj-expanded .tj-tp-detail{max-height:60px;padding:8px 0 2px;opacity:1;}

    /* ── Pill badge (pertemuan) ────────────────── */
    .tj-pill{display:inline-flex;align-items:center;gap:4px;padding:4px 14px;border-radius:99px;font-size:.72rem;font-weight:900;letter-spacing:.02em;background:color-mix(in srgb,var(--tj-c) 12%,transparent);color:var(--tj-c);border:1px solid color-mix(in srgb,var(--tj-c) 25%,transparent);}

    /* ── Hover effects ────────────────────────── */
    .tj-tp-item:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--tj-c) 35%,transparent);box-shadow:0 4px 18px color-mix(in srgb,var(--tj-c) 14%,transparent);}

    /* ── Acknowledged state ───────────────────── */
    .tj-tp-item.tj-acknowledged{border-color:color-mix(in srgb,var(--tj-c) 22%,transparent);background:color-mix(in srgb,var(--tj-c) 4%,transparent);}
    .tj-tp-item.tj-acknowledged:hover{animation:tjGlowPulse 1.5s ease-in-out infinite;}

    /* ── Progress indicator ───────────────────── */
    .tj-progress{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:99px;padding:8px 16px;margin-bottom:4px;}
    .tj-progress-label{font-size:.78rem;font-weight:800;color:var(--muted);}
    .tj-progress-count{font-size:.78rem;font-weight:900;color:var(--c);min-width:32px;}
    .tj-progress-track{flex:1;height:4px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;}
    .tj-progress-fill{height:100%;background:linear-gradient(90deg,var(--c),var(--g));border-radius:99px;transition:width .5s ease;}

    /* ── Empty state ──────────────────────────── */
    .tj-empty{color:var(--muted);font-size:.82rem;padding:8px 0;}

    /* ── Responsive ───────────────────────────── */
    @media(max-width:540px){
      .tj-tp-row{gap:8px;}
      .tj-tp-body{padding:10px 12px;}
      .tj-tp-num{width:22px;height:22px;font-size:.66rem;}
      .tj-tp-verb{font-size:.8rem;}
      .tj-tp-desc{font-size:.76rem;}
    }
  </style>

  <script data-tj-init="${esc(screenId)}">
  (function(){
    var SID = '${esc(screenId)}';
    var TOTAL = ${total};
    var screenEl = document.getElementById(SID);
    var acknowledged = {};

    /* ── Screen activation: trigger entrance animations ── */
    function activate() {
      if (screenEl) screenEl.classList.add('tj-active');
    }

    /* Check if already active on load */
    if (screenEl && screenEl.classList.contains('active')) {
      activate();
    }

    /* Listen for future screenActivate events */
    if (screenEl) {
      screenEl.addEventListener('screenActivate', function() {
        activate();
      });
    }

    /* ── TP item click handlers ─────────────────── */
    if (screenEl) {
      var items = screenEl.querySelectorAll('.tj-tp-item');
      for (var i = 0; i < items.length; i++) {
        (function(idx, el) {
          el.addEventListener('click', function() {
            /* Toggle expanded detail */
            var isExpanded = el.classList.contains('tj-expanded');
            el.classList.toggle('tj-expanded');

            /* Collapse other items when expanding */
            if (!isExpanded) {
              for (var j = 0; j < items.length; j++) {
                if (j !== idx) items[j].classList.remove('tj-expanded');
              }
            }

            /* Mark as acknowledged on first click */
            if (!acknowledged[idx]) {
              acknowledged[idx] = true;
              el.classList.add('tj-acknowledged');
              addScore(2);
              updateProgress();
            }
          });
        })(i, items[i]);
      }
    }

    /* ── Progress tracker ───────────────────────── */
    function updateProgress() {
      var count = Object.keys(acknowledged).length;
      var pct = TOTAL > 0 ? Math.round((count / TOTAL) * 100) : 0;
      var fill = document.getElementById('tjFill-' + SID);
      var countEl = document.getElementById('tjCount-' + SID);
      if (fill) fill.style.width = pct + '%';
      if (countEl) countEl.textContent = count + '/' + TOTAL;
    }
  })();
  </script>
</div>`;
}
