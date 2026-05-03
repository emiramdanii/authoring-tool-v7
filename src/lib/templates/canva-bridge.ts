// ═══════════════════════════════════════════════════════════════
// CANVA-BRIDGE.TS — Bridge between authoring store and canva store
// Syncs authoring store changes to canva template data in real-time.
// Delegates to auto-build builder functions for rich, consistent
// data generation matching the full auto-build pipeline.
// ═══════════════════════════════════════════════════════════════

import { useAuthoringStore } from '@/store/authoring-store';
import type {
  MetaState,
  CpState,
  TpItem,
  AtpState,
  AlurItem,
  KuisItem,
  MateriState,
} from '@/store/authoring-store';
import { useCanvaStore } from '@/store/canva-store';
import type {
  TemplateId,
  ScreenSlotData,
} from './engine/slot-types';
import { createDefaultSlotData } from './engine/slot-types';
import {
  buildCoverSlotData,
  buildDokumenSlotData,
  buildTujuanSlotData,
  buildSkenarioSlotData,
  buildMateriTabIconsSlotData,
  buildMateriAccordionSlotData,
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
} from './auto-build/builders';
import { analyzeContent } from './auto-build/helpers';

// ═══════════════════════════════════════════════════════════════
// MAPPING: templateId → which authoring store fields affect it
// ═══════════════════════════════════════════════════════════════

const TEMPLATE_AUTHORING_MAP: Record<TemplateId, string[]> = {
  cover: ['meta'],
  dokumen: ['cp', 'tp', 'atp', 'alur'],
  tujuan: ['tp'],
  review: ['meta'],
  'materi-tabicons': ['materi', 'modules'],
  'materi-accordion': ['materi', 'modules'],
  'diskusi-timer': ['atp'],
  'sortir-game': ['modules'],
  'roda-game': ['modules'],
  'hubungan-konsep': ['modules'],
  flashcard: ['modules'],
  hasil: ['kuis', 'meta'],
  refleksi: [],
  penutup: ['meta', 'atp'],
  kuis: ['kuis'],
  petunjuk: ['meta'],
  hotspot: ['modules'],
  skenario: ['skenario'],
};

// ── Inverse mapping for efficient diff detection ───────────────
const AUTHORING_FIELD_TEMPLATES: Record<string, TemplateId[]> = (() => {
  const map: Record<string, TemplateId[]> = {};
  const allTemplateIds = Object.keys(TEMPLATE_AUTHORING_MAP) as TemplateId[];

  for (const tid of allTemplateIds) {
    const fields = TEMPLATE_AUTHORING_MAP[tid];
    for (const field of fields) {
      if (!map[field]) map[field] = [];
      map[field].push(tid);
    }
  }
  return map;
})();

// ═══════════════════════════════════════════════════════════════
// HELPER: Stable JSON hash
// ═══════════════════════════════════════════════════════════════

function stableStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: getPageTemplateData
// Delegates to auto-build builder functions for rich data.
// ═══════════════════════════════════════════════════════════════

