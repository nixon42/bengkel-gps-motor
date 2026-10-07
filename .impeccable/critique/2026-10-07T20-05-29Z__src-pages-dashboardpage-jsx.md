---
target: src/pages/DashboardPage.jsx
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/run/media/nixon/6fde869e-c24a-48e3-80a4-6e3a943a14db/Project/tmp/bengkel-gps-motor/src/pages/DashboardPage.jsx"
target_fingerprint: "sha256:ac5f8bcadad5ae4c7f9330eaf737507e420db55c738257522a957fe5397261ac"
target_path: /run/media/nixon/6fde869e-c24a-48e3-80a4-6e3a943a14db/Project/tmp/bengkel-gps-motor/src/pages/DashboardPage.jsx
timestamp: 2026-10-07T20-05-29Z
slug: src-pages-dashboardpage-jsx
---
Method: dual-agent (A: b690fb0e-7d6d-4591-98ec-fa55572e19aa · B: 7a4d86db-feb9-4931-a161-76eb9fd05c66)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3/4 | Refresh spinner aktif, namun kegagalan koneksi API (`error`) tidak ditampilkan di UI. |
| 2 | Match System / Real World | 3/4 | Istilah bengkel akurat (*Mobil Masuk, Pengerjaan Servis*), sumbu X grafik memakai irisan tanggal mentah (`10-05`). |
| 3 | User Control and Freedom | 3/4 | Kartu KPI terhubung ke modul, namun fokus search bar langsung menjebak pengguna ke modal aksi cepat. |
| 4 | Consistency and Standards | 3/4 | Token warna semantik solid, namun gaya chart garis berbeda dengan grouped bar di menu Keuangan. |
| 5 | Error Prevention | 3/4 | Dashboard bersifat read-only aman, namun kegagalan fetch diam-diam menampilkan angka Rp 0 tanpa peringatan. |
| 6 | Recognition Rather Than Recall | 4/4 | 6 tahap status RO ditampilkan lengkap dengan warna, persentase, dan log audit jelas. |
| 7 | Flexibility and Efficiency | 3/4 | Mendukung shortcut keyboard (`/`, `Ctrl+K`), namun belum bisa mencari plat nomor kendaraan langsung. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Desain Modern Flat bersih tanpa glassmorphism, namun bobot visual 6 panel utama setara tanpa hierarki urgensi. |
| 9 | Error Recovery | 1/4 | Tangkapan error state tidak dirender di JSX; tidak ada banner error atau tombol "Coba Lagi". |
| 10 | Help and Documentation | 3/4 | Tautan panduan `/docs` terintegrasi, namun belum ada tooltip penjelasan kalkulasi ambang batas stok. |
| **Total** | | **29/40** | **Good** |

## Design Specificity Verdict

- **Evaluasi Desain (LLM)**: Dashboard memiliki grounding domain yang kuat untuk operasional bengkel mobil Indonesia (alur RO 6-tahap, mata uang Rupiah, peringatan sparepart menipis, format WIB, desain Modern Flat ramah perangkat low-end). Namun, terdapat celah abstraksi SaaS generik: identitas fisik bengkel (*Bengkel Mobil GPS Motor Kediri*) tidak muncul di header dashboard, ketiadaan visibilitas bay/stall bengkel atau beban kerja mekanik, serta palet pencarian yang belum mendukung lookup plat nomor mobil (*Plat AG*).
- **Pemindaian Deterministik**: CLI scanner Impeccable mencatat **0 cacat** (`[]`, exit code 0) pada `DashboardPage.jsx`, `AdminDashboard.jsx`, dan `PnlChart.jsx`. Kode bersih dari antipola AI SaaS, bebas font eksternal berlebihan, dan menggunakan SVG mandiri. Analisis kode mendalam mendeteksi petunjuk navigasi panah keyboard pada modal yang belum terikat ke event listener (`ArrowUp`/`ArrowDown`), serta potensi distorsi aspek rasio SVG chart garis pada layar ultra-lebar (`preserveAspectRatio="none"`).
- **Hamparan Visual (Browser Overlay)**: Hamparan browser tidak dijalankan karena server dev lokal tidak aktif di background. Bukti deterministik bersumber langsung dari parser AST dan scanner CLI.

## Overall Impression

Fondasi dashboard sangat solid, cepat, dan fungsional dengan render SVG murni tanpa dependensi berat. Namun, halaman ini terasa seperti dashboard eksekutif analitik pasif daripada pusat komando operasional bengkel yang dinamis: belum ada area "Perhatian Hari Ini" untuk mobil yang tertahan atau suku cadang habis, dan ketiadaan penanganan error rendering berisiko memicu kepanikan pemilik bengkel saat koneksi terputus.

## What's Working

1. **Grafis SVG Murni Ultra-Ringan**: Donut status dan polyline 30 hari dibuat dengan perhitungan SVG matematika murni tanpa pustaka berat (Recharts/Chart.js), menjamin performa 60fps instan di smartphone Android maupun VPS 2GB.
2. **Kesesuaian Siklus Hidup Bengkel Nyata**: Representasi 6 tahapan RO (`Masuk` s/d `Sudah Diambil`) terintegrasi rapi dengan pemotongan stok suku cadang dan pembukuan kas.
3. **Ergonomi Sentuh Responsif**: Tabel sparepart otomatis beradaptasi menjadi susunan kartu mobile dengan target sentuh ≥44px yang ramah jari teknisi.

