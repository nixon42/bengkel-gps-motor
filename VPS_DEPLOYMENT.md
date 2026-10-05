# Panduan Deployment Standar Industri: VPS Kentang (2 Core CPU, 2 GB RAM)

Panduan ini disusun khusus untuk menjalankan aplikasi **Bengkel Mobil GPS Motor Kediri (SPP Bengkel)** dengan arsitektur standar industri Linux:
- **Dedicated System User**: Service berjalan di bawah user non-root `bengkel:bengkel` dengan hak akses minimal (*least-privilege*).
- **Production Systemd Service**: Auto-restart on failure, flapper protection, memory/CPU bounds, dan Linux sandboxing.
- **Dedicated Production Logging**: Log terpisah ke `/var/log/bengkel-gps-motor/app.log` dan `/var/log/bengkel-gps-motor/error.log`.
- **Automatic Logrotate**: Rotasi log harian otomatis dengan kompresi gzip (retensi 14 hari).
- **Reverse Proxy Nginx**: Rate limiting, Gzip, security headers, dan cache aset Vite.
- **Salting Gambar di Server**: Berkas disk teracak ringan via `IMAGE_STORAGE_SALT` dengan ETag HTTP cache.
- **Turnkey CLI (`bengkel-ctl`)**: Manajemen terpusat untuk restart, status, logs, backup, update, dan salt/restore gambar.

---

## 🚀 1. Instalasi Otomatis 1-Perintah (Turnkey Installer)

Metode tercepat dan paling direkomendasikan. Script ini secara otomatis mengonfigurasi swap, kernel tuning, Node.js 20 LTS, Nginx, Systemd service, Logrotate, UFW firewall, dan menghasilkan kunci keamanan acak.

```bash
# 1. Masuk ke VPS dan clone repositori
git clone <repo-url> /var/www/bengkel-gps-motor
cd /var/www/bengkel-gps-motor

# 2. Jalankan installer turnkey sebagai root
sudo bash install.sh
```

**Apa yang dilakukan oleh script installer di atas?**
1. **Memeriksa Spesifikasi VPS**: Mendeteksi core CPU & RAM. Jika RAM $\le$ 2.5GB, proteksi anti-OOM langsung diaktifkan.
2. **Membuat Swapfile 2GB**: Jika swap belum ada, otomatis membuat `/swapfile` (2GB) dengan izin `600` dan mendaftarkannya ke `/etc/fstab`.
3. **Kernel Tuning**: Menyetel `vm.swappiness=10` dan `vm.vfs_cache_pressure=50` di `/etc/sysctl.d/99-bengkel-vps.conf`.
4. **Instalasi Paket**: Memasang `nginx`, `logrotate`, `build-essential`, `ufw`, `jq`, `tar`, `gzip`, dan `Node.js 20 LTS`.
5. **Membuat User Terisolasi**: Membuat system user `bengkel` tanpa login shell (`/usr/sbin/nologin`).
6. **Inisialisasi `.env` Otomatis**: Jika belum ada, script meng-copy `.env.example` dan men-generate random `SESSION_SECRET` (64 char) & `IMAGE_STORAGE_SALT` (48 char) via `openssl rand -hex`.
7. **Build Aset Frontend**: Menjalankan `npm ci` dan `npm run build` dengan batas heap Node `--max-old-space-size=512`.
8. **Inisialisasi Database**: Membuat schema SQLite WAL dan seed data awal.
9. **Memasang Systemd Unit**: Memasang `/etc/systemd/system/bengkel-gps-motor.service` dengan auto-restart dan sandboxing.
10. **Memasang Logrotate**: Memasang konfigurasi rotasi log di `/etc/logrotate.d/bengkel-gps-motor`.
11. **Memasang Nginx Site**: Mengaktifkan reverse proxy di `/etc/nginx/sites-available/bengkel-gps-motor.conf` dan reload Nginx.
12. **Memasang CLI `bengkel-ctl`**: Membuat shortcut global `/usr/local/bin/bengkel-ctl`.

---

## 🛠 2. Manajemen Server dengan `bengkel-ctl`

Setelah instalasi selesai, kelola aplikasi semudah mengetik perintah berikut:

