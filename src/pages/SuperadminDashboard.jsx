import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Wrench, 
  Wallet, 
  Database, 
  Server, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Sun, 
  Moon, 
  LogOut, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  Search,
  Activity,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function formatRupiah(val) {
  const num = Math.round(Number(val) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

export default function SuperadminDashboard({ onNavigateAdmin, onNavigateLanding }) {
  const { user, logout, mockLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Add Tenant Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    address: '',
    phoneWa: '',
    businessHours: 'Senin - Sabtu: 08:00 - 17:00 WIB',
    monthlyRevenueTarget: 15000000
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Search in tables
  const [searchTenant, setSearchTenant] = useState('');
  const [searchUser, setSearchUser] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Fetch all superadmin data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [resStats, resTenants, resUsers, resSys] = await Promise.all([
        fetch('/api/superadmin/stats', { credentials: 'include' }),
        fetch('/api/superadmin/tenants', { credentials: 'include' }),
        fetch('/api/superadmin/users', { credentials: 'include' }),
        fetch('/api/superadmin/system', { credentials: 'include' })
      ]);

      if (!resStats.ok) {
        if (resStats.status === 403 || resStats.status === 401) {
          throw new Error('Akses ditolak: Anda harus login sebagai Superadmin.');
        }
        throw new Error('Gagal memuat data superadmin.');
      }

      const jsonStats = await resStats.json();
      const jsonTenants = await resTenants.json();
      const jsonUsers = await resUsers.json();
      const jsonSys = await resSys.json();

      setStats(jsonStats.stats);
      setTenants(jsonTenants.tenants || []);
      setUsersList(jsonUsers.users || []);
      setSystemInfo(jsonSys.system);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Create Tenant
  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      const res = await fetch('/api/superadmin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Gagal membuat tenant baru');
      }

      showToast(`Bengkel "${createForm.name}" berhasil ditambahkan!`);
      setCreateModalOpen(false);
      setCreateForm({
        name: '',
        slug: '',
        address: '',
        phoneWa: '',
        businessHours: 'Senin - Sabtu: 08:00 - 17:00 WIB',
        monthlyRevenueTarget: 15000000
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handle Change User Role
  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/superadmin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        showToast('Role pengguna berhasil diperbarui!');
        fetchData();
      }
    } catch (err) {
      alert('Gagal mengubah role: ' + err.message);
    }
  };

  // Quick Superadmin Mock Login for testing
  const handleSuperadminQuickLogin = async () => {
    try {
      await mockLogin('bengkel-gps-motor', 'superadmin@gpsmotor.id', 'Superadmin GPS Motor');
      fetchData();
    } catch (err) {
      alert('Login gagal: ' + err.message);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name?.toLowerCase().includes(searchTenant.toLowerCase()) ||
    t.slug?.toLowerCase().includes(searchTenant.toLowerCase())
  );

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.tenant_name?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16 md:pb-0">
      
      {/* Top Superadmin Header Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center text-slate-950 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  Superadmin Portal
                </h1>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider font-mono">
                  Sistem Multi-Tenant
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Pusat Pengawasan Bengkel Mobil GPS Motor
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Back to Workshop link */}
            <button
              onClick={onNavigateAdmin}
              className="touch-target flex items-center space-x-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Buka Workspace Bengkel</span>
            </button>

            {/* Dark Mode */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle tema gelap/terang"
              className="touch-target w-10 h-10 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Logout */}
            {user && (
              <button
                onClick={logout}
                className="touch-target flex items-center space-x-1 px-3 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-600 text-white py-2 px-4 text-center text-xs font-bold sticky top-16 z-30 flex items-center justify-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Error state if not superadmin */}
      {error && (
        <div className="max-w-4xl mx-auto my-8 p-6 bg-white dark:bg-slate-800 rounded border-2 border-rose-500 shadow-none text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Akses Terbatas</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{error}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSuperadminQuickLogin}
              className="touch-target px-4 py-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              🔑 1-Click Login sebagai Superadmin
            </button>
            <button
              onClick={onNavigateAdmin}
              className="touch-target px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
            >
              Kembali ke Workspace Biasa
            </button>
          </div>
        </div>
      )}

      {/* Main Superadmin Content */}
      {!error && (
        <>
          {/* Navigation Bar */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-2 overflow-x-auto py-2.5">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`touch-target px-4 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Ringkasan Sistem</span>
                </button>

                <button
                  onClick={() => setActiveTab('tenants')}
                  className={`touch-target px-4 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    activeTab === 'tenants'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Daftar Bengkel (Tenants)</span>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`touch-target px-4 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    activeTab === 'users'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Manajemen Pengguna</span>
                </button>

                <button
                  onClick={() => setActiveTab('system')}
                  className={`touch-target px-4 py-2 rounded text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    activeTab === 'system'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Diagnostik & Database</span>
                </button>
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase">Total Bengkel</span>
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {stats.totalTenants}
                    </div>
                    <span className="text-[11px] text-slate-500">Tenant aktif terdaftar</span>
                  </div>

                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase">Total Pengguna</span>
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {stats.totalUsers}
                    </div>
                    <span className="text-[11px] text-slate-500">Admin & mekanik terdaftar</span>
                  </div>

                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase">Total Servis (RO)</span>
                      <Wrench className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {stats.totalRepairOrders}
                    </div>
                    <span className="text-[11px] text-slate-500">Unit mobil ditangani</span>
                  </div>

                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                      <span className="text-xs font-bold uppercase">Omset Lintas Bengkel</span>
                      <Wallet className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {formatRupiah(stats.totalRevenue)}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Laba Bersih: {formatRupiah(stats.netBalance)}
                    </span>
                  </div>
                </div>

                {/* Repair Orders Lifecycle Distribution */}
                <div className="p-5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Distribusi Status Mobil Lintas Bengkel</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {stats.roStages?.map((st) => (
                      <div key={st.status} className="p-3 rounded bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-center">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                          {st.status}
                        </span>
                        <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                          {st.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Tenant Summary */}
                <div className="p-5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Ringkasan Bengkel Terdaftar
                    </h3>
                    <button
                      onClick={() => setActiveTab('tenants')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Kelola Semua ({tenants.length}) →
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {tenants.slice(0, 5).map(t => (
                      <div key={t.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</span>
                            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                              /{t.slug}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">{t.address} • WA: {t.phone_wa}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                            {t.ro_count} Mobil • {t.user_count} User
                          </span>
                          <span className="text-xs text-emerald-600 font-mono font-semibold">
                            {formatRupiah(t.total_revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TENANTS TAB */}
            {activeTab === 'tenants' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Cari nama bengkel atau slug..."
                      value={searchTenant}
                      onChange={(e) => setSearchTenant(e.target.value)}
                      className="touch-target w-full pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="touch-target px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Bengkel Baru</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Nama Bengkel</th>
                        <th className="p-3">Slug URL</th>
                        <th className="p-3">Kontak WA</th>
                        <th className="p-3 text-center">Teknisi</th>
                        <th className="p-3 text-center">Mobil (RO)</th>
                        <th className="p-3 text-right">Total Omset</th>
                        <th className="p-3 text-right">Target Bulanan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredTenants.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 dark:text-white block">{t.name}</span>
                            <span className="text-[11px] text-slate-500">{t.address}</span>
                          </td>
                          <td className="p-3 font-mono text-blue-600 dark:text-blue-400">
                            /{t.slug}
                          </td>
                          <td className="p-3 font-mono">{t.phone_wa}</td>
                          <td className="p-3 text-center font-bold font-mono">{t.user_count}</td>
                          <td className="p-3 text-center font-bold font-mono">{t.ro_count}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600">
                            {formatRupiah(t.total_revenue)}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {formatRupiah(t.monthly_revenue_target)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Cari user, email, bengkel..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="touch-target w-full pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">
                    Total: {usersList.length} Pengguna
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Nama</th>
                        <th className="p-3">Email Akun</th>
                        <th className="p-3">Bengkel (Tenant)</th>
                        <th className="p-3">Role Hak Akses</th>
                        <th className="p-3">Tipe Login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {u.name}
                          </td>
                          <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                            {u.email}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold block">{u.tenant_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">/{u.tenant_slug}</span>
                          </td>
                          <td className="p-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u.id, e.target.value)}
                              className="touch-target px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold"
                            >
                              <option value="superadmin">Superadmin</option>
                              <option value="admin">Admin</option>
                              <option value="operator">Operator</option>
                              <option value="mechanic">Mekanik</option>
                              <option value="cashier">Kasir</option>
                            </select>
                          </td>
                          <td className="p-3 font-mono uppercase text-[11px] text-slate-500">
                            {u.auth_provider}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SYSTEM DIAGNOSTICS TAB */}
            {activeTab === 'system' && systemInfo && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Email Superadmin (.env)</span>
                    <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                      {systemInfo.superadminEmail}
                    </span>
                  </div>

                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Ukuran File Database SQLite</span>
                    <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {systemInfo.dbSize}
                    </span>
                  </div>

                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <span className="text-xs font-bold uppercase text-slate-500 block mb-1">SQLite Pragmas</span>
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      WAL Mode: {systemInfo.sqlitePragmas?.journalMode?.toUpperCase()} • FK: {systemInfo.sqlitePragmas?.foreignKeys ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Node.js / Platform</span>
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {systemInfo.nodeVersion} ({systemInfo.platform})
                    </span>
                  </div>

                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Server Uptime</span>
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {Math.floor(systemInfo.uptimeSeconds / 60)} menit ({systemInfo.uptimeSeconds} detik)
                    </span>
                  </div>

                  <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Penggunaan Memori RSS</span>
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {systemInfo.memoryUsageMb} MB
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Refresh Status Diagnostik</h4>
                    <p className="text-xs text-slate-500">Ambil ulang kondisi runtime backend dan database SQLite</p>
                  </div>
                  <button
                    onClick={fetchData}
                    className="touch-target px-3 py-2 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Periksa Ulang</span>
                  </button>
                </div>
              </div>
            )}

          </main>
        </>
      )}

      {/* Modal Tambah Bengkel Baru */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Daftarkan Bengkel (Tenant) Baru</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-10 h-10 touch-target flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Bengkel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bengkel GPS Motor Cabang Pare"
                  value={createForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setCreateForm({ ...createForm, name, slug: createForm.slug || slug });
                  }}
                  className="touch-target w-full p-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Slug URL Unik *
                </label>
                <div className="flex items-center">
                  <span className="p-2.5 bg-slate-100 dark:bg-slate-750 border border-r-0 border-slate-300 dark:border-slate-600 rounded-l font-mono text-slate-500">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="gps-motor-pare"
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="touch-target flex-1 p-2.5 rounded-r border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="081234567890"
                  value={createForm.phoneWa}
                  onChange={(e) => setCreateForm({ ...createForm, phoneWa: e.target.value })}
                  className="touch-target w-full p-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="Jl. Raya Pare No. 10, Kediri"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  className="w-full p-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Pendapatan Bulanan (Rp)
                </label>
                <input
                  type="number"
                  value={createForm.monthlyRevenueTarget}
                  onChange={(e) => setCreateForm({ ...createForm, monthlyRevenueTarget: Number(e.target.value) })}
                  className="touch-target w-full p-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-mono text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="touch-target px-3.5 py-2 rounded border border-slate-300 dark:border-slate-600 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="touch-target px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {createSubmitting ? 'Mendaftarkan...' : 'Daftarkan Bengkel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
