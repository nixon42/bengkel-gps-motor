import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('Dist directory does not exist. Run vite build first.');
  process.exit(1);
}

const baseIndexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

function replaceMeta(html, { title, description, image, url }) {
  let res = html;

  // Title
  if (title) {
    res = res.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    res = res.replace(/(<meta\s+property=["']og:title["']\s+content=["'])[\s\S]*?(["'])/i, `$1${title}$2`);
    res = res.replace(/(<meta\s+name=["']twitter:title["']\s+content=["'])[\s\S]*?(["'])/i, `$1${title}$2`);
  }

  // Description
  if (description) {
    res = res.replace(/(<meta\s+name=["']description["']\s+content=["'])[\s\S]*?(["'])/i, `$1${description}$2`);
    res = res.replace(/(<meta\s+property=["']og:description["']\s+content=["'])[\s\S]*?(["'])/i, `$1${description}$2`);
    res = res.replace(/(<meta\s+name=["']twitter:description["']\s+content=["'])[\s\S]*?(["'])/i, `$1${description}$2`);
  }

  // Image
  if (image) {
    res = res.replace(/(<meta\s+property=["']og:image["']\s+content=["'])[\s\S]*?(["'])/i, `$1${image}$2`);
    res = res.replace(/(<meta\s+property=["']og:image:secure_url["']\s+content=["'])[\s\S]*?(["'])/i, `$1${image}$2`);
    res = res.replace(/(<meta\s+name=["']twitter:image["']\s+content=["'])[\s\S]*?(["'])/i, `$1${image}$2`);
  }

  // URL & Canonical
  if (url) {
    res = res.replace(/(<link\s+rel=["']canonical["']\s+href=["'])[\s\S]*?(["'])/i, `$1${url}$2`);
    res = res.replace(/(<meta\s+property=["']og:url["']\s+content=["'])[\s\S]*?(["'])/i, `$1${url}$2`);
    res = res.replace(/(<meta\s+name=["']twitter:url["']\s+content=["'])[\s\S]*?(["'])/i, `$1${url}$2`);
  }

  return res;
}

function writePage(subPath, htmlContent) {
  const targetDir = path.join(distDir, subPath);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetFile = path.join(targetDir, 'index.html');
  fs.writeFileSync(targetFile, htmlContent, 'utf8');
  console.log(`Generated static SEO page: ${path.relative(distDir, targetFile)}`);
}

// 1. Cek Status Servis Pages
const trackingHtml = replaceMeta(baseIndexHtml, {
  title: 'Cek Status Servis Kendaraan - Bengkel GPS Motor',
  description: 'Pantau progres perbaikan mobil Anda secara real-time: status pengerjaan stall lift, suku cadang, & dokumentasi foto tanpa perlu login.',
  image: 'https://bengkel.ueeee.my.id/images/og/og-tracking.jpg',
  url: 'https://bengkel.ueeee.my.id/bengkel-gps-motor/cek-status'
});

writePage('bengkel-gps-motor/cek-status', trackingHtml);

const genericTrackingHtml = replaceMeta(baseIndexHtml, {
  title: 'Cek Status Servis Kendaraan - Bengkel Mobil Mitra',
  description: 'Pantau progres perbaikan mobil Anda secara real-time: status pengerjaan stall lift, suku cadang, & dokumentasi foto tanpa perlu login.',
  image: 'https://bengkel.ueeee.my.id/images/og/og-tracking.jpg',
  url: 'https://bengkel.ueeee.my.id/cek-status'
});

writePage('cek-status', genericTrackingHtml);

// 2. Tenant Landing Page
const tenantLandingHtml = replaceMeta(baseIndexHtml, {
  title: 'Bengkel Mobil GPS Motor Kediri - Layanan Servis & Tracking Online',
  description: 'Bengkel mobil terpercaya di Kediri: servis berkala, tune up, ganti oli, overhaul, dan tracking pengerjaan real-time via WhatsApp.',
  image: 'https://bengkel.ueeee.my.id/images/og/og-landing.jpg',
  url: 'https://bengkel.ueeee.my.id/bengkel-gps-motor'
});

writePage('bengkel-gps-motor', tenantLandingHtml);

console.log('✓ Successfully generated all static Open Graph pages for WhatsApp sharing.');
