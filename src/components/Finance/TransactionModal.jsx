import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Upload, Trash2, Calendar, FileText, DollarSign, CreditCard, AlertCircle } from 'lucide-react';

function formatRupiahPreview(val) {
  const num = Number(val);
  if (isNaN(num) || num <= 0) return 'Rp 0';
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  initialData = null,
  isEdit = false
}) {
  const [type, setType] = useState('EXPENSE');
  const [nominal, setNominal] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && isEdit) {
        setType(initialData.type || initialData.tipe || 'EXPENSE');
        setNominal(String(initialData.amount || initialData.nominal || ''));
        setCategoryId(initialData.category_id || initialData.categoryId || '');
        setDate(initialData.date || initialData.tanggal || new Date().toISOString().split('T')[0]);
        setPaymentMethod(initialData.payment_method || initialData.paymentMethod || 'CASH');
        setDescription(initialData.description || initialData.deskripsi || '');
        setReceiptPreview(initialData.receipt_url || initialData.receiptUrl || null);
        setReceiptFile(null);
      } else {
        // Defaults for new entry
        setType('INCOME');
        setNominal('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('CASH');
        setDescription('');
        setReceiptFile(null);
        setReceiptPreview(null);
      }
      setErrorMessage('');
    }
  }, [isOpen, initialData, isEdit]);

  // Set default category when type changes if category doesn't match type
  useEffect(() => {
    if (isOpen) {
      const available = categories.filter(c => c.type === type);
      const isCurrentValid = available.some(c => c.id === categoryId);
      if (!isCurrentValid && available.length > 0) {
        setCategoryId(available[0].id);
      }
    }
  }, [type, categories, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReceiptPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanAmount = Number(nominal);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setErrorMessage('Nominal transaksi harus lebih dari Rp 0');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Deskripsi transaksi wajib diisi');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Pilih kategori transaksi');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      // Build payload or FormData if file exists
      if (receiptFile) {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('tipe', type);
        formData.append('categoryId', categoryId);
        formData.append('kategoriId', categoryId);
        formData.append('amount', cleanAmount);
        formData.append('nominal', cleanAmount);
        formData.append('date', date);
        formData.append('tanggal', date);
        formData.append('description', description.trim());
        formData.append('deskripsi', description.trim());
        formData.append('paymentMethod', paymentMethod);
        formData.append('metodePembayaran', paymentMethod);
        formData.append('receipt', receiptFile);
        await onSubmit(formData, isEdit ? initialData?.id : null);
      } else {
        const payload = {
          type,
          tipe: type,
          categoryId,
          kategoriId: categoryId,
          amount: cleanAmount,
          nominal: cleanAmount,
          date,
          tanggal: date,
          description: description.trim(),
          deskripsi: description.trim(),
          paymentMethod,
          metodePembayaran: paymentMethod,
          receiptUrl: receiptPreview && typeof receiptPreview === 'string' && receiptPreview.startsWith('/uploads') ? receiptPreview : null
        };
        await onSubmit(payload, isEdit ? initialData?.id : null);
      }

      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCategories = categories.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80">
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-750">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Ubah Transaksi Kas' : 'Catat Transaksi Kas'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEdit ? 'Perbarui data transaksi yang sudah tercatat' : 'Masukkan rincian arus kas masuk atau keluar'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="touch-target w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded transition-colors"
            aria-label="Tutup form transaksi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Dual Mode Type Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`touch-target h-11 flex items-center justify-center space-x-2 rounded text-xs font-bold border transition-colors ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Pemasukan (+)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`touch-target h-11 flex items-center justify-center space-x-2 rounded text-xs font-bold border transition-colors ${
                type === 'EXPENSE'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pengeluaran (-)</span>
            </button>
          </div>

          {/* Nominal (Amount) Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nominal (Rp) <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {formatRupiahPreview(nominal)}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="w-full h-11 pl-9 pr-3 text-sm font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                required
              >
                {availableCategories.length === 0 ? (
                  <option value="">Belum ada kategori</option>
                ) : (
                  availableCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-3 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['CASH', 'TRANSFER', 'QRIS'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`touch-target h-11 flex items-center justify-center space-x-1.5 rounded text-xs font-bold border transition-colors ${
                    paymentMethod === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{m === 'CASH' ? 'Tunai (CASH)' : m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi / Keterangan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Jasa servis tune up Avanza AG 1822 AB"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Receipt Attachment (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Lampiran Bukti Struk / Nota <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            {receiptPreview ? (
              <div className="relative border border-slate-200 dark:border-slate-600 rounded p-2 flex items-center space-x-3 bg-slate-50 dark:bg-slate-700/50">
                <img
                  src={receiptPreview}
                  alt="Preview Nota"
                  className="w-12 h-12 object-cover rounded border border-slate-300 dark:border-slate-600"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {receiptFile ? receiptFile.name : 'Bukti struk terlampir'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Siap disimpan</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="touch-target w-9 h-9 flex items-center justify-center text-rose-500 hover:text-rose-700 rounded transition-colors"
                  title="Hapus foto nota"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="touch-target border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 rounded p-3 flex items-center justify-center space-x-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer bg-slate-50/50 dark:bg-slate-700/30 transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Pilih Foto Bukti Struk (JPG, PNG, WebP)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="touch-target px-4 py-2.5 rounded border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`touch-target px-5 py-2.5 rounded text-white text-xs font-bold transition-colors disabled:opacity-50 ${
                type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? 'Menyimpan...' : (isEdit ? 'Perbarui Transaksi' : `Simpan ${type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}`)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
