// ═══════════════════════════════════════════════════════════════
// TYPES — Canva Mode Visual Page Builder (Page Assembler v2)
// ═══════════════════════════════════════════════════════════════

export interface Ratio {
  id: string;
  name: string;
  desc: string;
  w: number;
  h: number;
}

export interface ElemType {
  id: string;
  icon: string;
  name: string;
  color: string;
}

export interface CanvaElement {
  id: string;
  type: string;
  icon?: string;
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  hidden?: boolean;
  // Teks-specific
  text?: string;
  fontSize?: number;
  textColor?: string;
  // Shape-specific
  color?: string;
  radius?: number;
  // Data reference (kuis/game/modul)
  dataIdx?: number;
}

// ── Template System Types ─────────────────────────────────────

export type PageTemplateType =
  | 'cover'            // Cover / judul halaman
  | 'dokumen'          // CP / TP / ATP display
  | 'tujuan'           // Tujuan Pembelajaran
  | 'review'           // Review / recall
  | 'materi-tabicons'  // Materi dengan tab icons
  | 'materi-accordion' // Materi dengan accordion
  | 'diskusi-timer'    // Diskusi + timer
  | 'sortir-game'      // Game sortir/kategorisasi
  | 'roda-game'        // Game roda putar
  | 'hubungan-konsep'  // Peta konsep / hubungan
  | 'flashcard'        // Flashcard deck
  | 'hasil'            // Hasil / apresiasi
  | 'refleksi'         // Refleksi pembelajaran
  | 'penutup'          // Penutup / closing
  | 'kuis'             // Kuis interaktif
  | 'skenario'         // Skenario interaktif
  // Legacy types (still supported for existing pages)
  | 'materi'           // Materi (legacy)
  | 'game'             // Game (legacy)
  | 'hero'             // Hero banner (legacy)
  | 'custom';          // Blank canvas (legacy element mode)

export interface ColorPalette {
  colors: string[];             // Extracted hex colors (up to 8)
  mapping: Record<string, string>; // CSS var → hex mapping
}

export interface NavConfig {
  showNavbar: boolean;
  showPrevNext: boolean;
  showScore: boolean;
  showProgress: boolean;
  navbarStyle: 'colorful' | 'minimal' | 'glass';
}

export interface CanvaPage {
  id: string;
  label: string;
  bgDataUrl: string | null;
  bgColor: string;
  overlay: number;
  elements: CanvaElement[];
  // ── Template system (v2) ──
  templateType: PageTemplateType;
  colorPalette: ColorPalette | null;
  navConfig: NavConfig;
  // Template-specific data binding
  templateData: Record<string, unknown>;
}

export type LeftTab = 'pages' | 'templates' | 'elems' | 'ratio' | 'layers';
export type Tool = 'select' | 'text';
export type ResizeDir = 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | 'tm' | 'bm';

// ── Constants ──────────────────────────────────────────────────

export const RATIOS: Ratio[] = [
  { id: '16:9', name: '16:9', desc: 'Landscape PPT', w: 1280, h: 720 },
  { id: '9:16', name: '9:16', desc: 'Portrait HP', w: 720, h: 1280 },
  { id: '1:1', name: '1:1', desc: 'Square Post', w: 800, h: 800 },
  { id: 'A4', name: 'A4', desc: 'Dokumen LKS', w: 794, h: 1123 },
  { id: '4:3', name: '4:3', desc: 'Presentasi Lama', w: 1024, h: 768 },
];

export const ELEM_TYPES: ElemType[] = [
  { id: 'kuis', icon: '❓', name: 'Kuis', color: 'rgba(245,200,66,.4)' },
  { id: 'game', icon: '🎮', name: 'Game', color: 'rgba(56,217,217,.4)' },
  { id: 'materi', icon: '📝', name: 'Materi', color: 'rgba(167,139,250,.4)' },
  { id: 'modul', icon: '🧩', name: 'Modul', color: 'rgba(52,211,153,.4)' },
  { id: 'teks', icon: '🔤', name: 'Teks', color: 'rgba(255,255,255,.3)' },
  { id: 'shape', icon: '⬜', name: 'Shape', color: 'rgba(100,100,200,.3)' },
];

export const LAYER_COLORS: Record<string, string> = {
  kuis: '#f5c842',
  game: '#3ecfcf',
  materi: '#a78bfa',
  modul: '#34d399',
  teks: '#fff',
  shape: '#6366f1',
};

// ── Template Gallery Constants ────────────────────────────────

export interface TemplateInfo {
  id: PageTemplateType;
  icon: string;
  name: string;
  desc: string;
  color: string;
  category: 'utama' | 'konten' | 'interaktif' | 'penutup';
}

