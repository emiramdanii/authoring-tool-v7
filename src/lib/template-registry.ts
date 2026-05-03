// ═══════════════════════════════════════════════════════════════
// TEMPLATE-REGISTRY.TS — Central registry for MPI template system
// Maps each template ID to its metadata, slot schema, and HTML
// render function. This is the single source of truth for all
// 16 screen templates in the authoring tool.
// ═══════════════════════════════════════════════════════════════

import { renderCoverHTML } from './templates/screens/cover';
import { renderDokumenHTML } from './templates/screens/dokumen';
import { renderTujuanHTML } from './templates/screens/tujuan';
import { renderReviewHTML } from './templates/screens/review';
import { renderMateriTabIconsHTML } from './templates/screens/materi-tabicons';
import { renderMateriAccordionHTML } from './templates/screens/materi-accordion';
import { renderDiskusiTimerHTML } from './templates/screens/diskusi-timer';
import { renderSortirGameHTML } from './templates/screens/sortir-game';
import { renderRodaGameHTML } from './templates/screens/roda-game';
import { renderHubunganKonsepHTML } from './templates/screens/hubungan-konsep';
import { renderFlashcardHTML } from './templates/screens/flashcard';
import { renderHasilHTML } from './templates/screens/hasil';
import { renderRefleksiHTML } from './templates/screens/refleksi';
import { renderPenutupHTML } from './templates/screens/penutup';
import { renderKuisHTML } from './templates/screens/kuis';
import { renderPetunjukHTML } from './templates/screens/petunjuk';
import { renderSkenarioHTML } from './templates/screens/skenario';
import { renderHotspotHTML } from './templates/screens/hotspot';

import {
  SLOT_SCHEMAS,
  type TemplateId,
  type ScreenSlotData,
  type TemplateSlotSchema,
} from './templates/engine/slot-types';

// ═══════════════════════════════════════════════════════════════
// REGISTRY ENTRY INTERFACE
// ═══════════════════════════════════════════════════════════════

export type TemplateCategory = 'utama' | 'konten' | 'interaktif' | 'penutup';

