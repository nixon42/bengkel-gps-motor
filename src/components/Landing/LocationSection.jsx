import React from 'react';
import { MapPin, Clock, Phone, Navigation, MessageCircle } from 'lucide-react';

export default function LocationSection() {
  return (
    <section id="lokasi" className="bg-white dark:bg-slate-900 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Lokasi & Jam Kerja
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            Kunjungi Bengkel Mobil GPS Motor Kediri
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            Lokasi strategis dan mudah dijangkau di wilayah Sambiresik, Kecamatan Gampengrejo, Kabupaten Kediri.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Details Card */}
          <div className="lg:col-span-5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Address */}
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alamat Workshop</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur 64182
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    (Dekat akses jalan utama Gampengrejo - Kediri Kota)
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Jam Operasional</h3>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 space-y-1">
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">Senin - Sabtu:</span> 08:00 - 17:00 WIB</p>
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">Minggu & Hari Libur:</span> By Appointment / Darurat</p>
                  </div>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Telepon & WhatsApp</h3>
                  <p className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    0856-0330-7330
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Siap melayani konsultasi keluhan mobil & estimasi biaya
                  </p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
              <a
                href="https://maps.google.com/?q=Bengkel+Mobil+GPS+Motor+Kediri+Sambiresik"
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target w-full flex items-center justify-center space-x-2 py-3 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Petunjuk Arah Google Maps</span>
              </a>

              <a
                href="https://wa.me/6285603307330?text=Halo%20Bengkel%20GPS%20Motor%2C%20saya%20ingin%20konsultasi%20layanan%20servis."
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target w-full flex items-center justify-center space-x-2 py-3 px-4 rounded border border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm transition-colors hover:bg-emerald-100"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Chat Langsung via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Map Container */}
          <div className="lg:col-span-7 rounded border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 min-h-[360px] flex flex-col">
            <iframe
              title="Google Maps Lokasi Bengkel Mobil GPS Motor Kediri"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15812.306529932737!2d112.0205!3d-7.7812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78570000000000%3A0x0!2sSambiresik%2C%20Gampengrejo%2C%20Kediri!5e0!3m2!1sid!2sid!4v1696000000000!5m2!1sid!2sid"
              className="w-full h-full flex-1 border-0 min-h-[360px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
              <span>📍 Sambiresik, Kec. Gampengrejo, Kab. Kediri</span>
              <a
                href="https://maps.google.com/?q=Bengkel+Mobil+GPS+Motor+Kediri+Sambiresik"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Perbesar Peta
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
