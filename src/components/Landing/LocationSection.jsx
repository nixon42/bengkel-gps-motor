import React from 'react';
import { MapPin, Clock, Phone, Navigation, MessageCircle, MapPinOff } from 'lucide-react';
import { DEFAULT_WORKSHOP_NAME, DEFAULT_WORKSHOP_ADDRESS, DEFAULT_BUSINESS_HOURS } from '../../utils/config';

export default function LocationSection({ tenant }) {
  const address = tenant?.address || DEFAULT_WORKSHOP_ADDRESS;
  const businessHours = tenant?.business_hours || tenant?.businessHours || DEFAULT_BUSINESS_HOURS;
  const rawPhone = tenant?.phone_wa || tenant?.phoneWa || '';
  const tenantName = tenant?.name || DEFAULT_WORKSHOP_NAME;

  // Phone validation: do not display fake or hardcoded numbers
  const isPlaceholderPhone = !rawPhone || 
    rawPhone === '0812-3456-7890' || 
    rawPhone === '081234567890' || 
    rawPhone === '085603307330' || 
    rawPhone === '-';
  const phoneWa = isPlaceholderPhone ? '' : rawPhone;
  const cleanWa = phoneWa ? phoneWa.replace(/\D/g, '').replace(/^0/, '62') : '';

  // Location & Google Maps Configuration
  const rawMapsEmbed = tenant?.maps_embed_url || tenant?.mapsEmbedUrl || '';
  const rawMapsUrl = tenant?.maps_url || tenant?.mapsUrl || '';
  const latitude = tenant?.latitude;
  const longitude = tenant?.longitude;

  // Extract embed src if full iframe tag was pasted by tenant
  let embedSrc = '';
  if (rawMapsEmbed) {
    if (rawMapsEmbed.includes('<iframe')) {
      const match = rawMapsEmbed.match(/src=["']([^"']+)["']/);
      embedSrc = match ? match[1] : '';
    } else if (rawMapsEmbed.startsWith('http')) {
      embedSrc = rawMapsEmbed;
    }
  }

  if (!embedSrc && latitude && longitude) {
    embedSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  if (!embedSrc && rawMapsUrl) {
    if (rawMapsUrl.includes('/maps/embed')) {
      embedSrc = rawMapsUrl;
    } else if (rawMapsUrl.startsWith('http')) {
      embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(rawMapsUrl)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // Address check: only auto-generate map search embed if tenant has a specific custom address
  const isGenericAddress = !address || 
    address === 'Jaringan Resmi Bengkel Mitra BengkelOS Indonesia' || 
    address === 'Indonesia' ||
    address === 'Jl. Raya Sambiresik No. 45, Gampengrejo, Kediri, Jawa Timur' ||
    address === 'Sambiresik, Kec. Gampengrejo, Kab. Kediri, Jawa Timur';

  if (!embedSrc && !isGenericAddress) {
    embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(tenantName + ' ' + address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  const hasConfiguredLocation = Boolean(embedSrc);
  const mapsExternalLink = rawMapsUrl || (!isGenericAddress ? `https://maps.google.com/?q=${encodeURIComponent(tenantName + ' ' + address)}` : '');

  return (
    <section id="lokasi" className="bg-slate-50 dark:bg-slate-950/50 py-12 md:py-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Lokasi Workshop &amp; Jam Operasional
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Kunjungi workshop {tenantName}. Kami siap melayani konsultasi langsung, cek berkala, dan penanganan darurat.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Details Card */}
          <div className="lg:col-span-5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-6 sm:p-7 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Address */}
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alamat Workshop</h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {address}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    (Akses mudah kendaraan roda empat &amp; area parkir luas)
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Jam Operasional</h3>
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 space-y-1">
                    <p><span className="font-semibold text-slate-900 dark:text-slate-200">Operasional:</span> {businessHours}</p>
                    <p><span className="font-semibold text-slate-900 dark:text-slate-200">Darurat:</span> Melalui Konfirmasi WhatsApp</p>
                  </div>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start space-x-3.5">
                <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                  phoneWa 
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Telepon &amp; WhatsApp Resmi</h3>
                  {phoneWa ? (
                    <p className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                      {phoneWa}
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 italic">
                      Belum dikonfigurasi
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {phoneWa ? 'Konsultasi teknis awal & estimasi ketersediaan pit servis' : 'Kontak WhatsApp workshop dapat diatur di Dashboard Pengaturan'}
                  </p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-2.5">
              {mapsExternalLink ? (
                <a
                  href={mapsExternalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target w-full flex items-center justify-center space-x-2 py-3 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Petunjuk Rute Google Maps</span>
                </a>
              ) : (
                <div className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm cursor-not-allowed select-none">
                  <Navigation className="w-4 h-4 text-slate-400" />
                  <span>Titik Peta Belum Diatur</span>
                </div>
              )}

              {cleanWa ? (
                <a
                  href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo ${tenantName}, saya ingin konsultasi layanan servis mobil.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target w-full flex items-center justify-center space-x-2 py-3 px-4 rounded border border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Chat WhatsApp Bengkel</span>
                </a>
              ) : (
                <div className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 font-bold text-xs sm:text-sm cursor-not-allowed select-none">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <span>WhatsApp Belum Dikonfigurasi</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Map Container */}
          <div className="lg:col-span-7 rounded border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 min-h-[380px] flex flex-col relative">
            {hasConfiguredLocation ? (
              <>
                <iframe
                  title={`Google Maps Lokasi ${tenantName}`}
                  src={embedSrc}
                  className="w-full h-full flex-1 border-0 min-h-[380px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Titik: {tenantName}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                  <span className="flex items-center space-x-1.5 font-medium truncate max-w-[280px] sm:max-w-none">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{address}</span>
                  </span>
                  {mapsExternalLink && (
                    <a
                      href={mapsExternalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-bold shrink-0 ml-2"
                    >
                      Buka di Google Maps ↗
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex-1 min-h-[380px] p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/60">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-xs">
                  <MapPinOff className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Titik Lokasi Workshop Belum Diatur
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2 leading-relaxed">
                  Titik peta interaktif Google Maps dapat dikonfigurasi langsung oleh pemilik bengkel melalui menu <span className="font-semibold text-slate-700 dark:text-slate-200">Pengaturan Profil</span> di Workspace.
                </p>
                {mapsExternalLink ? (
                  <a
                    href={mapsExternalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Cari Alamat di Google Maps ↗</span>
                  </a>
                ) : (
                  <div className="mt-5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
