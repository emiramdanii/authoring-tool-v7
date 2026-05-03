/* ══════════════════════════════════════════════════════════════
   AT_MODULES — Controller utama panel Modul Pembelajaran
   Editor forms are in module-editor.js.
   Module types are in module-types.js.
   Renderers are in modules-render.js + render-*.js files.
   ══════════════════════════════════════════════════════════════ */
window.AT_MODULES = {

  // AT_STATE.modules = [{ type, ...data }]
  // Inisialisasi state jika belum ada
  ensureState() {
    if (!AT_STATE.modules) AT_STATE.modules = [];
  },

  // ── RENDER DAFTAR MODUL ─────────────────────────────────────
  render() {
    this.ensureState();
    const cont = document.getElementById("mod_list");
    if (!cont) return;
    const mods = AT_STATE.modules;

    if (!mods.length) {
      cont.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🧩</div>
          <div class="empty-state-text">Belum ada modul.<br>Klik "+ Tambah Modul" atau pilih preset di bawah.</div>
        </div>`;
      return;
    }

    cont.innerHTML = mods.map((m, i) => {
      const T = MODULE_TYPES[m.type] || { icon:"📦", label:m.type, color:"var(--muted)" };
      return `
      <div class="mod-card" id="mod_card_${i}" draggable="true" data-idx="${i}">
        <div class="mod-card-header">
          <span class="drag-handle" title="Drag untuk urutkan">⠿</span>
          <span class="mod-type-badge" style="background:${T.color}22;color:${T.color};border:1px solid ${T.color}44">
            ${T.icon} ${T.label}
          </span>
          <span class="mod-card-title">${m.title || "(tanpa judul)"}</span>
          <div class="mod-card-actions">
            <button class="icon-btn" onclick="AT_MODULES.previewMod(${i})" title="Preview di Split View">👁️</button>
            <button class="icon-btn" onclick="AT_MODULES.moveUp(${i})" title="Naik">↑</button>
            <button class="icon-btn" onclick="AT_MODULES.moveDown(${i})" title="Turun">↓</button>
            <button class="icon-btn edit" onclick="AT_MODULES.openEditor(${i})" title="Edit">✏️</button>
            <button class="icon-btn del" onclick="AT_MODULES.delete(${i})" title="Hapus">🗑️</button>
          </div>
        </div>
        <div class="mod-card-preview">${this._miniPreview(m)}</div>
      </div>`;
    }).join("");

    this._initDrag(cont);
  },

  // ── DRAG-DROP REORDER ────────────────────────────────────────
  _dragSrc: null,

  _initDrag(cont) {
    let dragSrcIdx = null;

    cont.querySelectorAll(".mod-card").forEach(card => {
      card.addEventListener("dragstart", e => {
        dragSrcIdx = +card.dataset.idx;
        card.style.opacity = "0.4";
        e.dataTransfer.effectAllowed = "move";
      });

      card.addEventListener("dragend", () => {
        card.style.opacity = "";
        cont.querySelectorAll(".mod-card").forEach(c => c.classList.remove("drag-over"));
      });

      card.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        cont.querySelectorAll(".mod-card").forEach(c => c.classList.remove("drag-over"));
        card.classList.add("drag-over");
      });

      card.addEventListener("dragleave", () => {
        card.classList.remove("drag-over");
      });

      card.addEventListener("drop", e => {
        e.preventDefault();
        const destIdx = +card.dataset.idx;
        if (dragSrcIdx === null || dragSrcIdx === destIdx) return;
        // Reorder state array
        const mods = AT_STATE.modules;
        const [moved] = mods.splice(dragSrcIdx, 1);
        mods.splice(destIdx, 0, moved);
        dragSrcIdx = null;
        AT_EDITOR.markDirty();
        AT_SPLITVIEW?.scheduleRefresh?.();
        this.render();
        AT_UTIL.toast("↕️ Urutan modul diperbarui");
      });
    });
  },

  _miniPreview(m) {
    if (m._isGame && window.AT_GAMES) return AT_GAMES._preview(m);

    // Helper: potong URL agar tidak overflow card
    const shortUrl = u => {
      if (!u) return '<em style="color:var(--r)">URL belum diisi</em>';
      try { const p = new URL(u); return p.hostname + (p.pathname.length > 20 ? p.pathname.slice(0,20)+"…" : p.pathname); }
      catch { return u.slice(0,40) + (u.length>40?"…":""); }
    };
    // Helper: preview teks singkat
    const tx = (t, n=55) => t ? (t.length>n ? t.slice(0,n)+"…" : t) : "";

    switch(m.type) {
      case "skenario":    return `<span>🎬 ${(m.chapters||[]).length} chapter · ${(m.chapters||[]).reduce((s,c)=>s+(c.choices?.length||0),0)} pilihan total</span>`;
      case "video":       return `<span>🔗 ${shortUrl(m.url)} · ${m.durasi||"durasi?"} · ${m.pertanyaan?.length||0} pertanyaan refleksi</span>`;
      case "infografis":  return `<span>🃏 ${m.kartu?.length||0} kartu · Layout: ${m.layout||"grid"}${m.intro?" · "+tx(m.intro,30):""}</span>`;
      case "flashcard":   return `<span>🃏 ${m.kartu?.length||0} kartu${m.kartu?.length ? " · "+tx(m.kartu[0]?.depan,35) : " — tambah kartu dulu"}</span>`;
      case "studi-kasus": return `<span>📰 ${m.pertanyaan?.length||0} pertanyaan${m.sumber?" · "+tx(m.sumber,30):" · sumber belum diisi"}</span>`;
      case "debat":       return `<span>🗣️ ${tx(m.pertanyaan,60)||"mosi belum diisi"} · ${m.pihakA?.label||"Pro"} vs ${m.pihakB?.label||"Kontra"}</span>`;
      case "timeline":    return `<span>📅 ${m.events?.length||0} peristiwa${m.events?.length ? " · "+tx(m.events[0]?.judul,30) : ""}</span>`;
      case "matching":    return `<span>🔀 ${m.pasangan?.length||0} pasangan${m.pasangan?.length ? " · "+tx(m.pasangan[0]?.kiri,25)+" ↔ "+tx(m.pasangan[0]?.kanan,25) : ""}</span>`;
      case "materi":      return `<span>📖 ${m.blok?.length||0} blok${m.blok?.length ? " · "+m.blok.map(b=>b.tipe||"?").join(", ").slice(0,40) : " — tambah blok konten"}</span>`;
      case "hero":        return `<span>🖼️ Tema: ${m.gradient||"sunset"}${m.chips?.length?" · "+m.chips.slice(0,3).join(", "):""}</span>`;
      case "kutipan":     return `<span>💬 "${tx(m.teks,50)}" ${m.sumber?"— "+tx(m.sumber,25):""}</span>`;
      case "langkah":     return `<span>👣 ${m.langkah?.length||0} langkah · Gaya: ${m.style||"numbered"}${m.langkah?.length?" · "+tx(m.langkah[0]?.judul,30):""}</span>`;
      case "accordion":   return `<span>🗂️ ${m.items?.length||0} item${m.items?.length?" · "+tx(m.items[0]?.judul,35):""}</span>`;
      case "statistik":   return `<span>📊 ${m.items?.length||0} data · ${m.layout||"grid"}${m.items?.length?" · "+m.items.slice(0,2).map(it=>it.angka+" "+it.satuan).join(", "):""}</span>`;
      case "polling":     return `<span>📊 ${m.opsi?.length||0} opsi${m.opsi?.length?" · "+tx(m.opsi[0]?.teks,40):""}</span>`;
      case "embed":       return `<span>🔗 ${shortUrl(m.url)}${m.tinggi?" · tinggi "+m.tinggi+"px":""}</span>`;
      case "tab-icons":   return `<span>📑 ${(m.tabs||[]).length} tab${m.tabs?.length?" · "+m.tabs.map(t=>t.icon).join(" "):""}</span>`;
      case "icon-explore":return `<span>🔍 ${(m.items||[]).length} item eksplorasi${m.items?.length?" · "+tx(m.items[0]?.judul,30):""}</span>`;
      case "comparison":  return `<span>⚖️ ${(m.kolom||[]).length} kolom · ${(m.baris||[]).length} baris</span>`;
      case "card-showcase":return `<span>🎭 ${(m.cards||[]).length} card${m.cards?.length?" · "+tx(m.cards[0]?.judul,30):""}</span>`;
      case "hotspot-image":return `<span>🗺️ ${(m.hotspots||[]).length} hotspot${m.imageUrl?' · '+shortUrl(m.imageUrl):' · URL belum diisi'}</span>`;
      default:            return `<span style="color:var(--muted)">${m.type}</span>`;
    }
  },

  // ── TAMBAH MODUL BARU ────────────────────────────────────────
  add(typeId) {
    this.ensureState();
    const T = MODULE_TYPES[typeId];
    if (!T) return;
    const data = T.defaultData();
    AT_STATE.modules.push(data);
    this.render();
    AT_EDITOR.markDirty();
    AT_UTIL.toast(`✅ Modul "${T.label}" ditambahkan`);
    // Langsung buka editor modul baru
    setTimeout(() => this.openEditor(AT_STATE.modules.length - 1), 200);
    document.getElementById("modPickerModal").classList.remove("show");
  },

  delete(i) {
    const name = AT_STATE.modules[i]?.title || "modul";
    if (!confirm(`Hapus "${name}"?`)) return;
    AT_STATE.modules.splice(i, 1);
    this.render();
    AT_EDITOR.markDirty();
    AT_UTIL.toast("🗑️ Modul dihapus");
  },

  moveUp(i) {
    if (i === 0) return;
    [AT_STATE.modules[i-1], AT_STATE.modules[i]] = [AT_STATE.modules[i], AT_STATE.modules[i-1]];
    this.render();
    AT_EDITOR.markDirty();
  },

  moveDown(i) {
    const mods = AT_STATE.modules;
    if (i >= mods.length - 1) return;
    [mods[i], mods[i+1]] = [mods[i+1], mods[i]];
    this.render();
    AT_EDITOR.markDirty();
  },

  // ── PREVIEW MODUL DI SPLIT VIEW ───────────────────────────────
  previewMod(idx) {
    if (!AT_SPLITVIEW.active) {
      AT_SPLITVIEW._autoOpened = true;
      AT_SPLITVIEW.toggle();
    }
    const sel = document.getElementById('splitPageSelect');
    if (sel) sel.value = 'smods';
    AT_SPLITVIEW._queueMessage({ goPage: 'smods' });
    setTimeout(() => {
      AT_SPLITVIEW._queueMessage({ goModP: idx });
      AT_SPLITVIEW._sendToFrame({ goModP: idx });
    }, 150);
    if (window.AT_PAGE_SYNC) {
      AT_PAGE_SYNC.markManualOverride();
      AT_PAGE_SYNC.updateSyncIndicator('smods');
    }
  },

  // ── MODAL PICKER (bertab: Modul | Game) ─────────────────────
  _pickerTab: "modul",

  showPicker() {
    const modal = document.getElementById("modPickerModal");
    if (!modal) return;
    this._renderPickerTab(this._pickerTab);
    modal.classList.add("show");
  },

  _renderPickerTab(tab) {
    this._pickerTab = tab;
    const grid   = document.getElementById("modPickerGrid");
    const tabMod = document.getElementById("modPickerTabMod");
    const tabGame= document.getElementById("modPickerTabGame");
    if (!grid) return;

    if (tabMod)  tabMod.classList.toggle("active",  tab === "modul");
    if (tabGame) tabGame.classList.toggle("active", tab === "game");

    if (tab === "modul") {
      grid.innerHTML = Object.values(MODULE_TYPES).map(T => `
        <div class="mod-type-card" onclick="AT_MODULES.add('${T.id}')">
          <div class="mod-type-card-icon">${T.icon}</div>
          <div class="mod-type-card-label">${T.label}</div>
          <div class="mod-type-card-desc">${T.desc}</div>
        </div>`).join("");
    } else {
      grid.innerHTML = window.GAME_TYPES
        ? Object.values(GAME_TYPES).map(T => `
            <div class="mod-type-card" onclick="AT_MODULES.addGame('${T.id}')">
              <div class="mod-type-card-icon">${T.icon}</div>
              <div class="mod-type-card-label">${T.label}</div>
              <div class="mod-type-card-desc">${T.desc}</div>
            </div>`).join("")
        : `<div style="color:var(--muted);padding:20px;grid-column:1/-1;text-align:center">Game belum tersedia.</div>`;
    }
  },

  // Add a game as a module block
  addGame(typeId) {
    if (!window.GAME_TYPES || !GAME_TYPES[typeId]) return;
    this.ensureState();
    const T = GAME_TYPES[typeId];
    const gameData = T.defaultData();
    AT_STATE.modules.push(Object.assign({ _isGame: true }, gameData));
    this.render();
    AT_UTIL.toast('✅ Game ditambahkan ke Modul: ' + T.label);
    document.getElementById("modPickerModal")?.classList.remove("show");
    const newIdx = AT_STATE.modules.length - 1;
    setTimeout(() => this.openEditor(newIdx), 200);
  },

  hidePicker() {
    document.getElementById("modPickerModal")?.classList.remove("show");
  },

  // ── EDITOR MODAL (detail per modul) ──────────────────────────
  _editIdx: null,

  openEditor(i) {
    this._editIdx = i;
    const m = AT_STATE.modules[i];
    if (!m) return;
    const T = MODULE_TYPES[m.type];
    const modal = document.getElementById("modEditorModal");
    const title = document.getElementById("modEditorTitle");
    const body  = document.getElementById("modEditorBody");
    if (!modal || !body) return;

    title.textContent = `${T?.icon||""} Edit: ${T?.label||m.type}`;
    body.innerHTML = this._buildEditorForm(m, i);
    modal.classList.add("show");

    // Bind all inputs
    this._bindEditorForm(m, i);

    // Render live preview pane immediately
    setTimeout(() => this.refreshPreview(), 50);
  },

  closeEditor() {
    document.getElementById("modEditorModal")?.classList.remove("show");
    this._editIdx = null;
    this.render();
  },

  // ── APPLY PRESET (migrate old AT_STATE.skenario → modules) ───
  migrateFromSkenario() {
    this.ensureState();
    const old = AT_STATE.skenario || [];
    if (!old.length) { AT_UTIL.toast("⚠️ Tidak ada skenario lama untuk dimigrasi","err"); return; }
    old.forEach(ch => {
      const newMod = Object.assign({ type:"skenario" }, ch);
      AT_STATE.modules.push(newMod);
    });
    AT_STATE.skenario = [];
    this.render();
    AT_EDITOR.markDirty();
    AT_UTIL.toast(`✅ ${old.length} skenario dipindah ke sistem Modul baru`);
  },

  // ── LIVE PREVIEW ─────────────────────────────────────────────
  _previewVisible: true,

  togglePreviewPanel() {
    const modal = document.getElementById("modEditorModal");
    const btn   = document.getElementById("modPreviewToggle");
    if (!modal) return;
    this._previewVisible = !this._previewVisible;
    modal.classList.toggle("preview-hidden", !this._previewVisible);
    if (btn) {
      btn.style.background = this._previewVisible ? "var(--c)" : "";
      btn.style.color      = this._previewVisible ? "#000" : "";
    }
  },

  refreshPreview() {
    const pane   = document.getElementById("modEditorPreview");
    const status = document.getElementById("modPreviewStatus");
    if (!pane || this._editIdx === null) return;
    const m = AT_STATE.modules[this._editIdx];
    if (!m) return;
    try {
      pane.innerHTML = this.renderModuleHtml(m);
      if (status) status.textContent = "· live";
    } catch(e) {
      pane.innerHTML = `<div style="color:var(--r);font-size:.75rem;padding:8px">Preview error: ${e.message}</div>`;
    }
  },

  _notifyChange() {
    AT_EDITOR.markDirty?.();
    AT_SPLITVIEW?.scheduleRefresh?.();
    if (this._previewVisible) this.refreshPreview();
    const card = document.getElementById("mod_card_" + this._editIdx);
    if (card) {
      const m = AT_STATE.modules[this._editIdx];
      if (m) card.querySelector(".mod-card-preview").innerHTML = this._miniPreview(m);
    }
  },

  // ── EMOJI PICKER ─────────────────────────────────────────────
  _EMOJI: {
    "Umum":     ["📚","📖","📝","✏️","🖊️","📌","📍","🔖","💡","🎯","⭐","🌟","✅","❌","⚠️","❓","❗","🔑","🏆","🎖️","💎","🔥","⚡","🌈","🎨","🎭","🎬","🎤","🎵","🎶"],
    "Alam":     ["🌱","🌿","🍃","🌲","🌳","🌴","🌵","🌺","🌸","🌼","🌻","🍀","🍁","🍂","☀️","🌙","⭐","🌊","🏔️","🌋","🌍","🌞","🌦️","❄️","🌬️","💧","🦋","🐾","🦜","🌺"],
    "Sains":    ["🔬","🧬","🧪","⚗️","🔭","🧲","⚙️","🔋","💻","📡","🛰️","🚀","🧠","💊","🩺","⚖️","📐","📏","🧮","🔢","➕","➗","🧩","🔴","🟡","🟢","🔵","⚪","🟣","🟠"],
    "Sosial":   ["👥","🤝","💬","🗣️","📢","🏫","🏛️","🕌","⛪","🗺️","🌐","🗳️","📜","📋","🏠","🎓","👨‍🎓","👩‍🎓","👩‍🏫","👨‍🏫","👮","💼","🤲","🫂","👨‍👩‍👧","🏙️","🌉","✈️","🚂","🚌"],
    "Ekspresi": ["😊","😄","🤔","😮","🤩","🥳","😎","🤓","💪","👍","✌️","🙌","👏","🤜","🙏","❤️","💛","💚","💙","💜","🧡","💫","✨","🌟","💥","🎉","🎊","🥁","🎺","🎸"],
    "Objek":    ["🎒","📦","🗃️","📂","🗂️","💾","📱","⌨️","🖥️","📺","📷","🔦","💡","🔌","🔧","🔨","⚒️","🛠️","🎁","🎀","🪄","🧸","🏺","🛡️","🗡️","🔮","🪬","🧿","🎐","🪁"],
  },

  _emojiTarget: null,
  _emojiActiveCat: "Umum",

  showEmojiPicker(triggerEl, currentVal, onSelect) {
    document.getElementById("at-emoji-picker")?.remove();
    const picker = document.createElement("div");
    picker.id    = "at-emoji-picker";
    picker.className = "emoji-picker-popup show";
    const cats   = Object.keys(this._EMOJI);
    const activeCat = this._emojiActiveCat || cats[0];
    picker.innerHTML = `
      <input class="emoji-picker-search" placeholder="🔍 Cari emoji…" id="ep-search" oninput="AT_MODULES._filterEmoji(this.value)">
      <div class="emoji-picker-cats" id="ep-cats">
        ${cats.map(c => `<button class="${c===activeCat?"active":""}" onclick="AT_MODULES._switchEmojiCat('${c}')">${c}</button>`).join("")}
      </div>
      <div class="emoji-picker-grid" id="ep-grid">
        ${(this._EMOJI[activeCat]||[]).map(em => `<button onclick="AT_MODULES._selectEmoji('${em}')">${em}</button>`).join("")}
      </div>`;
    document.body.appendChild(picker);
    const rect = triggerEl.getBoundingClientRect();
    picker.style.position = "fixed";
    picker.style.top  = Math.min(rect.bottom + 4, window.innerHeight - 290) + "px";
    picker.style.left = Math.min(rect.left, window.innerWidth - 296) + "px";
    this._emojiTarget = { onSelect };
    setTimeout(() => {
      document.addEventListener("click", AT_MODULES._closeEmojiOnOutside, { once: true });
    }, 60);
  },

  _closeEmojiOnOutside(e) {
    const p = document.getElementById("at-emoji-picker");
    if (p && !p.contains(e.target)) p.remove();
  },

  _switchEmojiCat(cat) {
    this._emojiActiveCat = cat;
    document.querySelectorAll("#ep-cats button").forEach(b => b.classList.toggle("active", b.textContent === cat));
    const grid = document.getElementById("ep-grid");
    if (grid) grid.innerHTML = (this._EMOJI[cat]||[]).map(em => `<button onclick="AT_MODULES._selectEmoji('${em}')">${em}</button>`).join("");
  },

  _filterEmoji(q) {
    const grid = document.getElementById("ep-grid");
    if (!grid) return;
    const all = Object.values(this._EMOJI).flat();
    const res = q ? all.filter(e => e.includes(q)).slice(0, 64) : this._EMOJI[this._emojiActiveCat||"Umum"];
    grid.innerHTML = (res||[]).map(em => `<button onclick="AT_MODULES._selectEmoji('${em}')">${em}</button>`).join("");
  },

  _selectEmoji(em) {
    if (this._emojiTarget?.onSelect) this._emojiTarget.onSelect(em);
    document.getElementById("at-emoji-picker")?.remove();
  },

  emojiBtn(currentVal, onSelectExpr, extraStyle) {
    return `<button type="button" class="emoji-trigger-btn" style="font-size:1.4rem;line-height:1;padding:4px 10px;border:1px solid var(--border);border-radius:8px;cursor:pointer;background:var(--bg2);min-width:46px;transition:background .15s;${extraStyle||""}"
      onclick="AT_MODULES.showEmojiPicker(this, '', v => { ${onSelectExpr}; AT_MODULES._notifyChange(); })"
    >${currentVal||"📌"}</button>`;
  },

  // ── ANIMASI PICKER ────────────────────────────────────────────
  _ANIMATIONS: [
    { id:"",         label:"Tidak ada" },
    { id:"fade-in",  label:"✨ Fade in" },
    { id:"slide-up", label:"⬆️ Slide up" },
    { id:"bounce",   label:"🏀 Bounce" },
    { id:"zoom",     label:"🔍 Zoom in" },
    { id:"flip",     label:"🔄 Flip" },
    { id:"shake",    label:"📳 Shake" },
    { id:"pulse",    label:"💓 Pulse" },
    { id:"glow",     label:"💫 Glow" },
  ],

  renderAnimPicker(m, field) {
    const cur = m[field] || "";
    return `<div style="margin-top:6px">
      <label class="field-label">Animasi Masuk</label>
      <div class="anim-picker" id="animPicker_${field}">
        ${this._ANIMATIONS.map(a =>
          `<button class="anim-chip${a.id===cur?" active":""}"
            onclick="AT_MODULES._setAnim('${field}','${a.id}',this)">${a.label}</button>`
        ).join("")}
      </div>
    </div>`;
  },

  _setAnim(field, animId, btn) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m) return;
    m[field] = animId;
    btn.closest(".anim-picker")?.querySelectorAll(".anim-chip")
      .forEach(b => b.classList.toggle("active", b === btn));
    this._notifyChange();
  },

};

/* ── SKENARIO SETUP ROW HELPER (dipakai _buildEditorForm) ──── */
function setupRow(s, si) {
  return `<div class="sub-item" id="me_setup_${si}">
    <div class="field-row">
      <div class="field-group" style="flex:0 0 140px">
        <label class="field-label">Speaker</label>
        <input class="field-input" value="${esc(s.speaker||"")}" placeholder="NARRATOR" oninput="AT_MODULES._updateDeep('setup',${si},'speaker',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Dialog</label>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('setup',${si},'text',this.value)">${esc(s.text||"")}</textarea>
      </div>
      <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('setup',${si})">🗑️</button>
    </div>
  </div>`;
}

function choiceRow(c, ci) {
  return `<div class="sub-item" id="me_choice_${ci}">
    <div class="field-row">
      <div class="field-group" style="flex:0 0 52px">
        <label class="field-label">Ikon</label>
        <input class="field-input" value="${esc(c.icon||"💡")}" maxlength="4" oninput="AT_MODULES._updateDeep('choices',${ci},'icon',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Label Pilihan</label>
        <input class="field-input" value="${esc(c.label||"")}" placeholder="Teks pilihan…" oninput="AT_MODULES._updateDeep('choices',${ci},'label',this.value)">
      </div>
      <div class="field-group" style="flex:0 0 80px">
        <label class="field-label">Level</label>
        <select class="field-select" onchange="AT_MODULES._updateDeep('choices',${ci},'level',this.value)">
          <option value="good"${c.level==="good"?" selected":""}>✅ Baik</option>
          <option value="mid"${c.level==="mid"?" selected":""}>🤔 Sedang</option>
          <option value="bad"${c.level==="bad"?" selected":""}>⚠️ Buruk</option>
        </select>
      </div>
      <div class="field-group" style="flex:0 0 60px">
        <label class="field-label">Poin</label>
        <input class="field-input" type="number" min="0" max="30" value="${c.pts||0}" oninput="AT_MODULES._updateDeep('choices',${ci},'pts',+this.value)">
      </div>
      <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('choices',${ci})">🗑️</button>
    </div>
    <input class="field-input" value="${esc(c.detail||"")}" placeholder="Deskripsi detail pilihan…" style="margin-top:5px" oninput="AT_MODULES._updateDeep('choices',${ci},'detail',this.value)">
    <div class="field-row" style="margin-top:6px">
      <div class="field-group">
        <label class="field-label">Judul Hasil</label>
        <input class="field-input" value="${esc(c.resultTitle||"")}" placeholder="Pilihan Terbaik! 🌟" oninput="AT_MODULES._updateDeep('choices',${ci},'resultTitle',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Kaitan Norma</label>
        <input class="field-input" value="${esc(c.norma||"")}" placeholder="Fungsi norma yang terkait" oninput="AT_MODULES._updateDeep('choices',${ci},'norma',this.value)">
      </div>
    </div>
    <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Penjelasan hasil pilihan ini…" oninput="AT_MODULES._updateDeep('choices',${ci},'resultBody',this.value)">${esc(c.resultBody||"")}</textarea>
  </div>`;
}

/* ── ESC HELPER ─────────────────────────────────────────────── */
function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* ── TAMBAH KE AT_STATE ──────────────────────────────────────── */
// Pastikan AT_STATE.modules ada
document.addEventListener("DOMContentLoaded", () => {
  if (!AT_STATE.modules) AT_STATE.modules = [];

  // Update AT_NAV titles
  if (AT_NAV?.go) {
    const origGo = AT_NAV.go.bind(AT_NAV);
    AT_NAV.go = function(id) {
      origGo(id);
      if (id === "modules") {
        AT_MODULES.ensureState();
        AT_MODULES.render();
      }
    };
    // Patch titles
    AT_NAV._titles = AT_NAV._titles || {};
    AT_NAV._titles["modules"] = "Modul Pembelajaran";
  }

  // Tutup modal dengan klik overlay
  ["modPickerModal","modEditorModal"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", e => { if (e.target === el) { el.classList.remove("show"); if (id==="modEditorModal") AT_MODULES.closeEditor(); } });
  });
});

console.log("✅ modules.js loaded — AT_MODULES controller ready");
