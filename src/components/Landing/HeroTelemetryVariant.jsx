import React, { useState } from 'react';
import { 
  Cpu, Wrench, ShieldCheck, Gauge, Zap, Search, ArrowRight, 
  MapPin, Phone, Activity, Sliders, CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';

const TRIAGE_SYMPTOMS = [
  {
    id: 'efi',
    title: 'Mesin Brebet & Boros Bensin',
    category: 'Diagnosa EFI / Sensor',
    scannerDtc: 'P0171 / P0300 (Fuel Trim Lean / Misfire)',
    toolTarget: 'Launch X431 OBD2 & Ultrasonic Bench',
    sopTarget: 'Scanning DTC live stream, ultrasonic injector clean, carbon clean ruang bakar, kalibrasi ISC.',
    spec: 'Fuel Pressure: 3.0 - 3.5 Bar • Idle: 750 ± 50 RPM',
    estTime: '1.5 - 3 Jam',
    samplePlate: 'AG 1822 AB'
  },
  {
    id: 'suspension',
    title: 'Bunyi Glodakan di Jalan Kediri',
    category: 'Kaki-Kaki & Suspensi',
    scannerDtc: 'Mekanikal Kaki-Kaki / Sasis',
    toolTarget: 'Two-Post Lift 4-Ton & Press Bushing 20T',
    sopTarget: 'Inspeksi clearance roda, press bushing arm hidrolik tanpa getok, ganti tie rod/stabilizer, toe alignment.',
    spec: 'Bebas Oblak 100% • Toleransi Runout Bearing < 0.05 mm',
    estTime: '2 - 4 Jam',
    samplePlate: 'AG 1044 RK'
  },
  {
    id: 'electrical',
    title: 'Starter Cetek & Aki Drop',
    category: 'Elektrikal & Starter',
    scannerDtc: 'P0562 (System Voltage Low)',
    toolTarget: 'Fluke Multimeter & Alternator Bench',
    sopTarget: 'Uji conductance CCA baterai, uji arus pengisian dinamo alternator, peremajaan brush starter & relay.',
    spec: 'Tegangan Pengisian: 13.8 - 14.4 V • Drop Crank > 9.6 V',
    estTime: '1 - 2.5 Jam',
    samplePlate: 'AG 1530 EF'
  },
  {
    id: 'overheat',
    title: 'Mesin Overheat & Air Mendidih',
    category: 'Sistem Pendingin & Mesin',
    scannerDtc: 'P0217 (Engine Coolant Over-Temp)',
    toolTarget: 'Compression Tester & Dial Gauge',
    sopTarget: 'Uji tekanan sistem radiator, uji kompresi 4 silinder, inspeksi kelengkungan silinder head bila melenting.',
    spec: 'Kompresi: 11 - 13 Bar • Toleransi Rata Head < 0.05 mm',
    estTime: '3 - 5 Hari (Bongkar Head)',
    samplePlate: 'AG 8912 V'
  }
];

export default function HeroTelemetryVariant({ onSearchPlate, defaultPlate = '' }) {
  const [selectedTriage, setSelectedTriage] = useState(TRIAGE_SYMPTOMS[0]);
  const [plateInput, setPlateInput] = useState(defaultPlate);

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

  return (
    <section className="bg-slate-900 text-white border-b border-slate-800 py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Real-time Workshop Dispatch Bar (Mechanical Telemetry) */}
        <div className="bg-slate-950 border border-slate-800 rounded p-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Live Stall Status Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider hidden sm:inline">
                Status Stall Workshop:
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                STALL-01 (EFI Scanner): READY
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                STALL-02 (Overhaul): ACTIVE
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                STALL-03 (Lift 4-Ton): READY
              </span>
            </div>

            {/* Hours & Direct Hotline */}
            <div className="flex items-center gap-4 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold">08:00 - 17:00 WIB</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sambiresik, Kediri</span>
              </div>
            </div>

          </div>
        </div>

        {/* Hero Grid: Left Triage Matrix & Right Plate Intake */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Workshop Identity & Diagnostic Console */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-950 text-blue-400 border border-blue-800 text-xs font-mono font-bold tracking-wide">
                <Cpu className="w-3.5 h-3.5" />
                <span>SPESIALISASI INJEKSI EFI &amp; MESIN MOBIL KEDIRI</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Diagnostik Presisi, <span className="text-blue-500">Bukan Kira-Kira</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Bengkel Mobil GPS Motor Kediri menangani perbaikan mobil modern dengan scanner OBD2 digital, pit lift hidrolik 4-ton, dan uji semprot injektor ultrasonic. Setiap kerusakan terukur jelas sebelum dibongkar.
              </p>
            </div>

            {/* Interactive Diagnostic Triage Matrix */}
            <div className="bg-slate-950 border border-slate-800 rounded p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Matriks Diagnosa Masalah Mobil
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Pilih keluhan di bawah:
                </span>
              </div>

              {/* Symptom Selection Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRIAGE_SYMPTOMS.map((item) => {
                  const isSelected = selectedTriage.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTriage(item)}
                      className={`touch-target p-2.5 rounded text-left transition-colors border ${
                        isSelected 
                          ? 'bg-blue-900/50 border-blue-500 text-white' 
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="block text-[11px] font-mono text-blue-400 font-semibold truncate">
                        {item.category}
                      </span>
                      <strong className="block text-xs font-bold mt-0.5 leading-snug line-clamp-2">
                        {item.title}
                      </strong>
                    </button>
                  );
                })}
              </div>

              {/* Triage Detail Inspector Card */}
              <div className="bg-slate-900 border border-slate-800 rounded p-3.5 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-400 font-mono text-[11px]">Protokol Alat:</span>
                    <strong className="text-white font-medium">{selectedTriage.toolTarget}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-400">
                    <Clock className="w-3 h-3" />
                    <span>Est. Pengerjaan: {selectedTriage.estTime}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] block font-mono">SOP &amp; Tindakan Teknisi:</span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedTriage.sopTarget}
                  </p>
                </div>

                <div className="pt-1 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Target Toleransi: {selectedTriage.spec}</span>
                </div>
              </div>

            </div>

            {/* Direct Reassurances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Foto pengerjaan terkirim otomatis ke WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Suku cadang bekas wajib diserahkan kembali</span>
              </div>
            </div>

          </div>

          {/* Right Column: Tactile License Plate Intake Terminal */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950 border-2 border-blue-600 rounded p-6 shadow-none">
              
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-white uppercase tracking-tight font-mono">
                    Terminal Pelacakan Servis
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono font-bold">
                    ONLINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Pantau tahapan pengerjaan kendaraan secara live tanpa perlu registrasi atau login akun.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="telemetry-plate-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                    Plat Nomor Kendaraan (Wilayah Kediri &amp; Jatim)
                  </label>
                  
                  {/* Plate Input with Indonesian Car Plate Visual */}
                  <div className="relative bg-slate-900 border-2 border-slate-700 rounded p-2 focus-within:border-blue-500 transition-colors">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1 mb-1">
                      <span>KORLANTAS INDONESIA</span>
                      <span>SAMSAT KEDIRI</span>
                    </div>
                    <input
                      id="telemetry-plate-input"
                      type="text"
                      value={plateInput}
                      onChange={(e) => setPlateInput(e.target.value)}
                      placeholder="AG 1822 AB"
                      className="touch-target w-full uppercase px-3 py-3 rounded bg-black text-white text-xl sm:text-2xl font-mono font-black tracking-widest text-center placeholder:text-slate-600 focus:outline-none border border-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Format bebas: spasi otomatis disesuaikan</span>
                    <span className="font-medium text-emerald-400 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Data nama &amp; HP disensor</span>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="touch-target w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-colors shadow-none uppercase font-mono tracking-wider"
                >
                  <Search className="w-4 h-4" />
                  <span>Lacak Pengerjaan Mobil</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample Quick Testing Chips */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <span className="block text-xs font-semibold text-slate-400 mb-2 font-mono">
                  Plat uji cepat simulasi:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPlate('AG 1822 AB')}
                    className="touch-target inline-flex items-center px-3 py-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-blue-950 hover:border-blue-700 font-mono text-xs font-bold text-blue-400 transition-colors"
                  >
                    AG 1822 AB (Avanza)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPlate('AG 1044 RK')}
                    className="touch-target inline-flex items-center px-3 py-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 font-mono text-xs font-bold text-slate-200 hover:text-white transition-colors"
                  >
                    AG 1044 RK (Innova)
                  </button>
                </div>
              </div>

              {/* Contact Assistance */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Konsultasi kerusakan via WA:</span>
                <a 
                  href="https://wa.me/6285603307330" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>0856-0330-7330</span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
