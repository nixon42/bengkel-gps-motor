import React, { useState } from 'react';
import { 
  Gauge, Cpu, Wrench, ShieldCheck, Zap, Clock, Check, 
  MessageSquare, ArrowRight, AlertTriangle, Activity, 
  FileText, CheckCircle2, Sliders, ChevronRight
} from 'lucide-react';

/* =========================================================================
   DATA DEFINITIONS FOR WORKSHOP SERVICES
   ========================================================================= */

const SERVICES_DATA = [
  {
    code: 'SVC-01/EFI',
    stallId: 'STALL-01',
    stallName: 'Pit Diagnostik & Komputer EFI',
    title: 'Diagnostik Komputer, EFI & Tune Up Mesin',
    tag: 'Spesialis Utama',
    icon: Cpu,
    status: 'Ready (Standby)',
    turnaround: '1.5 - 3 Jam',
    turnaroundShort: '1.5 - 3 Jam',
    tools: ['Launch X431 OBD2 Scanner', 'Ultrasonic Injector Cleaner', 'Fuel Pressure Gauge', 'Carbon Cleaner Kit'],
    symptom: 'Mesin Brebet, Gas Tertahan & Boros Bensin',
    symptomDesc: 'Tarikan mobil terasa berat saat gas diinjak mendadak, konsumsi bahan bakar boros, atau lampu check engine (MIL) menyala kuning di speedometer.',
    diagnosis: 'Kerak karbon menumpuk di ruang bakar, semprotan lubang injektor tersumbat, throttle body kotor, atau sensor O2 mengirim sinyal keliru ke ECU.',
    actionPlan: 'Scanning DTC live-stream, pembersihan ultrasonic 4 injektor, kalibrasi ISC/throttle body, pembersihan ruang bakar (Carbon Clean), dan reset adaptasi ECU.',
    sop: [
      'Colok scanner OBD2 & baca data live sensor (MAF, O2, TPS, Fuel Trim)',
      'Lepas injektor & uji semprotan pada tabung ukur ultrasonic cleaning',
      'Pembersihan throttle body & kalibrasi Idle Speed Control (ISC)',
      'Carbon Clean ruang bakar & penyetelan celah elektroda busi (0.8 - 1.1 mm)'
    ],
    specTarget: 'Tekanan Fuel Pump: 3.0 - 3.5 Bar • Idle RPM: 750 ± 50 RPM • Vacuum: -60 s/d -70 kPa',
    warranty: 'Garansi Servis 14 Hari',
    suitableVehicles: 'Toyota Avanza/Veloz, Innova, Calya, Daihatsu Xenia, Sigra, Honda Brio, Mobilio, Suzuki Ertiga'
  },
  {
    code: 'SVC-02/OVR',
    stallId: 'STALL-02',
    stallName: 'Heavy Engine Overhaul Bay',
    title: 'Overhaul Mesin (Turun Mesin Total & Semi)',
    tag: 'Mesin Berat',
    icon: Wrench,
    status: 'Active (Pengerjaan)',
    turnaround: '3 - 5 Hari Kerja',
    turnaroundShort: '3 - 5 Hari',
    tools: ['Kunci Momen Torsi Presisi', 'Mikrometer Sekrup Clearance', 'Compression Tester Gauge', 'Alat Skir Klep'],
    symptom: 'Mesin Overheat, Asap Putih & Oli Berkurang Cepat',
    symptomDesc: 'Temperatur mesin naik drastis di tanjakan, air reservoir radiator mendidih menyembur, oli mesin berkurang drastis tanpa bocor luar, atau keluar asap putih pekat dari knalpot.',
    diagnosis: 'Cylinder head melengkung akibat overheat, paking silinder bocor kompresi, ring piston aus/macet, atau seal klep getas termakan usia.',
    actionPlan: 'Bongkar silinder head, perataan permukaan ke tukang bubut presisi, skir klep, ganti paking cylinder head original, ganti ring piston & metal jalan/duduk.',
    sop: [
      'Uji kompresi tiap silinder (standar min. 11 - 13 bar)',
      'Pembongkaran silinder head & pengukuran kelengkungan mistar baja',
      'Skir klep presisi, pasang seal klep original baru & stel celah klep',
      'Pengencangan baut silinder head sesuai urutan torsi pabrik (Nm)'
    ],
    specTarget: 'Clearance Ring Piston: 0.20 - 0.35 mm • Torsi Head: Standar Buku Manual Servis Pabrik',
    warranty: 'Garansi Servis 30 Hari',
    suitableVehicles: 'Semua mobil bensin & diesel (Toyota Innova, Fortuner, Avanza, Suzuki Carry, Isuzu Panther)'
  },
  {
    code: 'SVC-03/SUS',
    stallId: 'STALL-03',
    stallName: 'Pit 2-Post Lift (Kaki-Kaki & Suspensi)',
    title: 'Perbaikan Kaki-kaki, Kemudi & Suspensi',
    tag: 'Sasis & Suspensi',
    icon: ShieldCheck,
    status: 'Ready (Standby)',
    turnaround: '2 - 4 Jam',
    turnaroundShort: '2 - 4 Jam',
    tools: ['Two-Post Car Lift 4-Ton', 'Hydraulic Bushing Press 20T', 'Balljoint Separator', 'Dial Gauge Bearing'],
    symptom: 'Bunyi Glodakan & Stir Bergetar di Jalan Kediri',
    symptomDesc: 'Terdengar bunyi gloduk-gloduk saat melibas jalan paving atau jalan bergelombang di Kediri, mobil terasa melayang di kecepatan tinggi, atau setir narik ke satu sisi.',
    diagnosis: 'Karet bushing arm pecah, tierod / long tierod oblak, link stabilizer aus, balljoint kering tanpa gemuk, atau shock absorber bocor oli.',
    actionPlan: 'Inspeksi fisik di lift 2 tiang, penggantian tierod & link stabilizer, press bushing arm dengan alat hidrolik tanpa merusak arm, dan tes redaman shock absorber.',
    sop: [
      'Naikkan mobil pada lift hidrolik & periksa kelonggaran roda (arah jam 12 & 3)',
      'Cek kebocoran tabung shock absorber & elastisitas per keong',
      'Press lepas bushing arm aus & pasang bushing baru dengan press 20T',
      'Penyetelan kelurusan roda (Toe-In / Toe-Out) sebelum uji jalan'
    ],
    specTarget: 'Bebas oblak 100% • Toleransi Runout Bearing: < 0.05 mm • Rebound Shock Seimbang Kiri-Kanan',
    warranty: 'Garansi Servis 14 Hari',
    suitableVehicles: 'Avanza, Xenia, Rush, Terios, Innova Reborn, Brio, Ertiga, Calya, Sigra, Gran Max'
  },
  {
    code: 'SVC-04/ELC',
    stallId: 'STALL-04',
    stallName: 'Electrical Bench & Battery Center',
    title: 'Kelistrikan Bodi, Dinamo Starter & Alternator',
    tag: 'Elektrikal',
    icon: Zap,
    status: 'Ready (Standby)',
    turnaround: '1 - 3 Jam',
    turnaroundShort: '1 - 3 Jam',
    tools: ['Digital Multimeter Fluke', 'Battery Conductance Tester', 'Alternator Bench Tester', 'Fuse Circuit Probe'],
    symptom: 'Starter Cetek-Cetek & Lampu Indikator Aki Menyala',
    symptomDesc: 'Kunci diputar mesin hanya berbunyi klik tanpa memutar dinamo starter, aki sering drop meski baru diganti, lampu utama redup, atau bau hangus sekring bodi.',
    diagnosis: 'Carbon brush starter habis, solenoid macet, diode bridge atau IC regulator alternator drop sehingga aki tidak terisi, atau terdapat arus bocor.',
    actionPlan: 'Uji alternator pengisian (harus 13.8V - 14.4V saat mesin hidup), servis dinamo starter, ganti arang carbon brush, dan telusuri jalur kabel bodi korslet.',
    sop: [
      'Uji tegangan beban aki saat cranking starter (min. 10.2 Volt)',
      'Uji arus pengisian alternator di terminal B+ (tegangan 13.8V - 14.4V)',
      'Bongkar dinamo starter, ganti carbon brush & amplas komutator',
      'Pengecekan jalur sekring & rapikan pembungkus kabel tahan panas'
    ],
    specTarget: 'Tegangan Charging: 14.1V ± 0.3V • Parasitic Current Drain: < 0.05 Ampere saat kontak OFF',
    warranty: 'Garansi Servis 14 Hari',
    suitableVehicles: 'Semua jenis mobil transmisi manual & otomatis'
  },
  {
    code: 'SVC-05/LUB',
    stallId: 'STALL-05',
    stallName: 'Express Lube & ATF Transmission Pit',
    title: 'Perawatan Berkala & Kuras Matic (ATF/CVT)',
    tag: 'Pelumasan Rutin',
    icon: Clock,
    status: 'Ready (Standby)',
    turnaround: '45 - 60 Menit',
    turnaroundShort: '45 Menit',
    tools: ['Mesin Flushing ATF Changer Digital', 'Oil Drain Waste Extractor', 'Refractometer Coolant Tester', 'Torque Socket Drain Bolt'],
    symptom: 'Transmisi Matic Kasar / Selip & Jadwal Servis Rutin',
    symptomDesc: 'Perpindahan gigi transmisi matic terasa menghentak atau ada jeda saat masuk posisi D atau R, oli mesin sudah pekat hitam melewati batas kilometer.',
    diagnosis: 'Kualitas viskositas oli transmisi matic menurun dan terkontaminasi serbuk gram kopling, atau oli mesin sudah mengental melewati 5.000 - 10.000 km.',
    actionPlan: 'Flushing total oli transmisi matic menggunakan mesin digital ATF changer, penggantian oli mesin multigrade sesuai spec pabrik, dan ganti filter oli original.',
    sop: [
      'Drain & ukur warna oli lama transmisi / oli mesin',
      'Hubungkan selang cooler ke mesin flushing otomatis (siklus kuras 8 - 10 liter)',
      'Ganti filter oli mesin & pasang gasket baut pembuangan baru',
      'Pengecekan level dipstick oli pada temperatur kerja mesin (70°C - 80°C)'
    ],
    specTarget: 'Spesifikasi Oli: Sesuai Buku Pabrik (0W-20, 5W-30, ATF T-IV, WS, CVT-FE) • Bebas Bocor Baut Drain',
    warranty: 'Garansi Bebas Bocor & Oli Asli Bersegel',
    suitableVehicles: 'Semua mobil bensin / diesel, transmisi manual maupun matic konvensional & CVT'
  }
];

