/**
 * Resolves static asset paths taking into account the Vite base path (e.g. /bengkel-gps-motor/ on GitHub Pages).
 * Preserves full URLs (https://, data:, blob:).
 *
 * @param {string} url - Relative or absolute asset path
 * @returns {string} Fully qualified asset path
 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  
  // If already an absolute URL (Supabase CDN, Google Maps, external HTTP, data URI, blob)
  if (/^(https?:|data:|blob:|\/\/)/i.test(url)) {
    return url;
  }

  const cleanPath = url.replace(/^\//, '');
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  
  return `${prefix}${cleanPath}`;
}

export default resolveAssetUrl;
