# MASTER PLAN — MPI v5.Z Authoring Tool

> Urutan Penyempurnaan: **Authoring Tool → Canvas → Export**

---

## Fase 1: AUTHORING TOOL (Form Editor & Data Flow)

### 1A. Preset Modul & Game di ModulesTab

**Status:** ❌ TIDAK ADA

**Masalah:** KuisTab punya "Preset Kuis" (norma-10-soal + kosong), tapi ModulesTab tidak punya preset apapun. Guru harus tambah modul satu-satu dan isi data manual.

**Solusi:** Tambah section "Preset Modul" di ModulesTab, mirip KuisTab.

```
┌─ ⚡ Preset Modul ──────────────────────────────┐
│  ┌─────────────────┐  ┌─────────────────┐      │
│  │ 📦 Paket Norma  │  │ 📋 Kosong       │      │
│  │ (5 modul isi)   │  │ Dari nol        │      │
│  └─────────────────┘  └─────────────────┘      │
└────────────────────────────────────────────────┘
```

**Paket Preset "Hakikat Norma" (5 modul):**
1. `tab-icons` — "4 Jenis Norma" (tab agama/kesusilaan/kesopanan/hukum)
2. `flashcard` — "Kartu Istilah Norma" (5 kartu depan-belakang)
3. `sorting` — "Klasifikasi Norma" (kategori + items)
4. `comparison` — "Norma vs Pelanggaran" (2 kolom)
5. `icon-explore` — "Fungsi Norma" (5 fungsi)

**File yang diubah:**
- `src/store/authoring-store.ts` — Tambah `PRESETS_MODULES`, `applyModulePreset()`
- `src/components/authoring/konten/ModulesTab.tsx` — Tambah PresetSection UI

---

### 1B. Tab-Level Auto-Generate di ModulesTab

**Status:** ❌ TIDAK ADA

**Masalah:** Auto-generate hanya ada di dalam masing-masing editor (AutoGenerate.tsx). Tidak ada cara generate semua modul sekaligus.

**Solusi:** Tambah tombol "Auto-Generate Semua Modul" di ModulesTab.

```
┌─ ⚡ Auto-Generate Semua Modul ─────────────────┐
│  [Generate dari Materi] → Isi semua modul yang │
│  sudah ditambahkan secara otomatis              │
└─────────────────────────────────────────────────┘
```

**Cara kerja:**
1. Baca teks materi dari `materi.blok` (atau `meta.namaBab` + konteks CP/TP)
2. Parse teks dengan parser yang sudah ada di `AutoGenerate.tsx`
3. Untuk setiap modul di `modules[]` yang kosong (title="" atau items=[]):
   - Flashcard → genFlashcard()
   - Tab-icons → genTabIcons()
   - Sorting → genSorting()
   - Comparison → genComparison()
   - dll (reuse generator functions)
4. Update store dengan data yang dihasilkan

**File yang diubah:**
- `src/components/authoring/konten/ModulesTab.tsx` — Tambah AutoGenSection
- `src/components/authoring/AutoGenerate.tsx` — Export generator functions (genFlashcard, genTabIcons, dll)

---

### 1C. Pilihan Layout untuk Modul

**Status:** ❌ TIDAK ADA

**Masalah:** Modul seperti infografis, tab-icons, icon-explore punya field `layout` di data, tapi tidak ada pilihan visual di UI saat pertama kali menambahkan modul. Guru harus edit manual setelah modul ditambahkan.

**Solusi:** Tambah layout picker di ModuleEditorModal untuk tipe yang mendukung layout.

**Tipe + Layout options:**
- `tab-icons` → horizontal / vertical / pills
- `icon-explore` → grid / list / carousel
- `infografis` → grid / list / timeline
- `statistik` → grid / row / big-numbers
- `card-showcase` → grid / carousel / stack

**File yang diubah:**
- `src/components/authoring/ModuleEditorModal.tsx` — Tambah LayoutPicker di setiap editor yang relevan

---

### 1D. Link Preset Authoring ↔ Canvas

**Status:** ❌ TIDAK ADA

