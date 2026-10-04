import React, { useState } from 'react';
import { Search, ShieldCheck, Camera, Sparkles, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function HeroSection({ onSearchPlate, defaultPlate = '' }) {
  const [plateInput, setPlateInput] = useState(defaultPlate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (plateInput.trim()) {
      onSearchPlate(plateInput.trim());
    }
  };

  const handleQuickPlate = (sample) => {
    setPlateInput(sample);
    onSearchPlate(sample);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text & Value Props */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Bengkel Mobil Modern & Transparan di Kediri</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Bengkel Mobil <span className="text-blue-600 dark:text-blue-400">GPS Motor</span> Kediri
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Spesialis tune up mesin, servis mobil injeksi EFI, overhaul, perbaikan kaki-kaki, dan perawatan berkala. 
              Pantau proses servis mobil Anda secara transparan via tracking online lengkap dengan dokumentasi foto real-time.
            </p>

            {/* Quick Contact & Address Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-slate-700 dark:text-slate-300 pt-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-medium">Sambiresik, Kec. Gampengrejo, Kab. Kediri</span>
              </div>
              <span className="hidden sm:inline text-slate-400">•</span>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <a 
                  href="https://wa.me/6285603307330" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  0856-0330-7330
                </a>
              </div>
            </div>

            {/* Value Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Foto Bukti Servis</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Dokumentasi sebelum & sesudah</div>
              </div>
              <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Privasi Terjaga</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Sensor data pelanggan otomatis</div>
              </div>
              <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                <Search className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Cek Zero-Login</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Langsung pakai plat nomor</div>
              </div>
            </div>
          </div>

          {/* Right Cek Status Widget */}
          <div className="lg:col-span-5">
            <div className="rounded border-2 border-blue-600 dark:border-blue-500 bg-slate-50 dark:bg-slate-800 p-6 shadow-none">
              <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cek Status Servis Mobil</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Lacak pengerjaan mobil Anda secara live</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="hero-plate-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                    Masukkan Plat Nomor Kendaraan
                  </label>
                  <div className="relative">
                    <input
                      id="hero-plate-input"
                      type="text"
                      value={plateInput}
                      onChange={(e) => setPlateInput(e.target.value)}
                      placeholder="Contoh: AG 1822 AB"
                      className="touch-target w-full uppercase px-4 py-3 rounded border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-base font-mono font-bold tracking-wider placeholder:font-normal placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Bisa dengan spasi atau tanpa spasi (misal: <span className="font-mono font-semibold">AG 1822 AB</span> atau <span className="font-mono font-semibold">AG1822AB</span>).
                  </p>
                </div>

                <button
                  type="submit"
                  className="touch-target w-full flex items-center justify-center space-x-2 py-3 px-4 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Lacak Status Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample Quick Chips */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  Coba plat demo terdaftar:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPlate('AG 1822 AB')}
                    className="touch-target inline-flex items-center px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 font-mono text-xs font-bold text-blue-700 dark:text-blue-300 transition-colors"
                  >
                    AG 1822 AB (Avanza)
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
