import React from 'react';
import { Wrench, Sun, Moon, LogIn, Search, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/Landing/HeroSection';
import ServicesSection from '../components/Landing/ServicesSection';
import GallerySection from '../components/Landing/GallerySection';
import TestimonialsSection from '../components/Landing/TestimonialsSection';
import FaqSection from '../components/Landing/FaqSection';
import LocationSection from '../components/Landing/LocationSection';
import Footer from '../components/Landing/Footer';

export default function LandingPage({ onNavigateTracking, onOpenAdmin }) {
  const { theme, toggleTheme } = useTheme();
  const { user, mockLogin, loading } = useAuth();

  const handlePlateSearch = (plate) => {
    onNavigateTracking(plate);
  };

  const handleLoginClick = () => {
    if (user) {
      onOpenAdmin();
    } else {
      mockLogin().then(() => onOpenAdmin());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight block">
                Bengkel GPS Motor
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Kediri • Sambiresik
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            <a href="#layanan" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Layanan Kami
            </a>
            <button
              onClick={() => onNavigateTracking()}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center space-x-1"
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>Cek Status Servis</span>
            </button>
            <a href="#fasilitas" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Fasilitas
            </a>
            <a href="#testimoni" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Ulasan
            </a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              FAQ
            </a>
            <a href="#lokasi" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Lokasi & Kontak
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti mode gelap atau terang"
              className="touch-target w-11 h-11 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Quick Cek Status Button on Mobile */}
            <button
              type="button"
              onClick={() => onNavigateTracking()}
              className="touch-target md:hidden flex items-center space-x-1 px-3 py-2 rounded bg-blue-600 text-white font-bold text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cek Status</span>
            </button>

            {/* Operator Portal Link (Desktop) */}
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={loading}
              className="touch-target hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{user ? 'Buka Workspace' : 'Login Bengkel'}</span>
            </button>

            {/* Operator Portal Link (Mobile Quick Icon) */}
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={loading}
              aria-label={user ? 'Buka Workspace' : 'Login Bengkel'}
              title={user ? 'Buka Workspace' : 'Login Bengkel'}
              className="touch-target sm:hidden w-11 h-11 flex items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors"
            >
              <LogIn className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Landing Sections */}
      <main className="flex-1 w-full">
        <HeroSection onSearchPlate={handlePlateSearch} />
        <ServicesSection />
        <GallerySection />
        <TestimonialsSection />
        <FaqSection />
        <LocationSection />
      </main>

      {/* Footer */}
      <Footer 
        onNavigateTracking={() => onNavigateTracking()} 
        onOpenLogin={handleLoginClick} 
      />
    </div>
  );
}
