import React from 'react';
import { Shield, Sparkles, Check, ChevronDown } from 'lucide-react';

export default function AnnotatedCard({ 
  title = 'Simulasi Antarmuka Aplikasi', 
  badge = 'Interactive Mockup', 
  type = 'default',
  steps = [],
  className = '' 
}) {
  return (
    <div className={`rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-none my-4 ${className}`}>
      {/* Window Title Bar */}
      <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-2 truncate max-w-[200px] sm:max-w-none">
            {title}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {badge}
        </span>
      </div>

      {/* Mock Window Content Canvas */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/50">
        {type === 'new-ro-modal' ? (
          <div className="space-y-4 max-w-lg mx-auto bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800">
            {/* Field 1: Autocomplete Customer */}
            <div className="relative border-2 border-dashed border-blue-500 rounded p-2.5 bg-blue-50/40 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                1
              </span>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Pemilik / Pelanggan *
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  readOnly 
                  value="Budi Santoso (0812-3456-7890)" 
                  className="w-full text-xs font-medium px-3 py-2 rounded border border-blue-400 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
                <span className="absolute right-2 top-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  CRM Auto-Match
                </span>
              </div>
            </div>

            {/* Field 2: Plat Nomor */}
            <div className="relative border-2 border-dashed border-blue-500 rounded p-2.5 bg-blue-50/40 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                2
              </span>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Plat Nomor Kendaraan *
              </label>
              <input 
                type="text" 
                readOnly 
                value="AG 1822 AB" 
                className="w-full text-xs font-mono font-bold px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 tracking-wider"
              />
            </div>

            {/* Field 3: Preset Estimasi Waktu */}
            <div className="relative border-2 border-dashed border-blue-500 rounded p-2.5 bg-blue-50/40 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                3
              </span>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preset Estimasi Selesai Cepat
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" className="text-[11px] font-semibold py-1.5 px-2 rounded bg-blue-600 text-white text-center">
                  Hari ini 17:00 ✓
                </button>
                <button type="button" className="text-[11px] font-semibold py-1.5 px-2 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-center">
                  Besok 12:00
                </button>
              </div>
            </div>

            {/* Field 4: Submit */}
            <div className="pt-1">
              <button type="button" className="w-full py-2 rounded bg-blue-600 text-white text-xs font-bold">
                Buat Repair Order (RO)
              </button>
            </div>
          </div>
        ) : type === 'finance-overview' ? (
          <div className="space-y-4 max-w-lg mx-auto bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800">
            {/* KPI Cards */}
            <div className="relative border-2 border-dashed border-blue-500 rounded p-2.5 bg-blue-50/40 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                1
              </span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">Pemasukan</div>
                  <div className="text-xs font-mono font-bold text-emerald-600">Rp 4.850.000</div>
                </div>
                <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                  <div className="text-[10px] text-rose-700 dark:text-rose-300 font-bold">Pengeluaran</div>
                  <div className="text-xs font-mono font-bold text-rose-600">Rp 1.320.000</div>
                </div>
              </div>
            </div>

            {/* Live Net Balance */}
            <div className="relative border-2 border-dashed border-emerald-500 rounded p-2.5 bg-emerald-50/40 dark:bg-emerald-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                2
              </span>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-500">Saldo Bersih (Net)</div>
                  <div className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">Rp 3.530.000</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Surplus Kas ✓
                </span>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="relative border-2 border-dashed border-blue-500 rounded p-2.5 bg-blue-50/40 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                3
              </span>
              <div className="flex space-x-2">
                <span className="flex-1 py-1 px-2 rounded bg-rose-600 text-white text-center text-[11px] font-bold">
                  PDF Laporan P&L
                </span>
                <span className="flex-1 py-1 px-2 rounded bg-emerald-600 text-white text-center text-[11px] font-bold">
                  Export CSV
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Default Simulation Mockup */
          <div className="space-y-3 max-w-lg mx-auto bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-800">
            <div className="relative border-2 border-dashed border-blue-500 rounded p-2.5 bg-blue-50/40 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                1
              </span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Pilih Aksi / Modul
              </div>
              <div className="text-[11px] text-slate-500">
                Navigasi langsung melalui tab dashboard atau shortcut keyboard Ctrl+K
              </div>
            </div>
            <div className="relative border-2 border-dashed border-blue-500 rounded p-2.5 bg-blue-50/40 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                2
              </span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Isi Formulir & Validasi
              </div>
              <div className="text-[11px] text-slate-500">
                Ketik data operasional bengkel secara akurat
              </div>
            </div>
            <div className="relative border-2 border-dashed border-blue-500 rounded p-2.5 bg-blue-50/40 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                3
              </span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Simpan & Otomatisasi
              </div>
              <div className="text-[11px] text-slate-500">
                Data terenkripsi dan otomatis tersinkronisasi ke laporan keuangan & inventaris
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend Notes */}
      {steps && steps.length > 0 && (
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
          <div className="font-bold text-slate-700 dark:text-slate-300">
            Panduan Penomoran Tombol:
          </div>
          {steps.map((st, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-slate-600 dark:text-slate-400">
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{st}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
