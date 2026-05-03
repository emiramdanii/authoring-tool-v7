// ═══════════════════════════════════════════════════════════════
// COVER.TS — Cover screen template for MPI student export
// Generates the landing / splash screen with icon, title, chips,
// and a "Mulai Belajar" call-to-action button.
// ═══════════════════════════════════════════════════════════════

import type { CoverSlotData } from '../engine/slot-types';

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
// renderCoverHTML
// ═══════════════════════════════════════════════════════════════
/**
 * Generate the Cover screen HTML.
 *
 * @param data     - CoverSlotData containing icon, title, subtitle, mapel, kelas
 * @param screenId - DOM id for this screen (e.g. 's-cover')
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderCoverHTML(data: CoverSlotData, screenId: string): string {
  const icon = data.icon || '📚';
  const title = data.title || 'Media Pembelajaran';
  const subtitle = data.subtitle || '';
  const mapel = data.mapel || 'PPKn';
  const kelas = data.kelas || 'VII';

  return `<div class="screen" id="${esc(screenId)}" style="background:radial-gradient(ellipse 90% 60% at 50% 0%,rgba(249,193,46,.18),transparent 60%),linear-gradient(180deg,#0e1c2f,#09121f)">
  <div class="cover-wrap">
    <div class="cover-icon">${esc(icon)}</div>
    <div class="cover-chips">
      <span class="chip" style="background:rgba(249,193,46,.15);color:var(--y)">${esc(mapel)} ${esc(kelas)}</span>
      <span class="chip" style="background:rgba(62,207,207,.15);color:var(--c)">2 × 40 menit</span>
      <span class="chip" style="background:rgba(52,211,153,.15);color:var(--g)">Kurikulum Merdeka</span>
    </div>
    <div class="cover-title">${esc(title)}</div>
    <p class="sub" style="max-width:480px;margin:0 auto 24px">${esc(subtitle)}</p>
    <button class="btn btn-y" onclick="goNextScreen()">Mulai Belajar →</button>
  </div>
</div>`;
}
