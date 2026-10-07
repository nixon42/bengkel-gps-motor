import React from 'react';
import { ShieldCheck, CheckCircle2, Wrench, Cpu, Gauge, PackageCheck } from 'lucide-react';

const FACILITIES = [
  {
    title: 'Two-Post Hydraulic Car Lift (4-Ton)',
    category: 'Stall Servis & Kolong',
    icon: Wrench,
    image: '/images/gallery/facility-lift.jpg',
    description: 'Lift hidrolik dua tiang berkekuatan 4 ton untuk inspeksi kolong menyeluruh, pembongkaran transmisi, dan perbaikan suspensi kaki-kaki dengan standar keselamatan kerja tinggi.'
  },
  {
    id: 'scanner-obd2',
    title: 'OBD2 Multi-Brand Diagnostic Scanner',
    category: 'Diagnostik Elektronik',
    icon: Cpu,
    image: '/images/gallery/facility-scanner.jpg',
    description: 'Scanner komputer digital multi-merek untuk membaca live-stream parameter sensor mesin, reset adaptasi ECU, uji aktuator injeksi, dan penghapusan kode DTC error.'
  },
  {
    id: 'tools-presisi',
    title: 'Kunci Momen Torsi & Alat Ukur Presisi',
    category: 'Peralatan Spesialis',
    icon: Gauge,
    image: '/images/gallery/facility-tools.jpg',
    description: 'Toolkit mekanik presisi dengan kunci torsi kalibrasi pabrik (Nm), compression gauge pengukur kompresi silinder, dial gauge, dan mikrometer celah metal overhaul.'
  },
  {
    id: 'rak-part',
    title: 'Stok Suku Cadang Fast-Moving & Oli Resmi',
    category: 'Katalog Sparepart',
    icon: PackageCheck,
    image: '/images/gallery/facility-spareparts.jpg',
    description: 'Penyimpanan teratur suku cadang fast-moving (busi, filter, kampas rem, tierod) dan oli mesin resmi bersegel untuk percepatan pengerjaan servis tanpa waktu tunggu inden.'
  }
];

export default function GallerySection() {
  return (
    <section id="fasilitas" className="bg-white dark:bg-slate-900 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (No eyebrow kicker) */}
        <div className="max-w-3xl mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Fasilitas Pit &amp; Standar Perlengkapan Kerja
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Kerapian workshop dan kelengkapan alat kerja mekanik adalah jaminan kepresisian perbaikan mobil Anda di Sambiresik, Kediri.
          </p>
        </div>

        {/* 4 Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACILITIES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 overflow-hidden flex flex-col hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              >
                {/* Photo with clean solid badge */}
                <div className="relative aspect-[4/3] w-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded bg-slate-900/90 text-white border border-slate-700">
                    {item.category}
                  </span>
                </div>

                {/* Text Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-1.5">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Standar Pro
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner (Crisp Workshop Assurance) */}
        <div className="mt-8 p-4 sm:p-5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                Garansi Kerja &amp; Kepastian Suku Cadang
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Setiap pekerjaan perbaikan bergaransi servis. Apabila keluhan berulang dalam masa garansi, pengecekan ulang gratis tanpa biaya jasa.
              </span>
            </div>
          </div>
          <div className="shrink-0 flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mekanik Spesialis Kediri</span>
          </div>
        </div>

      </div>
    </section>
  );
}
