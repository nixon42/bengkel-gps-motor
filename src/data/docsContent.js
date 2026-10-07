/**
 * src/data/docsContent.js
 * Comprehensive Documentation and User Guide Data for Bengkel Mobil GPS Motor Kediri
 * Covers: Owner/Admin, Mekanik, Kasir, CRM & Pelanggan, and 5 Operational FAQs.
 */

export const DOCS_ROLES = [
  {
    key: 'owner',
    aliases: ['admin', 'owner'],
    label: 'Owner / Admin',
    badge: 'Manajemen Bengkel',
    color: 'blue',
    description: 'Konfigurasi profil bengkel, manajemen akun staf, pembukuan kas, laba rugi, dan valuasi inventaris sparepart.',
    icon: 'Building2'
  },
  {
    key: 'mekanik',
    aliases: ['mechanic', 'mekanik', 'teknisi'],
    label: 'Mekanik',
    badge: 'Teknis Lapangan',
    color: 'amber',
    description: 'Penerimaan fisik mobil, alur 6-tahap pengerjaan servis, dokumentasi foto Before/Progress/After, dan pemasangan sparepart.',
    icon: 'Wrench'
  },
  {
    key: 'kasir',
    aliases: ['cashier', 'kasir'],
    label: 'Kasir',
    badge: 'Front Office & Keuangan',
    color: 'emerald',
    description: 'Penerbitan RO baru, pembayaran servis, cetak invoice PDF, restock barang masuk dari supplier, dan audit stok opname.',
    icon: 'Wallet'
  },
  {
    key: 'crm',
    aliases: ['crm', 'pelanggan', 'customer'],
    label: 'CRM & Pelanggan',
    badge: 'Relasi Pelanggan',
    color: 'purple',
    description: 'Database pelanggan, riwayat servis mobil, reminder/promo WhatsApp, dan portal pelacakan publik tanpa login dengan sensor privasi.',
    icon: 'Users'
  }
];

