import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

export default function PhotoGallery({ photos = [] }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };
    if (selectedPhoto) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  if (!photos || photos.length === 0) {
    return (
      <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 text-center shadow-none">
        <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Foto Dokumentasi</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Mekanik akan mengunggah foto sebelum, saat proses servis, dan sesudah perbaikan di stall bengkel.
        </p>
      </div>
    );
  }

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'BEFORE':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono font-bold text-xs uppercase">SEBELUM</span>;
      case 'PROGRESS':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono font-bold text-xs uppercase">PENGERJAAN</span>;
      case 'AFTER':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold text-xs uppercase">SESUDAH</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 font-mono font-bold text-xs uppercase">{stage}</span>;
    }
  };

  return (
    <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-none">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Dokumentasi Foto Perbaikan Asli
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
          {photos.length} Foto Live
        </span>
      </div>

      {/* Grid of Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedPhoto(item)}
            className="group cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 overflow-hidden flex flex-col hover:border-[#0c2b5e] dark:hover:border-blue-400 transition-colors shadow-none"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-video bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
              <img
                src={item.photo_url || item.photoUrl}
                alt={item.caption || 'Foto perbaikan servis'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.classList.add('bg-slate-100');
                }}
              />
              <div className="absolute top-2 left-2">
                {getStageBadge(item.stage)}
              </div>
            </div>

            {/* Caption */}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">
                {item.caption || 'Dokumentasi perbaikan bengkel'}
              </p>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-2 block">
                {item.created_at ? item.created_at.substring(0, 16) : 'Tercatat'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedPhoto.photo_url || selectedPhoto.photoUrl}
                alt={selectedPhoto.caption || 'Foto perbaikan'}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Tutup foto"
                className="touch-target absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="mb-1">{getStageBadge(selectedPhoto.stage)}</div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedPhoto.caption || 'Dokumentasi perbaikan bengkel'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
