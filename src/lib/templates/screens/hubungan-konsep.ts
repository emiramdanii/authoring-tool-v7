// ═══════════════════════════════════════════════════════════════
// HUBUNGAN-KONSEP.TS — Concept map / relationship diagram screen
// (PRESET QUALITY) — Enhanced with entrance animations, visual
// polish, interactive improvements, and better SVG quality.
// Generates an interactive concept map with nodes and edges.
// Click nodes to highlight connections, explore for points.
// ═══════════════════════════════════════════════════════════════

import type { HubunganKonsepSlotData } from '../engine/slot-types';

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

// ── Edge Color Palette (relationship-type color coding) ───────
const EDGE_PALETTE = [
  { stroke: '#3ecfcf', glow: 'rgba(62,207,207,.4)' },   // teal — general
  { stroke: '#f9c12e', glow: 'rgba(249,193,46,.4)' },    // gold — causal
  { stroke: '#34d399', glow: 'rgba(52,211,153,.4)' },    // green — part-of
  { stroke: '#a78bfa', glow: 'rgba(167,139,250,.4)' },   // purple — type-of
  { stroke: '#fb923c', glow: 'rgba(251,146,60,.4)' },    // orange — leads-to
  { stroke: '#f472b6', glow: 'rgba(244,114,182,.4)' },   // pink — relates-to
];

// ── Compute Node Positions (circular layout, enhanced) ────────
interface NodePosition {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
}

function computeNodePositions(
  nodes: HubunganKonsepSlotData['nodes'],
): NodePosition[] {
  const count = nodes.length || 0;
  if (count === 0) return [];

  const cx = 250;
  const cy = 210;
  const radiusX = Math.min(220, 80 + count * 22);
  const radiusY = Math.min(170, 60 + count * 17);

  return nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      id: node.id || `n${i}`,
      label: node.label,
      color: node.color || '#3ecfcf',
      x: Math.round(cx + radiusX * Math.cos(angle)),
      y: Math.round(cy + radiusY * Math.sin(angle)),
    };
  });
}

// ── Shorten line endpoints to avoid overlapping with circles ──
function shortenLine(
  x1: number, y1: number,
  x2: number, y2: number,
  shortenStart: number,
  shortenEnd: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len <= shortenStart + shortenEnd) return { x1, y1, x2, y2 };
  const nx = dx / len;
  const ny = dy / len;
  return {
    x1: Math.round(x1 + nx * shortenStart),
    y1: Math.round(y1 + ny * shortenStart),
    x2: Math.round(x2 - nx * shortenEnd),
    y2: Math.round(y2 - ny * shortenEnd),
  };
}

