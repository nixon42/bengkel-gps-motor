import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  FileSpreadsheet, 
  FileText,
  Equal
} from 'lucide-react';

export default function CashflowDiagram({ className = '' }) {
  return (
    <div className={`rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 my-4 ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Alur Pembukuan Arus Kas & Laporan Keuangan (Cashflow)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sistem pencatatan pemasukan, pengeluaran, saldo bersih, dan dokumen PDF resmi
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
          Akuntansi Flat
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
        {/* Pemasukan */}
        <div className="rounded border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>TOTAL PEMASUKAN (+)</span>
            </div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-3">
              <li>• Pelunasan RO Servis Mobil (auto-income)</li>
              <li>• Penjualan sparepart langsung</li>
              <li>• Pendapatan jasa derek / lain-lain</li>
            </ul>
          </div>
          <div className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded text-center">
            Tunai • Transfer • QRIS
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="rounded border border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold text-xs mb-2">
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>TOTAL PENGELUARAN (-)</span>
            </div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 mb-3">
              <li>• Pembelian sparepart ke supplier</li>
              <li>• Biaya operasional listrik & internet</li>
              <li>• Gaji staf teknisi & kasir bengkel</li>
            </ul>
          </div>
          <div className="text-[10px] font-semibold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 p-1.5 rounded text-center">
            Foto Struk Nota Fisik
          </div>
        </div>

        {/* Saldo Bersih & Laporan */}
        <div className="rounded border border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-xs mb-2">
              <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>SALDO BERSIH & PELAPORAN</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-2">
              Saldo = Pemasukan - Pengeluaran. Otomatis menentukan status Surplus atau Defisit.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <div className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
              P&L PDF Berkop
            </div>
            <div className="p-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
              Export CSV
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
