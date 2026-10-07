import React from 'react';
import { Wrench, MapPin, Phone, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onNavigateTracking, onOpenLogin, onOpenSuperadmin, onNavigateDocs }) {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Summary */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight">
                  Bengkel Mobil GPS Motor Kediri
                </span>
                <span className="block text-[11px] text-slate-400">
                  Sistem Pengelolaan & Pelacakan Servis Mobil Modern (SPP Bengkel)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Solusi perawatan dan perbaikan mobil terpercaya di Kediri. Transparansi biaya, teknisi profesional, dokumentasi foto real-time, dan pelacakan status online dengan proteksi privasi pelanggan.
            </p>

            <div className="flex items-center space-x-2 pt-1 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privasi data pelanggan terlindungi otomatis (Privacy Masking)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Menu Cepat</h4>
            <ul className="space-y-2">
              <li>
                <a href="#layanan" className="hover:text-white transition-colors">
                  Layanan Kami
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onNavigateTracking}
                  className="hover:text-white transition-colors text-left"
                >
                  Cek Status Servis (Tracking)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateDocs ? onNavigateDocs() : (window.location.pathname = '/panduan')}
                  className="hover:text-white transition-colors text-left"
                >
                  Buku Panduan Penggunaan
                </button>
              </li>
              <li>
                <a href="#testimoni" className="hover:text-white transition-colors">
                  Ulasan Pelanggan
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Pertanyaan (FAQ)
                </a>
              </li>
              <li>
                <a href="#lokasi" className="hover:text-white transition-colors">
                  Alamat & Google Maps
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Masuk Operator Bengkel
                </button>
              </li>
              {onOpenSuperadmin && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenSuperadmin}
                    className="text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Portal Superadmin
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Kontak & Lokasi</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="https://wa.me/6285603307330" target="_blank" rel="noopener noreferrer" className="font-mono text-emerald-400 hover:underline">
                  0856-0330-7330
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Senin - Sabtu: 08:00 - 17:00 WIB</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Bengkel Mobil GPS Motor Kediri. Hak Cipta Dilindungi.</p>
          <p className="flex items-center space-x-1">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>untuk pemilik mobil Kediri & sekitarnya</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