// ── Build SVG for Concept Map (enhanced with markers, labels,
//    gradient backgrounds, arrowheads, and animation hooks) ────
function buildConceptMapSVG(
  positions: NodePosition[],
  edges: HubunganKonsepSlotData['edges'],
): string {
  const nodeMap = new Map(positions.map((p) => [p.id, p]));
  const nodeCount = positions.length;

  // ── SVG Defs: filters, gradients, arrowhead markers ────────
  let defs = '';

  // Soft glow filter
  defs += `<filter id="hkGlow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="4" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
  </filter>`;

  // Strong glow filter (selected nodes)
  defs += `<filter id="hkGlowStrong" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="6" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

  // Background radial gradient
  defs += `<radialGradient id="hkBgGrad" cx="50%" cy="45%" r="55%">
    <stop offset="0%" stop-color="rgba(62,207,207,.07)"/>
    <stop offset="50%" stop-color="rgba(249,193,46,.03)"/>
    <stop offset="100%" stop-color="rgba(14,28,47,0)"/>
  </radialGradient>`;

  // Arrowhead markers per edge color
  EDGE_PALETTE.forEach((ec, i) => {
    defs += `<marker id="hkArr${i}" viewBox="0 0 10 7" refX="9" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
      <polygon points="0,0 10,3.5 0,7" fill="${ec.stroke}" opacity=".65"/>
    </marker>`;
  });

  // ── Background rect ────────────────────────────────────────
  const bg = `<rect x="0" y="0" width="500" height="420" fill="url(#hkBgGrad)" class="hk-bg-rect"/>`;

  // ── Build Edges ────────────────────────────────────────────
  let edgeSVG = '';
  edges.forEach((edge, i) => {
    const from = nodeMap.get(edge.from);
    const to = nodeMap.get(edge.to);
    if (!from || !to) return;

    const colorIdx = i % EDGE_PALETTE.length;
    const ec = EDGE_PALETTE[colorIdx];

    // Shorten line so it doesn't overlap circles (r=28 + 4px gap)
    const s = shortenLine(from.x, from.y, to.x, to.y, 32, 34);
    const lineLen = Math.round(
      Math.sqrt((s.x2 - s.x1) ** 2 + (s.y2 - s.y1) ** 2),
    );
    const midX = (s.x1 + s.x2) / 2;
    const midY = (s.y1 + s.y2) / 2;

    // Edge line with draw-in animation vars
    edgeSVG += `<line class="hk-edge" data-from="${esc(edge.from)}" data-to="${esc(edge.to)}" data-idx="${i}"
      x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}"
      stroke="${ec.stroke}" stroke-width="2" stroke-opacity=".35" stroke-linecap="round"
      marker-end="url(#hkArr${colorIdx})"
      style="--hk-len:${lineLen};--hk-delay:${(0.3 + i * 0.12).toFixed(2)}s"/>`;

    // Edge label background pill
    const lw = Math.max(28, edge.label.length * 5.5 + 12);
    const lh = 14;
    edgeSVG += `<rect class="hk-edge-label-bg" data-idx="${i}"
      x="${Math.round(midX - lw / 2)}" y="${Math.round(midY - lh / 2 - 2)}"
      width="${lw}" height="${lh}" rx="4"
      fill="rgba(14,28,47,.72)" style="pointer-events:none"/>`;

    // Edge label text
    edgeSVG += `<text class="hk-edge-label" data-idx="${i}"
      x="${midX}" y="${midY + 1}" text-anchor="middle" dominant-baseline="central"
      fill="${ec.stroke}" font-size=".58rem" font-weight="700"
      font-family="Nunito,sans-serif"
      style="pointer-events:none">${esc(edge.label)}</text>`;
  });

  // ── Build Nodes ────────────────────────────────────────────
  let nodeSVG = '';
  positions.forEach((p, i) => {
    const stagger = (0.2 + i * 0.1).toFixed(2);
    const floatD = (i * 0.4).toFixed(2);
    const labelLen = p.label.length;
    const rectW = Math.max(38, labelLen * 6.5 + 16);
    const rectH = 19;

    nodeSVG += `<g class="hk-node" data-node-id="${esc(p.id)}"
      style="--hk-stagger:${stagger}s;--hk-fd:${floatD}s;cursor:pointer"
      onclick="highlightKonsepNode('${esc(p.id)}')">
      <!-- Pulse ring for selected glow -->
      <circle class="hk-pulse-ring" cx="${p.x}" cy="${p.y}" r="28"
        fill="none" stroke="${esc(p.color)}" stroke-width="2" opacity="0"
        style="transform-box:fill-box;transform-origin:center"/>
      <!-- Main node circle -->
      <circle class="hk-node-circle" cx="${p.x}" cy="${p.y}" r="28"
        fill="${esc(p.color)}18" stroke="${esc(p.color)}" stroke-width="2.5"
        style="transform-box:fill-box;transform-origin:center;transition:all .3s ease"/>
      <!-- Label background rounded-rect -->
      <rect class="hk-label-bg" x="${Math.round(p.x - rectW / 2)}" y="${Math.round(p.y - rectH / 2)}"
        width="${rectW}" height="${rectH}" rx="6"
        fill="rgba(14,28,47,.5)" style="pointer-events:none;transition:opacity .3s"/>
      <!-- Label text with shadow -->
      <text class="hk-node-text" x="${p.x}" y="${p.y + 1}"
        text-anchor="middle" dominant-baseline="central"
        fill="#e8f2ff" font-size=".66rem" font-weight="900"
        font-family="Nunito,sans-serif"
        style="pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.6);transition:opacity .3s">${esc(p.label)}</text>
    </g>`;
  });

  return `<svg viewBox="0 0 500 420" class="hk-svg" id="konsepSvg">
    <defs>${defs}</defs>
    ${bg}
    <g class="hk-edges">${edgeSVG}</g>
    <g class="hk-nodes">${nodeSVG}</g>
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT — renderHubunganKonsepHTML
// ═══════════════════════════════════════════════════════════════
export function renderHubunganKonsepHTML(data: HubunganKonsepSlotData, screenId: string): string {
  const nodes = data.nodes || [];
  const edges = data.edges || [];
  const positions = computeNodePositions(nodes);

  const svgHTML = positions.length ? buildConceptMapSVG(positions, edges) : '';

  // Edge reference map for JS
  const edgeMapJS = JSON.stringify(
    edges.map((e) => ({ from: e.from, to: e.to, label: e.label })),
  );

  // Node data for JS
  const nodeDataJS = JSON.stringify(
    nodes.map((n) => ({ id: n.id || '', label: n.label, color: n.color || '#3ecfcf' })),
  );

  // Build node detail cards
  const nodeCardsHTML = nodes
    .map((n) => {
      const connectedEdges = edges.filter((e) => e.from === n.id || e.to === n.id);
      return `<div class="hk-detail-card" data-detail-id="${esc(n.id)}" style="display:none">
        <div class="hk-detail-header">
          <div class="hk-detail-dot" style="background:${esc(n.color || '#3ecfcf')}"></div>
          <div class="hk-detail-title" style="color:${esc(n.color || '#3ecfcf')}">${esc(n.label)}</div>
        </div>
        ${connectedEdges.length
          ? `<div class="hk-detail-rel-label">Hubungan:</div>` +
            connectedEdges
              .map(
                (e) =>
                  `<div class="hk-detail-rel"><span class="hk-detail-arrow">→</span><span>${esc(e.label)} (${esc(e.from === n.id ? e.to : e.from)})</span></div>`,
              )
              .join('')
          : '<div class="hk-detail-empty">Tidak ada hubungan</div>'}
      </div>`;
    })
    .join('');

  return `<div class="screen" id="${esc(screenId)}" data-nav-label="Hubungan Konsep">
  <div class="main">

    <!-- Title card with fade-in entrance -->
    <div class="card hk-entrance-fade" style="margin-bottom:14px">
      <div class="h2">🔗 <span class="hl">Hubungan</span> Konsep</div>
      <p class="sub mt8">Klik node untuk melihat hubungannya dengan konsep lain.</p>
      <div class="hk-header-row">
        <div class="hk-counter" id="hkExploredCounter">
          🔍 Explored: <span id="hkExploredNum">0</span>/<span id="hkExploredTotal">${nodes.length}</span>
        </div>
        <button class="hk-reset-btn" id="hkResetBtn" onclick="resetKonsepSelection()">↺ Reset</button>
      </div>
    </div>

    <!-- SVG concept map card with scale-in entrance -->
    <div class="card hk-entrance-scale hk-map-card" style="padding:16px;overflow:auto;position:relative">
      <!-- Particle effect background -->
      <div class="hk-particles"></div>
      ${svgHTML || '<p style="color:var(--muted);text-align:center;font-size:.86rem;position:relative;z-index:1">Node konsep belum diisi.</p>'}
    </div>

    <!-- Detail panel with delayed fade-in entrance -->
    <div class="card mt14 hk-entrance-fade" id="konsepDetailPanel" style="--hk-entrance-delay:.5s">
      <div class="hk-detail-heading">📋 Detail Konsep</div>
      <div id="konsepDetailCards">
        ${nodeCardsHTML}
      </div>
      <div id="konsepDefaultMsg" class="hk-default-msg">
        👆 Klik salah satu node di atas untuk melihat detailnya
      </div>
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <style>
    /* ═══════════════════════════════════════════════════════════
       HUBUNGAN KONSEP — PRESET QUALITY STYLES
       All classes prefixed with .hk- for scoping
       ═══════════════════════════════════════════════════════════ */

    /* ── Entrance Animations ──────────────────────────────────── */
    .hk-entrance-fade{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s ease;transition-delay:var(--hk-entrance-delay,0s);}
    .hk-entrance-scale{opacity:0;transform:scale(.88);transition:opacity .7s cubic-bezier(.34,1.56,.64,1),transform .7s cubic-bezier(.34,1.56,.64,1);}
    .hk-active .hk-entrance-fade{opacity:1;transform:translateY(0);}
    .hk-active .hk-entrance-scale{opacity:1;transform:scale(1);}

    /* ── Node Entrance (staggered opacity) ────────────────────── */
    .hk-node{opacity:0;transition:opacity .5s ease;transition-delay:var(--hk-stagger,0s);}
    .hk-active .hk-node{opacity:1;}

    /* ── Node Floating Animation ──────────────────────────────── */
    .hk-active .hk-node{animation:hkFloat 3.5s ease-in-out infinite;animation-delay:var(--hk-fd,0s);}
    @keyframes hkFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}

    /* ── Edge Draw Animation ──────────────────────────────────── */
    .hk-edge{stroke-dasharray:var(--hk-len);stroke-dashoffset:var(--hk-len);transition:stroke-dashoffset .8s ease,stroke-opacity .3s,stroke-width .3s;transition-delay:var(--hk-delay,0s);}
    .hk-active .hk-edge{stroke-dashoffset:0;}
    .hk-edge-label-bg,.hk-edge-label{opacity:0;transition:opacity .5s ease;transition-delay:var(--hk-delay,0s);}
    .hk-active .hk-edge-label-bg,.hk-active .hk-edge-label{opacity:1;}

    /* ── Edge Active State (flowing electricity dash) ─────────── */
    .hk-edge-active{stroke-dasharray:8 4 !important;stroke-dashoffset:0 !important;stroke-opacity:.85 !important;stroke-width:2.5 !important;animation:hkFlowDash .8s linear infinite !important;transition:none !important;}
    @keyframes hkFlowDash{to{stroke-dashoffset:-12;}}

    /* ── Edge Dimmed State ────────────────────────────────────── */
    .hk-edge-dimmed{stroke-opacity:.06 !important;stroke-width:1 !important;marker-end:none !important;}
    .hk-edge-dimmed~.hk-edge-label-bg[data-idx]{}/* handled by JS below */
    .hk-edge-label-bg-dimmed{opacity:.15 !important;}
    .hk-edge-label-dimmed{opacity:.15 !important;}
    .hk-edge-label-bg-active{opacity:1 !important;fill:rgba(62,207,207,.15) !important;}
    .hk-edge-label-active{opacity:1 !important;font-weight:800 !important;}

    /* ── Node Selected State (glowing pulse) ──────────────────── */
    .hk-selected .hk-pulse-ring{opacity:1;animation:hkPulseRing 1.5s ease-in-out infinite;}
    @keyframes hkPulseRing{0%{transform:scale(1);opacity:.7;stroke-width:2.5;}100%{transform:scale(1.35);opacity:0;stroke-width:.5;}}
    .hk-selected .hk-node-circle{stroke-width:3.5;filter:url(#hkGlowStrong);stroke-opacity:1;}
    .hk-selected .hk-label-bg{fill:rgba(14,28,47,.7);}
    .hk-selected .hk-node-text{fill:#fff;}

    /* ── Node Dimmed State ────────────────────────────────────── */
    .hk-dimmed .hk-node-circle{opacity:.25;}
    .hk-dimmed .hk-label-bg{opacity:.25;}
    .hk-dimmed .hk-node-text{opacity:.25;}
    .hk-dimmed .hk-pulse-ring{display:none;}

    /* ── Connected Node Highlight ─────────────────────────────── */
    .hk-connected .hk-node-circle{stroke-width:3;stroke-opacity:1;filter:url(#hkGlow);}

    /* ── Click Feedback (scale pop) ───────────────────────────── */
    @keyframes hkClickPop{0%{transform:scale(1);}40%{transform:scale(1.12);}100%{transform:scale(1);}}
    .hk-click-pop .hk-node-circle{animation:hkClickPop .3s ease;}

    /* ── Connected Node Bounce ────────────────────────────────── */
    @keyframes hkBounce{0%,100%{transform:translateY(0);}25%{transform:translateY(-5px);}55%{transform:translateY(2px);}75%{transform:translateY(-1px);}}
    .hk-bounce{animation:hkBounce .45s ease !important;}

    /* ── Particle Effect (CSS-only pseudo-elements) ───────────── */
    .hk-map-card{position:relative;overflow:hidden;}
    .hk-particles{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;}
    .hk-particles::before,.hk-particles::after{content:'';position:absolute;width:3px;height:3px;border-radius:50%;background:rgba(62,207,207,.2);animation:hkParticleDrift 16s ease-in-out infinite alternate;}
    .hk-particles::before{top:15%;left:10%;box-shadow:
      30px 50px 0 rgba(249,193,46,.14),
      80px 20px 0 rgba(52,211,153,.16),
      140px 80px 0 rgba(167,139,250,.11),
      200px 35px 0 rgba(62,207,207,.14),
      260px 70px 0 rgba(251,146,60,.11),
      320px 55px 0 rgba(244,114,182,.11),
      55px 125px 0 rgba(62,207,207,.16),
      170px 105px 0 rgba(249,193,46,.11),
      280px 115px 0 rgba(52,211,153,.14),
      380px 45px 0 rgba(167,139,250,.11),
      420px 95px 0 rgba(62,207,207,.14),
      105px 165px 0 rgba(251,146,60,.11),
      350px 145px 0 rgba(244,114,182,.09),
      440px 135px 0 rgba(62,207,207,.11);}
    .hk-particles::after{top:55%;left:35%;animation-delay:-8s;animation-direction:alternate-reverse;box-shadow:
      20px 40px 0 rgba(249,193,46,.11),
      70px 10px 0 rgba(62,207,207,.14),
      130px 60px 0 rgba(52,211,153,.11),
      190px 25px 0 rgba(167,139,250,.09),
      250px 55px 0 rgba(62,207,207,.11),
      310px 85px 0 rgba(251,146,60,.09),
      45px 105px 0 rgba(244,114,182,.11),
      160px 95px 0 rgba(62,207,207,.14),
      370px 35px 0 rgba(249,193,46,.09),
      430px 75px 0 rgba(52,211,153,.11),
      115px 135px 0 rgba(62,207,207,.09),
      290px 125px 0 rgba(167,139,250,.11);}
    @keyframes hkParticleDrift{
      0%{transform:translate(0,0);}
      25%{transform:translate(10px,-16px);}
      50%{transform:translate(-6px,-28px);}
      75%{transform:translate(14px,-8px);}
      100%{transform:translate(4px,-20px);}}

    /* ── SVG Container ────────────────────────────────────────── */
    .hk-svg{width:100%;max-width:520px;display:block;margin:0 auto;position:relative;z-index:1;}

    /* ── Header Row (explored counter + reset) ────────────────── */
    .hk-header-row{display:flex;align-items:center;justify-content:space-between;margin-top:10px;gap:8px;flex-wrap:wrap;}
    .hk-counter{font-size:.78rem;font-weight:800;color:var(--muted);display:flex;align-items:center;gap:4px;}
    .hk-counter span{color:var(--y);font-weight:900;}
    .hk-reset-btn{font-size:.72rem;font-weight:700;padding:5px 14px;border-radius:6px;border:1px solid var(--border);background:rgba(255,255,255,.05);color:var(--muted);cursor:pointer;transition:all .2s;font-family:inherit;}
    .hk-reset-btn:hover{background:rgba(255,255,255,.1);color:var(--text);border-color:var(--c);}
    .hk-reset-btn:active{transform:scale(.95);}

    /* ── Detail Panel ─────────────────────────────────────────── */
    .hk-detail-heading{font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;}
    .hk-default-msg{text-align:center;padding:12px;color:var(--muted);font-size:.84rem;transition:opacity .3s;}

    /* ── Detail Card (slide in from right) ────────────────────── */
    .hk-detail-card{animation:hkSlideInRight .4s cubic-bezier(.34,1.56,.64,1);background:rgba(62,207,207,.04);border:1px solid rgba(62,207,207,.15);border-radius:12px;padding:14px;}
    .hk-detail-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
    .hk-detail-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;}
    .hk-detail-title{font-weight:900;font-size:.92rem;}
    .hk-detail-rel-label{font-size:.76rem;color:var(--muted);margin-bottom:4px;font-weight:700;}
    .hk-detail-rel{display:flex;gap:6px;font-size:.8rem;margin-bottom:3px;}
    .hk-detail-arrow{color:var(--c);font-weight:900;}
    .hk-detail-empty{font-size:.8rem;color:var(--muted);}
    @keyframes hkSlideInRight{from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);}}

    /* ── SVG Background rect subtle pulse ─────────────────────── */
    .hk-bg-rect{transition:opacity .6s;}
    .hk-active .hk-bg-rect{opacity:1;}
  </style>

  <script data-konsep-init="${esc(screenId)}">
  (function(){
    var EDGES = ${edgeMapJS};
    var NODES = ${nodeDataJS};
    var SCREEN_ID = '${esc(screenId)}';
    var explored = {};
    var exploredCount = 0;
    var selectedNodeId = null;

    // ═══════════════════════════════════════════════════════════
    // SCREEN ACTIVATION HOOK
    // Listens for screenActivate event and checks initial state
    // ═══════════════════════════════════════════════════════════
    function activateScreen(){
      var el = document.getElementById(SCREEN_ID);
      if(el && !el.classList.contains('hk-active')){
        el.classList.add('hk-active');
      }
    }

    document.addEventListener('screenActivate', function(e){
      if(e.detail && e.detail.id === SCREEN_ID) activateScreen();
    });

    // Check initial state (screen might already be visible)
    var screenEl = document.getElementById(SCREEN_ID);
    if(screenEl && screenEl.classList.contains('active')) activateScreen();
    if(screenEl){
      var parent = screenEl.parentElement;
      if(parent && parent.style.display !== 'none' && !parent.classList.contains('hidden')){
        setTimeout(activateScreen, 100);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // EXPLORED COUNTER
    // ═══════════════════════════════════════════════════════════
    function updateExploredCounter(){
      exploredCount = 0;
      for(var k in explored) if(explored.hasOwnProperty(k)) exploredCount++;
      var numEl = document.getElementById('hkExploredNum');
      if(numEl) numEl.textContent = exploredCount;
    }

    // ═══════════════════════════════════════════════════════════
    // HIGHLIGHT NODE — core interaction logic
    // ═══════════════════════════════════════════════════════════
    window.highlightKonsepNode = function(nodeId){
      // Toggle: clicking the same node again deselects
      if(selectedNodeId === nodeId){
        resetKonsepSelection();
        return;
      }

      // Click feedback — brief scale pop on clicked node
      var clickedG = document.querySelector('.hk-node[data-node-id="'+nodeId+'"]');
      if(clickedG){
        clickedG.classList.remove('hk-click-pop');
        void clickedG.offsetWidth; // force reflow
        clickedG.classList.add('hk-click-pop');
        setTimeout(function(){ clickedG.classList.remove('hk-click-pop'); }, 300);
      }

      // Track exploration (+2 points for each new node)
      if(!explored[nodeId]){
        explored[nodeId] = true;
        if(typeof addScore === 'function') addScore(2);
        updateExploredCounter();
      }

      selectedNodeId = nodeId;

      // ── Reset all node states ──────────────────────────────
      var allNodes = document.querySelectorAll('#'+SCREEN_ID+' .hk-node');
      for(var i=0;i<allNodes.length;i++){
        allNodes[i].classList.remove('hk-selected','hk-dimmed','hk-connected','hk-bounce');
      }

      // ── Reset all edge states ──────────────────────────────
      var allEdges = document.querySelectorAll('#'+SCREEN_ID+' .hk-edge');
      var allLabelBgs = document.querySelectorAll('#'+SCREEN_ID+' .hk-edge-label-bg');
      var allLabelTexts = document.querySelectorAll('#'+SCREEN_ID+' .hk-edge-label');
      for(var i=0;i<allEdges.length;i++){
        allEdges[i].classList.remove('hk-edge-active','hk-edge-dimmed');
      }
      for(var i=0;i<allLabelBgs.length;i++){
        allLabelBgs[i].classList.remove('hk-edge-label-bg-active','hk-edge-label-bg-dimmed');
      }
      for(var i=0;i<allLabelTexts.length;i++){
        allLabelTexts[i].classList.remove('hk-edge-label-active','hk-edge-label-dimmed');
      }

      // ── Find connected nodes and edges ─────────────────────
      var connectedIds = [nodeId];
      var connectedEdgeIdxs = {};
      for(var i=0;i<EDGES.length;i++){
        var e = EDGES[i];
        if(e.from === nodeId || e.to === nodeId){
          connectedIds.push(e.from === nodeId ? e.to : e.from);
          connectedEdgeIdxs[i] = true;
        }
      }

      // ── Apply selected / connected / dimmed states ─────────
      for(var j=0;j<allNodes.length;j++){
        var nid = allNodes[j].getAttribute('data-node-id');
        if(nid === nodeId){
          allNodes[j].classList.add('hk-selected');
        } else if(connectedIds.indexOf(nid) !== -1){
          allNodes[j].classList.add('hk-connected');
          // Bounce connected nodes
          allNodes[j].classList.add('hk-bounce');
          (function(el){
            setTimeout(function(){ el.classList.remove('hk-bounce'); }, 450);
          })(allNodes[j]);
        } else {
          allNodes[j].classList.add('hk-dimmed');
        }
      }

      // ── Activate connected edges, dim others ───────────────
      for(var k=0;k<allEdges.length;k++){
        var idx = parseInt(allEdges[k].getAttribute('data-idx'));
        if(connectedEdgeIdxs[idx]){
          allEdges[k].classList.add('hk-edge-active');
        } else {
          allEdges[k].classList.add('hk-edge-dimmed');
        }
      }
      // Edge label states (matched by data-idx)
      for(var k=0;k<allLabelBgs.length;k++){
        var idx = parseInt(allLabelBgs[k].getAttribute('data-idx'));
        if(connectedEdgeIdxs[idx]){
          allLabelBgs[k].classList.add('hk-edge-label-bg-active');
          allLabelTexts[k] && allLabelTexts[k].classList.add('hk-edge-label-active');
        } else {
          allLabelBgs[k].classList.add('hk-edge-label-bg-dimmed');
          allLabelTexts[k] && allLabelTexts[k].classList.add('hk-edge-label-dimmed');
        }
      }

      // ── Show detail card (slide in) ────────────────────────
      var allCards = document.querySelectorAll('#'+SCREEN_ID+' .hk-detail-card');
      for(var i=0;i<allCards.length;i++) allCards[i].style.display = 'none';
      var detailCard = document.querySelector('.hk-detail-card[data-detail-id="'+nodeId+'"]');
      if(detailCard){
        detailCard.style.display = 'block';
        // Re-trigger slide-in animation
        detailCard.style.animation = 'none';
        void detailCard.offsetWidth;
        detailCard.style.animation = 'hkSlideInRight .4s cubic-bezier(.34,1.56,.64,1)';
      }
      var msg = document.getElementById('konsepDefaultMsg');
      if(msg) msg.style.display = 'none';
    };

    // ═══════════════════════════════════════════════════════════
    // RESET SELECTION
    // ═══════════════════════════════════════════════════════════
    window.resetKonsepSelection = function(){
      selectedNodeId = null;

      var allNodes = document.querySelectorAll('#'+SCREEN_ID+' .hk-node');
      for(var i=0;i<allNodes.length;i++){
        allNodes[i].classList.remove('hk-selected','hk-dimmed','hk-connected','hk-bounce','hk-click-pop');
      }

      var allEdges = document.querySelectorAll('#'+SCREEN_ID+' .hk-edge');
      var allLabelBgs = document.querySelectorAll('#'+SCREEN_ID+' .hk-edge-label-bg');
      var allLabelTexts = document.querySelectorAll('#'+SCREEN_ID+' .hk-edge-label');
      for(var i=0;i<allEdges.length;i++){
        allEdges[i].classList.remove('hk-edge-active','hk-edge-dimmed');
      }
      for(var i=0;i<allLabelBgs.length;i++){
        allLabelBgs[i].classList.remove('hk-edge-label-bg-active','hk-edge-label-bg-dimmed');
      }
      for(var i=0;i<allLabelTexts.length;i++){
        allLabelTexts[i].classList.remove('hk-edge-label-active','hk-edge-label-dimmed');
      }

      var allCards = document.querySelectorAll('#'+SCREEN_ID+' .hk-detail-card');
      for(var i=0;i<allCards.length;i++) allCards[i].style.display = 'none';

      var msg = document.getElementById('konsepDefaultMsg');
      if(msg) msg.style.display = 'block';
    };

  })();
  </script>
</div>`;
}
