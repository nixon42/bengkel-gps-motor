import React, { useState } from 'react';
import { 
  Sun, Moon, ArrowRight, Smartphone, Database, 
  Printer, Plus, Minus, Play, CheckCircle2, Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { resolveAssetUrl } from '../utils/assetUrl';
import BengkelOSHeroMockup from '../components/Landing/BengkelOSHeroMockup';
import { 
  BengkelOSLogoIcon,
  IconOperational, 
  IconFinancial, 
  IconWorkflow, 
  IconReports, 
  IconSatisfaction,
  MetricWorkshops, 
  MetricJobs, 
  MetricRating, 
  MetricSecurity 
} from '../components/Landing/BengkelOSIcons';

export default function AppPlatformLandingPage({ 
  onNavigateTenant, 
  onOpenAdmin, 
  onOpenSuperadmin, 
  onNavigateDocs,
  onNavigateTracking 
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();

  // Active Tab for Interactive System Preview ('ro' | 'tracking' | 'inventory')
  const [activePreviewTab, setActivePreviewTab] = useState('ro');

  // FAQ Accordion State (tracks open item index, null = all closed)
  const [openFaq, setOpenFaq] = useState(0);

  const handleLoginClick = () => {
    onOpenAdmin();
  };

  const handleDemoClick = () => {
    if (onOpenAdmin) {
      onOpenAdmin();
    } else if (onNavigateTenant) {
      onNavigateTenant('bengkel-gps-motor');
    }
  };

  const handleTrackingClick = (plate = 'AG 1822 AB') => {
    if (onNavigateTracking) {
      onNavigateTracking(plate);
    } else if (onNavigateTenant) {
      onNavigateTenant('bengkel-gps-motor');
    }
  };

  // 5 Feature Cards data directly matching Canva deconstruction
  const FEATURE_CARDS = [
    {
      title: 'Manfaat Operasional',
      desc: 'Kelola pekerjaan, teknis, dan inventori dengan lebih efisien untuk meningkatkan produktivitas bengkel.',
      iconComponent: IconOperational
    },
    {
      title: 'Transparansi Finansial',
      desc: 'Pantau pemasukan, pengeluaran, dan profit secara real-time untuk keputusan bisnis yang lebih percaya diri.',
      iconComponent: IconFinancial
    },
    {
      title: 'Alur Kerja Standard',
      desc: 'Gunakan SOP digital untuk memastikan kualitas layanan konsisten di setiap proses pekerjaan.',
      iconComponent: IconWorkflow
    },
    {
      title: 'Laporan Operasional',
      desc: 'Dapatkan laporan lengkap dan visual untuk memantau kinerja bengkel kapan pun dan di mana pun.',
      iconComponent: IconReports
    },
    {
      title: 'Kepuasan Pelanggan',
      desc: 'Update status pekerjaan secara transparan dan bangun kepercayaan pelanggan lebih mudah.',
      iconComponent: IconSatisfaction
    }
  ];

  // 4 Social Proof Metrics directly matching Canva deconstruction
  const METRICS = [
    {
      val: '2.500+',
      label: 'Bengkel Aktif',
      iconComponent: MetricWorkshops
    },
    {
      val: '120K+',
      label: 'Pekerjaan Terselesaikan',
      iconComponent: MetricJobs
    },
    {
      val: '98%',
      label: 'Pelanggan Puas',
      iconComponent: MetricRating
    },
    {
      val: '99.9%',
      label: 'Keamanan Data',
      iconComponent: MetricSecurity
    }
  ];

  // 6 FAQ Questions in 2 Columns matching Canva deconstruction
  const FAQ_ITEMS = [
    {
      id: 0,
      q: 'Apakah data bengkel saya aman?',
      a: 'Sangat aman. Setiap bengkel memiliki workspace database yang terisolasi secara multi-tenant. Komunikasi data diamankan dengan sertifikat enkripsi SSL/TLS 256-bit standar enterprise dan dicadangkan (backup) secara otomatis setiap hari.'
    },
    {
      id: 1,
      q: 'Apakah bisa digunakan di banyak cabang?',
      a: 'Ya, arsitektur cloud BengkelOS didesain native multi-tenant. Anda dapat mengelola beberapa cabang bengkel sekaligus dalam satu dashboard dengan hak akses terpisah untuk Owner, Kasir, dan Mekanik.'
    },
    {
      id: 2,
      q: 'Bagaimana cara memulai menggunakan BengkelOS?',
      a: 'Sangat mudah dan tanpa instalasi. Cukup klik tombol "Mulai Sekarang", daftarkan profil bengkel Anda, masukkan katalog suku cadang awal, dan sistem langsung dapat digunakan melalui browser di laptop kasir maupun smartphone mekanik.'
    },
    {
      id: 3,
      q: 'Apakah ada aplikasi mobile?',
      a: 'BengkelOS berbasis Progressive Web Application (PWA) responsif yang dapat dibuka dari smartphone Android maupun iOS tanpa perlu mengunduh aplikasi berat dari Play Store/App Store. Ringan dan ramah untuk smartphone teknisi di area bengkel.'
    },
    {
      id: 4,
      q: 'Bisa integrasi dengan WhatsApp?',
      a: 'Tentu. Sistem kami terintegrasi dengan tautan tracking WhatsApp. Mekanik dapat membagikan status estimasi biaya, foto dokumentasi part aus vs baru, dan link pelacakan langsung ke nomor WA pelanggan dalam satu klik.'
    },
    {
      id: 5,
      q: 'Apakah ada dukungan dan pelatihan?',
      a: 'Ya, kami menyediakan dokumentasi operasional lengkap di menu Panduan, video panduan alur kerja 6 tahap, serta tim support teknis melalui WhatsApp resmi untuk membantu proses onboarding bengkel Anda.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#060b17] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* =========================================================================
          1. NAVIGATION BAR (100% Canva Layout & Branding, Razor-Sharp Vector)
         ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#060b17]/95 border-b border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Brand Identity: Logo Icon + "BengkelOS" + "Kelola, Pantau, Tumbuh." */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none shrink-0"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              <BengkelOSLogoIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans leading-none">
                BengkelOS
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-tight mt-0.5">
                Kelola, Pantau, Tumbuh.
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            <a href="#fitur" className="hover:text-white transition-colors">
              Fitur
            </a>
            <a href="#solusi" className="hover:text-white transition-colors">
              Solusi
            </a>
            <a href="#harga" className="hover:text-white transition-colors">
              Harga
            </a>
            <a href="#integrasi" className="hover:text-white transition-colors">
              Integrasi
            </a>
            {onNavigateDocs ? (
              <button 
                type="button"
                onClick={() => onNavigateDocs()} 
                className="hover:text-white transition-colors"
              >
                Sumber Daya
              </button>
            ) : (
              <a href="#faq" className="hover:text-white transition-colors">
                Sumber Daya
              </a>
            )}
          </nav>

          {/* Right Action Control: Mulai Sekarang / Buka Dashboard */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={loading}
              className="touch-target inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#00b865] hover:bg-[#00a359] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition-all whitespace-nowrap cursor-pointer"
            >
              {user ? 'Buka Dashboard' : 'Mulai Sekarang'}
            </button>
          </div>

        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (100% Canva 2-Column Split: Headline + Vector Dashboard)
         ========================================================================= */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-20 overflow-hidden border-b border-slate-800/80">
        
        {/* Subtle Ambient Radial Glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.15), transparent 60%),
              radial-gradient(ellipse at 20% 70%, rgba(16, 185, 129, 0.12), transparent 60%)
            `
          }}
        />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 xl:gap-12">
            
            {/* Left Column: Badge + H1 + Subtitle + Action Buttons + 3 Checks */}
            <div className="w-full lg:w-[470px] xl:w-[510px] shrink-0 space-y-5 sm:space-y-6 text-left">
              
              {/* Badge: Platform Manajemen Bengkel Terpercaya */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0a1827] border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Platform Manajemen Bengkel Terpercaya</span>
              </div>

              {/* H1 Heading (Clean 3-Line Wrap matching Canva) */}
              <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[44px] font-black tracking-tight text-white leading-[1.12] font-sans">
                Software Manajemen<br />
                Bengkel Mobil Modern<br />
                <span className="text-white">&amp; Transparan</span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md">
                Kelola operasional, pantau kinerja, dan bangun kepercayaan pelanggan dalam satu platform.
              </p>

              {/* Dual Action CTAs: Mulai Sekarang & Lihat Demo */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="touch-target inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-lg bg-[#00b865] hover:bg-[#00a359] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/25 active:scale-98 group"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handleDemoClick}
                  className="touch-target inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-lg border border-slate-700/80 bg-[#08101e] hover:bg-[#0c1628] hover:border-slate-500 text-white font-bold text-sm tracking-wide transition-all active:scale-98 group"
                >
                  <span>Lihat Demo</span>
                  <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-white pl-0.5 group-hover:border-white transition-colors">
                    <Play className="w-2.5 h-2.5 fill-white text-white" />
                  </div>
                </button>
              </div>

              {/* 3 Trust Signals Checkmarks (Single Row matching Canva) */}
              <div className="pt-2 flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-5 text-[11px] xl:text-xs text-slate-200 font-semibold">
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="w-4 h-4 rounded-full border border-[#00b865] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#00b865] stroke-[3]" />
                  </div>
                  <span>Mudah Digunakan</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="w-4 h-4 rounded-full border border-[#00b865] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#00b865] stroke-[3]" />
                  </div>
                  <span>Data Aman &amp; Tersinkron</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <div className="w-4 h-4 rounded-full border border-[#00b865] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#00b865] stroke-[3]" />
                  </div>
                  <span>Dukungan Responsif</span>
                </div>
              </div>

            </div>

            {/* Right Column: 100% Crisp Vector Hero Mockup (Ultra Sharp, Zero Blur) with Ambient Glow */}
            <div className="w-full lg:flex-1 max-w-[840px] relative mt-6 lg:mt-0">
              {/* Vibrant Ambient Glow Behind Mockup - Smooth Elliptical Halo Without Edge Clipping */}
              <div 
                className="absolute -inset-6 sm:-inset-12 md:-inset-16 rounded-full pointer-events-none opacity-75 blur-2xl sm:blur-3xl -z-10"
                style={{
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(37, 99, 235, 0.38) 0%, rgba(6, 182, 212, 0.22) 35%, rgba(6, 182, 212, 0.04) 55%, transparent 70%)'
                }}
              />

              <div className="relative">
                <BengkelOSHeroMockup />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. 5 BENEFIT / VALUE PILLARS (100% Canva 5 Cards Grid, Crisp SVG Icons)
         ========================================================================= */}
      <section id="fitur" className="py-14 sm:py-18 bg-[#070e1c] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FEATURE_CARDS.map((card, i) => {
              const IconComp = card.iconComponent;
              return (
                <div 
                  key={i}
                  className="bg-[#0c1525] border border-slate-800/80 hover:border-slate-700 p-5 rounded-xl transition-all flex flex-col justify-between group hover:shadow-lg hover:shadow-blue-950/40"
                >
                  <div>
                    {/* Glowing Crisp Vector Icon */}
                    <div className="w-10 h-10 mb-4 flex items-center justify-center">
                      <IconComp className="w-10 h-10" />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. SOCIAL PROOF / METRICS STRIP (100% Canva 4 Metrics, Crisp SVG Icons)
         ========================================================================= */}
      <section className="py-10 bg-[#060b17] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#0c1525] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center">
              {METRICS.map((m, idx) => {
                const MetricIconComp = m.iconComponent;
                return (
                  <div key={idx} className="flex items-center space-x-3.5 sm:space-x-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                      <MetricIconComp className="w-11 h-11 sm:w-12 sm:h-12" />
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono">
                        {m.val}
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        {m.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE PLATFORM PREVIEW & SOLUSI (#solusi)
         ========================================================================= */}
      <section id="solusi" className="py-16 sm:py-20 bg-[#080f1e] border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          
          <div className="space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
              Konsol Kerja Interaktif
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Satu Sistem Terpadu untuk Seluruh Tim Bengkel
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Uji coba langsung antarmuka operasional BengkelOS: dari penerimaan SPK di meja kasir, link tracking WhatsApp ponsel pelanggan, hingga stok suku cadang otomatis.
            </p>
          </div>

          {/* Interactive Window Switcher Tabs */}
          <div className="bg-[#0c1525] rounded-2xl border border-slate-800/90 shadow-2xl overflow-hidden text-left">
            
            <div className="bg-[#080e1b] px-4 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="text-xs font-mono font-medium text-slate-400 ml-2">
                  bengkelos.workspace/demo-terminal
                </span>
              </div>

              {/* 3 Interactive View Switcher Tabs */}
              <div className="flex items-center space-x-1 bg-[#060b17] p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('ro')}
                  className={`touch-target px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activePreviewTab === 'ro' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1. Antrean SPK & Servis
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('tracking')}
                  className={`touch-target px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activePreviewTab === 'tracking' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2. Tampilan HP Pelanggan (WA)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('inventory')}
                  className={`touch-target px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    activePreviewTab === 'inventory' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3. Gudang Part & Kasir Nota
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: Antrean SPK & Servis Bengkel */}
            {activePreviewTab === 'ro' && (
              <div className="p-5 sm:p-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Daftar Pengerjaan Aktif (Repair Orders)</h3>
                    <p className="text-xs text-slate-400">Status real-time kendaraan di stall lift pengerjaan bengkel.</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded">
                    3 Kendaraan Dalam Proses
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Card 1 */}
                  <div className="bg-[#080e1b] p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-400">RO-2026-0042</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60">
                        DIKERJAKAN
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Toyota Avanza 1.3 Veloz</h4>
                      <p className="font-mono text-xs text-emerald-400 font-bold">AG 1822 AB</p>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 border-t border-slate-800 pt-2">
                      <p><span className="text-slate-400">Keluhan:</span> Rem bunyi & getar saat deselerasi</p>
                      <p><span className="text-slate-400">Mekanik:</span> Mas Hendra (Stall-01)</p>
                      <p className="text-emerald-400 font-mono font-bold pt-1">Rp 650.000 <span className="text-slate-400 font-normal">(Disetujui via WA)</span></p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-[#080e1b] p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-400">RO-2026-0043</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700/60">
                        MENUNGGU PART
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Mitsubishi Xpander Ultimate</h4>
                      <p className="font-mono text-xs text-emerald-400 font-bold">AG 1945 CD</p>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 border-t border-slate-800 pt-2">
                      <p><span className="text-slate-400">Keluhan:</span> Shockbreaker bocor & bunyi jedug</p>
                      <p><span className="text-slate-400">Mekanik:</span> Mas Budi (Stall-02)</p>
                      <p className="text-emerald-400 font-mono font-bold pt-1">Rp 1.450.000 <span className="text-slate-400 font-normal">(Menunggu part distributor)</span></p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-[#080e1b] p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-400">RO-2026-0044</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                        SELESAI (SIAP AMBIL)
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Honda Civic RS Turbo</h4>
                      <p className="font-mono text-xs text-emerald-400 font-bold">AG 1001 EF</p>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1 border-t border-slate-800 pt-2">
                      <p><span className="text-slate-400">Layanan:</span> Tune Up Injeksi & Ganti Oli Mesin</p>
                      <p><span className="text-slate-400">Mekanik:</span> Mas Joko (Stall-03)</p>
                      <p className="text-emerald-400 font-mono font-bold pt-1">Rp 880.000 <span className="text-slate-400 font-normal">(QC Lulus · Nota siap cetak)</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Tampilan HP Pelanggan */}
            {activePreviewTab === 'tracking' && (
              <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-xs font-bold">
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

                {/* Smartphone Preview */}
                <div className="bg-[#060b17] p-4 rounded-xl border border-slate-800 shadow-xl space-y-3 max-w-sm mx-auto w-full">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <BengkelOSLogoIcon className="w-4 h-4" />
                      <span className="font-bold text-xs text-white">Bengkel Mitra BengkelOS</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">
                      TAHAP 3 DARI 6
                    </span>
                  </div>

                  <div className="bg-[#0c1525] p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Toyota Avanza 1.3 Veloz</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">AG 18** **</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Mekanik: Mas Hendra · Stall Lift 01</p>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                    <div className="py-1 rounded bg-emerald-900/80 text-emerald-300">1. Masuk ✓</div>
                    <div className="py-1 rounded bg-emerald-900/80 text-emerald-300">2. Estimasi ✓</div>
                    <div className="py-1 rounded bg-blue-600 text-white animate-pulse">3. Pengerjaan</div>
                    <div className="py-1 rounded bg-slate-800 text-slate-500">4. Selesai</div>
                  </div>

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
              <div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center">
                      <Database className="w-4 h-4 mr-1.5 text-emerald-400" />
                      Stok Suku Cadang Terpotong Otomatis
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">FIFO Inventory</span>
                  </div>
                  <div className="bg-[#060b17] rounded-lg border border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#0c1525] text-slate-400 text-[10px] uppercase font-mono border-b border-slate-800">
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
                    Setiap sparepart yang ditambahkan ke SPK langsung memotong stok gudang secara akurat.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center">
                      <Printer className="w-4 h-4 mr-1.5 text-emerald-400" />
                      Cetak Nota Kasir & Invoice PDF
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Lunas (QRIS)</span>
                  </div>

                  <div className="bg-[#060b17] p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-xs text-slate-300">
                    <div className="text-center border-b border-dashed border-slate-700 pb-2">
                      <p className="font-bold text-white text-sm">BENGKEL MITRA BENGKELOS</p>
                      <p className="text-[11px] text-slate-400">Workshop & Service Center</p>
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
                        <span>Brake Pad Genuine:</span>
                        <span>Rp 220.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jasa Ganti & Tune Up:</span>
                        <span>Rp 430.000</span>
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

      {/* =========================================================================
          6. PRICING SECTION (#harga) - TO BE ANNOUNCED
         ========================================================================= */}
      <section id="harga" className="py-16 sm:py-20 bg-[#060b17] border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
              Paket Berlangganan
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Investasi Terjangkau, Hasil Maksimal
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Pilihan paket fleksibel untuk mendukung efisiensi bengkel Anda. Skema harga resmi akan segera diumumkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Plan 1: Starter */}
            <div className="bg-[#0c1525] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                  STARTER
                </span>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">To Be Announced</div>
                  <p className="text-xs text-slate-400 mt-1">Untuk bengkel mandiri yang baru merintis</p>
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 border-t border-slate-800 pt-4">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Maks. 30 SPK / bulan</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> 1 Akun Kasir & Mekanik</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Live Tracking WA (Link)</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Cetak Struk Thermal 58mm</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleLoginClick}
                className="touch-target mt-6 w-full py-2.5 rounded-lg border border-slate-700 bg-[#080e1b] hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Gabung Waitlist
              </button>
            </div>

            {/* Plan 2: Pro (Recommended) */}
            <div className="bg-[#0c1525] border-2 border-emerald-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-emerald-950/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase">
                Segera Diumumkan
              </div>
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  BENGKEL PRO
                </span>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">To Be Announced</div>
                  <p className="text-xs text-slate-400 mt-1">Operasional lengkap tanpa batas kuota</p>
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 border-t border-slate-800 pt-4">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Unlimited SPK & Repair Orders</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Multi-User (Owner, Kasir, Mekanik)</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Inventori FIFO & Stok Opname</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Laporan Laba Rugi & Kas Harian</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Invoice PDF Resmi Logo Bengkel</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Prioritas Support via WhatsApp</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleLoginClick}
                className="touch-target mt-6 w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                Daftar Early Access
              </button>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="bg-[#0c1525] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  MULTI-CABANG
                </span>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">To Be Announced</div>
                  <p className="text-xs text-slate-400 mt-1">Untuk jaringan bengkel waralaba / 3+ cabang</p>
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 border-t border-slate-800 pt-4">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Konsolidasi Laporan Multi-Cabang</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Transfer Stok Antar Gudang</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Superadmin Centralized Audit</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Custom Domain / Subdomain</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0" /> Dedicated Account Manager</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleLoginClick}
                className="touch-target mt-6 w-full py-2.5 rounded-lg border border-slate-700 bg-[#080e1b] hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Konsultasi Kebutuhan
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. FAQ SECTION (100% Canva 2-Column Accordion Layout)
         ========================================================================= */}
      <section id="faq" className="py-16 sm:py-20 bg-[#080f1e] border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Title: Pertanyaan yang Sering Diajukan */}
          <div className="text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Informasi lengkap seputar implementasi dan fitur platform BengkelOS.
            </p>
          </div>

          {/* 2-Column Accordion Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            
            {/* Column 1 (Left 3 questions) */}
            <div className="space-y-3">
              {FAQ_ITEMS.slice(0, 3).map((item) => {
                const isOpen = openFaq === item.id;
                return (
                  <div 
                    key={item.id}
                    className="bg-[#0c1525] border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : item.id)}
                      className="touch-target w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-white"
                    >
                      <span className="pr-2">{item.q}</span>
                      <span className="w-7 h-7 rounded-lg bg-[#080e1b] flex items-center justify-center shrink-0 border border-slate-800 text-slate-400">
                        {isOpen ? <Minus className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Column 2 (Right 3 questions) */}
            <div className="space-y-3">
              {FAQ_ITEMS.slice(3, 6).map((item) => {
                const isOpen = openFaq === item.id;
                return (
                  <div 
                    key={item.id}
                    className="bg-[#0c1525] border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : item.id)}
                      className="touch-target w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-white"
                    >
                      <span className="pr-2">{item.q}</span>
                      <span className="w-7 h-7 rounded-lg bg-[#080e1b] flex items-center justify-center shrink-0 border border-slate-800 text-slate-400">
                        {isOpen ? <Minus className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          8. BOTTOM CTA BANNER (100% Canva with High-Res Blueprint Car)
         ========================================================================= */}
      <section className="py-14 sm:py-20 bg-[#060b17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="relative rounded-2xl overflow-hidden border border-blue-900/50 bg-gradient-to-r from-[#09152b] via-[#0b1c3a] to-[#071124] p-8 sm:p-12 lg:p-14 shadow-2xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Column: Ultra-Sharp CAD Blueprint Car Illustration */}
              <div className="lg:col-span-6 flex justify-center lg:justify-start">
                <img 
                  src={resolveAssetUrl('/assets/bengkelos/blueprint-car-hd.jpg')} 
                  alt="BengkelOS Smart Automotive Platform"
                  className="w-full max-w-[480px] h-auto object-contain rounded-xl mix-blend-screen drop-shadow-[0_0_35px_rgba(56,189,248,0.45)]"
                />
              </div>

              {/* Right Column: CTA Content */}
              <div className="lg:col-span-6 space-y-4 text-left">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Siap Mengelola Bengkel Anda Lebih Baik?
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Bergabung dengan ribuan bengkel yang telah merasakan manfaat BengkelOS.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleLoginClick}
                    className="touch-target inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:scale-98 group"
                  >
                    <span>Mulai Sekarang Gratis</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoClick}
                    className="touch-target inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-slate-700 bg-[#0c1524] hover:bg-[#111e33] hover:border-slate-500 text-white font-bold text-sm tracking-wide transition-all"
                  >
                    <Play className="w-3.5 h-3.5 mr-2 text-emerald-400 fill-emerald-400" />
                    <span>Lihat Demo</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          9. FOOTER
         ========================================================================= */}
      <footer className="bg-[#040810] text-slate-400 py-10 border-t border-slate-800/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2.5">
            <BengkelOSLogoIcon className="w-5 h-5" />
            <span className="font-bold text-white tracking-tight text-sm">BengkelOS</span>
            <span className="text-slate-500">· Software Manajemen Bengkel Modern</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#solusi" className="hover:text-white transition-colors">Solusi</a>
            <a href="#harga" className="hover:text-white transition-colors">Harga</a>
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

          <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Semua Sistem Normal (100% Uptime)</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
