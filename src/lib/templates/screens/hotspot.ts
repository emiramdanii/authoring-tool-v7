// ═══════════════════════════════════════════════════════════════
// HOTSPOT.TS — Interactive Hotspot Image screen template
// Generates a page with an image overlay and clickable hotspot
// pins that reveal tooltips or expanded content. Supports
// tooltip and dialog modes with animations and scoring.
// ═══════════════════════════════════════════════════════════════

import type { HotspotSlotData } from '../engine/slot-types';
import { esc } from '../engine/esc';

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderHotspotHTML
// ═══════════════════════════════════════════════════════════════
export function renderHotspotHTML(data: HotspotSlotData, screenId: string): string {
  const hotspots = data.hotspots || [];
  const mode = data.mode || 'tooltip';
  const animation = data.animation || 'fade';
  const imageHeight = data.height || 300;

  // Build hotspot pins HTML
  const hotspotPinsHTML = hotspots.map((h, i) => {
    const color = h.warna || 'var(--y)';
    return `<div class="hs-pin" id="hspin_${i}" data-idx="${i}" style="left:${h.x || 50}%;top:${h.y || 50}%;--pin-color:${esc(color)}" onclick="toggleHotspot(${i})">
      <div class="hs-pin-dot">${esc(h.icon || '📌')}</div>
      <div class="hs-pin-ring"></div>
      <div class="hs-pin-label">${i + 1}</div>
    </div>`;
  }).join('');

  // Build tooltip content HTML (for tooltip mode)
  const tooltipContentHTML = hotspots.map((h, i) => {
    const color = h.warna || 'var(--y)';
    return `<div class="hs-tooltip" id="hstt_${i}" style="--pin-color:${esc(color)};left:${h.x || 50}%;top:${h.y || 50}%">
      <div class="hs-tooltip-arrow"></div>
      <div class="hs-tooltip-header">
        <span class="hs-tooltip-icon">${esc(h.icon || '📌')}</span>
        <span class="hs-tooltip-title">${esc(h.judul || 'Hotspot ' + (i + 1))}</span>
        <button class="hs-tooltip-close" onclick="closeHotspot(${i})">✕</button>
      </div>
      <div class="hs-tooltip-body">${esc(h.isi || '')}</div>
    </div>`;
  }).join('');

  // Build dialog content HTML (for dialog mode)
  const dialogContentHTML = hotspots.map((h, i) => {
    const color = h.warna || 'var(--y)';
    return `<div class="hs-dialog-overlay" id="hsdlg_${i}" onclick="closeDialog(${i}, event)">
      <div class="hs-dialog" style="--pin-color:${esc(color)}" onclick="event.stopPropagation()">
        <div class="hs-dialog-header">
          <span class="hs-dialog-icon">${esc(h.icon || '📌')}</span>
          <span class="hs-dialog-title">${esc(h.judul || 'Hotspot ' + (i + 1))}</span>
          <button class="hs-dialog-close" onclick="closeDialog(${i})">✕</button>
        </div>
        <div class="hs-dialog-body">${esc(h.isi || '')}</div>
        <button class="btn btn-sm hs-dialog-ok" style="background:var(--pin-color);color:#0e1c2f" onclick="closeDialog(${i})">OK, Mengerti</button>
      </div>
    </div>`;
  }).join('');

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Hotspot Image">
  <div class="main">

    <!-- Header -->
    <div class="card" style="margin-bottom:14px">
      <span class="chip-sc" style="background:rgba(249,193,46,.15);color:var(--y)">📌 Jelajahi Gambar</span>
      <div class="h2">📌 <span class="hl">${esc(data.title || 'Hotspot Image')}</span></div>
      ${data.intro ? `<p class="sub mt8">${esc(data.intro)}</p>` : '<p class="sub mt8">Klik titik-titik pada gambar untuk mempelajari lebih lanjut.</p>'}
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <div style="background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:5px 12px;font-size:.76rem;font-weight:800;color:var(--g)">
          ✅ Dijelajahi: <span id="hsVisitedCount">0</span>/${hotspots.length}
        </div>
      </div>
    </div>

    <!-- Hotspot Image Container -->
    <div class="hs-container" id="hsContainer" style="--hs-height:${imageHeight}px">
      ${data.imageUrl
        ? `<img src="${esc(data.imageUrl)}" class="hs-image" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="hs-placeholder" style="display:none">🖼️ Gambar tidak tersedia</div>`
        : '<div class="hs-placeholder">🖼️ Tambahkan gambar di editor</div>'}
      <div class="hs-pins-layer" id="hsPinsLayer">
        ${hotspotPinsHTML}
      </div>
      ${mode === 'tooltip' ? `<div class="hs-tooltips-layer" id="hsTooltipsLayer">${tooltipContentHTML}</div>` : ''}
    </div>

    <!-- Progress bar -->
    <div class="hs-progress-bar">
      <div class="hs-progress-fill" id="hsProgressFill" style="width:0%"></div>
    </div>

    <!-- Dialog overlays (for dialog mode) -->
    ${mode === 'dialog' ? dialogContentHTML : ''}

    <!-- Navigation -->
    <div class="btn-row btn-center mt14">
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
      <button class="btn btn-y" id="hsNextBtn" onclick="goNextScreen()" style="opacity:.5;pointer-events:none">Lanjut →</button>
    </div>
  </div>

  <script data-hotspot-init="${esc(screenId)}">
  (function(){
    var HOTSPOT_COUNT = ${hotspots.length};
    var MODE = '${esc(mode)}';
    var ANIM = '${esc(animation)}';
    var visited = {};

    // ── Toggle hotspot (tooltip mode) ────────────────
    window.toggleHotspot = function(idx) {
      if (MODE === 'dialog') {
        openDialog(idx);
        return;
      }
      // Close all other tooltips
      for (var i = 0; i < HOTSPOT_COUNT; i++) {
        var tt = document.getElementById('hstt_' + i);
        var pin = document.getElementById('hspin_' + i);
        if (i !== idx && tt) {
          tt.classList.remove('active');
          if (pin) pin.classList.remove('active');
        }
      }
      var tooltip = document.getElementById('hstt_' + idx);
      var pinEl = document.getElementById('hspin_' + idx);
      if (!tooltip) return;
      var isOpen = tooltip.classList.contains('active');
      if (isOpen) {
        tooltip.classList.remove('active');
        if (pinEl) pinEl.classList.remove('active');
      } else {
        tooltip.classList.add('active');
        if (pinEl) pinEl.classList.add('active');
        markVisited(idx);
      }
    };

    // ── Close hotspot tooltip ────────────────────────
    window.closeHotspot = function(idx) {
      var tt = document.getElementById('hstt_' + idx);
      var pin = document.getElementById('hspin_' + idx);
      if (tt) tt.classList.remove('active');
      if (pin) pin.classList.remove('active');
    };

    // ── Open dialog (dialog mode) ────────────────────
    window.openDialog = function(idx) {
      var dlg = document.getElementById('hsdlg_' + idx);
      if (dlg) {
        dlg.classList.add('active');
        markVisited(idx);
      }
    };

    // ── Close dialog ─────────────────────────────────
    window.closeDialog = function(idx, evt) {
      var dlg = document.getElementById('hsdlg_' + idx);
      if (dlg) dlg.classList.remove('active');
    };

    // ── Mark hotspot as visited + scoring ────────────
    function markVisited(idx) {
      if (visited[idx]) return;
      visited[idx] = true;

      // Score: +3 per new hotspot visited
      if (typeof addScore === 'function') addScore(3);

      // Update visited count
      var countEl = document.getElementById('hsVisitedCount');
      var count = Object.keys(visited).length;
      if (countEl) countEl.textContent = count;

      // Update progress bar
      var fillEl = document.getElementById('hsProgressFill');
      if (fillEl) fillEl.style.width = Math.round((count / HOTSPOT_COUNT) * 100) + '%';

      // Mark pin as visited
      var pin = document.getElementById('hspin_' + idx);
      if (pin) pin.classList.add('visited');

      // Enable next button when all visited
      if (count >= HOTSPOT_COUNT) {
        var nextBtn = document.getElementById('hsNextBtn');
        if (nextBtn) { nextBtn.style.opacity = '1'; nextBtn.style.pointerEvents = 'auto'; }
      }

      // Save to PORTO
      if (!window.PORTO) window.PORTO = {};
      window.PORTO['hotspot-' + idx] = { label: 'Hotspot ' + (idx + 1), text: 'Dijelajahi' };
    }

    // ── Auto-trigger when screen becomes active ───────
    var el = document.getElementById('${esc(screenId)}');
    if (el) {
      el.addEventListener('screenActivate', function() {
        // Reset visited state for fresh view
        // (keep if already visited — user may navigate back)
        var count = Object.keys(visited).length;
        var countEl = document.getElementById('hsVisitedCount');
        if (countEl) countEl.textContent = count;
        var fillEl = document.getElementById('hsProgressFill');
        if (fillEl) fillEl.style.width = Math.round((count / HOTSPOT_COUNT) * 100) + '%';
        if (count >= HOTSPOT_COUNT) {
          var nextBtn = document.getElementById('hsNextBtn');
          if (nextBtn) { nextBtn.style.opacity = '1'; nextBtn.style.pointerEvents = 'auto'; }
        }
      });
    }
  })();
  </script>

  <style>
    /* ── Hotspot container ──────────────────────── */
    .hs-container{position:relative;border-radius:14px;overflow:hidden;background:var(--card);border:1px solid var(--border);height:var(--hs-height,300px);margin-bottom:10px;}
    .hs-image{width:100%;height:100%;object-fit:cover;display:block;}
    .hs-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.9rem;background:rgba(255,255,255,.03);}

    /* ── Pins layer ─────────────────────────────── */
    .hs-pins-layer{position:absolute;inset:0;pointer-events:none;}
    .hs-pin{position:absolute;transform:translate(-50%,-50%);pointer-events:auto;cursor:pointer;z-index:10;display:flex;flex-direction:column;align-items:center;gap:2px;}
    .hs-pin-dot{width:36px;height:36px;border-radius:50%;background:var(--pin-color,var(--y));display:flex;align-items:center;justify-content:center;font-size:1rem;box-shadow:0 3px 12px rgba(0,0,0,.4);transition:transform .2s,box-shadow .2s;position:relative;z-index:2;}
    .hs-pin:hover .hs-pin-dot{transform:scale(1.15);box-shadow:0 4px 18px rgba(0,0,0,.5);}
    .hs-pin.active .hs-pin-dot{transform:scale(1.2);box-shadow:0 0 0 4px rgba(249,193,46,.3),0 4px 18px rgba(0,0,0,.5);}
    .hs-pin-ring{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;border:2px solid var(--pin-color,var(--y));opacity:.5;animation:hsPulse 2s ease-in-out infinite;z-index:1;}
    .hs-pin.visited .hs-pin-ring{animation:none;opacity:.2;}
    .hs-pin-label{font-size:.6rem;font-weight:900;color:var(--bg);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:3;pointer-events:none;}
    @keyframes hsPulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.5;}50%{transform:translate(-50%,-50%) scale(1.8);opacity:0;}}

    /* ── Tooltips layer ─────────────────────────── */
    .hs-tooltips-layer{position:absolute;inset:0;pointer-events:none;}
    .hs-tooltip{position:absolute;transform:translate(-50%,10px);background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:0;width:220px;max-width:80vw;pointer-events:auto;box-shadow:0 8px 30px rgba(0,0,0,.5);opacity:0;visibility:hidden;transition:opacity .25s ease,transform .25s ease,visibility .25s;z-index:50;}
    .hs-tooltip.active{opacity:1;visibility:visible;transform:translate(-50%,16px);}
    .hs-tooltip-arrow{position:absolute;top:-6px;left:50%;transform:translateX(-50%) rotate(45deg);width:12px;height:12px;background:var(--bg2);border-left:1px solid var(--border);border-top:1px solid var(--border);}
    .hs-tooltip-header{display:flex;align-items:center;gap:8px;padding:10px 12px 0;border-bottom:1px solid var(--border);padding-bottom:8px;}
    .hs-tooltip-icon{font-size:1.1rem;}
    .hs-tooltip-title{font-weight:800;font-size:.84rem;flex:1;color:var(--text);}
    .hs-tooltip-close{background:none;border:none;color:var(--muted);cursor:pointer;font-size:.8rem;padding:2px 4px;line-height:1;}
    .hs-tooltip-close:hover{color:var(--text);}
    .hs-tooltip-body{padding:10px 12px;font-size:.8rem;color:var(--muted);line-height:1.6;}

    /* ── Dialog overlay ─────────────────────────── */
    .hs-dialog-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:300;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;padding:20px;}
    .hs-dialog-overlay.active{opacity:1;visibility:visible;}
    .hs-dialog{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:20px;max-width:400px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:hsDialogIn .3s ease;}
    @keyframes hsDialogIn{from{transform:scale(.9) translateY(20px);opacity:0;}to{transform:none;opacity:1;}}
    .hs-dialog-header{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
    .hs-dialog-icon{font-size:1.8rem;}
    .hs-dialog-title{font-family:'Fredoka One',cursive;font-size:1.1rem;flex:1;}
    .hs-dialog-close{background:none;border:none;color:var(--muted);cursor:pointer;font-size:.9rem;padding:4px;}
    .hs-dialog-close:hover{color:var(--text);}
    .hs-dialog-body{font-size:.86rem;color:var(--muted);line-height:1.7;margin-bottom:14px;}
    .hs-dialog-ok{margin-top:6px;}

    /* ── Progress bar ───────────────────────────── */
    .hs-progress-bar{height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:8px;}
    .hs-progress-fill{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;transition:width .5s ease;}

    /* ── Responsive ─────────────────────────────── */
    @media(max-width:540px){
      .hs-tooltip{width:180px;}
      .hs-dialog{max-width:calc(100vw - 32px);}
    }
  </style>
</div>`;
}
