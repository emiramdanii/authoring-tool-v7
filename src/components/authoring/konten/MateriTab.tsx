'use client';

import { useRef, useCallback } from 'react';
import { useAuthoringStore } from '@/store/authoring-store';
import { BLOCK_TYPES } from './shared';
import { BlokCard } from './block-editors';

// ── Materi Tab ─────────────────────────────────────────────────
export default function MateriTab() {
  const materi = useAuthoringStore((s) => s.materi);
  const addMateriBlok = useAuthoringStore((s) => s.addMateriBlok);
  const removeMateriBlok = useAuthoringStore((s) => s.removeMateriBlok);
  const moveMateriBlok = useAuthoringStore((s) => s.moveMateriBlok);
  const listRef = useRef<HTMLDivElement>(null);

  const handleAdd = useCallback(
    (tipe: string) => {
      addMateriBlok(tipe);
      setTimeout(() => {
        const el = listRef.current?.lastElementChild;
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    },
    [addMateriBlok],
  );

  return (
    <div className="space-y-4">
      {/* Block count */}
      <div className="text-xs text-zinc-500">
        {materi.blok.length} blok materi
      </div>

      {/* Empty state */}
      {materi.blok.length === 0 ? (
        <div className="text-center py-8 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm text-zinc-500">Belum ada blok materi. Tambahkan blok di bawah.</p>
        </div>
      ) : (
        /* Block list */
        <div ref={listRef} className="space-y-3">
          {materi.blok.map((blok, i) => (
            <BlokCard
              key={i}
              blok={blok}
              idx={i}
              total={materi.blok.length}
              onMoveUp={() => moveMateriBlok(i, i - 1)}
              onMoveDown={() => moveMateriBlok(i, i + 1)}
              onRemove={() => removeMateriBlok(i)}
            />
          ))}
        </div>
      )}

      {/* Add Block Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-3">➕ Tambah Blok</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
          {BLOCK_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleAdd(t.id)}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-2.5 text-center hover:border-zinc-600 transition-colors cursor-pointer"
              title={`Tambah blok ${t.label}`}
            >
              <div className="text-lg mb-0.5">{t.icon}</div>
              <div className="text-[0.65rem] text-zinc-400">{t.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
