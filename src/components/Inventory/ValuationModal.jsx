import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Download, FileText, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function ValuationModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchValuation = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/inventory/reports/valuation', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Gagal mengambil data valuasi inventaris');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchValuation();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalBuy = data?.total_buy_value || 0;
  const totalSell = data?.total_sell_value || 0;
  const profit = data?.potential_gross_profit || 0;
  const marginPercent = data?.profit_margin_percent || 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl text-slate-900 dark:text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Pinned at top, shrink-0) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                Laporan Valuasi Nilai Inventaris
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Ringkasan modal pembelian &amp; estimasi potensi keuntungan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 touch-target shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Tutup Modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs">
              {error}
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span>Mengkalkulasi nilai seluruh stok bengkel...</span>
            </div>
          ) : (
            <div className="space-y-5">
              {/* 4 Metric Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Total Item</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block">
                    {data?.total_items || 0} SKU
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    ({data?.total_stock_count || 0} unit fisik)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Total Modal Beli</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-1 block font-mono">
                    Rp {totalBuy.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5 block">Harga modal seluruh stok</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="block text-xs font-medium text-emerald-800 dark:text-emerald-300">Total Nilai Jual</span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-1 block font-mono">
                    Rp {totalSell.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 block">Potensi omzet</span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60">
                  <span className="block text-xs font-medium text-blue-800 dark:text-blue-300">Potensi Laba Kotor</span>
                  <span className="text-base font-bold text-blue-700 dark:text-blue-400 mt-1 block font-mono">
                    Rp {profit.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 block">
                    Margin: {marginPercent}%
                  </span>
                </div>
              </div>

              {/* Health Alert Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-center space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">Stok Menipis: {data?.low_stock_items_count || 0} item</span>
                    <span className="text-xs opacity-80">Perlu dijadwalkan restock ke supplier</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-800/80 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 flex items-center space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">Stok Habis (0): {data?.out_of_stock_items_count || 0} item</span>
                    <span className="text-xs opacity-80">Tidak dapat digunakan untuk servis mobil</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Actions (Pinned at bottom, shrink-0) */}
        {!loading && !error && (
          <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex flex-wrap gap-2.5 justify-end">
            <a
              href="/api/inventory/reports/valuation/csv"
              download="valuasi-inventaris.csv"
              className="touch-target px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Unduh Valuasi CSV</span>
            </a>

            <a
              href="/api/inventory/reports/valuation/pdf"
              target="_blank"
              rel="noreferrer"
              className="touch-target px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Cetak Valuasi PDF</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
