import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

const PublicTrackingPage = lazy(() => import('./pages/PublicTrackingPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SuperadminDashboard = lazy(() => import('./pages/SuperadminDashboard'));

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
      return { view: 'landing', slug: 'bengkel-gps-motor', plate: '' };
    }
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const plate = params.get('plate') || '';

    if (path.startsWith('/superadmin')) {
      return { view: 'superadmin', slug: tenant?.slug || 'bengkel-gps-motor', plate: '' };
    }

    if (path.includes('cek-status')) {
      const match = path.match(/^\/([^\/]+)\/cek-status/);
      const slug = match ? match[1] : (tenant?.slug || 'bengkel-gps-motor');
      return { view: 'tracking', slug, plate };
    }

    if (path.startsWith('/admin') || path.startsWith('/dashboard') || path === '/login' || path === '/masuk') {
      return { view: 'admin', slug: tenant?.slug || 'bengkel-gps-motor', plate: '' };
    }

    return { view: 'landing', slug: tenant?.slug || 'bengkel-gps-motor', plate: '' };
  };

  const [currentRoute, setCurrentRoute] = useState(parseRoute);

  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(parseRoute());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [tenant]);

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
    } else {
      newPath = '/';
    }

    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', newPath);
    }

    setCurrentRoute({
      view,
      slug,
      plate: extra.plate || ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentRoute.view === 'superadmin') {
    return (
      <Suspense fallback={<PageFallback />}>
        <SuperadminDashboard
          onNavigateAdmin={() => navigateTo('admin')}
          onNavigateLanding={() => navigateTo('landing')}
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
          onNavigateHome={() => navigateTo('landing')}
        />
      </Suspense>
    );
  }

  if (currentRoute.view === 'admin') {
    return (
      <Suspense fallback={<PageFallback />}>
        <AdminDashboard
          onNavigateLanding={() => navigateTo('landing')}
          onNavigateTracking={(plate) => navigateTo('tracking', { plate })}
          onNavigateSuperadmin={() => navigateTo('superadmin')}
        />
      </Suspense>
    );
  }

  return (
    <LandingPage
      onNavigateTracking={(plate) => navigateTo('tracking', { plate })}
      onOpenAdmin={() => navigateTo('admin')}
      onOpenSuperadmin={() => navigateTo('superadmin')}
    />
  );
}
