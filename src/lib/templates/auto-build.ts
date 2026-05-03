// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD.TS — Auto-build pipeline for MPI template system
// Takes authoring store data, intelligently selects appropriate
// screen templates, fills slot data, and returns an ordered
// AssemblyScreen array ready for the assembly pipeline.
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
import type { AssemblyScreen, AssemblyConfig } from './assembly';
import type { TemplateId, ScreenSlotData } from './engine/slot-types';
import { createDefaultSlotData } from './engine/slot-types';

// ═══════════════════════════════════════════════════════════════
// AUTHORING DATA INTERFACE
// Mirrors the authoring store state for use outside React/Zustand
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
}

// ═══════════════════════════════════════════════════════════════
// HELPER: screen ID generator
// ═══════════════════════════════════════════════════════════════

let screenCounter = 0;

function makeScreenId(templateId: TemplateId): string {
  screenCounter++;
  return `s-${templateId}-${screenCounter}`;
}

/** Reset the screen counter (useful before a fresh build) */
export function resetScreenCounter(): void {
  screenCounter = 0;
}

// ═══════════════════════════════════════════════════════════════
// DATA AVAILABILITY HELPERS
// ═══════════════════════════════════════════════════════════════

function hasCPData(cp: CpState): boolean {
  return !!(cp.capaianFase || cp.elemen || cp.subElemen || cp.profil.length > 0);
}

function hasTPData(tp: TpItem[]): boolean {
  return tp.length > 0;
}

function hasSkenarioData(skenario: Array<Record<string, unknown>>): boolean {
  return skenario.length > 0;
}

function hasMateriData(materi: MateriState): boolean {
  return materi.blok.length > 0;
}

function hasKuisData(kuis: KuisItem[]): boolean {
  return kuis.filter((k) => k.q.trim()).length > 0;
}

function hasModulesOfType(
  modules: Array<Record<string, unknown>>,
  types: string[],
): boolean {
  return modules.some((m) => types.includes(m.type as string));
}

function getModulesOfType(
  modules: Array<Record<string, unknown>>,
  types: string[],
): Array<Record<string, unknown>> {
  return modules.filter((m) => types.includes(m.type as string));
}

function hasDiscussionActivities(atp: AtpState): boolean {
  return atp.pertemuan.some(
    (p) =>
      p.kegiatan.toLowerCase().includes('diskusi') ||
      p.kegiatan.toLowerCase().includes('kelompok') ||
      p.kegiatan.toLowerCase().includes('berdiskusi'),
  );
}

// ═══════════════════════════════════════════════════════════════
// SLOT DATA BUILDERS
// Each function maps authoring data → specific slot data type
// ═══════════════════════════════════════════════════════════════

function buildCoverSlotData(meta: MetaState): ScreenSlotData {
  return {
    _templateId: 'cover',
    icon: meta.ikon || '📚',
    title: meta.judulPertemuan || 'Media Pembelajaran Interaktif',
    subtitle: meta.subjudul || '',
    mapel: meta.mapel || '',
    kelas: meta.kelas || '',
  };
}

function buildDokumenSlotData(
  cp: CpState,
  tp: TpItem[],
  atp: AtpState,
  alur: AlurItem[],
): ScreenSlotData {
  return {
    _templateId: 'dokumen',
    cp: {
      capaianFase: cp.capaianFase || '',
      profil: cp.profil || [],
      elemen: cp.elemen || '',
      subElemen: cp.subElemen || '',
    },
    tp: (tp || []).map((t) => ({
      verb: t.verb,
      desc: t.desc,
      color: t.color || '#f9c82e',
      pertemuan: t.pertemuan || 1,
    })),
    atp: {
      namaBab: atp.namaBab || '',
      jumlahPertemuan: atp.jumlahPertemuan || 0,
      pertemuan: (atp.pertemuan || []).map((p) => ({
        judul: p.judul,
        durasi: p.durasi,
        tp: p.tp,
        kegiatan: p.kegiatan,
        penilaian: p.penilaian,
      })),
    },
    alur: (alur || []).map((a) => ({
      fase: a.fase,
      durasi: a.durasi,
      judul: a.judul,
      deskripsi: a.deskripsi,
    })),
  };
}

function buildTujuanSlotData(tp: TpItem[]): ScreenSlotData {
  return {
    _templateId: 'tujuan',
    title: 'Tujuan Pembelajaran',
    tpItems: tp.map((t) => ({
      verb: t.verb,
      desc: t.desc,
      color: t.color || '#f9c82e',
      pertemuan: t.pertemuan || 1,
    })),
  };
}

