import React, { useState, useEffect } from 'react';
import { 
  Wrench, Sun, Moon, LogIn, ArrowRight, ShieldCheck, 
  Smartphone, Database, Layers, CheckCircle2, 
  Building2, Phone, MapPin, ExternalLink, FileText, 
  Check, Printer, Search, ChevronDown, ChevronUp,
  Sparkles, Clock, Shield
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { resolveAssetUrl } from '../utils/assetUrl';

export default function AppPlatformLandingPage({ 
  onNavigateTenant, 
  onOpenAdmin, 
  onOpenSuperadmin, 
  onNavigateDocs,
  onNavigateTracking 
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();

  // Active Tab for Interactive Hero System Preview ('ro' | 'tracking' | 'inventory')
  const [activePreviewTab, setActivePreviewTab] = useState('ro');

  // FAQ Accordion State (index of open item, or null)
  const [openFaq, setOpenFaq] = useState(0);

  const handleLoginClick = () => {
    onOpenAdmin();
  };

  const handleTrackingClick = (plate = '') => {
    if (onNavigateTracking) {
      onNavigateTracking(plate);
    } else {
      onNavigateTenant('bengkel-gps-motor');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Precision Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Brand Identity */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none shrink min-w-0"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0c2b5e] flex items-center justify-center text-emerald-400 border border-blue-900/40 shrink-0 shadow-xs">
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-white font-sans leading-none truncate">
                  BengkelOS
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 uppercase shrink-0">
                  SaaS
                </span>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                Software Manajemen Bengkel Mobil
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <a href="#fitur" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Fitur Utama
            </a>
            <a href="#tracking-wa" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Live Tracking WA
            </a>
            <a href="#alur-kerja" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Alur Servis
            </a>
            <a href="#mitra" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Bengkel Mitra
            </a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              FAQ
            </a>
            {onNavigateDocs && (
              <button 
                type="button"
                onClick={() => onNavigateDocs()} 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase"
              >
                Panduan
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Dark/Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti Tema Tampilan"
              className="touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors shadow-2xs"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Quick Tracking Button for Car Owners */}
            <button
              type="button"
              onClick={() => handleTrackingClick('AG 1822 AB')}
              className="touch-target hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cek Status Servis</span>
            </button>

            {/* Staff / Owner Login Portal Button */}
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={loading}
              className="touch-target inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#0c2b5e] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span>{user ? 'Buka Dashboard' : 'Portal Bengkel'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section: Distilled, High-Impact, Persuade */}
      <section className="relative bg-[#0c2b5e] text-white pt-12 sm:pt-18 pb-16 sm:pb-24 overflow-hidden border-b border-blue-900">
        
        {/* Subtle geometric grid backdrop */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Main Headline (Direct, No Banned Eyebrow) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-sans">
            Software Manajemen Bengkel Mobil Modern & Transparan
          </h1>

          {/* Subtitle: Value proposition in plain Indonesian */}
          <p className="text-base sm:text-lg lg:text-xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed">
            Kelola SPK digital, potong stok suku cadang otomatis, dan bagikan link pelacakan servis langsung ke WhatsApp pemilik mobil tanpa ribet unduh aplikasi.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTenant('bengkel-gps-motor')}
              className="touch-target inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-[#00a86b] hover:bg-emerald-600 text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-98"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Buka Demo Bengkel (GPS Motor)
            </button>

            <button
              type="button"
              onClick={() => handleTrackingClick('AG 1822 AB')}
              className="touch-target inline-flex items-center justify-center px-5 py-3.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-sm tracking-wide transition-colors"
            >
              <Smartphone className="w-4 h-4 mr-2 text-emerald-400" />
              Simulasi Cek Status Pelanggan
            </button>
          </div>

          {/* 4 Trust Signals Strip */}
          <div className="pt-6 border-t border-blue-900/70 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <Check className="w-3.5 h-3.5 mr-1 shrink-0" /> Multi-Tenant
              </span>
              <p className="text-xs text-blue-200 mt-0.5">Satu akun per bengkel mitra</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <Check className="w-3.5 h-3.5 mr-1 shrink-0" /> Zero-Login WA
              </span>
              <p className="text-xs text-blue-200 mt-0.5">Pelanggan tracking via web</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <Check className="w-3.5 h-3.5 mr-1 shrink-0" /> Auto-Deduct Stok
              </span>
              <p className="text-xs text-blue-200 mt-0.5">Stok terpotong real-time di SPK</p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <Check className="w-3.5 h-3.5 mr-1 shrink-0" /> Kasir & Nota
              </span>
              <p className="text-xs text-blue-200 mt-0.5">Cetak thermal & invoice PDF</p>
            </div>
          </div>

        </div>

        {/* 3. Interactive Hero System Preview (Real Software, Zero Slop) */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
            
            {/* Terminal Window Header & Tabs */}
            <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-xs font-mono font-medium text-slate-300 ml-2">
                  bengkelos.workspace/gps-motor
                </span>
              </div>

              {/* 3 Interactive View Switcher Tabs */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('ro')}
                  className={`touch-target px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    activePreviewTab === 'ro' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  1. Antrean SPK & Servis
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('tracking')}
                  className={`touch-target px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    activePreviewTab === 'tracking' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  2. Tampilan HP Pelanggan
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('inventory')}
                  className={`touch-target px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    activePreviewTab === 'inventory' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  3. Gudang Part & Kasir
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: Antrean SPK & Servis Bengkel */}
            {activePreviewTab === 'ro' && (
              <div className="p-4 sm:p-6 space-y-4 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Daftar Pengerjaan Aktif (Repair Orders)</h3>
                    <p className="text-xs text-slate-400">Status real-time mobil di stall lift pengerjaan bengkel.</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded">
                    3 Kendaraan Dalam Proses
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Card 1 */}
                  <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-400">RO-2026-0042</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/80 text-blue-300 border border-blue-700">
                        DIKERJAKAN
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Toyota Avanza 1.3 Veloz</h4>
                      <p className="font-mono text-xs text-emerald-400 font-bold">AG 1822 AB</p>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 border-t border-slate-700/60 pt-2">
                      <p><span className="text-slate-400">Keluhan:</span> Rem bunyi & getar saat deselerasi</p>
                      <p><span className="text-slate-400">Mekanik:</span> Mas Hendra (Stall-01)</p>
                      <p className="text-emerald-400 font-mono font-bold pt-1">Rp 650.000 <span className="text-slate-400 font-normal">(Disetujui via WA)</span></p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-400">RO-2026-0043</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/80 text-amber-300 border border-amber-700">
                        MENUNGGU PART
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Mitsubishi Xpander Ultimate</h4>
                      <p className="font-mono text-xs text-emerald-400 font-bold">AG 1945 CD</p>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 border-t border-slate-700/60 pt-2">
                      <p><span className="text-slate-400">Keluhan:</span> Shockbreaker bocor & bunyi jedug</p>
                      <p><span className="text-slate-400">Mekanik:</span> Mas Budi (Stall-02)</p>
                      <p className="text-emerald-400 font-mono font-bold pt-1">Rp 1.450.000 <span className="text-slate-400 font-normal">(Menunggu part distributor)</span></p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-400">RO-2026-0044</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                        SELESAI (SIAP AMBIL)
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Honda Civic RS Turbo</h4>
                      <p className="font-mono text-xs text-emerald-400 font-bold">AG 1001 EF</p>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 border-t border-slate-700/60 pt-2">
                      <p><span className="text-slate-400">Layanan:</span> Tune Up Injeksi & Ganti Oli Mesin</p>
                      <p><span className="text-slate-400">Mekanik:</span> Mas Joko (Stall-03)</p>
                      <p className="text-emerald-400 font-mono font-bold pt-1">Rp 880.000 <span className="text-slate-400 font-normal">(QC Lulus · Nota siap cetak)</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Tampilan HP Pelanggan (Link WhatsApp) */}
            {activePreviewTab === 'tracking' && (
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-left">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Tautan Dikirim Otomatis ke WhatsApp Pemilik</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    Pelanggan Tidak Butuh Akun, Cukup Buka Link dari Ponsel
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Setiap kali mobil masuk dan diestimasi, sistem menghasilkan tautan pelacakan instan. Pemilik mobil dapat melihat tahapan servis, foto kondisi part lama vs baru, dan rincian biaya yang transparan.
                  </p>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                      Nomor plat dan identitas disensor otomatis demi keamanan data
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                      Bukti foto fisik pergantian sparepart langsung terlihat
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                      Tombol persetujuan estimasi langsung terhubung ke WhatsApp bengkel
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleTrackingClick('AG 1822 AB')}
                    className="touch-target inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 pt-1"
                  >
                    <span>Coba langsung di halaman Cek Status Servis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Smartphone Card Preview */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-700 shadow-lg space-y-3 max-w-sm mx-auto w-full">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs text-white">Bengkel GPS Motor Kediri</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">
                      TAHAP 3 DARI 6
                    </span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Toyota Avanza 1.3 Veloz</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">AG 18** **</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Mekanik: Mas Hendra · Stall Lift 01</p>
                  </div>

                  {/* Visual Stepper */}
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                    <div className="py-1 rounded bg-emerald-900/80 text-emerald-300">1. Masuk ✓</div>
                    <div className="py-1 rounded bg-emerald-900/80 text-emerald-300">2. Estimasi ✓</div>
                    <div className="py-1 rounded bg-blue-600 text-white animate-pulse">3. Pengerjaan</div>
                    <div className="py-1 rounded bg-slate-800 text-slate-500">4. Selesai</div>
                  </div>

                  {/* Photo Proof */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-300 block uppercase">Foto Dokumentasi Suku Cadang:</span>
                    <div className="grid grid-cols-2 gap-1.5 text-center text-[10px]">
                      <div className="bg-slate-800 p-1 rounded">
                        <img 
                          src={resolveAssetUrl('/images/before-after/brake-pad-worn.jpg')} 
                          alt="Part Lama"
                          className="w-full h-16 object-cover rounded mb-1" 
                        />
                        <span className="text-rose-400 font-medium">Kampas Lama Tipis</span>
                      </div>
                      <div className="bg-slate-800 p-1 rounded">
                        <img 
                          src={resolveAssetUrl('/images/services/tune-up.jpg')} 
                          alt="Part Baru" 
                          className="w-full h-16 object-cover rounded mb-1" 
                        />
                        <span className="text-emerald-400 font-medium">Kampas Baru Pasang</span>
                      </div>
                    </div>
                  </div>

                  {/* Total & Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Estimasi:</span>
                      <span className="text-sm font-mono font-black text-emerald-400">Rp 650.000</span>
                    </div>
                    <span className="text-[11px] font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-md">
                      Pengerjaan Aktif
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Gudang Part & Kasir Nota */}
            {activePreviewTab === 'inventory' && (
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left">
                {/* Inventory Table Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center">
                      <Database className="w-4 h-4 mr-1.5 text-emerald-400" />
                      Stok Suku Cadang Terpotong Otomatis
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">FIFO Inventory</span>
                  </div>
                  <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Nama Suku Cadang</th>
                          <th className="p-2.5 text-center">Stok</th>
                          <th className="p-2.5 text-right">Harga Jual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        <tr>
                          <td className="p-2.5 font-medium">Brake Pad Depan Avanza</td>
                          <td className="p-2.5 text-center font-mono text-emerald-400 font-bold">12 set</td>
                          <td className="p-2.5 text-right font-mono">Rp 220.000</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium">Oli Mesin TMO 10W-40 (4L)</td>
                          <td className="p-2.5 text-center font-mono text-emerald-400 font-bold">8 galon</td>
                          <td className="p-2.5 text-right font-mono">Rp 350.000</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium">Filter Oli Genuine Avanza</td>
                          <td className="p-2.5 text-center font-mono text-amber-400 font-bold">2 pcs <span className="text-[10px] text-rose-400">(Kritis)</span></td>
                          <td className="p-2.5 text-right font-mono">Rp 45.000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-slate-400">
                    Setiap sparepart yang ditambahkan ke SPK langsung memotong stok gudang. Mencegah kehilangan part dan selisih saat stok opname.
                  </p>
                </div>

                {/* Kasir & Struk Thermal Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center">
                      <Printer className="w-4 h-4 mr-1.5 text-emerald-400" />
                      Cetak Nota Kasir & Invoice PDF
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Lunas (QRIS)</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-xs text-slate-300">
                    <div className="text-center border-b border-dashed border-slate-700 pb-2">
                      <p className="font-bold text-white text-sm">BENGKEL MOBIL GPS MOTOR</p>
                      <p className="text-[11px] text-slate-400">Sambiresik, Gampengrejo, Kediri</p>
                      <p className="text-[10px] text-slate-500">WA: 0856-0330-7330</p>
                    </div>

                    <div className="space-y-1 text-[11px] border-b border-dashed border-slate-700 pb-2">
                      <div className="flex justify-between">
                        <span>No. SPK:</span>
                        <span className="font-bold text-white">RO-2026-0042</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kendaraan:</span>
                        <span>Avanza 1.3 Veloz (AG 1822 AB)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jasa Ganti Kampas:</span>
                        <span>Rp 80.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Brake Pad Genuine:</span>
                        <span>Rp 220.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tune Up 4 Silinder:</span>
                        <span>Rp 350.000</span>
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-sm text-emerald-400 pt-1">
                      <span>TOTAL LUNAS:</span>
                      <span>Rp 650.000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </section>

      {/* 4. Core Features Section: 4 Distinct Pillars (No Banned Eyebrows) */}
      <section id="fitur" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Empat Solusi Utama untuk Operasional Bengkel Anda
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Menggantikan buku nota manual dan papan tulis bengkel dengan sistem terpadu yang dapat diakses dari meja kasir maupun ponsel mekanik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SPK & 6 Tahap Alur Servis
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Pencatatan data mobil, kilometer, keluhan awal, dan penugasan teknisi dari masuk, diagnosa, pengerjaan di lift, hingga serah kunci.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Tracking WhatsApp
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tautan pelacakan real-time dikirim via WhatsApp. Pemilik mobil dapat melihat estimasi dan foto dokumentasi tanpa harus login.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Inventori Part & Auto-Deduct
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Stok gudang suku cadang terpotong otomatis saat dipasang di SPK. Dilengkapi peringatan stok minimum dan mutasi barang masuk.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kasir & Pembukuan Kas
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Cetak struk kasir thermal 58mm atau invoice PDF format A4 berlogo bengkel. Pendapatan otomatis tercatat ke buku kas harian.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Deep Dive: The Customer WhatsApp Experience */}
      <section id="tracking-wa" className="py-16 sm:py-24 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Transparansi Nyata yang Disukai Pemilik Mobil
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Hilangkan keraguan pelanggan akan biaya tak terduga atau penggantian suku cadang palsu. Dengan tautan tracking WhatsApp, pemilik mobil selalu terinformasi dari awal pengerjaan hingga selesai.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dokumentasi Foto Part Lama vs Baru</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Mekanik memfoto part yang aus langsung dari smartphone sebelum part baru terpasang di mobil.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sensor Privasi Plat & Nama</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Data nomor plat dan nama pemilik disensor pada tautan publik (contoh: <code>AG 18** **</code>) demi privasi pelanggan.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Persetujuan Estimasi Tanpa Datang ke Bengkel</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Pemilik mobil dapat langsung menyetujui rincian biaya melalui WhatsApp tanpa harus menunggu berjam-jam di ruang tunggu bengkel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleTrackingClick('AG 1822 AB')}
                  className="touch-target inline-flex items-center space-x-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>Buka Contoh Halaman Tracking Publik</span>
                </button>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-xl bg-slate-900">
              <img 
                src={resolveAssetUrl('/images/docs/docs_public_tracking.png')} 
                alt="Antarmuka Live Tracking Servis Mobil"
                className="w-full h-auto object-cover" 
              />
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Contoh Pelacakan: Toyota Avanza (AG 1822 AB)</span>
                <span className="text-emerald-400 font-bold">● Tahap Pengerjaan</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Standardized 4-Step Workshop Workflow (#alur-kerja) */}
      <section id="alur-kerja" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Alur Kerja Standar Dari Mobil Masuk Hingga Kasir
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Satu alur digital yang menghubungkan staf front desk, teknisi di stall lift, gudang suku cadang, dan kasir pembayaran.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono text-xs font-black flex items-center justify-center">
                01
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Penerimaan & SPK</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Kasir/admin menerima kendaraan, mencatat kilometer, keluhan pemilik, dan menerbitkan nomor SPK digital.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono text-xs font-black flex items-center justify-center">
                02
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Diagnosa & Estimasi</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Mekanik memeriksa kondisi fisik, menyusun kebutuhan jasa dan suku cadang, lalu mengirimkan estimasi ke WhatsApp pemilik.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono text-xs font-black flex items-center justify-center">
                03
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pengerjaan & Stok</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Mobil dinaikkan ke lift. Saat mekanik mengambil part, stok gudang otomatis terpotong FIFO dan foto bukti diunggah.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono text-xs font-black flex items-center justify-center">
                04
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Kasir & Serah Kunci</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                QC selesai, invoice resmi dicetak (thermal / A4 PDF), pembayaran diterima (Tunai/QRIS), dan kas otomatis tercatat.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Real Garage Showcase: Bengkel GPS Motor Kediri (#mitra) */}
      <section id="mitra" className="py-16 sm:py-24 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Terbukti Beroperasi di Bengkel Otomotif Nyata
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              BengkelOS bukan sekadar prototipe. Sistem ini beroperasi penuh mendukung operasional harian bengkel mitra kami di Jawa Timur.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm text-left grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-bold font-mono">
                <Building2 className="w-3.5 h-3.5" />
                <span>BENGKEL MITRA UTAMA</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Bengkel Mobil GPS Motor Kediri
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
                Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Layanan: Tune Up Injeksi · Overhaul Mesin · Kaki-kaki · Kelistrikan · Servis Berkala
              </p>
            </div>

            <div className="space-y-2.5 flex flex-col justify-center">
              <button
                type="button"
                onClick={() => onNavigateTenant('bengkel-gps-motor')}
                className="touch-target w-full py-2.5 px-4 rounded-lg bg-[#0c2b5e] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
              >
                <span>Lihat Website Bengkel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleTrackingClick('AG 1822 AB')}
                className="touch-target w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cek Status Servis Pelanggan</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 8. FAQ Section: Grounded & Practical (#faq) */}
      <section id="faq" className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Penjelasan praktis seputar penggunaan dan implementasi BengkelOS.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {[
              {
                q: 'Apakah pemilik mobil wajib download aplikasi atau membuat akun?',
                a: 'Tidak perlu sama sekali. Pelanggan cukup mengklik tautan pelacakan yang dikirimkan via WhatsApp melalui browser smartphone apapun (Chrome, Safari, dsb.). Sistem dirancang zero-friction agar mudah dibuka oleh semua kalangan pemilik mobil.'
              },
              {
                q: 'Bagaimana sistem mengelola stok suku cadang?',
                a: 'Setiap kali sparepart ditambahkan ke dalam SPK (Repair Order), kuantitas fisik di gudang otomatis terpotong secara FIFO. Bengkel juga mendapatkan notifikasi jika stok mendekati batas minimum dan dapat melakukan stok opname kapan saja.'
              },
              {
                q: 'Apakah nota kasir dan invoice resmi bisa dicetak?',
                a: 'Ya. BengkelOS mendukung pencetakan nota kasir cepat menggunakan printer thermal 58mm/80mm, serta ekspor dokumen invoice resmi format A4 PDF lengkap dengan logo bengkel dan QR code pelacakan.'
              },
              {
                q: 'Perangkat apa saja yang dibutuhkan di bengkel?',
                a: 'Cukup laptop/komputer di meja kasir untuk penerimaan & pembukuan, serta smartphone standar untuk mekanik mengupdate status pengerjaan dan mengambil foto dokumentasi suku cadang di stall lift.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="touch-target w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9. Final Call to Action Section */}
      <section className="py-16 sm:py-20 bg-[#0c2b5e] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Siap Beralih ke Manajemen Bengkel yang Lebih Rapi?
          </h2>
          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Mulai jelajahi konsol demo interaktif Bengkel GPS Motor atau masuk langsung ke portal staf operasional Anda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTenant('bengkel-gps-motor')}
              className="touch-target px-6 py-3.5 rounded-lg bg-[#00a86b] hover:bg-emerald-600 text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-98"
            >
              Jelajahi Demo Bengkel GPS Motor
            </button>
            <button
              type="button"
              onClick={handleLoginClick}
              className="touch-target px-6 py-3.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-sm tracking-wide transition-colors"
            >
              Masuk Portal Staf / Owner
            </button>
          </div>
        </div>
      </section>

      {/* 10. Platform Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#0c2b5e] flex items-center justify-center text-emerald-400 border border-blue-900/60">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white tracking-tight">BengkelOS Platform</span>
            <span>· Sistem Manajemen Bengkel Mandiri</span>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#alur-kerja" className="hover:text-white transition-colors">Alur Servis</a>
            <a href="#tracking-wa" className="hover:text-white transition-colors">Tracking</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            {onNavigateDocs && (
              <button 
                type="button" 
                onClick={() => onNavigateDocs()} 
                className="hover:text-white transition-colors"
              >
                Dokumentasi
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Sistem Operasional Aktif</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
