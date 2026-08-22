# Requirements Document

## Introduction

Ledger & Line adalah aplikasi web pelacak pengeluaran berbasis klien yang ramah perangkat mobile, dibangun dengan HTML, CSS, dan JavaScript murni (vanilla). Aplikasi ini memungkinkan pengguna mencatat transaksi keuangan, mengkategorikan pengeluaran, memvisualisasikan pengeluaran melalui pie chart interaktif menggunakan Chart.js, dan memantau anggaran terhadap batas pengeluaran yang ditentukan sendiri. Semua data disimpan di `localStorage` browser sehingga tetap ada setelah halaman di-refresh tanpa memerlukan backend.

## Glossary

- **App**: Aplikasi single-page Ledger & Line yang berjalan di browser.
- **Transaction**: Entri pengeluaran yang dicatat, terdiri dari nama item, jumlah uang positif, dan kategori.
- **Category**: Salah satu dari tiga label pengeluaran tetap: `Food`, `Transport`, atau `Fun`.
- **Transaction_List**: Kumpulan semua transaksi yang ditampilkan dalam UI, dapat di-scroll.
- **Balance**: Jumlah total semua amount transaksi yang tersimpan.
- **Spending_Limit**: Batas pengeluaran opsional yang ditentukan pengguna.
- **Chart**: Pie chart yang dirender menggunakan Chart.js, merepresentasikan proporsi pengeluaran per kategori.
- **Legend**: Daftar teks di bawah Chart yang menampilkan total per kategori beserta swatch warna.
- **Local_Storage**: Web Storage API `localStorage` browser yang digunakan untuk persistensi data sisi klien.
- **Theme**: Mode visual aktif App, yaitu `light` atau `dark`.
- **Sort_Mode**: Preferensi urutan aktif untuk Transaction_List: `date-desc`, `amount-desc`, `amount-asc`, atau `category`.
- **Form**: Form HTML yang digunakan untuk membuat Transaction baru.
- **Validator**: Logika validasi sisi klien yang memeriksa input Form sebelum Transaction dibuat.

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** Sebagai pengguna, saya ingin menambahkan transaksi pengeluaran dengan nama, jumlah, dan kategori, agar saya dapat melacak ke mana uang saya pergi.

#### Acceptance Criteria

1. THE Form SHALL menyediakan input teks untuk nama item (maks. 100 karakter), input numerik untuk jumlah uang antara 0.01 dan 999,999,999.99 dengan hingga 2 desimal, dan dropdown selector untuk Category dengan placeholder default yang tidak terpilih ("Choose a category").
2. WHEN pengguna mengsubmit Form dengan nama item non-kosong, amount valid, dan Category yang dipilih, THE App SHALL membuat Transaction dan menambahkannya ke Transaction_List.
3. WHEN pengguna mengsubmit Form dengan nama item kosong, THE Validator SHALL menampilkan pesan error "Please enter an item name." di bawah field nama tanpa membuat Transaction.
4. WHEN pengguna mengsubmit Form dengan amount yang tidak ada, non-numerik, atau ≤ 0, THE Validator SHALL menampilkan pesan error "Enter an amount greater than 0." di bawah field amount tanpa membuat Transaction.
5. WHEN pengguna mengsubmit Form tanpa memilih Category, THE Validator SHALL menampilkan pesan error "Please choose a category." di bawah field category tanpa membuat Transaction.
6. WHEN Form berhasil disubmit, THE App SHALL mereset semua field Form ke kondisi default kosong dan mengembalikan fokus ke input nama item.
7. WHEN pengguna meresubmit Form dan field yang sebelumnya invalid kini lolos validasi, THE Validator SHALL menghapus pesan error untuk field tersebut.

---

### Requirement 2: Display and Manage the Transaction List

**User Story:** Sebagai pengguna, saya ingin melihat semua transaksi yang tercatat dalam sebuah daftar dan dapat menghapus masing-masing transaksi, agar saya dapat meninjau dan mengoreksi riwayat pengeluaran saya.

#### Acceptance Criteria

1. THE Transaction_List SHALL menampilkan setiap Transaction dengan nama item, label Category (dengan tag berwarna sesuai kategori), dan jumlah uang yang diformat sebagai USD currency.
2. WHILE Transaction_List berisi nol Transaction, THE App SHALL menampilkan pesan empty-state "No transactions yet — add your first one to start the tape." dan menyembunyikan elemen Transaction_List.
3. WHEN Transaction ditambahkan, THE App SHALL menampilkan elemen Transaction_List dan menyembunyikan pesan empty-state.
4. WHEN pengguna mengaktifkan delete button pada suatu Transaction, THE App SHALL langsung menghapus Transaction tersebut dari Transaction_List tanpa konfirmasi, lalu memperbarui Balance dan Chart.
5. IF total tinggi semua baris Transaction melebihi 360px pada viewport > 760px, THEN Transaction_List SHALL bisa di-scroll secara vertikal.
6. IF total tinggi semua baris Transaction melebihi 300px pada viewport ≤ 760px, THEN Transaction_List SHALL bisa di-scroll secara vertikal.

