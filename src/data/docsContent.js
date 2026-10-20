/**
 * src/data/docsContent.js
 * Comprehensive Documentation and User Guide Data for Bengkel Mobil GPS Motor Kediri
 * Covers: Owner/Admin, Mekanik, Kasir, CRM & Pelanggan, and Operational Troubleshooting FAQs.
 * Features: Authentic high-res screenshots with numbered step annotations (1, 2, 3...),
 * interactive UI mockups, and end-to-end workflow diagrams.
 */


export const DOCS_STATIONS = [
  {
    id: "station-owner",
    number: "01",
    roleKey: "owner",
    title: "Manajemen Bisnis & Keuangan",
    subtitle: "Owner, Direksi & Akuntan Bengkel",
    badge: "Stasiun Owner",
    icon: "Building2",
    accent: "blue",
    moduleIds: ["owner-settings", "owner-staff", "owner-multi-tenant", "owner-finance", "owner-inventory"]
  },
  {
    id: "station-mekanik",
    number: "02",
    roleKey: "mekanik",
    title: "Pit Lift & Lantai Kerja Mekanik",
    subtitle: "Kepala Bengkel & Teknisi Lapangan",
    badge: "Stasiun Mekanik",
    icon: "Wrench",
    accent: "emerald",
    moduleIds: ["mekanik-intake", "mekanik-lifecycle", "mekanik-photos", "mekanik-parts"]
  },
  {
    id: "station-kasir",
    number: "03",
    roleKey: "kasir",
    title: "Meja Kasir & Pergudangan Sparepart",
    subtitle: "Kasir Front Office & Pengawas Gudang",
    badge: "Stasiun Kasir",
    icon: "Wallet",
    accent: "purple",
    moduleIds: ["kasir-new-ro", "kasir-payment", "kasir-invoice", "kasir-thermal-pos", "kasir-restock", "inventory-mutations", "kasir-opname"]
  },
  {
    id: "station-crm",
    number: "04",
    roleKey: "crm",
    title: "Front Desk CRM & Integrasi Pelanggan",
    subtitle: "Layanan Pelanggan, WhatsApp & Tracking",
    badge: "Stasiun CRM",
    icon: "Users",
    accent: "amber",
    moduleIds: ["crm-database", "crm-whatsapp", "crm-tracking", "app-omnibox"]
  }
];

export const DOCS_ROLES = [
  {
    key: 'owner',
    aliases: ['admin', 'owner', 'superadmin'],
    label: 'Owner / Admin',
    badge: 'Manajemen Bengkel',
    color: 'blue',
    description: 'Konfigurasi profil bengkel, foto landing page, manajemen staf, pembukuan kas, laba rugi, valuasi stok, dan kontrol multi-tenant.',
    icon: 'Building2'
  },
  {
    key: 'mekanik',
    aliases: ['mechanic', 'mekanik', 'teknisi'],
    label: 'Mekanik',
    badge: 'Teknis Lapangan',
    color: 'amber',
    description: 'Penerimaan fisik mobil, alur 6-tahap pengerjaan servis, dokumentasi foto Before/Progress/After dari HP, dan pemasangan suku cadang.',
    icon: 'Wrench'
  },
  {
    key: 'kasir',
    aliases: ['cashier', 'kasir'],
    label: 'Kasir',
    badge: 'Front Office & Keuangan',
    color: 'emerald',
    description: 'Penerbitan RO baru, pelunasan kasir, cetak invoice PDF A4, cetak struk POS termal 58mm, restock supplier, dan stok opname.',
    icon: 'Wallet'
  },
  {
    key: 'crm',
    aliases: ['crm', 'pelanggan', 'customer', 'omnibox'],
    label: 'CRM & Pelanggan',
    badge: 'Relasi Pelanggan',
    color: 'purple',
    description: 'Database pelanggan, riwayat servis mobil, reminder/promo WhatsApp, portal pelacakan publik tanpa login, dan omnibox Ctrl+K.',
    icon: 'Users'
  }
];

