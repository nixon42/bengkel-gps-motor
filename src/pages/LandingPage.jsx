import React, { useState, useEffect } from 'react';
import { 
  Wrench, Sun, Moon, LogIn, Search, ShieldCheck, BookOpen, 
  Menu, X, Phone, ArrowRight, ExternalLink, Calendar
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import MockupLandingView from '../components/Landing/MockupLandingView';
import TestimonialsSection from '../components/Landing/TestimonialsSection';
import FaqSection from '../components/Landing/FaqSection';
import LocationSection from '../components/Landing/LocationSection';
import Footer from '../components/Landing/Footer';

export default function LandingPage({ 
  tenantSlug = 'bengkel-gps-motor',
  onNavigateTracking, 
  onOpenAdmin, 
  onOpenSuperadmin, 
  onNavigateDocs,
  onNavigatePlatform
}) {
  const { theme, toggleTheme } = useTheme();
  const { user, tenant, mockLogin, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePlateInput, setMobilePlateInput] = useState('');
  const [tenantInfo, setTenantInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const slugToFetch = tenantSlug || tenant?.slug || 'bengkel-gps-motor';
    fetch(`/api/public/${slugToFetch}/info`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (isMounted && data?.tenant) {
          setTenantInfo(data.tenant);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [tenantSlug, tenant]);

  const activeTenant = tenantInfo || (tenant?.slug === tenantSlug ? tenant : null) || {
    name: 'Bengkel GPS Motor',
    address: 'Sambiresik, Kec. Gampengrejo, Kab. Kediri',
    phone_wa: '085603307330',
    business_hours: 'Senin - Sabtu: 08:00 - 17:00 WIB'
  };

  const handlePlateSearch = (plate) => {
    setMobileMenuOpen(false);
    onNavigateTracking(plate);
  };

  const handleMobilePlateSubmit = (e) => {
    e.preventDefault();
    if (mobilePlateInput.trim()) {
      handlePlateSearch(mobilePlateInput.trim());
    }
  };

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    onOpenAdmin();
  };

  const navLinks = [
    { label: 'Beranda', href: '#' },
    { label: 'Lacak Status', href: '#pantau-ro' },
    { label: 'Paket Servis', href: '#estimasi-biaya' },
    { label: 'Fasilitas', href: '#fasilitas' },
    { label: 'Integritas', href: '#integritas' },
    { label: 'Lokasi', href: '#lokasi' }
  ];

  const cleanWa = (activeTenant.phone_wa || activeTenant.phoneWa || '085603307330').replace(/\D/g, '').replace(/^0/, '62');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Brand (Left) */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0 select-none mr-1 sm:mr-3"
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-[#0c2b5e] border border-blue-900/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight uppercase font-sans">
                {activeTenant.name || 'Bengkel GPS Motor'}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-wider uppercase truncate max-w-[180px] sm:max-w-[220px]">
                {activeTenant.address ? activeTenant.address.split(',')[0] : 'Kediri · Sambiresik'}
              </span>
            </div>
          </div>

          {/* Desktop Nav Items (Center, strictly whitespace-nowrap, hidden below xl) */}
          <nav className="hidden xl:flex items-center space-x-4 2xl:space-x-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {navLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="whitespace-nowrap hover:text-[#00a86b] dark:hover:text-emerald-400 transition-colors py-1 outline-none focus-visible:text-emerald-500"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti mode gelap atau terang"
              className="touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Operator / Staff Portal Link (Desktop only) */}
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={loading}
              className="touch-target hidden md:inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-[#0c2b5e] dark:text-emerald-400" />
              <span>{user ? 'Buka Workspace' : 'Portal Staf'}</span>
            </button>

            {/* Primary Action Button: Pesan Sekarang (WhatsApp Booking) */}
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo ${activeTenant.name}, saya ingin pesan jadwal servis mobil.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#00a86b] hover:bg-[#00925d] active:bg-emerald-800 text-white text-xs sm:text-sm font-bold tracking-wide uppercase transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Pesan Sekarang</span>
              <span className="sm:hidden font-bold">Pesan</span>
            </a>

            {/* Mobile Hamburger Toggle (Visible on < xl) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className="touch-target xl:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
              
              {/* Quick Plate Search */}
              <form onSubmit={handleMobilePlateSubmit} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={mobilePlateInput}
                    onChange={(e) => setMobilePlateInput(e.target.value.toUpperCase())}
                    placeholder="Lacak plat: AG 1822 AB"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase placeholder:font-sans placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="touch-target px-3.5 py-2.5 rounded-lg bg-[#0c2b5e] text-white text-xs font-bold tracking-wider uppercase shrink-0"
                >
                  Lacak
                </button>
              </form>

              {/* Navigation Links Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                {navLinks.map((link, idx) => (
                  link.onClick ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={link.onClick}
                      className="touch-target text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      key={idx}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="touch-target block px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {link.label}
                    </a>
                  )
                ))}
              </div>

              {/* Mobile Actions: Staff Portal */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="touch-target flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 py-1"
                >
                  <LogIn className="w-4 h-4 text-[#0c2b5e] dark:text-emerald-400" />
                  <span>{user ? 'Buka Workspace Admin' : 'Login Staf / Operator'}</span>
                </button>
                <span className="text-xs font-mono text-slate-400">
                  v2.0 · Sambiresik
                </span>
              </div>

            </div>
          </div>
        )}

      </header>

      {/* Main Landing Sections: Mockup 2 Experience (No redundant stacking) */}
      <main className="flex-1 w-full">
        <MockupLandingView tenant={activeTenant} onSearchPlate={handlePlateSearch} />
        <TestimonialsSection />
        <FaqSection />
        <LocationSection tenant={activeTenant} />
      </main>

      {/* Footer */}
      <Footer 
        onNavigateTracking={() => onNavigateTracking()} 
        onOpenLogin={handleLoginClick} 
        onOpenSuperadmin={onOpenSuperadmin}
        onNavigateDocs={onNavigateDocs}
      />
    </div>
  );
}
