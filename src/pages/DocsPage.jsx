import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles
} from 'lucide-react';
import { 
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
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModuleId, setActiveModuleId] = useState(() => {
    if (initialSection) {
      const found = DOCS_MODULES.find(m => m.id === initialSection || m.slug === initialSection);
      if (found) return found.id;
    }
    return DOCS_MODULES[0]?.id || 'owner-settings';
  });
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [mobileTopicDropdownOpen, setMobileTopicDropdownOpen] = useState(false);

  // Sync hash from URL if updated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        if (hash === 'faq' || hash === 'troubleshooting') {
          setSelectedRole('faq');
        } else {
          const match = DOCS_MODULES.find(m => m.id === hash || m.slug === hash);
          if (match) {
            setActiveModuleId(match.id);
            setSelectedRole(match.role);
          }
        }
      }
    }
  }, []);

  // Filter modules and FAQs based on search and selected role
  const searchResults = useMemo(() => {
    return searchDocs(searchQuery, selectedRole);
  }, [searchQuery, selectedRole]);

  const activeModule = useMemo(() => {
    return DOCS_MODULES.find(m => m.id === activeModuleId) || searchResults.modules[0] || DOCS_MODULES[0];
  }, [activeModuleId, searchResults.modules]);

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
    setMobileTopicDropdownOpen(false);
    const target = DOCS_MODULES.find(m => m.id === id);
    if (target && selectedRole !== 'all' && selectedRole !== target.role) {
      setSelectedRole(target.role);
    }
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', `/panduan#${target?.slug || id}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Standalone Mode Top Header */}
      {!isInline && (
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onNavigateHome || (() => { window.location.href = '/'; })}
                aria-label="Kembali ke Beranda"
                className="touch-target p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                  GPS
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    Bengkel Mobil GPS Motor
                  </h1>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    Buku Panduan & Dokumentasi
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Ganti Tema Gelap / Terang"
                className="touch-target p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Workspace / Admin Link */}
              <button
                type="button"
                onClick={onNavigateAdmin || (() => { window.location.href = '/admin'; })}
                className="touch-target px-3 sm:px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-none"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Buka Dashboard</span>
                <span className="sm:hidden">App</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hub Banner & Instant Search Bar */}
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 sm:p-6 mb-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dokumentasi Resmi v{DOCS_METADATA.version}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Pusat Panduan & Tutorial Pengoperasian Bengkel
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              Panduan langkah-demi-langkah terperinci untuk seluruh peran pengguna (Owner/Admin, Mekanik, Kasir, CRM) serta solusi troubleshooting operasional bengkel sehari-hari.
            </p>

            {/* Instant Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik panduan, fitur, atau kata kunci (misal: stok opname, laba rugi, 6-tahap, foto, faktur)..."
                className="touch-target w-full pl-11 pr-10 py-2.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus kata kunci pencarian"
                  className="touch-target absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>Ditemukan {searchResults.totalResults} topik & jawaban terkait "{searchQuery}"</span>
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="text-slate-500 hover:underline"
                >
                  Reset filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Role Selector Chips */}
        <div className="mb-6 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center space-x-2 min-w-max">
            <button
              type="button"
              onClick={() => setSelectedRole('all')}
              className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                selectedRole === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Semua Modul ({DOCS_MODULES.length})</span>
            </button>

            {DOCS_ROLES.map((role) => {
              const isActive = selectedRole === role.key;
              const moduleCount = DOCS_MODULES.filter(m => m.role === role.key).length;
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setSelectedRole(role.key)}
                  className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {role.key === 'owner' && <Building2 className="w-4 h-4" />}
                  {role.key === 'mekanik' && <Wrench className="w-4 h-4" />}
                  {role.key === 'kasir' && <Wallet className="w-4 h-4" />}
                  {role.key === 'crm' && <Users className="w-4 h-4" />}
                  <span>{role.label} ({moduleCount})</span>
                </button>
              );
            })}

            {/* FAQ Filter Button */}
            <button
              type="button"
              onClick={() => setSelectedRole('faq')}
              className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                selectedRole === 'faq'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Troubleshooting FAQ ({DOCS_FAQS.length})</span>
            </button>
          </div>
        </div>

        {/* Mobile Topic Selector Drawer Toggle (visible on screens < lg) */}
        {selectedRole !== 'faq' && (
          <div className="lg:hidden mb-4">
            <button
              type="button"
              onClick={() => setMobileTopicDropdownOpen(prev => !prev)}
              className="touch-target w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <div className="flex items-center space-x-2 truncate">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">Topik: {activeModule?.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileTopicDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileTopicDropdownOpen && (
              <div className="mt-2 p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-1">
                {searchResults.modules.map(mod => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => selectModule(mod.id)}
                    className={`touch-target w-full text-left px-3 py-2 rounded text-xs font-semibold flex items-center justify-between ${
                      mod.id === activeModule?.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="truncate">{mod.title}</span>
                    <span className="text-[10px] opacity-75 shrink-0 ml-2">{mod.badge}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Layout: Sidebar Index (Left) + Content Canvas (Right) */}
        {selectedRole === 'faq' ? (
          /* FAQ View */
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6">
            <div className="max-w-3xl mb-6">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Pusat Bantuan & Troubleshooting</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                5 Skenario Kendala Operasional Umum Bengkel
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Solusi praktis langkah-demi-langkah untuk kendala stok opname, pembatalan transaksi salah, handover mekanik, nota hilang, dan tips kompresi kamera.
              </p>
            </div>
            <FaqAccordion faqs={searchResults.faqs} />
          </div>
        ) : (
          /* Module Tutorials View */
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Desktop Left Sidebar: Sticky Modules Index */}
            <aside className="hidden lg:block w-72 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
              <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Daftar Modul Panduan
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {searchResults.modules.length} Bab
                  </span>
                </div>

                <nav aria-label="Daftar Bab Panduan" className="space-y-1">
                  {searchResults.modules.map((mod) => {
                    const isCurrent = mod.id === activeModule?.id;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => selectModule(mod.id)}
                        className={`touch-target w-full text-left px-3 py-2.5 rounded text-xs transition-colors flex flex-col justify-center ${
                          isCurrent
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-0.5">
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${
                            isCurrent ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {mod.badge}
                          </span>
                          <span className={`text-[10px] ${
                            isCurrent ? 'text-blue-200' : 'text-slate-400'
                          }`}>
                            {mod.readTime}
                          </span>
                        </div>
                        <span className="truncate leading-snug">{mod.title}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* FAQ Link at Bottom of Sidebar */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('faq')}
                    className="touch-target w-full px-3 py-2 rounded text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center space-x-2 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>5 Solusi Troubleshooting (FAQ)</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Reading Content Canvas (Right) */}
            <article className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 sm:p-8">
              {/* Breadcrumb Trail */}
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <li>
                    <button 
                      type="button" 
                      onClick={() => setSelectedRole('all')}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Buku Panduan
                    </button>
                  </li>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <li>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {activeModule?.badge}
                    </span>
                  </li>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <li className="font-bold text-blue-600 dark:text-blue-400 truncate max-w-[200px] sm:max-w-none">
                    {activeModule?.title}
                  </li>
                </ol>
              </nav>

              {/* Topic Header */}
              <div className="pb-5 border-b border-slate-200 dark:border-slate-700 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                    {activeModule?.badge}
                  </span>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Waktu baca: {activeModule?.readTime}
                    </span>
                    {/* Copy Anchor Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyAnchor(activeModule?.slug)}
                      aria-label="Salin Link Bab Panduan Ini"
                      title="Salin tautan langsung bab ini"
                      className="touch-target inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
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
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeModule?.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {activeModule?.summary}
                </p>
              </div>

              {/* Workflow Diagrams Integration */}
              {activeModule?.diagramType === 'ro-lifecycle' && (
                <RoWorkflowDiagram />
              )}
              {activeModule?.diagramType === 'stock' && (
                <StockFlowDiagram />
              )}
              {activeModule?.diagramType === 'cashflow' && (
                <CashflowDiagram />
              )}

              {/* Step-by-Step Tutorial Cards */}
              <div className="space-y-6 my-6">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Langkah-Langkah Pelaksanaan:
                </h3>

                {activeModule?.steps.map((st) => (
                  <div
                    key={st.number}
                    className="p-4 sm:p-5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-3"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-none">
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
                          <div className="mt-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <span>Aksi: {st.highlightText}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Render Interactive Mockup if step has mockupType */}
                    {st.mockupType && (
                      <AnnotatedCard 
                        title={`Ilustrasi: ${st.title}`}
                        type={st.mockupType}
                        steps={[
                          'Isi data identifikasi pada field bertanda nomor 1',
                          'Verifikasi preview pada kolom nomor 2',
                          'Klik tombol aksi utama bernomor 3 untuk menyelesaikan proses'
                        ]}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Callout Banner (Tip / Note / Warning) */}
              {activeModule?.callout && (
                <CalloutBanner
                  type={activeModule.callout.type}
                  title={activeModule.callout.title}
                  content={activeModule.callout.content}
                />
              )}

              {/* Sequential Navigation Buttons (Prev / Next) */}
              <div className="pt-6 mt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                {prevModule ? (
                  <button
                    type="button"
                    onClick={() => selectModule(prevModule.id)}
                    className="touch-target w-full sm:w-auto px-4 py-2.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Sebelumnya: {prevModule.title}</span>
                  </button>
                ) : <div />}

                {nextModule ? (
                  <button
                    type="button"
                    onClick={() => selectModule(nextModule.id)}
                    className="touch-target w-full sm:w-auto px-4 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors shadow-none"
                  >
                    <span>Selanjutnya: {nextModule.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedRole('faq')}
                    className="touch-target w-full sm:w-auto px-4 py-2.5 rounded bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors shadow-none"
                  >
                    <span>Buka FAQ & Troubleshooting</span>
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </article>
          </div>
        )}
      </main>

      {/* Standalone Footer */}
      {!isInline && (
        <footer className="mt-12 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              © 2026 Bengkel Mobil GPS Motor Kediri. Sambiresik, Kec. Gampengrejo, Kab. Kediri.
            </div>
            <div className="flex items-center space-x-4">
              <button 
                type="button" 
                onClick={onNavigateHome || (() => { window.location.href = '/'; })}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Beranda
              </button>
              <button 
                type="button" 
                onClick={onNavigateAdmin || (() => { window.location.href = '/admin'; })}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                Dashboard
              </button>
              <a 
                href="https://wa.me/6285603307330" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-emerald-600 dark:hover:text-emerald-400"
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
