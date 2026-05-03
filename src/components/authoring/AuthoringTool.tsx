'use client';

import { useState, useEffect, useCallback, Component } from 'react';
import dynamic from 'next/dynamic';
import { useAuthoringStore } from '@/store/authoring-store';
import type { PanelId } from '@/store/authoring-store';

// ── Error Boundary for dynamic chunks ────────────────────────────
type EBProps = { children: React.ReactNode; fallback?: React.ReactNode };
type EBState = { hasError: boolean; error: Error | null };

class DynamicErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="h-full w-full flex items-center justify-center bg-zinc-950">
          <div className="text-center max-w-md px-6">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-zinc-200 font-semibold mb-2">Gagal memuat komponen</div>
            <div className="text-zinc-400 text-sm mb-4">{this.state.error?.message || 'ChunkLoadError'}</div>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import Dashboard from './Dashboard';
import Dokumen from './Dokumen';
import Konten from './Konten';
import AutoGenerate from './AutoGenerate';
import Projects from './Projects';
import ImportExport from './ImportExport';
import Riwayat from './Riwayat';
import LivePreview from './LivePreview';

// Lazy-load CanvaBuilder (heavy component, SSR disabled)
const CanvaBuilder = dynamic(() => import('@/components/canva/CanvaBuilder'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🎨</div>
        <div className="text-zinc-400 text-sm">Memuat Canva Editor...</div>
      </div>
    </div>
  ),
});

// ── Navigation items ─────────────────────────────────────────────
interface NavItem {
  id: PanelId;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'dokumen', icon: '📐', label: 'Dokumen' },
  { id: 'konten', icon: '📚', label: 'Konten' },
  { id: 'canva', icon: '🎨', label: 'Canva' },
  { id: 'autogen', icon: '⚡', label: 'Auto-Generate' },
];

const NAV_ITEMS_2: NavItem[] = [
  { id: 'projects', icon: '📁', label: 'Proyek' },
  { id: 'import', icon: '📥', label: 'Import/Export' },
  { id: 'preview', icon: '📱', label: 'Preview Aplikasi' },
  { id: 'versions', icon: '🕐', label: 'Riwayat' },
];

const PANEL_TITLES: Record<PanelId, string> = {
  dashboard: 'Dashboard',
  dokumen: 'Dokumen',
  konten: 'Konten Pembelajaran',
  canva: 'Canva Editor',
  autogen: 'Auto-Generate',
  projects: 'Kelola Proyek',
  import: 'Import / Export',
  preview: 'Preview Aplikasi Siswa',
  versions: 'Riwayat Versi',
};

// ── Guided Tour Config ──────────────────────────────────────────
const TOUR_STEPS = [
  { title: 'Sidebar', desc: 'Gunakan sidebar untuk berpindah antar panel editor.' },
  { title: 'Dashboard', desc: 'Dashboard menampilkan kelengkapan dan quick actions.' },
  { title: 'Dokumen', desc: 'Isi Meta, CP, TP, ATP, dan Alur di panel Dokumen.' },
  { title: 'Import', desc: 'Import data dari Excel atau JSON di panel Import.' },
  { title: 'Auto-Generate', desc: 'Gunakan AI untuk generate konten otomatis.' },
  { title: 'Preview', desc: 'Preview media pembelajaran sebelum export.' },
];

