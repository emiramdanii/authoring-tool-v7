'use client';

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuthoringStore } from '@/store/authoring-store';
import type { CpState, TpItem, AlurItem, KuisItem } from '@/store/authoring-store';

// ═══════════════════════════════════════════════════════════════════
// Types & Interfaces
// ═══════════════════════════════════════════════════════════════════

interface ParseResult {
  sentences: string[];
  words: string[];
  topWords: string[];
  wordCount: number;
  definitions: { term: string; meaning: string }[];
  enumerations: { subject: string; items: string[] }[];
  functions: { subject: string; desc: string }[];
  causes: { cause: string; effect: string }[];
}

interface FlashcardItem {
  depan: string;
  belakang: string;
  hint: string;
}

interface MatchingPair {
  kiri: string;
  kanan: string;
}

interface TrueFalseItem {
  teks: string;
  jawaban: boolean;
  penjelasan: string;
}

interface SkenarioChoice {
  icon: string;
  label: string;
  detail: string;
  good: boolean;
  pts: number;
  level: string;
  norma: string;
  resultTitle: string;
  resultBody: string;
  consequences: { icon: string; text: string }[];
}

interface SkenarioChapter {
  id: string;
  title: string;
  bg: string;
  charEmoji: string;
  charColor: string;
  charPants: string;
  choicePrompt: string;
  setup: { speaker: string; text: string }[];
  choices: SkenarioChoice[];
}

interface FlashcardModule {
  type: 'flashcard';
  title: string;
  instruksi: string;
  kartu: FlashcardItem[];
}

interface MatchingModule {
  type: 'matching';
  title: string;
  instruksi: string;
  pasangan: MatchingPair[];
}

interface TrueFalseModule {
  type: 'truefalse';
  title: string;
  instruksi: string;
  pernyataan: TrueFalseItem[];
}

interface AccordionModule {
  type: 'accordion';
  title: string;
  intro: string;
  items: { icon: string; judul: string; isi: string }[];
}

interface TabIconsModule {
  type: 'tab-icons';
  title: string;
  intro: string;
  layout: string;
  animasi: string;
  tabs: { icon: string; judul: string; warna: string; isi: string; poin: string[]; refleksi: string }[];
}

interface IconExploreModule {
  type: 'icon-explore';
  title: string;
  intro: string;
  layout: string;
  animasi: string;
  items: { icon: string; judul: string; warna: string; ringkasan: string; isi: string; contoh: string[]; sanksi: string }[];
}

interface ComparisonModule {
  type: 'comparison';
  title: string;
  intro: string;
  animasi: string;
  kolom: { icon: string; judul: string; warna: string }[];
  baris: { label: string; icon: string; nilai: string[] }[];
  tanya: string;
}

type ModuleOutput = FlashcardModule | MatchingModule | TrueFalseModule | AccordionModule | TabIconsModule | IconExploreModule | ComparisonModule;

interface GenSettings {
  jumlahKuis: number;
  pertemuan: number;
  bloomMax: number;
}

type GenType = 'cp' | 'tp' | 'atp' | 'alur' | 'kuis' | 'flashcard' | 'skenario' | 'matching' | 'truefalse' | 'accordion' | 'tab-icons' | 'icon-explore' | 'comparison';

interface PreviewData {
  type: GenType;
  label: string;
  icon: string;
  data: unknown;
  count: number;
}

// ═══════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════

const STOP_WORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'dalam', 'untuk', 'dengan', 'pada',
  'adalah', 'merupakan', 'yaitu', 'ialah', 'sebuah', 'suatu', 'ini', 'itu',
  'atau', 'juga', 'tidak', 'sudah', 'belum', 'akan', 'dapat', 'bisa',
  'telah', 'oleh', 'sebagai', 'antara', 'baik', 'maupun', 'serta', 'namun',
  'tetapi', 'karena', 'seperti', 'jika', 'saat', 'setiap', 'seluruh',
  'lain', 'banyak', 'beberapa', 'semua', 'mereka', 'kita', 'kami', 'dia',
  'ia', 'beliau', 'kalian', 'anda', 'saya', 'aku', 'diri', 'sendiri',
  'tentang', 'secara', 'lebih', 'paling', 'sangat', 'hanya', 'bahkan',
  'lagi', 'pun', 'nya', 'si', 'kah', 'tah', 'loh', 'deh', 'dong', 'to',
  'setelah', 'sebelum', 'ketika', 'walaupun', 'meskipun', 'maka', 'agar',
  'supaya', 'hingga', 'sampai', 'sejak', 'selama', 'terhadap', 'melalui',
  'tanpa', 'kecuali', 'selain', 'tersebut', 'berikut', 'berdasarkan',
  'menurut', 'berkat', 'berdasar', 'guna', 'mengenai', 'perihal',
  'no', 'nomor', 'bab', 'pertemuan', 'hal', 'halaman', 'poin',
]);

const BLOOM_VERBS: Record<number, string[]> = {
  1: ['Menyebutkan', 'Mendefinisikan', 'Mengidentifikasi', 'Menyebut', 'Menuliskan'],
  2: ['Menjelaskan', 'Mendeskripsikan', 'Menguraikan', 'Merangkum', 'Menyimpulkan'],
  3: ['Menerapkan', 'Menggunakan', 'Mengklasifikasikan', 'Mencontohkan', 'Melaksanakan'],
  4: ['Menganalisis', 'Membandingkan', 'Membedakan', 'Mengorganisasi', 'Menghubungkan'],
  5: ['Mengevaluasi', 'Mengkritik', 'Menilai', 'Membenarkan', 'Menguji'],
  6: ['Menciptakan', 'Merancang', 'Merumuskan', 'Menyusun', 'Mengembangkan'],
};

const COLOR_PALETTE = ['#f9c82e', '#3ecfcf', '#a78bfa', '#34d399', '#ff6b6b', '#fb923c', '#60a5fa', '#f472b6'];

const BG_OPTIONS = ['sbg-kampung', 'sbg-kelas', 'sbg-pasar', 'sbg-taman', 'sbg-kantor', 'sbg-rumah'];
const CHAR_EMOJIS = ['👦', '👧', '👨‍🏫', '👩‍🎓', '🧑‍💼', '👨‍🌾'];
const CHAR_COLORS = ['#3ecfcf', '#a78bfa', '#f9c82e', '#34d399', '#ff6b6b', '#fb923c'];
const CHAR_PANTS = ['#2d3748', '#4a5568', '#1a202c', '#2d3748', '#553c9a', '#234e52'];

const NORMA_LEVELS = ['baik', 'cukup', 'kurang'];
const NORMA_LABELS = ['Sesuai norma', 'Perlu perbaikan', 'Melanggar norma'];

const GEN_BUTTONS: { type: GenType; icon: string; label: string; color: string }[] = [
  { type: 'cp', icon: '📋', label: 'CP (Capaian Pembelajaran)', color: 'amber' },
  { type: 'tp', icon: '🎯', label: 'TP (Tujuan Pembelajaran)', color: 'cyan' },
  { type: 'atp', icon: '📅', label: 'ATP (Alur Tujuan Pembelajaran)', color: 'purple' },
  { type: 'alur', icon: '🗺️', label: 'Alur Kegiatan', color: 'purple' },
  { type: 'kuis', icon: '❓', label: 'Kuis Pilihan Ganda', color: 'cyan' },
  { type: 'flashcard', icon: '🃏', label: 'Flashcard', color: 'amber' },
  { type: 'skenario', icon: '🎭', label: 'Skenario', color: 'purple' },
  { type: 'matching', icon: '🔀', label: 'Matching', color: 'cyan' },
  { type: 'truefalse', icon: '✅', label: 'Benar/Salah', color: 'amber' },
  { type: 'accordion', icon: '📁', label: 'Accordion', color: 'green' },
  { type: 'tab-icons', icon: '🏷️', label: 'Tab Icons', color: 'purple' },
  { type: 'icon-explore', icon: '🔍', label: 'Icon Explore', color: 'cyan' },
  { type: 'comparison', icon: '⚖️', label: 'Perbandingan', color: 'amber' },
];

// ═══════════════════════════════════════════════════════════════════
// Parser
// ═══════════════════════════════════════════════════════════════════

function parse(text: string): ParseResult {
  // Split into sentences
  const raw = text.replace(/\n+/g, ' ').trim();
  const sentences = raw
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  // Extract words
  const allWords = raw
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Word frequencies
  const freq = new Map<string, number>();
  for (const w of allWords) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const topWords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([w]) => w);

  // Definitions: "X adalah/merupakan/yaitu/ialah Y"
  const defRegex = /([A-Z][^\s,.:;]{1,40})\s+(?:adalah|merupakan|yaitu|ialah)\s+([^.]+)/g;
  const definitions: { term: string; meaning: string }[] = [];
  let m;
  while ((m = defRegex.exec(raw)) !== null) {
    definitions.push({ term: m[1].trim(), meaning: m[2].trim() });
  }

  // Enumerations: "terdiri dari/meliputi/antara lain X, Y, Z"
  const enumRegex = /([^.]+?)\s+(?:terdiri dari|meliputi|antara lain)\s+([^.]+)/gi;
  const enumerations: { subject: string; items: string[] }[] = [];
  while ((m = enumRegex.exec(raw)) !== null) {
    const items = m[2]
      .split(/[,;]\s*/)
      .map((s) => s.replace(/^(?:yaitu|yakni|ialah)\s+/i, '').trim())
      .filter(Boolean);
    if (items.length >= 2) {
      enumerations.push({ subject: m[1].trim(), items });
    }
  }

  // Functions: "berfungsi/berperan/berguna/bertujuan untuk X"
  const funcRegex = /([^.]+?)\s+(?:berfungsi|berperan|berguna|bertujuan)\s+(?:sebagai|untuk|dalam)?\s*([^.]+)/gi;
  const functions: { subject: string; desc: string }[] = [];
  while ((m = funcRegex.exec(raw)) !== null) {
    functions.push({ subject: m[1].trim(), desc: m[2].trim() });
  }

  // Causes: "karena/sehingga/akibat/menyebabkan X"
  const causeRegex = /([^.]*?(?:karena|akibat|menyebabkan|sehingga)[^.]+)/gi;
  const causes: { cause: string; effect: string }[] = [];
  while ((m = causeRegex.exec(raw)) !== null) {
    const clause = m[1].trim();
    const sep = clause.match(/(?:karena|akibat|menyebabkan|sehingga)/i);
    if (sep) {
      const idx = clause.toLowerCase().indexOf(sep[0].toLowerCase());
      causes.push({
        cause: clause.slice(0, idx).trim(),
        effect: clause.slice(idx + sep[0].length).trim(),
      });
    }
  }

  return {
    sentences,
    words: allWords,
    topWords,
    wordCount: allWords.length,
    definitions,
    enumerations,
    functions,
    causes,
  };
}

// ═══════════════════════════════════════════════════════════════════
// Generators
// ═══════════════════════════════════════════════════════════════════

