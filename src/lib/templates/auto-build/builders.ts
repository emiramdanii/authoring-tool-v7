// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD SLOT DATA BUILDERS
// Generates COMPLETE page data for each template type.
// Every builder produces rich, preset-quality slot data with
// all sub-components filled from authoring content.
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
import type { ScreenSlotData } from '../engine/slot-types';
import type {
  DefBoxItem,
  CardGridItem,
  DiskusiKelompokBanner,
  DiskusiBoxData,
} from '../engine/slot-types';
import {
  getModulesOfType,
  getAccentTPColor,
  type ContentAnalysis,
} from './helpers';

// ═══════════════════════════════════════════════════════════════
// COVER
// ═══════════════════════════════════════════════════════════════

export function buildCoverSlotData(meta: MetaState, accentVar: string, pertemuanKe: number): ScreenSlotData {
  const chips: Array<{icon: string; label: string}> = [];
  if (meta.kelas) chips.push({ icon: '🏫', label: meta.kelas });
  if (meta.mapel) chips.push({ icon: '📚', label: meta.mapel });
  if (meta.durasi) chips.push({ icon: '⏱️', label: `${meta.durasi} Menit` });
  if (meta.kurikulum) chips.push({ icon: '🎯', label: `Fase ${meta.kurikulum}` });

  return {
    _templateId: 'cover',
    icon: meta.ikon || '📚',
    title: meta.judulPertemuan || 'Media Pembelajaran Interaktif',
    subtitle: meta.subjudul || '',
    mapel: meta.mapel || '',
    kelas: meta.kelas || '',
    pertemuan: pertemuanKe ? `Pertemuan ${pertemuanKe}` : '',
    bab: meta.namaBab || '',
    durasi: meta.durasi || '',
    fase: meta.kurikulum || '',
    chips: chips.length > 0 ? chips : undefined,
    ctaText: 'Mulai Pembelajaran',
    accentVar,
  };
}

// ═══════════════════════════════════════════════════════════════
// DOKUMEN (CP / TP / ATP)
// ═══════════════════════════════════════════════════════════════

