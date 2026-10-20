import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Car, 
  ArrowLeft, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Wrench, 
  Sun, 
  Moon, 
  ShieldCheck,
  History,
  Phone
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import StatusVisualizer from '../components/Tracking/StatusVisualizer';
import VehicleInfoCard from '../components/Tracking/VehicleInfoCard';
import PhotoGallery from '../components/Tracking/PhotoGallery';
import PartsListCard from '../components/Tracking/PartsListCard';
import ActionButtons from '../components/Tracking/ActionButtons';

export default function PublicTrackingPage({ 
  initialPlate = '', 
  initialToken = '',
  tenantSlug = 'bengkel-gps-motor',
  onNavigateHome 
}) {
  const { theme, toggleTheme } = useTheme();

  const [plateQuery, setPlateQuery] = useState(initialPlate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  // If initialPlate/initialToken provided or present in URL, auto-fetch
  useEffect(() => {
    if (initialToken) {
      fetchTracking({ token: initialToken });
    } else if (initialPlate) {
      setPlateQuery(initialPlate);
      fetchTracking({ plate: initialPlate });
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      const urlPlate = params.get('plate');
      if (urlToken) {
        fetchTracking({ token: urlToken });
      } else if (urlPlate) {
        setPlateQuery(urlPlate);
        fetchTracking({ plate: urlPlate });
      }
    }
  }, [initialPlate, initialToken]);

  const fetchTracking = async (target) => {
    let token = '';
    let plate = '';

    if (typeof target === 'object' && target !== null) {
      token = target.token ? target.token.trim() : '';
      plate = target.plate ? target.plate.trim() : '';
    } else if (typeof target === 'string') {
      plate = target.trim();
    } else {
      plate = (plateQuery || '').trim();
    }

    if (!token && !plate) {
      setError('Masukkan plat nomor kendaraan terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const slug = tenantSlug || 'bengkel-gps-motor';
      const queryString = token 
        ? `token=${encodeURIComponent(token)}`
        : `plate=${encodeURIComponent(plate)}`;
      const res = await fetch(`/api/public/${slug}/tracking?${queryString}`);
      if (!res.ok) {
        let msg = 'Data perbaikan tidak ditemukan.';
        try {
          const errJson = await res.json();
          if (errJson?.error) msg = errJson.error;
        } catch {
          if (res.status >= 500) {
            msg = 'Koneksi ke backend terputus. Pastikan server backend Express (port 3000) sudah dijalankan.';
          }
        }
        throw new Error(msg);
      }

      const json = await res.json();

      setData(json);
      if (token && json.plate_masked && !plateQuery) {
        setPlateQuery(json.plate_masked);
      }
      // Update browser URL query param cleanly with token for privacy protection
      if (window.history && window.history.replaceState) {
        const trkToken = json.repairOrder?.tracking_token || json.repairOrder?.trackingToken;
        const safeQuery = trkToken ? `token=${encodeURIComponent(trkToken)}` : queryString;
        const newUrl = `${window.location.pathname}?${safeQuery}`;
        window.history.replaceState(null, '', newUrl);
      }
    } catch (err) {
      setData(null);
      setError(err.message || 'Gagal mencari status servis. Periksa koneksi atau nomor plat.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTracking(plateQuery);
  };

  const handleDemoClick = (demoPlate) => {
    setPlateQuery(demoPlate);
    fetchTracking(demoPlate);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Back to Home & Workshop Title */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="touch-target p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center space-x-1"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded bg-[#0c2b5e] flex items-center justify-center text-white shrink-0 font-bold">
                <Wrench className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {data?.tenant?.name || 'Bengkel Mobil Mitra'}
                </h1>
                <span className="text-xs text-blue-700 dark:text-blue-400 block font-mono font-semibold">
                  Portal Pelacakan Publik (Zero-Login)
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle tema gelap/terang"
              className="touch-target w-10 h-10 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Search Header Banner */}
        <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-none">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-mono font-bold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Transparansi 100% • Real-Time Tracking</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Cek Status Servis Mobil Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Ketik plat nomor kendaraan Anda untuk memantau proses pengerjaan, dokumentasi foto, dan estimasi selesai secara real-time.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value)}
                placeholder="Contoh: AG 1822 AB"
                className="touch-target w-full uppercase px-4 py-3 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-base font-bold tracking-widest text-center placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="touch-target sm:w-auto px-6 py-3 rounded bg-[#0c2b5e] hover:bg-blue-900 active:bg-blue-950 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shrink-0 disabled:opacity-50 shadow-none"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>Lacak Progres</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Plate Helper */}
          <div className="max-w-xl mx-auto mt-3.5 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Uji coba plat:</span>
              <button
                type="button"
                onClick={() => handleDemoClick('AG 1822 AB')}
                className="touch-target px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[#0c2b5e] dark:text-blue-300 font-mono font-bold hover:underline"
              >
                AG 1822 AB (Avanza)
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('AG 1044 RK')}
                className="touch-target px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold hover:underline"
              >
                AG 1044 RK (Innova)
              </button>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Nama &amp; HP Disensor</span>
            </span>
          </div>
        </div>

        {/* Error / Not Found Box */}
        {error && (
          <div className="rounded border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-5 text-rose-900 dark:text-rose-200 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <p className="font-bold">Data Kendaraan Tidak Ditemukan</p>
              <p>{error}</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 pt-1">
                Tips: Pastikan penulisan plat nomor sesuai (contoh: <span className="font-mono font-bold">AG 1822 AB</span> atau <span className="font-mono font-bold">AG1822AB</span>). Jika kendaraan baru masuk hari ini, tunggu beberapa saat hingga data dicatat oleh teknisi.
              </p>
            </div>
          </div>
        )}

        {/* Loaded Tracking Content */}
        {data && data.repairOrder && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Quick Action Buttons (Share, Copy, Contact) */}
            <ActionButtons trackingData={data} />

            {/* 6-Stage Milestone Progress Stepper */}
            <StatusVisualizer 
              stages={data.milestones || data.stages} 
              currentStatus={data.repairOrder.status} 
            />

            {/* Vehicle & Order Info Card (Masked) */}
            <VehicleInfoCard repairOrder={data.repairOrder} />

            {/* Photo Gallery (Before, Progress, After) */}
            <PhotoGallery photos={data.photos} />

            {/* Parts List & Cost Summary (Stripped of buy prices) */}
            <PartsListCard 
              repairOrder={data.repairOrder} 
              spareparts={data.spareparts} 
            />

            {/* Vehicle Past Service History (if available) */}
            {data.history && data.history.length > 0 && (
              <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6 space-y-3">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Riwayat Servis Sebelumnya di Bengkel GPS
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-750">
                  {data.history.map((hist) => (
                    <div key={hist.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{hist.entry_date}</span>
                        <p className="text-slate-600 dark:text-slate-400">{hist.complaint || 'Perawatan berkala'}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-xs font-bold">
                          {hist.status}
                        </span>
                        {hist.total_cost > 0 && (
                          <div className="font-mono text-slate-800 dark:text-slate-200 font-semibold mt-0.5">
                            Rp {Number(hist.total_cost).toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Support Footer Card */}
            <div className="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Ada pertanyaan seputar pengerjaan servis?</span>
                <p className="text-slate-500 dark:text-slate-400">Hubungi langsung Service Advisor {data?.tenant?.name || 'Bengkel'} via WhatsApp.</p>
              </div>
              <a
                href={data.waContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target inline-flex items-center space-x-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold shrink-0 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{data?.tenant?.phone_wa || data?.tenant?.phone || 'Hubungi WhatsApp'}</span>
              </a>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} {data?.tenant?.name || 'Bengkel Mobil Mitra'} {data?.tenant?.address ? `• ${data.tenant.address}` : ''}</p>
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          Semua data pribadi pelanggan disamarkan otomatis untuk melindungi privasi.
        </p>
      </footer>

    </div>
  );
}
