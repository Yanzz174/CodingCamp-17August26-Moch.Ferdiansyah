# Implementation Tasks

Semua task di bawah sudah selesai diimplementasikan. Dokumen ini merekam checklist implementasi yang mencerminkan kondisi aktual kode di repository.

## Tasks

- [x] 1. Setup struktur proyek dan dependensi
  - [x] 1.1. Buat struktur folder: `css/`, `js/`, `vendor/`
  - [x] 1.2. Download dan simpan `chart.umd.min.js` ke folder `vendor/` (lokal, tanpa CDN)
  - [x] 1.3. Buat `index.html` dengan meta viewport, link font Google (Zilla Slab, Inter, IBM Plex Mono), link stylesheet, dan script tags
  - **Files:** `index.html`, `vendor/chart.umd.min.js`

- [x] 2. Implementasi markup HTML lengkap
  - [x] 2.1. Buat dekorasi `tape-edge` atas dan bawah (perforated tape effect)
  - [x] 2.2. Buat app header dengan brand mark `§`, nama "Ledger & Line", dan tombol theme toggle
  - [x] 2.3. Buat balance row: `stamp-card` (#balance-amount) dan `limit-card` (input limit + status)
  - [x] 2.4. Buat panel Form dengan field item-name, item-amount (dengan prefix `$`), item-category dropdown, dan tombol submit
  - [x] 2.5. Buat panel Transaction List dengan header sort control dan `<ul id="transaction-list">`
  - [x] 2.6. Buat panel Chart dengan `<canvas id="category-chart">` dan `<ul id="chart-legend">`
  - [x] 2.7. Tambahkan semua `id`, `for`, `aria-label`, dan `aria-pressed` yang diperlukan untuk aksesibilitas
  - **Files:** `index.html`

- [x] 3. Implementasi CSS design system
  - [x] 3.1. Definisikan semua CSS custom properties (design tokens) di `:root`: warna, font, radius, shadow
  - [x] 3.2. Definisikan override token untuk `[data-theme="dark"]`
  - [x] 3.3. Implementasikan CSS reset dan base styles
  - [x] 3.4. Tambahkan `@media (prefers-reduced-motion: reduce)` untuk mematikan animasi
  - [x] 3.5. Style `.tape-edge` dengan radial-gradient untuk efek receipt tape
  - [x] 3.6. Style `.app-header`, `.brand`, `.theme-toggle`
  - [x] 3.7. Style `.balance-row` (grid 2 kolom), `.stamp-card`, `.limit-card`
  - [x] 3.8. Style `.app-grid` (CSS grid 2 kolom: form+list kanan, chart bawah form)
  - [x] 3.9. Style `.panel`, `.panel-title`, `.panel-list-header`, `.sort-control`
  - [x] 3.10. Style form fields: `.field`, `.amount-wrap`, `.field-error`, `.btn-primary`
  - [x] 3.11. Style `.transaction-list`, `.transaction-row`, `.tx-tag` (per kategori), `.tx-delete`
  - [x] 3.12. Style `.chart-wrap`, `#category-chart`, `.chart-legend`, `.legend-swatch`
  - [x] 3.13. Style `.empty-state` dengan `display: none` default dan `.is-visible` toggle
  - [x] 3.14. Implementasikan state classes: `.is-over` (over-budget), `.has-error` (form validation)
  - [x] 3.15. Implementasikan `:focus-visible` outline global
  - [x] 3.16. Implementasikan responsive layout dengan media query `@media (max-width: 760px)`
  - **Files:** `css/style.css`

- [x] 4. Setup app.js — boilerplate dan inisialisasi
  - [x] 4.1. Bungkus seluruh kode dalam IIFE dengan `"use strict"`
  - [x] 4.2. Definisikan konstanta storage keys: `STORAGE_KEY`, `THEME_KEY`, `LIMIT_KEY`, `SORT_KEY`
  - [x] 4.3. Definisikan `CATEGORY_META` object dengan warna light/dark dan tagClass per kategori
  - [x] 4.4. Definisikan `CATEGORY_ORDER` array: `["Food", "Transport", "Fun"]`
  - [x] 4.5. Cache semua referensi DOM ke variabel
  - [x] 4.6. Deklarasikan state: `transactions`, `sortMode`, `chartInstance`
  - [x] 4.7. Implementasikan fungsi `init()` yang dipanggil di `DOMContentLoaded`
  - **Files:** `js/app.js`

- [x] 5. Implementasi localStorage layer
  - [x] 5.1. Implementasikan `loadTransactions()` dengan try/catch, parse JSON, validasi array
  - [x] 5.2. Implementasikan `saveTransactions()` dengan try/catch
  - [x] 5.3. Inisialisasi state `transactions` dari `loadTransactions()` saat module load
  - **Files:** `js/app.js`

- [x] 6. Implementasi theme system
  - [x] 6.1. Implementasikan `initTheme()`: baca localStorage → fallback ke `prefers-color-scheme`
  - [x] 6.2. Implementasikan `applyTheme(theme)`: set/hapus `data-theme` pada `<html>`, update label dan `aria-pressed`
  - [x] 6.3. Implementasikan `toggleTheme()`: toggle antara light/dark, simpan ke localStorage, panggil `renderChart()`
  - [x] 6.4. Implementasikan helper `isDarkTheme()` yang digunakan oleh render functions
  - **Files:** `js/app.js`

- [x] 7. Implementasi form handling dan validasi
  - [x] 7.1. Implementasikan `handleFormSubmit(event)` dengan `preventDefault()`
  - [x] 7.2. Implementasikan `clearFieldErrors()`: hapus teks error, hapus class `.has-error`
  - [x] 7.3. Implementasikan `setFieldError(fieldId, errorEl, message)`: tambah class `.has-error`, isi teks error
  - [x] 7.4. Validasi nama item: tidak boleh kosong
  - [x] 7.5. Validasi amount: tidak boleh kosong, harus numerik, harus > 0
  - [x] 7.6. Validasi category: harus dipilih (bukan placeholder)
  - [x] 7.7. Buat Transaction object dengan `crypto.randomUUID()` (fallback ke `Date.now() + Math.random()`)
  - [x] 7.8. Bulatkan amount ke 2 desimal: `Math.round(amount * 100) / 100`
  - [x] 7.9. Push ke `transactions[]`, panggil `saveTransactions()`, reset form, panggil `renderAll()`, fokus ke nama input
  - **Files:** `js/app.js`

- [x] 8. Implementasi delete transaction
  - [x] 8.1. Implementasikan `handleDelete(id)`: filter `transactions` by id, save, `renderAll()`
  - [x] 8.2. Attach event listener delete ke setiap tombol `.tx-delete` saat `renderList()`
  - **Files:** `js/app.js`

- [x] 9. Implementasi render pipeline
  - [x] 9.1. Implementasikan `renderAll()` yang memanggil `renderBalance()`, `renderList()`, `renderChart()`
  - [x] 9.2. Implementasikan `getTotal()`: sum semua `t.amount` dari `transactions[]`
  - [x] 9.3. Implementasikan `formatCurrency(value)` menggunakan `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`
  - [x] 9.4. Implementasikan `renderBalance()`: update `#balance-amount`, evaluasi limit, update status dan class over-budget
  - [x] 9.5. Implementasikan `getLimit()`: parse `limitInput.value`, return `null` jika kosong/invalid/≤0
  - [x] 9.6. Implementasikan `renderList()`: kosongkan list, handle empty state, loop sorted transactions, buat elemen `<li>` menggunakan `.textContent` (aman dari XSS)
  - **Files:** `js/app.js`

- [x] 10. Implementasi sorting
  - [x] 10.1. Implementasikan `handleSortChange()`: update `sortMode`, simpan ke localStorage, panggil `renderList()`
  - [x] 10.2. Implementasikan `getSortedTransactions()` dengan spread `[...transactions]` (immutable)
  - [x] 10.3. Sort `date-desc`: `b.createdAt - a.createdAt`
  - [x] 10.4. Sort `amount-desc`: `b.amount - a.amount`
  - [x] 10.5. Sort `amount-asc`: `a.amount - b.amount`
  - [x] 10.6. Sort `category`: `a.category.localeCompare(b.category) || b.createdAt - a.createdAt`
  - [x] 10.7. Attach `change` event listener ke `#sort-select` di `init()`
  - **Files:** `js/app.js`

- [x] 11. Implementasi spending limit
  - [x] 11.1. Implementasikan `handleLimitChange()`: simpan/hapus ke localStorage, panggil `renderBalance()`
  - [x] 11.2. Attach `input` event listener ke `#limit-input` di `init()`
  - [x] 11.3. Restore nilai limit dari localStorage di `init()`
  - **Files:** `js/app.js`

- [x] 12. Implementasi Chart.js pie chart
  - [x] 12.1. Implementasikan `getCategoryTotals()`: hitung total per kategori dari `transactions[]`
  - [x] 12.2. Implementasikan `renderChart()`: toggle visibility canvas vs empty state
  - [x] 12.3. Destroy chart instance lama sebelum membuat yang baru (mencegah memory leak)
  - [x] 12.4. Filter labels dan data hanya untuk kategori dengan total > 0
  - [x] 12.5. Ambil warna dari `CATEGORY_META[cat].light` atau `.dark` sesuai tema aktif
  - [x] 12.6. Buat Chart.js instance dengan type `"pie"`, `legend.display: false`, custom tooltip callback
  - [x] 12.7. Implementasikan `renderLegend(totals)`: rebuild `#chart-legend` dengan swatch warna dan amount formatted
  - **Files:** `js/app.js`

- [x] 13. Verifikasi aksesibilitas
  - [x] 13.1. Pastikan semua `<label for="...">` matching dengan `id` input yang sesuai
  - [x] 13.2. Pastikan `<canvas>` memiliki `role="img"` dan `aria-label` yang deskriptif
  - [x] 13.3. Pastikan setiap tombol delete memiliki `aria-label="Delete transaction"`
  - [x] 13.4. Pastikan `:focus-visible` outline terlihat di semua elemen interaktif
  - [x] 13.5. Pastikan `prefers-reduced-motion` media query aktif di CSS
  - **Files:** `index.html`, `css/style.css`, `js/app.js`

- [x] 14. Verifikasi responsivitas
  - [x] 14.1. Pastikan layout 2-kolom berfungsi di viewport > 760px
  - [x] 14.2. Pastikan layout 1-kolom berfungsi di viewport ≤ 760px
  - [x] 14.3. Pastikan `max-height` transaction list: 360px (desktop) dan 300px (mobile)
  - [x] 14.4. Pastikan `balance-row` stack ke 1 kolom di mobile
  - **Files:** `css/style.css`