**Masalah:**
- Authoring tool punya preset (meta, cp, tp, atp, alur, kuis)
- Canvas punya template terpisah
- Tidak ada sinkronisasi konteks preset → canvas

**Solusi:** Sinkronkan `activePreset` dari authoring store ke canva store. Canvas baca preset → gunakan warna/ikon yang sesuai.

**Cara kerja:**
1. `applyFullPreset('hakikat-norma')` → set `activePreset = 'hakikat-norma'`
2. CanvaBridge baca `activePreset` → tentukan accent color, ikon, gradient
3. `getPageTemplateData()` gunakan `pertemuanKe` dan `activePreset` untuk warna

**File yang diubah:**
- `src/store/authoring-store.ts` — Pastikan `activePreset` di-sync
- `src/lib/templates/canva-bridge.ts` — Baca `activePreset` + `pertemuanKe`
- `src/store/canva-store.ts` — Tambah `pertemuanKe` field

---

### 1E. Full Preset Termasuk Modul

**Status:** ⚠️ Hanya meta+cp+tp+atp+alur+kuis, tanpa modul

**Masalah:** `FULL_PRESET_MAP` hanya mengisi meta, cp, tp, atp, alur, kuis. Modul tetap kosong setelah apply preset.

**Solusi:** Tambah `modules` ke FULL_PRESET_MAP.

**File yang diubah:**
- `src/store/authoring-store.ts` — Tambah `PRESETS_MODULES` dan isi modules di `applyFullPreset()`

---

## Fase 2: CANVAS (Live Preview Rendering)

### 2A. PertemuanKe-Aware Accent Color

**Status:** ⚠️ Canvas selalu pakai kuning (--y)

**Masalah:** `canva-bridge.ts` hardcoded `pertemuanKe = 1` dan `accentVar = '--y'`. Canvas tidak tahu pertemuan ke-berapa sedang dilihat.

**Solusi:** CanvaStore simpan `pertemuanKe`, dan bridge pakai nilai itu untuk accent.

**File yang diubah:**
- `src/store/canva-store.ts` — Tambah `pertemuanKe`
- `src/lib/templates/canva-bridge.ts` — Baca dari store, bukan hardcoded

---

### 2B. Real-Time Preview untuk Modul Interaktif

**Status:** ⚠️ Sebagian modul tidak tampil di canvas

**Masalah:** Canvas hanya render template yang ada di page list. Modul baru yang ditambahkan tidak otomatis muncul.

**Solusi:** Sinkronkan modul dari authoring → canvas pages secara otomatis.

**File yang diubah:**
- `src/lib/templates/canva-bridge.ts` — Tambah logic: jika ada modul baru yang belum ada page-nya, buat page baru

---

### 2C. Zoom & Viewport Controls

**Status:** ✅ Ada (basic zoom via keyboard)

**Masalah:** Tidak ada UI slider untuk zoom, tidak ada viewport preset (mobile/tablet/desktop).

**Solusi:** Tambah zoom slider di Toolbar + viewport presets.

**File yang diubah:**
- `src/components/canva/Toolbar.tsx` — Tambah zoom slider + viewport buttons

---

## Fase 3: EXPORT (Single HTML File Output)

### 3A. Konsistensi Export vs Preview

**Status:** ⚠️ Dua pipeline berbeda

**Masalah:**
- `export-html.ts` = pipeline LAMA (hardcoded HTML strings)
- `assembly.ts` + `auto-build/` = pipeline BARU (template system)
- Hasil export bisa beda dengan preview

**Solusi:** Hapus pipeline lama, semua export pakai `assembleHTML()` dari pipeline baru.

**File yang diubah:**
- `src/lib/export-html.ts` — Rewrite untuk pakai `autoBuildConfig()` + `assembleHTML()`
- `src/components/authoring/ImportExport.tsx` — Update pemanggilan

---

### 3B. Modul Interaktif di Export

**Status:** ⚠️ Sebagian modul tidak ada di export

**Masalah:** Pipeline lama (`export-html.ts`) hanya handle: cover, CP/TP/ATP, skenario, materi, kuis, hasil. Tidak handle: flashcard, sorting, roda, hotspot, comparison, dll.

