// ═══════════════════════════════════════════════════════════════
// SLOT-TYPES.TS — Typed slot system for the template engine
// Replaces Record<string, unknown> with proper interfaces for
// each of the 16 template types in the MPI authoring tool.
// ═══════════════════════════════════════════════════════════════

// ── Primitive field type ────────────────────────────────────────
export type SlotFieldType =
  | 'text'
  | 'richtext'
  | 'number'
  | 'color'
  | 'image'
  | 'list'
  | 'select';

// ── SlotField: describes a single editable field ────────────────
export interface SlotField {
  /** Property key in the slot data object */
  key: string;
  /** Field type — drives the editor widget */
  type: SlotFieldType;
  /** Human-readable label shown in the authoring UI */
  label: string;
  /** Default value when the field is empty */
  default: string | number | boolean | null;
  /** For 'select' type: available option values */
  options?: Array<{ value: string; label: string }>;
}

// ── TemplateSlotSchema: map of field key → field definition ─────
export type TemplateSlotSchema = Record<string, SlotField>;

// ═══════════════════════════════════════════════════════════════
// PER-TEMPLATE SLOT DATA INTERFACES
// Each interface mirrors the real data consumed by its template.
// ═══════════════════════════════════════════════════════════════

// ── 1. Cover ────────────────────────────────────────────────────
export interface CoverChip {
  icon: string;
  label: string;
}

export interface CoverSlotData {
  _templateId: 'cover';
  icon: string;
  title: string;
  subtitle: string;
  mapel: string;
  kelas: string;
  pertemuan?: string;
  bab?: string;
  durasi?: string;
  fase?: string;
  elemen?: string;
  chips?: CoverChip[];
  ctaText?: string;
  accentVar?: string;
}

// ── 2. Dokumen (CP / TP / ATP) ─────────────────────────────────
export interface CpSlotData {
  capaianFase: string;
  profil: string[];
  elemen: string;
  subElemen: string;
}

export interface TpSlotItem {
  verb: string;
  desc: string;
  color: string;
  pertemuan: number;
}

export interface AtpPertemuanSlotItem {
  judul: string;
  durasi: string;
  tp: string;
  kegiatan: string;
  penilaian: string;
}

export interface AlurSlotItem {
  fase: string;
  durasi: string;
  judul: string;
  deskripsi: string;
}

export interface DokumenSlotData {
  _templateId: 'dokumen';
  cp: CpSlotData;
  tp: TpSlotItem[];
  atp: {
    namaBab: string;
    jumlahPertemuan: number;
    pertemuan: AtpPertemuanSlotItem[];
  };
  alur: AlurSlotItem[];
}

// ── 3. Tujuan ───────────────────────────────────────────────────
export interface TujuanSlotData {
  _templateId: 'tujuan';
  title: string;
  tpItems: TpSlotItem[];
}

// ── Shared sub-component interfaces (reusable across templates) ─

/** Diskusi Kelompok Banner — colored banner for group discussion instructions */
export interface DiskusiKelompokBanner {
  tipe: 1 | 2 | 3; // 1=hijau, 2=kuning, 3=ungu
  ikon: string;
  label: string;
  judul: string;
  isi: string;
  timerDetik?: number;
}

/** Def-box — definition/callout box with left border accent */
export interface DefBoxItem {
  text: string;
  accentVar?: string; // '--y', '--c', '--g', '--p', '--r', '--o'
}

/** Card Grid 2×2 — info cards with colored backgrounds */
export interface CardGridItem {
  icon: string;
  title: string;
  body: string;
  accentVar?: string;
}

/** Diskusi box — textarea + save button for discussion answers */
export interface DiskusiBoxData {
  prompt: string;
  placeholder: string;
  textareaId: string;
  saveKey: string;
  saveLabel: string;
  accentVar?: string;
}