function genCP(parsed: ParseResult, meta: { namaBab?: string; kelas?: string; mapel?: string }): CpState {
  const { definitions, enumerations, functions, topWords } = parsed;
  const topic = meta.namaBab || topWords[0] || 'materi';
  const parts: string[] = [];

  if (definitions.length > 0) {
    parts.push(
      `Peserta didik mampu memahami ${definitions.map((d) => d.term.toLowerCase()).join(', ')}`,
    );
  }

  if (enumerations.length > 0) {
    const enumItems = enumerations.flatMap((e) => e.items.slice(0, 3));
    parts.push(`mengidentifikasi ${enumItems.join(', ')}`);
  }

  if (functions.length > 0) {
    parts.push(`serta menerapkan ${functions.slice(0, 2).map((f) => f.subject.toLowerCase()).join(' dan ')} dalam kehidupan sehari-hari`);
  }

  if (parts.length === 0) {
    parts.push(`mampu memahami konsep-konsep dasar ${topic}`);
  }

  // Context-aware closing based on parsed content
  const closingParts: string[] = [];
  const allTerms = definitions.map((d) => d.term.toLowerCase());
  if (allTerms.some((t) => t.includes('norma') || t.includes('hukum') || t.includes('aturan'))) {
    closingParts.push('menunjukkan sikap patuh terhadap norma dalam kehidupan bermasyarakat');
  } else if (allTerms.some((t) => t.includes('pancasila') || t.includes('dasar negara'))) {
    closingParts.push('mengamalkan nilai-nilai Pancasila dalam kehidupan sehari-hari');
  } else if (allTerms.some((t) => t.includes('demokrasi') || t.includes('pemilihan'))) {
    closingParts.push('menunjukkan sikap demokratis dalam pengambilan keputusan bersama');
  } else if (allTerms.some((t) => t.includes('ekonomi') || t.includes('pasar') || t.includes('uang'))) {
    closingParts.push('menunjukkan perilaku ekonomi yang bijak dan bertanggung jawab');
  } else if (allTerms.some((t) => t.includes('geografi') || t.includes('lingkungan') || t.includes('alam'))) {
    closingParts.push('menjaga kelestarian lingkungan hidup di sekitarnya');
  } else if (allTerms.some((t) => t.includes('sejarah') || t.includes('perjuangan') || t.includes('kemerdekaan'))) {
    closingParts.push('menghargai jasa pahlawan dan menjaga keutuhan NKRI');
  } else {
    // Generic context-aware closing
    closingParts.push(`menunjukkan sikap bertanggung jawab dalam penerapan ${topic}`);
  }

  if (closingParts.length > 0) {
    parts.push(`serta ${closingParts.join(' dan ')}`);
  }

  return {
    elemen: meta.mapel || 'Pancasila',
    subElemen: topWords.slice(0, 3).join(', ') || 'Pemahaman materi',
    capaianFase: parts.join(' ') + '.',
    profil: ['Beriman & Bertakwa kepada Tuhan YME', 'Bernalar Kritis', 'Gotong Royong'],
    fase: 'D',
    kelas: meta.kelas || 'VII',
  };
}

function genTP(parsed: ParseResult, opts: GenSettings): TpItem[] {
  const { definitions, enumerations, functions, topWords, sentences } = parsed;
  const { pertemuan, bloomMax } = opts;
  const tps: TpItem[] = [];
  let idx = 0;

  // C1: Definitions → Menyebutkan / Mendefinisikan
  for (const def of definitions) {
    if (idx >= bloomMax) break;
    const verb = BLOOM_VERBS[1][idx % BLOOM_VERBS[1].length];
    const pert = Math.min(Math.ceil((idx + 1) / 2), pertemuan);
    tps.push({
      verb,
      desc: `pengertian ${def.term.toLowerCase()} yaitu ${def.meaning.toLowerCase()}`,
      pertemuan: pert,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    });
    idx++;
  }

  // C2: Enumerations → Menjelaskan / Mendeskripsikan
  if (2 <= bloomMax) {
    for (const en of enumerations) {
      if (idx >= bloomMax) break;
      const verb = BLOOM_VERBS[2][idx % BLOOM_VERBS[2].length];
      const pert = Math.min(Math.ceil((idx + 1) / 2), pertemuan);
      tps.push({
        verb,
        desc: `${en.items.slice(0, 3).join(', ')} sebagai bagian dari ${en.subject.toLowerCase()}`,
        pertemuan: pert,
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      });
      idx++;
    }
  }

  // C3: Functions → Menerapkan / Menggunakan
  if (3 <= bloomMax) {
    for (const fn of functions) {
      if (idx >= bloomMax) break;
      const verb = BLOOM_VERBS[3][idx % BLOOM_VERBS[3].length];
      const pert = Math.min(Math.ceil((idx + 1) / 2), pertemuan);
      tps.push({
        verb,
        desc: `${fn.desc.toLowerCase()} dalam konteks ${fn.subject.toLowerCase()}`,
        pertemuan: pert,
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      });
      idx++;
    }
  }

  // C4: Analysis → Menganalisis
  if (4 <= bloomMax) {
    const topic = topWords[0] || 'materi';
    const pert = Math.min(Math.ceil((idx + 1) / 2), pertemuan);
    tps.push({
      verb: 'Menganalisis',
      desc: `pentingnya ${topic} dalam kehidupan sehari-hari`,
      pertemuan: pert,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    });
    idx++;
  }

  // C5: Evaluate
  if (5 <= bloomMax) {
    const topic = topWords[0] || 'materi';
    const pert = Math.min(idx + 1, pertemuan);
    tps.push({
      verb: 'Mengevaluasi',
      desc: `penerapan ${topic} di lingkungan sekitar`,
      pertemuan: pert,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    });
    idx++;
  }

  // C6: Create
  if (6 <= bloomMax) {
    const topic = topWords[0] || 'materi';
    const pert = Math.min(idx + 1, pertemuan);
    tps.push({
      verb: 'Menyusun',
      desc: `rangkuman tentang ${topic} berdasarkan hasil pembelajaran`,
      pertemuan: pert,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
    });
  }

  // Fallback: at least 3 TPs
  if (tps.length < 3 && sentences.length > 0) {
    while (tps.length < 3) {
      const s = sentences[tps.length % sentences.length];
      const pert = Math.min(tps.length + 1, pertemuan);
      tps.push({
        verb: BLOOM_VERBS[Math.min(tps.length + 1, 6)][tps.length % 5],
        desc: s.slice(0, 120).toLowerCase(),
        pertemuan: pert,
        color: COLOR_PALETTE[tps.length % COLOR_PALETTE.length],
      });
    }
  }

  return tps;
}

function genATP(tps: TpItem[], meta: { namaBab?: string; durasi?: string }, pertemuan: number) {
  const grouped: Map<number, TpItem[]> = new Map();
  for (const tp of tps) {
    const p = tp.pertemuan || 1;
    if (!grouped.has(p)) grouped.set(p, []);
    grouped.get(p)!.push(tp);
  }

  const pertemuanList: { judul: string; tp: string; durasi: string; kegiatan: string; penilaian: string }[] = [];
  const kegiatanTemplates = [
    'Apersepsi → Eksplorasi konsep → Diskusi kelompok → Presentasi',
    'Tanya jawab → Pemaparan materi → Latihan soal → Refleksi',
    'Studi kasus → Analisis kelompok → Game edukatif → Penilaian',
    'Ceramah interaktif → Demonstrasi → Praktik → Evaluasi',
  ];

  for (let i = 1; i <= pertemuan; i++) {
    const group = grouped.get(i) || [];
    const tpText = group.map((tp, idx) => `TP ${idx + 1}: ${tp.verb} ${tp.desc}`).join(' | ');

    pertemuanList.push({
      judul: group.length > 0
        ? `${group[0].verb} ${group[0].desc.split(' ').slice(0, 4).join(' ')}...`
        : `Pertemuan ${i}`,
      tp: tpText || `Pertemuan ${i}`,
      durasi: meta.durasi || '2×40 menit',
      kegiatan: kegiatanTemplates[(i - 1) % kegiatanTemplates.length],
      penilaian: i % 2 === 0 ? 'Kuis + Observasi' : 'Diskusi + Portofolio',
    });
  }

  return {
    namaBab: meta.namaBab || 'Bab',
    jumlahPertemuan: pertemuan,
    pertemuan: pertemuanList,
  };
}

function genAlur(tps: TpItem[], meta: { durasi?: string }, parsed?: ParseResult, totalMinutes = 80): AlurItem[] {
  const steps: AlurItem[] = [];
  const topic = parsed ? (parsed.topWords[0] || 'materi') : 'materi';

  // Pendahuluan: 10-15 min
  steps.push({
    fase: 'Pendahuluan',
    durasi: '10 menit',
    judul: 'Apersepsi & Motivasi',
    deskripsi: `Guru menyapa peserta didik, memeriksa kesiapan belajar, dan mengajukan pertanyaan pemantik terkait ${tps.length > 0 ? tps[0].desc.slice(0, 60) : topic}. Guru mengaitkan materi dengan pengalaman sehari-hari peserta didik.`,
  });

  // Inti steps: distribute time among TPs
  const intiMinutes = totalMinutes - 10 - 10; // minus pendahuluan & penutup
  const intiTpCount = Math.max(tps.length, 2);
  const minutesPerStep = Math.floor(intiMinutes / intiTpCount);

  // Activity templates keyed by verb type for richer descriptions
  const activityMap: Record<string, string[]> = {
    'Menyebutkan': ['mengamati tayangan gambar dan menyebutkan', 'membaca teks dan menyebutkan'],
    'Mendefinisikan': ['mengidentifikasi dan mendefinisikan', 'mencari referensi dan merumuskan definisi'],
    'Mengidentifikasi': ['mengidentifikasi melalui pengamatan langsung', 'mengidentifikasi dari studi kasus'],
    'Menjelaskan': ['mendiskusikan dalam kelompok dan menjelaskan', 'membuat peta konsep dan menjelaskan'],
    'Mendeskripsikan': ['mengamati objek dan mendeskripsikan', 'mewawancarai narasumber dan mendeskripsikan'],
    'Menguraikan': ['menganalisis teks dan menguraikan', 'membuat diagram dan menguraikan'],
    'Menerapkan': ['melakukan simulasi dan menerapkan', 'menyelesaikan masalah kontekstual dan menerapkan'],
    'Menggunakan': ['praktik menggunakan', 'menggunakan dalam situasi nyata'],
    'Mengklasifikasikan': ['mengelompokkan dan mengklasifikasikan', 'mengklasifikasikan berdasarkan kriteria'],
    'Menganalisis': ['menganalisis studi kasus tentang', 'membandingkan dan menganalisis'],
    'Membandingkan': ['membandingkan berbagai contoh tentang', 'membandingkan melalui diskusi'],
    'Mengevaluasi': ['menilai dan mengevaluasi penerapan', 'melakukan penilaian kritis terhadap'],
    'Menciptakan': ['merancang dan menciptakan solusi terkait', 'merancang proyek tentang'],
    'Menyusun': ['menyusun rangkuman dan refleksi tentang', 'menyusun laporan hasil pembelajaran'],
  };

  if (tps.length > 0) {
    tps.slice(0, intiTpCount).forEach((tp, i) => {
      const verb = tp.verb;
      const activityTemplates = activityMap[verb] || ['melakukan kegiatan tentang'];
      const activity = activityTemplates[i % activityTemplates.length];
      steps.push({
        fase: 'Inti',
        durasi: `${minutesPerStep} menit`,
        judul: `${tp.verb} ${tp.desc.split(' ').slice(0, 5).join(' ')}`,
        deskripsi: `Peserta didik ${activity} ${tp.desc}. Guru membimbing dan memberikan umpan balik secara индивидуально dan kelompok.`,
      });
    });
  } else {
    // Default inti steps
    steps.push({
      fase: 'Inti',
      durasi: `${Math.floor(intiMinutes / 2)} menit`,
      judul: 'Eksplorasi Materi',
      deskripsi: `Peserta didik mengeksplorasi ${topic} melalui diskusi kelompok, pengamatan, dan sumber belajar. Guru membimbing proses diskusi dan mengarahkan penemuan konsep.`,
    });
    steps.push({
      fase: 'Inti',
      durasi: `${Math.ceil(intiMinutes / 2)} menit`,
      judul: 'Latihan & Refleksi',
      deskripsi: `Peserta didik mengerjakan latihan soal terkait ${topic} dan melakukan refleksi pembelajaran. Guru memberikan umpan balik dan klarifikasi miskonsepsi.`,
    });
  }

  // Penutup: 10 min
  steps.push({
    fase: 'Penutup',
    durasi: '10 menit',
    judul: 'Kesimpulan & Evaluasi',
    deskripsi: `Guru bersama peserta didik menyimpulkan materi tentang ${topic}. Peserta didik mengerjakan kuis singkat dan mengisi refleksi akhir pembelajaran.`,
  });

  return steps;
}

