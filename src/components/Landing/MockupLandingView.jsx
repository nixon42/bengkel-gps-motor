import React, { useState } from 'react';
import { 
  PackageCheck, Camera, FileText, Award, 
  ClipboardList, FileCheck, Wrench, Cog, CheckCircle, Car,
  Search, ShieldCheck, ArrowRight, Phone, CheckCircle2, ChevronDown, Check,
  Sparkles, WrenchIcon, Layers, Clock, MapPin
} from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUrl';

const INTEGRITY_PILLARS = [
  {
    icon: PackageCheck,
    title: 'PENGEMBALIAN SUKU CADANG',
    desc: 'Suku cadang bekas yang diganti selalu dikembalikan ke Anda aslinya dalam kardus suku cadang baru.'
  },
  {
    icon: Camera,
    title: 'UPDATE FOTO PROSES',
    desc: 'Lihat dokumentasi foto asli proses perbaikan langsung selama pengerjaan di stall bengkel.'
  },
  {
    icon: FileText,
    title: 'ESTIMASI HARGA TRANSPARAN',
    desc: 'Estimasi biaya disetujui sebelum pengerjaan. Tidak ada biaya tersembunyi atau pengerjaan tanpa izin.'
  },
  {
    icon: Award,
    title: 'MEKANIK BERSERTIFIKAT',
    desc: 'Tim mekanik ahli berpengalaman dan bersertifikasi menangani mobil bensin maupun diesel.'
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
  'Toyota Kijang Innova (Reborn/Zenix)',
  'Honda Brio Satya / RS',
  'Daihatsu Xenia / Sigra / Terios',
  'Suzuki Ertiga / XL7',
  'Daihatsu Gran Max / Luxio',
  'Mitsubishi Xpander / Pajero',
  'Mobil Lainnya (Konsultasi)'
];

const SERVICE_TYPES = [
  'Tune Up Injeksi & EFI',
  'Servis Kaki-Kaki & Kemudi',
  'Ganti Oli Mesin & Filter',
  'Kuras Minyak Rem & Servis Kampas',
  'Overhaul / Turun Mesin Parsial'
];

const SYMPTOM_OPTIONS = [
  'Mesin Brebet & Boros Bensin',
  'Bunyi Glodakan di Jalan Kediri',
  'Tarikan Mesin Lemah / Berat',
  'Starter Cetek / Aki Drop',
  'AC Kurang Dingin / Bau Apek',
  'Pemeriksaan Rutin Berkala'
];

export default function MockupLandingView({ onSearchPlate, defaultPlate = '', tenant }) {
  const [plateInput, setPlateInput] = useState(defaultPlate);
  const [selectedModel, setSelectedModel] = useState(CAR_MODELS[0]);
  const [selectedService, setSelectedService] = useState(SERVICE_TYPES[0]);
  const [selectedSymptom, setSelectedSymptom] = useState(SYMPTOM_OPTIONS[0]);

  const getRecommendedPackage = () => {
    if (selectedService === 'Ganti Oli Mesin & Filter' || selectedSymptom === 'Pemeriksaan Rutin Berkala') {
      return 'Servis Dasar';
    }
    if (
      selectedService === 'Servis Kaki-Kaki & Kemudi' || 
      selectedService === 'Overhaul / Turun Mesin Parsial' ||
      selectedSymptom === 'Bunyi Glodakan di Jalan Kediri' ||
      selectedSymptom === 'Starter Cetek / Aki Drop'
    ) {
      return 'Servis Lengkap';
    }
    return 'Servis Menengah';
  };

  const recommendedPackage = getRecommendedPackage();

  const tenantName = tenant?.name || 'Bengkel Mobil GPS Motor Kediri';
  const tagline = tenant?.tagline || 'BENGKEL TERPERCAYA KEDIRI: TRANSPARAN, JUJUR, BERGARANSI.';
  const address = tenant?.address || 'Jl. Raya Sambiresik, Gampengrejo, Kediri';
  const businessHours = tenant?.business_hours || tenant?.businessHours || 'Senin - Sabtu: 08:00 - 17:00 WIB';
  const phoneWa = tenant?.phone_wa || tenant?.phoneWa || '085603307330';
  const cleanWa = phoneWa.replace(/\D/g, '').replace(/^0/, '62');
  const heroImage = resolveAssetUrl(tenant?.hero_image_url || tenant?.heroImageUrl || '/images/mockup/hero_bay_clean.jpg');
  const facilityImage1 = resolveAssetUrl(tenant?.facility_image_1 || tenant?.facilityImage1 || '/images/mockup/facility_lift_bay_clean.jpg');
  const facilityImage2 = resolveAssetUrl(tenant?.facility_image_2 || tenant?.facilityImage2 || '/images/mockup/facility_inspection_clean.jpg');

  const handlePlateSubmit = (e) => {
    e.preventDefault();
    if (plateInput.trim()) {
      onSearchPlate(plateInput.trim());
    }
  };

  const handleQuickPlate = (plate) => {
    setPlateInput(plate);
    onSearchPlate(plate);
  };

  const handleGeneralBooking = () => {
    const text = `Halo ${tenantName}, saya ingin booking jadwal servis mobil ${selectedModel} (${selectedService}) di workshop.\n` +
      `Keluhan awal: ${selectedSymptom}.\n\n` +
      `Mohon info ketersediaan slot pit lift hari ini. Terima kasih!`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePackageSelect = (packageName, price) => {
    const text = `Halo ${tenantName}, saya ingin reservasi servis:\n\n` +
      `• Paket: ${packageName} (${price})\n` +
      `• Model Mobil: ${selectedModel}\n` +
      `• Jenis Servis: ${selectedService}\n` +
      `• Keluhan Awal: ${selectedSymptom}\n\n` +
      `Mohon info jadwal pengerjaan dan slot workshop. Terima kasih!`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-6 sm:py-10 space-y-12 sm:space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">

        {/* =========================================================================
            SECTION 1: HERO SECTION (AUTHORITATIVE ROYAL BLUE WORKSHOP CANOPY)
            ========================================================================= */}
        <section aria-labelledby="hero-heading" className="w-full">
          <div className="rounded-2xl border border-blue-900/60 bg-[#0c2b5e] text-white p-6 sm:p-10 lg:p-12 overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* Left Column: Headline, Subheading, Action CTAs */}
              <div className="lg:col-span-7 space-y-5">
                <h1 id="hero-heading" className="text-3xl sm:text-5xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight font-sans">
                  {tagline}
                </h1>

                <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl font-sans">
                  Servis mobil tanpa rasa was-was di <strong className="text-white font-bold">{tenantName}</strong>. Estimasi transparan di awal, foto pengerjaan dikirimkan live via WhatsApp, dan suku cadang bekas wajib dikembalikan ke tangan Anda.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGeneralBooking}
                    className="touch-target inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded bg-[#00a86b] hover:bg-[#00925d] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Booking via WhatsApp
                  </button>

                  <a
                    href="#pantau-ro"
                    className="touch-target inline-flex items-center justify-center px-5 sm:px-6 py-3.5 sm:py-4 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors"
                  >
                    <Search className="w-4 h-4 mr-2 text-blue-300" />
                    Cek Status Plat Nomor
                  </a>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-blue-200 font-sans">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-950/70 border border-blue-400/20">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Suku cadang bekas dikembalikan
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-950/70 border border-blue-400/20">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Dokumentasi foto WhatsApp
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-950/70 border border-blue-400/20">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Garansi servis tertulis
                  </span>
                </div>
              </div>

              {/* Right Column: High-Res Real Workshop Photo */}
              <div className="lg:col-span-5 space-y-3">
                <div className="rounded-xl border border-blue-400/30 overflow-hidden bg-slate-950 aspect-[4/3] shadow-md relative group">
                  <img 
                    src={heroImage} 
                    alt={`Workshop ${tenantName} melayani servis mobil`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#0c2b5e]/90 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Stall Lift Aktif</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-950/70 border border-blue-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-200 font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{address}</span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                    <span>{businessHours}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: INTEGRITAS KAMI & JAMINAN TRANSPARANSI (4 CARDS FULL WIDTH)
            ========================================================================= */}
        <section id="integritas" aria-labelledby="integritas-heading" className="w-full space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 id="integritas-heading" className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              INTEGRITAS KAMI &amp; JAMINAN TRANSPARANSI
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Standar kejujuran bengkel profesional tanpa biaya tersembunyi dan tanpa manipulasi pergantian suku cadang.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {INTEGRITY_PILLARS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6 flex flex-col items-center text-center hover:border-blue-600 dark:hover:border-blue-400 transition-colors shadow-none"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3.5 shrink-0">
                    <Icon className="w-6 h-6" />
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
        </section>

        {/* =========================================================================
            SECTION 3: PANTAU PROSES PERBAIKAN ANDA (STAGING REPAIR ORDER)
            ========================================================================= */}
        <section id="pantau-ro" aria-labelledby="pantau-heading" className="w-full space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-1">
            <h2 id="pantau-heading" className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              PANTAU PROSES PERBAIKAN ANDA
            </h2>
            <p className="text-xs sm:text-sm font-mono font-bold text-blue-700 dark:text-blue-400 uppercase">
              (STAGING REPAIR ORDER)
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Setiap tahapan servis tercatat transparan dari diagnosa awal hingga kendaraan siap diambil.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 sm:p-8 space-y-8 shadow-none">
            
            {/* 6-Stage Progress Stepper Bar (Horizontal across width) */}
            <div className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-2 items-start text-center">
                {RO_STAGES.map((stg) => {
                  const Icon = stg.icon;
                  const isCompleted = stg.status === 'completed';
                  const isActive = stg.status === 'active';

                  return (
                    <div 
                      key={stg.id} 
                      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                        isActive ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80' : ''
                      }`}
                    >
                      <div 
                        className={`w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-colors border-2 ${
                          isActive
                            ? 'bg-[#00a86b] border-emerald-500 text-white shadow-none ring-2 ring-emerald-200 dark:ring-emerald-950'
                            : isCompleted
                            ? 'bg-[#0c2b5e] border-[#0c2b5e] text-white'
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                        Tahap {stg.id}
                      </span>

                      <strong className={`text-xs leading-tight block mt-1 ${
                        isActive 
                          ? 'text-emerald-700 dark:text-emerald-300 font-extrabold' 
                          : isCompleted 
                          ? 'text-slate-900 dark:text-white' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {stg.name}
                      </strong>

                      {isActive && (
                        <span className="mt-1.5 px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-mono font-bold tracking-wider uppercase">
                          Aktif
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* License Plate Tracker Input */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center mb-4 space-y-1">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase font-mono block">
                  Cek Status Kendaraan Anda Tanpa Login
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Ketik nomor plat mobil untuk melihat live update tahapan servis
                </span>
              </div>

              <form onSubmit={handlePlateSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
                <div className="flex-1">
                  <input
                    type="text"
                    value={plateInput}
                    onChange={(e) => setPlateInput(e.target.value)}
                    placeholder="Contoh: AG 1822 AB"
                    className="touch-target w-full uppercase px-4 py-3 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-base font-mono font-bold tracking-widest text-center placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="touch-target px-6 py-3 rounded bg-[#0c2b5e] hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-xs uppercase font-mono tracking-wider transition-colors shadow-none shrink-0 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Lacak Progres</span>
                </button>
              </form>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">
                <div className="flex items-center gap-2">
                  <span>Uji plat:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickPlate('AG 1822 AB')}
                    className="touch-target px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-mono font-bold hover:underline"
                  >
                    AG 1822 AB (Avanza)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPlate('AG 1044 RK')}
                    className="touch-target px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold hover:underline"
                  >
                    AG 1044 RK (Innova)
                  </button>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Nama &amp; HP Disensor</span>
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 4: FASILITAS WORKSHOP & PIT LIFT (REAL WORKSHOP PHOTOS FROM MOCKUP)
            ========================================================================= */}
        <section id="fasilitas" aria-labelledby="fasilitas-heading" className="w-full space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 id="fasilitas-heading" className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              FASILITAS WORKSHOP &amp; PIT LIFT KEDIRI
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Peralatan modern dan stall servis bersih berstandar bengkel resmi untuk akurasi dan keselamatan pengerjaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feature Card 1: Hydraulic Lift Bay */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 overflow-hidden shadow-none flex flex-col">
              <div className="aspect-[16/9] overflow-hidden bg-slate-900">
                <img 
                  src={facilityImage1} 
                  alt={`Pit lift hidrolik 4-ton ${tenantName}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold uppercase">
                    Stall Pengerjaan Utama
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase">
                    Two-Post Hydraulic Lift 4-Ton
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Inspeksi kaki-kaki, kolong mesin, transmisi, knalpot, dan rem dengan visibilitas penuh 360 derajat. Mencegah tebak-tebakan masalah suspensi dan menjamin presisi pemasangan suku cadang.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">✓ Kapasitas 4.000 kg</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">✓ Safety lock otomatis</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">✓ Area stall bersih</span>
                </div>
              </div>
            </div>

            {/* Feature Card 2: Diagnostic & ECU Scanner */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 overflow-hidden shadow-none flex flex-col">
              <div className="aspect-[16/9] overflow-hidden bg-slate-900">
                <img 
                  src={facilityImage2} 
                  alt={`Diagnosa OBD2 scanner dan inspeksi mesin ${tenantName}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold uppercase">
                    Peralatan Diagnostik
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase">
                    OBD2 Digital Scanner &amp; ECU Analyzer
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Pemindaian komputer sistem injeksi EFI, sensor check engine, transmisi otomatis, dan sistem kelistrikan. Hasil diagnosa dapat langsung dikonsultasikan bersama pemilik mobil sebelum estimasi dibuat.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">✓ Scan multi-brand</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">✓ Live sensor data</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">✓ Reset error engine</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 5: ESTIMASI BIAYA SERVIS TRANSPARAN (DROPDOWNS + 3 PRICING TIERS)
            ========================================================================= */}
        <section id="estimasi-biaya" aria-labelledby="estimasi-heading" className="w-full space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 id="estimasi-heading" className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              ESTIMASI BIAYA SERVIS TRANSPARAN
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Pilih spesifikasi kendaraan dan paket servis. Rincian biaya jelas sebelum kunci diserahkan ke mekanik.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 sm:p-8 space-y-6 shadow-none">
            
            {/* 3 Dropdown Selectors matching mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5">
                  Model Mobil
                </label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="touch-target w-full appearance-none px-3.5 py-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-blue-600 truncate pr-8"
                  >
                    {CAR_MODELS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5">
                  Jenis Servis
                </label>
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="touch-target w-full appearance-none px-3.5 py-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-blue-600 truncate pr-8"
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono mb-1.5">
                  Keluhan Utama
                </label>
                <div className="relative">
                  <select
                    value={selectedSymptom}
                    onChange={(e) => setSelectedSymptom(e.target.value)}
                    className="touch-target w-full appearance-none px-3.5 py-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-blue-600 truncate pr-8"
                  >
                    {SYMPTOM_OPTIONS.map((sym) => (
                      <option key={sym} value={sym}>{sym}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Dynamic Recommendation Banner linking Selectors to Cards */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-950 dark:text-emerald-100">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Rekomendasi untuk <strong>{selectedModel}</strong> ({selectedService}): Paket <strong>{recommendedPackage}</strong>
                </span>
              </div>
              <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold self-start sm:self-auto">
                Estimasi Disetujui di Awal
              </span>
            </div>

            {/* 3 Pricing Tier Cards (Exact Layout & Visual Balance with Active State) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
              
              {/* Card 1: Servis Dasar */}
              <div className={`rounded-xl p-5 flex flex-col justify-between shadow-none transition-all relative ${
                recommendedPackage === 'Servis Dasar'
                  ? 'border-2 border-emerald-500 bg-slate-50 dark:bg-slate-900 ring-2 ring-emerald-500/20'
                  : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
              }`}>
                {recommendedPackage === 'Servis Dasar' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-mono font-black uppercase tracking-wider">
                    Rekomendasi Pilihan
                  </div>
                )}

                <div className={`space-y-3 ${recommendedPackage === 'Servis Dasar' ? 'pt-1' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Servis Dasar
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      1-2 Jam
                    </span>
                  </div>

                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    Rp 450rb+
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Pemeriksaan rutin berkala dan pembersihan dasar untuk performa harian yang stabil.
                  </p>

                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Suku cadang bekas yang diganti dikembalikan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Scan OBD2 &amp; 25-titik cek fisik kendaraan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Pembersihan filter udara &amp; cek kondisi busi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Garansi servis 14 hari kerja</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handlePackageSelect('Servis Dasar', 'Rp 450rb+')}
                    className="touch-target w-full py-3 px-4 rounded bg-[#00a86b] hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-none text-center"
                  >
                    Pilih Paket
                  </button>
                </div>
              </div>

              {/* Card 2: Servis Menengah (Populer/Recommended) */}
              <div className={`rounded-xl p-5 flex flex-col justify-between shadow-none relative transition-all ${
                recommendedPackage === 'Servis Menengah'
                  ? 'border-2 border-emerald-500 bg-slate-50 dark:bg-slate-900 ring-2 ring-emerald-500/20'
                  : 'border-2 border-blue-600/70 dark:border-blue-500/70 bg-slate-50 dark:bg-slate-900'
              }`}>
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded text-white text-[11px] font-mono font-black uppercase tracking-wider ${
                  recommendedPackage === 'Servis Menengah' ? 'bg-emerald-600' : 'bg-blue-600'
                }`}>
                  {recommendedPackage === 'Servis Menengah' ? 'Rekomendasi Pilihan' : 'Paling Diminati'}
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Servis Menengah
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                      2-3 Jam
                    </span>
                  </div>

                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    Rp 850rb+
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Restorasi tenaga mesin, pembersihan kerak karbon injeksi, dan servis sistem rem.
                  </p>

                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Suku cadang bekas yang diganti dikembalikan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Tune up injeksi &amp; carbon clean throttle body</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Kuras minyak rem &amp; pembersihan rem 4 roda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Reset adaptasi ECU &amp; garansi servis 30 hari</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handlePackageSelect('Servis Menengah', 'Rp 850rb+')}
                    className="touch-target w-full py-3 px-4 rounded bg-[#00a86b] hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-none text-center"
                  >
                    Pilih Paket
                  </button>
                </div>
              </div>

              {/* Card 3: Servis Lengkap */}
              <div className={`rounded-xl p-5 flex flex-col justify-between shadow-none transition-all relative ${
                recommendedPackage === 'Servis Lengkap'
                  ? 'border-2 border-emerald-500 bg-slate-50 dark:bg-slate-900 ring-2 ring-emerald-500/20'
                  : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
              }`}>
                {recommendedPackage === 'Servis Lengkap' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-mono font-black uppercase tracking-wider">
                    Rekomendasi Pilihan
                  </div>
                )}

                <div className={`space-y-3 ${recommendedPackage === 'Servis Lengkap' ? 'pt-1' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Servis Lengkap
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      Sesuai SPK
                    </span>
                  </div>

                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    Rp 1.5Jt+
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Solusi tuntas keluhan kaki-kaki glodakan, transmisi, getaran mesin, atau turun mesin.
                  </p>

                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Suku cadang bekas yang diganti dikembalikan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Perbaikan menyeluruh suspensi / transmisi / mesin</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Estimasi disetujui di awal tanpa biaya siluman</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                      <span>Garansi servis 60 hari &amp; free re-check</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handlePackageSelect('Servis Lengkap', 'Rp 1.5Jt+')}
                    className="touch-target w-full py-3 px-4 rounded bg-[#00a86b] hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-none text-center"
                  >
                    Pilih Paket
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
