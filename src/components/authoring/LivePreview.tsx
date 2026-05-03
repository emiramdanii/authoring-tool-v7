'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthoringStore } from '@/store/authoring-store';
import { autoBuildConfig } from '@/lib/templates/auto-build';
import { assembleHTML } from '@/lib/templates/assembly';

// ── Screen definitions for navigation ────────────────────────────
const SCREEN_OPTIONS = [
  { id: 's-cover', label: '🎬 Cover' },
  { id: 's-cp', label: '📋 CP / TP / ATP' },
  { id: 's-sk', label: '🎭 Skenario' },
  { id: 's-materi', label: '📖 Materi & Fungsi' },
  { id: 's-kuis', label: '❓ Kuis' },
  { id: 's-hasil', label: '📊 Hasil' },
];

// ── Device mode options ──────────────────────────────────────────
const DEVICE_MODES = [
  { id: 'mobile' as const, label: '📱', width: 390 },
  { id: 'tablet' as const, label: '📋', width: 768 },
  { id: 'desktop' as const, label: '🖥️', width: 0 }, // 0 = 100%
];

type DeviceMode = 'mobile' | 'tablet' | 'desktop';

export default function LivePreview() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [activeScreen, setActiveScreen] = useState('s-cover');
  const [htmlContent, setHtmlContent] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Subscribe to all relevant store slices
  const meta = useAuthoringStore((s) => s.meta);
  const cp = useAuthoringStore((s) => s.cp);
  const tp = useAuthoringStore((s) => s.tp);
  const atp = useAuthoringStore((s) => s.atp);
  const alur = useAuthoringStore((s) => s.alur);
  const skenario = useAuthoringStore((s) => s.skenario);
  const kuis = useAuthoringStore((s) => s.kuis);
  const materi = useAuthoringStore((s) => s.materi);
  const modules = useAuthoringStore((s) => s.modules);
  const games = useAuthoringStore((s) => s.games);
  const dirty = useAuthoringStore((s) => s.dirty);

  // Generate HTML using the NEW assembly pipeline (autoBuildConfig + assembleHTML)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const config = autoBuildConfig({
          meta, cp, tp, atp, alur, skenario, kuis, modules, games, materi,
          pertemuanKe: 1,
        });
        const html = assembleHTML(config);
        setHtmlContent(html);
      } catch (err) {
        console.error('Failed to generate preview HTML:', err);
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [meta, cp, tp, atp, alur, skenario, kuis, materi, modules, games]);

  // Build srcdoc with navigation override — ONLY depends on htmlContent
  // activeScreen is NOT in dependencies so iframe doesn't re-render on screen change
  const srcdoc = useMemo(() => {
    if (!htmlContent) return '';
    // The new assembly pipeline uses goto(id) function in JS
    const navScript = `
<script>
  (function(){
    // Override goto to notify parent for screen sync
    var _origGoto = window.goto;
    window.goto = function(id) {
      if (_origGoto) _origGoto(id);
      window.parent.postMessage({ type: 'screenChange', screen: id }, '*');
    };
    // Also override goScreen if it exists (backward compat)
    var _origGoScreen = window.goScreen;
    window.goScreen = function(id) {
      if (_origGoScreen) _origGoScreen(id);
      window.parent.postMessage({ type: 'screenChange', screen: id }, '*');
    };
    // Listen for navigateTo commands from parent
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'navigateTo' && e.data.screen) {
        if (_origGoto) _origGoto(e.data.screen);
        else if (_origGoScreen) _origGoScreen(e.data.screen);
        window.parent.postMessage({ type: 'screenChange', screen: e.data.screen }, '*');
      }
    });
    // Navigate to initial screen on first load
    function navToInitial() {
      var target = '${activeScreen}';
      if (target && (window.goto || window.goScreen)) {
        if (window.goto) window.goto(target);
        else if (window.goScreen) window.goScreen(target);
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', navToInitial);
    } else {
      navToInitial();
    }
  })();
<\/script>`;
    return htmlContent.replace('</body>', navScript + '\n</body>');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlContent]);

  // Listen for screen changes from iframe — sync dropdown only, do NOT re-render iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'screenChange' && e.data.screen) {
        setActiveScreen(e.data.screen);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Navigate iframe to a specific screen when user changes the dropdown
  const handleScreenSelect = (screenId: string) => {
    setActiveScreen(screenId);
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'navigateTo', screen: screenId }, '*');
    }
  };

  const currentDevice = DEVICE_MODES.find((d) => d.id === deviceMode) || DEVICE_MODES[0];

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center gap-3">
        {/* Device mode buttons */}
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5">
          {DEVICE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setDeviceMode(mode.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                deviceMode === mode.id
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
              }`}
              title={mode.id.charAt(0).toUpperCase() + mode.id.slice(1)}
            >
              {mode.label}
              {mode.width > 0 && (
                <span className="ml-1 text-[0.6rem] opacity-60">{mode.width}px</span>
              )}
            </button>
          ))}
        </div>

        {/* Screen navigation */}
        <select
          value={activeScreen}
          onChange={(e) => handleScreenSelect(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
        >
          {SCREEN_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Status indicators */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                dirty ? 'bg-amber-400' : 'bg-zinc-600'
              }`}
            />
            <span className="text-[0.65rem] text-zinc-500">
              {dirty ? 'Perubahan belum disimpan' : 'Tersimpan'}
            </span>
          </div>
          <span className="text-[0.65rem] text-zinc-600">
            Auto-refresh 500ms
          </span>
        </div>
      </div>

      {/* ── Preview Area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-start justify-start overflow-hidden bg-zinc-950">
        {/* Clear identification banner */}
        <div className="flex-shrink-0 w-full bg-gradient-to-r from-emerald-600/90 to-cyan-600/90 text-white text-xs font-bold px-4 py-2 flex items-center gap-2 z-10">
          <span className="flex items-center gap-1.5">
            <span className="bg-white/20 rounded px-1.5 py-0.5 text-[0.65rem]">📱</span>
            <span>PREVIEW APLIKASI SISWA</span>
          </span>
          <span className="text-[0.65rem] opacity-75 font-normal">
            — Tampilan persis seperti yang dilihat siswa saat belajar
          </span>
          <span className="ml-auto flex items-center gap-2">
            <span className="bg-white/20 rounded px-2 py-0.5 text-[0.65rem]">
              Navigasi bebas &middot; Kuis interaktif &middot; Skor otomatis
            </span>
          </span>
        </div>

        {/* Device frame */}
        <div className="flex-1 flex items-start justify-center overflow-auto p-4">
          <div
            className="rounded-xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/5 transition-all duration-300"
            style={{
              width: currentDevice.width > 0 ? `${currentDevice.width}px` : '100%',
              maxWidth: currentDevice.width > 0 ? undefined : '100%',
              height: currentDevice.width > 0 ? 'min(720px, calc(100vh - 160px))' : 'calc(100vh - 160px)',
            }}
          >
            {htmlContent ? (
              <iframe
                ref={iframeRef}
                srcDoc={srcdoc}
                className="w-full h-full border-0"
                title="Preview Aplikasi Siswa"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <div className="text-center">
                  <div className="text-3xl mb-3 animate-pulse">⏳</div>
                  <div className="text-zinc-400 text-sm">Membuat preview...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