function genKuis(parsed: ParseResult, jumlah: number): KuisItem[] {
  const { definitions, enumerations, functions, causes, topWords, sentences } = parsed;
  const kuis: KuisItem[] = [];

  // Improved makeWrongOpts: generates plausible full-sentence distractors
  const makeWrongOpts = (correct: string, questionType: 'definition' | 'enumeration' | 'function' | 'general', exclude: string[] = []): string[] => {
    const wrongs: string[] = [];

    if (questionType === 'definition' && definitions.length > 1) {
      // Mix definitions from other terms as distractors
      for (const def of definitions) {
        if (wrongs.length >= 3) break;
        const wrongDef = def.meaning;
        if (wrongDef !== correct && !exclude.some((e) => wrongDef.includes(e))) {
          wrongs.push(wrongDef);
        }
      }
    }

    if (questionType === 'enumeration' && enumerations.length > 1) {
      // Use items from other enumerations as distractors
      for (const en of enumerations) {
        if (wrongs.length >= 3) break;
        for (const item of en.items) {
          if (wrongs.length >= 3) break;
          if (item !== correct && !exclude.some((e) => item.includes(e) || e.includes(item))) {
            wrongs.push(item);
          }
        }
      }
    }

    if (questionType === 'function' && functions.length > 1) {
      // Swap functions between subjects as distractors
      for (const fn of functions) {
        if (wrongs.length >= 3) break;
        const wrongFn = fn.desc;
        if (wrongFn !== correct && !exclude.some((e) => wrongFn.includes(e))) {
          wrongs.push(wrongFn);
        }
      }
    }

    // Fallback: create plausible distractors from sentences
    if (wrongs.length < 3 && sentences.length > 0) {
      for (const s of sentences) {
        if (wrongs.length >= 3) break;
        const candidate = s.slice(0, Math.min(correct.length + 20, 100));
        if (candidate !== correct && !wrongs.includes(candidate) && !exclude.some((e) => candidate.includes(e))) {
          wrongs.push(candidate);
        }
      }
    }

    // Fabricate plausible alternatives using top words
    if (wrongs.length < 3) {
      const topic = topWords[0] || 'materi';
      const topic2 = topWords[1] || 'konsep';
      const topic3 = topWords[2] || 'hal';
      const fabricated = [
        `ketentuan yang mengatur ${topic} dalam kehidupan sehari-hari`,
        `pedoman yang berkaitan dengan ${topic2} di masyarakat`,
        `aturan yang mengatur ${topic3} secara umum`,
      ];
      for (const f of fabricated) {
        if (wrongs.length >= 3) break;
        if (f !== correct && !wrongs.includes(f)) {
          wrongs.push(f);
        }
      }
    }

    while (wrongs.length < 3) {
      wrongs.push(`Pilihan yang kurang tepat ${wrongs.length + 1}`);
    }

    return wrongs.slice(0, 3);
  };

  const shuffleInsert = (correct: string, wrongs: string[]): { opts: string[]; ans: number } => {
    const ans = Math.floor(Math.random() * 4);
    const opts = [...wrongs];
    opts.splice(ans, 0, correct);
    return { opts, ans };
  };

  // Pattern 1: From definitions
  for (const def of definitions) {
    if (kuis.length >= jumlah) break;
    const wrongs = makeWrongOpts(def.meaning, 'definition', [def.term]);
    const { opts, ans } = shuffleInsert(def.meaning, wrongs);
    kuis.push({
      q: `${def.term} adalah ...`,
      opts,
      ans,
      ex: `${def.term} ${def.meaning}.`,
    });
  }

  // Pattern 2: From enumerations
  for (const en of enumerations) {
    if (kuis.length >= jumlah) break;
    const correctItem = en.items[0];
    const wrongs = makeWrongOpts(correctItem, 'enumeration', en.items);
    const { opts, ans } = shuffleInsert(correctItem, wrongs);
    kuis.push({
      q: `Berikut ini yang termasuk ${en.subject.toLowerCase()} adalah ...`,
      opts,
      ans,
      ex: `${en.subject} terdiri dari ${en.items.join(', ')}.`,
    });
  }

  // Pattern 3: From functions
  for (const fn of functions) {
    if (kuis.length >= jumlah) break;
    const wrongs = makeWrongOpts(fn.desc, 'function', [fn.subject]);
    const { opts, ans } = shuffleInsert(fn.desc, wrongs);
    kuis.push({
      q: `${fn.subject} berfungsi untuk ...`,
      opts,
      ans,
      ex: `${fn.subject} berfungsi ${fn.desc}.`,
    });
  }

  // Pattern 4: From causes
  for (const c of causes) {
    if (kuis.length >= jumlah) break;
    const wrongs = makeWrongOpts(c.effect, 'general', [c.cause]);
    const { opts, ans } = shuffleInsert(c.effect, wrongs);
    kuis.push({
      q: `Apa yang terjadi ${c.cause ? `karena ${c.cause.toLowerCase().slice(0, 40)}` : 'dalam materi berikut'} ...`,
      opts,
      ans,
      ex: `${c.cause} menyebabkan ${c.effect}.`,
    });
  }

  // Pattern 5: Contextual from sentences
  for (const s of sentences) {
    if (kuis.length >= jumlah) break;
    const keyWord = topWords.find((w) => s.toLowerCase().includes(w));
    if (!keyWord) continue;
    const correct = s.slice(0, 80);
    const wrongs = makeWrongOpts(correct, 'general', [keyWord]);
    const { opts, ans } = shuffleInsert(correct, wrongs);
    kuis.push({
      q: `Pernyataan yang benar mengenai ${keyWord} adalah ...`,
      opts,
      ans,
      ex: correct,
    });
  }

  // Pattern 6: General
  while (kuis.length < jumlah) {
    const topic = topWords[kuis.length % topWords.length] || 'materi';
    const correct = `Pernyataan yang sesuai dengan konsep ${topic}`;
    const wrongs = makeWrongOpts(correct, 'general');
    const { opts, ans } = shuffleInsert(correct, wrongs);
    kuis.push({
      q: `Manakah pernyataan berikut yang benar tentang ${topic}?`,
      opts,
      ans,
      ex: `Jawaban yang benar berkaitan dengan konsep ${topic}.`,
    });
  }

  return kuis.slice(0, jumlah);
}

// ── Flashcard as Module ──────────────────────────────────────────
function genFlashcard(parsed: ParseResult): FlashcardModule {
  const { definitions, enumerations, functions } = parsed;
  const kartu: FlashcardItem[] = [];

  for (const def of definitions) {
    kartu.push({
      depan: `Apa yang dimaksud dengan ${def.term}?`,
      belakang: def.meaning,
      hint: `Definisi ${def.term}`,
    });
  }

  for (const en of enumerations) {
    kartu.push({
      depan: `Apa saja yang termasuk dalam ${en.subject}?`,
      belakang: en.items.join(', '),
      hint: `Enumerasi dari ${en.subject}`,
    });
  }

  for (const fn of functions) {
    kartu.push({
      depan: `Apa fungsi dari ${fn.subject}?`,
      belakang: fn.desc,
      hint: `Fungsi ${fn.subject}`,
    });
  }

  return {
    type: 'flashcard',
    title: 'Kartu Materi',
    instruksi: 'Pelajari setiap kartu dengan mengklik untuk membalik. Cocokkan pertanyaan di depan dengan jawaban di belakang.',
    kartu,
  };
}

