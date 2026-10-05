import React from 'react';
import { Gauge, Cpu, Wrench, ShieldCheck, Zap, Clock, Check, MessageSquare } from 'lucide-react';

const SERVICES = [
  {
    id: 'tune-up',
    title: 'Tune Up Mesin & Carbon Clean',
    category: 'Tune Up',
    icon: Gauge,
    image: '/images/services/tune-up.jpg',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
    description: 'Pembersihan ruang bakar secara menyeluruh, kalibrasi injektor, pembersihan throttle body, dan scan OBD2 komputer mesin untuk mengembalikan tarikan enteng dan hemat bahan bakar.',
    features: [
      'Scan diagnostik OBD2 scanner',
      'Pembersihan kerak ruang bakar (Carbon Clean)',
      'Kalibrasi dan tes semprotan injektor',
      'Penyetelan celah elektroda busi'
    ]
  },
  {
    id: 'servis-injeksi',
    title: 'Servis Mobil Injeksi & EFI',
    category: 'Injeksi',
    icon: Cpu,
    image: '/images/services/injeksi.jpg',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    description: 'Diagnosa dan perbaikan sensor EFI, lampu check engine (MIL) menyala, sensor oksigen, throttle position sensor, fuel pump, dan kalibrasi sistem bahan bakar injeksi elektronik.',
    features: [
      'Pendeteksian error kode DTC scanner',
      'Pembersihan ultrasonic injektor bensin',
      'Pengecekan tekanan pompa bensin (Fuel Pump)',
      'Kalibrasi Idle Speed Control (ISC/IACV)'
    ]
  },
  {
    id: 'overhaul-mesin',
    title: 'Overhaul Mesin (Turun Mesin)',
    category: 'Overhaul',
    icon: Wrench,
    image: '/images/services/overhaul.jpg',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    description: 'Solusi tuntas untuk mobil ngebul putih/hitam, oli berkurang drastis, kompresi bocor, bunyi mesin kasar, atau overheat akibat cylinder head melengkung.',
    features: [
      'Turun mesin semi maupun total overhaul',
      'Skir klep dan penggantian seal klep original',
      'Penggantian ring piston & metal jalan/duduk',
      'Pengukuran clearance presisi sesuai spec pabrik'
    ]
  },
  {
    id: 'kaki-kaki',
    title: 'Perbaikan Kaki-kaki & Suspensi',
    category: 'Kaki-kaki',
    icon: ShieldCheck,
    image: '/images/services/kaki-kaki.jpg',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
    description: 'Hilangkan bunyi glodakan dan getaran saat melibas jalan berlubang di Kediri. Pemeriksaan dan pergantian tierod, rack end, balljoint, bushing arm, dan shock absorber.',
    features: [
      'Pemeriksaan tierod, long tierod & balljoint',
      'Press bushing lower arm presisi',
      'Servis dan penggantian shock absorber',
      'Pengecekan bearing roda & link stabilizer'
    ]
  },
  {
    id: 'kelistrikan',
    title: 'Kelistrikan Mobil & Starter',
    category: 'Kelistrikan',
    icon: Zap,
    image: '/images/services/kelistrikan.jpg',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
    description: 'Perbaikan urut kabel bodi korsleting, dinamo starter macet atau tidak mau memutar mesin, dinamo alternator pengisian drop, sistem lampu utama, dan kelistrikan aki.',
    features: [
      'Urut jalur kabel bodi korsleting & sekring',
      'Servis dinamo starter & ganti carbon brush',
      'Servis dinamo alternator & pengecekan regulator',
      'Uji beban aki dan sistem pengisian charging'
    ]
  },
  {
    id: 'perawatan-berkala',
    title: 'Perawatan Berkala & Ganti Oli',
    category: 'Perawatan Berkala',
    icon: Clock,
    image: '/images/services/ganti-oli.jpg',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
    description: 'Paket ganti oli mesin berbagai viskositas (10W-40, 5W-30, 0W-20), kuras oli transmisi matic ATF/CVT, ganti oli gardan, kuras minyak rem, dan flushing radiator coolant.',
    features: [
      'Oli mesin berkualitas & filter oli original',
      'Kuras oli transmisi matic ATF / CVT',
      'Ganti filter udara mesin & filter AC kabin',
      'Flushing air radiator coolant anti-karat'
    ]
  }
];

export default function ServicesSection() {
  return (
    <section id="layanan" className="bg-slate-50 dark:bg-slate-950/50 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Layanan Unggulan
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            Layanan Kami di Bengkel GPS Motor Kediri
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Peralatan lengkap, mekanik berpengalaman, serta transparansi pengerjaan dan harga yang jelas.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 flex flex-col justify-between transition-colors hover:border-blue-400 dark:hover:border-blue-500 overflow-hidden"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-44 w-full rounded overflow-hidden mb-4 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-750">
                    <img 
                      src={srv.image} 
                      alt={srv.title} 
                      loading="lazy" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200/50 shadow-sm ${srv.badgeColor}`}>
                      {srv.category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {srv.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {srv.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {srv.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mr-2 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <a
                    href={`https://wa.me/6285603307330?text=${encodeURIComponent(`Halo Bengkel GPS Motor, saya ingin konsultasi/booking layanan ${srv.title}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-target inline-flex items-center justify-center w-full space-x-2 py-2 px-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Konsultasi via WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
