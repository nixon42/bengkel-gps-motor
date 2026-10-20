import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Car,
  Clock,
  DollarSign,
  History,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  Check,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
  Send,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CustomersPage() {
  const { tenant } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // WhatsApp Promo Modal states
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [selectedCustomerForPromo, setSelectedCustomerForPromo] = useState(null);
  const [promoTemplate, setPromoTemplate] = useState('PROMO');
  const [promoMessage, setPromoMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    plateNumber: '',
    brand: '',
    model: '',
    year: '',
    color: ''
  });

  const [vehicleFormData, setVehicleFormData] = useState({
    plateNumber: '',
    brand: '',
    model: '',
    year: '',
    color: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCreateModalOpen(false);
        setEditModalOpen(false);
        setVehicleModalOpen(false);
        setHistoryModalOpen(false);
        setPromoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      params.set('page', page);
      params.set('limit', 20);

      const res = await fetch(`/api/customers?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Gagal memuat data pelanggan CRM');
      }
      const data = await res.json();
      setCustomers(data.customers || data.items || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      plateNumber: '',
      brand: '',
      model: '',
      year: '',
      color: ''
    });
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Nama dan No. WhatsApp wajib diisi!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Gagal menyimpan pelanggan');
      }

      setCreateModalOpen(false);
      setSuccessMsg('Pelanggan berhasil ditambahkan ke database CRM.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (customer) => {
    setActiveCustomer(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch(`/api/customers/${activeCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui data pelanggan');
      }

      setEditModalOpen(false);
      setSuccessMsg('Data profil pelanggan berhasil diperbarui.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!confirm('Hapus data pelanggan ini dari CRM?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setSuccessMsg('Pelanggan berhasil dihapus.');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchCustomers();
      }
    } catch {
      // Ignore
    }
  };

  const handleOpenHistory = async (customer) => {
    setActiveCustomer(customer);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}/history`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCustomerHistory(data.history || data.repair_orders || []);
      }
    } catch {
      setCustomerHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenAddVehicle = (customer) => {
    setActiveCustomer(customer);
    setVehicleFormData({
      plateNumber: '',
      brand: '',
      model: '',
      year: '',
      color: ''
    });
    setVehicleModalOpen(true);
  };

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleFormData.plateNumber.trim()) {
      alert('Plat nomor wajib diisi!');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/customers/${activeCustomer.id}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(vehicleFormData)
      });

      if (!res.ok) {
        throw new Error('Gagal menambahkan kendaraan');
      }

      setVehicleModalOpen(false);
      setSuccessMsg('Kendaraan berhasil didaftarkan untuk pelanggan ini.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp Promo & Marketing Handlers
  const generatePromoMessage = (customer, templateType) => {
    if (!customer) return '';
    const name = customer.name || 'Pelanggan Setia';
    const primaryVehicle = customer.vehicles && customer.vehicles.length > 0
      ? `${customer.vehicles[0].brand} ${customer.vehicles[0].model} (${customer.vehicles[0].plate_number})`
      : 'kendaraan Anda';
    const lastVisit = customer.last_visit || 'beberapa waktu lalu';
    const workshopName = tenant?.name || 'Bengkel Mobil';
    const workshopAddress = tenant?.address || tenant?.city || 'Workshop Kami';
    const workshopPhone = tenant?.phone_wa || tenant?.phone || '0812-3456-7890';

    if (templateType === 'PROMO') {
      return `Halo Bapak/Ibu *${name}*,\n\nAda kabar gembira dari *${workshopName}*! 🚗✨\n\nKami sedang ada *Promo Spesial Servis & Tune-Up*: Dapatkan diskon jasa servis 15% serta gratis pengecekan 25 titik komponen (rem, kelistrikan, oli, pendingin) untuk mobil kesayangan Anda *${primaryVehicle}*.\n\n📍 Lokasi: ${workshopAddress}\n📞 Booking & Konsultasi: ${workshopPhone}\n\nPromo berlaku terbatas. Balas pesan ini untuk booking antrian servis Anda sekarang ya!`;
    }

    if (templateType === 'REMINDER') {
      return `Halo Bapak/Ibu *${name}*,\n\nSemoga selalu sehat dan lancar beraktivitas. Mengingat kunjungan servis terakhir untuk mobil *${primaryVehicle}* tercatat pada *${lastVisit}*, kini saatnya untuk jadwal perawatan berkala & ganti oli rutin agar tarikan mesin tetap enteng, hemat BBM, dan prima di jalan.\n\nKami siap melayani Anda di *${workshopName}*:\n📍 Lokasi: ${workshopAddress}\n📞 Booking Antrian: ${workshopPhone}\n\nTerima kasih telah setia mempercayakan mobil Anda pada kami! 🙏`;
    }

    if (templateType === 'FOLLOWUP') {
      return `Halo Bapak/Ibu *${name}*,\n\nSalam dari *${workshopName}*! 🙏\n\nKami ingin menanyakan bagaimana performa dan kenyamanan mobil *${primaryVehicle}* setelah dilakukan servis di bengkel kami? Semoga tarikannya makin nyaman dan tidak ada kendala ya.\n\nKenyamanan dan kepuasan berkendara Anda adalah prioritas utama kami. Jika ada hal yang ingin ditanyakan atau butuh pengecekan ulang, jangan ragu untuk menghubungi kami kapan saja.\n\nTerima kasih banyak atas kepercayaannya!`;
    }

    return `Halo Bapak/Ibu *${name}*,\n\nSalam hangat dari *${workshopName}* terkait kendaraan Anda *${primaryVehicle}*.\n\n`;
  };

  const handleOpenWhatsAppPromo = (customer) => {
    setSelectedCustomerForPromo(customer);
    setPromoTemplate('PROMO');
    setPromoMessage(generatePromoMessage(customer, 'PROMO'));
    setPromoModalOpen(true);
  };

  const handleSelectPromoTemplate = (templateType) => {
    setPromoTemplate(templateType);
    setPromoMessage(generatePromoMessage(selectedCustomerForPromo, templateType));
  };

  const handleSendWhatsApp = () => {
    if (!selectedCustomerForPromo) return;
    const rawPhone = (selectedCustomerForPromo.phone || '').trim();
    if (!rawPhone) {
      alert('Nomor WhatsApp pelanggan belum terdaftar');
      return;
    }
    let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(promoMessage)}`;
    window.open(url, '_blank');
    setPromoModalOpen(false);
    setSuccessMsg(`Membuka WhatsApp untuk mengirim pesan ke ${selectedCustomerForPromo.name}`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                Database Pelanggan CRM
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pencatatan data pemilik mobil, nomor WhatsApp, riwayat servis, dan daftar kendaraan terdaftar
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenCreate}
              className="touch-target w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-[#00a86b] hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-colors shadow-sm shadow-emerald-500/10 order-1 sm:order-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pelanggan</span>
            </button>

            <button
              onClick={() => {
                if (customers.length > 0) {
                  handleOpenWhatsAppPromo(customers[0]);
                } else {
                  alert('Belum ada pelanggan terdaftar.');
                }
              }}
              className="touch-target w-full sm:w-auto px-3.5 py-2.5 min-h-[44px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors order-2 sm:order-1"
              title="Kirim pesan promosi WhatsApp ke pelanggan"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Kirim Promo WA</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, no. HP, alamat, plat kendaraan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-base sm:text-xs pl-10 pr-3.5 h-11 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Customer Cards & Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-none">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500">Memuat basis data pelanggan...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-500 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            Belum ada data pelanggan yang tercatat.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {customers.map((c) => (
              <div key={c.id} className="p-5 sm:p-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Customer Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {c.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                        {c.ro_count || 0}x Servis
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                      {c.address && (
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-xs">{c.address}</span>
                        </div>
                      )}
                      {c.last_visit && (
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Kunjungan terakhir: {c.last_visit}</span>
                        </div>
                      )}
                    </div>

                    {/* Vehicles list */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {c.vehicles && c.vehicles.length > 0 ? (
                        c.vehicles.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center space-x-1.5 font-mono text-xs bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-lg font-bold border border-slate-800"
                          >
                            <Car className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{v.plate_number}</span>
                            <span className="font-sans font-normal text-xs text-slate-300 ml-1">
                              ({v.brand} {v.model})
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum ada kendaraan terdaftar</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Spending & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Total Pengeluaran</span>
                      <span className="text-base font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                        Rp {Number(c.total_spent || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
                      <button
                        onClick={() => handleOpenWhatsAppPromo(c)}
                        className="touch-target px-3 py-2 min-h-[38px] bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-none shrink-0"
                        title="Kirim pesan promosi / WhatsApp ke pelanggan ini"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kirim WA</span>
                      </button>

                      <button
                        onClick={() => handleOpenHistory(c)}
                        className="touch-target px-3 py-2 min-h-[38px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors shrink-0"
                        title="Lihat riwayat servis"
                      >
                        <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Riwayat</span>
                      </button>
                      <button
                        onClick={() => handleOpenAddVehicle(c)}
                        className="touch-target px-3 py-2 min-h-[38px] bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-blue-200/80 dark:border-blue-900 transition-colors shrink-0"
                        title="Tambah kendaraan"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Mobil</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="touch-target w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                        title="Edit profil"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(c.id)}
                        className="touch-target w-9 h-9 flex items-center justify-center text-rose-500 hover:text-rose-700 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                        title="Hapus pelanggan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Tambah Pelanggan */}
      {createModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
          onClick={() => setCreateModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Pinned at top, shrink-0) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                    Tambah Pelanggan Baru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    Daftarkan kontak pemilik kendaraan ke CRM bengkel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="touch-target w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Joko Widodo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. WhatsApp <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="email@contoh.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Domisili</label>
                    <input
                      type="text"
                      placeholder="Jl. Pemuda No. 12, Kediri"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Optional Vehicle Details */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                  <span className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Kendaraan Pertama (Opsional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Plat Nomor</label>
                      <input
                        type="text"
                        placeholder="Contoh: AG 1822 AB"
                        value={formData.plateNumber}
                        onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Merek & Model</label>
                      <input
                        type="text"
                        placeholder="Contoh: Toyota Avanza"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions (Pinned at bottom, shrink-0) */}
              <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="touch-target px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="touch-target px-4 py-2 bg-[#00a86b] hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-sm shadow-emerald-500/10 transition-colors"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Pelanggan */}
      {editModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
          onClick={() => setEditModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-md w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Pinned at top, shrink-0) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                Edit Data Pelanggan
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="touch-target w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. WhatsApp <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Actions (Pinned at bottom, shrink-0) */}
              <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="touch-target px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="touch-target px-4 py-2 bg-[#00a86b] hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-sm shadow-emerald-500/10 transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Kendaraan ke Pelanggan */}
      {vehicleModalOpen && activeCustomer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
          onClick={() => setVehicleModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-md w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Pinned at top, shrink-0) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                Tambah Mobil untuk {activeCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => setVehicleModalOpen(false)}
                className="touch-target w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Plat Nomor <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AG 1822 AB"
                    value={vehicleFormData.plateNumber}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, plateNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Merek</label>
                    <input
                      type="text"
                      placeholder="Toyota"
                      value={vehicleFormData.brand}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, brand: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Model</label>
                    <input
                      type="text"
                      placeholder="Avanza"
                      value={vehicleFormData.model}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tahun</label>
                    <input
                      type="number"
                      placeholder="2019"
                      value={vehicleFormData.year}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Warna</label>
                    <input
                      type="text"
                      placeholder="Hitam"
                      value={vehicleFormData.color}
                      onChange={(e) => setVehicleFormData({ ...vehicleFormData, color: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Actions (Pinned at bottom, shrink-0) */}
              <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  className="touch-target px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="touch-target px-4 py-2 bg-[#00a86b] hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-sm shadow-emerald-500/10 transition-colors"
                >
                  Daftarkan Kendaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Riwayat Servis Pelanggan */}
      {historyModalOpen && activeCustomer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
          onClick={() => setHistoryModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Pinned at top, shrink-0) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                    Riwayat Servis: {activeCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{activeCustomer.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="touch-target w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="text-center py-10 text-xs text-slate-500">Memuat riwayat servis...</div>
              ) : customerHistory.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Belum ada riwayat order servis tercatat untuk pelanggan ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {customerHistory.map((ro) => (
                    <div key={ro.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-md text-xs border border-slate-800">
                            {ro.plate_number}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {ro.car_brand} {ro.car_model}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          Rp {Number(ro.total_cost || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                        <span>No. RO: {ro.ro_number} • Tgl: {ro.entry_date}</span>
                        <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{ro.status}</span>
                      </div>
                      {ro.complaint && (
                        <p className="text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/60 dark:border-slate-800">
                          "{ro.complaint}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer (Pinned at bottom, shrink-0) */}
            <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="touch-target px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kirim WhatsApp Promosi */}
      {promoModalOpen && selectedCustomerForPromo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
          onClick={() => setPromoModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Pinned at top, shrink-0) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                    Kirim WhatsApp Pelanggan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    Kirim pesan promosi, pengingat servis, atau follow-up secara personal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPromoModalOpen(false)}
                className="touch-target w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Tutup Modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {/* Recipient Details Card */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {selectedCustomerForPromo.name}
                  </span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {selectedCustomerForPromo.phone}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs flex items-center space-x-2">
                  <span>
                    Kendaraan:{' '}
                    {selectedCustomerForPromo.vehicles && selectedCustomerForPromo.vehicles.length > 0
                      ? `${selectedCustomerForPromo.vehicles[0].brand} ${selectedCustomerForPromo.vehicles[0].model} (${selectedCustomerForPromo.vehicles[0].plate_number})`
                      : 'Belum ada mobil terdaftar'}
                  </span>
                  {selectedCustomerForPromo.last_visit && (
                    <span>• Kunjungan: {selectedCustomerForPromo.last_visit}</span>
                  )}
                </div>
              </div>

              {/* Template Selector Pills */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Jenis Pesan / Template:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPromoTemplate('PROMO')}
                    className={`touch-target px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      promoTemplate === 'PROMO'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    Promo Servis
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPromoTemplate('REMINDER')}
                    className={`touch-target px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      promoTemplate === 'REMINDER'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    Ganti Oli / Rutin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPromoTemplate('FOLLOWUP')}
                    className={`touch-target px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      promoTemplate === 'FOLLOWUP'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    Follow-up Servis
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPromoTemplate('CUSTOM')}
                    className={`touch-target px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      promoTemplate === 'CUSTOM'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    Pesan Bebas
                  </button>
                </div>
              </div>

              {/* Editable Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Isi Pesan (Bisa diedit sebelum dikirim):
                  </label>
                  <span className="text-xs text-slate-400">
                    {promoMessage.length} karakter
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={promoMessage}
                  onChange={(e) => setPromoMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  placeholder="Tulis pesan promosi atau sapaan untuk pelanggan..."
                />
              </div>
            </div>

            {/* Modal Actions (Pinned at bottom, shrink-0) */}
            <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setPromoModalOpen(false)}
                className="touch-target px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="touch-target px-4 py-2 bg-[#00a86b] hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm shadow-emerald-500/10"
              >
                <Send className="w-4 h-4" />
                <span>Buka WhatsApp &amp; Kirim</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
