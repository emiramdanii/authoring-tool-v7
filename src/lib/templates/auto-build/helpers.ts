// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD HELPERS — Shared utilities for the auto-build pipeline
// Includes: accent color mapping, data detection helpers,
// content analysis engine, and screen ID generator.
// ═══════════════════════════════════════════════════════════════

import type {
  CpState,
  TpItem,
  AtpState,
  KuisItem,
  MateriState,
} from '@/store/authoring-store';
import type {
  DefBoxItem,
  CardGridItem,
  NormaTabItem,
  TabelAccordionItem,
} from '../engine/slot-types';

// ═══════════════════════════════════════════════════════════════
// SCREEN ID GENERATOR
// ═══════════════════════════════════════════════════════════════

let screenCounter = 0;

export function makeScreenId(templateId: string): string {
  screenCounter++;
  return `s-${templateId}-${screenCounter}`;
}

/** Reset the screen counter (useful before a fresh build) */
export function resetScreenCounter(): void {
  screenCounter = 0;
}

// ═══════════════════════════════════════════════════════════════
// ACCENT COLOR PER PERTEMUAN
// P1=yellow(--y), P2=cyan(--c), P3=green(--g), P4=purple(--p)
// ═══════════════════════════════════════════════════════════════

const PERTEMUAN_ACCENTS: Record<number, string> = {
  1: '--y', // Kuning
  2: '--c', // Cyan
  3: '--g', // Hijau
  4: '--p', // Ungu
  5: '--o', // Oranye
  6: '--r', // Merah
};

export function getAccentForPertemuan(pertemuanKe: number | undefined): string {
  if (pertemuanKe && PERTEMUAN_ACCENTS[pertemuanKe]) {
    return PERTEMUAN_ACCENTS[pertemuanKe];
  }
  return '--y'; // Default kuning
}

/** Map accent var name to hex color */
export const ACCENT_HEX_MAP: Record<string, string> = {
  '--y': '#f9c12e',
  '--c': '#3ecfcf',
  '--g': '#34d399',
  '--p': '#a78bfa',
  '--o': '#fb923c',
  '--r': '#ff6b6b',
};

/** Resolve accent var to a TP item color string */
export function getAccentTPColor(accentVar: string): string {
  return accentVar === '--c' ? '#3ecfcf'
    : accentVar === '--g' ? '#34d399'
    : accentVar === '--p' ? '#a78bfa'
    : accentVar === '--o' ? '#fb923c'
    : accentVar === '--r' ? '#ff6b6b'
    : '#f9c82e'; // default kuning
}

// ═══════════════════════════════════════════════════════════════
// DATA AVAILABILITY HELPERS
// ═══════════════════════════════════════════════════════════════

export function hasCPData(cp: CpState): boolean {
  return !!(cp.capaianFase || cp.elemen || cp.subElemen || cp.profil.length > 0);
}

export function hasTPData(tp: TpItem[]): boolean {
  return tp.length > 0;
}

export function hasSkenarioData(skenario: Array<Record<string, unknown>>): boolean {
  return skenario.length > 0;
}

export function hasMateriData(materi: MateriState): boolean {
  return materi.blok.length > 0;
}

export function hasKuisData(kuis: KuisItem[]): boolean {
  return kuis.filter((k) => k.q.trim()).length > 0;
}

export function hasModulesOfType(
  modules: Array<Record<string, unknown>>,
  types: string[],
): boolean {
  return modules.some((m) => types.includes(m.type as string));
}

export function getModulesOfType(
  modules: Array<Record<string, unknown>>,
  types: string[],
): Array<Record<string, unknown>> {
  return modules.filter((m) => types.includes(m.type as string));
}

export function hasDiscussionActivities(atp: AtpState): boolean {
  return atp.pertemuan.some(
    (p) =>
      p.kegiatan.toLowerCase().includes('diskusi') ||
      p.kegiatan.toLowerCase().includes('kelompok') ||
      p.kegiatan.toLowerCase().includes('berdiskusi'),
  );
}

