import React, { useState } from 'react';
import { Gauge, Cpu, Wrench, ShieldCheck, Zap, Clock, Check, MessageSquare, ArrowRight } from 'lucide-react';

const SERVICE_CATEGORIES = [
  {
    id: 'mesin-efi',
    tag: 'Spesialis Inti',
    title: 'Diagnostik Komputer, EFI & Tune Up Mesin',
    icon: Cpu,
    lead: true,
    description: 'Diagnosa presisi sensor elektronik mobil modern, pembersihan kerak ruang bakar tanpa bongkar mesin (Carbon Clean), dan reset adaptasi ECU dengan OBD2 Scanner.',
    specs: [
      'Scan diagnostik OBD2 multi-brand & analisa live sensor',
      'Pembersihan ultrasonic & kalibrasi semprotan injektor bensin',
      'Pembersihan throttle body & kalibrasi Idle Speed Control (ISC)',
      'Carbon Clean ruang bakar & penyetelan celah elektroda busi'
    ],
    turnaround: '1.5 - 3 Jam (Bisa Ditunggu)',
    suitableFor: 'Tarikan berat, mesin brebet, boros BBM, lampu check engine menyala'
  },
  {
    id: 'overhaul',
    tag: 'Mesin Berat',
    title: 'Overhaul Mesin (Turun Mesin Total / Semi)',
    icon: Wrench,
    lead: false,
    description: 'Penanganan tuntas mesin overheat, kompresi bocor, oli berkurang drastis, asap putih, atau suara kasar dengan pengukuran clearance mikrometer sesuai spesifikasi pabrikan.',
    specs: [
      'Skir klep presisi & penggantian seal klep original',
      'Penggantian ring piston & metal jalan / metal duduk',
      'Perataan silinder head & paking cylinder head original'
    ],
    turnaround: '3 - 5 Hari Kerja',
    suitableFor: 'Mesin overheat melengkung, kompresi pincang, suara metalik kasar'
  },
  {
    id: 'kaki-kaki',
    tag: 'Suspensi & Kemudi',
    title: 'Perbaikan Kaki-kaki, Kemudi & Suspensi',
    icon: ShieldCheck,
    lead: false,
    description: 'Menghilangkan bunyi glodakan dan getaran saat melibas jalan bergelombang Kediri. Pemeriksaan teliti tierod, rack end, bushing arm, balljoint, dan shock absorber.',
    specs: [
      'Pemeriksaan dan pergantian tierod, rack end & link stabilizer',
      'Press bushing lower arm presisi hidrolik tanpa merusak arm',
      'Penggantian shock absorber & pengecekan bearing roda'
    ],
    turnaround: '2 - 4 Jam',
    suitableFor: 'Bunyi glodakan di jalan kasar, setir narik satu sisi, bantingan keras'
  },
  {
    id: 'kelistrikan',
    tag: 'Elektrikal',
    title: 'Kelistrikan Bodi, Starter & Alternator',
    icon: Zap,
    lead: false,
    description: 'Penelusuran urut kabel bodi korsleting, dinamo starter macet atau tidak kuat memutar flywheel, dinamo ampere alternator drop, sistem penerangan, dan uji beban aki.',
    specs: [
      'Urut jalur kabel bodi korsleting & penggantian sekring standar',
      'Servis dinamo starter, ganti carbon brush & solenoid armature',
      'Uji kapasitas beban aki & sistem pengisian alternator 13.8V - 14.4V'
    ],
    turnaround: '1 - 3 Jam',
    suitableFor: 'Mobil sulit distarter, aki sering tekor, indikator aki menyala'
  },
  {
    id: 'perawatan-berkala',
    tag: 'Pelumasan',
    title: 'Perawatan Berkala & Kuras Oli Matic (ATF/CVT)',
    icon: Clock,
    lead: false,
    description: 'Penggantian oli mesin multigrade terpercaya (0W-20, 5W-30, 10W-40), flushing kuras oli transmisi otomatis, penggantian filter kabin/udara, dan kuras minyak rem.',
    specs: [
      'Ganti oli mesin original & filter oli baru setiap interval 5.000 - 10.000 km',
      'Flushing kuras oli transmisi otomatis matic ATF / CVT',
      'Kuras minyak rem titik didih tinggi & flushing air radiator coolant'
    ],
    turnaround: '45 - 60 Menit',
    suitableFor: 'Servis rutin berkala, persiapan perjalanan jarak jauh / luar kota'
  }
];

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState(SERVICE_CATEGORIES[0]);

  return (
    <section id="layanan" className="bg-slate-50 dark:bg-slate-950/60 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (No eyebrow kicker) */}
        <div className="max-w-3xl mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Layanan Servis &amp; Spesialisasi Workshop
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Dikerjakan langsung oleh mekanik berpengalaman di pit Sambiresik dengan alat ukur presisi, scanner komputer diagnostik, dan transparansi rincian kerja.
          </p>
        </div>

        {/* Lead Specialty Box: EFI & Computer Diagnostics */}
        <div className="mb-8 rounded border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold text-xs uppercase tracking-wider">
                    Spesialisasi Unggulan
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Estimasi Pengerjaan: 1.5 - 3 Jam
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {SERVICE_CATEGORIES[0].title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                  {SERVICE_CATEGORIES[0].description}
                </p>
              </div>

              <div className="shrink-0">
                <a
                  href={`https://wa.me/6285603307330?text=${encodeURIComponent('Halo Bengkel GPS Motor, saya ingin konsultasi keluhan mesin / tune up EFI mobil saya.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target inline-flex items-center space-x-2 py-3 px-5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Konsultasi Keluhan EFI</span>
                </a>
              </div>
            </div>

            {/* Technical Scope Checklist & Symptoms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Cakupan Tindakan &amp; Alat Ukur:
                </h4>
                <ul className="space-y-2.5">
                  {SERVICE_CATEGORIES[0].specs.map((item, idx) => (
                    <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mr-2 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/40 p-4 rounded border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                    Cocok untuk Gejala:
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {SERVICE_CATEGORIES[0].suitableFor}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400">
                  Semua data sensor sebelum &amp; sesudah kalibrasi ditunjukkan langsung ke pemilik.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Supporting Workshop Disciplines (Asymmetric 2x2 Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICE_CATEGORIES.slice(1).map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {srv.tag}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {srv.turnaround}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {srv.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {srv.description}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {srv.specs.map((spec, sIdx) => (
                      <li key={sIdx} className="flex items-start text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mr-2 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                    {srv.suitableFor}
                  </span>
                  <a
                    href={`https://wa.me/6285603307330?text=${encodeURIComponent(`Halo Bengkel GPS Motor, saya ingin konsultasi layanan ${srv.title}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target inline-flex items-center space-x-1 font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                  >
                    <span>Tanya Mekanik</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Workshop Commitment Banner */}
        <div className="mt-8 p-4 sm:p-5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Transparansi Biaya Sebelum Pengerjaan Dimulai
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Estimasi biaya jasa &amp; part diinformasikan diawal. Suku cadang lama yang diganti wajib dibawa pulang pemilik.
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <a
              href="https://wa.me/6285603307330?text=Halo%20Bengkel%20GPS%20Motor%2C%20saya%20ingin%20tanya%20estimasi%20biaya%20servis."
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target inline-flex items-center space-x-2 px-4 py-2 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
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
