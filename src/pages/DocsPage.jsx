import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink, 
  Building2, 
  Wrench, 
  Wallet, 
  Users, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  Sun, 
  Moon, 
  Home, 
  LayoutDashboard,
  Layers,
  Sparkles,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { 
  DOCS_STATIONS,
  DOCS_ROLES, 
  DOCS_MODULES, 
  DOCS_FAQS, 
  DOCS_METADATA,
  searchDocs 
} from '../data/docsContent';
import AnnotatedCard from '../components/Docs/AnnotatedCard';
import RoWorkflowDiagram from '../components/Docs/RoWorkflowDiagram';
import StockFlowDiagram from '../components/Docs/StockFlowDiagram';
import CashflowDiagram from '../components/Docs/CashflowDiagram';
import CalloutBanner from '../components/Docs/CalloutBanner';
import FaqAccordion from '../components/Docs/FaqAccordion';

// Quick filter presets for high-frequency garage triage
const QUICK_FILTER_PRESETS = [
  { label: 'Semua SOP', role: 'all', query: '' },
  { label: '🔥 6-Tahap RO', role: 'mekanik', query: '6-tahap' },
  { label: '📸 Foto Kamera', role: 'mekanik', query: 'foto' },
  { label: '🖨️ Struk 58mm', role: 'kasir', query: 'thermal' },
  { label: '📦 Stok Opname', role: 'kasir', query: 'opname' },
  { label: '💰 Laba Rugi', role: 'owner', query: 'laba rugi' },
  { label: '🔍 Cek Status', role: 'crm', query: 'tracking' },
  { label: '⚠️ FAQ Darurat', role: 'faq', query: '' }
];