/** Norma Tab item — for norma-type tabbed content */
export interface NormaTabItem {
  id: string;
  icon: string;
  label: string;
  color: string;
  bg: string;
  bc: string;
  bg2: string;
  sumber: string;
  sifat: string;
  tujuan: string;
  sanksiTipe: string;
  sanksiItems: string[];
  contoh: string;
  pelanggaran: { ikon: string; teks: string; sanksi: string }[];
}

/** Tabel Accordion item — expandable table row */
export interface TabelAccordionItem {
  icon: string;
  label: string;
  color: string;
  details: { label: string; value: string }[];
}

// ── 4. Review ───────────────────────────────────────────────────
export interface ReviewQuestion {
  q: string;
  answer: string;
}

export interface ReviewSlotData {
  _templateId: 'review';
  title: string;
  questions: ReviewQuestion[];
  diskusiKelompok?: DiskusiKelompokBanner[];
  cardGrid?: CardGridItem[];
  diskusiBox?: DiskusiBoxData;
}

// ── 5. Materi-TabIcons ──────────────────────────────────────────
export interface MateriTabItem {
  icon: string;
  label: string;
  content: string;
  /** Optional rich sub-components rendered inside this tab */
  defBoxes?: DefBoxItem[];
  cardGrid?: CardGridItem[];
}

export interface MateriTabIconsSlotData {
  _templateId: 'materi-tabicons';
  title: string;
  tabs: MateriTabItem[];
  /** Show read-tracking checkmarks and progress bar on tabs */
  readTracking?: boolean;
  /** Def-boxes rendered above tab content */
  defBoxes?: DefBoxItem[];
  /** Card grid rendered above tab content */
  cardGrid?: CardGridItem[];
  /** Diskusi kelompok banner(s) on this page */
  diskusiKelompok?: DiskusiKelompokBanner[];
  /** Norma tabs (alternative to regular tabs — for norma-type content) */
  normaTabs?: NormaTabItem[];
  /** Tabel accordion below norma tabs */
  tabelAccordion?: TabelAccordionItem[];
  /** Diskusi box with textarea + save */
  diskusiBox?: DiskusiBoxData;
}

// ── 6. Materi-Accordion ─────────────────────────────────────────
export interface MateriAccordionStep {
  emoji: string;
  text: string;
}

export interface MateriAccordionSection {
  icon: string;
  title: string;
  /** Optional highlight portion of the title (rendered with <span class="hl">) */
  titleHighlight?: string;
  /** Optional subtitle below the title in the section header */
  subtitle?: string;
  content: string;
  defBoxes?: DefBoxItem[];
  cardGrid?: CardGridItem[];
  /** Numbered step-by-step list with emoji bullets */
  steps?: MateriAccordionStep[];
}

export interface MateriAccordionSlotData {
  _templateId: 'materi-accordion';
  title: string;
  /** Estimated reading duration in minutes (shown in chip-sc header) */
  estimatedMinutes?: number;
  sections: MateriAccordionSection[];
  defBoxes?: DefBoxItem[];
  cardGrid?: CardGridItem[];
  diskusiKelompok?: DiskusiKelompokBanner[];
  diskusiBox?: DiskusiBoxData;
}

// ── 7. Diskusi+Timer ───────────────────────────────────────────
export interface DiskusiTimerSlotData {
  _templateId: 'diskusi-timer';
  title: string;
  prompt: string;
  duration: number;
  questions: string[];
  /** Diskusi kelompok banner(s) */
  diskusiKelompok?: DiskusiKelompokBanner[];
  /** Definition boxes */
  defBoxes?: DefBoxItem[];
  /** Info card grid */
  cardGrid?: CardGridItem[];
  /** Diskusi box with textarea + localStorage save */
  diskusiBox?: DiskusiBoxData;
}

// ── 8. Sortir Game ──────────────────────────────────────────────
export interface SortirItem {
  text: string;
  category: string;
}

export interface SortirCategory {
  name: string;
  color: string;
}

