// ═══════════════════════════════════════════════════════════════
// CANVA-BRIDGE.TS — Bridge between authoring store and canva store
// Syncs authoring store changes to canva template data in real-time.
// When the user edits content in the authoring panel, this bridge
// propagates those changes into the canva store's page templateData
// so the visual preview stays up-to-date.
// ═══════════════════════════════════════════════════════════════

import { useAuthoringStore } from '@/store/authoring-store';
import { useCanvaStore } from '@/store/canva-store';
import type {
  TemplateId,
  ScreenSlotData,
  CoverSlotData,
  DokumenSlotData,
  TujuanSlotData,
  KuisSlotData,
  HasilSlotData,
  RefleksiSlotData,
  PenutupSlotData,
  SkenarioSlotData,
  MateriTabIconsSlotData,
  MateriAccordionSlotData,
  SortirGameSlotData,
  RodaGameSlotData,
  FlashcardSlotData,
  HubunganKonsepSlotData,
  DiskusiTimerSlotData,
  ReviewSlotData,
} from './engine/slot-types';
import { createDefaultSlotData } from './engine/slot-types';

// ═══════════════════════════════════════════════════════════════
// MAPPING: templateId → which authoring store fields affect it
// This drives the diff detection logic.
// ═══════════════════════════════════════════════════════════════

const TEMPLATE_AUTHORING_MAP: Record<TemplateId, string[]> = {
  cover: ['meta'],
  dokumen: ['cp', 'tp', 'atp', 'alur'],
  tujuan: ['tp'],
  review: ['modules'],
  'materi-tabicons': ['materi', 'modules'],
  'materi-accordion': ['materi', 'modules'],
  'diskusi-timer': ['atp'],
  'sortir-game': ['modules'],
  'roda-game': ['modules'],
  'hubungan-konsep': ['modules'],
  flashcard: ['modules'],
  hasil: ['kuis', 'meta'],
  refleksi: [],
  penutup: ['meta'],
  kuis: ['kuis'],
  skenario: ['skenario'],
};

// ═══════════════════════════════════════════════════════════════
// MAPPING: authoring store field → which templates it affects
// Inverse of TEMPLATE_AUTHORING_MAP for efficient diff detection.
// ═══════════════════════════════════════════════════════════════

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
// HELPER: Extract a stable JSON hash key for a value
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
// Maps authoring store data to the correct slot data type based
// on the given templateId.
// ═══════════════════════════════════════════════════════════════

