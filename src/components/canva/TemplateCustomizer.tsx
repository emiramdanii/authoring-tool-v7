'use client';

import { useState, useCallback, useRef } from 'react';
import { SLOT_SCHEMAS, TEMPLATE_META, type SlotField, type TemplateId } from '@/lib/templates/engine/slot-types';
import { TEMPLATE_TYPES, type PageTemplateType } from './types';

// ═══════════════════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════════════════

interface TemplateCustomizerProps {
  templateType: PageTemplateType;
  templateData: Record<string, unknown>;
  onEditField: (key: string, value: unknown) => void;
}

// ═══════════════════════════════════════════════════════════════
// List item sub-field schema (used by list editors)
// ═══════════════════════════════════════════════════════════════

interface ListItemFieldDef {
  key: string;
  type: 'text' | 'richtext' | 'number' | 'color' | 'select';
  label: string;
  options?: Array<{ value: string; label: string }>;
}

/**
 * Maps "templateId.fieldKey" → array of sub-field definitions for list items.
 * An empty array means each list item is a simple string (not an object).
 */
const LIST_ITEM_SCHEMAS: Record<string, ListItemFieldDef[]> = {
  // ── dokumen ──────────────────────────────────────────────
  'dokumen.cp.profil': [],                                        // string[]
  'dokumen.tp': [
    { key: 'verb', type: 'text', label: 'Verb' },
    { key: 'desc', type: 'text', label: 'Deskripsi' },
    { key: 'color', type: 'color', label: 'Warna' },
    { key: 'pertemuan', type: 'number', label: 'Pertemuan' },
  ],
  'dokumen.atp.pertemuan': [
    { key: 'judul', type: 'text', label: 'Judul' },
    { key: 'durasi', type: 'text', label: 'Durasi' },
    { key: 'tp', type: 'text', label: 'TP' },
    { key: 'kegiatan', type: 'richtext', label: 'Kegiatan' },
    { key: 'penilaian', type: 'text', label: 'Penilaian' },
  ],
  'dokumen.alur': [
    { key: 'fase', type: 'text', label: 'Fase' },
    { key: 'durasi', type: 'text', label: 'Durasi' },
    { key: 'judul', type: 'text', label: 'Judul' },
    { key: 'deskripsi', type: 'richtext', label: 'Deskripsi' },
  ],
  // ── tujuan ───────────────────────────────────────────────
  'tujuan.tpItems': [
    { key: 'verb', type: 'text', label: 'Verb' },
    { key: 'desc', type: 'text', label: 'Deskripsi' },
    { key: 'color', type: 'color', label: 'Warna' },
    { key: 'pertemuan', type: 'number', label: 'Pertemuan' },
  ],
  // ── review ───────────────────────────────────────────────
  'review.questions': [
    { key: 'q', type: 'text', label: 'Pertanyaan' },
    { key: 'answer', type: 'text', label: 'Jawaban' },
  ],
  // ── materi-tabicons ──────────────────────────────────────
  'materi-tabicons.tabs': [
    { key: 'icon', type: 'text', label: 'Ikon' },
    { key: 'label', type: 'text', label: 'Label' },
    { key: 'content', type: 'richtext', label: 'Konten' },
  ],
  // ── materi-accordion ─────────────────────────────────────
  'materi-accordion.sections': [
    { key: 'icon', type: 'text', label: 'Ikon' },
    { key: 'title', type: 'text', label: 'Judul' },
    { key: 'content', type: 'richtext', label: 'Konten' },
  ],
  // ── diskusi-timer ────────────────────────────────────────
  'diskusi-timer.questions': [],                                   // string[]
  // ── sortir-game ──────────────────────────────────────────
  'sortir-game.items': [
    { key: 'text', type: 'text', label: 'Teks' },
    { key: 'category', type: 'text', label: 'Kategori' },
  ],
  'sortir-game.categories': [
    { key: 'name', type: 'text', label: 'Nama' },
    { key: 'color', type: 'color', label: 'Warna' },
  ],
  // ── roda-game ────────────────────────────────────────────
  'roda-game.segments': [
    { key: 'label', type: 'text', label: 'Label' },
    { key: 'color', type: 'color', label: 'Warna' },
  ],
  // ── hubungan-konsep ──────────────────────────────────────
  'hubungan-konsep.nodes': [
    { key: 'id', type: 'text', label: 'ID' },
    { key: 'label', type: 'text', label: 'Label' },
    { key: 'color', type: 'color', label: 'Warna' },
  ],
  'hubungan-konsep.edges': [
    { key: 'from', type: 'text', label: 'Dari' },
    { key: 'to', type: 'text', label: 'Ke' },
    { key: 'label', type: 'text', label: 'Label' },
  ],
  // ── flashcard ────────────────────────────────────────────
  'flashcard.cards': [
    { key: 'front', type: 'text', label: 'Depan' },
    { key: 'back', type: 'text', label: 'Belakang' },
    { key: 'icon', type: 'text', label: 'Ikon' },
  ],
  // ── refleksi ─────────────────────────────────────────────
  'refleksi.prompts': [
    { key: 'question', type: 'text', label: 'Pertanyaan' },
    { key: 'placeholder', type: 'text', label: 'Placeholder' },
  ],
  // ── kuis ─────────────────────────────────────────────────
  'kuis.kuis': [
    { key: 'q', type: 'text', label: 'Soal' },
    { key: 'opts', type: 'richtext', label: 'Opsi (per baris)' },
    { key: 'ans', type: 'number', label: 'Jawaban (index)' },
    { key: 'ex', type: 'text', label: 'Penjelasan' },
  ],
  // ── skenario (simplified — complex nested shown as text) ─
  'skenario.skenario': [
    { key: 'charEmoji', type: 'text', label: 'Ikon Karakter' },
    { key: 'charColor', type: 'color', label: 'Warna Karakter' },
    { key: 'bg', type: 'text', label: 'Background' },
    { key: 'title', type: 'text', label: 'Judul' },
    { key: 'choicePrompt', type: 'text', label: 'Prompt Pilihan' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Helpers — nested dot-path get/set on templateData
// ═══════════════════════════════════════════════════════════════

function getNestedValue(data: Record<string, unknown>, key: string): unknown {
  if (!key.includes('.')) return data[key];
  const parts = key.split('.');
  let current: unknown = data;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Given a dot-path key, returns the top-level key and the rebuilt top-level value
 * with the nested property updated. This is needed because `onEditField` sets
 * top-level keys on templateData.
 */
function buildTopLevelUpdate(
  data: Record<string, unknown>,
  key: string,
  value: unknown,
): { topKey: string; topValue: unknown } {
  if (!key.includes('.')) return { topKey: key, topValue: value };

  const parts = key.split('.');
  const topKey = parts[0];
  const topValue = JSON.parse(JSON.stringify(data[topKey] ?? {}));
  let current: Record<string, unknown> = topValue as Record<string, unknown>;

  for (let i = 1; i < parts.length - 1; i++) {
    if (current[parts[i]] == null || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
  return { topKey, topValue };
}

/** Create a default empty item for a given list item schema */
function createEmptyListItem(schema: ListItemFieldDef[]): Record<string, unknown> | string {
  if (schema.length === 0) return '';
  const obj: Record<string, unknown> = {};
  for (const f of schema) {
    if (f.type === 'number') obj[f.key] = 0;
    else obj[f.key] = '';
  }
  return obj;
}

/** Get a display label for a list item (first text-like field, or index) */
function getItemLabel(item: unknown, index: number, schema: ListItemFieldDef[]): string {
  if (typeof item === 'string') return item || `Item ${index + 1}`;
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    // Try common label fields first
    for (const key of ['label', 'title', 'judul', 'q', 'name', 'front']) {
      if (typeof obj[key] === 'string' && (obj[key] as string).trim()) {
        return (obj[key] as string).slice(0, 28) + ((obj[key] as string).length > 28 ? '…' : '');
      }
    }
    // Fallback: first string field in schema
    const firstText = schema.find(f => f.type === 'text' || f.type === 'richtext');
    if (firstText && typeof obj[firstText.key] === 'string' && (obj[firstText.key] as string).trim()) {
      return (obj[firstText.key] as string).slice(0, 28);
    }
  }
  return `Item ${index + 1}`;
}

// ═══════════════════════════════════════════════════════════════
// Shared Tailwind class strings (keeps JSX readable)
// ═══════════════════════════════════════════════════════════════

const cls = {
  label:       'text-[9px] text-zinc-500 block mb-0.5',
  input:       'w-full h-6 px-1.5 text-[9px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none',
  textarea:    'w-full px-1.5 py-1 text-[9px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none resize-y min-h-[48px]',
  select:      'w-full h-6 px-1 text-[9px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none',
  colorInput:  'w-full h-6 rounded border border-zinc-700/50 cursor-pointer bg-zinc-800',
  sectionBtn:  'w-full p-2 flex items-center justify-between hover:bg-zinc-800/30 transition-colors',
  sectionTitle:'text-[10px] font-bold text-zinc-400 uppercase tracking-wider',
  chevron:     'text-[8px] text-zinc-600',
  btnSmall:    'px-1.5 py-0.5 text-[8px] font-bold rounded transition-colors',
  btnAdd:      'w-full py-1.5 rounded-md text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors',
  btnRemove:   'text-red-400 hover:text-red-300',
  btnMove:     'text-zinc-500 hover:text-zinc-300',
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function TemplateCustomizer({
  templateType,
  templateData,
  onEditField,
}: TemplateCustomizerProps) {
  // ── Check if template has a schema ────────────────────────
  const hasSchema = templateType in SLOT_SCHEMAS;

  if (!hasSchema || templateType === 'custom') {
    return (
      <div className="px-2 py-3">
        <div className="text-[9px] text-zinc-500 p-2 rounded-lg bg-zinc-800/40 text-center">
          Template type ini belum memiliki editor kustom
        </div>
      </div>
    );
  }

  const schema = SLOT_SCHEMAS[templateType as TemplateId];
  const meta = TEMPLATE_META[templateType as TemplateId];
  const fields = Object.values(schema);

  // ── Handle field value change ─────────────────────────────
  const handleFieldChange = useCallback(
    (fieldKey: string, value: unknown) => {
      if (fieldKey.includes('.')) {
        const { topKey, topValue } = buildTopLevelUpdate(templateData, fieldKey, value);
        onEditField(topKey, topValue);
      } else {
        onEditField(fieldKey, value);
      }
    },
    [templateData, onEditField],
  );

  return (
    <div className="flex flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-2 py-2 border-b border-zinc-700/30">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{meta?.icon ?? '📄'}</span>
          <div>
            <div className="text-[10px] font-bold text-zinc-200">{meta?.label ?? templateType}</div>
            {meta?.description && (
              <div className="text-[8px] text-zinc-600">{meta.description}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fields ──────────────────────────────────────────── */}
      <div className="px-2 py-2 space-y-2">
        {fields.map((field) => (
          <FieldEditor
            key={field.key}
            field={field}
            templateType={templateType}
            templateData={templateData}
            onFieldChange={handleFieldChange}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FieldEditor — renders the correct widget for each field type
// ═══════════════════════════════════════════════════════════════

function FieldEditor({
  field,
  templateType,
  templateData,
  onFieldChange,
}: {
  field: SlotField;
  templateType: PageTemplateType;
  templateData: Record<string, unknown>;
  onFieldChange: (key: string, value: unknown) => void;
}) {
  const value = getNestedValue(templateData, field.key);
  const fileInputRef = useRef<HTMLInputElement>(null);

  switch (field.type) {
    // ── text ──────────────────────────────────────────────────
    case 'text':
      return (
        <div>
          <label className={cls.label}>{field.label}</label>
          <input
            type="text"
            value={typeof value === 'string' ? value : String(value ?? field.default ?? '')}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            className={cls.input}
          />
        </div>
      );

    // ── richtext ──────────────────────────────────────────────
    case 'richtext':
      return (
        <div>
          <label className={cls.label}>{field.label}</label>
          <textarea
            value={typeof value === 'string' ? value : String(value ?? field.default ?? '')}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            className={cls.textarea}
            rows={3}
          />
        </div>
      );

    // ── number ────────────────────────────────────────────────
    case 'number':
      return (
        <div>
          <label className={cls.label}>{field.label}</label>
          <input
            type="number"
            value={typeof value === 'number' ? value : Number(field.default ?? 0)}
            onChange={(e) => onFieldChange(field.key, parseFloat(e.target.value) || 0)}
            className={cls.input}
          />
        </div>
      );

    // ── color ─────────────────────────────────────────────────
    case 'color':
      return (
        <div>
          <label className={cls.label}>{field.label}</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={typeof value === 'string' && value.startsWith('#') ? value : '#1a1a2e'}
              onChange={(e) => onFieldChange(field.key, e.target.value)}
              className="w-6 h-6 rounded border border-zinc-700/50 cursor-pointer bg-zinc-800 flex-shrink-0"
            />
            <input
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onFieldChange(field.key, e.target.value)}
              className={cls.input}
              placeholder="#000000"
            />
          </div>
        </div>
      );

    // ── image ─────────────────────────────────────────────────
    case 'image': {
      const imgSrc = typeof value === 'string' ? value : '';
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          if (dataUrl) onFieldChange(field.key, dataUrl);
        };
        reader.readAsDataURL(file);
      };
      return (
        <div>
          <label className={cls.label}>{field.label}</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1.5 rounded-md border border-dashed border-zinc-700 hover:border-amber-500/30 bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors flex flex-col items-center gap-0.5"
          >
            <span className="text-[10px]">📤</span>
            <span className="text-[8px] font-bold text-zinc-400">Pilih Gambar</span>
          </button>
          {imgSrc && (
            <div className="mt-1 rounded-md overflow-hidden border border-zinc-700/30">
              <img src={imgSrc} alt={field.label} className="w-full h-16 object-cover" />
              <button
                onClick={() => onFieldChange(field.key, '')}
                className="w-full py-0.5 text-[8px] text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      );
    }

    // ── select ────────────────────────────────────────────────
    case 'select':
      return (
        <div>
          <label className={cls.label}>{field.label}</label>
          <select
            value={typeof value === 'string' ? value : String(field.default ?? '')}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
            className={cls.select}
          >
            <option value="">— Pilih —</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    // ── list ──────────────────────────────────────────────────
    case 'list':
      return (
        <ListFieldEditor
          field={field}
          templateType={templateType}
          templateData={templateData}
          onFieldChange={onFieldChange}
        />
      );

    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// ListFieldEditor — add / remove / reorder items in a list
// ═══════════════════════════════════════════════════════════════

function ListFieldEditor({
  field,
  templateType,
  templateData,
  onFieldChange,
}: {
  field: SlotField;
  templateType: PageTemplateType;
  templateData: Record<string, unknown>;
  onFieldChange: (key: string, value: unknown) => void;
}) {
  const listValue = getNestedValue(templateData, field.key);
  const items: unknown[] = Array.isArray(listValue) ? listValue : [];
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Look up item schema
  const schemaKey = `${templateType}.${field.key}`;
  const itemSchema = LIST_ITEM_SCHEMAS[schemaKey] ?? [];
  const isSimpleList = itemSchema.length === 0; // string[]

  const toggleExpand = (idx: number) =>
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  // ── Mutate helpers ────────────────────────────────────────
  const updateList = useCallback(
    (newItems: unknown[]) => onFieldChange(field.key, newItems),
    [field.key, onFieldChange],
  );

  const addItem = () => {
    const newItem = createEmptyListItem(itemSchema);
    updateList([...items, newItem]);
    // Auto-expand the new item
    setExpanded((prev) => ({ ...prev, [items.length]: true }));
  };

  const removeItem = (idx: number) => {
    const next = [...items];
    next.splice(idx, 1);
    updateList(next);
  };

  const moveItem = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const next = [...items];
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    updateList(next);
  };

  const updateSimpleItem = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    updateList(next);
  };

  const updateObjectItem = (idx: number, subKey: string, val: unknown) => {
    const next = [...items];
    next[idx] = { ...(next[idx] as Record<string, unknown>), [subKey]: val };
    updateList(next);
  };

  return (
    <div>
      {/* ── Label + count ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1">
        <label className={cls.label + ' mb-0'}>{field.label}</label>
        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 font-bold">
          {items.length}
        </span>
      </div>

      {/* ── Items ────────────────────────────────────────────── */}
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-zinc-700/40 rounded-md overflow-hidden"
          >
            {/* Item header */}
            <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-800/60">
              <button
                onClick={() => toggleExpand(idx)}
                className="text-[8px] text-zinc-500 hover:text-zinc-300 w-3 text-center flex-shrink-0"
              >
                {expanded[idx] ? '▾' : '▸'}
              </button>
              <span className="text-[9px] text-zinc-400 flex-1 truncate">
                {getItemLabel(item, idx, itemSchema)}
              </span>
              <button
                onClick={() => moveItem(idx, 'up')}
                className={`${cls.btnSmall} ${cls.btnMove}`}
                disabled={idx === 0}
                title="Pindah atas"
              >
                ↑
              </button>
              <button
                onClick={() => moveItem(idx, 'down')}
                className={`${cls.btnSmall} ${cls.btnMove}`}
                disabled={idx === items.length - 1}
                title="Pindah bawah"
              >
                ↓
              </button>
              <button
                onClick={() => removeItem(idx)}
                className={`${cls.btnSmall} ${cls.btnRemove}`}
                title="Hapus"
              >
                ✕
              </button>
            </div>

            {/* Expanded content */}
            {expanded[idx] && (
              <div className="px-2 py-1.5 space-y-1.5 bg-zinc-900/40">
                {isSimpleList ? (
                  /* Simple string list */
                  <input
                    type="text"
                    value={typeof item === 'string' ? item : ''}
                    onChange={(e) => updateSimpleItem(idx, e.target.value)}
                    className={cls.input}
                    placeholder="Teks…"
                  />
                ) : (
                  /* Object item — render sub-fields */
                  itemSchema.map((subField) => {
                    const subVal =
                      typeof item === 'object' && item !== null
                        ? (item as Record<string, unknown>)[subField.key]
                        : undefined;

                    return (
                      <SubFieldEditor
                        key={subField.key}
                        subField={subField}
                        value={subVal}
                        onChange={(val) => updateObjectItem(idx, subField.key, val)}
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Add button ───────────────────────────────────────── */}
      <button onClick={addItem} className={`${cls.btnAdd} mt-1.5`}>
        + Tambah {field.label}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SubFieldEditor — renders a single sub-field inside a list item
// ═══════════════════════════════════════════════════════════════

function SubFieldEditor({
  subField,
  value,
  onChange,
}: {
  subField: ListItemFieldDef;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  switch (subField.type) {
    case 'text':
      return (
        <div>
          <label className={cls.label}>{subField.label}</label>
          <input
            type="text"
            value={typeof value === 'string' ? value : String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className={cls.input}
          />
        </div>
      );

    case 'richtext':
      return (
        <div>
          <label className={cls.label}>{subField.label}</label>
          <textarea
            value={typeof value === 'string' ? value : String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            className={cls.textarea}
            rows={2}
          />
        </div>
      );

    case 'number':
      return (
        <div>
          <label className={cls.label}>{subField.label}</label>
          <input
            type="number"
            value={typeof value === 'number' ? value : 0}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={cls.input}
          />
        </div>
      );

    case 'color':
      return (
        <div>
          <label className={cls.label}>{subField.label}</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={typeof value === 'string' && value.startsWith('#') ? value : '#1a1a2e'}
              onChange={(e) => onChange(e.target.value)}
              className="w-6 h-6 rounded border border-zinc-700/50 cursor-pointer bg-zinc-800 flex-shrink-0"
            />
            <input
              type="text"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              className={cls.input}
              placeholder="#000000"
            />
          </div>
        </div>
      );

    case 'select':
      return (
        <div>
          <label className={cls.label}>{subField.label}</label>
          <select
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className={cls.select}
          >
            <option value="">— Pilih —</option>
            {subField.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    default:
      return null;
  }
}