function buildSkenarioSlotData(
  skenario: Array<Record<string, unknown>>,
): ScreenSlotData {
  const chapters = skenario.map((ch) => ({
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
  }));

  return {
    _templateId: 'skenario',
    title: 'Skenario Interaktif',
    skenario: chapters,
  };
}

function buildMateriTabIconsSlotData(
  materi: MateriState,
): ScreenSlotData {
  const tabs = materi.blok.map((b) => ({
    icon: b.icon || '📌',
    label: b.judul || 'Bagian',
    content: b.isi || b.butir?.join('\n') || '',
  }));

  return {
    _templateId: 'materi-tabicons',
    title: 'Materi Pembelajaran',
    tabs,
  };
}

function buildMateriAccordionSlotData(
  materi: MateriState,
): ScreenSlotData {
  const sections = materi.blok.map((b) => ({
    icon: b.icon || '📌',
    title: b.judul || 'Bagian',
    content: b.isi || b.butir?.join('\n') || '',
  }));

  return {
    _templateId: 'materi-accordion',
    title: 'Materi Pembelajaran',
    sections,
  };
}

function buildMateriFromModulesSlotData(
  modules: Array<Record<string, unknown>>,
  useAccordion: boolean,
): ScreenSlotData {
  // Extract materi-type modules that have tab-like structure
  const tabTypes = ['tab-icons', 'icon-explore', 'accordion', 'materi', 'infografis', 'langkah'];
  const relevantModules = getModulesOfType(modules, tabTypes);

  if (useAccordion) {
    const sections = relevantModules.map((m, i) => ({
      icon: ((m.tabs as Array<Record<string, unknown>>)?.[0]?.icon as string) || '📌',
      title: (m.title as string) || `Bagian ${i + 1}`,
      content: (m.intro as string) || ((m.tabs as Array<Record<string, unknown>>)?.[0]?.isi as string) || '',
    }));
    return {
      _templateId: 'materi-accordion',
      title: 'Materi Pembelajaran',
      sections,
    };
  }

  const tabs = relevantModules.map((m, i) => ({
    icon: ((m.tabs as Array<Record<string, unknown>>)?.[0]?.icon as string) || '📌',
    label: (m.title as string) || `Tab ${i + 1}`,
    content: (m.intro as string) || ((m.tabs as Array<Record<string, unknown>>)?.[0]?.isi as string) || '',
  }));
  return {
    _templateId: 'materi-tabicons',
    title: 'Materi Pembelajaran',
    tabs,
  };
}

function buildHubunganKonsepSlotData(
  modules: Array<Record<string, unknown>>,
): ScreenSlotData {
  // Find comparison or icon-explore modules that define relationships
  const comparisonMods = getModulesOfType(modules, ['comparison', 'icon-explore']);

  const nodes: Array<{ id: string; label: string; color: string }> = [];
  const edges: Array<{ from: string; to: string; label: string }> = [];

  // Extract nodes from comparison columns and icon-explore items
  comparisonMods.forEach((m, modIdx) => {
    const type = m.type as string;
    if (type === 'comparison') {
      const kolom = (m.kolom as Array<Record<string, unknown>>) || [];
      kolom.forEach((k, kIdx) => {
        const nodeId = `n${modIdx}-${kIdx}`;
        nodes.push({
          id: nodeId,
          label: (k.judul as string) || `Konsep ${nodes.length + 1}`,
          color: (k.warna as string) || '#3ecfcf',
        });
      });
      // Add edges between all columns in this comparison
      if (kolom.length >= 2) {
        for (let i = 0; i < kolom.length - 1; i++) {
          edges.push({
            from: `n${modIdx}-${i}`,
            to: `n${modIdx}-${i + 1}`,
            label: 'berkaitan',
          });
        }
      }
    } else if (type === 'icon-explore') {
      const items = (m.items as Array<Record<string, unknown>>) || [];
      items.forEach((it, iIdx) => {
        const nodeId = `ne${modIdx}-${iIdx}`;
        nodes.push({
          id: nodeId,
          label: (it.judul as string) || `Konsep ${nodes.length + 1}`,
          color: (it.warna as string) || '#6366f1',
        });
      });
      // Connect items sequentially
      if (items.length >= 2) {
        for (let i = 0; i < items.length - 1; i++) {
          edges.push({
            from: `ne${modIdx}-${i}`,
            to: `ne${modIdx}-${i + 1}`,
            label: 'terkait',
          });
        }
      }
    }
  });

  return {
    _templateId: 'hubungan-konsep',
    title: 'Hubungan Konsep',
    nodes,
    edges,
  };
}

