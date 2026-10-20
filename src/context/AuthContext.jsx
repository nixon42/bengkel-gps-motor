import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { isSuperadmin } from '../utils/roles';

const AuthContext = createContext({
  user: null,
  tenant: null,
  loading: true,
  error: null,
  loginWithGoogle: async () => {},
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

  // Listen to Supabase native auth (including Google OAuth callback)
  useEffect(() => {
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const email = session.user.email || '';
          let isSuper = isSuperadmin(email, session.user);

          if (!isSuper && supabase) {
            try {
              const { data: dbUser } = await supabase
                .from('users')
                .select('role')
                .eq('email', email)
                .maybeSingle();
              if (dbUser?.role === 'superadmin') {
                isSuper = true;
              }
            } catch (e) {
              // Ignore table error
            }
          }
          const authUser = {
            id: session.user.id,
            email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0] || 'User Google',
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
            role: isSuper ? 'superadmin' : 'admin',
            isSuperAdmin: isSuper,
            tenant_id: 'tenant-gps-motor-kediri-01'
          };
          setUser(authUser);
          localStorage.setItem('bengkel_session', JSON.stringify(authUser));
        }
      });
      return () => subscription?.unsubscribe();
    }
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      if (supabase) {
        const repoPath = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io') ? '/bengkel-gps-motor' : '';
        const redirectTo = `${window.location.origin}${repoPath}/admin`;
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo
          }
        });
        if (error) throw error;
        return data;
      } else {
        window.location.href = '/api/auth/google';
      }
    } catch (err) {
      setError(err.message || 'Gagal login Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
            msg = 'Server backend belum aktif. Menggunakan koneksi Supabase.';
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
      if (supabase) {
        await supabase.auth.signOut().catch(() => {});
      }
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('bengkel_session');
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
      loginWithGoogle,
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
