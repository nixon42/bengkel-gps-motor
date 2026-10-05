#!/usr/bin/env bash

# ==============================================================================
# Bengkel Mobil GPS Motor Kediri — Complete Production Turnkey Installer
# Standar Industri untuk Ubuntu / Debian VPS (Optimized for 2 Core CPU, 2 GB RAM)
# ==============================================================================

set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

APP_NAME="bengkel-gps-motor"
SERVICE_NAME="bengkel-gps-motor"
TARGET_DIR="/var/www/${APP_NAME}"
LOG_DIR="/var/log/${APP_NAME}"
BACKUP_DIR="/var/backups/${APP_NAME}"
APP_USER="bengkel"
APP_GROUP="bengkel"

echo -e "${CYAN}${BOLD}"
echo "================================================================================"
echo "    BENGKEL MOBIL GPS MOTOR KEDIRI — PRODUCTION TURNKEY INSTALLER"
echo "    Enterprise-Grade Systemd, Nginx, Logrotate, Security & 2C/2GB Tuning"
echo "================================================================================"
echo -e "${NC}"

# 1. Root Check
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Script instalasi ini harus dijalankan dengan hak akses root.${NC}"
  echo -e "Silakan gunakan: ${BOLD}sudo bash scripts/install-production.sh${NC}"
  exit 1
fi

CURRENT_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_PROJECT_DIR="$(cd "${CURRENT_SCRIPT_DIR}/.." && pwd)"

# 2. System Resource & Hardware Check
TOTAL_MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
TOTAL_SWAP_MB=$(free -m | awk '/^Swap:/{print $2}')
CPU_CORES=$(nproc)

echo -e "${CYAN}[1/10] Memeriksa spesifikasi sistem...${NC}"
echo "  - CPU Cores : ${CPU_CORES} core"
echo "  - RAM       : ${TOTAL_MEM_MB} MB"
echo "  - Swap Aktif: ${TOTAL_SWAP_MB} MB"

if [ "$TOTAL_MEM_MB" -le 2500 ]; then
  echo -e "${YELLOW}  [i] Terdeteksi VPS Kentang (RAM <= 2.5 GB). Konfigurasi proteksi OOM diaktifkan.${NC}"
fi

# 3. Setup Swap 2GB (Sangat Penting untuk mencegah OOM-killer di VPS 2GB)
echo -e "${CYAN}[2/10] Memeriksa & mengalokasikan Swap 2GB...${NC}"
if [ "$TOTAL_SWAP_MB" -lt 1500 ]; then
  echo "  [+] Membuat Swapfile 2GB di /swapfile..."
  if [ -f /swapfile ]; then
    swapoff /swapfile 2>/dev/null || true
    rm -f /swapfile
  fi
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  if ! grep -q "/swapfile" /etc/fstab; then
    echo "/swapfile none swap sw 0 0" >> /etc/fstab
  fi
  echo -e "${GREEN}  [✔] Swap 2GB berhasil diaktifkan dan dibuat persisten.${NC}"
else
  echo -e "${GREEN}  [✔] Kapasitas Swap sudah memadai (${TOTAL_SWAP_MB} MB).${NC}"
fi

# 4. Kernel Sysctl Hardening & Memory Tuning
echo -e "${CYAN}[3/10] Menerapkan kernel sysctl parameter optimal...${NC}"
SYSCTL_FILE="/etc/sysctl.d/99-bengkel-vps.conf"
cat << 'EOF' > "$SYSCTL_FILE"
# Tuning Bengkel GPS Motor Kediri untuk VPS 2GB RAM
vm.swappiness = 10
vm.vfs_cache_pressure = 50
fs.file-max = 65536
net.core.somaxconn = 1024
EOF
sysctl -p "$SYSCTL_FILE" >/dev/null 2>&1 || sysctl --system >/dev/null 2>&1
echo -e "${GREEN}  [✔] Kernel tuning aktif (vm.swappiness=10, vm.vfs_cache_pressure=50).${NC}"

# 5. Install Required System Dependencies
echo -e "${CYAN}[4/10] Memperbarui paket sistem dan menginstall dependensi dasar...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl wget git build-essential nginx logrotate jq ufw tar gzip openssl >/dev/null
echo -e "${GREEN}  [✔] Dependensi dasar (Nginx, Logrotate, Build Tools) terpasang.${NC}"

