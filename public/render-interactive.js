/* ══════════════════════════════════════════════════════════════
   render-interactive.js — Interactive module HTML renderers
   Skenario, Matching, Accordion, Polling, Tab-Icons
   Split from modules-render.js for easier maintenance.
   ══════════════════════════════════════════════════════════════ */

(function() {
  const M = window.AT_MODULES;

  M._htmlMatching = function(m) {
    const id = "mx_" + Math.random().toString(36).slice(2,6);
    const pasangan = m.pasangan || [];
    // Shuffle kanan untuk tampilan
    const kiriHtml  = pasangan.map((p,i)=>`<div class="mx-item mx-l" id="${id}_l${i}" onclick="mxPick('${id}','l',${i})">${p.kiri}</div>`).join("");
    const kananShuf = [...pasangan.map((_,i)=>i)].sort(()=>Math.random()-.5);
    const kananHtml = kananShuf.map(i=>`<div class="mx-item mx-r" id="${id}_r${i}" onclick="mxPick('${id}','r',${i})">${pasangan[i].kanan}</div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🔀 <span class="hl">${m.title||"Pasangkan"}</span></div>
      ${m.instruksi?`<p class="sub mt8">${m.instruksi}</p>`:""}
      <style>.mx-item{padding:9px 13px;border-radius:10px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.08);cursor:pointer;font-size:.82rem;font-weight:700;margin-bottom:7px;transition:all .18s}.mx-item:hover{border-color:var(--c)}.mx-item.selected{border-color:var(--y);background:rgba(245,200,66,.1)}.mx-item.matched{border-color:var(--g);background:rgba(52,211,153,.1);pointer-events:none}.mx-item.wrong{border-color:var(--r);background:rgba(255,107,107,.1)}</style>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
        <div>${kiriHtml}</div>
        <div>${kananHtml}</div>
      </div>
      <div id="${id}_msg" style="text-align:center;margin-top:10px;font-size:.8rem;color:var(--muted)"></div>
      <script>
      (function(){
        var sel=null,selSide=null,selIdx=null,matched=0,total=${pasangan.length};
        var pairs=${JSON.stringify(pasangan)};
        window.mxPick=function(gid,side,idx){
          if(gid!=='${id}') return;
          var el=document.getElementById(gid+'_'+side+idx);
          if(!el||el.classList.contains('matched')) return;
          if(sel&&selSide===side){document.getElementById(gid+'_'+selSide+selIdx)?.classList.remove('selected');sel=null;selSide=null;selIdx=null;}
          if(!sel){sel=el;selSide=side;selIdx=idx;el.classList.add('selected');return;}
          // Check match
          var li=side==='r'?selIdx:idx, ri=side==='r'?idx:selIdx;
          if(pairs[li]&&pairs[li].kanan===pairs[ri].kanan){
            [document.getElementById(gid+'_l'+li),document.getElementById(gid+'_r'+ri)].forEach(e=>{if(e){e.classList.remove('selected');e.classList.add('matched');}});
            matched++;
            if(matched===total)document.getElementById(gid+'_msg').textContent='🎉 Semua pasangan benar!';
          } else {
            [sel,el].forEach(e=>{e.classList.add('wrong');setTimeout(()=>{e.classList.remove('wrong','selected');},600);});
          }
          sel=null;selSide=null;selIdx=null;
        };
      })();
      <\/script>
    </div>`;
  };

  M._htmlSkenario = function(m) {
    // Multi-chapter skenario — gunakan chapters[] atau fallback ke setup/choices
    const id = "sk_" + Math.random().toString(36).slice(2,6);
    // Support both: chapters[] (new) and legacy setup/choices (old)
    const chapters = m.chapters && m.chapters.length ? m.chapters : [{
      id:1, title:m.title||"Skenario",
      bg: m.bg||"sbg-kampung",
      charEmoji: m.charEmoji||"😊",
      charColor: m.charColor||"#e87070",
      charPants: m.charPants||"#4a6a9a",
      choicePrompt: m.choicePrompt||"Apa yang akan kamu lakukan?",
      setup: m.setup||[],
      choices: m.choices||[]
    }];
    const setup = chapters[0].setup || [];
    const choices = chapters[0].choices || [];
    return `<div class="card mt14">
      <div style="background:#0a0f1a;border:3px solid #1e3a5a;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(90deg,#0d1b2f,#0f2340);padding:10px 16px;border-bottom:2px solid #1e3a5a;display:flex;align-items:center;justify-content:space-between">
          <span style="font-family:Fredoka One,cursive;font-size:.9rem;color:var(--y)">🎭 ${m.title||"Skenario"}</span>
          <span id="${id}_pts" style="background:rgba(249,193,46,.15);color:var(--y);padding:3px 10px;border-radius:99px;font-size:.7rem;font-weight:800">0 poin</span>
        </div>
        <div style="position:relative;height:160px;overflow:hidden" class="${m.bg||"sbg-kampung"}">
          <div style="position:absolute;bottom:28%;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center">
            <div style="width:30px;height:30px;border-radius:50%;background:#fff2d9;border:2px solid rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:1rem">${m.charEmoji||"😊"}</div>
            <div style="width:22px;height:24px;border-radius:5px 5px 3px 3px;background:${m.charColor||"#3a7a9a"};border:2px solid rgba(0,0,0,.1);margin-top:-2px"></div>
          </div>
        </div>
        <div id="${id}_body">
          ${setup.length ? `
          <div style="background:rgba(8,16,30,.92);border-top:2px solid #1e3a5a;padding:12px 14px;min-height:76px" id="${id}_dlg">
            <div style="font-size:.7rem;font-weight:800;color:var(--c);margin-bottom:4px;text-transform:uppercase">${setup[0].speaker||"NARRATOR"}</div>
            <div style="font-size:.84rem;font-weight:700;line-height:1.5;color:#e8f2ff">${setup[0].text||""}</div>
            ${setup.length>1||choices.length?`<div style="font-size:.68rem;color:var(--muted);margin-top:5px;animation:tapP 1.4s ease-in-out infinite">Ketuk untuk lanjut ▶</div>`:""}
          </div>` : ""}
        </div>
      </div>
      <script>
      (function(){
        var step=0,done=false;
        var setup=${JSON.stringify(setup)};
        var choices=${JSON.stringify(choices)};
        var id='${id}';
        function showSetup(){
          var s=setup[step];
          document.getElementById(id+'_dlg').innerHTML='<div style="font-size:.7rem;font-weight:800;color:var(--c);margin-bottom:4px;text-transform:uppercase">'+s.speaker+'</div><div style="font-size:.84rem;font-weight:700;line-height:1.5;color:#e8f2ff">'+s.text+'</div>'+(step<setup.length-1||choices.length?'<div style="font-size:.68rem;color:var(--muted);margin-top:5px">Ketuk untuk lanjut ▶</div>':'');
        }
        function showChoices(){
          document.getElementById(id+'_body').innerHTML='<div style="padding:14px"><div style="font-size:.83rem;font-weight:800;color:var(--y);margin-bottom:10px;text-align:center">${m.choicePrompt||"Apa yang akan kamu lakukan?"}</div>'+choices.map((c,ci)=>'<div style="background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;font-size:.82rem;font-weight:700;margin-bottom:8px" onclick="skPick'+id+'('+ci+')">'+c.icon+' <div><div>'+c.label+'</div><div style="font-size:.72rem;color:var(--muted);font-weight:600">'+c.detail+'</div></div></div>').join('')+'</div>';
        }
        function tap(){if(done)return;step++;if(step<setup.length)showSetup();else if(choices.length)showChoices();}
        document.getElementById(id+'_body').addEventListener('click',tap);
        window['skPick'+id]=function(ci){
          done=true;
          var c=choices[ci];
          var icons={good:'🌟',mid:'🤔',bad:'⚠️'};
          document.getElementById(id+'_pts').textContent=(c.pts||0)+' poin';
          document.getElementById(id+'_body').innerHTML='<div style="padding:14px"><div style="border-radius:12px;padding:12px 14px;display:flex;gap:10px;margin-bottom:10px;background:rgba('+(c.level==='good'?'52,211,153':c.level==='bad'?'255,107,107':'249,193,46')+',.1);border:2px solid rgba('+(c.level==='good'?'52,211,153':c.level==='bad'?'255,107,107':'249,193,46')+',.3)"><span style="font-size:1.8rem">'+(icons[c.level]||'💡')+'</span><div><div style="font-weight:900;font-size:.88rem;color:var('+(c.level==='good'?'--g':c.level==='bad'?'--r':'--y')+')">'+(c.resultTitle||'')+'</div><div style="font-size:.79rem;color:var(--muted);line-height:1.5;margin-top:3px">'+(c.resultBody||'')+'</div></div></div>'+(c.norma?'<div style="font-size:.78rem;font-weight:700;color:var(--c);margin-bottom:8px">'+c.norma+'</div>':'')+(c.consequences||[]).map(k=>'<div style="display:flex;gap:8px;font-size:.79rem;margin-bottom:4px">'+k.icon+' '+k.text+'</div>').join('')+'</div>';
        };
      })();
      <\/script>
    </div>`;
  };

  M._htmlAccordion = function(m) {
    const id = "acc_" + Math.random().toString(36).slice(2,6);
    const itemsHtml = (m.items||[]).map((it,ii) => `
      <div style="border:1px solid var(--border);border-radius:11px;margin-bottom:7px;overflow:hidden">
        <div onclick="accToggle('${id}',${ii})" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;background:rgba(255,255,255,.03);user-select:none">
          <span style="font-size:1.1rem;flex-shrink:0">${it.icon||"❓"}</span>
          <span style="font-weight:800;font-size:.87rem;flex:1">${it.judul||""}</span>
          <span id="${id}_arr${ii}" style="color:var(--muted);font-size:.75rem;transition:transform .25s">▼</span>
        </div>
        <div id="${id}_body${ii}" style="display:none;padding:12px 16px 14px;font-size:.83rem;line-height:1.7;color:var(--muted);border-top:1px solid var(--border)">${it.isi||""}</div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🗂️ <span class="hl">${m.title||"FAQ"}</span></div>
      ${m.intro ? `<p class="sub" style="margin:7px 0 14px">${m.intro}</p>` : `<div style="margin-top:12px"></div>`}
      ${itemsHtml}
      <script>(function(){
        window.accToggle=window.accToggle||function(gid,i){
          var b=document.getElementById(gid+'_body'+i);
          var a=document.getElementById(gid+'_arr'+i);
          if(!b)return;
          var open=b.style.display!=='none';
          b.style.display=open?'none':'block';
          if(a)a.style.transform=open?'':'rotate(-180deg)';
        };
      })();<\/script>
    </div>`;
  };

  M._htmlPolling = function(m) {
    const isMultiple = m.tipe === "multiple";
    const opsiHtml = (m.opsi||[]).map((o, oi) => {
      const warna = o.warna || "var(--c)";
      return `
        <div class="polling-opsi" id="poll_opsi_${oi}"
          style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:2px solid ${warna}33;border-radius:12px;cursor:pointer;margin-bottom:8px;transition:all .18s;background:${warna}08"
          onclick="this.classList.toggle('selected');this.style.background='${warna}22';this.style.borderColor='${warna}'">
          <span style="font-size:1.3rem">${o.icon||"💬"}</span>
          <span style="font-size:.88rem;font-weight:700;flex:1">${o.teks||""}</span>
          <span style="width:20px;height:20px;border-radius:${isMultiple?"4px":"50%"};border:2px solid ${warna};display:inline-block;flex-shrink:0"></span>
        </div>`;
    }).join("");

    return `<div class="card mt14">
      <div class="h2">🗳️ <span class="hl">${m.title||"Polling"}</span></div>
      ${m.instruksi ? `<p class="sub mt8">${m.instruksi}</p>` : ""}
      <div style="margin-top:14px">${opsiHtml}</div>
      <div style="text-align:center;margin-top:12px">
        <button class="btn btn-y" style="pointer-events:none;opacity:.7">
          ${isMultiple ? "✅ Kirim Jawaban" : "🗳️ Pilih Salah Satu"}
        </button>
      </div>
      ${m.anonim ? `<div style="font-size:.71rem;color:var(--muted);text-align:center;margin-top:8px">🔒 Jawaban bersifat anonim</div>` : ""}
    </div>`;
  };

  M._htmlTabIcons = function(m) {
    const id = "ti_" + Math.random().toString(36).slice(2,6);
    const tabs = m.tabs || [];
    const anim = m.animasi || "fade-in";
    const layout = m.layout || "vertical";
    // CSS animations keyframes
    const animCSS = {
      "fade-in":  "@keyframes tiFadeIn{from{opacity:0}to{opacity:1}}",
      "slide-up": "@keyframes tiSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}",
      "zoom":     "@keyframes tiZoom{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}",
      "bounce":   "@keyframes tiBounce{0%{opacity:0;transform:scale(.85)}60%{transform:scale(1.03)}100%{opacity:1;transform:scale(1)}}"
    };
    const animStyle = animCSS[anim] || animCSS["fade-in"];
    const animApply = anim === "fade-in" ? "animation:tiFadeIn .35s ease" :
                      anim === "slide-up" ? "animation:tiSlideUp .35s ease" :
                      anim === "zoom" ? "animation:tiZoom .3s ease" :
                      "animation:tiBounce .4s ease";

    // Tab nav styles
    const isHorizontal = layout === "horizontal";
    const isPills = layout === "pills";
    let navStyle = "display:flex;flex-direction:column;gap:6px;";
    if (isHorizontal) navStyle = "display:flex;gap:6px;flex-wrap:wrap;";
    if (isPills) navStyle = "display:flex;gap:8px;flex-wrap:wrap;justify-content:center;";

    // Tab button style
    const tabBtnBase = (i) => {
      if (isPills) {
        const w = tabs[i]?.warna || "var(--y)";
        return `display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:99px;font-size:.82rem;font-weight:700;cursor:pointer;transition:all .2s;border:2px solid ${w}33;background:${w}12;color:${w};user-select:none;`;
      }
      if (isHorizontal) {
        const w = tabs[i]?.warna || "var(--y)";
        return `display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px 10px 0 0;font-size:.8rem;font-weight:700;cursor:pointer;transition:all .2s;border:1px solid var(--border);border-bottom:none;background:rgba(255,255,255,.03);color:var(--muted);user-select:none;`;
      }
      // vertical (default)
      const w = tabs[i]?.warna || "var(--y)";
      return `display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;font-size:.83rem;font-weight:700;cursor:pointer;transition:all .2s;border:1px solid var(--border);background:rgba(255,255,255,.03);color:var(--muted);user-select:none;`;
    };
    const tabBtnActive = (i) => {
      const w = tabs[i]?.warna || "var(--y)";
      if (isPills) return `background:${w};color:#0e1c2f;border-color:${w};box-shadow:0 4px 15px ${w}40;`;
      if (isHorizontal) return `background:${w}15;border-color:${w}55;color:${w};border-bottom-color:var(--bg);position:relative;z-index:1;`;
      return `background:${w}15;border-color:${w}55;color:${w};`;
    };

    const tabsNav = tabs.map((t,i) => {
      const active = i === 0;
      return `<button id="${id}_tab${i}" onclick="tiSwitch('${id}',${i})"
        style="${tabBtnBase(i)}${active ? tabBtnActive(i) : ""}"
        class="${active ? 'ti-active' : ''}">
        <span style="font-size:1.15rem">${t.icon||"📌"}</span>
        <span>${t.judul||"Tab "+(i+1)}</span>
      </button>`;
    }).join("");

    const tabsContent = tabs.map((t,i) => {
      const w = t.warna || "var(--y)";
      const poinHtml = (t.poin||[]).map(p => `
        <div style="display:flex;gap:8px;margin-bottom:6px;font-size:.82rem;line-height:1.6">
          <span style="color:${w};font-weight:900;flex-shrink:0">→</span>
          <span>${p}</span>
        </div>`).join("");
      return `<div id="${id}_body${i}" style="display:${i===0?'block':'none'};${animApply}\">
        <div style="font-size:.88rem;line-height:1.7;margin-bottom:12px;color:var(--text)">${t.isi||""}</div>
        ${poinHtml ? `<div style="margin:10px 0">${poinHtml}</div>` : ""}
        ${t.refleksi ? `<div style="background:${w}10;border:1px solid ${w}25;border-radius:10px;padding:12px 14px;margin-top:12px">
          <div style="font-size:.8rem;font-weight:800;color:${w};margin-bottom:6px">💬 ${t.refleksi}</div>
          <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:50px" placeholder="Jawaban kamu…"></textarea>
        </div>` : ""}
      </div>`;
    }).join("");

    // Layout: vertical = side tabs | horizontal = top tabs | pills = centered pills
    let containerStyle;
    if (isHorizontal) {
      containerStyle = "display:block;";
    } else if (isPills) {
      containerStyle = "display:block;";
    } else {
      containerStyle = "display:flex;gap:14px;align-items:flex-start;";
    }

    return `<div class="card mt14">
      <style>${animCSS["fade-in"]}${animCSS["slide-up"]}${animCSS["zoom"]}${animCSS["bounce"]}</style>
      <div class="h2">📑 <span class="hl">${m.title||"Tab Interaktif"}</span></div>
      ${m.intro ? `<p class="sub mt8">${m.intro}</p>` : ""}
      <div style="margin-top:14px;${containerStyle}">
        <div style="${navStyle};${!isHorizontal && !isPills ? 'flex:0 0 200px;min-width:160px;' : 'margin-bottom:10px;'}">${tabsNav}</div>
        <div style="flex:1;${isHorizontal ? 'border:1px solid var(--border);border-top:none;border-radius:0 10px 10px 10px;padding:16px;background:rgba(255,255,255,.02);' : isPills ? '' : 'border:1px solid var(--border);border-radius:10px;padding:16px;background:rgba(255,255,255,.02);'}">${tabsContent}</div>
      </div>
      <script>(function(){
        var gid='${id}',total=${tabs.length},cur=0;
        window['tiSwitch_'+gid]=function(idx){
          if(idx===cur)return;
          document.getElementById(gid+'_body'+cur).style.display='none';
          document.getElementById(gid+'_body'+idx).style.display='block';
          // Re-trigger animation
          var el=document.getElementById(gid+'_body'+idx);
          el.style.animation='none';el.offsetHeight;el.style.animation='';
          // Update tab buttons
          document.getElementById(gid+'_tab'+cur).classList.remove('ti-active');
          document.getElementById(gid+'_tab'+idx).classList.add('ti-active');
          // Re-apply active style
          var allBtns=document.querySelectorAll('[id^="'+gid+'_tab"]');
          allBtns.forEach(function(b){b.setAttribute('style',b.getAttribute('style').replace(/background:[^;]+;/g,'background:rgba(255,255,255,.03);').replace(/border-color:[^;]+55/g,'border-color:var(--border)').replace(/color:[^;]+;/g,'color:var(--muted);').replace(/box-shadow[^;]+;/g,''));});
          var activeBtn=document.getElementById(gid+'_tab'+idx);
          var w='${tabs[idx]?.warna||"var(--y)"}';
          ${isPills ? `activeBtn.style.background=w;activeBtn.style.color='#0e1c2f';activeBtn.style.borderColor=w;activeBtn.style.boxShadow='0 4px 15px '+w+'40';` : isHorizontal ? `activeBtn.style.background=w+'15';activeBtn.style.borderColor=w+'55';activeBtn.style.color=w;activeBtn.style.borderBottomColor='var(--bg)';activeBtn.style.position='relative';activeBtn.style.zIndex='1';` : `activeBtn.style.background=w+'15';activeBtn.style.borderColor=w+'55';activeBtn.style.color=w;`}
          cur=idx;
        };
        // Expose global switch
        window.tiSwitch=function(g,i){if(g===gid)window['tiSwitch_'+gid](i);};
      })();<\/script>
    </div>`;
  };

  // ═══════════════════════════════════════════════════════════════
  //  ICON EXPLORE — Grid icons with expandable detail

})();

console.log("✅ render-interactive.js loaded");
