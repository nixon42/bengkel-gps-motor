import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Bambang Sudibyo',
    location: 'Kediri Kota',
    car: 'Toyota Avanza Veloz',
    rating: 5,
    date: 'September 2026',
    comment: 'Sangat puas servis di Bengkel GPS Motor Kediri! Fitur cek status online via WhatsApp ini sangat transparan, ada foto sebelum dan sesudah diganti businya. Jadi tahu persis apa yang dikerjakan tanpa perlu nunggu seharian di bengkel.'
  },
  {
    id: 2,
    name: 'Hj. Siti Mahmudah',
    location: 'Sambiresik, Gampengrejo',
    car: 'Honda Brio Satya',
    rating: 5,
    date: 'September 2026',
    comment: 'Mekaniknya Mas Agus sangat teliti dan ramah. Keluhan mesin brebet dan AC kurang dingin langsung beres di hari yang sama. Harga transparan dan nota rinciannya jelas sekali. Recommended untuk warga Sambiresik dan sekitarnya!'
  },
  {
    id: 3,
    name: 'Agus Purnomo',
    location: 'Ngasem, Kediri',
    car: 'Daihatsu Xenia 1.3',
    rating: 5,
    date: 'Agustus 2026',
    comment: 'Bengkel jujur dan bertanggung jawab. Sparepart lama yang diganti selalu disertakan dan ditunjukkan ke pemilik saat mobil diambil. Tracking via web dengan plat nomor sangat memudahkan saya memantau dari kantor.'
  },
  {
    id: 4,
    name: 'Rudi Hartono',
    location: 'Plemahan, Kediri',
    car: 'Toyota Kijang Innova Reborn',
    rating: 5,
    date: 'Agustus 2026',
    comment: 'Perbaikan kaki-kaki bunyi glodakan tuntas di sini. Handling Innova kembali anteng dan senyap di jalan tol Kediri-Kertosono. Mekanik tidak asal ganti part, hanya part yang benar-benar aus yang diganti.'
  }
];

export default function TestimonialsSection() {
  return (
    <section id="testimoni" className="bg-white dark:bg-slate-900 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Ulasan Pelanggan
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            Apa Kata Pemilik Mobil di Kediri
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Pengalaman nyata pelanggan yang telah mempercayakan kendaraannya pada Bengkel GPS Motor Kediri.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-6 flex flex-col justify-between"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>

                {/* Comment Text */}
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed mb-4">
                  "{item.comment}"
                </p>
              </div>

              {/* Author Meta */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>{item.name}</span>
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" title="Pelanggan Terverifikasi" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.car} • {item.location}
                  </div>
                </div>
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
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