function buildFlashcardSlotData(
  modules: Array<Record<string, unknown>>,
): ScreenSlotData {
  const flashcardMods = getModulesOfType(modules, ['flashcard']);
  const cards: Array<{ front: string; back: string; icon: string }> = [];

  flashcardMods.forEach((m) => {
    const kartu = (m.kartu as Array<Record<string, unknown>>) || [];
    kartu.forEach((k) => {
      cards.push({
        front: (k.depan as string) || '',
        back: (k.belakang as string) || '',
        icon: (k.icon as string) || '🃏',
      });
    });
  });

  return {
    _templateId: 'flashcard',
    title: 'Flashcard',
    cards,
  };
}

function buildKuisSlotData(kuis: KuisItem[]): ScreenSlotData {
  return {
    _templateId: 'kuis',
    title: 'Kuis Pengetahuan',
    kuis: kuis
      .filter((k) => k.q.trim())
      .map((k) => ({
        q: k.q,
        opts: k.opts || ['', '', '', ''],
        ans: k.ans,
        ex: k.ex || '',
      })),
  };
}

function buildSortirGameSlotData(
  modules: Array<Record<string, unknown>>,
): ScreenSlotData {
  const sortingMods = getModulesOfType(modules, ['sorting']);
  const items: Array<{ text: string; category: string }> = [];
  const categories: Array<{ name: string; color: string }> = [];

  sortingMods.forEach((m) => {
    const kategori = (m.kategori as Array<Record<string, unknown>>) || [];
    const sortingItems = (m.items as Array<Record<string, unknown>>) || [];

    kategori.forEach((kat) => {
      const name = (kat.label as string) || '';
      const color = (kat.color as string) || '#3ecfcf';
      categories.push({ name, color });
    });

    sortingItems.forEach((it) => {
      items.push({
        text: (it.teks as string) || '',
        category: (it.kategori as string) || '',
      });
    });
  });

  return {
    _templateId: 'sortir-game',
    title: 'Game Sortir',
    items,
    categories,
  };
}

function buildRodaGameSlotData(
  modules: Array<Record<string, unknown>>,
): ScreenSlotData {
  const rodaMods = getModulesOfType(modules, ['roda', 'spinwheel']);
  const segments: Array<{ label: string; color: string }> = [];

  rodaMods.forEach((m) => {
    const opsi = (m.opsi as Array<Record<string, unknown>>) || (m.soal as Array<Record<string, unknown>>) || [];
    const colors = ['#3ecfcf', '#f9c82e', '#a78bfa', '#34d399', '#ff6b6b', '#fb923c'];
    opsi.forEach((o, i) => {
      segments.push({
        label: (o.teks as string) || (o.label as string) || `Segmen ${i + 1}`,
        color: (o.warna as string) || colors[i % colors.length],
      });
    });
  });

  return {
    _templateId: 'roda-game',
    title: 'Game Roda',
    segments,
    question: 'Jawab pertanyaan dari roda!',
  };
}

function buildDiskusiTimerSlotData(atp: AtpState): ScreenSlotData {
  // Extract discussion questions from ATP activities
  const questions: string[] = [];
  atp.pertemuan.forEach((p) => {
    if (
      p.kegiatan.toLowerCase().includes('diskusi') ||
      p.kegiatan.toLowerCase().includes('kelompok')
    ) {
      // Extract potential discussion prompts from the activity description
      const sentences = p.kegiatan.split(/[.!?]+/).filter((s) => s.trim());
      sentences.forEach((s) => {
        const trimmed = s.trim();
        if (trimmed.length > 10 && trimmed.includes('?')) {
          questions.push(trimmed);
        }
      });
      if (questions.length === 0) {
        questions.push(`Diskusikan: ${p.judul}`);
      }
    }
  });

  return {
    _templateId: 'diskusi-timer',
    title: 'Diskusi Kelompok',
    prompt: 'Diskusikan pertanyaan berikut bersama kelompokmu!',
    duration: 10,
    questions: questions.length > 0 ? questions : ['Apa yang kamu ketahui tentang topik ini?'],
  };
}