// ── Main Component ──────────────────────────────────────────────
export default function AuthoringTool() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTour, setShowTour] = useState(() => localStorage.getItem('at_tour_done') === null);
  const [tourStep, setTourStep] = useState(0);
  const activePanel = useAuthoringStore((s) => s.activePanel);
  const setActivePanel = useAuthoringStore((s) => s.setActivePanel);
  const dirty = useAuthoringStore((s) => s.dirty);
  const meta = useAuthoringStore((s) => s.meta);
  const saveToStorage = useAuthoringStore((s) => s.saveToStorage);
  const loadFromStorage = useAuthoringStore((s) => s.loadFromStorage);

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Auto-save every 8s when dirty
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      const s = useAuthoringStore.getState();
      if (s.dirty) {
        try {
          const data = {
            meta: s.meta, cp: s.cp, tp: s.tp, atp: s.atp, alur: s.alur,
            skenario: s.skenario, kuis: s.kuis, modules: s.modules,
            games: s.games, materi: s.materi, guruPw: s.guruPw,
          };
          localStorage.setItem('at_state_v1', JSON.stringify(data));
          useAuthoringStore.setState({ dirty: false });
        } catch { /* ignore */ }
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [dirty]);

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveToStorage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveToStorage]);

  const exportJSON = useCallback(() => {
    const s = useAuthoringStore.getState();
    const data = {
      meta: s.meta, cp: s.cp, tp: s.tp, atp: s.atp, alur: s.alur,
      skenario: s.skenario, kuis: s.kuis, modules: s.modules,
      games: s.games, materi: s.materi,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `authoring-tool-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard': return <Dashboard />;
      case 'dokumen': return <Dokumen />;
      case 'konten': return <Konten />;
      case 'canva': return <DynamicErrorBoundary><CanvaBuilder /></DynamicErrorBoundary>;
      case 'autogen': return <AutoGenerate />;
      case 'projects': return <Projects />;
      case 'import': return <ImportExport />;
      case 'preview': return <LivePreview />;
      case 'versions': return <Riwayat />;
      default: return <Dashboard />;
    }
  };

  // For Canva panel, render full-bleed (no padding)
  const isCanva = activePanel === 'canva';
  // For Preview panel, render full-bleed (no header)
  const isPreview = activePanel === 'preview';

  // ── Tour: dismiss / advance ────────────────────────────────
  const dismissTour = useCallback(() => {
    setShowTour(false);
    localStorage.setItem('at_tour_done', '1');
  }, []);

  const nextTourStep = useCallback(() => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep((s) => s + 1);
    } else {
      dismissTour();
    }
  }, [tourStep, dismissTour]);

  return (
    <div className="h-screen w-screen flex bg-zinc-950 text-zinc-200 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`${
          sidebarOpen ? 'w-56' : 'w-14'
        } flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-200`}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b border-zinc-800">
          {sidebarOpen ? (
            <div>
              <div className="text-sm font-bold text-zinc-100">Authoring Tool</div>
              <div className="text-[0.65rem] text-zinc-500 mt-0.5">Media Pembelajaran Interaktif</div>
              <span className="inline-block mt-1 text-[0.6rem] font-semibold bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded">
                v3.0
              </span>
            </div>
          ) : (
            <div className="text-center text-lg">📝</div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                activePanel === item.id
                  ? 'bg-amber-500/15 text-amber-400 font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
              title={item.label}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}

          {/* Divider */}
          <div className="my-2 border-t border-zinc-800" />

          {NAV_ITEMS_2.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                activePanel === item.id
                  ? 'bg-amber-500/15 text-amber-400 font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
              title={item.label}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-zinc-800 space-y-1.5">
            <button
              onClick={saveToStorage}
              className="w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              💾 Simpan Semua
            </button>
            <button
              onClick={exportJSON}
              className="w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              📤 Export JSON
            </button>
          </div>
        )}
      </aside>

      {/* ── Main Area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Header ───────────────────────────────────────── */}
        {!isCanva && !isPreview && (
          <header className="h-12 flex-shrink-0 bg-zinc-900 border-b border-zinc-800 flex items-center gap-3 px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors text-lg w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800"
            >
              {sidebarOpen ? '☰' : '▶'}
            </button>

            <div className="text-sm font-medium text-zinc-200">
              {PANEL_TITLES[activePanel]}
              <span className="text-zinc-500 font-normal"> / {meta.judulPertemuan || 'Proyek Baru'}</span>
            </div>

            {/* Dirty indicator */}
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 transition-opacity duration-300 ${
                dirty ? 'bg-amber-400 opacity-100' : 'opacity-0'
              }`}
              title="Perubahan belum disimpan"
            />

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setActivePanel('preview')}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-500/20"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Preview Aplikasi
              </button>
              <button
                onClick={() => setActivePanel('canva')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                🎨 Canva
              </button>
              <button
                onClick={() => setActivePanel('import')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors"
              >
                📥 Import
              </button>
              <button
                onClick={saveToStorage}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg transition-colors"
              >
                💾 Simpan
              </button>
            </div>
          </header>
        )}

        {/* ── Content ──────────────────────────────────────── */}
        <main
          className={`flex-1 overflow-y-auto ${
            isCanva || isPreview ? '' : 'bg-zinc-950'
          }`}
        >
          {renderPanel()}
        </main>
      </div>

      {/* ── Guided Tour Overlay ────────────────────────────── */}
      {showTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Tooltip Card */}
          <div className="relative z-10 w-full max-w-sm mx-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
              {/* Step icon + badge */}
              <div className="bg-amber-500/10 px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-lg">
                    📍
                  </div>
                  <div>
                    <div className="text-xs font-medium text-amber-400/70">
                      Langkah {tourStep + 1} dari {TOUR_STEPS.length}
                    </div>
                    <h3 className="text-base font-bold text-zinc-100">
                      {TOUR_STEPS[tourStep].title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-5 py-4">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {TOUR_STEPS[tourStep].desc}
                </p>
              </div>

              {/* Step dots */}
              <div className="px-5 pb-2 flex justify-center gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      i === tourStep
                        ? 'w-5 bg-amber-500'
                        : 'w-1.5 bg-zinc-600'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 pt-3 flex items-center gap-3">
                <button
                  onClick={dismissTour}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Lewati
                </button>
                <button
                  onClick={nextTourStep}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-black bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
                >
                  {tourStep < TOUR_STEPS.length - 1 ? 'Berikutnya →' : 'Mulai ✨'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