export const DOCS_MODULES = [
  // ==========================================
  // 1. OWNER & ADMIN MODULES
  // ==========================================
  {
    id: 'owner-settings',
    sopCode: 'SOP-OWN-01',
    targetTab: 'overview',
    tabActionName: 'Pengaturan Profil Bengkel',
    slug: 'pengaturan-bengkel',
    role: 'owner',
    title: 'Pengaturan Profil Bengkel, Jam Kerja & Kustomisasi Landing Page',
    summary: 'Konfigurasi identitas bengkel, kontak WhatsApp resmi, jam operasional, target pendapatan bulanan, dan foto galeri fasilitas landing page publik.',
    readTime: '3 menit',
    badge: 'Owner / Admin',
    tags: ['profil', 'pengaturan', 'alamat', 'whatsapp', 'target', 'omzet', 'jam kerja', 'landing page', 'foto'],
    annotatedScreenshot: {
      title: 'Antarmuka Pengaturan Workshop & Foto Galeri Fasilitas',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_owner_settings.png',
      annotations: [
        { number: 1, top: '24%', left: '38%', title: 'Sub-Tab Navigasi', desc: 'Beralih antara Profil & Kontak operasional atau Foto & Landing Page publik' },
        { number: 2, top: '38%', left: '50%', title: 'Headline Promosi', desc: 'Teks headline utama yang langsung tampil di banner landing page' },
        { number: 3, top: '48%', left: '64%', title: 'Preset Cepat', desc: 'Terapkan paket foto profesional siap pakai (Standar Bersih Modern / Hydraulic Pit Focus)' },
        { number: 4, top: '64%', left: '35%', title: 'Foto Hero Banner', desc: 'Unggah foto suasana bengkel atau stall lift hidrolik dengan kompresi otomatis' },
        { number: 5, top: '88%', left: '64%', title: 'Simpan Perubahan', desc: 'Simpan konfigurasi langsung ke profil tenant tanpa perlu reload' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Modal Pengaturan Workshop',
        description: 'Pada tampilan dashboard utama (AdminDashboard), klik ikon Pengaturan di pojok kanan atas topbar atau pilih pintasan Pengaturan Profil Bengkel melalui Command Palette (Ctrl+K).',
        highlightText: 'Ikon Pengaturan di Topbar (Pojok Kanan Atas)'
      },
      {
        number: 2,
        title: 'Perbarui Data Identitas & Jam Operasional',
        description: 'Pilih sub-tab "Profil & Kontak". Isi nama bengkel, alamat fisik, jam buka (Senin-Sabtu: 08:00 - 17:00 WIB), dan nomor WhatsApp resmi. Nomor ini otomatis menjadi kontak rujukan pada portal publik dan invoice PDF.',
        highlightText: 'Sub-Tab Profil & Kontak'
      },
      {
        number: 3,
        title: 'Kustomisasi Foto Landing Page & Fasilitas',
        description: 'Pilih sub-tab "Foto & Landing Page". Anda dapat mengunggah foto asli bengkel (Hero Banner, Pit Lift Stall, Alat Scanner) atau mengeklik tombol "Standar Bersih Modern" untuk menerapkan foto studio otomotif berkualitas tinggi.',
        highlightText: 'Sub-Tab Foto & Landing Page'
      },
      {
        number: 4,
        title: 'Tetapkan Target Omzet & Simpan Perubahan',
        description: 'Masukkan target pendapatan bulanan (misal: Rp 15.000.000) untuk acuan visual progress bar pencapaian omzet, lalu klik tombol Simpan Perubahan.',
        highlightText: 'Tombol Simpan Perubahan (Hijau)'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Tips Branding WhatsApp',
      content: 'Pastikan nomor WhatsApp yang diinput aktif dan menggunakan format seluler Indonesia (contoh: 085603307330). Nomor ini otomatis menjadi tautan klik-langsung pelanggan dari nota cetak dan portal pelacakan mandiri.'
    }
  },

  {
    id: 'owner-staff',
    sopCode: 'SOP-OWN-02',
    targetTab: 'overview',
    tabActionName: 'Buka Manajemen Staf',
    slug: 'manajemen-staf',
    role: 'owner',
    title: 'Manajemen Staf & Hak Akses Pengguna Workspace',
    summary: 'Menambahkan akun staf baru, menetapkan peran operator (kasir/mekanik/admin), dan mengisolasi hak akses ke dalam workspace bengkel.',
    readTime: '4 menit',
    badge: 'Owner / Admin',
    tags: ['staf', 'pengguna', 'hak akses', 'operator', 'mekanik', 'kasir', 'admin', 'google login'],
    annotatedScreenshot: {
      title: 'Manajemen Pengguna & Penugasan Staf Workspace',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_superadmin.png',
      annotations: [
        { number: 1, top: '15%', left: '42%', title: 'Tab Manajemen Pengguna', desc: 'Buka daftar seluruh akun staf yang terhubung ke sistem' },
        { number: 2, top: '28%', left: '38%', title: 'Total Staf Terdaftar', desc: 'Monitoring jumlah akun admin, kasir, dan teknisi yang aktif' },
        { number: 3, top: '75%', left: '88%', title: 'Hubungkan Akun Baru', desc: 'Daftarkan email Google staf baru dan tentukan workspace bengkel miliknya' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Menu Manajemen Staf / Superadmin',
        description: 'Masuk ke menu pengguna melalui navigasi dashboard atau portal superadmin. Klik tombol "+ Hubungkan Email ke Bengkel".',
        highlightText: 'Tombol Hubungkan Email ke Bengkel'
      },
      {
        number: 2,
        title: 'Masukkan Email Akun Google Staf',
        description: 'Ketik alamat email Google (Gmail) yang akan digunakan oleh kasir atau mekanik saat login. Sistem menggunakan otentikasi aman tanpa menyimpan password rahasia.',
        highlightText: 'Input Email Google'
      },
      {
        number: 3,
        title: 'Pilih Hak Akses Role yang Sesuai',
        description: 'Pilih salah satu dari 4 level otorisasi: Mekanik (hanya update progres & foto servis), Kasir (kelola pembayaran & kas), Admin Bengkel (kontrol penuh tenant), atau Superadmin.',
        highlightText: 'Dropdown Role Hak Akses'
      },
      {
        number: 4,
        title: 'Verifikasi Hak Akses',
        description: 'Staf bersangkutan dapat langsung login dengan mengklik "Login dengan Google" pada halaman login utama dan otomatis masuk ke workspace bengkel Anda.',
        highlightText: 'Simpan & Hubungkan Akun'
      }
    ],
    callout: {
      type: 'note',
      title: 'Isolasi Akun Multi-Tenant',
      content: 'Staf hanya dapat melihat data order servis, pelanggan, dan kas dari bengkel tempat mereka ditugaskan. Data bengkel lain terisolasi secara kriptografis pada tingkat database.'
    }
  },

  {
    id: 'owner-multi-tenant',
    sopCode: 'SOP-OWN-03',
    targetTab: 'overview',
    tabActionName: 'Portal Multi-Tenant',
    slug: 'superadmin-multi-tenant',
    role: 'owner',
    title: 'Superadmin: Manajemen Multi-Bengkel & Pemantauan Agregat',
    summary: 'Pusat pengawasan platform multi-tenant, pendaftaran cabang bengkel baru, pemantauan volume servis lintas cabang, dan alokasi workspace.',
    readTime: '4 menit',
    badge: 'Owner / Admin',
    tags: ['multi-tenant', 'superadmin', 'cabang', 'omset', 'diagnostik', 'platform'],
    annotatedScreenshot: {
      title: 'Portal Superadmin: Ringkasan Sistem & Diagnostik Multi-Tenant',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_superadmin.png',
      annotations: [
        { number: 1, top: '28%', left: '15%', title: 'Total Bengkel Aktif', desc: 'Jumlah cabang/tenant yang terdaftar dan aktif beroperasi' },
        { number: 2, top: '28%', left: '85%', title: 'Omset Lintas Bengkel', desc: 'Total pendapatan kumulatif dan laba bersih dari seluruh jaringan' },
        { number: 3, top: '50%', left: '42%', title: 'Volume Keluar/Masuk Stok', desc: 'Pergerakan stok suku cadang global dan audit restock' },
        { number: 4, top: '70%', left: '20%', title: 'Distribusi Status Mobil', desc: 'Grafik sebaran unit kendaraan: Masuk, Diagnosa, Pengerjaan, Selesai' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Akses Portal Superadmin',
        description: 'Masuk melalui URL /superadmin menggunakan akun berlisensi superadmin. Dasbor akan menampilkan indikator kesehatan sistem dan metrik agregat.',
        highlightText: 'Topbar Superadmin Portal'
      },
      {
        number: 2,
        title: 'Mendaftarkan Cabang (Tenant) Baru',
        description: 'Buka tab "Daftar Bengkel (Tenants)", klik tombol "+ Daftarkan Bengkel Baru". Masukkan nama cabang, slug URL unik (contoh: /bengkel-pare), dan target omzet.',
        highlightText: 'Modal Daftarkan Bengkel Baru'
      },
      {
        number: 3,
        title: 'Memindahkan atau Menugaskan Staf Antar Cabang',
        description: 'Jika staf berpindah cabang, gunakan tombol "Pindahkan Workspace" untuk mengalihkan akses akun email Google staf ke tenant tujuan secara instan.',
        highlightText: 'Aksi Pindahkan Workspace'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Skalabilitas Cabang Tanpa Batas',
      content: 'Setiap tenant memiliki database landing page publik, nomor invoice, katalog suku cadang, dan buku kas terpisah yang tidak saling mempengaruhi.'
    }
  },

  {
    id: 'owner-finance',
    sopCode: 'SOP-OWN-04',
    targetTab: 'finance',
    tabActionName: 'Buka Buku Kas & Laba Rugi',
    slug: 'buku-kas-laba-rugi',
    role: 'owner',
    title: 'Buku Kas Keuangan & Ekspor Laporan Laba Rugi (P&L)',
    summary: 'Pencatatan pemasukan jasa & sparepart otomatis, pencatatan beban operasional, pemantauan saldo surplus, dan ekspor laporan resmi.',
    readTime: '5 menit',
    badge: 'Owner / Admin',
    tags: ['keuangan', 'laba rugi', 'pnl', 'kas', 'pengeluaran', 'pemasukan', 'pdf', 'csv'],
    diagramType: 'cashflow',
    annotatedScreenshot: {
      title: 'Buku Kas Keuangan, Analisis Arus Kas & Ekspor Laporan',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_finance_cashflow.png',
      annotations: [
        { number: 1, top: '15%', left: '30%', title: 'Pemasukan Kas', desc: 'Total uang masuk dari pelunasan servis dan penjualan suku cadang' },
        { number: 2, top: '15%', left: '50%', title: 'Pengeluaran Kas', desc: 'Beban operasional, belanja restock suku cadang, dan biaya bengkel' },
        { number: 3, top: '15%', left: '72%', title: 'Saldo Kas Bersih (Net)', desc: 'Surplus atau defisit kas berjalan secara real-time' },
        { number: 4, top: '15%', left: '88%', title: 'Tombol Catat Transaksi', desc: 'Pintasan untuk mencatat pengeluaran atau pemasukan manual baru' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Tab Buku Kas & Keuangan',
        description: 'Klik menu "Buku Kas & Keuangan" di topbar dashboard. Anda akan melihat kartu ringkasan Pemasukan, Pengeluaran, dan Saldo Bersih bulan berjalan.',
        highlightText: 'Tab Buku Kas & Keuangan'
      },
      {
        number: 2,
        title: 'Mencatat Pengeluaran Operasional Bengkel',
        description: 'Klik tombol "+ Catat Transaksi". Pilih tipe "Pengeluaran", tentukan kategori (Listrik, Sewa, Gaji, Makan, Belanja Alat), masukkan nominal, dan unggah foto nota struk fisik.',
        highlightText: 'Tombol Catat Transaksi & Kategori Beban'
      },
      {
        number: 3,
        title: 'Ekspor Laporan Keuangan ke PDF atau CSV',
        description: 'Klik tombol "Unduh PDF" untuk menghasilkan lembar laporan laba rugi format cetak A4 berlogo bengkel, atau "Export CSV" untuk diolah di Microsoft Excel / Google Sheets.',
        highlightText: 'Tombol Unduh PDF / CSV'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Sinkronisasi Otomatis Kasir',
      content: 'Setiap kali kasir melunasi order servis (RO) atau mencatat restock barang masuk, sistem otomatis membukukan transaksi ke jurnal kas tanpa perlu input ganda.'
    }
  },

  {
    id: 'owner-inventory',
    sopCode: 'SOP-OWN-05',
    targetTab: 'inventory',
    tabActionName: 'Buka Inventaris & Sparepart',
    slug: 'katalog-inventaris',
    role: 'owner',
    title: 'Katalog Inventaris Sparepart, Batas Minimum & Valuasi Nilai Stok',
    summary: 'Manajemen master suku cadang, penentuan harga beli vs jual, penetapan batas minimum (peringatan stok menipis), dan valuasi aset gudang.',
    readTime: '4 menit',
    badge: 'Owner / Admin',
    tags: ['inventaris', 'sparepart', 'stok', 'sku', 'harga beli', 'harga jual', 'batas minimum', 'valuasi'],
    diagramType: 'stock',
    annotatedScreenshot: {
      title: 'Katalog Suku Cadang, Status Ketersediaan & Valuasi Aset',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_inventory_catalog.png',
      annotations: [
        { number: 1, top: '28%', left: '25%', title: 'Pencarian Suku Cadang', desc: 'Cari cepat berdasarkan nomor SKU, nama part, atau kategori barang' },
        { number: 2, top: '48%', left: '15%', title: 'Badge Peringatan Kritis', desc: 'Indikator merah jika stok berada di bawah batas minimum pemakaian' },
        { number: 3, top: '28%', left: '85%', title: 'Tombol Tambah Sparepart', desc: 'Daftarkan SKU suku cadang baru ke dalam master data gudang' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Tab Inventaris & Sparepart',
        description: 'Navigasi ke tab "Inventaris & Sparepart". Di bagian atas terdapat metrik total jenis barang, valuasi total nilai aset, dan jumlah SKU yang berada dalam kondisi kritis.',
        highlightText: 'Tab Inventaris & Sparepart'
      },
      {
        number: 2,
        title: 'Menambahkan Suku Cadang Baru',
        description: 'Klik "+ Tambah Sparepart". Isi kode SKU (contoh: OLI-SHELL-10W40), nama barang, kategori, satuan (Liter, Pcs, Set), harga beli modal, harga jual ke konsumen, dan batas minimum stok.',
        highlightText: 'Form Tambah Sparepart Baru'
      },
      {
        number: 3,
        title: 'Monitoring Batas Minimum (Early Warning)',
        description: 'Ketika stok suku cadang tersisa sama atau lebih sedikit dari batas minimum, sistem memberi tanda badge merah "KRITIS" di tabel dan dasbor utama agar kasir segera melakukan pemesanan ulang ke supplier.',
        highlightText: 'Badge Peringatan Kritis'
      }
    ],
    callout: {
      type: 'note',
      title: 'Pencegahan Kehabisan Stok',
      content: 'Pastikan batas minimum diatur realistis sesuai kecepatan pemakaian (misal: Oli mesin minimal 10 botol, kampas rem minimal 4 set).'
    }
  },

  // ==========================================
  // 2. MEKANIK MODULES
  // ==========================================
  {
    id: 'mekanik-intake',
    sopCode: 'SOP-MEK-01',
    targetTab: 'repair-orders',
    tabActionName: 'Buka Penerimaan RO Baru',
    slug: 'penerimaan-kendaraan-intake',
    role: 'mekanik',
    title: 'Penerimaan Fisik Kendaraan & Pembukaan Order Servis (RO)',
    summary: 'Pemeriksaan awal fisik mobil saat tiba di pit stall, pencatatan odometer (KM), keluhan pemilik, dan pembukaan tiket servis.',
    readTime: '3 menit',
    badge: 'Mekanik',
    tags: ['penerimaan', 'intake', 'odometer', 'keluhan', 'mobil masuk', 'spk'],
    annotatedScreenshot: {
      title: 'Formulir Penerimaan Fisik Kendaraan & Pembukaan Tiket Servis',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_kasir_new_ro.png',
      annotations: [
        { number: 1, top: '28%', left: '48%', title: 'Nama Pemilik / Pelanggan', desc: 'Ketik nama pemilik; sistem otomatis mencocokkan riwayat kendaraan' },
        { number: 2, top: '38%', left: '35%', title: 'WhatsApp & Plat Nomor', desc: 'Masukkan nomor WA pelanggan dan nomor polisi kendaraan (contoh: AG 1822 AB)' },
        { number: 3, top: '65%', left: '48%', title: 'Odometer Masuk (KM)', desc: 'Catat angka kilometer odometer pada spedometer dashboard mobil' },
        { number: 4, top: '80%', left: '48%', title: 'Keluhan / Permintaan Servis', desc: 'Tuliskan gejala kerusakan yang disampaikan pemilik (misal: rem bunyi, tarikan berat)' },
        { number: 5, top: '90%', left: '65%', title: 'Buat Repair Order', desc: 'Simpan tiket dan mulai alur pengerjaan panggung 6-tahap' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Inspeksi Awal Mobil di Stall Masuk',
        description: 'Periksa fisik bodi mobil, level bahan bakar, dan catat angka kilometer odometer pada instrumen cluster dashboard.',
        highlightText: 'Pencatatan Odometer Masuk'
      },
      {
        number: 2,
        title: 'Buka Tiket RO Baru',
        description: 'Tekan tombol "Buat RO Baru" di halaman Servis Mobil atau gunakan pintasan keyboard Omnibox (Ctrl+K). Masukkan plat nomor kendaraan (contoh: AG 1822 AB).',
        highlightText: 'Tombol Buat RO Baru'
      },
      {
        number: 3,
        title: 'Pilih Mekanik Penanggung Jawab & Estimasi Selesai',
        description: 'Pilih nama mekanik PIC yang ditugaskan menangani mobil dan pilih preset estimasi selesai cepat ("Hari ini 17:00" atau "Besok 12:00").',
        highlightText: 'Preset Estimasi Selesai'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Manfaat Odometer Akurat',
      content: 'Angka odometer akurat menjadi dasar sistem pengingat servis otomatis (servis berkala 5.000 KM atau 10.000 KM) yang akan dikirimkan lewat WhatsApp.'
    }
  },

  {
    id: 'mekanik-lifecycle',
    sopCode: 'SOP-MEK-02',
    targetTab: 'repair-orders',
    tabActionName: 'Buka 6-Tahap Servis RO',
    slug: 'alur-status-servis-6-tahap',
    role: 'mekanik',
    title: 'Alur Status Servis 6-Tahap & Log Pengerjaan Bengkel',
    summary: 'Standar tahapan kerja bengkel dari MASUK, DIAGNOSA, PENGERJAAN, MENUNGGU PART, SELESAI, hingga DIAMBIL PEMILIK.',
    readTime: '5 menit',
    badge: 'Mekanik',
    tags: ['status', 'lifecycle', 'diagnosa', 'pengerjaan', 'selesai', 'diambil', 'stepper'],
    diagramType: 'ro-lifecycle',
    annotatedScreenshot: {
      title: 'Stepper 6-Tahap Pengerjaan Servis & Status Terkini',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_ro_lifecycle.png',
      annotations: [
        { number: 1, top: '25%', left: '15%', title: 'Identitas Plat & Status', desc: 'Plat nomor kendaraan dan badge status operasional saat ini' },
        { number: 2, top: '55%', left: '48%', title: 'Stepper 6-Tahap', desc: 'Indikator visual alur: Masuk -> Diagnosa -> Pengerjaan -> Tunggu Part -> Selesai -> Diambil' },
        { number: 3, top: '48%', left: '88%', title: 'Tombol Update Status', desc: 'Perbarui tahapan pengerjaan dan catat log catatan mekanik' },
        { number: 4, top: '28%', left: '78%', title: 'Aksi Cepat Kirim WA', desc: 'Kirimkan tautan pelacakan real-time langsung ke WhatsApp pemilik mobil' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Halaman Rincian RO Mobil',
        description: 'Dari daftar Repair Order, klik pada baris mobil yang sedang Anda kerjakan untuk membuka halaman rincian kerja.',
        highlightText: 'Klik Kartu / Baris RO'
      },
      {
        number: 2,
        title: 'Klik Tombol "Update Status Pengerjaan"',
        description: 'Tekan tombol hijau "Update Status >" di kanan atas kotak tahapan kerja. Modal pembaruan status akan terbuka.',
        highlightText: 'Tombol Update Status'
      },
      {
        number: 3,
        title: 'Pilih Tahap Pengerjaan Baru & Tuliskan Catatan',
        description: 'Pilih status baru (contoh: dari DIAGNOSA menjadi PENGERJAAN). Masukkan catatan singkat (misal: "Sedang dilakukan kuras minyak rem dan ganti kampas").',
        highlightText: 'Pilihan Status & Catatan Pengerjaan'
      },
      {
        number: 4,
        title: 'Simpan Status & Beri Tahu Pelanggan',
        description: 'Klik "Perbarui Status". Status langsung tersinkronisasi ke portal publik pelanggan tanpa delay.',
        highlightText: 'Simpan Pembaruan'
      }
    ],
    callout: {
      type: 'note',
      title: 'Pentingnya Status "Tunggu Part"',
      content: 'Gunakan status MENUNGGU PART jika pekerjaan terhenti karena menunggu konfirmasi penggantian komponen dari pemilik mobil atau kiriman supplier.'
    }
  },

  {
    id: 'mekanik-photos',
    sopCode: 'SOP-MEK-03',
    targetTab: 'repair-orders',
    tabActionName: 'Buka Kamera Servis RO',
    slug: 'dokumentasi-foto-pengerjaan',
    role: 'mekanik',
    title: 'Dokumentasi Foto Pengerjaan (Before, Progress, After)',
    summary: 'Mengambil foto kondisi mobil dan sparepart rusak langsung dari kamera HP, kompresi otomatis client-side hingga 90%, dan publikasi transparan ke pelanggan.',
    readTime: '4 menit',
    badge: 'Mekanik',
    tags: ['foto', 'kamera', 'before', 'progress', 'after', 'dokumentasi', 'bukti', 'kompresi'],
    annotatedScreenshot: {
      title: 'Dokumentasi Foto Servis: Jepret Kamera & Klasifikasi Stage',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_photo_upload.png',
      annotations: [
        { number: 1, top: '48%', left: '14%', title: 'Buka Kamera (Jepret)', desc: 'Tombol hijau untuk langsung membuka kamera ponsel mekanik tanpa aplikasi tambahan' },
        { number: 2, top: '48%', left: '28%', title: 'Pilih Galeri / File', desc: 'Alternatif untuk memilih foto yang sudah diambil sebelumnya di galeri HP' },
        { number: 3, top: '58%', left: '15%', title: 'Pilih Tahap Servis', desc: 'Pilih klasifikasi: BEFORE (Sebelum), PROGRESS (Proses Servis), atau AFTER (Selesai)' },
        { number: 4, top: '58%', left: '36%', title: 'Keterangan / Caption', desc: 'Ketik deskripsi singkat, misalnya: "Kondisi kampas rem depan aus parah"' },
        { number: 5, top: '58%', left: '55%', title: 'Unggah Foto Otomatis', desc: 'Kompresi otomatis client-side hingga hemat kuota 90% sebelum diunggah' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Bagian Dokumentasi Foto pada Detail RO',
        description: 'Scroll ke bagian "Dokumentasi Foto Servis (Transparansi Pelanggan)" pada halaman rincian order servis mobil.',
        highlightText: 'Section Dokumentasi Foto Servis'
      },
      {
        number: 2,
        title: 'Klik Tombol "Buka Kamera (Jepret)"',
        description: 'Tekan tombol hijau "Buka Kamera (Jepret)". Browser ponsel Anda akan langsung mengaktifkan kamera belakang tanpa perlu install aplikasi pihak ketiga.',
        highlightText: 'Tombol Buka Kamera (Jepret)'
      },
      {
        number: 3,
        title: 'Pilih Tahap Pengerjaan (Before, Progress, After)',
        description: 'Pilih klasifikasi foto: BEFORE untuk kondisi awal komponen rusak sebelum disentuh, PROGRESS untuk proses pembongkaran, dan AFTER untuk komponen baru yang telah terpasang rapi.',
        highlightText: 'Dropdown Tahap Servis'
      },
      {
        number: 4,
        title: 'Tulis Keterangan & Klik "Unggah Foto"',
        description: 'Tulis catatan komponen (misal: "Busi lama berkerak hitam, celah elektroda melebihi batas 1.1mm"). Klik tombol "Unggah Foto". Sistem otomatis memperkecil ukuran foto dari 5MB menjadi <300KB dalam 1 detik.',
        highlightText: 'Tombol Unggah Foto'
      },
      {
        number: 5,
        title: 'Verifikasi di Portal Pelanggan',
        description: 'Foto langsung tampil di galeri dokumentasi foto real-time yang dapat dilihat pelanggan saat membuka link tracking WhatsApp.',
        highlightText: 'Pratinjau Galeri Foto'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Kunci Kepercayaan Pelanggan',
      content: 'Foto perbandingan BEFORE & AFTER adalah bukti fisik tak terbantahkan yang menghindarkan bengkel dari kecurigaan kecurangan atau nota fiktif.'
    }
  },

  {
    id: 'mekanik-parts',
    sopCode: 'SOP-MEK-04',
    targetTab: 'repair-orders',
    tabActionName: 'Buka Pemasangan Part RO',
    slug: 'pemasangan-sparepart-ke-ro',
    role: 'mekanik',
    title: 'Pemasangan & Pelepasan Suku Cadang ke Repair Order',
    summary: 'Menambahkan suku cadang yang terpasang pada mobil, pengurangan stok gudang otomatis, dan rekapitulasi biaya part ke invoice.',
    readTime: '3 menit',
    badge: 'Mekanik',
    tags: ['pasang part', 'sparepart', 'deduction', 'stok keluar', 'subtotal'],
    annotatedScreenshot: {
      title: 'Pemasangan Sparepart & Rincian Tagihan Servis',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_kasir_payment.png',
      annotations: [
        { number: 1, top: '25%', left: '85%', title: 'Edit Jasa & Biaya', desc: 'Atur nominal ongkos kerja mekanik sesuai standar jasa' },
        { number: 2, top: '35%', left: '20%', title: 'Subtotal Jasa & Part', desc: 'Kalkulasi otomatis total biaya pengerjaan dan komponen terpasang' },
        { number: 3, top: '55%', left: '85%', title: 'Total Tagihan Bersih', desc: 'Nilai total yang siap dibayarkan pelanggan di kasir' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Klik Tombol "+ Pasang Sparepart"',
        description: 'Pada detail RO, scroll ke tabel Suku Cadang Terpasang dan klik tombol "+ Pasang Sparepart".',
        highlightText: 'Tombol Pasang Sparepart'
      },
      {
        number: 2,
        title: 'Pilih Item Suku Cadang dari Gudang',
        description: 'Pilih part dari katalog. Sistem akan menampilkan sisa stok saat ini. Masukkan jumlah (qty) yang dipasang ke mobil.',
        highlightText: 'Dropdown Suku Cadang & Input Qty'
      },
      {
        number: 3,
        title: 'Simpan Pemasangan',
        description: 'Klik tombol Simpan. Sistem otomatis memotong stok di gudang dan menambahkan rincian harga ke kalkulasi nota pelanggan.',
        highlightText: 'Simpan Pemasangan'
      }
    ],
    callout: {
      type: 'warning',
      title: 'Proteksi Stok Habis (E10)',
      content: 'Sistem menolak pemasangan jika jumlah sparepart yang diminta melebihi sisa fisik di gudang untuk mencegah selisih stok (stock underflow).'
    }
  },

  // ==========================================
  // 3. KASIR MODULES
  // ==========================================
  {
    id: 'kasir-new-ro',
    sopCode: 'SOP-KAS-01',
    targetTab: 'repair-orders',
    tabActionName: 'Buat RO Kasir Baru',
    slug: 'pembuatan-ro-kasir',
    role: 'kasir',
    title: 'Pembuatan RO Baru & Autocomplete CRM Pelanggan',
    summary: 'Penerbitan Surat Perintah Kerja (SPK) baru di meja depan kasir dengan pencocokan otomatis database pelanggan tetap.',
    readTime: '3 menit',
    badge: 'Kasir',
    tags: ['kasir', 'spk', 'ro baru', 'autocomplete', 'crm', 'pelanggan', 'plat nomor'],
    annotatedScreenshot: {
      title: 'Penerbitan RO Baru Kasir dengan Autocomplete CRM',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_kasir_new_ro.png',
      annotations: [
        { number: 1, top: '28%', left: '48%', title: 'Pencarian CRM Pelanggan', desc: 'Ketik nama pelanggan untuk mencocokkan nomor HP dan riwayat mobil' },
        { number: 2, top: '38%', left: '35%', title: 'Nomor WhatsApp Aktif', desc: 'Format seluler Indonesia untuk pengiriman notifikasi nota digital' },
        { number: 3, top: '38%', left: '60%', title: 'Plat Nomor Kendaraan', desc: 'Nomor polisi mobil (contoh: AG 1822 AB)' },
        { number: 4, top: '48%', left: '48%', title: 'Merek & Model Mobil', desc: 'Pilih dari riwayat bengkel atau ketik manual (Toyota Avanza, Honda Brio, dll.)' },
        { number: 5, top: '90%', left: '65%', title: 'Terbitkan Order Servis', desc: 'Cetak nomor RO otomatis dan arahkan mobil ke pit pengerjaan' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Klik Tombol "Buat RO Baru"',
        description: 'Buka tab "Servis Mobil (RO)" di dashboard dan klik tombol "+ Buat RO Baru".',
        highlightText: 'Tombol Buat RO Baru'
      },
      {
        number: 2,
        title: 'Ketik Nama Pelanggan (Autocomplete)',
        description: 'Mulai ketik nama pemilik. Jika pelanggan pernah servis sebelumnya, data nomor telepon dan daftar mobilnya akan muncul otomatis.',
        highlightText: 'Autocomplete CRM'
      },
      {
        number: 3,
        title: 'Lengkapi Data Kendaraan & Keluhan',
        description: 'Isi plat nomor, tipe mobil, tahun, warna, kilometer, dan keluhan utama pemilik mobil.',
        highlightText: 'Input Rincian Kendaraan'
      },
      {
        number: 4,
        title: 'Terbitkan SPK / RO',
        description: 'Klik "Buat Repair Order". Nomor urut RO diterbitkan otomatis (contoh: RO-202610-001).',
        highlightText: 'Simpan Repair Order'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Kecepatan Pelayanan Meja Kasir',
      content: 'Fitur autocomplete CRM menghemat waktu pendaftaran hingga <30 detik untuk pelanggan lama.'
    }
  },

  {
    id: 'kasir-payment',
    sopCode: 'SOP-KAS-02',
    targetTab: 'finance',
    tabActionName: 'Buka Pelunasan & Kasir',
    slug: 'perhitungan-biaya-pelunasan',
    role: 'kasir',
    title: 'Perhitungan Biaya, Diskon & Pelunasan Kasir Otomatis',
    summary: 'Proses pembayaran servis, penambahan diskon promo, pencatatan metode bayar (Tunai, QRIS, Transfer), dan pencetakan tanda lunas.',
    readTime: '4 menit',
    badge: 'Kasir',
    tags: ['pembayaran', 'kasir', 'diskon', 'tunai', 'qris', 'transfer', 'lunas'],
    annotatedScreenshot: {
      title: 'Panel Pembayaran Servis Kasir & Pemilihan Metode Bayar',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_kasir_payment.png',
      annotations: [
        { number: 1, top: '25%', left: '85%', title: 'Atur Ongkos Jasa', desc: 'Sesuaikan biaya jasa tune-up, servis rem, atau turun mesin' },
        { number: 2, top: '35%', left: '20%', title: 'Subtotal Suku Cadang', desc: 'Akumulasi seluruh part yang telah dipasang oleh mekanik di pit' },
        { number: 3, top: '48%', left: '20%', title: 'Input Potongan / Diskon', desc: 'Masukkan nominal potongan harga khusus pelanggan atau voucher promo' },
        { number: 4, top: '55%', left: '85%', title: 'Total Tagihan Bersih', desc: 'Jumlah uang yang wajib ditagihkan dan dibayarkan oleh konsumen' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Verifikasi Pekerjaan Telah Selesai',
        description: 'Pastikan status servis mobil telah berada pada tahap SELESAI dan seluruh sparepart telah diverifikasi oleh kepala mekanik.',
        highlightText: 'Status Tahap Selesai'
      },
      {
        number: 2,
        title: 'Input Potongan Harga / Diskon (Jika Ada)',
        description: 'Jika ada program promosi atau voucher loyalitas pelanggan, masukkan nominal diskon pada kolom potongan harga.',
        highlightText: 'Kolom Diskon / Potongan'
      },
      {
        number: 3,
        title: 'Pilih Metode Pembayaran & Catat Pelunasan',
        description: 'Pilih metode bayar konsumen (Tunai, QRIS Dinamis, atau Transfer Bank). Sistem otomatis mencatat uang masuk ke jurnal Buku Kas.',
        highlightText: 'Pilihan Metode Pembayaran'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Rekonsiliasi Kas Instan',
      content: 'Setiap transaksi lunas langsung memperbarui saldo kas kasir tanpa perlu perhitungan manual akhir shift.'
    }
  },

  {
    id: 'kasir-invoice',
    sopCode: 'SOP-KAS-03',
    targetTab: 'repair-orders',
    tabActionName: 'Cetak Nota & Invoice A4',
    slug: 'cetak-invoice-nota-pdf',
    role: 'kasir',
    title: 'Cetak Invoice & Surat Jalan Format Cetak Standar A4',
    summary: 'Menghasilkan dokumen invoice resmi format PDF standar cetak A4 berlogo bengkel, rincian biaya transparan, dan QR code tracking.',
    readTime: '3 menit',
    badge: 'Kasir',
    tags: ['invoice', 'pdf', 'cetak', 'nota a4', 'surat jalan', 'qr code'],
    annotatedScreenshot: {
      title: 'Tombol Cetak Dokumen Invoice Resmi & Integrasi Pelacakan',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_ro_lifecycle.png',
      annotations: [
        { number: 1, top: '28%', left: '68%', title: 'Cetak Nota PDF', desc: 'Unduh file PDF resmi format standar A4 berlogo bengkel untuk printer kantor' },
        { number: 2, top: '28%', left: '78%', title: 'Kirim via WhatsApp', desc: 'Kirimkan tautan ringkasan invoice langsung ke kontak WhatsApp pemilik mobil' },
        { number: 3, top: '28%', left: '88%', title: 'Buka Portal Tracking', desc: 'Buka pratinjau halaman pelacakan mandiri publik milik pelanggan' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Klik Tombol "Cetak Nota PDF"',
        description: 'Pada halaman rincian order servis, klik tombol abu-abu "Cetak Nota PDF" di bagian atas.',
        highlightText: 'Tombol Cetak Nota PDF'
      },
      {
        number: 2,
        title: 'Pratinjau Dokumen PDF',
        description: 'File PDF akan terbuka di tab browser baru menampilkan kop resmi bengkel, nomor SPK, data mobil, rincian jasa dan suku cadang, serta tanda tangan mekanik.',
        highlightText: 'Tampilan PDF Browser'
      },
      {
        number: 3,
        title: 'Cetak atau Kirimkan File ke Pelanggan',
        description: 'Tekan Ctrl+P untuk mencetak ke kertas fisik, atau simpan file PDF untuk dikirimkan melalui WhatsApp pelanggan.',
        highlightText: 'Pintasan Ctrl+P / Download'
      }
    ],
    callout: {
      type: 'note',
      title: 'QR Code Transparansi Pelanggan',
      content: 'Pada bagian bawah invoice cetak terdapat QR code yang dapat dipindai oleh kamera ponsel pelanggan untuk melihat dokumentasi foto perbaikan mobil mereka kapan saja.'
    }
  },

  {
    id: 'kasir-thermal-pos',
    sopCode: 'SOP-KAS-04',
    targetTab: 'repair-orders',
    tabActionName: 'Cetak Struk POS Termal 58mm',
    slug: 'cetak-struk-kasir-thermal-58mm',
    role: 'kasir',
    title: 'Pencetakan Struk Kasir Termal 58mm POS & QRIS Cepat',
    summary: 'Mencetak struk kasir kecil ukuran continuous thermal 58mm menggunakan printer bluetooth murah langsung dari meja kasir.',
    readTime: '3 menit',
    badge: 'Kasir',
    tags: ['struk', 'thermal', 'printer kasir', '58mm', 'pos', 'bluetooth printer', 'qris'],
    annotatedScreenshot: {
      title: 'Simulasi Struk Kasir Termal 58mm & Font Monospace Kasir',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_thermal_receipt.png',
      annotations: [
        { number: 1, top: '25%', left: '50%', title: 'Kop Struk Bengkel', desc: 'Nama bengkel, alamat Kediri, dan kontak WhatsApp pemesanan' },
        { number: 2, top: '40%', left: '50%', title: 'Nomor SPK & Plat Mobil', desc: 'Identifikasi ringkas mobil konsumen dan nama teknisi yang bertugas' },
        { number: 3, top: '55%', left: '50%', title: 'Rincian Jasa & Part', desc: 'Daftar item biaya dengan format monospace rata kanan standar POS' },
        { number: 4, top: '70%', left: '50%', title: 'Total Tagihan & QRIS', desc: 'Total pembayaran bersih dan status lunas' },
        { number: 5, top: '85%', left: '50%', title: 'Cetak ke Printer Bluetooth', desc: 'Kirim perintah cetak langsung ke printer termal 58mm portabel' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Sambungkan Printer Kasir Bluetooth / USB',
        description: 'Pastikan printer thermal 58mm atau 80mm di meja kasir Anda telah menyala dan terhubung melalui Bluetooth atau kabel USB ke komputer kasir/HP.',
        highlightText: 'Koneksi Printer 58mm'
      },
      {
        number: 2,
        title: 'Pilih Cetak Struk Kasir',
        description: 'Setelah pelunasan transaksi selesai, klik opsi "Cetak Struk Kasir 58mm". Format teks struk otomatis disesuaikan dengan lebar kertas termal.',
        highlightText: 'Opsi Struk Kasir 58mm'
      },
      {
        number: 3,
        title: 'Robek dan Serahkan ke Pelanggan',
        description: 'Printer akan mencetak struk secara cepat dalam 2 detik. Serahkan struk beserta kunci mobil kepada pelanggan.',
        highlightText: 'Serah Terima Struk Kasir'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Hemat Biaya Kertas Khas Bengkel',
      content: 'Struk termal 58mm menghemat biaya kertas hingga 80% dibanding mencetak di kertas HVS A4 untuk servis-servis ringan seperti ganti oli berkala.'
    }
  },

  {
    id: 'kasir-restock',
    sopCode: 'SOP-KAS-05',
    targetTab: 'mutations',
    tabActionName: 'Catat Restock Barang Masuk',
    slug: 'pencatatan-restock-barang-masuk',
    role: 'kasir',
    title: 'Pencatatan Restock Barang Masuk dari Supplier',
    summary: 'Mencatat pembelian sparepart dari toko/supplier, pembaruan harga beli terakhir, penambahan stok gudang, dan pencatatan kas keluar.',
    readTime: '4 menit',
    badge: 'Kasir',
    tags: ['restock', 'barang masuk', 'supplier', 'harga modal', 'stok bertambah', 'faktur supplier'],
    annotatedScreenshot: {
      title: 'Pencatatan Barang Masuk & Rekam Transaksi Restock',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_stock_mutations.png',
      annotations: [
        { number: 1, top: '35%', left: '65%', title: '+ Barang Masuk (Restock)', desc: 'Tombol hijau untuk membuka form penerimaan barang baru dari distributor' },
        { number: 2, top: '45%', left: '65%', title: '- Barang Keluar (Pemakaian)', desc: 'Tombol merah untuk mencatat barang keluar non-servis atau retur' },
        { number: 3, top: '42%', left: '85%', title: 'Ekspor Mutasi CSV & PDF', desc: 'Unduh rekap data keluar-masuk barang untuk pelaporan audit berkala' },
        { number: 4, top: '65%', left: '30%', title: 'Grafik Alur Mutasi Stok', desc: 'Visualisasi volume barang masuk vs keluar selama 14 hari terakhir' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Menu Mutasi Stok atau Inventaris',
        description: 'Masuk ke tab "Inventaris & Sparepart" lalu pilih sub-navigasi "Riwayat Mutasi".',
        highlightText: 'Sub-Menu Riwayat Mutasi'
      },
      {
        number: 2,
        title: 'Klik Tombol "+ Barang Masuk (Restock)"',
        description: 'Klik tombol hijau "+ Barang Masuk (Restock)". Modal penerimaan barang masuk akan terbuka.',
        highlightText: 'Tombol + Barang Masuk'
      },
      {
        number: 3,
        title: 'Pilih Suku Cadang, Jumlah Qty & Harga Beli Modal',
        description: 'Pilih item barang yang datang, masukkan jumlah unit yang diterima, harga beli satuan faktur terbaru, serta nama supplier.',
        highlightText: 'Input Jumlah & Harga Beli'
      },
      {
        number: 4,
        title: 'Simpan Barang Masuk',
        description: 'Klik "Simpan Barang Masuk". Sistem otomatis menambahkan jumlah fisik di gudang dan mencatat pengeluaran uang di Buku Kas.',
        highlightText: 'Simpan Restock'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Pembaruan Harga Pokok Penjualan (HPP)',
      content: 'Harga beli baru yang Anda masukkan otomatis memperbarui nilai dasar valuasi stok di gudang secara akurat.'
    }
  },

  {
    id: 'inventory-mutations',
    sopCode: 'SOP-KAS-06',
    targetTab: 'mutations',
    tabActionName: 'Buka Buku Mutasi Stok',
    slug: 'audit-trail-riwayat-mutasi',
    role: 'kasir',
    title: 'Audit Trail & Riwayat Mutasi Stok (Masuk, Keluar, Opname)',
    summary: 'Pemantauan buku mutasi digital untuk setiap perubahan stok: siapa yang mengubah, nomor referensi RO, tanggal, dan alasan perubahan.',
    readTime: '4 menit',
    badge: 'Kasir',
    tags: ['mutasi', 'audit trail', 'kartu stok', 'riwayat', 'restock', 'service usage', 'opname adjustment'],
    annotatedScreenshot: {
      title: 'Buku Mutasi Stok Digital & Filter Penelusuran Transaksi',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_stock_mutations.png',
      annotations: [
        { number: 1, top: '60%', left: '30%', title: 'Grafik Mutasi Harian', desc: 'Grafik batang perbandingan barang restock vs barang terpasang pada mobil' },
        { number: 2, top: '90%', left: '12%', title: 'Filter Tipe Mutasi', desc: 'Saring berdasarkan RESTOCK, SERVICE_USAGE, atau OPNAME_ADJUSTMENT' },
        { number: 3, top: '90%', left: '48%', title: 'Filter Rentang Tanggal', desc: 'Pilih tanggal awal dan akhir untuk audit pembukuan mingguan/bulanan' },
        { number: 4, top: '90%', left: '85%', title: 'Kolom Pencarian Cepat', desc: 'Ketik nama sparepart atau nomor faktur untuk melacak riwayat transaksi tertentu' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Akses Sub-Navigasi Riwayat Mutasi',
        description: 'Buka modul Inventaris, lalu klik tab "Riwayat Mutasi". Anda akan disajikan grafik tren dan tabel kronologis mutasi barang.',
        highlightText: 'Tab Riwayat Mutasi'
      },
      {
        number: 2,
        title: 'Filter Berdasarkan Tipe Transaksi',
        description: 'Gunakan dropdown tipe mutasi untuk membedakan barang masuk dari supplier (RESTOCK), barang terpakai servis (SERVICE_USAGE), atau penyesuaian selisih (OPNAME_ADJUSTMENT).',
        highlightText: 'Dropdown Filter Tipe'
      },
      {
        number: 3,
        title: 'Audit Detail Perubahan',
        description: 'Tabel menampilkan nilai perubahan (+ atau -), sisa stok setelah transaksi, nama operator pembuat mutasi, dan nomor referensi RO terkait.',
        highlightText: 'Tabel Riwayat Mutasi'
      }
    ],
    callout: {
      type: 'note',
      title: 'Mencegah Kebocoran Stok',
      content: 'Dengan audit trail ini, setiap ada suku cadang yang berkurang dapat dilacak secara pasti ke mobil mana part tersebut dipasang.'
    }
  },

  {
    id: 'kasir-opname',
    sopCode: 'SOP-KAS-07',
    targetTab: 'opname',
    tabActionName: 'Buka Formulir Stok Opname',
    slug: 'pelaksanaan-stok-opname-fisik',
    role: 'kasir',
    title: 'Pelaksanaan Stok Opname Fisik Gudang & Penyesuaian Selisih',
    summary: 'Prosedur pencocokan jumlah fisik suku cadang di rak gudang dengan data sistem, penghitungan selisih, dan rekonsiliasi otomatis.',
    readTime: '4 menit',
    badge: 'Kasir',
    tags: ['stok opname', 'audit gudang', 'selisih stok', 'rekonsiliasi', 'penghitungan fisik'],
    annotatedScreenshot: {
      title: 'Antarmuka Pencatatan Hitungan Fisik Stok Opname Gudang',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_stock_opname.png',
      annotations: [
        { number: 1, top: '15%', left: '42%', title: 'Tab Stok Opname', desc: 'Buka sesi penghitungan fisik suku cadang gudang berkala' },
        { number: 2, top: '35%', left: '85%', title: 'Tombol Mulai Sesi Baru', desc: 'Buka sesi audit baru untuk membekukan data perbandingan sistem' },
        { number: 3, top: '65%', left: '50%', title: 'Tabel Hitungan Fisik & Selisih', desc: 'Kolom input jumlah hitungan riil tangan dan kalkulasi selisih otomatis' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Sub-Navigasi "Stok Opname"',
        description: 'Pada modul inventaris, pilih sub-navigasi "Stok Opname". Klik tombol "+ Mulai Sesi Stok Opname Baru".',
        highlightText: 'Mulai Sesi Opname Baru'
      },
      {
        number: 2,
        title: 'Hitung Fisik Suku Cadang di Rak Gudang',
        description: 'Lakukan penghitungan manual barang di rak satu per satu. Masukkan angka riil yang dihitung ke dalam kolom "Hitungan Fisik".',
        highlightText: 'Input Hitungan Fisik'
      },
      {
        number: 3,
        title: 'Tinjau Kolom Selisih (Discrepancy)',
        description: 'Sistem otomatis menghitung selisih (Stok Fisik - Stok Sistem). Jika cocok selisih bernilai 0. Jika ada selisih, sistem menandainya dengan badge warna peringatan.',
        highlightText: 'Review Selisih Barang'
      },
      {
        number: 4,
        title: 'Finalisasi & Rekonsiliasi Jurnal',
        description: 'Tuliskan catatan hasil audit (misal: "Audit akhir bulan Oktober") dan klik "Finalisasi Sesi Opname". Sistem otomatis menyesuaikan stok master dan mencatat jurnal koreksi.',
        highlightText: 'Tombol Finalisasi Sesi Opname'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Jadwal Opname Rutin',
      content: 'Lakukan stok opname rutin setiap 2 minggu atau akhir bulan untuk barang-barang bernilai tinggi seperti oli mesin drum, aki mobil, dan ban.'
    }
  },

  // ==========================================
  // 4. CRM & PELANGGAN MODULES
  // ==========================================
  {
    id: 'crm-database',
    sopCode: 'SOP-CRM-01',
    targetTab: 'customers',
    tabActionName: 'Buka Database Pelanggan',
    slug: 'database-crm-pelanggan',
    role: 'crm',
    title: 'Database Pelanggan, Profil Kontak & Riwayat Servis Kendaraan',
    summary: 'Manajemen basis data pemilik mobil, riwayat perbaikan masa lalu, rekam jejak kilometer, dan kontak komunikasi terintegrasi.',
    readTime: '3 menit',
    badge: 'CRM & Pelanggan',
    tags: ['crm', 'pelanggan', 'database', 'riwayat mobil', 'kontak', 'whatsapp'],
    annotatedScreenshot: {
      title: 'Database Pelanggan CRM, Riwayat Mobil & Tautan WhatsApp',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_crm_customers.png',
      annotations: [
        { number: 1, top: '22%', left: '85%', title: 'Tambah Pelanggan Baru', desc: 'Daftarkan data nama pemilik, nomor WhatsApp, dan alamat tinggal' },
        { number: 2, top: '48%', left: '30%', title: 'Kartu Profil Pelanggan', desc: 'Menampilkan nama pemilik dan daftar mobil yang pernah diservis' },
        { number: 3, top: '48%', left: '72%', title: 'Tombol Chat WhatsApp', desc: 'Kirim pesan wa.me instan ke nomor pemilik tanpa simpan kontak di HP' },
        { number: 4, top: '48%', left: '88%', title: 'Buka Riwayat Servis', desc: 'Lihat daftar pekerjaan dan riwayat faktur mobil pelanggan di masa lalu' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Akses Tab Pelanggan',
        description: 'Buka menu "Pelanggan" di topbar. Sistem menampilkan seluruh pelanggan terdaftar beserta jumlah kendaraan yang mereka miliki.',
        highlightText: 'Tab Pelanggan'
      },
      {
        number: 2,
        title: 'Cari Pelanggan Berdasarkan Nama atau No HP',
        description: 'Gunakan kolom pencarian di bagian atas untuk menemukan riwayat pelanggan dalam hitungan milidetik.',
        highlightText: 'Kolom Pencarian Pelanggan'
      },
      {
        number: 3,
        title: 'Lihat Riwayat Servis Lengkap',
        description: 'Klik tombol "Riwayat" pada kartu pelanggan untuk melihat tanggal servis terdahulu, keluhan lama, dan total biaya yang telah dihabiskan.',
        highlightText: 'Tombol Riwayat Servis'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Hubungan Pelanggan Jangka Panjang',
      content: 'Riwayat servis yang rapi membantu mekanik mendiagnosa riwayat perawatan mobil secara akurat saat pelanggan kembali berkunjung.'
    }
  },

  {
    id: 'crm-whatsapp',
    sopCode: 'SOP-CRM-02',
    targetTab: 'customers',
    tabActionName: 'Buka Promo WhatsApp CRM',
    slug: 'broadcast-promosi-reminder-whatsapp',
    role: 'crm',
    title: 'Pengiriman Pesan WhatsApp Promosi & Pengingat Servis Berkala',
    summary: 'Komposer pesan promosi massal/personal via WhatsApp resmi bengkel dengan template variabel otomatis ({nama}, {mobil}, {plat}).',
    readTime: '3 menit',
    badge: 'CRM & Pelanggan',
    tags: ['whatsapp', 'promosi', 'reminder', 'tune up', 'diskon', 'broadcast', 'template'],
    annotatedScreenshot: {
      title: 'Komposer Promosi WhatsApp dengan Variabel Otomatis',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_crm_whatsapp.png',
      annotations: [
        { number: 1, top: '28%', left: '48%', title: 'Pilih Kategori Promosi', desc: 'Pilihan template: Promo Gajian, Servis Berkala 10.000 KM, atau Uji Emisi' },
        { number: 2, top: '45%', left: '48%', title: 'Editor Pesan Teks', desc: 'Kustomisasi pesan dengan token dinamis {nama}, {mobil}, dan {plat}' },
        { number: 3, top: '65%', left: '48%', title: 'Target Penerima', desc: 'Kirim ke seluruh pelanggan aktif atau saring pelanggan dengan kilometer tinggi' },
        { number: 4, top: '88%', left: '72%', title: 'Buka WhatsApp Web / App', desc: 'Tautan otomatis membuka chat WA dengan pesan yang sudah terformat rapi' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Modal "Kirim Promo WhatsApp"',
        description: 'Pada halaman Pelanggan, klik tombol hijau "Kirim Promo WhatsApp" di sudut kanan atas.',
        highlightText: 'Tombol Kirim Promo WhatsApp'
      },
      {
        number: 2,
        title: 'Pilih Template Pesan atau Tulis Sendiri',
        description: 'Pilih salah satu template cepat (misal: "Promo Servis Rem & Ganti Oli Awal Bulan") atau tulis teks promosi kustom.',
        highlightText: 'Pilihan Template Pesan'
      },
      {
        number: 3,
        title: 'Kirimkan Pesan Langsung ke WhatsApp Pelanggan',
        description: 'Klik tombol "Kirim via WhatsApp". Aplikasi otomatis mengarahkan ke aplikasi WhatsApp dengan pesan terformat rapi siap kirim.',
        highlightText: 'Tombol Kirim via WhatsApp'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Pesan Ramah Tanpa Blokir',
      content: 'Kirimkan reminder berkala setiap 3-4 bulan saat mobil pelanggan mendekati jadwal servis agar terasa solutif dan tidak dianggap spam.'
    }
  },

  {
    id: 'crm-tracking',
    sopCode: 'SOP-CRM-03',
    targetTab: 'overview',
    tabActionName: 'Buka Portal Cek Status Publik',
    slug: 'portal-pelacakan-publik-zero-friction',
    role: 'crm',
    title: 'Portal Publik Pelacakan Servis Tanpa Login (Zero Friction) & Sensor Privasi',
    summary: 'Halaman pelacakan mandiri publik di mana pemilik mobil dapat memantau progres servis, estimasi selesai, dan foto fisik hanya dengan mengetik nomor plat.',
    readTime: '3 menit',
    badge: 'CRM & Pelanggan',
    tags: ['pelacakan', 'tracking', 'tanpa login', 'privasi', 'sensor', 'zero friction', 'cek status'],
    annotatedScreenshot: {
      title: 'Portal Pelacakan Publik Mandiri dengan Jaminan Sensor Privasi',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_public_tracking.png',
      annotations: [
        { number: 1, top: '38%', left: '42%', title: 'Input Plat Nomor Kendaraan', desc: 'Pemilik mobil hanya mengetik nomor plat (contoh: AG 1822 AB) tanpa perlu login' },
        { number: 2, top: '38%', left: '66%', title: 'Tombol Lacak Progres', desc: 'Klik untuk memuat data pengerjaan mobil dan estimasi selesai secara instan' },
        { number: 3, top: '46%', left: '68%', title: 'Badge Sensor Privasi', desc: 'Nama pemilik dan nomor HP otomatis disensor bintang (J*** W******) demi keamanan' },
        { number: 4, top: '60%', left: '50%', title: 'Tombol Bagikan WhatsApp', desc: 'Bagikan tautan pelacakan langsung ke keluarga pemilik mobil' },
        { number: 5, top: '85%', left: '42%', title: 'Timeline Pengerjaan Real-Time', desc: 'Indikator tahap aktif pengerjaan mobil saat ini di stall bengkel' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Buka Halaman Cek Status Publik',
        description: 'Akses URL /bengkel-gps-motor/cek-status melalui browser HP apa saja tanpa perlu membuat akun atau login.',
        highlightText: 'Portal /cek-status'
      },
      {
        number: 2,
        title: 'Masukkan Nomor Plat Kendaraan',
        description: 'Ketik nomor polisi mobil (contoh: AG 1822 AB) dan klik tombol "Lacak Progres".',
        highlightText: 'Input Plat & Klik Lacak Progres'
      },
      {
        number: 3,
        title: 'Pantau Tahapan & Dokumentasi Foto Asli',
        description: 'Pelanggan dapat melihat posisi mobil saat ini (Masuk, Diagnosa, Pengerjaan, dsb.), rincian estimasi selesai, foto Before/After, serta mengklik tombol "Tanya Bengkel WA".',
        highlightText: 'Timeline & Foto Perbaikan'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Jaminan Privasi Aman (Zero-Login Privacy)',
      content: 'Portal publik menerapkan perlindungan sensor privasi ketat: nama konsumen (J*** W******) dan nomor handphone (0812-****-7890) disamarkan sehingga aman dibuka di perangkat umum.'
    }
  },

  {
    id: 'app-omnibox',
    sopCode: 'SOP-CRM-04',
    targetTab: 'overview',
    tabActionName: 'Jalankan Omnibox (Ctrl+K)',
    slug: 'pencarian-cepat-omnibox-ctrl-k',
    role: 'crm',
    title: 'Pencarian Cepat Global (Command Palette & Omnibox Ctrl+K)',
    summary: 'Akses navigasi instan berkecepatan tinggi ke data kendaraan masuk, aksi cepat modul bengkel, dan shortcut keyboard.',
    readTime: '2 menit',
    badge: 'CRM & Pelanggan',
    tags: ['omnibox', 'command palette', 'ctrl+k', 'pencarian cepat', 'keyboard shortcut', 'shortcut'],
    annotatedScreenshot: {
      title: 'Command Palette Omnibox: Navigasi Cepat Keyboard Ctrl+K',
      badge: 'Tangkapan Layar Live',
      image: '/images/docs/docs_app_omnibox.png',
      annotations: [
        { number: 1, top: '23%', left: '48%', title: 'Bar Pencarian Omnibox', desc: 'Ketik plat nomor (AG...), nama pemilik, atau aksi yang ingin dijalankan' },
        { number: 2, top: '34%', left: '48%', title: 'Aksi Cepat Pertama', desc: 'Buat RO Baru langsung tanpa harus membuka menu Servis terlebih dahulu' },
        { number: 3, top: '50%', left: '48%', title: 'Pintasan Modul Keuangan & Stok', desc: 'Catat kas, tambah restock barang masuk, atau buka stok opname fisik' },
        { number: 4, top: '78%', left: '48%', title: 'Indikator Keyboard Shortcut', desc: 'Gunakan tombol panah Atas/Bawah dan Enter untuk navigasi tanpa mouse' }
      ]
    },
    steps: [
      {
        number: 1,
        title: 'Tekan Tombol Pintas Keyboard "Ctrl+K" atau "/"',
        description: 'Di halaman dashboard mana saja, tekan kombinasi tombol keyboard Ctrl+K (atau tombol "/") untuk memunculkan kotak Omnibox di tengah layar.',
        highlightText: 'Shortcut Keyboard Ctrl+K'
      },
      {
        number: 2,
        title: 'Ketik Nomor Plat atau Nama Pelanggan',
        description: 'Ketik beberapa huruf atau angka (contoh: "1822" atau "Budi"). Hasil pencarian mobil yang sedang dikerjakan akan muncul seketika.',
        highlightText: 'Ketik Kata Kunci Pencarian'
      },
      {
        number: 3,
        title: 'Tekan Enter untuk Langsung Membuka Halaman',
        description: 'Gunakan tombol panah panah atas/bawah pada keyboard untuk memilih dan tekan Enter. Halaman detail RO terkait akan terbuka langsung.',
        highlightText: 'Navigasi Keyboard Enter'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Ergonomi Operasional Cepat',
      content: 'Mekanik dan kasir yang menguasai shortcut Ctrl+K dapat melayani antrean kendaraan 2x lebih cepat tanpa perlu menyentuh mouse.'
    }
  }
];

export const DOCS_FAQS = [
  {
    id: 'faq-offline',
    category: 'Jaringan & Operasional',
    question: 'Bagaimana jika koneksi internet di bengkel tiba-tiba lambat atau mati?',
    answer: 'Aplikasi bengkel dirancang dengan arsitektur Progressive Web App (PWA) dan optimasi lightweight. Halaman-halaman statis dan buku panduan tetap dapat diakses secara offline melalui cache lokal browser. Untuk data servis dan upload foto, mekanik dapat menjepret foto terlebih dahulu; sistem akan mengompresinya secara lokal di memori HP hingga 90%, lalu secara otomatis mengunggahnya begitu sinyal kembali stabil.',
    steps: [
      'Gunakan tombol "Buka Kamera (Jepret)" langsung di dalam aplikasi.',
      'Sistem mengompresi foto dari 5 MB menjadi <300 KB di memori ponsel mekanik sebelum upload.',
      'Data nota dan histori kasir tersimpan aman di database server lokal/VPS bengkel.'
    ],
    tip: 'Peralatan kasir disarankan terhubung melalui kabel LAN atau Wi-Fi bengkel khusus untuk kecepatan maksimal.'
  },
  {
    id: 'faq-printer',
    category: 'Perangkat Keras Kasir',
    question: 'Printer apa saja yang kompatibel untuk mencetak nota kasir?',
    answer: 'Aplikasi mendukung dua jenis printer standar bengkel otomotif: (1) Printer Kertas Standar A4 (Laser/Inkjet) melalui tombol "Cetak Nota PDF" yang menghasilkan lembar faktur berlogo resmi, dan (2) Printer POS Thermal Mini 58mm atau 80mm via tombol "Cetak Struk Kasir 58mm" yang kompatibel dengan printer bluetooth portabel murah seharga Rp 150.000-an.',
    steps: [
      'Nyalakan Bluetooth di HP atau Komputer Kasir.',
      'Hubungkan ke perangkat printer thermal (contoh: RPP02N, Zijiang, Panda, atau Epson).',
      'Pilih cetak struk kasir 58mm; teks otomatis terformat monospace presisi.'
    ],
    tip: 'Untuk nota garansi resmi 30 hari yang diserahkan ke pelanggan korporasi/mobil mewah, gunakan format Cetak Nota PDF A4.'
  },
  {
    id: 'faq-privacy',
    category: 'Keamanan & Privasi',
    question: 'Apakah orang lain bisa melihat data pribadi pelanggan pada portal pelacakan publik?',
    answer: 'Tidak. Portal pelacakan publik menerapkan jaminan sensor privasi (Zero-Login Privacy Filter). Nama pelanggan disensor dengan tanda bintang (contoh: J*** W******) dan nomor handphone disamarkan (contoh: 0812-****-7890). Pelanggan hanya dapat melihat status pengerjaan, estimasi waktu, dan foto dokumentasi fisik mobil tanpa pernah mengekspos kontak pribadi ke publik.',
    steps: [
      'Buka /cek-status dengan plat nomor mobil.',
      'Periksa badge hijau bertuliskan "Nama & HP Disensor".',
      'Data sensitif seperti rincian rekening kas bengkel dan nomor KTP pelanggan tidak pernah ditampilkan di portal publik.'
    ],
    tip: 'Tautan tracking aman dibagikan melalui grup WhatsApp keluarga pemilik mobil.'
  },
  {
    id: 'faq-stok-minus',
    category: 'Inventaris & Suku Cadang',
    question: 'Kenapa sistem menolak pemasangan suku cadang ke RO dengan peringatan E10?',
    answer: 'Peringatan E10 (Stock Underflow Protection) muncul jika mekanik mencoba memasang suku cadang yang stok fisiknya di sistem tercatat 0 atau kurang dari jumlah yang diminta. Ini adalah fitur keamanan sistem untuk mencegah hilangnya akurasi gudang dan mendeteksi adanya barang yang belum diinput saat penerimaan dari supplier.',
    steps: [
      'Periksa apakah barang baru datang belum diinput oleh kasir/gudang.',
      'Buka menu "+ Tambah Stok Masuk (Restock)" untuk mencatat faktur pembelian barang masuk.',
      'Setelah stok bertambah, kembali ke halaman RO dan pasang sparepart seperti biasa.'
    ],
    tip: 'Jika stok fisik memang ada di rak namun sistem tercatat 0, lakukan penyesuaian cepat melalui menu Stok Opname Fisik.'
  },
  {
    id: 'faq-multi-akun',
    category: 'Akun & Hak Akses',
    question: 'Bagaimana cara mendaftarkan mekanik atau kasir baru agar bisa login?',
    answer: 'Pemilik bengkel (Owner/Admin) dapat mendaftarkan email Google staf melalui menu Pengaturan Pengguna. Staf tidak perlu menghafal kata sandi rumit; mereka cukup mengklik "Login dengan Google" atau menggunakan Mock Login jika sedang dalam tahap pengujian jaringan lokal.',
    steps: [
      'Buka menu Manajemen Staf (Superadmin / Admin Dashboard).',
      'Klik "+ Hubungkan Email ke Bengkel".',
      'Ketik alamat email Google staf dan pilih peran: Mekanik atau Kasir.',
      'Klik Simpan. Staf dapat langsung login di perangkat masing-masing.'
    ],
    tip: 'Setiap peran staf memiliki tampilan antarmuka yang disederhanakan sesuai tugas pokok mereka di lapangan.'
  }
];

export const DOCS_METADATA = {
  title: 'Buku Panduan & Dokumentasi Operasional Terpadu',
  subtitle: 'Bengkel Mobil GPS Motor Kediri',
  version: '2.5.0',
  updatedAt: '2026-10-17',
  totalModules: DOCS_MODULES.length,
  totalFaqs: DOCS_FAQS.length,
  totalRoles: DOCS_ROLES.length
};

/**
 * Helper to search modules and FAQs by query string
 */
export function searchDocs(query = '', selectedRole = 'all') {
  const q = String(query).toLowerCase().trim();

  let filteredModules = DOCS_MODULES;
  if (selectedRole && selectedRole !== 'all' && selectedRole !== 'faq') {
    filteredModules = filteredModules.filter(m => m.role === selectedRole);
  }

  if (q) {
    filteredModules = filteredModules.filter(m => {
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchSummary = m.summary.toLowerCase().includes(q);
      const matchTags = m.tags && m.tags.some(t => t.toLowerCase().includes(q));
      const matchSteps = m.steps && m.steps.some(s => 
        s.title.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q)
      );
      return matchTitle || matchSummary || matchTags || matchSteps;
    });
  }

  let filteredFaqs = DOCS_FAQS;
  if (q) {
    filteredFaqs = filteredFaqs.filter(f => {
      const matchQ = f.question.toLowerCase().includes(q);
      const matchA = f.answer.toLowerCase().includes(q);
      const matchCat = f.category.toLowerCase().includes(q);
      const matchSteps = f.steps && f.steps.some(s => s.toLowerCase().includes(q));
      return matchQ || matchA || matchCat || matchSteps;
    });
  }

  return {
    modules: filteredModules,
    faqs: filteredFaqs,
    totalResults: filteredModules.length + filteredFaqs.length
  };
}
