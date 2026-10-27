import React, { useState } from 'react';
import { 
  PackageCheck, Receipt, Wrench, Smartphone, 
  MapPin, Clock, Phone, ArrowRight, Check, 
  ExternalLink, Search, Car, AlertCircle, Compass
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

  // Default coordinates: Gampengrejo, Kediri (-7.788487, 112.030588)
  const lat = tenant?.latitude || -7.788487;
  const lon = tenant?.longitude || 112.030588;
  const bboxMinLon = (Number(lon) - 0.015).toFixed(4);
  const bboxMinLat = (Number(lat) - 0.015).toFixed(4);
  const bboxMaxLon = (Number(lon) + 0.015).toFixed(4);
  const bboxMaxLat = (Number(lat) + 0.015).toFixed(4);

  // OpenStreetMap embed URL & external view link
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxMinLon}%2C${bboxMinLat}%2C${bboxMaxLon}%2C${bboxMaxLat}&layer=mapnik&marker=${lat}%2C${lon}`;
  const osmExternalUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
  const activeMapEmbed = tenant?.maps_embed_url || tenant?.mapsEmbedUrl || osmEmbedUrl;

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

  // 4 Standards of Integrity & Facilities with clean vector icons
  const FACILITY_ITEMS = [
    {
      title: 'Pengembalian Suku Cadang',
      subtitle: 'Jaminan Integritas 100% Asli',
      icon: PackageCheck,
      description: 'Seluruh suku cadang bekas yang telah diganti selalu dikemas rapi dan diserahkan kembali ke tangan Anda saat pengambilan mobil sebagai bukti otentik keaslian penggantian barang baru.'
    },
    {
      title: 'Estimasi Harga Transparan',
      subtitle: 'Tanpa Biaya Siluman & Tersembunyi',
      icon: Receipt,
      description: 'Rincian estimasi biaya jasa mekanik dan harga suku cadang disampaikan jelas di awal sebelum pengerjaan dimulai. Setiap tindakan perbaikan tambahan wajib dikonfirmasi terlebih dahulu ke Anda.'
    },
    {
      title: 'Fasilitas Workshop & Pit Lift',
      subtitle: 'Peralatan Standar Pabrikan',
      icon: Wrench,
      description: 'Didukung fasilitas lift hidrolik 4 ton, scanner diagnostik OBD-II canggih untuk mobil injeksi, engine crane, dan toolset mekanik lengkap untuk hasil servis presisi dan aman.'
    },
    {
      title: 'Pantau Proses Perbaikan Anda',
      subtitle: 'Dokumentasi Foto Live WhatsApp',
      icon: Smartphone,
      description: 'Mekanik mendokumentasikan foto tahapan sebelum, saat, dan sesudah perbaikan. Progres terhubung langsung ke portal pelacakan publik tanpa login atau update live via WhatsApp.'
    }
  ];

  const SERVICE_PACKAGES = [
    {
      name: 'Servis Ringan & Tune Up Injeksi',
      price: 'Mulai Rp 250.000',
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
          SECTION 1: HERO SECTION (Exact Canva Slide 1 Specification, Zero Pill Slop)
          ========================================================================= */}
      <section id="hero" className="relative pt-8 sm:pt-12 pb-14 sm:pb-20 overflow-hidden border-b border-slate-800">
        
        {/* Subtle Ambient Radial Backlight */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 75% 25%, rgba(32, 166, 47, 0.12), transparent 60%),
              radial-gradient(ellipse at 25% 65%, rgba(37, 99, 235, 0.12), transparent 60%)
            `
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headline, Highlight, Subheadline, Buttons, 3 Checkmarks */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              
              {/* H1 Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-white leading-[1.15] font-sans">
                Tune Up, Injeksi, Kaki-kaki &amp; Perawatan Berkala{' '}
                <span className="text-[#20a62f] block sm:inline">
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
                  className="touch-target inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-[#20a62f] hover:bg-[#1b8c27] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/60 active:scale-98 group cursor-pointer"
                >
                  <Phone className="w-4 h-4 fill-white shrink-0" />
                  <span>Booking via WhatsApp</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                {/* 2. Cek Status Servis Kendaraan */}
                <a
                  href="#lacak-status"
                  className="touch-target inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl border border-slate-700 bg-[#0d1829] hover:bg-[#122238] hover:border-slate-500 text-white font-bold text-sm tracking-wide transition-all active:scale-98 group"
                >
                  <Search className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Cek Status Servis Kendaraan</span>
                </a>
              </div>

              {/* 3 Trust Signals Checkmarks (Clean inline list, zero pill badges) */}
              <div className="pt-2 flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
                <div className="flex items-center space-x-2 shrink-0">
                  <Check className="w-4 h-4 text-[#20a62f] stroke-[3]" />
                  <span>Suku cadang berkualitas</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Check className="w-4 h-4 text-[#20a62f] stroke-[3]" />
                  <span>Dokumentasi foto WhatsApp</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Check className="w-4 h-4 text-[#20a62f] stroke-[3]" />
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
                  className="w-full h-auto object-cover max-h-[340px] filter contrast-105"
                  loading="eager"
                  fetchpriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070e1c] via-transparent to-transparent opacity-80 pointer-events-none" />
              </div>

              {/* Floating Workshop Location & Business Hours Card (Matches Canva Slide 1) */}
              <div className="mt-3.5 relative z-10 bg-[#0a1526] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#20a62f] uppercase tracking-wider font-mono">
                      LOKASI WORKSHOP
                    </span>
                    <a 
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center space-x-0.5 ml-1 transition-colors"
                    >
                      <span>Lihat Peta &gt;</span>
                    </a>
                  </div>
                  <p className="text-xs text-white truncate max-w-full font-medium">
                    {address}
                  </p>
                  <div className="pt-0.5">
                    <span className="text-[11px] font-bold text-[#20a62f] uppercase tracking-wider font-mono block">
                      JAM OPERASIONAL
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {businessHours}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBookingWa()}
                  className="w-full sm:w-auto touch-target px-4 py-2.5 rounded-lg bg-[#20a62f] hover:bg-[#1b8c27] text-white text-xs font-bold uppercase tracking-wider shrink-0 shadow-sm transition-all text-center cursor-pointer"
                >
                  Pesan Sekarang
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FASILITAS & STANDAR PELAYANAN (Ultra-Sharp Vector Icons, No Pills)
          ========================================================================= */}
      <section id="fasilitas" className="py-14 sm:py-20 bg-[#091222] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase font-sans">
              Fasilitas Workshop &amp; Pelayanan (Berstandar Resmi)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Kami menghadirkan perpaduan transparansi total, kejujuran teknisi, dan fasilitas workshop modern untuk memberikan rasa tenang bagi setiap pemilik mobil.
            </p>
          </div>

          {/* 4 Cards Grid with Crisp High-Resolution Vector Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {FACILITY_ITEMS.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-[#0c182b] border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-blue-950/40 flex items-start space-x-4 sm:space-x-5 text-left group"
                >
                  {/* Razor-sharp Vector Icon Container */}
                  <div className="w-12 h-12 rounded-xl bg-[#20a62f]/15 border border-[#20a62f]/30 flex items-center justify-center shrink-0 text-[#20a62f] shadow-inner group-hover:border-[#20a62f] group-hover:bg-[#20a62f]/25 transition-all">
                    <IconComponent className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  {/* Content */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#20a62f] font-mono">
                      {item.subtitle}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PAKET SERVIS & ESTIMASI BIAYA (No AI Slop Pills)
          ========================================================================= */}
      <section id="layanan" className="py-14 sm:py-20 bg-[#070e1c] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
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
                    <span className="text-xs font-bold font-mono text-[#20a62f] uppercase tracking-wider">
                      Paket {idx + 1}
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
                  className="w-full touch-target py-3 px-4 rounded-xl bg-[#20a62f] hover:bg-[#1b8c27] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-950/60 active:scale-98 cursor-pointer"
                >
                  Booking Paket Ini
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: QUICK TRACKING WIDGET (Single Horizontal Bar, No AI Pills)
          ========================================================================= */}
      <section id="lacak-status" className="py-14 sm:py-20 bg-[#091222] border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#0b172a] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            
            <div className="text-center space-y-2 mb-8 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
                Cek Status Kendaraan Anda Tanpa Login
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Cukup masukkan nomor polisi kendaraan Anda untuk memantau tahapan perbaikan, foto suku cadang, dan rincian nota secara transparan.
              </p>
            </div>

            {/* Tracking Form (Aligned cleanly in a row on desktop) */}
            <form onSubmit={handleTrackingSubmit} className="space-y-4 max-w-4xl mx-auto relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-end">
                
                {/* Input 1: Nomor Polisi */}
                <div className="md:col-span-5 text-left">
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
                <div className="md:col-span-4 text-left">
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

                {/* Submit Button */}
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="w-full touch-target py-3.5 px-5 rounded-xl bg-[#20a62f] hover:bg-[#1b8c27] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/60 active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Cek Status</span>
                  </button>
                </div>

              </div>

              {trackingError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2 text-left">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{trackingError}</span>
                </div>
              )}

              {/* Privacy Assurance Banner */}
              <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-slate-400 font-mono">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Data Anda aman dan hanya digunakan untuk pengecekan status servis kendaraan.</span>
              </div>
            </form>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LOKASI & INTERACTIVE OPENSTREETMAP (Live Interactive Map)
          ========================================================================= */}
      <section id="lokasi" className="py-14 sm:py-20 bg-[#070e1c] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Workshop Address & Hours Card */}
            <div className="lg:col-span-5 space-y-6 text-left">
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
                  className="touch-target inline-flex items-center justify-center space-x-2 py-3 px-5 rounded-xl border border-slate-700 bg-[#0d1829] hover:bg-[#122238] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Hubungi via WA</span>
                </button>
              </div>

            </div>

            {/* Interactive OpenStreetMap Frame */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0b172a] shadow-xl h-[360px] sm:h-[420px] relative flex flex-col">
                <iframe
                  title="Peta Interaktif Workshop OpenStreetMap"
                  src={activeMapEmbed}
                  width="100%"
                  height="100%"
                  className="flex-1 w-full border-0"
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                
                {/* Map Footer Bar with Direct Links */}
                <div className="bg-[#070e1a] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>OpenStreetMap / GPS: {lat.toFixed(4)}, {lon.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <a
                      href={osmExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Buka di OSM</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          FOOTER (Canva Dark Minimalist Footer)
          ========================================================================= */}
      <footer className="py-10 bg-[#050a14] border-t border-slate-800 text-xs text-slate-400">
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
