// ═══════════════════════════════════════════════════════════════
// TUJUAN.TS — Tujuan Pembelajaran screen template for MPI export
// Generates a standalone TP page showing learning objectives
// with colored number badges, navbar, and navigation buttons.
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

  const tpColors = ['var(--y)', 'var(--c)', 'var(--g)', 'var(--p)', 'var(--r)', 'var(--o)'];

  const itemsHtml = tpItems.length
    ? tpItems.map((t, i) => {
        const col = t.color || tpColors[i % tpColors.length];
        return `<div class="tp-full-item" style="border-color:${esc(col)}44;background:${esc(col)}0a">
      <div class="tp-full-num" style="background:${esc(col)}22;color:${esc(col)}">${i + 1}</div>
      <div>
        <div class="tp-full-verb" style="color:${esc(col)}">${esc(t.verb)}</div>
        <div class="tp-full-desc">${esc(t.desc)}</div>
        <span style="font-size:.68rem;font-weight:900;color:${esc(col)};background:${esc(col)}18;padding:1px 8px;border-radius:99px;display:inline-block;margin-top:4px">&rarr; Pertemuan ${t.pertemuan || 1}</span>
      </div>
    </div>`;
      }).join('')
    : '<p style="color:var(--muted);font-size:.82rem">Tujuan Pembelajaran belum diisi.</p>';

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">🎯 Tujuan</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:25%"></div></div>
    <span class="nav-score">0 ⭐</span>
  </nav>
  <div class="main">
    <div class="card">
      <div class="h2">🎯 <span class="hl">Tujuan</span> Pembelajaran</div>
      <p class="sub mt8">${esc(title)}</p>
      <div style="margin-top:14px">${itemsHtml}</div>
    </div>
    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
</div>`;
}
