/**
 * Centralized environment configuration and defaults for BengkelOS Multi-Tenant Platform
 * All defaults are driven by environment variables (VITE_* / NEXT_PUBLIC_*)
 * with safe multi-tenant fallback values.
 */

export const DEFAULT_TENANT_ID = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEFAULT_TENANT_ID) || 
  'tenant-gps-motor-kediri-01';

export const DEFAULT_WORKSHOP_NAME = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEFAULT_WORKSHOP_NAME) || 
  'Bengkel Mobil Mitra';

export const DEFAULT_WORKSHOP_TAGLINE = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEFAULT_WORKSHOP_TAGLINE) || 
  'Layanan Servis Mobil Modern, Transparan & Bergaransi';

export const DEFAULT_WORKSHOP_PHONE = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEFAULT_WORKSHOP_PHONE) || 
  '085603307330';

export const DEFAULT_WORKSHOP_ADDRESS = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEFAULT_WORKSHOP_ADDRESS) || 
  'Jl. Raya Sambiresik No. 45, Gampengrejo, Kediri, Jawa Timur';

export const DEFAULT_BUSINESS_HOURS = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEFAULT_BUSINESS_HOURS) || 
  'Senin - Sabtu: 08:00 - 17:00 WIB';

/**
 * Formats a raw phone string into a clean WhatsApp destination number (e.g. 62856...)
 * @param {string} phone
 * @returns {string}
 */
export function formatWhatsAppNumber(phone = '') {
  const digits = String(phone || DEFAULT_WORKSHOP_PHONE).replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  return digits;
}
