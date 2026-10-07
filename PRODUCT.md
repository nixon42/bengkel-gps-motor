# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Owner / Manajer Bengkel**: Mengawasi operasional bengkel secara menyeluruh, memantau laporan laba rugi keuangan (P&L), produktivitas pengerjaan mekanik, mutasi stok suku cadang, serta mengelola konfigurasi dan identitas bengkel.
- **Mekanik / Teknisi**: Membuka dan memperbarui progres Repair Order (RO) melalui 6 tahapan (`Masuk` → `Diagnosa` → `Pengerjaan` → `Menunggu Part` → `Selesai` → `Sudah Diambil`), mengunggah dokumentasi foto perbaikan (sebelum/saat/sesudah), dan mencatat suku cadang yang digunakan langsung dari ponsel di area bengkel.
- **Kasir / Front Desk**: Menerima kendaraan dan pelanggan di meja depan, menginput keluhan awal, mencetak invoice/nota PDF resmi, menerima pembayaran (Tunai, Transfer, QRIS), mencatat pengeluaran harian, serta mendata barang masuk restock dari supplier dan stok opname.
- **Pelanggan / Pemilik Kendaraan (Publik)**: Memantau status pengerjaan kendaraannya secara langsung via smartphone tanpa perlu login atau registrasi, dengan sensor privasi nomor plat dan nama pemilik demi keamanan data.

## Product Purpose

- Solusi manajemen bengkel mobil mandiri (SPP Bengkel) modern, mobile-friendly, dan multi-tenant untuk Bengkel Mobil GPS Motor Kediri.
- Mengeliminasi miskomunikasi antara teknisi dan pemilik mobil, menggantikan pembukuan manual/kertas dengan pencatatan digital yang presisi, serta memberikan transparansi proses servis kepada pelanggan.
- Sukses berarti: alur intake kendaraan hingga kasir berjalan mulus tanpa hambatan, stok suku cadang akurat, pembukuan kas tercatat rapi, dan pelanggan mendapatkan kepastian status servis lewat tautan tracking publik.

## Positioning

- Perangkat lunak manajemen bengkel mobil yang menggabungkan portal pelacakan publik tanpa login dengan sensor privasi (masking plat & nama), integrasi otomatis antara pengerjaan RO dengan mutasi stok & pembukuan kas, serta arsitektur ringan yang hemat daya komputasi di server VPS (2 Core / 2GB RAM) sekaligus fleksibel dan adaptif di desktop kasir hingga ponsel mekanik.

## Operating Context

- **Area Bengkel Fisik**: Mekanik beroperasi di lingkungan bengkel dinamis, membutuhkan navigasi cepat dengan target sentuh ramah jempol (≥ 44×44px) dan kontras tajam.
- **Meja Kasir & Kantor**: Kasir dan admin menggunakan komputer desktop/laptop untuk pembuatan invoice cepat, cetak nota thermal/A4 PDF, dan pembukuan kas.
- **Pelanggan Bergerak**: Pemilik mobil membuka status servis melalui link WhatsApp di berbagai perangkat smartphone.
- **Lingkungan Server**: Berjalan mandiri dan hemat resource pada server Linux VPS 2 Core / 2GB RAM menggunakan SQLite mode WAL, kompresi gambar efisien (~100KB), dan perlindungan salt pada penyimpanan berkas disk.

## Capabilities and Constraints

- **Multi-Tenant & Akses**: Isolasi data per tenant dengan slug publik (`/:tenant-slug/cek-status`), Google OAuth, dan mock login pengembang lokal.
- **Katalog & Mutasi Inventaris**: Pengelolaan SKU/suku cadang, kategori, harga beli/jual, peringatan stok minimum, mutasi barang masuk/keluar, dan stok opname fisik vs sistem.
- **Buku Kas & Laporan Keuangan**: Pencatatan kas masuk/keluar, kalkulasi laba bersih, ringkasan P&L berkala, dan ekspor laporan ke CSV serta PDF berkop bengkel.
- **Manajemen Servis & Pelanggan**: Siklus hidup RO 6-tahap dengan riwayat waktu dan foto dokumentasi, tautan otomatis suku cadang ke stok inventaris, cetak nota/invoice PDF, dan database riwayat servis pelanggan.
- **Dokumentasi Lengkap**: Panduan interaktif terintegrasi pada `/panduan` dan `/docs` untuk memudahkan orientasi seluruh peran staf bengkel.
- **Batasan**: Desain antarmuka bersih, adaptif untuk layar desktop kasir maupun smartphone, tanpa efek grafis berat yang mengorbankan performa, serta penyimpanan berkas ber-salt untuk keamanan data lokal.

## Brand Commitments

- **Nama Usaha**: Bengkel Mobil GPS Motor Kediri (Slug: `bengkel-gps-motor`).
- **Alamat**: Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur.
- **Kontak / WhatsApp**: 0856-0330-7330.
- **Layanan Utama**: Tune Up, Servis Mobil Injeksi, Overhaul Mesin, Kaki-kaki, Kelistrikan, Perawatan Berkala.
- **Karakter & Suara**: Lugas, transparan, terpercaya, solutif, dan ramah bagi pemilik kendaraan di wilayah Kediri dan sekitarnya.

## Evidence on Hand

- Implementasi aplikasi web lengkap pada folder `src/` dan backend Express + SQLite pada folder `server/`.
- Dokumentasi arsitektur sistem di [`AGENT.md`](AGENT.md) dan spesifikasi fitur di [`PROJECT.md`](PROJECT.md).
- Panduan panduan operasional pengguna di [`src/pages/DocsPage.jsx`](src/pages/DocsPage.jsx).
- Prosedur deployment server di [`VPS_DEPLOYMENT.md`](VPS_DEPLOYMENT.md) dan skrip instalasi di [`deploy/install.sh`](deploy/install.sh).
- Rangkaian pengujian otomatis end-to-end terverifikasi 100% di [`test/verify.js`](test/verify.js).

## Product Principles

1. **Zero-Friction Status Tracking**: Pelanggan tidak dibebani kewajiban registrasi atau login; pelacakan cukup melalui nomor plat pada tautan publik dengan proteksi privasi.
2. **Kesiapan Kerja Lapangan & Fleksibilitas Perangkat**: Antarmuka dirancang responsif, tangguh, dan bertarget sentuh jelas untuk mekanik di lantai bengkel, sekaligus nyaman dan efisien untuk operasional kasir di layar desktop.
3. **Integritas Servis & Stok Real-Time**: Setiap suku cadang yang terpasang pada servis otomatis memotong inventaris dan tercatat transparan pada invoice/nota resmi pelanggan.
4. **Efisiensi Infrastruktur & Kemandirian**: Arsitektur aplikasi hemat daya komputasi, stabil pada VPS ramah anggaran, dan bebas dari ketergantungan cloud database berbayar tinggi.

## Accessibility & Inclusion

- Area klik/sentuh minimum 44×44px untuk kenyamanan penggunaan satu tangan pada layar ponsel.
- Kontras warna yang tegas pada teks dan latar belakang untuk keterbacaan optimal di bawah pencahayaan bengkel terbuka.
- Dukungan mode gelap (Dark Mode) untuk mengurangi ketegangan mata staf dan kasir saat pengoperasian malam hari atau pencahayaan redup.