function buildHasilSlotData(meta: MetaState, kuis: KuisItem[]): ScreenSlotData {
  const totalKuis = kuis.filter((k) => k.q.trim()).length;
  return {
    _templateId: 'hasil',
    title: 'Hasil Belajar',
    totalKuis,
    namaBab: meta.namaBab || '',
    score: 0, // Will be filled dynamically by JS
    level: '',
  };
}

function buildRefleksiSlotData(): ScreenSlotData {
  return {
    _templateId: 'refleksi',
    title: 'Refleksi Pembelajaran',
    prompts: [
      {
        question: 'Apa hal terpenting yang kamu pelajari hari ini?',
        placeholder: 'Tuliskan poin utama yang kamu ingat…',
      },
      {
        question: 'Seberapa baik kamu memahami materi hari ini?',
        placeholder: 'Nilai dirimu: 1 (kurang) sampai 5 (sangat paham)…',
      },
      {
        question: 'Bagaimana kamu akan menerapkan apa yang dipelajari?',
        placeholder: 'Tuliskan rencana aksi nyata…',
      },
    ],
  };
}

function buildPenutupSlotData(meta: MetaState): ScreenSlotData {
  return {
    _templateId: 'penutup',
    title: 'Pembelajaran Selesai!',
    subtitle: meta.judulPertemuan || '',
    icon: '🎓',
    message: `Selamat! Kamu telah menyelesaikan pembelajaran ${meta.namaBab || 'hari ini'}. Terus semangat belajar!`,
    nextAction: '',
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: autoBuildScreens
// ═══════════════════════════════════════════════════════════════

/**
 * Auto-build an ordered array of AssemblyScreen objects from
 * authoring store data. Intelligently selects templates based
 * on which data is available and fills slot data accordingly.
 *
 * Screen sequence (conditional on data availability):
 *  1. cover — always (from meta)
 *  2. dokumen — if CP or TP data exists
 *  3. tujuan — if TP data exists (standalone, optional)
 *  4. skenario — if skenario data exists
 *  5. materi-tabicons OR materi-accordion — if materi bloks or modules exist
 *  6. hubungan-konsep — if modules define relationships
 *  7. flashcard — if flashcard modules exist
 *  8. kuis — if kuis data exists
 *  9. sortir-game — if sorting game modules exist
 * 10. roda-game — if roda/spinwheel game modules exist
 * 11. diskusi-timer — if ATP has discussion activities
 * 12. hasil — always
 * 13. refleksi — always
 * 14. penutup — always
 *
 * @param authoringData - Complete authoring store state
 * @returns Ordered array of AssemblyScreen objects
 */
export function autoBuildScreens(authoringData: AuthoringData): AssemblyScreen[] {
  resetScreenCounter();
  const screens: AssemblyScreen[] = [];
  const { meta, cp, tp, atp, alur, skenario, kuis, modules, games, materi } = authoringData;

  const hasCP = hasCPData(cp);
  const hasTP = hasTPData(tp);
  const hasSk = hasSkenarioData(skenario);
  const hasMat = hasMateriData(materi);
  const hasKu = hasKuisData(kuis);
  const hasMods = modules.length > 0;

  // Determine materi template variant
  const hasMateriModules = hasModulesOfType(modules, [
    'tab-icons', 'icon-explore', 'accordion', 'materi', 'infografis', 'langkah',
  ]);
  const materiSectionCount = materi.blok.length + getModulesOfType(modules, [
    'tab-icons', 'icon-explore', 'accordion', 'materi', 'infografis', 'langkah',
  ]).length;
  const useAccordion = materiSectionCount > 3;

  // 1. Cover — always
  screens.push({
    id: makeScreenId('cover'),
    templateId: 'cover',
    data: buildCoverSlotData(meta),
  });

  // 2. Dokumen — if CP or TP data exists
  if (hasCP || hasTP) {
    screens.push({
      id: makeScreenId('dokumen'),
      templateId: 'dokumen',
      data: buildDokumenSlotData(cp, tp, atp, alur),
    });
  }

  // 3. Tujuan — if TP data exists (standalone TP page, optional)
  if (hasTP && !hasCP) {
    // Only add standalone tujuan if there's no dokumen page covering it
    screens.push({
      id: makeScreenId('tujuan'),
      templateId: 'tujuan',
      data: buildTujuanSlotData(tp),
    });
  }

  // 4. Skenario — if skenario data exists
  if (hasSk) {
    screens.push({
      id: makeScreenId('skenario'),
      templateId: 'skenario',
      data: buildSkenarioSlotData(skenario),
    });
  }

  // 5. Materi (tabicons or accordion) — if materi bloks or modules exist
  if (hasMat || hasMateriModules) {
    if (hasMat && !hasMateriModules) {
      // Use materi blok data directly
      screens.push({
        id: makeScreenId(useAccordion ? 'materi-accordion' : 'materi-tabicons'),
        templateId: useAccordion ? 'materi-accordion' : 'materi-tabicons',
        data: useAccordion
          ? buildMateriAccordionSlotData(materi)
          : buildMateriTabIconsSlotData(materi),
      });
    } else if (hasMateriModules) {
      // Use module data
      screens.push({
        id: makeScreenId(useAccordion ? 'materi-accordion' : 'materi-tabicons'),
        templateId: useAccordion ? 'materi-accordion' : 'materi-tabicons',
        data: buildMateriFromModulesSlotData(modules, useAccordion),
      });
    }
  }

  // 6. Hubungan Konsep — if modules define relationships
  if (hasModulesOfType(modules, ['comparison', 'icon-explore'])) {
    const konsepData = buildHubunganKonsepSlotData(modules);
    const konsepSlotData = konsepData as import('./engine/slot-types').HubunganKonsepSlotData;
    if (konsepSlotData.nodes.length > 0) {
      screens.push({
        id: makeScreenId('hubungan-konsep'),
        templateId: 'hubungan-konsep',
        data: konsepData,
      });
    }
  }

  // 7. Flashcard — if flashcard modules exist
  if (hasModulesOfType(modules, ['flashcard'])) {
    screens.push({
      id: makeScreenId('flashcard'),
      templateId: 'flashcard',
      data: buildFlashcardSlotData(modules),
    });
  }

  // 8. Kuis — if kuis data exists
  if (hasKu) {
    screens.push({
      id: makeScreenId('kuis'),
      templateId: 'kuis',
      data: buildKuisSlotData(kuis),
    });
  }

  // 9. Sortir Game — if sorting game modules exist
  if (hasModulesOfType(modules, ['sorting'])) {
    const sortirData = buildSortirGameSlotData(modules);
    const sortirSlotData = sortirData as import('./engine/slot-types').SortirGameSlotData;
    if (sortirSlotData.items.length > 0 && sortirSlotData.categories.length > 0) {
      screens.push({
        id: makeScreenId('sortir-game'),
        templateId: 'sortir-game',
        data: sortirData,
      });
    }
  }

  // 10. Roda Game — if roda/spinwheel game modules exist
  if (hasModulesOfType(modules, ['roda', 'spinwheel'])) {
    const rodaData = buildRodaGameSlotData(modules);
    const rodaSlotData = rodaData as import('./engine/slot-types').RodaGameSlotData;
    if (rodaSlotData.segments.length > 0) {
      screens.push({
        id: makeScreenId('roda-game'),
        templateId: 'roda-game',
        data: rodaData,
      });
    }
  }

  // 11. Diskusi + Timer — if ATP has discussion activities
  if (hasDiscussionActivities(atp)) {
    screens.push({
      id: makeScreenId('diskusi-timer'),
      templateId: 'diskusi-timer',
      data: buildDiskusiTimerSlotData(atp),
    });
  }

  // 12. Hasil — always
  screens.push({
    id: makeScreenId('hasil'),
    templateId: 'hasil',
    data: buildHasilSlotData(meta, kuis),
  });

  // 13. Refleksi — always
  screens.push({
    id: makeScreenId('refleksi'),
    templateId: 'refleksi',
    data: buildRefleksiSlotData(),
  });

  // 14. Penutup — always
  screens.push({
    id: makeScreenId('penutup'),
    templateId: 'penutup',
    data: buildPenutupSlotData(meta),
  });

  return screens;
}

// ═══════════════════════════════════════════════════════════════
// HELPER EXPORT: autoBuildConfig
// ═══════════════════════════════════════════════════════════════

/**
 * Build a complete AssemblyConfig from authoring data.
 * Wraps autoBuildScreens into a full config with the title
 * derived from the meta state.
 *
 * @param authoringData - Complete authoring store state
 * @returns AssemblyConfig ready for assembleHTML()
 */
export function autoBuildConfig(authoringData: AuthoringData): AssemblyConfig {
  const screens = autoBuildScreens(authoringData);
  const title = authoringData.meta.judulPertemuan ||
    authoringData.meta.namaBab ||
    'Media Pembelajaran Interaktif';

  return {
    title,
    screens,
    includeConfetti: true,
  };
}
