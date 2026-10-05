# Panduan Deployment: VPS Kentang (2 Core CPU, 2 GB RAM)

Panduan ini disusun khusus untuk menjalankan aplikasi **Bengkel Mobil GPS Motor Kediri** secara optimal, ringan, dan stabil tanpa resiko *Out-Of-Memory (OOM)* pada VPS dengan spesifikasi 2 Core CPU dan 2 GB RAM (misal: DigitalOcean \$12/mo, Contabo Cloud VPS, Linode, IdCloudHost, DomaiNesia, Biznet Gio, dll.).

---

## 1. Arsitektur & Optimasi yang Sudah Diterapkan

Aplikasi telah dilengkapi optimasi otomatis untuk batas memori 2 GB:
1. **Node.js Heap Limit (`--max-old-space-size=512`)**:
   - Membatasi konsumsi memory proses Node.js maksimal 512 MB.
   - Sisa RAM (~1.5 GB) dialokasikan bebas untuk Kernel Linux, Buffer/Cache OS, dan Nginx.
2. **Sharp / libvips Guard**:
   - Concurrency dikunci ke 1 thread (`sharp.concurrency(1)`).
   - Cache libvips dibatasi 32 MB (`sharp.cache({ memory: 32 })`).
   - Mencegah lonjakan RAM drastis saat pengguna mengunggah foto repair order / nota.
3. **SQLite WAL Pragmas**:
   - Cache size dibatasi 16 MB (`cache_size = -16000`).
   - Batas memory-mapped I/O 64 MB (`mmap_size = 64000000`).
   - Performa query secepat in-memory tanpa memakan RAM server.
4. **Salting Gambar di Disk Server (`IMAGE_STORAGE_SALT`)**:
   - Gambar tersimpan di disk server dalam keadaan teracak (tidak bisa dibuka langsung).
   - Serving ke browser sangat cepat menggunakan HTTP ETag & Cache (`304 Not Modified`) sehingga tidak membebani CPU 2-core secara berulang.
   - Tersedia script restore offline: `node scripts/restore-images.js --restore`.

---

## 2. Persiapan Server VPS (Sekali Saja)

Jalankan script optimasi Swap dan Kernel:

```bash
# Clone atau upload repository ke VPS
git clone <repo-url> /var/www/bengkel-gps-motor
cd /var/www/bengkel-gps-motor

# Jalankan script tuning Swap 2GB & vm.swappiness (harus sebagai root)
sudo bash scripts/setup-vps.sh
```

Script di atas akan:
- Membuat **2GB Swapfile** (sangat krusial untuk mencegah Linux OOM-killer saat proses `npm ci` atau build).
- Mengatur `vm.swappiness=10` (mengutamakan RAM fisik dan hanya menggunakan swap saat darurat).

---

## 3. Konfigurasi Environment (`.env`)

Salin template konfigurasi:
```bash
cp .env.example .env
nano .env
```

Pastikan variabel penting ini terisi:
```ini
PORT=3000
NODE_ENV=production
SESSION_SECRET=buat_kunci_acak_yang_panjang_dan_rahasia_disini_2026
IMAGE_STORAGE_SALT=kunci_rahasia_salt_gambar_di_server_anda_2026
DB_PATH=./data/bengkel.db
UPLOAD_DIR=./uploads
```

---

## 4. Opsi Deployment 1: Menggunakan Docker Compose (Direkomendasikan)

Docker Compose sudah dikonfigurasi dengan `deploy.resources.limits`:
- CPU: `1.8 core`
- RAM: `768 MB` (dengan reservasi minimal `128 MB`)

Jalankan:
```bash
# Build dan jalankan di background
docker compose up -d --build

# Cek logs
docker compose logs -f

# Cek konsumsi resource kontainer
docker stats
```

---

## 5. Opsi Deployment 2: Native Node.js + PM2 / Systemd + Nginx

Jika tidak ingin menggunakan Docker dan ingin langsung di host:

### Langkah A: Build Frontend & Install Dependencies
```bash
# Install dependencies produksi
npm ci --omit=dev

# Build aset frontend (jalankan di local lalu upload dist/, atau build langsung di server jika swap aktif)
npm run build
```

### Langkah B: Setup Nginx Reverse Proxy
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/bengkel-gps-motor.conf
# Edit nama domain di /etc/nginx/sites-available/bengkel-gps-motor.conf
sudo ln -s /etc/nginx/sites-available/bengkel-gps-motor.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Langkah C: Jalankan via Systemd (dengan OOM Auto-Restart)
```bash
sudo cp deploy/bengkel.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now bengkel
sudo systemctl status bengkel
```

Atau jika menggunakan **PM2**:
```bash
npm install -g pm2
pm2 start server/index.js --name "bengkel-gps" --max-memory-restart 600M --node-args="--max-old-space-size=512"
pm2 save
pm2 startup
```

---

## 6. Operasional: Manajemen Gambar (Salt & Restore)

Untuk memeriksa atau mengembalikan gambar yang tersimpan di disk:

```bash
# 1. Cek status berapa gambar yang ter-salt di disk
node scripts/restore-images.js --status

# 2. Kembalikan semua gambar ke format normal (misal untuk backup atau inspeksi)
node scripts/restore-images.js --restore

# 3. Kunci/salt kembali seluruh gambar di disk
node scripts/restore-images.js --salt
```

---

## 7. Monitoring Kesehatan Server 2C / 2GB

Untuk memastikan server tetap sehat dan stabil:
- `htop` atau `free -h`: Pantau penggunaan RAM (seharusnya berkisar 400MB - 800MB dari total 2GB).
- `curl http://localhost:3000/api/health`: Memastikan API berstatus `ok`.