**Solusi:** Pipeline baru (`assembly.ts` + templates) sudah handle semua. Tinggal switch ke pipeline baru.

---

### 3C. window._kuisResult Bridge

**Status:** ✅ Ada di template system baru

**Masalah:** Pipeline lama tidak pakai `window._kuisResult`, jadi halaman hasil tidak terima skor dari kuis.

**Solusi:** Sudah ada di pipeline baru. Tinggal pastikan export pakai pipeline baru.

---

## Prioritas Implementasi

| # | Task | Prioritas | Estimasi | Status |
|---|------|-----------|----------|--------|
| 1A | Preset Modul & Game di ModulesTab | 🔴 Tinggi | 2 jam | ❌ |
| 1B | Tab-Level Auto-Generate | 🔴 Tinggi | 2 jam | ❌ |
| 1E | Full Preset Termasuk Modul | 🔴 Tinggi | 1 jam | ❌ |
| 1D | Link Preset Authoring ↔ Canvas | 🟡 Sedang | 1.5 jam | ❌ |
| 1C | Pilihan Layout untuk Modul | 🟡 Sedang | 1 jam | ❌ |
| 2A | PertemuanKe-Aware Accent | 🟡 Sedang | 1 jam | ❌ |
| 2B | Real-Time Preview Modul | 🟡 Sedang | 2 jam | ❌ |
| 2C | Zoom & Viewport Controls | 🟢 Rendah | 1 jam | ❌ |
| 3A | Konsistensi Export Pipeline | 🔴 Tinggi | 2 jam | ❌ |
| 3B | Modul Interaktif di Export | 🔴 Tinggi | (otomatis dari 3A) | ❌ |
| 3C | _kuisResult Bridge | 🟢 Rendah | (otomatis dari 3A) | ❌ |

---

## Arsitektur Saat Ini

```
src/
├── store/
│   ├── authoring-store.ts    ← Zustand store (data authoring)
│   └── canva-store.ts        ← Zustand store (canvas pages)
├── components/
│   ├── authoring/
│   │   ├── AuthoringTool.tsx  ← Main authoring panel
│   │   ├── AutoGenerate.tsx   ← AI generator (parser + generators)
│   │   ├── ModuleEditorModal.tsx ← 19 module editors
│   │   └── konten/
│   │       ├── MateriTab.tsx  ← Tab materi blok
│   │       ├── KuisTab.tsx    ← Tab kuis (DENGAN preset)
│   │       ├── ModulesTab.tsx ← Tab modul (TANPA preset)
│   │       └── shared.ts     ← Types & helpers
│   └── canva/
│       ├── CanvaBuilder.tsx   ← Canvas main
│       ├── Stage.tsx          ← Preview area
│       └── ...
├── lib/
│   ├── templates/
│   │   ├── auto-build/
│   │   │   ├── index.ts      ← Main pipeline
│   │   │   ├── builders.ts   ← Slot data builders
│   │   │   └── helpers.ts    ← Accent colors, analysis
│   │   ├── engine/
│   │   │   ├── base-css.ts   ← Shared CSS
│   │   │   ├── base-js.ts    ← Navigation + scoring JS
│   │   │   ├── navbar-html.ts ← Shared navbar
│   │   │   └── slot-types.ts ← TypeScript types
│   │   ├── screens/          ← 17 template HTML builders
│   │   ├── assembly.ts       ← Assembly pipeline (BARU)
│   │   ├── canva-bridge.ts   ← Authoring ↔ Canvas sync
│   │   └── template-registry.ts
│   ├── export-html.ts        ← Export pipeline (LAMA)
│   └── template-registry.ts
```

---

## Data Flow

```
[Authoring Store] ←→ [Canva Bridge] → [Canva Store]
      ↓                                    ↓
[AutoGenerate.tsx]              [Stage.tsx / Preview]
      ↓
[auto-build/builders.ts]
      ↓
[assembly.ts] → [export-html.ts (LAMA)] atau [assembleHTML (BARU)]
```

---

*Terakhir diperbarui: 2026-05-04*
