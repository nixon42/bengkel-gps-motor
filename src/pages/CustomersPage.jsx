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
  ShieldCheck
} from 'lucide-react';

export default function CustomersPage() {
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

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Database Pelanggan CRM (Customer Management)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan data pemilik mobil, nomor WhatsApp, riwayat servis, dan daftar kendaraan terdaftar
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center justify-center space-x-2 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelanggan</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md pt-2 border-t border-slate-100 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-4.5" />
          <input
            type="text"
            placeholder="Cari nama, no. HP, alamat, plat kendaraan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Customer Cards & Directory */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500">Memuat basis data pelanggan...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            {error}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Belum ada data pelanggan yang tercatat.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {customers.map((c) => (
              <div key={c.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Customer Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {c.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                        {c.ro_count || 0}x Servis
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                      {c.address && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-xs">{c.address}</span>
                        </div>
                      )}
                      {c.last_visit && (
                        <div className="flex items-center space-x-1">
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
                            className="inline-flex items-center space-x-1 font-mono text-[11px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold"
                          >
                            <Car className="w-3 h-3 text-slate-300" />
                            <span>{v.plate_number}</span>
                            <span className="font-sans font-normal text-[10px] text-slate-300 ml-1">
                              ({v.brand} {v.model})
                            </span>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada kendaraan terdaftar</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Spending & Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Total Pengeluaran</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Rp {Number(c.total_spent || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenHistory(c)}
                        className="touch-target px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded text-xs font-bold flex items-center space-x-1"
                        title="Lihat riwayat servis"
                      >
                        <History className="w-3.5 h-3.5 text-blue-600" />
                        <span>Riwayat</span>
                      </button>
                      <button
                        onClick={() => handleOpenAddVehicle(c)}
                        className="touch-target px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-xs font-bold flex items-center space-x-1 border border-blue-200 dark:border-blue-900"
                        title="Tambah kendaraan"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Mobil</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="touch-target p-1.5 text-slate-600 hover:text-slate-900 dark:hover:text-white rounded"
                        title="Edit profil"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(c.id)}
                        className="touch-target p-1.5 text-red-500 hover:text-red-700 rounded"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Tambah Pelanggan Baru</span>
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="touch-target text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Joko Widodo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@contoh.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Domisili</label>
                  <input
                    type="text"
                    placeholder="Jl. Pemuda No. 12, Kediri"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
              </div>

              {/* Optional Vehicle Details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Kendaraan Pertama (Opsional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Plat Nomor</label>
                    <input
                      type="text"
                      placeholder="Contoh: AG 1822 AB"
                      value={formData.plateNumber}
                      onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                      className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Merek & Model</label>
                    <input
                      type="text"
                      placeholder="Contoh: Toyota Avanza"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full p-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="touch-target px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Data Pelanggan
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="touch-target px-3.5 py-2 text-slate-600 rounded font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tambah Mobil untuk {activeCustomer.name}
            </h3>
            <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Plat Nomor *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AG 1822 AB"
                  value={vehicleFormData.plateNumber}
                  onChange={(e) => setVehicleFormData({ ...vehicleFormData, plateNumber: e.target.value.toUpperCase() })}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750 font-mono font-bold uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Merek</label>
                  <input
                    type="text"
                    placeholder="Toyota"
                    value={vehicleFormData.brand}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, brand: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="Avanza"
                    value={vehicleFormData.model}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, model: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tahun</label>
                  <input
                    type="number"
                    placeholder="2019"
                    value={vehicleFormData.year}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, year: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Warna</label>
                  <input
                    type="text"
                    placeholder="Hitam"
                    value={vehicleFormData.color}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, color: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-750"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  className="touch-target px-3.5 py-2 text-slate-600 rounded font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-blue-600" />
                  <span>Riwayat Servis: {activeCustomer.name}</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{activeCustomer.phone}</p>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="touch-target text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {historyLoading ? (
              <div className="text-center py-8 text-xs text-slate-500">Memuat riwayat servis...</div>
            ) : customerHistory.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada riwayat order servis tercatat untuk pelanggan ini.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {customerHistory.map((ro) => (
                  <div key={ro.id} className="p-3.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                          {ro.plate_number}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {ro.car_brand} {ro.car_model}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Rp {Number(ro.total_cost || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>No. RO: {ro.ro_number} • Tgl: {ro.entry_date}</span>
                      <span className="font-bold uppercase text-slate-700 dark:text-slate-300">{ro.status}</span>
                    </div>
                    {ro.complaint && (
                      <p className="text-slate-600 dark:text-slate-300 italic pt-1">
                        "{ro.complaint}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
