---
name: Bengkel Mobil GPS Motor Kediri
description: Modern Flat Workshop Terminal & Public Service Tracker
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-subtle: "#eff6ff"
  emerald-income: "#10b981"
  rose-expense: "#f43f5e"
  amber-warning: "#f59e0b"
  purple-servicing: "#8b5cf6"
  neutral-bg-light: "#f8fafc"
  neutral-surface-light: "#ffffff"
  neutral-border-light: "#e2e8f0"
  neutral-text-light: "#0f172a"
  neutral-bg-dark: "#0f172a"
  neutral-surface-dark: "#1e293b"
  neutral-border-dark: "#334155"
  neutral-text-dark: "#f8fafc"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.3
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Design System: Bengkel Mobil GPS Motor Kediri

## Overview

**Creative North Star: "The Grounded Workshop Terminal"**

Bengkel Mobil GPS Motor Kediri menerapkan sistem desain **Modern Flat murni** yang kokoh, tajam, dan berorientasi operasional. Antarmuka dibangun khusus untuk lingkungan kerja bengkel otomotif fisik yang dinamis dan berdebu di Kediri: layar smartphone mekanik yang dioperasikan dengan satu tangan (*"HP kentang"*), meja kasir desktop untuk cetak nota, serta portal pelacakan publik pelanggan yang cepat tanpa login.

Sistem menolak segala bentuk dekorasi kaca (*glassmorphism*, `backdrop-blur`, atau bayangan kabur berlebihan) demi menjamin performa rendering 60fps instan, penghematan baterai, dan ketajaman kontras di bawah terik pencahayaan bengkel. Keindahan sistem ini terpancar dari presisi matematis: garis tepi 1px yang tegas, tipografi angka tabular yang sejajar vertikal, status warna semantik yang langsung terbaca, dan target sentuh ergonomis $\ge 44\times 44\text{px}$.

**Key Characteristics:**
- **Zero Glassmorphism**: Permukaan solid 100% tanpa efek blur kaca atau transparansi bertumpuk.
- **High-Contrast Flat Surfaces**: Pemisahan visual mengandalkan batas garis 1px dan lapisan nada warna solid (*tonal layering*).
- **Touch-First Ergonomics**: Semua kontrol interaktif memiliki area sentuh minimum $44\times 44\text{px}$.
- **Tabular Figures Everywhere**: Seluruh data mata uang Rupiah, nomor plat, dan kuantitas stok menggunakan angka tabular.

## Colors

Palet warna difungsikan secara semantik untuk mendukung pembacaan status alur servis dan mutasi keuangan secara instan.

### Primary
- **Automotive Blue** (`#2563eb` / `#1d4ed8`): Warna identitas utama brand, tombol tindakan primer, navigasi aktif, dan status awal mobil masuk.

### Status & Semantics
- **Emerald Income** (`#10b981`): Pemasukan kas, servis selesai, dan stok aman.
- **Rose Expense & Alert** (`#f43f5e`): Pengeluaran kas operasional, suku cadang kritis/habis (0 stok), dan peringatan kerusakan.
- **Amber Attention** (`#f59e0b`): Pemeriksaan/diagnosa awal teknisi dan akses pengawasan Superadmin.
- **Purple Servicing** (`#8b5cf6`): Kendaraan sedang dalam proses pengerjaan servis mekanik di bay lift.

### Neutral
- **Light Surface** (`#ffffff`): Kartu latar terang dengan kontras tajam.
- **Light Background** (`#f8fafc`): Latar kanvas utama aplikasi.
- **Light Border** (`#e2e8f0`): Garis pembatas 1px datar.
- **Dark Surface** (`#1e293b`): Latar kartu saat mode gelap.
- **Dark Background** (`#0f172a`): Latar kanvas saat mode gelap.
- **Dark Border** (`#334155`): Garis pembatas 1px mode gelap.

### Named Rules
**The Zero-Blur Rule.** Dilarang keras menggunakan utility `backdrop-blur`, filter blur CSS, atau transparansi buram. Seluruh kontainer wajib menggunakan latar solid dengan pembatas border teratur.

## Typography