export interface TemplateRegistryEntry {
  /** Unique template identifier */
  id: TemplateId;
  /** Indonesian display name */
  name: string;
  /** Emoji icon for the template */
  icon: string;
  /** Indonesian description */
  desc: string;
  /** Template category for grouping in the UI */
  category: TemplateCategory;
  /** Accent hex color for the template */
  color: string;
  /** Slot schema defining editable fields */
  slotSchema: TemplateSlotSchema;
  /** HTML render function: produces a `<div class="screen">` string */
  renderHTML: (data: ScreenSlotData, screenId: string) => string;
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE REGISTRY — all 16 templates
// ═══════════════════════════════════════════════════════════════

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateRegistryEntry> = {
  // ── 1. Cover ──────────────────────────────────────────────────
  cover: {
    id: 'cover',
    name: 'Cover',
    icon: '🏠',
    desc: 'Halaman sampul pertemuan dengan judul dan informasi kelas',
    category: 'utama',
    color: '#f9c82e',
    slotSchema: SLOT_SCHEMAS.cover,
    renderHTML: (data, screenId) => renderCoverHTML(data as import('./templates/engine/slot-types').CoverSlotData, screenId),
  },

  // ── 2. Dokumen ───────────────────────────────────────────────
  dokumen: {
    id: 'dokumen',
    name: 'Dokumen (CP/TP/ATP)',
    icon: '📋',
    desc: 'Capaian Pembelajaran, Tujuan Pembelajaran, dan ATP',
    category: 'utama',
    color: '#3ecfcf',
    slotSchema: SLOT_SCHEMAS.dokumen,
    renderHTML: (data, screenId) => renderDokumenHTML(data as import('./templates/engine/slot-types').DokumenSlotData, screenId),
  },

  // ── 3. Tujuan ────────────────────────────────────────────────
  tujuan: {
    id: 'tujuan',
    name: 'Tujuan Pembelajaran',
    icon: '🎯',
    desc: 'Tujuan pembelajaran pertemuan secara mandiri',
    category: 'utama',
    color: '#f5c842',
    slotSchema: SLOT_SCHEMAS.tujuan,
    renderHTML: (data, screenId) => renderTujuanHTML(data as import('./templates/engine/slot-types').TujuanSlotData, screenId),
  },

  // ── 4. Review ────────────────────────────────────────────────
  review: {
    id: 'review',
    name: 'Review',
    icon: '🔄',
    desc: 'Tinjauan ulang materi sebelumnya dengan kartu balik',
    category: 'konten',
    color: '#fb923c',
    slotSchema: SLOT_SCHEMAS.review,
    renderHTML: (data, screenId) => renderReviewHTML(data as import('./templates/engine/slot-types').ReviewSlotData, screenId),
  },

  // ── 5. Materi Tab Icons ──────────────────────────────────────
  'materi-tabicons': {
    id: 'materi-tabicons',
    name: 'Materi (Tab Icons)',
    icon: '📑',
    desc: 'Materi dengan tab navigasi berikon untuk setiap bagian',
    category: 'konten',
    color: '#a78bfa',
    slotSchema: SLOT_SCHEMAS['materi-tabicons'],
    renderHTML: (data, screenId) => renderMateriTabIconsHTML(data as import('./templates/engine/slot-types').MateriTabIconsSlotData, screenId),
  },

  // ── 6. Materi Accordion ──────────────────────────────────────
  'materi-accordion': {
    id: 'materi-accordion',
    name: 'Materi (Accordion)',
    icon: '📂',
    desc: 'Materi dengan panel akordeon yang bisa dibuka-tutup',
    category: 'konten',
    color: '#8b5cf6',
    slotSchema: SLOT_SCHEMAS['materi-accordion'],
    renderHTML: (data, screenId) => renderMateriAccordionHTML(data as import('./templates/engine/slot-types').MateriAccordionSlotData, screenId),
  },

  // ── 7. Diskusi + Timer ───────────────────────────────────────
  'diskusi-timer': {
    id: 'diskusi-timer',
    name: 'Diskusi + Timer',
    icon: '⏱️',
    desc: 'Diskusi kelompok terpandu dengan hitung mundur',
    category: 'interaktif',
    color: '#06b6d4',
    slotSchema: SLOT_SCHEMAS['diskusi-timer'],
    renderHTML: (data, screenId) => renderDiskusiTimerHTML(data as import('./templates/engine/slot-types').DiskusiTimerSlotData, screenId),
  },

  // ── 8. Sortir Game ───────────────────────────────────────────
  'sortir-game': {
    id: 'sortir-game',
    name: 'Game Sortir',
    icon: '🔢',
    desc: 'Game mengelompokkan item ke kategori yang tepat',
    category: 'interaktif',
    color: '#f97316',
    slotSchema: SLOT_SCHEMAS['sortir-game'],
    renderHTML: (data, screenId) => renderSortirGameHTML(data as import('./templates/engine/slot-types').SortirGameSlotData, screenId),
  },

  // ── 9. Roda Game ─────────────────────────────────────────────
  'roda-game': {
    id: 'roda-game',
    name: 'Game Roda',
    icon: '🎡',
    desc: 'Game roda putar dengan pertanyaan acak',
    category: 'interaktif',
    color: '#ec4899',
    slotSchema: SLOT_SCHEMAS['roda-game'],
    renderHTML: (data, screenId) => renderRodaGameHTML(data as import('./templates/engine/slot-types').RodaGameSlotData, screenId),
  },

  // ── 10. Hubungan Konsep ──────────────────────────────────────
  'hubungan-konsep': {
    id: 'hubungan-konsep',
    name: 'Hubungan Konsep',
    icon: '🕸️',
    desc: 'Peta konsep dengan node dan hubungan antar konsep',
    category: 'konten',
    color: '#6366f1',
    slotSchema: SLOT_SCHEMAS['hubungan-konsep'],
    renderHTML: (data, screenId) => renderHubunganKonsepHTML(data as import('./templates/engine/slot-types').HubunganKonsepSlotData, screenId),
  },

  // ── 11. Flashcard ────────────────────────────────────────────
  flashcard: {
    id: 'flashcard',
    name: 'Flashcard',
    icon: '🃏',
    desc: 'Kartu belajar bolak-balik untuk menghafal konsep',
    category: 'interaktif',
    color: '#14b8a6',
    slotSchema: SLOT_SCHEMAS.flashcard,
    renderHTML: (data, screenId) => renderFlashcardHTML(data as import('./templates/engine/slot-types').FlashcardSlotData, screenId),
  },

  // ── 12. Hasil ────────────────────────────────────────────────
  hasil: {
    id: 'hasil',
    name: 'Hasil',
    icon: '🏆',
    desc: 'Ringkasan skor dan hasil belajar dengan animasi',
    category: 'penutup',
    color: '#34d399',
    slotSchema: SLOT_SCHEMAS.hasil,
    renderHTML: (data, screenId) => renderHasilHTML(data as import('./templates/engine/slot-types').HasilSlotData, screenId),
  },

  // ── 13. Refleksi ─────────────────────────────────────────────
  refleksi: {
    id: 'refleksi',
    name: 'Refleksi',
    icon: '💭',
    desc: 'Halaman refleksi pembelajaran untuk siswa',
    category: 'penutup',
    color: '#818cf8',
    slotSchema: SLOT_SCHEMAS.refleksi,
    renderHTML: (data, screenId) => renderRefleksiHTML(data as import('./templates/engine/slot-types').RefleksiSlotData, screenId),
  },

  // ── 14. Penutup ──────────────────────────────────────────────
  penutup: {
    id: 'penutup',
    name: 'Penutup',
    icon: '👋',
    desc: 'Halaman penutup dan rangkuman pertemuan',
    category: 'penutup',
    color: '#f472b6',
    slotSchema: SLOT_SCHEMAS.penutup,
    renderHTML: (data, screenId) => renderPenutupHTML(data as import('./templates/engine/slot-types').PenutupSlotData, screenId),
  },

  // ── 15. Kuis ─────────────────────────────────────────────────
  kuis: {
    id: 'kuis',
    name: 'Kuis',
    icon: '❓',
    desc: 'Kuis pilihan ganda interaktif dengan penjelasan',
    category: 'interaktif',
    color: '#f5c842',
    slotSchema: SLOT_SCHEMAS.kuis,
    renderHTML: (data, screenId) => renderKuisHTML(data as import('./templates/engine/slot-types').KuisSlotData, screenId),
  },

    // ── 16. Petunjuk ─────────────────────────────────────────────
  petunjuk: {
    id: 'petunjuk',
    name: 'Petunjuk',
    icon: '📌',
    desc: 'Petunjuk penggunaan media pembelajaran',
    category: 'utama',
    color: '#3ecfcf',
    slotSchema: SLOT_SCHEMAS.petunjuk,
    renderHTML: (data, screenId) => renderPetunjukHTML(data as import('./templates/engine/slot-types').PetunjukSlotData, screenId),
  },

  // ── 17. Skenario ─────────────────────────────────────────────
  skenario: {
    id: 'skenario',
    name: 'Skenario',
    icon: '🎭',
    desc: 'Skenario interaktif bercabang dengan pilihan dan konsekuensi',
    category: 'interaktif',
    color: '#f472b6',
    slotSchema: SLOT_SCHEMAS.skenario,
    renderHTML: (data, screenId) => renderSkenarioHTML(data as import('./templates/engine/slot-types').SkenarioSlotData, screenId),
  },

  // ── 18. Hotspot Image ───────────────────────────────────────
  hotspot: {
    id: 'hotspot',
    name: 'Hotspot Image',
    icon: '🗺️',
    desc: 'Gambar interaktif dengan titik-titik hotspot yang bisa diklik',
    category: 'interaktif',
    color: '#fb923c',
    slotSchema: SLOT_SCHEMAS.hotspot,
    renderHTML: (data, screenId) => renderHotspotHTML(data as import('./templates/engine/slot-types').HotspotSlotData, screenId),
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get a single template registry entry by its ID.
 * Throws if the template ID is not found in the registry.
 */
export function getTemplate(id: TemplateId): TemplateRegistryEntry {
  const entry = TEMPLATE_REGISTRY[id];
  if (!entry) {
    throw new Error(`Template not found: "${id}"`);
  }
  return entry;
}

/**
 * Get all template registry entries belonging to a given category.
 */
export function getTemplatesByCategory(cat: TemplateCategory): TemplateRegistryEntry[] {
  return Object.values(TEMPLATE_REGISTRY).filter((e) => e.category === cat);
}

/**
 * Get all template registry entries as an array.
 */
export function getAllTemplates(): TemplateRegistryEntry[] {
  return Object.values(TEMPLATE_REGISTRY);
}

/**
 * Render a template's HTML by its template ID.
 * This is the primary entry point for generating screen HTML.
 *
 * @param id       - Template identifier
 * @param data     - Slot data matching the template's schema
 * @param screenId - DOM id for the generated screen element
 * @returns Complete `<div class="screen">` HTML string
 */
export function renderTemplateHTML(id: TemplateId, data: ScreenSlotData, screenId: string): string {
  const entry = getTemplate(id);
  return entry.renderHTML(data, screenId);
}
