import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Check, ChevronDown, Maximize2, X, ZoomIn, Eye, Info } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUrl';

export default function AnnotatedCard({ 
  title = 'Tangkapan Layar Antarmuka & Panduan Tombol', 
  badge = 'Tangkapan Layar Langsung', 
  type = 'default',
  image = '',
  annotations = [],
  steps = [],
  className = '' 
}) {
  const [activePin, setActivePin] = useState(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Keyboard Escape listener for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZoomOpen) {
        setIsZoomOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen]);

  // Combined annotations from props or steps
  const items = annotations.length > 0 ? annotations : steps.map((st, i) => ({
    number: i + 1,
    title: typeof st === 'string' ? st : (st.title || `Langkah ${i + 1}`),
    desc: typeof st === 'string' ? '' : (st.description || st.desc || ''),
    top: `${20 + i * 22}%`,
    left: `${15 + (i % 3) * 28}%`
  }));

  return (
    <div className={`rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm my-5 transition-all ${className}`}>
      
      {/* 1. Terminal / Window Title Bar */}
      <div className="px-4 py-3 bg-[#0c2b5e] text-white border-b border-blue-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="flex space-x-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-xs" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-white truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
            {badge}
          </span>
          {image && (
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="touch-target p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-colors"
              title="Perbesar Tangkapan Layar (Fullscreen)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Visual Content Canvas */}
      <div className="p-3 sm:p-5 bg-slate-100 dark:bg-slate-950/80">
        {image ? (
          /* High-Resolution Screenshot with Overlaid Numbered Callout Pins (1, 2, 3...) */
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-900 group">
            <img 
              src={resolveAssetUrl(image)} 
              alt={title}
              className="w-full h-auto object-cover max-h-[500px] sm:max-h-[600px] select-none block"
            />

            {/* Overlaid Annotation Pins */}
            {items.map((item, idx) => {
              const num = item.number || (idx + 1);
              const isActive = activePin === num;
              return (
                <div
                  key={num}
                  style={{ top: item.top || `${25 + idx * 20}%`, left: item.left || `${20 + idx * 25}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin"
                >
                  {/* Glowing Ping Effect */}
                  <span className="absolute -inset-1 rounded-full bg-emerald-400 animate-ping opacity-60 pointer-events-none" />

                  {/* Number Badge Button */}
                  <button
                    type="button"
                    onClick={() => setActivePin(isActive ? null : num)}
                    onMouseEnter={() => setActivePin(num)}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full font-mono font-black text-xs sm:text-sm flex items-center justify-center transition-all duration-150 shadow-xl cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-emerald-950 scale-125 ring-4 ring-emerald-300 z-30'
                        : 'bg-[#0c2b5e] text-white hover:bg-emerald-600 ring-2 ring-emerald-400 hover:scale-110'
                    }`}
                    title={`Langkah ${num}: ${item.title}`}
                  >
                    {num}
                  </button>

                  {/* Floating Popover Tooltip */}
                  {isActive && item.title && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 sm:w-60 p-2.5 rounded-xl bg-slate-950/95 text-white border border-emerald-500/50 shadow-2xl backdrop-blur-md text-xs z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-bold mb-0.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-center border border-emerald-400/30">
                          {num}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.desc && (
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {item.desc}
                        </p>
                      )}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-950" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Click-to-Zoom Helper Hint */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-semibold backdrop-blur-sm border border-slate-700 flex items-center space-x-1.5 transition-colors shadow-lg opacity-90 hover:opacity-100"
            >
              <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Perbesar Layar</span>
            </button>
          </div>
        ) : type === 'new-ro-modal' ? (
          /* Mock UI Simulation: New RO Modal */
          <div className="space-y-4 max-w-lg mx-auto bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Field 1: Autocomplete Customer */}
            <div className="relative border-2 border-dashed border-[#0c2b5e]/40 dark:border-blue-400/40 rounded-xl p-3 bg-blue-50/30 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-[#0c2b5e] text-white text-xs font-mono font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
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
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-blue-400/50 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
                <span className="absolute right-2 top-2 text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  CRM Match
                </span>
              </div>
            </div>

            {/* Field 2: Plat Nomor */}
            <div className="relative border-2 border-dashed border-[#0c2b5e]/40 dark:border-blue-400/40 rounded-xl p-3 bg-blue-50/30 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-[#0c2b5e] text-white text-xs font-mono font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                2
              </span>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Plat Nomor Kendaraan *
              </label>
              <input 
                type="text" 
                readOnly 
                value="AG 1822 AB" 
                className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0c2b5e] dark:text-blue-400 tracking-wider"
              />
            </div>

            {/* Field 3: Preset Estimasi Waktu */}
            <div className="relative border-2 border-dashed border-[#0c2b5e]/40 dark:border-blue-400/40 rounded-xl p-3 bg-blue-50/30 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-[#0c2b5e] text-white text-xs font-mono font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                3
              </span>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preset Estimasi Selesai Cepat
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="text-xs font-mono font-bold py-1.5 px-2 rounded-lg bg-[#0c2b5e] text-white text-center">
                  Hari ini 17:00 ✓
                </button>
                <button type="button" className="text-xs font-mono font-semibold py-1.5 px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-center">
                  Besok 12:00
                </button>
              </div>
            </div>

            {/* Field 4: Submit */}
            <div className="pt-1">
              <button type="button" className="w-full py-2.5 rounded-xl bg-[#00a86b] hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                Buat Repair Order (RO)
              </button>
            </div>
          </div>
        ) : type === 'finance-overview' ? (
          /* Mock UI Simulation: Finance Overview */
          <div className="space-y-4 max-w-lg mx-auto bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative border-2 border-dashed border-[#0c2b5e]/40 dark:border-blue-400/40 rounded-xl p-3 bg-blue-50/30 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-[#0c2b5e] text-white text-xs font-mono font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                1
              </span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">Pemasukan</div>
                  <div className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">Rp 4.850.000</div>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <div className="text-xs text-rose-800 dark:text-rose-300 font-bold">Pengeluaran</div>
                  <div className="text-sm font-mono font-black text-rose-600 dark:text-rose-400 mt-0.5">Rp 1.320.000</div>
                </div>
              </div>
            </div>

            <div className="relative border-2 border-dashed border-emerald-500/50 rounded-xl p-3 bg-emerald-50/40 dark:bg-emerald-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-[#00a86b] text-white text-xs font-mono font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                2
              </span>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Saldo Bersih (Net)</div>
                  <div className="text-base font-mono font-black text-slate-900 dark:text-white mt-0.5">Rp 3.530.000</div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Surplus Kas ✓
                </span>
              </div>
            </div>

            <div className="relative border-2 border-dashed border-[#0c2b5e]/40 dark:border-blue-400/40 rounded-xl p-3 bg-blue-50/30 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-[#0c2b5e] text-white text-xs font-mono font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                3
              </span>
              <div className="flex space-x-2">
                <span className="flex-1 py-1.5 px-2 rounded-lg bg-[#0c2b5e] text-white text-center text-xs font-mono font-bold">
                  PDF Laporan P&amp;L
                </span>
                <span className="flex-1 py-1.5 px-2 rounded-lg bg-[#00a86b] text-white text-center text-xs font-mono font-bold">
                  Export CSV
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Default Simulation Canvas */
          <div className="space-y-3 max-w-lg mx-auto bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative border-2 border-dashed border-[#0c2b5e]/40 dark:border-blue-400/40 rounded-xl p-3 bg-blue-50/30 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-[#0c2b5e] text-white text-xs font-mono font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                1
              </span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Pilih Aksi / Modul
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Navigasi langsung melalui tab dashboard atau shortcut keyboard Ctrl+K
              </div>
            </div>
            <div className="relative border-2 border-dashed border-[#0c2b5e]/40 dark:border-blue-400/40 rounded-xl p-3 bg-blue-50/30 dark:bg-blue-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-[#0c2b5e] text-white text-xs font-mono font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                2
              </span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Isi Formulir &amp; Validasi
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ketik data operasional bengkel secara akurat
              </div>
            </div>
            <div className="relative border-2 border-dashed border-emerald-500/50 rounded-xl p-3 bg-emerald-50/30 dark:bg-emerald-950/20">
              <span className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-[#00a86b] text-white text-xs font-mono font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
                3
              </span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Simpan &amp; Otomatisasi
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Data terenkripsi dan otomatis tersinkronisasi ke laporan keuangan &amp; inventaris
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Numbered Step Legend Breakdown */}
      {items.length > 0 && (
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />
              <span>Anotasi Penomoran Langkah:</span>
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Arahkan kursor atau klik nomor untuk menyorot
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {items.map((item, idx) => {
              const num = item.number || (idx + 1);
              const isActive = activePin === num;
              return (
                <div
                  key={num}
                  onClick={() => setActivePin(isActive ? null : num)}
                  onMouseEnter={() => setActivePin(num)}
                  onMouseLeave={() => setActivePin(null)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-3 ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500/50'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full font-mono font-black text-xs flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0c2b5e] text-emerald-400'
                  }`}>
                    {num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className={`font-bold leading-tight mb-0.5 truncate ${
                      isActive ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {item.title}
                    </h5>
                    {item.desc && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {item.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Fullscreen Zoom Lightbox Modal */}
      {isZoomOpen && image && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-sm animate-in fade-in-0 duration-150"
          onClick={() => setIsZoomOpen(false)}
        >
          <div 
            className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {badge}
                </span>
                <h4 className="text-sm font-bold truncate">{title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="w-9 h-9 touch-target flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Zoomed Image and Overlaid Pins */}
            <div className="overflow-auto flex-1 p-4 bg-black/60 flex items-center justify-center">
              <div className="relative inline-block max-w-full">
                <img 
                  src={resolveAssetUrl(image)} 
                  alt={title}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl block"
                />

                {/* Overlaid Pins in Zoom View */}
                {items.map((item, idx) => {
                  const num = item.number || (idx + 1);
                  const isActive = activePin === num;
                  return (
                    <div
                      key={num}
                      style={{ top: item.top || `${25 + idx * 20}%`, left: item.left || `${20 + idx * 25}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                    >
                      <button
                        type="button"
                        onClick={() => setActivePin(isActive ? null : num)}
                        className={`w-8 h-8 rounded-full font-mono font-black text-xs flex items-center justify-center shadow-2xl transition-transform ${
                          isActive
                            ? 'bg-emerald-500 text-emerald-950 scale-125 ring-4 ring-emerald-300'
                            : 'bg-[#0c2b5e] text-white ring-2 ring-emerald-400'
                        }`}
                      >
                        {num}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer with Step Indicators */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center space-x-2">
                <span>Tekan</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-slate-300">ESC</kbd>
                <span>atau klik area luar untuk menutup</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">
                {items.length} Anotasi Langkah Terpasang
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