export default function DocsPage({ 
  initialSection = '', 
  isInline = false,
  onNavigateHome,
  onNavigateAdmin,
  onNavigateTab
}) {
  // Theme handling for standalone mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('gps_theme') === 'dark';
    }
    return false;
  });

  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('gps_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('gps_theme', 'light');
      }
      return next;
    });
  };

  // State management
  const [selectedStation, setSelectedStation] = useState('all'); // 'all', 'owner', 'mekanik', 'kasir', 'crm', 'faq'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModuleId, setActiveModuleId] = useState(() => {
    if (initialSection) {
      const found = DOCS_MODULES.find(m => m.id === initialSection || m.slug === initialSection);
      if (found) return found.id;
    }
    return DOCS_MODULES[0]?.id || 'owner-settings';
  });
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Keyboard shortcut listener (/ or Ctrl+K to search, Esc to close/clear)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (mobileDrawerOpen) {
          setMobileDrawerOpen(false);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileDrawerOpen, searchQuery]);

  // Sync hash from URL if updated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        if (hash === 'faq' || hash === 'troubleshooting') {
          setSelectedStation('faq');
        } else {
          const match = DOCS_MODULES.find(m => m.id === hash || m.slug === hash);
          if (match) {
            setActiveModuleId(match.id);
            setSelectedStation(match.role);
          }
        }
      }
    }
  }, []);

  // Filter modules and FAQs based on search and selected station
  const searchResults = useMemo(() => {
    return searchDocs(searchQuery, selectedStation);
  }, [searchQuery, selectedStation]);

  const activeModule = useMemo(() => {
    return DOCS_MODULES.find(m => m.id === activeModuleId) || searchResults.modules[0] || DOCS_MODULES[0];
  }, [activeModuleId, searchResults.modules]);

  // Station info for active module
  const currentStation = useMemo(() => {
    if (!activeModule) return null;
    return DOCS_STATIONS.find(s => s.roleKey === activeModule.role) || DOCS_STATIONS[0];
  }, [activeModule]);

  // Current active index for previous / next navigation
  const currentIndex = useMemo(() => {
    return DOCS_MODULES.findIndex(m => m.id === activeModule?.id);
  }, [activeModule]);

  const prevModule = currentIndex > 0 ? DOCS_MODULES[currentIndex - 1] : null;
  const nextModule = currentIndex < DOCS_MODULES.length - 1 ? DOCS_MODULES[currentIndex + 1] : null;

  // Copy link anchor to clipboard
  const handleCopyAnchor = (slug) => {
    const targetSlug = slug || activeModule?.slug || activeModule?.id;
    const url = `${window.location.origin}/panduan#${targetSlug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2500);
      });
    }
  };

  const selectModule = (id) => {
    setActiveModuleId(id);
    setMobileDrawerOpen(false);
    const target = DOCS_MODULES.find(m => m.id === id);
    if (target && selectedStation !== 'all' && selectedStation !== target.role) {
      setSelectedStation(target.role);
    }
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', `/panduan#${target?.slug || id}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyPreset = (preset) => {
    setSelectedStation(preset.role);
    setSearchQuery(preset.query);
  };

  const handleOpenLiveFeature = (targetTab) => {
    if (isInline && onNavigateTab) {
      onNavigateTab(targetTab);
    } else if (onNavigateAdmin) {
      onNavigateAdmin();
    } else {
      window.location.href = `/admin#${targetTab}`;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150 ${isInline ? 'pb-24 sm:pb-12' : 'pb-16'}`}>
      
      {/* 1. STANDALONE TOPBAR (Matches AdminDashboard Terminal Topbar) */}
      {!isInline && (
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            
            {/* Left: Brand Identity & Tenant Status Pill */}
            <div className="flex items-center space-x-3 min-w-0">
              <button
                type="button"
                onClick={onNavigateHome || (() => { window.location.href = '/'; })}
                aria-label="Kembali ke Beranda"
                title="Kembali ke Beranda"
                className="touch-target p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#0c2b5e] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                      Bengkel Mobil GPS Motor Kediri
                    </h1>
                    <span className="hidden sm:inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>SOP v{DOCS_METADATA.version}</span>
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-semibold font-mono truncate">
                    Buku Panduan &amp; Dokumentasi Operasional
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions (Theme Toggle & Dashboard Link) */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Ganti Tema Gelap / Terang"
                title="Ganti Tema Gelap / Terang"
                className="touch-target p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              <button
                type="button"
                onClick={onNavigateAdmin || (() => { window.location.href = '/admin'; })}
                className="touch-target px-3.5 sm:px-4 py-2 rounded-lg bg-[#0c2b5e] hover:bg-blue-900 active:bg-blue-950 text-white text-xs font-bold tracking-wide flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="hidden sm:inline">Buka Terminal Bengkel</span>
                <span className="sm:hidden">Terminal</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 2. INLINE DASHBOARD CONTEXTUAL HEADER (When rendered inside AdminDashboard) */}
      {isInline && (
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c2b5e] flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Manual SOP Bengkel
                </span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  20 Modul Resmi &amp; 5 FAQ Darurat
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Standar Operasional Prosedur (SOP) &amp; Dokumentasi Terpadu
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('overview')}
                className="touch-target px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Kembali ke Ringkasan</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSHOP OPERATING MANUAL CANVAS */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 flex-1">
        
        {/* Terminal Omnibox Search & Preset Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-4 sm:p-5 mb-6 shadow-xs">
          <div className="flex flex-col gap-3">
            
            {/* Search Input Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-blue-600 dark:text-emerald-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari SOP, instruksi kerja, atau nomor modul (misal: 58mm, foto hp, mutasi, RO baru, opname, p&l)..."
                className="touch-target w-full pl-11 pr-24 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400"
              />
              
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center space-x-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus kata kunci pencarian"
                    className="touch-target p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
                    /
                  </kbd>
                )}
              </div>
            </div>

            {/* Quick Filter Presets Rail */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1 shrink-0 mr-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Pintasan:</span>
              </span>

              {QUICK_FILTER_PRESETS.map((preset) => {
                const isActive = selectedStation === preset.role && searchQuery === preset.query;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`touch-target px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      isActive
                        ? 'bg-[#0c2b5e] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Match results feedback */}
            {searchQuery && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>
                  Ditemukan <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{searchResults.totalResults}</strong> hasil untuk pencarian &ldquo;{searchQuery}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  Reset Pencarian
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Station Binder Segmented Selector Rail (Desktop & Mobile) */}
        <div className="mb-6 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center space-x-2 min-w-max">
            <button
              type="button"
              onClick={() => setSelectedStation('all')}
              className={`touch-target px-4 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
                selectedStation === 'all'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs ring-1 ring-slate-800 dark:ring-emerald-400/30'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className={`w-4 h-4 ${selectedStation === 'all' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Semua Stasiun (20 SOP)</span>
            </button>

            {DOCS_STATIONS.map((station) => {
              const isActive = selectedStation === station.roleKey;
              const IconComp = station.roleKey === 'owner' ? Building2 :
                               station.roleKey === 'mekanik' ? Wrench :
                               station.roleKey === 'kasir' ? Wallet : Users;
              return (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => setSelectedStation(station.roleKey)}
                  className={`touch-target px-4 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
                    isActive
                      ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs ring-1 ring-slate-800 dark:ring-emerald-400/30'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>Stasiun {station.number}: {station.badge.replace('Stasiun ', '')} ({station.moduleIds.length})</span>
                </button>
              );
            })}

            {/* FAQ Selector Button */}
            <button
              type="button"
              onClick={() => setSelectedStation('faq')}
              className={`touch-target px-4 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
                selectedStation === 'faq'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Pusat Troubleshooting ({DOCS_FAQS.length})</span>
            </button>
          </div>
        </div>

        {/* Mobile Topic Switcher Drawer Trigger (Visible on screens < lg) */}
        {selectedStation !== 'faq' && (
          <div className="lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(prev => !prev)}
              className="touch-target w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold shrink-0">
                  {activeModule?.sopCode}
                </span>
                <span className="truncate">{activeModule?.title}</span>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                <span className="text-[11px] font-semibold text-slate-400">Pilih Bab</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDrawerOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Mobile Drawer Modal Sheet */}
            {mobileDrawerOpen && (
              <div 
                className="fixed inset-0 z-50 bg-slate-950/70 flex flex-col justify-end p-2 sm:p-4"
                onClick={() => setMobileDrawerOpen(false)}
              >
                <div 
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Daftar Modul SOP Bengkel ({searchResults.modules.length})
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="touch-target p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-3 overflow-y-auto space-y-2 flex-1">
                    {searchResults.modules.map((mod) => {
                      const isCurrent = mod.id === activeModule?.id;
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => selectModule(mod.id)}
                          className={`touch-target w-full text-left p-3 rounded-xl border text-xs transition-colors flex items-start justify-between gap-3 ${
                            isCurrent
                              ? 'bg-[#0c2b5e] text-white border-blue-900 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`font-mono font-extrabold text-[11px] ${isCurrent ? 'text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {mod.sopCode}
                              </span>
                              <span className={`text-xs uppercase font-bold px-1.5 py-0.5 rounded ${isCurrent ? 'bg-blue-950 text-blue-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                {mod.badge}
                              </span>
                            </div>
                            <div className="font-bold leading-snug line-clamp-2">
                              {mod.title}
                            </div>
                          </div>
                          <span className={`text-xs font-mono shrink-0 ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`}>
                            {mod.readTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. MAIN WORKSPACE CONTENT GRID: Binder Sidebar (Desktop) + Canvas (Right) */}
        {selectedStation === 'faq' ? (
          /* FAQ Troubleshooting View */
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-5 sm:p-8 shadow-xs">
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 mb-3">
                <HelpCircle className="w-4 h-4" />
                <span>Pusat Troubleshooting &amp; Kendala Lapangan</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                5 Skenario Darurat &amp; Solusi Cepat Operasional Bengkel
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Panduan praktis langkah-demi-langkah bagi mekanik, kasir, dan pemilik bengkel saat menghadapi selisih stok opname, pembatalan invoice, kertas printer termal macet, sensor privasi nomor plat, hingga masalah koneksi offline.
              </p>
            </div>
            
            <FaqAccordion faqs={searchResults.faqs} />
          </div>
        ) : (
          /* Module SOP Reading Canvas View */
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Desktop Left Sidebar: Station Binders Navigation */}
            <aside className="hidden lg:block w-80 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 scrollbar-thin">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-4 space-y-5 shadow-xs">
                
                {/* Station Binder Groupings */}
                {DOCS_STATIONS.map((station) => {
                  const stationModules = searchResults.modules.filter(m => station.moduleIds.includes(m.id));
                  if (stationModules.length === 0) return null;

                  const IconComp = station.roleKey === 'owner' ? Building2 :
                                   station.roleKey === 'mekanik' ? Wrench :
                                   station.roleKey === 'kasir' ? Wallet : Users;

                  return (
                    <div key={station.id} className="space-y-2">
                      {/* Station Section Header */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center space-x-2">
                          <IconComp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                            Stasiun {station.number}: {station.badge.replace('Stasiun ', '')}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {stationModules.length}
                        </span>
                      </div>

                      {/* Station Module Items */}
                      <div className="space-y-1">
                        {stationModules.map((mod) => {
                          const isCurrent = mod.id === activeModule?.id;
                          return (
                            <button
                              key={mod.id}
                              type="button"
                              onClick={() => selectModule(mod.id)}
                              className={`touch-target w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col justify-center relative ${
                                isCurrent
                                  ? 'bg-[#0c2b5e] text-white font-bold shadow-xs'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 font-medium'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className={`text-[11px] font-mono font-black tracking-wider ${
                                  isCurrent ? 'text-emerald-300' : 'text-blue-700 dark:text-blue-400'
                                }`}>
                                  {mod.sopCode}
                                </span>
                                <span className={`text-xs font-mono ${
                                  isCurrent ? 'text-blue-200' : 'text-slate-400'
                                }`}>
                                  {mod.readTime}
                                </span>
                              </div>
                              <span className="leading-snug line-clamp-2 text-xs">
                                {mod.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* FAQ Link at Bottom of Sidebar */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSelectedStation('faq')}
                    className="touch-target w-full px-3 py-2.5 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4 shrink-0" />
                      <span>5 Solusi Troubleshooting (FAQ)</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </aside>

            {/* Reading Content Canvas (Right) */}
            <article className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-5 sm:p-8 shadow-xs">
              
              {/* Breadcrumb Trail */}
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <li>
                    <button 
                      type="button" 
                      onClick={() => setSelectedStation('all')}
                      className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
                    >
                      Buku Panduan
                    </button>
                  </li>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {currentStation?.title || activeModule?.badge}
                    </span>
                  </li>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <li className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {activeModule?.sopCode}
                  </li>
                </ol>
              </nav>

              {/* Module Header Card with Direct Terminal Action */}
              <div className="pb-6 border-b border-slate-200 dark:border-slate-700 mb-6 space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-[#0c2b5e] text-emerald-400 shadow-xs border border-emerald-400/30">
                      {activeModule?.sopCode}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {activeModule?.badge}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex items-center space-x-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{activeModule?.readTime}</span>
                    </div>

                    {/* Copy Anchor Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyAnchor(activeModule?.slug)}
                      aria-label="Salin Link Bab Panduan Ini"
                      title="Salin tautan langsung bab ini"
                      className="touch-target inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {copyFeedback ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>

                    {/* Direct Terminal Shortcut Button (Bridges Docs to Actual Garage App) */}
                    {activeModule?.targetTab && (
                      <button
                        type="button"
                        onClick={() => handleOpenLiveFeature(activeModule.targetTab)}
                        title={`Buka modul ${activeModule.tabActionName} di terminal`}
                        className="touch-target inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        <span className="hidden sm:inline">{activeModule.tabActionName}</span>
                        <span className="sm:hidden">Buka di App</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                    {activeModule?.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {activeModule?.summary}
                  </p>
                </div>
              </div>

              {/* Workflow Diagrams Integration */}
              {activeModule?.diagramType === 'ro-lifecycle' && (
                <div className="my-6">
                  <RoWorkflowDiagram />
                </div>
              )}
              {activeModule?.diagramType === 'stock' && (
                <div className="my-6">
                  <StockFlowDiagram />
                </div>
              )}
              {activeModule?.diagramType === 'cashflow' && (
                <div className="my-6">
                  <CashflowDiagram />
                </div>
              )}

              {/* Primary Step-by-Step Annotated Screenshot with Numbered Pins */}
              {activeModule?.annotatedScreenshot && (
                <div className="my-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Tangkapan Layar &amp; Panduan Anotasi Tombol:</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                      Klik pin 1, 2, 3... untuk melihat detail
                    </span>
                  </div>
                  <AnnotatedCard 
                    title={activeModule.annotatedScreenshot.title || activeModule.title}
                    badge={activeModule.annotatedScreenshot.badge || 'Tangkapan Layar Live'}
                    image={activeModule.annotatedScreenshot.image}
                    annotations={activeModule.annotatedScreenshot.annotations}
                    steps={activeModule.annotatedScreenshot.steps}
                  />
                </div>
              )}

              {/* Step-by-Step Tutorial Checklist Cards */}
              <div className="space-y-4 my-8">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Langkah-Langkah Pelaksanaan Prosedur (SOP):</span>
                </h3>

                {activeModule?.steps.map((st) => (
                  <div
                    key={st.number}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/50 space-y-3"
                  >
                    <div className="flex items-start space-x-3.5">
                      <span className="w-8 h-8 rounded-lg bg-[#0c2b5e] text-emerald-400 font-mono font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-emerald-400/40 shadow-xs">
                        {st.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                          {st.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {st.description}
                        </p>
                        {st.highlightText && (
                          <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                            <span>Aksi: {st.highlightText}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Render Step-Specific Screenshot or Interactive Mockup if defined */}
                    {st.stepImage ? (
                      <div className="mt-3">
                        <AnnotatedCard 
                          title={`Langkah ${st.number}: ${st.title}`}
                          image={st.stepImage}
                          annotations={st.annotations || []}
                          steps={[st.description]}
                        />
                      </div>
                    ) : st.mockupType ? (
                      <div className="mt-3">
                        <AnnotatedCard 
                          title={`Ilustrasi: ${st.title}`}
                          type={st.mockupType}
                          steps={[
                            'Isi data identifikasi pada field bertanda nomor 1',
                            'Verifikasi preview pada kolom nomor 2',
                            'Klik tombol aksi utama bernomor 3 untuk menyelesaikan proses'
                          ]}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Callout Banner (Tip / Note / Warning) */}
              {activeModule?.callout && (
                <div className="my-6">
                  <CalloutBanner
                    type={activeModule.callout.type}
                    title={activeModule.callout.title}
                    content={activeModule.callout.content}
                  />
                </div>
              )}

              {/* Sequential Navigation Buttons (Prev / Next) */}
              <div className="pt-6 mt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                {prevModule ? (
                  <button
                    type="button"
                    onClick={() => selectModule(prevModule.id)}
                    className="touch-target w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="truncate max-w-[220px]">Sebelumnya: {prevModule.sopCode}</span>
                  </button>
                ) : <div />}

                {nextModule ? (
                  <button
                    type="button"
                    onClick={() => selectModule(nextModule.id)}
                    className="touch-target w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#0c2b5e] hover:bg-blue-900 active:bg-blue-950 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors shadow-xs"
                  >
                    <span className="truncate max-w-[220px]">Selanjutnya: {nextModule.sopCode}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedStation('faq')}
                    className="touch-target w-full sm:w-auto px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors shadow-xs"
                  >
                    <span>Buka FAQ &amp; Troubleshooting</span>
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </article>
          </div>
        )}
      </main>

      {/* 5. STANDALONE FOOTER */}
      {!isInline && (
        <footer className="mt-12 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">Bengkel Mobil GPS Motor</span>
              <span>•</span>
              <span>Sambiresik, Gampengrejo, Kab. Kediri</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                type="button" 
                onClick={onNavigateHome || (() => { window.location.href = '/'; })}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Beranda
              </button>
              <button 
                type="button" 
                onClick={onNavigateAdmin || (() => { window.location.href = '/admin'; })}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Terminal Bengkel
              </button>
              <a 
                href="https://wa.me/6285603307330" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                WhatsApp Bantuan
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