# 6. Check and Install Node.js 20 LTS (if not present or version < 20)
echo -e "${CYAN}[5/10] Memeriksa instalasi Node.js runtime...${NC}"
NEED_NODE_INSTALL=true
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_MAJOR" -ge 20 ]; then
    echo -e "${GREEN}  [✔] Node.js versi $(node -v) sudah terpasang.${NC}"
    NEED_NODE_INSTALL=false
  fi
fi

if [ "$NEED_NODE_INSTALL" = true ]; then
  echo "  [+] Memasang Node.js 20 LTS via official NodeSource repository..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs >/dev/null
  echo -e "${GREEN}  [✔] Node.js 20 LTS ($(node -v)) dan npm ($(npm -v)) berhasil dipasang.${NC}"
fi

# 7. Dedicated Service User & Group Creation
echo -e "${CYAN}[6/10] Menyiapkan pengguna sistem terisolasi '${APP_USER}'...${NC}"
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --no-create-home --user-group --shell /usr/sbin/nologin "$APP_USER"
  echo -e "${GREEN}  [✔] Akun sistem '${APP_USER}' dibuat tanpa login shell (prinsip least-privilege).${NC}"
else
  echo -e "${GREEN}  [✔] Akun sistem '${APP_USER}' sudah tersedia.${NC}"
fi

# Add to www-data group for clean Nginx interaction
usermod -aG www-data "$APP_USER" 2>/dev/null || true

# 8. Deploy Application Code & Directory Structure
echo -e "${CYAN}[7/10] Menyinkronkan direktori aplikasi & storage...${NC}"
mkdir -p "$TARGET_DIR"
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"

if [ "$SOURCE_PROJECT_DIR" != "$TARGET_DIR" ]; then
  echo "  [+] Menyalin berkas dari ${SOURCE_PROJECT_DIR} ke ${TARGET_DIR}..."
  # Gunakan tar atau rsync untuk menyalin berkas aplikasi bersih
  tar --exclude='.git' --exclude='node_modules' --exclude='dist' -C "$SOURCE_PROJECT_DIR" -cf - . | tar -C "$TARGET_DIR" -xf -
fi

# Pastikan folder data dan uploads tersedia
mkdir -p "${TARGET_DIR}/data"
mkdir -p "${TARGET_DIR}/uploads/inventory"
mkdir -p "${TARGET_DIR}/uploads/ro"
mkdir -p "${TARGET_DIR}/uploads/receipts"
mkdir -p "${TARGET_DIR}/uploads/general"

# 9. Environment Configuration & Cryptographic Secrets
echo -e "${CYAN}[8/10] Menyiapkan berkas lingkungan (.env) & kunci keamanan...${NC}"
ENV_FILE="${TARGET_DIR}/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "  [+] Membuat berkas .env baru dengan kunci kriptografi acak..."
  cp "${TARGET_DIR}/.env.example" "$ENV_FILE"
  
  RANDOM_SECRET=$(openssl rand -hex 32)
  RANDOM_SALT=$(openssl rand -hex 24)
  
  sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=${RANDOM_SECRET}|" "$ENV_FILE"
  sed -i "s|IMAGE_STORAGE_SALT=.*|IMAGE_STORAGE_SALT=${RANDOM_SALT}|" "$ENV_FILE"
  sed -i "s|NODE_ENV=.*|NODE_ENV=production|" "$ENV_FILE"
  sed -i "s|PORT=.*|PORT=3000|" "$ENV_FILE"
  
  echo -e "${GREEN}  [✔] Berkas .env berhasil dibuat dengan kunci unik yang aman.${NC}"
else
  echo -e "${GREEN}  [✔] Berkas .env yang sudah ada tetap dipertahankan.${NC}"
fi

# 10. Install NPM Dependencies & Build Production Frontend Assets
echo -e "${CYAN}[9/10] Menginstall dependensi npm & mengompilasi aset Vite...${NC}"
cd "$TARGET_DIR"

# Run npm ci with V8 memory bound to protect low-RAM server
export NODE_OPTIONS="--max-old-space-size=512"
npm ci --silent
npm run build --silent

# Seed initial database if data does not exist
if [ ! -f "${TARGET_DIR}/data/bengkel.db" ]; then
  echo "  [+] Menjalankan inisialisasi awal database SQLite & seed default..."
  node server/db/seed.js || true
fi

# Lock permissions
chown -R "${APP_USER}:${APP_GROUP}" "$TARGET_DIR"
chown -R "${APP_USER}:${APP_GROUP}" "$LOG_DIR"
chmod 600 "$ENV_FILE"
chmod 750 "${TARGET_DIR}/data"
chmod 755 "${TARGET_DIR}/uploads"
chmod 750 "$LOG_DIR"