/** Count total materi sections (bloks + module tabs) */
export function countMateriSections(materi: MateriState, modules: Array<Record<string, unknown>>): number {
  const materiModuleTypes = ['tab-icons', 'icon-explore', 'accordion', 'materi', 'infografis', 'langkah'];
  let count = materi.blok.length;

  for (const m of getModulesOfType(modules, materiModuleTypes)) {
    const type = m.type as string;
    if (type === 'tab-icons') {
      count += ((m.tabs as Array<Record<string, unknown>>) || []).length;
    } else if (type === 'icon-explore' || type === 'accordion') {
      count += ((m.items as Array<Record<string, unknown>>) || []).length;
    } else {
      count += 1; // each other module = 1 section
    }
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════
// SMART CONTENT DETECTION
// Analyzes materi bloks and modules to detect content patterns
// and choose the right sub-components.
// ═══════════════════════════════════════════════════════════════

export interface ContentAnalysis {
  /** Whether content has norma-type categories (4+ categories with specific structure) */
  hasNormaCategories: boolean;
  /** Detected norma tab data */
  normaTabs: NormaTabItem[];
  /** Detected tabel accordion data */
  tabelAccordion: TabelAccordionItem[];
  /** Detected definition items */
  defBoxes: DefBoxItem[];
  /** Detected card grid items */
  cardGrid: CardGridItem[];
  /** Whether content has ordering/sequencing structure */
  hasOrdering: boolean;
  /** Whether content has definition structure */
  hasDefinitions: boolean;
  /** Total number of categories/sections detected */
  categoryCount: number;
  /** Whether to use norma mode instead of regular tabs */
  useNormaMode: boolean;
}

export function analyzeContent(
  materi: MateriState,
  modules: Array<Record<string, unknown>>,
): ContentAnalysis {
  const result: ContentAnalysis = {
    hasNormaCategories: false,
    normaTabs: [],
    tabelAccordion: [],
    defBoxes: [],
    cardGrid: [],
    hasOrdering: false,
    hasDefinitions: false,
    categoryCount: 0,
    useNormaMode: false,
  };

  // ── 1. Analyze modules for norma-type content ────────────────
  const iconExploreMods = getModulesOfType(modules, ['icon-explore']);

  for (const mod of iconExploreMods) {
    const items = (mod.items as Array<Record<string, unknown>>) || [];
    if (items.length >= 3) {
      const hasNormaFields = items.some(item =>
        item.sanksi || item.contoh || item.sumber || item.sifat
      );
      if (hasNormaFields) {
        result.hasNormaCategories = true;
        result.categoryCount = items.length;

        const normaColors = ['#f9c12e', '#3ecfcf', '#34d399', '#a78bfa', '#ff6b6b', '#fb923c'];
        const normaBgs = [
          'rgba(249,193,46,.06)', 'rgba(62,207,207,.06)',
          'rgba(52,211,153,.06)', 'rgba(167,139,250,.06)',
          'rgba(255,107,107,.06)', 'rgba(251,146,60,.06)',
        ];
        const normaBg2s = [
          'rgba(249,193,46,.04)', 'rgba(62,207,207,.04)',
          'rgba(52,211,153,.04)', 'rgba(167,139,250,.04)',
          'rgba(255,107,107,.04)', 'rgba(251,146,60,.04)',
        ];

        result.normaTabs = items.map((item, i) => {
          const color = (item.warna as string) || normaColors[i % normaColors.length];
          const sanksiItems = (item.sanksi as string) ? (item.sanksi as string).split(',').map(s => s.trim()) : [];
          const contohItems = (item.contoh as Array<Record<string, unknown>>) || [];
          const pelanggaran = contohItems.map(c => ({
            ikon: (c.ikon as string) || '⚠️',
            teks: (c.teks as string) || (c.label as string) || '',
            sanksi: (c.sanksi as string) || (c.resultBody as string) || '',
          }));

          return {
            id: `norma-${i}`,
            icon: (item.icon as string) || '📌',
            label: (item.judul as string) || `Norma ${i + 1}`,
            color,
            bg: normaBgs[i % normaBgs.length],
            bc: `${color}44`,
            bg2: normaBg2s[i % normaBg2s.length],
            sumber: (item.sumber as string) || '-',
            sifat: (item.sifat as string) || '-',
            tujuan: (item.tujuan as string) || (item.ringkasan as string) || '-',
            sanksiTipe: 'Sanksi Pelanggaran',
            sanksiItems,
            contoh: typeof item.contoh === 'string' ? item.contoh as string : '',
            pelanggaran,
          };
        });

        result.tabelAccordion = result.normaTabs.map((nt) => ({
          icon: nt.icon,
          label: nt.label,
          color: nt.color,
          details: [
            { label: 'Sumber', value: nt.sumber },
            { label: 'Sifat', value: nt.sifat },
            { label: 'Tujuan', value: nt.tujuan },
            { label: 'Sanksi', value: nt.sanksiItems.join(', ') || '-' },
          ],
        }));
      }
    }
  }

  // ── 2. Analyze materi bloks for definitions ──────────────────
  for (const blok of materi.blok) {
    if (blok.tipe === 'definisi' && blok.isi) {
      result.hasDefinitions = true;
      result.defBoxes.push({
        text: `${blok.judul ? blok.judul + ': ' : ''}${blok.isi}`,
        accentVar: '--y',
      });
    }
    if (blok.tipe === 'highlight' && blok.isi) {
      result.defBoxes.push({
        text: blok.isi,
        accentVar: blok.warna === '#3ecfcf' ? '--c' : blok.warna === '#34d399' ? '--g' : blok.warna === '#a78bfa' ? '--p' : '--y',
      });
    }
    if (blok.tipe === 'infobox' && blok.isi) {
      result.defBoxes.push({
        text: `${blok.judul ? blok.judul + ': ' : ''}${blok.isi}`,
        accentVar: blok.style === 'warning' ? '--o' : blok.style === 'danger' ? '--r' : '--c',
      });
    }
    if (blok.tipe === 'kutipan' && blok.isi) {
      result.defBoxes.push({
        text: `"${blok.isi}"${blok.judul ? ' — ' + blok.judul : ''}`,
        accentVar: '--p',
      });
    }
  }

  // ── 3. Analyze modules for card grid content ─────────────────
  const cardShowcaseMods = getModulesOfType(modules, ['card-showcase']);
  for (const mod of cardShowcaseMods) {
    const cards = (mod.cards as Array<Record<string, unknown>>) || [];
    for (const c of cards) {
      result.cardGrid.push({
        icon: (c.icon as string) || '📌',
        title: (c.judul as string) || '',
        body: (c.isi as string) || (c.subtitle as string) || '',
        accentVar: '--c',
      });
    }
  }

  for (const blok of materi.blok) {
    if (blok.tipe === 'compare' && blok.kiri && blok.kanan) {
      result.cardGrid.push({
        icon: blok.kiri.icon || '⬅️',
        title: blok.kiri.judul || 'Kiri',
        body: blok.kiri.isi || '',
        accentVar: '--c',
      });
      result.cardGrid.push({
        icon: blok.kanan.icon || '➡️',
        title: blok.kanan.judul || 'Kanan',
        body: blok.kanan.isi || '',
        accentVar: '--p',
      });
    }
  }

  // ── 4. Analyze modules for sorting game ──────────────────────
  const sortingMods = getModulesOfType(modules, ['sorting']);
  result.hasOrdering = sortingMods.length > 0;

  // ── 5. Determine if we should use norma mode ─────────────────
  result.useNormaMode = result.hasNormaCategories && result.normaTabs.length >= 3;

  return result;
}