export default function ServicesSection() {
  // Variant State: 'blueprint' (V1) | 'triage' (V2) | 'ledger' (V3)
  const [activeVariant, setActiveVariant] = useState('blueprint');
  
  // Selection states inside variants
  const [selectedStallIndex, setSelectedStallIndex] = useState(0);
  const [selectedTriageIndex, setSelectedTriageIndex] = useState(0);
  const [expandedLedgerCode, setExpandedLedgerCode] = useState('SVC-01/EFI');

  const selectedStall = SERVICES_DATA[selectedStallIndex];
  const selectedTriage = SERVICES_DATA[selectedTriageIndex];

  return (
    <section id="layanan" className="bg-slate-50 dark:bg-slate-950/70 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================================
            HEADER & 3-VARIANT TACTILE SWITCHER
            ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Layanan Servis &amp; Spesialisasi Workshop
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Dikerjakan langsung di workshop Sambiresik dengan alat ukur presisi, SOP mekanik terstandar, dan transparansi rincian kerja.
            </p>
          </div>

          {/* Tactile Variant Switcher Bar (Audition 3 styles) */}
          <div className="shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Pilih Mode Tampilan Layanan:</span>
            </div>
            <div className="inline-flex p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveVariant('blueprint')}
                className={`touch-target px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  activeVariant === 'blueprint'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                1. Workshop Stall Bay
              </button>
              <button
                type="button"
                onClick={() => setActiveVariant('triage')}
                className={`touch-target px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  activeVariant === 'triage'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                2. Diagnosa Keluhan
              </button>
              <button
                type="button"
                onClick={() => setActiveVariant('ledger')}
                className={`touch-target px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                  activeVariant === 'ledger'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                3. Technical Ledger SOP
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            VARIANT 1: WORKSHOP STALL & PIT BLUEPRINT (Interactive Bay Terminal)
            ========================================================================= */}
        {activeVariant === 'blueprint' && (
          <div className="space-y-6">
            {/* Stall Selection Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {SERVICES_DATA.map((srv, idx) => {
                const Icon = srv.icon;
                const isSelected = selectedStallIndex === idx;
                return (
                  <button
                    key={srv.code}
                    type="button"
                    onClick={() => setSelectedStallIndex(idx)}
                    className={`touch-target text-left p-3.5 rounded border transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                        <span className={isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}>
                          {srv.stallId}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                        {srv.stallName}
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{srv.turnaroundShort}</span>
                      <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Stall Workbench Terminal */}
            <div className="rounded border-2 border-slate-900 dark:border-blue-500 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                      {selectedStall.stallId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-xs">
                      {selectedStall.tag}
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      <span>Stall Siap Layanan</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedStall.title}
                  </h3>

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedStall.diagnosis}
                  </p>
                </div>

                {/* Turnaround & Action */}
                <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
                  <div className="bg-slate-50 dark:bg-slate-700/60 px-4 py-2 rounded border border-slate-200 dark:border-slate-600 text-left lg:text-right">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Estimasi Durasi Pit
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                      {selectedStall.turnaround}
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/6285603307330?text=${encodeURIComponent(`Halo Bengkel GPS Motor, saya ingin konsultasi pengerjaan di ${selectedStall.stallId} (${selectedStall.title}).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target inline-flex items-center space-x-2 py-3 px-5 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-none"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Booking Stall Ini via WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* 3 Technical Pillars: Tools, SOP & Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* Pillar 1: Alat Khusus */}
                <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Perlengkapan Spesialis Stall</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedStall.tools.map((t, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mr-1.5 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pillar 2: SOP Pengerjaan */}
                <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded border border-slate-200 dark:border-slate-700 md:col-span-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Prosedur Pengerjaan Standar Mekanik</span>
                  </h4>
                  <ol className="space-y-2">
                    {selectedStall.sop.map((step, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2 shrink-0">
                          0{idx + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <strong className="text-slate-900 dark:text-slate-200 font-semibold">Toleransi Pabrik:</strong> {selectedStall.specTarget}
                  </div>
                </div>
              </div>

              {/* Bottom Reassurance Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                <span>Model mobil umum di Sambiresik: {selectedStall.suitableVehicles}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{selectedStall.warranty}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VARIANT 2: SYMPTOM-TO-FIX MATRIX (Diagnosa Keluhan Pengemudi)
            ========================================================================= */}
        {activeVariant === 'triage' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Symptom Triage Column */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Pilih Keluhan Mobil yang Anda Rasakan:
              </div>

              {SERVICES_DATA.map((srv, idx) => {
                const isSelected = selectedTriageIndex === idx;
                return (
                  <button
                    key={srv.code}
                    type="button"
                    onClick={() => setSelectedTriageIndex(idx)}
                    className={`touch-target w-full text-left p-4 rounded border transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-white dark:bg-slate-800 ring-2 ring-blue-600/20 dark:ring-blue-400/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Keluhan #{idx + 1}</span>
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {srv.symptom}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                          {srv.symptomDesc}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 shrink-0 mt-1 transition-transform ${isSelected ? 'text-blue-600 rotate-90 lg:rotate-0' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Diagnostic Resolution Panel */}
            <div className="lg:col-span-7">
              <div className="rounded border-2 border-slate-900 dark:border-blue-500 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-sm">
                
                <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      LEMBAR DIAGNOSA KELUHAN
                    </span>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Durasi: {selectedTriage.turnaround}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    {selectedTriage.symptom}
                  </h3>
                </div>

                <div className="py-5 space-y-4">
                  {/* Root cause */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      Kemungkinan Penyebab Kerusakan:
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed bg-amber-50 dark:bg-amber-950/40 p-3 rounded border border-amber-200 dark:border-amber-800">
                      {selectedTriage.diagnosis}
                    </p>
                  </div>

                  {/* Recommended Service Package */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                      Tindakan Servis Bengkel GPS Motor:
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded border border-blue-200 dark:border-blue-900/50">
                      <div className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-1">
                        {selectedTriage.title}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedTriage.actionPlan}
                      </p>
                    </div>
                  </div>

                  {/* SOP steps */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                      Langkah Penanganan Terukur:
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedTriage.sop.map((s, idx) => (
                        <li key={idx} className="flex items-start text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mr-2 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Direct Symptom WhatsApp Consultation */}
                <div className="pt-5 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Garansi Perbaikan:</span> {selectedTriage.warranty}
                  </div>
                  <a
                    href={`https://wa.me/6285603307330?text=${encodeURIComponent(`Halo Bengkel GPS Motor Kediri, mobil saya mengalami keluhan: "${selectedTriage.symptom}". Mohon info estimasi biaya dan jadwal perbaikan.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target w-full sm:w-auto inline-flex items-center justify-center space-x-2 py-3 px-5 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Konsultasi Keluhan Ini Sekarang</span>
                  </a>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VARIANT 3: TECHNICAL SERVICE LEDGER & SOP SPECIFICATION (Work Order Ledger)
            ========================================================================= */}
        {activeVariant === 'ledger' && (
          <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
            
            {/* Table Header Bar */}
            <div className="bg-slate-100 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  STANDARD OPERATING PROCEDURE (SOP) &amp; WORK SPECIFICATIONS
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  Katalog resmi prosedur penanganan mekanik Bengkel Mobil GPS Motor Sambiresik
                </span>
              </div>
              <span className="hidden sm:inline-block font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                5 DIVISI AKTIF
              </span>
            </div>

            {/* Ledger Rows */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {SERVICES_DATA.map((srv) => {
                const isExpanded = expandedLedgerCode === srv.code;
                return (
                  <div key={srv.code} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-750">
                    {/* Row Header Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedLedgerCode(isExpanded ? null : srv.code)}
                      className="touch-target w-full p-5 sm:p-6 text-left flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-4">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-300 shrink-0">
                          {srv.code}
                        </span>
                        <div>
                          <div className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                            {srv.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {srv.stallName} • {srv.tag}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 shrink-0 self-end md:self-auto text-xs">
                        <div className="text-right">
                          <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Durasi</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{srv.turnaround}</span>
                        </div>
                        <div className="text-right hidden sm:block">
                          <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Garansi</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{srv.warranty}</span>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400 underline">
                          {isExpanded ? 'Tutup Rincian ▲' : 'Buka SOP ▼'}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Technical Specification View */}
                    {isExpanded && (
                      <div className="px-5 pb-6 sm:px-6 pt-0 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-900/40">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
                          
                          {/* SOP Steps */}
                          <div className="md:col-span-7 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                              Tahapan SOP Pengerjaan:
                            </span>
                            <ol className="space-y-1.5">
                              {srv.sop.map((step, sIdx) => (
                                <li key={sIdx} className="flex items-start text-xs text-slate-700 dark:text-slate-300">
                                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2 shrink-0">
                                    [Step {sIdx + 1}]
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                            <div className="pt-2 text-xs font-mono text-slate-600 dark:text-slate-400">
                              Target Toleransi: {srv.specTarget}
                            </div>
                          </div>

                          {/* Tools & Quick CTA */}
                          <div className="md:col-span-5 bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block mb-2">
                                Alat &amp; Standar Ukur:
                              </span>
                              <ul className="space-y-1 mb-4">
                                {srv.tools.map((tl, tIdx) => (
                                  <li key={tIdx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    <span>{tl}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <a
                              href={`https://wa.me/6285603307330?text=${encodeURIComponent(`Halo Bengkel GPS Motor, saya ingin konsultasi pengerjaan kode ${srv.code} (${srv.title}).`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="touch-target inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                            >
                              <span>Konsultasi SOP &amp; Estimasi</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Global Workshop Commitment Banner */}
        <div className="mt-8 p-4 sm:p-5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Transparansi Biaya Sebelum Pengerjaan Dimulai
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Estimasi jasa &amp; pilihan suku cadang diinformasikan diawal. Suku cadang lama yang diganti wajib diserahkan ke pemilik saat mobil diambil.
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <a
              href="https://wa.me/6285603307330?text=Halo%20Bengkel%20GPS%20Motor%2C%20saya%20ingin%20tanya%20estimasi%20biaya%20servis."
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target inline-flex items-center space-x-2 px-4 py-2.5 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <span>Minta Estimasi Biaya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
