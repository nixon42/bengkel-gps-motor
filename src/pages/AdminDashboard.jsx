import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Wrench, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Database, 
  Building2, 
  UserCheck, 
  Smartphone, 
  LogIn, 
  LogOut, 
  Settings, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Clock, 
  Save, 
  X, 
  Layers, 
  Package,
  FileText, 
  ExternalLink, 
  Search, 
  ArrowDownUp, 
  ClipboardCheck, 
  Wallet, 
  Users, 
  Car,
  BookOpen,
  Camera,
  Upload,
  Sparkles,
  Image
} from 'lucide-react';

import DashboardPage from './DashboardPage';
import DocsPage from './DocsPage';
import OnboardingModal from '../components/Admin/OnboardingModal';

const InventoryPage = lazy(() => import('./InventoryPage'));
const StockMutationsPage = lazy(() => import('./StockMutationsPage'));
const StockOpnamePage = lazy(() => import('./StockOpnamePage'));
const FinancePage = lazy(() => import('./FinancePage'));
const RepairOrdersPage = lazy(() => import('./RepairOrdersPage'));
const CustomersPage = lazy(() => import('./CustomersPage'));

function TabFallback() {
  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-2 border-[#0c2b5e] border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Memuat modul bengkel...</p>
    </div>
  );
}

