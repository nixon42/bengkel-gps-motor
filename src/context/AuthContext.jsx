import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext({
  user: null,
  tenant: null,
  loading: true,
  error: null,
  mockLogin: async () => {},
  logout: async () => {},
  refreshAuth: async () => {},
  updateSettings: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/me', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTenant(data.tenant);
      } else {
        setUser(null);
        setTenant(null);
      }
    } catch (err) {
      console.warn('Gagal memuat status auth:', err);
      setUser(null);
      setTenant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const mockLogin = async (tenantSlug = 'bengkel-gps-motor', email = 'admin@gpsmotor.local') => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tenantSlug, email })
      });
      if (!res.ok) {
        let msg = 'Login gagal';
        try {
          const errData = await res.json();
          if (errData?.message || errData?.error) msg = errData.message || errData.error;
        } catch {
          if (res.status >= 500) {
            msg = 'Server backend belum aktif (koneksi ke port 3000 gagal). Pastikan server backend sedang berjalan.';
          }
        }
        throw new Error(msg);
      }
      const data = await res.json();
      setUser(data.user);
      setTenant(data.tenant);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setTenant(null);
      setLoading(false);
    }
  };

  const updateSettings = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal memperbarui pengaturan bengkel');
      }
      if (data.tenant) {
        setTenant(data.tenant);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      tenant,
      loading,
      error,
      mockLogin,
      logout,
      refreshAuth,
      updateSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
