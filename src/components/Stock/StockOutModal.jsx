import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, Save, AlertCircle, Calendar, Wrench, FileText } from 'lucide-react';

export default function StockOutModal({ isOpen, onClose, onSaved, initialPartId = null, spareparts = [] }) {
  const [formData, setFormData] = useState({
    sparepartId: '',
    qty: 1,
    tanggal: new Date().toISOString().slice(0, 10),
    repairOrderId: '',
    catatan: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const selectedPart = spareparts.find(p => p.id === (initialPartId || formData.sparepartId)) || spareparts[0];
      setFormData({
        sparepartId: initialPartId || selectedPart?.id || '',
        qty: 1,
        tanggal: new Date().toISOString().slice(0, 10),
        repairOrderId: '',
        catatan: ''
      });
      setError('');
    }
  }, [isOpen, initialPartId, spareparts]);

  if (!isOpen) return null;

  const currentPart = spareparts.find(p => p.id === formData.sparepartId);
  const availableStock = currentPart?.stock ?? 0;
  const isUnderflow = formData.qty > availableStock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.sparepartId) {
      setError('Pilih sparepart yang akan dikeluarkan');
      return;
    }
    if (formData.qty <= 0) {
      setError('Jumlah keluar minimal 1 unit');
      return;
    }

    // E10 client pre-validation
    if (isUnderflow) {
      setError(`Stok tidak mencukupi (Tersedia: ${availableStock}, Diminta: ${formData.qty})`);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/stock-movements/out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sparepartId: formData.sparepartId,
          qty: formData.qty,
          tanggal: formData.tanggal,
          repairOrderId: formData.repairOrderId.trim() || undefined,
          catatan: formData.catatan.trim() || undefined
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan barang keluar');
      }

      onSaved?.(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-full max-w-lg my-8 p-5 sm:p-6 shadow-none text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Barang Keluar (Pemakaian Servis)
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Otomatis mengurangi jumlah stok di inventaris
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] touch-target flex items-center justify-center rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* E10 Stock Warning Box */}
        {isUnderflow && (
          <div className="mb-4 p-3 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Peringatan E10:</strong> Stok tidak mencukupi! Tersedia saat ini hanya {availableStock} unit, namun diminta {formData.qty} unit.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Sparepart Select */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Item Sparepart <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.sparepartId}
              onChange={e => setFormData({ ...formData, sparepartId: e.target.value })}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
            >
              <option value="">-- Pilih Suku Cadang --</option>
              {spareparts.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name || p.nama} (Tersedia: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Banner */}
          {currentPart && (
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Stok Saat Ini di Rak:</span>
              <span className={`font-mono font-bold text-sm ${availableStock === 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                {availableStock} {currentPart.unit || 'pcs'}
              </span>
            </div>
          )}

          {/* Tanggal & Qty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Keluar <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                required
                value={formData.tanggal}
                onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Dikeluarkan (Qty) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.qty}
                onChange={e => setFormData({ ...formData, qty: parseInt(e.target.value, 10) || 0 })}
                className={`w-full px-3 py-2 rounded border bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs ${
                  isUnderflow ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
            </div>
          </div>

          {/* Linked RO */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <Wrench className="w-3.5 h-3.5 text-slate-400" />
              <span>ID / Nomor Repair Order Servis <span className="text-slate-400 font-normal">(Opsional)</span></span>
            </label>
            <input
              type="text"
              placeholder="misal: RO-202610-001 atau Plat AG 1822 AB"
              value={formData.repairOrderId}
              onChange={e => setFormData({ ...formData, repairOrderId: e.target.value })}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-mono"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Catatan / Keterangan Pemakaian <span className="text-slate-400 font-normal">(Opsional)</span></span>
            </label>
            <input
              type="text"
              placeholder="misal: Dipasang untuk servis mobil Avanza ganti oli"
              value={formData.catatan}
              onChange={e => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="touch-target px-4 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || isUnderflow || availableStock <= 0}
              className={`touch-target px-4 py-2 rounded text-white font-semibold flex items-center space-x-1.5 transition-colors ${
                isUnderflow || availableStock <= 0 
                  ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Barang Keluar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
