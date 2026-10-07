import React, { useState } from 'react';
import { Search, MapPin, Phone, ArrowRight, ShieldCheck, Wrench, CheckCircle2 } from 'lucide-react';

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
          
          {/* Left Workshop Overview & Grounded Authority */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Bengkel Mobil <span className="text-blue-600 dark:text-blue-400">GPS Motor</span> Kediri
            </h1>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              Spesialis tune up injeksi EFI, perbaikan kaki-kaki, overhaul mesin, kelistrikan, dan perawatan berkala. Setiap servis tercatat transparan dengan foto pengerjaan sebelum &amp; sesudah serta nota suku cadang asli.
            </p>

            {/* Tactile Workshop Dispatch Strip (No lazy cards, real workshop facts) */}
            <div className="border-y border-slate-200 dark:border-slate-800 py-4 space-y-2.5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Sambiresik, Kec. Gampengrejo, Kab. Kediri</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <a 
                    href="https://wa.me/6285603307330" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    0856-0330-7330
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <strong className="text-slate-900 dark:text-slate-200 font-semibold">Buka 08:00 - 17:00 WIB</strong>
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                <span className="flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Pit Lift 4-Ton &amp; Scanner OBD2</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Garansi Nota Fisik &amp; Digital</span>
                </span>
              </div>
            </div>

            {/* Direct Reassurance Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Foto pengerjaan terkirim otomatis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Suku cadang lama wajib diserahkan</span>
              </div>
            </div>
          </div>

          {/* Right Tactile License Plate Intake Terminal */}
          <div className="lg:col-span-5">
            <div className="rounded border-2 border-slate-900 dark:border-blue-500 bg-white dark:bg-slate-800 p-6 shadow-sm">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Cek Status Servis Mobil
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Lacak progres perbaikan kendaraan Anda tanpa perlu login akun.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="hero-plate-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                    Plat Nomor Kendaraan (Wilayah Kediri &amp; Jawa Timur)
                  </label>
                  <div className="relative">
                    <input
                      id="hero-plate-input"
                      type="text"
                      value={plateInput}
                      onChange={(e) => setPlateInput(e.target.value)}
                      placeholder="Contoh: AG 1822 AB"
                      className="touch-target w-full uppercase px-4 py-3.5 rounded border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white text-lg font-mono font-black tracking-widest placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-700 transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    <span>Format: spasi otomatis disesuaikan</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Data nama &amp; HP disensor</span>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="touch-target w-full flex items-center justify-center space-x-2 py-3 px-4 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-colors shadow-none"
                >
                  <Search className="w-4 h-4" />
                  <span>Lacak Pengerjaan Mobil</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample Quick Chips */}
              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Plat contoh siap uji:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPlate('AG 1822 AB')}
                    className="touch-target inline-flex items-center px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 font-mono text-xs font-bold text-blue-700 dark:text-blue-300 transition-colors"
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
