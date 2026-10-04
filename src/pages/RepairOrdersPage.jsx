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
  'MASUK': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600',
  'DIAGNOSA': 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 border-sky-300 dark:border-sky-800',
  'PENGERJAAN': 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  'MENUNGGU_PART': 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
  'SELESAI': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  'DIAMBIL': 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 border-zinc-400 dark:border-zinc-600'
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 font-medium block">Total Repair Orders</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {stats.total}
          </span>
          <span className="text-[11px] text-blue-600 font-medium">Semua status order</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 font-medium block">Pemeriksaan & Diagnosa</span>
          <span className="text-2xl font-bold text-sky-600 mt-1 block">
            {(stats.masuk || 0) + (stats.diagnosa || 0)}
          </span>
          <span className="text-[11px] text-slate-500">Masuk ({stats.masuk}) • Diagnosa ({stats.diagnosa})</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 font-medium block">Dalam Pengerjaan</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {(stats.pengerjaan || 0) + (stats.menunggu_part || 0)}
          </span>
          <span className="text-[11px] text-slate-500">Proses ({stats.pengerjaan}) • Tunggu Part ({stats.menunggu_part})</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 font-medium block">Selesai Siap Diambil</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {stats.selesai || 0}
          </span>
          <span className="text-[11px] text-slate-500">Sudah Diambil ({stats.diambil || 0})</span>
        </div>
      </div>

      {/* Action Bar & Controls */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <span>Repair Orders & Servis Kendaraan</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola siklus servis 6-tahap, pemasangan suku cadang, foto pengerjaan, dan pencetakan nota PDF
            </p>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center justify-center space-x-2 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Buat RO Baru</span>
          </button>
        </div>

        {/* Search Bar & Stage Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari plat nomor, nama pelanggan, no. RO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {STAGE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveStage(tab.key);
                  setPage(1);
                }}
                className={`touch-target px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors ${
                  activeStage === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Repair Orders List Table */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500">Memuat data order perbaikan...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : repairOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada Repair Order yang cocok dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Kendaraan & Plat</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Keluhan Awal</th>
                  <th className="py-3 px-4">Status Tahapan</th>
                  <th className="py-3 px-4 text-right">Total Biaya</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {repairOrders.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedRoId(item.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono bg-slate-900 text-white px-2 py-0.5 rounded text-xs font-bold">
                          {item.plate_number}
                        </span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.car_brand} {item.car_model}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.ro_number} • Tgl: {item.entry_date}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.customer_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {item.customer_phone || '-'}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                      {item.complaint || '-'}
                      <span className="block text-[10px] text-slate-400">PJ: {item.mechanic_name || 'Mas Agus'}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${STAGE_COLORS[item.status] || 'bg-slate-100 text-slate-800'}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      Rp {Number(item.total_cost || 0).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedRoId(item.id)}
                          className="touch-target px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold"
                        >
                          Kelola
                        </button>
                        <button
                          onClick={() => window.open(`/api/repair-orders/${item.id}/invoice-pdf`, '_blank')}
                          className="touch-target p-1 text-slate-600 hover:text-slate-900 dark:hover:text-white rounded"
                          title="Cetak PDF"
                        >
                          <FileText className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Buat Repair Order Baru */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <span>Buat Repair Order Servis Baru</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="touch-target text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
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
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
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
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Merek & Model Mobil
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Toyota Avanza 1.3 G"
                    value={formData.merekModel}
                    onChange={(e) => setFormData({ ...formData, merekModel: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Kendaraan
                  </label>
                  <input
                    type="number"
                    placeholder="2019"
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Warna Mobil
                  </label>
                  <input
                    type="text"
                    placeholder="Hitam Metalik"
                    value={formData.warna}
                    onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Odometer Masuk (km)
                  </label>
                  <input
                    type="number"
                    placeholder="65420"
                    value={formData.odometerMasuk}
                    onChange={(e) => setFormData({ ...formData, odometerMasuk: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Masuk
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalMasuk}
                    onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Keluhan Pelanggan / Permintaan Servis *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Mesin brebet saat akselerasi dan AC kurang dingin"
                  value={formData.keluhan}
                  onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mekanik PJ
                  </label>
                  <input
                    type="text"
                    value={formData.mekanikPj}
                    onChange={(e) => setFormData({ ...formData, mekanikPj: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Biaya Jasa Awal (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.biayaJasa}
                    onChange={(e) => setFormData({ ...formData, biayaJasa: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimasi Selesai
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Hari ini 16:00 WIB"
                    value={formData.estimasiSelesai}
                    onChange={(e) => setFormData({ ...formData, estimasiSelesai: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="touch-target px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
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
