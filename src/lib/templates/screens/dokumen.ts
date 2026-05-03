// ═══════════════════════════════════════════════════════════════
// DOKUMEN.TS — Dokumen (CP/TP/ATP) screen template for MPI export
// Generates the full CP + TP + ATP tabbed document screen with
// Alur Pembelajaran and Tujuan Pertemuan sections.
// ═══════════════════════════════════════════════════════════════
// PRESET-QUALITY UPGRADE:
//   • Staggered entrance animations (dk-fadeInUp with 0.08s stagger)
//   • screenActivate hook → dk-active class triggers animations
//   • Sliding tab indicator (Material Design style)
//   • Active tab background glow
//   • ATP card hover (lift + border glow) & click-to-expand
//   • Alur timeline vertical connecting line
//   • Alur step click-to-highlight
//   • Tab content slide transition
//   • +2 points when all 3 tabs visited
//   • Friendly empty states with icons
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
    <div class="dk-anim-item" style="animation-delay:0s">
      <div style="font-size:.8rem;color:var(--muted);line-height:1.7;margin-bottom:10px">
        <strong style="color:var(--text)">Elemen:</strong> ${esc(cp.elemen || '-')} &middot;
        <strong style="color:var(--text)">Sub-Elemen:</strong> ${esc(cp.subElemen || '-')}
      </div>
    </div>
    <div class="dk-anim-item" style="animation-delay:0.08s">
      <div class="def-box">${esc(cp.capaianFase || 'Capaian pembelajaran belum diisi.')}</div>
    </div>
    <div class="dk-anim-item" style="animation-delay:0.16s">
      <div style="background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:12px;padding:12px;font-size:.82rem;line-height:1.6">
        <strong style="color:var(--g)">🔗 Profil Pelajar Pancasila:</strong><br>
        <span style="color:var(--muted)">${profilItems}</span>
      </div>
    </div>
  </div>`;
}

function renderTPTab(data: DokumenSlotData): string {
  const tpItems = data.tp || [];

  if (!tpItems.length) {
    return `<div class="ktab-content" id="${esc(data._templateId)}-ktp">
      <div class="dk-empty-state">
        <div class="dk-empty-icon">🎯</div>
        <div class="dk-empty-title">Tujuan Pembelajaran belum diisi</div>
        <div class="dk-empty-hint">Tambahkan Tujuan Pembelajaran di editor</div>
        <div class="dk-empty-illustration">
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="20" width="100" height="8" rx="4" fill="var(--muted)" opacity=".12"/>
            <rect x="10" y="34" width="70" height="8" rx="4" fill="var(--muted)" opacity=".08"/>
            <rect x="10" y="48" width="85" height="8" rx="4" fill="var(--muted)" opacity=".06"/>
            <circle cx="4" cy="24" r="3" fill="var(--y)" opacity=".25"/>
            <circle cx="4" cy="38" r="3" fill="var(--c)" opacity=".2"/>
            <circle cx="4" cy="52" r="3" fill="var(--g)" opacity=".2"/>
          </svg>
        </div>
      </div>
    </div>`;
  }

  const itemsHtml = tpItems.map((t, i) => {
    const col = t.color || 'var(--y)';
    return `<div class="tp-full-item dk-anim-item" style="border-color:${esc(col)}44;background:${esc(col)}0a;animation-delay:${i * 0.08}s">
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
      <div class="dk-empty-state">
        <div class="dk-empty-icon">📅</div>
        <div class="dk-empty-title">ATP belum diisi</div>
        <div class="dk-empty-hint">Tambahkan data Alur Tujuan Pembelajaran di editor</div>
      </div>
    </div>`;
  }

  const cardsHtml = pertemuan.map((p, i) => `
    <div class="atp-p-card dk-atp-card dk-anim-item${i === 0 ? ' active-p' : ''}" style="animation-delay:${i * 0.08}s" data-atp-idx="${i}">
      <div class="atp-p-head">
        <span class="atp-p-badge" style="background:rgba(245,200,66,.2);color:#f5c842">${i === 0 ? '📍 ' : '→ '}Pertemuan ${i + 1}</span>
        <span style="font-size:.72rem;color:#5a7499">${esc(p.durasi || '')}</span>
        ${i === 0 ? '<span style="margin-left:auto;font-size:.72rem;font-weight:800;color:#34d399">✅ Sekarang</span>' : ''}
      </div>
      <div class="atp-p-title">${esc(p.judul || '')}</div>
      <div class="atp-p-tp">📚 ${esc(p.tp || '')}</div>
      <div class="dk-atp-expandable">
        <div class="atp-p-kegiatan">${esc(p.kegiatan || '')}</div>
        <span class="atp-p-penilaian">📋 ${esc(p.penilaian || '')}</span>
      </div>
      <div class="dk-atp-expand-hint">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
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

  const stepsHtml = alur.map((s, i) => {
    const col = faseColors[s.fase] || '#a78bfa';
    return `<div class="alur-step dk-alur-step dk-anim-item" style="animation-delay:${i * 0.08}s" data-alur-idx="${i}">
      <div class="dk-alur-dot" style="background:${col};box-shadow:0 0 0 3px ${col}33"></div>
      <span class="alur-jp" style="background:${col}22;color:${col}">${esc(s.fase)}</span>
      <span class="alur-dur">${esc(s.durasi || '')}</span>
      <div class="alur-txt"><strong>${esc(s.judul || '')}</strong>${s.deskripsi ? ' — ' + esc(s.deskripsi) : ''}</div>
    </div>`;
  }).join('');

  return `<div class="card mt14 dk-anim-item" style="animation-delay:0.24s">
    <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">🗓️ Alur Pembelajaran Hari Ini</div>
    <div class="alur-steps dk-alur-steps">${stepsHtml}</div>
  </div>`;
}

