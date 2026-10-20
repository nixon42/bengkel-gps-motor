import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Download, 
  FileText, 
  Filter, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Target, 
  FolderPlus, 
  Eye, 
  AlertCircle, 
  CheckCircle2,
  CreditCard,
  Image as ImageIcon
} from 'lucide-react';

import PnlChart from '../components/Finance/PnlChart';
import TransactionModal from '../components/Finance/TransactionModal';
import CategoryModal from '../components/Finance/CategoryModal';
import ReceiptModal from '../components/Finance/ReceiptModal';

function formatRupiah(amount) {
  const num = Math.round(Number(amount) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export default function FinancePage() {
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Modals state
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [editingTrx, setEditingTrx] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState({ url: null, desc: '' });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/finance/categories', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setCategories(json.categories || json.data || []);
      }
    } catch {
      // Non-critical
    }
  }, []);

  // Fetch KPI Summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/finance/summary?period=${period}`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setSummary(json);
      }
    } catch {
      // Non-critical
    }
  }, [period]);

  // Fetch Transactions ledger
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filterType) params.set('type', filterType);
      if (filterCategory) params.set('categoryId', filterCategory);
      if (filterPayment) params.set('paymentMethod', filterPayment);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/finance/transactions?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal memuat daftar transaksi');
      }

      const json = await res.json();
      setTransactions(json.transactions || json.data || []);
      if (json.pagination) {
        setPagination(json.pagination);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat transaksi');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterType, filterCategory, filterPayment, page, limit]);

  // Initial and reactive loads
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle Create / Edit Transaction
  const handleSubmitTransaction = async (payloadOrFormData, editId = null) => {
    const isFormData = payloadOrFormData instanceof FormData;
    const url = editId ? `/api/finance/transactions/${editId}` : '/api/finance/transactions';
    const method = editId ? 'PUT' : 'POST';

    const options = {
      method,
      credentials: 'include'
    };

    if (isFormData) {
      options.body = payloadOrFormData;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(payloadOrFormData);
    }

    const res = await fetch(url, options);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'Gagal menyimpan transaksi');
    }

    // Refresh data
    fetchSummary();
    fetchTransactions();
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Yakin ingin menghapus catatan transaksi ini?')) return;
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal menghapus transaksi');
      }
      fetchSummary();
      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  // Category modal handlers
  const handleAddCategory = async (data) => {
    const res = await fetch('/api/finance/categories', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal menambah kategori');
    }
    fetchCategories();
  };

  const handleUpdateCategory = async (id, data) => {
    const res = await fetch(`/api/finance/categories/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal memperbarui kategori');
    }
    fetchCategories();
  };

  const handleDeleteCategory = async (id) => {
    const res = await fetch(`/api/finance/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal menghapus kategori');
    }
    fetchCategories();
  };

  const resetFilters = () => {
    setSearch('');
    setFilterType('');
    setFilterCategory('');
    setFilterPayment('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Buku Kas & Keuangan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pencatatan arus kas operasional, laba rugi bulanan, dan ekspor laporan keuangan bengkel
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              setEditingTrx(null);
              setIsTrxModalOpen(true);
            }}
            className="touch-target w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-[#00a86b] hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>

          <button
            onClick={() => setIsCatModalOpen(true)}
            className="touch-target flex-1 sm:flex-none px-3.5 py-2.5 min-h-[44px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Kelola Kategori</span>
          </button>

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            <a
              href="/api/finance/export/csv"
              download
              className="touch-target flex-1 sm:flex-none px-3 py-2.5 min-h-[44px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              title="Unduh seluruh transaksi ke CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </a>

            <a
              href={`/api/finance/export/pnl-pdf?period=${period}`}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex-1 sm:flex-none px-3 py-2.5 min-h-[44px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              title="Cetak Laporan Laba Rugi PDF"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>P&L PDF</span>
            </a>

            <a
              href="/api/finance/export/daily-recap-pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex-1 sm:flex-none px-3 py-2.5 min-h-[44px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              title="Cetak Rekap Kas Harian PDF"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Rekap Harian</span>
            </a>
          </div>
        </div>
      </div>

      {/* Period Filter Segmented Rail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center space-x-2 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Rentang Waktu:</span>
        </div>
        <div className="p-1 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto -mx-0.5 px-0.5">
          {[
            { key: 'today', label: 'Hari Ini' },
            { key: 'week', label: 'Minggu Ini' },
            { key: 'month', label: 'Bulan Ini' },
            { key: 'year', label: 'Tahun Ini' },
            { key: 'all', label: 'Semua Transaksi' }
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`touch-target shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                period === p.key
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executive KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Pemasukan
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatRupiah(summary?.total_income || 0)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            {summary?.counts?.income || 0} transaksi masuk
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Pengeluaran
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
              {formatRupiah(summary?.total_expense || 0)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            {summary?.counts?.expense || 0} transaksi keluar
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Saldo Bersih
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className={`text-2xl font-bold font-mono tracking-tight ${summary?.is_deficit ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {formatRupiah(summary?.net_balance || 0)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-bold tracking-wide uppercase ${
                summary?.is_deficit
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
              }`}
            >
              {summary?.is_deficit ? 'Defisit' : 'Surplus'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {summary?.counts?.total || 0} transaksi
            </span>
          </div>
        </div>

        {/* Revenue Target Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Target Bulanan
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
              {summary?.budget?.progress_percent || 0}%
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, summary?.budget?.progress_percent || 0)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 truncate">
              {formatRupiah(summary?.budget?.current_month_income || 0)} / {formatRupiah(summary?.budget?.monthly_target || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly P&L Chart */}
      <PnlChart data={summary?.monthly_pnl_chart || []} />

      {/* Transactions Ledger Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-none space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deskripsi transaksi atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-9 pr-3 text-base sm:text-xs min-h-[44px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none h-11 px-3 text-base sm:text-xs min-h-[44px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition-colors"
            >
              <option value="">Semua Tipe</option>
              <option value="INCOME">Pemasukan (+)</option>
              <option value="EXPENSE">Pengeluaran (-)</option>
            </select>

            {/* Filter Category */}
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none h-11 px-3 text-base sm:text-xs min-h-[44px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            >
              <option value="">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type === 'INCOME' ? '+' : '-'})</option>
              ))}
            </select>

            {/* Filter Payment Method */}
            <select
              value={filterPayment}
              onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none h-11 px-3 text-base sm:text-xs min-h-[44px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            >
              <option value="">Semua Metode</option>
              <option value="CASH">CASH (Tunai)</option>
              <option value="TRANSFER">TRANSFER (Bank)</option>
              <option value="QRIS">QRIS</option>
            </select>

            {(search || filterType || filterCategory || filterPayment) && (
              <button
                onClick={resetFilters}
                className="touch-target px-3 h-11 min-h-[44px] text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Transaction Ledger Table (Desktop) */}
        <div className="hidden md:block overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3.5">Tanggal</th>
                <th className="py-3 px-3">Tipe</th>
                <th className="py-3 px-3.5">Kategori</th>
                <th className="py-3 px-4">Deskripsi</th>
                <th className="py-3 px-3">Metode</th>
                <th className="py-3 px-3.5 text-right">Nominal</th>
                <th className="py-3 px-2 text-center">Struk</th>
                <th className="py-3 px-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Memuat catatan keuangan...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    Belum ada data transaksi yang sesuai filter
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3.5 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDateDisplay(t.date)}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tracking-wider uppercase ${
                          t.type === 'INCOME'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                        }`}
                      >
                        {t.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.category_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={t.description}>
                      {t.description}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {t.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                      <span className={t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center whitespace-nowrap">
                      {t.receipt_url ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewReceipt({ url: t.receipt_url, desc: t.description });
                            setIsReceiptModalOpen(true);
                          }}
                          className="touch-target w-8 h-8 inline-flex items-center justify-center text-blue-600 hover:text-blue-800 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Lihat bukti struk"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTrx(t);
                            setIsTrxModalOpen(true);
                          }}
                          className="touch-target w-8 h-8 flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit transaksi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="touch-target w-8 h-8 flex items-center justify-center text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Hapus transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Transaction Cards (Mobile View < 768px) */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Memuat catatan keuangan...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">Belum ada transaksi</div>
          ) : (
            transactions.map((t) => (
              <div
                key={t.id}
                className="p-4 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold tracking-wider uppercase ${
                        t.type === 'INCOME'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                      }`}
                    >
                      {t.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {t.category_name}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    {formatDateDisplay(t.date)}
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {t.description}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t.payment_method}
                    </span>
                    {t.receipt_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewReceipt({ url: t.receipt_url, desc: t.description });
                          setIsReceiptModalOpen(true);
                        }}
                        className="touch-target text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center space-x-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 mr-0.5" />
                        <span>Struk</span>
                      </button>
                    )}
                  </div>

                  <div className="text-sm font-mono font-bold">
                    <span className={t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                    </span>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTrx(t);
                      setIsTrxModalOpen(true);
                    }}
                    className="touch-target px-3.5 py-2 min-h-[38px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="touch-target px-3.5 py-2 min-h-[38px] rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center space-x-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Menampilkan {transactions.length} dari {pagination.total} transaksi (Halaman {pagination.page} dari {pagination.totalPages})
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="touch-target px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center space-x-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <span className="font-bold text-slate-800 dark:text-white px-2">
              {page} / {pagination.totalPages || 1}
            </span>

            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
              disabled={page >= pagination.totalPages}
              className="touch-target px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center space-x-1 transition-colors"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTrxModalOpen}
        onClose={() => {
          setIsTrxModalOpen(false);
          setEditingTrx(null);
        }}
        onSubmit={handleSubmitTransaction}
        categories={categories}
        initialData={editingTrx}
        isEdit={Boolean(editingTrx)}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setPreviewReceipt({ url: null, desc: '' });
        }}
        receiptUrl={previewReceipt.url}
        description={previewReceipt.desc}
      />
    </div>
  );
}
