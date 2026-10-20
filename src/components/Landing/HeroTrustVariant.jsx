import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, ArrowRight, Search, Phone, 
  Camera, FileText, RotateCcw, Award, Car, Clock, Sparkles,
  ClipboardList, FileCheck, Wrench, Cog, CheckCircle, PackageCheck
} from 'lucide-react';

/* =========================================================================
   MOCKUP DATA STRUCTURES (EXACT REPLICATION OF VARIANT 2)
   ========================================================================= */

const INTEGRITY_PILLARS = [
  {
    icon: PackageCheck,
    title: 'PENGEMBALIAN SUKU CADANG',
    desc: 'Suku cadang bekas yang diganti selalu dikembalikan ke Anda aslinya.'
  },
  {
    icon: Camera,
    title: 'UPDATE FOTO PROSES',
    desc: 'Lihat dokumentasi foto asli proses perbaikan langsung selama pengerjaan.'
  },
  {
    icon: FileText,
    title: 'ESTIMASI HARGA TRANSPARAN',
    desc: 'Estimasi biaya disetujui sebelum pengerjaan. Tidak ada biaya tersembunyi.'
  },
  {
    icon: Award,
    title: 'MEKANIK BERSERTIFIKAT',
    desc: 'Tim mekanik ahli berpengalaman dan bersertifikasi menangani mobil Anda.'
  }
];

const RO_STAGES = [
  { id: 1, name: 'Pendaftaran & Diagnosa', icon: ClipboardList, status: 'completed' },
  { id: 2, name: 'Estimasi Disetujui', icon: FileCheck, status: 'completed' },
  { id: 3, name: 'Pengerjaan Dimulai', icon: Wrench, status: 'completed' },
  { id: 4, name: 'Suku Cadang Diganti', icon: Cog, status: 'active' },
  { id: 5, name: 'Quality Control', icon: CheckCircle, status: 'pending' },
  { id: 6, name: 'Kendaraan Siap', icon: Car, status: 'pending' }
];

const CAR_MODELS = [
  'Toyota Avanza / Veloz',
  'Toyota Kijang Innova',
  'Honda Brio Satya / RS',
  'Daihatsu Xenia / Sigra',
  'Suzuki Ertiga / XL7',
  'Daihatsu Gran Max'
];

const SERVICE_TYPES = [
  'Tune Up Injeksi & EFI',
  'Servis Kaki-Kaki & Kemudi',
  'Ganti Oli Mesin & Filter',
  'Servis Overhaul / Turun Mesin'
];

const SYMPTOM_OPTIONS = [
  'Mesin Brebet & Boros Bensin',
  'Bunyi Glodakan di Jalan Kediri',
  'Tarikan Mesin Lemah / Berat',
  'Starter Cetek / Aki Sering Drop'
];

