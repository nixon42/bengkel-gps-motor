#!/usr/bin/env bash

# ==============================================================================
# Bengkel Mobil GPS Motor Kediri — VPS Optimization & Setup Script
# Khusus VPS Spek Minim / "Kentang": 2 Core CPU & 2 GB RAM (Ubuntu / Debian)
# ==============================================================================

set -e

echo "=================================================================="
echo "  Bengkel Mobil GPS Motor Kediri — VPS Kentang Setup (2C / 2GB)"
echo "=================================================================="

# Check root privileges
if [ "$EUID" -ne 0 ]; then
  echo "[!] Harap jalankan script ini sebagai root (sudo bash scripts/setup-vps.sh)"
  exit 1
fi

TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
TOTAL_SWAP=$(free -m | awk '/^Swap:/{print $2}')

echo "[i] Deteksi Memori RAM: ${TOTAL_MEM} MB"
echo "[i] Deteksi Swap Aktif: ${TOTAL_SWAP} MB"

# 1. Setup 2GB Swapfile jika swap belum ada atau < 1000MB
if [ "$TOTAL_SWAP" -lt 1000 ]; then
  echo "[+] Membuat Swapfile 2GB untuk menjaga kestabilan VPS dari OOM..."
  if [ -f /swapfile ]; then
    swapoff /swapfile 2>/dev/null || true
    rm -f /swapfile
  fi

  # Gunakan fallocate jika didukung, atau dd jika di filesystem lawas
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile

  # Simpan ke /etc/fstab agar persisten saat reboot
  if ! grep -q "/swapfile" /etc/fstab; then
    echo "/swapfile none swap sw 0 0" >> /etc/fstab
    echo "[✔] Swapfile 2GB berhasil didaftarkan ke /etc/fstab"
  fi
else
  echo "[✔] Swapfile memadai (${TOTAL_SWAP} MB)."
fi

# 2. Tuning Kernel Sysctl untuk VPS RAM 2GB
echo "[+] Menerapkan kernel sysctl parameter optimal..."
SYSCTL_CONF="/etc/sysctl.d/99-vps-kentang-tuning.conf"
cat << 'EOF' > "$SYSCTL_CONF"
# Optimasi Bengkel GPS Motor untuk VPS 2GB RAM
# Kurangi kecenderungan OS memindahkan proses aktif ke swap (prioritaskan RAM)
vm.swappiness = 10
# Pertahankan cache file system di RAM untuk kecepatan SQLite
vm.vfs_cache_pressure = 50
# Tingkatkan batas file descriptors
fs.file-max = 65536
EOF

sysctl -p "$SYSCTL_CONF" >/dev/null 2>&1 || sysctl --system >/dev/null 2>&1
echo "[✔] vm.swappiness=10 dan vm.vfs_cache_pressure=50 aktif."

# 3. Informasikan Status Akhir
echo "------------------------------------------------------------------"
echo "  Optimasi Kernel & Swap Selesai!"
free -h
echo "------------------------------------------------------------------"
echo "Langkah selanjutnya:"
echo "1. Siapkan file .env (isi SESSION_SECRET dan IMAGE_STORAGE_SALT)"
echo "2. Opsi A (Docker): docker compose up -d --build"
echo "3. Opsi B (PM2/Systemd): npm run build && npm start"
echo "=================================================================="
