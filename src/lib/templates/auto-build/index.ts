// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD INDEX — Main entry point for the auto-build pipeline
// Re-exports from split modules and provides the main
// autoBuildScreens() and autoBuildConfig() functions.
//
// File structure:
//   auto-build/
//     index.ts     — Main pipeline (this file)
//     helpers.ts   — Accent colors, data detection, content analysis
//     builders.ts  — Slot data builders for each template type
// ═══════════════════════════════════════════════════════════════

import type {
  MetaState,
  CpState,
  TpItem,
  AtpState,
  AlurItem,
  KuisItem,
  MateriState,
} from '@/store/authoring-store';
import type { AssemblyScreen, AssemblyConfig } from '../assembly';
import type { TemplateId, ScreenSlotData } from '../engine/slot-types';
import { createDefaultSlotData } from '../engine/slot-types';

// Re-export helpers
export {
  makeScreenId,
  resetScreenCounter,
  getAccentForPertemuan,
  ACCENT_HEX_MAP,
  getAccentTPColor,
  hasCPData,
  hasTPData,
  hasSkenarioData,
  hasMateriData,
  hasKuisData,
  hasModulesOfType,
  getModulesOfType,
  hasDiscussionActivities,
  countMateriSections,
  analyzeContent,
  type ContentAnalysis,
} from './helpers';

// Re-export builders
export {
  buildCoverSlotData,
  buildDokumenSlotData,
  buildTujuanSlotData,
  buildSkenarioSlotData,
  buildMateriTabIconsSlotData,
  buildMateriAccordionSlotData,
  buildMateriFromModulesSlotData,
  buildHubunganKonsepSlotData,
  buildFlashcardSlotData,
  buildHotspotSlotData,
  buildKuisSlotData,
  buildSortirGameSlotData,
  buildRodaGameSlotData,
  buildDiskusiTimerSlotData,
  buildHasilSlotData,
  buildRefleksiSlotData,
  buildPenutupSlotData,
  buildPetunjukSlotData,
  buildReviewSlotData,
  resetDiskusiBoxCounter,
} from './builders';

// Import for local use
import {
  resetScreenCounter,
  makeScreenId,
  getAccentForPertemuan,
  ACCENT_HEX_MAP,
  hasCPData,
  hasTPData,
  hasSkenarioData,
  hasMateriData,
  hasKuisData,
  hasModulesOfType,
  hasDiscussionActivities,
  countMateriSections,
  analyzeContent,
} from './helpers';

import {
  buildCoverSlotData,
  buildDokumenSlotData,
  buildTujuanSlotData,
  buildSkenarioSlotData,
  buildMateriTabIconsSlotData,
  buildMateriAccordionSlotData,
  buildMateriFromModulesSlotData,
  buildHubunganKonsepSlotData,
  buildFlashcardSlotData,
  buildHotspotSlotData,
  buildKuisSlotData,
  buildSortirGameSlotData,
  buildRodaGameSlotData,
  buildDiskusiTimerSlotData,
  buildHasilSlotData,
  buildRefleksiSlotData,
  buildPenutupSlotData,
  buildPetunjukSlotData,
  buildReviewSlotData,
  resetDiskusiBoxCounter,
} from './builders';

// ═══════════════════════════════════════════════════════════════
// AUTHORING DATA INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface AuthoringData {
  meta: MetaState;
  cp: CpState;
  tp: TpItem[];
  atp: AtpState;
  alur: AlurItem[];
  skenario: Array<Record<string, unknown>>;
  kuis: KuisItem[];
  modules: Array<Record<string, unknown>>;
  games: Array<Record<string, unknown>>;
  materi: MateriState;
  /** Current pertemuan number (1-based) for accent color */
  pertemuanKe?: number;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: autoBuildScreens
// Smart auto-detection pipeline:
//   1. Analyze content → detect patterns
//   2. Choose templates based on content type
//   3. Generate COMPLETE slot data with all sub-components
//   4. Return ordered AssemblyScreen[] ready for assembly
// ═══════════════════════════════════════════════════════════════

