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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({ onNavigateTab, onOpenSettings, onNavigateLanding, onNavigateTracking }) {
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

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

  // Desktop keyboard shortcuts: '/' to focus search, 'Ctrl+K' or 'Cmd+K' for quick action modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input or textarea (except for Escape)
      const targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setQuickActionOpen(prev => !prev);
        return;
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (quickActionOpen) {
          setQuickActionOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickActionOpen]);

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
  const chartHeight = 160;
  const chartPaddingTop = 20;
  const chartPaddingBottom = 30;
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
    { label: 'Buat Repair Order Baru', icon: Wrench, action: () => { setQuickActionOpen(false); onNavigateTab('repair-orders'); }, desc: 'Input servis mobil baru' },
    { label: 'Catat Transaksi Keuangan', icon: Wallet, action: () => { setQuickActionOpen(false); onNavigateTab('finance'); }, desc: 'Pemasukan atau pengeluaran kas' },
    { label: 'Tambah Stok Masuk', icon: ArrowDownUp, action: () => { setQuickActionOpen(false); onNavigateTab('mutations'); }, desc: 'Restock / pembelian sparepart' },
    { label: 'Stok Opname Fisik', icon: ClipboardCheck, action: () => { setQuickActionOpen(false); onNavigateTab('opname'); }, desc: 'Sinkronisasi stok sistem & fisik' },
    { label: 'Katalog Sparepart & Inventaris', icon: Layers, action: () => { setQuickActionOpen(false); onNavigateTab('inventory'); }, desc: 'Cari & kelola inventaris barang' },
    { label: 'Database CRM Pelanggan', icon: Users, action: () => { setQuickActionOpen(false); onNavigateTab('customers'); }, desc: 'Data kontak & histori pelanggan' },
    { label: 'Pengaturan Profil Bengkel', icon: Settings, action: () => { setQuickActionOpen(false); onOpenSettings(); }, desc: 'Nama, alamat, jam operasional' }
  ];

  const filteredQuickActions = quickActions.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar / Quick Action Banner */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Ringkasan Eksekutif & Operasional</span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
              Live Real-Time
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoring performa harian servis, arus kas, dan ketersediaan suku cadang bengkel.
          </p>
        </div>

        {/* Search Bar & Shortcut Button */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari atau tekan /"
              onFocus={() => setQuickActionOpen(true)}
              className="w-full pl-9 pr-8 py-2 rounded text-xs border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-500">
              /
            </kbd>
          </div>

          <button
            onClick={() => setQuickActionOpen(true)}
            className="touch-target px-3 py-2 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1.5"
            title="Buka menu cepat (Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Aksi Cepat</span>
            <kbd className="hidden sm:inline text-[10px] font-mono bg-slate-200 dark:bg-slate-600 px-1 rounded">⌘K</kbd>
          </button>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="touch-target p-2 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center justify-center"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Mobil Masuk Hari Ini */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('repair-orders')}
          className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mobil Masuk Hari Ini
            </span>
            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.cars_entered_today}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">unit</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Servis Aktif: <strong>{summary.active_ros}</strong> mobil</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Card 2: Pendapatan Bulan Ini */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('finance')}
          className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pendapatan Bulan Ini
            </span>
            <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate" title={formatRupiah(summary.monthly_revenue)}>
              {formatRupiah(summary.monthly_revenue)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Target {formatRupiah(summary.monthly_target)}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{summary.target_progress_percent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded transition-all duration-500" 
                style={{ width: `${Math.min(100, summary.target_progress_percent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Servis Sedang Berjalan */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('repair-orders')}
          className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Servis Aktif Berjalan
            </span>
            <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {summary.active_ros}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">kendaraan</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Selesai hari ini: <strong>{summary.completed_ros_today}</strong> unit</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Card 4: Sparepart Kritis */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('inventory')}
          className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-rose-400 dark:hover:border-rose-600 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
            <span className={`text-2xl sm:text-3xl font-extrabold ${
              summary.low_stock_count > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              {summary.low_stock_count}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">SKU menipis</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Habis total: <strong>{summary.out_of_stock_count}</strong> SKU</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Charts Row: Pure SVG RO Status Donut Chart & 30-Day Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pure SVG RO Status Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <PieChartIcon className="w-4 h-4 text-blue-600" />
                <span>Distribusi Status Repair Order</span>
              </h3>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {totalRos} Total RO
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
                    statusList.map((item, index) => {
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
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {summary.active_ros}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
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
                        <div className="flex items-center space-x-1.5 truncate">
                          <span 
                            className="w-2.5 h-2.5 rounded-sm shrink-0" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className="font-mono text-slate-900 dark:text-white font-semibold ml-2">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded overflow-hidden">
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

        {/* Right: Pure SVG 30-Day Revenue Trend Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Tren Arus Kas 30 Hari Terakhir</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Agregasi harian arus kas masuk (servis/part) vs pengeluaran operasional
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

                {/* Data Points */}
                {trendPoints.map((pt, i) => (
                  <g key={i}>
                    {pt.rev > 0 && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        className="fill-emerald-600 stroke-white dark:stroke-slate-900"
                        strokeWidth="1.5"
                      >
                        <title>{`${pt.date} - Pemasukan: ${formatRupiah(pt.rev)}`}</title>
                      </circle>
                    )}
                    {pt.exp > 0 && (
                      <circle
                        cx={pt.x}
                        cy={pt.yExp}
                        r="3"
                        className="fill-rose-500 stroke-white dark:stroke-slate-900"
                        strokeWidth="1.5"
                      >
                        <title>{`${pt.date} - Pengeluaran: ${formatRupiah(pt.exp)}`}</title>
                      </circle>
                    )}
                  </g>
                ))}

                {/* Date Labels across the bottom axis */}
                {trendPoints.filter((_, i) => i % 6 === 0 || i === trendPoints.length - 1).map((pt, idx) => (
                  <text
                    key={idx}
                    x={pt.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {pt.date.slice(5)}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Bulan Ini: <strong className="text-slate-900 dark:text-white font-mono">{formatRupiah(summary.monthly_revenue)}</strong></span>
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

      {/* Bottom Row: Top 5 Spareparts & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Spareparts Table (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Top 5 Sparepart Paling Laris & Digunakan</span>
              </h3>
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
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {part.total_used} {part.unit || 'pcs'}
                        </div>
                        <div className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
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
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900 dark:text-white">
                            {part.total_used} {part.unit || 'pcs'}
                          </td>
                          <td className="py-2.5 pl-2 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
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
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Aktivitas Terbaru Bengkel</span>
              </h3>
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
                            <span className={`font-mono font-bold ${
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

      {/* Quick Action / Command Palette Modal (Ctrl+K) */}
      {quickActionOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-none overflow-hidden relative">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Ketik aksi atau navigasi cepat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={() => setQuickActionOpen(false)}
                className="touch-target p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredQuickActions.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                  Tidak ditemukan aksi dengan kata kunci "{searchQuery}"
                </div>
              ) : (
                filteredQuickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      onClick={action.action}
                      className="touch-target w-full text-left p-3 rounded hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center space-x-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                          {action.label}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {action.desc}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-700/40 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Gunakan tombol panah atau klik untuk memilih</span>
              <kbd className="font-mono text-[10px] bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">ESC to close</kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