# 11. Install Systemd Service, Logrotate, Nginx, & Management CLI
echo -e "${CYAN}[10/10] Memasang Systemd Service, Logrotate, Nginx & Management CLI...${NC}"

# A. Systemd Service
cp "${TARGET_DIR}/deploy/bengkel-gps-motor.service" /etc/systemd/system/bengkel-gps-motor.service
systemctl daemon-reload
systemctl enable bengkel-gps-motor
systemctl restart bengkel-gps-motor

# B. Logrotate
cp "${TARGET_DIR}/deploy/logrotate.conf" /etc/logrotate.d/bengkel-gps-motor
chmod 644 /etc/logrotate.d/bengkel-gps-motor

# C. Nginx Configuration
cp "${TARGET_DIR}/deploy/nginx.conf" /etc/nginx/sites-available/bengkel-gps-motor.conf
# Remove default site if present
if [ -L /etc/nginx/sites-enabled/default ]; then
  rm -f /etc/nginx/sites-enabled/default
fi
ln -sf /etc/nginx/sites-available/bengkel-gps-motor.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# D. UFW Firewall
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH >/dev/null 2>&1 || true
  ufw allow 'Nginx Full' >/dev/null 2>&1 || true
fi

# E. Symlink Global Management Tool 'bengkel-ctl'
chmod +x "${TARGET_DIR}/scripts/bengkel-ctl.sh"
ln -sf "${TARGET_DIR}/scripts/bengkel-ctl.sh" /usr/local/bin/bengkel-ctl

# 12. Verification & Healthcheck Poll
echo ""
echo -e "${CYAN}▶ Melakukan pengujian healthcheck layanan...${NC}"
MAX_WAIT=15
WAITED=0
SERVICE_HEALTHY=false

while [ $WAITED -lt $MAX_WAIT ]; do
  if curl -s -f http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
    SERVICE_HEALTHY=true
    break
  fi
  sleep 1
  WAITED=$((WAITED + 1))
done

if [ "$SERVICE_HEALTHY" = true ]; then
  echo -e "${GREEN}${BOLD}✔ Layanan berhasil online dan sehat!${NC}"
else
  echo -e "${YELLOW}[!] Layanan sedang boot, silakan periksa status dengan: bengkel-ctl logs${NC}"
fi

# 13. Print Beautiful Installation Summary
SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}${BOLD}================================================================================${NC}"
echo -e "${GREEN}${BOLD}  INSTALASI PRODUKSI BENGKEL MOBIL GPS MOTOR KEDIRI SELESAI DENGAN SUKSES!      ${NC}"
echo -e "${GREEN}${BOLD}================================================================================${NC}"
echo ""
echo -e "Aplikasi dapat diakses melalui browser di:"
echo -e "  🌐 ${CYAN}${BOLD}http://${SERVER_IP}/${NC} atau domain yang diarahkan ke IP ini"
echo ""
echo -e "Perintah Pengelolaan Server (${BOLD}bengkel-ctl${NC}):"
echo -e "  - Cek Status & Memori    : ${BOLD}bengkel-ctl status${NC}"
echo -e "  - Pantau Log Realtime    : ${BOLD}bengkel-ctl logs -f${NC}"
echo -e "  - Restart Service        : ${BOLD}sudo bengkel-ctl restart${NC}"
echo -e "  - Backup Database & Foto : ${BOLD}sudo bengkel-ctl backup${NC}"
echo -e "  - Update Kode Otomatis   : ${BOLD}sudo bengkel-ctl update${NC}"
echo -e "  - Buka/Restore Gambar    : ${BOLD}sudo bengkel-ctl restore-images${NC}"
echo -e "  - Kunci/Salt Gambar      : ${BOLD}sudo bengkel-ctl salt-images${NC}"
echo ""
echo -e "File Log:"
echo -e "  - Log Aplikasi           : ${BOLD}/var/log/bengkel-gps-motor/app.log${NC}"
echo -e "  - Log Error              : ${BOLD}/var/log/bengkel-gps-motor/error.log${NC}"
echo -e "  - Logrotate Config       : ${BOLD}/etc/logrotate.d/bengkel-gps-motor${NC}"
echo ""
echo -e "Langkah Rekomendasi Selanjutnya (Pasang SSL Gratis Let's Encrypt):"
echo -e "  ${BOLD}sudo apt-get install -y certbot python3-certbot-nginx${NC}"
echo -e "  ${BOLD}sudo certbot --nginx -d nama-domain-anda.com${NC}"
echo ""
echo -e "${GREEN}================================================================================${NC}"
