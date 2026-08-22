# Design Document

## Overview

Ledger & Line adalah single-page application (SPA) berbasis klien yang dibangun sepenuhnya dengan vanilla HTML, CSS, dan JavaScript — tanpa framework, tanpa build tool, tanpa backend. Semua logika berjalan di browser, state disimpan di `localStorage`, dan visualisasi menggunakan Chart.js (di-bundle secara lokal di folder `vendor/`).

Arsitektur mengikuti pola **IIFE (Immediately Invoked Function Expression)** dengan `"use strict"` untuk enkapsulasi scope. Tidak ada modul ES6, tidak ada bundler — satu file `app.js` yang berjalan langsung di browser.

---

## Architecture

### Struktur File

```
/
├── index.html              # Markup lengkap, semua elemen UI sudah ada di DOM
├── css/
│   └── style.css           # Design tokens (CSS custom properties) + semua styling
├── js/
│   └── app.js              # Seluruh logika aplikasi (IIFE, vanilla JS)
└── vendor/
    └── chart.umd.min.js    # Chart.js bundled lokal (tanpa CDN dependency)
```

### Pola Arsitektur

```
┌─────────────────────────────────────────────┐
│                  index.html                  │
│   (DOM sudah lengkap, tidak di-generate JS)  │
└──────────────┬──────────────────────────────┘
               │ DOMContentLoaded
               ▼
┌─────────────────────────────────────────────┐
│               app.js (IIFE)                  │
│                                             │
│  State ──► Render Functions ──► DOM Update  │
│    │                                        │
│    └──► localStorage (persist/restore)      │
└─────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│           vendor/chart.umd.min.js            │
│   (Chart instance dikelola oleh app.js)      │
└─────────────────────────────────────────────┘
```

**Alur data satu arah:**
1. User action (submit form / delete / sort change / theme toggle)
2. → Update array `transactions` di memory
3. → Simpan ke `localStorage`
4. → Panggil `renderAll()` → update DOM + Chart

---

## Components and Interfaces

### 1. State (In-Memory)

```js
let transactions = [];   // Array of Transaction objects
let sortMode = "date-desc";
let chartInstance = null; // Chart.js instance (singleton)
```

**Transaction Object Schema:**
```js
{
  id: string,          // crypto.randomUUID() atau fallback Date.now()+random
  name: string,        // Nama item, maks. 100 karakter
  amount: number,      // Dibulatkan ke 2 desimal: Math.round(val * 100) / 100
  category: string,    // "Food" | "Transport" | "Fun"
  createdAt: number    // Unix timestamp (ms) dari Date.now()
}
```

---

### 2. Storage Layer

Semua operasi `localStorage` dibungkus dengan try/catch untuk fault tolerance.

| Fungsi | Keterangan |
|---|---|
| `loadTransactions()` | Baca `ledgerline:transactions`, parse JSON, kembalikan array atau `[]` jika error |
| `saveTransactions()` | Serialisasi array `transactions` ke JSON dan simpan |

Storage keys yang digunakan:

| Key | Tipe | Keterangan |
|---|---|---|
| `ledgerline:transactions` | JSON array | Koleksi semua Transaction |
| `ledgerline:theme` | string | `"light"` atau `"dark"` |
| `ledgerline:limit` | string (number) | Nilai Spending Limit; dihapus jika kosong |
| `ledgerline:sort` | string | Nilai Sort_Mode aktif |

---

### 3. Theme System

```
initTheme()
  └── baca localStorage → fallback ke prefers-color-scheme → applyTheme()

applyTheme(theme)
  ├── "dark" → set data-theme="dark" pada <html>
  │            label = "Day ledger", aria-pressed = "true"
  └── "light" → hapus data-theme dari <html>
                label = "Night ledger", aria-pressed = "false"

toggleTheme()
  └── cek state saat ini → applyTheme(opposite) → renderChart()
```

**CSS Custom Properties** otomatis bereaksi terhadap `[data-theme="dark"]` selector — tidak ada class toggle tambahan yang diperlukan di JavaScript.

---

### 4. Form & Validation

```
handleFormSubmit(event)
  ├── preventDefault()
  ├── ambil nilai: name, amount, category
  ├── clearFieldErrors()
  ├── validasi:
  │   ├── name kosong → setFieldError("item-name", ...)
  │   ├── amount invalid/≤0 → setFieldError("item-amount", ...)
  │   └── category kosong → setFieldError("item-category", ...)
  ├── jika tidak valid → return (berhenti)
  └── jika valid:
      ├── buat Transaction object (dengan id, createdAt)
      ├── push ke transactions[]
      ├── saveTransactions()
      ├── form.reset()
      ├── renderAll()
      └── nameInput.focus()
```

**Error state** dikelola dengan class CSS:
- `.has-error` ditambahkan ke elemen `.field` → border merah pada input
- Teks error diisi ke `<span class="field-error">` yang sudah ada di DOM

---

### 5. Render Pipeline

Semua update UI dipicu oleh satu titik masuk:

```
renderAll()
  ├── renderBalance()   — update #balance-amount + limit status + over-budget style
  ├── renderList()      — rebuild #transaction-list dari sorted transactions[]
  └── renderChart()     — destroy + recreate Chart.js instance + renderLegend()
```

**`renderBalance()`**
- `getTotal()` → sum semua `t.amount`
- `formatCurrency()` → `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`
- `getLimit()` → parse `limitInput.value`; return `null` jika kosong/invalid
- Kondisi: `total > limit` → class `is-over` pada `.stamp-card` dan `#limit-status`

