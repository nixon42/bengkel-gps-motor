import React, { useState, useEffect } from 'react';
import { 
  Wrench, LogIn, Search, Menu, X, Phone 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resolveAssetUrl } from '../utils/assetUrl';
import CanvaBengkelLandingView from '../components/Landing/CanvaBengkelLandingView';
import { WorkshopLogoIcon } from '../components/Landing/BengkelOSIcons';
import { 
  DEFAULT_WORKSHOP_NAME, 
  DEFAULT_WORKSHOP_TAGLINE, 
  DEFAULT_WORKSHOP_ADDRESS, 
  DEFAULT_WORKSHOP_PHONE, 
  DEFAULT_BUSINESS_HOURS, 
  formatWhatsAppNumber 
} from '../utils/config';

export default function LandingPage({ 
  tenantSlug = 'bengkel-gps-motor',
  onNavigateTracking, 
  onOpenAdmin, 
  onOpenSuperadmin, 
  onNavigateDocs,
  onNavigatePlatform
}) {
  const { user, tenant, loading } = useAuth();
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
    name: DEFAULT_WORKSHOP_NAME,
    tagline: DEFAULT_WORKSHOP_TAGLINE,
    address: DEFAULT_WORKSHOP_ADDRESS,
    phone_wa: DEFAULT_WORKSHOP_PHONE,
    business_hours: DEFAULT_BUSINESS_HOURS
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
    { label: 'Beranda', href: '#hero' },
    { label: 'Fasilitas & Integritas', href: '#fasilitas' },
    { label: 'Paket Servis', href: '#layanan' },
    { label: 'Lacak Status', href: '#lacak-status' },
    { label: 'Lokasi Workshop', href: '#lokasi' },
    ...(onNavigatePlatform ? [{ 
      label: 'Platform SaaS', 
      onClick: () => {
        setMobileMenuOpen(false);
        onNavigatePlatform();
      } 
    }] : [])
  ];

  const cleanWa = formatWhatsAppNumber(activeTenant.phone_wa || activeTenant.phoneWa || DEFAULT_WORKSHOP_PHONE);

  return (
    <div className="min-h-screen flex flex-col bg-[#070e1c] text-white font-sans selection:bg-[#20a62f] selection:text-white">
      
      {/* Top Header Navbar (Matching Canva Dark Aesthetic) */}
      <header className="sticky top-0 z-50 bg-[#070e1c] border-b border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Brand (Left) */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer shrink-0 select-none mr-1 sm:mr-3"
            onClick={() => {
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#0d1f30] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm p-1.5">
              <WorkshopLogoIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-black tracking-tight text-white leading-tight uppercase font-sans truncate max-w-[140px] xs:max-w-[200px] sm:max-w-[260px] md:max-w-none">
                {activeTenant.name || 'Bengkel Mobil Mitra'}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-400 font-mono tracking-wider uppercase truncate max-w-[140px] xs:max-w-[200px] sm:max-w-[240px]">
                {activeTenant.address ? activeTenant.address.split(',')[0] : 'Mitra BengkelOS'}
              </span>
            </div>
          </div>

          {/* Desktop Nav Items (Center, strictly whitespace-nowrap, hidden below xl) */}
          <nav className="hidden xl:flex items-center space-x-4 2xl:space-x-6 text-sm font-semibold text-slate-300">
            {navLinks.map((link, idx) => (
              link.onClick ? (
                <button
                  key={idx}
                  type="button"
                  onClick={link.onClick}
                  className="whitespace-nowrap hover:text-[#20a62f] transition-colors py-1 outline-none font-sans cursor-pointer"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={idx}
                  href={link.href}
                  className="whitespace-nowrap hover:text-[#20a62f] transition-colors py-1 outline-none font-sans"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            
            {/* Operator / Staff Portal Link (Desktop only) */}
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={loading}
              className="touch-target hidden md:inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-[#0d1829] hover:bg-[#122238] hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title={user ? 'Buka Workspace' : 'Masuk / Login'}
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user ? 'Buka Workspace' : 'Masuk'}</span>
            </button>

            {/* Primary Action Button: Pesan Sekarang (WhatsApp Booking) */}
            <a
              href={cleanWa ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo ${activeTenant.name}, saya ingin pesan jadwal servis mobil.`)}` : '#lokasi'}
              target={cleanWa ? '_blank' : '_self'}
              rel={cleanWa ? 'noopener noreferrer' : undefined}
              className="touch-target inline-flex items-center justify-center w-9 h-9 sm:w-auto px-0 sm:px-4 py-0 sm:py-2.5 rounded-lg bg-[#20a62f] hover:bg-[#1b8c27] active:bg-emerald-800 text-white text-xs sm:text-sm font-bold tracking-wide uppercase transition-colors shadow-sm shrink-0"
              title="Pesan via WhatsApp"
            >
              <Phone className="w-4 h-4 sm:mr-1.5 shrink-0" />
              <span className="hidden sm:inline">Pesan Sekarang</span>
            </a>

            {/* Mobile Hamburger Toggle (Visible on < xl) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className="touch-target xl:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-slate-700 bg-[#0d1829] text-slate-200 hover:border-emerald-500 transition-colors shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile / Tablet Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-800 bg-[#091222] shadow-xl transition-all">
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-[#070e1a] text-xs font-mono font-bold text-white uppercase placeholder:font-sans placeholder:normal-case placeholder:font-normal focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="touch-target px-3.5 py-2.5 rounded-lg bg-[#20a62f] hover:bg-[#1b8c27] text-white text-xs font-bold tracking-wider uppercase shrink-0"
                >
                  Lacak
                </button>
              </form>

              {/* Navigation Links Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                {navLinks.map((link, idx) => (
                  link.onClick ? (
                    <button
                      key={idx}
                      type="button"
                      onClick={link.onClick}
                      className="touch-target text-left px-3 py-2.5 rounded-lg hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      key={idx}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="touch-target block px-3 py-2.5 rounded-lg hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors"
                    >
                      {link.label}
                    </a>
                  )
                ))}
              </div>

              {/* Mobile Actions: Staff Portal */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="touch-target flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-emerald-400 py-1 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>{user ? 'Buka Workspace Admin' : 'Masuk / Login'}</span>
                </button>
                <span className="text-xs font-mono text-slate-400">
                  v2.0 · Cloud
                </span>
              </div>

            </div>
          </div>
        )}

      </header>

      {/* Main Landing Sections: Canva Page 2 Workshop Specification */}
      <main className="flex-1 w-full">
        <CanvaBengkelLandingView 
          tenant={activeTenant} 
          onSearchPlate={handlePlateSearch} 
          onOpenLogin={handleLoginClick}
          onNavigateDocs={onNavigateDocs}
          onOpenSuperadmin={onOpenSuperadmin}
          onNavigatePlatform={onNavigatePlatform}
        />
      </main>
    </div>
  );
}
