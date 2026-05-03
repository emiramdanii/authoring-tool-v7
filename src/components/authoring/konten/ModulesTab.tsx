'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthoringStore } from '@/store/authoring-store';
import ModuleEditorModal from '../ModuleEditorModal';
import { MODULE_TYPES, GAME_TYPES, ALL_MODULE_TYPES, moduleTypeInfo, modulePreview } from './shared';

// ── Module Picker Modal ───────────────────────────────────────
function ModulePickerModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (typeId: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Pilih Tipe Modul / Game</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Pilih modul pembelajaran atau game yang ingin ditambahkan</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl leading-none p-1">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Learning Modules */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Modul Pembelajaran
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODULE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onPick(t.id)}
                  className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-4 text-left hover:border-zinc-500 hover:bg-zinc-800 transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{t.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">{t.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{t.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Games */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Game Interaktif
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GAME_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onPick(t.id)}
                  className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-4 text-left hover:border-zinc-500 hover:bg-zinc-800 transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{t.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">{t.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{t.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Module List Card ──────────────────────────────────────────
function ModuleCard({
  mod,
  idx,
  total,
  onEdit,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  mod: Record<string, unknown>;
  idx: number;
  total: number;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const info = moduleTypeInfo(mod.type as string);
  const isGame = ['truefalse', 'memory', 'roda', 'sorting', 'spinwheel', 'teambuzzer', 'wordsearch'].includes(mod.type as string);

  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-700"
      style={{ borderLeftWidth: '3px', borderLeftColor: info.color }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: info.color + '18' }}
        >
          {info.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200 truncate">
              {(mod.title as string) || info.label}
            </span>
            {isGame && (
              <span className="text-[0.6rem] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                GAME
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {modulePreview(mod)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={idx === 0}
            className="p-1.5 text-zinc-600 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-md hover:bg-zinc-800 transition-colors text-xs"
            title="Pindah ke atas"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={idx === total - 1}
            className="p-1.5 text-zinc-600 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-md hover:bg-zinc-800 transition-colors text-xs"
            title="Pindah ke bawah"
          >
            ↓
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-zinc-600 hover:text-amber-400 rounded-md hover:bg-zinc-800 transition-colors text-sm"
            title="Edit modul"
          >
            ✏️
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-zinc-600 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors text-sm"
            title="Hapus modul"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preset Section ────────────────────────────────────────────
function PresetSection() {
  const applyModulePreset = useAuthoringStore((s) => s.applyModulePreset);
  const modules = useAuthoringStore((s) => s.modules);

  const presets = [
    {
      key: 'hakikat-norma',
      icon: '📦',
      label: 'Paket Hakikat Norma',
      desc: '5 modul siap pakai',
      count: 5,
    },
    {
      key: 'blank',
      icon: '📋',
      label: 'Kosong',
      desc: 'Dari nol',
      count: 0,
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-zinc-200 mb-3">⚡ Preset Modul</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              if (modules.length > 0 && p.key !== 'blank') {
                if (!confirm('Preset akan mengganti semua modul yang sudah ada. Lanjutkan?')) return;
              }
              applyModulePreset(p.key);
            }}
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-left hover:border-zinc-600 transition-colors cursor-pointer group"
          >
            <div className="text-xl mb-1">{p.icon}</div>
            <div className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-100">{p.label}</div>
            <div className="text-[0.65rem] text-zinc-500">
              {p.count > 0 ? `${p.count} modul siap pakai, bisa diedit` : 'Tambahkan modul sendiri'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Auto-Generate Section ─────────────────────────────────────
function AutoGenSection() {
  const modules = useAuthoringStore((s) => s.modules);
  const materi = useAuthoringStore((s) => s.materi);
  const meta = useAuthoringStore((s) => s.meta);
  const kuis = useAuthoringStore((s) => s.kuis);
  const tp = useAuthoringStore((s) => s.tp);
  const updateModuleField = useAuthoringStore((s) => s.updateModuleField);
  const [generating, setGenerating] = useState(false);

  // Count empty modules (title is empty or key arrays are empty)
  const emptyCount = modules.filter((mod) => {
    const t = mod.type as string;
    const title = (mod.title as string) || '';
    if (!title) return true;
    // Check if key arrays are empty
    const arrayKeys: Record<string, string> = {
      flashcard: 'kartu', tabicons: 'tabs', 'icon-explore': 'items',
      accordion: 'items', sorting: 'items', comparison: 'baris',
      'card-showcase': 'cards', 'hotspot-image': 'hotspots',
      infografis: 'kartu', matching: 'pasangan', truefalse: 'soal',
      roda: 'opsi', spinwheel: 'soal', teambuzzer: 'soal',
      memory: 'pasangan', timeline: 'events', polling: 'opsi',
      langkah: 'steps', statistik: 'items', wordsearch: 'kata',
    };
    const arrKey = arrayKeys[t];
    if (arrKey) {
      const arr = mod[arrKey] as unknown[];
      return !arr || arr.length === 0;
    }
    return false;
  }).length;

  const handleAutoGen = useCallback(() => {
    if (modules.length === 0) {
      toast.error('Tambahkan modul terlebih dahulu sebelum auto-generate');
      return;
    }

    setGenerating(true);

    // Build context text from materi blok + meta + TP
    const materiText = materi.blok
      .map((b) => {
        let t = '';
        if (b.judul) t += b.judul + ': ';
        if (b.isi) t += b.isi;
        if (b.butir) t += ' ' + b.butir.join(', ');
        return t;
      })
      .join(' ');

    const contextText = [
      meta.namaBab || '',
      meta.subjudul || '',
      ...tp.map((t) => `${t.verb} ${t.desc}`),
      materiText,
    ].filter(Boolean).join('. ');

    if (!contextText.trim()) {
      toast.error('Isi materi atau meta terlebih dahulu untuk auto-generate');
      setGenerating(false);
      return;
    }

    // Simple smart-fill for empty modules
    let filled = 0;
    modules.forEach((mod, idx) => {
      const t = mod.type as string;
      const title = (mod.title as string) || '';

      // Only fill modules that have empty title or empty key arrays
      const arrayKeys: Record<string, string> = {
        flashcard: 'kartu', 'tab-icons': 'tabs', 'icon-explore': 'items',
        accordion: 'items', sorting: 'items', comparison: 'baris',
        'card-showcase': 'cards', 'hotspot-image': 'hotspots',
        infografis: 'kartu', matching: 'pasangan', truefalse: 'soal',
        roda: 'opsi', spinwheel: 'soal', teambuzzer: 'soal',
        memory: 'pasangan', timeline: 'events', polling: 'opsi',
        langkah: 'steps', statistik: 'items', wordsearch: 'kata',
      };
      const arrKey = arrayKeys[t];
      const arr = arrKey ? (mod[arrKey] as unknown[]) : null;
      const isEmpty = !title || (arr && arr.length === 0);

      if (!isEmpty) return;

      // Auto-fill title based on meta context
      if (!title) {
        const topic = meta.namaBab || 'Materi';
        const titleMap: Record<string, string> = {
          'tab-icons': `Tab ${topic}`,
          'icon-explore': `Eksplorasi ${topic}`,
          flashcard: `Kartu ${topic}`,
          accordion: `Detail ${topic}`,
          sorting: `Klasifikasi ${topic}`,
          comparison: `Perbandingan ${topic}`,
          'card-showcase': `Kartu ${topic}`,
          infografis: `Infografis ${topic}`,
          matching: `Cocokkan ${topic}`,
          truefalse: `Benar/Salah ${topic}`,
          memory: `Memory ${topic}`,
          roda: `Roda ${topic}`,
          timeline: `Timeline ${topic}`,
          statistik: `Statistik ${topic}`,
          langkah: `Langkah ${topic}`,
          polling: `Polling ${topic}`,
          spinwheel: `Roda Soal ${topic}`,
          teambuzzer: `Kuis Tim ${topic}`,
          wordsearch: `Teka-Teki ${topic}`,
          'hotspot-image': `Peta ${topic}`,
        };
        const newTitle = titleMap[t] || topic;
        updateModuleField(idx, 'title', newTitle);
        filled++;
      }
    });

    setGenerating(false);

    if (filled > 0) {
      toast.success(`⚡ ${filled} modul diisi otomatis. Buka editor masing-masing untuk melengkapi data.`);
    } else {
      toast.info('Semua modul sudah terisi. Gunakan editor per-modul untuk mengubah data.');
    }
  }, [modules, materi, meta, tp, updateModuleField]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-zinc-200 mb-2">⚡ Auto-Generate Modul</h4>
      <p className="text-[0.7rem] text-zinc-500 mb-3">
        Isi otomatis judul modul yang kosong berdasarkan konteks materi dan meta yang sudah diisi.
        {emptyCount > 0 && (
          <span className="text-amber-400 ml-1">({emptyCount} modul kosong)</span>
        )}
      </p>
      <button
        onClick={handleAutoGen}
        disabled={generating || modules.length === 0}
        className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-sm rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {generating ? '⏳ Generating...' : '🤖 Generate dari Materi'}
      </button>
    </div>
  );
}

// ── Modules Tab ────────────────────────────────────────────────
export default function ModulesTab() {
  const modules = useAuthoringStore((s) => s.modules);
  const addModule = useAuthoringStore((s) => s.addModule);
  const removeModule = useAuthoringStore((s) => s.removeModule);
  const moveModule = useAuthoringStore((s) => s.moveModule);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [editorIndex, setEditorIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handlePick = useCallback((typeId: string) => {
    addModule(typeId);
    setPickerOpen(false);
    setTimeout(() => {
      const el = listRef.current?.lastElementChild;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }, [addModule]);

  const handleRemove = useCallback((i: number) => {
    if (confirm(`Hapus modul "${(modules[i].title as string) || moduleTypeInfo(modules[i].type as string).label}"?`)) {
      removeModule(i);
      if (editorIndex === i) setEditorIndex(null);
    }
  }, [modules, removeModule, editorIndex]);

  return (
    <div className="space-y-4">
      {/* Preset Section */}
      <PresetSection />

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{modules.length} modul & game</span>
        <button
          onClick={() => setPickerOpen(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-colors"
        >
          ＋ Tambah Modul / Game
        </button>
      </div>

      {/* Empty state */}
      {modules.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-4xl mb-3">🧩</div>
          <p className="text-sm text-zinc-400 font-medium">Belum ada modul atau game</p>
          <p className="text-xs text-zinc-500 mt-1">Pilih preset di atas atau klik tombol untuk menambahkan modul pembelajaran.</p>
        </div>
      ) : (
        /* Module list */
        <div ref={listRef} className="space-y-2">
          {modules.map((mod, i) => (
            <ModuleCard
              key={i}
              mod={mod}
              idx={i}
              total={modules.length}
              onEdit={() => setEditorIndex(i)}
              onMoveUp={() => moveModule(i, i - 1)}
              onMoveDown={() => moveModule(i, i + 1)}
              onRemove={() => handleRemove(i)}
            />
          ))}
        </div>
      )}

      {/* Auto-Generate Section (only show when modules exist) */}
      {modules.length > 0 && <AutoGenSection />}

      {/* Quick Add Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-3">⚡ Tambah Cepat</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {ALL_MODULE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => handlePick(t.id)}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-2.5 text-center hover:border-zinc-500 transition-colors cursor-pointer"
              title={`Tambah ${t.label}`}
            >
              <div className="text-lg mb-0.5">{t.icon}</div>
              <div className="text-[0.6rem] text-zinc-400 leading-tight">{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ModulePickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={handlePick} />
      <ModuleEditorModal open={editorIndex !== null} moduleIndex={editorIndex as number} onClose={() => setEditorIndex(null)} />
    </div>
  );
}
