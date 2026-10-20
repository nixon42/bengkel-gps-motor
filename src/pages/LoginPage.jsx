import React, { useState, useEffect } from 'react';
import { 
  Wrench, Shield, Lock, Mail, Key, ArrowRight, ArrowLeft, 
  CheckCircle2, AlertCircle, ShieldCheck, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { isSuperadmin } from '../utils/roles';
import { DEFAULT_TENANT_ID } from '../utils/config';

export default function LoginPage({ onNavigateHome, onLoginSuccess }) {
  const { loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('google'); // 'google' | 'password'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');
      const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
      const errorMsg = searchParams.get('error') || hashParams.get('error');

      if (errorDesc || errorCode || errorMsg) {
        if (errorCode === 'signup_disabled' || (errorDesc && errorDesc.toLowerCase().includes('signup'))) {
          setErrorMessage('Pendaftaran akun via Google belum diaktifkan di Supabase. Aktifkan opsi "Allow new users to sign up" di Supabase Dashboard (Authentication > Sign In / Up).');
        } else {
          setErrorMessage(decodeURIComponent(errorDesc || errorCode || errorMsg).replace(/\+/g, ' '));
        }
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage('');
      await loginWithGoogle();
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('not enabled') || msg.toLowerCase().includes('provider') || msg.toLowerCase().includes('unsupported')) {
        setErrorMessage('Google OAuth belum diaktifkan di Supabase Dashboard (Authentication > Providers > Google). Silakan gunakan tab "Email / Sandi" untuk masuk sekarang.');
      } else {
        setErrorMessage(msg || 'Gagal memulai login dengan Google.');
      }
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Silakan isi email dan password.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      if (!supabase) {
        throw new Error('Koneksi Supabase belum aktif. Periksa konfigurasi sistem.');
      }

      // Supabase email & password authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        throw new Error(error.message || 'Email atau kata sandi tidak valid.');
      }

      if (data?.user) {
        const isSuper = isSuperadmin(data.user.email);
        const authUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Staf Bengkel',
          role: isSuper ? 'superadmin' : 'admin',
          isSuperAdmin: isSuper,
          tenant_id: DEFAULT_TENANT_ID
        };
        localStorage.setItem('bengkel_session', JSON.stringify(authUser));
        if (onLoginSuccess) onLoginSuccess();
        return;
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans select-none">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-900/20 to-transparent blur-3xl pointer-events-none"></div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onNavigateHome}
          className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>KEMBALI KE BERANDA</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-400/30 text-white mb-4 shadow-xl shadow-blue-950/60 ring-1 ring-white/10">
            <Layers className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
            BengkelOS Platform Cloud
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Portal Workspace &amp; Superadmin
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Sistem Operasi Manajemen Bengkel Terpadu &amp; Akses Pengawasan Multi-Tenant
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('google'); setErrorMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'google' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('password'); setErrorMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'password' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Email / Sandi
            </button>
          </div>

          {/* TAB 1: GOOGLE LOGIN */}
          {activeTab === 'google' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-400 leading-relaxed">
                Gunakan akun Google staf, pemilik bengkel, atau superadmin untuk masuk ke workspace secara aman.
              </p>
              
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || submitting}
                className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border border-slate-700 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm transition-all shadow-md active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google'}</span>
              </button>

              <div className="pt-2">
                <span className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Dilindungi Autentikasi Cloud Supabase
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD LOGIN */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
                  EMAIL PENGGUNA
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@bengkel.com atau admin@domain.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">
                  KATA SANDI
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/30 mt-2"
              >
                <span>{submitting ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Security Badge Footer */}
        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          BengkelOS Cloud Network &bull; Multi-Tenant Automotive ERP System
        </div>

      </div>
    </div>
  );
}
