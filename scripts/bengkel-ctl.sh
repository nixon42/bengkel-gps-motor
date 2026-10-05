#!/usr/bin/env bash

# ==============================================================================
# Bengkel Mobil GPS Motor Kediri — Production Management CLI (bengkel-ctl)
# ==============================================================================

set -e

SERVICE_NAME="bengkel-gps-motor"
APP_DIR="/var/www/bengkel-gps-motor"
LOG_DIR="/var/log/bengkel-gps-motor"
BACKUP_DIR="/var/backups/bengkel-gps-motor"

# Check root or sudo
function check_root() {
  if [ "$EUID" -ne 0 ]; then
    echo "[!] Perintah ini memerlukan akses root/sudo (contoh: sudo bengkel-ctl $1)"
    exit 1
  fi
}

function show_help() {
  echo "=================================================================="
  echo "  Bengkel Mobil GPS Motor Kediri — Management CLI (bengkel-ctl)"
  echo "=================================================================="
  echo "Penggunaan: bengkel-ctl [perintah] [opsi]"
  echo ""
  echo "Perintah Layanan:"
  echo "  status            Cek status service systemd, penggunaan RAM & health"
  echo "  start             Menjalankan service aplikasi"
  echo "  stop              Menghentikan service aplikasi"
  echo "  restart           Memulai ulang service aplikasi (graceful)"
  echo "  reload            Reload konfigurasi Nginx dan Systemd"
  echo ""
  echo "Perintah Log:"
  echo "  logs              Tampilkan 50 baris terakhir log aplikasi"
  echo "  logs -f           Pantau log secara real-time (follow)"
  echo "  logs --error      Tampilkan log error aplikasi"
  echo "  logs --systemd    Tampilkan log via journalctl"
  echo ""
  echo "Perintah Operasional & Backup:"
  echo "  health            Uji endpoint API healthcheck (http://localhost:3000/api/health)"
  echo "  backup            Buat cadangan arsip tar.gz database SQLite & uploads"
  echo "  restore-images    Buka/restore seluruh gambar di disk ke kondisi normal"
  echo "  salt-images       Acak/salt kembali seluruh gambar di disk"
  echo "  update            Tarik kode terbaru (git pull), compile, dan restart"
  echo "=================================================================="
}

CMD="${1:-help}"

case "$CMD" in
  status)
    echo "▶ Systemd Service Status:"
    systemctl status "$SERVICE_NAME" --no-pager || true
    echo ""
    echo "▶ Konsumsi Memori & CPU:"
    systemctl show "$SERVICE_NAME" -p MemoryCurrent,CPUUsageNSec --no-pager
    echo ""
    echo "▶ Uji Healthcheck API:"
    if curl -s -f http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
      echo "  [✔] API aktif & sehat:"
      curl -s http://127.0.0.1:3000/api/health | jq . 2>/dev/null || curl -s http://127.0.0.1:3000/api/health
      echo ""
    else
      echo "  [✖] API belum merespons di port 3000"
    fi
    ;;

  start)
    check_root "$CMD"
    echo "[+] Menjalankan $SERVICE_NAME..."
    systemctl start "$SERVICE_NAME"
    echo "[✔] Berhasil dijalankan."
    ;;

  stop)
    check_root "$CMD"
    echo "[+] Menghentikan $SERVICE_NAME..."
    systemctl stop "$SERVICE_NAME"
    echo "[✔] Berhasil dihentikan."
    ;;

  restart)
    check_root "$CMD"
    echo "[+] Merestart $SERVICE_NAME..."
    systemctl restart "$SERVICE_NAME"
    sleep 2
    if systemctl is-active --quiet "$SERVICE_NAME"; then
      echo "[✔] $SERVICE_NAME aktif kembali."
    else
      echo "[✖] Gagal merestart $SERVICE_NAME. Cek: bengkel-ctl logs --error"
    fi
    ;;

  reload)
    check_root "$CMD"
    echo "[+] Memperbarui Systemd & Nginx..."
    systemctl daemon-reload
    nginx -t && systemctl reload nginx
    echo "[✔] Konfigurasi berhasil di-reload."
    ;;

  logs)
    ARG="${2:-}"
    if [ "$ARG" == "-f" ] || [ "$ARG" == "--follow" ]; then
      tail -f "$LOG_DIR/app.log" "$LOG_DIR/error.log" 2>/dev/null || journalctl -u "$SERVICE_NAME" -f
    elif [ "$ARG" == "--error" ]; then
      tail -n 100 "$LOG_DIR/error.log" 2>/dev/null || journalctl -u "$SERVICE_NAME" -p err -n 100
    elif [ "$ARG" == "--systemd" ]; then
      journalctl -u "$SERVICE_NAME" -n 100 --no-pager
    else
      echo "=== App Log (/var/log/bengkel-gps-motor/app.log) ==="
      tail -n 50 "$LOG_DIR/app.log" 2>/dev/null || journalctl -u "$SERVICE_NAME" -n 50 --no-pager
    fi
    ;;

  health)
    echo "[i] Menguji http://127.0.0.1:3000/api/health..."
    curl -i http://127.0.0.1:3000/api/health
    echo ""
    ;;

  backup)
    check_root "$CMD"
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_bengkel_${TIMESTAMP}.tar.gz"
    echo "[+] Membuat backup data dan uploads ke $BACKUP_FILE..."
    cd "$APP_DIR"
    tar -czf "$BACKUP_FILE" data/ uploads/ .env
    echo "[✔] Backup berhasil dibuat! Ukuran: $(du -sh "$BACKUP_FILE" | cut -f1)"
    echo "    Lokasi: $BACKUP_FILE"
    ;;

  restore-images)
    check_root "$CMD"
    echo "[+] Mengembalikan seluruh gambar di disk server ke format normal..."
    cd "$APP_DIR"
    sudo -u bengkel node scripts/restore-images.js --restore
    ;;

  salt-images)
    check_root "$CMD"
    echo "[+] Mengacak/men-salt seluruh gambar di disk server..."
    cd "$APP_DIR"
    sudo -u bengkel node scripts/restore-images.js --salt
    ;;

  update)
    check_root "$CMD"
    echo "[+] Memperbarui kode dari git..."
    cd "$APP_DIR"
    git pull
    echo "[+] Memperbarui dependensi..."
    npm ci --omit=dev
    echo "[+] Kompilasi frontend..."
    npm run build
    echo "[+] Merestart service..."
    systemctl restart "$SERVICE_NAME"
    echo "[✔] Update selesai dan service telah aktif kembali!"
    ;;

  help|--help|-h)
    show_help
    ;;

  *)
    echo "[!] Perintah '$CMD' tidak dikenali."
    show_help
    exit 1
    ;;
esac