```bash
# Cek status service, penggunaan RAM riil & healthcheck API
bengkel-ctl status

# Pantau log aplikasi secara real-time (live streaming)
bengkel-ctl logs -f

# Tampilkan 100 baris log error terakhir
bengkel-ctl logs --error

# Restart aplikasi dengan aman (graceful restart)
sudo bengkel-ctl restart

# Buat arsip cadangan (backup) database & uploads ke /var/backups/bengkel-gps-motor/
sudo bengkel-ctl backup

# Update aplikasi ke versi git terbaru (pull + build + restart)
sudo bengkel-ctl update

# Buka/restore seluruh foto di disk server ke format gambar normal
sudo bengkel-ctl restore-images

# Kunci/salt kembali seluruh foto di disk server
sudo bengkel-ctl salt-images
```

---

## 🔒 3. Detail Konfigurasi Systemd Standar Industri

File service berlokasi di `/etc/systemd/system/bengkel-gps-motor.service`:

```ini
[Unit]
Description=Bengkel Mobil GPS Motor Kediri - Workshop Management Service
After=network.target network-online.target systemd-sysctl.service
Wants=network-online.target
StartLimitIntervalSec=60s
StartLimitBurst=5

[Service]
Type=simple
User=bengkel
Group=bengkel
WorkingDirectory=/var/www/bengkel-gps-motor
EnvironmentFile=-/var/www/bengkel-gps-motor/.env
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=NODE_OPTIONS="--max-old-space-size=512"
ExecStart=/usr/bin/node --max-old-space-size=512 server/index.js

# Auto-Restart
Restart=always
RestartSec=5s
KillSignal=SIGTERM
TimeoutStopSec=15s

# Dedicated Logging
StandardOutput=append:/var/log/bengkel-gps-motor/app.log
StandardError=append:/var/log/bengkel-gps-motor/error.log
SyslogIdentifier=bengkel-gps-motor

# Resource Guarding (VPS Kentang 2C/2GB)
MemoryMax=700M
MemoryHigh=600M
CPUQuota=180%
TasksMax=256

# Enterprise Linux Security Sandboxing
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictRealtime=true
RestrictSUIDSGID=true

# Writable Paths
ReadWritePaths=/var/www/bengkel-gps-motor/data /var/www/bengkel-gps-motor/uploads /var/log/bengkel-gps-motor

[Install]
WantedBy=multi-user.target
```

---

## 📄 4. Detail Konfigurasi Logrotate

File rotasi log berlokasi di `/etc/logrotate.d/bengkel-gps-motor`:

```
/var/log/bengkel-gps-motor/*.log {
    daily
    rotate 14
    missingok
    notifempty
    compress
    delaycompress
    copytruncate
    create 0640 bengkel bengkel
    dateext
    dateformat -%Y%m%d
}
```

- Log dirotasi setiap tengah malam.
- Menyimpan riwayat selama 14 hari terakhir.
- Log lama dikompresi otomatis (`.gz`) sehingga sangat hemat ruang disk.
- Menggunakan `copytruncate` agar proses Node.js tidak perlu di-restart saat rotasi log berlangsung.

---

## 🌐 5. Pasang SSL Gratis (Let's Encrypt / HTTPS)

Setelah domain Anda diarahkan (DNS A Record) ke IP VPS, pasang SSL gratis hanya dengan 2 perintah:

```bash
# 1. Install certbot untuk Nginx
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Ambil dan pasang sertifikat SSL otomatis
sudo certbot --nginx -d bengkel.domainanda.com
```

Certbot akan otomatis memperbarui konfigurasi Nginx menjadi HTTPS (`listen 443 ssl`), mengaktifkan HTTP/2, dan mengatur renewal otomatis setiap 90 hari.

---

## 🐳 6. Alternatif: Deployment via Docker Compose

Jika Anda lebih memilih menjalankan via kontainer Docker:

```bash
# Build dan jalankan
docker compose up -d --build

# Cek logs
docker compose logs -f

# Cek status resource
docker stats
```
Docker compose telah dibatasi maksimal menggunakan RAM 768 MB dan CPU 1.8 core.