export interface SortirGameSlotData {
  _templateId: 'sortir-game';
  title: string;
  items: SortirItem[];
  categories: SortirCategory[];
  diskusiHint?: string; // discussion hint text before the game
}

// ── 9. Roda Game ────────────────────────────────────────────────
export interface RodaSegment {
  label: string;
  color: string;
}

export interface RodaGameSlotData {
  _templateId: 'roda-game';
  title: string;
  segments: RodaSegment[];
  question: string;
}

// ── 10. Hubungan Konsep ─────────────────────────────────────────
export interface KonsepNode {
  id: string;
  label: string;
  color: string;
}

export interface KonsepEdge {
  from: string;
  to: string;
  label: string;
}

export interface HubunganKonsepSlotData {
  _templateId: 'hubungan-konsep';
  title: string;
  nodes: KonsepNode[];
  edges: KonsepEdge[];
}

// ── 11. Flashcard ───────────────────────────────────────────────
export interface FlashcardItem {
  front: string;
  back: string;
  icon: string;
}

export interface FlashcardSlotData {
  _templateId: 'flashcard';
  title: string;
  cards: FlashcardItem[];
}

// ── 12. Hasil ───────────────────────────────────────────────────
export interface HasilSlotData {
  _templateId: 'hasil';
  title: string;
  totalKuis: number;
  namaBab: string;
  score: number;
  level: string;
}

// ── 13. Refleksi ────────────────────────────────────────────────
export interface RefleksiPrompt {
  question: string;
  placeholder: string;
}

export interface RefleksiPortofolio {
  id: string;
  label: string;
  value: string;
}

export interface RefleksiSlotData {
  _templateId: 'refleksi';
  title: string;
  prompts: RefleksiPrompt[];
  portofolio?: RefleksiPortofolio[];
  /** Flashcard ringkasan shown in refleksi */
  flashcardRingkasan?: FlashcardItem[];
  /** Auto-populate portofolio from localStorage PORTO object */
  useLocalStorage?: boolean;
}

// ── 14. Penutup ─────────────────────────────────────────────────
export interface PenutupStat {
  icon: string;
  label: string;
  desc: string;
  bg: string;
  border: string;
}

export interface PenutupNextPreviewItem {
  icon: string;
  label: string;
  desc?: string;
  accentVar?: string;
}

export interface PenutupNextPreview {
  title: string;
  desc: string;
  items: PenutupNextPreviewItem[];
  /** Gradient colors for the preview card background */
  gradientFrom?: string;
  gradientTo?: string;
}

export interface PenutupSlotData {
  _templateId: 'penutup';
  title: string;
  subtitle: string;
  icon: string;
  message: string;
  nextAction: string;
  quote?: string;
  stats?: PenutupStat[];
  nextPreview?: PenutupNextPreview;
}

// ── 15. Kuis ────────────────────────────────────────────────────
export interface KuisQuestion {
  q: string;
  opts: string[];
  ans: number;
  ex: string;
}

export interface KuisSlotData {
  _templateId: 'kuis';
  title: string;
  kuis: KuisQuestion[];
}

// ── 16. Petunjuk ───────────────────────────────────────────────
export interface PetunjukItem {
  icon: string;
  title: string;
  body: string;
}

export interface PetunjukSlotData {
  _templateId: 'petunjuk';
  title: string;
  titleHighlight: string;
  items: PetunjukItem[];
  tips: string;
}

// ── 17. Hotspot Image ───────────────────────────────────────────
export interface HotspotPinData {
  x: number;
  y: number;
  icon: string;
  judul: string;
  warna: string;
  isi: string;
}

export interface HotspotSlotData {
  _templateId: 'hotspot';
  title: string;
  intro: string;
  imageUrl: string;
  height: number;
  mode: 'tooltip' | 'dialog';
  animation: 'fade' | 'scale' | 'slide';
  hotspots: HotspotPinData[];
}

// ── 18. Skenario ────────────────────────────────────────────────
export interface SkenarioSetupLine {
  speaker: string;
  text: string;
}

