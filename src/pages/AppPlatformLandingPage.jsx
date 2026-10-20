import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, Sun, Moon, LogIn, ArrowRight, ShieldCheck, 
  Smartphone, Database, Layers, CheckCircle2, DollarSign, 
  Car, Users, Sparkles, Building2, Phone, MapPin, 
  ChevronRight, ExternalLink, Activity, BookOpen, Clock,
  Sliders, Gauge, Volume2, VolumeX, FileText, Check,
  RotateCcw, Camera, Printer, QrCode, AlertTriangle,
  Cpu, Zap, TrendingUp, Percent, Shield, Award, Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { resolveAssetUrl } from '../utils/assetUrl';
import { DEFAULT_WORKSHOP_PHONE, DEFAULT_WORKSHOP_ADDRESS, DEFAULT_BUSINESS_HOURS } from '../utils/config';

// Synthesize tactile relay / hardware switch click sound via Web Audio API (zero asset latency)
function playMechanicalClick(enabled) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch (err) {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

// 4 Grounded Indonesian Garage Testbed Datasets
const VEHICLE_DATASETS = [
  {
    id: 'avanza',
    model: 'Toyota Avanza 1.3 Veloz',
    year: '2022',
    plate: 'AG 1822 AB',
    color: 'Silver Metallic',
    mileage: '48.210 KM',
    mechanic: 'Mas Hendra',
    stall: 'Stall-01 (Lift 4-Ton)',
    elapsed: '42 Menit',
    issue: 'Mesin Brebet di RPM Bawah & Kampas Rem Tipis',
    dtc: 'P0300 (Random Misfire Silinder 2 & 3)',
    sensors: {
      rpm: 780,
      stft: '+1.8%',
      ltft: '+3.2%',
      fuelPressure: '3.2 Bar',
      brakePadWear: '2.4 mm (Kritis)',
      oilCondition: 'Degradasi 82%'
    },
    services: [
      { name: 'Tune Up EFI & Gurah Ruang Bakar Carbon Clean', price: 250000, type: 'jasa' },
      { name: 'Busi Iridium Denso (4 Pcs)', price: 320000, type: 'part', hpp: 210000, sku: 'BSI-DEN-IRID-04', stock: 18 },
      { name: 'Kampas Rem Depan Bendix Brake Pads', price: 280000, type: 'part', hpp: 185000, sku: 'BRK-BDX-AVZ-01', stock: 8 },
      { name: 'Oli Mesin TMO 5W-30 Full Synthetic 4L', price: 380000, type: 'part', hpp: 270000, sku: 'OIL-TMO-5W30-4L', stock: 24 },
      { name: 'Filter Oli Original Toyota Denso', price: 45000, type: 'part', hpp: 28000, sku: 'FLT-OIL-AVZ-02', stock: 35 }
    ],
    beforePhoto: '/images/before-after/spark-plug-worn.jpg',
    afterPhoto: '/images/before-after/spark-plug-new.jpg',
    beforeCaption: 'Busi lama aus berkerak karbon parah & elektroda terkorosi',
    afterCaption: 'Busi baru Iridium Denso terpasang, celah presisi 0.8 mm',
    waStage: 4,
    waStageLabel: 'Tahap 4/6: Suku Cadang Terpasang & Difoto'
  },
  {
    id: 'xpander',
    model: 'Mitsubishi Xpander Cross 1.5',
    year: '2021',
    plate: 'AG 7788 KL',
    color: 'Quartz White Pearl',
    mileage: '41.150 KM',
    mechanic: 'Mas Agus',
    stall: 'Stall-02 (Two-Post Lift)',
    elapsed: '1 Jam 15 Menit',
    issue: 'Kemudi Getar di 80 km/jam & Servis Berkala 40.000 KM',
    dtc: 'SISTEM NORMAL (NO DTC CODE)',
    sensors: {
      rpm: 720,
      stft: '-0.4%',
      ltft: '+1.1%',
      fuelPressure: '3.4 Bar',
      brakePadWear: '5.1 mm (Aman)',
      oilCondition: 'Degradasi 91%'
    },
    services: [
      { name: 'Servis Berkala Mayor 40.000 KM', price: 350000, type: 'jasa' },
      { name: 'Spooring 3D Komputer & 4-Wheel Balancing', price: 200000, type: 'jasa' },
      { name: 'Oli Mesin Mitsubishi Motors Genuine 0W-20 4L', price: 420000, type: 'part', hpp: 300000, sku: 'OIL-MMG-0W20-4L', stock: 12 },
      { name: 'Filter Udara Mesin Sakura Air Filter', price: 95000, type: 'part', hpp: 62000, sku: 'FLT-AIR-XPN-03', stock: 14 },
      { name: 'Minyak Rem DOT 4 Seiken 1L', price: 85000, type: 'part', hpp: 55000, sku: 'OIL-BRK-DOT4-1L', stock: 19 }
    ],
    beforePhoto: '/images/before-after/brake-pad-worn.jpg',
    afterPhoto: '/images/gallery/facility-tools.jpg',
    beforeCaption: 'Kampas rem tipis habis sisa 2.4 mm (gesekan logam)',
    afterCaption: 'Kampas rem baru terpasang & kaliper dikencangkan sesuai torsi',
    waStage: 3,
    waStageLabel: 'Tahap 3/6: Pengerjaan Kaki-kaki di Lift'
  },
  {
    id: 'civic',
    model: 'Honda Civic 1.5 VTEC Turbo',
    year: '2020',
    plate: 'AG 3456 MN',
    color: 'Rallye Red',
    mileage: '54.800 KM',
    mechanic: 'Pak Joko',
    stall: 'Stall-03 (Diagnostic Bay)',
    elapsed: '2 Jam 05 Menit',
    issue: 'Indikator Check Engine Nyala & Boost Hilang di Tanjakan',
    dtc: 'P0299 (Turbocharger Underboost Condition)',
    sensors: {
      rpm: 820,
      stft: '+3.4%',
      ltft: '+6.1%',
      fuelPressure: '4.1 Bar',
      brakePadWear: '3.8 mm (Sedang)',
      oilCondition: 'Degradasi 65%'
    },
    services: [
      { name: 'Diagnostik OBD-II & Smoke Leak Test Intercooler', price: 300000, type: 'jasa' },
      { name: 'Pembersihan Boost Control Solenoid & Sensor MAP', price: 200000, type: 'jasa' },
      { name: 'Klem & Selang Silikon Intercooler High Temp', price: 175000, type: 'part', hpp: 110000, sku: 'PIP-TUR-HND-01', stock: 6 },
      { name: 'Bubut Cakram Rotor Depan On-Car Lathe', price: 350000, type: 'jasa' },
      { name: 'Kampas Rem Brembo Ceramic Front', price: 580000, type: 'part', hpp: 410000, sku: 'BRK-BRM-CVC-02', stock: 4 }
    ],
    beforePhoto: '/images/before-after/spark-plug-worn.jpg',
    afterPhoto: '/images/gallery/facility-tools.jpg',
    beforeCaption: 'Residu karbon & sensor kotor memicu boost drop (DTC P0299)',
    afterCaption: 'Boost normal 1.4 Bar, manifold bersih & DTC Clear',
    waStage: 5,
    waStageLabel: 'Tahap 5/6: Quality Control & Dyno Road Test'
  },
  {
    id: 'fortuner',
    model: 'Toyota Fortuner 2.8 VRZ GR Sport',
    year: '2023',
    plate: 'AG 9999 XX',
    color: 'Attitude Black Mica',
    mileage: '32.400 KM',
    mechanic: 'Mas Rizal',
    stall: 'Stall-01 (Lift 4-Ton)',
    elapsed: '35 Menit',
    issue: 'Perawatan Common Rail Diesel & Kuras Total Oli Matik ATF',
    dtc: 'SISTEM NORMAL (COMMON RAIL 1.820 BAR)',
    sensors: {
      rpm: 700,
      stft: '0.0%',
      ltft: '+0.8%',
      fuelPressure: '1.820 Bar',
      brakePadWear: '7.8 mm (Sangat Baik)',
      oilCondition: 'Degradasi 88%'
    },
    services: [
      { name: 'Kalibrasi Injektor Common Rail & Diesel Purging', price: 450000, type: 'jasa' },
      { name: 'Kuras Total Oli Transmisi Matik ATF (10 Liter)', price: 350000, type: 'jasa' },
      { name: 'Oli Transmisi TMO ATF WS Original (10L)', price: 1250000, type: 'part', hpp: 920000, sku: 'OIL-TMO-ATFWS-10L', stock: 15 },
      { name: 'Filter Solar Bawah & Filter Solar Atas Genuine', price: 360000, type: 'part', hpp: 245000, sku: 'FLT-SOL-FTN-02', stock: 9 },
      { name: 'Oli Mesin Diesel Delvac 1 ESP 5W-40 (8L)', price: 1100000, type: 'part', hpp: 830000, sku: 'OIL-MOB-ESP5W40-8L', stock: 18 }
    ],
    beforePhoto: '/images/before-after/brake-pad-worn.jpg',
    afterPhoto: '/images/services/tune-up.jpg',
    beforeCaption: 'Filter kotor endapan residu & oli transmisi keruh',
    afterCaption: 'Filter baru genuine terpasang & oli baru jernih merah',
    waStage: 2,
    waStageLabel: 'Tahap 2/6: Estimasi Biaya Disetujui Pemilik'
  }
];

export default function AppPlatformLandingPage({ 
  onNavigateTenant, 
  onOpenAdmin, 
  onOpenSuperadmin, 
  onNavigateDocs 
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  // Sound Feedback Toggle
  const [audioFeedback, setAudioFeedback] = useState(false);

  // Active Vehicle in Command Console
  const [selectedVehicleId, setSelectedVehicleId] = useState('avanza');

  // Active Screen in Command Console ('whatsapp' | 'radar' | 'thermal' | 'fifo')
  const [activeConsoleTab, setActiveConsoleTab] = useState('whatsapp');

  // Before/After Photo slider (0 = 100% Before, 100 = 100% After, 50 = split)
  const [photoSliderPos, setPhotoSliderPos] = useState(50);

  // Active Diagnostic Sensor in Telemetry
  const [activeSensorKey, setActiveSensorKey] = useState('fuel');

  // 6-Stage Workflow Active Node
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(3);

  // Profit Leakage & ROI Interactive Calculator State
  const [calcCarsPerDay, setCalcCarsPerDay] = useState(14);
  const [calcAvgTicket, setCalcAvgTicket] = useState(650000);

  // Load public tenants from database
  useEffect(() => {
    let isMounted = true;
    fetch('/api/public/tenants')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (isMounted && data?.tenants) {
          setTenants(data.tenants);
        }
      })
      .catch(err => console.warn('Gagal memuat tenant showcase:', err))
      .finally(() => {
        if (isMounted) setLoadingTenants(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Keyboard shortcut listener: keys 1-4 switch vehicles, key D launches demo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is in an input or slider
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === '1') {
        setSelectedVehicleId('avanza');
        playMechanicalClick(audioFeedback);
      } else if (e.key === '2') {
        setSelectedVehicleId('xpander');
        playMechanicalClick(audioFeedback);
      } else if (e.key === '3') {
        setSelectedVehicleId('civic');
        playMechanicalClick(audioFeedback);
      } else if (e.key === '4') {
        setSelectedVehicleId('fortuner');
        playMechanicalClick(audioFeedback);
      } else if (e.key.toLowerCase() === 'd') {
        onNavigateTenant('bengkel-gps-motor');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioFeedback, onNavigateTenant]);

  const activeVehicle = useMemo(() => {
    return VEHICLE_DATASETS.find(v => v.id === selectedVehicleId) || VEHICLE_DATASETS[0];
  }, [selectedVehicleId]);

  // Financial Calculations for current vehicle
  const vehicleFinancials = useMemo(() => {
    const totalJasa = activeVehicle.services
      .filter(s => s.type === 'jasa')
      .reduce((acc, s) => acc + s.price, 0);
    const totalPart = activeVehicle.services
      .filter(s => s.type === 'part')
      .reduce((acc, s) => acc + s.price, 0);
    const totalHppPart = activeVehicle.services
      .filter(s => s.type === 'part')
      .reduce((acc, s) => acc + (s.hpp || 0), 0);
    const grandTotal = totalJasa + totalPart;
    const grossProfit = grandTotal - totalHppPart;
    const profitMargin = grandTotal > 0 ? ((grossProfit / grandTotal) * 100).toFixed(1) : 0;
    return { totalJasa, totalPart, totalHppPart, grandTotal, grossProfit, profitMargin };
  }, [activeVehicle]);

  // Profit Leakage & ROI Calculations
  const calculatedMetrics = useMemo(() => {
    const workingDays = 26; // days/month
    const monthlyTurnover = calcCarsPerDay * calcAvgTicket * workingDays;
    
    // Conventional workshops leak 7-9% of revenue to unbilled parts & inventory loss
    const stockLeakagePrevented = Math.round(monthlyTurnover * 0.08);

    // Administrative labor saved (hours per month)
    const adminHoursSaved = Math.round(calcCarsPerDay * 0.12 * workingDays);

    // Revenue increase from automatic WhatsApp service reminders (+14% repeat visit rate)
    const repeatOrderTurnover = Math.round(monthlyTurnover * 0.14);

    // Net value added per month
    const totalUpside = stockLeakagePrevented + Math.round(repeatOrderTurnover * 0.35); // 35% margin on added repeat orders

    // Software subscription (Workshop Pro: Rp 449.000)
    const softwareCost = 449000;
    const roiMultiple = softwareCost > 0 ? (totalUpside / softwareCost).toFixed(0) : '0';

    return {
      monthlyTurnover,
      stockLeakagePrevented,
      adminHoursSaved,
      repeatOrderTurnover,
      totalUpside,
      roiMultiple
    };
  }, [calcCarsPerDay, calcAvgTicket]);

  const handleLoginClick = () => {
    playMechanicalClick(audioFeedback);
    onOpenAdmin();
  };

  const handleTabSwitch = (tab) => {
    playMechanicalClick(audioFeedback);
    setActiveConsoleTab(tab);
  };

  const handleVehicleSelect = (id) => {
    playMechanicalClick(audioFeedback);
    setSelectedVehicleId(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans ">
      
      {/* 1. Header Precision Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Platform Identity */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none shrink-0"
            onClick={() => {
              playMechanicalClick(audioFeedback);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-[#0c2b5e] flex items-center justify-center text-emerald-400 border border-blue-900/40 shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans leading-none">
                  BengkelOS
                </span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 uppercase">
                  Platform
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  SYS: NOMINAL · OBD-II SYNCED
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <a 
              href="#konsol-bengkel" 
              onClick={() => playMechanicalClick(audioFeedback)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              Telemetri
            </a>
            <a 
              href="#integritas" 
              onClick={() => playMechanicalClick(audioFeedback)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              4 Pilar
            </a>
            <a 
              href="#alur-kerja" 
              onClick={() => playMechanicalClick(audioFeedback)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              Alur Servis
            </a>
            <a 
              href="#kalkulator-laba" 
              onClick={() => playMechanicalClick(audioFeedback)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              Kalkulator
            </a>
            <a 
              href="#mitra-bengkel" 
              onClick={() => playMechanicalClick(audioFeedback)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              Mitra
            </a>
            <a 
              href="#harga" 
              onClick={() => playMechanicalClick(audioFeedback)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              Harga
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Audio Feedback Button */}
            <button
              type="button"
              onClick={() => {
                const next = !audioFeedback;
                setAudioFeedback(next);
                if (next) playMechanicalClick(true);
              }}
              aria-label="Toggle Efek Suara Relai Mekanikal"
              title={audioFeedback ? "Suara Relai: AKTIF" : "Suara Relai: SENYAP"}
              className={`touch-target w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded border transition-colors ${
                audioFeedback 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-400'
              }`}
            >
              {audioFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dark/Light Toggle */}
            <button
              type="button"
              onClick={() => {
                playMechanicalClick(audioFeedback);
                toggleTheme();
              }}
              aria-label="Ganti Mode Gelap / Terang"
              className="touch-target w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-500 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Demo Link */}
            <button
              type="button"
              onClick={() => {
                playMechanicalClick(audioFeedback);
                onNavigateTenant('bengkel-gps-motor');
              }}
              className="touch-target hidden 2xl:inline-flex items-center space-x-1.5 px-3 py-2 rounded border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-600" />
              <span>Portal Bengkel Mitra</span>
            </button>

            {/* Login / Portal Button */}
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={loading}
              className="touch-target inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded bg-[#0c2b5e] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span>{user ? 'Dashboard' : 'Portal Bengkel'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Master Hero Section: 1-Column Royal Blue Downward Hierarchy (Sesuai Vibe Mockup) */}
      <section className="relative bg-[#0c2b5e] dark:bg-slate-950 text-white border-b border-slate-800 pt-12 sm:pt-16 pb-12 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Main Headline (Direct, No Banned Eyebrow / Kicker) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight max-w-4xl mx-auto font-sans">
            Sistem Operasi untuk Bengkel Mobil yang Berani Transparan.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-blue-100/90 max-w-3xl mx-auto leading-relaxed font-sans">
            Satu platform digital terpadu menghubungkan stall lift teknisi, gudang suku cadang FIFO, dan pelacakan live WhatsApp langsung ke genggaman pemilik mobil—tanpa aplikasi terpisah, tanpa nota cakar ayam, tanpa kecurigaan.
          </p>

          {/* Action CTAs: 1-Column Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#konsol-bengkel"
              onClick={() => playMechanicalClick(audioFeedback)}
              className="touch-target inline-flex items-center justify-center px-6 py-3.5 rounded bg-[#00a86b] hover:bg-[#00925d] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md"
            >
              <Gauge className="w-4 h-4 mr-2" />
              Uji Coba Konsol Bengkel Di Bawah ↓
            </a>

            <button
              type="button"
              onClick={handleLoginClick}
              className="touch-target inline-flex items-center justify-center px-5 py-3.5 rounded border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2 text-emerald-400" />
              Masuk Portal Staf / Owner
            </button>
          </div>

          {/* Live Link to Real Garage */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                playMechanicalClick(audioFeedback);
                onNavigateTenant('bengkel-gps-motor');
              }}
              className="inline-flex items-center space-x-1.5 text-xs text-blue-200 hover:text-white underline underline-offset-4 font-mono font-medium"
            >
              <span>Lihat Contoh Website Publik Bengkel Mitra</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Technical Telemetry Strip: 4 Grounded Metrics */}
          <div className="pt-8 border-t border-blue-900/60 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3 rounded bg-white/5 border border-white/10">
              <span className="text-xs font-mono uppercase text-blue-200">Volume Servis</span>
              <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tabular-nums mt-0.5">3.850+</p>
              <span className="text-xs text-blue-200">SPK digital terproses</span>
            </div>
            <div className="p-3 rounded bg-white/5 border border-white/10">
              <span className="text-xs font-mono uppercase text-blue-200">Akurasi Gudang</span>
              <p className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums mt-0.5">100% FIFO</p>
              <span className="text-xs text-blue-200">Nol selisih suku cadang</span>
            </div>
            <div className="p-3 rounded bg-white/5 border border-white/10">
              <span className="text-xs font-mono uppercase text-blue-200">Transparansi WA</span>
              <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tabular-nums mt-0.5">0 Detik</p>
              <span className="text-xs text-blue-200">Tanpa download app</span>
            </div>
            <div className="p-3 rounded bg-white/5 border border-white/10">
              <span className="text-xs font-mono uppercase text-blue-200">Printer Kasir</span>
              <p className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums mt-0.5">58mm &amp; 80mm</p>
              <span className="text-xs text-blue-200">Thermal Bluetooth &amp; USB</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. The Masterpiece: Interactive Workshop Command & Telemetry Rig */}
      <section id="konsol-bengkel" className="py-12 sm:py-20 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Section Header: 1 Column Clean */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Simulasi Konsol Interaktif Bengkel</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Pusat Kendali Operasional Bengkel Fisik
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Pilih mobil uji coba di bawah untuk melihat bagaimana sistem menghubungkan diagnosa scanner OBD-II, pelacakan live WhatsApp pemilik, alokasi stall lift fisik, dan pembukuan kasir.
            </p>
          </div>

          {/* Vehicle Testbed Job Cards Selector (Keys [1-4]) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              <span>PILIH MOBIL SERVIS UJI COBA (TEKAN TOMBOL 1 - 4 DI KEYBOARD):</span>
              <span className="hidden sm:inline">4 KASUS SERVIS RIIL</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {VEHICLE_DATASETS.map((veh, idx) => {
                const isSelected = veh.id === selectedVehicleId;
                return (
                  <button
                    key={veh.id}
                    type="button"
                    onClick={() => handleVehicleSelect(veh.id)}
                    className={`touch-target text-left p-3.5 rounded border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-800 shadow-md ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-amber-400 dark:bg-black dark:text-amber-400 border border-slate-700">
                          {veh.plate}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          Key [{idx + 1}]
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase mt-2 leading-snug">
                        {veh.model}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {veh.year} · {veh.mileage}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[150px]">
                        {veh.issue}
                      </span>
                      <span className={`font-mono font-bold shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {isSelected ? 'AKTIF' : 'PILIH'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Console Workspace Body: 1 Column Downward Layout */}
          <div className="rounded border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sm:p-6 space-y-6 shadow-sm">
            
            {/* Top Bar of Console: Vehicle Telemetry Status & Live Sensors */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    LIVE INSPEKSI: {activeVehicle.stall}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    PIC: {activeVehicle.mechanic} ({activeVehicle.elapsed})
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase">
                  {activeVehicle.model} ({activeVehicle.plate})
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-mono font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>DTC SCANNER: {activeVehicle.dtc}</span>
                </p>
              </div>

              {/* 3 Clickable Live ECU Sensor Telemetry Nodes */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-left">
                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick(audioFeedback);
                    setActiveSensorKey('fuel');
                  }}
                  className={`touch-target p-2 sm:p-2.5 rounded border text-left transition-colors ${
                    activeSensorKey === 'fuel' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 block">Sistem Injeksi</span>
                  <p className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">{activeVehicle.sensors.fuelPressure}</p>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">RPM: {activeVehicle.sensors.rpm}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick(audioFeedback);
                    setActiveSensorKey('brake');
                  }}
                  className={`touch-target p-2 sm:p-2.5 rounded border text-left transition-colors ${
                    activeSensorKey === 'brake' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 block">Kampas Rem</span>
                  <p className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">{activeVehicle.sensors.brakePadWear}</p>
                  <span className="text-xs font-mono text-rose-600 dark:text-rose-400">Verifikasi Sensor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playMechanicalClick(audioFeedback);
                    setActiveSensorKey('oil');
                  }}
                  className={`touch-target p-2 sm:p-2.5 rounded border text-left transition-colors ${
                    activeSensorKey === 'oil' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 block">Pelumas Mesin</span>
                  <p className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5">{activeVehicle.sensors.oilCondition}</p>
                  <span className="text-xs font-mono text-amber-600 dark:text-amber-400">Wajib Ganti</span>
                </button>
              </div>
            </div>

            {/* 4-Way Terminal Screen Switcher */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mr-2 uppercase">
                TAMPILAN TERMINAL:
              </span>
              <button
                type="button"
                onClick={() => handleTabSwitch('whatsapp')}
                className={`touch-target px-3 py-2 rounded text-xs font-mono font-bold uppercase transition-all flex items-center space-x-1.5 ${
                  activeConsoleTab === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>1. Live WhatsApp Pelanggan</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('radar')}
                className={`touch-target px-3 py-2 rounded text-xs font-mono font-bold uppercase transition-all flex items-center space-x-1.5 ${
                  activeConsoleTab === 'radar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. Radar 3-Stall Lift Bengkel</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('thermal')}
                className={`touch-target px-3 py-2 rounded text-xs font-mono font-bold uppercase transition-all flex items-center space-x-1.5 ${
                  activeConsoleTab === 'thermal'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>3. Struk POS Thermal 58mm</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('fifo')}
                className={`touch-target px-3 py-2 rounded text-xs font-mono font-bold uppercase transition-all flex items-center space-x-1.5 ${
                  activeConsoleTab === 'fifo'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>4. Gudang FIFO &amp; Laba</span>
              </button>
            </div>

            {/* TAB CONTENT 1: WHATSAPP CUSTOMER LIVE VIEW WITH BEFORE/AFTER PHOTO SLIDER */}
            {activeConsoleTab === 'whatsapp' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left (7 cols): Interactive Before / After Photo Comparison Slider */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                        Bukti Transparansi: Foto Sebelum vs Sesudah
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Geser slider di bawah untuk membuktikan foto kondisi part lama vs part baru.
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          playMechanicalClick(audioFeedback);
                          setPhotoSliderPos(0);
                        }}
                        className={`touch-target px-2 py-1 rounded text-xs font-mono font-bold ${
                          photoSliderPos === 0 ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Sebelum
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playMechanicalClick(audioFeedback);
                          setPhotoSliderPos(50);
                        }}
                        className={`touch-target px-2 py-1 rounded text-xs font-mono font-bold ${
                          photoSliderPos === 50 ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        50:50
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playMechanicalClick(audioFeedback);
                          setPhotoSliderPos(100);
                        }}
                        className={`touch-target px-2 py-1 rounded text-xs font-mono font-bold ${
                          photoSliderPos === 100 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Sesudah
                      </button>
                    </div>
                  </div>

                  {/* Interactive Split View Frame */}
                  <div className="relative rounded overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-900 h-64 sm:h-80 select-none">
                    {/* Background: After Photo (Full size) */}
                    <img 
                      src={resolveAssetUrl(activeVehicle.afterPhoto)} 
                      alt="Kondisi Setelah Servis"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Foreground: Before Photo with CSS clipPath (Full size, zero distortion) */}
                    <img 
                      src={resolveAssetUrl(activeVehicle.beforePhoto)} 
                      alt="Kondisi Sebelum Servis"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ clipPath: `inset(0 ${100 - photoSliderPos}% 0 0)` }}
                    />

                    {/* Before Tag (left) */}
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-rose-600 text-white text-xs font-mono font-black uppercase shadow pointer-events-none">
                      SEBELUM: AUS / RUSAK
                    </div>

                    {/* After Tag (right) */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded bg-emerald-600 text-white text-xs font-mono font-black uppercase shadow pointer-events-none">
                      SESUDAH: SUKU CADANG BARU
                    </div>

                    {/* Vertical Dividing Line & Handle */}
                    <div 
                      className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)] flex items-center justify-center pointer-events-none"
                      style={{ left: `${photoSliderPos}%` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-white text-slate-900 font-mono text-xs font-black flex items-center justify-center shadow-lg border border-slate-300">
                        ⇄
                      </div>
                    </div>

                    {/* Range input for smooth dragging */}
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={photoSliderPos}
                      onChange={(e) => setPhotoSliderPos(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                      aria-label="Geser Perbandingan Foto Sebelum dan Sesudah"
                    />

                    {/* Caption Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 p-2.5 flex items-center justify-between text-xs font-mono text-slate-200 pointer-events-none">
                      <span className="text-rose-300 truncate max-w-[48%]">
                        {activeVehicle.beforeCaption}
                      </span>
                      <span className="text-emerald-300 truncate max-w-[48%] text-right">
                        {activeVehicle.afterCaption}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-mono">
                    💡 Mekanik mengambil foto via kamera HP Android bengkel. Foto langsung ter-upload ke tautan status pelanggan tanpa download aplikasi.
                  </p>
                </div>

                {/* Right (5 cols): WhatsApp Customer Phone UI Simulator */}
                <div className="lg:col-span-5">
                  <div className="rounded border-2 border-slate-800 dark:border-slate-700 bg-slate-900 text-white p-4 space-y-4 shadow-xl">
                    
                    {/* Phone Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-emerald-950 font-black text-xs flex items-center justify-center">
                          WA
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-bold text-white">Bengkel Mobil Mitra (Official)</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <span className="text-xs text-slate-400 font-mono">Resmi Terverifikasi</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                        LIVE TRACKING
                      </span>
                    </div>

                    {/* Customer Message Bubble */}
                    <div className="rounded bg-slate-800 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-400 font-bold">{activeVehicle.plate}</span>
                        <span className="text-slate-400">{activeVehicle.model}</span>
                      </div>
                      
                      <div className="bg-slate-900/80 rounded p-2 text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Status Pengerjaan:</span>
                          <span className="text-emerald-400 font-bold">{activeVehicle.waStageLabel}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-1.5 rounded-full" 
                            style={{ width: `${(activeVehicle.waStage / 6) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Itemized Services in WhatsApp View */}
                      <div className="space-y-1 pt-1 text-xs">
                        <span className="text-slate-400 font-mono uppercase text-xs block">Rincian Estimasi Biaya Transparan:</span>
                        {activeVehicle.services.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex justify-between font-mono text-slate-200">
                            <span className="truncate max-w-[200px]">· {item.name}</span>
                            <span className="tabular-nums">Rp {item.price.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="pt-2 border-t border-slate-700 flex justify-between font-mono font-bold text-xs">
                        <span className="text-white">Estimasi Terkunci:</span>
                        <span className="text-emerald-400">Rp {vehicleFinancials.grandTotal.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Customer WhatsApp Action Button */}
                    <button
                      type="button"
                      onClick={() => playMechanicalClick(audioFeedback)}
                      className="touch-target w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui Estimasi Tanpa Datang</span>
                    </button>

                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 2: RADAR 3-STALL LIFT BENGKEL */}
            {activeConsoleTab === 'radar' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                      Peta Radar Lantai Bengkel Fisik (3 Stall Lift)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pantau pergerakan mobil di setiap stall lift, mekanik penanggung jawab, dan timer pengerjaan.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded border border-emerald-300 dark:border-emerald-800">
                    3 DARI 3 STALL AKTIF
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stall 1 */}
                  <div className={`p-4 rounded border transition-all ${
                    activeVehicle.stall.includes('Stall-01')
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">STALL-01 (Lift 4-Ton)</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">LIFT NAIK</span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase">
                        {activeVehicle.id === 'fortuner' ? 'Toyota Fortuner 2.8 VRZ' : 'Toyota Avanza 1.3 Veloz'}
                      </p>
                      <p className="text-xs font-mono text-slate-500">
                        Plat: {activeVehicle.id === 'fortuner' ? 'AG 9999 XX' : 'AG 1822 AB'} · Mas Hendra
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-mono">
                      <span className="text-slate-500">Timer Pengerjaan:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">42 Menit (On-Track)</span>
                    </div>
                  </div>

                  {/* Stall 2 */}
                  <div className={`p-4 rounded border transition-all ${
                    activeVehicle.stall.includes('Stall-02')
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">STALL-02 (Two-Post Lift)</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold">KAKI-KAKI</span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase">
                        Mitsubishi Xpander Cross
                      </p>
                      <p className="text-xs font-mono text-slate-500">
                        Plat: AG 7788 KL · Mas Agus
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-mono">
                      <span className="text-slate-500">Timer Pengerjaan:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">1 Jam 15 Menit</span>
                    </div>
                  </div>

                  {/* Stall 3 */}
                  <div className={`p-4 rounded border transition-all ${
                    activeVehicle.stall.includes('Stall-03')
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">STALL-03 (Diagnostic Bay)</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold">OBD-II SCAN</span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase">
                        Honda Civic 1.5 Turbo
                      </p>
                      <p className="text-xs font-mono text-slate-500">
                        Plat: AG 3456 MN · Pak Joko
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-mono">
                      <span className="text-slate-500">Timer Pengerjaan:</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">2 Jam 05 Menit</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                  <span className="font-mono">
                    💡 Mekanik menandai tahap servis langsung dari tombol HP mereka di stall masing-masing.
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    SINKRON OTOMATIS
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: THERMAL POS RECEIPT 58MM */}
            {activeConsoleTab === 'thermal' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                
                {/* Authentic 58mm Thermal Receipt Simulation */}
                <div className="w-full max-w-[340px] bg-white text-slate-900 p-5 rounded border border-slate-300 shadow-xl font-mono text-xs space-y-3">
                  
                  {/* Workshop Slip Header */}
                  <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-3">
                    <p className="text-sm font-black uppercase tracking-tight">BENGKEL MOBIL MITRA INDONESIA</p>
                    <p className="text-xs text-slate-600">Jl. Otomotif Raya No. 88, Bengkel Cloud</p>
                    <p className="text-xs text-slate-600">WhatsApp Booking: 0812-3456-7890</p>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-0.5 text-xs border-b border-dashed border-slate-400 pb-2">
                    <div className="flex justify-between">
                      <span>SPK NO</span>
                      <span className="font-bold">SPK-2026-10-089</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WAKTU</span>
                      <span>16/10/2026 14:35 WIB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KENDARAAN</span>
                      <span className="font-bold">{activeVehicle.plate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MODEL</span>
                      <span>{activeVehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MEKANIK</span>
                      <span>{activeVehicle.mechanic}</span>
                    </div>
                  </div>

                  {/* Itemized Services & Parts */}
                  <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-3 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>RINCIAN ITEM</span>
                      <span>HARGA (RP)</span>
                    </div>
                    {activeVehicle.services.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-800">
                        <span className="truncate max-w-[190px]">[{item.type === 'jasa' ? 'JASA' : 'PART'}] {item.name}</span>
                        <span className="tabular-nums font-bold">{item.price.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="space-y-1 text-xs pt-1">
                    <div className="flex justify-between">
                      <span>SUBTOTAL JASA</span>
                      <span className="tabular-nums">Rp {vehicleFinancials.totalJasa.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SUBTOTAL PART</span>
                      <span className="tabular-nums">Rp {vehicleFinancials.totalPart.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-slate-950 pt-1 border-t border-slate-300">
                      <span>TOTAL TAGIHAN</span>
                      <span className="tabular-nums">Rp {vehicleFinancials.grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-700 font-bold">
                      <span>METODE BAYAR</span>
                      <span>QRIS DINAMIS / TUNAI</span>
                    </div>
                  </div>

                  {/* Guarantee & Anti-Cheating Clause on Receipt */}
                  <div className="pt-3 border-t border-dashed border-slate-400 text-center space-y-1 text-xs">
                    <p className="font-bold">GARANSI SERVIS 30 HARI / 1.000 KM</p>
                    <p className="text-slate-600">Part bekas wajib diperiksa di bagasi mobil Anda.</p>
                    <p className="text-slate-500 font-mono">Terima kasih atas kepercayaan Anda.</p>
                  </div>
                </div>

                {/* Right: Thermal Hardware Compatibility Info */}
                <div className="max-w-md space-y-4">
                  <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                      <Printer className="w-5 h-5" />
                      <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm">
                        Cetak Struk Langsung Tanpa Driver Rumit
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Langsung kompatibel dengan printer kasir Bluetooth 58mm murah (Rp 150rb-an) maupun printer POS thermal 80mm USB di meja kasir. 
                    </p>
                    <ul className="text-xs font-mono text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                      <li>✓ Pisah otomatis omzet jasa mekanik vs part gudang</li>
                      <li>✓ Cetak barcode pelacakan servis &amp; QRIS</li>
                      <li>✓ Format Rupiah non-fraksional rapi tanpa cakar ayam</li>
                    </ul>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 4: FIFO INVENTORY & GROSS PROFIT */}
            {activeConsoleTab === 'fifo' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">
                      Buku Besar Mutasi Stok Suku Cadang (FIFO) &amp; Margin Laba
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Setiap kali mekanik menambahkan part ke SPK, stok gudang otomatis terpotong dan margin laba terkunci.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                      MARGIN LABA SPK INI: +{vehicleFinancials.profitMargin}%
                    </span>
                  </div>
                </div>

                {/* Table of Parts */}
                <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">SKU Barang</th>
                        <th className="p-3">Nama Suku Cadang</th>
                        <th className="p-3 text-right">Modal (HPP)</th>
                        <th className="p-3 text-right">Harga Jual</th>
                        <th className="p-3 text-right">Laba Kotor</th>
                        <th className="p-3 text-center">Sisa Gudang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeVehicle.services.filter(s => s.type === 'part').map((part, idx) => {
                        const margin = part.price - (part.hpp || 0);
                        const pct = ((margin / part.price) * 100).toFixed(0);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                            <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">{part.sku}</td>
                            <td className="p-3 font-medium text-slate-900 dark:text-white">{part.name}</td>
                            <td className="p-3 text-right text-slate-500 tabular-nums">Rp {part.hpp.toLocaleString('id-ID')}</td>
                            <td className="p-3 text-right font-bold text-slate-900 dark:text-white tabular-nums">Rp {part.price.toLocaleString('id-ID')}</td>
                            <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                              +Rp {margin.toLocaleString('id-ID')} ({pct}%)
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                                {part.stock} Pcs
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono text-slate-500 uppercase">Omzet SPK Ini</span>
                    <p className="text-base font-black font-mono text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      Rp {vehicleFinancials.grandTotal.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-3 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-mono text-slate-500 uppercase">Modal Part (HPP)</span>
                    <p className="text-base font-black font-mono text-slate-500 mt-0.5 tabular-nums">
                      Rp {vehicleFinancials.totalHppPart.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-3 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                    <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 uppercase font-bold">Estimasi Laba Bersih</span>
                    <p className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                      Rp {vehicleFinancials.grossProfit.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 4. Integritas Platform: Jaminan 4 Pilar Anti-Curang (Mencerminkan Mockup Vibe) */}
      <section id="integritas" className="py-14 sm:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Integritas &amp; Jaminan Transparansi BengkelOS
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Empat fondasi digital yang menghentikan kecurigaan pelanggan soal part bekas fiktif, biaya membengkak mendadak, atau nota yang hilang.
            </p>
          </div>

          {/* 4 Crisp Cards (Identical visual structure to user mockup) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between hover:border-blue-500 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">
                    Pengembalian Suku Cadang Bekas Wajib
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Sistem mewajibkan foto serah-terima suku cadang lama ke bagasi mobil pelanggan sebelum invoice lunas dicetak. Pelanggan tidak pernah curiga part diganti bohong-bohongan.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                ✓ Foto Bagasi Wajib Kasir
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between hover:border-emerald-500 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">
                    Update Foto Proses Live ke WhatsApp
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Setiap mekanik cukup mengambil foto dari HP Android bengkel. Foto sebelum &amp; sesudah langsung tersinkron ke link status pelanggan tanpa install aplikasi.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ 6-Tahap Sinkron Instan
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between hover:border-amber-500 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">
                    Estimasi Biaya Terkunci di Awal
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Tidak ada biaya siluman atau overcharge tiba-tiba. Setiap penambahan pengerjaan memerlukan konfirmasi WhatsApp satu ketukan dari pemilik mobil.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
                ✓ Nol Biaya Tersembunyi
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between hover:border-purple-500 transition-colors">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug">
                    Mekanik Bersertifikat &amp; Rekam Medis
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Riwayat servis tersimpan abadi berdasarkan nomor plat dan sasis. Pelanggan menerima notifikasi pengingat servis otomatis di WhatsApp saat jatuh tempo.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                ✓ Otomatis Retensi Pelanggan
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Alur Kerja Operasional 6 Tahap (Horizontal Stepper seperti di Mockup) */}
      <section id="alur-kerja" className="py-14 sm:py-20 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Standar Operasional 6 Tahap (Staging Repair Order)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Setiap kendaraan mengikuti alur standar pabrikan: dari scan OBD-II di pintu masuk hingga serah terima kunci di kasir. Klik setiap tahapan untuk melihat rincian SOP.
            </p>
          </div>

          {/* Stepper Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { num: 1, title: 'Pendaftaran & Diagnosa', desc: 'Scan OBD-II & input keluhan awal pemilik mobil.' },
              { num: 2, title: 'Estimasi Disetujui', desc: 'Kirim rincian biaya ke WhatsApp pemilik untuk acc.' },
              { num: 3, title: 'Pengerjaan di Lift', desc: 'Mobil dinaikkan lift hidrolik, mekanik mulai kerja.' },
              { num: 4, title: 'Suku Cadang & Foto', desc: 'Foto part lama vs baru, stok gudang otomatis FIFO.' },
              { num: 5, title: 'Quality Control', desc: 'Verifikasi torsi baut, scan ulang DTC, & test drive.' },
              { num: 6, title: 'Kasir & Siap Ambil', desc: 'Cetak struk thermal 58mm, bayar QRIS, serah kunci.' }
            ].map((stg) => {
              const isActive = activeWorkflowStage === stg.num;
              return (
                <button
                  key={stg.num}
                  type="button"
                  onClick={() => {
                    playMechanicalClick(audioFeedback);
                    setActiveWorkflowStage(stg.num);
                  }}
                  className={`touch-target p-4 rounded border text-left transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-800 shadow-md ring-1 ring-blue-500'
                      : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className={`w-7 h-7 rounded-full font-mono text-xs font-black flex items-center justify-center mb-3 ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {stg.num}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-snug">
                      {stg.title}
                    </h4>
                  </div>
                  <p className={`text-xs mt-2 leading-relaxed ${
                    isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {stg.desc}
                  </p>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Interactive Profit Leakage & ROI Calculator (Kalkulator Kebocoran Bengkel) */}
      <section id="kalkulator-laba" className="py-14 sm:py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Kalkulator Kebocoran Stok &amp; Potensi Laba Bengkel
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Geser nilai operasional bengkel Anda di bawah untuk mengukur berapa juta Rupiah kebocoran suku cadang yang bisa diselamatkan setiap bulan.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="rounded border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 space-y-8 shadow-sm">
            
            {/* Sliders Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Slider 1: Cars per day */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-slate-700 dark:text-slate-300 uppercase">Unit Mobil Servis per Hari:</span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                    {calcCarsPerDay} Mobil / Hari
                  </span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={calcCarsPerDay}
                  onChange={(e) => setCalcCarsPerDay(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                  aria-label="Jumlah Mobil Servis per Hari"
                />
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>5 Mobil</span>
                  <span>20 Mobil (Rata-rata)</span>
                  <span>40 Mobil</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket Value */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-slate-700 dark:text-slate-300 uppercase">Rata-rata Nilai Servis per SPK:</span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                    Rp {calcAvgTicket.toLocaleString('id-ID')}
                  </span>
                </div>
                <input 
                  type="range"
                  min="250000"
                  max="2500000"
                  step="50000"
                  value={calcAvgTicket}
                  onChange={(e) => setCalcAvgTicket(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                  aria-label="Rata-rata Nilai Servis per SPK"
                />
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Rp 250rb (Ganti Oli)</span>
                  <span>Rp 1 Juta (Tune Up)</span>
                  <span>Rp 2.5 Juta (Overhaul)</span>
                </div>
              </div>

            </div>

            {/* Computed Results Grid */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono text-slate-500 uppercase">Kebocoran Stok Terselamatkan</span>
                <p className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                  Rp {calculatedMetrics.stockLeakagePrevented.toLocaleString('id-ID')}
                </p>
                <span className="text-xs text-slate-500 font-mono">/ bulan (8% audit stok)</span>
              </div>

              <div className="p-4 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono text-slate-500 uppercase">Jam Kerja Kasir Terhemat</span>
                <p className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
                  {calculatedMetrics.adminHoursSaved} Jam
                </p>
                <span className="text-xs text-slate-500 font-mono">/ bulan bebas nota manual</span>
              </div>

              <div className="p-4 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono text-slate-500 uppercase">Omzet Tambahan Repeat Order</span>
                <p className="text-lg sm:text-xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1 tabular-nums">
                  Rp {calculatedMetrics.repeatOrderTurnover.toLocaleString('id-ID')}
                </p>
                <span className="text-xs text-slate-500 font-mono">/ bulan via pengingat WA</span>
              </div>

              <div className="p-4 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 uppercase font-bold">Multiple Net ROI</span>
                <p className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                  {calculatedMetrics.roiMultiple}x Lipat!
                </p>
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">dari biaya langganan</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 7. Direktori Mitra Bengkel Terverifikasi (Tenant Showcase) */}
      <section id="mitra-bengkel" className="py-14 sm:py-20 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Mitra Bengkel Aktif Pengguna BengkelOS
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Setiap bengkel memiliki portal publik mandiri dengan galeri stall lift, jadwal operasional, dan pelacakan live pelanggan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoginClick}
              className="touch-target inline-flex items-center space-x-1.5 px-4 py-2 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-sm self-start md:self-auto"
            >
              <span>Daftarkan Bengkel Baru</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>

          {loadingTenants ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
              Belum ada data bengkel yang dimuat.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenants.map((t) => (
                <div 
                  key={t.id}
                  className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between hover:border-blue-500 transition-all shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded bg-[#0c2b5e] text-emerald-400 flex items-center justify-center shrink-0">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Terverifikasi
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white uppercase leading-snug">
                        {t.name}
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold mt-0.5">
                        /{t.slug}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{t.address || DEFAULT_WORKSHOP_ADDRESS}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{t.business_hours || DEFAULT_BUSINESS_HOURS}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-mono">{t.phone_wa || DEFAULT_WORKSHOP_PHONE}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => onNavigateTenant(t.slug)}
                      className="touch-target w-full py-2.5 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <span>Buka Landing Page Bengkel</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 8. Pilihan Paket Investasi Terjangkau (Pricing Plans) */}
      <section id="harga" className="py-14 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold uppercase tracking-wider border border-blue-300 dark:border-blue-800">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Pricing: To Be Announced (TBA)</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Pilihan Paket Investasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Biaya langganan resmi akan segera diumumkan. Skema flat transparan tanpa potongan komisi servis. Daftar sekarang untuk mengamankan kuota gelombang pilot bengkel mitra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Tier 1 */}
            <div className="p-6 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Starter Pit</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Bengkel mandiri 1-2 stall servis.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-slate-900 dark:text-white block">
                    To Be Announced
                  </span>
                  <span className="inline-block text-xs font-mono text-slate-500 dark:text-slate-400">
                    Segera Diumumkan · Pilot Bengkel Mandiri
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Hingga 2 Stall Pengerjaan</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Pelacakan WhatsApp Tanpa App</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Cetak Struk Kasir Thermal 58mm</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Gudang 200 Item Suku Cadang</li>
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="touch-target w-full py-2.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Daftar Antrean Starter
                </button>
              </div>
            </div>

            {/* Tier 2: Highlighted */}
            <div className="p-6 rounded border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-blue-600 text-white text-xs font-mono font-black uppercase tracking-wider">
                Paling Direkomendasikan
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Workshop Pro</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Pilihan utama bengkel modern dengan mekanik tetap &amp; lift.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-slate-900 dark:text-white block">
                    To Be Announced
                  </span>
                  <span className="inline-block text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Segera Diumumkan · Prioritas Pilot
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited Stall Lift &amp; Mekanik</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Upload Foto Sebelum vs Sesudah</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Laporan Laba Kotor &amp; Kas Harian</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Pengingat Servis Otomatis WhatsApp</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Bimbingan Input Data Buku Manual</li>
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="touch-target w-full py-2.5 rounded bg-[#00a86b] hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                >
                  Daftar Akses Pilot Pro
                </button>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="p-6 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">Multi-Cabang</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Pemilik dengan beberapa cabang bengkel sekaligus.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl sm:text-3xl font-black font-sans uppercase tracking-tight text-slate-900 dark:text-white block">
                    To Be Announced
                  </span>
                  <span className="inline-block text-xs font-mono text-slate-500 dark:text-slate-400">
                    Konsultasi Khusus · Multi-Outlet
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Konsolidasi Finansial Multi-Cabang</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Transfer Suku Cadang Antar Cabang</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Dedicated WhatsApp Gateway</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Pelatihan Staf &amp; Mekanik di Lokasi</li>
                </ul>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="touch-target w-full py-2.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Konsultasi Cabang
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. Footer Precision Command Center */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-[#0c2b5e] flex items-center justify-center text-emerald-400 font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-black text-white uppercase tracking-tight block">
                  BengkelOS Platform Engine
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Sistem Manajemen Bengkel Mobil Terintegrasi
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-semibold">
              <button 
                type="button" 
                onClick={() => onNavigateTenant('bengkel-gps-motor')}
                className="hover:text-emerald-400 transition-colors"
              >
                Website Bengkel Mitra
              </button>
              <button 
                type="button" 
                onClick={handleLoginClick}
                className="hover:text-emerald-400 transition-colors"
              >
                Portal Staf
              </button>
              {onOpenSuperadmin && (
                <button 
                  type="button" 
                  onClick={onOpenSuperadmin}
                  className="hover:text-emerald-400 transition-colors font-mono"
                >
                  Superadmin Portal
                </button>
              )}
              {onNavigateDocs && (
                <button 
                  type="button" 
                  onClick={() => onNavigateDocs()}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Panduan Sistem
                </button>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 font-mono text-xs">
            <span>© 2026 BengkelOS Platform · Multi-Tenant Workshop Software Engine</span>
            <span>Kediri · Jawa Timur · Indonesia</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
