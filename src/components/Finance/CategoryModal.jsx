import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Lock, Check, AlertCircle } from 'lucide-react';

export default function CategoryModal({ 
  isOpen, 
  onClose, 
  categories = [], 
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory 
}) {
  const [activeTypeTab, setActiveTypeTab] = useState('ALL');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('EXPENSE');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onAddCategory({ name: newName.trim(), type: newType });
      setNewName('');
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menambahkan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setErrorMessage('');
  };

  const handleSaveEdit = async (catId) => {
    if (!editName.trim()) return;
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onUpdateCategory(catId, { name: editName.trim() });
      setEditingId(null);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catId, isDefault) => {
    if (isDefault) {
      setErrorMessage('Kategori sistem bawaan tidak dapat dihapus');
      return;
    }
    if (!window.confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      setErrorMessage('');
      await onDeleteCategory(catId);
    } catch (err) {
      setErrorMessage(err.message || 'Gagal menghapus kategori');
    }
  };

  const filteredCategories = categories.filter(c => {
    if (activeTypeTab === 'INCOME') return c.type === 'INCOME';
    if (activeTypeTab === 'EXPENSE') return c.type === 'EXPENSE';
    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Kelola Kategori Keuangan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Atur kategori pemasukan &amp; pengeluaran buku kas bengkel</p>
          </div>
          <button
            onClick={onClose}
            className="touch-target w-10 h-10 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup modal kelola kategori"
            title="Tutup Modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Add New Category Form */}
        <form onSubmit={handleAdd} className="p-6 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5">
            Tambah Kategori Baru
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="w-full sm:w-44 flex-shrink-0">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full h-11 px-3.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
              >
                <option value="EXPENSE">Pengeluaran (-)</option>
                <option value="INCOME">Pemasukan (+)</option>
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nama kategori (misal: Pajak & Retribusi)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-11 px-3.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !newName.trim()}
              className="touch-target px-4 h-11 bg-[#00a86b] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </form>

        {/* Filter Segmented Rail */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTypeTab('ALL')}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTypeTab === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTypeTab('INCOME')}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTypeTab === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pemasukan ({categories.filter(c => c.type === 'INCOME').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTypeTab('EXPENSE')}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTypeTab === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pengeluaran ({categories.filter(c => c.type === 'EXPENSE').length})
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="p-6 flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Tidak ada kategori yang sesuai
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                {editingId === cat.id ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 h-9 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(cat.id)}
                      className="touch-target w-9 h-9 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      title="Simpan"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="touch-target w-9 h-9 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300"
                      title="Batal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-bold tracking-wider uppercase flex-shrink-0 ${
                          cat.type === 'INCOME'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                        }`}
                      >
                        {cat.type === 'INCOME' ? 'Masuk' : 'Keluar'}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </span>
                      {cat.is_default && (
                        <span className="inline-flex items-center text-xs text-slate-400 dark:text-slate-500 font-medium ml-1">
                          <Lock className="w-3 h-3 mr-0.5" /> Bawaan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="touch-target w-8 h-8 flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Ubah nama kategori"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!cat.is_default ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.is_default)}
                          className="touch-target w-8 h-8 flex items-center justify-center text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Hapus kategori kustom"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-slate-600" title="Kategori default terkunci">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="touch-target px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