export function buildDokumenSlotData(
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

// ═══════════════════════════════════════════════════════════════
// TUJUAN — FIX: proper operator precedence for color fallback
// ═══════════════════════════════════════════════════════════════

export function buildTujuanSlotData(tp: TpItem[], accentVar: string): ScreenSlotData {
  const accentColor = getAccentTPColor(accentVar);
  return {
    _templateId: 'tujuan',
    title: 'Tujuan Pembelajaran',
    tpItems: tp.map((t) => ({
      verb: t.verb,
      desc: t.desc,
      color: t.color || accentColor,
      pertemuan: t.pertemuan || 1,
    })),
  };
}

// ═══════════════════════════════════════════════════════════════
// SKENARIO
// ═══════════════════════════════════════════════════════════════

export function buildSkenarioSlotData(
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

// ═══════════════════════════════════════════════════════════════
// SHARED: Diskusi Kelompok Banner builder
// ═══════════════════════════════════════════════════════════════

function buildDiskusiKelompokBanner(
  accentVar: string,
  label: string,
  judul: string,
  isi: string,
): DiskusiKelompokBanner[] {
  return [{
    tipe: accentVar === '--c' ? 2 : 1,
    ikon: '👥',
    label,
    judul,
    isi,
  }];
}

function buildDiskusiBox(
  prompt: string,
  accentVar: string,
  saveKey = 'd1',
  saveLabel = 'Diskusi Materi',
): DiskusiBoxData {
  return {
    prompt,
    placeholder: 'Tuliskan pendapatmu di sini… (jawabanmu akan tampil lagi di Refleksi)',
    textareaId: 'diskusiAns',
    saveKey,
    saveLabel,
    accentVar,
  };
}

// ═══════════════════════════════════════════════════════════════
// MATERI-TABICONS
// ═══════════════════════════════════════════════════════════════

export function buildMateriTabIconsSlotData(
  materi: MateriState,
  contentAnalysis: ContentAnalysis,
  accentVar: string,
): ScreenSlotData {
  const tabs = materi.blok.map((b) => ({
    icon: b.icon || '📌',
    label: b.judul || 'Bagian',
    content: b.isi || b.butir?.join('\n') || '',
  }));

  const diskusiKelompok = buildDiskusiKelompokBanner(
    accentVar,
    'Aktivitas Kelompok · ±10 Menit',
    'Eksplorasi Materi Bersama!',
    'Diskusikan pertanyaan di bawah bersama kelompokmu. Tuliskan jawaban — akan tersimpan sebagai portofolio.',
  );

  const diskusiBox = buildDiskusiBox(
    `Berdasarkan materi "${materi.blok[0]?.judul || 'ini'}", tuliskan poin terpenting yang kamu pahami!`,
    accentVar,
  );

  return {
    _templateId: 'materi-tabicons',
    title: 'Materi Pembelajaran',
    tabs,
    readTracking: true,
    defBoxes: contentAnalysis.defBoxes.length > 0 ? contentAnalysis.defBoxes : undefined,
    cardGrid: contentAnalysis.cardGrid.length > 0 ? contentAnalysis.cardGrid : undefined,
    diskusiKelompok,
    normaTabs: contentAnalysis.useNormaMode ? contentAnalysis.normaTabs : undefined,
    tabelAccordion: contentAnalysis.useNormaMode && contentAnalysis.tabelAccordion.length > 0 ? contentAnalysis.tabelAccordion : undefined,
    diskusiBox,
  };
}

// ═══════════════════════════════════════════════════════════════
// MATERI-ACCORDION — FIX: add estimatedMinutes, titleHighlight
// ═══════════════════════════════════════════════════════════════

export function buildMateriAccordionSlotData(
  materi: MateriState,
  contentAnalysis: ContentAnalysis,
  accentVar: string,
): ScreenSlotData {
  // FIX: Build sections with enriched data — titleHighlight & steps from butir
  const sections = materi.blok.map((b) => {
    const section: Record<string, unknown> = {
      icon: b.icon || '📌',
      title: b.judul || 'Bagian',
      content: b.isi || '',
    };

    // If blok has butir (bullet points), create step-by-step list
    if (b.butir && b.butir.length > 0) {
      section.steps = b.butir.map((point, i) => ({
        emoji: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'][i] || '📌',
        text: point,
      }));
    }

    return section;
  });

  // FIX: Estimate reading time based on content length
  const totalChars = materi.blok.reduce((sum, b) => sum + (b.isi?.length || 0) + (b.butir?.join('').length || 0), 0);
  const estimatedMinutes = Math.max(5, Math.min(30, Math.ceil(totalChars / 800)));

  const diskusiKelompok = buildDiskusiKelompokBanner(
    accentVar,
    'Aktivitas Kelompok · ±10 Menit',
    'Eksplorasi Materi Bersama!',
    'Diskusikan pertanyaan di bawah bersama kelompokmu. Tuliskan jawaban — akan tersimpan sebagai portofolio.',
  );

  const diskusiBox = buildDiskusiBox(
    `Berdasarkan materi "${materi.blok[0]?.judul || 'ini'}", tuliskan poin terpenting yang kamu pahami!`,
    accentVar,
  );

  return {
    _templateId: 'materi-accordion',
    title: 'Materi Pembelajaran',
    estimatedMinutes,
    sections: sections as any[],
    defBoxes: contentAnalysis.defBoxes.length > 0 ? contentAnalysis.defBoxes : undefined,
    cardGrid: contentAnalysis.cardGrid.length > 0 ? contentAnalysis.cardGrid : undefined,
    diskusiKelompok,
    diskusiBox,
  };
}

// ═══════════════════════════════════════════════════════════════
// MATERI FROM MODULES — enriched content extraction
// ═══════════════════════════════════════════════════════════════

export function buildMateriFromModulesSlotData(
  modules: Array<Record<string, unknown>>,
  contentAnalysis: ContentAnalysis,
  useAccordion: boolean,
  accentVar: string,
): ScreenSlotData {
  const tabTypes = ['tab-icons', 'icon-explore', 'accordion', 'materi', 'infografis', 'langkah'];
  const relevantModules = getModulesOfType(modules, tabTypes);

  const tabs: Array<{icon: string; label: string; content: string}> = [];
  const sections: Array<{icon: string; title: string; content: string; titleHighlight?: string; steps?: Array<{emoji: string; text: string}>}> = [];

  for (const m of relevantModules) {
    const type = m.type as string;

    if (type === 'tab-icons') {
      const moduleTabs = (m.tabs as Array<Record<string, unknown>>) || [];
      for (const tab of moduleTabs) {
        const content = (tab.isi as string) || '';
        tabs.push({
          icon: (tab.icon as string) || '📌',
          label: (tab.judul as string) || (tab.label as string) || '',
          content,
        });
        sections.push({
          icon: (tab.icon as string) || '📌',
          title: (tab.judul as string) || (tab.label as string) || '',
          content,
        });
      }
    } else if (type === 'icon-explore') {
      const items = (m.items as Array<Record<string, unknown>>) || [];
      for (const item of items) {
        // FIX: Build richer content with structured sections instead of flat join
        const parts: string[] = [];
        if (item.ringkasan) parts.push(item.ringkasan as string);
        if (item.isi) parts.push(item.isi as string);

        tabs.push({
          icon: (item.icon as string) || '🔍',
          label: (item.judul as string) || '',
          content: parts.join('\n\n'),
        });
        sections.push({
          icon: (item.icon as string) || '🔍',
          title: (item.judul as string) || '',
          content: parts.join('\n\n'),
          titleHighlight: (item.sifat as string) || undefined,
        });
      }
    } else if (type === 'accordion') {
      const accItems = (m.items as Array<Record<string, unknown>>) || [];
      for (const item of accItems) {
        sections.push({
          icon: (item.icon as string) || '📂',
          title: (item.judul as string) || '',
          content: (item.isi as string) || '',
        });
        tabs.push({
          icon: (item.icon as string) || '📂',
          label: (item.judul as string) || '',
          content: (item.isi as string) || '',
        });
      }
    } else if (type === 'langkah') {
      const steps = (m.steps as Array<Record<string, unknown>>) || [];
      const stepContent = steps.map((s, i) => `${i + 1}. ${(s.judul as string) || ''}: ${(s.isi as string) || ''}`).join('\n');
      const firstStepIcon = steps.length > 0 ? ((steps[0] as Record<string, unknown>).icon as string) || '📌' : '📌';
      const langkahSteps = steps.map((s, i) => ({
        emoji: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'][i] || '📌',
        text: `${(s.judul as string) || ''}: ${(s.isi as string) || ''}`,
      }));

      tabs.push({
        icon: firstStepIcon,
        label: (m.title as string) || 'Langkah',
        content: (m.intro as string) ? `${m.intro as string}\n\n${stepContent}` : stepContent,
      });
      sections.push({
        icon: firstStepIcon,
        title: (m.title as string) || 'Langkah',
        content: (m.intro as string) || '',
        steps: langkahSteps.length > 0 ? langkahSteps : undefined,
      });
    } else if (type === 'infografis') {
      tabs.push({
        icon: '📊',
        label: (m.title as string) || 'Infografis',
        content: (m.intro as string) || '',
      });
      sections.push({
        icon: '📊',
        title: (m.title as string) || 'Infografis',
        content: (m.intro as string) || '',
      });
    } else {
      tabs.push({
        icon: '📌',
        label: (m.title as string) || 'Materi',
        content: (m.intro as string) || '',
      });
      sections.push({
        icon: '📌',
        title: (m.title as string) || 'Materi',
        content: (m.intro as string) || '',
      });
    }
  }

  const diskusiKelompok = buildDiskusiKelompokBanner(
    accentVar,
    'Aktivitas Kelompok · ±10 Menit',
    'Eksplorasi Materi Bersama!',
    'Diskusikan pertanyaan di bawah bersama kelompokmu. Tuliskan jawaban — akan tersimpan sebagai portofolio.',
  );

  const diskusiBox = buildDiskusiBox(
    'Tuliskan poin terpenting yang kamu pahami dari materi ini!',
    accentVar,
  );

  // FIX: Calculate estimated minutes for accordion
  const totalChars = sections.reduce((sum, s) => sum + (s.content?.length || 0), 0);
  const estimatedMinutes = Math.max(5, Math.min(30, Math.ceil(totalChars / 800)));

  if (useAccordion) {
    return {
      _templateId: 'materi-accordion',
      title: 'Materi Pembelajaran',
      estimatedMinutes,
      sections: sections as any[],
      defBoxes: contentAnalysis.defBoxes.length > 0 ? contentAnalysis.defBoxes : undefined,
      cardGrid: contentAnalysis.cardGrid.length > 0 ? contentAnalysis.cardGrid : undefined,
      diskusiKelompok,
      diskusiBox,
    };
  }

  return {
    _templateId: 'materi-tabicons',
    title: 'Materi Pembelajaran',
    tabs,
    readTracking: true,
    defBoxes: contentAnalysis.defBoxes.length > 0 ? contentAnalysis.defBoxes : undefined,
    cardGrid: contentAnalysis.cardGrid.length > 0 ? contentAnalysis.cardGrid : undefined,
    diskusiKelompok,
    normaTabs: contentAnalysis.useNormaMode ? contentAnalysis.normaTabs : undefined,
    tabelAccordion: contentAnalysis.useNormaMode && contentAnalysis.tabelAccordion.length > 0 ? contentAnalysis.tabelAccordion : undefined,
    diskusiBox,
  };
}

// ═══════════════════════════════════════════════════════════════
// HUBUNGAN KONSEP
// ═══════════════════════════════════════════════════════════════

export function buildHubunganKonsepSlotData(
  modules: Array<Record<string, unknown>>,
): ScreenSlotData {
  const comparisonMods = getModulesOfType(modules, ['comparison', 'icon-explore']);

  const nodes: Array<{ id: string; label: string; color: string }> = [];
  const edges: Array<{ from: string; to: string; label: string }> = [];

  comparisonMods.forEach((m, modIdx) => {
    const type = m.type as string;
    if (type === 'comparison') {
      const kolom = (m.kolom as Array<Record<string, unknown>>) || [];
      kolom.forEach((k, kIdx) => {
        nodes.push({
          id: `n${modIdx}-${kIdx}`,
          label: (k.judul as string) || `Konsep ${nodes.length + 1}`,
          color: (k.warna as string) || '#3ecfcf',
        });
      });
      if (kolom.length >= 2) {
        for (let i = 0; i < kolom.length - 1; i++) {
          edges.push({ from: `n${modIdx}-${i}`, to: `n${modIdx}-${i + 1}`, label: 'berkaitan' });
        }
      }
    } else if (type === 'icon-explore') {
      const items = (m.items as Array<Record<string, unknown>>) || [];
      items.forEach((it, iIdx) => {
        nodes.push({
          id: `ne${modIdx}-${iIdx}`,
          label: (it.judul as string) || `Konsep ${nodes.length + 1}`,
          color: (it.warna as string) || '#6366f1',
        });
      });
      if (items.length >= 2) {
        for (let i = 0; i < items.length - 1; i++) {
          edges.push({ from: `ne${modIdx}-${i}`, to: `ne${modIdx}-${i + 1}`, label: 'terkait' });
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

// ═══════════════════════════════════════════════════════════════
// FLASHCARD
// ═══════════════════════════════════════════════════════════════

export function buildFlashcardSlotData(
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

// ═══════════════════════════════════════════════════════════════
// HOTSPOT IMAGE
// ═══════════════════════════════════════════════════════════════

export function buildHotspotSlotData(
  modules: Array<Record<string, unknown>>,
): ScreenSlotData {
  const hotspotMods = getModulesOfType(modules, ['hotspot-image']);
  const allHotspots: Array<{x: number; y: number; icon: string; judul: string; warna: string; isi: string}> = [];
  let title = 'Jelajahi Gambar';
  let intro = '';
  let imageUrl = '';
  let height = 300;
  let mode: 'tooltip' | 'dialog' = 'tooltip';
  let animation: 'fade' | 'scale' | 'slide' = 'fade';

  for (const m of hotspotMods) {
    if (!title || title === 'Jelajahi Gambar') title = (m.title as string) || title;
    if (!intro) intro = (m.intro as string) || '';
    if (!imageUrl) imageUrl = (m.imageUrl as string) || '';
    height = (m.height as number) || height;
    if ((m.mode as string) === 'dialog') mode = 'dialog';
    const mAnim = (m.animation as string);
    if (mAnim === 'scale' || mAnim === 'slide') animation = mAnim as 'scale' | 'slide';

    const hotspots = ((m.hotspots as Array<Record<string, unknown>>) || []).map((h) => ({
      x: (h.x as number) || 50,
      y: (h.y as number) || 50,
      icon: (h.icon as string) || '📌',
      judul: (h.judul as string) || '',
      warna: (h.warna as string) || '#f9c82e',
      isi: (h.isi as string) || (h.text as string) || '',
    }));
    allHotspots.push(...hotspots);
  }

  return {
    _templateId: 'hotspot',
    title,
    intro,
    imageUrl,
    height,
    mode,
    animation,
    hotspots: allHotspots,
  };
}

// ═══════════════════════════════════════════════════════════════
// KUIS
// ═══════════════════════════════════════════════════════════════

export function buildKuisSlotData(kuis: KuisItem[], _accentVar: string): ScreenSlotData {
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

// ═══════════════════════════════════════════════════════════════
// SORTIR GAME
// ═══════════════════════════════════════════════════════════════

export function buildSortirGameSlotData(
  modules: Array<Record<string, unknown>>,
): ScreenSlotData {
  const sortingMods = getModulesOfType(modules, ['sorting']);
  const items: Array<{ text: string; category: string }> = [];
  const categories: Array<{ name: string; color: string }> = [];

  sortingMods.forEach((m) => {
    const kategori = (m.kategori as Array<Record<string, unknown>>) || [];
    const sortingItems = (m.items as Array<Record<string, unknown>>) || [];

    kategori.forEach((kat) => {
      categories.push({
        name: (kat.label as string) || '',
        color: (kat.color as string) || '#3ecfcf',
      });
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
    title: (sortingMods[0]?.title as string) || 'Game Sortir',
    items,
    categories,
    diskusiHint: (sortingMods[0]?.instruksi as string) || '',
  };
}

// ═══════════════════════════════════════════════════════════════
// RODA GAME
// ═══════════════════════════════════════════════════════════════

export function buildRodaGameSlotData(
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
    title: (rodaMods[0]?.title as string) || 'Game Roda',
    segments,
    question: (rodaMods[0]?.instruksi as string) || 'Jawab pertanyaan dari roda!',
  };
}

// ═══════════════════════════════════════════════════════════════
// DISKUSI TIMER
// ═══════════════════════════════════════════════════════════════

export function buildDiskusiTimerSlotData(
  atp: AtpState,
  meta: MetaState,
  accentVar: string,
): ScreenSlotData {
  const questions: string[] = [];
  atp.pertemuan.forEach((p) => {
    if (
      p.kegiatan.toLowerCase().includes('diskusi') ||
      p.kegiatan.toLowerCase().includes('kelompok')
    ) {
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

  const diskusiKelompok = buildDiskusiKelompokBanner(
    accentVar,
    'Diskusi Kelompok · ±10 Menit',
    'Bahas Bersama Kelompokmu!',
    'Diskusikan pertanyaan berikut bersama anggota kelompok. Tuliskan jawaban kelompokmu — jawaban akan tersimpan sebagai portofolio.',
  );

  const diskusiBox = buildDiskusiBox(
    questions[0] || 'Apa yang kamu ketahui tentang topik ini?',
    accentVar,
    'd1',
    'Diskusi Kelompok',
  );

  return {
    _templateId: 'diskusi-timer',
    title: 'Diskusi Kelompok',
    prompt: 'Diskusikan pertanyaan berikut bersama kelompokmu!',
    duration: 10,
    questions: questions.length > 0 ? questions : ['Apa yang kamu ketahui tentang topik ini?'],
    diskusiKelompok,
    diskusiBox,
  };
}

// ═══════════════════════════════════════════════════════════════
// HASIL
// ═══════════════════════════════════════════════════════════════

export function buildHasilSlotData(meta: MetaState, kuis: KuisItem[]): ScreenSlotData {
  const totalKuis = kuis.filter((k) => k.q.trim()).length;
  return {
    _templateId: 'hasil',
    title: 'Hasil Belajar',
    totalKuis,
    namaBab: meta.namaBab || '',
    score: 0,
    level: '',
  };
}

// ═══════════════════════════════════════════════════════════════
// REFLEKSI — FIX: use context-aware prompts
// ═══════════════════════════════════════════════════════════════

export function buildRefleksiSlotData(
  accentVar: string,
  meta: MetaState,
  materi: MateriState,
): ScreenSlotData {
  // FIX: Generate context-aware reflection prompts from actual materi content
  const materiTitle = materi.blok[0]?.judul || meta.judulPertemuan || 'pembelajaran hari ini';

  return {
    _templateId: 'refleksi',
    title: 'Refleksi Pembelajaran',
    prompts: [
      {
        question: `Apa hal terpenting yang kamu pelajari tentang ${materiTitle}?`,
        placeholder: 'Tuliskan poin utama yang kamu ingat…',
      },
      {
        question: 'Seberapa baik kamu memahami materi hari ini?',
        placeholder: 'Nilai dirimu: 1 (kurang) sampai 5 (sangat paham)…',
      },
      {
        question: `Bagaimana kamu akan menerapkan ${materiTitle} dalam kehidupan sehari-hari?`,
        placeholder: 'Tuliskan rencana aksi nyata…',
      },
    ],
    useLocalStorage: true,
  };
}

// ═══════════════════════════════════════════════════════════════
// PENUTUP
// ═══════════════════════════════════════════════════════════════

export function buildPenutupSlotData(
  meta: MetaState,
  atp: AtpState,
  accentVar: string,
  pertemuanKe: number | undefined,
): ScreenSlotData {
  let nextPreview: import('../engine/slot-types').PenutupNextPreview | undefined = undefined;
  if (pertemuanKe && atp.pertemuan.length > pertemuanKe) {
    const nextP = atp.pertemuan[pertemuanKe];
    if (nextP) {
      const topics = nextP.kegiatan
        .split(/[→\-\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 3 && s.length < 60)
        .slice(0, 4);

      const previewItems = topics.map((topic, i) => {
        const icons = ['📚', '🎮', '💬', '📝', '🎯', '🏆'];
        const accentVars = ['--y', '--c', '--g', '--p', '--r', '--o'];
        return {
          icon: icons[i % icons.length],
          label: topic,
          accentVar: accentVars[i % accentVars.length],
        };
      });

      const accentMap: Record<string, string> = {
        '--y': 'rgba(249,193,46,.1)',
        '--c': 'rgba(62,207,207,.1)',
        '--g': 'rgba(52,211,153,.1)',
        '--p': 'rgba(167,139,250,.1)',
        '--r': 'rgba(255,107,107,.1)',
        '--o': 'rgba(251,146,60,.1)',
      };

      nextPreview = {
        title: `Pertemuan ${pertemuanKe + 1}: ${nextP.judul}`,
        desc: nextP.tp || '',
        items: previewItems,
        gradientFrom: accentMap[accentVar] || 'rgba(62,207,207,.1)',
        gradientTo: 'rgba(167,139,250,.1)',
      };
    }
  }

  return {
    _templateId: 'penutup',
    title: 'Pembelajaran Selesai!',
    subtitle: meta.judulPertemuan || '',
    icon: '🎓',
    message: `Selamat! Kamu telah menyelesaikan pembelajaran ${meta.namaBab || 'hari ini'}. Terus semangat belajar!`,
    nextAction: '',
    quote: 'Belajar bukan hanya soal nilai, tapi soal membangun pemahaman yang bermakna.',
    stats: [
      { icon: '📚', label: 'Materi', desc: 'Selesai dipelajari', bg: 'rgba(249,193,46,.06)', border: 'rgba(249,193,46,.2)' },
      { icon: '💬', label: 'Diskusi', desc: 'Telah dikerjakan', bg: 'rgba(62,207,207,.06)', border: 'rgba(62,207,207,.2)' },
      { icon: '❓', label: 'Kuis', desc: 'Telah dijawab', bg: 'rgba(167,139,250,.06)', border: 'rgba(167,139,250,.2)' },
    ],
    nextPreview,
  };
}

// ═══════════════════════════════════════════════════════════════
// PETUNJUK
// ═══════════════════════════════════════════════════════════════

export function buildPetunjukSlotData(meta: MetaState, _atp: AtpState): ScreenSlotData {
  return {
    _templateId: 'petunjuk',
    title: 'Cara Menggunakan',
    titleHighlight: 'Media Ini',
    items: [
      { icon: '📖', title: 'Baca & Eksplorasi', body: 'Pelajari setiap halaman dengan saksama. Ikuti alur dari awal sampai akhir.' },
      { icon: '💬', title: 'Diskusi & Tulis', body: 'Jawab pertanyaan diskusi — jawabanmu otomatis tersimpan dan akan tampil lagi di Refleksi.' },
      { icon: '🎮', title: 'Game Interaktif', body: 'Uji pemahamanmu dengan game seru. Setiap jawaban benar memberi penjelasan mendalam!' },
      { icon: '📝', title: 'Refleksi', body: 'Tuliskan refleksimu di akhir pembelajaran. Jawaban akan jadi portofoliomu hari ini.' },
    ],
    tips: 'Ikuti alur dari awal sampai akhir. Jawab semua pertanyaan diskusi — jawabanmu akan muncul di Refleksi sebagai portofolio belajarmu hari ini!',
  };
}

// ═══════════════════════════════════════════════════════════════
// REVIEW — FIX: also include current pertemuan TP items
// ═══════════════════════════════════════════════════════════════

export function buildReviewSlotData(
  meta: MetaState,
  tp: TpItem[],
  materi: MateriState,
  accentVar: string,
  pertemuanKe: number,
): ScreenSlotData {
  const questions: Array<{q: string; answer: string}> = [];

  // FIX: Include TP items from previous AND current pertemuan for review
  for (const t of tp) {
    if (t.pertemuan <= pertemuanKe) {
      questions.push({
        q: `${t.verb} ${t.desc}`,
        answer: `Jawaban merujuk pada: ${t.desc}`,
      });
    }
  }

  for (const blok of materi.blok) {
    if (blok.tipe === 'definisi' && blok.isi) {
      questions.push({
        q: `Jelaskan: ${blok.judul || 'konsep ini'}`,
        answer: blok.isi,
      });
    }
  }

  if (questions.length === 0) {
    questions.push(
      { q: 'Apa yang kamu pelajari pada pertemuan sebelumnya?', answer: 'Coba ingat kembali materi yang telah dipelajari.' },
      { q: 'Apa poin terpenting yang kamu ingat?', answer: 'Pikirkan kembali konsep utama dari pertemuan lalu.' },
    );
  }

  return {
    _templateId: 'review',
    title: `Review: ${meta.namaBab || 'Materi Sebelumnya'}`,
    questions: questions.slice(0, 5),
    diskusiKelompok: [{
      tipe: 3 as 3,
      ikon: '🔄',
      label: 'Review · ±5 Menit',
      judul: 'Ingat Kembali Materi Sebelumnya!',
      isi: 'Ketuk kartu untuk melihat jawaban. Pastikan kamu ingat poin-poin penting sebelum lanjut ke materi baru.',
    }],
  };
}