**`renderList()`**
- Kosongkan `listEl.innerHTML`
- Jika `transactions.length === 0` → tampilkan `.empty-state`, return
- Panggil `getSortedTransactions()` → loop → `createElement("li")` → inject HTML via template literal (teks di-set via `.textContent` untuk keamanan XSS)
- Attach event listener delete pada setiap baris

**`renderChart()`**
- Hitung `getCategoryTotals()` → `{ Food: n, Transport: n, Fun: n }`
- Jika tidak ada data → sembunyikan canvas, tampilkan `#chart-empty`, destroy chart instance
- Jika ada data → destroy instance lama → buat `new Chart()` dengan type `"pie"`
- Warna segmen diambil dari `CATEGORY_META[cat].light` atau `.dark` sesuai tema

---

### 6. Sorting

```
getSortedTransactions()
  ├── spread: [...transactions]  (tidak mutasi state asli)
  ├── "amount-desc" → sort b.amount - a.amount
  ├── "amount-asc"  → sort a.amount - b.amount
  ├── "category"    → localeCompare(category) || b.createdAt - a.createdAt
  └── "date-desc"   → sort b.createdAt - a.createdAt  (default)
```

---

### 7. Category Metadata

```js
const CATEGORY_META = {
  Food:      { light: "#6b8f71", dark: "#8fbf95", tagClass: "tx-tag--food" },
  Transport: { light: "#3e6e8e", dark: "#7fb3d5", tagClass: "tx-tag--transport" },
  Fun:       { light: "#8e5572", dark: "#c08aa6", tagClass: "tx-tag--fun" },
};
const CATEGORY_ORDER = ["Food", "Transport", "Fun"];
```

`CATEGORY_ORDER` digunakan untuk urutan legend dan urutan data Chart.js agar konsisten.

---

## Data Models

### Transaction

```
Transaction {
  id        : string   — UUID unik per transaksi
  name      : string   — Nama item (1–100 karakter)
  amount    : number   — Jumlah uang, 2 desimal, > 0
  category  : "Food" | "Transport" | "Fun"
  createdAt : number   — Unix timestamp ms, digunakan untuk sort date-desc
}
```

### LocalStorage Schema

```
ledgerline:transactions → JSON.stringify(Transaction[])
ledgerline:theme        → "light" | "dark"
ledgerline:limit        → "150.00" (string number) | tidak ada key = no limit
ledgerline:sort         → "date-desc" | "amount-desc" | "amount-asc" | "category"
```

---

## CSS Architecture

### Design Tokens (CSS Custom Properties)

Semua nilai desain didefinisikan di `:root` dan di-override di `[data-theme="dark"]`:

```
Warna         : --paper, --paper-raised, --ink, --ink-soft, --line, --line-strong
Aksen         : --accent, --accent-soft, --danger, --danger-soft
Per-kategori  : --food, --food-soft, --transport, --transport-soft, --fun, --fun-soft
Spacing       : --radius-sm (6px), --radius (12px)
Shadow        : --shadow, --shadow-lift
Font          : --font-display (Zilla Slab), --font-body (Inter), --font-mono (IBM Plex Mono)
```

### Layout Grid

**Desktop (> 760px):**
```css
.app-grid {
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "form list"
    "chart list";
}
```

**Mobile (≤ 760px):**
```css
.app-grid {
  grid-template-columns: 1fr;
  grid-template-areas: "form" "list" "chart";
}
```

### State Classes (dikelola JavaScript)

| Class | Elemen | Efek |
|---|---|---|
| `is-over` | `.stamp-card` | Border + text berubah ke `--danger` |
| `is-over` | `#limit-status` | Text berubah ke `--danger`, font-weight: 600 |
| `is-visible` | `.empty-state` | `display: block` (default: `none`) |
| `has-error` | `.field` | Input border berubah ke `--danger` |
| `data-theme="dark"` | `<html>` | Semua token warna di-override ke palet gelap |

---

## Chart.js Integration

- Library dimuat dari `vendor/chart.umd.min.js` (lokal, bukan CDN)
- Instance dikelola sebagai singleton: `chartInstance`
- Setiap kali render: instance lama di-`destroy()` lalu dibuat instance baru
- Konfigurasi:

```js
{
  type: "pie",
  data: {
    labels: ["Food", "Transport", "Fun"],  // hanya kategori dengan total > 0
    datasets: [{ data, backgroundColor: colors, borderColor, borderWidth: 2 }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },  // legend custom dirender manual
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}`
        }
      }
    }
  }
}
```

---

## Accessibility Implementation

| Kebutuhan | Implementasi |
|---|---|
| Label-input association | Setiap `<input>` dan `<select>` memiliki `<label for="...">` yang matching |
| Chart description | `<canvas role="img" aria-label="Pie chart of spending by category">` |
| Delete button | `aria-label="Delete transaction"` pada setiap `.tx-delete` |
| Focus ring | `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` |
| Reduced motion | `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important } }` |
| Theme toggle state | `aria-pressed="true/false"` diupdate setiap toggle |

---

## Error Handling

| Skenario | Penanganan |
|---|---|
| `localStorage` tidak tersedia / corrupt | try/catch di `loadTransactions()` dan `saveTransactions()`; fallback ke array kosong |
| `crypto.randomUUID` tidak tersedia | Fallback: `String(Date.now() + Math.random())` |
| Amount input non-numerik | `parseFloat()` + validasi `isNaN()` sebelum Transaction dibuat |
| Limit input non-numerik | `getLimit()` return `null` → perlakukan sebagai no-limit |
