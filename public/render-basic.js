/* ══════════════════════════════════════════════════════════════
   render-basic.js — Simple module HTML renderers
   Materi, Video, Infografis, Flashcard, Hero, Kutipan, Embed
   Split from modules-render.js for easier maintenance.
   ══════════════════════════════════════════════════════════════ */

(function() {
  const M = window.AT_MODULES;

  M._htmlMateri = function(m) {
    const blokHtml = (m.blok||[]).map(b => {
      if (b.tipe === "definisi") return `<div style="border-left:4px solid var(--y);background:rgba(249,193,46,.07);border-radius:0 11px 11px 0;padding:13px 15px;margin:10px 0;font-size:.88rem;line-height:1.7"><strong style="color:var(--y)">${b.judul||""}</strong><br>${b.isi||""}</div>`;
      if (b.tipe === "poin") return `<div style="margin:10px 0"><div style="font-weight:800;font-size:.84rem;margin-bottom:6px">${b.judul||""}</div>${(b.butir||[]).map(bt=>`<div style="display:flex;gap:8px;font-size:.82rem;margin-bottom:4px"><span style="color:var(--y);font-weight:900">•</span>${bt}</div>`).join("")}</div>`;
      return `<div style="margin:10px 0"><div style="font-weight:800;font-size:.84rem;margin-bottom:4px">${b.judul||""}</div><p style="font-size:.84rem;line-height:1.7;color:var(--muted)">${b.isi||""}</p></div>`;
    }).join("");
    return `<div class="card mt14"><div class="h2">📖 <span class="hl">${m.title||"Materi"}</span></div>${m.intro?`<p class="sub mt8">${m.intro}</p>`:""}<div style="margin-top:12px">${blokHtml}</div></div>`;
  };

  M._htmlVideo = function(m) {
    let embedUrl = m.url || "";
    if (m.platform === "youtube" && embedUrl.includes("watch?v=")) {
      const vid = embedUrl.split("watch?v=")[1]?.split("&")[0];
      if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
    }
    const qHtml = (m.pertanyaan||[]).map((p,i)=>`
      <div style="margin-bottom:10px">
        <label style="font-size:.78rem;font-weight:800;display:block;margin-bottom:4px">${i+1}. ${p.teks}${p.wajib?' <span style="color:var(--r)">*</span>':""}</label>
        <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px"></textarea>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">▶️ <span class="hl">${m.title||"Video"}</span></div>
      ${m.instruksi?`<p class="sub mt8">${m.instruksi}</p>`:""}
      ${embedUrl ? `<div style="margin:14px 0;border-radius:12px;overflow:hidden;position:relative;padding-bottom:56.25%;height:0"><iframe src="${embedUrl}" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>` : `<div style="background:rgba(255,255,255,.04);border:2px dashed var(--border);border-radius:12px;padding:24px;text-align:center;color:var(--muted);margin:14px 0">▶️ URL video belum diisi</div>`}
      ${m.pertanyaan?.length ? `<div style="margin-top:14px"><div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">✏️ Pertanyaan Refleksi</div>${qHtml}</div>` : ""}
    </div>`;
  };

  M._htmlInfografis = function(m) {
    const isGrid = m.layout !== "list" && m.layout !== "timeline";
    const kartuHtml = (m.kartu||[]).map(k=>`
      <div style="background:${k.color||"var(--y)"}12;border:1px solid ${k.color||"var(--y)"}33;border-radius:14px;padding:15px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:1.5rem">${k.icon||"📌"}</span>
          <div style="font-weight:900;font-size:.9rem;color:${k.color||"var(--y)"}">${k.judul||""}</div>
        </div>
        <div style="font-size:.8rem;color:var(--muted);line-height:1.55">${k.isi||""}</div>
      </div>`).join("");
    const grid = isGrid ? `grid-template-columns:repeat(auto-fill,minmax(180px,1fr))` : `grid-template-columns:1fr`;
    return `<div class="card mt14"><div class="h2">🗺️ <span class="hl">${m.title||"Infografis"}</span></div>${m.intro?`<p class="sub mt8">${m.intro}</p>`:""}<div style="display:grid;${grid};gap:12px;margin-top:14px">${kartuHtml}</div></div>`;
  };

  M._htmlFlashcard = function(m) {
    const id = "fc_" + Math.random().toString(36).slice(2,6);
    const kartuHtml = (m.kartu||[]).map((k,i)=>`
      <div class="fc-card" id="${id}_${i}" onclick="this.classList.toggle('flipped')" style="cursor:pointer">
        <div class="fc-inner">
          <div class="fc-front"><div class="fc-text">${k.depan||""}</div>${k.hint?`<div style="font-size:.7rem;color:var(--muted);margin-top:8px">💡 ${k.hint}</div>`:""}</div>
          <div class="fc-back"><div class="fc-text">${k.belakang||""}</div></div>
        </div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🃏 <span class="hl">${m.title||"Flashcard"}</span></div>
      ${m.instruksi?`<p class="sub mt8">${m.instruksi}</p>`:""}
      <style>.fc-card{perspective:600px;height:140px;margin-bottom:10px}.fc-inner{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}.fc-card.flipped .fc-inner{transform:rotateY(180deg)}.fc-front,.fc-back{position:absolute;inset:0;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;backface-visibility:hidden}.fc-front{background:var(--card2);border:2px solid var(--border)}.fc-back{background:rgba(52,211,153,.08);border:2px solid rgba(52,211,153,.3);transform:rotateY(180deg)}.fc-text{font-size:.9rem;font-weight:700;text-align:center;color:var(--text)}</style>
      <div style="margin-top:14px">${kartuHtml}</div>
      <p style="font-size:.72rem;color:var(--muted);text-align:center;margin-top:6px">Ketuk kartu untuk membalik ↺</p>
    </div>`;
  };

  M._htmlHero = function(m) {
    const gradients = {
      sunset:  "linear-gradient(135deg,#1a0533 0%,#6d1a3c 40%,#e8632a 100%)",
      ocean:   "linear-gradient(135deg,#0a1628 0%,#0e3d6e 50%,#0ea5e9 100%)",
      forest:  "linear-gradient(135deg,#0a1f0a 0%,#1a4d2e 50%,#22c55e 100%)",
      royal:   "linear-gradient(135deg,#0f0a2e 0%,#3b1f8c 50%,#a855f7 100%)",
      fire:    "linear-gradient(135deg,#1a0a00 0%,#7c2d12 50%,#f97316 100%)",
      aurora:  "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 80%,#00b4db 100%)"
    };
    const bg = gradients[m.gradient] || gradients.sunset;
    const chipsHtml = (m.chips||[]).map(c=>
      `<span style="background:rgba(255,255,255,.15);backdrop-filter:blur(8px);color:#fff;padding:3px 11px;border-radius:99px;font-size:.7rem;font-weight:800;border:1px solid rgba(255,255,255,.2)">${c}</span>`
    ).join("");
    return `<div style="background:${bg};border-radius:18px;padding:32px 22px;text-align:center;margin-bottom:14px;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(255,255,255,.1),transparent 70%);pointer-events:none"></div>
      ${chipsHtml ? `<div style="display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">${chipsHtml}</div>` : ""}
      <div style="font-size:3.2rem;margin-bottom:12px;animation:float 3s ease-in-out infinite">${m.ikon||"📚"}</div>
      <div style="font-family:Fredoka One,cursive;font-size:clamp(1.5rem,6vw,2.4rem);color:#fff;line-height:1.2;margin-bottom:10px;text-shadow:0 2px 20px rgba(0,0,0,.4)">${m.title||"Judul Bab"}</div>
      ${m.subjudul ? `<p style="color:rgba(255,255,255,.8);font-size:.88rem;line-height:1.6;max-width:400px;margin:0 auto 18px">${m.subjudul}</p>` : ""}
      ${m.cta ? `<div style="display:inline-flex;align-items:center;gap:7px;padding:10px 22px;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);border-radius:99px;font-weight:800;font-size:.85rem;color:#fff;cursor:default">${m.cta} →</div>` : ""}
    </div>`;
  };

  M._htmlKutipan = function(m) {
    const warna = m.warna || "var(--p)";
    if (m.style === "big") {
      return `<div style="padding:24px 18px;text-align:center;position:relative;margin-bottom:14px">
        <div style="font-size:5rem;line-height:1;color:${warna};opacity:.18;position:absolute;top:0;left:14px;font-family:Georgia,serif">"</div>
        <div style="font-family:Fredoka One,cursive;font-size:clamp(1.1rem,4vw,1.7rem);line-height:1.4;color:${warna};position:relative;z-index:1;margin:10px 0 18px">${m.teks||""}</div>
        <div style="width:40px;height:3px;background:${warna};border-radius:99px;margin:0 auto 12px"></div>
        ${m.sumber ? `<div style="font-weight:800;font-size:.85rem">${m.sumber}</div>` : ""}
        ${m.jabatan ? `<div style="font-size:.75rem;color:var(--muted);margin-top:3px">${m.jabatan}</div>` : ""}
      </div>`;
    }
    if (m.style === "minimal") {
      return `<div style="border-left:4px solid ${warna};padding:14px 16px;margin-bottom:14px;background:rgba(255,255,255,.02);border-radius:0 12px 12px 0">
        <div style="font-size:.9rem;line-height:1.7;font-style:italic;margin-bottom:8px">"${m.teks||""}"</div>
        ${m.sumber ? `<div style="font-size:.75rem;font-weight:800;color:${warna}">— ${m.sumber}${m.jabatan?` · ${m.jabatan}`:""}</div>` : ""}
      </div>`;
    }
    // card (default)
    return `<div style="background:${warna}10;border:2px solid ${warna}33;border-radius:16px;padding:20px 18px;text-align:center;margin-bottom:14px;position:relative">
      <div style="font-size:2.2rem;color:${warna};opacity:.3;position:absolute;top:10px;left:14px;font-family:Georgia,serif;line-height:1">"</div>
      <div style="font-size:.9rem;line-height:1.75;font-weight:600;margin:8px 0 16px;position:relative">"${m.teks||""}"</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:50%;background:${warna}22;border:2px solid ${warna}44;display:flex;align-items:center;justify-content:center;font-size:1rem">💬</div>
        <div style="text-align:left">
          ${m.sumber ? `<div style="font-weight:900;font-size:.84rem;color:${warna}">${m.sumber}</div>` : ""}
          ${m.jabatan ? `<div style="font-size:.72rem;color:var(--muted)">${m.jabatan}</div>` : ""}
        </div>
      </div>
    </div>`;
  };

  M._htmlEmbed = function(m) {
    const url = m.url || "";
    const tinggi = m.tinggi || 420;
    const label  = m.label || "Buka di tab baru";

    if (!url) return `
      <div class="card mt14">
        <div class="h2">🔗 <span class="hl">${m.title||"Embed"}</span></div>
        <div style="padding:40px;text-align:center;background:rgba(255,255,255,.03);border-radius:12px;margin-top:14px;border:2px dashed rgba(255,255,255,.1)">
          <div style="font-size:2rem;margin-bottom:8px">🔗</div>
          <div style="color:var(--muted);font-size:.82rem">URL belum diisi — masukkan URL embed di editor.</div>
        </div>
      </div>`;

    return `<div class="card mt14">
      <div class="h2">🔗 <span class="hl">${m.title||"Konten Embedded"}</span></div>
      <div style="margin-top:12px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08)">
        <iframe src="${url}" width="100%" height="${tinggi}" frameborder="0" allowfullscreen
          style="display:block;border-radius:12px"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
        </iframe>
      </div>
      <div style="text-align:right;margin-top:8px">
        <a href="${url}" target="_blank" rel="noopener"
          style="font-size:.75rem;color:var(--c);text-decoration:none;display:inline-flex;align-items:center;gap:5px">
          ${label} ↗
        </a>
      </div>
    </div>`;
  };

})();

console.log("✅ render-basic.js loaded");
