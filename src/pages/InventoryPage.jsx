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
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Katalog Inventaris & Sparepart
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                {pagination.total} Item
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola suku cadang, pantau ambang batas minimum, margin keuntungan, dan mutasi stok fisik.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openCreateModal}
              className="touch-target px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-none"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sparepart</span>
            </button>

            <button
              onClick={() => openRestockModal()}
              className="touch-target px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-none"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Restock Masuk</span>
            </button>

            <button
              onClick={() => openStockOutModal()}
              className="touch-target px-3.5 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-none"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pakai Keluar</span>
            </button>

            <button
              onClick={() => setValuationModalOpen(true)}
              className="touch-target px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Valuasi Nilai</span>
            </button>

            {/* Export Buttons */}
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
              <a
                href="/api/inventory/export/csv"
                target="_blank"
                rel="noopener noreferrer"
                title="Unduh CSV seluruh inventaris"
                className="touch-target px-2.5 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </a>

              <a
                href="/api/inventory/export/pdf"
                target="_blank"
                rel="noopener noreferrer"
                title="Cetak PDF katalog inventaris"
                className="touch-target px-2.5 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>PDF</span>
              </a>

              <a
                href="/api/inventory/export/low-stock/pdf"
                target="_blank"
                rel="noopener noreferrer"
                title="Cetak PDF daftar stok kritis / menipis"
                className="touch-target px-2.5 py-2 rounded border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center space-x-1"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Stok Kritis PDF</span>
              </a>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        {valuationSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="p-3 rounded bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Item SKU</span>
              <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
                {valuationSummary.total_items} SKU
              </span>
            </div>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Unit Fisik</span>
              <span className="text-base font-bold text-slate-900 dark:text-white block mt-0.5">
                {valuationSummary.total_stock_count} Unit
              </span>
            </div>

            <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 block">Stok Menipis</span>
              <span className="text-base font-bold text-amber-700 dark:text-amber-400 block mt-0.5">
                {valuationSummary.low_stock_items_count} Item
              </span>
            </div>

            <div className="p-3 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <span className="text-[11px] font-medium text-rose-800 dark:text-rose-300 block">Stok Habis (0)</span>
              <span className="text-base font-bold text-rose-700 dark:text-rose-400 block mt-0.5">
                {valuationSummary.out_of_stock_items_count} Item
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama sparepart atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="touch-target w-full pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="touch-target w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="touch-target w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="touch-target w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Status Cepat:</span>
          <button
            onClick={() => { setStockStatus(''); setPage(1); }}
            className={`touch-target px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              stockStatus === ''
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => { setStockStatus('in_stock'); setPage(1); }}
            className={`touch-target px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              stockStatus === 'in_stock'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            Aman
          </button>
          <button
            onClick={() => { setStockStatus('low_stock'); setPage(1); }}
            className={`touch-target px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              stockStatus === 'low_stock'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
          >
            Menipis
          </button>
          <button
            onClick={() => { setStockStatus('out_of_stock'); setPage(1); }}
            className={`touch-target px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              stockStatus === 'out_of_stock'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
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
              className="touch-target ml-auto px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-xs underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Data View */}
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
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
              {items.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
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
                        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{item.sku}</span>
                          <span>•</span>
                          <span className="font-sans font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
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
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-700/30 p-2.5 rounded border border-slate-100 dark:border-slate-700 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga Beli</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                        {formatRp(item.buy_price ?? item.hargaBeli)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga Jual</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                        {formatRp(item.sell_price ?? item.hargaJual)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Margin</span>
                      {renderProfitMargin(item)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                      {item.supplier ? `Supplier: ${item.supplier}` : ''}
                    </span>
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => openRestockModal(item.id)}
                        title="Restock barang masuk"
                        className="touch-target px-2.5 py-1.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center space-x-1"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Masuk</span>
                      </button>
                      <button
                        onClick={() => openStockOutModal(item.id)}
                        title="Pengeluaran barang keluar"
                        className="touch-target px-2.5 py-1.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center space-x-1"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Keluar</span>
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        title="Ubah detail sparepart"
                        className="touch-target p-1.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePart(item)}
                        title="Hapus sparepart"
                        className="touch-target p-1.5 rounded bg-slate-100 dark:bg-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
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
                  <tr className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 sm:px-4">Foto & Item</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Stok & Status</th>
                    <th className="py-3 px-3">Harga Beli</th>
                    <th className="py-3 px-3">Harga Jual</th>
                    <th className="py-3 px-3">Margin Laba</th>
                    <th className="py-3 px-3 hidden md:table-cell">Supplier</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {items.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Foto & Item Name */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
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
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.sku}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
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
                            className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openStockOutModal(item.id)}
                            title="Pengeluaran barang keluar"
                            className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(item)}
                            title="Ubah detail sparepart"
                            className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeletePart(item)}
                            title="Hapus / Nonaktifkan sparepart"
                            className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
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
