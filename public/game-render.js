/* ══════════════════════════════════════════════════════════════
   game-render.js — Game HTML renderers for export/preview
   Split from games.js for easier maintenance.
   Contains: renderGameHtml, _htmlTrueFalse, _htmlSorting,
   _htmlSpinWheel, _htmlMemory, _htmlTeamBuzzer, _htmlWordSearch
   ══════════════════════════════════════════════════════════════ */

(function() {
  const G = window.AT_GAMES;

  /* ── HTML RENDERERS untuk export ──────────────────────────── */
  renderGameHtml(g) {
    switch(g.type) {
      case "truefalse":  return this._htmlTrueFalse(g);
      case "sorting":    return this._htmlSorting(g);
      case "spinwheel":  return this._htmlSpinWheel(g);
      case "memory":     return this._htmlMemory(g);
      case "teambuzzer": return this._htmlTeamBuzzer(g);
      case "wordsearch": return this._htmlWordSearch(g);
      default: return "";
    }
  },

  _htmlTrueFalse(g) {
    const id = "tf_" + Math.random().toString(36).slice(2,6);
    const items = (g.pernyataan||[]).map((p,i)=>`
      <div class="game-item" id="${id}_${i}">
        <div style="font-size:.88rem;font-weight:700;line-height:1.5;margin-bottom:10px">${i+1}. ${p.teks}</div>
        <div style="display:flex;gap:10px">
          <button class="tf-btn" id="${id}_t${i}" onclick="tfAns('${id}',${i},true,${p.jawaban})">✅ BENAR</button>
          <button class="tf-btn" id="${id}_f${i}" onclick="tfAns('${id}',${i},false,${p.jawaban})">❌ SALAH</button>
        </div>
        <div id="${id}_fb${i}" style="display:none;margin-top:8px;padding:8px 10px;border-radius:8px;font-size:.79rem;font-weight:700;line-height:1.5"></div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">✅ <span class="hl">${g.title||"Benar atau Salah"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <style>.tf-btn{flex:1;padding:10px;border-radius:10px;font-weight:800;font-size:.84rem;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:var(--text);cursor:pointer;transition:all .18s}.tf-btn:hover{transform:translateY(-1px)}.tf-btn.dis{pointer-events:none}.game-item{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px}</style>
      <div style="margin-top:14px" id="${id}_cont">${items}</div>
      <div id="${id}_score" style="text-align:center;font-family:Fredoka One,cursive;font-size:1.4rem;color:var(--g);margin-top:12px;display:none"></div>
      <script>(function(){var sc=0,tot=${g.pernyataan?.length||0},ans=0;
      window.tfAns=function(gid,i,chosen,correct){
        if(gid!=='${id}')return;
        var ok=chosen===correct;if(ok)sc++;ans++;
        ['t','f'].forEach(s=>{var b=document.getElementById(gid+'_'+s+i);if(b){b.classList.add('dis');b.style.opacity='.5';}});
        var winner=document.getElementById(gid+'_'+(correct?'t':'f')+i);if(winner)winner.style.cssText+='border-color:var(--g);background:rgba(52,211,153,.12)';
        if(!ok){var loser=document.getElementById(gid+'_'+(correct?'f':'t')+i);if(loser)loser.style.cssText+='border-color:var(--r);background:rgba(255,107,107,.12)';}
        var fb=document.getElementById(gid+'_fb'+i);if(fb){fb.style.display='block';fb.style.cssText+='background:rgba('+(ok?'52,211,153':'255,107,107')+',.1);border:1px solid rgba('+(ok?'52,211,153':'255,107,107')+',.3);color:var('+(ok?'--g':'--r')+')';fb.textContent=(ok?'✅ Benar! ':'❌ Salah. ')+'${(g.pernyataan||[]).map(p=>p.penjelasan||"").join("|")}' .split('|')[i];}
        if(ans===tot){var sd=document.getElementById(gid+'_score');if(sd){sd.style.display='block';sd.textContent=sc+'/'+tot+' Benar — '+Math.round(sc/tot*100)+'%';}}
      };})();<\/script></div>`;
  },

  _htmlSorting(g) {
    const id = "st_" + Math.random().toString(36).slice(2,6);
    const items = [...(g.items||[])].sort(()=>Math.random()-.5);
    return `<div class="card mt14">
      <div class="h2">🔢 <span class="hl">${g.title||"Sortir"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <div style="margin:14px 0;display:flex;flex-wrap:wrap;gap:8px" id="${id}_pool">
        ${items.map((item,i)=>`<div class="sort-chip" id="${id}_chip${i}" draggable="true" data-kat="${item.kategori}"
          ondragstart="stDrag(event,'${id}',${i})">${item.teks}</div>`).join("")}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px" id="${id}_zones">
        ${(g.kategori||[]).map(k=>`
          <div class="sort-zone" id="${id}_zone_${k.id}" data-kat="${k.id}"
            style="border:2px dashed ${k.color}55;background:${k.color}0a;border-radius:12px;min-height:80px;padding:10px"
            ondragover="event.preventDefault()" ondrop="stDrop(event,'${id}','${k.id}')">
            <div style="font-size:.72rem;font-weight:900;color:${k.color};margin-bottom:6px">${k.label}</div>
          </div>`).join("")}
      </div>
      <div id="${id}_result" style="margin-top:10px;text-align:center;font-weight:800;font-size:.88rem;display:none"></div>
      <style>.sort-chip{padding:7px 13px;border-radius:99px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.12);font-size:.8rem;font-weight:700;cursor:grab;transition:all .18s;user-select:none}.sort-chip:hover{background:rgba(255,255,255,.14)}.sort-chip.placed{opacity:.5;pointer-events:none}</style>
      <script>(function(){var correct=0,total=${g.items?.length||0},answers=${JSON.stringify((g.items||[]).map(it=>it.kategori))};
      var chips=${JSON.stringify(items.map(it=>it.kategori))};
      var placed=0;
      window.stDrag=function(ev,gid,idx){if(gid!=='${id}')return;ev.dataTransfer.setData('text',gid+'|'+idx);};
      window.stDrop=function(ev,gid,kat){
        if(gid!=='${id}')return;ev.preventDefault();
        var [,idx]=ev.dataTransfer.getData('text').split('|');idx=+idx;
        var chip=document.getElementById(gid+'_chip'+idx);if(!chip||chip.classList.contains('placed'))return;
        var zone=document.getElementById(gid+'_zone_'+kat);if(!zone)return;
        chip.classList.add('placed');zone.appendChild(chip);placed++;
        var ok=chips[idx]===kat;
        chip.style.borderColor=ok?'var(--g)':'var(--r)';chip.style.background=ok?'rgba(52,211,153,.15)':'rgba(255,107,107,.15)';
        if(ok)correct++;
        if(placed===total){var r=document.getElementById(gid+'_result');if(r){r.style.display='block';r.style.color=correct===total?'var(--g)':'var(--y)';r.textContent=correct+'/'+total+' benar — '+(correct===total?'Sempurna! 🎉':'Coba lagi bagian yang merah!');}}
      };})();<\/script></div>`;
  },

  _htmlSpinWheel(g) {
    const id = "sw_" + Math.random().toString(36).slice(2,6);
    const soal = g.soal || [];
    const cols = ["#f5c842","#38d9d9","#ff5f6d","#a78bfa","#34d399","#fb923c","#60a5fa","#f472b6"];
    const n = soal.length || 1;
    const seg = 360 / n;
    const paths = soal.map((_,i) => {
      const a1 = i*seg, a2 = (i+1)*seg;
      const r = 130, cx = 150, cy = 150;
      const x1 = cx + r*Math.cos((a1-90)*Math.PI/180), y1 = cy + r*Math.sin((a1-90)*Math.PI/180);
      const x2 = cx + r*Math.cos((a2-90)*Math.PI/180), y2 = cy + r*Math.sin((a2-90)*Math.PI/180);
      const large = seg > 180 ? 1 : 0;
      const mid = (a1+a2)/2 - 90;
      const tx = cx + 85*Math.cos(mid*Math.PI/180), ty = cy + 85*Math.sin(mid*Math.PI/180);
      const label = soal[i].kategori || `Q${i+1}`;
      return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}Z" fill="${cols[i%cols.length]}" stroke="#0e1c2f" stroke-width="2"/>
        <text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="#0e1c2f">${label.slice(0,8)}</text>`;
    }).join("");
    return `<div class="card mt14">
      <div class="h2">🎡 <span class="hl">${g.title||"Roda Putar"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <div style="display:flex;flex-direction:column;align-items:center;margin:16px 0">
        <div style="position:relative;width:300px;height:300px">
          <svg width="300" height="300" id="${id}_wheel" style="transition:transform 4s cubic-bezier(.17,.67,.12,.99)">
            ${paths}
            <circle cx="150" cy="150" r="18" fill="#0e1c2f" stroke="rgba(255,255,255,.2)" stroke-width="2"/>
            <text x="150" y="155" text-anchor="middle" font-size="12" fill="#f5c842" font-weight="900">GO</text>
          </svg>
          <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:1.8rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))">▼</div>
        </div>
        <button class="btn btn-y" style="margin-top:16px" onclick="${id}Spin()">🎡 Putar!</button>
      </div>
      <div id="${id}_result" style="display:none;background:var(--card2);border:2px solid var(--y);border-radius:14px;padding:16px;text-align:center;animation:fadeIn .4s ease">
        <div id="${id}_kat" style="font-size:.72rem;font-weight:900;color:var(--y);margin-bottom:6px;text-transform:uppercase"></div>
        <div id="${id}_q" style="font-size:.92rem;font-weight:700;line-height:1.6"></div>
        <textarea style="width:100%;margin-top:10px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:60px" placeholder="Jawaban siswa…"></textarea>
      </div>
      <script>(function(){var soal=${JSON.stringify(soal)};var n=soal.length;var cur=0;var spinning=false;
      window['${id}Spin']=function(){if(spinning||!n)return;spinning=true;
        var idx=Math.floor(Math.random()*n);cur=idx;
        var rot=1440+idx*(360/n);var wheel=document.getElementById('${id}_wheel');
        var prev=+(wheel.style.transform||'rotate(0deg)').replace(/[^0-9.-]/g,'')||0;
        wheel.style.transform='rotate('+(prev+rot)+'deg)';
        document.getElementById('${id}_result').style.display='none';
        setTimeout(()=>{var s=soal[idx];var rd=document.getElementById('${id}_result');
          document.getElementById('${id}_kat').textContent=s.kategori||'Pertanyaan';
          document.getElementById('${id}_q').textContent=s.teks;
          rd.style.display='block';spinning=false;},4100);
      };})();<\/script></div>`;
  },

  _htmlMemory(g) {
    const id = "mem_" + Math.random().toString(36).slice(2,6);
    const pairs = g.pasangan || [];
    const cards = [];
    pairs.forEach((p,i) => { cards.push({txt:p.a,pair:i,side:"a"}); cards.push({txt:p.b,pair:i,side:"b"}); });
    cards.sort(()=>Math.random()-.5);
    const cardHtml = cards.map((c,i)=>`
      <div class="mem-card" id="${id}_${i}" data-pair="${c.pair}" data-side="${c.side}" onclick="memFlip('${id}',${i})">
        <div class="mem-inner"><div class="mem-back">?</div><div class="mem-front">${c.txt}</div></div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🧠 <span class="hl">${g.title||"Memory"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <style>.mem-card{cursor:pointer;perspective:500px;height:70px}.mem-inner{position:relative;width:100%;height:100%;transition:transform .45s;transform-style:preserve-3d}.mem-card.flip .mem-inner{transform:rotateY(180deg)}.mem-card.matched .mem-inner{transform:rotateY(180deg)}.mem-front,.mem-back{position:absolute;inset:0;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:8px;backface-visibility:hidden;text-align:center;font-size:.78rem;font-weight:700;line-height:1.3}.mem-back{background:var(--card2);border:2px solid var(--border);color:var(--muted);font-size:1.2rem}.mem-front{background:rgba(167,139,250,.12);border:2px solid rgba(167,139,250,.3);color:var(--text);transform:rotateY(180deg)}.mem-card.matched .mem-front{border-color:var(--g);background:rgba(52,211,153,.1)}</style>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px">${cardHtml}</div>
      <div id="${id}_info" style="text-align:center;margin-top:10px;font-size:.8rem;color:var(--muted)">0 / ${pairs.length} pasangan ditemukan</div>
      <script>(function(){var sel=null,selIdx=null,lock=false,found=0,total=${pairs.length};
      var data=${JSON.stringify(cards.map(c=>({pair:c.pair})))};
      window.memFlip=function(gid,i){if(gid!=='${id}'||lock)return;
        var el=document.getElementById(gid+'_'+i);
        if(!el||el.classList.contains('matched')||el.classList.contains('flip'))return;
        el.classList.add('flip');
        if(sel===null){sel=el;selIdx=i;return;}
        lock=true;
        if(data[selIdx].pair===data[i].pair&&selIdx!==i){
          found++;[sel,el].forEach(e=>e.classList.add('matched'));
          document.getElementById(gid+'_info').textContent=found+'/'+total+' pasangan ditemukan'+(found===total?' — Selesai! 🎉':'');
          sel=null;selIdx=null;lock=false;
        } else {
          setTimeout(()=>{[sel,el].forEach(e=>e.classList.remove('flip'));sel=null;selIdx=null;lock=false;},900);
        }
      };})();<\/script></div>`;
  },

  _htmlTeamBuzzer(g) {
    const id = "tb_" + Math.random().toString(36).slice(2,6);
    const soal = g.soal||[];
    return `<div class="card mt14">
      <div class="h2">🏆 <span class="hl">${g.title||"Kuis Tim"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <div id="${id}_scoreboard" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0">
        <div style="background:rgba(255,95,109,.1);border:2px solid rgba(255,95,109,.3);border-radius:12px;padding:14px;text-align:center">
          <div style="font-weight:800;font-size:.88rem;margin-bottom:6px">${g.timA||"Tim A"}</div>
          <div id="${id}_sA" style="font-family:Fredoka One,cursive;font-size:2rem;color:var(--r)">0</div>
        </div>
        <div style="background:rgba(96,165,250,.1);border:2px solid rgba(96,165,250,.3);border-radius:12px;padding:14px;text-align:center">
          <div style="font-weight:800;font-size:.88rem;margin-bottom:6px">${g.timB||"Tim B"}</div>
          <div id="${id}_sB" style="font-family:Fredoka One,cursive;font-size:2rem;color:var(--b)">0</div>
        </div>
      </div>
      <div id="${id}_q" style="background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;font-size:.9rem;font-weight:700;min-height:60px;display:flex;align-items:center;justify-content:center">Klik "Soal Berikutnya" untuk mulai</div>
      <div id="${id}_ans" style="display:none;margin-top:8px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:10px;padding:10px;font-size:.82rem;color:var(--g);font-weight:700"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
        <button class="btn btn-r btn-sm" onclick="${id}Poin('A')">+${soal[0]?.poin||10} ${g.timA||"Tim A"}</button>
        <button class="btn btn-b btn-sm" onclick="${id}Poin('B')">+${soal[0]?.poin||10} ${g.timB||"Tim B"}</button>
      </div>
      <div class="btn-row btn-center" style="margin-top:10px">
        <button class="btn btn-ghost btn-sm" onclick="${id}Next()">Soal Berikutnya →</button>
        <button class="btn btn-ghost btn-sm" onclick="${id}ShowAns()">Lihat Jawaban</button>
      </div>
      <script>(function(){var soal=${JSON.stringify(soal)};var cur=-1,sA=0,sB=0;
      window['${id}Next']=function(){cur++;if(cur>=soal.length){cur=soal.length-1;AT_UTIL?.toast('Semua soal sudah selesai!');}
        var s=soal[cur]||{teks:'Semua soal selesai!',poin:0,jawaban:''};
        document.getElementById('${id}_q').textContent=(cur+1)+'. '+s.teks;
        document.getElementById('${id}_ans').style.display='none';
        var bA=document.querySelector('#${id}_scoreboard~div .btn-r');
        var bB=document.querySelector('#${id}_scoreboard~div .btn-b');
        if(bA)bA.textContent='+'+(s.poin||10)+' ${g.timA||"Tim A"}';
        if(bB)bB.textContent='+'+(s.poin||10)+' ${g.timB||"Tim B"}';
      };
      window['${id}ShowAns']=function(){if(cur<0||cur>=soal.length)return;var a=document.getElementById('${id}_ans');a.style.display='block';a.textContent='✅ Jawaban: '+(soal[cur].jawaban||'-');};
      window['${id}Poin']=function(t){if(cur<0||cur>=soal.length)return;var p=soal[cur].poin||10;
        if(t==='A'){sA+=p;document.getElementById('${id}_sA').textContent=sA;}
        else{sB+=p;document.getElementById('${id}_sB').textContent=sB;}
      };})();<\/script></div>`;
  },

  _htmlWordSearch(g) {
    const id = "ws_" + Math.random().toString(36).slice(2,6);
    const kata = (g.kata||[]).map(k=>k.toUpperCase()).slice(0,10);
    const size = g.ukuran || 10;
    // Build grid with words placed
    const grid = Array.from({length:size},()=>Array(size).fill(""));
    const placed = [];
    const dirs = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];
    kata.forEach(word => {
      let tries = 0;
      while (tries++ < 200) {
        const [dr,dc] = dirs[Math.floor(Math.random()*dirs.length)];
        const r = Math.floor(Math.random()*size);
        const c = Math.floor(Math.random()*size);
        const cells = [];
        let ok = true;
        for (let i=0;i<word.length;i++) {
          const nr=r+dr*i, nc=c+dc*i;
          if (nr<0||nr>=size||nc<0||nc>=size||
             (grid[nr][nc] && grid[nr][nc]!==word[i])) { ok=false; break; }
          cells.push([nr,nc]);
        }
        if (ok) {
          cells.forEach(([nr,nc],i)=>grid[nr][nc]=word[i]);
          placed.push({word, cells});
          break;
        }
      }
    });
    // Fill empties
    const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    grid.forEach(row=>row.forEach((_,j,arr)=>{ if(!arr[j]) arr[j]=abc[Math.floor(Math.random()*26)]; }));
    const gridHtml = grid.map((row,r)=>
      `<div style="display:flex">${row.map((ch,c)=>
        `<div class="ws-cell" id="${id}_${r}_${c}" onclick="wsClick('${id}',${r},${c})">${ch}</div>`
      ).join("")}</div>`
    ).join("");
    const solutionMap = {};
    placed.forEach(({word,cells})=>cells.forEach(([r,c])=>{ if(!solutionMap[`${r},${c}`]) solutionMap[`${r},${c}`]=word; }));
    return `<div class="card mt14">
      <div class="h2">🔍 <span class="hl">${g.title||"Word Search"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0">${kata.map(k=>`<span id="${id}_w_${k}" class="chip chip-muted">${k}</span>`).join("")}</div>
      <style>.ws-cell{width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;cursor:pointer;border-radius:5px;transition:all .15s;border:1px solid transparent;user-select:none}.ws-cell:hover{background:rgba(245,200,66,.15)}.ws-cell.sel{background:rgba(245,200,66,.25);border-color:var(--y)}.ws-cell.found{background:rgba(52,211,153,.2);border-color:var(--g);color:var(--g);pointer-events:none}</style>
      <div style="overflow-x:auto;margin:10px 0"><div style="display:inline-block">${gridHtml}</div></div>
      <div id="${id}_msg" style="text-align:center;font-size:.82rem;font-weight:700;color:var(--muted);margin-top:8px">0 / ${kata.length} kata ditemukan</div>
      <script>(function(){
        var solution=${JSON.stringify(solutionMap)};
        var kata=${JSON.stringify(kata)};var found=new Set();
        var sel=[],selStart=null;
        window.wsClick=function(gid,r,c){if(gid!=='${id}')return;
          var key=r+','+c;var el=document.getElementById(gid+'_'+r+'_'+c);
          if(!el||el.classList.contains('found'))return;
          if(sel.length===0){sel=[[r,c]];selStart=[r,c];el.classList.add('sel');}
          else{
            sel.push([r,c]);el.classList.add('sel');
            // Check if selection spells a word
            var word=sel.map(([rr,cc])=>document.getElementById(gid+'_'+rr+'_'+cc)?.textContent||'').join('');
            var wordRev=[...word].reverse().join('');
            var match=kata.find(k=>k===word||k===wordRev);
            if(match){
              found.add(match);
              sel.forEach(([rr,cc])=>{var ce=document.getElementById(gid+'_'+rr+'_'+cc);if(ce){ce.classList.remove('sel');ce.classList.add('found');}});
              var wspan=document.getElementById(gid+'_w_'+match);if(wspan)wspan.style.cssText='background:rgba(52,211,153,.15);color:var(--g);border:1px solid rgba(52,211,153,.3);text-decoration:line-through';
              document.getElementById(gid+'_msg').textContent=found.size+'/'+kata.length+' kata ditemukan'+(found.size===kata.length?' — Semua ditemukan! 🎉':'');
              sel=[];selStart=null;
            } else if(sel.length>12){
              sel.forEach(([rr,cc])=>document.getElementById(gid+'_'+rr+'_'+cc)?.classList.remove('sel'));
              sel=[];selStart=null;
            }
          }
        };
      })();<\/script></div>`;
  },
};

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  if (!AT_STATE.games) AT_STATE.games = [];
  ["gamePickerModal","gameEditorModal"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", e => {
      if (e.target === el) {
        el.classList.remove("show");
        if (id === "gameEditorModal") AT_GAMES.closeEditor();
      }
    });
  });
});

console.log("✅ games.js loaded — 6 tipe game siap");

})();

console.log("✅ game-render.js loaded");
