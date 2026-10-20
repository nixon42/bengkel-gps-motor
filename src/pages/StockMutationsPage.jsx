import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowDownUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Calendar, 
  RefreshCw, 
  Package, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import RestockModal from '../components/Stock/RestockModal';
import StockOutModal from '../components/Stock/StockOutModal';
import StockMovementChart from '../components/Stock/StockMovementChart';

export default function StockMutationsPage() {
  const [movements, setMovements] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [filterType, setFilterType] = useState('');
  const [filterPartId, setFilterPartId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Modals state
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [stockOutModalOpen, setStockOutModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load spareparts for dropdown filter & modals
  const fetchSpareparts = async () => {
    try {
      const res = await fetch('/api/inventory?limit=500', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setSpareparts(json.items || json.data || []);
      }
    } catch {
      // Non-critical
    }
  };

  useEffect(() => {
    fetchSpareparts();
  }, []);

  // Fetch stock movements
  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterPartId) params.set('sparepartId', filterPartId);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/stock-movements?${params.toString()}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal memuat riwayat mutasi stok');
      }

      const json = await res.json();
      setMovements(json.movements || json.data || []);
      if (json.pagination) {
        setPagination(json.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterPartId, startDate, endDate, debouncedSearch, page, limit]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handleMovementSaved = () => {
    fetchMovements();
    fetchSpareparts();
  };

  const formatRp = (val) => {
    const num = Number(val) || 0;
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getExportUrl = (format) => {
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (filterPartId) params.set('sparepartId', filterPartId);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return `/api/stock-movements/export/${format}?${params.toString()}`;
  };

  const renderTypeBadge = (type) => {
    switch (type) {
      case 'IN':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>MASUK</span>
          </span>
        );
      case 'OUT':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>KELUAR</span>
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>PENYESUAIAN</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <ArrowDownUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Buku Mutasi Stok Sparepart
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 font-mono">
                  {pagination.total} Log
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Catatan riwayat transaksi barang masuk (restock), pemakaian barang keluar (servis), dan penyesuaian audit opname.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => {
                setSelectedPartId(null);
                setRestockModalOpen(true);
              }}
              className="touch-target w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-[#00a86b] hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>+ Barang Masuk (Restock)</span>
            </button>

            <button
              onClick={() => {
                setSelectedPartId(null);
                setStockOutModalOpen(true);
              }}
              className="touch-target flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>- Barang Keluar (Pemakaian)</span>
            </button>

            <div className="flex items-center gap-1.5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-2 sm:pt-0 sm:pl-2">
              <a
                href={getExportUrl('csv')}
                target="_blank"
                rel="noopener noreferrer"
                title="Unduh riwayat mutasi stok ke CSV"
                className="touch-target flex-1 sm:flex-none px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>CSV</span>
              </a>

              <a
                href={getExportUrl('pdf')}
                target="_blank"
                rel="noopener noreferrer"
                title="Cetak laporan mutasi stok ke PDF"
                className="touch-target flex-1 sm:flex-none px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>PDF</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Mutation Flow Chart */}
      <StockMovementChart movements={movements} />

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Tipe filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="touch-target w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
            >
              <option value="">Semua Tipe Mutasi</option>
              <option value="IN">Barang Masuk (IN)</option>
              <option value="OUT">Barang Keluar (OUT)</option>
              <option value="ADJUSTMENT">Penyesuaian (ADJUSTMENT)</option>
            </select>
          </div>

          {/* Sparepart filter */}
          <div>
            <select
              value={filterPartId}
              onChange={(e) => {
                setFilterPartId(e.target.value);
                setPage(1);
              }}
              className="touch-target w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
            >
              <option value="">Semua Sparepart</option>
              {spareparts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name || p.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="touch-target w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono transition-all"
              placeholder="Dari Tanggal"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="touch-target w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono transition-all"
              placeholder="Sampai Tanggal"
            />
          </div>

          {/* Search text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari item, faktur, catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="touch-target w-full pl-10 pr-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Quick Filter Segmented Rail */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto -mx-0.5 px-0.5">
            <span className="text-xs font-bold text-slate-400 px-2 shrink-0">Tipe Cepat:</span>
            <button
              onClick={() => { setFilterType(''); setPage(1); }}
              className={`touch-target shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === ''
                  ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => { setFilterType('IN'); setPage(1); }}
              className={`touch-target shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'IN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              Masuk (Restock)
            </button>
            <button
              onClick={() => { setFilterType('OUT'); setPage(1); }}
              className={`touch-target shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'OUT'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              Keluar (Pemakaian)
            </button>
            <button
              onClick={() => { setFilterType('ADJUSTMENT'); setPage(1); }}
              className={`touch-target shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'ADJUSTMENT'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Penyesuaian Opname
            </button>
          </div>

          {(filterType || filterPartId || startDate || endDate || search) && (
            <button
              onClick={() => {
                setFilterType('');
                setFilterPartId('');
                setStartDate('');
                setEndDate('');
                setSearch('');
                setPage(1);
              }}
              className="touch-target px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Memuat riwayat mutasi stok...</span>
          </div>
        ) : movements.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">Tidak ada mutasi stok ditemukan</p>
            <p className="text-xs">Belum ada transaksi barang masuk atau keluar yang sesuai filter.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {movements.map((m) => {
                const isIncoming = m.type === 'IN';
                const isOutgoing = m.type === 'OUT';

                return (
                  <div key={m.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {renderTypeBadge(m.type)}
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {formatDateIndo(m.date)}
                        </span>
                      </div>
                      <span className={`text-sm font-bold font-mono ${
                        isIncoming 
                          ? 'text-emerald-700 dark:text-emerald-400' 
                          : isOutgoing 
                          ? 'text-rose-700 dark:text-rose-400' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {isIncoming ? `+${m.quantity}` : isOutgoing ? `-${m.quantity}` : `${m.quantity}`}{' '}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {m.sparepart_unit || 'pcs'}
                        </span>
                      </span>
                    </div>

                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug">
                        {m.sparepart_name || '-'}
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {m.sparepart_sku || '-'}
                      </div>
                    </div>

                    {(m.total_price || m.supplier || m.invoice_number || m.notes) && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                        {m.total_price ? (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Total Nilai:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {formatRp(m.total_price)}
                            </span>
                          </div>
                        ) : null}
                        {m.supplier && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Supplier:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{m.supplier}</span>
                          </div>
                        )}
                        {m.invoice_number && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">No. Faktur:</span>
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{m.invoice_number}</span>
                          </div>
                        )}
                        {m.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 italic">
                            {m.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-xs">
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-3">Tipe</th>
                    <th className="py-3.5 px-4">SKU &amp; Sparepart</th>
                    <th className="py-3.5 px-3">Jumlah</th>
                    <th className="py-3.5 px-4">Nilai (Rp)</th>
                    <th className="py-3.5 px-4">Faktur / RO / Supplier</th>
                    <th className="py-3.5 px-4">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {movements.map((m) => {
                    const isIncoming = m.type === 'IN';
                    const isOutgoing = m.type === 'OUT';

                    return (
                      <tr 
                        key={m.id} 
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Tanggal */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {formatDateIndo(m.date)}
                          </div>
                          {m.created_at && (
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              {m.created_at.slice(11, 16)} WIB
                            </div>
                          )}
                        </td>

                        {/* Tipe Badge */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {renderTypeBadge(m.type)}
                        </td>

                        {/* SKU & Sparepart */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white leading-snug">
                            {m.sparepart_name || '-'}
                          </div>
                          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                            {m.sparepart_sku || '-'}
                          </div>
                        </td>

                        {/* Qty & Satuan */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`text-sm font-bold font-mono ${
                            isIncoming 
                              ? 'text-emerald-700 dark:text-emerald-400' 
                              : isOutgoing 
                              ? 'text-rose-700 dark:text-rose-400' 
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {isIncoming ? `+${m.quantity}` : isOutgoing ? `-${m.quantity}` : `${m.quantity}`}{' '}
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                              {m.sparepart_unit || 'pcs'}
                            </span>
                          </span>
                        </td>

                        {/* Nilai Rp */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                          {m.total_price ? (
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {formatRp(m.total_price)}
                              </span>
                              {m.unit_price ? (
                                <span className="text-xs text-slate-400 block font-normal">
                                  @{formatRp(m.unit_price)}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Referensi / Supplier / Faktur / RO */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {m.supplier && (
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {m.supplier}
                            </div>
                          )}
                          {m.invoice_number && (
                            <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
                              Faktur: {m.invoice_number}
                            </div>
                          )}
                          {m.repair_order_id && (
                            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                              RO: {m.repair_order_id.slice(0, 8)}...
                            </div>
                          )}
                          {!m.supplier && !m.invoice_number && !m.repair_order_id && (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Catatan */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={m.notes}>
                          {m.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 dark:text-slate-400">
            Menampilkan{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            dari{' '}
            <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span> catatan mutasi
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Per hal:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="touch-target px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="touch-target px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-2.5 py-1 text-slate-700 dark:text-slate-300 font-bold">
                Hal {page} dari {pagination.totalPages || 1}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))}
                disabled={page >= (pagination.totalPages || 1)}
                className="touch-target px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals Integration */}
      <RestockModal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        onSaved={handleMovementSaved}
        initialPartId={selectedPartId}
        spareparts={spareparts}
      />

      <StockOutModal
        isOpen={stockOutModalOpen}
        onClose={() => setStockOutModalOpen(false)}
        onSaved={handleMovementSaved}
        initialPartId={selectedPartId}
        spareparts={spareparts}
      />
    </div>
  );
}