export function autoBuildScreens(authoringData: AuthoringData): AssemblyScreen[] {
  resetScreenCounter();
  resetDiskusiBoxCounter();
  const screens: AssemblyScreen[] = [];
  const { meta, cp, tp, atp, alur, skenario, kuis, modules, games, materi } = authoringData;
  const pertemuanKe = authoringData.pertemuanKe || 1;

  // Determine accent color for this pertemuan
  const accentVar = getAccentForPertemuan(pertemuanKe);

  // ── Smart content analysis ─────────────────────────────────────
  const contentAnalysis = analyzeContent(materi, modules);

  const hasCP = hasCPData(cp);
  const hasTP = hasTPData(tp);
  const hasSk = hasSkenarioData(skenario);
  const hasMat = hasMateriData(materi);
  const hasKu = hasKuisData(kuis);

  // Determine materi template variant
  const hasMateriModules = hasModulesOfType(modules, [
    'tab-icons', 'icon-explore', 'accordion', 'materi', 'infografis', 'langkah',
  ]);
  const materiSectionCount = countMateriSections(materi, modules);

  // Smart choice: if norma categories detected → always use tabicons (for norma tabs)
  // Otherwise use accordion when sections > 3 (too many for tabs)
  const useAccordion = !contentAnalysis.useNormaMode && materiSectionCount > 3;

  // ═══════════════════════════════════════════════════════════════
  // SCREEN SEQUENCE — Generate COMPLETE pages
  // ═══════════════════════════════════════════════════════════════

  // 1. Cover — always first — FIX: pass cp for elemen data
  screens.push({
    id: makeScreenId('cover'),
    templateId: 'cover',
    data: buildCoverSlotData(meta, accentVar, pertemuanKe, cp),
  });

  // 2. Petunjuk — always (after cover) — FIX: pass kuis & modules for content-aware items
  screens.push({
    id: makeScreenId('petunjuk'),
    templateId: 'petunjuk',
    data: buildPetunjukSlotData(meta, atp, kuis, modules, materi),
  });

  // 3. Review — if Pertemuan 2+ (review previous pertemuan)
  if (pertemuanKe >= 2) {
    screens.push({
      id: makeScreenId('review'),
      templateId: 'review',
      data: buildReviewSlotData(meta, tp, materi, accentVar, pertemuanKe),
    });
  }

  // 4. Dokumen — if CP or TP data exists
  if (hasCP || hasTP) {
    screens.push({
      id: makeScreenId('dokumen'),
      templateId: 'dokumen',
      data: buildDokumenSlotData(cp, tp, atp, alur),
    });
  }

  // 5. Tujuan — FIX: always show when TP data exists (removed !hasCP condition)
  if (hasTP) {
    screens.push({
      id: makeScreenId('tujuan'),
      templateId: 'tujuan',
      data: buildTujuanSlotData(tp, accentVar),
    });
  }

  // 6. Skenario — if skenario data exists
  if (hasSk) {
    screens.push({
      id: makeScreenId('skenario'),
      templateId: 'skenario',
      data: buildSkenarioSlotData(skenario),
    });
  }

  // 7. Materi (tabicons or accordion) — with smart detection
  if (hasMat || hasMateriModules) {
    if (hasMat && !hasMateriModules) {
      // Use materi blok data directly with smart sub-components
      screens.push({
        id: makeScreenId(useAccordion ? 'materi-accordion' : 'materi-tabicons'),
        templateId: useAccordion ? 'materi-accordion' : 'materi-tabicons',
        data: useAccordion
          ? buildMateriAccordionSlotData(materi, contentAnalysis, accentVar)
          : buildMateriTabIconsSlotData(materi, contentAnalysis, accentVar),
      });
    } else if (hasMateriModules) {
      // Use module data with smart sub-components
      screens.push({
        id: makeScreenId(useAccordion ? 'materi-accordion' : 'materi-tabicons'),
        templateId: useAccordion ? 'materi-accordion' : 'materi-tabicons',
        data: buildMateriFromModulesSlotData(modules, contentAnalysis, useAccordion, accentVar),
      });
    }
  }

  // 7b. Diskusi + Timer — if ATP has discussion activities
  if (hasDiscussionActivities(atp)) {
    screens.push({
      id: makeScreenId('diskusi-timer'),
      templateId: 'diskusi-timer',
      data: buildDiskusiTimerSlotData(atp, meta, accentVar, materi),
    });
  }

  // 8. Hubungan Konsep — if modules define relationships
  if (hasModulesOfType(modules, ['comparison', 'icon-explore'])) {
    const konsepData = buildHubunganKonsepSlotData(modules);
    const konsepSlotData = konsepData as import('../engine/slot-types').HubunganKonsepSlotData;
    if (konsepSlotData.nodes.length > 0) {
      screens.push({
        id: makeScreenId('hubungan-konsep'),
        templateId: 'hubungan-konsep',
        data: konsepData,
      });
    }
  }

  // 9. Flashcard — if flashcard modules exist
  if (hasModulesOfType(modules, ['flashcard'])) {
    screens.push({
      id: makeScreenId('flashcard'),
      templateId: 'flashcard',
      data: buildFlashcardSlotData(modules),
    });
  }

  // 9b. Hotspot Image — if hotspot-image modules exist
  if (hasModulesOfType(modules, ['hotspot-image'])) {
    const hotspotData = buildHotspotSlotData(modules);
    const hotspotSlotData = hotspotData as import('../engine/slot-types').HotspotSlotData;
    if (hotspotSlotData.hotspots.length > 0) {
      screens.push({
        id: makeScreenId('hotspot'),
        templateId: 'hotspot',
        data: hotspotData,
      });
    }
  }

  // 10. Kuis — if kuis data exists
  if (hasKu) {
    screens.push({
      id: makeScreenId('kuis'),
      templateId: 'kuis',
      data: buildKuisSlotData(kuis, accentVar, meta),
    });
  }

  // 11. Sortir Game — if sorting game modules exist
  if (hasModulesOfType(modules, ['sorting'])) {
    const sortirData = buildSortirGameSlotData(modules);
    const sortirSlotData = sortirData as import('../engine/slot-types').SortirGameSlotData;
    if (sortirSlotData.items.length > 0 && sortirSlotData.categories.length > 0) {
      screens.push({
        id: makeScreenId('sortir-game'),
        templateId: 'sortir-game',
        data: sortirData,
      });
    }
  }

  // 12. Roda Game — if roda/spinwheel game modules exist
  if (hasModulesOfType(modules, ['roda', 'spinwheel'])) {
    const rodaData = buildRodaGameSlotData(modules);
    const rodaSlotData = rodaData as import('../engine/slot-types').RodaGameSlotData;
    if (rodaSlotData.segments.length > 0) {
      screens.push({
        id: makeScreenId('roda-game'),
        templateId: 'roda-game',
        data: rodaData,
      });
    }
  }

  // 13. Hasil — always (before refleksi so student sees score first)
  screens.push({
    id: makeScreenId('hasil'),
    templateId: 'hasil',
    data: buildHasilSlotData(meta, kuis),
  });

  // 13b. Refleksi — always (after hasil)
  // FIX: Pass modules for flashcard ringkasan
  screens.push({
    id: makeScreenId('refleksi'),
    templateId: 'refleksi',
    data: buildRefleksiSlotData(accentVar, meta, materi, modules),
  });

  // 14. Penutup — always (with nextPreview)
  // FIX: Pass kuis & modules for dynamic stats
  screens.push({
    id: makeScreenId('penutup'),
    templateId: 'penutup',
    data: buildPenutupSlotData(meta, atp, accentVar, pertemuanKe, kuis, modules),
  });

  return screens;
}

// ═══════════════════════════════════════════════════════════════
// HELPER EXPORT: autoBuildConfig
// ═══════════════════════════════════════════════════════════════

export function autoBuildConfig(authoringData: AuthoringData): AssemblyConfig {
  const screens = autoBuildScreens(authoringData);
  const title = authoringData.meta.judulPertemuan ||
    authoringData.meta.namaBab ||
    'Media Pembelajaran Interaktif';

  const pertemuanKe = authoringData.pertemuanKe || 1;
  const accentVar = getAccentForPertemuan(pertemuanKe);
  const accentHex = ACCENT_HEX_MAP[accentVar] || '#f9c12e';

  return {
    title,
    screens,
    cssVars: {
      '--accent': accentHex,
    },
    includeConfetti: true,
  };
}
