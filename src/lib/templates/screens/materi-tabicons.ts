// ═══════════════════════════════════════════════════════════════
// MATERI-TABICONS.TS — Materi Tab Icons screen template for MPI export
// Generates a materi screen with rich sub-components:
// - Tab navigation with optional read-tracking (✓ checkmarks + progress)
// - Def-box callouts
// - Card Grid 2×2
// - Diskusi Kelompok Banner
// - Norma Tabs (alternative content mode for norma-type materials)
// - Tabel Accordion (expandable comparison table)
// - Diskusi box with textarea + localStorage save
// ── PRESET QUALITY UPGRADE ──
// - Staggered entrance animations via @keyframes + .mti-active
// - screenActivate event hook for triggered animations
// - Sliding tab indicator, glow effects, gradient progress bar
// - Smooth tab/norma/tabell transitions
// - +3 points when all tabs viewed, celebration badge
// ═══════════════════════════════════════════════════════════════

import type {
  MateriTabIconsSlotData,
  MateriTabItem,
  DefBoxItem,
  CardGridItem,
  DiskusiKelompokBanner,
  NormaTabItem,
  TabelAccordionItem,
  DiskusiBoxData,
} from '../engine/slot-types';
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

const TAB_COLORS = ['#f9c12e', '#3ecfcf', '#34d399', '#a78bfa', '#ff6b6b', '#fb923c'];
const TAB_CSS_VARS = ['var(--y)', 'var(--c)', 'var(--g)', 'var(--p)', 'var(--r)', 'var(--o)'];

// ── Render Def-boxes ──────────────────────────────────────────
function renderDefBoxes(defBoxes: DefBoxItem[]): string {
  if (!defBoxes || defBoxes.length === 0) return '';
  return defBoxes.map(d => {
    const accent = getAccent(d.accentVar || '--y');
    return `<div class="def-box" style="border-color:var(${esc(d.accentVar || '--y')});background:${accent.rgba}.07)">
      ${esc(d.text)}
    </div>`;
  }).join('\n');
}

// ── Render Card Grid ──────────────────────────────────────────
function renderCardGrid(cards: CardGridItem[]): string {
  if (!cards || cards.length === 0) return '';
  const cardsHTML = cards.map(c => {
    const accent = getAccent(c.accentVar || '--y');
    return `<div class="nc" style="background:${accent.rgba}.06);border-color:${accent.rgba}.2)">
      <div class="nc-head">
        <div class="nc-icon">${esc(c.icon)}</div>
        <div class="nc-title" style="color:var(${esc(c.accentVar || '--y')})">${esc(c.title)}</div>
      </div>
      <div class="nc-body">${esc(c.body)}</div>
    </div>`;
  }).join('\n');
  return `<div class="nc-grid">${cardsHTML}</div>`;
}

// ── Render Diskusi Kelompok Banners ───────────────────────────
function renderDiskusiKelompokBanners(banners: DiskusiKelompokBanner[], prefix: string): string {
  if (!banners || banners.length === 0) return '';
  return banners.map((b, i) => {
    const tipeClass = `tipe-${b.tipe}`;
    const labelClass = b.tipe === 1 ? 'hijau' : b.tipe === 2 ? 'kuning' : 'ungu';
    const timerId = `${prefix}-dk-timer-${i}`;
    const timerHTML = b.timerDetik
      ? `<div id="${esc(timerId)}" style="margin-top:10px"></div>`
      : '';
    return `
    <div class="diskusi-kelompok ${esc(tipeClass)}">
      <div class="dk-ikon">${esc(b.ikon || '👥')}</div>
      <div class="dk-body">
        <div class="dk-label ${esc(labelClass)}">${esc(b.label)}</div>
        <div class="dk-judul">${esc(b.judul)}</div>
        <div class="dk-isi">${esc(b.isi)}</div>
        ${timerHTML}
      </div>
    </div>`;
  }).join('\n');
}

