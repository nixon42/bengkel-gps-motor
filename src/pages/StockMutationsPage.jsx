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
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ArrowDownUp className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Buku Mutasi Stok Sparepart
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                {pagination.total} Catatan
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Catatan riwayat transaksi barang masuk (restock), pemakaian barang keluar (servis), dan penyesuaian audit opname.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedPartId(null);
                setRestockModalOpen(true);
              }}
              className="touch-target px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-none"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>+ Barang Masuk (Restock)</span>
            </button>

            <button
              onClick={() => {
                setSelectedPartId(null);
                setStockOutModalOpen(true);
              }}
              className="touch-target px-3.5 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-none"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>- Barang Keluar (Pemakaian)</span>
            </button>

            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
              <a
                href={getExportUrl('csv')}
                target="_blank"
                rel="noopener noreferrer"
                title="Unduh riwayat mutasi stok ke CSV"
                className="touch-target px-2.5 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </a>

              <a
                href={getExportUrl('pdf')}
                target="_blank"
                rel="noopener noreferrer"
                title="Cetak laporan mutasi stok ke PDF"
                className="touch-target px-2.5 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Cetak PDF</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Tipe filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="touch-target w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="touch-target w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="touch-target w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
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
              className="touch-target w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              placeholder="Sampai Tanggal"
            />
          </div>

          {/* Search text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari item, faktur, catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="touch-target w-full pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Tipe Cepat:</span>
          <button
            onClick={() => { setFilterType(''); setPage(1); }}
            className={`touch-target px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              filterType === ''
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => { setFilterType('IN'); setPage(1); }}
            className={`touch-target px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              filterType === 'IN'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            Masuk (Restock)
          </button>
          <button
            onClick={() => { setFilterType('OUT'); setPage(1); }}
            className={`touch-target px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              filterType === 'OUT'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            Keluar (Pemakaian)
          </button>
          <button
            onClick={() => { setFilterType('ADJUSTMENT'); setPage(1); }}
            className={`touch-target px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              filterType === 'ADJUSTMENT'
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            Penyesuaian Opname
          </button>

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
              className="touch-target ml-auto px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xs underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden shadow-none">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Memuat riwayat mutasi stok...</span>
          </div>
        ) : movements.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">Tidak ada mutasi stok ditemukan</p>
            <p className="text-xs">Belum ada transaksi barang masuk atau keluar yang sesuai filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 sm:px-4">Tanggal</th>
                  <th className="py-3 px-3">Tipe</th>
                  <th className="py-3 px-3">SKU & Sparepart</th>
                  <th className="py-3 px-3">Jumlah</th>
                  <th className="py-3 px-3">Nilai (Rp)</th>
                  <th className="py-3 px-3">Faktur / RO / Supplier</th>
                  <th className="py-3 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {movements.map((m) => {
                  const isIncoming = m.type === 'IN';
                  const isOutgoing = m.type === 'OUT';

                  return (
                    <tr 
                      key={m.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Tanggal */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {formatDateIndo(m.date)}
                        </div>
                        {m.created_at && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {m.created_at.slice(11, 16)} WIB
                          </div>
                        )}
                      </td>

                      {/* Tipe Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderTypeBadge(m.type)}
                      </td>

                      {/* SKU & Sparepart */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">
                          {m.sparepart_name || '-'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          {m.sparepart_sku || '-'}
                        </div>
                      </td>

                      {/* Qty & Satuan */}
                      <td className="py-3 px-3 whitespace-nowrap">
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
                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {m.total_price ? (
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {formatRp(m.total_price)}
                            </span>
                            {m.unit_price ? (
                              <span className="text-[10px] text-slate-400 block">
                                @{formatRp(m.unit_price)}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Referensi / Supplier / Faktur / RO */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {m.supplier && (
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {m.supplier}
                          </div>
                        )}
                        {m.invoice_number && (
                          <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                            Faktur: {m.invoice_number}
                          </div>
                        )}
                        {m.repair_order_id && (
                          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                            RO: {m.repair_order_id.slice(0, 8)}...
                          </div>
                        )}
                        {!m.supplier && !m.invoice_number && !m.repair_order_id && (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Catatan */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={m.notes}>
                        {m.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="bg-slate-50 dark:bg-slate-700/40 border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 dark:text-slate-400">
            Menampilkan{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            dari{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span> catatan mutasi
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="text-slate-500">Per hal:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="touch-target px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
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
                className="touch-target px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-semibold flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-2 py-1 text-slate-700 dark:text-slate-300 font-medium">
                Hal {page} dari {pagination.totalPages || 1}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))}
                disabled={page >= (pagination.totalPages || 1)}
                className="touch-target px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-semibold flex items-center space-x-1"
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