export const DOCS_MODULES = [
  // ==========================================
  // OWNER & ADMIN MODULES
  // ==========================================
  {
    id: 'owner-settings',
    slug: 'pengaturan-bengkel',
    role: 'owner',
    title: 'Pengaturan Profil Bengkel & Tenant',
    summary: 'Konfigurasi identitas bengkel, logo, alamat, WhatsApp resmi, jam operasional, target pendapatan bulanan, dan footer nota cetak.',
    readTime: '3 menit',
    badge: 'Owner / Admin',
    tags: ['profil', 'pengaturan', 'alamat', 'whatsapp', 'target', 'omzet', 'jam kerja', 'tenant'],
    steps: [
      {
        number: 1,
        title: 'Buka Modal Pengaturan Workshop',
        description: 'Pada tampilan dashboard utama (AdminDashboard), klik ikon Pengaturan (Settings) di pojok kanan atas topbar atau pilih pintasan Pengaturan Profil Bengkel melalui Command Palette (Ctrl+K).',
        highlightText: 'Tombol Pengaturan di Topbar',
        mockupType: 'settings-header'
      },
      {
        number: 2,
        title: 'Perbarui Data Identitas Bengkel',
        description: 'Isi atau perbarui nama bengkel (Bengkel Mobil GPS Motor Kediri), alamat fisik operasional (Sambiresik, Kec. Gampengrejo, Kab. Kediri), dan nomor WhatsApp resmi (0856-0330-7330). Nomor WhatsApp ini otomatis menjadi kontak rujukan pada portal publik dan invoice PDF.',
        highlightText: 'Form Identitas & WhatsApp',
        mockupType: 'settings-form'
      },
      {
        number: 3,
        title: 'Atur Jam Operasional & Target Pendapatan Bulanan',
        description: 'Tentukan jam buka bengkel (contoh: Senin - Sabtu: 08:00 - 17:00 WIB) dan masukkan target omzet bulanan (contoh: Rp 15.000.000). Target ini menjadi acuan progress bar pencapaian target di widget Dashboard utama.',
        highlightText: 'Target Bulanan & Jam Kerja'
      },
      {
        number: 4,
        title: 'Simpan Perubahan',
        description: 'Klik tombol Simpan Perubahan (ikon Save). Sistem akan memvalidasi data dan menyimpannya secara terisolasi ke database tenant tanpa reload halaman.',
        highlightText: 'Tombol Simpan Perubahan'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Tips Branding WhatsApp',
      content: 'Pastikan nomor WhatsApp yang diinput aktif dan menggunakan format yang mudah dibaca atau standar seluler. Nomor ini akan otomatis menjadi tautan klik-langsung pelanggan dari nota cetak dan portal pelacakan mandiri.'
    }
  },
  {
    id: 'owner-staff',
    slug: 'manajemen-staf',
    role: 'owner',
    title: 'Manajemen Staf & Hak Akses Pengguna',
    summary: 'Menambahkan akun staf baru, menetapkan peran operator (kasir/mekanik) atau superadmin, serta mengelola izin akses workspace.',
    readTime: '4 menit',
    badge: 'Owner / Admin',
    tags: ['staf', 'pengguna', 'user', 'karyawan', 'role', 'operator', 'superadmin', 'izin'],
    steps: [
      {
        number: 1,
        title: 'Akses Portal Kelola Staf / Superadmin',
        description: 'Owner dapat mengakses menu manajemen pengguna melalui tombol Superadmin di footer landing page atau tab pengelolaan staf internal.',
        highlightText: 'Menu Staf / Superadmin'
      },
      {
        number: 2,
        title: 'Buka Form Tambah Pengguna',
        description: 'Klik tombol Tambahkan Pengguna ke Tenant. Masukkan alamat email pengguna Google atau email aktif staf serta nama lengkap teknisi atau kasir.',
        highlightText: 'Form Tambah Akun'
      },
      {
        number: 3,
        title: 'Pilih Role & Hak Akses',
        description: 'Tentukan hak akses akun: pilih Operator untuk staf teknisi/mekanik dan kasir yang menjalankan operasional bengkel harian, atau Superadmin untuk pemilik dan manajer pengawas.',
        highlightText: 'Pilihan Role Operator / Superadmin'
      },
      {
        number: 4,
        title: 'Simpan dan Aktifkan Akun',
        description: 'Klik tombol Simpan Akun. Staf langsung dapat masuk ke workspace menggunakan tombol Google OAuth Login atau Mock Login yang telah terdaftar.',
        highlightText: 'Simpan Akun'
      }
    ],
    callout: {
      type: 'note',
      title: 'Isolasi Multi-Tenant',
      content: 'Setiap staf yang terdaftar hanya dapat melihat data bengkel tempat ia ditugaskan. Data pesanan servis, stok sparepart, dan buku kas tidak akan pernah bercampur dengan tenant bengkel lain.'
    }
  },
  {
    id: 'owner-finance',
    slug: 'buku-kas-keuangan',
    role: 'owner',
    title: 'Buku Kas Keuangan & Ekspor Laporan Laba Rugi (P&L)',
    summary: 'Mencatat pemasukan dan pengeluaran bengkel, memantau saldo bersih real-time, melampirkan foto nota fisik, dan mengunduh laporan PDF resmi berkop bengkel.',
    readTime: '5 menit',
    badge: 'Owner / Admin',
    diagramType: 'cashflow',
    tags: ['kas', 'keuangan', 'pnl', 'laba rugi', 'pemasukan', 'pengeluaran', 'saldo', 'rekap', 'pdf', 'csv', 'struk'],
    steps: [
      {
        number: 1,
        title: 'Buka Menu Buku Kas & Keuangan',
        description: 'Navigasikan ke tab Buku Kas & Keuangan di dashboard. Perhatikan ringkasan KPI: Total Pemasukan, Total Pengeluaran, dan Saldo Bersih dengan indikator Surplus Kas (hijau) atau Defisit Kas (merah).',
        highlightText: 'Tab Keuangan & KPI Cards',
        mockupType: 'finance-overview'
      },
      {
        number: 2,
        title: 'Pencatatan Transaksi Baru',
        description: 'Klik tombol + Catat Transaksi. Pilih tipe Pemasukan (+) berwarna hijau atau Pengeluaran (-) berwarna merah. Masukkan nominal uang dengan live preview format Rupiah.',
        highlightText: 'Modal Catat Transaksi'
      },
      {
        number: 3,
        title: 'Kategori, Metode Pembayaran & Lampiran Struk',
        description: 'Pilih kategori transaksi (Jasa Servis, Penjualan Sparepart, Beli Sparepart / Stok, Listrik, dsb). Pilih metode bayar: Tunai (CASH), TRANSFER, atau QRIS. Ambil foto nota fisik menggunakan tombol Buka Kamera atau unggah dari Galeri HP.',
        highlightText: 'Metode Pembayaran & Foto Struk'
      },
      {
        number: 4,
        title: 'Filter Periode & Analisis Arus Kas',
        description: 'Gunakan tombol filter periode: Hari Ini, Minggu Ini, Bulan Ini, Tahun Ini, atau Semua untuk melihat rincian arus kas pada kurun waktu tertentu.',
        highlightText: 'Filter Periode Transaksi'
      },
      {
        number: 5,
        title: 'Ekspor Laporan Resmi (CSV & PDF)',
        description: 'Klik tombol P&L PDF untuk mencetak dokumen Laporan Laba Rugi resmi berkop bengkel, tombol Rekap Harian untuk rekap kas penutupan shift kasir, atau tombol CSV untuk pembukuan Excel.',
        highlightText: 'Tombol Ekspor P&L PDF & CSV'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Otomatisasi Pendapatan Servis',
      content: 'Saat pesanan servis (RO) diselesaikan ke status DIAMBIL oleh kasir, sistem menyediakan opsi otomatis mencatat tagihan ke Buku Kas sebagai pemasukan jasa dan penjualan part tanpa perlu input manual dua kali.'
    }
  },
  {
    id: 'owner-inventory',
    slug: 'katalog-inventaris',
    role: 'owner',
    title: 'Katalog Inventaris Sparepart, Batas Minimum & Valuasi Nilai',
    summary: 'Manajemen katalog suku cadang mobil, kode SKU, batas stok minimum, kalkulator margin keuntungan live, dan valuasi aset gudang.',
    readTime: '4 menit',
    badge: 'Owner / Admin',
    diagramType: 'stock',
    tags: ['inventaris', 'sparepart', 'stok', 'sku', 'margin', 'laba', 'valuasi', 'batas minimum', 'katalog'],
    steps: [
      {
        number: 1,
        title: 'Buka Halaman Inventaris & Sparepart',
        description: 'Buka tab Inventaris & Sparepart. Daftar seluruh suku cadang tampil lengkap dengan foto, kode SKU, kategori, stok aktual, harga beli, dan harga jual.',
        highlightText: 'Tab Inventaris'
      },
      {
        number: 2,
        title: 'Tambah Sparepart Baru',
        description: 'Klik tombol Tambah Sparepart. Masukkan Kode / SKU unik (contoh: OIL-HX7), Nama Barang (contoh: Oli Shell Helix HX7 10W-40 4L), dan pilih Kategori yang sesuai.',
        highlightText: 'Modal Tambah Sparepart'
      },
      {
        number: 3,
        title: 'Atur Batas Stok Minimum & Kalkulasi Margin Laba',
        description: 'Tentukan Batas Minimum Stok (default: 5 unit). Masukkan Harga Beli (Modal) dan Harga Jual. Kotak Live Profit Margin Box akan langsung menghitung nominal margin rupiah dan persentase laba secara real-time. Jika harga jual lebih rendah dari harga modal, kotak berubah merah dengan peringatan Posisi Jual Rugi (Loss).',
        highlightText: 'Live Margin Calculator'
      },
      {
        number: 4,
        title: 'Cek Valuasi Nilai Aset Gudang',
        description: 'Klik tombol Valuasi Nilai di bagian atas tabel untuk melihat total modal pembelian stok gudang, potensi omzet penjualan, dan potensi keuntungan kotor bengkel. Dokumen valuasi dapat diunduh dalam format CSV maupun dicetak PDF.',
        highlightText: 'Modal Valuasi Nilai'
      }
    ],
    callout: {
      type: 'warning',
      title: 'Peringatan Stok Menipis',
      content: 'Item dengan jumlah stok di bawah batas minimum akan otomatis diberi lencana kuning "Menipis" atau merah "Habis" dan muncul di widget peringatan dashboard untuk segera direstock.'
    }
  },

  // ==========================================
  // MEKANIK (TECHNICIAN) MODULES
  // ==========================================
  {
    id: 'mekanik-intake',
    slug: 'penerimaan-servis-mekanik',
    role: 'mekanik',
    title: 'Penerimaan Fisik Kendaraan & Pembukaan Order Servis (RO)',
    summary: 'Menerima unit mobil di area bengkel, mencatat kilometer odometer, memeriksa keluhan awal pemilik, dan menetapkan teknisi penanggung jawab (PIC).',
    readTime: '3 menit',
    badge: 'Mekanik',
    tags: ['penerimaan', 'intake', 'odometer', 'keluhan', 'mekanik pic', 'servis masuk', 'ro'],
    steps: [
      {
        number: 1,
        title: 'Inspeksi Awal Mobil Tiba',
        description: 'Saat mobil tiba di bengkel, mekanik melakukan pengecekan visual bersama pemilik: catat nomor plat kendaraan, angka odometer pada speedometer, dan dengarkan keluhan utama (contoh: mesin brebet, rem berdecit, AC tidak dingin).',
        highlightText: 'Pengecekan Fisik Mobil'
      },
      {
        number: 2,
        title: 'Buka atau Periksa Order Servis (RO)',
        description: 'Buka tab Servis Mobil (RO) di aplikasi tablet atau smartphone bengkel. Pastikan kartu RO kendaraan sudah dibuat oleh kasir/admin, atau klik + Buat RO Baru jika mekanik bertugas sebagai operator terdepan.',
        highlightText: 'Kartu Repair Order'
      },
      {
        number: 3,
        title: 'Penetapan Mekanik Penanggung Jawab (PIC)',
        description: 'Pilih nama mekanik yang bertanggung jawab mengerjakan perbaikan pada field Mekanik PJ agar riwayat pengerjaan tercatat akurat untuk pembagian insentif bengkel.',
        highlightText: 'Field Mekanik PJ'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Kemudahan di Smartphone HP Kentang',
      content: 'Aplikasi didesain responsive dan ringan tanpa efek blur berat. Mekanik dapat membuka aplikasi langsung dari browser ponsel di area pit bengkel dengan ukuran tombol yang pas di jari (minimal 44x44px).'
    }
  },
  {
    id: 'mekanik-lifecycle',
    slug: 'alur-status-6-tahap',
    role: 'mekanik',
    title: 'Alur Status Servis 6-Tahap & Log Pengerjaan',
    summary: 'Memandu transisi 6 siklus hidup pengerjaan servis: Masuk → Diagnosa → Pengerjaan → Menunggu Part → Selesai → Sudah Diambil dengan pencatatan log waktu dan teknisi.',
    readTime: '5 menit',
    badge: 'Mekanik',
    diagramType: 'ro-lifecycle',
    tags: ['6-tahap', 'lifecycle', 'masuk', 'diagnosa', 'pengerjaan', 'menunggu part', 'selesai', 'diambil', 'status'],
    steps: [
      {
        number: 1,
        title: 'Tahap 1: MASUK (Unit Tiba)',
        description: 'Status awal saat mobil baru diterima di bengkel. Mobil terdaftar di antrean tunggu servis.',
        highlightText: 'Status MASUK'
      },
      {
        number: 2,
        title: 'Tahap 2: DIAGNOSA / PEMERIKSAAN',
        description: 'Mekanik melakukan scan scanner OBD2, pengecekan kompresi, uji emisi, atau cek kelistrikan untuk menemukan sumber kerusakan pasti.',
        highlightText: 'Status DIAGNOSA'
      },
      {
        number: 3,
        title: 'Tahap 3: PENGERJAAN (Servis Aktif)',
        description: 'Mekanik mulai membongkar komponen, melakukan tune up, perbaikan mesin, kuras oli, atau pergantian suku cadang.',
        highlightText: 'Status PENGERJAAN'
      },
      {
        number: 4,
        title: 'Tahap 4: MENUNGGU PART (Opsional)',
        description: 'Jika suku cadang langka harus dipesan inden dari distributor, pindahkan status ke Menunggu Part agar pelanggan mengetahui penyebab jeda pengerjaan.',
        highlightText: 'Status MENUNGGU_PART'
      },
      {
        number: 5,
        title: 'Tahap 5: SELESAI (Uji Jalan / Quality Control)',
        description: 'Perbaikan tuntas, mobil diuji jalan (test drive), dibersihkan, dan dinyatakan siap diserahkan kepada pemilik.',
        highlightText: 'Status SELESAI'
      },
      {
        number: 6,
        title: 'Tahap 6: DIAMBIL (Serah Terima & Selesai)',
        description: 'Kunci diserahkan, nota dilunasi di kasir, dan pembayaran dicatat ke buku kas. Order servis resmi ditutup.',
        highlightText: 'Status DIAMBIL'
      }
    ],
    callout: {
      type: 'note',
      title: 'Transparansi Real-Time ke Pelanggan',
      content: 'Setiap kali status diubah oleh mekanik, pelanggan yang mengecek plat nomor di portal publik atau menerima link WhatsApp dapat melihat perubahan tahap secara instan detik itu juga.'
    }
  },
  {
    id: 'mekanik-photos',
    slug: 'dokumentasi-foto-servis',
    role: 'mekanik',
    title: 'Dokumentasi Foto Pengerjaan (Before, Progress, After)',
    summary: 'Mengambil foto kondisi mobil dan sparepart rusak langsung dari kamera HP, kompresi otomatis client-side, dan publikasi transparan ke pelanggan.',
    readTime: '4 menit',
    badge: 'Mekanik',
    tags: ['foto', 'kamera', 'before', 'progress', 'after', 'dokumentasi', 'kompresi', 'upload'],
    steps: [
      {
        number: 1,
        title: 'Buka Bagian Dokumentasi Foto pada Detail RO',
        description: 'Scroll ke bagian Dokumentasi Foto Servis (Transparansi Pelanggan) pada halaman rincian order servis mobil.',
        highlightText: 'Section Dokumentasi Foto'
      },
      {
        number: 2,
        title: 'Ambil Foto dari Kamera Langsung',
        description: 'Klik tombol Buka Kamera (Jepret) berwarna biru untuk langsung membuka lensa kamera ponsel tanpa perlu membuka galeri terpisah.',
        highlightText: 'Tombol Buka Kamera'
      },
      {
        number: 3,
        title: 'Pilih Kategori Tahap Foto & Tulis Keterangan',
        description: 'Pilih tahap foto: BEFORE (kondisi awal komponen rusak/kotor), PROGRESS (proses pembongkaran/pengerjaan), atau AFTER (komponen baru terpasang bersih). Tulis keterangan singkat seperti "Kampas rem depan aus tersisa 1mm".',
        highlightText: 'Pilihan Tahap Foto & Caption'
      },
      {
        number: 4,
        title: 'Unggah Foto dengan Kompresi Otomatis',
        description: 'Klik tombol Unggah Foto. Modul cerdas imageCompressor.js otomatis mengompres foto resolusi tinggi menjadi ~100KB dalam hitungan milidetik sehingga unggah berlangsung kilat meski sinyal bengkel lambat.',
        highlightText: 'Tombol Unggah Foto'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Hemat Kuota Internet Bengkel',
      content: 'Foto dikompresi di memori browser HP sebelum dikirim ke server. Anda tidak perlu khawatir kuota internet bengkel habis atau proses upload macet saat memotret banyak sparepart.'
    }
  },
  {
    id: 'mekanik-parts',
    slug: 'pemakaian-sparepart-ro',
    role: 'mekanik',
    title: 'Pemasangan & Pelepasan Sparepart ke Repair Order',
    summary: 'Mengambil suku cadang dari inventaris ke pesanan servis dengan pemotongan stok otomatis dan pencatatan mutasi barang keluar.',
    readTime: '3 menit',
    badge: 'Mekanik',
    tags: ['pasang part', 'suku cadang', 'potong stok', 'mutasi out', 'auto-deduct', 'lepas part'],
    steps: [
      {
        number: 1,
        title: 'Buka Kotak Suku Cadang Terpasang',
        description: 'Pada detail RO, lihat tabel Suku Cadang & Sparepart Terpasang. Klik tombol + Pasang Sparepart.',
        highlightText: 'Tombol + Pasang Sparepart'
      },
      {
        number: 2,
        title: 'Pilih Item dari Stok Gudang',
        description: 'Pilih suku cadang dari dropdown katalog. Sistem langsung menampilkan stok aktual yang tersedia di gudang agar mekanik tidak memasang part yang habis.',
        highlightText: 'Pilih Suku Cadang'
      },
      {
        number: 3,
        title: 'Tentukan Jumlah (Qty) & Simpan',
        description: 'Ketik jumlah unit yang dipasang. Harga satuan otomatis diambil dari katalog dengan live preview subtotal tagihan. Klik Pasang Part.',
        highlightText: 'Input Qty & Pasang Part'
      },
      {
        number: 4,
        title: 'Otomatisasi Stok & Pelepasan Part',
        description: 'Saat part terpasang, stok gudang otomatis berkurang dan tercatat di mutasi keluar (OUT). Jika pemasangan dibatalkan, cukup klik tombol Hapus (tong sampah merah) pada baris part terkait, dan stok gudang otomatis dikembalikan utuh.',
        highlightText: 'Pengembalian Stok Otomatis'
      }
    ],
    callout: {
      type: 'note',
      title: 'Sinkronisasi Tagihan Kasir',
      content: 'Setiap sparepart yang ditambahkan oleh mekanik otomatis menjumlahkan nilai tagihan invoice kasir, sehingga kasir tidak perlu menginput ulang saat pelanggan membayar.'
    }
  },

  // ==========================================
  // KASIR (CASHIER) MODULES
  // ==========================================
  {
    id: 'kasir-new-ro',
    slug: 'pembuatan-ro-baru-kasir',
    role: 'kasir',
    title: 'Pembuatan RO Baru & Autocomplete CRM Pelanggan',
    summary: 'Menerbitkan Repair Order baru saat mobil masuk dengan fitur autocomplete otomatis data pemilik, nomor WhatsApp, dan histori mobil pelanggan.',
    readTime: '4 menit',
    badge: 'Kasir',
    tags: ['buat ro', 'order baru', 'autocomplete', 'crm', 'plat nomor', 'pelanggan', 'kasir'],
    steps: [
      {
        number: 1,
        title: 'Klik Tombol Buat RO Baru',
        description: 'Di halaman Servis Mobil (RO), klik tombol + Buat RO Baru di kanan atas layar.',
        highlightText: 'Tombol + Buat RO Baru',
        mockupType: 'new-ro-modal'
      },
      {
        number: 2,
        title: 'Gunakan Autocomplete Nama Pelanggan',
        description: 'Ketik beberapa huruf nama pelanggan di field Nama Pemilik / Pelanggan. Jika pelanggan pernah servis sebelumnya, kotak saran CRM akan muncul menampilkan nama, nomor HP, dan plat mobil. Klik saran tersebut untuk mengisi data secara instan!',
        highlightText: 'CRM Autocomplete Dropdown'
      },
      {
        number: 3,
        title: 'Lengkapi Data Kendaraan & Keluhan',
        description: 'Masukkan Plat Nomor (otomatis huruf kapital, misal: AG 1822 AB), merek/model mobil (Avanza 1.3 G), tahun, warna, kilometer odometer masuk, serta keluhan perbaikan yang diinginkan pemilik.',
        highlightText: 'Data Mobil & Keluhan'
      },
      {
        number: 4,
        title: 'Pilih Estimasi Selesai dengan Preset Cepat',
        description: 'Gunakan tombol preset waktu cepat: Hari ini 17:00, Besok 12:00, Besok 17:00, atau 2 Hari Lagi untuk menentukan janji selesai perbaikan tanpa repot mengetik kalender manual.',
        highlightText: 'Preset Estimasi Waktu'
      },
      {
        number: 5,
        title: 'Terbitkan Repair Order',
        description: 'Klik Buat Repair Order. Sistem menerbitkan nomor registrasi unik (contoh: RO-20261007-0001) lengkap dengan token pelacakan online mandiri.',
        highlightText: 'Tombol Buat RO'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Cepat Tanpa Ketik Ulang',
      content: 'Fitur autocomplete CRM menghilangkan kesalahan ketik nomor HP pelanggan lama dan mempercepat proses penerimaan antrean kendaraan saat jam sibuk bengkel.'
    }
  },
  {
    id: 'kasir-payment',
    slug: 'pembayaran-dan-pelunasan-kas',
    role: 'kasir',
    title: 'Perhitungan Biaya, Diskon & Pelunasan Kas Otomatis',
    summary: 'Menyesuaikan ongkos jasa kerja, memberikan potongan diskon nota, dan menutup RO dengan auto-record pembayaran ke buku kas.',
    readTime: '3 menit',
    badge: 'Kasir',
    tags: ['pembayaran', 'diskon', 'biaya jasa', 'pelunasan', 'kas masuk', 'qris', 'tunai', 'transfer'],
    steps: [
      {
        number: 1,
        title: 'Periksa Rincian Biaya & Tagihan',
        description: 'Buka rincian order servis. Kotak tagihan menampilkan Subtotal Biaya Jasa, Subtotal Suku Cadang, Potongan / Diskon, dan TOTAL BIAYA bersih.',
        highlightText: 'Kotak Rincian Biaya'
      },
      {
        number: 2,
        title: 'Ubah Biaya Jasa atau Beri Diskon',
        description: 'Jika ada penyesuaian tarif jasa atau promo khusus, klik tombol Edit Jasa. Masukkan nominal jasa akhir dan nilai diskon potongan, lalu simpan.',
        highlightText: 'Tombol Edit Jasa & Diskon'
      },
      {
        number: 3,
        title: 'Proses Serah Terima & Pelunasan',
        description: 'Klik tombol Update Status dan pilih status 6. Diambil. Centang opsi Catat otomatis ke Buku Kas sebagai Pemasukan, lalu pilih metode pembayaran pelanggan (QRIS, Tunai CASH, atau Transfer).',
        highlightText: 'Status 6. Diambil & Auto-Record Kas'
      },
      {
        number: 4,
        title: 'Simpan Status Penutupan Order',
        description: 'Klik Simpan Status. Order servis resmi berstatus lunas dan uang pembayaran langsung tercatat di Buku Kas bengkel pada hari itu.',
        highlightText: 'Simpan Status Pelunasan'
      }
    ],
    callout: {
      type: 'tip',
      title: 'QRIS & Non-Tunai',
      content: 'Kasir dapat mengarahkan pelanggan membayar via QRIS. Pembayaran langsung tercatat dengan metode bayar QRIS pada rekap kas harian untuk memudahkan rekonsiliasi mutasi rekening bank bengkel.'
    }
  },
  {
    id: 'kasir-invoice',
    slug: 'cetak-invoice-nota-pdf',
    role: 'kasir',
    title: 'Cetak Invoice / Nota PDF Resmi Siap Cetak',
    summary: 'Menerbitkan faktur resmi berkop Bengkel Mobil GPS Motor Kediri, lengkap dengan rincian suku cadang, jasa teknisi, data kendaraan, dan catatan garansi.',
    readTime: '3 menit',
    badge: 'Kasir',
    tags: ['cetak nota', 'invoice', 'pdf', 'faktur', 'print', 'garansi', 'kop bengkel'],
    steps: [
      {
        number: 1,
        title: 'Buka Dokumen Nota dari RO',
        description: 'Dari daftar order servis maupun dari halaman detail RO, klik tombol Cetak Nota PDF (ikon dokumen merah).',
        highlightText: 'Tombol Cetak Nota PDF'
      },
      {
        number: 2,
        title: 'Preview Faktur PDF Berkop Bengkel',
        description: 'Browser otomatis membuka dokumen PDF beresolusi tinggi dengan kop resmi Bengkel Mobil GPS Motor Kediri, alamat Sambiresik Gampengrejo Kediri, WhatsApp, data mobil & pemilik, nomor RO, rincian sparepart & jasa, total bayar, serta catatan garansi servis.',
        highlightText: 'Tampilan PDF Faktur'
      },
      {
        number: 3,
        title: 'Cetak ke Printer atau Simpan File',
        description: 'Tekan Ctrl+P untuk mencetak langsung ke printer kasir (kertas A4 atau continuous thermal), atau klik ikon unduh untuk mengirimkan file PDF ke WhatsApp pelanggan.',
        highlightText: 'Cetak / Unduh PDF'
      }
    ],
    callout: {
      type: 'note',
      title: 'Cetak Ulang Tanpa Batas',
      content: 'Jika nota fisik hilang oleh pelanggan, kasir dapat mencetak ulang kapan saja dari arsip daftar Servis Mobil tanpa mengubah data riwayat pembukuan.'
    }
  },
  {
    id: 'kasir-restock',
    slug: 'restock-barang-masuk',
    role: 'kasir',
    title: 'Pencatatan Restock Barang Masuk dari Supplier',
    summary: 'Mencatat pembelian suku cadang baru dari toko onderdil atau supplier, menambah stok inventaris secara otomatis, dan mengunggah foto nota faktur.',
    readTime: '4 menit',
    badge: 'Kasir',
    diagramType: 'stock',
    tags: ['restock', 'barang masuk', 'supplier', 'faktur', 'mutasi in', 'beli stok', 'foto nota'],
    steps: [
      {
        number: 1,
        title: 'Buka Tab Mutasi Stok',
        description: 'Navigasikan ke menu Mutasi Stok di dashboard. Riwayat seluruh pergerakan barang (Masuk, Keluar, Opname) tertata rapi.',
        highlightText: 'Tab Mutasi Stok'
      },
      {
        number: 2,
        title: 'Buka Form Barang Masuk (Restock)',
        description: 'Klik tombol + Barang Masuk (Restock). Pilih item sparepart dari katalog barang, tentukan tanggal pembelian, dan jumlah unit yang masuk (Qty).',
        highlightText: 'Modal Barang Masuk'
      },
      {
        number: 3,
        title: 'Isi Informasi Faktur Pembelian (Fleksibel)',
        description: 'Masukkan nama supplier (contoh: Toko Onderdil Jaya Kediri), nomor faktur pembelian, dan harga beli satuan. Field ini fleksibel dan tidak memberatkan jika faktur tidak lengkap.',
        highlightText: 'Form Supplier & Faktur'
      },
      {
        number: 4,
        title: 'Foto Bukti Faktur & Simpan',
        description: 'Jepret foto nota faktur supplier menggunakan tombol kamera HP, lalu klik Simpan Barang Masuk. Stok inventaris bertambah seketika dan mutasi tercatat dengan tipe IN.',
        highlightText: 'Simpan Barang Masuk'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Foto Faktur Rapi',
      content: 'Gunakan pencahayaan yang cukup saat memotret faktur kertas supplier agar rincian nomor surat jalan dan tanggal pembelian tetap terbaca jelas untuk arsip audit.'
    }
  },
  {
    id: 'kasir-opname',
    slug: 'pelaksanaan-stok-opname',
    role: 'kasir',
    title: 'Pelaksanaan Stok Opname Fisik Gudang',
    summary: 'Audit berkala mencocokkan stok fisik di rak gudang dengan data komputer sistem, deteksi selisih otomatis, dan penyesuaian saldo stok.',
    readTime: '4 menit',
    badge: 'Kasir',
    diagramType: 'stock',
    tags: ['stok opname', 'audit', 'rekonsiliasi', 'selisih', 'fisik vs sistem', 'hilang', 'pecah', 'penyesuaian'],
    steps: [
      {
        number: 1,
        title: 'Buka Menu Stok Opname',
        description: 'Masuk ke tab Stok Opname di dashboard bengkel.',
        highlightText: 'Tab Stok Opname'
      },
      {
        number: 2,
        title: 'Pilih Sparepart yang Diaudit',
        description: 'Pilih item suku cadang dari dropdown. Sistem menampilkan angka Stok Sistem Saat Ini (catatan komputer).',
        highlightText: 'Pilih Sparepart'
      },
      {
        number: 3,
        title: 'Hitung dan Input Stok Fisik Aktual',
        description: 'Hitung jumlah barang nyata yang ada di rak gudang, lalu ketik angka tersebut di kolom Stok Fisik Aktual di Rak. Sistem menghitung selisih secara otomatis: jika kurang muncul badge merah Defisit, jika lebih muncul badge hijau Surplus, dan jika sama muncul badge biru Cocok Sempurna.',
        highlightText: 'Input Stok Fisik & Indikator Selisih'
      },
      {
        number: 4,
        title: 'Pilih Alasan Penyesuaian & Simpan',
        description: 'Pilih alasan menggunakan tombol preset cepat (misal: "Barang Rusak / Pecah di Rak", "Audit Rutin Bulanan", "Selisih Hitung Restock Sebelumnya"). Klik Simpan Penyesuaian Stok Opname. Angka stok sistem seketika diselaraskan dengan kondisi fisik rak.',
        highlightText: 'Tombol Simpan Penyesuaian'
      }
    ],
    callout: {
      type: 'warning',
      title: 'Pencatatan Audit Transparan',
      content: 'Setiap penyesuaian stok opname otomatis tercatat sebagai mutasi bertipe ADJUSTMENT lengkap dengan nama operator, tanggal, selisih jumlah, dan alasan tertulis demi mencegah kecurangan gudang.'
    }
  },

  // ==========================================
  // CRM & PELANGGAN MODULES
  // ==========================================
  {
    id: 'crm-database',
    slug: 'database-pelanggan-crm',
    role: 'crm',
    title: 'Database Pelanggan & Riwayat Servis Kendaraan',
    summary: 'Mengelola daftar pelanggan bengkel, mencatat lebih dari satu kendaraan per pemilik, dan meninjau histori perawatan berkala di masa lalu.',
    readTime: '3 menit',
    badge: 'CRM & Pelanggan',
    tags: ['crm', 'pelanggan', 'riwayat', 'histori', 'database', 'multi kendaraan', 'whatsapp'],
    steps: [
      {
        number: 1,
        title: 'Buka Menu Pelanggan CRM',
        description: 'Pilih tab Pelanggan CRM di dashboard. Seluruh kontak pelanggan tercantum dengan indikator jumlah kunjungan servis (X kali Servis), nomor WhatsApp, dan tanggal servis terakhir.',
        highlightText: 'Tab Pelanggan CRM'
      },
      {
        number: 2,
        title: 'Kelola Kendaraan Pelanggan',
        description: 'Jika pelanggan memiliki lebih dari satu mobil (contoh: Avanza dan Innova), staf dapat menambahkan unit mobil baru langsung dari kartu pelanggan.',
        highlightText: 'Tambah Mobil Pelanggan'
      },
      {
        number: 3,
        title: 'Buka Modal Riwayat Servis',
        description: 'Klik tombol Riwayat (ikon History) untuk melihat linimasa seluruh order perbaikan masa lalu kendaraan tersebut lengkap dengan tanggal, keluhan, biaya, dan part yang pernah diganti.',
        highlightText: 'Modal Riwayat Servis'
      }
    ],
    callout: {
      type: 'tip',
      title: 'Diagnosa Lebih Akurat',
      content: 'Dengan memeriksa riwayat servis masa lalu, mekanik dapat mengetahui riwayat penggantian oli dan part sebelumnya untuk mendiagnosa masalah kendaraan secara lebih presisi.'
    }
  },
  {
    id: 'crm-whatsapp',
    slug: 'pengingat-dan-promo-whatsapp',
    role: 'crm',
    title: 'Pengiriman Pesan WhatsApp Promosi & Pengingat Servis',
    summary: 'Kirim pesan promosi berkala, pengingat jadwal ganti oli rutin, dan follow-up kepuasan pelanggan langsung ke WhatsApp pelanggan dalam satu klik.',
    readTime: '3 menit',
    badge: 'CRM & Pelanggan',
    tags: ['whatsapp', 'blast', 'promo', 'reminder', 'pengingat', 'follow-up', 'ganti oli'],
    steps: [
      {
        number: 1,
        title: 'Pilih Pelanggan & Klik Kirim Promo WA',
        description: 'Di tabel Pelanggan CRM, klik tombol Kirim Promo WA pada baris pelanggan yang ingin dihubungi.',
        highlightText: 'Tombol Kirim Promo WA'
      },
      {
        number: 2,
        title: 'Pilih Template Pesan Siap Pakai',
        description: 'Pilih salah satu dari 3 template otomatis: PROMO (penawaran diskon jasa servis 15% & gratis cek 25 titik), REMINDER (pengingat perawatan berkala dan ganti oli rutin), atau FOLLOWUP (menanyakan kenyamanan berkendara pasca servis).',
        highlightText: 'Pilihan Template WA'
      },
      {
        number: 3,
        title: 'Kustomisasi Pesan & Kirim via WhatsApp',
        description: 'Edit teks pesan jika ingin menambahkan catatan khusus. Klik Kirim via WhatsApp. Aplikasi langsung membuka WhatsApp Web atau aplikasi WhatsApp dengan pesan dan nomor tujuan internasional (62...) yang telah terisi rapi!',
        highlightText: 'Tombol Kirim via WhatsApp'
      }
    ],
    callout: {
      type: 'note',
      title: 'Meningkatkan Kunjungan Ulang',
      content: 'Pengingat servis berkala yang dikirimkan 2-3 bulan setelah kunjungan terbukti meningkatkan frekuensi kedatangan pelanggan (retensi) secara signifikan.'
    }
  },
  {
    id: 'crm-tracking',
    slug: 'portal-pelacakan-publik',
    role: 'crm',
    title: 'Portal Publik Pelacakan Servis Tanpa Login (Zero Friction)',
    summary: 'Akses cek status servis langsung via plat nomor dengan proteksi sensor privasi plat dan nama, serta tombol salin link dan share WhatsApp.',
    readTime: '4 menit',
    badge: 'CRM & Pelanggan',
    diagramType: 'ro-lifecycle',
    tags: ['tracking', 'pelacakan', 'cek status', 'plat nomor', 'sensor', 'masking', 'privasi', 'whatsapp', 'tanpa login'],
    steps: [
      {
        number: 1,
        title: 'Akses Alur Pelacakan Mandiri',
        description: 'Pelanggan membuka alamat portal pelacakan bengkel: /:slug/cek-status (atau mengklik tombol Cek Status di header landing page).',
        highlightText: 'Halaman Cek Status Publik'
      },
      {
        number: 2,
        title: 'Cari Berdasarkan Plat Nomor',
        description: 'Ketik plat nomor kendaraan (contoh: AG 1822 AB) di kotak pencarian lalu klik Cek Status. Sistem otomatis menormalkan spasi dan huruf kecil.',
        highlightText: 'Form Pencarian Plat'
      },
      {
        number: 3,
        title: 'Perlindungan Privasi Terjamin (Sensor Masking)',
        description: 'Demi menjaga kerahasiaan identitas pemilik mobil di internet terbuka, plat nomor disamarkan (contoh: AG 18** AB) dan nama pelanggan disensor otomatis (contoh: Budi S******). Nomor telepon, alamat, dan harga modal sparepart dihilangkan total dari respon sistem.',
        highlightText: 'Sensor Privasi Plat & Nama'
      },
      {
        number: 4,
        title: 'Pantau 6-Tahap, Foto & Berbagi Link',
        description: 'Pelanggan dapat melihat linimasa tahapan servis, estimasi jam selesai, foto pengerjaan Before/Progress/After teknisi, serta mengklik tombol Salin Link Tracking atau Share via WhatsApp ke keluarga.',
        highlightText: 'Linimasa Progres & Tombol Share'
      }
    ],
    callout: {
      type: 'note',
      title: 'Standar Keamanan Privasi',
      content: 'Algoritma adaptive masking memastikan data pribadi pelanggan tetap terlindungi meski tautan pelacakan dibuka oleh orang lain tanpa login.'
    }
  }
];

export const DOCS_FAQS = [
  {
    id: 'faq-stock-discrepancy',
    question: 'Apa yang harus dilakukan jika stok fisik tidak sesuai dengan stok sistem?',
    category: 'Inventaris & Gudang',
    badge: 'Stok Opname',
    answer: 'Perbedaan antara stok nyata di rak dan catatan sistem dapat terjadi karena barang rusak, salah hitung saat restock, atau part terpakai yang belum tercatat. Masalah ini diselesaikan melalui menu Stok Opname:',
    steps: [
      'Buka menu Stok Opname di menu navigasi utama dashboard.',
      'Pilih sparepart yang bermasalah pada dropdown pemilihan barang.',
      'Periksa nilai Stok Sistem Saat Ini yang tampil di layar.',
      'Ketik jumlah aktual hasil hitung tangan di rak pada kolom Stok Fisik Aktual di Rak.',
      'Perhatikan indikator selisih (merah untuk Defisit, hijau untuk Surplus).',
      'Pilih alasan penyesuaian (misal: "Barang Rusak / Pecah di Rak" atau "Audit Rutin Bulanan").',
      'Klik Simpan Penyesuaian Stok Opname. Stok sistem langsung diperbarui dan mutasi tercatat untuk rekap audit.'
    ],
    tip: 'Lakukan stok opname berkala setiap akhir pekan atau akhir bulan untuk menjaga akurasi pembukuan.'
  },
  {
    id: 'faq-void-cash',
    question: 'Bagaimana cara membatalkan atau mengoreksi transaksi kas yang salah input?',
    category: 'Keuangan & Buku Kas',
    badge: 'Koreksi Kas',
    answer: 'Jika kasir salah mengetik nominal (misal Rp 500.000 terketik Rp 5.000.000) atau salah memilih kategori, Anda dapat mengoreksi atau menghapusnya langsung dari menu Buku Kas & Keuangan:',
    steps: [
      'Masuk ke tab Buku Kas & Keuangan.',
      'Gunakan kolom pencarian transaksi atau filter periode untuk menemukan transaksi yang keliru.',
      'Untuk Mengoreksi: Klik ikon Pensil (Edit) pada baris transaksi. Ubah nominal, kategori, metode bayar, atau deskripsi, lalu klik Perbarui Transaksi. Saldo kas langsung disesuaikan.',
      'Untuk Membatalkan / Menghapus: Klik ikon Tong Sampah (Hapus) pada transaksi yang keliru. Konfirmasi kotak dialog yang muncul. Catatan transaksi terhapus dan saldo bersih langsung dihitung ulang.',
      'Catatan untuk RO Servis: Menghapus catatan transaksi di Buku Kas tidak akan menghapus data pengerjaan fisik atau riwayat teknis Repair Order terkait.'
    ],
    tip: 'Pastikan bukti nota fisik disimpan di laci kasir sebagai arsip rekonsiliasi jika terjadi koreksi nominal besar.'
  },
  {
    id: 'faq-switch-mechanic',
    question: 'Bagaimana cara mengganti mekanik PIC pada RO yang sedang berjalan?',
    category: 'Servis Mobil & RO',
    badge: 'Penugasan Teknisi',
    answer: 'Jika mekanik yang ditugaskan berhalangan hadir, sakit, atau terjadi pergantian shift kerja di tengah servis:',
    steps: [
      'Buka menu Servis Mobil (RO) dan klik kartu order kendaraan yang bersangkutan.',
      'Pada komponen tahapan pengerjaan, klik tombol Update Status.',
      'Pilih tahapan saat ini (atau tahapan berikutnya).',
      'Pada kolom Catatan Pengerjaan, tuliskan keterangan handover teknisi secara jelas (contoh: "Handover PIC: Dilanjutkan Mas Budi Santoso karena pergantian shift kerja siang").',
      'Klik Simpan Status. Log serah terima tersimpan permanen di linimasa Riwayat Transisi Status lengkap dengan jam dan nama operator penanggung jawab.',
      'Admin juga dapat memperbarui nama mekanik PJ utama pada formulir order servis agar tercetak rapi di nota invoice akhir.'
    ],
    tip: 'Pencatatan serah terima tugas di catatan pengerjaan penting agar tidak terjadi salah paham terkait garansi servis.'
  },
  {
    id: 'faq-lost-receipt-tracking',
    question: 'Bagaimana jika pelanggan kehilangan nota atau ingin mengecek status lewat HP?',
    category: 'Pelayanan Pelanggan',
    badge: 'Tracking & Nota',
    answer: 'Aplikasi Bengkel Mobil GPS Motor Kediri menyediakan 3 solusi mudah tanpa perlu repot mengetik ulang dokumen:',
    steps: [
      'Solusi 1 (Cek Mandiri di HP): Berikan link tracking bengkel: /[slug]/cek-status. Pelanggan cukup mengetik plat nomor mobilnya dari rumah. Mereka dapat melihat tahapan servis, estimasi jam selesai, dan foto pengerjaan tanpa perlu login.',
      'Solusi 2 (Kirim Link via WhatsApp): Buka rincian RO di dashboard, lalu klik tombol Kirim WA. Sistem otomatis menyusun pesan ramah berisi nomor RO, status servis, dan link pelacakan unik ke chat WhatsApp pelanggan.',
      'Solusi 3 (Cetak Ulang Nota PDF): Buka menu Servis Mobil (RO), cari plat nomor pelanggan, buka detail order, dan klik tombol Cetak Nota PDF. Faktur PDF resmi siap dicetak ulang seketika.'
    ],
    tip: 'Plat nomor dan nama pemilik otomatis disensor di halaman publik sehingga privasi pelanggan tetap aman saat mengecek mandiri.'
  },
  {
    id: 'faq-photo-optimization',
    question: 'Tips optimasi ukuran foto agar upload tetap cepat di koneksi internet bengkel?',
    category: 'Performa & Mobile',
    badge: 'Kompresi Foto',
    answer: 'Koneksi internet bengkel terkadang tidak stabil, sementara kamera ponsel modern menghasilkan file foto raksasa (5MB - 12MB). Sistem kami telah mengantisipasi hal ini dengan teknologi kompresi otomatis:',
    steps: [
      'Kompresi Otomatis Client-Side: Modul imageCompressor.js bawaan aplikasi otomatis mengecilkan foto resolusi tinggi menjadi maksimal 1280px dengan kualitas optimal (~80KB - 120KB) langsung di memori browser sebelum dikirim.',
      'Gunakan Tombol Kamera Langsung: Klik tombol Buka Kamera (Jepret) di dalam aplikasi. Cara ini jauh lebih cepat dibanding memotret dari aplikasi kamera bawaan yang memenuhi memori galeri ponsel.',
      'Pencahayaan Kolong Mesin: Pastikan lampu kerja atau senter menyala saat memotret area bawah kolong mesin atau kaki-kaki mobil agar foto tajam tanpa noise bintik gelap.',
      'Foto Faktur Kertas: Posisikan kamera sejajar dari atas (tegak lurus / flat-lay) saat memotret nota struk pembelian agar tulisan nomor faktur dan nominal terbaca dengan jelas.',
      'Jarak Pemotretan Ideal: Pertahankan jarak 30-50 cm dari komponen mobil agar lensa dapat mengunci fokus dengan tajam.'
    ],
    tip: 'Pengurangan ukuran file mencapai >95% sehingga proses upload selesai dalam 1-2 detik bahkan pada jaringan ponsel 3G.'
  }
];

export const DOCS_METADATA = {
  title: 'Buku Panduan & Dokumentasi Operasional',
  subtitle: 'Bengkel Mobil GPS Motor Kediri',
  version: '2.0.0',
  updatedAt: '2026-10-07',
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
      const matchTags = m.tags.some(t => t.toLowerCase().includes(q));
      const matchSteps = m.steps.some(s => 
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
