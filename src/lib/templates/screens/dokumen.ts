// ═══════════════════════════════════════════════════════════════
// DOKUMEN.TS — Dokumen (CP/TP/ATP) screen template for MPI export
// Generates the full CP + TP + ATP tabbed document screen with
// Alur Pembelajaran and Tujuan Pertemuan sections.
// ═══════════════════════════════════════════════════════════════

import type { DokumenSlotData } from '../engine/slot-types';

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

// ── Sub-renderers ─────────────────────────────────────────────

function renderCPTab(data: DokumenSlotData): string {
  const cp = data.cp;
  const profilItems = (cp.profil || ['Beriman & Bertakwa', 'Bernalar Kritis', 'Bergotong Royong'])
    .map(esc)
    .join(' &middot; ');

  return `<div class="ktab-content active" id="${esc(data._templateId)}-kcp">
    <div style="font-size:.8rem;color:var(--muted);line-height:1.7;margin-bottom:10px">
      <strong style="color:var(--text)">Elemen:</strong> ${esc(cp.elemen || '-')} &middot;
      <strong style="color:var(--text)">Sub-Elemen:</strong> ${esc(cp.subElemen || '-')}
    </div>
    <div class="def-box">${esc(cp.capaianFase || 'Capaian pembelajaran belum diisi.')}</div>
    <div style="background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:12px;padding:12px;font-size:.82rem;line-height:1.6">
      <strong style="color:var(--g)">🔗 Profil Pelajar Pancasila:</strong><br>
      <span style="color:var(--muted)">${profilItems}</span>
    </div>
  </div>`;
}

function renderTPTab(data: DokumenSlotData): string {
  const tpItems = data.tp || [];

  if (!tpItems.length) {
    return `<div class="ktab-content" id="${esc(data._templateId)}-ktp">
      <p style="color:var(--muted);font-size:.82rem">Tujuan Pembelajaran belum diisi.</p>
    </div>`;
  }

  const itemsHtml = tpItems.map((t, i) => {
    const col = t.color || 'var(--y)';
    return `<div class="tp-full-item" style="border-color:${esc(col)}44;background:${esc(col)}0a">
      <div class="tp-full-num" style="background:${esc(col)}22;color:${esc(col)}">${i + 1}</div>
      <div>
        <div class="tp-full-verb" style="color:${esc(col)}">${esc(t.verb)}</div>
        <div class="tp-full-desc">${esc(t.desc)}</div>
        <span style="font-size:.68rem;font-weight:900;color:${esc(col)};background:${esc(col)}18;padding:1px 8px;border-radius:99px;display:inline-block;margin-top:4px">&rarr; Pertemuan ${t.pertemuan || 1}</span>
      </div>
    </div>`;
  }).join('');

  return `<div class="ktab-content" id="${esc(data._templateId)}-ktp">${itemsHtml}</div>`;
}

function renderATPTab(data: DokumenSlotData): string {
  const pertemuan = data.atp?.pertemuan || [];

  if (!pertemuan.length) {
    return `<div class="ktab-content" id="${esc(data._templateId)}-katp">
      <p style="color:var(--muted);font-size:.82rem">ATP belum diisi.</p>
    </div>`;
  }

  const cardsHtml = pertemuan.map((p, i) => `
    <div class="atp-p-card${i === 0 ? ' active-p' : ''}">
      <div class="atp-p-head">
        <span class="atp-p-badge" style="background:rgba(245,200,66,.2);color:#f5c842">${i === 0 ? '📍 ' : '→ '}Pertemuan ${i + 1}</span>
        <span style="font-size:.72rem;color:#5a7499">${esc(p.durasi || '')}</span>
        ${i === 0 ? '<span style="margin-left:auto;font-size:.72rem;font-weight:800;color:#34d399">✅ Sekarang</span>' : ''}
      </div>
      <div class="atp-p-title">${esc(p.judul || '')}</div>
      <div class="atp-p-tp">📚 ${esc(p.tp || '')}</div>
      <div class="atp-p-kegiatan">${esc(p.kegiatan || '')}</div>
      <span class="atp-p-penilaian">📋 ${esc(p.penilaian || '')}</span>
    </div>`).join('');

  return `<div class="ktab-content" id="${esc(data._templateId)}-katp">
    <div class="atp-pertemuan-grid">${cardsHtml}</div>
  </div>`;
}

function renderAlurSection(data: DokumenSlotData): string {
  const alur = data.alur || [];
  if (!alur.length) return '';

  const faseColors: Record<string, string> = {
    Pendahuluan: '#f5c842',
    Inti: '#38d9d9',
    Penutup: '#34d399',
  };

  const stepsHtml = alur.map(s => {
    const col = faseColors[s.fase] || '#a78bfa';
    return `<div class="alur-step">
      <span class="alur-jp" style="background:${col}22;color:${col}">${esc(s.fase)}</span>
      <span class="alur-dur">${esc(s.durasi || '')}</span>
      <div class="alur-txt"><strong>${esc(s.judul || '')}</strong>${s.deskripsi ? ' — ' + esc(s.deskripsi) : ''}</div>
    </div>`;
  }).join('');

  return `<div class="card mt14">
    <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">🗓️ Alur Pembelajaran Hari Ini</div>
    <div class="alur-steps">${stepsHtml}</div>
  </div>`;
}

function renderTujuanSection(data: DokumenSlotData): string {
  const tp = data.tp || [];
  const firstMeetingTp = tp.filter(t => (t.pertemuan || 1) === 1);

  if (!firstMeetingTp.length) return '';

  const itemsHtml = firstMeetingTp.map((t, i) => {
    const col = t.color || 'var(--y)';
    return `<div class="tp-item">
      <div class="tp-num" style="background:${esc(col)}22;color:${esc(col)}">${i + 1}</div>
      <div><div class="tp-verb">${esc(t.verb)}</div><div class="tp-desc">${esc(t.desc)}</div></div>
    </div>`;
  }).join('');

  return `<div class="card mt14">
    <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">🎯 Tujuan Pertemuan Ini</div>
    <div class="tp-list">${itemsHtml}</div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// renderDokumenHTML
// ═══════════════════════════════════════════════════════════════
/**
 * Generate the Dokumen (CP/TP/ATP) screen HTML.
 *
 * @param data     - DokumenSlotData with cp, tp, atp, alur
 * @param screenId - DOM id for this screen (e.g. 's-cp')
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderDokumenHTML(data: DokumenSlotData, screenId: string): string {
  const prefix = data._templateId;

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">📋 Dokumen</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:16%"></div></div>
    <span class="nav-score">0 ⭐</span>
  </nav>
  <div class="main">
    <div class="card">
      <div class="h2">📋 <span class="hl">Dokumen</span> Pembelajaran</div>
      <div class="ktab-row">
        <div class="ktab active" onclick="switchKtab('${esc(prefix)}-kcp',this)">Capaian</div>
        <div class="ktab" onclick="switchKtab('${esc(prefix)}-ktp',this)">Tujuan Pembelajaran</div>
        <div class="ktab" onclick="switchKtab('${esc(prefix)}-katp',this)">ATP</div>
      </div>
      ${renderCPTab(data)}
      ${renderTPTab(data)}
      ${renderATPTab(data)}
    </div>
    ${renderAlurSection(data)}
    ${renderTujuanSection(data)}
    <div class="btn-row btn-center">
      <button class="btn btn-y" onclick="goNextScreen()">Mulai Pembelajaran →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
</div>`;
}
