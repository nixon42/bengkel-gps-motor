import React, { useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

export default function PhotoGallery({ photos = [] }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 text-center">
        <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Foto Dokumentasi</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Mekanik akan mengunggah foto sebelum, saat proses servis, dan sesudah perbaikan.
        </p>
      </div>
    );
  }

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'BEFORE':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 font-bold text-[10px]">SEBELUM</span>;
      case 'PROGRESS':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 font-bold text-[10px]">PROSES</span>;
      case 'AFTER':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold text-[10px]">SESUDAH</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 font-bold text-[10px]">{stage}</span>;
    }
  };

  return (
    <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Dokumentasi Foto Perbaikan
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {photos.length} Foto Tersedia
        </span>
      </div>

      {/* Grid of Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedPhoto(item)}
            className="group cursor-pointer rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 overflow-hidden flex flex-col hover:border-blue-500 transition-colors"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-video bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
              <img
                src={item.photo_url || item.photoUrl}
                alt={item.caption || 'Foto perbaikan servis'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="flex flex-col items-center justify-center p-4 text-slate-400 text-center">
                      <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <span class="text-[11px] font-semibold">Foto Dokumentasi Servis</span>
                    </div>
                  `;
                }}
              />
              <div className="absolute top-2 left-2">
                {getStageBadge(item.stage)}
              </div>
            </div>

            {/* Caption */}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
                {item.caption || 'Dokumentasi teknis pengerjaan'}
              </p>
              {item.created_at && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                  {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded border border-slate-700 overflow-hidden">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="touch-target absolute top-3 right-3 p-2 rounded bg-slate-800 hover:bg-slate-700 text-white z-10"
              aria-label="Tutup foto"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[75vh] flex items-center justify-center bg-black">
              <img
                src={selectedPhoto.photo_url || selectedPhoto.photoUrl}
                alt={selectedPhoto.caption || 'Foto servis'}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  {getStageBadge(selectedPhoto.stage)}
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedPhoto.created_at ? new Date(selectedPhoto.created_at).toLocaleString('id-ID') : ''}
                  </span>
                </div>
                <p className="text-sm font-semibold">{selectedPhoto.caption || 'Foto perbaikan servis'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
