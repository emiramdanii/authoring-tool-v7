// ═══════════════════════════════════════════════════════════════
// COVER.TS — Cover screen template for MPI student export
// Generates a beautiful landing screen matching preset quality:
// - Floating icon with pulse animation
// - Subject/class/kurikulum line
// - Title with highlight and staggered entrance
// - Descriptive subtitle
// - Colored chips (TP, activities, games, etc.)
// - Duration badge
// - CTA button with glow effect
// - Background particle orbs
// ═══════════════════════════════════════════════════════════════

import type { CoverSlotData } from '../engine/slot-types';
import { esc } from '../engine/esc';

// ═══════════════════════════════════════════════════════════════
// renderCoverHTML
// ═══════════════════════════════════════════════════════════════
export function renderCoverHTML(data: CoverSlotData, screenId: string): string {
  const icon = data.icon || '📚';
  const title = data.title || 'Media Pembelajaran';
  const subtitle = data.subtitle || '';
  const mapel = data.mapel || 'PPKn';
  const kelas = data.kelas || 'VII';
  const pertemuan = data.pertemuan || '';
  const bab = data.bab || '';
  const durasi = data.durasi || '80';
  const fase = data.fase || 'D';
  const elemen = data.elemen || '';
  const chips = data.chips || [];
  const ctaText = data.ctaText || 'Mulai Pembelajaran';
  const accentVar = data.accentVar || '--y'; // which CSS var to use as accent

  // Build chips HTML
  const chipColors = [
    { bg: 'rgba(249,193,46,.15)', color: 'var(--y)' },
    { bg: 'rgba(62,207,207,.15)', color: 'var(--c)' },
    { bg: 'rgba(52,211,153,.15)', color: 'var(--g)' },
    { bg: 'rgba(167,139,250,.15)', color: 'var(--p)' },
    { bg: 'rgba(255,107,107,.15)', color: 'var(--r)' },
    { bg: 'rgba(251,146,60,.15)', color: 'var(--o)' },
  ];

  // Auto-generate chips from data if not provided — only include non-empty values
  const autoChips: {icon: string; label: string}[] = [];
  if (mapel || kelas) autoChips.push({ icon: '📋', label: `${mapel} ${kelas}`.trim() });
  if (durasi) autoChips.push({ icon: '⏱️', label: `${durasi} Menit` });
  if (fase) autoChips.push({ icon: '🎯', label: `Fase ${fase}` });
  if (elemen) autoChips.push({ icon: '📚', label: `Elemen: ${elemen}` });
  if (autoChips.length === 0) autoChips.push({ icon: '📋', label: 'Kurikulum Merdeka' });

  const chipsHTML = chips.length > 0
    ? chips.map((c, i) => {
        const col = chipColors[i % chipColors.length];
        return `<span class="cv-chip" style="background:${col.bg};color:${col.color};animation-delay:${0.6 + i * 0.1}s">${esc(c.icon || '')} ${esc(c.label)}</span>`;
      }).join('\n      ')
    : autoChips.map((c, i) => {
        const col = chipColors[i % chipColors.length];
        return `<span class="cv-chip" style="background:${col.bg};color:${col.color};animation-delay:${0.6 + i * 0.1}s">${esc(c.icon)} ${esc(c.label)}</span>`;
      }).join('\n      ');

  // Build title with optional bab/pertemuan prefix
  const titlePrefix = bab || pertemuan
    ? `<span class="cv-title-prefix" style="color:var(${esc(accentVar)})">${bab ? esc(bab) : ''}${bab && pertemuan ? ' — ' : ''}${pertemuan ? esc(pertemuan) : ''}</span><br>`
    : '';

  // Build info badge
  const infoBadge = durasi || fase || elemen
    ? `<div class="cv-info-badge" style="animation-delay:1s">
      ${durasi ? `⏱️ ${esc(durasi)} Menit` : ''}${durasi && fase ? ' &nbsp;|&nbsp; ' : ''}${fase ? `🎯 Fase ${esc(fase)}` : ''}${fase && elemen ? ' &nbsp;|&nbsp; ' : ''}${elemen ? `📚 Elemen: ${esc(elemen)}` : ''}
    </div>`
    : '';

  // Determine accent gradient for background
  const accentBgMap: Record<string, string> = {
    '--y': 'rgba(249,193,46,.18)',
    '--c': 'rgba(62,207,207,.18)',
    '--g': 'rgba(52,211,153,.18)',
    '--p': 'rgba(167,139,250,.18)',
    '--r': 'rgba(255,107,107,.18)',
    '--o': 'rgba(251,146,60,.18)',
  };
  const accentBg = accentBgMap[accentVar] || accentBgMap['--y'];

  // Accent glow color for orb
  const accentOrbMap: Record<string, string> = {
    '--y': '#f9c12e',
    '--c': '#3ecfcf',
    '--g': '#34d399',
    '--p': '#a78bfa',
    '--r': '#ff6b6b',
    '--o': '#fb923c',
  };
  const accentOrb = accentOrbMap[accentVar] || accentOrbMap['--y'];

  // Determine CTA button class based on accent
  const ctaBtnMap: Record<string, string> = {
    '--y': 'btn-y',
    '--c': 'btn-c',
    '--g': 'btn-g',
    '--p': 'btn-p',
    '--r': 'btn-r',
    '--o': 'btn-o',
  };
  const ctaBtn = ctaBtnMap[accentVar] || 'btn-y';

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Cover" style="background:radial-gradient(ellipse 90% 60% at 50% 0%,${accentBg},transparent 60%),linear-gradient(180deg,#0e1c2f,#09121f)">
  <!-- Background orbs -->
  <div class="cv-orb cv-orb-1" style="background:${accentOrb}"></div>
  <div class="cv-orb cv-orb-2" style="background:${accentOrb}"></div>

  <div class="cover-wrap">
    <div class="cv-icon-wrap">
      <div class="cv-icon-pulse"></div>
      <div class="cover-icon">${esc(icon)}</div>
    </div>
    <div class="cv-meta" style="animation-delay:.2s">${[mapel ? `📚 ${esc(mapel)}` : '', kelas ? `Kelas ${esc(kelas)}` : '', 'Kurikulum Merdeka'].filter(Boolean).join(' · ')}</div>
    <h1 class="cover-title cv-entrance" style="animation-delay:.3s">${titlePrefix}${esc(title)}</h1>
    ${subtitle ? `<p class="sub cv-entrance" style="max-width:420px;margin:8px auto;animation-delay:.5s">${esc(subtitle)}</p>` : ''}
    <div class="cover-chips">
      ${chipsHTML}
    </div>
    ${infoBadge}
    <button class="btn ${ctaBtn} cv-cta cv-entrance" style="animation-delay:1.2s" onclick="goNextScreen()">▶ ${esc(ctaText)}</button>
  </div>
  <style>
    .cv-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.12;pointer-events:none;animation:orbFloat 8s ease-in-out infinite;}
    .cv-orb-1{width:300px;height:300px;top:-60px;left:-80px;animation-delay:0s;}
    .cv-orb-2{width:200px;height:200px;bottom:20%;right:-60px;animation-delay:2s;}
    @keyframes orbFloat{0%,100%{transform:translate(0,0);}50%{transform:translate(20px,15px);}}
    .cv-icon-wrap{position:relative;display:flex;align-items:center;justify-content:center;margin-bottom:16px;}
    .cv-icon-pulse{position:absolute;width:90px;height:90px;border-radius:50%;background:var(${esc(accentVar)});opacity:.12;animation:iconPulse 2.5s ease-in-out infinite;}
    @keyframes iconPulse{0%,100%{transform:scale(1);opacity:.12;}50%{transform:scale(1.4);opacity:.06;}}
    .cv-meta{font-weight:800;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:var(--c);animation:cvSlideUp .6s ease both;}
    .cv-title-prefix{display:block;font-size:clamp(.9rem,3vw,1.2rem);font-weight:800;margin-bottom:4px;letter-spacing:.02em;}
    .cv-entrance{animation:cvSlideUp .6s ease both;}
    @keyframes cvSlideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
    .cv-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 14px;border-radius:99px;font-size:.76rem;font-weight:800;animation:cvSlideUp .5s ease both;transition:transform .15s;}
    .cv-chip:hover{transform:scale(1.05);}
    .cv-info-badge{margin-bottom:20px;padding:10px 18px;background:rgba(255,255,255,.05);border-radius:10px;font-size:.78rem;color:var(--muted);animation:cvSlideUp .5s ease both;border:1px solid rgba(255,255,255,.06);}
    .cv-cta{position:relative;overflow:hidden;}
    .cv-cta::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%);transition:none;}
    .cv-cta:hover::after{transform:translateX(100%);transition:transform .5s ease;}
  </style>
</div>`;
}
