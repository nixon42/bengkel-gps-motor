import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Image as ImageIcon, AlertCircle, TrendingUp, TrendingDown, DollarSign, Camera, Upload, Trash2 } from 'lucide-react';

const COMMON_CATEGORIES = [
  'Oli',
  'Filter',
  'Rem',
  'Busi',
  'Bearing',
  'Bodi',
  'Kelistrikan',
  'Suspensi',
  'Transmisi',
  'Aksesoris',
  'Lainnya'
];

const COMMON_UNITS = ['pcs', 'set', 'liter', 'galon', 'botol', 'pack', 'meter'];

export default function PartFormModal({ isOpen, onClose, onSaved, initialData = null }) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Oli',
    customCategory: '',
    unit: 'pcs',
    stock: 0,
    min_stock: 5,
    buy_price: 0,
    sell_price: 0,
    supplier: '',
    photo_url: ''
  });

  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const isKnownCategory = COMMON_CATEGORIES.includes(initialData.category);
      setFormData({
        sku: initialData.sku || '',
        name: initialData.name || initialData.nama || '',
        category: isKnownCategory ? initialData.category : 'Lainnya',
        customCategory: isKnownCategory ? '' : (initialData.category || ''),
        unit: initialData.unit || initialData.satuan || 'pcs',
        stock: initialData.stock ?? initialData.stok ?? 0,
        min_stock: initialData.min_stock ?? initialData.stokMinimum ?? 5,
        buy_price: initialData.buy_price ?? initialData.hargaBeli ?? 0,
        sell_price: initialData.sell_price ?? initialData.hargaJual ?? 0,
        supplier: initialData.supplier || '',
        photo_url: initialData.photo_url || ''
      });
      setPhotoPreview(initialData.photo_url || '');
    } else {
      setFormData({
        sku: '',
        name: '',
        category: 'Oli',
        customCategory: '',
        unit: 'pcs',
        stock: 0,
        min_stock: 5,
        buy_price: 0,
        sell_price: 0,
        supplier: '',
        photo_url: ''
      });
      setPhotoPreview('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Realtime margin calculation (R3, E08, E09)
  const buyNum = Number(formData.buy_price) || 0;
  const sellNum = Number(formData.sell_price) || 0;
  const nominalMargin = sellNum - buyNum;

  let percentMargin = 0;
  if (sellNum > 0) {
    percentMargin = Math.round(((sellNum - buyNum) / sellNum) * 10000) / 100;
  } else if (sellNum === 0 && buyNum > 0) {
    percentMargin = -100;
  } else {
    percentMargin = 0; // E08 divide by zero safe fallback
  }

  const isLoss = nominalMargin < 0;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoPreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const data = new FormData();
    data.append('photo', file);

    try {
      setUploading(true);
      const res = await fetch('/api/inventory/upload', {
        method: 'POST',
        body: data,
        credentials: 'include'
      });
      const result = await res.json();
      if (res.ok && result.url) {
        setFormData(prev => ({ ...prev, photo_url: result.url }));
        setPhotoPreview(result.url);
      } else {
        setError(result.message || 'Gagal mengunggah foto');
      }
    } catch (err) {
      setError('Kesalahan koneksi saat upload foto: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const resolvedCategory = formData.category === 'Lainnya' && formData.customCategory.trim()
      ? formData.customCategory.trim()
      : formData.category;

    if (!formData.sku.trim()) {
      setError('SKU/Kode barang wajib diisi');
      return;
    }
    if (!formData.name.trim()) {
      setError('Nama sparepart wajib diisi');
      return;
    }

    const payload = {
      sku: formData.sku.trim().toUpperCase(),
      name: formData.name.trim(),
      category: resolvedCategory,
      unit: formData.unit.trim(),
      stock: Number(formData.stock) || 0,
      min_stock: Number(formData.min_stock) || 0,
      buy_price: Number(formData.buy_price) || 0,
      sell_price: Number(formData.sell_price) || 0,
      supplier: formData.supplier.trim() || null,
      photo_url: formData.photo_url || null
    };

    try {
      setSaving(true);
      const url = isEdit ? `/api/inventory/${initialData.id}` : '/api/inventory';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Gagal menyimpan sparepart');
      }

      onSaved(data.item || data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-full max-w-2xl my-8 p-5 sm:p-6 shadow-none text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center space-x-2 text-slate-900 dark:text-white">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span>{isEdit ? 'Ubah Data Sparepart' : 'Tambah Sparepart Baru'}</span>
          </h3>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: SKU & Nama */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode / SKU <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: OIL-HX7"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Sparepart <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: Oli Shell Helix HX7 10W-40 (4L)"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Row 2: Kategori & Satuan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
              >
                {COMMON_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            {formData.category === 'Lainnya' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Kustom
                </label>
                <input
                  type="text"
                  placeholder="Kategori spesifik"
                  value={formData.customCategory}
                  onChange={e => setFormData({ ...formData, customCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Satuan
              </label>
              <select
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
              >
                {COMMON_UNUNITS_MAP(formData.unit)}
              </select>
            </div>
          </div>

          {/* Row 3: Stok Saat Ini & Minimum Stok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stok Awal / Saat Ini
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batas Minimum Stok (Peringatan Kritis)
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Row 4: Harga Beli & Harga Jual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Harga Beli (Modal Rp)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.buy_price}
                onChange={e => setFormData({ ...formData, buy_price: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Harga Jual ke Pelanggan (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.sell_price}
                onChange={e => setFormData({ ...formData, sell_price: e.target.value })}
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* Realtime Profit Margin Box */}
          <div className={`p-3 rounded border text-xs flex items-center justify-between ${
            isLoss 
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200' 
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}>
            <div className="flex items-center space-x-2">
              {isLoss ? (
                <TrendingDown className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="block font-semibold">
                  {isLoss ? 'Posisi Jual Rugi (Loss)' : 'Margin Keuntungan Terkalkulasi:'}
                </span>
                <span className="text-[11px] opacity-80">
                  {isLoss 
                    ? 'Harga jual lebih rendah daripada harga beli (E09)' 
                    : 'Kalkulasi otomatis margin kotor per penjualan unit'}
                </span>
              </div>
            </div>
            <div className="text-right font-mono font-bold text-sm">
              <div>
                {nominalMargin < 0 ? `-Rp ${Math.abs(nominalMargin).toLocaleString('id-ID')}` : `Rp ${nominalMargin.toLocaleString('id-ID')}`}
              </div>
              <div className="text-xs">
                {percentMargin}%
              </div>
            </div>
          </div>

          {/* Row 5: Supplier Opsional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Supplier / Toko Onderdil <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="misal: PT Shell Indonesia / Toko Onderdil Lancar Jaya"
              value={formData.supplier}
              onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Row 6: Upload Foto & Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Foto Sparepart <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div className="flex items-start space-x-3.5">
              <div className="w-16 h-16 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                {/* Hidden File Inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* Mobile Camera and Gallery Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading}
                    className="touch-target px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-none"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Buka Kamera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="touch-target px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Galeri</span>
                  </button>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview('');
                        setFormData(prev => ({ ...prev, photo_url: '' }));
                      }}
                      className="touch-target p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <span className="block text-[11px] text-slate-400">
                  {uploading ? 'Mengunggah gambar...' : 'Langsung jepret dari kamera HP atau pilih dari galeri foto (Maks 5MB)'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="touch-target px-4 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="touch-target px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : (isEdit ? 'Perbarui Sparepart' : 'Simpan Sparepart')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function COMMON_UNUNITS_MAP(selectedUnit) {
  const units = [...new Set([...COMMON_UNITS, selectedUnit])].filter(Boolean);
  return units.map(u => (
    <option key={u} value={u}>{u}</option>
  ));
}
