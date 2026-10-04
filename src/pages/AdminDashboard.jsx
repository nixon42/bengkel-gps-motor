import React, { useState, useEffect } from 'react';
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
  FileText,
  ExternalLink,
  Search,
  ArrowDownUp,
  ClipboardCheck,
  Wallet,
  Users,
  Car
} from 'lucide-react';
import InventoryPage from './InventoryPage';
import StockMutationsPage from './StockMutationsPage';
import StockOpnamePage from './StockOpnamePage';
import FinancePage from './FinancePage';
import RepairOrdersPage from './RepairOrdersPage';
import CustomersPage from './CustomersPage';
import DashboardPage from './DashboardPage';

export default function AdminDashboard({ onNavigateLanding, onNavigateTracking }) {
  const { user, tenant, loading, mockLogin, logout, updateSettings } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneWa: '',
    businessHours: '',
    monthlyRevenueTarget: 15000000
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        address: tenant.address || '',
        phoneWa: tenant.phone_wa || '',
        businessHours: tenant.business_hours || '',
        monthlyRevenueTarget: 15000000
      });
    }
  }, [tenant]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16 md:pb-0">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold shadow-none">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {tenant?.name || 'Bengkel Mobil GPS Motor Kediri'}
              </h1>
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono font-medium">
                  {tenant?.slug || 'bengkel-gps-motor'}
                </span>
                <span>• Workspace Admin</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* View Landing Link */}
            <button
              onClick={onNavigateLanding}
              className="touch-target hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Lihat Website</span>
            </button>

            {/* View Tracking Link */}
            <button
              onClick={() => onNavigateTracking()}
              className="touch-target hidden md:flex items-center space-x-1.5 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Cek Status Publik</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle tema gelap/terang"
              className="touch-target w-11 h-11 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Auth Session Button */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="touch-target hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Pengaturan</span>
                </button>
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="touch-target flex items-center space-x-1 px-3 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => mockLogin()}
                disabled={loading}
                className="touch-target flex items-center space-x-2 px-3 sm:px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Masuk...' : '1-Click Demo Login'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="hidden md:block bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Ringkasan Bengkel</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Inventaris & Sparepart</span>
            </button>

            <button
              onClick={() => setActiveTab('mutations')}
              className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeTab === 'mutations'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ArrowDownUp className="w-4 h-4" />
              <span>Mutasi Stok</span>
            </button>

            <button
              onClick={() => setActiveTab('opname')}
              className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeTab === 'opname'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Stok Opname</span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeTab === 'finance'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Buku Kas & Keuangan</span>
            </button>

            <button
              onClick={() => setActiveTab('repair-orders')}
              className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeTab === 'repair-orders'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Servis Mobil (RO)</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`touch-target px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                activeTab === 'customers'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Pelanggan CRM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {activeTab === 'repair-orders' && <RepairOrdersPage />}
        {activeTab === 'customers' && <CustomersPage />}
        {activeTab === 'inventory' && <InventoryPage />}
        {activeTab === 'mutations' && <StockMutationsPage />}
        {activeTab === 'opname' && <StockOpnamePage />}
        {activeTab === 'finance' && <FinancePage />}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <DashboardPage 
              onNavigateTab={setActiveTab}
              onOpenSettings={() => setSettingsOpen(true)}
              onNavigateLanding={onNavigateLanding}
              onNavigateTracking={onNavigateTracking}
            />

            {/* Banner Alert */}
            <div className="p-4 rounded border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Milestone 1 & 2 Aktif: Multi-Tenant Core + Landing Page & Portal Publik</p>
            <p className="text-blue-800 dark:text-blue-200 mt-0.5 text-xs sm:text-sm">
              Landing Page publik modern flat styling dengan showcase layanan, Google Maps, FAQ, ulasan pelanggan, serta Portal Pelacakan Kendaraan Privacy-Masked telah aktif beroperasi.
            </p>
          </div>
        </div>

        {/* Workspace Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Workshop Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold flex items-center space-x-2 text-slate-900 dark:text-white">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Profil Bengkel</span>
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Tenant Terisolasi
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Alamat Workshop</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {tenant?.address || 'Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur'}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">WhatsApp / Telepon</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">
                    {tenant?.phone_wa || '0856-0330-7330'}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Jam Operasional</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {tenant?.business_hours || 'Senin - Sabtu: 08:00 - 17:00 WIB'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setSettingsOpen(true)}
                className="touch-target w-full flex items-center justify-center space-x-2 py-2 px-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <Settings className="w-4 h-4" />
                <span>Ubah Pengaturan Bengkel</span>
              </button>
            </div>
          </div>

          {/* User Session Card */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold flex items-center space-x-2 text-slate-900 dark:text-white">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>Status Operator</span>
              </h2>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                user ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
              }`}>
                {user ? 'Terautentikasi' : 'Belum Login'}
              </span>
            </div>

            {user ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Nama Lengkap</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{user.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Email Operator</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">{user.email}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Peran & Tenant</span>
                  <span className="text-slate-800 dark:text-slate-200 capitalize">
                    {user.role} ({tenant?.slug})
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={logout}
                    className="touch-target w-full py-2 px-3 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold text-rose-600 dark:text-rose-400"
                  >
                    Logout Sesi Ini
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Login 1-klik untuk mengaktifkan sesi kerja operator bengkel.
                </p>
                <button
                  onClick={() => mockLogin()}
                  disabled={loading}
                  className="touch-target w-full py-2.5 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Menghubungkan...' : '1-Click Mock Login'}</span>
                </button>
              </div>
            )}
          </div>

          {/* System Specs & Constraints Card */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold flex items-center space-x-2 text-slate-900 dark:text-white">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span>Optimasi HP Kentang</span>
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                Mobile-First
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>Zero Glassmorphism:</strong> Permukaan solid, no GPU blur</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>44x44px Touch Target:</strong> Nyaman untuk jempol mekanik</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>SQLite WAL Mode:</strong> Read & write non-blocking</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span><strong>Privacy Masking:</strong> Sensor otomatis plat & nama</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Database Schema Status: 14 Relational Tables */}
        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 shadow-none mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Struktur Database Multi-Tenant (14 Tabel Relasional)
              </h3>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
              PRAGMA journal_mode = WAL;
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
            {[
              { name: 'tenants', count: 'Tenant Workspace' },
              { name: 'users', count: 'Operator Akun' },
              { name: 'tenant_settings', count: 'Pengaturan & Target' },
              { name: 'spareparts', count: 'Katalog SKU' },
              { name: 'stock_movements', count: 'Mutasi In/Out' },
              { name: 'stock_opnames', count: 'Audit Fisik' },
              { name: 'transaction_categories', count: 'Kategori Kas' },
              { name: 'transactions', count: 'Buku Kas Ledger' },
              { name: 'customers', count: 'Database CRM' },
              { name: 'vehicles', count: 'Data Kendaraan' },
              { name: 'repair_orders', count: '6-Stage RO Servis' },
              { name: 'ro_status_logs', count: 'Audit Log Status' },
              { name: 'ro_photos', count: 'Dokumentasi Foto' },
              { name: 'ro_spareparts', count: 'Pemakaian Part RO' }
            ].map(table => (
              <div 
                key={table.name} 
                className="p-2.5 rounded bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
              >
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate" title={table.name}>
                  {table.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {table.count}
                </span>
              </div>
            ))}
          </div>
        </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>Pengaturan Workshop & Tenant</span>
              </h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] touch-target flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Bengkel
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Bengkel
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Bengkel
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneWa}
                    onChange={(e) => setFormData({ ...formData, phoneWa: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    value={formData.businessHours}
                    onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {saveStatus && (
                <div className={`p-2.5 rounded text-xs font-medium ${
                  saveStatus.startsWith('Gagal') ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                }`}>
                  {saveStatus}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="touch-target px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="touch-target px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-30 flex items-center justify-around h-16 px-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'overview' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4 mb-0.5" />
          <span>Ringkasan</span>
        </button>
        <button
          onClick={() => setActiveTab('repair-orders')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'repair-orders' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Wrench className="w-4 h-4 mb-0.5" />
          <span>Servis</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'inventory' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>Inventaris</span>
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'finance' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Wallet className="w-4 h-4 mb-0.5" />
          <span>Keuangan</span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`touch-target flex-1 flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'customers' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Pelanggan</span>
        </button>
        <button
          onClick={onNavigateLanding}
          className="touch-target flex-1 flex flex-col items-center justify-center py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          <ExternalLink className="w-4 h-4 mb-0.5" />
          <span>Website</span>
        </button>
      </nav>
    </div>
  );
}