// ── Skenario with Full Chapter Format ────────────────────────────
function genSkenario(parsed: ParseResult, meta: { namaBab?: string }): SkenarioChapter[] {
  const { definitions, enumerations, functions, topWords } = parsed;
  const topic = meta.namaBab || topWords[0] || 'materi';
  const def1 = definitions.length > 0 ? definitions[0] : null;
  const def2 = definitions.length > 1 ? definitions[1] : null;
  const def3 = definitions.length > 2 ? definitions[2] : null;
  const enum1 = enumerations.length > 0 ? enumerations[0] : null;

  const chapters: SkenarioChapter[] = [
    {
      id: 'ch1',
      title: `Mengenal ${topic}`,
      bg: BG_OPTIONS[0],
      charEmoji: CHAR_EMOJIS[0],
      charColor: CHAR_COLORS[0],
      charPants: CHAR_PANTS[0],
      choicePrompt: `Apa yang akan kamu lakukan terkait ${topic}?`,
      setup: [
        { speaker: 'Narrator', text: `Kamu adalah seorang siswa yang baru saja mempelajari tentang ${topic}. Suatu hari, kamu dihadapkan pada situasi yang berkaitan dengan materi ini.` },
        { speaker: 'Rizki', text: `Hai! Kamu sudah belajar tentang ${topic}, kan? Aku mau tanya, ${def1 ? `apa sih ${def1.term} itu?` : `apa yang kamu ketahui tentang ${topic}?`}` },
        { speaker: 'Anda', text: def1 ? `${def1.term} itu ${def1.meaning.toLowerCase()}.` : `Saya sudah mempelajari dasar-dasar ${topic.toLowerCase()}.` },
      ],
      choices: [
        {
          icon: '💡',
          label: 'Menjelaskan dengan detail',
          detail: `Menjelaskan ${def1 ? def1.term.toLowerCase() : topic} secara lengkap dan akurat`,
          good: true,
          pts: 10,
          level: 'baik',
          norma: 'Sesuai norma',
          resultTitle: 'Jawaban Tepat!',
          resultBody: `Kamu berhasil menjelaskan ${def1 ? def1.term.toLowerCase() : topic} dengan baik. ${def1 ? def1.term + ' ' + def1.meaning + '.' : ''}`,
          consequences: [{ icon: '⭐', text: 'Mendapatkan poin pengetahuan' }, { icon: '👏', text: 'Dipuji oleh teman' }],
        },
        {
          icon: '🤔',
          label: 'Menjawab ragu-ragu',
          detail: `Menjawab dengan tidak yaman dan kurang lengkap`,
          good: false,
          pts: 5,
          level: 'cukup',
          norma: 'Perlu perbaikan',
          resultTitle: 'Perlu Belajar Lagi',
          resultBody: `Jawabanmu kurang tepat. ${def1 ? def1.term + ' sebenarnya adalah ' + def1.meaning.toLowerCase() + '.' : 'Coba pelajari lagi materinya.'}`,
          consequences: [{ icon: '📖', text: 'Perlu mengulang materi' }, { icon: '📝', text: 'Catat poin penting' }],
        },
        {
          icon: '🚫',
          label: 'Tidak menjawab',
          detail: `Menghindari pertanyaan dan tidak memberikan jawaban`,
          good: false,
          pts: 0,
          level: 'kurang',
          norma: 'Melanggar norma',
          resultTitle: 'Kesempatan Terlewat',
          resultBody: `Kamu tidak mencoba menjawab. Padahal ini kesempatan untuk berlatih. ${def1 ? def1.term + ' adalah ' + def1.meaning.toLowerCase() + '.' : ''}`,
          consequences: [{ icon: '⚠️', text: 'Tidak mendapat poin' }, { icon: '🔄', text: 'Perlu mengulang kegiatan' }],
        },
      ],
    },
    {
      id: 'ch2',
      title: `Penerapan ${topic}`,
      bg: BG_OPTIONS[1],
      charEmoji: CHAR_EMOJIS[1],
      charColor: CHAR_COLORS[1],
      charPants: CHAR_PANTS[1],
      choicePrompt: `Bagaimana kamu akan menerapkan pengetahuan tentang ${topic}?`,
      setup: [
        { speaker: 'Narrator', text: `Beberapa hari kemudian, kamu melihat situasi di lingkungan yang berkaitan dengan ${topic}. Kamu harus memutuskan tindakan yang tepat.` },
        { speaker: 'Sari', text: `Kamu lihat tidak? Ada yang ${enum1 ? 'tidak melaksanakan ' + enum1.items[0]?.toLowerCase() : 'melanggar aturan tentang ' + topic.toLowerCase()}.` },
        { speaker: 'Anda', text: `Iya, saya melihatnya. ${def2 ? 'Berdasarkan pelajaran, ' + def2.term.toLowerCase() + ' itu ' + def2.meaning.toLowerCase() + '.' : 'Kita harus bertindak sesuai dengan yang sudah dipelajari.'}` },
      ],
      choices: [
        {
          icon: '✋',
          label: 'Mengingatkan dengan sopan',
          detail: `Mengajak berdialog dan mengingatkan sesuai ${topic}`,
          good: true,
          pts: 10,
          level: 'baik',
          norma: 'Sesuai norma',
          resultTitle: 'Tindakan Bijak!',
          resultBody: `Mengingatkan dengan sopan adalah cara terbaik. ${def2 ? def2.term + ' mengajarkan kita untuk ' + def2.meaning.toLowerCase() + '.' : 'Kamu telah menerapkan pengetahuan dengan baik.'}`,
          consequences: [{ icon: '🤝', text: 'Membangun hubungan baik' }, { icon: '⭐', text: 'Menjadi teladan' }],
        },
        {
          icon: '👀',
          label: 'Diam saja',
          detail: `Membiarkan situasi tanpa melakukan apapun`,
          good: false,
          pts: 3,
          level: 'cukup',
          norma: 'Perlu perbaikan',
          resultTitle: 'Kurang Tepat',
          resultBody: `Membiarkan situasi tanpa tindakan bukan sikap yang tepat. ${def2 ? def2.term + ' seharusnya diterapkan dalam kehidupan sehari-hari.' : 'Kita perlu berani bertindak sesuai pengetahuan.'}`,
          consequences: [{ icon: '😐', text: 'Situasi tidak berubah' }, { icon: '💡', text: 'Perlu lebih berani' }],
        },
        {
          icon: '📢',
          label: 'Melaporkan langsung',
          detail: `Melaporkan kepada guru tanpa mencoba mengingatkan terlebih dahulu`,
          good: false,
          pts: 5,
          level: 'cukup',
          norma: 'Perlu perbaikan',
          resultTitle: 'Bisa Lebih Baik',
          resultBody: `Sebaiknya ingatkan terlebih dahulu sebelum melapor. ${enum1 ? enum1.subject + ' meliputi ' + enum1.items.join(', ') + '.' : 'Langkah pertama adalah dialog.'}`,
          consequences: [{ icon: '🔄', text: 'Coba pendekatan dialog dulu' }, { icon: '💬', text: 'Komunikasi lebih efektif' }],
        },
      ],
    },
    {
      id: 'ch3',
      title: `Refleksi ${topic}`,
      bg: BG_OPTIONS[2],
      charEmoji: CHAR_EMOJIS[2],
      charColor: CHAR_COLORS[2],
      charPants: CHAR_PANTS[2],
      choicePrompt: `Apa kesimpulanmu setelah mempelajari ${topic}?`,
      setup: [
        { speaker: 'Narrator', text: `Di akhir pembelajaran, guru meminta kamu untuk merefleksikan apa yang sudah dipelajari tentang ${topic}.` },
        { speaker: 'Guru', text: `Anak-anak, apa yang paling kalian pahami dari pembelajaran ${topic} hari ini?` },
        { speaker: 'Anda', text: `Saya memahami bahwa ${def3 ? def3.term.toLowerCase() + ' ' + def3.meaning.toLowerCase() : topic + ' sangat penting dalam kehidupan kita'}.` },
      ],
      choices: [
        {
          icon: '📝',
          label: 'Membuat rangkuman',
          detail: `Menyusun rangkuman lengkap tentang ${topic}`,
          good: true,
          pts: 10,
          level: 'baik',
          norma: 'Sesuai norma',
          resultTitle: 'Sangat Bagus!',
          resultBody: `Membuat rangkuman adalah cara terbaik memperkuat pemahaman. ${definitions.length > 0 ? 'Konsep kunci: ' + definitions.map((d) => d.term).join(', ') + '.' : ''}`,
          consequences: [{ icon: '📚', text: 'Pemahaman mendalam' }, { icon: '🏆', text: 'Siap evaluasi' }],
        },
        {
          icon: '💭',
          label: 'Berdiskusi dengan teman',
          detail: `Membahas bersama teman untuk saling melengkapi pemahaman`,
          good: true,
          pts: 8,
          level: 'baik',
          norma: 'Sesuai norma',
          resultTitle: 'Kerja Sama yang Baik!',
          resultBody: `Berdiskusi dengan teman memperdalam pemahaman dan membuka perspektif baru tentang ${topic}.`,
          consequences: [{ icon: '🤝', text: 'Saling belajar' }, { icon: '💡', text: 'Perspektif baru' }],
        },
        {
          icon: '🎮',
          label: 'Langsung bermain',
          detail: `Tidak membuat rangkuman dan langsung bermain`,
          good: false,
          pts: 2,
          level: 'kurang',
          norma: 'Melanggar norma',
          resultTitle: 'Kesempatan Terlewat',
          resultBody: `Refleksi penting untuk menguatkan pemahaman. Tanpa refleksi, materi mudah dilupakan.`,
          consequences: [{ icon: '⚠️', text: 'Materi mudah terlupakan' }, { icon: '📖', text: 'Perlu mengulang' }],
        },
      ],
    },
  ];

  return chapters;
}

// ── Matching as Module ───────────────────────────────────────────
function genMatching(parsed: ParseResult): MatchingModule {
  const { definitions, enumerations } = parsed;
  const pasangan: MatchingPair[] = [];

  for (const def of definitions) {
    pasangan.push({
      kiri: def.term,
      kanan: def.meaning.slice(0, 80) + (def.meaning.length > 80 ? '...' : ''),
    });
  }

  for (const en of enumerations) {
    for (const item of en.items.slice(0, 3)) {
      pasangan.push({
        kiri: item,
        kanan: `Bagian dari ${en.subject}`,
      });
    }
  }

  return {
    type: 'matching',
    title: 'Cocokkan Istilah',
    instruksi: 'Cocokkan istilah di kolom kiri dengan definisi atau keterangan yang tepat di kolom kanan. Seret atau klik untuk mencocokkan.',
    pasangan: pasangan.slice(0, 8),
  };
}

// ── TrueFalse as Module ──────────────────────────────────────────
function genTrueFalse(parsed: ParseResult): TrueFalseModule {
  const { definitions, functions, topWords } = parsed;
  const pernyataan: TrueFalseItem[] = [];

  // True statements from definitions
  for (const def of definitions) {
    pernyataan.push({
      teks: `${def.term} adalah ${def.meaning}.`,
      jawaban: true,
      penjelasan: `Benar, ${def.term} ${def.meaning}.`,
    });
  }

  // True statements from functions
  for (const fn of functions) {
    pernyataan.push({
      teks: `${fn.subject} berfungsi untuk ${fn.desc}.`,
      jawaban: true,
      penjelasan: `Benar, ${fn.subject} berfungsi ${fn.desc}.`,
    });
  }

  // False statements (swap definitions between terms)
  if (definitions.length >= 2) {
    for (let i = 0; i < definitions.length && pernyataan.length < definitions.length * 2 + functions.length + 4; i++) {
      const nextIdx = (i + 1) % definitions.length;
      pernyataan.push({
        teks: `${definitions[i].term} adalah ${definitions[nextIdx].meaning}.`,
        jawaban: false,
        penjelasan: `Salah, ${definitions[i].term} adalah ${definitions[i].meaning}, bukan ${definitions[nextIdx].meaning}.`,
      });
    }
  } else if (definitions.length === 1) {
    // Use topWords to create a wrong statement
    const wrongWord = topWords.find(
      (w) => !definitions[0].meaning.toLowerCase().includes(w) && w !== definitions[0].term.toLowerCase(),
    );
    if (wrongWord) {
      pernyataan.push({
        teks: `${definitions[0].term} adalah segala sesuatu yang berkaitan dengan ${wrongWord}.`,
        jawaban: false,
        penjelasan: `Salah, ${definitions[0].term} adalah ${definitions[0].meaning}.`,
      });
    }
  }

  // Swap function descriptions
  if (functions.length >= 2) {
    for (let i = 0; i < functions.length - 1; i++) {
      pernyataan.push({
        teks: `${functions[i].subject} berfungsi untuk ${functions[i + 1].desc}.`,
        jawaban: false,
        penjelasan: `Salah, ${functions[i].subject} berfungsi ${functions[i].desc}, bukan ${functions[i + 1].desc}.`,
      });
    }
  }

  return {
    type: 'truefalse',
    title: 'Benar atau Salah?',
    instruksi: 'Tentukan apakah pernyataan berikut benar atau salah. Berikan alasan untuk jawabanmu.',
    pernyataan,
  };
}