// ── Render Diskusi Box ────────────────────────────────────────
function renderDiskusiBox(box: DiskusiBoxData | undefined): string {
  if (!box) return '';
  const btnClass = box.accentVar === '--y' ? 'btn-y' : box.accentVar === '--g' ? 'btn-g' : 'btn-c';
  return `
  <div class="diskusi-box" style="margin-top:14px">
    <div style="color:var(${esc(box.accentVar || '--c')});font-weight:800;font-size:.86rem">💬 Pertanyaan Diskusi</div>
    <p style="margin-top:7px;font-size:.86rem;line-height:1.6;font-weight:700">${esc(box.prompt)}</p>
    <textarea id="${esc(box.textareaId)}" placeholder="${esc(box.placeholder)}"></textarea>
    <div style="display:flex;align-items:center;flex-wrap:wrap;margin-top:9px;gap:8px">
      <button class="btn ${btnClass} btn-sm" onclick="saveDiskusi('${esc(box.textareaId)}','${esc(box.saveKey)}','${esc(box.saveLabel)}')">💾 Simpan (+5 poin)</button>
      <span id="badge-${esc(box.saveKey)}" style="display:none" class="saved-badge">✅ Tersimpan</span>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderMateriTabIconsHTML
// ═══════════════════════════════════════════════════════════════
export function renderMateriTabIconsHTML(data: MateriTabIconsSlotData, screenId: string): string {
  const title = data.title || 'Materi Pembelajaran';
  const tabs = data.tabs || [];
  const prefix = screenId;
  const readTracking = data.readTracking === true || data.readTracking === 'yes' || data.readTracking === 'true';
  const normaTabs = data.normaTabs || [];
  const tabelAccordion = data.tabelAccordion || [];
  const useNormaMode = normaTabs.length > 0;

  // ── Top-level sub-components ──────────────────────────────────
  const defBoxesHTML = renderDefBoxes(data.defBoxes || []);
  const cardGridHTML = renderCardGrid(data.cardGrid || []);
  const bannersHTML = renderDiskusiKelompokBanners(data.diskusiKelompok || [], prefix);
  const diskusiBoxHTML = renderDiskusiBox(data.diskusiBox);

  // ═════════════════════════════════════════════════════════════
  // MODE A: Regular tabs with optional read tracking
  // ═════════════════════════════════════════════════════════════
  let tabsContentHTML = '';
  let tabsJS = '';

  if (!useNormaMode && tabs.length > 0) {
    // Tab buttons
    const tabButtonsHtml = tabs.map((t, i) => {
      const col = TAB_CSS_VARS[i % TAB_CSS_VARS.length];
      const activeStyle = i === 0 ? `color:${col};` : '';
      return `<button class="mti-tab${i === 0 ? ' mti-tab-active' : ''}"
        onclick="switchMtiTab('${esc(prefix)}',${i})"
        id="${esc(prefix)}-mtitab-${i}"
        style="${activeStyle}">
        <span class="mti-tab-icon">${esc(t.icon || '📌')}</span>
        <span class="mti-tab-label">${esc(t.label || 'Tab ' + (i + 1))}</span>
        <span class="mti-tab-check" id="${esc(prefix)}-mticheck-${i}"></span>
      </button>`;
    }).join('');

    // Tab contents
    const tabContentsHtml = tabs.map((t, i) => {
      const col = TAB_CSS_VARS[i % TAB_CSS_VARS.length];
      // Sub-components inside each tab
      const tabDefBoxes = renderDefBoxes(t.defBoxes || []);
      const tabCardGrid = renderCardGrid(t.cardGrid || []);
      return `<div class="mti-content${i === 0 ? ' mti-content-active' : ''}"
        id="${esc(prefix)}-mticontent-${i}">
        <div class="mti-content-header">
          <span class="mti-content-icon" style="background:${col}18;color:${col}">${esc(t.icon || '📌')}</span>
          <span class="mti-content-title" style="color:${col}">${esc(t.label || 'Tab ' + (i + 1))}</span>
        </div>
        ${tabDefBoxes}
        ${tabCardGrid}
        <div class="mti-content-body">${esc(t.content || 'Konten belum diisi.')}</div>
      </div>`;
    }).join('');

    // Read tracking progress bar with gradient fill + completion badge
    const readTrackingHTML = readTracking ? `
    <div id="${esc(prefix)}-tabReadProgress" class="mti-read-progress">
      <span class="mti-read-label">Sudah dibaca:</span>
      <div class="mti-read-bar-track">
        <div id="${esc(prefix)}-tabReadBar" class="mti-read-bar-fill"></div>
      </div>
      <span id="${esc(prefix)}-tabReadCount" class="mti-read-count">0/${esc(tabs.length)}</span>
      <span id="${esc(prefix)}-tabReadBadge" class="mti-read-badge" style="display:none">✅</span>
    </div>` : '';

    tabsContentHTML = `
    <div class="mti-tab-row" id="${esc(prefix)}-mtiTabRow">
      ${tabButtonsHtml}
      <div class="mti-tab-indicator" id="${esc(prefix)}-mtiIndicator"></div>
    </div>
    <div class="mti-content-area" id="${esc(prefix)}-mtiContentArea">
      ${tabContentsHtml}
    </div>
    ${readTrackingHTML}`;

    // JS for tab switching + read tracking + indicator + animations
    tabsJS = `
    (function(){
      var _mtiPrefix = '${esc(prefix)}';
      var _mtiTabRead = new Set();
      var _mtiTotal = ${tabs.length};
      var _readTracking = ${readTracking};
      var _allViewedScored = false;
      var _mtiCurIdx = 0;

      function updateIndicator() {
        var activeTab = document.getElementById(_mtiPrefix + '-mtitab-' + _mtiCurIdx);
        var indicator = document.getElementById(_mtiPrefix + '-mtiIndicator');
        if (!activeTab || !indicator) return;
        var row = document.getElementById(_mtiPrefix + '-mtiTabRow');
        if (!row) return;
        var rowRect = row.getBoundingClientRect();
        var tabRect = activeTab.getBoundingClientRect();
        indicator.style.width = tabRect.width + 'px';
        indicator.style.left = (tabRect.left - rowRect.left) + 'px';
        indicator.style.background = ${JSON.stringify(TAB_COLORS)}[_mtiCurIdx % ${TAB_COLORS.length}];
      }

      window.switchMtiTab = function(prefix, idx) {
        if(prefix !== _mtiPrefix) return;
        var prevIdx = _mtiCurIdx;
        _mtiCurIdx = idx;
        var tabs = document.querySelectorAll('#' + prefix + ' .mti-tab');
        for (var i = 0; i < tabs.length; i++) {
          tabs[i].classList.remove('mti-tab-active');
          tabs[i].style.color = '';
        }
        var contents = document.querySelectorAll('#' + prefix + ' .mti-content');
        for (var i = 0; i < contents.length; i++) {
          contents[i].classList.remove('mti-content-active');
          contents[i].classList.remove('mti-content-slide-left');
          contents[i].classList.remove('mti-content-slide-right');
        }
        var activeTab = document.getElementById(prefix + '-mtitab-' + idx);
        var activeContent = document.getElementById(prefix + '-mticontent-' + idx);
        if (activeTab) {
          activeTab.classList.add('mti-tab-active');
          var colors = ${JSON.stringify(TAB_COLORS)};
          var col = colors[idx % colors.length];
          activeTab.style.color = col;
        }
        if (activeContent) {
          activeContent.classList.add('mti-content-active');
          // Slide direction based on navigation
          var dir = idx > prevIdx ? 'left' : 'right';
          activeContent.classList.add('mti-content-slide-' + dir);
        }

        // Update sliding indicator
        updateIndicator();

        // Read tracking
        if(_readTracking) {
          _mtiTabRead.add(idx);
          var bar = document.getElementById(prefix + '-tabReadBar');
          var count = document.getElementById(prefix + '-tabReadCount');
          var badge = document.getElementById(prefix + '-tabReadBadge');
          var pct = (_mtiTabRead.size / _mtiTotal * 100);
          if(bar) bar.style.width = pct + '%';
          if(count) count.textContent = _mtiTabRead.size + '/' + _mtiTotal;

          // Mark read tabs with animated checkmark
          for (var i = 0; i < tabs.length; i++) {
            var checkEl = document.getElementById(prefix + '-mticheck-' + i);
            if(_mtiTabRead.has(i)) {
              tabs[i].classList.add('read');
              if(checkEl && !checkEl.classList.contains('shown')) {
                checkEl.classList.add('shown');
              }
            } else {
              tabs[i].classList.remove('read');
              if(checkEl) checkEl.classList.remove('shown');
            }
          }

          // Show completion badge at 100%
          if(badge && _mtiTabRead.size === _mtiTotal) {
            badge.style.display = 'inline-flex';
            badge.classList.add('mti-badge-pop');
          }

          // +3 points when all tabs viewed (once)
          if(_mtiTabRead.size === _mtiTotal && !_allViewedScored) {
            _allViewedScored = true;
            if(typeof addScore === 'function') addScore(3);
          }
        }
      };

      // Initial indicator position
      setTimeout(updateIndicator, 50);
      window.addEventListener('resize', updateIndicator);
    })();`;
  }

  // ═════════════════════════════════════════════════════════════
  // MODE B: Norma Tabs (special tab content for norma-type materials)
  // ═════════════════════════════════════════════════════════════
  let normaContentHTML = '';
  let normaJS = '';

  if (useNormaMode) {
    // Norma tab buttons
    const normaTabButtons = normaTabs.map((n, i) => {
      return `<div class="ntab${i === 0 ? ' active' : ''}" onclick="switchNorma_${esc(prefix)}(${i})" id="${esc(prefix)}-ntab-${i}">
        <span class="ntab-icon">${esc(n.icon)}</span>
        <span class="ntab-label">${esc(n.label)}</span>
        <span class="ntab-check" id="${esc(prefix)}-ntabcheck-${i}"></span>
      </div>`;
    }).join('');

    // Tabel accordion
    const tabelHTML = tabelAccordion.length > 0 ? `
    <div class="tabel-accord" id="${esc(prefix)}-tabelAccord">
      ${tabelAccordion.map((t, i) => `
      <div class="tabel-row" id="${esc(prefix)}-tabelRow-${i}">
        <div class="tabel-row-head" id="${esc(prefix)}-tabelHead-${i}" onclick="toggleTabel_${esc(prefix)}(${i})">
          <span style="font-size:1.3rem">${esc(t.icon)}</span>
          <span style="color:${esc(t.color)};font-weight:800">${esc(t.label)}</span>
          <span class="arrow">▼</span>
        </div>
        <div class="tabel-row-body" id="${esc(prefix)}-tabelBody-${i}">
          <div class="tabel-detail">
            ${t.details.map(d => `<div class="td-cell"><div class="td-cell-label">${esc(d.label)}</div><div class="td-cell-val">${esc(d.value)}</div></div>`).join('\n            ')}
          </div>
        </div>
      </div>`).join('\n    ')}
    </div>` : '';

    // Read tracking for norma tabs with gradient fill + completion badge
    const normaReadTrackingHTML = `
    <div id="${esc(prefix)}-normaProgress" class="mti-read-progress">
      <span class="mti-read-label">Sudah dibaca:</span>
      <div class="mti-read-bar-track">
        <div id="${esc(prefix)}-normaBar" class="mti-read-bar-fill"></div>
      </div>
      <span id="${esc(prefix)}-normaCount" class="mti-read-count">0/${esc(normaTabs.length)}</span>
      <span id="${esc(prefix)}-normaBadge" class="mti-read-badge" style="display:none">✅</span>
    </div>`;

    normaContentHTML = `
    <div class="norma-tabs" id="${esc(prefix)}-normaTabs">${normaTabButtons}</div>
    <div id="${esc(prefix)}-normaContent" class="mti-norma-content-area"></div>
    ${normaReadTrackingHTML}
    ${tabelHTML}`;

    // Serialize norma data for JS
    const normaDataJS = normaTabs.map(n => `{
      id:${JSON.stringify(n.id)},icon:${JSON.stringify(n.icon)},label:${JSON.stringify(n.label)},
      color:${JSON.stringify(n.color)},bg:${JSON.stringify(n.bg)},bc:${JSON.stringify(n.bc)},bg2:${JSON.stringify(n.bg2)},
      sumber:${JSON.stringify(n.sumber)},sifat:${JSON.stringify(n.sifat)},tujuan:${JSON.stringify(n.tujuan)},
      sanksiTipe:${JSON.stringify(n.sanksiTipe)},sanksiItems:${JSON.stringify(n.sanksiItems)},
      contoh:${JSON.stringify(n.contoh)},
      pelanggaran:${JSON.stringify(n.pelanggaran)}
    }`).join(',');

    normaJS = `
    (function(){
      var NORMA_DATA = [${normaDataJS}];
      var curNorma = 0;
      var normaRead = new Set();
      var _p = '${esc(prefix)}';
      var _allNormaScored = false;

      function renderNorma(animate) {
        document.querySelectorAll('#'+_p+' .ntab').forEach(function(t,i){
          t.classList.toggle('active',i===curNorma);
          t.classList.toggle('read',normaRead.has(i)&&i!==curNorma);
          t.style.background = i===curNorma ? NORMA_DATA[i].color : '';
          t.style.color = i===curNorma ? '#0e1c2f' : '';
          t.style.borderColor = i===curNorma ? 'transparent' : '';
          // Animated checkmark
          var chk = document.getElementById(_p+'-ntabcheck-'+i);
          if(normaRead.has(i) && chk) chk.classList.add('shown');
        });
        var d = NORMA_DATA[curNorma];
        var el = document.getElementById(_p+'-normaContent');
        if(!el) return;
        var card = '<div class="nk-card' + (animate ? ' mti-norma-card-enter' : '') + '" style="background:'+d.bg+';border:1px solid '+d.bc+'">' +
          '<div class="nk-header">' +
            '<div class="nk-icon" style="background:'+d.bg2+';border:2px solid '+d.bc+'">'+d.icon+'</div>' +
            '<div><div class="nk-label" style="color:'+d.color+'">'+d.label.toUpperCase()+'</div><div class="nk-title" style="color:'+d.color+'">'+d.label+'</div></div>' +
          '</div>' +
          '<div class="nk-row">' +
            '<div class="nk-box" style="background:'+d.bg2+'"><div class="nk-box-label" style="color:'+d.color+'">Sumber</div><div class="nk-box-val">'+d.sumber+'</div></div>' +
            '<div class="nk-box" style="background:'+d.bg2+'"><div class="nk-box-label" style="color:'+d.color+'">Sifat</div><div class="nk-box-val">'+d.sifat+'</div></div>' +
          '</div>' +
          '<div class="nk-box" style="background:'+d.bg2+';margin-top:10px"><div class="nk-box-label" style="color:'+d.color+'">Tujuan</div><div class="nk-box-val">'+d.tujuan+'</div></div>' +
          '<div class="nk-sanksi" style="background:'+d.bg2+';border-color:'+d.bc+';margin-top:10px">' +
            '<div class="nk-sanksi-title" style="color:'+d.color+'">'+d.sanksiTipe+'</div>' +
            d.sanksiItems.map(function(s){return '<div class="nk-sanksi-item"><div class="nk-sanksi-dot" style="background:'+d.color+'"></div><span>'+s+'</span></div>';}).join('') +
          '</div>' +
          '<div class="nk-contoh"><strong style="color:'+d.color+'">Contoh nyata:</strong> '+d.contoh+'</div>' +
          '<div class="nk-pelanggaran">' +
            '<div class="nk-pel-title">Contoh Pelanggaran &amp; Sanksinya</div>' +
            d.pelanggaran.map(function(p){return '<div class="nk-pel-item"><span style="font-size:1.1rem;flex-shrink:0">'+p.ikon+'</span><div><div style="font-weight:700">'+p.teks+'</div><div style="font-size:.76rem;color:var(--muted);margin-top:2px">Sanksi: '+p.sanksi+'</div></div></div>';}).join('') +
          '</div>' +
        '</div>';
        // Transition: fade out, swap, fade in
        if(animate && el.firstElementChild) {
          el.firstElementChild.classList.add('mti-norma-card-exit');
          setTimeout(function() {
            el.innerHTML = card;
          }, 180);
        } else {
          el.innerHTML = card;
        }
      }

      function updateNormaProgress() {
        var bar = document.getElementById(_p+'-normaBar');
        var count = document.getElementById(_p+'-normaCount');
        var badge = document.getElementById(_p+'-normaBadge');
        if(bar) bar.style.width = (normaRead.size / NORMA_DATA.length * 100) + '%';
        if(count) count.textContent = normaRead.size + '/' + NORMA_DATA.length;
        // Show completion badge at 100%
        if(badge && normaRead.size === NORMA_DATA.length) {
          badge.style.display = 'inline-flex';
          badge.classList.add('mti-badge-pop');
        }
        // +3 points when all norma tabs viewed (once)
        if(normaRead.size === NORMA_DATA.length && !_allNormaScored) {
          _allNormaScored = true;
          if(typeof addScore === 'function') addScore(3);
        }
      }

      function highlightTabel(i) {
        NORMA_DATA.forEach(function(_,j){
          var row = document.getElementById(_p+'-tabelRow-'+j);
          var body = document.getElementById(_p+'-tabelBody-'+j);
          var head = document.getElementById(_p+'-tabelHead-'+j);
          if(row) row.classList.toggle('hl',j===i);
          if(j===i){
            if(body) body.classList.add('tabel-body-open');
            if(head) head.classList.add('open');
          } else {
            if(body) body.classList.remove('tabel-body-open');
            if(head) head.classList.remove('open');
          }
        });
      }

      window['switchNorma_'+_p] = function(i) {
        var animate = curNorma !== i;
        curNorma = i;
        normaRead.add(i);
        renderNorma(animate);
        updateNormaProgress();
        highlightTabel(i);
      };

      window['toggleTabel_'+_p] = function(i) {
        var body = document.getElementById(_p+'-tabelBody-'+i);
        var head = document.getElementById(_p+'-tabelHead-'+i);
        var open = body && !body.classList.contains('tabel-body-open');
        NORMA_DATA.forEach(function(_,j){
          var b = document.getElementById(_p+'-tabelBody-'+j);
          var h = document.getElementById(_p+'-tabelHead-'+j);
          var r = document.getElementById(_p+'-tabelRow-'+j);
          if(b) b.classList.remove('tabel-body-open');
          if(h) h.classList.remove('open');
          if(r) r.classList.remove('hl');
        });
        if(open && body && head) {
          body.classList.add('tabel-body-open');
          head.classList.add('open');
          var row = document.getElementById(_p+'-tabelRow-'+i);
          if(row) row.classList.add('hl');
          window['switchNorma_'+_p](i);
        }
      };

      // Initialize
      renderNorma(false);
      updateNormaProgress();
    })();`;
  }

  // ── Empty state ───────────────────────────────────────────────
  const emptyState = (!useNormaMode && !tabs.length)
    ? '<p style="color:var(--muted);font-size:.82rem;margin-top:12px">Tab materi belum diisi.</p>'
    : '';

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Materi">
  <div class="main">
    <!-- Title card with decorative gradient -->
    <div class="card mti-title-card">
      <div class="mti-title-gradient"></div>
      <div class="h2">📑 <span class="hl">Materi</span> Pembelajaran</div>
      <p class="sub mt8">${esc(title)}</p>
    </div>

    <!-- Sub-components above tabs -->
    <div class="mti-sub-anim">${bannersHTML}</div>
    <div class="mti-sub-anim">${defBoxesHTML}</div>
    <div class="mti-sub-anim">${cardGridHTML}</div>

    <!-- Tab content area -->
    <div class="card mt14 mti-sub-anim" id="${esc(prefix)}">
      ${tabsContentHTML}
      ${normaContentHTML}
      ${emptyState}
      <!-- Celebration overlay -->
      <div id="${esc(prefix)}-mtiCelebrate" class="mti-celebrate">Semua dibaca! 🎉</div>
    </div>

    <!-- Diskusi box -->
    <div class="mti-sub-anim">${diskusiBoxHTML}</div>

    <div class="btn-row btn-center mt20 mti-sub-anim">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
  <style>
    /* ═══════════════════════════════════════════════════════════
       ENTRANCE ANIMATIONS — staggered fade-in from bottom
       ═══════════════════════════════════════════════════════════ */
    @keyframes mtiFadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes mtiSlideInLeft {
      from { opacity: 0; transform: translateX(24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes mtiSlideInRight {
      from { opacity: 0; transform: translateX(-24px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes mtiCheckPop {
      0%   { transform: scale(0); }
      60%  { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    @keyframes mtiBadgePop {
      0%   { transform: scale(0) rotate(-12deg); }
      50%  { transform: scale(1.2) rotate(4deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    @keyframes mtiCelebratePop {
      0%   { opacity: 0; transform: scale(.6) translateY(10px); }
      50%  { transform: scale(1.08) translateY(-2px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes mtiGlowPulse {
      0%, 100% { box-shadow: 0 0 0 0 transparent; }
      50%      { box-shadow: 0 0 12px 2px var(--glow-color, rgba(52,211,153,.3)); }
    }
    @keyframes mtiNormaCardEnter {
      from { opacity: 0; transform: translateY(12px) scale(.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes mtiNormaCardExit {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to   { opacity: 0; transform: translateY(-8px) scale(.97); }
    }

    /* ── Base: elements hidden until .mti-active triggers them ── */
    .mti-title-card,
    .mti-sub-anim,
    .mti-tab-row,
    .mti-content-area {
      opacity: 0;
      transform: translateY(18px);
    }

    /* ── When active, play staggered entrance ── */
    .mti-active .mti-title-card {
      animation: mtiFadeUp .45s ease-out forwards;
      animation-delay: 0s;
    }
    .mti-active .mti-sub-anim:nth-child(1) { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .08s; }
    .mti-active .mti-sub-anim:nth-child(2) { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .16s; }
    .mti-active .mti-sub-anim:nth-child(3) { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .24s; }
    .mti-active .mti-sub-anim:nth-child(4) { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .32s; }
    .mti-active .mti-sub-anim:nth-child(5) { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .40s; }
    .mti-active .mti-tab-row  { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .16s; }
    .mti-active .mti-content-area { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .24s; }
    .mti-active .norma-tabs { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .16s; }
    .mti-active .mti-norma-content-area { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .24s; }
    .mti-active .mti-read-progress { animation: mtiFadeUp .45s ease-out forwards; animation-delay: .32s; }

    /* ═══════════════════════════════════════════════════════════
       TITLE CARD — decorative gradient accent
       ═══════════════════════════════════════════════════════════ */
    .mti-title-card { position: relative; overflow: hidden; }
    .mti-title-gradient {
      position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, var(--y), var(--c), var(--g), var(--p), var(--r), var(--o));
      border-radius: 4px 4px 0 0;
    }

    /* ═══════════════════════════════════════════════════════════
       TAB ROW — with sliding indicator
       ═══════════════════════════════════════════════════════════ */
    .mti-tab-row{
      display:flex;gap:4px;border-bottom:2px solid var(--border);margin:16px 0 14px;
      overflow-x:auto;padding-bottom:0;position:relative;
    }
    .mti-tab{
      padding:8px 16px;font-size:.78rem;font-weight:800;cursor:pointer;color:var(--muted);
      border:none;border-bottom:2px solid transparent;margin-bottom:-2px;background:none;
      font-family:'Nunito',sans-serif;white-space:nowrap;transition:all .25s ease;
      display:flex;align-items:center;gap:6px;position:relative;z-index:1;
    }
    .mti-tab:hover{color:var(--text);}
    .mti-tab-icon{font-size:1.1rem;}
    .mti-tab-label{font-size:.78rem;}
    .mti-tab.mti-tab-active{
      font-weight:900;
      text-shadow: 0 0 14px currentColor;
    }

    /* ── Animated checkmark on read tabs ── */
    .mti-tab-check{
      display:none;width:14px;height:14px;border-radius:50%;background:var(--g);
      color:#0e1c2f;font-size:.58rem;align-items:center;justify-content:center;
      font-weight:900;margin-left:2px;flex-shrink:0;
    }
    .mti-tab.read .mti-tab-check{display:flex;}
    .mti-tab-check.shown{animation: mtiCheckPop .35s ease-out forwards;}
    /* Legacy .read::after hidden since we use .mti-tab-check now */
    .mti-tab.read::after{display:none;}

    /* ── Sliding indicator bar ── */
    .mti-tab-indicator{
      position:absolute;bottom:-2px;height:3px;border-radius:3px;
      transition: left .3s cubic-bezier(.4,0,.2,1), width .3s cubic-bezier(.4,0,.2,1), background .3s ease;
      z-index:2;border-radius:3px 3px 0 0;
    }

    /* ── Active tab glow ── */
    .mti-tab.mti-tab-active::before{
      content:'';position:absolute;bottom:-1px;left:10%;right:10%;height:6px;
      border-radius:50%;filter:blur(6px);opacity:.5;
      background:currentColor;z-index:-1;
    }

    /* ═══════════════════════════════════════════════════════════
       TAB CONTENT — slide/fade transitions
       ═══════════════════════════════════════════════════════════ */
    .mti-content-area{position:relative;overflow:hidden;}
    .mti-content{
      display:none;background:rgba(255,255,255,.02);border:1px solid var(--border);
      border-radius:14px;padding:18px;
    }
    .mti-content.mti-content-active{display:block;animation: mtiFadeUp .35s ease-out forwards;}
    .mti-content.mti-content-slide-left{animation: mtiSlideInLeft .35s ease-out forwards;}
    .mti-content.mti-content-slide-right{animation: mtiSlideInRight .35s ease-out forwards;}
    .mti-content-header{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
    .mti-content-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;}
    .mti-content-title{font-weight:900;font-size:1rem;}
    .mti-content-body{font-size:.86rem;color:var(--muted);line-height:1.8;}

    /* ═══════════════════════════════════════════════════════════
       READ TRACKING — gradient progress bar + badge
       ═══════════════════════════════════════════════════════════ */
    .mti-read-progress{
      margin-top:12px;font-size:.79rem;font-weight:700;color:var(--muted);
      display:flex;align-items:center;gap:8px;
    }
    .mti-read-label{flex-shrink:0;}
    .mti-read-bar-track{
      flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;
    }
    .mti-read-bar-fill{
      height:100%;border-radius:99px;
      background:linear-gradient(90deg, var(--c), var(--g));
      transition:width .5s cubic-bezier(.4,0,.2,1);
      width:0%;position:relative;
    }
    .mti-read-bar-fill::after{
      content:'';position:absolute;right:0;top:0;bottom:0;width:20px;
      background:linear-gradient(90deg, transparent, rgba(255,255,255,.25));
      border-radius:0 99px 99px 0;
    }
    .mti-read-count{flex-shrink:0;min-width:28px;text-align:right;}
    .mti-read-badge{
      display:none;width:20px;height:20px;border-radius:50%;
      background:var(--g);color:#0e1c2f;font-size:.7rem;
      align-items:center;justify-content:center;flex-shrink:0;
    }
    .mti-badge-pop{animation: mtiBadgePop .45s ease-out forwards;}

    /* ═══════════════════════════════════════════════════════════
       CELEBRATION — "Semua dibaca! 🎉"
       ═══════════════════════════════════════════════════════════ */
    .mti-celebrate{
      display:none;margin-top:12px;padding:10px 18px;border-radius:12px;
      background:linear-gradient(135deg, rgba(52,211,153,.15), rgba(62,207,207,.15));
      border:1px solid rgba(52,211,153,.3);text-align:center;
      font-weight:900;font-size:.9rem;color:var(--g);
    }
    .mti-celebrate.mti-celebrate-show{
      display:block;animation: mtiCelebratePop .5s ease-out forwards;
    }

    /* ═══════════════════════════════════════════════════════════
       NORMA TABS — enhanced with glow + animated card
       ═══════════════════════════════════════════════════════════ */
    .norma-tabs{
      display:flex;gap:6px;flex-wrap:wrap;margin:14px 0;
    }
    .ntab{
      padding:8px 14px;border-radius:10px;border:1px solid var(--border);
      font-size:.78rem;font-weight:800;cursor:pointer;color:var(--muted);
      background:none;transition:all .25s ease;display:flex;align-items:center;gap:5px;
      font-family:'Nunito',sans-serif;
    }
    .ntab:hover{border-color:rgba(255,255,255,.15);}
    .ntab.active{
      border-color:transparent;transform:scale(1.03);
      box-shadow: 0 0 16px -4px currentColor;
    }
    .ntab-icon{font-size:1.05rem;}
    .ntab-label{font-size:.78rem;}
    .ntab-check{
      display:none;width:13px;height:13px;border-radius:50%;background:var(--g);
      color:#0e1c2f;font-size:.5rem;align-items:center;justify-content:center;
      font-weight:900;margin-left:2px;flex-shrink:0;
    }
    .ntab.read .ntab-check{display:flex;}
    .ntab-check.shown{animation: mtiCheckPop .35s ease-out forwards;}

    /* ── Norma card entrance + glow ── */
    .nk-card{
      border-radius:14px;padding:18px;margin-top:4px;position:relative;
      transition: box-shadow .3s ease;
    }
    .nk-card:hover{
      box-shadow: 0 0 20px -6px var(--glow-color, rgba(52,211,153,.15));
    }
    .mti-norma-card-enter{animation: mtiNormaCardEnter .35s ease-out forwards;}
    .mti-norma-card-exit{animation: mtiNormaCardExit .18s ease-in forwards;}
    /* Subtle border glow on norma card */
    .nk-card::before{
      content:'';position:absolute;inset:-1px;border-radius:15px;z-index:-1;
      background:linear-gradient(135deg, rgba(52,211,153,.2), rgba(62,207,207,.2));
      opacity:0;transition:opacity .4s ease;
    }
    .nk-card:hover::before{opacity:1;}

    /* ═══════════════════════════════════════════════════════════
       TABEL ACCORDION — smooth height animation
       ═══════════════════════════════════════════════════════════ */
    .tabel-accord{display:flex;flex-direction:column;gap:6px;margin-top:14px;}
    .tabel-row{
      background:var(--card);border:1px solid var(--border);border-radius:10px;
      overflow:hidden;transition:border-color .25s ease, box-shadow .25s ease;
    }
    .tabel-row.hl{
      border-color:rgba(255,255,255,.12);
      box-shadow:0 0 12px -4px rgba(52,211,153,.2);
    }
    .tabel-row-head{
      padding:10px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;
      transition:background .15s ease;
    }
    .tabel-row-head:hover{background:rgba(255,255,255,.03);}
    .tabel-row-head .arrow{
      margin-left:auto;font-size:.7rem;color:var(--muted);
      transition:transform .3s cubic-bezier(.4,0,.2,1);
    }
    .tabel-row-head.open .arrow{transform:rotate(180deg);}
    .tabel-row-body{
      max-height:0;overflow:hidden;opacity:0;
      transition:max-height .4s cubic-bezier(.4,0,.2,1), opacity .3s ease, padding .3s ease;
      padding:0 14px;
    }
    .tabel-row-body.tabel-body-open{
      max-height:500px;opacity:1;padding:0 14px 12px;
    }
    .tabel-detail{display:flex;flex-direction:column;gap:6px;}
    .td-cell{
      display:flex;align-items:baseline;gap:8px;font-size:.82rem;
      padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);
    }
    .td-cell:last-child{border-bottom:none;}
    .td-cell-label{font-weight:800;color:var(--text);min-width:80px;flex-shrink:0;font-size:.78rem;}
    .td-cell-val{color:var(--muted);line-height:1.5;}
  </style>
  <script>
    ${tabsJS}
    ${normaJS}

    // ── Screen Activation Hook ────────────────────────────────
    (function(){
      var _sid = '${esc(screenId)}';
      var _el = document.getElementById(_sid);
      if(!_el) return;

      function activate() {
        _el.classList.add('mti-active');
        // Check if all tabs viewed for celebration
        checkCelebration();
      }

      function checkCelebration() {
        var celebEl = document.getElementById('${esc(prefix)}-mtiCelebrate');
        if(!celebEl) return;
        // For regular tabs mode
        var tabRow = document.getElementById('${esc(prefix)}-mtiTabRow');
        if(tabRow) {
          var readTabs = tabRow.querySelectorAll('.mti-tab.read');
          var allTabs = tabRow.querySelectorAll('.mti-tab');
          if(allTabs.length > 0 && readTabs.length === allTabs.length) {
            celebEl.classList.add('mti-celebrate-show');
          }
        }
        // For norma tabs mode
        var normaTabs = document.getElementById('${esc(prefix)}-normaTabs');
        if(normaTabs) {
          var readNorma = normaTabs.querySelectorAll('.ntab.read');
          var allNorma = normaTabs.querySelectorAll('.ntab');
          if(allNorma.length > 0 && readNorma.length === allNorma.length) {
            celebEl.classList.add('mti-celebrate-show');
          }
        }
      }

      // Listen for screenActivate event
      _el.addEventListener('screenActivate', function() {
        activate();
      });

      // Check initial state — if screen is already active on load
      if(_el.classList.contains('active')) {
        // Small delay to ensure DOM is ready
        setTimeout(activate, 60);
      }

      // Periodic celebration check (since tabs are tracked incrementally)
      setInterval(checkCelebration, 800);
    })();
  </script>
</div>`;
}
