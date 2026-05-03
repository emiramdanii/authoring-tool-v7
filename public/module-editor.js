/* ══════════════════════════════════════════════════════════════
   module-editor.js — Module editor form builders & helpers
   Split from modules.js for easier maintenance.
   Contains: _buildEditorForm, _bindEditorForm, _updateDeep,
   _addDeep, _removeDeep, _patchList, row builders, etc.
   ══════════════════════════════════════════════════════════════ */

(function() {
  const M = window.AT_MODULES;

  _buildEditorForm(m, idx) {
    const i = idx;
    // If this is a game module, use AT_GAMES editor
    if (m._isGame && window.AT_GAMES) {
      // Store game index mapping
      AT_GAMES._editIdx = idx;
      AT_GAMES._editFromModule = true;
      return AT_GAMES._buildForm(m, idx);
    }
    switch(m.type) {

      // ── SKENARIO (multi-chapter) ──
      case "skenario": {
        const chs = m.chapters || [];
        const chaptersHtml = chs.map((ch,ci) => `
          <div class="sub-item" id="skm_ch${ci}">
            <div class="list-item-header">
              <span class="drag-handle">⠿</span>
              <div class="list-item-num" style="background:rgba(251,146,60,.15);color:var(--o)">${ci+1}</div>
              <span class="list-item-label">${ch.title||"Skenario "+(ci+1)}</span>
              <div class="list-item-actions">
                <button class="icon-btn edit" onclick="AT_SK_EDITOR.open(${idx},${ci})">✏️</button>
                <button class="icon-btn del" onclick="AT_MODULES._delChapter(${idx},${ci})">🗑️</button>
              </div>
            </div>
            <div style="font-size:.73rem;color:var(--muted);padding:0 0 4px 4px">
              Latar: ${ch.bg||"-"} · ${ch.setup?.length||0} dialog · ${ch.choices?.length||0} pilihan
            </div>
          </div>`).join("");

        return `
        <div class="field-group"><label class="field-label">Judul Modul Skenario</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}"></div>
        <div class="divider"></div>
        <div class="at-card-title">🎭 Daftar Chapter / Skenario</div>
        <div id="skm_chapters">${chaptersHtml || '<div class="empty-state" style="padding:16px"><div class="empty-state-text">Belum ada chapter.</div></div>'}</div>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn btn-y btn-sm" onclick="AT_MODULES._addChapter(${idx})">＋ Tambah Chapter</button>
        </div>`;
      }
      // ── VIDEO ──
      case "video": return `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">URL Video</label>
          <input class="field-input" id="me_url" value="${esc(m.url||"")}" placeholder="https://youtube.com/watch?v=...">
          <div style="font-size:.71rem;color:var(--muted);margin-top:4px">YouTube: paste link biasa. Google Drive: link share. URL lain: link langsung.</div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Platform</label>
            <select class="field-select" id="me_platform">
              <option value="youtube"${m.platform==="youtube"?" selected":""}>YouTube</option>
              <option value="drive"${m.platform==="drive"?" selected":""}>Google Drive</option>
              <option value="url"${m.platform==="url"?" selected":""}>URL Langsung</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Durasi</label>
            <input class="field-input" id="me_durasi" value="${esc(m.durasi||"")}" placeholder="5 menit">
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Instruksi untuk Siswa</label>
          <textarea class="field-textarea" id="me_instruksi" rows="2">${esc(m.instruksi||"")}</textarea>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">❓ Pertanyaan Refleksi</div>
        <div id="me_pertanyaanList">${(m.pertanyaan||[]).map((p,pi)=>`
          <div class="sub-item" id="me_prt_${pi}">
            <input class="field-input" value="${esc(p.teks||"")}" placeholder="Pertanyaan refleksi…" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'teks',this.value)">
            <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
              <label style="font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:5px">
                <input type="checkbox" ${p.wajib?"checked":""} onchange="AT_MODULES._updateDeep('pertanyaan',${pi},'wajib',this.checked)"> Wajib dijawab
              </label>
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('pertanyaan',${pi})">🗑️</button>
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('pertanyaan',{teks:'',wajib:false})">＋ Tambah Pertanyaan</button>
      `;

      // ── INFOGRAFIS ──
      case "infografis": return `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Layout</label>
            <select class="field-select" id="me_layout">
              <option value="grid"${m.layout==="grid"?" selected":""}>Grid (kotak-kotak)</option>
              <option value="list"${m.layout==="list"?" selected":""}>List (berurutan)</option>
              <option value="timeline"${m.layout==="timeline"?" selected":""}>Timeline</option>
            </select>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Teks Intro</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🃏 Kartu Konsep</div>
        <div id="me_kartuList">${(m.kartu||[]).map((k,ki)=>`
          <div class="sub-item" id="me_kartu_${ki}">
            <div class="field-row" style="margin-bottom:6px">
              <input class="field-input" value="${esc(k.icon||"📌")}" maxlength="4" style="width:52px;flex-shrink:0" placeholder="🎯" oninput="AT_MODULES._updateDeep('kartu',${ki},'icon',this.value)">
              <input class="field-input" value="${esc(k.judul||"")}" placeholder="Judul kartu" oninput="AT_MODULES._updateDeep('kartu',${ki},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('kartu',${ki})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="2" placeholder="Isi kartu…" oninput="AT_MODULES._updateDeep('kartu',${ki},'isi',this.value)">${esc(k.isi||"")}</textarea>
            <div style="display:flex;gap:6px;margin-top:5px;align-items:center">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>
                `<div onclick="AT_MODULES._updateDeep('kartu',${ki},'color','${col}')" style="width:18px;height:18px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${k.color===col?"#fff":"transparent"}"></div>`
              ).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('kartu',{icon:'📌',judul:'',isi:'',color:'var(--y)'})">＋ Tambah Kartu</button>
      `;

      // ── FLASHCARD ──
      case "flashcard": return `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Instruksi</label>
          <input class="field-input" id="me_instruksi" value="${esc(m.instruksi||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🃏 Kartu (Depan ↔ Belakang)</div>
        <div id="me_kartuList">${(m.kartu||[]).map((k,ki)=>`
          <div class="sub-item" id="me_kartu_${ki}">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">Depan (pertanyaan/istilah)</label>
                <input class="field-input" value="${esc(k.depan||"")}" oninput="AT_MODULES._updateDeep('kartu',${ki},'depan',this.value)">
              </div>
              <div class="field-group">
                <label class="field-label">Belakang (jawaban/definisi)</label>
                <input class="field-input" value="${esc(k.belakang||"")}" oninput="AT_MODULES._updateDeep('kartu',${ki},'belakang',this.value)">
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('kartu',${ki})">🗑️</button>
            </div>
            <input class="field-input" value="${esc(k.hint||"")}" placeholder="Hint (opsional)…" style="margin-top:5px" oninput="AT_MODULES._updateDeep('kartu',${ki},'hint',this.value)">
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('kartu',{depan:'',belakang:'',hint:''})">＋ Tambah Kartu</button>
      `;

      // ── STUDI KASUS ──
      case "studi-kasus": return `
        <div class="field-group">
          <label class="field-label">Judul Kasus</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Narasi / Teks Kasus</label>
          <textarea class="field-textarea" id="me_teks" rows="6">${esc(m.teks||"")}</textarea>
        </div>
        <div class="field-group">
          <label class="field-label">Sumber (opsional)</label>
          <input class="field-input" id="me_sumber" value="${esc(m.sumber||"")}" placeholder="Kompas, 2024">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">❓ Pertanyaan Analisis</div>
        <div id="me_pertanyaanList">${(m.pertanyaan||[]).map((p,pi)=>`
          <div class="sub-item" id="me_prt_${pi}">
            <div class="field-row">
              <div class="field-group" style="flex:0 0 80px">
                <label class="field-label">Level</label>
                <select class="field-select" onchange="AT_MODULES._updateDeep('pertanyaan',${pi},'level',this.value)">
                  ${["C1","C2","C3","C4","C5","C6"].map(l=>`<option value="${l}"${p.level===l?" selected":""}>${l}</option>`).join("")}
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Label</label>
                <input class="field-input" value="${esc(p.label||"")}" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'label',this.value)">
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('pertanyaan',${pi})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'teks',this.value)">${esc(p.teks||"")}</textarea>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('pertanyaan',{level:'C1',icon:'🔍',label:'',teks:''})">＋ Tambah Pertanyaan</button>
      `;

      // ── DEBAT ──
      case "debat": return `
        <div class="field-group">
          <label class="field-label">Judul Debat</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Pertanyaan Debat / Mosi</label>
          <textarea class="field-textarea" id="me_pertanyaan" rows="2">${esc(m.pertanyaan||"")}</textarea>
        </div>
        <div class="field-group">
          <label class="field-label">Konteks / Latar Belakang</label>
          <textarea class="field-textarea" id="me_konteks" rows="2">${esc(m.konteks||"")}</textarea>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Label Pihak Pro ✅</label>
            <input class="field-input" id="me_labelA" value="${esc(m.pihakA?.label||"Pro / Setuju")}">
          </div>
          <div class="field-group">
            <label class="field-label">Label Pihak Kontra ❌</label>
            <input class="field-input" id="me_labelB" value="${esc(m.pihakB?.label||"Kontra / Tidak Setuju")}">
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Prompt Kesimpulan</label>
          <input class="field-input" id="me_kesimpulan" value="${esc(m.kesimpulan_prompt||"")}">
        </div>
      `;

      // ── TIMELINE ──
      case "timeline": return `
        <div class="field-group">
          <label class="field-label">Judul Timeline</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Teks Intro</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">📅 Peristiwa / Event</div>
        <div id="me_eventList">${(m.events||[]).map((e,ei)=>`
          <div class="sub-item" id="me_ev_${ei}">
            <div class="field-row">
              ${AT_MODULES.emojiBtn(e.icon||"📌", `AT_MODULES._updateDeep('events',${ei},'icon',v)`)}
              <input class="field-input" value="${esc(e.tahun||"")}" placeholder="Tahun/Tanggal" style="width:110px;flex-shrink:0" oninput="AT_MODULES._updateDeep('events',${ei},'tahun',this.value)">
              <input class="field-input" value="${esc(e.judul||"")}" placeholder="Judul peristiwa" oninput="AT_MODULES._updateDeep('events',${ei},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('events',${ei})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Deskripsi peristiwa…" oninput="AT_MODULES._updateDeep('events',${ei},'isi',this.value)">${esc(e.isi||"")}</textarea>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('events',{icon:'📌',tahun:'',judul:'',isi:''})">＋ Tambah Peristiwa</button>
      `;

      // ── MATCHING ──
      case "matching": return `
        <div class="field-group">
          <label class="field-label">Judul Game</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Instruksi</label>
          <input class="field-input" id="me_instruksi" value="${esc(m.instruksi||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🔀 Pasangan (Kiri ↔ Kanan)</div>
        <div id="me_pasanganList">${(m.pasangan||[]).map((p,pi)=>`
          <div class="sub-item" id="me_pas_${pi}">
            <div class="field-row">
              <input class="field-input" value="${esc(p.kiri||"")}" placeholder="Kiri (istilah/soal)" oninput="AT_MODULES._updateDeep('pasangan',${pi},'kiri',this.value)">
              <span style="color:var(--muted);padding:0 4px;align-self:center">↔</span>
              <input class="field-input" value="${esc(p.kanan||"")}" placeholder="Kanan (definisi/jawaban)" oninput="AT_MODULES._updateDeep('pasangan',${pi},'kanan',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('pasangan',${pi})">🗑️</button>
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('pasangan',{kiri:'',kanan:''})">＋ Tambah Pasangan</button>
      `;

      // ── MATERI ──
      case "materi": return `
        <div class="field-group">
          <label class="field-label">Judul Materi</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Teks Pembuka (opsional)</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">📦 Blok Konten</div>
        <div id="me_blokList">${(m.blok||[]).map((b,bi)=>this._blokEditorRow(b,bi)).join("")}</div>
        <div class="btn-row" style="margin-top:8px">
          <button class="btn btn-ghost btn-sm" onclick="AT_MODULES._addDeep('blok',{tipe:'penjelasan',judul:'',isi:''})">＋ Penjelasan</button>
          <button class="btn btn-ghost btn-sm" onclick="AT_MODULES._addDeep('blok',{tipe:'definisi',judul:'',isi:''})">＋ Definisi</button>
          <button class="btn btn-ghost btn-sm" onclick="AT_MODULES._addDeep('blok',{tipe:'poin',judul:'',butir:['']})">＋ Poin-Poin</button>
        </div>
      `;

      // ── HERO BANNER ──
      case "hero": {
        const gradOpts = ["sunset","ocean","forest","royal","fire","aurora"].map(g=>
          `<option value="${g}"${m.gradient===g?" selected":""}>${g}</option>`).join("");
        return `
        <div class="field-group">
          <label class="field-label">Judul Utama</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Subjudul / Deskripsi</label>
          <textarea class="field-textarea" rows="2" id="me_teks">${esc(m.subjudul||"")}</textarea>
        </div>
        <div class="field-row">
          <div class="field-group" style="flex:0 0 80px">
            <label class="field-label">Ikon/Emoji</label>
            <input class="field-input" id="me_ikon" value="${esc(m.ikon||"📚")}" maxlength="4" placeholder="📚">
          </div>
          <div class="field-group">
            <label class="field-label">Tema Warna</label>
            <select class="field-select" id="me_gradient">${gradOpts}</select>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Label CTA (tombol, biarkan kosong jika tidak mau)</label>
          <input class="field-input" id="me_cta" value="${esc(m.cta||"")}" placeholder="Mulai Belajar">
        </div>
        <div class="field-group">
          <label class="field-label">Chips / Badge (pisahkan dengan koma)</label>
          <input class="field-input" id="me_chips" value="${esc((m.chips||[]).join(", "))}" placeholder="PPKn, Kelas VII, 2×40 menit">
        </div>`;
      }

      // ── KUTIPAN ──
      case "kutipan": {
        const styleOpts = ["card","big","minimal"].map(s=>
          `<option value="${s}"${m.style===s?" selected":""}>${s}</option>`).join("");
        const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>
          `<div onclick="AT_MODULES._upField('warna','${col}')" style="width:22px;height:22px;border-radius:50%;background:${col};cursor:pointer;border:3px solid ${(m.warna||"var(--p)")===col?"#fff":"transparent"};transition:border .15s;flex-shrink:0"></div>`
        ).join("");
        return `
        <div class="field-group">
          <label class="field-label">Teks Kutipan</label>
          <textarea class="field-textarea" rows="3" id="me_teks">${esc(m.teks||"")}</textarea>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Sumber / Nama Tokoh</label>
            <input class="field-input" id="me_sumber" value="${esc(m.sumber||"")}">
          </div>
          <div class="field-group">
            <label class="field-label">Jabatan / Keterangan</label>
            <input class="field-input" id="me_jabatan" value="${esc(m.jabatan||"")}">
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Gaya Tampilan</label>
            <select class="field-select" id="me_style">${styleOpts}</select>
          </div>
          <div class="field-group">
            <label class="field-label">Warna Aksen</label>
            <div style="display:flex;gap:7px;align-items:center;margin-top:8px">${colorOpts}</div>
          </div>
        </div>`;
      }

      // ── LANGKAH ──
      case "langkah": {
        const styleOpts = ["numbered","bubble","arrow"].map(s=>
          `<option value="${s}"${m.style===s?" selected":""}>${s}</option>`).join("");
        const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
        return `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Teks Intro</label>
            <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
          </div>
          <div class="field-group" style="flex:0 0 150px">
            <label class="field-label">Gaya</label>
            <select class="field-select" id="me_style">${styleOpts}</select>
          </div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">👣 Daftar Langkah</div>
        <div id="me_langkahList">${(m.langkah||[]).map((l,li)=>`
          <div class="sub-item" id="me_lk_${li}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(l.icon||"✅", `AT_MODULES._updateDeep('langkah',${li},'icon',v)`)}
              <input class="field-input" value="${esc(l.judul||"")}" placeholder="Judul langkah" oninput="AT_MODULES._updateDeep('langkah',${li},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('langkah',${li})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="2" placeholder="Penjelasan langkah…" oninput="AT_MODULES._updateDeep('langkah',${li},'isi',this.value)">${esc(l.isi||"")}</textarea>
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('langkah',${li},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(l.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('langkah',{icon:'✅',judul:'',isi:'',warna:'var(--y)'})">＋ Tambah Langkah</button>`;
      }

      // ── ACCORDION ──
      case "accordion": return `
        <div class="field-group">
          <label class="field-label">Judul Section</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Teks Intro (opsional)</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🗂️ Item Accordion</div>
        <div id="me_accordionList">${(m.items||[]).map((it,ii)=>`
          <div class="sub-item" id="me_acc_${ii}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(it.icon||"❓", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
              <input class="field-input" value="${esc(it.judul||"")}" placeholder="Pertanyaan / Judul" oninput="AT_MODULES._updateDeep('items',${ii},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="3" placeholder="Isi / Jawaban…" oninput="AT_MODULES._updateDeep('items',${ii},'isi',this.value)">${esc(it.isi||"")}</textarea>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('items',{icon:'❓',judul:'',isi:''})">＋ Tambah Item</button>
      `;

      // ── STATISTIK ──
      case "statistik": {
        const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
        return `
        <div class="field-group">
          <label class="field-label">Judul Section</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Teks Pembuka</label>
            <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
          </div>
          <div class="field-group" style="flex:0 0 130px">
            <label class="field-label">Layout</label>
            <select class="field-select" id="me_layout">
              <option value="grid"${m.layout==="grid"?" selected":""}>Grid</option>
              <option value="row"${m.layout==="row"?" selected":""}>Baris</option>
            </select>
          </div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">📊 Data / Angka</div>
        <div id="me_statList">${(m.items||[]).map((it,ii)=>`
          <div class="sub-item" id="me_st_${ii}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(it.icon||"📊", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
              <input class="field-input" value="${esc(it.angka||"")}" placeholder="Angka (mis: 4)" style="width:80px;flex-shrink:0;font-weight:800" oninput="AT_MODULES._updateDeep('items',${ii},'angka',this.value)">
              <input class="field-input" value="${esc(it.satuan||"")}" placeholder="Satuan" style="width:90px;flex-shrink:0" oninput="AT_MODULES._updateDeep('items',${ii},'satuan',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
            </div>
            <div class="field-row">
              <input class="field-input" value="${esc(it.label||"")}" placeholder="Label/deskripsi angka" oninput="AT_MODULES._updateDeep('items',${ii},'label',this.value)">
            </div>
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('items',${ii},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(it.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('items',{icon:'📊',angka:'',satuan:'',label:'',warna:'var(--y)'})">＋ Tambah Data</button>`;
      }

      // ── POLLING ──
      case "polling": {
        const colorOpts = ["var(--g)","var(--y)","var(--r)","var(--c)","var(--p)","var(--o)"];
        return `
        <div class="field-group">
          <label class="field-label">Pertanyaan Polling</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Instruksi untuk Siswa</label>
          <input class="field-input" id="me_instruksi" value="${esc(m.instruksi||"")}">
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Tipe Jawaban</label>
            <select class="field-select" id="me_tipe">
              <option value="single"${m.tipe==="single"?" selected":""}>Pilih Satu (single)</option>
              <option value="multiple"${m.tipe==="multiple"?" selected":""}>Boleh Pilih Banyak (multiple)</option>
            </select>
          </div>
          <div class="field-group" style="flex:0 0 160px">
            <label class="field-label">Mode</label>
            <label style="display:flex;align-items:center;gap:8px;margin-top:10px;font-size:.8rem">
              <input type="checkbox" id="me_anonim" ${m.anonim?"checked":""} onchange="AT_STATE.modules[AT_MODULES._editIdx].anonim=this.checked;AT_EDITOR.markDirty()"> Jawaban anonim
            </label>
          </div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🗳️ Opsi Pilihan</div>
        <div id="me_opsiList">${(m.opsi||[]).map((o,oi)=>`
          <div class="sub-item" id="me_opsi_${oi}">
            <div class="field-row">
              ${AT_MODULES.emojiBtn(o.icon||"✅", `AT_MODULES._updateDeep('opsi',${oi},'icon',v)`)}
              <input class="field-input" value="${esc(o.teks||"")}" placeholder="Teks opsi…" oninput="AT_MODULES._updateDeep('opsi',${oi},'teks',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('opsi',${oi})">🗑️</button>
            </div>
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('opsi',${oi},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(o.warna||"var(--g)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('opsi',{icon:'💬',teks:'',warna:'var(--c)'})">＋ Tambah Opsi</button>`;
      }

      // ── TAB ICONS ──
      case "tab-icons": {
        const layoutOpts = ["vertical","horizontal","pills"].map(l=>
          `<option value="${l}"${m.layout===l?" selected":""}>${l}</option>`).join("");
        return `
        <div class="field-group"><label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}"></div>
        <div class="field-group"><label class="field-label">Intro</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}"></div>
        <div class="field-row">
          <div class="field-group"><label class="field-label">Layout Tab</label>
            <select class="field-select" id="me_layout">${layoutOpts}</select></div>
          <div class="field-group">${AT_MODULES.renderAnimPicker(m,'animasi')}</div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">📑 Daftar Tab</div>
        <div id="me_tabsList">${(m.tabs||[]).map((t,ti)=>`
          <div class="sub-item" id="me_tab_${ti}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(t.icon||"📌", `AT_MODULES._updateDeep('tabs',${ti},'icon',v)`)}
              <input class="field-input" value="${esc(t.judul||"")}" placeholder="Judul tab" oninput="AT_MODULES._updateDeep('tabs',${ti},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('tabs',${ti})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="2" placeholder="Isi tab…" oninput="AT_MODULES._updateDeep('tabs',${ti},'isi',this.value)">${esc(t.isi||"")}</textarea>
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>`<div onclick="AT_MODULES._updateDeep('tabs',${ti},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(t.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
            <div style="margin-top:6px"><label class="field-label">Poin-poin (satu per baris)</label>
              <textarea class="field-textarea" rows="2" placeholder="Poin 1\nPoin 2\nPoin 3" oninput="AT_MODULES._updateDeep('tabs',${ti},'poin',this.value.split('\n').filter(Boolean))">${esc((t.poin||[]).join('\n'))}</textarea></div>
            <div style="margin-top:5px"><label class="field-label">Pertanyaan Refleksi</label>
              <input class="field-input" value="${esc(t.refleksi||"")}" placeholder="Pertanyaan untuk siswa…" oninput="AT_MODULES._updateDeep('tabs',${ti},'refleksi',this.value)"></div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('tabs',{icon:'📌',judul:'',warna:'var(--y)',isi:'',poin:[],refleksi:''})">＋ Tambah Tab</button>`;
      }

      // ── ICON EXPLORE ──
      case "icon-explore": {
        const layoutOpts = ["grid","carousel","wheel"].map(l=>
          `<option value="${l}"${m.layout===l?" selected":""}>${l}</option>`).join("");
        return `
        <div class="field-group"><label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}"></div>
        <div class="field-group"><label class="field-label">Intro</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}"></div>
        <div class="field-row">
          <div class="field-group"><label class="field-label">Layout</label>
            <select class="field-select" id="me_layout">${layoutOpts}</select></div>
          <div class="field-group">${AT_MODULES.renderAnimPicker(m,'animasi')}</div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🔍 Daftar Item Eksplorasi</div>
        <div id="me_ieList">${(m.items||[]).map((it,ii)=>`
          <div class="sub-item" id="me_ie_${ii}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(it.icon||"📌", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
              <input class="field-input" value="${esc(it.judul||"")}" placeholder="Judul" oninput="AT_MODULES._updateDeep('items',${ii},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
            </div>
            <input class="field-input" value="${esc(it.ringkasan||"")}" placeholder="Ringkasan singkat…" oninput="AT_MODULES._updateDeep('items',${ii},'ringkasan',this.value)">
            <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Isi detail…" oninput="AT_MODULES._updateDeep('items',${ii},'isi',this.value)">${esc(it.isi||"")}</textarea>
            <div style="margin-top:5px"><label class="field-label">Contoh (satu per baris)</label>
              <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('items',${ii},'contoh',this.value.split('\n').filter(Boolean))">${esc((it.contoh||[]).join('\n'))}</textarea></div>
            <input class="field-input" value="${esc(it.sanksi||"")}" placeholder="Sanksi…" style="margin-top:5px" oninput="AT_MODULES._updateDeep('items',${ii},'sanksi',this.value)">
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>`<div onclick="AT_MODULES._updateDeep('items',${ii},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(it.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('items',{icon:'📌',judul:'',warna:'var(--y)',ringkasan:'',isi:'',contoh:[],sanksi:''})">＋ Tambah Item</button>`;
      }

      // ── COMPARISON ──
      case "comparison": return `
        <div class="field-group"><label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}"></div>
        <div class="field-group"><label class="field-label">Intro</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}"></div>
        <div class="field-group">${AT_MODULES.renderAnimPicker(m,'animasi')}</div>
        <div class="divider"></div>
        <div class="at-card-title">📊 Kolom (Kategori)</div>
        <div id="me_kolomList">${(m.kolom||[]).map((k,ki)=>`
          <div class="sub-item" id="me_kol_${ki}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(k.icon||"📌", `AT_MODULES._updateDeep('kolom',${ki},'icon',v)`)}
              <input class="field-input" value="${esc(k.judul||"")}" placeholder="Nama kategori" oninput="AT_MODULES._updateDeep('kolom',${ki},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('kolom',${ki})">🗑️</button>
            </div>
            <div style="display:flex;gap:5px;align-items:center">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>`<div onclick="AT_MODULES._updateDeep('kolom',${ki},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(k.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('kolom',{icon:'📌',judul:'',warna:'var(--y)'})">＋ Tambah Kolom</button>
        <div class="divider"></div>
        <div class="at-card-title">📏 Baris Perbandingan</div>
        <div id="me_barisList">${(m.baris||[]).map((b,bi)=>`
          <div class="sub-item" id="me_br_${bi}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(b.icon||"📌", `AT_MODULES._updateDeep('baris',${bi},'icon',v)`)}
              <input class="field-input" value="${esc(b.label||"")}" placeholder="Label baris" style="flex:1" oninput="AT_MODULES._updateDeep('baris',${bi},'label',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('baris',${bi})">🗑️</button>
            </div>
            <div style="font-size:.72rem;color:var(--muted);margin-bottom:4px">Nilai per kolom (pisahkan dengan |):</div>
            <input class="field-input" value="${esc((b.nilai||[]).join(' | '))}" placeholder="Nilai A | Nilai B | Nilai C…" oninput="AT_MODULES._updateDeep('baris',${bi},'nilai',this.value.split('|').map(s=>s.trim()).filter(Boolean))">
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('baris',{icon:'📌',label:'',nilai:[]})">＋ Tambah Baris</button>
        <div class="field-group" style="margin-top:10px"><label class="field-label">Pertanyaan Refleksi</label>
          <textarea class="field-textarea" rows="2" id="me_tanya" placeholder="Pertanyaan untuk siswa…">${esc(m.tanya||"")}</textarea></div>`;

      // ── CARD SHOWCASE ──
      case "card-showcase": {
        const layoutOpts = ["grid","list","masonry"].map(l=>
          `<option value="${l}"${m.layout===l?" selected":""}>${l}</option>`).join("");
        return `
        <div class="field-group"><label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}"></div>
        <div class="field-group"><label class="field-label">Intro</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}"></div>
        <div class="field-row">
          <div class="field-group"><label class="field-label">Layout</label>
            <select class="field-select" id="me_layout">${layoutOpts}</select></div>
          <div class="field-group">${AT_MODULES.renderAnimPicker(m,'animasi')}</div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🎭 Daftar Card</div>
        <div id="me_cardsList">${(m.cards||[]).map((c,ci)=>`
          <div class="sub-item" id="me_card_${ci}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(c.icon||"📌", `AT_MODULES._updateDeep('cards',${ci},'icon',v)`)}
              <input class="field-input" value="${esc(c.judul||"")}" placeholder="Judul card" oninput="AT_MODULES._updateDeep('cards',${ci},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('cards',${ci})">🗑️</button>
            </div>
            <input class="field-input" value="${esc(c.subtitle||"")}" placeholder="Subtitle…" oninput="AT_MODULES._updateDeep('cards',${ci},'subtitle',this.value)">
            <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Isi card…" oninput="AT_MODULES._updateDeep('cards',${ci},'isi',this.value)">${esc(c.isi||"")}</textarea>
            <div style="margin-top:5px"><label class="field-label">Tag (pisahkan koma)</label>
              <input class="field-input" value="${esc((c.tag||[]).join(', '))}" placeholder="Tag1, Tag2, Tag3" oninput="AT_MODULES._updateDeep('cards',${ci},'tag',this.value.split(',').map(s=>s.trim()).filter(Boolean))"></div>
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>`<div onclick="AT_MODULES._updateDeep('cards',${ci},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(c.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('cards',{icon:'📌',judul:'',warna:'var(--y)',subtitle:'',isi:'',tag:[]})">＋ Tambah Card</button>`;
      }

      // ── HOTSPOT IMAGE ──
      case "hotspot-image": {
        const modeOpts = ["pin","tooltip","card"].map(o=>
          `<option value="${o}"${m.mode===o?" selected":""}>${o}</option>`).join("");
        const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
        return `
        <div class="field-group"><label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}"></div>
        <div class="field-group"><label class="field-label">Intro</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}"></div>
        <div class="field-group"><label class="field-label">URL Gambar</label>
          <input class="field-input" id="me_imageUrl" value="${esc(m.imageUrl||"")}" placeholder="https://example.com/gambar.jpg">
          <div style="font-size:.71rem;color:var(--muted);margin-top:4px">Paste URL gambar (JPG/PNG/SVG). Gambar akan jadi area hotspot interaktif.</div></div>
        <div class="field-row">
          <div class="field-group"><label class="field-label">Tinggi Gambar (px)</label>
            <input class="field-input" id="me_imageHeight" type="number" value="${m.imageHeight||400}" min="200" max="800" style="width:120px"></div>
          <div class="field-group"><label class="field-label">Mode Tampilan</label>
            <select class="field-select" id="me_mode">${modeOpts}</select></div>
          <div class="field-group">${AT_MODULES.renderAnimPicker(m,'animasi')}</div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">📍 Daftar Hotspot</div>
        <div id="me_hsList">${(m.hotspots||[]).map((h,hi)=>`
          <div class="sub-item" id="me_hs_${hi}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
              ${AT_MODULES.emojiBtn(h.icon||"📍", `AT_MODULES._updateDeep('hotspots',${hi},'icon',v)`)}
              <input class="field-input" value="${esc(h.judul||"")}" placeholder="Judul hotspot" style="flex:1;min-width:120px" oninput="AT_MODULES._updateDeep('hotspots',${hi},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('hotspots',${hi})">🗑️</button>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:5px;flex-wrap:wrap">
              <div class="field-group" style="flex:0 0 90px"><label class="field-label">Posisi X %</label>
                <input class="field-input" type="number" min="0" max="100" value="${h.x??50}" oninput="AT_MODULES._updateDeep('hotspots',${hi},'x',+this.value)"></div>
              <div class="field-group" style="flex:0 0 90px"><label class="field-label">Posisi Y %</label>
                <input class="field-input" type="number" min="0" max="100" value="${h.y??50}" oninput="AT_MODULES._updateDeep('hotspots',${hi},'y',+this.value)"></div>
            </div>
            <textarea class="field-textarea" rows="2" placeholder="Isi informasi hotspot…" oninput="AT_MODULES._updateDeep('hotspots',${hi},'isi',this.value)">${esc(h.isi||"")}</textarea>
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('hotspots',${hi},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(h.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('hotspots',{x:50,y:50,icon:'📍',judul:'',warna:'var(--y)',isi:''})">＋ Tambah Hotspot</button>`;
      }

      // ── EMBED / iFRAME ──
      case "embed": return `
        <div class="field-group">
          <label class="field-label">Judul / Nama Konten</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">URL Embed</label>
          <input class="field-input" id="me_url" value="${esc(m.url||"")}" placeholder="https://www.canva.com/design/…/view atau Google Slides share link">
          <div style="font-size:.71rem;color:var(--muted);margin-top:4px">
            💡 Canva: klik Share → Embed → salin link. Google Slides: File → Publish → Embed → salin src. Padlet: Share → Embed.
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Tinggi Frame (px)</label>
            <input class="field-input" id="me_tinggi" type="number" value="${m.tinggi||420}" min="200" max="900" style="width:120px">
          </div>
          <div class="field-group">
            <label class="field-label">Label Tombol Buka</label>
            <input class="field-input" id="me_label" value="${esc(m.label||"Buka di tab baru")}" placeholder="Buka di tab baru">
          </div>
        </div>`;

      default: return `<p style="color:var(--muted)">Tipe modul "${m.type}" belum ada editor khusus.</p>`;
    }
  },

  _blokEditorRow(b, bi) {
    if (b.tipe === "poin") {
      return `
      <div class="sub-item" id="me_blok_${bi}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span class="chip chip-p" style="font-size:.68rem">POIN</span>
          <input class="field-input" value="${esc(b.judul||"")}" placeholder="Judul bagian poin" style="flex:1" oninput="AT_MODULES._updateDeep('blok',${bi},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('blok',${bi})">🗑️</button>
        </div>
        <div id="me_butir_${bi}">${(b.butir||[]).map((bt,bti)=>`
          <div style="display:flex;gap:6px;margin-bottom:5px">
            <span style="color:var(--y);font-weight:900;padding-top:6px">•</span>
            <input class="field-input" value="${esc(bt)}" placeholder="Poin…" oninput="AT_MODULES._updateButir(${bi},${bti},this.value)">
            <button class="icon-btn del" onclick="AT_MODULES._removeButir(${bi},${bti})">×</button>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-xs" style="margin-top:4px" onclick="AT_MODULES._addButir(${bi})">＋ Poin</button>
      </div>`;
    }
    const warna = b.tipe === "definisi" ? "chip-y" : "chip-muted";
    return `
    <div class="sub-item" id="me_blok_${bi}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span class="chip ${warna}" style="font-size:.68rem">${b.tipe.toUpperCase()}</span>
        <input class="field-input" value="${esc(b.judul||"")}" placeholder="Judul bagian" style="flex:1" oninput="AT_MODULES._updateDeep('blok',${bi},'judul',this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeDeep('blok',${bi})">🗑️</button>
      </div>
      <textarea class="field-textarea" rows="3" placeholder="Isi konten…" oninput="AT_MODULES._updateDeep('blok',${bi},'isi',this.value)">${esc(b.isi||"")}</textarea>
    </div>`;
  },

  // ── HELPERS UPDATE NESTED ─────────────────────────────────────
  _updateDeep(key, idx, field, val) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m || !m[key]) return;
    m[key][idx][field] = val;
    AT_EDITOR.markDirty();
  },

  // Tambah item ke array nested — patch hanya container list, bukan re-render modal
  _addDeep(key, item) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m) return;
    if (!m[key]) m[key] = [];
    m[key].push(item);
    AT_EDITOR.markDirty();
    this._patchList(key, m);
  },

  // Hapus item dari array nested — patch container list
  _removeDeep(key, idx) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m || !m[key]) return;
    m[key].splice(idx, 1);
    AT_EDITOR.markDirty();
    this._patchList(key, m);
  },

  // Poin butir helpers — patch hanya sub-container butir
  _addButir(blokIdx) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m?.blok?.[blokIdx]) return;
    if (!m.blok[blokIdx].butir) m.blok[blokIdx].butir = [];
    m.blok[blokIdx].butir.push("");
    AT_EDITOR.markDirty();
    // Patch hanya sub-list butir dalam blok ini
    const cont = document.getElementById(`me_butir_${blokIdx}`);
    if (cont) {
      const b = m.blok[blokIdx];
      cont.innerHTML = this._butirItems(blokIdx, b.butir);
    }
  },
  _removeButir(blokIdx, butirIdx) {
    const m = AT_STATE.modules[this._editIdx];
    m?.blok?.[blokIdx]?.butir?.splice(butirIdx, 1);
    AT_EDITOR.markDirty();
    const cont = document.getElementById(`me_butir_${blokIdx}`);
    if (cont) {
      const b = m.blok[blokIdx];
      cont.innerHTML = this._butirItems(blokIdx, b.butir);
    }
  },
  _updateButir(blokIdx, butirIdx, val) {
    const m = AT_STATE.modules[this._editIdx];
    if (m?.blok?.[blokIdx]?.butir) m.blok[blokIdx].butir[butirIdx] = val;
    AT_EDITOR.markDirty();
  },

  // ── PATCH: rebuild hanya container list tertentu tanpa tutup modal ──
  _patchList(key, m) {
    const listIdMap = {
      kartu:      ["me_kartuList",      () => (m.kartu||[]).map((k,ki)    => this._kartuRow(m.type, k, ki)).join("")],
      pasangan:   ["me_pasanganList",   () => (m.pasangan||[]).map((p,pi) => this._pasanganRow(p, pi)).join("")],
      pertanyaan: ["me_pertanyaanList", () => (m.pertanyaan||[]).map((p,pi)=>this._pertanyaanRow(m.type, p, pi)).join("")],
      events:     ["me_eventList",      () => (m.events||[]).map((e,ei)   => this._eventRow(e, ei)).join("")],
      items:      [m.type==="accordion" ? "me_accordionList" : "me_statList",
                                        () => m.type==="accordion"
                                              ? (m.items||[]).map((it,ii) => this._accordionRow(it, ii)).join("")
                                              : (m.items||[]).map((it,ii) => this._statRow(it, ii)).join("")],
      langkah:    ["me_langkahList",    () => (m.langkah||[]).map((l,li) => this._langkahRow(l, li)).join("")],
      blok:       ["me_blokList",       () => (m.blok||[]).map((b,bi)    => this._blokEditorRow(b, bi)).join("")],
      opsi:       ["me_opsiList",       () => {
                    const colorOpts = ["var(--g)","var(--y)","var(--r)","var(--c)","var(--p)","var(--o)"];
                    return (m.opsi||[]).map((o,oi)=>`
                      <div class="sub-item" id="me_opsi_${oi}">
                        <div class="field-row">
                          ${AT_MODULES.emojiBtn(o.icon||"✅", `AT_MODULES._updateDeep('opsi',${oi},'icon',v)`)}
                          <input class="field-input" value="${esc(o.teks||"")}" placeholder="Teks opsi…" oninput="AT_MODULES._updateDeep('opsi',${oi},'teks',this.value)">
                          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('opsi',${oi})">🗑️</button>
                        </div>
                        <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
                          <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
                          ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('opsi',${oi},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(o.warna||"var(--g)")===col?"#fff":"transparent"}"></div>`).join("")}
                        </div>
                      </div>`).join("");
                  }],
      chapters:   ["skm_chapters",      () => (m.chapters||[]).map((ch,ci) => this._chapterRow(m, ci, ch)).join("")
                                              || '<div class="empty-state" style="padding:16px"><div class="empty-state-text">Belum ada chapter.</div></div>'],
      tabs:       ["me_tabsList",       () => (m.tabs||[]).map((t,ti)=>this._tabRow(t,ti)).join("")],
      kolom:      ["me_kolomList",      () => (m.kolom||[]).map((k,ki)=>this._kolomRow(k,ki)).join("")],
      baris:      ["me_barisList",      () => (m.baris||[]).map((b,bi)=>this._barisRow(b,bi)).join("")],
      cards:      ["me_cardsList",      () => (m.cards||[]).map((c,ci)=>this._cardRow(c,ci)).join("")],
      hotspots:   ["me_hsList",         () => (m.hotspots||[]).map((h,hi)=>this._hsRow(h,hi)).join("")],
    };
    // icon-explore uses 'items' key — reuse existing items handler
    if (key === 'items' && m.type === 'icon-explore') {
      const cont = document.getElementById('me_ieList');
      if (cont) { cont.innerHTML = (m.items||[]).map((it,ii)=>this._ieRow(it,ii)).join(""); return; }
    }
    const entry = listIdMap[key];
    if (!entry) { this.openEditor(this._editIdx); return; } // fallback
    const [listId, buildFn] = entry;
    const cont = document.getElementById(listId);
    if (!cont) { this.openEditor(this._editIdx); return; }
    cont.innerHTML = buildFn();
  },

  // ── MINI ROW BUILDERS (dipakai _patchList) ────────────────────
  _kartuRow(type, k, ki) {
    if (type === "flashcard") return `
      <div class="sub-item" id="me_kartu_${ki}">
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Depan</label>
            <input class="field-input" value="${esc(k.depan||"")}" oninput="AT_MODULES._updateDeep('kartu',${ki},'depan',this.value)">
          </div>
          <div class="field-group">
            <label class="field-label">Belakang</label>
            <input class="field-input" value="${esc(k.belakang||"")}" oninput="AT_MODULES._updateDeep('kartu',${ki},'belakang',this.value)">
          </div>
          <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('kartu',${ki})">🗑️</button>
        </div>
        <input class="field-input" value="${esc(k.hint||"")}" placeholder="Hint (opsional)…" style="margin-top:5px" oninput="AT_MODULES._updateDeep('kartu',${ki},'hint',this.value)">
      </div>`;
    // infografis kartu
    const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
    return `
      <div class="sub-item" id="me_kartu_${ki}">
        <div class="field-row" style="margin-bottom:6px">
          ${AT_MODULES.emojiBtn(k.icon||"📌", `AT_MODULES._updateDeep('kartu',${ki},'icon',v)`)}
          <input class="field-input" value="${esc(k.judul||"")}" placeholder="Judul kartu" oninput="AT_MODULES._updateDeep('kartu',${ki},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('kartu',${ki})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('kartu',${ki},'isi',this.value)">${esc(k.isi||"")}</textarea>
        <div style="display:flex;gap:6px;margin-top:5px;align-items:center">
          <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
          ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('kartu',${ki},'color','${col}')" style="width:18px;height:18px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${k.color===col?"#fff":"transparent"}"></div>`).join("")}
        </div>
      </div>`;
  },

  _pasanganRow(p, pi) {
    return `
      <div class="sub-item" id="me_pas_${pi}">
        <div class="field-row">
          <input class="field-input" value="${esc(p.kiri||"")}" placeholder="Kiri" oninput="AT_MODULES._updateDeep('pasangan',${pi},'kiri',this.value)">
          <span style="color:var(--muted);padding:0 4px;align-self:center">↔</span>
          <input class="field-input" value="${esc(p.kanan||"")}" placeholder="Kanan" oninput="AT_MODULES._updateDeep('pasangan',${pi},'kanan',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('pasangan',${pi})">🗑️</button>
        </div>
      </div>`;
  },

  _pertanyaanRow(type, p, pi) {
    if (type === "studi-kasus") return `
      <div class="sub-item" id="me_prt_${pi}">
        <div class="field-row">
          <div class="field-group" style="flex:0 0 80px">
            <label class="field-label">Level</label>
            <select class="field-select" onchange="AT_MODULES._updateDeep('pertanyaan',${pi},'level',this.value)">
              ${["C1","C2","C3","C4","C5","C6"].map(l=>`<option value="${l}"${p.level===l?" selected":""}>${l}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Label</label>
            <input class="field-input" value="${esc(p.label||"")}" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'label',this.value)">
          </div>
          <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('pertanyaan',${pi})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'teks',this.value)">${esc(p.teks||"")}</textarea>
      </div>`;
    // video
    return `
      <div class="sub-item" id="me_prt_${pi}">
        <input class="field-input" value="${esc(p.teks||"")}" placeholder="Pertanyaan refleksi…" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'teks',this.value)">
        <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
          <label style="font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:5px">
            <input type="checkbox" ${p.wajib?"checked":""} onchange="AT_MODULES._updateDeep('pertanyaan',${pi},'wajib',this.checked)"> Wajib
          </label>
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('pertanyaan',${pi})">🗑️</button>
        </div>
      </div>`;
  },

  _eventRow(e, ei) {
    return `
      <div class="sub-item" id="me_ev_${ei}">
        <div class="field-row">
          ${AT_MODULES.emojiBtn(e.icon||"📌", `AT_MODULES._updateDeep('events',${ei},'icon',v)`)}
          <input class="field-input" value="${esc(e.tahun||"")}" placeholder="Tahun" style="width:110px;flex-shrink:0" oninput="AT_MODULES._updateDeep('events',${ei},'tahun',this.value)">
          <input class="field-input" value="${esc(e.judul||"")}" placeholder="Judul" oninput="AT_MODULES._updateDeep('events',${ei},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('events',${ei})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="2" style="margin-top:5px" oninput="AT_MODULES._updateDeep('events',${ei},'isi',this.value)">${esc(e.isi||"")}</textarea>
      </div>`;
  },

  _accordionRow(it, ii) {
    return `
      <div class="sub-item" id="me_acc_${ii}">
        <div class="field-row" style="margin-bottom:5px">
          ${AT_MODULES.emojiBtn(it.icon||"❓", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
          <input class="field-input" value="${esc(it.judul||"")}" placeholder="Pertanyaan / Judul" oninput="AT_MODULES._updateDeep('items',${ii},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="3" oninput="AT_MODULES._updateDeep('items',${ii},'isi',this.value)">${esc(it.isi||"")}</textarea>
      </div>`;
  },

  _statRow(it, ii) {
    const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
    return `
      <div class="sub-item" id="me_st_${ii}">
        <div class="field-row" style="margin-bottom:5px">
          ${AT_MODULES.emojiBtn(it.icon||"📊", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
          <input class="field-input" value="${esc(it.angka||"")}" placeholder="Angka" style="width:80px;flex-shrink:0;font-weight:800" oninput="AT_MODULES._updateDeep('items',${ii},'angka',this.value)">
          <input class="field-input" value="${esc(it.satuan||"")}" placeholder="Satuan" style="width:90px;flex-shrink:0" oninput="AT_MODULES._updateDeep('items',${ii},'satuan',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
        </div>
        <input class="field-input" value="${esc(it.label||"")}" placeholder="Label/deskripsi" oninput="AT_MODULES._updateDeep('items',${ii},'label',this.value)">
        <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
          <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
          ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('items',${ii},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(it.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
        </div>
      </div>`;
  },

  _langkahRow(l, li) {
    const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
    return `
      <div class="sub-item" id="me_lk_${li}">
        <div class="field-row" style="margin-bottom:5px">
          ${AT_MODULES.emojiBtn(l.icon||"✅", `AT_MODULES._updateDeep('langkah',${li},'icon',v)`)}
          <input class="field-input" value="${esc(l.judul||"")}" placeholder="Judul langkah" oninput="AT_MODULES._updateDeep('langkah',${li},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('langkah',${li})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('langkah',${li},'isi',this.value)">${esc(l.isi||"")}</textarea>
        <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
          <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
          ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('langkah',${li},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(l.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
        </div>
      </div>`;
  },

  _chapterRow(m, ci, ch) {
    const idx = AT_STATE.modules.indexOf(m);
    return `
      <div class="sub-item" id="skm_ch${ci}">
        <div class="list-item-header">
          <span class="drag-handle">⠿</span>
          <div class="list-item-num" style="background:rgba(251,146,60,.15);color:var(--o)">${ci+1}</div>
          <span class="list-item-label">${ch.title||"Skenario "+(ci+1)}</span>
          <div class="list-item-actions">
            <button class="icon-btn edit" onclick="AT_SK_EDITOR.open(${idx},${ci})">✏️</button>
            <button class="icon-btn del" onclick="AT_MODULES._delChapter(${idx},${ci})">🗑️</button>
          </div>
        </div>
        <div style="font-size:.73rem;color:var(--muted);padding:0 0 4px 4px">
          Latar: ${ch.bg||"-"} · ${ch.setup?.length||0} dialog · ${ch.choices?.length||0} pilihan
        </div>
      </div>`;
  },

  // ── TAB ICONS row builder ──
  _tabRow(t, ti) {
    return `<div class="sub-item" id="me_tab_${ti}">
      <div class="field-row" style="margin-bottom:5px">
        ${AT_MODULES.emojiBtn(t.icon||"📌", `AT_MODULES._updateDeep('tabs',${ti},'icon',v)`)}
        <input class="field-input" value="${esc(t.judul||"")}" placeholder="Judul tab" oninput="AT_MODULES._updateDeep('tabs',${ti},'judul',this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeDeep('tabs',${ti})">🗑️</button>
      </div>
      <textarea class="field-textarea" rows="2" placeholder="Isi tab…" oninput="AT_MODULES._updateDeep('tabs',${ti},'isi',this.value)">${esc(t.isi||"")}</textarea>
      <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
        <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
        ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>`<div onclick="AT_MODULES._updateDeep('tabs',${ti},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(t.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
      </div>
      <div style="margin-top:6px"><label class="field-label">Poin (satu per baris)</label>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('tabs',${ti},'poin',this.value.split('\n').filter(Boolean))">${esc((t.poin||[]).join('\n'))}</textarea></div>
      <div style="margin-top:5px"><label class="field-label">Pertanyaan Refleksi</label>
        <input class="field-input" value="${esc(t.refleksi||"")}" placeholder="Pertanyaan…" oninput="AT_MODULES._updateDeep('tabs',${ti},'refleksi',this.value)"></div>
    </div>`;
  },

  // ── ICON EXPLORE row builder ──
  _ieRow(it, ii) {
    return `<div class="sub-item" id="me_ie_${ii}">
      <div class="field-row" style="margin-bottom:5px">
        ${AT_MODULES.emojiBtn(it.icon||"📌", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
        <input class="field-input" value="${esc(it.judul||"")}" placeholder="Judul" oninput="AT_MODULES._updateDeep('items',${ii},'judul',this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
      </div>
      <input class="field-input" value="${esc(it.ringkasan||"")}" placeholder="Ringkasan…" oninput="AT_MODULES._updateDeep('items',${ii},'ringkasan',this.value)">
      <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Detail…" oninput="AT_MODULES._updateDeep('items',${ii},'isi',this.value)">${esc(it.isi||"")}</textarea>
      <div style="margin-top:5px"><label class="field-label">Contoh (satu per baris)</label>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('items',${ii},'contoh',this.value.split('\n').filter(Boolean))">${esc((it.contoh||[]).join('\n'))}</textarea></div>
      <input class="field-input" value="${esc(it.sanksi||"")}" placeholder="Sanksi…" style="margin-top:5px" oninput="AT_MODULES._updateDeep('items',${ii},'sanksi',this.value)">
      <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
        <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
        ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>`<div onclick="AT_MODULES._updateDeep('items',${ii},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(it.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
      </div>
    </div>`;
  },

  // ── COMPARISON row builders ──
  _kolomRow(k, ki) {
    return `<div class="sub-item" id="me_kol_${ki}">
      <div class="field-row" style="margin-bottom:5px">
        ${AT_MODULES.emojiBtn(k.icon||"📌", `AT_MODULES._updateDeep('kolom',${ki},'icon',v)`)}
        <input class="field-input" value="${esc(k.judul||"")}" placeholder="Nama kategori" oninput="AT_MODULES._updateDeep('kolom',${ki},'judul',this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeDeep('kolom',${ki})">🗑️</button>
      </div>
      <div style="display:flex;gap:5px;align-items:center">
        <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
        ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>`<div onclick="AT_MODULES._updateDeep('kolom',${ki},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(k.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
      </div>
    </div>`;
  },
  _barisRow(b, bi) {
    return `<div class="sub-item" id="me_br_${bi}">
      <div class="field-row" style="margin-bottom:5px">
        ${AT_MODULES.emojiBtn(b.icon||"📌", `AT_MODULES._updateDeep('baris',${bi},'icon',v)`)}
        <input class="field-input" value="${esc(b.label||"")}" placeholder="Label baris" style="flex:1" oninput="AT_MODULES._updateDeep('baris',${bi},'label',this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeDeep('baris',${bi})">🗑️</button>
      </div>
      <div style="font-size:.72rem;color:var(--muted);margin-bottom:4px">Nilai per kolom (pisahkan dengan |):</div>
      <input class="field-input" value="${esc((b.nilai||[]).join(' | '))}" placeholder="Nilai A | Nilai B | Nilai C…" oninput="AT_MODULES._updateDeep('baris',${bi},'nilai',this.value.split('|').map(s=>s.trim()).filter(Boolean))">
    </div>`;
  },

  // ── CARD SHOWCASE row builder ──
  _cardRow(c, ci) {
    return `<div class="sub-item" id="me_card_${ci}">
      <div class="field-row" style="margin-bottom:5px">
        ${AT_MODULES.emojiBtn(c.icon||"📌", `AT_MODULES._updateDeep('cards',${ci},'icon',v)`)}
        <input class="field-input" value="${esc(c.judul||"")}" placeholder="Judul card" oninput="AT_MODULES._updateDeep('cards',${ci},'judul',this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeDeep('cards',${ci})">🗑️</button>
      </div>
      <input class="field-input" value="${esc(c.subtitle||"")}" placeholder="Subtitle…" oninput="AT_MODULES._updateDeep('cards',${ci},'subtitle',this.value)">
      <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Isi card…" oninput="AT_MODULES._updateDeep('cards',${ci},'isi',this.value)">${esc(c.isi||"")}</textarea>
      <div style="margin-top:5px"><label class="field-label">Tag (koma)</label>
        <input class="field-input" value="${esc((c.tag||[]).join(', '))}" placeholder="Tag1, Tag2" oninput="AT_MODULES._updateDeep('cards',${ci},'tag',this.value.split(',').map(s=>s.trim()).filter(Boolean))"></div>
      <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
        <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
        ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>`<div onclick="AT_MODULES._updateDeep('cards',${ci},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(c.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
      </div>
    </div>`;
  },

  // ── HOTSPOT IMAGE row builder ──
  _hsRow(h, hi) {
    const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
    return `<div class="sub-item" id="me_hs_${hi}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
        ${AT_MODULES.emojiBtn(h.icon||"📍", `AT_MODULES._updateDeep('hotspots',${hi},'icon',v)`)}
        <input class="field-input" value="${esc(h.judul||"")}" placeholder="Judul hotspot" style="flex:1;min-width:120px" oninput="AT_MODULES._updateDeep('hotspots',${hi},'judul',this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeDeep('hotspots',${hi})">🗑️</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:5px;flex-wrap:wrap">
        <div class="field-group" style="flex:0 0 90px"><label class="field-label">Posisi X %</label>
          <input class="field-input" type="number" min="0" max="100" value="${h.x??50}" oninput="AT_MODULES._updateDeep('hotspots',${hi},'x',+this.value)"></div>
        <div class="field-group" style="flex:0 0 90px"><label class="field-label">Posisi Y %</label>
          <input class="field-input" type="number" min="0" max="100" value="${h.y??50}" oninput="AT_MODULES._updateDeep('hotspots',${hi},'y',+this.value)"></div>
      </div>
      <textarea class="field-textarea" rows="2" placeholder="Isi informasi hotspot…" oninput="AT_MODULES._updateDeep('hotspots',${hi},'isi',this.value)">${esc(h.isi||"")}</textarea>
      <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
        <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
        ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('hotspots',${hi},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(h.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
      </div>
    </div>`;
  },

  _butirItems(blokIdx, butir) {
    return (butir||[]).map((bt,bti)=>`
      <div style="display:flex;gap:6px;margin-bottom:5px">
        <span style="color:var(--y);font-weight:900;padding-top:6px">•</span>
        <input class="field-input" value="${esc(bt)}" placeholder="Poin…" oninput="AT_MODULES._updateButir(${blokIdx},${bti},this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeButir(${blokIdx},${bti})">×</button>
      </div>`).join("");
  },

  // Skenario-specific helpers
  _addSetup() {
    this._addDeep("setup", { speaker:"NARRATOR", text:"" });
  },
  _addChoice() {
    this._addDeep("choices", {
      icon:"💡", label:"", detail:"", good:false, pts:10,
      norma:"", level:"mid", resultTitle:"", resultBody:"",
      consequences:[{ icon:"💡", text:"" }]
    });
  },

  // ── BIND top-level fields (title, bg, dsb.) ──────────────────
  // ── BIND FIELDS — hanya field yang relevan per tipe ──────────
  _bindEditorForm(m, idx) {
    // Helper bind: mencari element, kalau tidak ada langsung skip (tidak spam null checks)
    const bind = (id, key, transform) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        m[key] = transform ? transform(el.value) : el.value;
        this._notifyChange();
      });
    };

    // Field universal — ada di hampir semua tipe
    bind("me_title", "title");
    bind("me_intro", "intro");
    bind("me_instruksi", "instruksi");

    // Per-tipe — hanya bind yang relevan
    switch (m.type) {
      case "skenario":
        bind("me_bg",           "bg");
        bind("me_charEmoji",    "charEmoji");
        bind("me_choicePrompt", "choicePrompt");
        break;

      case "video":
        bind("me_url",      "url");
        bind("me_platform", "platform");
        bind("me_durasi",   "durasi");
        break;

      case "infografis":
        bind("me_layout", "layout");
        break;

      case "studi-kasus":
        bind("me_teks",   "teks");
        bind("me_sumber", "sumber");
        break;

      case "debat":
        bind("me_pertanyaan", "pertanyaan");
        bind("me_konteks",    "konteks");
        bind("me_kesimpulan", "kesimpulan_prompt");
        // Pihak A & B punya struktur nested — bind manual
        const elA = document.getElementById("me_labelA");
        const elB = document.getElementById("me_labelB");
        if (elA) elA.addEventListener("input", () => {
          if (!m.pihakA) m.pihakA = {};
          m.pihakA.label = elA.value;
          AT_EDITOR.markDirty();
        });
        if (elB) elB.addEventListener("input", () => {
          if (!m.pihakB) m.pihakB = {};
          m.pihakB.label = elB.value;
          AT_EDITOR.markDirty();
        });
        break;

      case "timeline":
        // events dikelola via _addDeep/_updateDeep
        break;

      case "materi":
        // blok dikelola via _addDeep/_updateDeep
        break;

      case "hero":
        bind("me_ikon",     "ikon");
        bind("me_gradient", "gradient");
        bind("me_cta",      "cta");
        bind("me_chips",    "chips", v => v.split(",").map(s=>s.trim()).filter(Boolean));
        break;

      case "kutipan":
        bind("me_teks",    "teks");
        bind("me_sumber",  "sumber");
        bind("me_jabatan", "jabatan");
        bind("me_style",   "style");
        break;

      case "langkah":
        bind("me_style", "style");
        break;

      case "accordion":
      case "statistik":
        bind("me_layout", "layout");
        break;

      case "polling":
        bind("me_tipe",    "tipe");
        bind("me_anonim",  "anonim");
        break;

      case "tab-icons":
      case "icon-explore":
        bind("me_layout", "layout");
        break;

      case "comparison":
        bind("me_tanya", "tanya");
        break;

      case "card-showcase":
        bind("me_layout", "layout");
        break;

      case "hotspot-image":
        bind("me_imageUrl", "imageUrl");
        bind("me_imageHeight", "imageHeight", v => +v || 400);
        bind("me_mode", "mode");
        break;

      case "embed":
        bind("me_url",    "url");
        bind("me_tinggi", "tinggi", v => +v || 400);
        bind("me_label",  "label");
        break;
    }
  },

  // Helper for direct field update (used by color pickers)
  _upField(key, val) {
    const i = this._editIdx;
    if (i === null || i === undefined) return;
    const m = AT_STATE.modules[i];
    if (!m) return;
    m[key] = val;
    AT_EDITOR.markDirty();
    // Re-render color pickers in editor
    this.openEditor(i);
  },

  _delChapter(modIdx, chIdx) {
    const m = AT_STATE.modules[modIdx];
    if (!m?.chapters) return;
    if (!confirm(`Hapus chapter "${m.chapters[chIdx]?.title}"?`)) return;
    m.chapters.splice(chIdx, 1);
    AT_EDITOR.markDirty();
    this.openEditor(modIdx);
  },

  _addChapter(modIdx) {
    const m = AT_STATE.modules[modIdx];
    if (!m) return;
    if (!m.chapters) m.chapters = [];
    const newCh = {
      id: m.chapters.length + 1,
      title: `🎭 Skenario ${m.chapters.length + 1}`,
      bg: "sbg-kampung",
      charEmoji: "😊", charColor: "#e87070", charPants: "#4a6a9a",
      choicePrompt: "Apa yang akan kamu lakukan?",
      setup: [
        { speaker: "NARRATOR", text: "Tuliskan narasi situasi di sini..." },
        { speaker: "TOKOH", text: "Dialog tokoh di sini..." }
      ],
      choices: [
        { icon:"🤝", label:"Pilihan bijak", detail:"Deskripsi pilihan", good:true, pts:20,
          norma:"Fungsi norma terkait", level:"good",
          resultTitle:"Pilihan Terbaik! 🌟", resultBody:"Penjelasan mengapa benar.",
          consequences:[{icon:"✅",text:"Dampak positif"}]
        },
        { icon:"❌", label:"Pilihan kurang tepat", detail:"Deskripsi pilihan", good:false, pts:0,
          norma:"Norma yang dilanggar", level:"bad",
          resultTitle:"Perlu Diperbaiki ⚠️", resultBody:"Penjelasan mengapa kurang tepat.",
          consequences:[{icon:"❌",text:"Dampak negatif"}]
        }
      ]
    };
    m.chapters.push(newCh);
    AT_EDITOR.markDirty();
    this.openEditor(modIdx);
    AT_UTIL.toast("✅ Chapter baru ditambahkan");
})();

console.log("✅ module-editor.js loaded");