export default function HeroTrustVariant({ onSearchPlate, defaultPlate = '' }) {
  const [plateInput, setPlateInput] = useState(defaultPlate);
  const [selectedModel, setSelectedModel] = useState(CAR_MODELS[0]);
  const [selectedService, setSelectedService] = useState(SERVICE_TYPES[0]);
  const [selectedSymptom, setSelectedSymptom] = useState(SYMPTOM_OPTIONS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (plateInput.trim()) {
      onSearchPlate(plateInput.trim());
    }
  };

  const handleQuickPlate = (plate) => {
    setPlateInput(plate);
    onSearchPlate(plate);
  };

  const handlePackageSelect = (packageName, price) => {
    const text = `Halo Bengkel Mobil GPS Motor Kediri, saya ingin reservasi servis:\n\n` +
      `• Paket: ${packageName} (${price})\n` +
      `• Mobil: ${selectedModel}\n` +
      `• Layanan: ${selectedService}\n` +
      `• Keluhan Awal: ${selectedSymptom}\n\n` +
      `Mohon info jadwal pengerjaan dan estimasi slot pit lift. Terima kasih.`;
    window.open(`https://wa.me/6285603307330?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleGeneralBooking = () => {
    const text = `Halo Bengkel Mobil GPS Motor Kediri, saya ingin booking jadwal servis mobil. Mohon info ketersediaan slot hari ini.`;
    window.open(`https://wa.me/6285603307330?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      
      {/* =========================================================================
          HERO TOP BANNER (Deep Royal Blue with Workshop Lift Image)
          ========================================================================= */}
      <section className="bg-[#0b244d] text-white border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Headline & Action */}
            <div className="lg:col-span-7 space-y-5 z-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15] uppercase">
                Bengkel Terpercaya Kediri: Transparan, Jujur, Bergaransi.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-blue-100 tracking-wide font-bold uppercase">
                Servis Mobil Tanpa Cemas Bersama GPS Motor
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleGeneralBooking}
                  className="touch-target inline-flex items-center justify-center px-6 py-3.5 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm tracking-wider uppercase transition-colors shadow-none"
                >
                  Booking Sekarang
                </button>

                <a
                  href="#pantau-ro"
                  className="touch-target inline-flex items-center justify-center px-5 py-3.5 rounded border border-blue-400/60 bg-blue-900/40 hover:bg-blue-800 text-white font-bold text-sm tracking-wider transition-colors"
                >
                  <Search className="w-4 h-4 mr-2 text-blue-300" />
                  <span>Cek Status Plat Nomor</span>
                </a>
              </div>

              {/* Top Quick Badges */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-blue-200 pt-3 border-t border-blue-800/80 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <strong className="text-white font-semibold">Buka 08:00 - 17:00 WIB</strong>
                </span>
                <span>•</span>
                <span>Sambiresik, Gampengrejo, Kediri</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">WA: 0856-0330-7330</span>
              </div>
            </div>

            {/* Right Hero Workshop Visual */}
            <div className="lg:col-span-5 relative">
              <div className="rounded border-2 border-blue-800/80 overflow-hidden bg-slate-900 shadow-sm aspect-[4/3]">
                <img 
                  src="/images/hero/hero-workshop.jpg" 
                  alt="Area Workshop Bengkel Mobil GPS Motor Kediri"
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    // Fallback to facility lift if hero-workshop not found
                    e.currentTarget.src = '/images/gallery/facility-lift.jpg';
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: INTEGRITAS KAMI & JAMINAN TRANSPARANSI (4 Cards)
          ========================================================================= */}
      <section className="py-12 md:py-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Integritas Kami &amp; Jaminan Transparansi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
              Empat komitmen nyata Bengkel GPS Motor agar Anda tenang dan terbebas dari kekhawatiran servis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INTEGRITY_PILLARS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="rounded border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-5 flex flex-col items-center text-center hover:border-blue-600 dark:hover:border-blue-500 transition-colors shadow-none"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: PANTAU PROSES PERBAIKAN ANDA (STAGING REPAIR ORDER)
          ========================================================================= */}
      <section id="pantau-ro" className="py-12 md:py-16 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Pantau Proses Perbaikan Anda
            </h2>
            <p className="text-xs sm:text-sm font-mono font-bold text-blue-700 dark:text-blue-400 mt-1 uppercase">
              (Staging Repair Order)
            </p>
          </div>

          {/* Staging Timeline Stepper */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-6 sm:p-8 mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative">
              {RO_STAGES.map((stg) => {
                const Icon = stg.icon;
                const isCompleted = stg.status === 'completed';
                const isActive = stg.status === 'active';

                return (
                  <div key={stg.id} className="flex flex-col items-center text-center relative z-10">
                    
                    {/* Circle Node */}
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 transition-colors border-2 ${
                        isActive
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-none ring-4 ring-emerald-100 dark:ring-emerald-950'
                          : isCompleted
                          ? 'bg-[#0b244d] border-[#0b244d] text-white'
                          : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Step Number & Name */}
                    <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                      Tahap {stg.id}
                    </span>
                    <strong className={`text-xs font-bold leading-tight ${
                      isActive 
                        ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' 
                        : isCompleted 
                        ? 'text-slate-900 dark:text-white' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {stg.name}
                    </strong>

                    {/* Active Badge on Stage 4 */}
                    {isActive && (
                      <span className="mt-1.5 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold border border-emerald-300 dark:border-emerald-800">
                        Live Pengerjaan
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              Setiap tahapan servis diperbarui langsung oleh teknisi dari ponsel di stall pengerjaan lengkap dengan foto sebelum &amp; sesudah.
            </p>
          </div>

          {/* License Plate Search Intake Terminal */}
          <div className="max-w-2xl mx-auto rounded border-2 border-blue-600 bg-white dark:bg-slate-800 p-6">
            <div className="text-center mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Cek Status Progres Mobil Anda
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Ketik nomor plat kendaraan untuk melihat langsung tahapan servis di atas tanpa perlu login akun.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value)}
                  placeholder="Contoh: AG 1822 AB"
                  className="touch-target w-full uppercase px-4 py-3.5 rounded border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-lg font-mono font-black tracking-widest text-center placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-700 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Format bebas: spasi disesuaikan</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Nama &amp; Kontak Disensor</span>
                </span>
              </div>

              <button
                type="submit"
                className="touch-target w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded bg-[#0b244d] hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-sm tracking-wider uppercase transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Lacak Progres Kendaraan Saya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Plat contoh siap uji:</span>
              <button
                type="button"
                onClick={() => handleQuickPlate('AG 1822 AB')}
                className="touch-target px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-mono text-xs font-bold text-blue-700 dark:text-blue-300 transition-colors"
              >
                AG 1822 AB (Avanza)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPlate('AG 1044 RK')}
                className="touch-target px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                AG 1044 RK (Innova)
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ESTIMASI BIAYA SERVIS TRANSPARAN (Dropdowns & 3 Cards)
          ========================================================================= */}
      <section className="py-12 md:py-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Estimasi Biaya Servis Transparan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
              Pilih model mobil dan jenis perbaikan untuk mendapatkan simulasi estimasi paket servis terbuka tanpa biaya tersembunyi.
            </p>
          </div>

          {/* 3 Dropdown Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto mb-10">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5">
                Model Mobil
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="touch-target w-full px-3 py-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-600"
              >
                {CAR_MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5">
                Jenis Servis
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="touch-target w-full px-3 py-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-600"
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5">
                Keluhan Utama
              </label>
              <select
                value={selectedSymptom}
                onChange={(e) => setSelectedSymptom(e.target.value)}
                className="touch-target w-full px-3 py-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-600"
              >
                {SYMPTOM_OPTIONS.map((sym) => (
                  <option key={sym} value={sym}>{sym}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3 Pricing Tier Cards (Exact Replica from Mockup) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Card 1: Servis Dasar */}
            <div className="rounded border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 flex flex-col justify-between hover:border-blue-600 dark:hover:border-blue-500 transition-colors shadow-none">
              <div className="space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Servis Dasar
                  </h3>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    Rp 450rb+
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">•</span>
                    <span>Suku cadang bekas yang diganti dikembalikan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">•</span>
                    <span>Estimasi pengerjaan cepat (1 - 2 Jam)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">•</span>
                    <span>Garansi servis resmi 14 hari</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handlePackageSelect('Servis Dasar', 'Rp 450rb+')}
                  className="touch-target w-full py-3 px-4 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-none"
                >
                  Pilih Paket
                </button>
              </div>
            </div>

            {/* Card 2: Servis Menengah */}
            <div className="rounded border-2 border-emerald-600 bg-white dark:bg-slate-800 p-6 flex flex-col justify-between hover:border-emerald-500 transition-colors shadow-none relative">
              <div className="space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Servis Menengah
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold">
                      Rekomendasi
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    Rp 850rb+
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">•</span>
                    <span>Suku cadang bekas yang diganti dikembalikan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">•</span>
                    <span>Estimasi pengerjaan terukur (2 - 3 Jam)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">•</span>
                    <span>Servis lengkap + Carbon Clean ruang bakar</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handlePackageSelect('Servis Menengah', 'Rp 850rb+')}
                  className="touch-target w-full py-3 px-4 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-none"
                >
                  Pilih Paket
                </button>
              </div>
            </div>

            {/* Card 3: Servis Lengkap */}
            <div className="rounded border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 flex flex-col justify-between hover:border-blue-600 dark:hover:border-blue-500 transition-colors shadow-none">
              <div className="space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Servis Lengkap
                  </h3>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                    Rp 1.5Jt+
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">•</span>
                    <span>Suku cadang bekas yang diganti dikembalikan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">•</span>
                    <span>Estimasi disetujui di awal tanpa biaya tersembunyi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-900 dark:text-white font-bold">•</span>
                    <span>Servis komprehensif + garansi 30 hari</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handlePackageSelect('Servis Lengkap', 'Rp 1.5Jt+')}
                  className="touch-target w-full py-3 px-4 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-none"
                >
                  Pilih Paket
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: WORKSHOP BAY VISUALS (2 Images from Mockup)
          ========================================================================= */}
      <section className="py-12 md:py-16 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Visual Card 1: Mechanic inspecting engine */}
            <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 overflow-hidden shadow-none flex flex-col">
              <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <img 
                  src="/images/gallery/facility-lift.jpg" 
                  alt="Inspeksi Kolong Mobil di Lift 4-Ton GPS Motor"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4 sm:p-5">
                <strong className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Stall Lift 4-Ton &amp; Kolong Mobil Bersih
                </strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Inspeksi kolong mobil dilakukan di bawah lift hidrolik 4-ton untuk menjamin keamanan mekanik dan ketelitian analisa perbaikan kaki-kaki Anda.
                </p>
              </div>
            </div>

            {/* Visual Card 2: Diagnostic & Scanner Center */}
            <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 overflow-hidden shadow-none flex flex-col">
              <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <img 
                  src="/images/gallery/facility-scanner.jpg" 
                  alt="Diagnostik Komputer OBD2 Bengkel GPS Motor"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4 sm:p-5">
                <strong className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Diagnosa Digital Komputer OBD2
                </strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Parameter sensor dibaca secara live-stream menggunakan scanner multi-merek digital untuk akurasi tindakan dan transparansi hasil pembacaan.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
