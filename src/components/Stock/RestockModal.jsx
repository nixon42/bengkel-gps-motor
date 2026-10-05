import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowDownRight, Save, AlertCircle, Calendar, Hash, Truck, FileText, Camera, UploadCloud, Trash2 } from 'lucide-react';
import { compressImageClient } from '../../utils/imageCompressor.js';

export default function RestockModal({ isOpen, onClose, onSaved, initialPartId = null, spareparts = [] }) {
  const [formData, setFormData] = useState({
    sparepartId: '',
    qty: 1,
    tanggal: new Date().toISOString().slice(0, 10),
    buyPrice: 0,
    totalPrice: 0,
    supplier: '',
    invoiceNumber: '',
    catatan: ''
  });

  const [proofPhotoFile, setProofPhotoFile] = useState(null);
  const [proofPhotoPreview, setProofPhotoPreview] = useState('');
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const selectedPart = spareparts.find(p => p.id === (initialPartId || formData.sparepartId)) || spareparts[0];
      const partId = selectedPart?.id || '';
      const buyPrice = selectedPart?.buy_price || selectedPart?.hargaBeli || 0;

      setFormData({
        sparepartId: initialPartId || partId,
        qty: 1,
        tanggal: new Date().toISOString().slice(0, 10),
        buyPrice: buyPrice,
        totalPrice: buyPrice * 1,
        supplier: selectedPart?.supplier || '',
        invoiceNumber: '',
        catatan: ''
      });
      setProofPhotoFile(null);
      setProofPhotoPreview('');
      setError('');
    }
  }, [isOpen, initialPartId, spareparts]);

  if (!isOpen) return null;

  const handlePartChange = (e) => {
    const pId = e.target.value;
    const part = spareparts.find(p => p.id === pId);
    const bPrice = part?.buy_price || part?.hargaBeli || 0;
    setFormData(prev => ({
      ...prev,
      sparepartId: pId,
      buyPrice: bPrice,
      totalPrice: bPrice * prev.qty,
      supplier: part?.supplier || prev.supplier
    }));
  };

  const handleQtyChange = (e) => {
    const q = Math.max(1, parseInt(e.target.value, 10) || 1);
    setFormData(prev => ({
      ...prev,
      qty: q,
      totalPrice: q * (Number(prev.buyPrice) || 0)
    }));
  };

  const handlePriceChange = (e) => {
    const p = Math.max(0, Number(e.target.value) || 0);
    setFormData(prev => ({
      ...prev,
      buyPrice: p,
      totalPrice: prev.qty * p
    }));
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageClient(file);
    setProofPhotoFile(compressed);
    const previewUrl = URL.createObjectURL(compressed);
    setProofPhotoPreview(previewUrl);
  };

  const handleRemovePhoto = () => {
    setProofPhotoFile(null);
    if (proofPhotoPreview) {
      URL.revokeObjectURL(proofPhotoPreview);
    }
    setProofPhotoPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.sparepartId) {
      setError('Pilih sparepart yang akan di-restock');
      return;
    }
    if (formData.qty <= 0) {
      setError('Jumlah masuk minimal 1 unit');
      return;
    }

    try {
      setSaving(true);

      let uploadedPhotoUrl = undefined;
      if (proofPhotoFile) {
        const uploadData = new FormData();
        uploadData.append('receipt', proofPhotoFile);
        const upRes = await fetch('/api/finance/upload', {
          method: 'POST',
          body: uploadData,
          credentials: 'include'
        });
        if (upRes.ok) {
          const upJson = await upRes.json();
          uploadedPhotoUrl = upJson.url;
        }
      }

      const res = await fetch('/api/stock-movements/in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sparepartId: formData.sparepartId,
          qty: formData.qty,
          tanggal: formData.tanggal,
          buyPrice: formData.buyPrice,
          totalPrice: formData.totalPrice,
          supplier: formData.supplier.trim() || undefined,
          invoiceNumber: formData.invoiceNumber.trim() || undefined,
          catatan: formData.catatan.trim() || undefined,
          proofPhotoUrl: uploadedPhotoUrl
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan barang masuk');
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
            <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Barang Masuk (Restock Stok)
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Otomatis menambahkan jumlah stok di inventaris
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Sparepart Select */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Item Sparepart <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.sparepartId}
              onChange={handlePartChange}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
            >
              <option value="">-- Pilih Suku Cadang --</option>
              {spareparts.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name || p.nama} (Stok Saat Ini: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal & Qty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Masuk <span className="text-rose-500">*</span></span>
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
                Jumlah Masuk (Qty) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.qty}
                onChange={handleQtyChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Harga Beli Satuan & Total Modal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Harga Beli Satuan (Rp) <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.buyPrice}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Nilai Pembelian (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalPrice}
                onChange={e => setFormData({ ...formData, totalPrice: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Supplier & No Faktur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Supplier <span className="text-slate-400 font-normal">(Opsional)</span></span>
              </label>
              <input
                type="text"
                placeholder="Distributor / Toko Part"
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>No. Faktur / Nota <span className="text-slate-400 font-normal">(Opsional)</span></span>
              </label>
              <input
                type="text"
                placeholder="INV-XXXXX"
                value={formData.invoiceNumber}
                onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Catatan / Keterangan <span className="text-slate-400 font-normal">(Opsional)</span></span>
            </label>
            <input
              type="text"
              placeholder="Catatan tambahan batch pembelian..."
              value={formData.catatan}
              onChange={e => setFormData({ ...formData, catatan: e.target.value })}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Foto Bukti Nota / Faktur */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <span>Foto Bukti Nota / Faktur <span className="text-slate-400 font-normal">(Opsional)</span></span>
            </label>

            {proofPhotoPreview ? (
              <div className="flex items-center space-x-3 p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <img
                  src={proofPhotoPreview}
                  alt="Preview Nota"
                  className="w-14 h-14 object-cover rounded border border-slate-300 dark:border-slate-600 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {proofPhotoFile ? proofPhotoFile.name : 'Bukti nota terlampir'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Siap disimpan dengan stok masuk</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="touch-target w-9 h-9 flex items-center justify-center text-rose-500 hover:text-rose-700 rounded transition-colors"
                  title="Hapus foto nota"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="touch-target px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-none"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Buka Kamera (Foto Nota)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="touch-target px-3.5 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-none"
                  >
                    <UploadCloud className="w-4 h-4 text-slate-500" />
                    <span>Pilih dari Galeri</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Ambil foto fisik nota pembelian langsung dari kamera HP atau unggah dari memori.
                </p>
              </div>
            )}
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
              disabled={saving}
              className="touch-target px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Barang Masuk'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
