// ═══════════════════════════════════════════════════════════════
// AUTOGEN.JS — Auto-Generate Konten dari Materi (Non-AI) v2.0
// Lebih cerdas: pola kalimat, kata relasi, variasi soal,
// bloom taxonomy per level, skenario kontekstual,
// accordion, tab-icons, icon-explore modules
// ═══════════════════════════════════════════════════════════════

window.AT_AUTOGEN = {

  /* ── BLOOM TAXONOMY ──────────────────────────────────────── */
  BLOOM: {
    C1:{ verbs:["Menyebutkan","Mendefinisikan","Mengidentifikasi","Menuliskan","Mengurutkan"], label:"Mengingat",
         pattern: (topik) => `${topik} beserta ciri dan karakteristiknya` },
    C2:{ verbs:["Menjelaskan","Mendeskripsikan","Merangkum","Mengklasifikasikan","Membedakan"], label:"Memahami",
         pattern: (topik) => `konsep ${topik} dan kaitannya dalam kehidupan sehari-hari` },
    C3:{ verbs:["Menerapkan","Menggunakan","Mendemonstrasikan","Memberikan contoh","Menyelesaikan"], label:"Menerapkan",
         pattern: (topik) => `${topik} dalam situasi nyata di lingkungan sekitar` },
    C4:{ verbs:["Menganalisis","Membandingkan","Menguraikan","Membedakan","Menguji"], label:"Menganalisis",
         pattern: (topik, topik2) => `keterkaitan antara ${topik} dan ${topik2||"aspek kehidupan"} serta dampaknya` },
    C5:{ verbs:["Mengevaluasi","Menilai","Memilih","Mengkritisi","Mempertimbangkan"], label:"Mengevaluasi",
         pattern: (topik) => `pentingnya ${topik} dan akibat jika tidak diterapkan dalam masyarakat` },
    C6:{ verbs:["Merancang","Membuat","Menyusun","Mengembangkan","Menciptakan"], label:"Mencipta",
         pattern: (topik) => `rencana/solusi penerapan ${topik} di lingkungan sekolah atau masyarakat` },
  },

  STOP: new Set("yang adalah dari untuk dalam dengan oleh pada tidak dapat akan lebih setiap atau dan juga serta telah sudah hanya agar itu ini sebagai karena kepada terhadap bahwa secara maupun namun jika maka sehingga ketika sangat sebuah suatu pula setelah sebelum antara melalui selain tersebut mereka kita kami dia ia ada bisa harus".split(" ")),

  /* ── ICONS & COLORS HELPERS ─────────────────────────────── */
  _ICONS: ["📖","🎯","💡","🔑","🌟","📌","⚖️","🏛️","🤝","📜","🧭","🔍","✨","🛡️","🪜","📋","🌻","🎪","🏠","🏫"],
  _COLORS: ["#e87070","#4a7a9a","#e8a030","#5a9a6a","#9a5ab0","#c06040","#3a8a8a","#8a6a3a","#6a4a8a","#4a8a5a"],
  _PANTS: ["#4a6a9a","#2d4a7a","#3a5a7a","#5a7a4a","#7a4a6a","#6a5a2a","#4a7a7a","#7a6a3a","#5a4a7a","#4a7a5a"],

  _pickIcon(i)  { return this._ICONS[i % this._ICONS.length]; },
  _pickColor(i) { return this._COLORS[i % this._COLORS.length]; },
  _pickPants(i) { return this._PANTS[i % this._PANTS.length]; },

  /* ── PARSE MATERI ─────────────────────────────────────────── */
  parse(text) {
    const sentences = text.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>10);
    const words = text.toLowerCase().match(/\b[a-zA-ZÀ-ÿ]{4,}\b/g)||[];
    const freq = {};
    words.forEach(w=>{ if(!this.STOP.has(w)) freq[w]=(freq[w]||0)+1; });
    const topWords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([w])=>w);
    const topPhrases = this._extractPhrases(text, topWords);

    // Definisi: kalimat dengan pola "X adalah/merupakan/yaitu/ialah Y"
    const DEF_PAT = /([A-Za-zÀ-ÿ\s]{3,40})\s+(adalah|merupakan|yaitu|ialah|didefinisikan sebagai|diartikan sebagai)\s+([^.!?]{10,150})/gi;
    const definitions = [];
    let m;
    while ((m = DEF_PAT.exec(text)) !== null) {
      definitions.push({ subjek: m[1].trim(), predikat: m[2], deskripsi: m[3].trim() });
    }

    // Enumerasi: "terdiri dari", "meliputi", "antara lain", "yaitu", diikuti list
    const ENUM_PAT = /(terdiri dari|meliputi|antara lain|yaitu|diantaranya)[^.]{0,10}([A-Za-zÀ-ÿ,\s()dan]+)\./gi;
    const enumerations = [];
    while ((m = ENUM_PAT.exec(text)) !== null) {
      const items = m[2].split(/,|dan/).map(s=>s.trim()).filter(s=>s.length>1&&s.length<40);
      if (items.length>=2) enumerations.push({ intro: m[1], items });
    }

    // Fungsi/manfaat: "berfungsi", "berperan", "berguna", "bertujuan"
    const FUNC_PAT = /([A-Za-zÀ-ÿ\s]{3,30})\s+(berfungsi|berperan|berguna|bertujuan)\s+([^.!?]{10,120})/gi;
    const functions = [];
    while ((m = FUNC_PAT.exec(text)) !== null) {
      functions.push({ subjek: m[1].trim(), fungsi: m[3].trim() });
    }

    // Penyebab/akibat: "karena", "sehingga", "akibat", "menyebabkan"
    const CAUSE_PAT = /([^.]{10,60})\s+(karena|sehingga|akibat|menyebabkan|mengakibatkan)\s+([^.!?]{10,100})/gi;
    const causes = [];
    while ((m = CAUSE_PAT.exec(text)) !== null) {
      causes.push({ sebab: m[1].trim(), akibat: m[3].trim() });
    }

    return { sentences, topWords, topPhrases, definitions, enumerations, functions, causes, freq };
  },

  _extractPhrases(text, topWords) {
    // Bigrams dari topWords yang sering muncul berdampingan
    const phrases = [];
    for (let i=0; i<topWords.length-1; i++) {
      const pat = new RegExp(topWords[i]+'\\s+'+topWords[i+1],'gi');
      if (pat.test(text)) phrases.push(topWords[i]+' '+topWords[i+1]);
    }
    return phrases.slice(0,8);
  },

  /* ── GENERATE CP ─────────────────────────────────────────── */
  genCP(text, meta={}) {
    const { topWords, definitions, enumerations, topPhrases } = this.parse(text);
    const mainTopik = definitions[0]?.subjek || topPhrases?.[0] || topWords[0] || "materi";
    const topikList = topWords.slice(0,5).join(", ");

    // Build capaian from definitions
    let capaian = "";
    if (definitions.length >= 2) {
      capaian = `Peserta didik mampu memahami dan menjelaskan ${definitions[0].subjek.toLowerCase()} ${definitions[0].deskripsi.slice(0,80)}. Peserta didik dapat mengidentifikasi ${definitions.slice(1,3).map(d=>d.subjek.toLowerCase()).join(" dan ")} serta menganalisis kaitannya dalam kehidupan bermasyarakat. Peserta didik menunjukkan perilaku yang sesuai dengan nilai-nilai ${topikList}.`;
    } else if (enumerations.length) {
      const items = enumerations[0].items.slice(0,4).join(", ");
      capaian = `Peserta didik mampu memahami konsep ${mainTopik} yang ${enumerations[0].intro} ${items}. Peserta didik dapat menganalisis peran ${topikList} dalam kehidupan sehari-hari dan menerapkannya sebagai warga negara yang baik.`;
    } else {
      capaian = `Peserta didik mampu memahami, mengidentifikasi, dan menganalisis ${topikList} dalam konteks kehidupan bermasyarakat, berbangsa, dan bernegara, serta menunjukkan sikap dan perilaku yang sesuai.`;
    }

    return {
      elemen: meta.elemen || (topWords[0]?.charAt(0).toUpperCase()+topWords[0]?.slice(1)) || "Elemen Utama",
      subElemen: meta.subElemen || `Pemahaman ${topWords.slice(0,2).join(" dan ")}`,
      capaianFase: capaian,
      profil: ["Beriman, Bertakwa kepada Tuhan YME & Berakhlak Mulia","Bernalar Kritis","Bergotong Royong","Mandiri"],
      fase: meta.fase||"D", kelas: meta.kelas||"VII"
    };
  },

  /* ── GENERATE TP ─────────────────────────────────────────── */
  genTP(text, opts={}) {
    const { topWords, definitions, enumerations, functions } = this.parse(text);
    const levels = opts.levels || ["C1","C2","C3","C4"];
    const pertemuan = opts.pertemuan || 1;
    const maxTP = opts.maxTP || 5;
    const tps = [];

    const getTopik = (offset=0) => {
      if (definitions[offset]) return definitions[offset].subjek.toLowerCase();
      if (topWords[offset]) return topWords[offset];
      return "materi";
    };

    levels.slice(0, maxTP).forEach((lv, i) => {
      const BL = this.BLOOM[lv];
      if (!BL) return;
      const verb = BL.verbs[i % BL.verbs.length];
      let desc = "";

      if (lv==="C1") {
        desc = definitions[0]
          ? `${definitions[0].subjek.toLowerCase()} (${definitions[0].deskripsi.slice(0,60).trim()})`
          : BL.pattern(getTopik(0));
      } else if (lv==="C2") {
        desc = enumerations[0]
          ? `${enumerations[0].items.slice(0,3).join(", ")} beserta ciri dan contohnya masing-masing`
          : BL.pattern(getTopik(1));
      } else if (lv==="C3") {
        desc = functions[0]
          ? `fungsi ${functions[0].subjek.toLowerCase()} yaitu ${functions[0].fungsi.slice(0,50)}`
          : BL.pattern(getTopik(2));
      } else if (lv==="C4") {
        desc = BL.pattern(getTopik(0), getTopik(1));
      } else {
        desc = BL.pattern(getTopik(i%topWords.length));
      }

      tps.push({
        verb, desc: desc.charAt(0).toUpperCase()+desc.slice(1),
        pertemuan, color: AT_UTIL.colorForIndex(i)
      });
    });
    return tps;
  },

  /* ── GENERATE ATP ────────────────────────────────────────── */
  genATP(tps, meta={}) {
    const byPert = {};
    tps.forEach(tp => {
      const p = tp.pertemuan||1;
      if (!byPert[p]) byPert[p]=[];
      byPert[p].push(tp);
    });
    const pertemuan = Object.keys(byPert).sort((a,b)=>+a-+b).map((p,i) => {
      const list = byPert[p];
      const verbList = list.map(t=>t.verb).join("/");
      return {
        judul: `Pertemuan ${p}: ${list[0].desc.slice(0,35)}…`,
        tp: list.map((t,j)=>`TP ${j+1} — ${t.verb} ${t.desc.slice(0,40)}`).join(" · "),
        durasi: meta.durasi||"2 × 40 menit",
        kegiatan: this._genKegiatan(list),
        penilaian: +p===Object.keys(byPert).length
          ? "Kuis + Refleksi + Portofolio"
          : +p===1 ? "Observasi + Asesmen Diagnostik"
          : "Diskusi + Presentasi Kelompok"
      };
    });
    return { namaBab: meta.namaBab||`Bab: ${meta.topik||"Materi"}`, jumlahPertemuan:pertemuan.length, pertemuan };
  },

  _genKegiatan(tps) {
    const steps = ["Apersepsi & motivasi (pertanyaan pemantik)"];
    tps.forEach(tp => {
      const v = tp.verb.toLowerCase();
      if (/menyebutkan|mendefinisikan|menjelaskan/.test(v)) steps.push(`Pemaparan konsep: ${tp.desc.slice(0,30)}`);
      else if (/mengidentifikasi|mengklasifikasikan/.test(v)) steps.push(`Eksplorasi & identifikasi bersama`);
      else if (/menganalisis|membandingkan/.test(v)) steps.push(`Diskusi kelompok: analisis kasus`);
      else if (/menerapkan|memberikan contoh/.test(v)) steps.push(`Latihan & penerapan kontekstual`);
      else if (/mengevaluasi|menilai/.test(v)) steps.push(`Evaluasi dan presentasi`);
      else steps.push(`Aktivitas: ${tp.verb.toLowerCase()}`);
    });
    steps.push("Simpulan & refleksi bersama");
    return steps.join(" → ");
  },

  /* ── GENERATE ALUR ───────────────────────────────────────── */
  genAlur(tps, meta={}) {
    const total = meta.totalMenit||80;
    const pend  = Math.round(total*0.15);
    const pntp  = Math.round(total*0.70/Math.max(tps.length,1));
    const penut = total - pend - pntp*tps.length;
    const langkah = [];
    langkah.push({
      fase:"Pendahuluan", durasi:`${pend} menit`,
      judul:"Apersepsi, Motivasi & Diagnostik",
      deskripsi:`Guru membuka pembelajaran, mengecek kehadiran, menyampaikan tujuan pembelajaran, dan memberikan pertanyaan pemantik untuk mengaktifkan pengetahuan awal siswa tentang ${tps[0]?.desc?.split(" ").slice(0,4).join(" ")||"materi"}.`
    });
    tps.forEach((tp,i) => {
      langkah.push({
        fase:"Inti", durasi:`${pntp} menit`,
        judul:`${tp.verb}: ${tp.desc.slice(0,35)}`,
        deskripsi: this._deskripsiBerdasarkanBloom(tp)
      });
    });
    langkah.push({
      fase:"Penutup", durasi:`${Math.max(penut,10)} menit`,
      judul:"Simpulan, Refleksi & Tindak Lanjut",
      deskripsi:"Guru bersama siswa merangkum materi, siswa mengisi lembar refleksi singkat (3 hal dipelajari, 2 hal menarik, 1 pertanyaan), guru memberikan tindak lanjut dan informasi pertemuan berikutnya."
    });
    return langkah;
  },

  _deskripsiBerdasarkanBloom(tp) {
    const v = tp.verb.toLowerCase();
    const topik = tp.desc.slice(0,50);
    if (/menyebutkan|mendefinisikan/.test(v))
      return `Guru menjelaskan ${topik}. Siswa membaca, mencatat, dan menjawab pertanyaan lisan secara bergantian. Teknik: Think-Pair-Share.`;
    if (/menjelaskan|mendeskripsikan/.test(v))
      return `Guru memaparkan ${topik} dengan media visual. Siswa menyusun mind map sederhana. Tanya jawab klasikal untuk mengecek pemahaman.`;
    if (/mengidentifikasi|mengklasifikasikan/.test(v))
      return `Siswa mengidentifikasi ${topik} dari kartu/gambar yang disediakan guru. Diskusi pasangan, lalu presentasi singkat (2 menit/pasang).`;
    if (/menganalisis|membandingkan/.test(v))
      return `Diskusi kelompok (4-5 siswa): menganalisis ${topik} dari studi kasus. Setiap kelompok membuat poster mini lalu gallery walk.`;
    if (/menerapkan|memberikan contoh/.test(v))
      return `Siswa secara mandiri/berpasangan mencari contoh ${topik} dari kehidupan sehari-hari dan menuliskan di lembar kerja. Guru memantau dan memberi scaffolding.`;
    if (/mengevaluasi|menilai/.test(v))
      return `Siswa mengevaluasi ${topik} menggunakan rubrik sederhana. Presentasi kelompok dan saling memberikan umpan balik (peer assessment).`;
    return `Kegiatan pembelajaran tentang ${topik}. Guru memfasilitasi, siswa aktif melalui diskusi dan latihan terstruktur.`;
  },

  /* ── GENERATE KUIS (lebih cerdas) ───────────────────────── */
  genKuis(text, jumlah=10) {
    const { sentences, definitions, enumerations, functions, causes, topWords } = this.parse(text);
    const soal = [];

    // POLA 1: Dari kalimat definisi → soal pengertian
    definitions.forEach(def => {
      if (soal.length >= jumlah) return;
      const wrong = this._makeWrongOpts(def, definitions, functions, topWords, 3);
      if (wrong.length < 3) return;
      const correctAns = `${def.predikat.charAt(0).toUpperCase()+def.predikat.slice(1)} ${def.deskripsi.slice(0,85)}.`;
      const opts = this._shuffle([correctAns, ...wrong]);
      const ans  = opts.findIndex(o => def.deskripsi.startsWith(o.slice(0,20)));
      soal.push({
        q: `Apa yang dimaksud dengan "${def.subjek}"?`,
        opts: opts.map(o=>o.length>90?o.slice(0,90)+"…":o),
        ans: ans >= 0 ? ans : 0,
        ex: `${def.subjek} ${def.predikat} ${def.deskripsi.slice(0,100)}.`
      });
    });

    // POLA 2: Dari enumerasi → soal mana yang termasuk
    enumerations.forEach(en => {
      if (soal.length >= jumlah) return;
      const items = en.items.filter(i=>i.length>2);
      if (items.length < 2) return;
      const correctItem = items[0];
      const wrongItems = topWords.filter(w=>!items.some(it=>it.toLowerCase().includes(w))).slice(0,3).map(w=>w.charAt(0).toUpperCase()+w.slice(1));
      if (wrongItems.length < 3) return;
      const opts = this._shuffle([correctItem, ...wrongItems.slice(0,3)]);
      soal.push({
        q: `Manakah yang ${en.intro} bagian dari materi yang dipelajari?`,
        opts, ans: opts.indexOf(correctItem),
        ex: `Berdasarkan materi, yang ${en.intro}: ${items.slice(0,4).join(", ")}.`
      });
    });

    // POLA 3: Dari fungsi → soal tujuan/manfaat
    functions.forEach(fn => {
      if (soal.length >= jumlah) return;
      const correctFungsi = fn.fungsi.slice(0,80);
      const wrongFungsi = this._makeWrongFuncOpts(fn, functions, definitions, topWords, 3);
      if (wrongFungsi.length < 3) return;
      const opts = this._shuffle([correctFungsi, ...wrongFungsi]);
      soal.push({
        q: `Apa fungsi/peran dari "${fn.subjek}"?`,
        opts: opts.map(o=>o.length>90?o.slice(0,90)+"…":o),
        ans: opts.indexOf(correctFungsi),
        ex: `${fn.subjek} berfungsi ${fn.fungsi.slice(0,100)}.`
      });
    });

    // POLA 4: Dari sebab-akibat → soal hubungan
    causes.slice(0,2).forEach(ca => {
      if (soal.length >= jumlah) return;
      const wrong = topWords.slice(0,3).map(w=>`${ca.sebab.slice(0,30)} dapat ${w}`);
      if (wrong.length < 3) return;
      const correct = ca.akibat.slice(0,80);
      const opts = this._shuffle([correct, ...wrong]);
      soal.push({
        q: `Apa yang terjadi jika ${ca.sebab.toLowerCase().slice(0,60)}?`,
        opts: opts.map(o=>o.length>90?o.slice(0,90)+"…":o),
        ans: opts.indexOf(correct),
        ex: `Berdasarkan materi: ${ca.sebab} ${ca.akibat}.`
      });
    });

    // POLA 5: Soal aplikasi kontekstual dari topWords
    const KONTEKS = [
      "di lingkungan sekolah","di lingkungan keluarga","di lingkungan masyarakat","dalam kehidupan berbangsa dan bernegara"
    ];
    for (let i=0; i<4 && soal.length<jumlah; i++) {
      const topik = topWords[i]||"konsep";
      const konteks = KONTEKS[i%4];
      const kalimatBenang = sentences.find(s=>s.toLowerCase().includes(topik));
      if (!kalimatBenang) continue;
      const correct = `${topik.charAt(0).toUpperCase()+topik.slice(1)} diterapkan ${konteks} dengan mematuhi aturan yang berlaku`;
      const wrongs  = [
        `${topik.charAt(0).toUpperCase()+topik.slice(1)} diabaikan karena dianggap tidak penting`,
        `${topik.charAt(0).toUpperCase()+topik.slice(1)} hanya berlaku untuk kelompok tertentu saja`,
        `${topik.charAt(0).toUpperCase()+topik.slice(1)} tidak berhubungan dengan kehidupan sehari-hari`
      ];
      const opts = this._shuffle([correct, ...wrongs]);
      soal.push({
        q: `Bagaimana penerapan ${topik} ${konteks} yang paling tepat?`,
        opts, ans: opts.indexOf(correct),
        ex: `Penerapan ${topik} ${konteks} harus sesuai dengan aturan dan nilai yang berlaku.`
      });
    }

    // POLA 6: Isi jika masih kurang — soal umum bermakna
    while (soal.length < jumlah && topWords.length >= 2) {
      const w1 = topWords[soal.length%topWords.length];
      const w2 = topWords[(soal.length+1)%topWords.length];
      const correct = `${w1.charAt(0).toUpperCase()+w1.slice(1)} dan ${w2} saling berkaitan dalam membentuk tatanan kehidupan yang harmonis`;
      const wrongs = [
        `${w1.charAt(0).toUpperCase()+w1.slice(1)} dan ${w2} tidak memiliki hubungan satu sama lain`,
        `${w2.charAt(0).toUpperCase()+w2.slice(1)} lebih penting daripada ${w1} dalam segala hal`,
        `${w1.charAt(0).toUpperCase()+w1.slice(1)} bertentangan dengan ${w2} dalam penerapannya`
      ];
      const opts = this._shuffle([correct,...wrongs]);
      soal.push({
        q: `Bagaimana hubungan antara ${w1} dan ${w2} dalam materi yang dipelajari?`,
        opts, ans: opts.indexOf(correct),
        ex: `${w1} dan ${w2} memiliki keterkaitan erat dalam membentuk kehidupan bermasyarakat yang baik.`
      });
    }

    return soal.slice(0, jumlah);
  },

  /* ── _makeWrongOpts — smarter distractors from definitions & functions ── */
  _makeWrongOpts(currentDef, definitions, functions, topWords, count) {
    const wrongs = [];
    const correctSubj = currentDef.subjek.toLowerCase();
    const correctDesc = currentDef.deskripsi.toLowerCase();

    // STRATEGY 1: Use definitions of OTHER terms as distractors
    definitions.forEach(def => {
      if (wrongs.length >= count) return;
      if (def.subjek.toLowerCase() === correctSubj) return;
      // Use another term's description — plausible because it's from the same material
      const candidate = `${def.predikat.charAt(0).toUpperCase()+def.predikat.slice(1)} ${def.deskripsi.slice(0,80)}`;
      if (!correctDesc.startsWith(candidate.slice(0,20).toLowerCase())) {
        wrongs.push(candidate.length > 90 ? candidate.slice(0,90)+"…" : candidate);
      }
    });

    // STRATEGY 2: Swap function of another subject into definition-style answer
    functions.forEach(fn => {
      if (wrongs.length >= count) return;
      if (fn.subjek.toLowerCase() === correctSubj) return;
      const candidate = `Berfungsi untuk ${fn.fungsi.slice(0,75)}`;
      wrongs.push(candidate.length > 90 ? candidate.slice(0,90)+"…" : candidate);
    });

    // STRATEGY 3: Mix subject A with function of subject B (cross-wiring)
    if (definitions.length >= 2 && functions.length >= 1) {
      for (let i = 0; i < definitions.length && wrongs.length < count; i++) {
        const otherDef = definitions[i];
        if (otherDef.subjek.toLowerCase() === correctSubj) continue;
        for (let j = 0; j < functions.length && wrongs.length < count; j++) {
          const otherFn = functions[j];
          if (otherFn.subjek.toLowerCase() === correctSubj) continue;
          const candidate = `Segala sesuatu yang berhubungan dengan ${otherDef.subjek.toLowerCase()} dan berperan untuk ${otherFn.fungsi.slice(0,50)}`;
          wrongs.push(candidate.length > 90 ? candidate.slice(0,90)+"…" : candidate);
        }
      }
    }

    // STRATEGY 4: Create plausible negation/twist from topWords
    if (wrongs.length < count) {
      const usedWords = topWords.filter(w => !correctSubj.includes(w) && !correctDesc.includes(w));
      for (let i = 0; i < usedWords.length && wrongs.length < count; i++) {
        const w = usedWords[i];
        const candidate = `Suatu konsep yang berkaitan dengan ${w} namun tidak sama dengan ${currentDef.subjek.toLowerCase()}`;
        wrongs.push(candidate.length > 90 ? candidate.slice(0,90)+"…" : candidate);
      }
    }

    // Deduplicate
    const unique = [];
    const seen = new Set();
    wrongs.forEach(w => {
      const key = w.toLowerCase().slice(0,30);
      if (!seen.has(key)) { seen.add(key); unique.push(w); }
    });

    return unique.slice(0, count);
  },

  /* ── _makeWrongFuncOpts — wrong options for function questions ── */
  _makeWrongFuncOpts(currentFn, functions, definitions, topWords, count) {
    const wrongs = [];
    const currentSubj = currentFn.subjek.toLowerCase();
    const currentFungsi = currentFn.fungsi.toLowerCase();

    // Use other subjects' functions as distractors
    functions.forEach(fn => {
      if (wrongs.length >= count) return;
      if (fn.subjek.toLowerCase() === currentSubj) return;
      if (fn.fungsi.toLowerCase() === currentFungsi) return;
      wrongs.push(fn.fungsi.slice(0, 85));
    });

    // Swap definition into function-style distractor
    definitions.forEach(def => {
      if (wrongs.length >= count) return;
      if (def.subjek.toLowerCase() === currentSubj) return;
      const candidate = `mengatur dan mengarahkan ${def.subjek.toLowerCase()} sesuai dengan ${def.deskripsi.slice(0,50)}`;
      wrongs.push(candidate.length > 90 ? candidate.slice(0,90)+"…" : candidate);
    });

    // Generic plausible distractors using topWords
    if (wrongs.length < count) {
      const verbs = ["mengatur","menjaga","membina","memelihara","mendorong","memfasilitasi"];
      const nouns = topWords.filter(w => !currentSubj.includes(w)).slice(0,3);
      for (let i = 0; i < nouns.length && wrongs.length < count; i++) {
        const candidate = `${verbs[i % verbs.length]} ${nouns[i]} dalam kehidupan bermasyarakat`;
        wrongs.push(candidate);
      }
    }

    // Deduplicate
    const unique = [];
    const seen = new Set();
    wrongs.forEach(w => {
      const key = w.toLowerCase().slice(0,30);
      if (!seen.has(key)) { seen.add(key); unique.push(w); }
    });

    return unique.slice(0, count);
  },

  _shuffle(arr) { return arr.slice().sort(()=>Math.random()-.5); },

  /* ── GENERATE FLASHCARD ──────────────────────────────────── */
  genFlashcard(text) {
    const { definitions, enumerations, functions, topWords, topPhrases, sentences } = this.parse(text);
    const kartu = [];

    // Dari definisi
    definitions.slice(0,6).forEach(def => {
      kartu.push({
        depan: def.subjek,
        belakang: `${def.predikat.charAt(0).toUpperCase()+def.predikat.slice(1)} ${def.deskripsi.slice(0,120)}`,
        hint: `Kata kunci: ${def.subjek.split(/\s+/)[0]}`
      });
    });

    // Dari enumerasi
    enumerations.slice(0,2).forEach(en => {
      kartu.push({
        depan: `Apa saja yang ${en.intro}?`,
        belakang: en.items.slice(0,6).join(", "),
        hint: `Ada ${en.items.length} item`
      });
    });

    // Dari fungsi
    functions.slice(0,3).forEach(fn => {
      kartu.push({
        depan: `Apa fungsi ${fn.subjek}?`,
        belakang: fn.fungsi.slice(0,120),
        hint: `Subjek: ${fn.subjek.split(/\s+/)[0]}`
      });
    });

    // Fallback dari topwords — generate contextual content instead of placeholder
    if (kartu.length < 4) {
      topWords.slice(0,8).forEach((w, i) => {
        if (kartu.find(k=>k.depan.toLowerCase().includes(w))) return;
        // Try to find a sentence that mentions this word for context
        const relatedSentence = sentences.find(s => s.toLowerCase().includes(w));
        let belakang;
        if (relatedSentence) {
          belakang = relatedSentence.slice(0, 120);
        } else if (topPhrases.length > 0) {
          belakang = `Berkaitan dengan ${topPhrases[i % topPhrases.length]} dalam konteks materi yang dipelajari`;
        } else {
          belakang = `Merupakan konsep penting yang berkaitan dengan ${topWords[(i+1) % topWords.length] || "materi"} dan memiliki peran dalam kehidupan bermasyarakat`;
        }
        kartu.push({
          depan: w.charAt(0).toUpperCase()+w.slice(1),
          belakang,
          hint: `Istilah kunci materi`
        });
      });
    }

    return kartu.slice(0,12);
  },

  /* ── GENERATE SKENARIO (3 chapters, full format) ─────────── */
  genSkenario(text, meta={}) {
    const { topWords, definitions, functions, enumerations, causes } = this.parse(text);
    const topik  = definitions[0]?.subjek || topWords[0] || "topik";
    const topik2 = definitions[1]?.subjek || topWords[1] || "aspek lain";
    const topik3 = definitions[2]?.subjek || topWords[2] || topWords[0] || "aspek ketiga";
    const fungsi1 = functions[0]?.fungsi || `mengatur kehidupan bersama`;
    const fungsi2 = functions[1]?.fungsi || functions[0]?.fungsi || `menjaga keharmonisan`;
    const defDesc1 = definitions[0]?.deskripsi?.slice(0,60) || "konsep penting dalam kehidupan";
    const defDesc2 = definitions[1]?.deskripsi?.slice(0,60) || definitions[0]?.deskripsi?.slice(0,60) || "bagian dari materi";

    // Use all 3 backgrounds
    const LATAR = [
      {bg:"sbg-kampung", lokasi:"kampung",   emoji:"😟", color:"#e87070", pants:"#4a6a9a"},
      {bg:"sbg-kelas",   lokasi:"sekolah",   emoji:"🤔", color:"#4a7a9a", pants:"#2d4a7a"},
      {bg:"sbg-pasar",   lokasi:"pasar",     emoji:"😐", color:"#e8a030", pants:"#3a5a7a"},
    ];

    // Contextual dialog builders
    const CHAR_NAMES = {
      kampung:  [{name:"PAK RT", emoji:"👨‍🌾"}, {name:"IBU MARYAM", emoji:"👩"}, {name:"BAPAK TANI", emoji:"🧑‍🌾"}],
      sekolah:  [{name:"GURU", emoji:"👨‍🏫"}, {name:"KETUA KELAS", emoji:"🧑‍🎓"}, {name:"TEMAN", emoji:"👦"}],
      pasar:    [{name:"PEDAGANG", emoji:"🧑‍🍳"}, {name:"PEMBELI", emoji:"🧑"}, {name:"PENGAWAS", emoji:"👮"}],
    };

    // Build 3 contextual chapters
    const chapters = LATAR.map((L, ci) => {
      const isLast = ci === LATAR.length - 1;
      const currentTopik = [topik, topik2, topik3][ci];
      const currentFungsi = [fungsi1, fungsi2, fungsi1][ci];
      const chars = CHAR_NAMES[L.lokasi];
      const topikUp = currentTopik.charAt(0).toUpperCase()+currentTopik.slice(1);
      const topikLc = currentTopik.toLowerCase();

      // Build setup dialogs — 3-4 lines, contextual
      const setup = [
        {speaker:"NARRATOR", text:`Di ${L.lokasi}, terjadi situasi yang berkaitan dengan ${topikLc}. ${defDesc1.charAt(0).toUpperCase()+defDesc1.slice(1)} menjadi perhatian semua orang.`},
      ];

      if (ci === 0) {
        // Chapter 1: Introduction / discovery
        setup.push({speaker:`${chars[0].name} ${chars[0].emoji}`, text:`"Kita harus memahami ${topikLc} dengan baik. Ini menyangkut ${currentFungsi.slice(0,50)}."`});
        setup.push({speaker:`${chars[1].name} ${chars[1].emoji}`, text:`"Tapi banyak yang belum menyadari pentingnya ${topikLc} dalam kehidupan kita sehari-hari."`});
        setup.push({speaker:`${chars[2].name} ${chars[2].emoji}`, text:`"Apa yang sebaiknya kita lakukan sekarang? Semua menunggu keputusanmu."`});
      } else if (ci === 1) {
        // Chapter 2: Dilemma / conflict
        setup.push({speaker:`${chars[0].name} ${chars[0].emoji}`, text:`"Di ${L.lokasi}, penerapan ${topikLc} sering kali diabaikan. Padahal ${topikLc} berfungsi ${currentFungsi.slice(0,50)}."`});
        setup.push({speaker:`${chars[1].name} ${chars[1].emoji}`, text:`"Sebagian orang merasa ${topikLc} tidak relevan dengan kondisi di ${L.lokasi} ini."`});
        setup.push({speaker:"NARRATOR", text:`Kamu dihadapkan pada pilihan: apakah akan mengedepankan ${topikLc} atau mengikuti arus mayoritas?`});
      } else {
        // Chapter 3: Resolution / application
        setup.push({speaker:`${chars[0].name} ${chars[0].emoji}`, text:`"Setelah kejadian di ${LATAR[ci-1].lokasi}, sekarang di ${L.lokasi} kita juga menghadapi tantangan ${topikLc}."`});
        setup.push({speaker:`${chars[1].name} ${chars[1].emoji}`, text:`"Kita perlu menunjukkan contoh nyata penerapan ${topikLc} di sini."`});
        setup.push({speaker:`${chars[2].name} ${chars[2].emoji}`, text:`"Ini kesempatan untuk membuktikan bahwa ${topikLc} benar-benar berdampak positif."`});
      }

      // Build 3 choices per chapter
      const choiceGood = ci === 0
        ? {icon:"🤝", label:`Musyawarahkan bersama`, detail:`Ajak warga ${L.lokasi} duduk bersama, diskusikan masalah ${topikLc} dan cari solusi yang adil`,
           good:true, pts:20, level:"good",
           norma:`Penerapan ${topikLc}: ${currentFungsi.slice(0,50)}`,
           resultTitle:"Pilihan Terbaik! 🌟",
           resultBody:`Musyawarah adalah cara terbaik. ${topikUp} berfungsi ${currentFungsi.slice(0,60)}. Dengan berdiskusi, semua pihak merasa dihargai.`,
           consequences:[
             {icon:"✅", text:`Semua pihak merasa dihargai dan masalah terselesaikan secara adil`},
             {icon:"✅", text:`Nilai ${topikLc} terwujud melalui dialog dan kesepakatan bersama`},
             {icon:"💡", text:`Masyarakat ${L.lokasi} menjadi lebih sadar akan pentingnya ${topikLc}`}
          ]}
        : ci === 1
        ? {icon:"📚", label:`Pelajari dan terapkan`, detail:`Aktif mempelajari ${topikLc} dan menerapkannya secara nyata di ${L.lokasi}`,
           good:true, pts:20, level:"good",
           norma:`Kesadaran akan ${topikLc} dan penerapannya`,
           resultTitle:"Pilihan Bijak! 👍",
           resultBody:`Dengan memahami dan menerapkan ${topikLc}, kamu berkontribusi pada kehidupan yang lebih baik di ${L.lokasi}. ${topikUp} berfungsi ${currentFungsi.slice(0,50)}.`,
           consequences:[
             {icon:"✅", text:`Kamu menjadi contoh positif bagi orang-orang di ${L.lokasi}`},
             {icon:"✅", text:`${topikUp} dapat dirasakan manfaatnya oleh semua pihak`},
             {icon:"💡", text:`Lingkungan ${L.lokasi} menjadi lebih tertib dan harmonis`}
          ]}
        : {icon:"🛡️", label:`Tegakkan dan jaga`, detail:`Secara konsisten menegakkan ${topikLc} dan menjaga agar semua pihak mematuhinya di ${L.lokasi}`,
           good:true, pts:20, level:"good",
           norma:`Konsistensi dalam menegakkan ${topikLc}`,
           resultTitle:"Sikap Pantas Dicontoh! 🏆",
           resultBody:`Menegakkan ${topikLc} membutuhkan keberanian dan konsistensi. ${topikUp} berfungsi ${currentFungsi.slice(0,50)}. Dengan sikapmu, ${L.lokasi} menjadi lebih baik.`,
           consequences:[
             {icon:"✅", text:`Semua pihak merasakan manfaat dari tertibnya ${topikLc}`},
             {icon:"✅", text:`Kamu dihormati karena konsisten memperjuangkan kebaikan`},
             {icon:"💡", text:`Nilai ${topikLc} semakin kuat tertanam di masyarakat ${L.lokasi}`}
          ]};

      const choiceMid = ci === 0
        ? {icon:"🤷", label:`Ikuti saja yang lain`, detail:`Menyesuaikan diri dengan kebiasaan yang sudah ada meskipun belum sepenuhnya sesuai ${topikLc}`,
           good:false, pts:8, level:"mid",
           norma:`Ketidakaktifan dalam ${topikLc}`,
           resultTitle:"Cukup, tapi Bisa Lebih Baik 🤔",
           resultBody:`Mengikuti arus tidak sepenuhnya salah, namun ${topikLc} mengharuskan kita lebih aktif. ${topikUp} berfungsi ${currentFungsi.slice(0,50)}.`,
           consequences:[
             {icon:"⚠️", text:`Masalah tidak terselesaikan secara tuntas, hanya mengikuti kebiasaan`},
             {icon:"💡", text:`${topikUp} belum diterapkan secara optimal di ${L.lokasi}`},
             {icon:"🔄", text:`Kamu masih bisa memperbaiki sikap di situasi berikutnya`}
          ]}
        : ci === 1
        ? {icon:"🙊", label:`Diam saja biar aman`, detail:`Memilih untuk tidak ambil bagian agar tidak menimbulkan masalah`,
           good:false, pts:5, level:"mid",
           norma:`Pasif terhadap ${topikLc}`,
           resultTitle:"Pilihan Aman, tapi Kurang Tepat 😐",
           resultBody:`Memilih diam bukan solusi. ${topikUp} mengharuskan partisipasi aktif agar ${currentFungsi.slice(0,50)}.`,
           consequences:[
             {icon:"⚠️", text:`Ketidakpedulian bisa merusak tatanan yang sudah ada`},
             {icon:"💡", text:`${topikUp} tidak bisa berjalan tanpa partisipasi semua pihak`},
             {icon:"🔄", text:`Masih ada kesempatan untuk memperbaiki sikap`}
          ]}
        : {icon:"📝", label:`Sarankan secara tertulis`, detail:`Menulis pendapat tentang ${topikLc} tanpa terlibat langsung dalam penegakan`,
           good:false, pts:8, level:"mid",
           norma:`Partisipasi pasif dalam ${topikLc}`,
           resultTitle:"Upaya Ada, tapi Kurang Maksimal 📋",
           resultBody:`Saran tertulis bagus, namun ${topikLc} memerlukan tindakan nyata. ${topikUp} berfungsi ${currentFungsi.slice(0,50)}.`,
           consequences:[
             {icon:"⚠️", text:`Saran tanpa tindakan nyata sulit mengubah keadaan`},
             {icon:"💡", text:`Perlu keberanian langsung untuk menegakkan ${topikLc}`},
             {icon:"🔄", text:`Masih bisa meningkatkan partisipasi di kesempatan lain`}
          ]};

      const choiceBad = ci === 0
        ? {icon:"🤐", label:`Diam dan tidak peduli`, detail:`Membiarkan masalah berlanjut tanpa tindakan apapun`,
           good:false, pts:0, level:"bad",
           norma:`Mengabaikan ${topikLc}`,
           resultTitle:"Kurang Tepat ⚠️",
           resultBody:`Sikap tidak peduli bertentangan dengan nilai ${topikLc} yang berfungsi ${currentFungsi.slice(0,50)}. Setiap orang bertanggung jawab atas kehidupan bersama.`,
           consequences:[
             {icon:"❌", text:`Masalah semakin membesar dan merugikan banyak pihak`},
             {icon:"❌", text:`Nilai ${topikLc} semakin diabaikan di ${L.lokasi}`},
             {icon:"💡", text:`${topikUp} mengharuskan kita untuk aktif berpartisipasi`}
          ]}
        : ci === 1
        ? {icon:"😴", label:`Abaikan, tidak relevan`, detail:`Merasa ${topikLc} tidak penting dan tidak perlu diperhatikan`,
           good:false, pts:0, level:"bad",
           norma:`Melalaikan ${topikLc}`,
           resultTitle:"Perlu Diperbaiki ⚠️",
           resultBody:`Mengabaikan ${topikLc} dapat berdampak negatif pada diri sendiri dan lingkungan sekitar. ${topikUp} berfungsi ${currentFungsi.slice(0,50)}.`,
           consequences:[
             {icon:"❌", text:`Perilaku yang tidak sesuai dapat mengganggu keharmonisan bersama`},
             {icon:"❌", text:`Lingkungan ${L.lokasi} menjadi tidak tertib tanpa ${topikLc}`},
             {icon:"💡", text:`Setiap orang bertanggung jawab untuk menerapkan ${topikLc}`}
          ]}
        : {icon:"😈", label:`Lawan dan abaikan aturan`, detail:`Secara sengaja melanggar ${topikLc} karena merasa tidak terikat`,
           good:false, pts:0, level:"bad",
           norma:`Melanggar ${topikLc}`,
           resultTitle:"Sangat Tidak Tepat ❌",
           resultBody:`Melanggar ${topikLc} secara sengaja sangat merugikan. ${topikUp} berfungsi ${currentFungsi.slice(0,50)}. Sikap ini merusak tatanan kehidupan bersama.`,
           consequences:[
             {icon:"❌", text:`Kamu merugikan banyak pihak dengan melanggar ${topikLc}`},
             {icon:"❌", text:`Kepercayaan masyarakat ${L.lokasi} terhadapmu menurun drastis`},
             {icon:"💡", text:`Perlu refleksi mendalam tentang tanggung jawab sebagai anggota masyarakat`}
          ]};

      return {
        id: ci + 1,
        title: `📍 Situasi ${ci+1} — Di ${L.lokasi.charAt(0).toUpperCase()+L.lokasi.slice(1)}`,
        bg: L.bg,
        charEmoji: L.emoji,
        charColor: L.color,
        charPants: L.pants,
        choicePrompt: ci === 0 ? "Apa yang akan kamu lakukan?" : ci === 1 ? "Bagaimana sikapmu?" : "Keputusan terakhirmu?",
        setup,
        choices: [choiceGood, choiceMid, choiceBad]
      };
    });

    return {
      type:"skenario",
      title:`🎭 Skenario: ${topik.charAt(0).toUpperCase()+topik.slice(1)} dalam Kehidupan`,
      chapters
    };
  },

  /* ── GENERATE GAME MATCHING ──────────────────────────────── */
  genMatching(text) {
    const { definitions, enumerations } = this.parse(text);
    const pasangan = [];

    definitions.slice(0,6).forEach(def => {
      pasangan.push({ kiri: def.subjek, kanan: def.deskripsi.slice(0,60) });
    });
    enumerations.slice(0,2).forEach(en => {
      en.items.slice(0,2).forEach(item => {
        pasangan.push({ kiri: item, kanan: `${en.intro.charAt(0).toUpperCase()+en.intro.slice(1)} dari materi` });
      });
    });

    if (pasangan.length < 3) return null;
    return {
      type:"matching", title:"Pasangkan Istilah & Definisi",
      instruksi:"Klik item kiri lalu klik pasangannya di kanan.",
      pasangan: pasangan.slice(0,8)
    };
  },

  /* ── GENERATE GAME TRUE/FALSE ────────────────────────────── */
  genTrueFalse(text) {
    const { definitions, functions, causes, topWords } = this.parse(text);
    const pernyataan = [];

    // Benar dari definisi
    definitions.slice(0,3).forEach(def => {
      pernyataan.push({
        teks: `${def.subjek} ${def.predikat} ${def.deskripsi.slice(0,80)}.`,
        jawaban: true,
        penjelasan: `Benar! ${def.subjek} ${def.predikat} ${def.deskripsi.slice(0,80)}.`
      });
    });

    // Salah — balik definisi
    definitions.slice(0,2).forEach((def, i) => {
      const altTopik = topWords.find(w=>!def.subjek.toLowerCase().includes(w))||"hal lain";
      pernyataan.push({
        teks: `${def.subjek} ${def.predikat} ${altTopik} yang tidak berkaitan dengan materi.`,
        jawaban: false,
        penjelasan: `Salah! ${def.subjek} ${def.predikat} ${def.deskripsi.slice(0,60)}, bukan yang disebutkan.`
      });
    });

    // Dari fungsi
    functions.slice(0,2).forEach(fn => {
      pernyataan.push({
        teks: `${fn.subjek.charAt(0).toUpperCase()+fn.subjek.slice(1)} berfungsi ${fn.fungsi.slice(0,60)}.`,
        jawaban: true,
        penjelasan: `Benar! ${fn.subjek} memang berfungsi ${fn.fungsi.slice(0,80)}.`
      });
    });

    if (pernyataan.length < 4) return null;
    return {
      type:"truefalse", title:"Benar atau Salah?",
      instruksi:"Tentukan apakah pernyataan berikut benar atau salah!",
      pernyataan: this._shuffle(pernyataan).slice(0,8)
    };
  },

  /* ── GENERATE ACCORDION ─────────────────────────────────── */
  genAccordion(text) {
    const { definitions, enumerations, functions, topWords, topPhrases } = this.parse(text);
    const items = [];

    // From definitions
    definitions.slice(0,6).forEach((def, i) => {
      const isi = `${def.predikat.charAt(0).toUpperCase()+def.predikat.slice(1)} ${def.deskripsi}`;
      items.push({
        icon: this._pickIcon(i),
        judul: def.subjek,
        isi
      });
    });

    // From enumerations
    enumerations.slice(0,3).forEach((en, i) => {
      const list = en.items.map((item, j) => `${j+1}. ${item}`).join("\n");
      items.push({
        icon: this._pickIcon(definitions.length + i),
        judul: `Yang ${en.intro}`,
        isi: `Berikut adalah hal-hal yang ${en.intro}:\n${list}`
      });
    });

    // From functions
    functions.slice(0,3).forEach((fn, i) => {
      items.push({
        icon: this._pickIcon(definitions.length + enumerations.length + i),
        judul: `Fungsi ${fn.subjek}`,
        isi: `${fn.subjek.charAt(0).toUpperCase()+fn.subjek.slice(1)} berfungsi ${fn.fungsi}.`
      });
    });

    // Fallback from topWords if too few items
    if (items.length < 3) {
      topWords.slice(0,5).forEach((w, i) => {
        if (items.find(it => it.judul.toLowerCase().includes(w))) return;
        items.push({
          icon: this._pickIcon(items.length + i),
          judul: w.charAt(0).toUpperCase()+w.slice(1),
          isi: `${w.charAt(0).toUpperCase()+w.slice(1)} merupakan konsep penting yang berkaitan dengan ${topPhrases[0]||topWords[1]||"materi"} dan berperan dalam kehidupan bermasyarakat.`
        });
      });
    }

    if (items.length < 2) return null;

    const title = definitions[0]
      ? `📋 ${definitions[0].subjek} — Tanya Jawab`
      : `📋 Tanya Jawab Materi`;

    const intro = definitions[0]
      ? `Pahami berbagai aspek dari ${definitions[0].subjek.toLowerCase()} melalui pertanyaan dan jawaban berikut. Klik setiap bagian untuk membuka penjelasannya.`
      : `Pelajari materi melalui pertanyaan dan jawaban berikut. Klik setiap bagian untuk membuka penjelasannya.`;

    return {
      type:"accordion",
      title,
      intro,
      items: items.slice(0,8)
    };
  },

  /* ── GENERATE TAB-ICONS ─────────────────────────────────── */
  genTabIcons(text) {
    const { definitions, functions, enumerations, topWords, topPhrases } = this.parse(text);
    const tabs = [];

    // Each function becomes a tab
    functions.slice(0,5).forEach((fn, i) => {
      const poin = [];
      // Break function into bullet points
      const funcParts = fn.fungsi.split(/[,;]/).map(s=>s.trim()).filter(s=>s.length>5);
      funcParts.slice(0,4).forEach(p => poin.push(p));

      // If not enough points, add from definitions
      if (poin.length < 2) {
        const relatedDef = definitions.find(d => d.subjek.toLowerCase() === fn.subjek.toLowerCase());
        if (relatedDef) poin.push(relatedDef.deskripsi.slice(0,60));
      }

      tabs.push({
        icon: this._pickIcon(i),
        judul: fn.subjek.charAt(0).toUpperCase()+fn.subjek.slice(1),
        warna: this._pickColor(i),
        isi: `${fn.subjek.charAt(0).toUpperCase()+fn.subjek.slice(1)} berperan penting dalam kehidupan. Berikut adalah penjelasan mengenai fungsinya:`,
        poin,
        refleksi: `Bagaimana kamu bisa menerapkan fungsi ${fn.subjek.toLowerCase()} dalam kehidupan sehari-hari?`
      });
    });

    // If no functions, build tabs from definitions
    if (tabs.length === 0) {
      definitions.slice(0,4).forEach((def, i) => {
        const poin = def.deskripsi.split(/[,;]/).map(s=>s.trim()).filter(s=>s.length>5).slice(0,4);
        tabs.push({
          icon: this._pickIcon(i),
          judul: def.subjek,
          warna: this._pickColor(i),
          isi: `${def.predikat.charAt(0).toUpperCase()+def.predikat.slice(1)} ${def.deskripsi}`,
          poin: poin.length > 0 ? poin : [`Memahami konsep ${def.subjek.toLowerCase()}`],
          refleksi: `Mengapa pemahaman tentang ${def.subjek.toLowerCase()} penting bagimu?`
        });
      });
    }

    // Supplement with enumerations as additional tabs
    if (tabs.length < 3) {
      enumerations.slice(0,2).forEach((en, i) => {
        tabs.push({
          icon: this._pickIcon(tabs.length + i),
          judul: `Jenis-jenis`,
          warna: this._pickColor(tabs.length + i),
          isi: `Materi ini memiliki beberapa jenis yang ${en.intro}:`,
          poin: en.items.slice(0,5),
          refleksi: `Mana dari jenis-jenis tersebut yang paling sering kamu temui?`
        });
      });
    }

    // Fallback from topWords
    if (tabs.length < 2) {
      topWords.slice(0,3).forEach((w, i) => {
        if (tabs.find(t => t.judul.toLowerCase().includes(w))) return;
        tabs.push({
          icon: this._pickIcon(tabs.length + i),
          judul: w.charAt(0).toUpperCase()+w.slice(1),
          warna: this._pickColor(tabs.length + i),
          isi: `${w.charAt(0).toUpperCase()+w.slice(1)} merupakan konsep penting dalam materi ini.`,
          poin: [`Berkaitan dengan ${topPhrases[0]||topWords[1]||"materi"}`, `Berperan dalam kehidupan sehari-hari`],
          refleksi: `Bagaimana ${w} relevan dengan pengalamanmu?`
        });
      });
    }

    if (tabs.length < 2) return null;

    const title = definitions[0]
      ? `🗂️ Fungsi & Peran ${definitions[0].subjek}`
      : `🗂️ Fungsi & Peran Materi`;

    const intro = definitions[0]
      ? `Jelajahi berbagai fungsi dan peran dari ${definitions[0].subjek.toLowerCase()} melalui tab-tab berikut. Setiap tab membahas aspek yang berbeda.`
      : `Jelajahi berbagai aspek materi melalui tab-tab berikut. Setiap tab membahas aspek yang berbeda.`;

    return {
      type:"tab-icons",
      title,
      intro,
      layout:"vertical",
      animasi:"fade-in",
      tabs: tabs.slice(0,5)
    };
  },

  /* ── GENERATE ICON-EXPLORE ──────────────────────────────── */
  genIconExplore(text) {
    const { definitions, enumerations, functions, topWords, topPhrases, sentences } = this.parse(text);
    const items = [];

    // From definitions
    definitions.slice(0,6).forEach((def, i) => {
      // Find related example from sentences
      const relatedSentence = sentences.find(s =>
        s.toLowerCase().includes(def.subjek.toLowerCase().split(/\s+/)[0]) &&
        !s.toLowerCase().includes(def.predikat)
      );
      const contoh = [];
      if (relatedSentence) contoh.push(relatedSentence.slice(0,80));
      // Add enumeration items as examples if related
      const relatedEnum = enumerations.find(en => en.items.some(it => it.toLowerCase().includes(def.subjek.toLowerCase().split(/\s+/)[0])));
      if (relatedEnum) contoh.push(...relatedEnum.items.slice(0,2));

      // Find related sanksi/consequence from functions
      const relatedFn = functions.find(fn => fn.subjek.toLowerCase() === def.subjek.toLowerCase());
      const sanksi = relatedFn
        ? `Pelanggaran terhadap ${def.subjek.toLowerCase()} dapat mengakibatkan ${relatedFn.fungsi.slice(0,50).replace(/^untuk /,"tidak tercapainya ")}`
        : `Pelanggaran terhadap ${def.subjek.toLowerCase()} dapat berdampak negatif bagi kehidupan bersama`;

      items.push({
        icon: this._pickIcon(i),
        judul: def.subjek,
        warna: this._pickColor(i),
        ringkasan: def.deskripsi.slice(0,60),
        isi: `${def.predikat.charAt(0).toUpperCase()+def.predikat.slice(1)} ${def.deskripsi}`,
        contoh: contoh.slice(0,3),
        sanksi
      });
    });

    // From enumerations (if not enough items)
    if (items.length < 4) {
      enumerations.slice(0,3).forEach((en, i) => {
        en.items.slice(0,3).forEach((item, j) => {
          if (items.find(it => it.judul.toLowerCase().includes(item.toLowerCase()))) return;
          items.push({
            icon: this._pickIcon(items.length),
            judul: item.charAt(0).toUpperCase()+item.slice(1),
            warna: this._pickColor(items.length),
            ringkasan: `Salah satu bagian yang ${en.intro}`,
            isi: `${item.charAt(0).toUpperCase()+item.slice(1)} merupakan bagian yang ${en.intro} dalam materi ini. Item ini berperan penting dalam keseluruhan konsep yang dipelajari.`,
            contoh: [`${item} diterapkan dalam kehidupan sehari-hari`],
            sanksi: `Mengabaikan ${item.toLowerCase()} dapat merusak keseimbangan dalam kehidupan bermasyarakat`
          });
        });
      });
    }

    // Fallback from topWords
    if (items.length < 3) {
      topWords.slice(0,5).forEach((w, i) => {
        if (items.find(it => it.judul.toLowerCase().includes(w))) return;
        const relatedSentence = sentences.find(s => s.toLowerCase().includes(w));
        items.push({
          icon: this._pickIcon(items.length + i),
          judul: w.charAt(0).toUpperCase()+w.slice(1),
          warna: this._pickColor(items.length + i),
          ringkasan: `Konsep penting dalam materi yang berkaitan dengan ${topPhrases[0]||"topik utama"}`,
          isi: relatedSentence
            ? relatedSentence.slice(0,120)
            : `${w.charAt(0).toUpperCase()+w.slice(1)} merupakan konsep penting dalam materi ini yang berperan dalam kehidupan bermasyarakat.`,
          contoh: [`Penerapan ${w} di lingkungan sekitar`],
          sanksi: `Tanpa ${w}, kehidupan bermasyarakat dapat terganggu`
        });
      });
    }

    if (items.length < 2) return null;

    const title = definitions[0]
      ? `🔍 Jelajahi ${definitions[0].subjek}`
      : `🔍 Jelajahi Konsep Materi`;

    const intro = definitions[0]
      ? `Klik setiap ikon untuk mempelajari lebih dalam tentang ${definitions[0].subjek.toLowerCase()} dan berbagai aspeknya. Temukan definisi, contoh, dan konsekuensi dari setiap konsep.`
      : `Klik setiap ikon untuk mempelajari lebih dalam tentang konsep-konsep materi. Temukan definisi, contoh, dan konsekuensinya.`;

    return {
      type:"icon-explore",
      title,
      intro,
      layout:"grid",
      animasi:"zoom",
      items: items.slice(0,9)
    };
  },

  /* ── parse() dengan cache — dipanggil sekali per teks ───── */
  // Cache dikelola dari luar (AG controller di index.html).
  // Fungsi-fungsi gen* sudah menerima `text` langsung, tapi juga
  // bisa dipanggil dengan hasil parse yang sudah ada via _useParsed.
  _useParsed: null,   // {text, result} — diisi AG.runStep sebelum memanggil gen*

  _getParsed(text) {
    if (this._useParsed && this._useParsed.text === text) return this._useParsed.result;
    const result = this.parse(text);
    this._useParsed = { text, result };
    return result;
  }

};

console.log("✅ autogen.js v2.0 loaded — wizard-only, parse cache via _getParsed(), +accordion +tab-icons +icon-explore");
