import React, { useState } from 'react';
import { 
  Wrench, Phone, Search, ShieldCheck, MapPin, Clock, 
  ArrowRight, Check, ExternalLink, Calendar, Car, 
  ChevronRight, AlertCircle, Sparkles, MessageCircle, 
  FileText, Shield, Layers
} from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { formatWhatsAppNumber } from '../../utils/config';

export default function CanvaBengkelLandingView({ 
  tenant, 
  onSearchPlate, 
  onOpenLogin, 
  onNavigateDocs,
  onOpenSuperadmin,
  onNavigatePlatform
}) {
  const [plateInput, setPlateInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [trackingError, setTrackingError] = useState('');

  const tenantName = tenant?.name || 'Bengkel Mobil GPS Motor Kediri';
  const address = tenant?.address || 'Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur';
  const businessHours = tenant?.business_hours || tenant?.businessHours || 'Senin - Sabtu: 08.00 - 17.00 WIB';
  const phoneWa = tenant?.phone_wa || tenant?.phoneWa || '085603307330';
  const cleanWa = formatWhatsAppNumber(phoneWa);

  const mapsUrl = tenant?.maps_url || tenant?.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(tenantName + ' ' + address)}`;

  const handleTrackingSubmit = (e) => {
    e.preventDefault();
    const cleanPlate = plateInput.trim();
    if (!cleanPlate) {
      setTrackingError('Silakan masukkan nomor polisi kendaraan Anda.');
      return;
    }
    setTrackingError('');
    onSearchPlate(cleanPlate);
  };

  const handleBookingWa = (packageLabel = '') => {
    const text = packageLabel 
      ? `Halo ${tenantName}, saya ingin booking servis untuk paket "${packageLabel}". Mohon info ketersediaan slot antrean di workshop. Terima kasih!`
      : `Halo ${tenantName}, saya ingin reservasi jadwal servis mobil di workshop. Mohon informasi ketersediaan slot hari ini. Terima kasih!`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const FACILITY_CARDS = [
    {
      title: 'Pengembalian Suku Cadang',
      subtitle: 'Jaminan Integritas 100% Asli',
      icon: resolveAssetUrl('/images/canva-landing/icon-part-return.png'),
      description: 'Seluruh suku cadang bekas yang telah diganti selalu dikemas rapi dan diserahkan kembali ke tangan Anda saat pengambilan mobil sebagai bukti otentik keaslian penggantian barang baru.',
      tag: 'Transparansi Part'
    },
    {
      title: 'Estimasi Harga Transparan',
      subtitle: 'Tanpa Biaya Siluman & Tersembunyi',
      icon: resolveAssetUrl('/images/canva-landing/icon-pricing.png'),
      description: 'Rincian estimasi biaya jasa mekanik dan harga suku cadang disampaikan jelas di awal sebelum pengerjaan dimulai. Setiap tindakan perbaikan tambahan wajib dikonfirmasi terlebih dahulu ke Anda.',
      tag: 'Pasti & Jelas'
    },
    {
      title: 'Fasilitas Workshop & Pit Lift',
      subtitle: 'Peralatan Standar Pabrikan',
      icon: resolveAssetUrl('/images/canva-landing/icon-facility.png'),
      description: 'Didukung fasilitas lift hidrolik 4 ton, scanner diagnostik OBD-II canggih untuk mobil injeksi, engine crane, dan toolset mekanik lengkap untuk hasil servis presisi dan aman.',
      tag: 'Standar Resmi'
    },
    {
      title: 'Pantau Proses Perbaikan Anda',
      subtitle: 'Dokumentasi Foto Live WhatsApp',
      icon: resolveAssetUrl('/images/canva-landing/icon-tracking.png'),
      description: 'Mekanik mendokumentasikan foto tahapan sebelum, saat, dan sesudah perbaikan. Progres terhubung langsung ke portal pelacakan publik tanpa login atau update live via WhatsApp.',
      tag: 'Live Tracking'
    }
  ];

  const SERVICE_PACKAGES = [
    {
      name: 'Servis Ringan & Tune Up Injeksi',
      price: 'Mulai Rp 250.000',
      badge: 'Favorit',
      items: [
        'Pembersihan Throttle Body & Carbon Cleaner',
        'Pemeriksaan & Pembersihan Busi Pengapian',
        'Scan Komputer OBD-II Sensor Injeksi',
        'Pemeriksaan Filter Udara & Filter Kabin AC',
        'Cek 21 Titik Keselamatan & Kelistrikan Aki',
        'Uji Emisi & Setelan Idle Mesin Optimal'
      ]
    },
    {
      name: 'Servis Kaki-Kaki, Kemudi & Rem',
      price: 'Mulai Rp 350.000',
      badge: 'Rekomendasi',
      items: [
        'Diagnosa Bunyi Glodakan / Goyang Jalan',
        'Cek Tie Rod, Ball Joint & Bushing Arm',
        'Pemeriksaan Shockbreaker & Support Mount',
        'Kuras & Ganti Minyak Rem DOT-3/4',
        'Pembersihan Kanvas & Bubut Piringan Rem',
        'Penyetelan Spooring & Balancing Roda'
      ]
    },
    {
      name: 'Overhaul Mesin & Transmisi',
      price: 'Estimasi Sesuai Diagnosa',
      badge: 'Solutif',
      items: [
        'Turun Mesin Separuh / Turun Mesin Total',
        'Penggantian Packing Set, Silinder Kop & Seal',
        'Skir Klep, Gurah Mesin & Uji Kompresi',
        'Kuras & Flushing Transmisi Matic (ATF/CVT)',
        'Perbaikan Pompa Oli & Sistem Pendingin Radiator',
        'Garansi Servis Tertulis & Uji Jalan Bersama'
      ]
    }
  ];

  return (
    <div className="w-full bg-[#070e1c] text-white font-sans selection:bg-[#20a62f] selection:text-white">
      
      {/* =========================================================================
          SECTION 1: HERO SECTION (Canva Page 2 Exact Match)
          ========================================================================= */}
      <section id="hero" className="relative pt-8 sm:pt-12 pb-14 sm:pb-20 overflow-hidden border-b border-slate-800/80">
        
        {/* Subtle Ambient Radial Backlight */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 75% 25%, rgba(32, 166, 47, 0.15), transparent 60%),
              radial-gradient(ellipse at 25% 65%, rgba(37, 99, 235, 0.15), transparent 60%)
            `
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headline, Highlight, Subheadline, Buttons, 3 Checkmarks */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              
              {/* Top Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0d1f30] border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#20a62f] animate-pulse"></span>
                <span>Standar Pengerjaan Bengkel Mobil Profesional</span>
              </div>

              {/* H1 Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-white leading-[1.15] font-sans">
                Tune Up, Injeksi, Kaki-kaki &amp; Perawatan Berkala{' '}
                <span className="text-[#20a62f] inline-block font-black">
                  Terpercaya
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Servis mobil tanpa rasa was-was di <strong className="text-white font-bold">{tenantName}</strong>. Estimasi transparan &amp; pasti di awal, 100% pengerjaan disertai dokumentasi foto via WhatsApp, dan suku cadang berkualitas tinggi untuk performa mobil terbaik Anda.
              </p>

              {/* Action Buttons (Booking via WhatsApp & Cek Status Servis) */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                {/* 1. Booking via WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleBookingWa()}
                  className="touch-target inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-[#20a62f] hover:bg-[#1b8c27] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-600/30 active:scale-98 group cursor-pointer"
                >
                  <img 
                    src={resolveAssetUrl('/images/canva-landing/icon-whatsapp.png')} 
                    alt="WA" 
                    className="w-4 h-4 object-contain brightness-200" 
                  />
                  <span>Booking via WhatsApp</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* 2. Cek Status Servis Kendaraan */}
                <a
                  href="#lacak-status"
                  className="touch-target inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl border border-slate-700 bg-[#0d1829] hover:bg-[#122238] hover:border-slate-500 text-white font-bold text-sm tracking-wide transition-all active:scale-98 group"
                >
                  <img 
                    src={resolveAssetUrl('/images/canva-landing/icon-search.png')} 
                    alt="Lacak" 
                    className="w-4 h-4 object-contain brightness-200" 
                  />
                  <span>Cek Status Servis Kendaraan</span>
                </a>
              </div>

              {/* 3 Trust Signals Checkmarks */}
              <div className="pt-2 flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 text-xs text-slate-300 font-semibold">
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="w-4 h-4 rounded-full bg-[#20a62f]/20 border border-[#20a62f] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#20a62f] stroke-[3]" />
                  </div>
                  <span>Suku cadang berkualitas</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="w-4 h-4 rounded-full bg-[#20a62f]/20 border border-[#20a62f] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#20a62f] stroke-[3]" />
                  </div>
                  <span>Dokumentasi foto WhatsApp</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="w-4 h-4 rounded-full bg-[#20a62f]/20 border border-[#20a62f] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#20a62f] stroke-[3]" />
                  </div>
                  <span>Garansi servis terus</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Workshop Bay Visual & Floating Location Card */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              
              {/* Workshop Bay Mechanic Visual with feathered edges */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0c1626] shadow-2xl">
                <img 
                  src={resolveAssetUrl('/images/canva-landing/workshop-bay-hero.png')} 
                  alt="Mekanik Bengkel Sedang Melakukan Servis Mobil" 
                  className="w-full h-auto object-cover max-h-[360px] filter contrast-105"
                  loading="eager"
                  fetchpriority="high"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#070e1c] via-transparent to-transparent opacity-80 pointer-events-none" />
              </div>

              {/* Floating Workshop Location & Business Hours Card (Matches Canva Slide) */}
              <div className="mt-3.5 sm:-mt-8 relative z-10 mx-auto max-w-md bg-[#0a1526]/95 border border-slate-700/80 rounded-xl p-3.5 sm:p-4 shadow-xl backdrop-blur-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#20a62f] shrink-0" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Lokasi Workshop
                    </span>
                    <a 
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center space-x-0.5 ml-1 transition-colors"
                    >
                      <span>Lihat Peta &gt;</span>
                    </a>
                  </div>
                  <p className="text-xs text-slate-300 truncate max-w-full font-medium">
                    {address}
                  </p>
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-0.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{businessHours}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookingWa()}
                  className="w-full sm:w-auto touch-target px-3.5 py-2 rounded-lg bg-[#20a62f] hover:bg-[#1b8c27] text-white text-xs font-bold uppercase tracking-wider shrink-0 shadow-sm transition-all text-center"
                >
                  Pesan Sekarang
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FASILITAS & STANDAR PELAYANAN (Canva 4 Distinct Cards)
          ========================================================================= */}
      <section id="fasilitas" className="py-14 sm:py-20 bg-[#091222] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0e2136] border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>STANDAR INTEGRITAS TERTINGGI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase font-sans">
              Fasilitas Workshop &amp; Pelayanan (Berstandar Resmi)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Kami menghadirkan perpaduan transparansi total, kejujuran teknisi, dan fasilitas workshop modern untuk memberikan rasa tenang bagi setiap pemilik mobil.
            </p>
          </div>

          {/* 4 Cards Grid (Matching Canva Section 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {FACILITY_CARDS.map((card, idx) => (
              <div 
                key={idx}
                className="bg-[#0c182b] border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-blue-950/40 flex items-start space-x-4 sm:space-x-5 text-left group"
              >
                {/* Canva Icon Container */}
                <div className="w-14 h-14 rounded-xl bg-[#091322] border border-slate-700/80 flex items-center justify-center shrink-0 shadow-md group-hover:border-emerald-500/50 transition-colors p-2">
                  <img 
                    src={card.icon} 
                    alt={card.title} 
                    className="w-10 h-10 object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                      {card.title}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 shrink-0 uppercase">
                      {card.tag}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-400 font-mono">
                    {card.subtitle}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PAKET SERVIS & ESTIMASI BIAYA
          ========================================================================= */}
      <section id="layanan" className="py-14 sm:py-20 bg-[#070e1c] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0d1f30] border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-mono">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span>ESTIMASI BIAYA TRANSPARAN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase font-sans">
              Pilihan Paket Servis Berkala Mobil
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
              Perawatan terprogram dengan harga terjangkau dan garansi resmi pengerjaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_PACKAGES.map((pkg, idx) => (
              <div 
                key={idx}
                className="bg-[#0c182b] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/60">
                      {pkg.badge}
                    </span>
                    <Wrench className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 font-sans">
                    {pkg.name}
                  </h3>

                  <div className="text-xl font-black text-white mb-5 font-sans">
                    {pkg.price}
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6 text-left">
                    {pkg.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start space-x-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookingWa(pkg.name)}
                  className="w-full touch-target py-3 px-4 rounded-xl bg-[#20a62f] hover:bg-[#1b8c27] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-950/60 active:scale-98"
                >
                  Booking Paket Ini
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: QUICK TRACKING WIDGET (Canva Cek Status Tanpa Login)
          ========================================================================= */}
      <section id="lacak-status" className="py-14 sm:py-20 bg-[#091222] border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#0b172a] border border-slate-700/80 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center space-y-2 mb-8 relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Friction Tracking</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
                Cek Status Kendaraan Anda Tanpa Login
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                Cukup masukkan nomor polisi kendaraan Anda untuk memantau tahapan perbaikan, foto suku cadang, dan rincian nota secara transparan.
              </p>
            </div>

            {/* Tracking Form */}
            <form onSubmit={handleTrackingSubmit} className="space-y-4 max-w-2xl mx-auto relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                
                {/* Input 1: Nomor Polisi */}
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                    Nomor Polisi
                  </label>
                  <div className="relative">
                    <Car className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text"
                      value={plateInput}
                      onChange={(e) => {
                        setPlateInput(e.target.value.toUpperCase());
                        setTrackingError('');
                      }}
                      placeholder="Contoh: AG 1822 AB"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-700 bg-[#070e1a] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono tracking-wider uppercase"
                    />
                  </div>
                </div>

                {/* Input 2: Nomor Telepon (Terdaftar) */}
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                    Nomor Telepon (Terdaftar)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input 
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-700 bg-[#070e1a] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

              </div>

              {trackingError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{trackingError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full touch-target py-3.5 px-6 rounded-xl bg-[#20a62f] hover:bg-[#1b8c27] text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/60 active:scale-98 flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Cek Status Sekarang</span>
              </button>

              {/* Quick Sample Demo Plates */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-[11px]">Coba plat sampel:</span>
                {['AG 1822 AB', 'B 1234 ABC', 'N 9012 XY'].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setPlateInput(sample);
                      setTrackingError('');
                      onSearchPlate(sample);
                    }}
                    className="px-2.5 py-1 rounded bg-[#070e1a] border border-slate-700 text-emerald-400 font-mono text-[11px] font-bold hover:border-emerald-500 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* Privacy Assurance Banner */}
              <div className="pt-3 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Data Anda aman dan hanya digunakan untuk pengecekan status servis kendaraan.</span>
              </div>
            </form>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LOKASI & GOOGLE MAPS
          ========================================================================= */}
      <section id="lokasi" className="py-14 sm:py-20 bg-[#070e1c] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Workshop Address & Hours Card */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0d1f30] border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>LOKASI WORKSHOP</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
                Kunjungi Workshop Kami
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Lokasi strategis dan mudah dijangkau dengan area parkir luas serta ruang tunggu ber-AC yang nyaman saat kendaraan Anda dirawat.
              </p>

              <div className="space-y-4 bg-[#0b172a] border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Alamat</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Jam Operasional</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{businessHours}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Kontak / WhatsApp</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{phoneWa}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target inline-flex items-center justify-center space-x-2 py-3 px-5 rounded-xl bg-[#20a62f] hover:bg-[#1b8c27] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Petunjuk Arah Google Maps</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleBookingWa()}
                  className="touch-target inline-flex items-center justify-center space-x-2 py-3 px-5 rounded-xl border border-slate-700 bg-[#0d1829] hover:bg-[#122238] text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Hubungi via WA</span>
                </button>
              </div>

            </div>

            {/* Map Preview Frame */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0b172a] shadow-xl h-[340px] sm:h-[400px] relative">
                {tenant?.maps_embed_url || tenant?.mapsEmbedUrl ? (
                  <iframe
                    title="Peta Lokasi Workshop"
                    src={tenant.maps_embed_url || tenant.mapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#081220]">
                    <MapPin className="w-12 h-12 text-emerald-400 animate-bounce" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{tenantName}</h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">{address}</p>
                    </div>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md mt-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka di Google Maps Langsung</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          FOOTER (Canva Dark Minimalist Footer)
          ========================================================================= */}
      <footer className="py-10 bg-[#050a14] border-t border-slate-800/80 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand & Copyright */}
          <div className="flex items-center space-x-3">
            <img 
              src={resolveAssetUrl('/images/canva-landing/workshop-logo.png')} 
              alt="Logo" 
              className="w-5 h-5 object-contain"
            />
            <span>
              &copy; 2026 <strong className="text-slate-200">{tenantName}</strong>. Semua hak dilindungi.
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <a href="#hero" className="hover:text-white transition-colors">Beranda</a>
            <a href="#fasilitas" className="hover:text-white transition-colors">Fasilitas</a>
            <a href="#layanan" className="hover:text-white transition-colors">Paket Servis</a>
            <a href="#lacak-status" className="hover:text-white transition-colors">Cek Status</a>
            <a href="#lokasi" className="hover:text-white transition-colors">Lokasi</a>
            {onNavigatePlatform && (
              <button 
                type="button" 
                onClick={() => onNavigatePlatform()} 
                className="hover:text-emerald-400 font-bold transition-colors cursor-pointer"
              >
                Platform SaaS
              </button>
            )}
            {onNavigateDocs ? (
              <button 
                type="button" 
                onClick={() => onNavigateDocs()} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Panduan Sistem
              </button>
            ) : (
              <a href="/panduan" className="hover:text-white transition-colors">Panduan Sistem</a>
            )}
            <button
              type="button"
              onClick={onOpenLogin}
              className="hover:text-emerald-400 font-bold transition-colors cursor-pointer"
            >
              Portal Masuk
            </button>
            {onOpenSuperadmin && (
              <button
                type="button"
                onClick={onOpenSuperadmin}
                className="hover:text-amber-400 transition-colors cursor-pointer opacity-70 hover:opacity-100"
                title="Superadmin Portal"
              >
                Superadmin
              </button>
            )}
          </div>

        </div>
      </footer>

    </div>
  );
}
