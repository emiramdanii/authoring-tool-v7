'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthoringStore } from '@/store/authoring-store';
import { getPageTemplateData } from '@/lib/templates/canva-bridge';
import { assembleSingleScreen } from '@/lib/templates/assembly';
import type { TemplateId } from '@/lib/templates/engine/slot-types';

// ── Template options for the dropdown ─────────────────────────────
const TEMPLATE_OPTIONS: { id: TemplateId; label: string; icon: string }[] = [
  { id: 'materi-tabicons', label: 'Materi Tab', icon: '📑' },
  { id: 'materi-accordion', label: 'Materi Accordion', icon: '🗂️' },
  { id: 'cover', label: 'Cover', icon: '🎬' },
  { id: 'dokumen', label: 'CP/TP/ATP', icon: '📋' },
  { id: 'tujuan', label: 'Tujuan', icon: '🎯' },
  { id: 'kuis', label: 'Kuis PG', icon: '❓' },
  { id: 'sortir-game', label: 'Sortir Game', icon: '🔢' },
  { id: 'roda-game', label: 'Roda Game', icon: '🎡' },
  { id: 'flashcard', label: 'Flashcard', icon: '🃏' },
  { id: 'diskusi-timer', label: 'Diskusi Timer', icon: '⏱️' },
  { id: 'hubungan-konsep', label: 'Hub. Konsep', icon: '🔗' },
  { id: 'hasil', label: 'Hasil', icon: '📊' },
  { id: 'refleksi', label: 'Refleksi', icon: '🪞' },
  { id: 'penutup', label: 'Penutup', icon: '👋' },
  { id: 'petunjuk', label: 'Petunjuk', icon: '📖' },
  { id: 'skenario', label: 'Skenario', icon: '🎭' },
  { id: 'review', label: 'Review', icon: '🔄' },
];

// ── Zoom options ──────────────────────────────────────────────────
const ZOOM_OPTIONS = [
  { id: '50' as const, label: '50%', scale: 0.5 },
  { id: '75' as const, label: '75%', scale: 0.75 },
  { id: '100' as const, label: '100%', scale: 1 },
];

type ZoomId = '50' | '75' | '100';

// ── Props ─────────────────────────────────────────────────────────
interface InlinePreviewProps {
  /** Which template to preview (default: 'materi-tabicons') */
  defaultTemplateId?: TemplateId;
  /** External control: when set, overrides internal templateId */
  externalTemplateId?: TemplateId;
  /** Optional title shown in the header */
  title?: string;
  /** Compact mode: smaller toolbar for split-pane */
  compact?: boolean;
}

// ── Component ─────────────────────────────────────────────────────
export default function InlinePreview({ defaultTemplateId = 'materi-tabicons', externalTemplateId, title, compact }: InlinePreviewProps) {
  const [internalTemplateId, setInternalTemplateId] = useState<TemplateId>(defaultTemplateId);
  const [zoomId, setZoomId] = useState<ZoomId>(compact ? '50' : '75');
  const [htmlContent, setHtmlContent] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use external templateId if provided, otherwise use internal
  const templateId = externalTemplateId ?? internalTemplateId;

  // Subscribe to store slices
  const meta = useAuthoringStore((s) => s.meta);
  const cp = useAuthoringStore((s) => s.cp);
  const tp = useAuthoringStore((s) => s.tp);
  const atp = useAuthoringStore((s) => s.atp);
  const alur = useAuthoringStore((s) => s.alur);
  const skenario = useAuthoringStore((s) => s.skenario);
  const kuis = useAuthoringStore((s) => s.kuis);
  const materi = useAuthoringStore((s) => s.materi);
  const modules = useAuthoringStore((s) => s.modules);

  // Generate single-screen HTML using canva-bridge + assembleSingleScreen
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const authoringData: Record<string, unknown> = {
          meta, cp, tp, atp, alur, skenario, kuis, modules, materi,
        };
        const slotData = getPageTemplateData(templateId, authoringData);
        const html = assembleSingleScreen(templateId, slotData);
        setHtmlContent(html);
      } catch (err) {
        console.error('InlinePreview: Failed to render template:', err);
      }
    }, 300); // 300ms debounce for snappy WYSIWYG
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [templateId, meta, cp, tp, atp, alur, skenario, kuis, materi, modules]);

  const currentZoom = ZOOM_OPTIONS.find((z) => z.id === zoomId) || ZOOM_OPTIONS[1];
  const iframeWidth = 390;
  const iframeHeight = 720;

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* ── Mini Toolbar ────────────────────────────────── */}
      <div className="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 px-2 py-1.5 flex items-center gap-1.5">
        {/* Template selector */}
        <select
          value={templateId}
          onChange={(e) => setInternalTemplateId(e.target.value as TemplateId)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-[0.65rem] rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
        >
          {TEMPLATE_OPTIONS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.icon} {t.label}
            </option>
          ))}
        </select>

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 bg-zinc-800 rounded-md p-0.5">
          {ZOOM_OPTIONS.map((z) => (
            <button
              key={z.id}
              onClick={() => setZoomId(z.id)}
              className={`px-1 py-0.5 rounded text-[0.55rem] font-medium transition-colors ${
                zoomId === z.id
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <span className="text-[0.55rem] text-zinc-600 ml-auto">
          {title || 'Live Preview'}
        </span>
      </div>

      {/* ── Preview Frame ───────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-2">
        <div
          className="rounded-xl overflow-hidden border border-zinc-700 shadow-lg transition-transform duration-200"
          style={{
            width: `${iframeWidth * currentZoom.scale}px`,
            height: `${iframeHeight * currentZoom.scale}px`,
            transform: `scale(${currentZoom.scale})`,
            transformOrigin: 'top center',
          }}
        >
          <div style={{ width: `${iframeWidth}px`, height: `${iframeHeight}px` }}>
            {htmlContent ? (
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-0"
                title="Inline Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <div className="text-center">
                  <div className="text-xl mb-1 animate-pulse">⏳</div>
                  <div className="text-zinc-500 text-[0.6rem]">Memuat preview...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
