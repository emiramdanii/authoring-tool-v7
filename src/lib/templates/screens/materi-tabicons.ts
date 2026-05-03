// ═══════════════════════════════════════════════════════════════
// MATERI-TABICONS.TS — Materi Tab Icons screen template for MPI export
// Generates a materi screen with tab navigation where each tab
// has an icon and label; clicking a tab reveals its content.
// ═══════════════════════════════════════════════════════════════

import type { MateriTabIconsSlotData } from '../engine/slot-types';

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
// renderMateriTabIconsHTML
// ═══════════════════════════════════════════════════════════════
/**
 * Generate the Materi Tab Icons screen HTML.
 *
 * @param data     - MateriTabIconsSlotData with title and tabs[]
 * @param screenId - DOM id for this screen (e.g. 's-materi-tabicons')
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderMateriTabIconsHTML(data: MateriTabIconsSlotData, screenId: string): string {
  const title = data.title || 'Materi Pembelajaran';
  const tabs = data.tabs || [];
  const prefix = screenId;

  const tabAccentColors = ['var(--y)', 'var(--c)', 'var(--g)', 'var(--p)', 'var(--r)', 'var(--o)'];

  const tabButtonsHtml = tabs.map((t, i) => {
    const col = tabAccentColors[i % tabAccentColors.length];
    const activeStyle = i === 0
      ? `color:${col};border-bottom-color:${col};`
      : '';
    return `<button class="mti-tab${i === 0 ? ' mti-tab-active' : ''}"
      onclick="switchMtiTab('${esc(prefix)}',${i})"
      id="${esc(prefix)}-mtitab-${i}"
      style="${activeStyle}">
      <span class="mti-tab-icon">${esc(t.icon || '📌')}</span>
      <span class="mti-tab-label">${esc(t.label || 'Tab ' + (i + 1))}</span>
    </button>`;
  }).join('');

  const tabContentsHtml = tabs.map((t, i) => {
    const col = tabAccentColors[i % tabAccentColors.length];
    return `<div class="mti-content${i === 0 ? ' mti-content-active' : ''}"
      id="${esc(prefix)}-mticontent-${i}"
      style="${i === 0 ? `border-color:${col}22;` : `border-color:${col}22;`}">
      <div class="mti-content-header">
        <span class="mti-content-icon" style="background:${col}18;color:${col}">${esc(t.icon || '📌')}</span>
        <span class="mti-content-title" style="color:${col}">${esc(t.label || 'Tab ' + (i + 1))}</span>
      </div>
      <div class="mti-content-body">${esc(t.content || 'Konten belum diisi.')}</div>
    </div>`;
  }).join('');

  const emptyState = !tabs.length
    ? '<p style="color:var(--muted);font-size:.82rem;margin-top:12px">Tab materi belum diisi.</p>'
    : '';

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">📑 Materi</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:50%"></div></div>
    <span class="nav-score">0 ⭐</span>
  </nav>
  <div class="main">
    <div class="card">
      <div class="h2">📑 <span class="hl">Materi</span> Pembelajaran</div>
      <p class="sub mt8">${esc(title)}</p>
      <div class="mti-tab-row">${tabButtonsHtml}</div>
      ${tabContentsHtml}
      ${emptyState}
    </div>
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
  <style>
    .mti-tab-row{display:flex;gap:4px;border-bottom:2px solid var(--border);margin:16px 0 14px;overflow-x:auto;padding-bottom:0;}
    .mti-tab{padding:8px 16px;font-size:.78rem;font-weight:800;cursor:pointer;color:var(--muted);border:none;border-bottom:2px solid transparent;margin-bottom:-2px;background:none;font-family:'Nunito',sans-serif;white-space:nowrap;transition:all .2s;display:flex;align-items:center;gap:6px;}
    .mti-tab:hover{color:var(--text);}
    .mti-tab-icon{font-size:1.1rem;}
    .mti-tab-label{font-size:.78rem;}
    .mti-tab.mti-tab-active{font-weight:900;}
    .mti-content{display:none;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:14px;padding:18px;animation:fadeIn .3s ease;}
    .mti-content.mti-content-active{display:block;}
    .mti-content-header{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
    .mti-content-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;}
    .mti-content-title{font-weight:900;font-size:1rem;}
    .mti-content-body{font-size:.86rem;color:var(--muted);line-height:1.8;}
  </style>
  <script>
    function switchMtiTab(prefix, idx) {
      var tabs = document.querySelectorAll('#' + prefix + ' .mti-tab');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('mti-tab-active');
        tabs[i].style.color = '';
        tabs[i].style.borderBottomColor = '';
      }
      var contents = document.querySelectorAll('#' + prefix + ' .mti-content');
      for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('mti-content-active');
      }
      var activeTab = document.getElementById(prefix + '-mtitab-' + idx);
      var activeContent = document.getElementById(prefix + '-mticontent-' + idx);
      if (activeTab) {
        activeTab.classList.add('mti-tab-active');
        var colors = ['#f9c12e','#3ecfcf','#34d399','#a78bfa','#ff6b6b','#fb923c'];
        var col = colors[idx % colors.length];
        activeTab.style.color = col;
        activeTab.style.borderBottomColor = col;
      }
      if (activeContent) activeContent.classList.add('mti-content-active');
    }
  </script>
</div>`;
}
