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

/**
 * Enrich plain text content into structured HTML for template display.
 * - Wraps paragraphs in <p> tags
 * - Converts butir arrays to <ul><li> lists
 * - Handles line breaks properly
 */
function enrichContentHTML(isi?: string, butir?: string[]): string {
  if (butir && butir.length > 0) {
    const items = butir.map(b => `<li>${escHTML(b)}</li>`).join('');
    return isi ? `<p>${escHTML(isi)}</p><ul>${items}</ul>` : `<ul>${items}</ul>`;
  }
  if (!isi) return '';
  // Split by double newlines for paragraphs, single for line breaks
  const paragraphs = isi.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length <= 1) return `<p>${escHTML(isi.replace(/\n/g, '<br>'))}</p>`;
  return paragraphs.map(p => `<p>${escHTML(p.trim().replace(/\n/g, '<br>'))}</p>`).join('');
}

/** Minimal HTML escape for content text */
function escHTML(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ═══════════════════════════════════════════════════════════════
// COVER
// ═══════════════════════════════════════════════════════════════

export function buildCoverSlotData(meta: MetaState, accentVar: string, pertemuanKe: number, cp?: CpState): ScreenSlotData {
  const chips: Array<{icon: string; label: string}> = [];
  if (pertemuanKe) chips.push({ icon: '📖', label: `Pertemuan ${pertemuanKe}` });
  if (meta.kelas) chips.push({ icon: '🏫', label: meta.kelas });
  if (meta.mapel) chips.push({ icon: '📚', label: meta.mapel });
  if (meta.durasi) chips.push({ icon: '⏱️', label: `${meta.durasi} Menit` });
  if (meta.kurikulum) chips.push({ icon: '🎯', label: `Fase ${meta.kurikulum}` });
  // FIX: Add elemen chip from CP data when available
  const elemenValue = cp?.elemen || '';
  if (elemenValue) chips.push({ icon: '📐', label: elemenValue });

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
    elemen: elemenValue,
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

let _diskusiBoxCounter = 0;
function buildDiskusiBox(
  prompt: string,
  accentVar: string,
  saveKey = 'd1',
  saveLabel = 'Diskusi Materi',
): DiskusiBoxData {
  _diskusiBoxCounter++;
  const uniqueId = `diskusiAns${_diskusiBoxCounter}`;
  return {
    prompt,
    placeholder: 'Tuliskan pendapatmu di sini… (jawabanmu akan tampil lagi di Refleksi)',
    textareaId: uniqueId,
    saveKey: `${saveKey}-${_diskusiBoxCounter}`,
    saveLabel,
    accentVar,
  };
}

export function resetDiskusiBoxCounter() { _diskusiBoxCounter = 0; }

// ═══════════════════════════════════════════════════════════════
// MATERI-TABICONS
// ═══════════════════════════════════════════════════════════════

export function buildMateriTabIconsSlotData(
  materi: MateriState,
  contentAnalysis: ContentAnalysis,
  accentVar: string,
): ScreenSlotData {
  // FIX: Build richer tabs with per-tab sub-components from blok data
  const tabs = materi.blok.map((b) => {
    const tabDefBoxes: DefBoxItem[] = [];
    const tabCardGrid: CardGridItem[] = [];

    // Create def-box from definisi/highlight/infobox bloks
    if (b.tipe === 'definisi' && b.isi) {
      tabDefBoxes.push({ text: `${b.judul ? b.judul + ': ' : ''}${b.isi}`, accentVar: '--y' });
    } else if (b.tipe === 'highlight' && b.isi) {
      tabDefBoxes.push({ text: b.isi, accentVar: '--c' });
    } else if (b.tipe === 'infobox' && b.isi) {
      tabDefBoxes.push({ text: `${b.judul ? b.judul + ': ' : ''}${b.isi}`, accentVar: '--p' });
    }

    // Create card grid from compare bloks
    if (b.tipe === 'compare' && b.kiri && b.kanan) {
      tabCardGrid.push(
        { icon: b.kiri.icon || '⬅️', title: b.kiri.judul || 'Kiri', body: b.kiri.isi || '', accentVar: '--c' },
        { icon: b.kanan.icon || '➡️', title: b.kanan.judul || 'Kanan', body: b.kanan.isi || '', accentVar: '--p' },
      );
    }

    return {
      icon: b.icon || '📌',
      label: b.judul || 'Bagian',
      content: enrichContentHTML(b.isi, b.butir),
      defBoxes: tabDefBoxes.length > 0 ? tabDefBoxes : undefined,
      cardGrid: tabCardGrid.length > 0 ? tabCardGrid : undefined,
    };
  });

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
  // FIX: Build richer sections with per-section sub-components
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

    // FIX: Add per-section defBoxes from definisi/highlight/infobox bloks
    const secDefBoxes: DefBoxItem[] = [];
    if (b.tipe === 'definisi' && b.isi) {
      secDefBoxes.push({ text: `${b.judul ? b.judul + ': ' : ''}${b.isi}`, accentVar: '--y' });
    } else if (b.tipe === 'highlight' && b.isi) {
      secDefBoxes.push({ text: b.isi, accentVar: '--c' });
    } else if (b.tipe === 'infobox' && b.isi) {
      secDefBoxes.push({ text: `${b.judul ? b.judul + ': ' : ''}${b.isi}`, accentVar: '--p' });
    }
    if (secDefBoxes.length > 0) section.defBoxes = secDefBoxes;

    // FIX: Add per-section cardGrid from compare bloks
    const secCardGrid: CardGridItem[] = [];
    if (b.tipe === 'compare' && b.kiri && b.kanan) {
      secCardGrid.push(
        { icon: b.kiri.icon || '⬅️', title: b.kiri.judul || 'Kiri', body: b.kiri.isi || '', accentVar: '--c' },
        { icon: b.kanan.icon || '➡️', title: b.kanan.judul || 'Kanan', body: b.kanan.isi || '', accentVar: '--p' },
      );
    }
    if (secCardGrid.length > 0) section.cardGrid = secCardGrid;

    // FIX: Add titleHighlight from warna/style field
    if (b.warna || b.tipe === 'highlight') {
      // Use isi prefix as highlight if subjudul not available
      section.titleHighlight = b.isi ? b.isi.slice(0, 40) : '';
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
  const sections: Array<{icon: string; title: string; content: string; titleHighlight?: string; steps?: Array<{emoji: string; text: string}>; defBoxes?: DefBoxItem[]}> = [];

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

        // FIX: Build per-section defBoxes from norma-like fields
        const secDefBoxes: DefBoxItem[] = [];
        if (item.sumber) secDefBoxes.push({ text: `Sumber: ${item.sumber as string}`, accentVar: '--y' });
        if (item.sifat) secDefBoxes.push({ text: `Sifat: ${item.sifat as string}`, accentVar: '--c' });
        if (item.tujuan) secDefBoxes.push({ text: `Tujuan: ${item.tujuan as string}`, accentVar: '--g' });

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
          defBoxes: secDefBoxes.length > 0 ? secDefBoxes : undefined,
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

export function buildKuisSlotData(kuis: KuisItem[], _accentVar: string, meta?: MetaState): ScreenSlotData {
  // FIX: Use context-aware title
  const title = meta?.judulPertemuan
    ? `Kuis: ${meta.judulPertemuan}`
    : 'Kuis Pengetahuan';
  return {
    _templateId: 'kuis',
    title,
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
  materi?: MateriState,
): ScreenSlotData {
  const questions: string[] = [];
  atp.pertemuan.forEach((p) => {
    if (
      p.kegiatan.toLowerCase().includes('diskusi') ||
      p.kegiatan.toLowerCase().includes('kelompok') ||
      p.kegiatan.toLowerCase().includes('berdiskusi')
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

  // FIX: Add defBoxes from materi if available
  const defBoxes: DefBoxItem[] = [];
  if (materi) {
    for (const blok of materi.blok) {
      if (blok.tipe === 'definisi' && blok.isi) {
        defBoxes.push({ text: `${blok.judul ? blok.judul + ': ' : ''}${blok.isi}`, accentVar: '--y' });
      } else if (blok.tipe === 'kutipan' && blok.isi) {
        defBoxes.push({ text: `"${blok.isi}"${blok.judul ? ' — ' + blok.judul : ''}`, accentVar: '--p' });
      }
    }
  }

  // FIX: Add cardGrid from materi compare bloks
  const cardGrid: CardGridItem[] = [];
  if (materi) {
    for (const blok of materi.blok) {
      if (blok.tipe === 'compare' && blok.kiri && blok.kanan) {
        cardGrid.push(
          { icon: blok.kiri.icon || '⬅️', title: blok.kiri.judul || 'Kiri', body: (blok.kiri.isi || '').slice(0, 120), accentVar: '--c' },
          { icon: blok.kanan.icon || '➡️', title: blok.kanan.judul || 'Kanan', body: (blok.kanan.isi || '').slice(0, 120), accentVar: '--p' },
        );
      }
    }
  }

  const diskusiKelompok = buildDiskusiKelompokBanner(
    accentVar,
    'Diskusi Kelompok · ±10 Menit',
    'Bahas Bersama Kelompokmu!',
    'Diskusikan pertanyaan berikut bersama anggota kelompok. Tuliskan jawaban kelompokmu — jawaban akan tersimpan sebagai portofolio.',
  );

  const diskusiBox = buildDiskusiBox(
    questions[0] || 'Apa yang kamu ketahui tentang topik ini?',
    accentVar,
    'dt1',
    'Diskusi Kelompok',
  );

  return {
    _templateId: 'diskusi-timer',
    title: 'Diskusi Kelompok',
    prompt: 'Diskusikan pertanyaan berikut bersama kelompokmu!',
    duration: 10,
    questions: questions.length > 0 ? questions : ['Apa yang kamu ketahui tentang topik ini?'],
    diskusiKelompok,
    defBoxes: defBoxes.length > 0 ? defBoxes : undefined,
    cardGrid: cardGrid.length > 0 ? cardGrid : undefined,
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
    score: -1 as unknown as number, // -1 signals template to use window._kuisResult at runtime
    level: '',
    useKuisResultBridge: true,
  };
}

// ═══════════════════════════════════════════════════════════════
// REFLEKSI — FIX: use context-aware prompts
// ═══════════════════════════════════════════════════════════════

export function buildRefleksiSlotData(
  accentVar: string,
  meta: MetaState,
  materi: MateriState,
  modules?: Array<Record<string, unknown>>,
): ScreenSlotData {
  // FIX: Generate context-aware reflection prompts from actual materi content
  const materiTitle = materi.blok[0]?.judul || meta.judulPertemuan || 'pembelajaran hari ini';

  // FIX: Build flashcard ringkasan from materi definitions
  const flashcardRingkasan: Array<{front: string; back: string; icon: string}> = [];
  for (const blok of materi.blok) {
    if (blok.tipe === 'definisi' && blok.isi) {
      flashcardRingkasan.push({
        front: blok.judul || 'Apa ini?',
        back: blok.isi.slice(0, 200),
        icon: blok.icon || '📌',
      });
    } else if (blok.tipe === 'highlight' && blok.isi) {
      flashcardRingkasan.push({
        front: blok.judul || 'Poin penting',
        back: blok.isi.slice(0, 200),
        icon: blok.icon || '✨',
      });
    }
  }
  // Also add flashcard module data if available
  if (modules) {
    const flashMods = getModulesOfType(modules, ['flashcard']);
    for (const m of flashMods) {
      const kartu = (m.kartu as Array<Record<string, unknown>>) || [];
      for (const k of kartu) {
        flashcardRingkasan.push({
          front: (k.depan as string) || '',
          back: (k.belakang as string) || '',
          icon: (k.icon as string) || '🃏',
        });
      }
    }
  }

  // FIX: Build portofolio items from materi discussions
  const portofolio: Array<{id: string; label: string; value: string}> = [];
  let portoIdx = 0;
  for (const blok of materi.blok) {
    if (blok.tipe === 'kutipan' && blok.isi) {
      portofolio.push({
        id: `porto-${portoIdx++}`,
        label: blok.judul || 'Kutipan',
        value: blok.isi,
      });
    }
  }

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
    portofolio: portofolio.length > 0 ? portofolio : undefined,
    flashcardRingkasan: flashcardRingkasan.length > 0 ? flashcardRingkasan : undefined,
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
  kuis?: KuisItem[],
  modules?: Array<Record<string, unknown>>,
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
          desc: '',
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

  // FIX: Dynamic stats based on actual content
  const stats: Array<{icon: string; label: string; desc: string; bg: string; border: string}> = [];
  stats.push({ icon: '📚', label: 'Materi', desc: 'Selesai dipelajari', bg: 'rgba(249,193,46,.06)', border: 'rgba(249,193,46,.2)' });

  const hasDiskusi = atp.pertemuan.some(p =>
    p.kegiatan.toLowerCase().includes('diskusi') ||
    p.kegiatan.toLowerCase().includes('kelompok'),
  );
  if (hasDiskusi) {
    stats.push({ icon: '💬', label: 'Diskusi', desc: 'Telah dikerjakan', bg: 'rgba(62,207,207,.06)', border: 'rgba(62,207,207,.2)' });
  }

  const hasSkenario = modules && getModulesOfType(modules, ['skenario']).length > 0;
  if (hasSkenario) {
    stats.push({ icon: '🎭', label: 'Skenario', desc: 'Telah dieksplorasi', bg: 'rgba(251,146,60,.06)', border: 'rgba(251,146,60,.2)' });
  }

  const hasGame = modules && getModulesOfType(modules, ['sorting', 'roda', 'spinwheel']).length > 0;
  if (hasGame) {
    stats.push({ icon: '🎮', label: 'Game', desc: 'Telah dimainkan', bg: 'rgba(167,139,250,.06)', border: 'rgba(167,139,250,.2)' });
  }

  const hasKuisData = kuis && kuis.filter(k => k.q.trim()).length > 0;
  if (hasKuisData) {
    stats.push({ icon: '❓', label: 'Kuis', desc: 'Telah dijawab', bg: 'rgba(255,107,107,.06)', border: 'rgba(255,107,107,.2)' });
  }

  // Ensure at least 3 stats for visual balance
  if (stats.length < 3) {
    stats.push({ icon: '🏆', label: 'Poin', desc: 'Dikumpulkan', bg: 'rgba(52,211,153,.06)', border: 'rgba(52,211,153,.2)' });
  }

  return {
    _templateId: 'penutup',
    title: 'Pembelajaran Selesai!',
    subtitle: meta.judulPertemuan || '',
    icon: '🎓',
    message: `Selamat! Kamu telah menyelesaikan pembelajaran ${meta.namaBab || 'hari ini'}. Terus semangat belajar!`,
    nextAction: '',
    quote: 'Belajar bukan hanya soal nilai, tapi soal membangun pemahaman yang bermakna.',
    stats,
    nextPreview,
  };
}

// ═══════════════════════════════════════════════════════════════
// PETUNJUK
// ═══════════════════════════════════════════════════════════════

export function buildPetunjukSlotData(
  meta: MetaState,
  atp: AtpState,
  kuis?: KuisItem[],
  modules?: Array<Record<string, unknown>>,
  materi?: MateriState,
): ScreenSlotData {
  // FIX: Content-aware petunjuk — only mention activities that actually exist
  const hasKuis = kuis && kuis.filter((k) => k.q.trim()).length > 0;
  const hasGame = modules && (
    getModulesOfType(modules, ['sorting', 'roda', 'spinwheel']).length > 0
  );
  const hasSkenario = modules && (
    getModulesOfType(modules, ['skenario']).length > 0
  );
  const hasDiskusi = atp.pertemuan.some(
    (p) =>
      p.kegiatan.toLowerCase().includes('diskusi') ||
      p.kegiatan.toLowerCase().includes('kelompok') ||
      p.kegiatan.toLowerCase().includes('berdiskusi'),
  );
  const hasHotspot = modules && getModulesOfType(modules, ['hotspot-image']).length > 0;
  const hasFlashcard = modules && getModulesOfType(modules, ['flashcard']).length > 0;

  const items: Array<{icon: string; title: string; body: string}> = [];

  // Always have reading/exploring as first item
  items.push({
    icon: '📖',
    title: 'Baca & Eksplorasi',
    body: 'Pelajari setiap halaman dengan saksama. Buka semua bagian materi dan baca definisi penting.',
  });

  // Diskusi — only if discussion activities exist
  if (hasDiskusi) {
    items.push({
      icon: '💬',
      title: 'Diskusi & Tulis',
      body: 'Jawab pertanyaan diskusi — jawabanmu otomatis tersimpan dan akan muncul lagi di Refleksi sebagai portofolio.',
    });
  }

  // Skenario — only if skenario exists
  if (hasSkenario) {
    items.push({
      icon: '🎭',
      title: 'Skenario Interaktif',
      body: 'Ikuti cerita skenario dan pilih tindakanmu. Setiap pilihan punya konsekuensi — pilih dengan bijak!',
    });
  }

  // Hotspot — only if hotspot images exist
  if (hasHotspot) {
    items.push({
      icon: '🗺️',
      title: 'Jelajahi Gambar',
    body: 'Ketuk titik-titik pada gambar untuk menemukan informasi tersembunyi dan penjelasan mendalam.',
    });
  }

  // Flashcard — only if flashcards exist
  if (hasFlashcard) {
    items.push({
      icon: '🃏',
      title: 'Kartu Belajar',
      body: 'Balik kartu untuk melihat jawaban. Ulangi sampai kamu hafal semua konsep penting!',
    });
  }

  // Game — only if game modules exist
  if (hasGame) {
    items.push({
      icon: '🎮',
      title: 'Game Interaktif',
      body: 'Uji pemahamanmu dengan game seru. Setiap jawaban benar memberi poin dan penjelasan!',
    });
  }

  // Kuis — only if kuis data exists
  if (hasKuis) {
    items.push({
      icon: '❓',
      title: 'Kuis Pengetahuan',
      body: 'Jawab soal kuis di akhir materi. Setiap jawaban benar +10 poin dan ada penjelasannya!',
    });
  }

  // Refleksi — always last
  items.push({
    icon: '📝',
    title: 'Refleksi',
    body: 'Tuliskan refleksimu di akhir pembelajaran. Jawaban akan jadi portofoliomu hari ini.',
  });

  // Build dynamic tips based on what exists
  const tipsParts: string[] = ['Ikuti alur dari awal sampai akhir'];
  if (hasDiskusi) tipsParts.push('jawab semua pertanyaan diskusi');
  if (hasGame) tipsParts.push('selesaikan semua game');
  if (hasKuis) tipsParts.push('jawab kuis dengan teliti');
  tipsParts.push('jawabanmu akan tersimpan sebagai portofolio');
  const tips = tipsParts.join(', ') + '!';

  return {
    _templateId: 'petunjuk',
    title: 'Cara Menggunakan',
    titleHighlight: 'Media Ini',
    items,
    tips,
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
  // with richer answers from materi content
  for (const t of tp) {
    if (t.pertemuan <= pertemuanKe) {
      // Try to find matching materi content for a better answer
      const matchingBlok = materi.blok.find(
        (b) => b.judul && t.desc && (
          b.judul.toLowerCase().includes(t.desc.toLowerCase().slice(0, 15)) ||
          t.desc.toLowerCase().includes(b.judul.toLowerCase().slice(0, 10))
        ),
      );
      const answerText = matchingBlok?.isi
        ? matchingBlok.isi.slice(0, 200) + (matchingBlok.isi.length > 200 ? '…' : '')
        : `Tujuan pembelajaran: ${t.desc}`;
      questions.push({
        q: `${t.verb} ${t.desc}`,
        answer: answerText,
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
    // FIX: Also create review Q&A from highlight and infobox bloks
    if (blok.tipe === 'highlight' && blok.isi) {
      questions.push({
        q: `Ingat kembali: ${blok.judul || 'poin penting'}`,
        answer: blok.isi,
      });
    }
    if (blok.tipe === 'infobox' && blok.isi) {
      questions.push({
        q: `Apa yang kamu ketahui tentang ${blok.judul || 'topik ini'}?`,
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

  // FIX: Add cardGrid from materi compare bloks for visual review
  const cardGrid: CardGridItem[] = [];
  for (const blok of materi.blok) {
    if (blok.tipe === 'compare' && blok.kiri && blok.kanan) {
      cardGrid.push(
        { icon: blok.kiri.icon || '⬅️', title: blok.kiri.judul || 'Kiri', body: (blok.kiri.isi || '').slice(0, 120), accentVar: '--c' },
        { icon: blok.kanan.icon || '➡️', title: blok.kanan.judul || 'Kanan', body: (blok.kanan.isi || '').slice(0, 120), accentVar: '--p' },
      );
    }
  }

  const diskusiBox = buildDiskusiBox(
    questions[0]?.q || 'Apa yang kamu ingat dari materi sebelumnya?',
    accentVar,
    'rv1',
    'Review Materi',
  );

  return {
    _templateId: 'review',
    title: `Review: ${meta.namaBab || 'Materi Sebelumnya'}`,
    questions: questions.slice(0, 6),
    diskusiKelompok: [{
      tipe: 3 as 3,
      ikon: '🔄',
      label: 'Review · ±5 Menit',
      judul: 'Ingat Kembali Materi Sebelumnya!',
      isi: 'Ketuk kartu untuk melihat jawaban. Pastikan kamu ingat poin-poin penting sebelum lanjut ke materi baru.',
    }],
    cardGrid: cardGrid.length > 0 ? cardGrid : undefined,
    diskusiBox,
  };
}
