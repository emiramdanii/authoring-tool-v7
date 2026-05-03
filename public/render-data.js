/* ══════════════════════════════════════════════════════════════
   render-data.js — Data display module HTML renderers
   Studi-Kasus, Debat, Timeline, Langkah, Statistik
   Split from modules-render.js for easier maintenance.
   ══════════════════════════════════════════════════════════════ */

(function() {
  const M = window.AT_MODULES;

  M._htmlStudiKasus = function(m) {
    const qHtml = (m.pertanyaan||[]).map((p,i)=>`
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px">
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:7px">
          <span style="background:rgba(96,165,250,.15);color:var(--b);padding:2px 8px;border-radius:99px;font-size:.68rem;font-weight:900">${p.level||"C1"}</span>
          <span style="font-weight:800;font-size:.82rem">${p.label||""}</span>
        </div>
        <div style="font-size:.82rem;margin-bottom:8px">${p.teks||""}</div>
        <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px" placeholder="Jawaban kamu…"></textarea>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">📰 <span class="hl">${m.title||"Studi Kasus"}</span></div>
      <div style="background:rgba(255,255,255,.04);border-left:4px solid var(--b);border-radius:0 12px 12px 0;padding:14px;margin:12px 0;font-size:.85rem;line-height:1.7">${m.teks||""}</div>
      ${m.sumber?`<div style="font-size:.7rem;color:var(--muted);margin-bottom:10px">Sumber: ${m.sumber}</div>`:""}
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">✏️ Pertanyaan Analisis</div>
      ${qHtml}
    </div>`;
  };

  M._htmlDebat = function(m) {
    return `<div class="card mt14">
      <div class="h2">🗣️ <span class="hl">${m.title||"Debat"}</span></div>
      <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;margin:12px 0;font-size:.88rem;font-weight:700;line-height:1.6;text-align:center">${m.pertanyaan||""}</div>
      ${m.konteks?`<p class="sub" style="margin-bottom:14px">${m.konteks}</p>`:""}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div style="background:rgba(52,211,153,.07);border:2px solid rgba(52,211,153,.25);border-radius:12px;padding:14px">
          <div style="font-weight:900;color:var(--g);margin-bottom:8px">✅ ${m.pihakA?.label||"Pro"}</div>
          <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:70px" placeholder="${m.pihakA?.argumen_placeholder||"Argumen pro…"}"></textarea>
        </div>
        <div style="background:rgba(255,107,107,.07);border:2px solid rgba(255,107,107,.25);border-radius:12px;padding:14px">
          <div style="font-weight:900;color:var(--r);margin-bottom:8px">❌ ${m.pihakB?.label||"Kontra"}</div>
          <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,107,107,.2);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:70px" placeholder="${m.pihakB?.argumen_placeholder||"Argumen kontra…"}"></textarea>
        </div>
      </div>
      ${m.kesimpulan_prompt?`<div style="background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.2);border-radius:12px;padding:12px"><div style="font-weight:800;font-size:.82rem;color:var(--p);margin-bottom:7px">💬 ${m.kesimpulan_prompt}</div><textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px" placeholder="Kesimpulanmu…"></textarea></div>`:""}
    </div>`;
  };

  M._htmlTimeline = function(m) {
    const evHtml = (m.events||[]).map((e,i)=>`
      <div style="display:flex;gap:14px;align-items:flex-start;padding-bottom:18px;position:relative">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(245,200,66,.15);border:2px solid var(--y);display:flex;align-items:center;justify-content:center;font-size:1.1rem">${e.icon||"📌"}</div>
          ${i<(m.events.length-1)?`<div style="width:2px;flex:1;background:rgba(255,255,255,.08);margin-top:4px;min-height:24px"></div>`:""}
        </div>
        <div style="padding-top:6px">
          <div style="font-size:.7rem;font-weight:900;color:var(--y);margin-bottom:2px">${e.tahun||""}</div>
          <div style="font-weight:800;font-size:.88rem;margin-bottom:4px">${e.judul||""}</div>
          <div style="font-size:.8rem;color:var(--muted);line-height:1.6">${e.isi||""}</div>
        </div>
      </div>`).join("");
    return `<div class="card mt14"><div class="h2">📅 <span class="hl">${m.title||"Timeline"}</span></div>${m.intro?`<p class="sub mt8">${m.intro}</p>`:""}<div style="margin-top:16px">${evHtml}</div></div>`;
  };

  M._htmlLangkah = function(m) {
    const steps = m.langkah || [];
    const stepsHtml = steps.map((l, i) => {
      const warna = l.warna || "var(--y)";
      if (m.style === "bubble") {
        return `<div style="display:flex;gap:14px;margin-bottom:16px;align-items:flex-start">
          <div style="width:44px;height:44px;border-radius:50%;background:${warna}20;border:2px solid ${warna}55;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">${l.icon||"✅"}</div>
          <div style="padding-top:4px"><div style="font-weight:800;font-size:.88rem;margin-bottom:3px;color:${warna}">${l.judul||""}</div><div style="font-size:.81rem;color:var(--muted);line-height:1.6">${l.isi||""}</div></div>
        </div>`;
      }
      if (m.style === "arrow") {
        return `<div style="background:${warna}09;border:1px solid ${warna}33;border-radius:12px;padding:13px 16px;margin-bottom:8px;display:flex;gap:12px;align-items:center">
          <div style="font-size:1.4rem;flex-shrink:0">${l.icon||"✅"}</div>
          <div style="flex:1"><div style="font-weight:800;font-size:.88rem;margin-bottom:2px;color:${warna}">${l.judul||""}</div><div style="font-size:.8rem;color:var(--muted);line-height:1.5">${l.isi||""}</div></div>
          ${i < steps.length-1 ? "" : ""}
        </div>`;
      }
      // numbered (default)
      return `<div style="display:flex;gap:13px;margin-bottom:16px;align-items:flex-start">
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center">
          <div style="width:34px;height:34px;border-radius:50%;background:${warna};color:#0e1c2f;display:flex;align-items:center;justify-content:center;font-family:Fredoka One,cursive;font-size:1rem;font-weight:900">${i+1}</div>
          ${i < steps.length-1 ? `<div style="width:2px;flex:1;min-height:20px;background:${warna}33;margin-top:3px"></div>` : ""}
        </div>
        <div style="padding-top:4px">
          <div style="font-weight:800;font-size:.88rem;margin-bottom:3px">${l.icon||""} ${l.judul||""}</div>
          <div style="font-size:.82rem;color:var(--muted);line-height:1.6">${l.isi||""}</div>
        </div>
      </div>`;
    }).join("");
    return `<div class="card mt14">
      <div class="h2">👣 <span class="hl">${m.title||"Langkah-Langkah"}</span></div>
      ${m.intro ? `<p class="sub" style="margin:7px 0 14px">${m.intro}</p>` : `<div style="margin-top:14px"></div>`}
      ${stepsHtml}
    </div>`;
  };

  M._htmlStatistik = function(m) {
    const items = m.items || [];
    const isGrid = m.layout !== 'row';

    const itemsHtml = items.map((it, i) => {
      const warna = it.warna || 'var(--y)';
      const icon = it.icon || '📊';
      const angka = it.angka || '—';
      const satuan = it.satuan || '';
      const label = it.label || '';
      return `
        <div style="background:${warna}10;border:1px solid ${warna}25;border-radius:14px;padding:18px 16px;text-align:center;transition:transform .2s,box-shadow .2s"
          onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 6px 20px ${warna}20'"
          onmouseout="this.style.transform='none';this.style.boxShadow='none'">
          <div style="font-size:1.6rem;margin-bottom:6px">${icon}</div>
          <div style="font-family:'Space Grotesk',sans-serif;font-size:2rem;font-weight:800;color:${warna};line-height:1.1">${angka}</div>
          ${satuan ? `<div style="font-size:.78rem;font-weight:700;color:${warna};margin-top:2px">${satuan}</div>` : ''}
          <div style="font-size:.76rem;color:var(--muted);margin-top:6px;line-height:1.4">${label}</div>
        </div>`;
    }).join('');

    return `<div class="card mt14">
      <div class="h2">📊 <span class="hl">${m.title||"Statistik & Angka Kunci"}</span></div>
      ${m.intro ? `<p class="sub mt8">${m.intro}</p>` : ""}
      <div style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(${isGrid?'140px':'100%'},1fr));gap:12px">
        ${itemsHtml}
      </div>
    </div>`;
  };

})();

console.log("✅ render-data.js loaded");