## Priority Issues

- **[P1] Silent Fetch Error Suppression**
  - *Mengapa bermasalah*: Saat request API gagal, state `error` tertangkap tetapi tidak dirender di JSX. Angka otomatis bernilai Rp 0 dan 0 mobil, memicu kepanikan pemilik bengkel yang mengira data transaksi hilang.
  - *Solusi*: Tampilkan banner error kontras tinggi dengan pesan jelas dalam Bahasa Indonesia dan tombol aksi *"Coba Lagi"*.
  - *Saran perintah*: `/impeccable harden`
- **[P1] Ketiadaan Strip Triage "Atensi Hari Ini" (Today's Operational Attention)**
  - *Mengapa bermasalah*: Keempat kartu metrik memiliki ukuran dan bobot visual yang sama. Pemilik bengkel harus menelusuri data secara manual untuk mencari mobil yang tertahan di status `MENUNGGU_PART` atau stok suku cadang yang kosong (0 pcs).
  - *Solusi*: Tambahkan strip ringkas "Perlu Tindakan Cepat Hari Ini" tepat di bawah kartu KPI dengan tombol aksi 1-klik (misal: hubungi supplier via WA, cek progres mekanik).
  - *Saran perintah*: `/impeccable layout`
- **[P2] Omnibox Pencarian Terperangkap Modal & Belum Mendukung Plat Nomor**
  - *Mengapa bermasalah*: Menekan `/` atau mengklik kotak pencarian langsung membuka modal navigasi 8 item alih-alih mencari plat nomor mobil pelanggan di lantai bengkel.
  - *Solusi*: Jadikan kotak pencarian sebagai Workshop Omnibox yang dapat mencari plat nomor kendaraan, nama pelanggan, dan navigasi menu secara instan.
  - *Saran perintah*: `/impeccable clarify`
- **[P2] Titik Data SVG Tidak Interaktif pada Layar Sentuh Mobile**
  - *Mengapa bermasalah*: Titik data grafik kas 30 hari menggunakan tag `<title>` SVG bawaan browser yang tidak dapat ditap/disentuh pada smartphone layar sentuh Android/iOS.
  - *Solusi*: Terapkan strip detail interaktif aktif saat disentuh seperti yang telah diterapkan pada `PnlChart.jsx`.
  - *Saran perintah*: `/impeccable adapt`
- **[P3] Inkonsistensi Visual Gaya Chart dengan Menu Keuangan**
  - *Mengapa bermasalah*: Dashboard menggunakan line chart polyline, sedangkan halaman keuangan menggunakan grouped bar chart dengan format sumbu tanggal yang berbeda (`10-05` vs `5 Okt`).
  - *Solusi*: Selaraskan token tipografi tanggal, gridline, dan perilaku hover di kedua komponen.
  - *Saran perintah*: `/impeccable polish`

## Persona Red Flags

- **Alex (Pemilik Bengkel Sibuk - Pak Budi)**: Membuka dashboard pukul 07:30 pagi untuk melihat kapasitas bengkel dan mobil tertahan, tetapi hanya disajikan metrik agregat dan grafik historis 30 hari tanpa tahu stall/bay mana yang penuh atau mekanik mana yang senggang.
- **Casey (Mekanik Mobile - Mas Agus)**: Mengakses lewat smartphone di samping mobil dengan tangan bertaut oli, tidak dapat men-tap titik grafik riwayat keuangan, serta tombol navigasi atas terlalu rapat untuk jempol.
- **Sam (Kasir & Aksesibilitas Keyboard - Mbak Siti)**: Kartu KPI menggunakan `div onClick` tanpa `tabIndex="0"` atau `role="button"`, sehingga tidak dapat diakses menggunakan navigasi keyboard `Tab`.

## Minor Observations

- Pusat donut chart menampilkan label *"Aktif"*, namun total data di sampingnya mengikutsertakan mobil yang sudah diambil (`DIAMBIL`), menimbulkan keraguan hitungan.
- Bar target pendapatan bulanan menampilkan persentase (`42%`), tetapi belum menampilkan selisih nominal yang harus dikejar bulan ini.
- Navigasi panah `ArrowUp` / `ArrowDown` tertulis di footer modal aksi cepat, tetapi belum ada event handler-nya di kode.

## Questions to Consider

1. *Bagaimana jika dashboard membuka hari kerja dengan status stall/bay fisik bengkel di Kediri (misal: Bay 1 Lift Avanza, Bay 2 Tune-up Innova)?*
2. *Bagaimana jika bilah pencarian atas langsung mengenali Plat Nomor kendaraan (Plat AG) dan membuka detail servis dalam 1 ketukan?*
3. *Bagaimana jika kartu Sparepart Kritis menyediakan tombol WhatsApp 1-klik dengan pesan otomatis ke supplier langganan di Kediri?*