function renderTujuanSection(data: DokumenSlotData): string {
  const tp = data.tp || [];
  const firstMeetingTp = tp.filter(t => (t.pertemuan || 1) === 1);

  if (!firstMeetingTp.length) return '';

  const itemsHtml = firstMeetingTp.map((t, i) => {
    const col = t.color || 'var(--y)';
    return `<div class="tp-item dk-anim-item" style="animation-delay:${(i * 0.08) + 0.32}s">
      <div class="tp-num" style="background:${esc(col)}22;color:${esc(col)}">${i + 1}</div>
      <div><div class="tp-verb">${esc(t.verb)}</div><div class="tp-desc">${esc(t.desc)}</div></div>
    </div>`;
  }).join('');

  return `<div class="card mt14">
    <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">🎯 Tujuan Pertemuan Ini</div>
    <div class="tp-list">${itemsHtml}</div>
  </div>`;
}

// ── Scoped CSS (dk- prefix) ───────────────────────────────────
function renderDokumenCSS(): string {
  return `<style>
/* ── Entrance Animation Keyframes ──────────────── */
@keyframes dk-fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Base: animated items are hidden until dk-active ── */
.dk-anim-item {
  opacity: 0;
  transform: translateY(16px);
  transition: none;
}

/* ── When dk-active, fire the staggered animation ── */
.dk-active .dk-anim-item {
  animation: dk-fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
}

/* ── Gradient Header ───────────────────────────── */
.dk-gradient-header {
  position: relative;
  overflow: hidden;
  border-radius: 14px 14px 0 0;
  padding: 18px 20px 14px;
  background: linear-gradient(135deg, rgba(245,200,66,.18) 0%, rgba(56,217,217,.12) 50%, rgba(52,211,153,.14) 100%);
  margin: -16px -16px 14px;
}

.dk-gradient-header::after {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 120px; height: 100%;
  background: radial-gradient(circle at 80% 40%, rgba(245,200,66,.15), transparent 70%);
  pointer-events: none;
}

.dk-gradient-header .h2 {
  position: relative;
  z-index: 1;
}

/* ── Tab Row with Indicator ────────────────────── */
.dk-tab-row {
  position: relative;
  display: flex;
  gap: 0;
  border-bottom: 2px solid rgba(128,128,128,.1);
  margin-bottom: 14px;
}

.dk-tab-row .ktab {
  position: relative;
  z-index: 1;
  padding: 10px 14px;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  border-radius: 8px 8px 0 0;
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.dk-tab-row .ktab:hover {
  color: var(--text);
  background: rgba(128,128,128,.04);
}

.dk-tab-row .ktab.active {
  color: var(--text);
  background: rgba(245,200,66,.08);
  box-shadow: 0 0 12px rgba(245,200,66,.12);
}

/* ── Sliding Indicator ─────────────────────────── */
.dk-tab-indicator {
  position: absolute;
  bottom: -2px;
  height: 3px;
  background: linear-gradient(90deg, #f5c842, #38d9d9);
  border-radius: 3px 3px 0 0;
  transition: left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1);
  z-index: 2;
}

/* ── Tab Content Slide Transition ──────────────── */
.dk-content-wrap {
  position: relative;
  overflow: hidden;
}

.dk-content-wrap .ktab-content {
  display: none;
  opacity: 0;
  transform: translateX(24px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.dk-content-wrap .ktab-content.active {
  display: block;
  opacity: 1;
  transform: translateX(0);
}

/* Slide-in animation for content switch */
.dk-content-wrap .ktab-content.dk-slide-in {
  animation: dk-slideIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
}

@keyframes dk-slideIn {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── ATP Card Hover & Expand ───────────────────── */
.dk-atp-card {
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.22,1,0.36,1),
              box-shadow 0.25s ease,
              border-color 0.25s ease;
}

.dk-atp-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,.08), 0 0 0 1px rgba(245,200,66,.25);
  border-color: rgba(245,200,66,.35);
}

.dk-atp-expandable {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease;
  opacity: 0;
}

.dk-atp-card.dk-expanded .dk-atp-expandable {
  max-height: 400px;
  opacity: 1;
}

.dk-atp-expand-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  color: var(--muted);
  opacity: .4;
  transition: transform 0.3s ease, opacity 0.2s;
}

.dk-atp-card.dk-expanded .dk-atp-expand-hint {
  transform: rotate(180deg);
  opacity: .25;
}

.dk-atp-card:hover .dk-atp-expand-hint {
  opacity: .7;
}

/* ── Alur Timeline ─────────────────────────────── */
.dk-alur-steps {
  position: relative;
  padding-left: 20px;
}

/* Vertical connecting line */
.dk-alur-steps::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(to bottom, rgba(245,200,66,.3), rgba(56,217,217,.3), rgba(52,211,153,.3));
  border-radius: 2px;
}

.dk-alur-step {
  position: relative;
  cursor: pointer;
  transition: background 0.2s, border-radius 0.2s;
  border-radius: 8px;
  padding: 6px 8px;
}

.dk-alur-step:hover {
  background: rgba(128,128,128,.04);
}

/* Timeline dot */
.dk-alur-dot {
  position: absolute;
  left: -20px;
  top: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  z-index: 1;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dk-alur-step:hover .dk-alur-dot {
  transform: scale(1.3);
}

/* Highlighted alur step */
.dk-alur-step.dk-highlighted {
  background: rgba(245,200,66,.06);
  border-radius: 8px;
}

.dk-alur-step.dk-highlighted .dk-alur-dot {
  transform: scale(1.4);
  box-shadow: 0 0 0 4px rgba(245,200,66,.2), 0 0 12px rgba(245,200,66,.25) !important;
}

/* ── Empty States ──────────────────────────────── */
.dk-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 28px 16px 20px;
}

.dk-empty-icon {
  font-size: 2.2rem;
  margin-bottom: 8px;
  opacity: .65;
  animation: dk-emptyBounce 2s ease-in-out infinite;
}

@keyframes dk-emptyBounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

.dk-empty-title {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.dk-empty-hint {
  font-size: .78rem;
  color: var(--muted);
  margin-bottom: 12px;
}

.dk-empty-illustration {
  opacity: .5;
  margin-top: 4px;
}

/* ── Tab visited checkmark ─────────────────────── */
.dk-tab-check {
  display: inline-block;
  font-size: .65rem;
  margin-left: 3px;
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.3s, transform 0.3s cubic-bezier(0.22,1,0.36,1);
  color: #34d399;
}

.dk-tab-check.dk-seen {
  opacity: 1;
  transform: scale(1);
}
</style>`;
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

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Kurikulum">
  ${renderDokumenCSS()}
  <div class="main">
    <div class="card dk-card">
      <div class="dk-gradient-header">
        <div class="h2">📋 <span class="hl">Dokumen</span> Pembelajaran</div>
      </div>
      <div class="dk-tab-row" id="${esc(screenId)}-tabs">
        <div class="ktab active" onclick="switchKtab('${esc(prefix)}-kcp',this);${esc(screenId)}_onTab('kcp',this)">Capaian<span class="dk-tab-check" data-tab-check="kcp">✓</span></div>
        <div class="ktab" onclick="switchKtab('${esc(prefix)}-ktp',this);${esc(screenId)}_onTab('ktp',this)">Tujuan Pembelajaran<span class="dk-tab-check" data-tab-check="ktp">✓</span></div>
        <div class="ktab" onclick="switchKtab('${esc(prefix)}-katp',this);${esc(screenId)}_onTab('katp',this)">ATP<span class="dk-tab-check" data-tab-check="katp">✓</span></div>
        <div class="dk-tab-indicator" id="${esc(screenId)}-indicator"></div>
      </div>
      <div class="dk-content-wrap">
        ${renderCPTab(data)}
        ${renderTPTab(data)}
        ${renderATPTab(data)}
      </div>
    </div>
    ${renderAlurSection(data)}
    ${renderTujuanSection(data)}
    <div class="btn-row btn-center dk-anim-item" style="animation-delay:0.4s">
      <button class="btn btn-y" onclick="goNextScreen()">Mulai Pembelajaran →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>
  <script>
  (function() {
    var sid = ${JSON.stringify(screenId)};
    var prefix = ${JSON.stringify(prefix)};
    var screenEl = document.getElementById(sid);

    // ── State ────────────────────────────────────────
    var tabViews = { kcp: false, ktp: false, katp: false };
    var allTabsScored = false;

    // ── Tab indicator positioning ────────────────────
    function positionIndicator(tabEl) {
      var indicator = document.getElementById(sid + '-indicator');
      var row = document.getElementById(sid + '-tabs');
      if (!indicator || !row || !tabEl) return;
      var rowRect = row.getBoundingClientRect();
      var tabRect = tabEl.getBoundingClientRect();
      indicator.style.left = (tabRect.left - rowRect.left) + 'px';
      indicator.style.width = tabRect.width + 'px';
    }

    function initIndicator() {
      var row = document.getElementById(sid + '-tabs');
      if (!row) return;
      var activeTab = row.querySelector('.ktab.active');
      if (activeTab) positionIndicator(activeTab);
    }

    // ── Tab content slide animation ──────────────────
    function slideContent(tabId) {
      var wrap = screenEl ? screenEl.querySelector('.dk-content-wrap') : null;
      if (!wrap) return;
      var contents = wrap.querySelectorAll('.ktab-content');
      for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('dk-slide-in');
      }
      var target = document.getElementById(tabId);
      if (target) {
        // Small delay to let display:block take effect before animation
        setTimeout(function() {
          target.classList.add('dk-slide-in');
        }, 20);
      }
    }

    // ── Tab click handler (exposed globally) ─────────
    window[sid + '_onTab'] = function(tabKey, tabEl) {
      // Track view
      tabViews[tabKey] = true;

      // Show checkmark
      var checkEl = tabEl.querySelector('.dk-tab-check');
      if (checkEl) checkEl.classList.add('dk-seen');

      // Move indicator
      positionIndicator(tabEl);

      // Slide content
      var contentId = prefix + '-k' + tabKey;
      slideContent(contentId);

      // Score: +2 when all 3 tabs visited
      if (!allTabsScored && tabViews.kcp && tabViews.ktp && tabViews.katp) {
        allTabsScored = true;
        if (typeof addScore === 'function') addScore(2);
      }
    };

    // ── ATP card expand/collapse ─────────────────────
    function setupATPCards() {
      if (!screenEl) return;
      var cards = screenEl.querySelectorAll('.dk-atp-card');
      for (var i = 0; i < cards.length; i++) {
        (function(card) {
          card.addEventListener('click', function(e) {
            // Prevent double-toggle if clicking inside expandable
            if (e.target.closest('.dk-atp-expandable')) return;
            card.classList.toggle('dk-expanded');
          });
        })(cards[i]);
      }
    }

    // ── Alur step highlight on click ─────────────────
    function setupAlurSteps() {
      if (!screenEl) return;
      var steps = screenEl.querySelectorAll('.dk-alur-step');
      for (var i = 0; i < steps.length; i++) {
        (function(step) {
          step.addEventListener('click', function() {
            // Toggle highlight, remove from siblings
            for (var j = 0; j < steps.length; j++) {
              if (steps[j] !== step) steps[j].classList.remove('dk-highlighted');
            }
            step.classList.toggle('dk-highlighted');
          });
        })(steps[i]);
      }
    }

    // ── Screen activation: add dk-active for animations ──
    function activate() {
      if (screenEl) screenEl.classList.add('dk-active');
      // Init indicator after layout settles
      setTimeout(initIndicator, 60);
    }

    if (screenEl) {
      screenEl.addEventListener('screenActivate', function() {
        activate();
      });
    }

    // Also check if already active on load
    if (screenEl && screenEl.classList.contains('active')) {
      activate();
    }

    // ── Init on DOM ready ────────────────────────────
    setupATPCards();
    setupAlurSteps();

    // Position indicator after fonts load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initIndicator);
    }
    // Fallback reposition
    setTimeout(initIndicator, 300);
    setTimeout(initIndicator, 800);

    // Handle resize
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initIndicator, 100);
    });
  })();
  </script>
</div>`;
}
