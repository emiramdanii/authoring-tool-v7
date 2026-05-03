'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { assembleSingleScreen } from '@/lib/templates/assembly';
import type { TemplateId, ScreenSlotData } from '@/lib/templates/engine/slot-types';
import type { ColorPalette } from './types';

// ── Known template IDs that have registry renderers ────────────
const KNOWN_TEMPLATES: string[] = [
  'cover', 'petunjuk', 'dokumen', 'tujuan', 'review',
  'materi-tabicons', 'materi-accordion', 'diskusi-timer',
  'sortir-game', 'roda-game', 'hubungan-konsep',
  'flashcard', 'kuis', 'skenario',
  'hasil', 'refleksi', 'penutup',
];

// ── Legacy → new template mapping ──────────────────────────────
const LEGACY_MAP: Record<string, TemplateId> = {
  hero: 'cover',
  materi: 'materi-tabicons',
  game: 'sortir-game',
};

interface TemplatePreviewProps {
  templateType: string;
  templateData: Record<string, unknown>;
  colorPalette: ColorPalette | null;
}

/**
 * TemplatePreview — renders a template page inside an iframe using
 * the SAME assembly pipeline as the export. This ensures the
 * Canva preview is IDENTICAL to the exported HTML file.
 *
 * Uses iframe for CSS isolation (the export CSS would conflict
 * with the parent page's Tailwind styles).
 */
export default function TemplatePreview({
  templateType,
  templateData,
  colorPalette,
}: TemplatePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Resolve template ID (map legacy types)
  const resolvedId = useMemo<TemplateId>(() => {
    if (KNOWN_TEMPLATES.includes(templateType)) {
      return templateType as TemplateId;
    }
    return LEGACY_MAP[templateType] || 'cover';
  }, [templateType]);

  // Build CSS vars from color palette
  const cssVars = useMemo(() => {
    if (!colorPalette?.mapping) return undefined;
    const vars: Record<string, string> = {};
    for (const [k, v] of Object.entries(colorPalette.mapping)) {
      vars[k] = v;
    }
    return vars;
  }, [colorPalette]);

  // Build slot data with _templateId field
  const slotData = useMemo<ScreenSlotData>(() => {
    return { ...templateData, _templateId: resolvedId } as unknown as ScreenSlotData;
  }, [resolvedId, templateData]);

  // Generate HTML using the assembly pipeline (same as export!)
  const html = useMemo(() => {
    try {
      return assembleSingleScreen(resolvedId, slotData, cssVars);
    } catch (e) {
      console.warn('[TemplatePreview] assembly failed:', e);
      return `<!DOCTYPE html><html><body style="background:#0e1c2f;color:#fff;padding:20px;font-family:sans-serif">
        <p style="color:#f87171">Preview rendering error</p>
        <p style="color:rgba(255,255,255,.5);font-size:12px">${String(e)}</p>
      </body></html>`;
    }
  }, [resolvedId, slotData, cssVars]);

  // Reset loaded state when HTML changes
  useEffect(() => {
    setLoaded(false);
  }, [html]);

  return (
    <div className="absolute inset-0" style={{ background: '#0e1c2f' }}>
      {/* Loading indicator */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0e1c2f', zIndex: 1 }}>
          <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '12px' }}>
            Memuat preview...
          </div>
        </div>
      )}

      {/* Iframe with same HTML as export */}
      <iframe
        ref={iframeRef}
        srcDoc={html}
        className="absolute inset-0 w-full h-full border-0"
        title={`Preview: ${templateType}`}
        sandbox="allow-scripts"
        onLoad={() => setLoaded(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
    </div>
  );
}
