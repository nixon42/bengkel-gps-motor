import React, { useState } from 'react';
import { 
  Zap, Clock, Calendar, Search, ArrowRight, Phone, MessageSquare, 
  ShieldCheck, Wrench, AlertTriangle, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';

const EXPRESS_SERVICES = [
  {
    name: 'Ganti Oli & Filter Cepat',
    duration: '30 Menit',
    desc: 'Penggantian oli mesin resmi bersegel + filter oli baru + cek tekanan ban & air wiper.',
    tag: 'Tanpa Antre Panjang'
  },
  {
    name: 'Tune Up EFI & Scan OBD2',
    duration: '90 Menit',
    desc: 'Scan DTC error, pembersihan injektor ultrasonic, carbon clean silinder, dan kalibrasi RPM idle.',
    tag: 'Mobil Kembali Bertenaga'
  },
  {
    name: 'Inspeksi Kaki-Kaki di Lift',
    duration: '45 Menit',
    desc: 'Mobil naik lift hidrolik 4-ton untuk periksa tie rod, link stabilizer, shockbreaker, dan rem.',
    tag: 'Hilangkan Glodakan'
  },
  {
    name: 'Cek Kelistrikan & Aki',
    duration: '20 Menit',
    desc: 'Pengujian arus pengisian alternator dan daya simpan aki dengan tester conductance digital.',
    tag: 'Cegah Mogok di Jalan'
  }
];

export default function HeroExpressVariant({ onSearchPlate, defaultPlate = '' }) {
  const [activeTab, setActiveTab] = useState('track'); // 'track' | 'booking' | 'emergency'
  const [plateInput, setPlateInput] = useState(defaultPlate);
  
  // Quick Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingPlate, setBookingPlate] = useState('');
  const [bookingCar, setBookingCar] = useState('Toyota Avanza');
  const [bookingService, setBookingService] = useState('Tune Up EFI & Carbon Clean');
  const [bookingDate, setBookingDate] = useState('Hari Ini');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (plateInput.trim()) {
      onSearchPlate(plateInput.trim());
    }
  };

  const handleQuickPlate = (plate) => {
    setPlateInput(plate);
    onSearchPlate(plate);
  };

  const handleSendBookingWa = (e) => {
    e.preventDefault();
    const message = `Halo Bengkel GPS Motor Kediri, saya ingin reservasi slot servis:%0A%0A` +
      `• Nama: ${encodeURIComponent(bookingName || 'Pelanggan')}%0A` +
      `• Mobil: ${encodeURIComponent(bookingCar)}%0A` +
      `• Plat Nomor: ${encodeURIComponent(bookingPlate || '-')}%0A` +
      `• Layanan: ${encodeURIComponent(bookingService)}%0A` +
      `• Waktu Servis: ${encodeURIComponent(bookingDate)}%0A%0A` +
      `Mohon info ketersediaan stall lift. Terima kasih.`;
    window.open(`https://wa.me/6285603307330?text=${message}`, '_blank');
  };

  return (
    <section className="bg-slate-900 text-white border-b border-slate-800 py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top High-Velocity Dispatch Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded p-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
              <strong className="text-white font-mono font-bold uppercase tracking-wider text-[11px]">
                Kapasitas Lift Hari Ini:
              </strong>
              <span className="text-sky-300 font-mono text-[11px] bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                2 Slot Pit Lift Tersedia
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Buka 08:00 - 17:00 WIB</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Express Service Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header & Subhead */}
        <div className="max-w-3xl mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-950 text-sky-300 border border-sky-800 text-xs font-mono font-bold tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            <span>EXPRESS PITSTOP &amp; FAST TRACK WORKSHOP KEDIRI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Penanganan Cepat, <span className="text-sky-400">Tanpa Waktu Terbuang</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Lacak kendaraan secara kilat, reservasi slot pit lift hari ini via WhatsApp, atau hubungi tim teknisi GPS Motor untuk konsultasi langsung.
          </p>
        </div>

        {/* Full-Width Interactive Action Hub (Command Center) */}
        <div className="bg-slate-950 border-2 border-slate-700 rounded overflow-hidden mb-10">
          
          {/* Action Tabs Header */}
          <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/80">
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`touch-target py-3.5 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold font-mono transition-colors border-r border-slate-800 flex items-center justify-center gap-2 ${
                activeTab === 'track'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>1. Lacak Kendaraan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('booking')}
              className={`touch-target py-3.5 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold font-mono transition-colors border-r border-slate-800 flex items-center justify-center gap-2 ${
                activeTab === 'booking'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>2. Reservasi Slot Lift</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('emergency')}
              className={`touch-target py-3.5 px-3 sm:px-6 text-center text-xs sm:text-sm font-bold font-mono transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'emergency'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>3. Darurat / Derek</span>
            </button>
          </div>

          {/* Action Hub Body */}
          <div className="p-5 sm:p-7">
            
            {/* Tab 1: Fast License Plate Search */}
            {activeTab === 'track' && (
              <div className="space-y-4">
                <div className="max-w-xl">
                  <h2 className="text-base font-bold text-white uppercase font-mono">
                    Lacak Status Pengerjaan Mobil
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Cukup ketik plat nomor untuk melihat tahapan pengerjaan dan foto suku cadang tanpa login.
                  </p>
                </div>

                <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={plateInput}
                      onChange={(e) => setPlateInput(e.target.value)}
                      placeholder="Contoh: AG 1822 AB"
                      className="touch-target w-full uppercase px-4 py-3 rounded bg-slate-900 border-2 border-slate-700 text-white text-base font-mono font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="touch-target flex items-center justify-center gap-2 px-6 py-3 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold font-mono text-sm transition-colors uppercase tracking-wider"
                  >
                    <Search className="w-4 h-4" />
                    <span>Lacak Cepat</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Uji plat contoh:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickPlate('AG 1822 AB')}
                    className="touch-target px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono text-xs font-bold border border-slate-700 transition-colors"
                  >
                    AG 1822 AB (Avanza)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPlate('AG 1044 RK')}
                    className="touch-target px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-xs font-bold border border-slate-700 transition-colors"
                  >
                    AG 1044 RK (Innova)
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Quick WhatsApp Booking Form */}
            {activeTab === 'booking' && (
              <form onSubmit={handleSendBookingWa} className="space-y-4">
                <div className="max-w-xl">
                  <h2 className="text-base font-bold text-white uppercase font-mono">
                    Reservasi Slot Servis &amp; Lift
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Isi detail kendaraan Anda. Sistem akan menyiapkan pesan WhatsApp rapi langsung ke admin bengkel.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 text-xs font-bold font-mono mb-1.5 uppercase">
                      Nama Pemilik
                    </label>
                    <input
                      type="text"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Bambang"
                      className="touch-target w-full px-3 py-2.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-bold font-mono mb-1.5 uppercase">
                      Model Kendaraan
                    </label>
                    <input
                      type="text"
                      value={bookingCar}
                      onChange={(e) => setBookingCar(e.target.value)}
                      placeholder="Toyota Avanza"
                      className="touch-target w-full px-3 py-2.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-bold font-mono mb-1.5 uppercase">
                      Plat Nomor
                    </label>
                    <input
                      type="text"
                      value={bookingPlate}
                      onChange={(e) => setBookingPlate(e.target.value)}
                      placeholder="AG 1822 AB"
                      className="touch-target w-full uppercase px-3 py-2.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-bold font-mono mb-1.5 uppercase">
                      Waktu Servis
                    </label>
                    <select
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="touch-target w-full px-3 py-2.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-sky-500"
                    >
                      <option value="Hari Ini (Slot Pagi 09:00)">Hari Ini (Pagi 09:00)</option>
                      <option value="Hari Ini (Slot Siang 13:00)">Hari Ini (Siang 13:00)</option>
                      <option value="Besok Pagi (08:30)">Besok Pagi (08:30)</option>
                      <option value="Jadwal Akhir Pekan (Sabtu)">Sabtu Pagi</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400 font-mono">
                    WhatsApp Resmi Bengkel: <strong className="text-emerald-400">0856-0330-7330</strong>
                  </div>
                  <button
                    type="submit"
                    className="touch-target w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-sm transition-colors shadow-none"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Kirim Reservasi ke WhatsApp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Emergency Assistance Hotline */}
            {activeTab === 'emergency' && (
              <div className="space-y-4">
                <div className="max-w-xl">
                  <h2 className="text-base font-bold text-white uppercase font-mono flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Bantuan Darurat / Mobil Mogok di Kediri</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Mengalami mesin mati mendadak, temperatur overheat di tanjakan, atau aki tekor di area Gampengrejo, Papar, atau Kediri Kota?
                  </p>
                </div>

                <div className="p-4 rounded bg-rose-950/40 border border-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-rose-300 font-mono uppercase font-bold block">
                      Hotline Mekanik Siaga:
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-white">
                      0856-0330-7330
                    </span>
                    <p className="text-[11px] text-slate-300">
                      Sebutkan lokasi Anda di Kediri dan gejala kerusakan mobil untuk penanganan teknisi.
                    </p>
                  </div>

                  <a
                    href="https://wa.me/6285603307330?text=Halo%20Bengkel%20GPS%20Motor%2C%20mobil%20saya%20mengalami%20kondisi%20darurat%20di%20Kediri."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-sm transition-colors uppercase tracking-wider shrink-0"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Panggil Mekanik Darurat</span>
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Express Service Fast-Track Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Layanan Kilat Standar GPS Motor (Estimasi Waktu Terukur)
            </h2>
            <span className="text-[11px] text-sky-400 font-mono">
              Pit Lift 4-Ton Standar Pabrikan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {EXPRESS_SERVICES.map((svc, idx) => (
              <div 
                key={idx}
                className="p-4 rounded border border-slate-800 bg-slate-950 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      {svc.duration}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {svc.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white pt-1">
                    {svc.name}
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {svc.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Nota &amp; Garansi</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