**Display & Body Font:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`  
**Numerical Font Feature:** `tabular-nums` (`font-feature-settings: 'tnum'`)

Tipografi dioptimalkan untuk keterbacaan instan data operasional bengkel: nomor plat kendaraan (*Plat AG*), nomor RO, nominal Rupiah, dan status perbaikan.

### Hierarchy
- **Display** (Bold 900, 24px–32px, line-height 1.2): Judul bengkel dan angka KPI ringkasan eksekutif.
- **Headline** (Bold 800, 18px–20px, line-height 1.3): Judul section panel, modal, dan denah stall radar.
- **Title** (Bold 700, 14px–16px, line-height 1.4): Nama suku cadang, nomor plat kendaraan, dan judul mutasi kas.
- **Body** (Regular 400, 13px–14px, line-height 1.5): Deskripsi servis, catatan keluhan mekanik, dan label tabel.
- **Label** (Bold 700, 10px–11px, tracking 0.05em, uppercase): Badge status 6 tahapan RO, kategori part, dan peran pengguna.

## Layout

- **Sistem Grid**: Responsif berbasis 12 kolom desktop, 2 kolom tablet, dan 1 kolom vertikal mobile.
- **Ritme Spasi**: Berbasis skala modular 4px/8px (`gap-3`, `gap-4`, `gap-6`, `p-4`, `p-5`).
- **Mobile First**: Semua daftar panjang (tabel inventaris, riwayat RO, mutasi kas) otomatis kolaps menjadi susunan kartu ramah jempol pada viewport $<640\text{px}$.

## Elevation & Depth

Sistem mengadopsi prinsip **Pure Flat Tonal Layering**. Tidak menggunakan drop-shadow dekoratif yang berat. Kedalaman ruang diwujudkan melalui:
1. Perbedaan nada permukaan (misal `#f8fafc` kanvas vs `#ffffff` kartu pada light mode; `#0f172a` kanvas vs `#1e293b` kartu pada dark mode).
2. Batas garis 1px (`border-slate-200` / `border-slate-700`).
3. Focus ring interaktif 2px (`focus-visible:ring-2 focus-visible:ring-blue-500`) saat fokus keyboard atau kursor aktif.

## Shapes

- **Radius Sudut**: Konsisten halus pada `4px` (`rounded`) hingga `6px` (`rounded-md`). Menolak bentuk pil ekstrem (*fully rounded pill*) untuk elemen kerja operasional.
- **Batas Sentuh Ergonomis**: Minimum `44px` tinggi dan lebar untuk semua tombol, input teks, dan item pemilih.

## Components

### Buttons
- **Primary**: Background `#2563eb`, teks `#ffffff`, border none, radius `4px`, padding `8px 16px`, transisi hover `#1d4ed8`.
- **Secondary**: Background `#f1f5f9` (dark: `#334155`), teks `#334155` (dark: `#f8fafc`), border `1px solid #cbd5e1`.
- **WhatsApp Action**: Background `#ecfdf5` (dark: `#064e3b/40`), border `#a7f3d0`, teks `#065f46`, aksen hijau ramah komunikasi pelanggan.

### Cards & Panels
- Kartu permukaan solid putih/slate-800, border datar 1px, sudut 4px, `shadow-none`.

### Inputs
- Input teks dengan min-height 44px, latar `#f8fafc` (dark: `#334155/60`), border `#cbd5e1`, fokus border `#3b82f6` dengan ring tegas.

## Do's and Don'ts

### Do:
- **Do** gunakan angka tabular (`.tabular-nums`) untuk semua nilai Rupiah, stok, dan nomor plat.
- **Do** pastikan target klik/sentuh selalu memenuhi ukuran minimal $44\times 44\text{px}$.
- **Do** sertakan tombol aksi langsung pada setiap kartu perhatian/triage (misal: tombol WA supplier pada part kosong).
- **Do** gunakan pesan kesalahan jelas dalam Bahasa Indonesia disertai tombol pemulihan (*"Coba Lagi"*).

### Don't:
- **Don't** gunakan efek blur, `backdrop-filter`, atau transparansi kaca (*glassmorphism*).
- **Don't** gunakan bayangan kabur tebal atau bayangan warna neon dekoratif.
- **Don't** gunakan teks abu-abu di atas latar berwarna (*gray-on-color antipattern*); selalu gunakan varian gelap/terang senada dari warna latar.
- **Don't** gunakan pustaka charting pihak ketiga yang berat jika visualisasi dapat dicapai dengan SVG murni yang ringan.
