import React, { useEffect } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, receiptUrl, description = 'Bukti Transaksi' }) {
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

  if (!isOpen || !receiptUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Foto Bukti / Struk</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="touch-target w-10 h-10 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup preview struk"
            title="Tutup Modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950/60 min-h-[240px]">
          <img
            src={receiptUrl}
            alt="Bukti Struk Transaksi"
            className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Gambar Asli</span>
          </a>
          <button
            onClick={onClose}
            className="touch-target px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