// ── Accordion Module ─────────────────────────────────────────────
function genAccordion(parsed: ParseResult): AccordionModule {
  const { definitions, enumerations, topWords } = parsed;
  const topic = topWords[0] || 'materi';
  const items: { icon: string; judul: string; isi: string }[] = [];

  const contentIcons = ['📌', '📖', '💡', '📋', '🔑', '🎯', '✨', '📝'];

  for (let i = 0; i < definitions.length; i++) {
    items.push({
      icon: contentIcons[i % contentIcons.length],
      judul: definitions[i].term,
      isi: definitions[i].meaning,
    });
  }

  for (let i = 0; i < enumerations.length; i++) {
    items.push({
      icon: contentIcons[(definitions.length + i) % contentIcons.length],
      judul: enumerations[i].subject,
      isi: enumerations[i].items.map((item) => `• ${item}`).join('\n'),
    });
  }

  // Fallback if too few items
  if (items.length < 3 && topWords.length > 0) {
    for (let i = items.length; i < Math.min(4, topWords.length + items.length); i++) {
      items.push({
        icon: contentIcons[i % contentIcons.length],
        judul: topWords[i]?.charAt(0).toUpperCase() + topWords[i]?.slice(1) || `Bagian ${i + 1}`,
        isi: `Penjelasan tentang ${topWords[i] || topic} dan penerapannya dalam kehidupan sehari-hari.`,
      });
    }
  }

  return {
    type: 'accordion',
    title: `Materi ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    intro: `Pelajari setiap bagian materi tentang ${topic} dengan mengklik panel di bawah ini.`,
    items,
  };
}

// ── Tab Icons Module ─────────────────────────────────────────────
function genTabIcons(parsed: ParseResult): TabIconsModule {
  const { functions, definitions, topWords } = parsed;
  const topic = topWords[0] || 'materi';

  const tabIcons = ['⚙️', '🛡️', '📋', '🎯', '💡', '🏛️', '📊', '🌐'];

  const tabs: { icon: string; judul: string; warna: string; isi: string; poin: string[]; refleksi: string }[] = [];

  // Generate one tab per function
  for (let i = 0; i < Math.max(functions.length, definitions.length, 2); i++) {
    const fn = functions[i];
    const def = definitions[i];
    const color = COLOR_PALETTE[i % COLOR_PALETTE.length];

    if (fn) {
      tabs.push({
        icon: tabIcons[i % tabIcons.length],
        judul: fn.subject,
        warna: color,
        isi: `${fn.subject} berfungsi ${fn.desc}. ${def ? def.term + ' adalah ' + def.meaning.toLowerCase() + '.' : ''}`,
        poin: [fn.desc, `Penerapan ${fn.subject.toLowerCase()} dalam kehidupan sehari-hari`],
        refleksi: `Bagaimana ${fn.subject.toLowerCase()} mempengaruhi kehidupanmu?`,
      });
    } else if (def) {
      tabs.push({
        icon: tabIcons[i % tabIcons.length],
        judul: def.term,
        warna: color,
        isi: `${def.term} adalah ${def.meaning.toLowerCase()}.`,
        poin: [def.meaning, `Contoh penerapan ${def.term.toLowerCase()}`],
        refleksi: `Mengapa ${def.term.toLowerCase()} penting dalam kehidupan?`,
      });
    } else {
      const tw = topWords[i] || topic;
      tabs.push({
        icon: tabIcons[i % tabIcons.length],
        judul: tw.charAt(0).toUpperCase() + tw.slice(1),
        warna: color,
        isi: `Penjelasan tentang ${tw} dan perannya dalam ${topic}.`,
        poin: [`Definisi ${tw}`, `Penerapan ${tw}`],
        refleksi: `Apa hubungan ${tw} dengan kehidupan sehari-hari?`,
      });
    }
  }

  return {
    type: 'tab-icons',
    title: `Fungsi & Peran ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    intro: `Klik setiap tab untuk mempelajari fungsi dan peran dari ${topic}.`,
    layout: 'horizontal',
    animasi: 'fade',
    tabs,
  };
}

// ── Icon Explore Module ──────────────────────────────────────────
function genIconExplore(parsed: ParseResult): IconExploreModule {
  const { definitions, enumerations, topWords } = parsed;
  const topic = topWords[0] || 'materi';

  const exploreIcons = ['🏛️', '📜', '⚖️', '🤝', '🌏', '📢', '💡', '🔍'];

  const items: { icon: string; judul: string; warna: string; ringkasan: string; isi: string; contoh: string[]; sanksi: string }[] = [];

  // From definitions
  for (let i = 0; i < Math.max(definitions.length, enumerations.length, 3); i++) {
    const def = definitions[i];
    const en = enumerations[i];
    const color = COLOR_PALETTE[i % COLOR_PALETTE.length];

    if (def) {
      items.push({
        icon: exploreIcons[i % exploreIcons.length],
        judul: def.term,
        warna: color,
        ringkasan: def.meaning.slice(0, 60) + (def.meaning.length > 60 ? '...' : ''),
        isi: def.meaning,
        contoh: en ? en.items.slice(0, 3) : [`Contoh penerapan ${def.term.toLowerCase()}`],
        sanksi: `Pelanggaran terhadap ${def.term.toLowerCase()} dapat menimbulkan dampak negatif bagi individu dan masyarakat.`,
      });
    } else if (en) {
      items.push({
        icon: exploreIcons[i % exploreIcons.length],
        judul: en.subject,
        warna: color,
        ringkasan: `Meliputi ${en.items.slice(0, 2).join(', ')}`,
        isi: `${en.subject} terdiri dari ${en.items.join(', ')}.`,
        contoh: en.items,
        sanksi: `Pelanggaran terhadap ${en.subject.toLowerCase()} dapat berdampak buruk.`,
      });
    } else {
      const tw = topWords[i] || topic;
      items.push({
        icon: exploreIcons[i % exploreIcons.length],
        judul: tw.charAt(0).toUpperCase() + tw.slice(1),
        warna: color,
        ringkasan: `Konsep penting dalam ${topic}`,
        isi: `Penjelasan detail tentang ${tw} dan penerapannya.`,
        contoh: [`Contoh ${tw} dalam kehidupan`],
        sanksi: `Pelanggaran ${tw} memiliki konsekuensi tersendiri.`,
      });
    }
  }

  return {
    type: 'icon-explore',
    title: `Jelajahi ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    intro: `Klik setiap ikon untuk menjelajahi konsep-konsep penting tentang ${topic}.`,
    layout: 'grid',
    animasi: 'fade',
    items,
  };
}

// ── Comparison Module ────────────────────────────────────────────
function genComparison(parsed: ParseResult): ComparisonModule {
  const { definitions, enumerations, topWords } = parsed;
  const topic = topWords[0] || 'materi';

  // Try to build comparison from enumerations (ideal case: 2+ categories)
  const colIcons = ['🔵', '🟢', '🟡', '🔴'];
  const kolom: { icon: string; judul: string; warna: string }[] = [];
  const baris: { label: string; icon: string; nilai: string[] }[] = [];

  if (enumerations.length >= 2) {
    // Use first 2-4 enumerations as columns
    const usedEnums = enumerations.slice(0, Math.min(4, enumerations.length));
    for (let i = 0; i < usedEnums.length; i++) {
      kolom.push({
        icon: colIcons[i % colIcons.length],
        judul: usedEnums[i].subject,
        warna: COLOR_PALETTE[i % COLOR_PALETTE.length],
      });
    }

    // Build rows from comparison aspects
    const aspects = ['Pengertian', 'Sumber', 'Sanksi', 'Contoh', 'Ciri-ciri'];
    for (const aspect of aspects) {
      const values = usedEnums.map((en) => {
        if (aspect === 'Contoh') return en.items.slice(0, 2).join(', ');
        if (aspect === 'Pengertian') {
          const def = definitions.find((d) => en.subject.toLowerCase().includes(d.term.toLowerCase()));
          return def ? def.meaning.slice(0, 60) : `Definisi ${en.subject.toLowerCase()}`;
        }
        return `${aspect} dari ${en.subject.toLowerCase()}`;
      });
      baris.push({
        label: aspect,
        icon: '📌',
        nilai: values,
      });
    }
  } else if (definitions.length >= 2) {
    // Compare definitions
    const usedDefs = definitions.slice(0, Math.min(4, definitions.length));
    for (let i = 0; i < usedDefs.length; i++) {
      kolom.push({
        icon: colIcons[i % colIcons.length],
        judul: usedDefs[i].term,
        warna: COLOR_PALETTE[i % COLOR_PALETTE.length],
      });
    }

    const aspects = ['Pengertian', 'Ciri utama', 'Contoh', 'Dampak'];
    for (const aspect of aspects) {
      const values = usedDefs.map((def) => {
        if (aspect === 'Pengertian') return def.meaning.slice(0, 60);
        if (aspect === 'Contoh') return `Contoh ${def.term.toLowerCase()}`;
        if (aspect === 'Dampak') return `Dampak dari ${def.term.toLowerCase()}`;
        return `${aspect} ${def.term.toLowerCase()}`;
      });
      baris.push({
        label: aspect,
        icon: '📌',
        nilai: values,
      });
    }
  } else {
    // Fallback: generic comparison
    kolom.push(
      { icon: colIcons[0], judul: 'Aspek A', warna: COLOR_PALETTE[0] },
      { icon: colIcons[1], judul: 'Aspek B', warna: COLOR_PALETTE[1] },
    );
    const aspects = ['Pengertian', 'Ciri-ciri', 'Contoh', 'Penerapan'];
    for (const aspect of aspects) {
      baris.push({
        label: aspect,
        icon: '📌',
        nilai: [`${aspect} dari aspek A`, `${aspect} dari aspek B`],
      });
    }
  }

  return {
    type: 'comparison',
    title: `Perbandingan ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    intro: `Bandingkan aspek-aspek berikut untuk memahami perbedaan dan persamaan antara ${kolom.map((k) => k.judul).join(' dan ')}.`,
    animasi: 'fade',
    kolom,
    baris,
    tanya: `Menurutmu, apakah ${kolom[0]?.judul || 'aspek A'} dan ${kolom[1]?.judul || 'aspek B'} memiliki kesamaan? Jelaskan!`,
  };
}

