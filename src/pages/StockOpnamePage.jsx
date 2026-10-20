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
      {/* Executive Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Rekonsiliasi Stok Opname (Audit Fisik)
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Cocokkan stok komputer dengan hasil hitung fisik di rak gudang. Sistem secara otomatis mencatat selisih dan log alasan audit.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              {historyPagination.total} Catatan Audit
            </span>
          </div>
        </div>
      </div>

      {/* Opname Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Formulir Penyesuaian Stok Fisik
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih suku cadang, masukkan hitungan fisik, dan cantumkan alasan penyesuaian
            </p>
          </div>
        </div>

        {submitSuccess && (
          <div className="p-4 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {submitError && (
          <div className="p-4 mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOpname} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sparepart picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Sparepart yang Diaudit *
              </label>
              <select
                value={selectedPartId}
                onChange={handlePartSelect}
                required
                className="touch-target w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal Audit Opname *
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="touch-target w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono transition-all"
              />
            </div>
          </div>

          {/* Current Stock vs Physical Stock Discrepancy Card */}
          {selectedPart && (
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* System Stock */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Stok Sistem Komputer
                  </span>
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white block mt-1 tracking-tight">
                    {systemStock} <span className="text-xs font-normal text-slate-500">{selectedPart.unit || 'pcs'}</span>
                  </span>
                </div>

                {/* Input Physical Stock */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Hitung Fisik Aktual di Rak *
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={stokFisik}
                      onChange={(e) => setStokFisik(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="touch-target w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-bold font-mono focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-500 shrink-0">
                      {selectedPart.unit || 'pcs'}
                    </span>
                  </div>
                </div>

                {/* Real-Time Discrepancy (Selisih) */}
                <div className={`p-3.5 rounded-xl border ${
                  difference === 0 
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60' 
                    : difference > 0 
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60' 
                    : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                }`}>
                  <span className={`text-xs font-bold block ${
                    difference === 0 
                      ? 'text-blue-800 dark:text-blue-300' 
                      : difference > 0 
                      ? 'text-emerald-800 dark:text-emerald-300' 
                      : 'text-rose-800 dark:text-rose-300'
                  }`}>
                    Indikator Selisih (Fisik - Sistem)
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    {difference > 0 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : difference < 0 ? (
                      <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                    <span className={`text-2xl font-extrabold font-mono tracking-tight ${
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
              <div className="text-xs pt-1">
                {difference === 0 ? (
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    Stok fisik cocok sempurna dengan catatan komputer. Tidak ada perubahan saldo stok.
                  </p>
                ) : difference > 0 ? (
                  <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                    Surplus Fisik: Stok komputer akan otomatis dinaikkan sebesar +{difference} {selectedPart.unit || 'pcs'}.
                  </p>
                ) : (
                  <p className="text-rose-700 dark:text-rose-300 font-semibold">
                    Defisit Fisik: Ditemukan kekurangan {Math.abs(difference)} {selectedPart.unit || 'pcs'} (barang hilang, rusak, atau salah hitung). Stok komputer akan dikurangi.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reason textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Alasan Penyesuaian (Wajib untuk Catatan Audit) *
            </label>
            <textarea
              rows="2"
              required
              placeholder="Contoh: Audit rutin akhir bulan, 1 botol bocor di rak, selisih perhitungan restock sebelumnya..."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />

            {/* Quick preset reason buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-xs text-slate-400 font-semibold">Contoh Alasan:</span>
              {PRESET_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAlasan(preset)}
                  className="touch-target px-2.5 py-1.5 min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
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
              className="touch-target w-full sm:w-auto px-6 py-2.5 min-h-[44px] rounded-xl bg-[#00a86b] hover:bg-emerald-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
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

      {/* History Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Riwayat Log Audit Stok Opname
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daftar semua penyesuaian fisik beserta catatan selisih dan alasan audit
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            {historyPagination.total} Log
          </span>
        </div>

        {historyError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2 border-b border-rose-200 dark:border-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{historyError}</span>
          </div>
        )}

        {historyLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Memuat log riwayat opname...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-sm">Belum ada riwayat audit stok opname</p>
            <p className="text-xs">Catatan audit fisik akan tercatat di sini setelah Anda menyimpan penyesuaian pertama.</p>
          </div>
        ) : (
          <div>
            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((item) => {
                const diff = item.difference ?? 0;
                return (
                  <div key={item.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {formatDateIndo(item.date)}
                      </span>
                      {diff === 0 ? (
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                          0 (Sesuai)
                        </span>
                      ) : diff > 0 ? (
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                          +{diff}
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800">
                          {diff}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug">
                        {item.sparepart_name || '-'}
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.sparepart_sku || '-'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Sistem Komputer</span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {item.system_stock} {item.sparepart_unit || 'pcs'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Hitung Fisik</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {item.physical_stock} {item.sparepart_unit || 'pcs'}
                        </span>
                      </div>
                    </div>

                    {item.reason && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                        &ldquo;{item.reason}&rdquo;
                      </p>
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
                    <th className="py-3.5 px-4">Tanggal Audit</th>
                    <th className="py-3.5 px-4">SKU &amp; Sparepart</th>
                    <th className="py-3.5 px-4 text-center">Stok Sistem Lama</th>
                    <th className="py-3.5 px-4 text-center">Stok Fisik Aktual</th>
                    <th className="py-3.5 px-4 text-center">Selisih</th>
                    <th className="py-3.5 px-4">Alasan Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {history.map((item) => {
                    const diff = item.difference ?? 0;
                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Tanggal */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {formatDateIndo(item.date)}
                          </div>
                          {item.created_at && (
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              {item.created_at.slice(11, 16)} WIB
                            </div>
                          )}
                        </td>

                        {/* SKU & Sparepart */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white leading-snug">
                            {item.sparepart_name || '-'}
                          </div>
                          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.sparepart_sku || '-'}
                          </div>
                        </td>

                        {/* Stok Sistem */}
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-600 dark:text-slate-400">
                          {item.system_stock} {item.sparepart_unit || 'pcs'}
                        </td>

                        {/* Stok Fisik */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {item.physical_stock} {item.sparepart_unit || 'pcs'}
                        </td>

                        {/* Selisih Badge */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-bold">
                          {diff === 0 ? (
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                              0 (Sesuai)
                            </span>
                          ) : diff > 0 ? (
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                              +{diff}
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800">
                              {diff}
                            </span>
                          )}
                        </td>

                        {/* Alasan */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-sm truncate" title={item.reason}>
                          {item.reason}
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
              {historyPagination.total > 0 ? (historyPagination.page - 1) * historyPagination.limit + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(historyPagination.page * historyPagination.limit, historyPagination.total)}
            </span>{' '}
            dari{' '}
            <span className="font-bold text-slate-900 dark:text-white">{historyPagination.total}</span> catatan audit
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Per hal:</span>
              <select
                value={historyLimit}
                onChange={(e) => {
                  setHistoryLimit(Number(e.target.value));
                  setHistoryPage(1);
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
                onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                disabled={historyPage <= 1}
                className="touch-target px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className="px-2.5 py-1 text-slate-700 dark:text-slate-300 font-bold">
                Hal {historyPage} dari {historyPagination.totalPages || 1}
              </span>

              <button
                onClick={() => setHistoryPage((prev) => Math.min(historyPagination.totalPages || 1, prev + 1))}
                disabled={historyPage >= (historyPagination.totalPages || 1)}
                className="touch-target px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold flex items-center space-x-1 transition-colors"
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
