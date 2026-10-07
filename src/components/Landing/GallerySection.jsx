import React from 'react';
import { Camera, CheckCircle2, ShieldCheck, Wrench, Award, Clock } from 'lucide-react';

const FACILITIES = [
  {
    title: 'Pit Servis & Hydraulic Car Lift',
    category: 'Fasilitas Bengkel',
    image: '/images/gallery/facility-lift.jpg',
    description: 'Lift hidrolik dua tiang modern untuk inspeksi kolong mobil, perbaikan transmisi, dan servis kaki-kaki dengan standar keamanan tinggi.'
  },
  {
    title: 'Scanner Komputer Diagnostik OBD2',
    category: 'Teknologi & Alat',
    image: '/images/gallery/facility-scanner.jpg',
    description: 'Peralatan scanner digital multi-brand untuk membaca data live sensor mesin, menghapus kode DTC error, dan reset throttle position.'
  },
  {
    title: 'Toolkit & Peralatan Spesialis Mesin',
    category: 'Peralatan Kerja',
    image: '/images/gallery/facility-tools.jpg',
    description: 'Peralatan mekanik presisi, kunci momen torsi, alat ukur kompresi, dan perkakas khusus perbaikan mesin mobil segala merek.'
  },
  {
    title: 'Stok Suku Cadang & Oli Terpercaya',
    category: 'Inventaris Asli',
    image: '/images/gallery/facility-spareparts.jpg',
    description: 'Ketersediaan oli original (Shell, Pertamina) serta suku cadang fast-moving bergaransi untuk servis cepat tanpa inden.'
  }
];

export default function GallerySection() {
  return (
    <section id="fasilitas" className="bg-white dark:bg-slate-900 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Fasilitas & Suasana Bengkel</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
            Standar Kerja Rapi & Peralatan Modern
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Kami menjaga ketelitian kerja, kebersihan workshop, dan keandalan perbaikan mobil kesayangan Anda di Sambiresik, Kediri.
          </p>
        </div>

        {/* 4 Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FACILITIES.map((item, idx) => (
            <div 
              key={idx}
              className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 overflow-hidden flex flex-col hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              {/* Photo */}
              <div className="relative aspect-[4/3] w-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white border border-slate-700">
                  {item.category}
                </span>
              </div>

              {/* Text Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-8 p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Garansi Pengerjaan & Suku Cadang
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Setiap perbaikan disertai garansi servis untuk ketenangan berkendara Anda.
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Mekanik Bersertifikat & Berpengalaman</span>
          </div>
        </div>

      </div>
    </section>
  );
}
