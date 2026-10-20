import React, { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Share2,
  ChevronRight,
  ExternalLink,
  User,
  Phone,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import RepairOrderDetailPage from './RepairOrderDetailPage';

const STAGE_TABS = [
  { key: 'ALL', label: 'Semua Order' },
  { key: 'MASUK', label: 'Masuk' },
  { key: 'DIAGNOSA', label: 'Diagnosa' },
  { key: 'PENGERJAAN', label: 'Pengerjaan' },
  { key: 'MENUNGGU_PART', label: 'Tunggu Part' },
  { key: 'SELESAI', label: 'Selesai' },
  { key: 'DIAMBIL', label: 'Diambil' }
];

const STAGE_COLORS = {
  'MASUK': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
  'DIAGNOSA': 'bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
  'PENGERJAAN': 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
  'MENUNGGU_PART': 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
  'SELESAI': 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
  'DIAMBIL': 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
};

export default function RepairOrdersPage() {
  const [selectedRoId, setSelectedRoId] = useState(null);
  const [repairOrders, setRepairOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    masuk: 0,
    diagnosa: 0,
    pengerjaan: 0,
    menunggu_part: 0,
    selesai: 0,
    diambil: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [activeStage, setActiveStage] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Modal Create RO
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    platNomor: '',
    namaPemilik: '',
    noHp: '',
    merekModel: '',
    tahun: '',
    warna: '',
    odometerMasuk: '',
    tanggalMasuk: new Date().toISOString().slice(0, 10),
    keluhan: '',
    mekanikPj: 'Mas Agus Santoso',
    biayaJasa: 150000,
    estimasiSelesai: ''
  });

  // Dynamic form options for cars, colors, mechanics
  const [formOptions, setFormOptions] = useState({ cars: [], colors: [], mechanics: [] });

  const fetchFormOptions = async () => {
    try {
      const res = await fetch('/api/repair-orders/form-options', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFormOptions({
          cars: data.cars || [],
          colors: data.colors || [],
          mechanics: data.mechanics || []
        });
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchFormOptions();
  }, []);

  const setEstimatedPreset = (presetKey) => {
    const target = new Date();
    if (presetKey === 'today_17') {
      target.setHours(17, 0, 0, 0);
      if (target <= new Date()) {
        target.setDate(target.getDate() + 1);
      }
    } else if (presetKey === 'tomorrow_12') {
      target.setDate(target.getDate() + 1);
      target.setHours(12, 0, 0, 0);
    } else if (presetKey === 'tomorrow_17') {
      target.setDate(target.getDate() + 1);
      target.setHours(17, 0, 0, 0);
    } else if (presetKey === 'in_2_days') {
      target.setDate(target.getDate() + 2);
      target.setHours(17, 0, 0, 0);
    } else if (presetKey === 'in_3_days') {
      target.setDate(target.getDate() + 3);
      target.setHours(17, 0, 0, 0);
    }
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const mins = String(target.getMinutes()).padStart(2, '0');
    setFormData(prev => ({ ...prev, estimasiSelesai: `${year}-${month}-${day}T${hours}:${mins}` }));
  };

  // Autocomplete state
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const fetchRepairOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (activeStage !== 'ALL') params.set('status', activeStage);
      params.set('page', page);
      params.set('limit', 20);

      const res = await fetch(`/api/repair-orders?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Gagal mengambil daftar Repair Orders');
      }
      const data = await res.json();
      setRepairOrders(data.repair_orders || data.items || []);
      if (data.pagination) setPagination(data.pagination);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, activeStage, page]);

  useEffect(() => {
    fetchRepairOrders();
  }, [fetchRepairOrders]);

  // Autocomplete customer search
  const handleCustomerQueryChange = async (val) => {
    setFormData(prev => ({ ...prev, namaPemilik: val }));
    if (val.trim().length >= 2) {
      setSuggestLoading(true);
      try {
        const res = await fetch(`/api/customers/search?q=${encodeURIComponent(val.trim())}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCustomerSuggestions(data.customers || []);
        }
      } catch {
        // Ignore
      } finally {
        setSuggestLoading(false);
      }
    } else {
      setCustomerSuggestions([]);
    }
  };

  const handleSelectCustomer = (c) => {
    setFormData(prev => {
      const v = c.vehicles && c.vehicles[0];
      return {
        ...prev,
        namaPemilik: c.name,
        noHp: c.phone || '',
        platNomor: v ? v.plate_number : prev.platNomor,
        merekModel: v ? `${v.brand || ''} ${v.model || ''}`.trim() : prev.merekModel,
        tahun: v && v.year ? String(v.year) : prev.tahun,
        warna: v && v.color ? v.color : prev.warna
      };
    });
    setCustomerSuggestions([]);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.platNomor.trim() || !formData.namaPemilik.trim()) {
      alert('Plat nomor dan Nama pemilik wajib diisi!');
      return;
    }

    try {
      setCreateSubmitting(true);
      const res = await fetch('/api/repair-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          biayaJasa: Number(formData.biayaJasa || 0),
          odometerMasuk: Number(formData.odometerMasuk || 0),
          tahun: formData.tahun ? Number(formData.tahun) : null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Gagal membuat Repair Order');
      }

      const created = await res.json();
      setCreateModalOpen(false);
      // Reset form
      setFormData({
        platNomor: '',
        namaPemilik: '',
        noHp: '',
        merekModel: '',
        tahun: '',
        warna: '',
        odometerMasuk: '',
        tanggalMasuk: new Date().toISOString().slice(0, 10),
        keluhan: '',
        mekanikPj: 'Mas Agus Santoso',
        biayaJasa: 150000,
        estimasiSelesai: ''
      });
      fetchRepairOrders();
      if (created.id) {
        setSelectedRoId(created.id);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCreateSubmitting(false);
    }
  };

  if (selectedRoId) {
    return (
      <RepairOrderDetailPage
        roId={selectedRoId}
        onBack={() => {
          setSelectedRoId(null);
          fetchRepairOrders();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total RO */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Repair Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white block">
              {stats.total}
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1 block">
              Semua status terdata
            </span>
          </div>
        </div>

        {/* 2. Diagnosa */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pemeriksaan & Diagnosa
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-sky-600 dark:text-sky-400 block">
              {(stats.masuk || 0) + (stats.diagnosa || 0)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Masuk ({stats.masuk || 0}) • Diagnosa ({stats.diagnosa || 0})
            </span>
          </div>
        </div>

        {/* 3. Pengerjaan */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Dalam Pengerjaan
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-600 dark:text-amber-400 block">
              {(stats.pengerjaan || 0) + (stats.menunggu_part || 0)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Proses ({stats.pengerjaan || 0}) • Tunggu Part ({stats.menunggu_part || 0})
            </span>
          </div>
        </div>

        {/* 4. Selesai */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Selesai Siap Diambil
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 block">
              {stats.selesai || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Sudah Diambil ({stats.diambil || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar & Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Repair Orders & Servis Kendaraan
              </h2>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                {stats.total || 0} Order Terdata
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola siklus servis 6-tahap, pemasangan suku cadang, foto pengerjaan, dan pencetakan nota PDF
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="touch-target w-full sm:w-auto px-5 py-2.5 bg-[#00a86b] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors shadow-xs shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Buat RO Baru</span>
          </button>
        </div>

        {/* Search Bar & Stage Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari plat nomor, nama pelanggan, no. RO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-base sm:text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-colors min-h-[44px] sm:min-h-0"
            />
          </div>

          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 min-w-full sm:min-w-0">
              {STAGE_TABS.map((tab) => {
                const isActive = activeStage === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveStage(tab.key);
                      setPage(1);
                    }}
                    className={`touch-target px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all min-h-[38px] flex items-center ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Repair Orders List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500">Memuat data order perbaikan...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-500 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : repairOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            Tidak ada Repair Order yang cocok dengan filter.
          </div>
        ) : (
          <div>
            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {repairOrders.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedRoId(item.id)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer space-y-2.5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="font-mono bg-slate-900 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold border border-slate-700 shrink-0">
                        {item.plate_number}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                        {item.car_brand} {item.car_model}
                      </span>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${STAGE_COLORS[item.status] || 'bg-slate-100 text-slate-800'}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="truncate">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.customer_name}</span>
                      {item.customer_phone && <span className="font-mono ml-1.5 text-xs">({item.customer_phone})</span>}
                    </div>
                    <span className="text-xs shrink-0 font-mono">{item.entry_date}</span>
                  </div>

                  {item.complaint && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="line-clamp-2">{item.complaint}</p>
                      <span className="block text-xs text-slate-400 mt-1">PJ: {item.mechanic_name || 'Mas Agus'}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">Total Biaya</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                        Rp {Number(item.total_cost || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedRoId(item.id)}
                        className="touch-target px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-emerald-400 rounded-lg text-xs font-bold border border-slate-700/60 shadow-xs transition-colors"
                      >
                        Kelola
                      </button>
                      <button
                        onClick={() => window.open(`/api/repair-orders/${item.id}/invoice-pdf`, '_blank')}
                        className="touch-target p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors"
                        title="Cetak PDF"
                      >
                        <FileText className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Kendaraan & Plat</th>
                    <th className="py-3.5 px-4">Pelanggan</th>
                    <th className="py-3.5 px-4">Keluhan Awal</th>
                    <th className="py-3.5 px-4">Status Tahapan</th>
                    <th className="py-3.5 px-4 text-right">Total Biaya</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {repairOrders.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedRoId(item.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono bg-slate-900 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold border border-slate-700">
                            {item.plate_number}
                          </span>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.car_brand} {item.car_model}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.ro_number} • Tgl: {item.entry_date}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.customer_name}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {item.customer_phone || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                        {item.complaint || '-'}
                        <span className="block text-xs text-slate-400">PJ: {item.mechanic_name || 'Mas Agus'}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${STAGE_COLORS[item.status] || 'bg-slate-100 text-slate-800'}`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold font-mono text-slate-900 dark:text-white">
                        Rp {Number(item.total_cost || 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setSelectedRoId(item.id)}
                            className="touch-target px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-emerald-400 rounded-lg text-xs font-bold border border-slate-700/60 shadow-xs transition-colors"
                          >
                            Kelola
                          </button>
                          <button
                            onClick={() => window.open(`/api/repair-orders/${item.id}/invoice-pdf`, '_blank')}
                            className="touch-target p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors"
                            title="Cetak PDF"
                          >
                            <FileText className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Buat Repair Order Baru */}
      {createModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
          onClick={() => setCreateModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Buat Repair Order Servis Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="w-9 h-9 touch-target flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Autocomplete Customer Field */}
              <div className="relative">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pemilik / Pelanggan *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ketik nama pelanggan untuk autocomplete..."
                    value={formData.namaPemilik}
                    onChange={(e) => handleCustomerQueryChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {customerSuggestions.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {customerSuggestions.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className="p-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">{c.phone}</span>
                        </div>
                        {c.vehicles && c.vehicles.length > 0 && (
                          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {c.vehicles[0].plate_number}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No. Handphone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="081234567890"
                      value={formData.noHp}
                      onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plat Nomor Kendaraan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AG 1822 AB"
                    value={formData.platNomor}
                    onChange={(e) => setFormData({ ...formData, platNomor: e.target.value.toUpperCase() })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Merek & Model Mobil
                    </label>
                    <span className="text-xs text-slate-400">Pilih riwayat atau ketik manual</span>
                  </div>
                  <div className="space-y-1.5">
                    {/* Dropdown pilihan mobil yang pernah ditangani tenant */}
                    <select
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const val = e.target.value;
                        const matched = formOptions.cars.find(c => `${c.brand} ${c.model}`.trim() === val);
                        setFormData(prev => ({
                          ...prev,
                          merekModel: val,
                          tahun: (matched && matched.year && !prev.tahun) ? String(matched.year) : prev.tahun,
                          warna: (matched && matched.color && !prev.warna) ? matched.color : prev.warna
                        }));
                      }}
                      defaultValue=""
                      className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">▼ Pilih mobil dari riwayat bengkel...</option>
                      {formOptions.cars.filter(c => c.isHandled).length > 0 && (
                        <optgroup label="Pernah Diservis di Bengkel Ini">
                          {formOptions.cars.filter(c => c.isHandled).map((c, i) => (
                            <option key={`handled-${i}`} value={`${c.brand} ${c.model}`.trim()}>
                              {c.brand} {c.model} {c.count ? `(${c.count}x riwayat)` : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Model Populer Lainnya">
                        {formOptions.cars.filter(c => !c.isHandled).map((c, i) => (
                          <option key={`pop-${i}`} value={`${c.brand} ${c.model}`.trim()}>
                            {c.brand} {c.model}
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    {/* Input manual dengan datalist */}
                    <input
                      type="text"
                      list="ro-cars-datalist"
                      placeholder="Atau ketik merek & jenis manual (misal: Toyota Avanza 1.3 G)"
                      value={formData.merekModel}
                      onChange={(e) => setFormData({ ...formData, merekModel: e.target.value })}
                      className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 text-slate-900 dark:text-white"
                    />
                    <datalist id="ro-cars-datalist">
                      {formOptions.cars.map((c, i) => (
                        <option key={i} value={`${c.brand} ${c.model}`.trim()} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Tahun Kendaraan
                  </label>
                  <input
                    type="number"
                    placeholder="2019"
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                    className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Warna Mobil
                    </label>
                    <span className="text-xs text-slate-400">Pilih / ketik</span>
                  </div>
                  <div className="space-y-1.5">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData(prev => ({ ...prev, warna: e.target.value }));
                        }
                      }}
                      defaultValue=""
                      className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">▼ Pilih dari daftar warna...</option>
                      {formOptions.colors.map((color, i) => (
                        <option key={i} value={color}>{color}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      list="ro-colors-datalist"
                      placeholder="Atau ketik warna manual..."
                      value={formData.warna}
                      onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                      className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 text-slate-900 dark:text-white"
                    />
                    <datalist id="ro-colors-datalist">
                      {formOptions.colors.map((color, i) => (
                        <option key={i} value={color} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Odometer Masuk (km)
                  </label>
                  <input
                    type="number"
                    placeholder="65420"
                    value={formData.odometerMasuk}
                    onChange={(e) => setFormData({ ...formData, odometerMasuk: e.target.value })}
                    className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Tanggal Masuk
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalMasuk}
                    onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })}
                    className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                  Keluhan Pelanggan / Permintaan Servis *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Mesin brebet saat akselerasi dan AC kurang dingin"
                  value={formData.keluhan}
                  onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                  className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Mekanik PJ
                    </label>
                    <span className="text-xs text-slate-400">Pilih / ketik</span>
                  </div>
                  <div className="space-y-1.5">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData(prev => ({ ...prev, mekanikPj: e.target.value }));
                        }
                      }}
                      defaultValue=""
                      className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">▼ Pilih nama mekanik...</option>
                      {formOptions.mechanics.map((mech, i) => (
                        <option key={i} value={mech}>{mech}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      list="ro-mechanics-datalist"
                      placeholder="Atau ketik nama mekanik manual..."
                      value={formData.mekanikPj}
                      onChange={(e) => setFormData({ ...formData, mekanikPj: e.target.value })}
                      className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 text-slate-900 dark:text-white"
                    />
                    <datalist id="ro-mechanics-datalist">
                      {formOptions.mechanics.map((mech, i) => (
                        <option key={i} value={mech} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                    Biaya Jasa Awal (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.biayaJasa}
                    onChange={(e) => setFormData({ ...formData, biayaJasa: e.target.value })}
                    className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Estimasi Selesai (Date Picker)
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="datetime-local"
                      value={formData.estimasiSelesai}
                      onChange={(e) => setFormData({ ...formData, estimasiSelesai: e.target.value })}
                      className="w-full p-2 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 text-slate-900 dark:text-white font-mono"
                    />
                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setEstimatedPreset('today_17')}
                        className="touch-target px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Hari ini 17:00
                      </button>
                      <button
                        type="button"
                        onClick={() => setEstimatedPreset('tomorrow_12')}
                        className="touch-target px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Besok 12:00
                      </button>
                      <button
                        type="button"
                        onClick={() => setEstimatedPreset('tomorrow_17')}
                        className="touch-target px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Besok 17:00
                      </button>
                      <button
                        type="button"
                        onClick={() => setEstimatedPreset('in_2_days')}
                        className="touch-target px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        2 Hari Lagi
                      </button>
                      {formData.estimasiSelesai && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, estimasiSelesai: '' })}
                          className="touch-target text-xs text-rose-500 hover:underline px-1 py-0.5"
                          title="Hapus estimasi"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer pinned at bottom, shrink-0 */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="touch-target px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={createSubmitting}
                className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
              >
                {createSubmitting ? 'Menyimpan...' : 'Buat Repair Order'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
}
