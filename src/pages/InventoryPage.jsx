import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Trash2, 
  ArrowDownRight, 
  ArrowUpRight, 
  RefreshCw, 
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import PartFormModal from '../components/Inventory/PartFormModal';
import ValuationModal from '../components/Inventory/ValuationModal';
import RestockModal from '../components/Stock/RestockModal';
import StockOutModal from '../components/Stock/StockOutModal';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [allSpareparts, setAllSpareparts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [valuationSummary, setValuationSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Modals state
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [valuationModalOpen, setValuationModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [stockOutModalOpen, setStockOutModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch KPI valuation summary
  const fetchValuation = async () => {
    try {
      const res = await fetch('/api/inventory/reports/valuation', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setValuationSummary(data);
        if (data.items) {
          setAllSpareparts(data.items);
        }
      }
    } catch {
      // Non-critical, ignore
    }
  };

  // Fetch Inventory items
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (category) params.set('category', category);
      if (stockStatus) params.set('stock_status', stockStatus);
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/inventory?${params.toString()}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal memuat katalog inventaris');
      }

      const json = await res.json();
      setItems(json.items || json.data || []);
      if (json.pagination) {
        setPagination(json.pagination);
      }
      if (json.categories) {
        setCategories(json.categories);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, stockStatus, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    fetchValuation();
  }, []);

  const handleRefresh = () => {
    fetchInventory();
    fetchValuation();
  };

  const handlePartSaved = () => {
    handleRefresh();
  };

  const handleStockMovementSaved = () => {
    handleRefresh();
  };

  const handleDeletePart = async (item) => {
    const confirmMessage = `Apakah Anda yakin ingin menghapus sparepart "${item.name || item.sku}"?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal menghapus sparepart');
      }

      handleRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setEditingPart(null);
    setPartModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingPart(item);
    setPartModalOpen(true);
  };

  const openRestockModal = (partId = null) => {
    setSelectedPartId(partId);
    setRestockModalOpen(true);
  };

  const openStockOutModal = (partId = null) => {
    setSelectedPartId(partId);
    setStockOutModalOpen(true);
  };

  const formatRp = (val) => {
    const num = Number(val) || 0;
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  // Stock status badge component
  const renderStockBadge = (item) => {
    const stock = item.stock ?? 0;
    const minStock = item.min_stock ?? 5;

    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
          Habis (0 {item.unit || 'pcs'})
        </span>
      );
    }
    if (stock <= minStock) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
          Menipis ({stock} / min {minStock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
        Aman ({stock} {item.unit || 'pcs'})
      </span>
    );
  };

  // Profit margin badge component
  const renderProfitMargin = (item) => {
    const nominal = item.profit_margin_nominal ?? (item.sell_price - item.buy_price);
    const percent = item.profit_margin_percent ?? 0;
    const isLoss = item.is_loss || nominal < 0;

    if (isLoss) {
      return (
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
            <TrendingDown className="w-3 h-3 mr-0.5" />
            <span>{formatRp(nominal)}</span>
          </span>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
            {percent}% (Rugi)
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start">
        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <TrendingUp className="w-3 h-3 mr-0.5 text-emerald-600" />
          <span>{formatRp(nominal)}</span>
        </span>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          +{percent}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Katalog Inventaris & Sparepart
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                {pagination.total} Item
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola suku cadang, pantau ambang batas minimum, margin keuntungan, dan mutasi stok fisik.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={openCreateModal}
              className="touch-target w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-[#00a86b] hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sparepart</span>
            </button>

            <button
              onClick={() => openRestockModal()}
              className="touch-target flex-1 sm:flex-none px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-emerald-400 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs border border-slate-700/60"
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              <span>Restock Masuk</span>
            </button>

            <button
              onClick={() => openStockOutModal()}
              className="touch-target flex-1 sm:flex-none px-3.5 py-2.5 min-h-[44px] rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
              <span>Pakai Keluar</span>
            </button>

            {/* Laporan & Ekspor Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="touch-target w-full sm:w-auto px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Laporan &amp; Ekspor</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {exportDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-30 p-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
                  onClick={() => setExportDropdownOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setValuationModalOpen(true)}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 font-medium transition-colors"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Valuasi Nilai Gudang</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <a
                    href="/api/inventory/export/csv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Unduh CSV Katalog</span>
                  </a>

                  <a
                    href="/api/inventory/export/pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-3 py-2 rounded-xl text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 font-medium transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Cetak PDF Katalog</span>
                  </a>

                  <a
                    href="/api/inventory/export/low-stock/pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-3 py-2 rounded-xl text-left text-xs text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center space-x-2 font-medium transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Cetak PDF Stok Kritis</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        {valuationSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Total Item SKU</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white block mt-0.5">
                {valuationSummary.total_items} SKU
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Total Unit Fisik</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white block mt-0.5">
                {valuationSummary.total_stock_count} Unit
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300 block">Stok Menipis</span>
              <span className="text-lg font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400 block mt-0.5">
                {valuationSummary.low_stock_items_count} Item
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60">
              <span className="text-xs font-medium text-rose-800 dark:text-rose-300 block">Stok Habis (0)</span>
              <span className="text-lg font-bold font-mono tabular-nums text-rose-700 dark:text-rose-400 block mt-0.5">
                {valuationSummary.out_of_stock_items_count} Item
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama sparepart atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="touch-target w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="touch-target w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category} ({c.count})
                </option>
              ))}
              {!categories.some((c) => c.category === 'Oli') && <option value="Oli">Oli</option>}
              {!categories.some((c) => c.category === 'Filter') && <option value="Filter">Filter</option>}
              {!categories.some((c) => c.category === 'Rem') && <option value="Rem">Rem</option>}
              {!categories.some((c) => c.category === 'Busi') && <option value="Busi">Busi</option>}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setPage(1);
              }}
              className="touch-target w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              <option value="">Semua Status Stok</option>
              <option value="in_stock">Aman (Stok &gt; Min)</option>
              <option value="low_stock">Menipis (Stok &le; Min)</option>
              <option value="out_of_stock">Habis (Stok = 0)</option>
            </select>
          </div>

          {/* Sort By Selector */}
          <div>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="touch-target w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              <option value="created_at:desc">Terbaru Ditambahkan</option>
              <option value="name:asc">Nama (A - Z)</option>
              <option value="name:desc">Nama (Z - A)</option>
              <option value="stock:asc">Stok Tersedikit</option>
              <option value="stock:desc">Stok Terbanyak</option>
              <option value="sell_price:desc">Harga Jual Tertinggi</option>
              <option value="sell_price:asc">Harga Jual Terendah</option>
              <option value="buy_price:desc">Harga Beli Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Filter Badges Strip */}
        <div className="flex items-center gap-2 pt-1 text-xs overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
          <span className="text-slate-400 font-medium shrink-0">Status Cepat:</span>
          <button
            onClick={() => { setStockStatus(''); setPage(1); }}
            className={`touch-target shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              stockStatus === ''
                ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 border-slate-700 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => { setStockStatus('in_stock'); setPage(1); }}
            className={`touch-target shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              stockStatus === 'in_stock'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Aman
          </button>
          <button
            onClick={() => { setStockStatus('low_stock'); setPage(1); }}
            className={`touch-target shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              stockStatus === 'low_stock'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Menipis
          </button>
          <button
            onClick={() => { setStockStatus('out_of_stock'); setPage(1); }}
            className={`touch-target shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              stockStatus === 'out_of_stock'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            Habis (0)
          </button>

          {(search || category || stockStatus) && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('');
                setStockStatus('');
                setPage(1);
              }}
              className="touch-target shrink-0 ml-auto px-3 py-1.5 min-h-[38px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xs underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Data View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Memuat katalog inventaris...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">Tidak ada sparepart ditemukan</p>
            <p className="text-xs">Coba ubah kata kunci pencarian atau bersihkan filter yang aktif.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {item.photo_url ? (
                          <img
                            src={item.photo_url}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white text-sm leading-tight truncate">
                          {item.name || item.nama}
                        </div>
                        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{item.sku}</span>
                          <span>•</span>
                          <span className="font-sans font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.category || item.kategori}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {renderStockBadge(item)}
                    </div>
                  </div>

                  {/* Price & Margin info */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-xs text-slate-400 block">Harga Beli</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300 text-xs">
                        {formatRp(item.buy_price ?? item.hargaBeli)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Harga Jual</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {formatRp(item.sell_price ?? item.hargaJual)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Margin</span>
                      {renderProfitMargin(item)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                      {item.supplier ? `Supplier: ${item.supplier}` : ''}
                    </span>
                    <div className="inline-flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => openRestockModal(item.id)}
                        title="Restock barang masuk"
                        className="touch-target px-2.5 py-1.5 min-h-[38px] rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center space-x-1 transition-colors"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Masuk</span>
                      </button>
                      <button
                        onClick={() => openStockOutModal(item.id)}
                        title="Pengeluaran barang keluar"
                        className="touch-target px-2.5 py-1.5 min-h-[38px] rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center space-x-1 transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Keluar</span>
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        title="Ubah detail sparepart"
                        className="touch-target w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePart(item)}
                        title="Hapus sparepart"
                        className="touch-target w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 font-bold uppercase tracking-wider text-xs">
                    <th className="py-3.5 px-3 sm:px-4">Foto & Item</th>
                    <th className="py-3.5 px-3">Kategori</th>
                    <th className="py-3.5 px-3">Stok & Status</th>
                    <th className="py-3.5 px-3">Harga Beli</th>
                    <th className="py-3.5 px-3">Harga Jual</th>
                    <th className="py-3.5 px-3">Margin Laba</th>
                    <th className="py-3.5 px-3 hidden md:table-cell">Supplier</th>
                    <th className="py-3.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Foto & Item Name */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                            {item.photo_url ? (
                              <img
                                src={item.photo_url}
                                alt={item.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white leading-tight">
                              {item.name || item.nama}
                            </div>
                            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.sku}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.category || item.kategori}
                        </span>
                      </td>

                      {/* Stok & Status */}
                      <td className="py-3 px-3">
                        {renderStockBadge(item)}
                      </td>

                      {/* Harga Beli */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {formatRp(item.buy_price ?? item.hargaBeli)}
                      </td>

                      {/* Harga Jual */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                        {formatRp(item.sell_price ?? item.hargaJual)}
                      </td>

                      {/* Margin Laba */}
                      <td className="py-3 px-3">
                        {renderProfitMargin(item)}
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-3 hidden md:table-cell text-slate-600 dark:text-slate-400">
                        {item.supplier || '-'}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center space-x-1.5 justify-end">
                          <button
                            onClick={() => openRestockModal(item.id)}
                            title="Restock barang masuk"
                            className="touch-target px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold flex items-center space-x-1 transition-colors"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>Restock</span>
                          </button>

                          <button
                            onClick={() => openEditModal(item)}
                            title="Ubah detail sparepart"
                            className="touch-target p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeletePart(item)}
                            title="Hapus / Nonaktifkan sparepart"
                            className="touch-target p-2 rounded-lg text-rose-600/70 hover:text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
            <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span> item
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
      <PartFormModal
        isOpen={partModalOpen}
        onClose={() => setPartModalOpen(false)}
        onSaved={handlePartSaved}
        initialData={editingPart}
      />

      <ValuationModal
        isOpen={valuationModalOpen}
        onClose={() => setValuationModalOpen(false)}
      />

      <RestockModal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        onSaved={handleStockMovementSaved}
        initialPartId={selectedPartId}
        spareparts={allSpareparts.length > 0 ? allSpareparts : items}
      />

      <StockOutModal
        isOpen={stockOutModalOpen}
        onClose={() => setStockOutModalOpen(false)}
        onSaved={handleStockMovementSaved}
        initialPartId={selectedPartId}
        spareparts={allSpareparts.length > 0 ? allSpareparts : items}
      />
    </div>
  );
}
