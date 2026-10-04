import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Wrench,
  CheckCircle2,
  Clock,
  Car,
  User,
  Phone,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Upload,
  FileText,
  Share2,
  ExternalLink,
  AlertCircle,
  Camera,
  Check,
  ChevronRight,
  ShieldCheck,
  Package
} from 'lucide-react';

const STAGE_ORDER = ['MASUK', 'DIAGNOSA', 'PENGERJAAN', 'MENUNGGU_PART', 'SELESAI', 'DIAMBIL'];

const STAGE_LABELS = {
  'MASUK': '1. Masuk',
  'DIAGNOSA': '2. Diagnosa',
  'PENGERJAAN': '3. Pengerjaan',
  'MENUNGGU_PART': '4. Tunggu Part',
  'SELESAI': '5. Selesai',
  'DIAMBIL': '6. Diambil'
};

const STAGE_COLORS = {
  'MASUK': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600',
  'DIAGNOSA': 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 border-sky-300 dark:border-sky-800',
  'PENGERJAAN': 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  'MENUNGGU_PART': 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
  'SELESAI': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  'DIAMBIL': 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 border-zinc-400 dark:border-zinc-600'
};

export default function RepairOrderDetailPage({ roId, onBack }) {
  const [ro, setRo] = useState(null);
  const [spareparts, setSpareparts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Status transition modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [autoRecordIncome, setAutoRecordIncome] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Spareparts modal
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState(0);
  const [partSubmitting, setPartSubmitting] = useState(false);

  // Photo upload
  const [photoStage, setPhotoStage] = useState('PROGRESS');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Cost editing
  const [editingCosts, setEditingCosts] = useState(false);
  const [serviceFeeInput, setServiceFeeInput] = useState(0);
  const [discountInput, setDiscountInput] = useState(0);

  const fetchRoDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/repair-orders/${roId}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Gagal memuat data Repair Order');
      }
      const data = await res.json();
      setRo(data.repair_order);
      setSpareparts(data.spareparts || []);
      setLogs(data.logs || []);
      setPhotos(data.photos || []);
      setCustomer(data.customer || null);
      setServiceFeeInput(data.repair_order?.service_fee || 0);
      setDiscountInput(data.repair_order?.discount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roId) {
      fetchRoDetails();
    }
  }, [roId]);

  const loadInventory = async () => {
    try {
      const res = await fetch('/api/inventory?limit=100', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInventoryList(data.items || data.spareparts || []);
      }
    } catch {
      // Ignore
    }
  };

  const handleOpenStatusModal = (status) => {
    setTargetStatus(status);
    setStatusNotes('');
    setAutoRecordIncome(status === 'DIAMBIL');
    setStatusModalOpen(true);
  };

  const handleSubmitStatus = async (e) => {
    e.preventDefault();
    try {
      setStatusSubmitting(true);
      const res = await fetch(`/api/repair-orders/${ro.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: targetStatus,
          catatan: statusNotes,
          autoRecordIncome,
          metodePembayaran: paymentMethod
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal memperbarui status');
      }

      setStatusModalOpen(false);
      setSuccessMsg(`Status berhasil diperbarui ke ${targetStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchRoDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleOpenPartModal = () => {
    loadInventory();
    setSelectedPartId('');
    setPartQty(1);
    setPartPrice(0);
    setPartModalOpen(true);
  };

  const handleSelectPart = (e) => {
    const id = e.target.value;
    setSelectedPartId(id);
    const found = inventoryList.find(p => p.id === id);
    if (found) {
      setPartPrice(found.sell_price || found.sellPrice || 0);
    }
  };

  const handleAddSparepart = async (e) => {
    e.preventDefault();
    if (!selectedPartId) return;

    try {
      setPartSubmitting(true);
      const res = await fetch(`/api/repair-orders/${ro.id}/spareparts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sparepartId: selectedPartId,
          qty: partQty,
          hargaSatuan: partPrice
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Gagal menambahkan suku cadang');
      }

      setPartModalOpen(false);
      setSuccessMsg('Suku cadang berhasil dipasang dan stok berkurang.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchRoDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setPartSubmitting(false);
    }
  };

  const handleRemoveSparepart = async (itemId) => {
    if (!confirm('Lepas suku cadang ini dan kembalikan stoknya ke gudang?')) return;

    try {
      const res = await fetch(`/api/repair-orders/${ro.id}/spareparts/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal melepas sparepart');
      }

      setSuccessMsg('Suku cadang berhasil dilepas dan stok inventaris dikembalikan.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchRoDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveCosts = async () => {
    try {
      const res = await fetch(`/api/repair-orders/${ro.id}/costs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service_fee: Number(serviceFeeInput),
          discount: Number(discountInput)
        })
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui rincian biaya');
      }

      setEditingCosts(false);
      setSuccessMsg('Biaya jasa dan diskon berhasil disimpan.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchRoDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!photoFile) return;

    try {
      setPhotoUploading(true);
      const fd = new FormData();
      fd.append('photo', photoFile);
      fd.append('stage', photoStage);
      fd.append('caption', photoCaption);

      const res = await fetch(`/api/repair-orders/${ro.id}/photos`, {
        method: 'POST',
        credentials: 'include',
        body: fd
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Gagal upload foto');
      }

      setPhotoFile(null);
      setPhotoCaption('');
      setSuccessMsg('Foto dokumentasi berhasil diunggah.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchRoDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Hapus foto dokumentasi ini?')) return;
    try {
      const res = await fetch(`/api/repair-orders/${ro.id}/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchRoDetails();
      }
    } catch {
      // Ignore
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/repair-orders/${ro.id}/invoice-pdf`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const trackingUrl = `${window.location.origin}/bengkel-gps-motor/cek-status?plate=${encodeURIComponent(ro.plate_number)}`;
    const msg = `Halo Bapak/Ibu *${ro.customer_name}*,\n\nBerikut informasi pengerjaan servis mobil *${ro.plate_number}* (${ro.car_brand} ${ro.car_model}) di *Bengkel Mobil GPS Motor Kediri*:\n\n• No. Order: *${ro.ro_number}*\n• Status: *${ro.status}*\n• Total Biaya: *Rp ${ro.total_cost?.toLocaleString('id-ID')}*\n\nPantau perkembangan servis & foto dokumentasi secara langsung melalui link:\n${trackingUrl}\n\nTerima kasih atas kepercayaannya.`;
    const cleanPhone = (ro.customer_phone || '').replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
        <p className="text-sm text-slate-500">Memuat rincian Repair Order...</p>
      </div>
    );
  }

  if (error || !ro) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-base font-bold text-slate-800 dark:text-slate-200">{error || 'Data tidak ditemukan'}</p>
        <button
          onClick={onBack}
          className="touch-target mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar</span>
        </button>
      </div>
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(ro.status);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="touch-target p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono bg-slate-900 text-white px-2.5 py-1 rounded text-sm font-bold tracking-wider">
                  {ro.plate_number}
                </span>
                <span className={`px-2.5 py-1 rounded text-xs font-bold border ${STAGE_COLORS[ro.status] || 'bg-slate-100 text-slate-800'}`}>
                  {ro.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {ro.car_brand} {ro.car_model} ({ro.car_year || '-'}) - {ro.customer_name}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                No. Order: {ro.ro_number} • Token: {ro.tracking_token} • Tanggal Masuk: {ro.entry_date}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="touch-target px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <span>Cetak Nota PDF</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="touch-target px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim WA</span>
            </button>
            <a
              href={`/bengkel-gps-motor/cek-status?plate=${encodeURIComponent(ro.plate_number)}`}
              target="_blank"
              rel="noreferrer"
              className="touch-target px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-xs font-bold flex items-center space-x-1.5 border border-blue-200 dark:border-blue-900"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Cek Tracking</span>
            </a>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* 6-Stage Lifecycle Stepper */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Tahapan Pengerjaan (6-Stage Lifecycle)</span>
          </h3>
          <button
            onClick={() => handleOpenStatusModal(STAGE_ORDER[Math.min(currentStageIndex + 1, STAGE_ORDER.length - 1)])}
            className="touch-target px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center space-x-1.5"
          >
            <span>Update Status</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STAGE_ORDER.map((stageKey, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = stageKey === ro.status;
            const logEntry = logs.find(l => l.new_status === stageKey);

            return (
              <div
                key={stageKey}
                onClick={() => handleOpenStatusModal(stageKey)}
                className={`cursor-pointer rounded p-3 border transition-all ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
                    : isCompleted
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold">
                    {STAGE_LABELS[stageKey]}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className={`w-4 h-4 ${isCurrent ? 'text-blue-600' : 'text-emerald-600'}`} />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {logEntry ? (
                    <span>{new Date(logEntry.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  ) : (
                    <span>Belum</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Column Details & Spareparts, Right Column Financials & Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle & Customer Info Card */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              Informasi Servis & Keluhan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-slate-500">Pemilik & Kontak</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ro.customer_name}</span>
                <span className="block text-xs font-mono text-slate-600 dark:text-slate-400">{ro.customer_phone || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Mekanik Penanggung Jawab</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ro.mechanic_name || 'Mas Agus Santoso'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Odometer Masuk</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {ro.odometer_in ? `${Number(ro.odometer_in).toLocaleString('id-ID')} km` : '-'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">Estimasi Selesai</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ro.estimated_completion || '-'}</span>
              </div>
              <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-750 p-3 rounded border border-slate-200 dark:border-slate-700">
                <span className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Keluhan Pelanggan:</span>
                <p className="text-slate-800 dark:text-slate-200 text-xs italic">{ro.complaint || '-'}</p>
              </div>
            </div>
          </div>

          {/* Attached Spareparts Table */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Suku Cadang & Sparepart Terpasang</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Pemakaian sparepart otomatis memotong stok gudang inventaris</p>
              </div>
              <button
                onClick={handleOpenPartModal}
                className="touch-target px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Pasang Sparepart</span>
              </button>
            </div>

            {spareparts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed border-slate-200 dark:border-slate-700">
                Belum ada suku cadang yang dipasang pada order ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Nama Suku Cadang</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {spareparts.map((sp) => (
                      <tr key={sp.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {sp.item_name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                          {sp.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                          Rp {Number(sp.unit_price).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          Rp {Number(sp.subtotal).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleRemoveSparepart(sp.id)}
                            className="touch-target p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                            title="Lepas dan kembalikan stok"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Photo Gallery Documentation */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Dokumentasi Foto Servis (Transparansi Pelanggan)</span>
            </h3>

            {/* Upload Box */}
            <form onSubmit={handleUploadPhoto} className="mb-6 p-4 bg-slate-50 dark:bg-slate-750 rounded border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Pilih File Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white"
                />
              </div>
              <div className="w-32">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Tahap</label>
                <select
                  value={photoStage}
                  onChange={(e) => setPhotoStage(e.target.value)}
                  className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                >
                  <option value="BEFORE">BEFORE (Awal)</option>
                  <option value="PROGRESS">PROGRESS (Pengerjaan)</option>
                  <option value="AFTER">AFTER (Selesai)</option>
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Keterangan / Caption</label>
                <input
                  type="text"
                  placeholder="Contoh: Kondisi busi lama aus"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="pt-5">
                <button
                  type="submit"
                  disabled={!photoFile || photoUploading}
                  className="touch-target px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center space-x-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{photoUploading ? 'Mengunggah...' : 'Unggah'}</span>
                </button>
              </div>
            </form>

            {/* Photos Grid */}
            {photos.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed border-slate-200 dark:border-slate-700">
                Belum ada foto yang diunggah.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((p) => (
                  <div key={p.id} className="relative rounded overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 group">
                    <img src={p.photo_url} alt={p.caption || 'Foto servis'} className="w-full h-32 object-cover" />
                    <div className="absolute top-1 left-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                        {p.stage}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePhoto(p.id)}
                      className="touch-target absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {p.caption && (
                      <div className="p-1.5 bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 truncate">
                        {p.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Financial Summary & Audit Logs) */}
        <div className="space-y-6">
          {/* Financial Breakdown Card */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Rincian Biaya & Tagihan</span>
              </h3>
              {!editingCosts ? (
                <button
                  onClick={() => setEditingCosts(true)}
                  className="touch-target text-xs text-blue-600 hover:underline font-bold"
                >
                  Edit Jasa
                </button>
              ) : (
                <button
                  onClick={handleSaveCosts}
                  className="touch-target text-xs bg-emerald-600 text-white px-2.5 py-1 rounded font-bold"
                >
                  Simpan
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal Biaya Jasa:</span>
                {editingCosts ? (
                  <input
                    type="number"
                    value={serviceFeeInput}
                    onChange={(e) => setServiceFeeInput(e.target.value)}
                    className="w-28 p-1 text-right border rounded bg-white dark:bg-slate-750 text-xs font-bold"
                  />
                ) : (
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Rp {Number(ro.service_fee || 0).toLocaleString('id-ID')}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal Suku Cadang:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Rp {Number(ro.sparepart_fee || 0).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Potongan / Diskon:</span>
                {editingCosts ? (
                  <input
                    type="number"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    className="w-28 p-1 text-right border rounded bg-white dark:bg-slate-750 text-xs font-bold text-red-600"
                  />
                ) : (
                  <span className="font-semibold text-red-600">
                    -Rp {Number(ro.discount || 0).toLocaleString('id-ID')}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">TOTAL BIAYA:</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  Rp {Number(ro.total_cost || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Riwayat Transisi Status</span>
            </h3>

            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-5 border-l-2 border-blue-500 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {log.previous_status ? `${log.previous_status} ➔ ` : ''}{log.new_status}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {log.actor_name} • {new Date(log.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {log.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic mt-1 bg-slate-50 dark:bg-slate-750 p-1.5 rounded">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Transition Status */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Perbarui Status Pengerjaan
            </h3>
            <form onSubmit={handleSubmitStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                >
                  {STAGE_ORDER.map((st) => (
                    <option key={st} value={st}>{STAGE_LABELS[st]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan Pengerjaan</label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Contoh: Penggantian busi selesai, siap uji jalan"
                  className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              </div>

              {targetStatus === 'DIAMBIL' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-bold text-emerald-900 dark:text-emerald-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRecordIncome}
                      onChange={(e) => setAutoRecordIncome(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Catat otomatis ke Buku Kas sebagai Pemasukan</span>
                  </label>
                  {autoRecordIncome && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Metode Pembayaran</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                      >
                        <option value="QRIS">QRIS Instan</option>
                        <option value="CASH">Tunai (CASH - Laci Kasir)</option>
                        <option value="TRANSFER">Transfer Bank</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="touch-target px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={statusSubmitting}
                  className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded"
                >
                  {statusSubmitting ? 'Menyimpan...' : 'Simpan Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Sparepart */}
      {partModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pasang Sparepart ke Repair Order
            </h3>
            <form onSubmit={handleAddSparepart} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Suku Cadang</label>
                <select
                  value={selectedPartId}
                  onChange={handleSelectPart}
                  required
                  className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                >
                  <option value="">-- Pilih dari Katalog Inventaris --</option>
                  {inventoryList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sku} - {item.name} (Stok: {item.stock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah (Qty)</label>
                  <input
                    type="number"
                    min="1"
                    value={partQty}
                    onChange={(e) => setPartQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    value={partPrice}
                    onChange={(e) => setPartPrice(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded text-xs flex justify-between font-bold">
                <span>Subtotal Penambahan:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  Rp {(partQty * partPrice).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPartModalOpen(false)}
                  className="touch-target px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={partSubmitting || !selectedPartId}
                  className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded"
                >
                  {partSubmitting ? 'Memproses...' : 'Pasang Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
