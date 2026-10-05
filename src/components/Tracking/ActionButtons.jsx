import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Phone } from 'lucide-react';

export default function ActionButtons({ trackingData }) {
  const [copied, setCopied] = useState(false);

  const token = trackingData?.repairOrder?.tracking_token || trackingData?.repairOrder?.trackingToken;
  const baseUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : '';
  const secureTrackingUrl = token 
    ? `${baseUrl}?token=${encodeURIComponent(token)}` 
    : (trackingData?.trackingUrl || (typeof window !== 'undefined' ? window.location.href : ''));

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(secureTrackingUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback
        fallbackCopy(secureTrackingUrl);
      });
    } else {
      fallbackCopy(secureTrackingUrl);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Ignored
    }
    document.body.removeChild(textArea);
  };

  const maskedPlate = trackingData?.plate_masked || trackingData?.repairOrder?.maskedPlate || 'Kendaraan';
  const workshopName = trackingData?.tenant?.name || 'Bengkel Mobil GPS Motor Kediri';
  const workshopPhone = trackingData?.tenant?.phone_wa || '0856-0330-7330';

  const shareText = `Halo, pantau proses servis kendaraan *${maskedPlate}* di *${workshopName}* secara live di link berikut:\n\n${secureTrackingUrl}`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const cleanPhone = workshopPhone.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
  const waChatUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo ${workshopName}, saya ingin menanyakan status servis kendaraan saya dengan plat ${maskedPlate}.`)}`;

  return (
    <div className="space-y-3">
      {/* Toast Alert when Copied */}
      {copied && (
        <div className="p-3 rounded bg-emerald-100 dark:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 text-xs font-semibold flex items-center justify-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
          <span>Link tracking berhasil disalin ke papan klip!</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="touch-target flex items-center justify-center space-x-2 px-4 py-3 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{copied ? 'Tersalin!' : 'Salin Link Tracking'}</span>
        </button>

        {/* Share via WhatsApp */}
        <a
          href={waShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target flex items-center justify-center space-x-2 px-4 py-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share via WhatsApp</span>
        </a>

        {/* Hubungi Bengkel WA */}
        <a
          href={waChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target flex items-center justify-center space-x-2 px-4 py-3 rounded border border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Tanya Bengkel WA</span>
        </a>
      </div>
    </div>
  );
}