export const TEMPLATE_TYPES: TemplateInfo[] = [
  // ── Utama ──
  { id: 'cover',            icon: '🏠', name: 'Cover',                 desc: 'Halaman judul & pembuka',       color: '#f9c82e', category: 'utama' },
  { id: 'dokumen',          icon: '📋', name: 'Dokumen (CP/TP/ATP)',   desc: 'Capaian & Tujuan Pembelajaran', color: '#3ecfcf', category: 'utama' },
  { id: 'tujuan',           icon: '🎯', name: 'Tujuan Pembelajaran',   desc: 'TP fokus pertemuan ini',        color: '#f5c842', category: 'utama' },
  // ── Konten ──
  { id: 'review',           icon: '🔄', name: 'Review',                desc: 'Tanya-jawab pemantik',          color: '#fb923c', category: 'konten' },
  { id: 'materi-tabicons',  icon: '📑', name: 'Materi (Tab Icons)',    desc: 'Konten dengan tab navigasi',    color: '#a78bfa', category: 'konten' },
  { id: 'materi-accordion', icon: '📂', name: 'Materi (Accordion)',    desc: 'Konten dengan lipat buka',      color: '#8b5cf6', category: 'konten' },
  { id: 'hubungan-konsep',  icon: '🕸️', name: 'Hubungan Konsep',       desc: 'Peta konsep & relasi',          color: '#6366f1', category: 'konten' },
  // ── Interaktif ──
  { id: 'diskusi-timer',    icon: '⏱️', name: 'Diskusi + Timer',       desc: 'Diskusi terpandu + hitung waktu', color: '#06b6d4', category: 'interaktif' },
  { id: 'sortir-game',      icon: '🔢', name: 'Game Sortir',           desc: 'Kategorikan item ke kelompok',  color: '#f97316', category: 'interaktif' },
  { id: 'roda-game',        icon: '🎡', name: 'Game Roda',             desc: 'Roda putar pertanyaan',         color: '#ec4899', category: 'interaktif' },
  { id: 'flashcard',        icon: '🃏', name: 'Flashcard',             desc: 'Kartu balik hafalan',           color: '#14b8a6', category: 'interaktif' },
  { id: 'kuis',             icon: '❓', name: 'Kuis',                  desc: 'Soal pilihan ganda',            color: '#f5c842', category: 'interaktif' },
  { id: 'skenario',         icon: '🎭', name: 'Skenario',              desc: 'Cerita interaktif pilihan',     color: '#f472b6', category: 'interaktif' },
  // ── Penutup ──
  { id: 'hasil',            icon: '🏆', name: 'Hasil',                 desc: 'Skor & apresiasi',              color: '#34d399', category: 'penutup' },
  { id: 'refleksi',         icon: '💭', name: 'Refleksi',              desc: 'Refleksi pembelajaran',         color: '#818cf8', category: 'penutup' },
  { id: 'penutup',          icon: '👋', name: 'Penutup',               desc: 'Penutup & rangkuman',           color: '#f472b6', category: 'penutup' },
  // ── Legacy ──
  { id: 'materi',           icon: '📝', name: 'Materi (Legacy)',       desc: 'Konten pembelajaran (lama)',    color: '#a78bfa', category: 'konten' },
  { id: 'game',             icon: '🎮', name: 'Game (Legacy)',         desc: 'Game interaktif (lama)',        color: '#3ecfcf', category: 'interaktif' },
  { id: 'hero',             icon: '🚀', name: 'Hero (Legacy)',         desc: 'Banner dengan gradient (lama)', color: '#fb923c', category: 'konten' },
  { id: 'custom',           icon: '⬜', name: 'Kosong',                desc: 'Canvas kosong (bebas)',         color: '#6366f1', category: 'utama' },
];

// ── Gradient Presets ──────────────────────────────────────────

export interface GradientPreset {
  id: string;
  name: string;
  css: string;
  category: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'sunset',    name: 'Sunset',     css: 'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)',       category: 'energik' },
  { id: 'ocean',     name: 'Ocean',      css: 'linear-gradient(135deg,#06b6d4,#3b82f6,#6366f1)',       category: 'dingin' },
  { id: 'forest',    name: 'Forest',     css: 'linear-gradient(135deg,#10b981,#059669,#047857)',       category: 'alam' },
  { id: 'aurora',    name: 'Aurora',     css: 'linear-gradient(135deg,#a78bfa,#ec4899,#f97316)',       category: 'energik' },
  { id: 'midnight',  name: 'Midnight',   css: 'linear-gradient(135deg,#1e1b4b,#312e81,#4338ca)',       category: 'profesional' },
  { id: 'cherry',    name: 'Cherry',     css: 'linear-gradient(135deg,#fda4af,#fb7185,#e11d48)',       category: 'fun' },
  { id: 'golden',    name: 'Golden',     css: 'linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)',       category: 'hangat' },
  { id: 'neon',      name: 'Neon',       css: 'linear-gradient(135deg,#22d3ee,#a855f7,#f43f5e)',       category: 'fun' },
  { id: 'slate',     name: 'Slate',      css: 'linear-gradient(135deg,#334155,#475569,#64748b)',       category: 'minimal' },
  { id: 'ember',     name: 'Ember',      css: 'linear-gradient(135deg,#dc2626,#ea580c,#f59e0b)',       category: 'hangat' },
];

// ── Default Nav Config ────────────────────────────────────────

export const DEFAULT_NAV_CONFIG: NavConfig = {
  showNavbar: true,
  showPrevNext: true,
  showScore: true,
  showProgress: true,
  navbarStyle: 'colorful',
};
