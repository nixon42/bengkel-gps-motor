import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  Wallet, 
  Wrench, 
  AlertTriangle, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Package, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  RefreshCw, 
  Search, 
  Command, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Settings, 
  Layers, 
  ArrowDownUp, 
  ClipboardCheck, 
  Users,
  X,
  BookOpen,
  AlertCircle,
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Gauge,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({ onNavigateTab, onOpenSettings, onNavigateLanding, onNavigateTracking, onNavigateDocs }) {
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);
  const [activeTrendPoint, setActiveTrendPoint] = useState(null);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const searchInputRef = useRef(null);

  // Live clock WIB & date string
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(now);
      const timePart = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now) + ' WIB';
      setCurrentTimeStr(`${datePart} · ${timePart}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard/summary', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error(`Gagal memuat analitik: HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency helpers
  const formatRupiah = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const mIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return `${day} ${months[mIdx] || ''}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return '';
      return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(d) + ' WIB';
    } catch {
      return '';
    }
  };

  const summary = data?.summary || {
    active_ros: 0,
    cars_entered_today: 0,
    completed_ros_today: 0,
    monthly_revenue: 0,
    monthly_expense: 0,
    monthly_net: 0,
    monthly_target: 15000000,
    target_progress_percent: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_spareparts: 0
  };

  const statusList = data?.status_distribution_array || [
    { status: 'MASUK', label: 'Mobil Masuk', count: 0, color: '#3B82F6' },
    { status: 'DIAGNOSA', label: 'Pemeriksaan / Diagnosa', count: 0, color: '#F59E0B' },
    { status: 'PENGERJAAN', label: 'Pengerjaan Servis', count: 0, color: '#8B5CF6' },
    { status: 'MENUNGGU_PART', label: 'Menunggu Sparepart', count: 0, color: '#EC4899' },
    { status: 'SELESAI', label: 'Selesai Dikerjakan', count: 0, color: '#10B981' },
    { status: 'DIAMBIL', label: 'Sudah Diambil', count: 0, color: '#6B7280' }
  ];

  const totalRos = statusList.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
  const revenueTrend = data?.revenue_trend_30d || [];
  const topSpareparts = data?.top_spareparts || [];
  const recentActivities = data?.recent_activities || [];
  const attentionItems = data?.attention_items || { waiting_parts: [], ready_pickup: [], critical_parts: [] };
  const activeBays = data?.active_bays || [];
  const activeVehicles = data?.active_vehicles || [];

  // Set default active point for trend chart to the latest item
  useEffect(() => {
    if (revenueTrend.length > 0 && !activeTrendPoint) {
      setActiveTrendPoint(revenueTrend[revenueTrend.length - 1]);
    }
  }, [revenueTrend]);

  // Calculate SVG Donut Geometry
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~ 376.99
  let accumulatedPercent = 0;

  // Calculate SVG 30-day Trend Line Chart (Revenue & Expense)
  const trendMaxRevenue = Math.max(
    ...revenueTrend.map(t => Math.max(Number(t.revenue) || 0, Number(t.expense) || 0)), 
    1000000
  );
  const chartWidth = 600;
  const chartHeight = 170;
  const chartPaddingTop = 20;
  const chartPaddingBottom = 34;
  const chartUsableHeight = chartHeight - chartPaddingTop - chartPaddingBottom;

  const trendPoints = revenueTrend.map((item, index) => {
    const x = (index / Math.max(revenueTrend.length - 1, 1)) * (chartWidth - 40) + 20;
    const rev = Number(item.revenue) || 0;
    const exp = Number(item.expense) || 0;
    const yRev = chartHeight - chartPaddingBottom - (rev / trendMaxRevenue) * chartUsableHeight;
    const yExp = chartHeight - chartPaddingBottom - (exp / trendMaxRevenue) * chartUsableHeight;
    return { x, y: yRev, yExp, rev, exp, date: item.date };
  });

  const svgPolylinePoints = trendPoints.map(p => `${p.x},${p.y}`).join(' ');
  const svgPolylineExpense = trendPoints.map(p => `${p.x},${p.yExp}`).join(' ');
  const svgAreaPoints = trendPoints.length > 0 
    ? `${trendPoints[0].x},${chartHeight - chartPaddingBottom} ${svgPolylinePoints} ${trendPoints[trendPoints.length - 1].x},${chartHeight - chartPaddingBottom}`
    : '';

  // Quick Action navigation targets
  const quickActions = [
    { type: 'NAV', label: 'Buat Repair Order Baru', icon: Wrench, action: () => { setQuickActionOpen(false); onNavigateTab('repair-orders'); }, desc: 'Input data servis mobil pelanggan baru' },
    { type: 'NAV', label: 'Catat Transaksi Keuangan', icon: Wallet, action: () => { setQuickActionOpen(false); onNavigateTab('finance'); }, desc: 'Catat pemasukan atau pengeluaran kas' },
    { type: 'NAV', label: 'Tambah Stok Masuk (Restock)', icon: ArrowDownUp, action: () => { setQuickActionOpen(false); onNavigateTab('mutations'); }, desc: 'Input pembelian sparepart dari supplier' },
    { type: 'NAV', label: 'Stok Opname Fisik', icon: ClipboardCheck, action: () => { setQuickActionOpen(false); onNavigateTab('opname'); }, desc: 'Pencocokan stok fisik vs sistem' },
    { type: 'NAV', label: 'Katalog Sparepart & Inventaris', icon: Layers, action: () => { setQuickActionOpen(false); onNavigateTab('inventory'); }, desc: 'Kelola SKU, harga beli/jual, & batas stok' },
    { type: 'NAV', label: 'Database CRM Pelanggan', icon: Users, action: () => { setQuickActionOpen(false); onNavigateTab('customers'); }, desc: 'Riwayat kendaraan & kontak WhatsApp' },
    { type: 'NAV', label: 'Pengaturan Profil Bengkel', icon: Settings, action: () => { setQuickActionOpen(false); onOpenSettings(); }, desc: 'Nama, alamat Kediri, WhatsApp, jam kerja' },
    { type: 'NAV', label: 'Buku Panduan & Dokumentasi', icon: BookOpen, action: () => { setQuickActionOpen(false); if (onNavigateDocs) onNavigateDocs(); else onNavigateTab('docs'); }, desc: 'Tutorial langkah operasional seluruh staf' }
  ];

  // Combined search: Navigation actions + Live Vehicle search
  const queryClean = searchQuery.trim().toLowerCase();
  
  const matchedVehicles = queryClean.length > 0 ? activeVehicles.filter(v => 
    v.plate_number.toLowerCase().includes(queryClean) ||
    v.customer_name.toLowerCase().includes(queryClean) ||
    (v.car_model && v.car_model.toLowerCase().includes(queryClean)) ||
    (v.car_brand && v.car_brand.toLowerCase().includes(queryClean))
  ).map(v => ({
    type: 'VEHICLE',
    label: `${v.plate_number} — ${v.car_brand || ''} ${v.car_model || ''}`,
    desc: `Pelanggan: ${v.customer_name} • Status: ${v.status} • Mekanik: ${v.mechanic_name || '-'}`,
    icon: Car,
    action: () => { setQuickActionOpen(false); onNavigateTab('repair-orders'); }
  })) : [];

  const matchedActions = quickActions.filter(item => 
    item.label.toLowerCase().includes(queryClean) || 
    item.desc.toLowerCase().includes(queryClean)
  );

  const combinedSearchResults = [...matchedVehicles, ...matchedActions];

  // Desktop keyboard shortcuts: '/' to focus search, 'Ctrl+K' or 'Cmd+K' for quick action modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      const targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setQuickActionOpen(prev => !prev);
        setSelectedActionIndex(0);
        return;
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        return;
      }

      if (quickActionOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setQuickActionOpen(false);
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedActionIndex(prev => (prev + 1) % Math.max(1, combinedSearchResults.length));
          return;
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedActionIndex(prev => (prev - 1 + combinedSearchResults.length) % Math.max(1, combinedSearchResults.length));
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (combinedSearchResults[selectedActionIndex]) {
            combinedSearchResults[selectedActionIndex].action();
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickActionOpen, combinedSearchResults, selectedActionIndex]);

  // Target deficit calculation
  const targetDeficit = Math.max(0, summary.monthly_target - summary.monthly_revenue);

  // Fallback workshop name and address
  const workshopName = tenant?.name || 'Bengkel Mobil GPS Motor Kediri';
  const workshopAddress = tenant?.address || 'Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur';

  return (
    <div className="space-y-6">
      
      {/* 1. Header Command Strip (Workshop Brand Identity & Real-Time Context) */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {workshopName}
            </h1>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span>Pusat Kendali Operasional</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{workshopAddress}</span>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-600 dark:text-slate-300">
              {currentTimeStr || 'WIB'}
            </span>
          </div>
        </div>

        {/* Omnibox Search Bar & Fast Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari Plat Nomor (AG...), servis, atau /"
              onFocus={() => setQuickActionOpen(true)}
              onClick={() => setQuickActionOpen(true)}
              readOnly
              className="w-full pl-9 pr-14 py-2 rounded text-xs border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-500">
              Ctrl+K
            </kbd>
          </div>

          <button
            onClick={() => setQuickActionOpen(true)}
            className="touch-target px-3 py-2 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
            title="Buka menu cepat (Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Aksi Cepat</span>
          </button>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="touch-target p-2 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center justify-center"
            title="Segarkan data bengkel"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Error Recovery State (No Silent Failures) */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 dark:border-rose-800 rounded p-4 sm:p-5 text-rose-950 dark:text-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-100">
                Gagal Menghubungkan ke Data Server Bengkel
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-200 mt-0.5">
                {error}. Periksa koneksi internet Anda atau pastikan server lokal beroperasi normal.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="touch-target px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* 3. Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-32 rounded bg-slate-200 dark:bg-slate-700/60" />
            ))}
          </div>
          <div className="h-20 rounded bg-slate-200 dark:bg-slate-700/60" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 h-72 rounded bg-slate-200 dark:bg-slate-700/60" />
            <div className="lg:col-span-7 h-72 rounded bg-slate-200 dark:bg-slate-700/60" />
          </div>
        </div>
      )}

      {/* 4. 4 KPI Summary Cards (Weighted Hierarchy & Accessible Buttons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Mobil Masuk Hari Ini */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('repair-orders')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigateTab && onNavigateTab('repair-orders'); } }}
          className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mobil Masuk Hari Ini
            </span>
            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="tabular-nums text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.cars_entered_today}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">unit mobil</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Servis Aktif: <strong className="tabular-nums text-slate-900 dark:text-white font-bold">{summary.active_ros}</strong> unit</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Card 2: Pendapatan Bulan Ini */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('finance')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigateTab && onNavigateTab('finance'); } }}
          className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pendapatan Bulan Ini
            </span>
            <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="tabular-nums text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate" title={formatRupiah(summary.monthly_revenue)}>
              {formatRupiah(summary.monthly_revenue)}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Target {formatRupiah(summary.monthly_target)}</span>
              <span className="tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{summary.target_progress_percent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded transition-all duration-500" 
                style={{ width: `${Math.min(100, summary.target_progress_percent)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 truncate">
              {targetDeficit > 0 ? `Sisa ${formatRupiah(targetDeficit)} untuk target` : 'Target tercapai!'}
            </p>
          </div>
        </div>

        {/* Card 3: Servis Sedang Berjalan */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('repair-orders')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigateTab && onNavigateTab('repair-orders'); } }}
          className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 outline-none transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Servis Aktif Berjalan
            </span>
            <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="tabular-nums text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.active_ros}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">kendaraan</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Selesai hari ini: <strong className="tabular-nums text-slate-900 dark:text-white font-bold">{summary.completed_ros_today}</strong> unit</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Card 4: Sparepart Kritis */}
        <div 
          role="button"
          tabIndex={0}
          onClick={() => onNavigateTab && onNavigateTab('inventory')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigateTab && onNavigateTab('inventory'); } }}
          className={`bg-white dark:bg-slate-800 rounded border p-5 cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 outline-none transition-all ${
            summary.low_stock_count > 0 
              ? 'border-rose-300 dark:border-rose-900/80 hover:border-rose-500' 
              : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sparepart Kritis
            </span>
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              summary.low_stock_count > 0 
                ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' 
                : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`tabular-nums text-2xl sm:text-3xl font-black ${
              summary.low_stock_count > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {summary.low_stock_count}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">SKU menipis</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Habis total: <strong className="tabular-nums font-bold text-rose-600 dark:text-rose-400">{summary.out_of_stock_count}</strong> SKU</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 5. Triage Strip: "Perlu Perhatian Hari Ini" (Operational Attention Center) */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Perlu Perhatian Hari Ini (Triage Operasional)</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            Tindakan cepat untuk menjaga ritme kerja bengkel
          </span>
        </div>

        {/* Attention Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Card 1: Kendaraan Menunggu Sparepart */}
          <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Menunggu Sparepart ({attentionItems.waiting_parts?.length || 0})</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300">
                  Tertahan
                </span>
              </div>
              {attentionItems.waiting_parts && attentionItems.waiting_parts.length > 0 ? (
                <div className="space-y-1.5">
                  {attentionItems.waiting_parts.slice(0, 2).map((item) => (
                    <div key={item.id} className="text-xs p-1.5 rounded bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{item.plate_number}</span>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px] truncate">
                        {item.car_brand} {item.car_model} • Mekanik: {item.mechanic_name || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-1">
                  Tidak ada kendaraan tertahan menunggu suku cadang.
                </p>
              )}
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('repair-orders')}
              className="touch-target mt-3 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700"
            >
              <span>Periksa Status Servis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Suku Cadang Stok 0 / Kritis */}
          <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Stok Habis / Kritis ({attentionItems.critical_parts?.length || 0})</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                  Segera Restock
                </span>
              </div>
              {attentionItems.critical_parts && attentionItems.critical_parts.length > 0 ? (
                <div className="space-y-1.5">
                  {attentionItems.critical_parts.slice(0, 2).map((part) => (
                    <div key={part.id} className="text-xs p-1.5 rounded bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <span className="font-bold text-slate-900 dark:text-white truncate block">{part.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Sisa: <strong className="text-rose-600">{part.stock} {part.unit}</strong> (Min: {part.min_stock})</span>
                      </div>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Halo Supplier, kami dari ${workshopName} ingin memesan restock sparepart: ${part.name} (SKU: ${part.sku}). Mohon info stok & harga.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-target px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0 hover:bg-emerald-100"
                        title="Pesan via WhatsApp ke supplier"
                      >
                        Pesan WA
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-1">
                  Semua suku cadang berada di atas batas minimum.
                </p>
              )}
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('mutations')}
              className="touch-target mt-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700"
            >
              <span>Buka Menu Restock Barang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Kendaraan Selesai Siap Diambil */}
          <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Siap Diambil Pemilik ({attentionItems.ready_pickup?.length || 0})</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                  Selesai
                </span>
              </div>
              {attentionItems.ready_pickup && attentionItems.ready_pickup.length > 0 ? (
                <div className="space-y-1.5">
                  {attentionItems.ready_pickup.slice(0, 2).map((item) => (
                    <div key={item.id} className="text-xs p-1.5 rounded bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="min-w-0 pr-1">
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{item.plate_number}</span>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] truncate">{item.customer_name}</span>
                      </div>
                      {item.customer_phone && (
                        <a
                          href={`https://wa.me/${item.customer_phone.replace(/^0/, '62').replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${item.customer_name}, kendaraan Anda (${item.plate_number}) di ${workshopName} telah selesai diservis dan siap diambil.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="touch-target px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold shrink-0 hover:bg-blue-100"
                          title="Kirim pengingat WhatsApp ke pemilik mobil"
                        >
                          Hubungi WA
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-1">
                  Tidak ada mobil berstatus selesai yang tertunda pengambilan.
                </p>
              )}
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('repair-orders')}
              className="touch-target mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700"
            >
              <span>Buka Daftar Pengambilan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 6. Live Workshop Bays & Stall Radar (Delight: Lantai Bengkel Fisik Kediri) */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <span>Radar Bay & Lantai Kerja Bengkel (Sambiresik)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualisasi kapasitas stall servis dan teknisi yang sedang aktif mengerjakan mobil.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {activeBays.length} Kendaraan Dalam Penanganan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { bayNum: 1, title: 'Bay 1: Lift Servis Mesin & Overhaul', defaultMekanik: 'Mas Hendra' },
            { bayNum: 2, title: 'Bay 2: Tune-up, Injeksi & Kelistrikan', defaultMekanik: 'Mas Agus' },
            { bayNum: 3, title: 'Bay 3: Kaki-kaki, Rem & Spooring', defaultMekanik: 'Pak Joko' }
          ].map((stall, idx) => {
            const activeCar = activeBays[idx];
            return (
              <div 
                key={stall.bayNum} 
                className={`p-3.5 rounded border transition-colors ${
                  activeCar 
                    ? 'border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {stall.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    activeCar 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {activeCar ? 'Terisi' : 'Tersedia'}
                  </span>
                </div>

                {activeCar ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                        {activeCar.plate_number}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold">
                        {activeCar.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {activeCar.car_brand} {activeCar.car_model} • {activeCar.customer_name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mekanik PIC: <strong>{activeCar.mechanic_name || stall.defaultMekanik}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-slate-400 dark:text-slate-500">
                    Stall kosong • Siap menerima kendaraan masuk baru
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Main Charts Row: Pure SVG RO Status Donut Chart & 30-Day Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Pure SVG RO Status Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <PieChartIcon className="w-4 h-4 text-blue-600" />
                <span>Distribusi Status Repair Order</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {totalRos} Total Servis
              </span>
            </div>

            {/* SVG Donut Visual */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    className="stroke-slate-100 dark:stroke-slate-700 fill-none"
                    strokeWidth="16"
                  />
                  {/* Segments */}
                  {totalRos > 0 ? (
                    statusList.map((item) => {
                      const count = Number(item.count) || 0;
                      if (count === 0) return null;
                      const segmentPercent = count / totalRos;
                      const strokeDasharray = `${segmentPercent * donutCircumference} ${donutCircumference}`;
                      const strokeDashoffset = -(accumulatedPercent * donutCircumference);
                      accumulatedPercent += segmentPercent;

                      return (
                        <circle
                          key={item.status}
                          cx="80"
                          cy="80"
                          r={donutRadius}
                          fill="none"
                          stroke={item.color}
                          strokeWidth="16"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="butt"
                        />
                      );
                    })
                  ) : (
                    <circle
                      cx="80"
                      cy="80"
                      r={donutRadius}
                      className="stroke-slate-200 dark:stroke-slate-700 fill-none"
                      strokeWidth="16"
                    />
                  )}
                </svg>

                {/* Donut Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="tabular-nums text-2xl font-black text-slate-900 dark:text-white">
                    {summary.active_ros}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Aktif
                  </span>
                </div>
              </div>

              {/* Status List Legend & Bars */}
              <div className="flex-1 w-full space-y-2">
                {statusList.map((item) => {
                  const count = Number(item.count) || 0;
                  const pct = totalRos > 0 ? Math.round((count / totalRos) * 100) : 0;
                  return (
                    <div key={item.status} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                          <span 
                            className="w-2.5 h-2.5 rounded-sm shrink-0" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate" title={item.label}>
                            {item.label}
                          </span>
                        </div>
                        <span className="tabular-nums font-mono text-slate-900 dark:text-white font-semibold ml-2 shrink-0">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded overflow-hidden">
                        <div 
                          className="h-full rounded" 
                          style={{ width: `${pct}%`, backgroundColor: item.color }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => onNavigateTab && onNavigateTab('repair-orders')}
              className="touch-target w-full py-2 px-3 rounded bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center space-x-1.5"
            >
              <span>Buka Manajemen Repair Order</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Pure SVG 30-Day Revenue Trend Line Chart with Touch Scrub (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-3 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Tren Arus Kas 30 Hari Terakhir</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ketuk titik grafik untuk melihat rincian pemasukan & pengeluaran harian
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Pemasukan</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Pengeluaran</span>
                </div>
              </div>
            </div>

            {/* Interactive Active Point Preview Bar (Delight: Touch-friendly Mobile Scrub) */}
            {activeTrendPoint && (
              <div className="mb-3 px-3 py-2 rounded bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  📅 Tanggal: {formatDateDisplay(activeTrendPoint.date)}
                </span>
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                    Masuk: +{formatRupiah(activeTrendPoint.revenue)}
                  </span>
                  <span className="text-rose-700 dark:text-rose-300 font-bold">
                    Keluar: -{formatRupiah(activeTrendPoint.expense)}
                  </span>
                </div>
              </div>
            )}

            {/* Pure SVG Responsive Line Chart */}
            <div className="w-full overflow-hidden">
              <svg 
                className="w-full h-44" 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                {/* Horizontal Grid lines */}
                <line 
                  x1="20" y1={chartPaddingTop} 
                  x2={chartWidth - 20} y2={chartPaddingTop} 
                  className="stroke-slate-100 dark:stroke-slate-700" 
                  strokeDasharray="4 4"
                />
                <line 
                  x1="20" y1={chartPaddingTop + chartUsableHeight / 2} 
                  x2={chartWidth - 20} y2={chartPaddingTop + chartUsableHeight / 2} 
                  className="stroke-slate-100 dark:stroke-slate-700" 
                  strokeDasharray="4 4"
                />
                <line 
                  x1="20" y1={chartHeight - chartPaddingBottom} 
                  x2={chartWidth - 20} y2={chartHeight - chartPaddingBottom} 
                  className="stroke-slate-200 dark:stroke-slate-600" 
                />

                {/* Filled Area beneath the revenue trend line */}
                {trendPoints.length > 0 && (
                  <polygon 
                    points={svgAreaPoints} 
                    className="fill-emerald-500/10 dark:fill-emerald-500/20" 
                  />
                )}

                {/* Expense Polyline (Rose dashed) */}
                {trendPoints.length > 0 && (
                  <polyline
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={svgPolylineExpense}
                  />
                )}

                {/* Revenue Polyline (Emerald solid) */}
                {trendPoints.length > 0 && (
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={svgPolylinePoints}
                  />
                )}

                {/* Interactive Data Points (Touch and Mouse Hover Friendly) */}
                {trendPoints.map((pt, i) => (
                  <g 
                    key={i} 
                    className="cursor-pointer"
                    onClick={() => setActiveTrendPoint(revenueTrend[i])}
                    onMouseEnter={() => setActiveTrendPoint(revenueTrend[i])}
                  >
                    {pt.rev > 0 && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={activeTrendPoint?.date === pt.date ? "5.5" : "3.5"}
                        className="fill-emerald-600 stroke-white dark:stroke-slate-900 transition-all"
                        strokeWidth="1.5"
                      />
                    )}
                    {pt.exp > 0 && (
                      <circle
                        cx={pt.x}
                        cy={pt.yExp}
                        r={activeTrendPoint?.date === pt.date ? "5" : "3"}
                        className="fill-rose-500 stroke-white dark:stroke-slate-900 transition-all"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                ))}

                {/* Date Labels across the bottom axis (Formatted with Indonesian Month) */}
                {trendPoints.filter((_, i) => i % 5 === 0 || i === trendPoints.length - 1).map((pt, idx) => (
                  <text
                    key={idx}
                    x={pt.x}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 dark:fill-slate-400 font-sans"
                  >
                    {formatDateShort(pt.date)}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <span>Total Pemasukan Bulan Ini: <strong className="tabular-nums text-slate-900 dark:text-white font-mono font-bold">{formatRupiah(summary.monthly_revenue)}</strong></span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('finance')}
              className="touch-target font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Buka Buku Kas & Laporan Keuangan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 8. Bottom Row: Top 5 Spareparts & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Spareparts Table (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Top 5 Sparepart Terlaris & Digunakan</span>
              </h2>
              <button
                onClick={() => onNavigateTab && onNavigateTab('inventory')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Lihat Semua
              </button>
            </div>

            {topSpareparts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                Belum ada data pemakaian sparepart pada repair order atau mutasi keluar.
              </div>
            ) : (
              <div>
                {/* Mobile Top Spareparts List (< 640px) */}
                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-700/60">
                  {topSpareparts.map((part, index) => (
                    <div key={part.id || index} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {part.name}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{part.sku}</span>
                          <span>•</span>
                          <span className="font-sans px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {part.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="tabular-nums font-mono font-bold text-slate-900 dark:text-white">
                          {part.total_used} {part.unit || 'pcs'}
                        </div>
                        <div className="tabular-nums text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(part.total_revenue || (part.total_used * (part.sell_price || 0)))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= 640px) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        <th className="pb-2 font-semibold">Sparepart</th>
                        <th className="pb-2 font-semibold text-center">Kategori</th>
                        <th className="pb-2 font-semibold text-center">Terpakai</th>
                        <th className="pb-2 font-semibold text-right">Nilai Jual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {topSpareparts.map((part, index) => (
                        <tr key={part.id || index} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="py-2.5 pr-2">
                            <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[180px]">
                              {part.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {part.sku}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                              {part.category}
                            </span>
                          </td>
                          <td className="tabular-nums py-2.5 px-2 text-center font-mono font-bold text-slate-900 dark:text-white">
                            {part.total_used} {part.unit || 'pcs'}
                          </td>
                          <td className="tabular-nums py-2.5 pl-2 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(part.total_revenue || (part.total_used * (part.sell_price || 0)))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => onNavigateTab && onNavigateTab('inventory')}
              className="touch-target w-full py-2 px-3 rounded bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-1"
            >
              <span>Buka Inventaris & Tambah Suku Cadang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Recent Activity Feed (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Aktivitas Terbaru Bengkel</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                10 Peristiwa Terkini
              </span>
            </div>

            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                Belum ada catatan aktivitas servis maupun transaksi keuangan.
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => {
                  const isRo = act.type === 'RO';
                  const isIncome = act.type === 'INCOME';
                  return (
                    <div 
                      key={act.id} 
                      className="p-2.5 rounded bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/60 flex items-start space-x-3 text-xs"
                    >
                      <div className={`w-7 h-7 rounded shrink-0 flex items-center justify-center mt-0.5 ${
                        isRo 
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300' 
                          : isIncome 
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300' 
                            : 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
                      }`}>
                        {isRo ? (
                          <Wrench className="w-3.5 h-3.5" />
                        ) : isIncome ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {act.title}
                          </span>
                          {act.amount !== null && (
                            <span className={`tabular-nums font-mono font-bold ${
                              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                              {isIncome ? '+' : '-'}{formatRupiah(act.amount)}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 truncate">
                          {act.description}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                          {formatDateDisplay(act.timestamp)} {formatTimeDisplay(act.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Audit trail otomatis dari database</span>
            <button
              onClick={() => onNavigateTracking && onNavigateTracking()}
              className="touch-target text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Buka Portal Pelacakan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 9. Workshop Omnibox & Command Palette Modal (Ctrl+K or /) */}
      {quickActionOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-4 bg-slate-950/60">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-none overflow-hidden relative">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Cari Plat Nomor (AG...), servis, atau aksi cepat..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedActionIndex(0);
                }}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={() => setQuickActionOpen(false)}
                className="touch-target p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-700/60">
              {combinedSearchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                  Tidak ditemukan hasil untuk "{searchQuery}".
                </div>
              ) : (
                combinedSearchResults.map((item, i) => {
                  const Icon = item.icon;
                  const isSelected = i === selectedActionIndex;
                  return (
                    <button
                      key={i}
                      onClick={item.action}
                      className={`touch-target w-full text-left p-3 rounded flex items-center space-x-3 transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                        item.type === 'VEHICLE' 
                          ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
                          : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white block truncate">
                            {item.label}
                          </span>
                          {item.type === 'VEHICLE' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-mono font-bold">
                              KENDARAAN
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                          {item.desc}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-700/40 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <span>Gunakan panah</span>
                <kbd className="font-mono text-[10px] bg-slate-200 dark:bg-slate-600 px-1 rounded">↑</kbd>
                <kbd className="font-mono text-[10px] bg-slate-200 dark:bg-slate-600 px-1 rounded">↓</kbd>
                <span>dan Enter untuk memilih</span>
              </span>
              <kbd className="font-mono text-[10px] bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
