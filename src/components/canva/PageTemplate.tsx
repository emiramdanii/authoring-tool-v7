'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import { useAuthoringStore } from '@/store/authoring-store';
import type { CanvaPage, ColorPalette } from './types';
import { getPaletteColor } from '@/lib/color-palette';
import QuizWidget from './QuizWidget';
import GameWidget from './GameWidget';

// ═══════════════════════════════════════════════════════════════
// PAGE TEMPLATE — Full-page template renderer with editable zones
// Each template type renders a complete page layout with
// content from the authoring store. Text zones are editable.
// ═══════════════════════════════════════════════════════════════

interface PageTemplateProps {
  page: CanvaPage;
  isSelected: boolean;
  onEditField: (key: string, value: string) => void;
}

// Internal props for individual template components
interface TemplateInternalProps {
  td: Record<string, unknown>;
  palette: ColorPalette | null;
  isSelected: boolean;
  onEditField: (key: string, value: string) => void;
}

export default function PageTemplate({ page, isSelected, onEditField }: PageTemplateProps) {
  const td = page.templateData;
  const palette = page.colorPalette;

  switch (page.templateType) {
    case 'cover':
      return <CoverTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'dokumen':
      return <DokumenTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'materi':
      return <MateriTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'kuis':
      return <KuisTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'game':
      return <GameTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'hasil':
      return <HasilTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'hero':
      return <HeroTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'skenario':
      return <SkenarioTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    // ── New 16-type templates ──
    case 'tujuan':
      return <TujuanTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'review':
      return <ReviewTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'materi-tabicons':
      return <MateriTabIconsTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'materi-accordion':
      return <MateriAccordionTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'diskusi-timer':
      return <DiskusiTimerTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'sortir-game':
      return <SortirGameTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'roda-game':
      return <RodaGameTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'hubungan-konsep':
      return <HubunganKonsepTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'flashcard':
      return <FlashcardTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'refleksi':
      return <RefleksiTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    case 'penutup':
      return <PenutupTemplate td={td} palette={palette} isSelected={isSelected} onEditField={onEditField} />;
    default:
      return null;
  }
}

// ── Editable Text Zone ────────────────────────────────────────

