// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD.TS — Re-export barrel for backward compatibility
// All logic has been split into:
//   auto-build/helpers.ts   — Accent colors, data detection, content analysis
//   auto-build/builders.ts  — Slot data builders for each template type
//   auto-build/index.ts     — Main pipeline (autoBuildScreens, autoBuildConfig)
// ═══════════════════════════════════════════════════════════════

export {
  type AuthoringData,
  autoBuildScreens,
  autoBuildConfig,
  // Helpers
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
  // Builders
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
} from './auto-build/index';