---

### Requirement 3: Calculate and Display the Balance

**User Story:** Sebagai pengguna, saya ingin melihat total jumlah yang sudah saya belanjakan, agar saya dapat memahami pengeluaran keseluruhan saya sekilas.

#### Acceptance Criteria

1. THE App SHALL menampilkan Balance sebagai jumlah semua amount Transaction, diformat sebagai USD currency dengan tepat dua desimal (contoh: $1,234.56).
2. WHEN Transaction ditambahkan atau dihapus, THE App SHALL menghitung ulang dan memperbarui Balance yang ditampilkan dalam waktu < 100ms.
3. WHILE tidak ada Transaction, THE App SHALL menampilkan Balance sebagai "$0.00".
4. WHEN App diinisialisasi dan memulihkan Transaction dari Local_Storage, THE App SHALL menghitung Balance dari Transaction yang dipulihkan dan menampilkannya sebelum pengguna dapat berinteraksi.

---

### Requirement 4: Enforce and Display a Spending Limit

**User Story:** Sebagai pengguna, saya ingin menetapkan batas pengeluaran opsional dan mendapat peringatan ketika saya melampauinya, agar saya dapat tetap dalam anggaran.

#### Acceptance Criteria

1. THE App SHALL menyediakan input numerik untuk pengguna menetapkan Spending_Limit.
2. WHILE tidak ada Spending_Limit yang ditetapkan, THE App SHALL menampilkan status "Set a limit to get an over-budget warning."
3. WHEN Balance atau Spending_Limit berubah dan Balance > Spending_Limit, THE App SHALL menampilkan status "Over budget by [amount]." (contoh: "Over budget by $12.50.") dan menerapkan gaya visual over-budget (warna merah/danger) pada kartu Balance.
4. WHEN Balance atau Spending_Limit berubah dan Balance ≤ Spending_Limit, THE App SHALL menampilkan status "[amount] left before you hit your limit." dan menghapus gaya visual over-budget.
5. WHEN input Spending_Limit dikosongkan, THE App SHALL kembali ke kondisi no-limit dan menghapus gaya visual over-budget.
6. WHEN pengguna memasukkan nilai non-numerik atau ≤ 0 pada input Spending_Limit, THE App SHALL memperlakukan Spending_Limit sebagai tidak ditetapkan.

---

### Requirement 5: Visualize Spending by Category

**User Story:** Sebagai pengguna, saya ingin melihat pie chart pengeluaran saya yang dipecah per kategori, agar saya dapat memahami ke mana sebagian besar uang saya pergi.

#### Acceptance Criteria

1. WHILE setidaknya satu Transaction ada, THE Chart SHALL merender pie chart dengan satu segmen per Category yang memiliki total > 0, berukuran proporsional terhadap pangsa Category tersebut dari total semua Transaction.
2. WHILE tidak ada Transaction, THE App SHALL menyembunyikan canvas Chart dan menampilkan pesan "Your chart will appear once you add a transaction."
3. WHEN Transaction ditambahkan atau dihapus, THE Chart SHALL di-render ulang untuk mencerminkan total Category yang diperbarui.
4. THE Legend SHALL menampilkan setiap Category dengan swatch warna dan total amount yang diformat sebagai USD currency.
5. WHEN pengguna hover pada segmen Chart, THE Chart SHALL menampilkan tooltip yang menunjukkan nama Category dan totalnya dalam format USD currency (contoh: "Food: $45.00").

---

### Requirement 6: Sort Transactions

**User Story:** Sebagai pengguna, saya ingin mengurutkan daftar transaksi berdasarkan kriteria berbeda, agar saya dapat menemukan dan meninjau transaksi dengan lebih mudah.

#### Acceptance Criteria

1. THE App SHALL menyediakan sort dropdown dengan opsi: "Newest first" (`date-desc`), "Amount: high to low" (`amount-desc`), "Amount: low to high" (`amount-asc`), dan "Category" (`category`).
2. WHEN Sort_Mode adalah `date-desc`, THE Transaction_List SHALL menampilkan Transaction dari yang paling baru dibuat ke yang paling lama.
3. WHEN Sort_Mode adalah `amount-desc`, THE Transaction_List SHALL menampilkan Transaction dari amount tertinggi ke terendah; jika amount sama, diurutkan dari yang terbaru.
4. WHEN Sort_Mode adalah `amount-asc`, THE Transaction_List SHALL menampilkan Transaction dari amount terendah ke tertinggi; jika amount sama, diurutkan dari yang terbaru.
5. WHEN Sort_Mode adalah `category`, THE Transaction_List SHALL menampilkan Transaction diurutkan secara alfabetis berdasarkan nama Category (case-insensitive via `localeCompare`), dengan Transaction dalam Category yang sama diurutkan dari yang terbaru.
6. THE App SHALL default ke Sort_Mode `date-desc` jika tidak ada Sort_Mode yang tersimpan sebelumnya.
7. WHEN Sort_Mode diubah, THE App SHALL menyimpan nilai ke Local_Storage dan langsung menerapkan urutan baru ke Transaction_List.

