import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import { updateMetaTags } from './utils/meta';
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AppPlatformLandingPage = lazy(() => import('./pages/AppPlatformLandingPage'));
const PublicTrackingPage = lazy(() => import('./pages/PublicTrackingPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SuperadminDashboard = lazy(() => import('./pages/SuperadminDashboard'));
const DocsPage = lazy(() => import('./pages/DocsPage'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Memuat halaman...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { tenant } = useAuth();

  const parseRoute = () => {
    if (typeof window === 'undefined') {
      return { view: 'platform', slug: 'bengkel-gps-motor', plate: '', section: '' };
    }
    const rawPath = window.location.pathname;
    // Strip repository name if hosted on username.github.io/bengkel-gps-motor
    const isRepoSubpath = typeof window !== 'undefined' && 
      window.location.hostname.endsWith('github.io') && 
      rawPath.startsWith('/bengkel-gps-motor');
    const path = isRepoSubpath ? (rawPath.replace(/^\/bengkel-gps-motor/, '') || '/') : rawPath;
    const params = new URLSearchParams(window.location.search);
    const plate = params.get('plate') || '';

    if (path.startsWith('/superadmin')) {
      return { view: 'superadmin', slug: tenant?.slug || 'bengkel-gps-motor', plate: '', section: '' };
    }

    if (path === '/panduan' || path === '/docs' || path.startsWith('/panduan/') || path.startsWith('/docs/')) {
      const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
      return { 
        view: 'docs', 
        slug: tenant?.slug || 'bengkel-gps-motor', 
        plate: '', 
        section: hash || params.get('topic') || '' 
      };
    }

    if (path.includes('cek-status')) {
      const match = path.match(/^\/([^\/]+)\/cek-status/);
      const slug = match ? match[1] : (tenant?.slug || 'bengkel-gps-motor');
      return { view: 'tracking', slug, plate, section: '' };
    }

    if (path.startsWith('/admin') || path.startsWith('/dashboard') || path === '/login' || path === '/masuk') {
      return { view: 'admin', slug: tenant?.slug || 'bengkel-gps-motor', plate: '', section: '' };
    }

    if (path.startsWith('/bengkel/')) {
      const slug = path.replace('/bengkel/', '').split('/')[0] || 'bengkel-gps-motor';
      return { view: 'tenant', slug, plate: '', section: '' };
    }

    if (path === '/bengkel-gps-motor' || path === '/demo') {
      return { view: 'tenant', slug: 'bengkel-gps-motor', plate: '', section: '' };
    }

    if (path === '/' || path === '/platform' || path === '/app') {
      return { view: 'platform', slug: 'bengkel-gps-motor', plate: '', section: '' };
    }

    // Single segment custom tenant slug fallback
    const singleSegment = path.replace(/^\//, '').split('/')[0];
    const reserved = ['admin', 'superadmin', 'docs', 'panduan', 'login', 'masuk', 'platform', 'app'];
    if (singleSegment && !reserved.includes(singleSegment)) {
      return { view: 'tenant', slug: singleSegment, plate: '', section: '' };
    }

    return { view: 'platform', slug: 'bengkel-gps-motor', plate: '', section: '' };
  };

  const [currentRoute, setCurrentRoute] = useState(parseRoute);

  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(parseRoute());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [tenant]);

  // Dynamic document.title & Open Graph meta tags per active route & tenant
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const workshopName = tenant?.name || 'Bengkel Mobil Mitra';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bengkel.ueeee.my.id';
    const slug = tenant?.slug || 'bengkel-gps-motor';

    switch (currentRoute.view) {
      case 'platform':
        updateMetaTags({
          title: 'BengkelOS - Platform Cloud Manajemen & Tracking Servis Bengkel Mobil',
          description: 'Sistem operasi bengkel mobil modern: SPK digital, tracking servis real-time WhatsApp tanpa login, inventori suku cadang FIFO, dan kasir transparan.',
          image: `${origin}/images/og/og-landing.jpg`,
          url: `${origin}/`
        });
        break;
      case 'tenant':
      case 'landing':
        updateMetaTags({
          title: `${workshopName} - Layanan Servis & Tracking Online`,
          description: `Bengkel mobil terpercaya di ${tenant?.address || 'Kediri'}: servis berkala, tune up, ganti oli, overhaul, dan tracking pengerjaan real-time via WhatsApp.`,
          image: `${origin}/images/og/og-landing.jpg`,
          url: `${origin}/${slug}`
        });
        break;
      case 'tracking':
        updateMetaTags({
          title: `Cek Status Servis Kendaraan - ${workshopName}`,
          description: `Pantau progres perbaikan mobil Anda di ${workshopName} secara real-time: status pengerjaan stall lift, suku cadang, & dokumentasi foto tanpa perlu login.`,
          image: `${origin}/images/og/og-tracking.jpg`,
          url: `${origin}/${slug}/cek-status`
        });
        break;
      case 'admin':
        updateMetaTags({
          title: `Portal Bengkel - ${workshopName}`,
          description: `Portal manajemen internal bengkel ${workshopName}.`,
          url: `${origin}/admin`
        });
        break;
      case 'superadmin':
        updateMetaTags({
          title: 'Superadmin Control Center - BengkelOS',
          description: 'Pusat kontrol multi-tenant sistem bengkel mobil.',
          url: `${origin}/superadmin`
        });
        break;
      case 'docs':
      case 'panduan':
        updateMetaTags({
          title: 'Panduan & Dokumentasi - BengkelOS',
          description: 'Dokumentasi lengkap alur operasional dan integrasi sistem bengkel mobil BengkelOS.',
          url: `${origin}/panduan`
        });
        break;
      default:
        updateMetaTags({
          title: 'BengkelOS - Platform Cloud Manajemen Bengkel Mobil',
          description: 'Sistem operasi bengkel modern dengan tracking servis transparan & pembukuan kas terintegrasi.',
          image: `${origin}/images/og/og-landing.jpg`,
          url: `${origin}/`
        });
    }
  }, [currentRoute.view, tenant]);

  const navigateTo = (view, extra = {}) => {
    const slug = extra.slug || tenant?.slug || 'bengkel-gps-motor';
    let newPath = '/';
    if (view === 'tracking') {
      const query = extra.plate ? `?plate=${encodeURIComponent(extra.plate)}` : '';
      newPath = `/${slug}/cek-status${query}`;
    } else if (view === 'admin') {
      newPath = '/admin';
    } else if (view === 'superadmin') {
      newPath = '/superadmin';
    } else if (view === 'docs' || view === 'panduan') {
      const anchor = extra.section ? `#${extra.section}` : '';
      newPath = `/panduan${anchor}`;
    } else if (view === 'tenant' || view === 'landing') {
      newPath = slug === 'bengkel-gps-motor' ? '/bengkel-gps-motor' : `/bengkel/${slug}`;
    } else if (view === 'platform') {
      newPath = '/';
    } else {
      newPath = '/';
    }

    const isRepoSubpath = typeof window !== 'undefined' && 
      window.location.hostname.endsWith('github.io') && 
      window.location.pathname.startsWith('/bengkel-gps-motor');
    const fullPath = isRepoSubpath ? `/bengkel-gps-motor${newPath}` : newPath;

    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', fullPath);
    }

    setCurrentRoute({
      view,
      slug,
      plate: extra.plate || '',
      section: extra.section || ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentRoute.view === 'superadmin') {
    return (
      <Suspense fallback={<PageFallback />}>
        <SuperadminDashboard
          onNavigateAdmin={() => navigateTo('admin')}
          onNavigateLanding={() => navigateTo('platform')}
          onNavigateDocs={(section) => navigateTo('docs', { section })}
        />
      </Suspense>
    );
  }

  if (currentRoute.view === 'tracking') {
    return (
      <Suspense fallback={<PageFallback />}>
        <PublicTrackingPage
          initialPlate={currentRoute.plate}
          tenantSlug={currentRoute.slug || tenant?.slug || 'bengkel-gps-motor'}
          onNavigateHome={() => navigateTo('tenant', { slug: currentRoute.slug })}
        />
      </Suspense>
    );
  }

  if (currentRoute.view === 'docs' || currentRoute.view === 'panduan') {
    return (
      <Suspense fallback={<PageFallback />}>
        <DocsPage
          initialSection={currentRoute.section}
          onNavigateHome={() => navigateTo('platform')}
          onNavigateAdmin={() => navigateTo('admin')}
          onNavigateTracking={(plate) => navigateTo('tracking', { plate })}
        />
      </Suspense>
    );
  }

  if (currentRoute.view === 'admin') {
    return (
      <Suspense fallback={<PageFallback />}>
        <AdminDashboard
          onNavigateLanding={() => navigateTo('tenant', { slug: tenant?.slug || 'bengkel-gps-motor' })}
          onNavigateTracking={(plate) => navigateTo('tracking', { plate })}
          onNavigateSuperadmin={() => navigateTo('superadmin')}
          onNavigateDocs={(section) => navigateTo('docs', { section })}
        />
      </Suspense>
    );
  }

  if (currentRoute.view === 'platform') {
    return (
      <Suspense fallback={<PageFallback />}>
        <AppPlatformLandingPage
          onNavigateTenant={(slug) => navigateTo('tenant', { slug })}
          onOpenAdmin={() => navigateTo('admin')}
          onOpenSuperadmin={() => navigateTo('superadmin')}
          onNavigateDocs={(section) => navigateTo('docs', { section })}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <LandingPage
        tenantSlug={currentRoute.slug || 'bengkel-gps-motor'}
        onNavigateTracking={(plate) => navigateTo('tracking', { plate, slug: currentRoute.slug })}
        onOpenAdmin={() => navigateTo('admin')}
        onOpenSuperadmin={() => navigateTo('superadmin')}
        onNavigateDocs={(section) => navigateTo('docs', { section })}
        onNavigatePlatform={() => navigateTo('platform')}
      />
    </Suspense>
  );
}
