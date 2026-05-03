// ═══════════════════════════════════════════════════════════════
// HUBUNGAN-KONSEP.TS — Concept map / relationship diagram screen
// Generates an interactive concept map with nodes and edges.
// Click nodes to highlight their connections.
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

// ── Compute Node Positions (circular layout) ──────────────────
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
  const cy = 200;
  const radiusX = Math.min(210, 80 + count * 20);
  const radiusY = Math.min(160, 60 + count * 15);

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

// ── Build SVG for Concept Map ─────────────────────────────────
function buildConceptMapSVG(
  positions: NodePosition[],
  edges: HubunganKonsepSlotData['edges'],
): string {
  const nodeMap = new Map(positions.map((p) => [p.id, p]));

  // Build edges SVG
  const edgeLines = edges.map((edge, i) => {
    const from = nodeMap.get(edge.from);
    const to = nodeMap.get(edge.to);
    if (!from || !to) return '';

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    return `<line class="konsep-edge" data-from="${esc(edge.from)}" data-to="${esc(edge.to)}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="rgba(255,255,255,.2)" stroke-width="2" stroke-dasharray="6,4" style="transition:stroke .3s,stroke-width .3s" />
    <text x="${midX}" y="${midY - 6}" text-anchor="middle" fill="var(--muted)" font-size=".6rem" font-weight="700" font-family="Nunito,sans-serif" style="pointer-events:none">${esc(edge.label)}</text>`;
  }).join('');

  // Build nodes SVG
  const nodeElements = positions.map((p) => {
    return `<g class="konsep-node" data-node-id="${esc(p.id)}" style="cursor:pointer" onclick="highlightKonsepNode('${esc(p.id)}')">
      <circle cx="${p.x}" cy="${p.y}" r="30" fill="${p.color}18" stroke="${esc(p.color)}" stroke-width="2.5" style="transition:all .3s" />
      <text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="central" fill="#e8f2ff" font-size=".68rem" font-weight="900" font-family="Nunito,sans-serif" style="pointer-events:none">${esc(p.label)}</text>
    </g>`;
  }).join('');

  return `<svg viewBox="0 0 500 400" style="width:100%;max-width:500px;display:block;margin:0 auto" id="konsepSvg">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    ${edgeLines}
    ${nodeElements}
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

  // Build the edge reference map for JS
  const edgeMapJS = JSON.stringify(
    edges.map((e) => ({ from: e.from, to: e.to, label: e.label })),
  );

  // Build node detail cards
  const nodeCardsHTML = nodes
    .map((n, i) => {
      const connectedEdges = edges.filter((e) => e.from === n.id || e.to === n.id);
      return `<div class="konsep-detail-card" data-detail-id="${esc(n.id)}" style="display:none;background:${esc(n.color || '#3ecfcf')}0a;border:1px solid ${esc(n.color || '#3ecfcf')}33;border-radius:12px;padding:14px;animation:fadeIn .3s ease">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div style="width:12px;height:12px;border-radius:50%;background:${esc(n.color || '#3ecfcf')}"></div>
          <div style="font-weight:900;font-size:.92rem;color:${esc(n.color || '#3ecfcf')}">${esc(n.label)}</div>
        </div>
        ${connectedEdges.length
          ? `<div style="font-size:.76rem;color:var(--muted);margin-bottom:4px">Hubungan:</div>` +
            connectedEdges
              .map(
                (e) =>
                  `<div style="display:flex;gap:6px;font-size:.8rem;margin-bottom:3px"><span style="color:var(--c)">→</span><span>${esc(e.label)} (${esc(e.from === n.id ? e.to : e.from)})</span></div>`,
              )
              .join('')
          : '<div style="font-size:.8rem;color:var(--muted)">Tidak ada hubungan</div>'}
      </div>`;
    })
    .join('');

  return `<div class="screen" id="${esc(screenId)}">
  <nav class="navbar">
    <span class="nav-logo">${esc(data.title || 'Hubungan Konsep')}</span>
    <div class="nav-prog"><div class="nav-prog-fill" style="width:45%"></div></div>
    <span class="nav-score">0 ⭐</span>
  </nav>
  <div class="main">
    <div class="card" style="margin-bottom:14px">
      <div class="h2">🔗 <span class="hl">Hubungan</span> Konsep</div>
      <p class="sub mt8">Klik node untuk melihat hubungannya dengan konsep lain.</p>
    </div>

    <div class="card" style="padding:16px;overflow:auto">
      ${svgHTML || '<p style="color:var(--muted);text-align:center;font-size:.86rem">Node konsep belum diisi.</p>'}
    </div>

    <div class="card mt14" id="konsepDetailPanel">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">📋 Detail Konsep</div>
      <div id="konsepDetailCards">
        ${nodeCardsHTML}
      </div>
      <div id="konsepDefaultMsg" style="text-align:center;padding:12px;color:var(--muted);font-size:.84rem">
        👆 Klik salah satu node di atas untuk melihat detailnya
      </div>
    </div>

    <div class="btn-row btn-center mt20">
      <button class="btn btn-y" onclick="goNextScreen()">Lanjut →</button>
      <button class="btn btn-ghost" onclick="goPrevScreen()">← Kembali</button>
    </div>
  </div>

  <script data-konsep-init="${esc(screenId)}">
  (function(){
    var EDGES = ${edgeMapJS};

    window.highlightKonsepNode = function(nodeId){
      // Reset all nodes and edges
      var allNodes = document.querySelectorAll('.konsep-node circle');
      for(var i=0;i<allNodes.length;i++){
        allNodes[i].style.filter = 'none';
        allNodes[i].style.strokeWidth = '2.5';
        allNodes[i].style.opacity = '0.4';
      }
      var allEdges = document.querySelectorAll('.konsep-edge');
      for(var i=0;i<allEdges.length;i++){
        allEdges[i].setAttribute('stroke','rgba(255,255,255,.08)');
        allEdges[i].setAttribute('stroke-width','1');
      }

      // Highlight selected node
      var selectedG = document.querySelector('.konsep-node[data-node-id="'+nodeId+'"]');
      if(selectedG){
        var circle = selectedG.querySelector('circle');
        if(circle){
          circle.style.filter = 'url(#glow)';
          circle.style.strokeWidth = '4';
          circle.style.opacity = '1';
        }
      }

      // Highlight connected edges and nodes
      var connectedIds = [nodeId];
      for(var i=0;i<EDGES.length;i++){
        var e = EDGES[i];
        if(e.from === nodeId || e.to === nodeId){
          connectedIds.push(e.from === nodeId ? e.to : e.from);
          var line = document.querySelector('.konsep-edge[data-from="'+e.from+'"][data-to="'+e.to+'"]');
          if(line){
            line.setAttribute('stroke','var(--y)');
            line.setAttribute('stroke-width','3');
            line.removeAttribute('stroke-dasharray');
          }
        }
      }

      // Un-dim connected nodes
      for(var j=0;j<connectedIds.length;j++){
        var g = document.querySelector('.konsep-node[data-node-id="'+connectedIds[j]+'"]');
        if(g){
          var c = g.querySelector('circle');
          if(c) c.style.opacity = '1';
        }
      }

      // Show detail card
      var allCards = document.querySelectorAll('.konsep-detail-card');
      for(var i=0;i<allCards.length;i++) allCards[i].style.display = 'none';
      var detailCard = document.querySelector('.konsep-detail-card[data-detail-id="'+nodeId+'"]');
      if(detailCard) detailCard.style.display = 'block';
      var msg = document.getElementById('konsepDefaultMsg');
      if(msg) msg.style.display = 'none';
    };
  })();
  </script>
</div>`;
}
