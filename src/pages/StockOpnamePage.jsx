import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  SlidersHorizontal, 
  Calendar, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileText
} from 'lucide-react';

const PRESET_REASONS = [
  'Audit Rutin Bulanan',
  'Barang Rusak / Pecah di Rak',
  'Selisih Hitung Restock Sebelumnya',
  'Barang Hilang / Kurang',
  'Koreksi Saldo Stok Awal'
];

export default function StockOpnamePage() {
  const [spareparts, setSpareparts] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [stokFisik, setStokFisik] = useState(0);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [alasan, setAlasan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // History state
  const [history, setHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(20);

  // Load spareparts
  const fetchSpareparts = async () => {
    try {
      const res = await fetch('/api/inventory?limit=500', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        const list = json.items || json.data || [];
        setSpareparts(list);
        if (list.length > 0 && !selectedPartId) {
          setSelectedPartId(list[0].id);
          setStokFisik(list[0].stock ?? 0);
        }
      }
    } catch {
      // Non-critical
    }
  };

  useEffect(() => {
    fetchSpareparts();
  }, []);

  // Fetch Opname History
  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError('');

      const params = new URLSearchParams();
      params.set('page', String(historyPage));
      params.set('limit', String(historyLimit));

      const res = await fetch(`/api/stock-opname?${params.toString()}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal memuat riwayat stok opname');
      }

      const json = await res.json();
      setHistory(json.opnames || json.data || []);
      if (json.pagination) {
        setHistoryPagination(json.pagination);
      }
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyLimit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const selectedPart = spareparts.find((p) => p.id === selectedPartId);
  const systemStock = selectedPart ? (selectedPart.stock ?? 0) : 0;
  const difference = Number(stokFisik) - systemStock;

  const handlePartSelect = (e) => {
    const partId = e.target.value;
    setSelectedPartId(partId);
    const part = spareparts.find((p) => p.id === partId);
    if (part) {
      setStokFisik(part.stock ?? 0);
    }
  };

  const handleSubmitOpname = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!selectedPartId) {
      setSubmitError('Pilih sparepart yang akan disesuaikan');
      return;
    }

    if (stokFisik < 0) {
      setSubmitError('Stok fisik tidak boleh kurang dari 0');
      return;
    }

    if (!alasan.trim()) {
      setSubmitError('Alasan penyesuaian wajib diisi untuk catatan audit');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/stock-opname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          sparepartId: selectedPartId,
          stokFisik: Number(stokFisik),
          tanggal,
          alasan: alasan.trim()
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Gagal menyimpan penyesuaian stok opname');
      }

      const resData = await res.json();
      const diffFormatted = resData.difference >= 0 ? `+${resData.difference}` : `${resData.difference}`;
      setSubmitSuccess(
        `Berhasil! Stok "${selectedPart?.name || selectedPart?.sku}" telah diperbarui menjadi ${resData.newStock} ${selectedPart?.unit || 'pcs'} (Selisih: ${diffFormatted}).`
      );

      // Reset form
      setAlasan('');
      fetchSpareparts();
      fetchHistory();

      // Clear alert after 4s
      setTimeout(() => {
        setSubmitSuccess('');
      }, 5000);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 shadow-none">
        <div className="flex items-center space-x-2">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Rekonsiliasi Stok Opname (Audit Fisik)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cocokkan stok komputer dengan hasil hitung fisik di gudang. Sistem secara otomatis mencatat selisih dan log alasan penyesuaian.
        </p>
      </div>

      {/* Opname Input Card */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5 shadow-none">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <span>Formulir Penyesuaian Stok Fisik</span>
        </h2>

        {submitSuccess && (
          <div className="p-3.5 mb-4 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {submitError && (
          <div className="p-3.5 mb-4 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOpname} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sparepart picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Sparepart yang Diaudit *
              </label>
              <select
                value={selectedPartId}
                onChange={handlePartSelect}
                required
                className="touch-target w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Pilih Suku Cadang --</option>
                {spareparts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name || p.nama} (Stok: {p.stock ?? 0} {p.unit || 'pcs'})
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal Opname */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Audit Opname *
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="touch-target w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Current Stock vs Physical Stock Discrepancy Card */}
          {selectedPart && (
            <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* System Stock */}
                <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                    Stok Sistem Saat Ini
                  </span>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white block mt-1">
                    {systemStock} <span className="text-xs font-normal text-slate-500">{selectedPart.unit || 'pcs'}</span>
                  </span>
                </div>

                {/* Input Physical Stock */}
                <div className="p-3 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block">
                    Stok Fisik Aktual di Rak *
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={stokFisik}
                      onChange={(e) => setStokFisik(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="touch-target w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-base font-bold font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-500 shrink-0">
                      {selectedPart.unit || 'pcs'}
                    </span>
                  </div>
                </div>

                {/* Real-Time Discrepancy (Selisih) */}
                <div className={`p-3 rounded border ${
                  difference === 0 
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' 
                    : difference > 0 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                }`}>
                  <span className={`text-[11px] font-medium block ${
                    difference === 0 
                      ? 'text-blue-800 dark:text-blue-300' 
                      : difference > 0 
                      ? 'text-emerald-800 dark:text-emerald-300' 
                      : 'text-rose-800 dark:text-rose-300'
                  }`}>
                    Indikator Selisih (Fisik - Sistem)
                  </span>
                  <div className="mt-1 flex items-center space-x-1.5">
                    {difference > 0 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : difference < 0 ? (
                      <TrendingDown className="w-5 h-5 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                    <span className={`text-xl font-bold font-mono ${
                      difference === 0 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : difference > 0 
                        ? 'text-emerald-700 dark:text-emerald-400' 
                        : 'text-rose-700 dark:text-rose-400'
                    }`}>
                      {difference >= 0 ? `+${difference}` : difference} {selectedPart.unit || 'pcs'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status explanation alert */}
              <div className="text-xs">
                {difference === 0 ? (
                  <p className="text-blue-700 dark:text-blue-300">
                    Stok fisik cocok sempurna dengan catatan komputer. Tidak ada perubahan stok.
                  </p>
                ) : difference > 0 ? (
                  <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                    Surplus Fisik: Stok komputer akan dinaikkan sebesar +{difference} {selectedPart.unit || 'pcs'}.
                  </p>
                ) : (
                  <p className="text-rose-700 dark:text-rose-300 font-medium">
                    Defisit Fisik: Ditemukan kekurangan {Math.abs(difference)} {selectedPart.unit || 'pcs'} (barang hilang, rusak, atau salah hitung). Stok komputer akan dikurangi.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reason textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alasan Penyesuaian (Wajib untuk Catatan Audit) *
            </label>
            <textarea
              rows="2"
              required
              placeholder="Contoh: Audit rutin akhir bulan, 1 botol bocor di rak, selisih perhitungan restock sebelumnya..."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {/* Quick preset reason buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 font-medium">Contoh Alasan:</span>
              {PRESET_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAlasan(preset)}
                  className="touch-target px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || !selectedPartId}
              className="touch-target px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 transition-colors shadow-none"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Rekonsiliasi...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Terapkan Penyesuaian Stok (Opname)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden shadow-none">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Riwayat Log Audit Stok Opname
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {historyPagination.total} Catatan Audit
          </span>
        </div>

        {historyError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2 border-b border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{historyError}</span>
          </div>
        )}

        {historyLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Memuat log riwayat opname...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">Belum ada riwayat audit stok opname</p>
            <p className="text-xs">Catatan audit fisik akan tercatat di sini setelah Anda menyimpan penyesuaian pertama.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 sm:px-4">Tanggal Audit</th>
                  <th className="py-3 px-3">SKU & Sparepart</th>
                  <th className="py-3 px-3 text-center">Stok Sistem Lama</th>
                  <th className="py-3 px-3 text-center">Stok Fisik Aktual</th>
                  <th className="py-3 px-3 text-center">Selisih</th>
                  <th className="py-3 px-3">Alasan Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {history.map((item) => {
                  const diff = item.difference ?? 0;
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Tanggal */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {formatDateIndo(item.date)}
                        </div>
                        {item.created_at && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {item.created_at.slice(11, 16)} WIB
                          </div>
                        )}
                      </td>

                      {/* SKU & Sparepart */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">
                          {item.sparepart_name || '-'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.sparepart_sku || '-'}
                        </div>
                      </td>

                      {/* Stok Sistem */}
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-600 dark:text-slate-400">
                        {item.system_stock} {item.sparepart_unit || 'pcs'}
                      </td>

                      {/* Stok Fisik */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {item.physical_stock} {item.sparepart_unit || 'pcs'}
                      </td>

                      {/* Selisih Badge */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono font-bold">
                        {diff === 0 ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            0 (Sesuai)
                          </span>
                        ) : diff > 0 ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                            +{diff}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                            {diff}
                          </span>
                        )}
                      </td>

                      {/* Alasan */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-sm truncate" title={item.reason}>
                        {item.reason}
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
              {historyPagination.total > 0 ? (historyPagination.page - 1) * historyPagination.limit + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.min(historyPagination.page * historyPagination.limit, historyPagination.total)}
            </span>{' '}
            dari{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{historyPagination.total}</span> catatan audit
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="text-slate-500">Per hal:</span>
              <select
                value={historyLimit}
                onChange={(e) => {
                  setHistoryLimit(Number(e.target.value));
                  setHistoryPage(1);
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
                onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                disabled={historyPage <= 1}
                className="touch-target px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-semibold flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-2 py-1 text-slate-700 dark:text-slate-300 font-medium">
                Hal {historyPage} dari {historyPagination.totalPages || 1}
              </span>

              <button
                onClick={() => setHistoryPage((prev) => Math.min(historyPagination.totalPages || 1, prev + 1))}
                disabled={historyPage >= (historyPagination.totalPages || 1)}
                className="touch-target px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-semibold flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
