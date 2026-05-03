/* ══════════════════════════════════════════════════════════════
   render-advanced.js — Advanced module HTML renderers
   Icon-Explore, Comparison, Card-Showcase, Hotspot-Image
   Split from modules-render.js for easier maintenance.
   ══════════════════════════════════════════════════════════════ */

(function() {
  const M = window.AT_MODULES;

  M._htmlIconExplore = function(m) {
    const id = "ie_" + Math.random().toString(36).slice(2,6);
    const items = m.items || [];
    const anim = m.animasi || "zoom";
    const animCSS = "@keyframes ieZoom{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}@keyframes ieFadeIn{from{opacity:0}to{opacity:1}}@keyframes ieSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes ieBounce{0%{opacity:0;transform:scale(.85)}60%{transform:scale(1.02)}100%{opacity:1;transform:scale(1)}}";

    // Grid of clickable icons
    const gridHtml = items.map((it,i) => {
      const w = it.warna || "var(--y)";
      return `<div id="${id}_icon${i}" onclick="ieOpen('${id}',${i})"
        style="background:${w}10;border:2px solid ${w}25;border-radius:16px;padding:20px 12px;text-align:center;cursor:pointer;transition:all .25s;user-select:none"
        onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 24px ${w}25';this.style.borderColor='${w}55'"
        onmouseout="this.style.transform='none';this.style.boxShadow='none';this.style.borderColor='${w}25'">
        <div style="font-size:2.8rem;margin-bottom:8px;transition:transform .2s" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${it.icon||"📌"}</div>
        <div style="font-weight:800;font-size:.84rem;color:${w};line-height:1.3">${it.judul||""}</div>
        <div style="font-size:.72rem;color:var(--muted);margin-top:4px;line-height:1.4">${it.ringkasan||""}</div>
      </div>`;
    }).join("");

    // Detail panels (hidden by default)
    const detailHtml = items.map((it,i) => {
      const w = it.warna || "var(--y)";
      const contohHtml = (it.contoh||[]).map(c =>
        `<div style="display:flex;gap:8px;font-size:.82rem;margin-bottom:5px"><span style="color:${w};font-weight:900">→</span>${c}</div>`
      ).join("");
      return `<div id="${id}_detail${i}" style="display:none;${anim==='zoom'?'animation:ieZoom .3s ease':anim==='slide-up'?'animation:ieSlideUp .3s ease':anim==='bounce'?'animation:ieBounce .4s ease':'animation:ieFadeIn .3s ease'}">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div style="width:52px;height:52px;border-radius:50%;background:${w}20;border:2px solid ${w}55;display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0">${it.icon||"📌"}</div>
          <div>
            <div style="font-weight:900;font-size:1rem;color:${w}">${it.judul||""}</div>
            <div style="font-size:.78rem;color:var(--muted)">${it.ringkasan||""}</div>
          </div>
        </div>
        <div style="font-size:.85rem;line-height:1.7;color:var(--text);margin-bottom:14px">${it.isi||""}</div>
        ${contohHtml ? `<div style="background:rgba(255,255,255,.03);border-radius:10px;padding:12px 14px;margin-bottom:10px">
          <div style="font-size:.78rem;font-weight:800;color:${w};margin-bottom:8px">📋 Contoh:</div>
          ${contohHtml}
        </div>` : ""}
        ${it.sanksi ? `<div style="display:flex;gap:8px;align-items:flex-start;background:${w}10;border:1px solid ${w}20;border-radius:10px;padding:10px 14px">
          <span style="font-size:1.1rem">⚠️</span>
          <div><div style="font-size:.75rem;font-weight:800;color:${w};margin-bottom:3px">Sanksi:</div><div style="font-size:.82rem;color:var(--text)">${it.sanksi}</div></div>
        </div>` : ""}
        <button onclick="ieBack('${id}')" style="margin-top:14px;padding:8px 18px;border-radius:99px;background:${w}20;border:1px solid ${w}40;color:${w};font-weight:700;font-size:.8rem;cursor:pointer;transition:all .15s" onmouseover="this.style.background='${w}30'" onmouseout="this.style.background='${w}20'">← Kembali</button>
      </div>`;
    }).join("");

    return `<div class="card mt14">
      <style>${animCSS}</style>
      <div class="h2">🔍 <span class="hl">${m.title||"Eksplorasi"}</span></div>
      ${m.intro ? `<p class="sub mt8">${m.intro}</p>` : ""}
      <div id="${id}_grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;margin-top:14px">${gridHtml}</div>
      <div id="${id}_detail" style="display:none;margin-top:14px">${detailHtml}</div>
      <script>(function(){
        var gid='${id}',total=${items.length};
        window.ieOpen=function(g,idx){
          if(g!==gid)return;
          document.getElementById(gid+'_grid').style.display='none';
          var det=document.getElementById(gid+'_detail');det.style.display='block';
          for(var i=0;i<total;i++){document.getElementById(gid+'_detail'+i).style.display=(i===idx)?'block':'none';}
        };
        window.ieBack=function(g){
          if(g!==gid)return;
          document.getElementById(gid+'_grid').style.display='grid';
          document.getElementById(gid+'_detail').style.display='none';
        };
      })();<\/script>
    </div>`;
  };

  // ═══════════════════════════════════════════════════════════════
  //  COMPARISON — Side-by-side category comparison

  M._htmlComparison = function(m) {
    const kolom = m.kolom || [];
    const baris = m.baris || [];
    const anim = m.animasi || "slide-up";
    const animCSS = "@keyframes cmpRow{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}";

    // Build table
    const headerCells = kolom.map((k,i) => {
      const w = k.warna || "var(--y)";
      return `<th style="padding:10px 8px;background:${w}15;border-bottom:2px solid ${w}40;text-align:center">
        <div style="font-size:1.3rem;margin-bottom:4px">${k.icon||"📌"}</div>
        <div style="font-weight:800;font-size:.8rem;color:${w}">${k.judul||""}</div>
      </th>`;
    }).join("");

    const bodyRows = baris.map((b,bi) => {
      const cells = (b.nilai||[]).map((v,vi) => {
        const w = kolom[vi]?.warna || "var(--y)";
        return `<td style="padding:10px 8px;border-bottom:1px solid var(--border);text-align:center;font-size:.8rem;color:var(--text);line-height:1.5;${bi===0?'animation:cmpRow .3s ease '+(vi*0.1)+'s both':''}">${v||"-"}</td>`;
      }).join("");
      return `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid var(--border);white-space:nowrap">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:1rem">${b.icon||"📌"}</span>
            <span style="font-weight:800;font-size:.8rem">${b.label||""}</span>
          </div>
        </td>
        ${cells}
      </tr>`;
    }).join("");

    const colCount = Math.max(kolom.length, 1);
    const colWidth = `repeat(${colCount + 1}, minmax(0, 1fr))`;

    return `<div class="card mt14">
      <style>${animCSS}</style>
      <div class="h2">⚖️ <span class="hl">${m.title||"Perbandingan"}</span></div>
      ${m.intro ? `<p class="sub mt8">${m.intro}</p>` : ""}
      <div style="margin-top:14px;overflow-x:auto;border-radius:12px;border:1px solid var(--border)">
        <table style="width:100%;border-collapse:collapse;min-width:${colCount * 120}px">
          <thead><tr>
            <th style="padding:10px 8px;background:rgba(255,255,255,.04);border-bottom:2px solid var(--border);text-align:left;width:100px"></th>
            ${headerCells}
          </tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
      ${m.tanya ? `<div style="background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.2);border-radius:12px;padding:12px 14px;margin-top:14px">
        <div style="font-size:.8rem;font-weight:800;color:var(--p);margin-bottom:7px">💬 Refleksi</div>
        <div style="font-size:.83rem;color:var(--text);margin-bottom:8px">${m.tanya}</div>
        <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px" placeholder="Jawaban kamu…"></textarea>
      </div>` : ""}
    </div>`;
  };

  // ═══════════════════════════════════════════════════════════════
  //  CARD SHOWCASE — Visual cards with hover & animations

  M._htmlCardShowcase = function(m) {
    const cards = m.cards || [];
    const anim = m.animasi || "fade-in";
    const layout = m.layout || "grid";
    const isList = layout === "list";
    const isMasonry = layout === "masonry";
    const animCSS = "@keyframes csFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes csZoom{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}";

    const cardsHtml = cards.map((c,i) => {
      const w = c.warna || "var(--y)";
      const tagHtml = (c.tag||[]).map(t =>
        `<span style="background:${w}18;color:${w};padding:2px 9px;border-radius:99px;font-size:.68rem;font-weight:700">${t}</span>`
      ).join("");
      const delay = `animation-delay:${i*0.08}s`;
      const animName = anim==="zoom"?"csZoom":"csFade";

      if (isList) {
        return `<div style="display:flex;gap:14px;align-items:flex-start;background:${w}08;border:1px solid ${w}20;border-radius:14px;padding:16px;margin-bottom:10px;animation:${animName} .4s ease ${delay} both;opacity:0;transition:all .25s;cursor:default"
          onmouseover="this.style.background='${w}14';this.style.borderColor='${w}40';this.style.transform='translateX(4px)'"
          onmouseout="this.style.background='${w}08';this.style.borderColor='${w}20';this.style.transform='none'">
          <div style="width:52px;height:52px;border-radius:14px;background:${w}20;border:2px solid ${w}40;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">${c.icon||"📌"}</div>
          <div style="flex:1">
            <div style="font-weight:900;font-size:.9rem;color:${w}">${c.judul||""}</div>
            ${c.subtitle?`<div style="font-size:.75rem;color:var(--muted);margin-bottom:6px">${c.subtitle}</div>`:""}
            <div style="font-size:.82rem;line-height:1.65;color:var(--text);margin-bottom:8px">${c.isi||""}</div>
            ${tagHtml?`<div style="display:flex;gap:5px;flex-wrap:wrap">${tagHtml}</div>`:""}
          </div>
        </div>`;
      }

      // Grid / Masonry
      return `<div style="background:${w}08;border:1px solid ${w}20;border-radius:16px;padding:18px 16px;animation:${animName} .4s ease ${delay} both;opacity:0;transition:all .3s;cursor:default;position:relative;overflow:hidden;${isMasonry?'':''}"
        onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 8px 24px ${w}20';this.style.borderColor='${w}45'"
        onmouseout="this.style.transform='none';this.style.boxShadow='none';this.style.borderColor='${w}20'">
        <div style="position:absolute;top:-10px;right:-10px;width:60px;height:60px;border-radius:50%;background:${w}08;pointer-events:none"></div>
        <div style="font-size:2.2rem;margin-bottom:10px;transition:transform .2s" onmouseover="this.style.transform='scale(1.15) rotate(-5deg)'" onmouseout="this.style.transform='scale(1) rotate(0)'">${c.icon||"📌"}</div>
        <div style="font-weight:900;font-size:.92rem;color:${w};margin-bottom:3px">${c.judul||""}</div>
        ${c.subtitle?`<div style="font-size:.74rem;color:var(--muted);margin-bottom:10px">${c.subtitle}</div>`:"<div style='margin-bottom:8px'></div>"}
        <div style="font-size:.8rem;line-height:1.65;color:var(--text);margin-bottom:10px">${c.isi||""}</div>
        ${tagHtml?`<div style="display:flex;gap:5px;flex-wrap:wrap">${tagHtml}</div>`:""}
      </div>`;
    }).join("");

    const gridStyle = isList ? "display:flex;flex-direction:column;" :
                      `display:grid;grid-template-columns:repeat(auto-fill,minmax(${isMasonry?'200px':'220px'},1fr));gap:14px;`;

    return `<div class="card mt14">
      <style>${animCSS}</style>
      <div class="h2">🎭 <span class="hl">${m.title||"Card Showcase"}</span></div>
      ${m.intro ? `<p class="sub mt8">${m.intro}</p>` : ""}
      <div style="${gridStyle}margin-top:14px">${cardsHtml}</div>
    </div>`;
  };

  // ═══════════════════════════════════════════════════════════════
  //  HOTSPOT IMAGE — Interactive image with clickable pins

  M._htmlHotspotImage = function(m) {
    const id = "hsi_" + Math.random().toString(36).slice(2,6);
    const hotspots = m.hotspots || [];
    const mode = m.mode || "pin";
    const anim = m.animasi || "bounce";
    const imgUrl = m.imageUrl || "";
    const imgH = m.imageHeight || 400;
    const animCSS = "@keyframes hsiBounce{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.2)}}@keyframes hsiPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.4)}70%{box-shadow:0 0 0 12px rgba(255,255,255,0)}}@keyframes hsiFade{from{opacity:0;transform:translate(-50%,-100%) scale(.9)}to{opacity:1;transform:translate(-50%,-100%) scale(1)}}@keyframes hsiSlide{from{opacity:0;transform:translate(-50%,-100%) translateY(8px)}to{opacity:1;transform:translate(-50%,-100%) translateY(0)}}@keyframes hsiZoom{from{opacity:0;transform:translate(-50%,-50%) scale(.6)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}";

    // No image placeholder
    if (!imgUrl) {
      return `<div class="card mt14">
        <div class="h2">🗺️ <span class="hl">${m.title||"Hotspot Image"}</span></div>
        ${m.intro ? `<p class="sub mt8">${m.intro}</p>` : ""}
        <div style="padding:60px 20px;text-align:center;background:rgba(255,255,255,.03);border-radius:14px;margin-top:14px;border:2px dashed rgba(255,255,255,.1)">
          <div style="font-size:3rem;margin-bottom:12px">🖼️</div>
          <div style="font-weight:700;font-size:.9rem;margin-bottom:6px">URL gambar belum diisi</div>
          <div style="color:var(--muted);font-size:.8rem">Masukkan URL gambar di editor untuk mengaktifkan hotspot interaktif.</div>
        </div>
      </div>`;
    }

    // Hotspot markers
    const hotspotMarkers = hotspots.map((h,i) => {
      const w = h.warna || "var(--y)";
      const x = Math.max(0, Math.min(100, h.x ?? 50));
      const y = Math.max(0, Math.min(100, h.y ?? 50));
      const animName = anim==="bounce" ? "hsiBounce 2s ease-in-out infinite" :
                       anim==="pulse"  ? "hsiPulse 2s ease-in-out infinite" :
                       anim==="zoom"   ? "hsiZoom .3s ease" : "";

      return `<div id="${id}_pin${i}" onclick="hsiToggle('${id}',${i})"
        style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);z-index:${10+i};cursor:pointer;user-select:none;${animName? 'animation:'+animName+';' : ''}"
        onmouseover="this.style.zIndex=50;this.style.filter='brightness(1.2)'"
        onmouseout="this.style.z-index=${10+i};this.style.filter='none'">
        <div style="width:36px;height:36px;border-radius:50%;background:${w};display:flex;align-items:center;justify-content:center;font-size:1.1rem;box-shadow:0 3px 12px rgba(0,0,0,.4);transition:all .2s;border:3px solid rgba(255,255,255,.7)">${h.icon||"📍"}</div>
      </div>`;
    }).join("");

    // Popup/tooltip panels
    const popupHtml = hotspots.map((h,i) => {
      const w = h.warna || "var(--y)";
      const x = Math.max(0, Math.min(100, h.x ?? 50));
      const y = Math.max(0, Math.min(100, h.y ?? 50));
      // Position tooltip above the pin, adjust if near top
      const flip = y < 25;
      const tStyle = flip
        ? `position:absolute;left:${x}%;top:calc(${y}% + 24px);transform:translateX(-50%);z-index:60;`
        : `position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-100%) translateY(-12px);z-index:60;`;

      if (mode === "card") {
        return `<div id="${id}_pop${i}" style="display:none;${tStyle}width:240px;background:var(--bg);border:2px solid ${w}55;border-radius:14px;padding:14px 16px;box-shadow:0 8px 30px rgba(0,0,0,.5);animation:hsiFade .25s ease">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:${w}20;border:2px solid ${w}50;display:flex;align-items:center;justify-content:center;font-size:1rem">${h.icon||"📍"}</div>
            <div style="font-weight:900;font-size:.88rem;color:${w}">${h.judul||"Hotspot "+(i+1)}</div>
          </div>
          <div style="font-size:.82rem;line-height:1.65;color:var(--text)">${h.isi||""}</div>
        </div>`;
      }

      // pin / tooltip mode
      return `<div id="${id}_pop${i}" style="display:none;${tStyle}min-width:180px;max-width:260px;background:var(--bg);border:1px solid ${w}40;border-radius:12px;padding:12px 14px;box-shadow:0 6px 24px rgba(0,0,0,.45);animation:hsiFade .2s ease">
        <div style="font-weight:800;font-size:.84rem;color:${w};margin-bottom:5px;display:flex;align-items:center;gap:6px">
          <span style="font-size:1rem">${h.icon||"📍"}</span>${h.judul||"Hotspot "+(i+1)}
        </div>
        <div style="font-size:.8rem;line-height:1.6;color:var(--muted)">${h.isi||""}</div>
      </div>`;
    }).join("");

    return `<div class="card mt14">
      <style>${animCSS}</style>
      <div class="h2">🗺️ <span class="hl">${m.title||"Hotspot Image"}</span></div>
      ${m.intro ? `<p class="sub mt8">${m.intro}</p>` : ""}
      <div style="margin-top:14px;position:relative;border-radius:14px;overflow:hidden;border:2px solid var(--border);background:#0a0f1a">
        <img src="${imgUrl}" alt="${m.title||""}" style="width:100%;height:${imgH}px;object-fit:cover;display:block;user-select:none;pointer-events:none" onerror="this.style.display='none'">
        <div style="position:absolute;inset:0">${hotspotMarkers}</div>
        ${popupHtml}
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;font-size:.72rem;color:var(--muted)">
        <span>📍</span> Klik titik pada gambar untuk melihat informasi
      </div>
      <script>(function(){
        var gid='${id}',cur=-1,total=${hotspots.length};
        window.hsiToggle=function(g,idx){
          if(g!==gid)return;
          // Close all popups first
          for(var i=0;i<total;i++){
            if(document.getElementById(gid+'_pop'+i))document.getElementById(gid+'_pop'+i).style.display='none';
          }
          if(cur===idx){cur=-1;return;}
          // Show this popup
          var pop=document.getElementById(gid+'_pop'+idx);
          if(pop){pop.style.display='block';pop.style.animation='none';pop.offsetHeight;pop.style.animation='';}
          cur=idx;
        };
        // Close popup when clicking outside
        document.getElementById(gid).addEventListener('click',function(e){
          if(cur===-1)return;
          var isPin=false;
          for(var i=0;i<total;i++){
            if(e.target.closest&&e.target.closest('#'+gid+'_pin'+i)){isPin=true;break;}
          }
          if(!isPin){
            for(var j=0;j<total;j++){var p=document.getElementById(gid+'_pop'+j);if(p)p.style.display='none';}
            cur=-1;
          }
        });
      })();<\/script>
    </div>`;
  };

})();

})();

console.log("✅ render-advanced.js loaded");