export function getPageTemplateData(
  templateId: TemplateId,
  authoringData: Record<string, unknown>,
): ScreenSlotData {
  // ── Extract and cast authoring data to typed objects ──────────
  const meta = (authoringData.meta ?? {}) as MetaState;
  const cp = (authoringData.cp ?? {}) as CpState;
  const tp = (authoringData.tp ?? []) as TpItem[];
  const atp = (authoringData.atp ?? { namaBab: '', jumlahPertemuan: 0, pertemuan: [] }) as AtpState;
  const alur = (authoringData.alur ?? []) as AlurItem[];
  const skenario = (authoringData.skenario ?? []) as Array<Record<string, unknown>>;
  const kuis = (authoringData.kuis ?? []) as KuisItem[];
  const modules = (authoringData.modules ?? []) as Array<Record<string, unknown>>;
  const materi = (authoringData.materi ?? { blok: [] }) as MateriState;

  // Canva preview defaults — no pertemuan tracking, always yellow accent
  const pertemuanKe = 1;
  const accentVar = '--y';

  // Run content analysis (shared with auto-build pipeline)
  const contentAnalysis = analyzeContent(materi, modules);

  switch (templateId) {
    case 'cover':
      return buildCoverSlotData(meta, accentVar, pertemuanKe, cp);

    case 'dokumen':
      return buildDokumenSlotData(cp, tp, atp, alur);

    case 'tujuan':
      return buildTujuanSlotData(tp, accentVar);

    case 'review':
      return buildReviewSlotData(meta, tp, materi, accentVar, pertemuanKe);

    case 'materi-tabicons':
      return buildMateriTabIconsSlotData(materi, contentAnalysis, accentVar);

    case 'materi-accordion':
      return buildMateriAccordionSlotData(materi, contentAnalysis, accentVar);

    case 'diskusi-timer':
      return buildDiskusiTimerSlotData(atp, meta, accentVar, materi);

    case 'sortir-game':
      return buildSortirGameSlotData(modules);

    case 'roda-game':
      return buildRodaGameSlotData(modules);

    case 'hubungan-konsep':
      return buildHubunganKonsepSlotData(modules);

    case 'flashcard':
      return buildFlashcardSlotData(modules);

    case 'hotspot':
      return buildHotspotSlotData(modules);

    case 'kuis':
      return buildKuisSlotData(kuis, accentVar, meta);

    case 'hasil':
      return buildHasilSlotData(meta, kuis);

    case 'refleksi':
      return buildRefleksiSlotData(accentVar, meta, materi, modules);

    case 'penutup':
      return buildPenutupSlotData(meta, atp, accentVar, pertemuanKe, kuis, modules);

    case 'petunjuk':
      return buildPetunjukSlotData(meta, atp, kuis, modules, materi);

    case 'skenario':
      return buildSkenarioSlotData(skenario);

    default:
      return createDefaultSlotData(templateId);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: getAuthoringDiff
// ═══════════════════════════════════════════════════════════════

export function getAuthoringDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
): Partial<Record<TemplateId, boolean>> {
  const changed: Partial<Record<TemplateId, boolean>> = {};
  const relevantFields = Object.keys(AUTHORING_FIELD_TEMPLATES);

  for (let fi = 0; fi < relevantFields.length; fi++) {
    const field = relevantFields[fi];
    const oldVal = stableStringify(oldData[field]);
    const newVal = stableStringify(newData[field]);

    if (oldVal !== newVal) {
      const affectedTemplates = AUTHORING_FIELD_TEMPLATES[field] || [];
      for (const tid of affectedTemplates) {
        changed[tid] = true;
      }
    }
  }

  return changed;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: syncAuthoringToCanva
// ═══════════════════════════════════════════════════════════════

export function syncAuthoringToCanva(): void {
  const authState = useAuthoringStore.getState();
  const canvaState = useCanvaStore.getState();

  const authoringSnapshot: Record<string, unknown> = {
    meta: authState.meta,
    cp: authState.cp,
    tp: authState.tp,
    atp: authState.atp,
    alur: authState.alur,
    skenario: authState.skenario,
    kuis: authState.kuis,
    modules: authState.modules,
    games: authState.games,
    materi: authState.materi,
  };

  const pages = canvaState.pages;
  let updated = false;
  const updatedPages = pages.map((page) => {
    const pageTemplateType = page.templateType as string;

    const templateIdMap: Record<string, TemplateId> = {
      cover: 'cover',
      dokumen: 'dokumen',
      tujuan: 'tujuan',
      review: 'review',
      'materi-tabicons': 'materi-tabicons',
      'materi-accordion': 'materi-accordion',
      'diskusi-timer': 'diskusi-timer',
      'sortir-game': 'sortir-game',
      'roda-game': 'roda-game',
      'hubungan-konsep': 'hubungan-konsep',
      flashcard: 'flashcard',
      hasil: 'hasil',
      refleksi: 'refleksi',
      penutup: 'penutup',
      kuis: 'kuis',
      petunjuk: 'petunjuk',
      skenario: 'skenario',
      materi: 'materi-tabicons',
      game: 'sortir-game',
      hero: 'cover',
      hotspot: 'hotspot',
    };

    const templateId = templateIdMap[pageTemplateType];
    if (!templateId) return page;

    const newTemplateData = getPageTemplateData(templateId, authoringSnapshot);

    const oldDataStr = stableStringify(page.templateData);
    const newDataStr = stableStringify(newTemplateData);

    if (oldDataStr !== newDataStr) {
      updated = true;
      return {
        ...page,
        templateData: newTemplateData as unknown as Record<string, unknown>,
      };
    }

    return page;
  });

  if (updated) {
    useCanvaStore.setState({ pages: updatedPages });
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: subscribeToAuthoringChanges
// ═══════════════════════════════════════════════════════════════

export function subscribeToAuthoringChanges(
  callback: (changedTemplates: TemplateId[]) => void,
): () => void {
  let previousSnapshot: Record<string, unknown> = {};

  const initialState = useAuthoringStore.getState();
  previousSnapshot = {
    meta: initialState.meta,
    cp: initialState.cp,
    tp: initialState.tp,
    atp: initialState.atp,
    alur: initialState.alur,
    skenario: initialState.skenario,
    kuis: initialState.kuis,
    modules: initialState.modules,
    games: initialState.games,
    materi: initialState.materi,
  };

  const unsubscribe = useAuthoringStore.subscribe((state) => {
    const newSnapshot: Record<string, unknown> = {
      meta: state.meta,
      cp: state.cp,
      tp: state.tp,
      atp: state.atp,
      alur: state.alur,
      skenario: state.skenario,
      kuis: state.kuis,
      modules: state.modules,
      games: state.games,
      materi: state.materi,
    };

    const diff = getAuthoringDiff(previousSnapshot, newSnapshot);
    const changedTemplates = Object.keys(diff) as TemplateId[];

    previousSnapshot = newSnapshot;

    if (changedTemplates.length > 0) {
      callback(changedTemplates);
    }
  });

  return unsubscribe;
}
