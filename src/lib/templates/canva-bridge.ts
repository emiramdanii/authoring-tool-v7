// ═══════════════════════════════════════════════════════════════
// CANVA-BRIDGE.TS — Bridge between authoring store and canva store
// Syncs authoring store changes to canva template data in real-time.
// Generates COMPLETE pages with rich sub-components matching
// the auto-build system's smart content detection.
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
  PetunjukSlotData,
  DefBoxItem,
  CardGridItem,
  DiskusiKelompokBanner,
  DiskusiBoxData,
  NormaTabItem,
  TabelAccordionItem,
} from './engine/slot-types';
import { createDefaultSlotData } from './engine/slot-types';

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
// CONTENT ANALYSIS (mirrors auto-build.ts logic)
// ═══════════════════════════════════════════════════════════════

interface ContentAnalysis {
  normaTabs: NormaTabItem[];
  tabelAccordion: TabelAccordionItem[];
  defBoxes: DefBoxItem[];
  cardGrid: CardGridItem[];
  useNormaMode: boolean;
}

function analyzeContentFromCanva(
  materi: Record<string, unknown>,
  modules: Array<Record<string, unknown>>,
): ContentAnalysis {
  const result: ContentAnalysis = {
    normaTabs: [],
    tabelAccordion: [],
    defBoxes: [],
    cardGrid: [],
    useNormaMode: false,
  };

  // Analyze modules for norma-type content
  const iconExploreMods = modules.filter(m => m.type === 'icon-explore');
  for (const mod of iconExploreMods) {
    const items = (mod.items as Array<Record<string, unknown>>) || [];
    if (items.length >= 3) {
      const hasNormaFields = items.some(item =>
        item.sanksi || item.contoh || item.sumber || item.sifat
      );
      if (hasNormaFields) {
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
            contoh: (item.contoh as string) || '',
            pelanggaran,
          };
        });

        result.tabelAccordion = result.normaTabs.map(nt => ({
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

        result.useNormaMode = true;
      }
    }
  }

  // Analyze materi bloks for definitions
  const blok = ((materi as Record<string, unknown>).blok as Array<Record<string, unknown>>) || [];
  for (const b of blok) {
    if (b.tipe === 'definisi' && b.isi) {
      result.defBoxes.push({
        text: `${b.judul ? b.judul + ': ' : ''}${b.isi}`,
        accentVar: '--y',
      });
    }
    if (b.tipe === 'highlight' && b.isi) {
      result.defBoxes.push({
        text: b.isi as string,
        accentVar: '--y',
      });
    }
  }

  // Analyze modules for card grid
  const cardShowcaseMods = modules.filter(m => m.type === 'card-showcase');
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

  return result;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: getPageTemplateData
// Generates COMPLETE page data with rich sub-components
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

  // Run content analysis for templates that need it
  const contentAnalysis = analyzeContentFromCanva(materi, modules);

  switch (templateId) {
    case 'cover':
      return {
        _templateId: 'cover',
        icon: (meta.ikon as string) || '📚',
        title: (meta.judulPertemuan as string) || 'Media Pembelajaran',
        subtitle: (meta.subjudul as string) || '',
        mapel: (meta.mapel as string) || '',
        kelas: (meta.kelas as string) || '',
        pertemuan: (meta.pertemuan as string) || '',
        bab: (meta.namaBab as string) || '',
        durasi: (meta.durasi as string) || '80',
        ctaText: 'Mulai Pembelajaran',
        accentVar: '--y',
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
        title: `Review: ${(meta.namaBab as string) || 'Materi Sebelumnya'}`,
        questions: [
          { q: 'Apa pengertian norma yang telah kamu pelajari?', answer: 'Norma adalah aturan atau pedoman yang mengatur perilaku manusia dalam kehidupan bermasyarakat.' },
          { q: 'Mengapa manusia membutuhkan norma?', answer: 'Karena manusia adalah makhluk sosial yang selalu hidup bersama orang lain.' },
          { q: 'Sebutkan fungsi norma dalam masyarakat!', answer: 'Sebagai pedoman tingkah laku, menciptakan ketertiban, memperkuat solidaritas, melindungi hak warga.' },
        ],
        diskusiKelompok: [{
          tipe: 3 as 3,
          ikon: '🔄',
          label: 'Review · ±5 Menit',
          judul: 'Ingat Kembali Materi Sebelumnya!',
          isi: 'Ketuk kartu untuk melihat jawaban.',
        }],
      } as ReviewSlotData;

    case 'materi-tabicons': {
      const blok = ((materi as Record<string, unknown>).blok as Array<Record<string, unknown>>) || [];
      // Build diskusi kelompok banner
      const diskusiKelompok: DiskusiKelompokBanner[] = [{
        tipe: 1,
        ikon: '👥',
        label: 'Aktivitas Kelompok · ±10 Menit',
        judul: 'Eksplorasi Materi Bersama!',
        isi: 'Diskusikan pertanyaan di bawah bersama kelompokmu.',
      }];
      const diskusiBox: DiskusiBoxData = {
        prompt: 'Tuliskan poin terpenting yang kamu pahami dari materi ini!',
        placeholder: 'Tuliskan pendapatmu di sini… (jawabanmu akan tampil lagi di Refleksi)',
        textareaId: 'diskusiAns',
        saveKey: 'd1',
        saveLabel: 'Diskusi Materi',
        accentVar: '--c',
      };

      return {
        _templateId: 'materi-tabicons',
        title: 'Materi Pembelajaran',
        tabs: blok.map((b) => ({
          icon: (b.icon as string) || '📌',
          label: (b.judul as string) || 'Tab',
          content: (b.isi as string) || '',
        })),
        readTracking: true,
        defBoxes: contentAnalysis.defBoxes.length > 0 ? contentAnalysis.defBoxes : undefined,
        cardGrid: contentAnalysis.cardGrid.length > 0 ? contentAnalysis.cardGrid : undefined,
        diskusiKelompok,
        normaTabs: contentAnalysis.useNormaMode ? contentAnalysis.normaTabs : undefined,
        tabelAccordion: contentAnalysis.useNormaMode && contentAnalysis.tabelAccordion.length > 0 ? contentAnalysis.tabelAccordion : undefined,
        diskusiBox,
      } as MateriTabIconsSlotData;
    }

    case 'materi-accordion': {
      const blok = ((materi as Record<string, unknown>).blok as Array<Record<string, unknown>>) || [];
      const diskusiKelompok: DiskusiKelompokBanner[] = [{
        tipe: 1,
        ikon: '👥',
        label: 'Aktivitas Kelompok · ±10 Menit',
        judul: 'Eksplorasi Materi Bersama!',
        isi: 'Diskusikan pertanyaan di bawah bersama kelompokmu.',
      }];
      const diskusiBox: DiskusiBoxData = {
        prompt: 'Tuliskan poin terpenting yang kamu pahami dari materi ini!',
        placeholder: 'Tuliskan pendapatmu di sini… (jawabanmu akan tampil lagi di Refleksi)',
        textareaId: 'diskusiAns',
        saveKey: 'd1',
        saveLabel: 'Diskusi Materi',
        accentVar: '--c',
      };

      return {
        _templateId: 'materi-accordion',
        title: 'Materi Pembelajaran',
        sections: blok.map((b) => ({
          icon: (b.icon as string) || '📌',
          title: (b.judul as string) || 'Bagian',
          content: (b.isi as string) || '',
        })),
        defBoxes: contentAnalysis.defBoxes.length > 0 ? contentAnalysis.defBoxes : undefined,
        cardGrid: contentAnalysis.cardGrid.length > 0 ? contentAnalysis.cardGrid : undefined,
        diskusiKelompok,
        diskusiBox,
      } as MateriAccordionSlotData;
    }

    case 'diskusi-timer': {
      const diskusiKelompok: DiskusiKelompokBanner[] = [{
        tipe: 1,
        ikon: '👥',
        label: 'Diskusi Kelompok · ±10 Menit',
        judul: 'Bahas Bersama Kelompokmu!',
        isi: 'Diskusikan pertanyaan berikut bersama anggota kelompok.',
      }];
      const diskusiBox: DiskusiBoxData = {
        prompt: 'Apa yang kamu ketahui tentang topik ini?',
        placeholder: 'Tuliskan pendapatmu di sini… (jawabanmu akan tampil lagi di Refleksi)',
        textareaId: 'diskusiAns',
        saveKey: 'd1',
        saveLabel: 'Diskusi Kelompok',
        accentVar: '--c',
      };

      return {
        _templateId: 'diskusi-timer',
        title: 'Diskusi Kelompok',
        prompt: 'Diskusikan pertanyaan berikut bersama kelompokmu!',
        duration: 10,
        questions: ['Apa yang kamu ketahui tentang topik ini?'],
        diskusiKelompok,
        diskusiBox,
      } as DiskusiTimerSlotData;
    }

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
        useLocalStorage: true,
      } as RefleksiSlotData;

    case 'penutup':
      return {
        _templateId: 'penutup',
        title: 'Pembelajaran Selesai!',
        subtitle: (meta.judulPertemuan as string) || '',
        icon: '🎓',
        message: `Selamat! Kamu telah menyelesaikan pembelajaran ${(meta.namaBab as string) || 'hari ini'}.`,
        nextAction: '',
        quote: 'Belajar bukan hanya soal nilai, tapi soal membangun pemahaman yang bermakna.',
        stats: [
          { icon: '📚', label: 'Materi', desc: 'Selesai dipelajari', bg: 'rgba(249,193,46,.06)', border: 'rgba(249,193,46,.2)' },
          { icon: '💬', label: 'Diskusi', desc: 'Telah dikerjakan', bg: 'rgba(62,207,207,.06)', border: 'rgba(62,207,207,.2)' },
          { icon: '❓', label: 'Kuis', desc: 'Telah dijawab', bg: 'rgba(167,139,250,.06)', border: 'rgba(167,139,250,.2)' },
        ],
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

    case 'petunjuk':
      return {
        _templateId: 'petunjuk',
        title: 'Cara Menggunakan',
        titleHighlight: 'Media Ini',
        items: [
          { icon: '📖', title: 'Baca & Eksplorasi', body: 'Pelajari setiap halaman dengan saksama.' },
          { icon: '💬', title: 'Diskusi & Tulis', body: 'Jawab pertanyaan diskusi — jawabanmu otomatis tersimpan.' },
          { icon: '🎮', title: 'Game Interaktif', body: 'Uji pemahamanmu dengan game seru!' },
          { icon: '📝', title: 'Refleksi', body: 'Tuliskan refleksimu di akhir pembelajaran.' },
        ],
        tips: 'Ikuti alur dari awal sampai akhir. Jawab semua pertanyaan diskusi — jawabanmu akan muncul di Refleksi sebagai portofolio belajarmu hari ini!',
      } as PetunjukSlotData;

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
