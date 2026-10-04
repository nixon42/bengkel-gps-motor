/**
 * Comprehensive Test Fixtures for Bengkel Mobil GPS Motor Kediri
 * Covers Tiers 1-4: Tenants, Mock Users, Spareparts, Repair Orders,
 * Financial Cashflow, and Boundary/Edge Case Vectors.
 */

export const FIXTURES = {
  // 1. Tenants
  tenants: {
    gpsMotor: {
      slug: 'bengkel-gps-motor',
      name: 'Bengkel Mobil GPS Motor Kediri',
      address: 'Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur',
      phoneWa: '0856-0330-7330',
      businessHours: 'Senin - Sabtu: 08:00 - 17:00 WIB',
      monthlyRevenueTarget: 15000000,
      invoiceFooter: 'Terima kasih telah mempercayakan kendaraan Anda pada Bengkel GPS Motor Kediri.'
    },
    berkahKediri: {
      slug: 'bengkel-berkah-kediri',
      name: 'Bengkel Berkah Kediri',
      address: 'Jl. Dhoho No. 45, Kediri, Jawa Timur',
      phoneWa: '0812-3456-7890',
      businessHours: 'Senin - Minggu: 08:30 - 17:00 WIB',
      monthlyRevenueTarget: 20000000,
      invoiceFooter: 'Kepuasan dan keselamatan Anda adalah prioritas kami.'
    }
  },

  // 2. Users
  users: {
    gpsAdmin: {
      email: 'admin@gpsmotor.local',
      name: 'Bambang GPS Motor',
      role: 'operator'
    },
    berkahAdmin: {
      email: 'admin@berkahkediri.local',
      name: 'Berkah Operator',
      role: 'operator'
    }
  },

  // 3. Spareparts Catalog
  spareparts: {
    oliShell: {
      sku: 'OIL-SH-10W40',
      nama: 'Oli Shell Helix HX7 10W-40 (4 Liter)',
      kategori: 'Oli',
      satuan: 'galon',
      stok: 15,
      stokMinimum: 3,
      hargaBeli: 260000,
      hargaJual: 330000,
      supplier: 'PT Shell Indonesia Distributor Kediri'
    },
    busiIridium: {
      sku: 'IGN-BUSI-NGK-IR',
      nama: 'Busi Iridium NGK Laser CPR6EAIX-9S',
      kategori: 'Busi',
      satuan: 'pcs',
      stok: 24,
      stokMinimum: 6,
      hargaBeli: 45000,
      hargaJual: 75000,
      supplier: 'Toko Onderdil Lancar Jaya'
    },
    filterOliAvanza: {
      sku: 'FLT-OLI-AVZ',
      nama: 'Filter Oli Toyota Avanza / Daihatsu Xenia Original',
      kategori: 'Filter',
      satuan: 'pcs',
      stok: 10,
      stokMinimum: 4,
      hargaBeli: 28000,
      hargaJual: 45000,
      supplier: 'Auto2000 Kediri Supply'
    },
    kampasRemDepan: {
      sku: 'BRK-KMP-AVZ-F',
      nama: 'Kampas Rem Depan Brake Pad Avanza 1.3/1.5',
      kategori: 'Rem',
      satuan: 'set',
      stok: 5,
      stokMinimum: 2,
      hargaBeli: 175000,
      hargaJual: 245000,
      supplier: 'Bendix Official Kediri'
    },
    // Edge case E08: Divide-by-zero margin safety (harga beli = 0)
    hibahBonusStiker: {
      sku: 'ACC-STK-BONUS',
      nama: 'Stiker Bengkel GPS Promo (Hibah Supplier)',
      kategori: 'Aksesoris',
      satuan: 'pcs',
      stok: 100,
      stokMinimum: 10,
      hargaBeli: 0,
      hargaJual: 5000,
      supplier: 'Bonus Cetak Percetakan Digital'
    },
    // Edge case E09: Negative margin (harga jual < harga beli)
    cuciGudangRugi: {
      sku: 'CLR-OLI-RUGI',
      nama: 'Oli Mesin Lama Cuci Gudang Rugi',
      kategori: 'Oli',
      satuan: 'liter',
      stok: 4,
      stokMinimum: 2,
      hargaBeli: 90000,
      hargaJual: 60000,
      supplier: 'Stok Lama 2024'
    }
  },

  // 4. Customers & Vehicles
  customers: {
    joko: {
      nama: 'Joko Widodo',
      noHp: '081234567890',
      email: 'joko.kediri@gmail.com',
      alamat: 'Jl. Pemuda No. 12, Gampengrejo, Kediri',
      kendaraan: {
        platNomor: 'AG 1822 AB',
        merekModel: 'Toyota Avanza 1.3 G',
        tahun: 2019,
        warna: 'Hitam Metalik'
      }
    },
    budiShortPlate: {
      nama: 'Budi Santoso',
      noHp: '081987654321',
      alamat: 'Sambiresik, Kediri',
      kendaraan: {
        platNomor: 'AG 1 X', // E03 Short plate
        merekModel: 'Toyota Kijang Innova Reborn',
        tahun: 2021,
        warna: 'Putih'
      }
    },
    slametSingleWord: {
      nama: 'Slamet', // E04 Single word name
      noHp: '085600112233',
      alamat: 'Ngasem, Kediri',
      kendaraan: {
        platNomor: 'B 12 A', // E03 Short plate
        merekModel: 'Daihatsu Xenia 1.3',
        tahun: 2018,
        warna: 'Silver'
      }
    },
    edShortName: {
      nama: 'Ed', // E05 Very short name
      noHp: '087799887766',
      alamat: 'Pare, Kediri',
      kendaraan: {
        platNomor: 'N 1 AA',
        merekModel: 'Honda Jazz RS',
        tahun: 2016,
        warna: 'Kuning'
      }
    }
  },

  // 5. Repair Orders
  repairOrders: {
    standardTuneUp: {
      platNomor: 'AG 1822 AB',
      namaPemilik: 'Joko Widodo',
      noHp: '081234567890',
      merekModel: 'Toyota Avanza 1.3 G',
      tahun: 2019,
      warna: 'Hitam Metalik',
      odometerMasuk: 65420,
      tanggalMasuk: '2026-10-04',
      keluhan: 'Mesin brebet saat akselerasi dan AC terasa kurang dingin saat siang hari',
      mekanikPj: 'Mas Agus Santoso',
      biayaJasa: 150000,
      estimasiSelesai: '2026-10-04 16:00'
    }
  },

  // 6. Cashflow Transactions
  cashflow: {
    incomes: [
      {
        kategori: 'Jasa Servis',
        nominal: 250000,
        tanggal: '2026-10-01',
        deskripsi: 'Tune Up & Carbon Clean Daihatsu Terios AG 1234 XY',
        metodePembayaran: 'QRIS'
      },
      {
        kategori: 'Penjualan Sparepart',
        nominal: 420000,
        tanggal: '2026-10-02',
        deskripsi: 'Penjualan Oli Shell HX7 1 Galon + Filter Oli',
        metodePembayaran: 'TRANSFER'
      }
    ],
    expenses: [
      {
        kategori: 'Listrik, Air & Internet',
        nominal: 350000,
        tanggal: '2026-10-01',
        deskripsi: 'Tagihan Listrik PLN Bengkel Periode Oktober',
        metodePembayaran: 'TRANSFER'
      },
      {
        kategori: 'Beli Sparepart / Stok',
        nominal: 1200000,
        tanggal: '2026-10-03',
        deskripsi: 'Kulakan Oli dan Busi Iridium Grosir',
        metodePembayaran: 'CASH'
      }
    ]
  },

  // 7. Test Vectors for Masking Algorithms (R6, E01, E03, E04, E05, E06)
  maskingVectors: {
    plates: [
      { raw: 'AG 1234 XX', expectedMasked: 'AG 12** XX', desc: 'Standard 4-digit plate with spaces' },
      { raw: 'AG1234XX', expectedMasked: 'AG 12** XX', desc: 'Plate without spaces (E01)' },
      { raw: 'ag-1234-xx', expectedMasked: 'AG 12** XX', desc: 'Lowercase with hyphens (E01)' },
      { raw: 'AG   1234   XX', expectedMasked: 'AG 12** XX', desc: 'Multiple consecutive spaces (E01)' },
      { raw: 'AG 1 X', expectedMasked: 'AG 1* X', desc: 'Short 1-digit plate (E03)' },
      { raw: 'B 12 A', expectedMasked: 'B 1* A', desc: 'Short 2-digit plate (E03)' },
      { raw: 'N 890 ZZ', expectedMasked: 'N 89* ZZ', desc: '3-digit plate' }
    ],
    names: [
      { raw: 'Budi Santoso', expectedMasked: 'Budi S******', desc: 'Two-word name' },
      { raw: 'Agus Bambang Wijaya', expectedMasked: 'Agus B****** W*****', desc: 'Three-word name' },
      { raw: 'Slamet', expectedMasked: 'Sla***', desc: 'Single word name (E04)' },
      { raw: 'Ed', expectedMasked: 'E*', desc: 'Two-letter name (E05)' },
      { raw: 'Bo', expectedMasked: 'B*', desc: 'Two-letter name (E05)' },
      { raw: 'A', expectedMasked: 'A*', desc: 'Single letter initial (E05)' }
    ]
  }
};

export default FIXTURES;