---

### Requirement 7: Persist Data Across Sessions

**User Story:** Sebagai pengguna, saya ingin transaksi, batas pengeluaran, preferensi urutan, dan pilihan tema saya tersimpan secara otomatis, agar data saya masih ada ketika saya me-reload atau mengunjungi kembali halaman.

#### Acceptance Criteria

1. WHEN Transaction ditambahkan atau dihapus, THE App SHALL menyimpan koleksi Transaction ke Local_Storage dengan key `ledgerline:transactions`.
2. WHEN App diinisialisasi, THE App SHALL membaca dan memulihkan semua Transaction dari key `ledgerline:transactions`.
3. WHEN Spending_Limit berubah, THE App SHALL menyimpan nilainya ke Local_Storage dengan key `ledgerline:limit`; jika kosong, key dihapus.
4. WHEN App diinisialisasi, THE App SHALL memulihkan Spending_Limit dari key `ledgerline:limit` dan mengisi input field jika ada.
5. WHEN Sort_Mode berubah, THE App SHALL menyimpan nilainya ke Local_Storage dengan key `ledgerline:sort`.
6. WHEN App diinisialisasi, THE App SHALL memulihkan Sort_Mode dari key `ledgerline:sort`; jika tidak ada, default ke `date-desc`.
7. WHEN Theme berubah, THE App SHALL menyimpan nilainya ke Local_Storage dengan key `ledgerline:theme`.
8. WHEN App diinisialisasi, THE App SHALL memulihkan Theme dari key `ledgerline:theme`; jika tidak ada, menerapkan Theme sesuai preferensi OS via media query `prefers-color-scheme`.
9. IF data Local_Storage corrupt atau tidak bisa dibaca, THE App SHALL default ke koleksi Transaction kosong dan melanjutkan inisialisasi tanpa melempar uncaught error.

---

### Requirement 8: Toggle Dark and Light Theme

**User Story:** Sebagai pengguna, saya ingin beralih antara mode visual gelap dan terang, agar saya dapat menggunakan aplikasi dengan nyaman di berbagai kondisi pencahayaan.

#### Acceptance Criteria

1. WHEN pengguna mengaktifkan tombol toggle, THE App SHALL beralih Theme antara `light` dan `dark`.
2. WHILE Theme adalah `dark`, THE App SHALL menerapkan atribut `data-theme="dark"` pada elemen `<html>`, menampilkan label "Day ledger" pada tombol toggle, dan menyetel atribut `aria-pressed` ke `"true"`.
3. WHILE Theme adalah `light`, THE App SHALL menghapus atribut `data-theme` dari elemen `<html>`, menampilkan label "Night ledger" pada tombol toggle, dan menyetel atribut `aria-pressed` ke `"false"`.
4. WHEN Theme di-toggle, THE Chart SHALL di-render ulang menggunakan palet warna yang sesuai dengan Theme baru (warna light dan dark berbeda per Category).

---

### Requirement 9: Responsive Layout

**User Story:** Sebagai pengguna, saya ingin aplikasi dapat digunakan di layar desktop maupun mobile, agar saya dapat melacak pengeluaran dari perangkat apa pun.

#### Acceptance Criteria

1. WHILE lebar viewport > 760px, THE App SHALL menampilkan panel Form dan panel Transaction_List berdampingan dalam grid dua kolom, dengan panel Chart di bawah panel Form.
2. WHILE lebar viewport ≤ 760px, THE App SHALL menampilkan panel Form, panel Transaction_List, dan panel Chart dalam satu kolom vertikal berurutan.
3. WHILE lebar viewport < 760px, THE App SHALL merender semua kontrol interaktif dengan minimum tap target 44 × 44 CSS pixels.
4. WHEN lebar viewport melewati breakpoint 760px (naik atau turun), THE App SHALL memperbarui layout tanpa perlu page reload (ditangani oleh CSS media query secara otomatis).

---

### Requirement 10: Accessibility

**User Story:** Sebagai pengguna yang mengandalkan teknologi asistif, saya ingin aplikasi dapat dinavigasi dengan keyboard dan ramah screen-reader, agar saya dapat menggunakannya tanpa mouse.

#### Acceptance Criteria

1. THE App SHALL mengasosiasikan setiap input Form dengan elemen label yang terlihat menggunakan atribut `for` dan `id` yang sesuai.
2. THE App SHALL mengekspos canvas Chart dengan atribut `aria-label` yang mendeskripsikan fungsinya sebagai pie chart pengeluaran per kategori.
3. WHEN delete button dirender untuk sebuah Transaction, THE App SHALL menyediakan atribut `aria-label="Delete transaction"` pada kontrol tersebut.
4. THE App SHALL menerapkan focus ring yang terlihat pada setiap elemen interaktif ketika elemen tersebut menerima fokus keyboard (via `:focus-visible`).
5. THE App SHALL menghormati media query `prefers-reduced-motion` dengan menyetel durasi semua transisi dan animasi CSS ke `0.001ms` bagi pengguna yang meminta pengurangan gerak.