function EditableText({
  value,
  fieldKey,
  isSelected,
  onEdit,
  className = '',
  style = {},
  placeholder = 'Ketik di sini...',
}: {
  value: string;
  fieldKey: string;
  isSelected: boolean;
  onEdit: (key: string, value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleBlur = useCallback(() => {
    if (ref.current) {
      onEdit(fieldKey, ref.current.textContent || '');
    }
  }, [fieldKey, onEdit]);

  return (
    <div
      ref={ref}
      contentEditable={isSelected}
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`outline-none ${isSelected ? 'ring-1 ring-amber-400/40 ring-offset-2 ring-offset-transparent rounded' : ''} ${className}`}
      style={style}
    >
      {value || placeholder}
    </div>
  );
}

// ── Cover Template ────────────────────────────────────────────

function CoverTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#f9c82e');
  const bg = getPaletteColor(palette, '--bg', '#0f172a');

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
      style={{ background: `linear-gradient(180deg, ${bg} 0%, ${bg}dd 100%)` }}>

      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5"
        style={{ background: `linear-gradient(90deg, ${accent}, ${getPaletteColor(palette, '--c', '#3ecfcf')}, ${accent})` }} />

      {/* Icon */}
      <div className="text-5xl mb-4 animate-bounce"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.3))' }}>
        {String(td.icon || '📚')}
      </div>

      {/* Title */}
      <EditableText
        value={String(td.title || '')}
        fieldKey="title"
        isSelected={isSelected}
        onEdit={onEditField}
        className="font-black text-white leading-tight"
        style={{ fontSize: 'clamp(18px, 3.5%, 32px)', textShadow: '0 2px 12px rgba(0,0,0,.5)' }}
        placeholder="Judul Pertemuan"
      />

      {/* Subtitle */}
      <EditableText
        value={String(td.subtitle || '')}
        fieldKey="subtitle"
        isSelected={isSelected}
        onEdit={onEditField}
        className="mt-2"
        style={{ fontSize: 'clamp(10px, 1.8%, 16px)', color: 'rgba(255,255,255,.7)' }}
        placeholder="Subjudul / Deskripsi"
      />

      {/* Badge */}
      {(td.mapel || td.kelas) && (
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: `${accent}20`,
            border: `1px solid ${accent}40`,
            color: accent,
          }}>
          {String(td.mapel || '')} {td.kelas ? `• Kelas ${td.kelas}` : ''}
        </div>
      )}

      {/* Decorative bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
        {[accent, getPaletteColor(palette, '--c', '#3ecfcf'), getPaletteColor(palette, '--g', '#34d399')].map((c, i) => (
          <div key={i} className="w-8 h-1 rounded-full" style={{ background: c, opacity: 0.6 }} />
        ))}
      </div>
    </div>
  );
}

// ── Dokumen Template (CP/TP/ATP) ─────────────────────────────

function DokumenTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#f9c82e');
  const accent2 = getPaletteColor(palette, '--c', '#3ecfcf');
  const cp = td.cp as Record<string, unknown> | undefined;
  const tpItems = (td.tp as Array<Record<string, unknown>>) || [];
  const atp = td.atp as Record<string, unknown> | undefined;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>📋</div>
        <div>
          <div className="font-black text-white text-sm">Dokumen Kurikulum</div>
          <div className="text-[9px] text-white/40">Capaian Pembelajaran • Tujuan Pembelajaran</div>
        </div>
      </div>

      {/* CP Section */}
      {cp && (
        <div className="mb-3 p-3 rounded-lg" style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}>
          <div className="text-[10px] font-bold mb-1" style={{ color: accent }}>Capaian Pembelajaran</div>
          <div className="text-[9px] text-white/80 leading-relaxed line-clamp-4">
            {String(cp.capaianFase || 'Belum diisi')}
          </div>
          {Array.isArray(cp.profil) && (cp.profil as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(cp.profil as string[]).slice(0, 4).map((p, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[7px] font-bold"
                  style={{ background: `${accent}15`, color: accent }}>
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TP Items */}
      {tpItems.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="text-[10px] font-bold mb-1.5" style={{ color: accent2 }}>Tujuan Pembelajaran</div>
          <div className="space-y-1">
            {tpItems.map((tp, i) => (
              <div key={i} className="flex items-start gap-1.5 px-2 py-1 rounded-md bg-white/5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: String(tp.color || accent2) + '30', color: String(tp.color || accent2) }}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] font-bold" style={{ color: String(tp.color || accent2) }}>
                    {String(tp.verb || '')}
                  </span>
                  <span className="text-[8px] text-white/70 ml-0.5">{String(tp.desc || '').slice(0, 80)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!cp?.capaianFase && tpItems.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-3xl mb-2">📋</span>
          <span className="text-[10px]">Isi data CP & TP di panel Dokumen</span>
        </div>
      )}
    </div>
  );
}

// ── Materi Template ───────────────────────────────────────────

function MateriTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#a78bfa');
  const accent2 = getPaletteColor(palette, '--c', '#3ecfcf');
  const blok = (td.blok as Array<Record<string, unknown>>) || [];
  const modules = (td.modules as Array<Record<string, unknown>>) || [];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>📝</div>
        <div>
          <EditableText
            value="Materi Pembelajaran"
            fieldKey="materiTitle"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Materi"
          />
          <div className="text-[9px] text-white/40">{blok.length} blok • {modules.length} modul</div>
        </div>
      </div>

      {/* Materi Blocks */}
      {blok.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {blok.map((b, i) => (
            <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10">
              {b.judul && <div className="text-[10px] font-bold text-white mb-0.5">{String(b.judul)}</div>}
              {b.isi && <div className="text-[8px] text-white/70 leading-relaxed line-clamp-3">{String(b.isi)}</div>}
              {b.icon && <span className="text-sm mr-1">{String(b.icon)}</span>}
              {Array.isArray(b.butir) && (
                <div className="space-y-0.5 mt-1">
                  {(b.butir as string[]).slice(0, 4).map((item, j) => (
                    <div key={j} className="text-[8px] text-white/60 flex items-start gap-1">
                      <span className="text-[7px] mt-0.5">•</span>
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Module Cards */}
      {modules.length > 0 && (
        <div className="mt-2 space-y-1">
          {modules.slice(0, 3).map((m, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
              <span className="text-sm">{getModuleIcon(String(m.type))}</span>
              <div className="min-w-0">
                <div className="text-[9px] font-bold text-white truncate">{String(m.title || m.type)}</div>
                <div className="text-[7px] text-white/40">{String(m.type)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {blok.length === 0 && modules.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-3xl mb-2">📝</span>
          <span className="text-[10px]">Tambah materi di panel Konten → Materi</span>
        </div>
      )}
    </div>
  );
}

// ── Kuis Template ─────────────────────────────────────────────

function KuisTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#f5c842');
  const kuisData = (td.kuis as Array<Record<string, unknown>>) || [];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2"
        style={{ background: `linear-gradient(90deg, ${accent}15, transparent)` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>❓</div>
        <div>
          <EditableText
            value="Kuis Interaktif"
            fieldKey="kuisTitle"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-sm"
            style={{ color: accent }}
            placeholder="Judul Kuis"
          />
          <div className="text-[9px] text-white/40">{kuisData.length} soal</div>
        </div>
        <div className="ml-auto px-2 py-1 rounded-lg text-[9px] font-bold"
          style={{ background: `${accent}15`, color: accent }}>
          ⭐ 0
        </div>
      </div>

      {/* Quiz Widget */}
      <div className="flex-1 min-h-0 px-3 pb-3">
        {kuisData.length > 0 ? (
          <QuizWidget compact />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/30">
            <span className="text-3xl mb-2">❓</span>
            <span className="text-[10px]">Tambah soal di panel Konten → Evaluasi</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Game Template ─────────────────────────────────────────────

function GameTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--c', '#3ecfcf');
  const games = (td.games as Array<Record<string, unknown>>) || [];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2"
        style={{ background: `linear-gradient(90deg, ${accent}15, transparent)` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>🎮</div>
        <div>
          <EditableText
            value="Game Interaktif"
            fieldKey="gameTitle"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-sm"
            style={{ color: accent }}
            placeholder="Judul Game"
          />
          <div className="text-[9px] text-white/40">{games.length} game tersedia</div>
        </div>
        <div className="ml-auto px-2 py-1 rounded-lg text-[9px] font-bold"
          style={{ background: `${accent}15`, color: accent }}>
          🏆 0
        </div>
      </div>

      {/* Game selection or widget */}
      <div className="flex-1 min-h-0 px-3 pb-3">
        {games.length > 0 ? (
          <div className="space-y-2">
            {/* Show first game as main widget */}
            <GameWidget dataIdx={getGameModuleIndex(games[0])} compact />

            {/* Show other games as selectable cards */}
            {games.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {games.map((g, i) => (
                  <button key={i}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-colors"
                    style={{
                      background: i === 0 ? `${accent}15` : 'rgba(255,255,255,.05)',
                      border: `1px solid ${i === 0 ? accent + '30' : 'rgba(255,255,255,.1)'}`,
                    }}>
                    <span className="text-sm">{getGameIcon(String(g.type))}</span>
                    <span className="text-[8px] font-bold text-white truncate max-w-[60px]">
                      {String(g.title || g.type)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/30">
            <span className="text-3xl mb-2">🎮</span>
            <span className="text-[10px]">Tambah game di panel Konten → Modul</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hasil Template ────────────────────────────────────────────

function HasilTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--g', '#34d399');
  const totalKuis = (td.totalKuis as number) || 0;
  const namaBab = String(td.namaBab || '');

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
      {/* Trophy */}
      <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 4px 16px rgba(52,211,153,.3))' }}>🏆</div>

      {/* Title */}
      <EditableText
        value="Hasil Belajar"
        fieldKey="hasilTitle"
        isSelected={isSelected}
        onEdit={onEditField}
        className="font-black mb-2"
        style={{ fontSize: 'clamp(16px, 3%, 28px)', color: accent }}
        placeholder="Judul Hasil"
      />

      {/* Score Circle */}
      <div className="relative w-24 h-24 rounded-full flex items-center justify-center mb-4"
        style={{
          background: `conic-gradient(${accent} 0%, ${accent}20 0%)`,
          boxShadow: `0 0 40px ${accent}30`,
        }}>
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
          <span className="text-2xl font-black" style={{ color: accent }}>0%</span>
        </div>
      </div>

      {/* Info */}
      {totalKuis > 0 && (
        <div className="text-[10px] text-white/50 mb-3">
          {totalKuis} soal kuis telah diselesaikan
        </div>
      )}

      {/* Appreciation levels */}
      <div className="flex gap-3 mt-2">
        {[
          { label: 'Sangat Baik', pct: 85, color: '#34d399' },
          { label: 'Baik', pct: 70, color: '#f9c82e' },
          { label: 'Perlu Latihan', pct: 0, color: '#f87171' },
        ].map((level) => (
          <div key={level.label} className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full mb-0.5" style={{ background: level.color + '40', border: `1px solid ${level.color}` }} />
            <span className="text-[7px] text-white/40">{level.label}</span>
          </div>
        ))}
      </div>

      {/* Bab name */}
      {namaBab && (
        <div className="absolute bottom-4 text-[9px] text-white/30">{namaBab}</div>
      )}
    </div>
  );
}

// ── Hero Template ─────────────────────────────────────────────

function HeroTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#f9c82e');

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
      style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)' }}>

      {/* Icon */}
      <div className="text-4xl mb-3">{String(td.icon || '🚀')}</div>

      {/* Title */}
      <EditableText
        value={String(td.title || '')}
        fieldKey="title"
        isSelected={isSelected}
        onEdit={onEditField}
        className="font-black text-white leading-tight"
        style={{ fontSize: 'clamp(16px, 3%, 28px)', textShadow: '0 2px 12px rgba(0,0,0,.5)' }}
        placeholder="Hero Title"
      />

      {/* Subtitle */}
      <EditableText
        value={String(td.subtitle || '')}
        fieldKey="subtitle"
        isSelected={isSelected}
        onEdit={onEditField}
        className="mt-2"
        style={{ fontSize: 'clamp(10px, 1.6%, 14px)', color: 'rgba(255,255,255,.6)' }}
        placeholder="Subjudul"
      />

      {/* CTA Button */}
      {td.cta && (
        <div className="mt-5 px-5 py-2 rounded-xl font-bold text-sm"
          style={{ background: accent, color: '#000' }}>
          {String(td.cta)}
        </div>
      )}

      {/* Chips */}
      {td.chips && (
        <div className="flex gap-2 mt-3">
          {String(td.chips).split(',').map((chip, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[8px] font-bold"
              style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
              {chip.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skenario Template ─────────────────────────────────────────

function SkenarioTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--r', '#f472b6');
  const skenario = (td.skenario as Array<Record<string, unknown>>) || [];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>🎭</div>
        <div>
          <EditableText
            value="Skenario Interaktif"
            fieldKey="skenarioTitle"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-sm"
            style={{ color: accent }}
            placeholder="Judul Skenario"
          />
          <div className="text-[9px] text-white/40">{skenario.length} babak</div>
        </div>
      </div>

      {/* Chapter cards */}
      {skenario.length > 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {skenario.map((ch, i) => (
            <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{String(ch.charEmoji || '🧑')}</span>
                <span className="text-[10px] font-bold text-white">Babak {i + 1}</span>
                {ch.title && <span className="text-[8px] text-white/40 truncate">{String(ch.title)}</span>}
              </div>
              {ch.choicePrompt && (
                <div className="text-[8px] text-white/50 italic">{String(ch.choicePrompt)}</div>
              )}
              {Array.isArray(ch.choices) && (
                <div className="flex gap-1 mt-1">
                  {(ch.choices as Array<Record<string, unknown>>).map((c, j) => (
                    <div key={j} className="px-1.5 py-0.5 rounded text-[7px]"
                      style={{
                        background: c.good ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)',
                        color: c.good ? '#34d399' : '#f87171',
                      }}>
                      {String(c.icon || '🤔')} {String(c.label || `Pilihan ${j + 1}`)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-3xl mb-2">🎭</span>
          <span className="text-[10px]">Tambah skenario di panel Konten → Skenario</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NEW 16-TYPE TEMPLATES
// ═══════════════════════════════════════════════════════════════

// ── Tujuan Template (Tujuan Pembelajaran full page) ───────────

function TujuanTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#f5c842');
  const accent2 = getPaletteColor(palette, '--c', '#3ecfcf');
  const tpItems = (td.tpItems as Array<Record<string, unknown>>) || [];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>🎯</div>
        <div>
          <EditableText
            value={String(td.title || 'Tujuan Pembelajaran')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Tujuan Pembelajaran"
          />
          <div className="text-[9px] text-white/40">{tpItems.length} tujuan</div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="h-px mb-3"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

      {/* TP Items with numbered badges */}
      {tpItems.length > 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {tpItems.map((tp, i) => {
            const itemColor = String(tp.color || accent2);
            return (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg"
                style={{
                  background: `${itemColor}08`,
                  border: `1px solid ${itemColor}20`,
                }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5"
                  style={{
                    background: `${itemColor}25`,
                    color: itemColor,
                    boxShadow: `0 0 8px ${itemColor}20`,
                  }}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold" style={{ color: itemColor }}>
                    {String(tp.verb || '')}
                  </span>
                  <span className="text-[9px] text-white/70 ml-1">{String(tp.desc || '')}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-4xl mb-2">🎯</span>
          <span className="text-[10px]">Tambah TP di panel Konten → Tujuan</span>
        </div>
      )}
    </div>
  );
}

// ── Review Template (Q&A flip cards) ──────────────────────────

function ReviewTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#fb923c');
  const questions = (td.questions as Array<Record<string, unknown>>) || [];
  const [flippedIdx, setFlippedIdx] = useState<Set<number>>(new Set());

  const toggleFlip = (i: number) => {
    setFlippedIdx(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>🔄</div>
        <div>
          <EditableText
            value={String(td.title || 'Review')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Review"
          />
          <div className="text-[9px] text-white/40">{questions.length} pertanyaan • klik untuk balik</div>
        </div>
      </div>

      {/* Flip cards */}
      {questions.length > 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {questions.map((q, i) => {
            const isFlipped = flippedIdx.has(i);
            return (
              <div key={i}
                className="cursor-pointer"
                style={{ perspective: '600px' }}
                onClick={() => toggleFlip(i)}
              >
                <div className="relative w-full rounded-lg overflow-hidden"
                  style={{
                    transition: 'transform 0.5s',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    minHeight: '48px',
                  }}>
                  {/* Front — Question */}
                  <div className="p-3 rounded-lg"
                    style={{
                      backfaceVisibility: 'hidden',
                      background: `${accent}12`,
                      border: `1px solid ${accent}30`,
                    }}>
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${accent}20`, color: accent }}>Q</span>
                      <span className="text-[9px] text-white/90 leading-relaxed">{String(q.q || '')}</span>
                    </div>
                  </div>
                  {/* Back — Answer */}
                  <div className="absolute inset-0 p-3 rounded-lg"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: 'rgba(52,211,153,.1)',
                      border: '1px solid rgba(52,211,153,.3)',
                    }}>
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">A</span>
                      <span className="text-[9px] text-white/90 leading-relaxed">{String(q.answer || '')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-4xl mb-2">🔄</span>
          <span className="text-[10px]">Tambah pertanyaan review di panel Konten</span>
        </div>
      )}
    </div>
  );
}

// ── Materi Tab Icons Template ─────────────────────────────────

function MateriTabIconsTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#a78bfa');
  const tabs = (td.tabs as Array<Record<string, unknown>>) || [];
  const [activeTab, setActiveTab] = useState(0);

  const activeContent = tabs[activeTab] ? String(tabs[activeTab].content || '') : '';

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>📑</div>
        <div>
          <EditableText
            value={String(td.title || 'Materi Pembelajaran')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Materi"
          />
          <div className="text-[9px] text-white/40">{tabs.length} tab</div>
        </div>
      </div>

      {/* Tab navigation */}
      {tabs.length > 0 ? (
        <>
          <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
            {tabs.map((tab, i) => (
              <button key={i}
                className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-all"
                onClick={() => setActiveTab(i)}
                style={{
                  background: i === activeTab ? `${accent}20` : 'rgba(255,255,255,.04)',
                  border: `1px solid ${i === activeTab ? accent + '40' : 'rgba(255,255,255,.08)'}`,
                }}>
                <span className="text-sm">{String(tab.icon || '📄')}</span>
                <span className={`text-[9px] font-bold ${i === activeTab ? '' : 'text-white/50'}`}
                  style={i === activeTab ? { color: accent } : {}}>
                  {String(tab.label || `Tab ${i + 1}`)}
                </span>
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 rounded-lg"
            style={{
              background: `${accent}08`,
              border: `1px solid ${accent}15`,
            }}>
            <EditableText
              value={activeContent}
              fieldKey={`tabs.${activeTab}.content`}
              isSelected={isSelected}
              onEdit={onEditField}
              className="text-[9px] text-white/80 leading-relaxed"
              placeholder="Konten tab..."
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-4xl mb-2">📑</span>
          <span className="text-[10px]">Tambah tab di panel Konten → Materi Tab Icons</span>
        </div>
      )}
    </div>
  );
}

// ── Materi Accordion Template ─────────────────────────────────

function MateriAccordionTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#8b5cf6');
  const sections = (td.sections as Array<Record<string, unknown>>) || [];
  const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set([0]));

  const toggleSection = (i: number) => {
    setExpandedIdx(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>📂</div>
        <div>
          <EditableText
            value={String(td.title || 'Materi Pembelajaran')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Materi"
          />
          <div className="text-[9px] text-white/40">{sections.length} seksi</div>
        </div>
      </div>

      {/* Accordion sections */}
      {sections.length > 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
          {sections.map((sec, i) => {
            const isExpanded = expandedIdx.has(i);
            return (
              <div key={i} className="rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: `1px solid ${isExpanded ? accent + '30' : 'rgba(255,255,255,.08)'}`,
                }}>
                {/* Header row */}
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                  onClick={() => toggleSection(i)}
                >
                  <span className="text-sm">{String(sec.icon || '📄')}</span>
                  <span className="text-[10px] font-bold text-white flex-1 truncate">
                    {String(sec.title || `Seksi ${i + 1}`)}
                  </span>
                  <span className="text-[10px] text-white/40 transition-transform duration-300"
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>
                    ▼
                  </span>
                </button>
                {/* Content */}
                {isExpanded && (
                  <div className="px-3 pb-2.5 pt-0">
                    <div className="h-px mb-2" style={{ background: `${accent}20` }} />
                    <EditableText
                      value={String(sec.content || '')}
                      fieldKey={`sections.${i}.content`}
                      isSelected={isSelected}
                      onEdit={onEditField}
                      className="text-[9px] text-white/70 leading-relaxed"
                      placeholder="Konten seksi..."
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-4xl mb-2">📂</span>
          <span className="text-[10px]">Tambah seksi di panel Konten → Materi Accordion</span>
        </div>
      )}
    </div>
  );
}

// ── Diskusi Timer Template ────────────────────────────────────

function DiskusiTimerTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#06b6d4');
  const duration = (td.duration as number) || 10;
  const questions = (td.questions as string[]) || [];
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = duration > 0 ? ((duration * 60 - secondsLeft) / (duration * 60)) * 100 : 0;
  const radius = 36;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>⏱️</div>
        <div>
          <EditableText
            value={String(td.title || 'Diskusi')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Diskusi"
          />
          <div className="text-[9px] text-white/40">{duration} menit</div>
        </div>
      </div>

      {/* Timer + Prompt side by side */}
      <div className="flex gap-3 mb-3">
        {/* Circular SVG Timer */}
        <div className="flex flex-col items-center flex-shrink-0">
          <svg width="84" height="84" viewBox="0 0 84 84" className="cursor-pointer"
            onClick={() => { setRunning(!running); if (!running && secondsLeft <= 0) setSecondsLeft(duration * 60); }}>
            <circle cx="42" cy="42" r={radius} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
            <circle cx="42" cy="42" r={radius} fill="none" stroke={accent} strokeWidth="5"
              strokeDasharray={circ} strokeDashoffset={circ - (circ * pct) / 100}
              strokeLinecap="round" transform="rotate(-90 42 42)"
              style={{ transition: 'stroke-dashoffset 1s linear' }} />
            <text x="42" y="40" textAnchor="middle" fill="white" fontSize="16" fontWeight="800">
              {String(minutes).padStart(2, '0')}
            </text>
            <text x="42" y="54" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="10">
              {String(secs).padStart(2, '0')}
            </text>
          </svg>
          <span className="text-[7px] text-white/30 mt-0.5">{running ? 'Jalan' : 'Klik mulai'}</span>
        </div>

        {/* Prompt */}
        <div className="flex-1 min-w-0 p-2.5 rounded-lg"
          style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}>
          <div className="text-[8px] font-bold mb-1" style={{ color: accent }}>Prompt Diskusi</div>
          <EditableText
            value={String(td.prompt || '')}
            fieldKey="prompt"
            isSelected={isSelected}
            onEdit={onEditField}
            className="text-[9px] text-white/80 leading-relaxed"
            placeholder="Tulis prompt diskusi..."
          />
        </div>
      </div>

      {/* Question cards */}
      {questions.length > 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
          <div className="text-[9px] font-bold text-white/40 mb-1">Pertanyaan Panduan</div>
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-white/5">
              <span className="text-[9px] font-bold flex-shrink-0" style={{ color: accent }}>{i + 1}.</span>
              <span className="text-[8px] text-white/70 leading-relaxed">{String(q)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-3xl mb-2">💬</span>
          <span className="text-[10px]">Tambah pertanyaan di panel Konten</span>
        </div>
      )}
    </div>
  );
}

// ── Sortir Game Template ──────────────────────────────────────

function SortirGameTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#f97316');
  const items = (td.items as Array<Record<string, unknown>>) || [];
  const categories = (td.categories as Array<Record<string, unknown>>) || [];
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [sorted, setSorted] = useState<Record<number, number>>({});

  const handleSort = (catIdx: number) => {
    if (selectedItem === null) return;
    setSorted(prev => ({ ...prev, [selectedItem]: catIdx }));
    setSelectedItem(null);
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>🔢</div>
        <div>
          <EditableText
            value={String(td.title || 'Game Sortir')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Game"
          />
          <div className="text-[9px] text-white/40">{items.length} item • {categories.length} kategori</div>
        </div>
      </div>

      {/* Items to sort */}
      {items.length > 0 ? (
        <>
          <div className="text-[9px] font-bold text-white/40 mb-1">Pilih item, lalu klik kategori</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {items.map((item, i) => {
              const isSorted = i in sorted;
              const isCorrect = isSorted && categories[sorted[i]]?.name === item.category;
              const isSelected_ = selectedItem === i;
              return (
                <button key={i}
                  className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-all"
                  onClick={() => !isSorted && setSelectedItem(i)}
                  style={{
                    background: isSorted
                      ? isCorrect ? 'rgba(52,211,153,.15)' : 'rgba(248,113,113,.15)'
                      : isSelected_ ? `${accent}25` : 'rgba(255,255,255,.06)',
                    border: `1px solid ${
                      isSorted
                        ? isCorrect ? 'rgba(52,211,153,.4)' : 'rgba(248,113,113,.4)'
                        : isSelected_ ? accent + '50' : 'rgba(255,255,255,.1)'
                    }`,
                    color: isSorted
                      ? isCorrect ? '#34d399' : '#f87171'
                      : isSelected_ ? accent : 'rgba(255,255,255,.7)',
                    opacity: isSorted ? 0.6 : 1,
                  }}>
                  {String(item.text || `Item ${i + 1}`)}
                </button>
              );
            })}
          </div>

          {/* Category buckets */}
          <div className="flex-1 min-h-0 flex gap-2">
            {categories.map((cat, i) => {
              const catColor = String(cat.color || accent);
              return (
                <div key={i}
                  className="flex-1 rounded-lg p-2 cursor-pointer transition-colors"
                  onClick={() => handleSort(i)}
                  style={{
                    background: `${catColor}10`,
                    border: `1.5px dashed ${catColor}40`,
                    minHeight: '60px',
                  }}>
                  <div className="text-[9px] font-bold mb-1.5" style={{ color: catColor }}>
                    {String(cat.name || `Kategori ${i + 1}`)}
                  </div>
                  {/* Sorted items in this bucket */}
                  {Object.entries(sorted).filter(([, c]) => c === i).map(([itemIdx]) => {
                    const idx = Number(itemIdx);
                    const isCorrect = items[idx]?.category === cat.name;
                    return (
                      <div key={itemIdx} className="text-[8px] mb-0.5 px-1.5 py-0.5 rounded"
                        style={{
                          background: isCorrect ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)',
                          color: isCorrect ? '#34d399' : '#f87171',
                        }}>
                        {String(items[idx]?.text || '')}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-4xl mb-2">🔢</span>
          <span className="text-[10px]">Tambah item & kategori di panel Konten</span>
        </div>
      )}
    </div>
  );
}

// ── Roda Game Template (Spinning Wheel) ───────────────────────

function RodaGameTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--r', '#ec4899');
  const segments = (td.segments as Array<Record<string, unknown>>) || [];
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [score, setScore] = useState(0);

  const spinWheel = () => {
    if (spinning || segments.length === 0) return;
    setSpinning(true);
    const extraDeg = Math.floor(Math.random() * 360) + 720;
    setRotation(prev => prev + extraDeg);
    setScore(prev => prev + Math.floor(Math.random() * 10));
    setTimeout(() => setSpinning(false), 2500);
  };

  // SVG wheel params
  const cx = 60, cy = 60, r = 52;
  const segCount = Math.max(segments.length, 1);
  const segAngle = 360 / segCount;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>🎡</div>
        <div>
          <EditableText
            value={String(td.title || 'Game Roda')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Game"
          />
          <div className="text-[9px] text-white/40">{segments.length} segmen</div>
        </div>
        <div className="ml-auto px-2 py-1 rounded-lg text-[9px] font-bold"
          style={{ background: `${accent}15`, color: accent }}>
          ⭐ {score}
        </div>
      </div>

      {segments.length > 0 ? (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
          {/* SVG Wheel */}
          <div className="relative">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
              style={{ color: accent, fontSize: '14px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }}>
              ▼
            </div>
            <svg width="120" height="120" viewBox="0 0 120 120"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 2.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : undefined,
              }}>
              {segments.map((seg, i) => {
                const startAngle = i * segAngle;
                const endAngle = (i + 1) * segAngle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);
                const largeArc = segAngle > 180 ? 1 : 0;
                const midAngle = ((startAngle + endAngle) / 2) * Math.PI / 180;
                const labelR = r * 0.65;
                const lx = cx + labelR * Math.cos(midAngle);
                const ly = cy + labelR * Math.sin(midAngle);

                return (
                  <g key={i}>
                    <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={String(seg.color || accent) + '40'}
                      stroke={String(seg.color || accent)}
                      strokeWidth="1" />
                    <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                      fill="white" fontSize="6" fontWeight="700"
                      transform={`rotate(${(startAngle + endAngle) / 2}, ${lx}, ${ly})`}>
                      {String(seg.label || `S${i + 1}`).slice(0, 8)}
                    </text>
                  </g>
                );
              })}
              {/* Center circle */}
              <circle cx={cx} cy={cy} r="10" fill="#0f172a" stroke={accent} strokeWidth="2" />
              <text x={cx} y={cy + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="800">🎯</text>
            </svg>
          </div>

          {/* Spin button */}
          <button className="px-4 py-1.5 rounded-xl font-bold text-[10px] transition-all"
            onClick={spinWheel}
            disabled={spinning}
            style={{
              background: spinning ? 'rgba(255,255,255,.1)' : accent,
              color: spinning ? 'rgba(255,255,255,.3)' : '#000',
              opacity: spinning ? 0.5 : 1,
            }}>
            {spinning ? 'Berputar...' : '🎯 Putar!'}
          </button>

          {/* Question area */}
          {td.question && (
            <div className="w-full p-2 rounded-lg text-center"
              style={{ background: `${accent}10`, border: `1px solid ${accent}25` }}>
              <div className="text-[9px] text-white/70">{String(td.question)}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-4xl mb-2">🎡</span>
          <span className="text-[10px]">Tambah segmen di panel Konten → Roda Game</span>
        </div>
      )}
    </div>
  );
}

// ── Hubungan Konsep Template (Concept Map) ────────────────────

function HubunganKonsepTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#6366f1');
  const nodes = (td.nodes as Array<Record<string, unknown>>) || [];
  const edges = (td.edges as Array<Record<string, unknown>>) || [];
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Layout nodes in a circle
  const cx = 50, cy = 50, layoutR = 35;
  const nodePositions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1) - Math.PI / 2;
    nodePositions[String(n.id)] = {
      x: cx + layoutR * Math.cos(angle),
      y: cy + layoutR * Math.sin(angle),
    };
  });

  const connectedEdges = activeNode
    ? edges.filter(e => String(e.from) === activeNode || String(e.to) === activeNode)
    : edges;
  const connectedNodeIds = new Set(connectedEdges.flatMap(e => [String(e.from), String(e.to)]));

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>🔗</div>
        <div>
          <EditableText
            value={String(td.title || 'Hubungan Konsep')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Peta Konsep"
          />
          <div className="text-[9px] text-white/40">{nodes.length} node • {edges.length} hubungan</div>
        </div>
      </div>

      {nodes.length > 0 ? (
        <div className="flex-1 min-h-0 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Edges */}
            {edges.map((edge, i) => {
              const from = nodePositions[String(edge.from)];
              const to = nodePositions[String(edge.to)];
              if (!from || !to) return null;
              const isActive = activeNode && (String(edge.from) === activeNode || String(edge.to) === activeNode);
              return (
                <g key={`e${i}`}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={isActive ? accent : 'rgba(255,255,255,.15)'}
                    strokeWidth={isActive ? 0.8 : 0.4}
                    strokeDasharray={isActive ? 'none' : '1.5,1'} />
                  {/* Edge label */}
                  {String(edge.label || '') && (
                    <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 1.5}
                      textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="2.5"
                      fontWeight="600">
                      {String(edge.label)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n, i) => {
              const pos = nodePositions[String(n.id)];
              if (!pos) return null;
              const nodeColor = String(n.color || accent);
              const isHighlighted = activeNode === String(n.id);
              const isConnected = connectedNodeIds.has(String(n.id));
              return (
                <g key={String(n.id)} className="cursor-pointer"
                  onClick={() => setActiveNode(activeNode === String(n.id) ? null : String(n.id))}>
                  <circle cx={pos.x} cy={pos.y} r={isHighlighted ? 7 : 5.5}
                    fill={isHighlighted || isConnected ? nodeColor + '30' : 'rgba(255,255,255,.08)'}
                    stroke={isHighlighted ? nodeColor : isConnected ? nodeColor + '60' : 'rgba(255,255,255,.2)'}
                    strokeWidth={isHighlighted ? 1 : 0.5}
                    style={{ transition: 'all 0.3s' }} />
                  <text x={pos.x} y={pos.y + 1.2} textAnchor="middle"
                    fill={isHighlighted ? 'white' : isConnected ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.5)'}
                    fontSize="3" fontWeight={isHighlighted ? '800' : '600'}>
                    {String(n.label || n.id).slice(0, 10)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-4xl mb-2">🔗</span>
          <span className="text-[10px]">Tambah node & hubungan di panel Konten</span>
        </div>
      )}
    </div>
  );
}

// ── Flashcard Template ────────────────────────────────────────

function FlashcardTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#14b8a6');
  const cards = (td.cards as Array<Record<string, unknown>>) || [];
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const goNext = () => {
    if (cards.length === 0) return;
    setFlipped(false);
    setCurrentCard(prev => (prev + 1) % cards.length);
  };
  const goPrev = () => {
    if (cards.length === 0) return;
    setFlipped(false);
    setCurrentCard(prev => (prev - 1 + cards.length) % cards.length);
  };

  const card = cards[currentCard];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>🃏</div>
        <div>
          <EditableText
            value={String(td.title || 'Flashcard')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Flashcard"
          />
          <div className="text-[9px] text-white/40">
            {cards.length > 0 ? `${currentCard + 1} / ${cards.length}` : '0 kartu'}
          </div>
        </div>
      </div>

      {cards.length > 0 && card ? (
        <>
          {/* Card with flip */}
          <div className="flex-1 min-h-0 flex items-center justify-center px-2"
            style={{ perspective: '800px' }}>
            <div className="w-full max-w-[90%] relative cursor-pointer"
              onClick={() => setFlipped(!flipped)}
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.5s',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                minHeight: '120px',
              }}>
              {/* Front */}
              <div className="rounded-xl p-4 text-center"
                style={{
                  backfaceVisibility: 'hidden',
                  background: `${accent}12`,
                  border: `1.5px solid ${accent}30`,
                  boxShadow: `0 4px 20px ${accent}15`,
                }}>
                <div className="text-xl mb-2">{String(card.icon || '🃏')}</div>
                <div className="text-[10px] font-bold text-white/80">{String(card.front || 'Depan')}</div>
                <div className="text-[7px] text-white/30 mt-2">Ketuk untuk balik</div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 rounded-xl p-4 text-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'rgba(52,211,153,.1)',
                  border: '1.5px solid rgba(52,211,153,.3)',
                  boxShadow: '0 4px 20px rgba(52,211,153,.15)',
                }}>
                <div className="text-xl mb-2">💡</div>
                <div className="text-[10px] font-bold text-white/90">{String(card.back || 'Belakang')}</div>
                <div className="text-[7px] text-white/30 mt-2">Ketuk untuk balik</div>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <button className="px-3 py-1.5 rounded-lg text-[9px] font-bold transition-colors"
              onClick={goPrev}
              style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)' }}>
              ◀ Prev
            </button>
            <button className="px-3 py-1.5 rounded-lg text-[9px] font-bold transition-colors"
              onClick={() => setFlipped(!flipped)}
              style={{ background: `${accent}20`, color: accent }}>
              🔄 Balik
            </button>
            <button className="px-3 py-1.5 rounded-lg text-[9px] font-bold transition-colors"
              onClick={goNext}
              style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)' }}>
              Next ▶
            </button>
          </div>

          {/* Card counter dots */}
          <div className="flex justify-center gap-1 mt-2">
            {cards.slice(0, 10).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{ background: i === currentCard ? accent : 'rgba(255,255,255,.15)' }} />
            ))}
            {cards.length > 10 && (
              <span className="text-[6px] text-white/30 ml-0.5">+{cards.length - 10}</span>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-4xl mb-2">🃏</span>
          <span className="text-[10px]">Tambah kartu di panel Konten → Flashcard</span>
        </div>
      )}
    </div>
  );
}

// ── Refleksi Template ─────────────────────────────────────────

function RefleksiTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--y', '#818cf8');
  const prompts = (td.prompts as Array<Record<string, unknown>>) || [];
  const [responses, setResponses] = useState<Record<number, string>>({});

  const handleResponse = (i: number, value: string) => {
    setResponses(prev => ({ ...prev, [i]: value }));
  };

  const answeredCount = Object.values(responses).filter(v => v.trim().length > 0).length;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${accent}20` }}>💭</div>
        <div>
          <EditableText
            value={String(td.title || 'Refleksi Pembelajaran')}
            fieldKey="title"
            isSelected={isSelected}
            onEdit={onEditField}
            className="font-black text-white text-sm"
            placeholder="Judul Refleksi"
          />
          <div className="text-[9px] text-white/40">
            {answeredCount}/{prompts.length} dijawab
          </div>
        </div>
        {/* Completion badge */}
        <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold"
          style={{
            background: answeredCount === prompts.length && prompts.length > 0 ? 'rgba(52,211,153,.15)' : `${accent}10`,
            color: answeredCount === prompts.length && prompts.length > 0 ? '#34d399' : accent,
          }}>
          {answeredCount === prompts.length && prompts.length > 0 ? '✅ Selesai' : `${answeredCount}/${prompts.length}`}
        </div>
      </div>

      {/* Prompt cards with text areas */}
      {prompts.length > 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {prompts.map((p, i) => {
            const hasResponse = (responses[i] || '').trim().length > 0;
            return (
              <div key={i} className="p-2.5 rounded-lg"
                style={{
                  background: hasResponse ? 'rgba(52,211,153,.06)' : 'rgba(255,255,255,.04)',
                  border: `1px solid ${hasResponse ? 'rgba(52,211,153,.2)' : 'rgba(255,255,255,.08)'}`,
                }}>
                <div className="flex items-start gap-2 mb-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black flex-shrink-0 mt-0.5"
                    style={{
                      background: hasResponse ? 'rgba(52,211,153,.2)' : `${accent}20`,
                      color: hasResponse ? '#34d399' : accent,
                    }}>
                    {hasResponse ? '✓' : i + 1}
                  </div>
                  <span className="text-[9px] font-bold text-white/80">{String(p.question || `Pertanyaan ${i + 1}`)}</span>
                </div>
                <textarea
                  className="w-full bg-transparent text-[8px] text-white/60 leading-relaxed resize-none outline-none placeholder:text-white/20"
                  rows={2}
                  placeholder={String(p.placeholder || 'Tulis refleksi kamu...')}
                  value={responses[i] || ''}
                  onChange={e => handleResponse(i, e.target.value)}
                  style={{ paddingLeft: '24px' }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <span className="text-4xl mb-2">💭</span>
          <span className="text-[10px]">Tambah prompt refleksi di panel Konten</span>
        </div>
      )}
    </div>
  );
}

// ── Penutup Template (Closing Page) ───────────────────────────

function PenutupTemplate({ td, palette, isSelected, onEditField }: TemplateInternalProps) {
  const accent = getPaletteColor(palette, '--r', '#f472b6');
  const bg = getPaletteColor(palette, '--bg', '#0f172a');

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
      style={{
        background: `linear-gradient(180deg, ${bg} 0%, ${bg}ee 40%, ${accent}10 100%)`,
      }}>

      {/* Decorative top sparkle */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-3">
        {[accent, getPaletteColor(palette, '--y', '#f9c82e'), getPaletteColor(palette, '--g', '#34d399')].map((c, i) => (
          <div key={i} className="w-2 h-2 rounded-full"
            style={{ background: c, boxShadow: `0 0 8px ${c}60`, animation: `pulse 2s ease-in-out ${i * 0.3}s infinite` }} />
        ))}
      </div>

      {/* Large Icon */}
      <div className="text-5xl mb-3"
        style={{ filter: `drop-shadow(0 4px 16px ${accent}40)` }}>
        {String(td.icon || '🎓')}
      </div>

      {/* Title */}
      <EditableText
        value={String(td.title || 'Sampai Jumpa!')}
        fieldKey="title"
        isSelected={isSelected}
        onEdit={onEditField}
        className="font-black text-white leading-tight"
        style={{ fontSize: 'clamp(16px, 3.5%, 30px)', textShadow: '0 2px 12px rgba(0,0,0,.5)' }}
        placeholder="Judul Penutup"
      />

      {/* Subtitle */}
      <EditableText
        value={String(td.subtitle || '')}
        fieldKey="subtitle"
        isSelected={isSelected}
        onEdit={onEditField}
        className="mt-1.5"
        style={{ fontSize: 'clamp(9px, 1.6%, 14px)', color: accent }}
        placeholder="Subjudul"
      />

      {/* Message */}
      <EditableText
        value={String(td.message || '')}
        fieldKey="message"
        isSelected={isSelected}
        onEdit={onEditField}
        className="mt-3 max-w-[80%]"
        style={{ fontSize: 'clamp(8px, 1.3%, 11px)', color: 'rgba(255,255,255,.55)', lineHeight: '1.6' }}
        placeholder="Pesan penutup untuk siswa..."
      />

      {/* Selesai Button */}
      <div className="mt-5 px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-transform hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          color: '#fff',
          boxShadow: `0 4px 20px ${accent}40`,
        }}>
        {String(td.nextAction || '✨ Selesai')}
      </div>

      {/* Decorative bottom dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full"
            style={{ background: accent, opacity: 0.2 + i * 0.15 }} />
        ))}
      </div>
    </div>
  );
}

// ── Utility helpers ───────────────────────────────────────────

function getModuleIcon(type: string): string {
  const icons: Record<string, string> = {
    materi: '📝', video: '🎬', infografis: '📊', flashcard: '🃏',
    'studi-kasus': '🔬', debat: '⚖️', timeline: '📅', matching: '🔀',
    hero: '🚀', kutipan: '💬', langkah: '📌', accordion: '📂',
    statistik: '📈', polling: '🗳️', embed: '🌐', 'tab-icons': '📑',
    'icon-explore': '🔍', comparison: '⚖️', 'card-showcase': '🎴',
    'hotspot-image': '📍', truefalse: '✅❌', memory: '🧠',
    roda: '🎡', sorting: '🔢', spinwheel: '🎡',
    teambuzzer: '🏆', wordsearch: '🔍', skenario: '🎭',
  };
  return icons[type] || '🧩';
}

function getGameIcon(type: string): string {
  const icons: Record<string, string> = {
    truefalse: '✅', memory: '🧠', matching: '🔀', roda: '🎡',
    sorting: '🔢', spinwheel: '🎡', teambuzzer: '🏆',
    wordsearch: '🔍', flashcard: '🃏',
  };
  return icons[type] || '🎮';
}

function getGameModuleIndex(game: Record<string, unknown>): number {
  const modules = useAuthoringStore.getState().modules;
  const idx = modules.findIndex(m => m === game);
  return idx >= 0 ? idx : -1;
}
