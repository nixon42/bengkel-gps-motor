import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import PublicTrackingPage from './pages/PublicTrackingPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const { tenant } = useAuth();

  const parseRoute = () => {
    if (typeof window === 'undefined') {
      return { view: 'landing', slug: 'bengkel-gps-motor', plate: '' };
    }
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const plate = params.get('plate') || '';

    if (path.includes('cek-status')) {
      const match = path.match(/^\/([^\/]+)\/cek-status/);
      const slug = match ? match[1] : (tenant?.slug || 'bengkel-gps-motor');
      return { view: 'tracking', slug, plate };
    }

    if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
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

  if (currentRoute.view === 'tracking') {
    return (
      <PublicTrackingPage
        initialPlate={currentRoute.plate}
        tenantSlug={currentRoute.slug || tenant?.slug || 'bengkel-gps-motor'}
        onNavigateHome={() => navigateTo('landing')}
      />
    );
  }

  if (currentRoute.view === 'admin') {
    return (
      <AdminDashboard
        onNavigateLanding={() => navigateTo('landing')}
        onNavigateTracking={(plate) => navigateTo('tracking', { plate })}
      />
    );
  }

  return (
    <LandingPage
      onNavigateTracking={(plate) => navigateTo('tracking', { plate })}
      onOpenAdmin={() => navigateTo('admin')}
    />
  );
}