export interface SkenarioConsequence {
  icon: string;
  text: string;
}

export interface SkenarioChoice {
  icon: string;
  label: string;
  detail: string;
  good: boolean;
  pts: number;
  level: 'good' | 'mid' | 'bad';
  resultTitle: string;
  resultBody: string;
  norma: string;
  consequences: SkenarioConsequence[];
}

export interface SkenarioChapter {
  charEmoji: string;
  charColor: string;
  charPants: string;
  bg: string;
  title: string;
  setup: SkenarioSetupLine[];
  choicePrompt: string;
  choices: SkenarioChoice[];
}

export interface SkenarioSlotData {
  _templateId: 'skenario';
  title: string;
  skenario: SkenarioChapter[];
}

// ═══════════════════════════════════════════════════════════════
// UNION TYPE — discriminated union on _templateId
// ═══════════════════════════════════════════════════════════════
export type ScreenSlotData =
  | CoverSlotData
  | DokumenSlotData
  | TujuanSlotData
  | ReviewSlotData
  | MateriTabIconsSlotData
  | MateriAccordionSlotData
  | DiskusiTimerSlotData
  | SortirGameSlotData
  | RodaGameSlotData
  | HubunganKonsepSlotData
  | FlashcardSlotData
  | HasilSlotData
  | RefleksiSlotData
  | PenutupSlotData
  | KuisSlotData
  | PetunjukSlotData
  | HotspotSlotData
  | SkenarioSlotData;

// ── Template ID type ────────────────────────────────────────────
export type TemplateId = ScreenSlotData['_templateId'];

// ═══════════════════════════════════════════════════════════════
// SLOT SCHEMAS — maps template ID → field definitions
// Each schema describes the editable fields for its template.
// ═══════════════════════════════════════════════════════════════

