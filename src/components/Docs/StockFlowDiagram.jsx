import React from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Scale, 
  Package, 
  Truck, 
  Wrench,
  Check
} from 'lucide-react';

export default function StockFlowDiagram({ className = '' }) {
  return (
    <div className={`rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 my-4 ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Alur Pergerakan Stok & Audit Gudang (Stock Flow)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Siklus keluar-masuk sparepart dan rekonsiliasi opname fisik
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
          Mutasi Otomatis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Barang Masuk (IN) */}
        <div className="rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-2">
              <div className="p-1 rounded bg-emerald-200 dark:bg-emerald-800">
                <ArrowDownLeft className="w-4 h-4 text-emerald-800 dark:text-emerald-200" />
              </div>
              <span>1. Restock Barang Masuk (IN)</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Pembelian suku cadang dari distributor/toko onderdil. Mengunggah foto nota faktur supplier.
            </p>
          </div>
          <div className="p-2 rounded bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 text-center">
            Stok Baru = Stok Lama + Qty Masuk
          </div>
        </div>

        {/* Card 2: Pemakaian Servis (OUT) */}
        <div className="rounded border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-xs mb-2">
              <div className="p-1 rounded bg-blue-200 dark:bg-blue-800">
                <ArrowUpRight className="w-4 h-4 text-blue-800 dark:text-blue-200" />
              </div>
              <span>2. Pemakaian Servis (OUT)</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Mekanik memasang part ke Repair Order mobil. Stok otomatis terpotong saat dipasang, dan kembali utuh jika dibatalkan.
            </p>
          </div>
          <div className="p-2 rounded bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 text-center">
            Stok Baru = Stok Lama - Qty Pakai
          </div>
        </div>

        {/* Card 3: Stok Opname (ADJUSTMENT) */}
        <div className="rounded border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-bold text-xs mb-2">
              <div className="p-1 rounded bg-purple-200 dark:bg-purple-800">
                <Scale className="w-4 h-4 text-purple-800 dark:text-purple-200" />
              </div>
              <span>3. Audit Stok Opname</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Mencocokkan hitungan fisik rak dengan data komputer. Deteksi kehilangan, kerusakan, dan koreksi saldo awal.
            </p>
          </div>
          <div className="p-2 rounded bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 text-[11px] font-mono font-semibold text-purple-700 dark:text-purple-400 text-center">
            Stok Sistem = Stok Fisik di Rak
          </div>
        </div>
      </div>
    </div>
  );
}