export function getPageTemplateData(
  templateId: TemplateId,
  authoringData: Record<string, unknown>,
): ScreenSlotData {
  const meta = authoringData.meta as Record<string, unknown> || {};
  const cp = authoringData.cp as Record<string, unknown> || {};
  const tp = authoringData.tp as unknown[] || [];
  const atp = authoringData.atp as Record<string, unknown> || {};
  const alur = authoringData.alur as unknown[] || [];
  const skenario = authoringData.skenario as Array<Record<string, unknown>> || [];
  const kuis = authoringData.kuis as Array<Record<string, unknown>> || [];
  const modules = authoringData.modules as Array<Record<string, unknown>> || [];
  const materi = authoringData.materi as Record<string, unknown> || {};

  switch (templateId) {
    case 'cover':
      return {
        _templateId: 'cover',
        icon: (meta.ikon as string) || '📚',
        title: (meta.judulPertemuan as string) || 'Media Pembelajaran',
        subtitle: (meta.subjudul as string) || '',
        mapel: (meta.mapel as string) || '',
        kelas: (meta.kelas as string) || '',
      } as CoverSlotData;

    case 'dokumen':
      return {
        _templateId: 'dokumen',
        cp: {
          capaianFase: (cp.capaianFase as string) || '',
          profil: (cp.profil as string[]) || [],
          elemen: (cp.elemen as string) || '',
          subElemen: (cp.subElemen as string) || '',
        },
        tp: tp.map((t) => ({
          verb: (t as Record<string, unknown>).verb as string || '',
          desc: (t as Record<string, unknown>).desc as string || '',
          color: (t as Record<string, unknown>).color as string || '#f9c82e',
          pertemuan: ((t as Record<string, unknown>).pertemuan as number) || 1,
        })),
        atp: {
          namaBab: (atp.namaBab as string) || '',
          jumlahPertemuan: ((atp.jumlahPertemuan as number) || 0),
          pertemuan: ((atp.pertemuan as Array<Record<string, unknown>>) || []).map((p) => ({
            judul: (p.judul as string) || '',
            durasi: (p.durasi as string) || '',
            tp: (p.tp as string) || '',
            kegiatan: (p.kegiatan as string) || '',
            penilaian: (p.penilaian as string) || '',
          })),
        },
        alur: alur.map((a) => ({
          fase: ((a as Record<string, unknown>).fase as string) || '',
          durasi: ((a as Record<string, unknown>).durasi as string) || '',
          judul: ((a as Record<string, unknown>).judul as string) || '',
          deskripsi: ((a as Record<string, unknown>).deskripsi as string) || '',
        })),
      } as DokumenSlotData;

    case 'tujuan':
      return {
        _templateId: 'tujuan',
        title: 'Tujuan Pembelajaran',
        tpItems: tp.map((t) => ({
          verb: (t as Record<string, unknown>).verb as string || '',
          desc: (t as Record<string, unknown>).desc as string || '',
          color: (t as Record<string, unknown>).color as string || '#f9c82e',
          pertemuan: ((t as Record<string, unknown>).pertemuan as number) || 1,
        })),
      } as TujuanSlotData;

    case 'review':
      return {
        _templateId: 'review',
        title: 'Review Materi',
        questions: [],
      } as ReviewSlotData;

    case 'materi-tabicons': {
      const blok = ((materi as Record<string, unknown>).blok as Array<Record<string, unknown>>) || [];
      return {
        _templateId: 'materi-tabicons',
        title: 'Materi Pembelajaran',
        tabs: blok.map((b) => ({
          icon: (b.icon as string) || '📌',
          label: (b.judul as string) || 'Tab',
          content: (b.isi as string) || '',
        })),
      } as MateriTabIconsSlotData;
    }

    case 'materi-accordion': {
      const blok = ((materi as Record<string, unknown>).blok as Array<Record<string, unknown>>) || [];
      return {
        _templateId: 'materi-accordion',
        title: 'Materi Pembelajaran',
        sections: blok.map((b) => ({
          icon: (b.icon as string) || '📌',
          title: (b.judul as string) || 'Bagian',
          content: (b.isi as string) || '',
        })),
      } as MateriAccordionSlotData;
    }

    case 'diskusi-timer':
      return {
        _templateId: 'diskusi-timer',
        title: 'Diskusi Kelompok',
        prompt: 'Diskusikan pertanyaan berikut bersama kelompokmu!',
        duration: 10,
        questions: ['Apa yang kamu ketahui tentang topik ini?'],
      } as DiskusiTimerSlotData;

    case 'sortir-game':
      return {
        _templateId: 'sortir-game',
        title: 'Game Sortir',
        items: [],
        categories: [],
      } as SortirGameSlotData;

    case 'roda-game':
      return {
        _templateId: 'roda-game',
        title: 'Game Roda',
        segments: [],
        question: '',
      } as RodaGameSlotData;

    case 'hubungan-konsep':
      return {
        _templateId: 'hubungan-konsep',
        title: 'Hubungan Konsep',
        nodes: [],
        edges: [],
      } as HubunganKonsepSlotData;

    case 'flashcard':
      return {
        _templateId: 'flashcard',
        title: 'Flashcard',
        cards: [],
      } as FlashcardSlotData;

    case 'hasil':
      return {
        _templateId: 'hasil',
        title: 'Hasil Belajar',
        totalKuis: kuis.length,
        namaBab: (meta.namaBab as string) || '',
        score: 0,
        level: '',
      } as HasilSlotData;

    case 'refleksi':
      return {
        _templateId: 'refleksi',
        title: 'Refleksi Pembelajaran',
        prompts: [
          { question: 'Apa hal terpenting yang kamu pelajari hari ini?', placeholder: 'Tuliskan poin utama…' },
          { question: 'Seberapa baik kamu memahami materi hari ini?', placeholder: 'Nilai dirimu 1-5…' },
          { question: 'Bagaimana kamu akan menerapkan apa yang dipelajari?', placeholder: 'Rencana aksi nyata…' },
        ],
      } as RefleksiSlotData;

    case 'penutup':
      return {
        _templateId: 'penutup',
        title: 'Pembelajaran Selesai!',
        subtitle: (meta.judulPertemuan as string) || '',
        icon: '🎓',
        message: `Selamat! Kamu telah menyelesaikan pembelajaran ${(meta.namaBab as string) || 'hari ini'}.`,
        nextAction: '',
      } as PenutupSlotData;

    case 'kuis':
      return {
        _templateId: 'kuis',
        title: 'Kuis Pengetahuan',
        kuis: kuis.map((k) => ({
          q: (k as Record<string, unknown>).q as string || '',
          opts: ((k as Record<string, unknown>).opts as string[]) || ['', '', '', ''],
          ans: ((k as Record<string, unknown>).ans as number) ?? 0,
          ex: (k as Record<string, unknown>).ex as string || '',
        })),
      } as KuisSlotData;

    case 'skenario':
      return {
        _templateId: 'skenario',
        title: 'Skenario Interaktif',
        skenario: skenario.map((ch) => ({
          charEmoji: (ch.charEmoji as string) || '🧑',
          charColor: (ch.charColor as string) || '#3ecfcf',
          charPants: (ch.charPants as string) || '#2563eb',
          bg: (ch.bg as string) || 'sbg-kampung',
          title: (ch.title as string) || '',
          setup: ((ch.setup as Array<Record<string, unknown>>) || []).map((s) => ({
            speaker: (s.speaker as string) || '',
            text: (s.text as string) || '',
          })),
          choicePrompt: (ch.choicePrompt as string) || 'Apa yang akan kamu lakukan?',
          choices: ((ch.choices as Array<Record<string, unknown>>) || []).map((c) => ({
            icon: (c.icon as string) || '🤝',
            label: (c.label as string) || '',
            detail: (c.detail as string) || '',
            good: (c.good as boolean) ?? true,
            pts: (c.pts as number) ?? 10,
            level: ((c.level as string) || 'good') as 'good' | 'mid' | 'bad',
            resultTitle: (c.resultTitle as string) || '',
            resultBody: (c.resultBody as string) || '',
            norma: (c.norma as string) || '',
            consequences: ((c.consequences as Array<Record<string, unknown>>) || []).map((k) => ({
              icon: (k.icon as string) || '✅',
              text: (k.text as string) || '',
            })),
          })),
        })),
      } as SkenarioSlotData;

    default:
      return createDefaultSlotData(templateId);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: getAuthoringDiff
// Compares old and new authoring data, returns which template
// types are affected by the change.
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
// Reads current authoring store state and updates canva store's
// page templateData for all pages whose template type matches
// an affected template.
// ═══════════════════════════════════════════════════════════════

export function syncAuthoringToCanva(): void {
  const authState = useAuthoringStore.getState();
  const canvaState = useCanvaStore.getState();

  // Build the authoring data snapshot
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

  // Iterate over canva pages and update templateData
  const pages = canvaState.pages;
  let updated = false;
  const updatedPages = pages.map((page) => {
    const pageTemplateType = page.templateType as string;

    // Map canva templateType to our TemplateId
    const templateIdMap: Record<string, TemplateId> = {
      cover: 'cover',
      dokumen: 'dokumen',
      materi: 'materi-tabicons',
      kuis: 'kuis',
      game: 'sortir-game',
      hasil: 'hasil',
      skenario: 'skenario',
      hero: 'cover',
    };

    const templateId = templateIdMap[pageTemplateType];
    if (!templateId) return page;

    // Generate fresh template data from authoring state
    const newTemplateData = getPageTemplateData(templateId, authoringSnapshot);

    // Check if data actually changed
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
// Subscribes to authoring store changes and calls the callback
// with the list of affected template IDs.
// Returns an unsubscribe function.
// ═══════════════════════════════════════════════════════════════

export function subscribeToAuthoringChanges(
  callback: (changedTemplates: TemplateId[]) => void,
): () => void {
  let previousSnapshot: Record<string, unknown> = {};

  // Capture initial state
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

    // Diff old and new
    const diff = getAuthoringDiff(previousSnapshot, newSnapshot);
    const changedTemplates = Object.keys(diff) as TemplateId[];

    // Update previous snapshot
    previousSnapshot = newSnapshot;

    // Only fire callback if something actually changed
    if (changedTemplates.length > 0) {
      callback(changedTemplates);
    }
  });

  return unsubscribe;
}