// ── Helper: generate a module from GenType ───────────────────────
function generateModuleData(type: GenType, parsed: ParseResult, meta: { namaBab?: string; kelas?: string; mapel?: string }): ModuleOutput | null {
  switch (type) {
    case 'flashcard': return genFlashcard(parsed);
    case 'matching': return genMatching(parsed);
    case 'truefalse': return genTrueFalse(parsed);
    case 'accordion': return genAccordion(parsed);
    case 'tab-icons': return genTabIcons(parsed);
    case 'icon-explore': return genIconExplore(parsed);
    case 'comparison': return genComparison(parsed);
    default: return null;
  }
}

function getModuleItemCount(mod: ModuleOutput): number {
  switch (mod.type) {
    case 'flashcard': return mod.kartu.length;
    case 'matching': return mod.pasangan.length;
    case 'truefalse': return mod.pernyataan.length;
    case 'accordion': return mod.items.length;
    case 'tab-icons': return mod.tabs.length;
    case 'icon-explore': return mod.items.length;
    case 'comparison': return mod.baris.length;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Spinner Component
// ═══════════════════════════════════════════════════════════════════

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 text-amber-400 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export default function AutoGenerate() {
  const store = useAuthoringStore;
  const meta = useAuthoringStore((s) => s.meta);

  // ── Local state ─────────────────────────────────────────────
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [settings, setSettings] = useState<GenSettings>({
    jumlahKuis: 10,
    pertemuan: 3,
    bloomMax: 6,
  });
  const [loading, setLoading] = useState<Set<GenType>>(new Set());
  const [previews, setPreviews] = useState<PreviewData[]>([]);
  const [activePreview, setActivePreview] = useState<PreviewData | null>(null);

  // ── Parse handler ───────────────────────────────────────────
  const handleParse = useCallback(() => {
    if (text.trim().length < 50) {
      toast.error('Teks terlalu pendek. Paste minimal 50 karakter materi.');
      return;
    }
    const result = parse(text);
    setParsed(result);
    setPreviews([]);
    setActivePreview(null);
    toast.success(`✅ Teks diparsing: ${result.wordCount} kata, ${result.definitions.length} definisi ditemukan`);
  }, [text]);

  // ── Generate single type ────────────────────────────────────
  const handleGenerate = useCallback(
    (type: GenType) => {
      if (!parsed) {
        toast.error('Parse teks terlebih dahulu sebelum generate.');
        return;
      }

      setLoading((prev) => new Set(prev).add(type));

      // Simulate async for UX
      setTimeout(() => {
        try {
          let data: unknown;
          let count = 0;
          let label = '';
          let icon = '';

          // Module types (flashcard, matching, truefalse, accordion, tab-icons, icon-explore, comparison)
          const moduleData = generateModuleData(type, parsed, meta);
          if (moduleData) {
            data = moduleData;
            count = getModuleItemCount(moduleData);
            const btnInfo = GEN_BUTTONS.find((b) => b.type === type);
            label = btnInfo?.label || type;
            icon = btnInfo?.icon || '📦';
          } else {
            switch (type) {
              case 'cp': {
                data = genCP(parsed, meta);
                count = 1;
                label = 'Capaian Pembelajaran';
                icon = '📋';
                break;
              }
              case 'tp': {
                data = genTP(parsed, settings);
                count = (data as TpItem[]).length;
                label = 'Tujuan Pembelajaran';
                icon = '🎯';
                break;
              }
              case 'atp': {
                const tps = genTP(parsed, settings);
                data = genATP(tps, meta, settings.pertemuan);
                count = (data as { pertemuan: unknown[] }).pertemuan.length;
                label = 'Alur Tujuan Pembelajaran';
                icon = '📅';
                break;
              }
              case 'alur': {
                const tps = genTP(parsed, settings);
                data = genAlur(tps, meta, parsed);
                count = (data as AlurItem[]).length;
                label = 'Alur Kegiatan';
                icon = '🗺️';
                break;
              }
              case 'kuis': {
                data = genKuis(parsed, settings.jumlahKuis);
                count = (data as KuisItem[]).length;
                label = 'Kuis Pilihan Ganda';
                icon = '❓';
                break;
              }
              case 'skenario': {
                data = genSkenario(parsed, meta);
                count = (data as SkenarioChapter[]).length;
                label = 'Skenario';
                icon = '🎭';
                break;
              }
            }
          }

          const preview: PreviewData = { type, label, icon, data, count };
          setPreviews((prev) => {
            const filtered = prev.filter((p) => p.type !== type);
            return [...filtered, preview];
          });
          setActivePreview(preview);
          toast.success(`${icon} ${label} berhasil digenerate (${count} item)`);
        } catch (err) {
          toast.error(`Gagal generate: ${(err as Error).message}`);
        } finally {
          setLoading((prev) => {
            const next = new Set(prev);
            next.delete(type);
            return next;
          });
        }
      }, 300 + Math.random() * 400);
    },
    [parsed, meta, settings],
  );

  // ── Apply to store ──────────────────────────────────────────
  const handleApply = useCallback(
    (preview: PreviewData) => {
      switch (preview.type) {
        case 'cp': {
          const cpData = preview.data as CpState;
          store.getState().updateCp('elemen', cpData.elemen);
          store.getState().updateCp('subElemen', cpData.subElemen);
          store.getState().updateCp('capaianFase', cpData.capaianFase);
          store.getState().updateCp('fase', cpData.fase);
          store.getState().updateCp('kelas', cpData.kelas);
          // Clear and set profil
          const currentState = store.getState().cp;
          for (let i = currentState.profil.length - 1; i >= 0; i--) {
            store.getState().removeProfil(i);
          }
          for (const p of cpData.profil) {
            store.getState().addProfil(p);
          }
          toast.success('📋 CP diterapkan ke Dokumen');
          break;
        }
        case 'tp': {
          const tpData = preview.data as TpItem[];
          store.setState({ tp: tpData, dirty: true });
          toast.success(`🎯 ${tpData.length} TP diterapkan`);
          break;
        }
        case 'atp': {
          const atpData = preview.data as { namaBab: string; jumlahPertemuan: number; pertemuan: unknown[] };
          store.setState({
            atp: {
              namaBab: atpData.namaBab,
              jumlahPertemuan: atpData.jumlahPertemuan,
              pertemuan: atpData.pertemuan as import('@/store/authoring-store').AtpPertemuan[],
            },
            dirty: true,
          });
          toast.success(`📅 ATP ${atpData.jumlahPertemuan} pertemuan diterapkan`);
          break;
        }
        case 'alur': {
          const alurData = preview.data as AlurItem[];
          store.setState({ alur: alurData, dirty: true });
          toast.success(`🗺️ ${alurData.length} langkah alur diterapkan`);
          break;
        }
        case 'kuis': {
          const kuisData = preview.data as KuisItem[];
          store.setState({ kuis: kuisData, dirty: true });
          toast.success(`❓ ${kuisData.length} soal kuis diterapkan`);
          break;
        }
        case 'skenario': {
          // Apply skenario as a module in the modules array
          const skenarioData = preview.data as SkenarioChapter[];
          const skenarioModule = {
            type: 'skenario',
            title: `Skenario ${skenarioData[0]?.title || ''}`,
            chapters: skenarioData,
          };
          const existingModules = store.getState().modules;
          const filtered = existingModules.filter((m) => (m as Record<string, unknown>).type !== 'skenario');
          store.setState({ modules: [...filtered, skenarioModule], dirty: true });
          toast.success(`🎭 ${skenarioData.length} bab skenario diterapkan`);
          break;
        }
        case 'flashcard':
        case 'matching':
        case 'truefalse':
        case 'accordion':
        case 'tab-icons':
        case 'icon-explore':
        case 'comparison': {
          // All these types go to modules array
          const moduleData = preview.data as Record<string, unknown>;
          const existingModules = store.getState().modules;
          const filtered = existingModules.filter((m) => (m as Record<string, unknown>).type !== moduleData.type);
          store.setState({ modules: [...filtered, moduleData], dirty: true });
          const itemCount = (moduleData.kartu as unknown[])?.length || (moduleData.pasangan as unknown[])?.length || (moduleData.pernyataan as unknown[])?.length || (moduleData.items as unknown[])?.length || (moduleData.tabs as unknown[])?.length || (moduleData.baris as unknown[])?.length || 0;
          toast.success(`${GEN_BUTTONS.find((b) => b.type === preview.type)?.icon || '📦'} ${preview.label} diterapkan (${itemCount} item)`);
          break;
        }
      }
    },
    [],
  );

  // ── Generate all ────────────────────────────────────────────
  const handleGenerateAll = useCallback(async () => {
    if (!parsed) {
      toast.error('Parse teks terlebih dahulu sebelum generate.');
      return;
    }

    const types: GenType[] = ['cp', 'tp', 'atp', 'alur', 'kuis', 'flashcard', 'skenario', 'matching', 'truefalse', 'accordion', 'tab-icons', 'icon-explore', 'comparison'];
    setLoading(new Set(types));
    toast.info('⚡ Generating semua konten...');

    const allPreviews: PreviewData[] = [];
    let delay = 0;

    for (const type of types) {
      setTimeout(() => {
        try {
          let data: unknown;
          let count = 0;
          let label = '';
          let icon = '';

          const moduleData = generateModuleData(type, parsed, meta);
          if (moduleData) {
            data = moduleData;
            count = getModuleItemCount(moduleData);
            const btnInfo = GEN_BUTTONS.find((b) => b.type === type);
            label = btnInfo?.label || type;
            icon = btnInfo?.icon || '📦';
          } else {
            switch (type) {
              case 'cp':
                data = genCP(parsed, meta); count = 1; label = 'Capaian Pembelajaran'; icon = '📋'; break;
              case 'tp':
                data = genTP(parsed, settings); count = (data as TpItem[]).length; label = 'Tujuan Pembelajaran'; icon = '🎯'; break;
              case 'atp': {
                const tps = genTP(parsed, settings);
                data = genATP(tps, meta, settings.pertemuan);
                count = (data as { pertemuan: unknown[] }).pertemuan.length;
                label = 'Alur Tujuan Pembelajaran'; icon = '📅'; break;
              }
              case 'alur': {
                const tps = genTP(parsed, settings);
                data = genAlur(tps, meta, parsed);
                count = (data as AlurItem[]).length;
                label = 'Alur Kegiatan'; icon = '🗺️'; break;
              }
              case 'kuis':
                data = genKuis(parsed, settings.jumlahKuis); count = (data as KuisItem[]).length; label = 'Kuis Pilihan Ganda'; icon = '❓'; break;
              case 'skenario':
                data = genSkenario(parsed, meta); count = (data as SkenarioChapter[]).length; label = 'Skenario'; icon = '🎭'; break;
            }
          }

          allPreviews.push({ type, label, icon, data, count });

          if (allPreviews.length === types.length) {
            setPreviews(allPreviews);
            setActivePreview(allPreviews[0]);
            setLoading(new Set());
            toast.success(`⚡ Semua ${allPreviews.length} konten berhasil digenerate!`);
          }
        } catch (err) {
          console.error(`Error generating ${type}:`, err);
          if (allPreviews.length >= types.length - 1) {
            setPreviews(allPreviews);
            setLoading(new Set());
          }
        }
      }, delay);
      delay += 150 + Math.random() * 150;
    }
  }, [parsed, meta, settings]);

  // ── Apply all ───────────────────────────────────────────────
  const handleApplyAll = useCallback(() => {
    if (previews.length === 0) {
      toast.error('Belum ada konten yang di-generate.');
      return;
    }
    for (const p of previews) {
      handleApply(p);
    }
    toast.success('⚡ Semua konten berhasil diterapkan ke proyek!');
  }, [previews, handleApply]);

  // ── Parsed stats ────────────────────────────────────────────
  const parsedStats = useMemo(() => {
    if (!parsed) return null;
    return [
      { label: 'Kata', value: parsed.wordCount, icon: '📝' },
      { label: 'Kalimat', value: parsed.sentences.length, icon: '📄' },
      { label: 'Definisi', value: parsed.definitions.length, icon: '📖' },
      { label: 'Enumerasi', value: parsed.enumerations.length, icon: '📋' },
      { label: 'Fungsi', value: parsed.functions.length, icon: '⚙️' },
      { label: 'Sebab-Akibat', value: parsed.causes.length, icon: '🔗' },
      { label: 'Kata Utama', value: parsed.topWords.length, icon: '🔑' },
    ];
  }, [parsed]);

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <span>⚡</span> Auto-Generate
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Paste teks materi sekali → generate bertahap per section.
        </p>
      </div>

      {/* ── Step 1: Text Input ──────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
            Paste Materi
          </h3>
          <span className="text-xs text-zinc-500">
            {text.length > 0 ? `${text.split(/\s+/).filter(Boolean).length} kata` : 'Belum ada teks'}
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Paste teks materi di sini...\n\nContoh:\nNorma adalah aturan atau pedoman tingkah laku dalam kehidupan bermasyarakat. Norma berfungsi untuk menciptakan ketertiban dan ketenteraman dalam masyarakat. Norma terdiri dari empat jenis, yaitu norma agama, norma kesusilaan, norma kesopanan, dan norma hukum. Norma agama bersumber dari keyakinan tentang perintah dan larangan Tuhan. Norma hukum memiliki sanksi yang paling tegas karena diberlakukan oleh negara.`}
          rows={8}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-y min-h-[160px]"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleParse}
            disabled={text.trim().length < 50}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            🔍 Parse Teks
          </button>
          <button
            onClick={() => {
              setText('');
              setParsed(null);
              setPreviews([]);
              setActivePreview(null);
            }}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs rounded-lg transition-colors"
          >
            🗑️ Bersihkan
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
            {text.trim().length < 50 && text.length > 0 && (
              <span>Minimal 50 karakter (saat ini: {text.trim().length})</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Step 2: Settings ────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
          Pengaturan Generate
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Jumlah Kuis */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Jumlah Soal Kuis</label>
            <select
              value={settings.jumlahKuis}
              onChange={(e) => setSettings((s) => ({ ...s, jumlahKuis: parseInt(e.target.value) }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
            >
              {[5, 10, 15, 20, 25, 30].map((n) => (
                <option key={n} value={n}>{n} soal</option>
              ))}
            </select>
          </div>
          {/* Pertemuan */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Jumlah Pertemuan</label>
            <select
              value={settings.pertemuan}
              onChange={(e) => setSettings((s) => ({ ...s, pertemuan: parseInt(e.target.value) }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} pertemuan</option>
              ))}
            </select>
          </div>
          {/* Bloom Level */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Level Bloom Maksimal</label>
            <select
              value={settings.bloomMax}
              onChange={(e) => setSettings((s) => ({ ...s, bloomMax: parseInt(e.target.value) }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
            >
              <option value={1}>C1 – Mengingat</option>
              <option value={2}>C2 – Memahami</option>
              <option value={3}>C3 – Menerapkan</option>
              <option value={4}>C4 – Menganalisis</option>
              <option value={5}>C5 – Mengevaluasi</option>
              <option value={6}>C6 – Menciptakan</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Parsed Stats ────────────────────────────────────── */}
      {parsedStats && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">✓</span>
            Hasil Parse
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {parsedStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center"
              >
                <div className="text-lg mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-zinc-100">{stat.value}</div>
                <div className="text-[0.65rem] text-zinc-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
          {/* Top words */}
          {(parsed?.topWords?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-2">Kata kunci terdeteksi:</p>
              <div className="flex flex-wrap gap-1.5">
                {parsed?.topWords.slice(0, 15).map((w, i) => (
                  <span
                    key={w + i}
                    className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-300"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Definitions preview */}
          {(parsed?.definitions?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-2">Definisi terdeteksi:</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {parsed?.definitions.map((d, i) => (
                  <div key={i} className="text-xs text-zinc-300 bg-zinc-800/50 rounded-lg px-3 py-2">
                    <span className="font-semibold text-amber-400">{d.term}</span>
                    {' → '}
                    <span className="text-zinc-400">{d.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Generate Buttons ────────────────────────── */}
      {parsed && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">3</span>
              Generate Konten
            </h3>
            <button
              onClick={handleGenerateAll}
              disabled={loading.size > 0}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              {loading.size > 0 ? <Spinner /> : '⚡'}
              {loading.size > 0 ? `Generating ${loading.size}...` : 'Generate Semua'}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {GEN_BUTTONS.map((btn) => {
              const isLoading = loading.has(btn.type);
              const preview = previews.find((p) => p.type === btn.type);
              const isActive = activePreview?.type === btn.type;

              return (
                <button
                  key={btn.type}
                  onClick={() => {
                    if (!preview) {
                      handleGenerate(btn.type);
                    } else {
                      setActivePreview(preview);
                    }
                  }}
                  disabled={isLoading}
                  className={`relative bg-zinc-800 border rounded-xl p-4 text-left transition-all hover:border-zinc-600 hover:bg-zinc-800/80 disabled:opacity-50 ${
                    isActive
                      ? 'border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'border-zinc-700/50'
                  } ${preview ? 'ring-1 ring-green-500/20 border-green-500/30' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xl">{btn.icon}</span>
                    {preview && (
                      <span className="text-[0.6rem] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-semibold">
                        ✓ {preview.count}
                      </span>
                    )}
                    {isLoading && <Spinner />}
                  </div>
                  <p className="text-xs font-medium text-zinc-200 mt-2.5 leading-tight">
                    {btn.label}
                  </p>
                  {!preview && !isLoading && (
                    <p className="text-[0.6rem] text-zinc-500 mt-1">Klik untuk generate</p>
                  )}
                  {preview && !isLoading && (
                    <p className="text-[0.6rem] text-green-400 mt-1">Klik untuk lihat preview</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Preview Panel ───────────────────────────────────── */}
      {activePreview && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <span>{activePreview.icon}</span>
              Preview: {activePreview.label}
              <span className="text-xs text-zinc-500 font-normal">({activePreview.count} item)</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApply(activePreview)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                ✅ Terapkan ke Proyek
              </button>
              {previews.length > 1 && (
                <button
                  onClick={handleApplyAll}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors"
                >
                  ⚡ Terapkan Semua ({previews.length})
                </button>
              )}
            </div>
          </div>

          {/* Preview tabs */}
          {previews.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {previews.map((p) => (
                <button
                  key={p.type}
                  onClick={() => setActivePreview(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    activePreview.type === p.type
                      ? 'bg-amber-500/15 text-amber-400 font-semibold'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Preview content */}
          <div className="max-h-[480px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {renderPreviewContent(activePreview)}
          </div>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────── */}
      {!parsed && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">Paste materi untuk memulai</h3>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Salin teks materi dari buku atau sumber lain, lalu paste di kolom di atas.
            Sistem akan otomatis mem-parsing dan meng-generate berbagai jenis konten pembelajaran.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">📝 Paste</span>
            <span className="text-zinc-600">→</span>
            <span className="inline-flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">🔍 Parse</span>
            <span className="text-zinc-600">→</span>
            <span className="inline-flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">⚡ Generate</span>
            <span className="text-zinc-600">→</span>
            <span className="inline-flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">✅ Terapkan</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Preview Renderer
// ═══════════════════════════════════════════════════════════════════

function renderPreviewContent(preview: PreviewData) {
  switch (preview.type) {
    case 'cp':
      return <CpPreview data={preview.data as CpState} />;
    case 'tp':
      return <TpPreview data={preview.data as TpItem[]} />;
    case 'atp':
      return <AtpPreview data={preview.data as import('@/store/authoring-store').AtpState} />;
    case 'alur':
      return <AlurPreview data={preview.data as AlurItem[]} />;
    case 'kuis':
      return <KuisPreview data={preview.data as KuisItem[]} />;
    case 'flashcard':
      return <FlashcardPreview data={preview.data as FlashcardModule} />;
    case 'skenario':
      return <SkenarioPreview data={preview.data as SkenarioChapter[]} />;
    case 'matching':
      return <MatchingPreview data={preview.data as MatchingModule} />;
    case 'truefalse':
      return <TrueFalsePreview data={preview.data as TrueFalseModule} />;
    case 'accordion':
      return <AccordionPreview data={preview.data as AccordionModule} />;
    case 'tab-icons':
      return <TabIconsPreview data={preview.data as TabIconsModule} />;
    case 'icon-explore':
      return <IconExplorePreview data={preview.data as IconExploreModule} />;
    case 'comparison':
      return <ComparisonPreview data={preview.data as ComparisonModule} />;
    default:
      return <p className="text-sm text-zinc-400">Preview tidak tersedia</p>;
  }
}

// ── Individual Preview Components ─────────────────────────────────

function CpPreview({ data }: { data: CpState }) {
  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Elemen</p>
            <p className="text-sm text-zinc-200">{data.elemen || '-'}</p>
          </div>
          <div>
            <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Sub Elemen</p>
            <p className="text-sm text-zinc-200">{data.subElemen || '-'}</p>
          </div>
          <div>
            <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Fase</p>
            <p className="text-sm text-zinc-200">Fase {data.fase}</p>
          </div>
          <div>
            <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Kelas</p>
            <p className="text-sm text-zinc-200">{data.kelas || '-'}</p>
          </div>
        </div>
      </div>
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider mb-2">Capaian Fase</p>
        <p className="text-sm text-zinc-200 leading-relaxed">{data.capaianFase}</p>
      </div>
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider mb-2">Profil Pelajar Pancasila</p>
        <div className="flex flex-wrap gap-1.5">
          {data.profil.map((p, i) => (
            <span key={i} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TpPreview({ data }: { data: TpItem[] }) {
  return (
    <div className="space-y-2">
      {data.map((tp, i) => (
        <div key={i} className="bg-zinc-800/50 rounded-lg p-3 flex items-start gap-3">
          <span
            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style={{ backgroundColor: tp.color }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: tp.color + '20',
                  color: tp.color,
                }}
              >
                TP {i + 1}
              </span>
              <span className="text-xs text-zinc-400 bg-zinc-700/50 px-1.5 py-0.5 rounded">
                Pertemuan {tp.pertemuan}
              </span>
            </div>
            <p className="text-sm text-zinc-200 mt-1">
              <span className="font-semibold text-amber-400">{tp.verb}</span>{' '}
              {tp.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AtpPreview({ data }: { data: import('@/store/authoring-store').AtpState }) {
  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-500">Nama Bab</p>
        <p className="text-sm font-medium text-zinc-200">{data.namaBab || '-'}</p>
      </div>
      {data.pertemuan.map((p, i) => (
        <div key={i} className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded">
              Pertemuan {i + 1}
            </span>
            <span className="text-xs text-zinc-500">{p.durasi}</span>
          </div>
          <p className="text-sm font-semibold text-zinc-200">{p.judul}</p>
          <div className="space-y-1">
            <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Tujuan Pembelajaran</p>
            <p className="text-xs text-zinc-300">{p.tp}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Kegiatan</p>
            <p className="text-xs text-zinc-300">{p.kegiatan}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Penilaian</p>
            <p className="text-xs text-zinc-300">{p.penilaian}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AlurPreview({ data }: { data: AlurItem[] }) {
  const faseColors: Record<string, string> = {
    Pendahuluan: 'text-green-400',
    Inti: 'text-purple-400',
    Penutup: 'text-amber-400',
  };
  return (
    <div className="space-y-2">
      {data.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center mt-1">
            <div className={`w-3 h-3 rounded-full ${step.fase === 'Pendahuluan' ? 'bg-green-500' : step.fase === 'Inti' ? 'bg-purple-500' : 'bg-amber-500'}`} />
            {i < data.length - 1 && <div className="w-px h-full min-h-[40px] bg-zinc-700" />}
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${faseColors[step.fase] || 'text-zinc-400'}`}>
                {step.fase}
              </span>
              <span className="text-xs text-zinc-500">• {step.durasi}</span>
            </div>
            <p className="text-sm font-medium text-zinc-200 mt-1">{step.judul}</p>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{step.deskripsi}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function KuisPreview({ data }: { data: KuisItem[] }) {
  return (
    <div className="space-y-4">
      {data.map((k, i) => (
        <div key={i} className="bg-zinc-800/50 rounded-lg p-4 space-y-2.5">
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded flex-shrink-0">
              {i + 1}
            </span>
            <p className="text-sm font-medium text-zinc-200">{k.q}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 ml-8">
            {k.opts.map((opt, oi) => (
              <div
                key={oi}
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  oi === k.ans
                    ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                    : 'bg-zinc-700/30 text-zinc-400'
                }`}
              >
                <span className="font-mono text-[0.6rem]">{String.fromCharCode(65 + oi)}.</span>
                <span className="truncate">{opt}</span>
                {oi === k.ans && <span className="ml-auto text-green-400">✓</span>}
              </div>
            ))}
          </div>
          {k.ex && (
            <p className="text-xs text-zinc-500 ml-8 italic">💡 {k.ex}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function FlashcardPreview({ data }: { data: FlashcardModule }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-500">Instruksi</p>
        <p className="text-sm text-zinc-200">{data.instruksi}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.kartu.slice(0, 12).map((card, i) => (
          <button
            key={i}
            onClick={() =>
              setFlipped((prev) => {
                const next = new Set(prev);
                if (next.has(i)) next.delete(i);
                else next.add(i);
                return next;
              })
            }
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-left hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.6rem] text-zinc-500 uppercase tracking-wider">
                {flipped.has(i) ? 'Belakang' : 'Depan'}
              </span>
              <span className="text-[0.6rem] text-zinc-600">{card.hint}</span>
            </div>
            <p className="text-sm text-zinc-200">
              {flipped.has(i) ? card.belakang : card.depan}
            </p>
          </button>
        ))}
        {data.kartu.length > 12 && (
          <div className="text-xs text-zinc-500 col-span-full text-center py-2">
            +{data.kartu.length - 12} flashcard lainnya...
          </div>
        )}
      </div>
    </div>
  );
}

function SkenarioPreview({ data }: { data: SkenarioChapter[] }) {
  return (
    <div className="space-y-4">
      {data.map((chapter, ci) => (
        <div key={ci} className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{chapter.charEmoji}</span>
            <h4 className="text-sm font-semibold text-zinc-200">{chapter.title}</h4>
            <span className="text-xs text-zinc-600 bg-zinc-700/50 px-1.5 py-0.5 rounded">{chapter.bg}</span>
          </div>

          {/* Setup Dialog */}
          <div className="space-y-1.5">
            <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Dialog</p>
            {chapter.setup.map((d, di) => (
              <div key={di} className="flex items-start gap-2">
                <span className="text-xs font-semibold text-amber-400 flex-shrink-0 min-w-[60px]">
                  {d.speaker}:
                </span>
                <p className="text-xs text-zinc-300">&ldquo;{d.text}&rdquo;</p>
              </div>
            ))}
          </div>

          {/* Choice Prompt */}
          <div className="bg-zinc-700/30 rounded-lg p-2">
            <p className="text-xs text-amber-300 font-medium">💬 {chapter.choicePrompt}</p>
          </div>

          {/* Choices */}
          <div className="space-y-1.5">
            <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Pilihan</p>
            {chapter.choices.map((c, chi) => (
              <div
                key={chi}
                className={`text-xs px-3 py-2 rounded-lg ${
                  c.good
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-zinc-700/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{c.icon}</span>
                  <p className={`font-medium ${c.good ? 'text-green-300' : 'text-zinc-400'}`}>
                    {c.label}
                  </p>
                  <span className="ml-auto text-[0.6rem] text-zinc-500">{c.pts} pts • {c.level}</span>
                </div>
                <p className="text-zinc-500 mt-0.5">{c.resultTitle}: {c.resultBody.slice(0, 80)}...</p>
                {c.consequences.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    {c.consequences.map((cons, i) => (
                      <span key={i} className="text-[0.6rem] text-zinc-600">{cons.icon} {cons.text}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatchingPreview({ data }: { data: MatchingModule }) {
  const shuffledRight = useMemo(
    () => [...data.pasangan].sort(() => Math.random() - 0.5),
    [data.pasangan]
  );

  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-500">Instruksi</p>
        <p className="text-sm text-zinc-200">{data.instruksi}</p>
      </div>
      <p className="text-xs text-zinc-500">
        {data.pasangan.length} pasangan yang akan dicocokkan.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Kolom Kiri</p>
          {data.pasangan.map((p, i) => (
            <div key={i} className="bg-zinc-800/50 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-zinc-200">
              {p.kiri}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-[0.65rem] text-zinc-500 uppercase tracking-wider">Kolom Kanan (Acak)</p>
          {shuffledRight.map((p, i) => (
            <div key={i} className="bg-zinc-800/50 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-zinc-200">
              {p.kanan}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrueFalsePreview({ data }: { data: TrueFalseModule }) {
  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-500">Instruksi</p>
        <p className="text-sm text-zinc-200">{data.instruksi}</p>
      </div>
      <div className="space-y-2">
        {data.pernyataan.slice(0, 12).map((item, i) => (
          <div
            key={i}
            className={`bg-zinc-800/50 border rounded-lg p-3 flex items-start gap-3 ${
              item.jawaban
                ? 'border-green-500/20'
                : 'border-red-500/20'
            }`}
          >
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${
                item.jawaban
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {item.jawaban ? 'BENAR' : 'SALAH'}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-zinc-200">{item.teks}</p>
              <p className="text-xs text-zinc-500 mt-1 italic">💡 {item.penjelasan}</p>
            </div>
          </div>
        ))}
        {data.pernyataan.length > 12 && (
          <div className="text-xs text-zinc-500 text-center py-2">
            +{data.pernyataan.length - 12} soal lainnya...
          </div>
        )}
      </div>
    </div>
  );
}

function AccordionPreview({ data }: { data: AccordionModule }) {
  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-500">Intro</p>
        <p className="text-sm text-zinc-200">{data.intro}</p>
      </div>
      <div className="space-y-2">
        {data.items.map((item, i) => (
          <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span>{item.icon}</span>
              <p className="text-sm font-medium text-zinc-200">{item.judul}</p>
            </div>
            <p className="text-xs text-zinc-400 ml-6 whitespace-pre-line">{item.isi}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabIconsPreview({ data }: { data: TabIconsModule }) {
  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-500">Intro</p>
        <p className="text-sm text-zinc-200">{data.intro}</p>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {data.tabs.map((tab, i) => (
          <span
            key={i}
            className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium"
            style={{ backgroundColor: tab.warna + '20', color: tab.warna }}
          >
            {tab.icon} {tab.judul}
          </span>
        ))}
      </div>
      <div className="space-y-3">
        {data.tabs.map((tab, i) => (
          <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{tab.icon}</span>
              <p className="text-sm font-semibold text-zinc-200">{tab.judul}</p>
              <span className="w-3 h-3 rounded-full ml-auto" style={{ backgroundColor: tab.warna }} />
            </div>
            <p className="text-xs text-zinc-300">{tab.isi}</p>
            {tab.poin.length > 0 && (
              <div className="space-y-1">
                {tab.poin.map((p, pi) => (
                  <p key={pi} className="text-xs text-zinc-400 flex items-center gap-1">
                    <span style={{ color: tab.warna }}>•</span> {p}
                  </p>
                ))}
              </div>
            )}
            {tab.refleksi && (
              <p className="text-xs text-amber-400/70 italic">💭 {tab.refleksi}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IconExplorePreview({ data }: { data: IconExploreModule }) {
  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-500">Intro</p>
        <p className="text-sm text-zinc-200">{data.intro}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.items.map((item, i) => (
          <div key={i} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-zinc-200">{item.judul}</p>
                <p className="text-xs text-zinc-500">{item.ringkasan}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-300">{item.isi}</p>
            {item.contoh.length > 0 && (
              <div className="space-y-0.5">
                <p className="text-[0.6rem] text-zinc-500 uppercase">Contoh:</p>
                {item.contoh.map((c, ci) => (
                  <p key={ci} className="text-xs text-zinc-400">• {c}</p>
                ))}
              </div>
            )}
            {item.sanksi && (
              <p className="text-xs text-red-400/70 italic">⚠️ {item.sanksi.slice(0, 80)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonPreview({ data }: { data: ComparisonModule }) {
  return (
    <div className="space-y-3">
      <div className="bg-zinc-800/50 rounded-lg p-3">
        <p className="text-xs text-zinc-500">Intro</p>
        <p className="text-sm text-zinc-200">{data.intro}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-2 text-zinc-500">Aspek</th>
              {data.kolom.map((k, i) => (
                <th key={i} className="text-left p-2" style={{ color: k.warna }}>
                  {k.icon} {k.judul}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.baris.map((row, i) => (
              <tr key={i} className="border-b border-zinc-800/50">
                <td className="p-2 text-zinc-300 font-medium">
                  {row.icon} {row.label}
                </td>
                {row.nilai.map((val, vi) => (
                  <td key={vi} className="p-2 text-zinc-400">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.tanya && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <p className="text-xs text-amber-300">💬 {data.tanya}</p>
        </div>
      )}
    </div>
  );
}
