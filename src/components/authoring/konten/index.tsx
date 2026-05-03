'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuthoringStore } from '@/store/authoring-store';
import Skenario from '../Skenario';
import InlinePreview from '../InlinePreview';
import type { TemplateId } from '@/lib/templates/engine/slot-types';
import type { KontenTab } from './shared';
import MateriTab from './MateriTab';
import ModulesTab from './ModulesTab';
import KuisTab from './KuisTab';

// ── Map KontenTab → default TemplateId for preview ──────────────
const TAB_TEMPLATE_MAP: Record<KontenTab, TemplateId> = {
  materi: 'materi-tabicons',
  skenario: 'skenario',
  modules: 'sortir-game',
  kuis: 'kuis',
};

export default function Konten() {
  const [activeTab, setActiveTab] = useState<KontenTab>('materi');
  const [showPreview, setShowPreview] = useState(true);
  const [previewTemplateId, setPreviewTemplateId] = useState<TemplateId>('materi-tabicons');
  const [splitRatio, setSplitRatio] = useState(55); // percentage for left panel
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-switch preview template when tab changes
  useEffect(() => {
    setPreviewTemplateId(TAB_TEMPLATE_MAP[activeTab]);
  }, [activeTab]);

  // ── Drag handler for resizable split-pane ────────────────────
  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitRatio(Math.min(80, Math.max(25, ratio)));
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const tabs: { id: KontenTab; icon: string; label: string }[] = [
    { id: 'materi', icon: '📝', label: 'Materi' },
    { id: 'skenario', icon: '🎭', label: 'Skenario' },
    { id: 'modules', icon: '🧩', label: 'Modul & Game' },
    { id: 'kuis', icon: '❓', label: 'Evaluasi' },
  ];

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      {/* ── Top Bar ────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span>📚</span> Konten Pembelajaran
          </h2>
          <div className="flex-1" />
          {/* Toggle Preview Button */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showPreview
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {showPreview ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Preview Aktif
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                Tampilkan Preview
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Split-Pane: Form + Preview ──────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Form Editor */}
        <div
          className="overflow-y-auto custom-scrollbar"
          style={{ width: showPreview ? `${splitRatio}%` : '100%' }}
        >
          <div className="p-4 pt-2 space-y-4">
            {activeTab === 'materi' && <MateriTab />}
            {activeTab === 'skenario' && <Skenario />}
            {activeTab === 'modules' && <ModulesTab />}
            {activeTab === 'kuis' && <KuisTab />}
          </div>
        </div>

        {/* Resizable Divider */}
        {showPreview && (
          <div
            onMouseDown={handleMouseDown}
            className="flex-shrink-0 w-1.5 bg-zinc-800 hover:bg-amber-500/40 active:bg-amber-500/60 cursor-col-resize transition-colors relative group"
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
            {/* Visual grip dots */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0.5">
              <div className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-amber-400 transition-colors" />
              <div className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-amber-400 transition-colors" />
              <div className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-amber-400 transition-colors" />
            </div>
          </div>
        )}

        {/* Right: Live Preview */}
        {showPreview && (
          <div
            className="flex-1 min-w-0 border-l border-zinc-800"
            style={{ width: `${100 - splitRatio}%` }}
          >
            <InlinePreview
              externalTemplateId={previewTemplateId}
              title={`Preview: ${tabs.find(t => t.id === activeTab)?.label || ''}`}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}