export const SLOT_SCHEMAS: Record<TemplateId, TemplateSlotSchema> = {
  // ── 1. Cover ─────────────────────────────────────────────────
  cover: {
    icon:    { key: 'icon',     type: 'text',  label: 'Ikon',           default: '📚' },
    title:   { key: 'title',    type: 'text',  label: 'Judul',         default: '' },
    subtitle:{ key: 'subtitle', type: 'text',  label: 'Subjudul',      default: '' },
    mapel:   { key: 'mapel',    type: 'text',  label: 'Mata Pelajaran', default: '' },
    kelas:   { key: 'kelas',    type: 'text',  label: 'Kelas',         default: '' },
    pertemuan:{ key: 'pertemuan', type: 'text', label: 'Pertemuan',    default: '' },
    bab:     { key: 'bab',      type: 'text',  label: 'Bab',           default: '' },
    durasi:  { key: 'durasi',   type: 'text',  label: 'Durasi (menit)',default: '' },
    fase:    { key: 'fase',     type: 'text',  label: 'Fase',          default: '' },
    elemen:  { key: 'elemen',   type: 'text',  label: 'Elemen',        default: '' },
    chips:   { key: 'chips',    type: 'list',  label: 'Chips',         default: null },
    ctaText: { key: 'ctaText',  type: 'text',  label: 'Teks Tombol',   default: '' },
    accentVar:{ key: 'accentVar', type: 'select', label: 'Warna Aksen', default: '--y',
      options: [
        { value: '--y', label: '🟡 Kuning' },
        { value: '--c', label: '🔵 Cyan' },
        { value: '--g', label: '🟢 Hijau' },
        { value: '--p', label: '🟣 Ungu' },
        { value: '--r', label: '🔴 Merah' },
        { value: '--o', label: '🟠 Oranye' },
      ],
    },
  },

  // ── 2. Dokumen (CP / TP / ATP) ──────────────────────────────
  dokumen: {
    'cp.capaianFase': { key: 'cp.capaianFase', type: 'richtext', label: 'Capaian Fase',     default: '' },
    'cp.profil':      { key: 'cp.profil',      type: 'list',     label: 'Profil Pancasila', default: null },
    'cp.elemen':      { key: 'cp.elemen',      type: 'text',     label: 'Elemen',           default: '' },
    'cp.subElemen':   { key: 'cp.subElemen',   type: 'text',     label: 'Sub-Elemen',       default: '' },
    tp:               { key: 'tp',              type: 'list',     label: 'Tujuan Pembelajaran', default: null },
    'atp.pertemuan':  { key: 'atp.pertemuan',  type: 'list',     label: 'ATP Pertemuan',    default: null },
    alur:             { key: 'alur',            type: 'list',     label: 'Alur Pembelajaran', default: null },
  },

  // ── 3. Tujuan ────────────────────────────────────────────────
  tujuan: {
    title:   { key: 'title',    type: 'text', label: 'Judul',   default: '' },
    tpItems: { key: 'tpItems',  type: 'list', label: 'TP Items', default: null },
  },

  // ── 4. Review ────────────────────────────────────────────────
  review: {
    title:            { key: 'title',            type: 'text', label: 'Judul',              default: '' },
    questions:        { key: 'questions',         type: 'list', label: 'Pertanyaan',         default: null },
    diskusiKelompok:  { key: 'diskusiKelompok',   type: 'list', label: 'Banner Diskusi Kelompok', default: null },
    cardGrid:         { key: 'cardGrid',          type: 'list', label: 'Card Grid',          default: null },
    diskusiBox:       { key: 'diskusiBox',        type: 'list', label: 'Diskusi Box',        default: null },
  },

  // ── 5. Materi-TabIcons ───────────────────────────────────────
  'materi-tabicons': {
    title:           { key: 'title',           type: 'text',     label: 'Judul',                default: '' },
    tabs:            { key: 'tabs',             type: 'list',     label: 'Tab Icons',             default: null },
    readTracking:    { key: 'readTracking',    type: 'select',   label: 'Read Tracking',         default: 'no',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya' }],
    },
    defBoxes:        { key: 'defBoxes',         type: 'list',     label: 'Def-Box',               default: null },
    cardGrid:        { key: 'cardGrid',          type: 'list',     label: 'Card Grid',             default: null },
    diskusiKelompok: { key: 'diskusiKelompok',   type: 'list',     label: 'Banner Diskusi Kelompok', default: null },
    normaTabs:       { key: 'normaTabs',         type: 'list',     label: 'Norma Tabs',            default: null },
    tabelAccordion:  { key: 'tabelAccordion',    type: 'list',     label: 'Tabel Accordion',       default: null },
    diskusiBox:      { key: 'diskusiBox',        type: 'list',     label: 'Diskusi Box',           default: null },
  },

  // ── 6. Materi-Accordion ──────────────────────────────────────
  'materi-accordion': {
    title:             { key: 'title',             type: 'text',   label: 'Judul',                     default: '' },
    estimatedMinutes:  { key: 'estimatedMinutes',  type: 'number', label: 'Estimasi Durasi (menit)',    default: 15 },
    sections:          { key: 'sections',          type: 'list',   label: 'Seksi',                     default: null },
    defBoxes:        { key: 'defBoxes',         type: 'list', label: 'Def-Box',                 default: null },
    cardGrid:        { key: 'cardGrid',          type: 'list', label: 'Card Grid',               default: null },
    diskusiKelompok: { key: 'diskusiKelompok',   type: 'list', label: 'Banner Diskusi Kelompok', default: null },
    diskusiBox:      { key: 'diskusiBox',        type: 'list', label: 'Diskusi Box',             default: null },
  },

  // ── 7. Diskusi+Timer ─────────────────────────────────────────
  'diskusi-timer': {
    title:           { key: 'title',           type: 'text',     label: 'Judul',                   default: '' },
    prompt:          { key: 'prompt',           type: 'richtext', label: 'Prompt Diskusi',          default: '' },
    duration:        { key: 'duration',         type: 'number',   label: 'Durasi (menit)',          default: 10 },
    questions:       { key: 'questions',        type: 'list',     label: 'Pertanyaan',              default: null },
    diskusiKelompok: { key: 'diskusiKelompok',   type: 'list',     label: 'Banner Diskusi Kelompok', default: null },
    defBoxes:        { key: 'defBoxes',         type: 'list',     label: 'Def-Box',                 default: null },
    cardGrid:        { key: 'cardGrid',          type: 'list',     label: 'Card Grid',               default: null },
    diskusiBox:      { key: 'diskusiBox',        type: 'list',     label: 'Diskusi Box',             default: null },
  },

  // ── 8. Sortir Game ───────────────────────────────────────────
  'sortir-game': {
    title:       { key: 'title',       type: 'text', label: 'Judul',        default: '' },
    items:       { key: 'items',       type: 'list', label: 'Item Sortir',  default: null },
    categories:  { key: 'categories',  type: 'list', label: 'Kategori',     default: null },
    diskusiHint: { key: 'diskusiHint', type: 'text', label: 'Hint Diskusi', default: '' },
  },

  // ── 9. Roda Game ─────────────────────────────────────────────
  'roda-game': {
    title:    { key: 'title',    type: 'text', label: 'Judul',        default: '' },
    segments: { key: 'segments', type: 'list', label: 'Segmen Roda',  default: null },
    question: { key: 'question', type: 'text', label: 'Pertanyaan',   default: '' },
  },

  // ── 10. Hubungan Konsep ──────────────────────────────────────
  'hubungan-konsep': {
    title: { key: 'title', type: 'text', label: 'Judul',          default: '' },
    nodes: { key: 'nodes', type: 'list', label: 'Node Konsep',    default: null },
    edges: { key: 'edges', type: 'list', label: 'Hubungan (Edge)', default: null },
  },

  // ── 11. Flashcard ────────────────────────────────────────────
  flashcard: {
    title: { key: 'title', type: 'text', label: 'Judul',      default: '' },
    cards: { key: 'cards', type: 'list', label: 'Kartu Flash', default: null },
  },

  // ── 12. Hasil ────────────────────────────────────────────────
  hasil: {
    title:     { key: 'title',     type: 'text',   label: 'Judul',              default: '' },
    totalKuis: { key: 'totalKuis', type: 'number', label: 'Total Soal Kuis',    default: 0 },
    namaBab:   { key: 'namaBab',   type: 'text',   label: 'Nama Bab',           default: '' },
    score:     { key: 'score',     type: 'number', label: 'Skor',               default: 0 },
    level:     { key: 'level',     type: 'select', label: 'Level',
      default: '',
      options: [
        { value: 'sangat-baik', label: 'Sangat Baik' },
        { value: 'baik',        label: 'Baik' },
        { value: 'perlu-latihan', label: 'Perlu Latihan' },
      ],
    },
  },

  // ── 13. Refleksi ─────────────────────────────────────────────
  refleksi: {
    title:             { key: 'title',             type: 'text',   label: 'Judul',                    default: '' },
    prompts:           { key: 'prompts',            type: 'list',   label: 'Prompt',                   default: null },
    portofolio:        { key: 'portofolio',         type: 'list',   label: 'Portofolio',               default: null },
    flashcardRingkasan:{ key: 'flashcardRingkasan', type: 'list',   label: 'Flashcard Ringkasan',      default: null },
    useLocalStorage:   { key: 'useLocalStorage',    type: 'select', label: 'Auto Portofolio (localStorage)', default: 'no',
      options: [{ value: 'no', label: 'Tidak' }, { value: 'yes', label: 'Ya' }],
    },
  },

  // ── 14. Penutup ──────────────────────────────────────────────
  penutup: {
    title:       { key: 'title',       type: 'text',     label: 'Judul',            default: '' },
    subtitle:    { key: 'subtitle',    type: 'text',     label: 'Subjudul',         default: '' },
    icon:        { key: 'icon',        type: 'text',     label: 'Ikon',             default: '🎓' },
    message:     { key: 'message',     type: 'richtext', label: 'Pesan',            default: '' },
    nextAction:  { key: 'nextAction',  type: 'text',     label: 'Aksi Berikutnya',  default: '' },
    quote:       { key: 'quote',       type: 'text',     label: 'Kutipan Motivasi', default: '' },
    stats:       { key: 'stats',       type: 'list',     label: 'Statistik',        default: null },
    nextPreview: { key: 'nextPreview', type: 'list',     label: 'Preview Pertemuan Berikutnya', default: null },
  },

  // ── 15. Kuis ─────────────────────────────────────────────────
  kuis: {
    title: { key: 'title', type: 'text', label: 'Judul',     default: '' },
    kuis:  { key: 'kuis',  type: 'list', label: 'Soal Kuis', default: null },
  },

  // ── 16. Petunjuk ─────────────────────────────────────────────
  petunjuk: {
    title:          { key: 'title',          type: 'text', label: 'Judul',             default: '' },
    titleHighlight: { key: 'titleHighlight', type: 'text', label: 'Highlight Judul',   default: '' },
    items:          { key: 'items',          type: 'list', label: 'Item Petunjuk',     default: null },
    tips:           { key: 'tips',           type: 'text', label: 'Tips',              default: '' },
  },

  // ── 17. Hotspot ───────────────────────────────────────────────
  hotspot: {
    title:     { key: 'title',     type: 'text',   label: 'Judul',            default: '' },
    intro:     { key: 'intro',     type: 'text',   label: 'Intro',            default: '' },
    imageUrl:  { key: 'imageUrl',  type: 'image',  label: 'URL Gambar',       default: '' },
    height:    { key: 'height',    type: 'number', label: 'Tinggi Gambar (px)',default: 300 },
    mode:      { key: 'mode',      type: 'select', label: 'Mode Tampilan',    default: 'tooltip',
      options: [
        { value: 'tooltip', label: 'Tooltip' },
        { value: 'dialog',  label: 'Dialog' },
      ],
    },
    animation: { key: 'animation', type: 'select', label: 'Animasi',          default: 'fade',
      options: [
        { value: 'fade',  label: 'Fade' },
        { value: 'scale', label: 'Scale' },
        { value: 'slide', label: 'Slide' },
      ],
    },
    hotspots:  { key: 'hotspots',  type: 'list',   label: 'Hotspot Pin',      default: null },
  },

  // ── 18. Skenario ─────────────────────────────────────────────
  skenario: {
    title:    { key: 'title',    type: 'text', label: 'Judul',              default: '' },
    skenario: { key: 'skenario', type: 'list', label: 'Babak Skenario',     default: null },
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPER: get schema for a template ID
// ═══════════════════════════════════════════════════════════════
export function getSlotSchema(templateId: TemplateId): TemplateSlotSchema {
  return SLOT_SCHEMAS[templateId];
}

// ═══════════════════════════════════════════════════════════════
// HELPER: get all field keys for a template ID
// ═══════════════════════════════════════════════════════════════
export function getSlotFieldKeys(templateId: TemplateId): string[] {
  return Object.keys(SLOT_SCHEMAS[templateId]);
}

// ═══════════════════════════════════════════════════════════════
// HELPER: type guard for ScreenSlotData
// ═══════════════════════════════════════════════════════════════
export function isScreenSlotData(value: unknown): value is ScreenSlotData {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_templateId' in value &&
    typeof (value as ScreenSlotData)._templateId === 'string' &&
    (value as ScreenSlotData)._templateId in SLOT_SCHEMAS
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPER: narrow ScreenSlotData to a specific template
// ═══════════════════════════════════════════════════════════════
export function isTemplateSlotData<T extends TemplateId>(
  value: ScreenSlotData,
  templateId: T,
): value is Extract<ScreenSlotData, { _templateId: T }> {
  return value._templateId === templateId;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT EMPTY SLOT DATA
// Returns a valid (empty-defaults) slot data object for a given
// template ID — useful for initializing new screens.
// ═══════════════════════════════════════════════════════════════
export function createDefaultSlotData<T extends TemplateId>(
  templateId: T,
): Extract<ScreenSlotData, { _templateId: T }> {
  const schema = SLOT_SCHEMAS[templateId];
  const data: Record<string, unknown> = { _templateId: templateId };

  for (const [fieldKey, field] of Object.entries(schema)) {
    // Skip nested keys like "cp.capaianFase" — they belong to sub-objects
    if (fieldKey.includes('.')) continue;

    if (field.type === 'list') {
      data[fieldKey] = [];
    } else if (field.type === 'number') {
      data[fieldKey] = typeof field.default === 'number' ? field.default : 0;
    } else {
      data[fieldKey] = field.default ?? '';
    }
  }

  // Initialize nested sub-objects for dokumen
  if (templateId === 'dokumen') {
    data.cp = {
      capaianFase: '',
      profil: [],
      elemen: '',
      subElemen: '',
    };
    data.tp = [];
    data.atp = {
      namaBab: '',
      jumlahPertemuan: 0,
      pertemuan: [],
    };
    data.alur = [];
  }

  // Initialize nested arrays for hotspot
  if (templateId === 'hotspot') {
    data.hotspots = data.hotspots || [];
  }

  return data as unknown as Extract<ScreenSlotData, { _templateId: T }>;
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE METADATA
// Human-readable labels and icons for each template, used in UI.
// ═══════════════════════════════════════════════════════════════
export const TEMPLATE_META: Record<TemplateId, { label: string; icon: string; description: string }> = {
  cover:              { label: 'Cover',              icon: '📚', description: 'Halaman sampul pertemuan' },
  dokumen:            { label: 'Dokumen (CP/TP/ATP)',icon: '📋', description: 'Capaian & Tujuan Pembelajaran' },
  tujuan:             { label: 'Tujuan',             icon: '🎯', description: 'Tujuan pembelajaran pertemuan' },
  review:             { label: 'Review',             icon: '🔄', description: 'Tinjauan materi sebelumnya' },
  'materi-tabicons':  { label: 'Materi Tab Icons',  icon: '📑', description: 'Materi dengan tab dan ikon' },
  'materi-accordion': { label: 'Materi Accordion',  icon: '📂', description: 'Materi dengan panel akordeon' },
  'diskusi-timer':    { label: 'Diskusi + Timer',   icon: '💬', description: 'Diskusi terpandu dengan timer' },
  'sortir-game':      { label: 'Sortir Game',       icon: '🔢', description: 'Game menyortir item ke kategori' },
  'roda-game':        { label: 'Roda Game',         icon: '🎡', description: 'Game roda putar pertanyaan' },
  'hubungan-konsep':  { label: 'Hubungan Konsep',   icon: '🔗', description: 'Peta konsep dengan node & edge' },
  flashcard:          { label: 'Flashcard',          icon: '🃏', description: 'Kartu belajar bolak-balik' },
  hasil:              { label: 'Hasil',              icon: '🏆', description: 'Ringkasan skor & hasil belajar' },
  refleksi:           { label: 'Refleksi',           icon: '💭', description: 'Refleksi pembelajaran siswa' },
  penutup:            { label: 'Penutup',            icon: '🎓', description: 'Penutup & rangkuman pertemuan' },
  kuis:               { label: 'Kuis',               icon: '❓', description: 'Kuis pilihan ganda interaktif' },
  petunjuk:           { label: 'Petunjuk',           icon: '📌', description: 'Petunjuk penggunaan media' },
  hotspot:            { label: 'Hotspot Image',       icon: '🗺️', description: 'Gambar interaktif dengan titik hotspot' },
  skenario:           { label: 'Skenario',           icon: '🎭', description: 'Skenario interaktif bercabang' },
};