export default function AdminDashboard({ onNavigateLanding, onNavigateTracking, onNavigateSuperadmin, onNavigateDocs }) {
  const { user, tenant, loading, mockLogin, logout, updateSettings } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState('general');
  const [uploadingPhotoType, setUploadingPhotoType] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    address: '',
    phoneWa: '',
    businessHours: '',
    heroImageUrl: '',
    facilityImage1: '',
    facilityImage2: '',
    monthlyRevenueTarget: 15000000
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    window.__setActiveTab = setActiveTab;
    return () => { delete window.__setActiveTab; };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      mockLogin().catch(() => {});
    }
  }, [loading, user]);

  // Close settings modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen]);

  useEffect(() => {
    if (tenant) {
      setFormData(prev => ({
        ...prev,
        name: tenant.name || '',
        tagline: tenant.tagline || '',
        address: tenant.address || '',
        phoneWa: tenant.phone_wa || '',
        businessHours: tenant.business_hours || '',
        heroImageUrl: tenant.hero_image_url || '/images/mockup/facility_inspection_clean.jpg',
        facilityImage1: tenant.facility_image_1 || '/images/mockup/facility_lift_bay_clean.jpg',
        facilityImage2: tenant.facility_image_2 || '/images/mockup/facility_inspection_clean.jpg'
      }));

      // Check first-time login onboarding
      if (tenant.profile_completed === false || tenant.profile_completed === 0 || tenant.profileCompleted === false) {
        setOnboardingOpen(true);
      }

      // Fetch latest tenant settings for financial target
      fetch('/api/tenant/settings', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.settings?.monthlyRevenueTarget || data?.settings?.monthly_revenue_target) {
            const target = data.settings.monthlyRevenueTarget || data.settings.monthly_revenue_target;
            setFormData(prev => ({
              ...prev,
              monthlyRevenueTarget: target
            }));
          }
        })
        .catch(() => {});
    }
  }, [tenant]);

  const handlePhotoUpload = async (type, file) => {
    if (!file) return;
    try {
      setUploadingPhotoType(type);
      setSaveStatus('Mengunggah foto...');
      const data = new FormData();
      data.append('photo', file);
      data.append('type', type);

      const res = await fetch('/api/tenant/photo', {
        method: 'POST',
        credentials: 'include',
        body: data
      });

      if (!res.ok) throw new Error('Gagal mengunggah foto.');
      const result = await res.json();
      if (result.photoUrl) {
        if (type === 'hero') setFormData(prev => ({ ...prev, heroImageUrl: result.photoUrl }));
        else if (type === 'facility1') setFormData(prev => ({ ...prev, facilityImage1: result.photoUrl }));
        else if (type === 'facility2') setFormData(prev => ({ ...prev, facilityImage2: result.photoUrl }));
        setSaveStatus('Foto berhasil diunggah!');
        setTimeout(() => setSaveStatus(''), 1500);
      }
    } catch (err) {
      setSaveStatus('Gagal upload: ' + err.message);
    } finally {
      setUploadingPhotoType(null);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setSaveStatus('Menyimpan...');
      await updateSettings(formData);
      setSaveStatus('Berhasil disimpan!');
      setTimeout(() => {
        setSaveStatus('');
        setSettingsOpen(false);
      }, 1200);
    } catch (err) {
      setSaveStatus('Gagal: ' + err.message);
    }
  };

  const handleCompleteOnboarding = async (onboardingPayload) => {
    await updateSettings(onboardingPayload);
    setOnboardingOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-28 md:pb-8">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Left Brand & Workshop Identifier */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1 sm:flex-initial">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#0c2b5e] to-blue-900 rounded-xl flex items-center justify-center text-emerald-400 font-bold shrink-0 border border-blue-900/60 shadow-xs">
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight truncate max-w-[170px] sm:max-w-none">
                  {tenant?.name || 'Bengkel Mobil GPS Motor Kediri'}
                </h1>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="hidden sm:inline-block font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                  {tenant?.slug || 'bengkel-gps-motor'}
                </span>
                <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sistem Aktif</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Superadmin Portal Link if user is superadmin */}
            {user && (user.isSuperAdmin || user.role === 'superadmin') && (
              <button
                onClick={() => onNavigateSuperadmin ? onNavigateSuperadmin() : (window.location.pathname = '/superadmin')}
                className="touch-target flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold text-xs transition-colors"
                title="Buka Portal Pengawasan Superadmin"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="hidden md:inline">Superadmin</span>
              </button>
            )}

            {/* View Landing Link (Desktop Only) */}
            <button
              onClick={onNavigateLanding}
              className="touch-target hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              title="Lihat Landing Page Publik"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Lihat Website</span>
            </button>

            {/* View Tracking Link (Desktop Only) */}
            <button
              onClick={() => onNavigateTracking()}
              className="touch-target hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              title="Cek Status Pelacakan Pelanggan"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Cek Status</span>
            </button>

            {/* Buku Panduan Button */}
            <button
              onClick={() => onNavigateDocs ? onNavigateDocs() : setActiveTab('docs')}
              aria-label="Buka Buku Panduan Aplikasi"
              title="Buku Panduan Operasional & Dokumentasi"
              className="touch-target hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Panduan</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Ganti tema gelap atau terang"
              title="Ganti tema gelap/terang"
              className="touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Session & Profile Controls */}
            {user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  onClick={() => setSettingsOpen(true)}
                  aria-label="Pengaturan Bengkel"
                  title="Pengaturan Profil Bengkel"
                  className="touch-target w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                </button>

                {/* Modern User Pill */}
                <div className="hidden xl:flex items-center space-x-2.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-md bg-[#0c2b5e] text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[130px]">
                      {user.name}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[130px]">
                      {user.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  aria-label="Keluar akun"
                  title="Keluar dari akun"
                  className="touch-target p-2 rounded-lg text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => mockLogin()}
                disabled={loading}
                className="touch-target flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#00a86b] hover:bg-emerald-600 text-white text-xs font-bold tracking-wide uppercase transition-colors shadow-xs shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Masuk...' : 'Demo Login'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar (Desktop Segmented Rail) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-16 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1.5 py-2.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`touch-target px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'overview' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Ringkasan Bengkel</span>
            </button>

            <button
              onClick={() => setActiveTab('repair-orders')}
              className={`touch-target px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                activeTab === 'repair-orders'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Wrench className={`w-4 h-4 ${activeTab === 'repair-orders' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Servis Mobil (RO)</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`touch-target px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                ['inventory', 'mutations', 'opname'].includes(activeTab)
                  ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Layers className={`w-4 h-4 ${['inventory', 'mutations', 'opname'].includes(activeTab) ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Inventaris &amp; Sparepart</span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`touch-target px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                activeTab === 'finance'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Wallet className={`w-4 h-4 ${activeTab === 'finance' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Buku Kas &amp; Keuangan</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`touch-target px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                activeTab === 'customers'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'customers' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Pelanggan</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`touch-target px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                activeTab === 'docs'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'docs' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Panduan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navigation for Inventory Domain (Desktop & Mobile) */}
      {['inventory', 'mutations', 'opname'].includes(activeTab) && (
        <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-2 sticky top-16 md:top-[112px] z-30 transition-colors shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline shrink-0">
              Modul Inventaris:
            </span>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`touch-target px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'inventory'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Katalog Sparepart</span>
            </button>
            <button
              onClick={() => setActiveTab('mutations')}
              className={`touch-target px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'mutations'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>Riwayat Mutasi</span>
            </button>
            <button
              onClick={() => setActiveTab('opname')}
              className={`touch-target px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'opname'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Stok Opname</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <Suspense fallback={<TabFallback />}>
          {activeTab === 'repair-orders' && <RepairOrdersPage />}
          {activeTab === 'customers' && <CustomersPage />}
          {activeTab === 'inventory' && <InventoryPage />}
          {activeTab === 'mutations' && <StockMutationsPage />}
          {activeTab === 'opname' && <StockOpnamePage />}
          {activeTab === 'finance' && <FinancePage />}
          {activeTab === 'docs' && <DocsPage isInline onNavigateTab={setActiveTab} />}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <DashboardPage 
                onNavigateTab={setActiveTab}
                onOpenSettings={() => setSettingsOpen(true)}
                onNavigateLanding={onNavigateLanding}
                onNavigateTracking={onNavigateTracking}
                onNavigateDocs={onNavigateDocs}
              />
            </div>
          )}
        </Suspense>
      </main>

      {/* First-Time Login Onboarding Wizard Modal */}
      {onboardingOpen && (
        <OnboardingModal 
          tenant={tenant} 
          onComplete={handleCompleteOnboarding} 
          onClose={() => setOnboardingOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
          onClick={() => setSettingsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Pinned at top, shrink-0) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                    Pengaturan Workshop &amp; Profil
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Konfigurasi kontak bengkel, jam buka, dan foto galeri
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-10 h-10 touch-target shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs: Segmented Pill Rail (Pinned below header, shrink-0) */}
            <div className="px-4 sm:px-5 pt-3 pb-2 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60">
              <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('general')}
                  className={`flex-1 touch-target py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    settingsSubTab === 'general'
                      ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Profil &amp; Kontak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSubTab('photos')}
                  className={`flex-1 touch-target py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    settingsSubTab === 'photos'
                      ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Foto &amp; Landing Page</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
              {settingsSubTab === 'general' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nama Bengkel
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Alamat Bengkel
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        WhatsApp Bengkel
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.phoneWa}
                        onChange={(e) => setFormData({ ...formData, phoneWa: e.target.value })}
                        className="touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Jam Operasional
                      </label>
                      <input
                        type="text"
                        value={formData.businessHours}
                        onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                        className="touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Tab Foto & Landing Page */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tagline / Headline Promosi Landing Page
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="BENGKEL TERPERCAYA KEDIRI: TRANSPARAN, JUJUR, BERGARANSI."
                      className="touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-mono text-xs font-medium">Terapkan Preset Cepat:</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        heroImageUrl: '/images/mockup/facility_inspection_clean.jpg',
                        facilityImage1: '/images/mockup/facility_lift_bay_clean.jpg',
                        facilityImage2: '/images/mockup/facility_inspection_clean.jpg'
                      }))}
                      className="touch-target px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      ✨ Standar Bersih Modern
                    </button>
                  </div>

                  {/* 3 Photos Thumbnails & Uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    
                    {/* Photo 1: Hero Banner */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 space-y-2 bg-slate-50/60 dark:bg-slate-800/40">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">
                        1. Hero Banner
                      </span>
                      <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 relative">
                        <img 
                          src={formData.heroImageUrl || '/images/mockup/facility_inspection_clean.jpg'} 
                          alt="Hero Preview" 
                          className="w-full h-full object-cover" 
                        />
                        {uploadingPhotoType === 'hero' && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-mono font-bold">
                            Mengunggah...
                          </div>
                        )}
                      </div>
                      <label className="cursor-pointer flex items-center justify-center space-x-1.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Ganti File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handlePhotoUpload('hero', e.target.files[0])}
                        />
                      </label>
                      <input
                        type="text"
                        value={formData.heroImageUrl}
                        onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                        placeholder="URL Foto..."
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800"
                      />
                    </div>

                    {/* Photo 2: Pit Lift Stall 1 */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 space-y-2 bg-slate-50/60 dark:bg-slate-800/40">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">
                        2. Pit Lift Stall
                      </span>
                      <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 relative">
                        <img 
                          src={formData.facilityImage1 || '/images/mockup/facility_lift_bay_clean.jpg'} 
                          alt="Stall Preview" 
                          className="w-full h-full object-cover" 
                        />
                        {uploadingPhotoType === 'facility1' && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-mono font-bold">
                            Mengunggah...
                          </div>
                        )}
                      </div>
                      <label className="cursor-pointer flex items-center justify-center space-x-1.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Ganti File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handlePhotoUpload('facility1', e.target.files[0])}
                        />
                      </label>
                      <input
                        type="text"
                        value={formData.facilityImage1}
                        onChange={(e) => setFormData({ ...formData, facilityImage1: e.target.value })}
                        placeholder="URL Foto..."
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800"
                      />
                    </div>

                    {/* Photo 3: Scanner Stall 2 */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 space-y-2 bg-slate-50/60 dark:bg-slate-800/40">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">
                        3. Alat Scanner
                      </span>
                      <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 relative">
                        <img 
                          src={formData.facilityImage2 || '/images/mockup/facility_inspection_clean.jpg'} 
                          alt="Scanner Preview" 
                          className="w-full h-full object-cover" 
                        />
                        {uploadingPhotoType === 'facility2' && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-mono font-bold">
                            Mengunggah...
                          </div>
                        )}
                      </div>
                      <label className="cursor-pointer flex items-center justify-center space-x-1.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Ganti File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handlePhotoUpload('facility2', e.target.files[0])}
                        />
                      </label>
                      <input
                        type="text"
                        value={formData.facilityImage2}
                        onChange={(e) => setFormData({ ...formData, facilityImage2: e.target.value })}
                        placeholder="URL Foto..."
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800"
                      />
                    </div>

                  </div>
                </div>
              )}

              </div>

              {saveStatus && (
                <div className={`mx-4 sm:mx-5 mb-2 p-3 rounded-xl text-xs font-bold shrink-0 ${
                  saveStatus.startsWith('Gagal') ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-800' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {saveStatus}
                </div>
              )}

              {/* Fixed Footer pinned at bottom, shrink-0 */}
              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="touch-target px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="touch-target px-5 py-2.5 rounded-xl bg-[#00a86b] hover:bg-emerald-600 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 z-40 flex items-center justify-around h-16 px-1 shadow-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-xs transition-all ${
            activeTab === 'overview'
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-xs mt-0.5">Ringkasan</span>
        </button>

        <button
          onClick={() => setActiveTab('repair-orders')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-xs transition-all ${
            activeTab === 'repair-orders'
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${activeTab === 'repair-orders' ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
            <Wrench className="w-4 h-4" />
          </div>
          <span className="text-xs mt-0.5">Servis</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-xs transition-all ${
            ['inventory', 'mutations', 'opname'].includes(activeTab)
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${['inventory', 'mutations', 'opname'].includes(activeTab) ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs mt-0.5">Inventaris</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-xs transition-all ${
            activeTab === 'finance'
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${activeTab === 'finance' ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-xs mt-0.5">Keuangan</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-xs transition-all ${
            activeTab === 'customers'
              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${activeTab === 'customers' ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''}`}>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs mt-0.5">Pelanggan</span>
        </button>
      </nav>
    </div>
  );
}
