/* ══════════════════════════════════════════════════════════════
   game-editor.js — Game editor form builders & helpers
   Split from games.js for easier maintenance.
   Contains: _buildForm, _bindForm, _updDeep, _addDeep, _remDeep,
   _syncKata, _syncUkuran
   ══════════════════════════════════════════════════════════════ */

(function() {
  const G = window.AT_GAMES;

  _bindForm(g) {
    const b = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => { g[key] = el.value; AT_EDITOR.markDirty(); });
    };
    b("ge_title","title"); b("ge_instruksi","instruksi");
    b("ge_timA","timA"); b("ge_timB","timB");
  },

  _updDeep(key, idx, field, val) {
    const g = AT_STATE.games[this._editIdx];
    if (g?.[key]?.[idx] !== undefined) { g[key][idx][field] = val; AT_EDITOR.markDirty(); }
  },
  _addDeep(key, item) {
    const g = AT_STATE.games[this._editIdx];
    if (!g) return;
    if (!g[key]) g[key] = [];
    g[key].push(item);
    AT_EDITOR.markDirty();
    this.openEditor(this._editIdx);
  },
  _remDeep(key, idx) {
    const g = AT_STATE.games[this._editIdx];
    g?.[key]?.splice(idx, 1);
    AT_EDITOR.markDirty();
    this.openEditor(this._editIdx);
  },

  _buildForm(g, idx) {
    const e = s => String(s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;");
    const titleField = `<div class="field-group"><label class="field-label">Judul Game</label>
      <input class="field-input" id="ge_title" value="${e(g.title)}"></div>`;
    const instr = `<div class="field-group"><label class="field-label">Instruksi</label>
      <input class="field-input" id="ge_instruksi" value="${e(g.instruksi||"")}"></div>`;

    switch (g.type) {

      case "truefalse": return titleField + instr + `
        <div class="divider"></div><div class="at-card-title">📋 Pernyataan</div>
        <div id="ge_list">${(g.pernyataan||[]).map((p,i)=>`
          <div class="sub-item">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">Pernyataan ${i+1}</label>
                <textarea class="field-textarea" rows="2" oninput="AT_GAMES._updDeep('pernyataan',${i},'teks',this.value)">${e(p.teks)}</textarea>
              </div>
              <div class="field-group" style="flex:0 0 100px">
                <label class="field-label">Jawaban</label>
                <select class="field-select" onchange="AT_GAMES._updDeep('pernyataan',${i},'jawaban',this.value==='true')">
                  <option value="true" ${p.jawaban?"selected":""}>✅ BENAR</option>
                  <option value="false" ${!p.jawaban?"selected":""}>❌ SALAH</option>
                </select>
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_GAMES._remDeep('pernyataan',${i})">🗑️</button>
            </div>
            <input class="field-input" value="${e(p.penjelasan)}" placeholder="Penjelasan/feedback…" style="margin-top:5px"
              oninput="AT_GAMES._updDeep('pernyataan',${i},'penjelasan',this.value)">
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('pernyataan',{teks:'',jawaban:true,penjelasan:''})">＋ Tambah Pernyataan</button>`;

      case "sorting": return titleField + instr + `
        <div class="divider"></div><div class="at-card-title">📂 Kategori</div>
        <div id="ge_kat">${(g.kategori||[]).map((k,i)=>`
          <div class="sub-item" style="display:flex;gap:8px;align-items:center">
            <input class="field-input" value="${e(k.label)}" placeholder="Label kategori"
              oninput="AT_GAMES._updDeep('kategori',${i},'label',this.value)" style="flex:1">
            <input class="field-input" value="${e(k.id)}" placeholder="ID (tanpa spasi)"
              oninput="AT_GAMES._updDeep('kategori',${i},'id',this.value)" style="width:100px;flex-shrink:0">
            <button class="icon-btn del" onclick="AT_GAMES._remDeep('kategori',${i})">🗑️</button>
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('kategori',{label:'',color:'var(--c)',id:Date.now().toString(36)})">＋ Kategori</button>
        <div class="divider"></div><div class="at-card-title">🃏 Item (dengan kategori tujuan)</div>
        <div id="ge_items">${(g.items||[]).map((item,i)=>`
          <div class="sub-item" style="display:flex;gap:8px;align-items:center">
            <input class="field-input" value="${e(item.teks)}" placeholder="Teks item…" style="flex:1"
              oninput="AT_GAMES._updDeep('items',${i},'teks',this.value)">
            <select class="field-select" style="width:130px;flex-shrink:0"
              onchange="AT_GAMES._updDeep('items',${i},'kategori',this.value)">
              ${(g.kategori||[]).map(k=>`<option value="${k.id}" ${item.kategori===k.id?"selected":""}>${k.label}</option>`).join("")}
            </select>
            <button class="icon-btn del" onclick="AT_GAMES._remDeep('items',${i})">🗑️</button>
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('items',{teks:'',kategori:''})">＋ Item</button>`;

      case "spinwheel": return titleField + instr + `
        <div class="divider"></div><div class="at-card-title">❓ Soal di Roda</div>
        <div id="ge_list">${(g.soal||[]).map((s,i)=>`
          <div class="sub-item">
            <div class="field-row">
              <div class="field-group">
                <textarea class="field-textarea" rows="2" placeholder="Teks pertanyaan…"
                  oninput="AT_GAMES._updDeep('soal',${i},'teks',this.value)">${e(s.teks)}</textarea>
              </div>
              <div class="field-group" style="flex:0 0 110px">
                <label class="field-label">Kategori</label>
                <input class="field-input" value="${e(s.kategori)}" placeholder="Hafalan…"
                  oninput="AT_GAMES._updDeep('soal',${i},'kategori',this.value)">
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px"
                onclick="AT_GAMES._remDeep('soal',${i})">🗑️</button>
            </div>
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('soal',{teks:'',kategori:'Umum'})">＋ Tambah Soal</button>`;

      case "memory": return titleField + instr + `
        <div class="divider"></div><div class="at-card-title">🃏 Pasangan Kartu (A ↔ B)</div>
        <div id="ge_list">${(g.pasangan||[]).map((p,i)=>`
          <div class="sub-item" style="display:flex;gap:8px;align-items:center">
            <input class="field-input" value="${e(p.a)}" placeholder="Kartu A (istilah)"
              oninput="AT_GAMES._updDeep('pasangan',${i},'a',this.value)" style="flex:1">
            <span style="color:var(--muted);padding:0 4px">↔</span>
            <input class="field-input" value="${e(p.b)}" placeholder="Kartu B (definisi)"
              oninput="AT_GAMES._updDeep('pasangan',${i},'b',this.value)" style="flex:2">
            <button class="icon-btn del" onclick="AT_GAMES._remDeep('pasangan',${i})">🗑️</button>
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('pasangan',{a:'',b:''})">＋ Pasangan</button>`;

      case "teambuzzer": return titleField + instr + `
        <div class="field-row">
          <div class="field-group"><label class="field-label">Nama Tim A</label>
            <input class="field-input" id="ge_timA" value="${e(g.timA||"Tim Merah 🔴")}"></div>
          <div class="field-group"><label class="field-label">Nama Tim B</label>
            <input class="field-input" id="ge_timB" value="${e(g.timB||"Tim Biru 🔵")}"></div>
        </div>
        <div class="divider"></div><div class="at-card-title">❓ Soal</div>
        <div id="ge_list">${(g.soal||[]).map((s,i)=>`
          <div class="sub-item">
            <div class="field-row">
              <div class="field-group">
                <textarea class="field-textarea" rows="2" placeholder="Pertanyaan…"
                  oninput="AT_GAMES._updDeep('soal',${i},'teks',this.value)">${e(s.teks)}</textarea>
              </div>
              <div class="field-group" style="flex:0 0 90px">
                <label class="field-label">Poin</label>
                <input class="field-input" type="number" min="5" max="50" value="${s.poin||10}"
                  oninput="AT_GAMES._updDeep('soal',${i},'poin',+this.value)">
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px"
                onclick="AT_GAMES._remDeep('soal',${i})">🗑️</button>
            </div>
            <input class="field-input" value="${e(s.jawaban||"")}" placeholder="Kunci jawaban…" style="margin-top:5px"
              oninput="AT_GAMES._updDeep('soal',${i},'jawaban',this.value)">
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('soal',{teks:'',jawaban:'',poin:10})">＋ Tambah Soal</button>`;

      case "wordsearch": return titleField + instr + `
        <div class="field-group"><label class="field-label">Kata yang Disembunyikan (satu per baris, HURUF KAPITAL)</label>
          <textarea class="field-textarea" id="ge_kata" rows="8"
            oninput="AT_GAMES._syncKata(this.value)">${(g.kata||[]).join("\n")}</textarea>
          <div style="font-size:.71rem;color:var(--muted);margin-top:4px">Maksimal 10 kata, masing-masing maks 10 huruf. Grid akan digenerate otomatis.</div>
        </div>
        <div class="field-group"><label class="field-label">Ukuran Grid</label>
          <select class="field-select" id="ge_ukuran" onchange="AT_GAMES._syncUkuran(+this.value)">
            ${[8,10,12,15].map(n=>`<option value="${n}"${g.ukuran===n?" selected":""}>${n}×${n}</option>`).join("")}
          </select>
        </div>`;

      default: return `<p style="color:var(--muted)">Editor untuk tipe "${g.type}" belum tersedia.</p>`;
    }
  },

  _syncKata(val) {
    const g = AT_STATE.games[this._editIdx];
    if (!g) return;
    g.kata = val.split("\n").map(s=>s.trim().toUpperCase()).filter(Boolean).slice(0,10);
    AT_EDITOR.markDirty();
  },
  _syncUkuran(n) {
    const g = AT_STATE.games[this._editIdx];
    if (!g) return;
    g.ukuran = n;
    AT_EDITOR.markDirty();
  },

})();

console.log("✅ game-editor.js loaded");
