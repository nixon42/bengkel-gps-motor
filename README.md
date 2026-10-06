# Bengkel Mobil GPS Motor Kediri (SPP Bengkel)

[![Test Suite](https://img.shields.io/badge/tests-33%2F33%20passed-success.svg)](#pengujian--verifikasi)
[![Security Hardening](https://img.shields.io/badge/security-10%2F10%20passed-success.svg)](#keamanan--proteksi)
[![Architecture](https://img.shields.io/badge/architecture-multi--tenant-blue.svg)](#arsitektur)
[![Target VPS](https://img.shields.io/badge/vps-2C%20%2F%202GB%20RAM-orange.svg)](#deployment-vps-kentang)
[![Design](https://img.shields.io/badge/design-modern%20flat%20(no%20glass)-purple.svg)](#desain--antarmuka)

Aplikasi manajemen operasional bengkel mobil modern, multi-tenant, dan mobile-first yang dilengkapi dengan portal pelacakan status servis kendaraan publik real-time, pencatatan mutasi inventaris, buku kas keuangan, serta fitur auto-salt keamanan gambar disk server.

Dikembangkan secara khusus sebagai sistem referensi untuk **Bengkel Mobil GPS Motor Kediri** (Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur).

---

## 📸 Fitur Unggulan

### 1. Portal Publik Cek Status Servis (`/:slug/cek-status`)
- **Zero-Friction**: Pelanggan dapat melacak tahapan perbaikan mobil tanpa perlu login.
- **Privacy Masking**: Plat nomor (`AG 1822 AB` $\rightarrow$ `AG 18** AB`) dan nama pelanggan disamarkan otomatis oleh server. Nomor HP, alamat, dan harga beli sparepart tidak pernah diekspos ke publik.
- **Milestone 6 Tahap**: `Masuk` $\rightarrow$ `Diagnosa / Scan` $\rightarrow$ `Pengerjaan` $\rightarrow$ `Menunggu Part` $\rightarrow$ `Selesai` $\rightarrow$ `Sudah Diambil`.
- **Foto Dokumentasi & Sharing WhatsApp**: Dilengkapi timeline foto *Before*, *Progress*, dan *After*, serta tombol share ke WhatsApp dengan link pelacakan token aman.

### 2. Multi-Tenant Workspace & Role-Based Access
- Setiap bengkel memiliki workspace data yang terisolasi total dengan slug unik (contoh: `bengkel-gps-motor`).
- **Role Pengguna**:
  - `Owner / Admin`: Hak akses penuh ke seluruh pengaturan, laporan, dan keuangan.
  - `Mekanik`: Input progres pengerjaan servis mobil dan dokumentasi foto.
  - `Kasir`: Input transaksi kas, nota pembayaran, dan pencatatan pemasukan.
- **Superadmin Portal**: Ringkasan volume sparepart, mutasi stok, riwayat login, dan fitur menghubungkan akun Google multi-email ke workspace yang sama.

### 3. Manajemen Inventaris, Mutasi Stok & Opname
- Katalog sparepart lengkap dengan SKU, kategori, stok minimum alert, dan perhitungan margin keuntungan otomatis.
- **Mutasi Stok (Barang Masuk & Keluar)**: Pencatatan faktur supplier barang masuk dan pengurangan stok barang keluar dengan pencatatan PIC.
- **Stok Opname**: Pencatatan fisik vs sistem aktual dengan rekap penyesuaian otomatis.
- **Ekspor Laporan**: Siap cetak ke format CSV dan PDF.

### 4. Buku Kas & Laporan Laba Rugi (P&L)
- Pencatatan pemasukan (jasa & sparepart) dan pengeluaran (operasional, gaji, tools, listrik).
- Agregasi harian, mingguan, bulanan, dan tahunan.
- Ekspor PDF Laporan Laba Rugi berkop bengkel dan Rekap Kas Harian.

### 5. Keamanan Disk: Salting Gambar (`IMAGE_STORAGE_SALT`)
- Gambar foto dan bukti nota di disk server diacak menggunakan XOR stream cipher ringan dengan kunci derivasi SHA-256 dari environment variable.
- Berkas mentah di disk server tidak dapat dibuka oleh viewer gambar standar (JPEG/PNG/WebP).
- Web server menyajikan gambar secara aman dan cepat ke browser klien menggunakan header HTTP Caching (`ETag`, `Cache-Control`, dan respons `304 Not Modified`).
- Tersedia script mandiri untuk restore offline: `node scripts/restore-images.js --restore`.

---

## ⚡ Dioptimalkan untuk "VPS Kentang" (2 Core CPU, 2 GB RAM)

Aplikasi dirancang agar berjalan sangat ringan, hemat memori, dan bebas dari crash *Out-Of-Memory (OOM)*:
- **Node.js Heap Boundary**: Dibatasi maksimal 512 MB (`--max-old-space-size=512`), menyisakan $\ge 1.4\text{ GB}$ RAM untuk OS dan Nginx.
- **Sharp libvips Guard**: Dibatasi ke 1 thread worker dan cache memori maksimal 32 MB agar upload foto tidak memicu lonjakan RAM.
- **SQLite WAL Tuning**: Cache SQLite dibatasi 16 MB (`cache_size = -16000`) dan memory-mapped I/O 64 MB (`mmap_size = 64000000`).
- **Automated Turnkey Installer**: Script otomatis untuk membuat 2GB Swapfile, kernel sysctl tuning (`vm.swappiness=10`), dan konfigurasi systemd service auto-restart.

---

## 🚀 Panduan Memulai Cepat (Local Development)

### Prasyarat
- Node.js 20 LTS atau lebih baru
- npm 9+

### Instalasi & Menjalankan
```bash
# 1. Clone repositori
git clone https://github.com/nixon42/bengkel-gps-motor.git
cd bengkel-gps-motor

# 2. Pasang dependensi
npm install

# 3. Siapkan berkas konfigurasi .env
cp .env.example .env

# 4. Inisialisasi & seed database sample
npm run seed

# 5. Jalankan server pengembangan (Frontend + Backend bersamaan)
npm run dev
```

Aplikasi akan aktif di:
- **Frontend Vite**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Healthcheck**: `http://localhost:3000/api/health`

Tersedia fitur **1-Click Demo Login** tanpa perlu konfigurasi Google OAuth secara manual saat di lingkungan lokal.

---

## 🛠️ Deployment Produksi di VPS (Ubuntu / Debian)

### Opsi 1: Installer Otomatis Standar Industri (Direkomendasikan)
Jalankan 1 perintah ini langsung di VPS Anda:

```bash
sudo bash install.sh
```

Script ini otomatis mengatur:
1. Alokasi 2GB Swapfile & tuning kernel `vm.swappiness=10`.
2. Akun pengguna sistem terisolasi `bengkel:bengkel` (*least-privilege*).
3. Pembuatan kunci acak unik di `.env` via `openssl rand -hex`.
4. Kompilasi aset Vite & inisialisasi database SQLite.
5. Systemd Service dengan auto-restart, sandboxing, dan pemisahan log ke `/var/log/bengkel-gps-motor/`.
6. Logrotate harian (retensi 14 hari terkompresi).
7. Reverse proxy Nginx dengan Gzip, rate-limiting, dan cache aset.
8. CLI manajemen `/usr/local/bin/bengkel-ctl`.

### Mengelola Layanan dengan `bengkel-ctl`
```bash
bengkel-ctl status          # Cek status & pemakaian RAM
bengkel-ctl logs -f         # Live stream log aplikasi
sudo bengkel-ctl restart    # Restart service dengan aman
sudo bengkel-ctl backup     # Backup database & foto ke tar.gz
sudo bengkel-ctl update     # Tarik kode git terbaru, compile, & restart
```

### Opsi 2: Docker Compose
```bash
docker compose up -d --build
docker compose logs -f
```

---

## 🧪 Pengujian & Verifikasi

Proyek ini dilengkapi dengan rangkaian pengujian otomatis end-to-end yang ketat:

```bash
# Jalankan Master E2E Test Suite (33 pengujian)
npm test

# Jalankan Security Hardening, Image Salting & Desalting Suite (10 pengujian)
node test/adversarial/security-hardening.js

# Jalankan Verifikasi Multi-User Superadmin (10 pengujian)
node test/adversarial/superadmin-multi-user.js

# Jalankan Kompilasi Build Frontend Vite
npm run build
```

---

## 📂 Struktur Proyek

```
bengkel-gps-motor/
├── deploy/                     # Konfigurasi systemd, nginx, dan logrotate
│   ├── bengkel-gps-motor.service
│   ├── logrotate.conf
│   └── nginx.conf
├── public/                     # Aset statis landing page & favicon
├── scripts/                    # Skrip operasional & installer
│   ├── bengkel-ctl.sh          # Global management CLI
│   ├── install-production.sh   # Turnkey production installer
│   ├── restore-images.js       # Offline image salt & restore CLI
│   └── setup-vps.sh            # Kernel & swap tuning script
├── server/                     # Backend Express.js & SQLite
│   ├── db/                     # Schema, migrasi, dan seed database
│   ├── middleware/             # Auth, tenant, upload, dan error handlers
│   ├── routes/                 # Endpoint REST API
│   └── services/               # Masking, salting, PDF, dan CSV generator
├── src/                        # Frontend React 18 + Tailwind CSS
│   ├── components/             # Komponen UI modern flat
│   ├── context/                # Auth & Theme context
│   └── pages/                  # Halaman landing, tracking, dan admin
├── test/                       # E2E & adversarial test suites
├── Dockerfile                  # Multi-stage production container build
├── docker-compose.yml          # Container stack dengan memory limit
├── install.sh                  # Shorthand root installer
├── package.json
└── vite.config.js
```

---

## 📄 Lisensi

Hak Cipta (c) 2026 Bengkel Mobil GPS Motor Kediri. Didistribusikan di bawah lisensi MIT.
