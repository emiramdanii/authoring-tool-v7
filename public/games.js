/* ══════════════════════════════════════════════════════════════
   AT_GAMES — Controller panel Game
   Split from original games.js. Editor in game-editor.js,
   renderers in game-render.js, types in game-types.js.
   ══════════════════════════════════════════════════════════════ */
window.AT_GAMES = {

  ensureState() { if (!AT_STATE.games) AT_STATE.games = []; },

  render() {
    this.ensureState();
    const cont = document.getElementById("game_list");
    if (!cont) return;
    const games = AT_STATE.games;
    if (!games.length) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🎮</div>
        <div class="empty-state-text">Belum ada game. Klik "+ Tambah Game".</div></div>`;
      return;
    }
    cont.innerHTML = games.map((g, i) => {
      const T = GAME_TYPES[g.type] || { icon:"🎮", label:g.type, color:"var(--muted)" };
      return `<div class="mod-card" id="game_card_${i}">
        <div class="mod-card-header">
          <span class="drag-handle">⠿</span>
          <span class="mod-type-badge" style="background:${T.color}22;color:${T.color};border:1px solid ${T.color}44">${T.icon} ${T.label}</span>
          <span class="mod-card-title">${g.title||"(tanpa judul)"}</span>
          <div class="mod-card-actions">
            <button class="icon-btn" onclick="AT_GAMES.previewGame(${i})" title="Preview di Split View">👁️</button>
            <button class="icon-btn edit" onclick="AT_GAMES.openEditor(${i})">✏️</button>
            <button class="icon-btn del" onclick="AT_GAMES.delete(${i})">🗑️</button>
          </div>
        </div>
        <div class="mod-card-preview">${this._preview(g)}</div>
      </div>`;
    }).join("");
  },

  _preview(g) {
    const map = {
      truefalse:  `✅ ${g.pernyataan?.length||0} pernyataan`,
      sorting:    `🗂️ ${g.kategori?.length||0} kategori · ${g.items?.length||0} item`,
      spinwheel:  `🎡 ${g.soal?.length||0} soal di roda`,
      memory:     `🧠 ${g.pasangan?.length||0} pasangan kartu`,
      teambuzzer: `🏆 ${g.soal?.length||0} soal · ${g.timA||""} vs ${g.timB||""}`,
      wordsearch: `🔍 ${g.kata?.length||0} kata tersembunyi`,
    };
    return `<span>${map[g.type]||g.type}</span>`;
  },

  add(typeId) {
    this.ensureState();
    const T = GAME_TYPES[typeId];
    if (!T) return;
    AT_STATE.games.push(T.defaultData());
    this.render();
    AT_EDITOR.markDirty();
    document.getElementById("gamePickerModal")?.classList.remove("show");
    setTimeout(() => this.openEditor(AT_STATE.games.length - 1), 150);
  },

  delete(i) {
    if (!confirm(`Hapus game "${AT_STATE.games[i]?.title}"?`)) return;
    AT_STATE.games.splice(i, 1);
    this.render();
    AT_EDITOR.markDirty();
  },

  // ── PREVIEW GAME DI SPLIT VIEW ────────────────────────────────
  previewGame(idx) {
    // 1. Pastikan split view aktif
    if (!AT_SPLITVIEW.active) {
      AT_SPLITVIEW._autoOpened = true;
      AT_SPLITVIEW.toggle();
    }
    // 2. Navigasi ke screen game ke-idx (sgame_0, sgame_1, ...)
    const pageId = 'sgame_' + idx;
    const sel = document.getElementById('splitPageSelect');
    if (sel) sel.value = pageId;
    AT_SPLITVIEW._queueMessage({ goPage: pageId });
    AT_SPLITVIEW._sendToFrame({ goPage: pageId });
    // 3. Update sync indicator
    if (window.AT_PAGE_SYNC) {
      AT_PAGE_SYNC.markManualOverride();
      AT_PAGE_SYNC.updateSyncIndicator(pageId);
    }
  },

  showPicker() {
    const grid = document.getElementById("gamePickerGrid");
    if (!grid) return;
    grid.innerHTML = Object.values(GAME_TYPES).map(T => `
      <div class="mod-type-card" onclick="AT_GAMES.add('${T.id}')">
        <div class="mod-type-card-icon">${T.icon}</div>
        <div class="mod-type-card-label">${T.label}</div>
        <div class="mod-type-card-desc">${T.desc}</div>
      </div>`).join("");
    document.getElementById("gamePickerModal")?.classList.add("show");
  },

  _editIdx: null,
  _editFromModule: false,

  openEditor(i) {
    this._editIdx = i;
    const g = AT_STATE.games[i];
    if (!g) return;
    const T = GAME_TYPES[g.type];
    const modal = document.getElementById("gameEditorModal");
    document.getElementById("gameEditorTitle").textContent = `${T?.icon||""} Edit: ${T?.label||g.type}`;
    document.getElementById("gameEditorBody").innerHTML = this._buildForm(g, i);
    this._bindForm(g);
    modal?.classList.add("show");
  },

  closeEditor() {
    document.getElementById("gameEditorModal")?.classList.remove("show");
    this._editIdx = null;
    this.render();
  },

  applyPreset(typeId) {
    this.ensureState();
    const T = GAME_TYPES[typeId];
    if (!T) return;
    AT_STATE.games.push(T.defaultData());
    this.render();
    AT_EDITOR.markDirty();
    AT_UTIL.toast(`✅ Game "${T.label}" ditambahkan dengan data preset`);
  },

};

console.log("✅ games.js loaded — AT_GAMES controller ready");
