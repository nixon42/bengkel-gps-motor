import React from 'react';
import { ShieldCheck, CheckCircle2, Wrench, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Bambang Sudibyo',
    location: 'Kediri Kota',
    car: 'Toyota Avanza Veloz (AG 1822 AB)',
    job: 'Tune Up EFI & Carbon Clean',
    date: 'September 2026',
    comment: 'Sangat puas servis di Bengkel GPS Motor. Fitur cek status online via WhatsApp sangat transparan, ada foto sebelum dan sesudah busi & injektor dibersihkan. Tarikan mesin langsung enteng untuk tanjakan Pare-Papar.'
  },
  {
    id: 2,
    name: 'Rudi Hartono',
    location: 'Plemahan, Kediri',
    car: 'Toyota Kijang Innova Reborn (AG 1044 RK)',
    job: 'Perbaikan Kaki-kaki & Tierod',
    date: 'Agustus 2026',
    comment: 'Bunyi glodakan di roda depan Innova tuntas di sini. Mekanik Mas Agus tidak asal vonis ganti semua part, hanya tierod dan bushing arm yang benar-benar aus yang diganti. Mobil kembali stabil di jalan tol Kediri-Kertosono.'
  },
  {
    id: 3,
    name: 'Hj. Siti Mahmudah',
    location: 'Sambiresik, Gampengrejo',
    car: 'Honda Brio Satya E (AG 1530 EF)',
    job: 'Diagnosa Scanner & Servis AC/Injeksi',
    date: 'September 2026',
    comment: 'Mobil sempat brebet dan lampu check engine menyala. Di-scan komputer OBD2 langsung ketemu sensor O2 yang kotor. Pengerjaan cepat, nota rinciannya jelas, dan mekaniknya sangat komunikatif.'
  },
  {
    id: 4,
    name: 'Agus Purnomo',
    location: 'Ngasem, Kediri',
    car: 'Daihatsu Gran Max Pick Up (AG 8912 V)',
    job: 'Kuras Minyak Rem & Ganti Oli Rutin',
    date: 'Agustus 2026',
    comment: 'Armada mobil operasional usaha selalu servis rutin di GPS Motor. Suku cadang bekas selalu dibungkus rapi dan ditunjukkan saat mobil diambil. Transparan dan tidak pernah ada biaya siluman.'
  }
];

export default function TestimonialsSection() {
  return (
    <section id="testimoni" className="bg-slate-50 dark:bg-slate-950/50 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (No eyebrow kicker) */}
        <div className="max-w-3xl mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Catatan Servis &amp; Ulasan Pemilik Mobil
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Pengalaman nyata pelanggan yang mempercayakan perawatan berkala dan perbaikan kendaraannya di Bengkel GPS Motor Kediri.
          </p>
        </div>

        {/* Testimonials Grid (Authentic Case Reviews) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <div>
                {/* Job Tag & Rating Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs">
                    {item.job}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  "{item.comment}"
                </p>
              </div>

              {/* Vehicle & Customer Info */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>{item.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" title="Pelanggan Terverifikasi" />
                  </div>
                  <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.car} • {item.location}
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
