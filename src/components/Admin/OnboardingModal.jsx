import React, { useState, useEffect } from 'react';
import { 
  Wrench, Sparkles, Building2, MapPin, Phone, Clock, 
  Camera, Upload, Check, CheckCircle2, ArrowRight, ShieldCheck, Image, X
} from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assetUrl';

const PRESET_PACKS = [
  {
    id: 'clean_pro',
    name: 'Modern Clean Bay (Rekomendasi)',
    hero: '/images/mockup/facility_inspection_clean.jpg',
    fac1: '/images/mockup/facility_lift_bay_clean.jpg',
    fac2: '/images/mockup/facility_inspection_clean.jpg'
  },
  {
    id: 'heavy_lift',
    name: 'Hydraulic Pit Focus',
    hero: '/images/mockup/hero_bay_clean.jpg',
    fac1: '/images/mockup/green-car-lift.jpg',
    fac2: '/images/gallery/facility-scanner.jpg'
  }
];

export default function OnboardingModal({ tenant, onComplete, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    tagline: tenant?.tagline || 'Layanan Servis & Perawatan Berkala Mobil Terpercaya',
    address: tenant?.address || '',
    phoneWa: tenant?.phone_wa || tenant?.phoneWa || '',
    businessHours: tenant?.business_hours || tenant?.businessHours || 'Senin - Sabtu: 08:00 - 17:00 WIB',
    heroImageUrl: tenant?.hero_image_url || '/images/mockup/facility_inspection_clean.jpg',
    facilityImage1: tenant?.facility_image_1 || '/images/mockup/facility_lift_bay_clean.jpg',
    facilityImage2: tenant?.facility_image_2 || '/images/mockup/facility_inspection_clean.jpg'
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingType, setUploadingType] = useState(null);

  const handleApplyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      heroImageUrl: preset.hero,
      facilityImage1: preset.fac1,
      facilityImage2: preset.fac2
    }));
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;
    try {
      setUploadingType(type);
      setErrorMsg('');
      const data = new FormData();
      data.append('photo', file);
      data.append('type', type);

      const res = await fetch('/api/tenant/photo', {
        method: 'POST',
        credentials: 'include',
        body: data
      });

      if (!res.ok) {
        throw new Error('Gagal mengunggah foto.');
      }

      const result = await res.json();
      if (result.photoUrl) {
        if (type === 'hero') setFormData(prev => ({ ...prev, heroImageUrl: result.photoUrl }));
        else if (type === 'facility1') setFormData(prev => ({ ...prev, facilityImage1: result.photoUrl }));
        else if (type === 'facility2') setFormData(prev => ({ ...prev, facilityImage2: result.photoUrl }));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal upload foto.');
    } finally {
      setUploadingType(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg('');
      await onComplete({
        ...formData,
        profileCompleted: true
      });
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan profil.');
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80"
      onClick={() => onClose && onClose()}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-[#0c2b5e] border-b border-slate-700 text-white p-4 sm:p-5 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Setup Awal Tenant
                </span>
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight">
                  Lengkapi Profil &amp; Landing Page Bengkel
                </h2>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 touch-target flex items-center justify-center text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                title="Tutup / Lewati (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-blue-100 mt-2">
            Identitas dan foto ini akan langsung tampil di halaman landing page publik bengkel Anda dan link WhatsApp tracking pelanggan.
          </p>
        </div>

        {/* Modal Form with Scrollable Body & Sticky Footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Profil & Kontak */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <Building2 className="w-4 h-4" /> 1. Identitas &amp; Kontak Operasional
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Resmi Bengkel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Bengkel Maju Lancar Motor"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline Promosi Utama (Judul Landing Page)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Contoh: BENGKEL TERPERCAYA KEDIRI: TRANSPARAN, JUJUR, BERGARANSI."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap Workshop *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. Raya Sambiresik No. 45, Kec. Gampengrejo, Kab. Kediri"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp Booking &amp; CS *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phoneWa}
                  onChange={(e) => setFormData({ ...formData, phoneWa: e.target.value })}
                  placeholder="085603307330"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jam Buka Operasional
                </label>
                <input
                  type="text"
                  value={formData.businessHours}
                  onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                  placeholder="Senin - Sabtu: 08:00 - 17:00 WIB"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Foto Workshop Landing Page */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <h3 className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> 2. Foto Workshop &amp; Fasilitas Servis
              </h3>

              {/* Preset Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500">Preset:</span>
                {PRESET_PACKS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="!min-h-0 !h-7 text-[11px] font-mono px-2.5 py-1 rounded border border-blue-500/30 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-bold transition-colors inline-flex items-center"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Photo 1: Hero Banner */}
              <div className="rounded border border-slate-200 dark:border-slate-700 p-3 space-y-2.5 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Foto Banner Utama
                  </span>
                </div>
                
                <div className="aspect-[16/10] rounded overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 relative">
                  <img 
                    src={resolveAssetUrl(formData.heroImageUrl)} 
                    alt="Preview Hero"
                    className="w-full h-full object-cover" 
                  />
                  {uploadingType === 'hero' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-mono">
                      Mengunggah...
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="touch-target cursor-pointer flex items-center justify-center space-x-1 w-full py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Unggah File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload('hero', e.target.files[0])}
                    />
                  </label>
                  <input
                    type="text"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    placeholder="URL Foto..."
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Photo 2: Facility 1 (Stall Lift) */}
              <div className="rounded border border-slate-200 dark:border-slate-700 p-3 space-y-2.5 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Foto Pit Lift Stall
                  </span>
                </div>
                
                <div className="aspect-[16/10] rounded overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 relative">
                  <img 
                    src={resolveAssetUrl(formData.facilityImage1)} 
                    alt="Preview Stall 1"
                    className="w-full h-full object-cover" 
                  />
                  {uploadingType === 'facility1' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-mono">
                      Mengunggah...
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="touch-target cursor-pointer flex items-center justify-center space-x-1 w-full py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Unggah File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload('facility1', e.target.files[0])}
                    />
                  </label>
                  <input
                    type="text"
                    value={formData.facilityImage1}
                    onChange={(e) => setFormData({ ...formData, facilityImage1: e.target.value })}
                    placeholder="URL Foto..."
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Photo 3: Facility 2 (Scanner) */}
              <div className="rounded border border-slate-200 dark:border-slate-700 p-3 space-y-2.5 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Foto Alat Scanner
                  </span>
                </div>
                
                <div className="aspect-[16/10] rounded overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 relative">
                  <img 
                    src={resolveAssetUrl(formData.facilityImage2)} 
                    alt="Preview Scanner"
                    className="w-full h-full object-cover" 
                  />
                  {uploadingType === 'facility2' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-mono">
                      Mengunggah...
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="touch-target cursor-pointer flex items-center justify-center space-x-1 w-full py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Unggah File</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload('facility2', e.target.files[0])}
                    />
                  </label>
                  <input
                    type="text"
                    value={formData.facilityImage2}
                    onChange={(e) => setFormData({ ...formData, facilityImage2: e.target.value })}
                    placeholder="URL Foto..."
                    className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

          {/* Sticky Modal Footer */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="touch-target w-full sm:w-auto px-4 py-2.5 rounded border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Lewati Untuk Sekarang
              </button>
            ) : <div />}
            <button
              type="submit"
              disabled={saving}
              className="touch-target w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-none"
            >
              {saving ? (
                <span>Menyimpan Profil...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Profil &amp; Buka Workspace Bengkel</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
