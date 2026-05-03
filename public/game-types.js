/* ══════════════════════════════════════════════════════════════
   game-types.js — Game type definitions with defaultData()
   Split from games.js for easier maintenance.
   Each type: id, label, icon, color, desc, defaultData()
   ══════════════════════════════════════════════════════════════ */

window.GAME_TYPES = {

  truefalse: {
    id:"truefalse", icon:"✅", label:"Benar atau Salah", color:"var(--g)",
    desc:"Siswa menilai pernyataan benar/salah, dapat poin & feedback langsung.",
    defaultData() {
      return {
        type:"truefalse", title:"Benar atau Salah?",
        instruksi:"Tentukan apakah pernyataan berikut benar atau salah!",
        pernyataan:[
          { teks:"Norma adalah aturan yang mengatur perilaku manusia dalam masyarakat.", jawaban:true,  penjelasan:"Benar! Norma adalah aturan/pedoman yang mengatur perilaku dalam kehidupan bermasyarakat." },
          { teks:"Pelanggaran norma agama hanya mendapat sanksi berupa denda dari pemerintah.", jawaban:false, penjelasan:"Salah! Sanksi norma agama bersifat spiritual, yaitu dosa yang dipertanggungjawabkan kepada Tuhan." },
          { teks:"Manusia disebut Zoon Politikon karena selalu membutuhkan orang lain.", jawaban:true,  penjelasan:"Benar! Aristoteles menyebut manusia sebagai makhluk sosial yang tidak bisa hidup sendiri." },
          { teks:"Norma hukum tidak memiliki sanksi yang tegas.", jawaban:false, penjelasan:"Salah! Norma hukum memiliki sanksi paling tegas, berupa denda, penjara, atau hukuman dari negara." },
        ]
      };
    }
  },

  sorting: {
    id:"sorting", icon:"🔢", label:"Urutkan / Klasifikasi", color:"var(--c)",
    desc:"Siswa mengurutkan atau mengklasifikasikan item ke kategori yang benar.",
    defaultData() {
      return {
        type:"sorting", title:"Klasifikasikan Norma",
        instruksi:"Seret setiap contoh ke kategori norma yang tepat!",
        kategori:[
          { label:"Norma Agama",     color:"var(--y)", id:"agama" },
          { label:"Norma Hukum",     color:"var(--r)", id:"hukum" },
          { label:"Norma Kesopanan", color:"var(--c)", id:"sopan" },
          { label:"Norma Kesusilaan",color:"var(--p)", id:"susila" },
        ],
        items:[
          { teks:"Berdoa sebelum makan",         kategori:"agama"  },
          { teks:"Membayar pajak",               kategori:"hukum"  },
          { teks:"Memberi salam kepada guru",    kategori:"sopan"  },
          { teks:"Tidak berbohong",              kategori:"susila" },
          { teks:"Sholat lima waktu",            kategori:"agama"  },
          { teks:"Tidak mencuri",                kategori:"hukum"  },
          { teks:"Antre dengan tertib",          kategori:"sopan"  },
          { teks:"Menolong orang yang kesulitan",kategori:"susila" },
        ]
      };
    }
  },

  spinwheel: {
    id:"spinwheel", icon:"🎡", label:"Roda Putar Pertanyaan", color:"var(--o)",
    desc:"Putar roda, pertanyaan random muncul. Cocok untuk review/diskusi kelas.",
    defaultData() {
      return {
        type:"spinwheel", title:"Roda Pengetahuan Norma",
        instruksi:"Putar roda! Jawab pertanyaan yang muncul.",
        soal:[
          { teks:"Sebutkan 4 macam norma yang ada di masyarakat!", kategori:"Hafalan" },
          { teks:"Apa yang dimaksud dengan sanksi norma hukum?", kategori:"Pemahaman" },
          { teks:"Berikan 1 contoh penerapan norma agama di kehidupan sehari-hari!", kategori:"Aplikasi" },
          { teks:"Mengapa manusia perlu norma dalam kehidupan bermasyarakat?", kategori:"Analisis" },
          { teks:"Apa perbedaan norma kesusilaan dan norma kesopanan?", kategori:"Analisis" },
          { teks:"Apa sanksi jika melanggar norma hukum?", kategori:"Hafalan" },
          { teks:"Siapa yang berwenang membuat norma hukum di Indonesia?", kategori:"Pemahaman" },
          { teks:"Berikan contoh konflik yang terjadi karena tidak adanya norma!", kategori:"Aplikasi" },
        ]
      };
    }
  },

  memory: {
    id:"memory", icon:"🧠", label:"Kartu Memori (Match)", color:"var(--p)",
    desc:"Balik dan cocokkan pasangan kartu. Melatih memori dan pemahaman konsep.",
    defaultData() {
      return {
        type:"memory", title:"Memory: Norma & Definisinya",
        instruksi:"Balik dua kartu. Cocokkan istilah dengan definisinya!",
        pasangan:[
          { a:"Norma",       b:"Aturan yang mengatur perilaku dalam masyarakat" },
          { a:"Sanksi",      b:"Akibat dari pelanggaran norma" },
          { a:"Agama",       b:"Norma yang bersumber dari wahyu Tuhan" },
          { a:"Hukum",       b:"Norma dengan sanksi paling tegas dari negara" },
          { a:"Kesusilaan",  b:"Norma yang bersumber dari hati nurani" },
          { a:"Kesopanan",   b:"Norma tentang tata krama pergaulan" },
        ]
      };
    }
  },

  teambuzzer: {
    id:"teambuzzer", icon:"🏆", label:"Kuis Tim / Buzzer", color:"var(--y)",
    desc:"Kuis cepat antar kelompok, skor real-time. Cocok untuk kompetisi kelas.",
    defaultData() {
      return {
        type:"teambuzzer", title:"Kuis Tim: Norma & Hukum",
        instruksi:"Dua tim bersaing menjawab soal. Tim yang pertama buzzer dapat kesempatan menjawab!",
        timA:"Tim Merah 🔴", timB:"Tim Biru 🔵",
        soal:[
          { teks:"Apa kepanjangan dari UUD?", jawaban:"Undang-Undang Dasar", poin:10 },
          { teks:"Siapa yang menyebut manusia sebagai Zoon Politikon?", jawaban:"Aristoteles", poin:10 },
          { teks:"Sebutkan 4 macam norma!", jawaban:"Agama, Kesusilaan, Kesopanan, Hukum", poin:20 },
          { teks:"Apa sanksi norma kesusilaan?", jawaban:"Rasa malu / dikucilkan masyarakat", poin:15 },
          { teks:"Apa fungsi norma dalam masyarakat? Sebutkan 2!", jawaban:"Pedoman tingkah laku, menciptakan ketertiban (dll.)", poin:20 },
        ]
      };
    }
  },

  wordsearch: {
    id:"wordsearch", icon:"🔍", label:"Teka-Teki Kata", color:"var(--b)",
    desc:"Cari kata tersembunyi dalam grid huruf. Kata berhubungan dengan materi.",
    defaultData() {
      return {
        type:"wordsearch", title:"Cari Kata: Istilah Norma",
        instruksi:"Temukan semua kata yang berhubungan dengan norma!",
        kata:["NORMA","SANKSI","HUKUM","AGAMA","SOSIAL","ATURAN","ETIKA","MORAL"],
        ukuran:10
      };
    }
  }
};

console.log("✅ game-types.js loaded");
