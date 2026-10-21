/**
 * Meta tag manager for dynamic Open Graph & WhatsApp link sharing previews
 */

const DEFAULT_ORIGIN = 'https://bengkel.ueeee.my.id';

export const DEFAULT_META = {
  landing: {
    title: 'BengkelOS - Platform Cloud Manajemen & Tracking Servis Bengkel Mobil',
    description: 'Sistem operasi bengkel mobil modern: SPK digital, tracking servis real-time WhatsApp tanpa login, inventori suku cadang FIFO, dan kasir transparan.',
    image: `${DEFAULT_ORIGIN}/images/og/og-landing.jpg`,
    url: `${DEFAULT_ORIGIN}/`
  },
  tracking: {
    title: 'Cek Status Servis Kendaraan - Bengkel GPS Motor',
    description: 'Pantau progres perbaikan mobil Anda secara real-time: status pengerjaan stall lift, suku cadang, & dokumentasi foto tanpa perlu login.',
    image: `${DEFAULT_ORIGIN}/images/og/og-tracking.jpg`,
    url: `${DEFAULT_ORIGIN}/bengkel-gps-motor/cek-status`
  }
};

function setOrCreateMeta(attrName, attrVal, content) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function updateMetaTags({
  title,
  description,
  image,
  url
} = {}) {
  if (typeof document === 'undefined') return;

  const origin = window.location.origin || DEFAULT_ORIGIN;
  const canonicalUrl = url || window.location.href;
  const ogImage = image 
    ? (image.startsWith('http') ? image : `${origin}${image.startsWith('/') ? '' : '/'}${image}`)
    : `${origin}/images/og/og-landing.jpg`;

  if (title) {
    document.title = title;
    setOrCreateMeta('property', 'og:title', title);
    setOrCreateMeta('name', 'twitter:title', title);
  }

  if (description) {
    setOrCreateMeta('name', 'description', description);
    setOrCreateMeta('property', 'og:description', description);
    setOrCreateMeta('name', 'twitter:description', description);
  }

  if (ogImage) {
    setOrCreateMeta('property', 'og:image', ogImage);
    setOrCreateMeta('property', 'og:image:secure_url', ogImage);
    setOrCreateMeta('property', 'og:image:type', 'image/jpeg');
    setOrCreateMeta('property', 'og:image:width', '1200');
    setOrCreateMeta('property', 'og:image:height', '630');
    setOrCreateMeta('name', 'twitter:image', ogImage);
    setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
  }

  if (canonicalUrl) {
    setOrCreateMeta('property', 'og:url', canonicalUrl);
    setOrCreateMeta('name', 'twitter:url', canonicalUrl);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }
}
