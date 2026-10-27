import React, { useState } from 'react';
import { 
  Search, Bell, Calendar, ChevronDown, AlertTriangle, 
  LayoutDashboard, Wrench, Users, Car, 
  Database, Wallet, FileText, Settings, User, Check,
  Clock, DollarSign, TrendingUp, ShieldCheck
} from 'lucide-react';
import { BengkelOSLogoIcon } from './BengkelOSIcons';

/**
 * High-Fidelity Vector-Crisp Dashboard Mockup Component
 * Interactive workspace preview matching Canva Slide 1 BengkelOS dashboard at native Retina/4K sharpness.
 */
export default function BengkelOSHeroMockup() {
  const [activeMenu, setActiveMenu] = useState('Ringkasan');

  const MENUS = [
    { id: 'Ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'Pekerjaan', label: 'Pekerjaan', icon: Wrench },
    { id: 'Pelanggan', label: 'Pelanggan', icon: Users },
    { id: 'Kendaraan', label: 'Kendaraan', icon: Car },
    { id: 'Inventori', label: 'Inventori', icon: Database },
    { id: 'Keuangan', label: 'Keuangan', icon: Wallet },
    { id: 'Laporan', label: 'Laporan', icon: FileText },
    { id: 'Pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="relative rounded-2xl border border-cyan-500/30 bg-[#091120] shadow-[0_0_0_1px_rgba(56,189,248,0.25),0_0_35px_rgba(37,99,235,0.3),0_0_65px_rgba(6,182,212,0.18),0_25px_50px_-12px_rgba(0,0,0,0.85)] overflow-hidden text-left select-none transition-all group hover:border-cyan-400/50">
      
      {/* Window Body: Flex Layout matching Canva Slide 1 */}
      <div className="flex flex-row min-h-[460px] sm:min-h-[490px]">
        
        {/* Left Sidebar (Full Height from Top to Bottom) */}
        <div className="w-[140px] sm:w-[155px] lg:w-[165px] shrink-0 bg-[#070e1a] border-r border-slate-800/80 p-2.5 sm:p-3 flex flex-col justify-between">
          <div>
            {/* BengkelOS Brand Header in Sidebar */}
            <div className="flex items-center space-x-2 px-1 pt-1 pb-3.5">
              <BengkelOSLogoIcon className="w-5 h-5 shrink-0" />
              <span className="font-bold text-white text-sm tracking-tight font-sans">BengkelOS</span>
            </div>

            {/* Menu Items (Interactive Module Switching) */}
            <div className="space-y-1">
              {MENUS.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] sm:text-xs font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#1d4ed8] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Workspace Area */}
        <div className="flex-1 min-w-0 p-3 sm:p-4 lg:p-4.5 space-y-3 bg-[#0a1220] flex flex-col justify-between">
          
          {/* TAB 1: RINGKASAN (100% Exact Canva Slide 1 Benchmark) */}
          {activeMenu === 'Ringkasan' && (
            <>
              {/* Top Header Row */}
              <div className="flex items-center justify-between gap-2 pb-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Ringkasan Hari Ini
                </h3>

                <div className="flex items-center space-x-2 sm:space-x-2.5">
                  <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 text-[10px] sm:text-[11px] font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Selasa, 21 Mei 2024</span>
                  </div>

                  <div className="flex items-center space-x-1 bg-[#0e1828] border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 font-medium">
                    <span>Hari Ini</span>
                    <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                  </div>

                  <div className="text-slate-400 hover:text-white p-0.5">
                    <Search className="w-3.5 h-3.5" />
                  </div>

                  <div className="relative text-slate-400 hover:text-white p-0.5">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  </div>

                  <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-400 flex items-center justify-center text-emerald-300">
                    <User className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* 4 KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 shadow-xs">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Pekerjaan Masuk</div>
                  <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">24</div>
                </div>

                <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 shadow-xs">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Sedang Dikerjakan</div>
                  <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">11</div>
                </div>

                <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 shadow-xs">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Selesai Hari Ini</div>
                  <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">18</div>
                  <div className="text-[9px] text-emerald-400 font-mono mt-0.5">+18% dari kemarin</div>
                </div>

                <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 shadow-xs">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Pendapatan</div>
                  <div className="text-[11px] sm:text-xs lg:text-[13px] font-bold text-white font-mono mt-0.5 whitespace-nowrap">
                    Rp 36,450,000
                  </div>
                  <div className="text-[9px] text-emerald-400 font-mono mt-0.5">+15% dari kemarin</div>
                </div>
              </div>

              {/* Bottom 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 pt-0.5">
                {/* Left: Status Pekerjaan */}
                <div className="lg:col-span-7 bg-[#0e1828] p-3 rounded-xl border border-slate-800/60 space-y-2 flex flex-col justify-between">
                  <div className="text-xs font-bold text-white">Status Pekerjaan</div>

                  <div className="space-y-1.5 divide-y divide-slate-800/40">
                    <div className="flex items-center justify-between pt-1 first:pt-0">
                      <div className="min-w-0 pr-2">
                        <div className="font-mono text-[11px] font-bold text-white tracking-wide">B 1234 ABC</div>
                        <div className="text-[9px] text-slate-400 truncate">Toyota Innova</div>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium hidden sm:block">Servis Berkala</div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#1e3a8a]/70 text-[#93c5fd] border border-blue-600/30 whitespace-nowrap">
                        Sedang Dikerjakan
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="min-w-0 pr-2">
                        <div className="font-mono text-[11px] font-bold text-white tracking-wide">D 5678 DEF</div>
                        <div className="text-[9px] text-slate-400 truncate">Honda Brio</div>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium hidden sm:block">Ganti Oli</div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#78350f]/70 text-[#fde047] border border-amber-600/30 whitespace-nowrap">
                        Menunggu Sparepart
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="min-w-0 pr-2">
                        <div className="font-mono text-[11px] font-bold text-white tracking-wide">F 9012 GHI</div>
                        <div className="text-[9px] text-slate-400 truncate">Mitsubishi Xpander</div>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium hidden sm:block">Rem &amp; Kaki-kaki</div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#064e3b]/70 text-[#6ee7b7] border border-emerald-600/30 whitespace-nowrap">
                        Selesai
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="min-w-0 pr-2">
                        <div className="font-mono text-[11px] font-bold text-white tracking-wide">L 3456 JKL</div>
                        <div className="text-[9px] text-slate-400 truncate">Suzuki Ertiga</div>
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium hidden sm:block">AC Service</div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#581c87]/70 text-[#d8b4fe] border border-purple-600/30 whitespace-nowrap">
                        Pemeriksaan
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button 
                      type="button" 
                      onClick={() => setActiveMenu('Pekerjaan')}
                      className="text-[10px] sm:text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      Lihat Semua Pekerjaan →
                    </button>
                  </div>
                </div>

                {/* Right: Chart + Stok */}
                <div className="lg:col-span-5 space-y-2 flex flex-col justify-between">
                  <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">Ringkasan Pendapatan</span>
                      <div className="flex items-center space-x-1 text-[9px] text-slate-400 bg-[#070e1a] border border-slate-800 px-1.5 py-0.5 rounded">
                        <span>Minggu Ini</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </div>
                    </div>

                    <div className="flex items-stretch space-x-1.5 pt-0.5">
                      <div className="flex flex-col justify-between text-[7px] font-mono text-slate-500 py-0.5 text-right w-5 shrink-0">
                        <span>40jt</span>
                        <span>30jt</span>
                        <span>20jt</span>
                        <span>10jt</span>
                      </div>

                      <div className="flex-1 h-16 sm:h-18 relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 160 50" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradientHeroDirect" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                              <stop offset="100%" stopColor="#00c4cc" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          <line x1="0" y1="5" x2="160" y2="5" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="2 2" />
                          <line x1="0" y1="18" x2="160" y2="18" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="2 2" />
                          <line x1="0" y1="32" x2="160" y2="32" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="2 2" />
                          <line x1="0" y1="46" x2="160" y2="46" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="2 2" />

                          <path 
                            d="M 5,42 L 30,31 L 55,34 L 80,22 L 105,27 L 130,21 L 155,8 L 155,48 L 5,48 Z" 
                            fill="url(#chartGradientHeroDirect)" 
                          />
                          <path 
                            d="M 5,42 L 30,31 L 55,34 L 80,22 L 105,27 L 130,21 L 155,8" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="5" cy="42" r="2" fill="#10b981" />
                          <circle cx="30" cy="31" r="2" fill="#10b981" />
                          <circle cx="55" cy="34" r="2" fill="#10b981" />
                          <circle cx="80" cy="22" r="2" fill="#10b981" />
                          <circle cx="105" cy="27" r="2" fill="#10b981" />
                          <circle cx="130" cy="21" r="2" fill="#10b981" />
                          <circle cx="155" cy="8" r="2.5" fill="#34d399" stroke="#ffffff" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex justify-between text-[7px] font-mono text-slate-500 pl-6 pt-0.5">
                      <span>Sen</span>
                      <span>Sel</span>
                      <span>Rab</span>
                      <span>Kam</span>
                      <span>Jum</span>
                      <span>Sab</span>
                      <span>Min</span>
                    </div>
                  </div>

                  <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white">Stok Menipis</span>
                      <button 
                        type="button" 
                        onClick={() => setActiveMenu('Inventori')}
                        className="text-[9px] text-blue-400 font-semibold cursor-pointer"
                      >
                        Lihat Semua
                      </button>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                          <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-slate-200 font-medium truncate max-w-[100px] text-[10px]">Oli Mesin 5W-30</div>
                            <div className="text-[8px] text-slate-400">Sisa: 3</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-[#4c0519] text-[#fca5a5] border border-[#881337] flex items-center shrink-0">
                          Stok: 3 ⚠
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 min-w-0 pr-1">
                          <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-slate-200 font-medium truncate max-w-[100px] text-[10px]">Kampas Rem Depan</div>
                            <div className="text-[8px] text-slate-400">Sisa: 2</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-[#4c0519] text-[#fca5a5] border border-[#881337] flex items-center shrink-0">
                          Stok: 2 ⚠
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PEKERJAAN (Repair Orders & SPK) */}
          {activeMenu === 'Pekerjaan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Manajemen Pekerjaan &amp; Alur Servis (SPK)
                  </h3>
                  <p className="text-[10px] text-slate-400">Alur kerja 6 tahap dari mobil masuk hingga diambil konsumen</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px] font-bold">
                  24 SPK Aktif
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Tahap Estimasi</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">5</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Dalam Stall</div>
                  <div className="text-base font-bold text-blue-400 font-mono mt-0.5">11</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Menunggu Part</div>
                  <div className="text-base font-bold text-amber-400 font-mono mt-0.5">3</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Siap Diambil</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">18</div>
                </div>
              </div>

              <div className="bg-[#0e1828] p-3 rounded-xl border border-slate-800/60 space-y-2">
                <div className="text-[11px] font-bold text-white">Daftar SPK Berjalan</div>
                <div className="space-y-1.5 divide-y divide-slate-800/40 text-[10px]">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-mono font-bold text-white">RO-2026-0042</span> · Avanza Veloz (AG 1822 AB)
                      <div className="text-slate-400 text-[9px]">Mekanik: Mas Hendra · Stall Lift 01</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-semibold text-[9px]">
                      Pengerjaan (Tahap 3/6)
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <span className="font-mono font-bold text-white">RO-2026-0043</span> · Xpander Ultimate (AG 1945 CD)
                      <div className="text-slate-400 text-[9px]">Mekanik: Mas Budi · Stall Lift 02</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 font-semibold text-[9px]">
                      Menunggu Part
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <span className="font-mono font-bold text-white">RO-2026-0044</span> · Civic RS Turbo (AG 1001 EF)
                      <div className="text-slate-400 text-[9px]">Mekanik: Mas Joko · Stall Lift 03</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-semibold text-[9px]">
                      Selesai QC (Siap Ambil)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PELANGGAN (Customer Database) */}
          {activeMenu === 'Pelanggan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Database Pelanggan &amp; Riwayat Servis
                  </h3>
                  <p className="text-[10px] text-slate-400">Data pemilik mobil, kontak WhatsApp, dan riwayat perawatan</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  1.240 Pelanggan
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Total Pelanggan</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">1.240</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Pelanggan Loyal</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">820 (66%)</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Kepuasan Pelanggan</div>
                  <div className="text-base font-bold text-blue-400 font-mono mt-0.5">98.4%</div>
                </div>
              </div>

              <div className="bg-[#0e1828] p-3 rounded-xl border border-slate-800/60 space-y-2">
                <div className="text-[11px] font-bold text-white">Pelanggan Kunjungan Terkini</div>
                <div className="space-y-1.5 divide-y divide-slate-800/40 text-[10px]">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-bold text-white">Pak Wahyu Pratama</div>
                      <div className="text-slate-400 text-[9px]">0812-3456-**** · Toyota Avanza Veloz (AG 1822 AB)</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">
                      Hari Ini
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <div className="font-bold text-white">Bu Siti Rahayu</div>
                      <div className="text-slate-400 text-[9px]">0857-9876-**** · Honda Brio RS (D 5678 DEF)</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">
                      Kemarin
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <div className="font-bold text-white">Pak Hendro Santoso</div>
                      <div className="text-slate-400 text-[9px]">0821-4567-**** · Mitsubishi Xpander (F 9012 GHI)</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">
                      3 hari lalu
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KENDARAAN (Vehicles) */}
          {activeMenu === 'Kendaraan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Database Kendaraan Bengkel
                  </h3>
                  <p className="text-[10px] text-slate-400">Pencarian plat nomor, tipe mesin, dan riwayat odometer</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px] font-bold">
                  1.450 Mobil
                </span>
              </div>

              <div className="bg-[#0e1828] p-3 rounded-xl border border-slate-800/60 space-y-2">
                <div className="space-y-1.5 divide-y divide-slate-800/40 text-[10px]">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-mono font-bold text-white">AG 1822 AB</span> · Toyota Avanza 1.3 Veloz (2020)
                      <div className="text-slate-400 text-[9px]">Odometer: 42.500 km · Terakhir Servis: Ganti Oli &amp; Tune Up</div>
                    </div>
                    <span className="text-emerald-400 font-mono text-[9px]">Kondisi Prima</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <span className="font-mono font-bold text-white">AG 1945 CD</span> · Mitsubishi Xpander Ultimate (2022)
                      <div className="text-slate-400 text-[9px]">Odometer: 28.100 km · Terakhir Servis: Rem &amp; Shockbreaker</div>
                    </div>
                    <span className="text-amber-400 font-mono text-[9px]">Dalam Perbaikan</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <span className="font-mono font-bold text-white">AG 1001 EF</span> · Honda Civic RS Turbo (2023)
                      <div className="text-slate-400 text-[9px]">Odometer: 14.200 km · Terakhir Servis: Tune Up Injeksi</div>
                    </div>
                    <span className="text-emerald-400 font-mono text-[9px]">Siap Diambil</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INVENTORI (Spareparts Catalog) */}
          {activeMenu === 'Inventori' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Inventori Suku Cadang &amp; Gudang FIFO
                  </h3>
                  <p className="text-[10px] text-slate-400">Monitoring sisa stok otomatis, harga beli, jual &amp; margin profit</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-bold">
                  320 SKU
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Total Item</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">320 SKU</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Stok Kritis</div>
                  <div className="text-base font-bold text-rose-400 font-mono mt-0.5">2 Item ⚠</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Nilai Gudang</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">Rp 48.5 jt</div>
                </div>
              </div>

              <div className="bg-[#0e1828] p-3 rounded-xl border border-slate-800/60 space-y-2">
                <div className="space-y-1.5 divide-y divide-slate-800/40 text-[10px]">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-bold text-white">Oli Mesin TMO 10W-40 (4L)</div>
                      <div className="text-slate-400 text-[9px]">Beli: Rp 280.000 · Jual: Rp 350.000 · Margin: +25%</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono">
                      Stok: 18 Galon
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <div className="font-bold text-white">Filter Oli Genuine Avanza</div>
                      <div className="text-slate-400 text-[9px]">Beli: Rp 32.000 · Jual: Rp 45.000 · Margin: +40%</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[9px] font-mono">
                      Stok: 2 Pcs (Kritis)
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <div className="font-bold text-white">Brake Pad Depan Avanza</div>
                      <div className="text-slate-400 text-[9px]">Beli: Rp 160.000 · Jual: Rp 220.000 · Margin: +37%</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono">
                      Stok: 4 Set
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: KEUANGAN (Finance & Cashflow) */}
          {activeMenu === 'Keuangan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Buku Kas &amp; Arus Keuangan Bengkel
                  </h3>
                  <p className="text-[10px] text-slate-400">Pencatatan kas harian otomatis dari invoice pekerjaan &amp; belanja suku cadang</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  Kas Sehat (+18%)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Pemasukan Hari Ini</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">Rp 36.45 jt</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Pengeluaran Gudang</div>
                  <div className="text-base font-bold text-rose-400 font-mono mt-0.5">Rp 12.80 jt</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Profit Bersih</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">Rp 23.65 jt</div>
                </div>
              </div>

              <div className="bg-[#0e1828] p-3 rounded-xl border border-slate-800/60 space-y-2">
                <div className="text-[11px] font-bold text-white">Mutasi Transaksi Hari Ini</div>
                <div className="space-y-1.5 divide-y divide-slate-800/40 text-[10px]">
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-bold text-white">Invoice RO-2026-0042 (Avanza)</div>
                      <div className="text-slate-400 text-[9px]">Jasa Servis &amp; Part · Pembayaran QRIS</div>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">+ Rp 650.000</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <div className="font-bold text-white">Restok Oli Mesin Drum (Distributor)</div>
                      <div className="text-slate-400 text-[9px]">Pengadaan Part · Transfer Bank</div>
                    </div>
                    <span className="font-mono text-rose-400 font-bold">- Rp 4.200.000</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <div>
                      <div className="font-bold text-white">Invoice RO-2026-0044 (Civic Turbo)</div>
                      <div className="text-slate-400 text-[9px]">Tune Up &amp; Carbon Cleaner · Tunai</div>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">+ Rp 880.000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LAPORAN (Analytics & Performance) */}
          {activeMenu === 'Laporan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Laporan Analisis Performa Bengkel
                  </h3>
                  <p className="text-[10px] text-slate-400">Statistik produktivitas teknisi, laba kotor, dan utilisasi stall</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 text-[10px] font-bold">
                  Bulan Mei 2024
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Total Omzet Bulan Ini</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">Rp 148.2 jt</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Efisiensi Stall Lift</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">92.4%</div>
                </div>
                <div className="bg-[#0e1828] p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[9px] text-slate-400">Rata-rata Servis/Hari</div>
                  <div className="text-base font-bold text-blue-400 font-mono mt-0.5">18 Mobil</div>
                </div>
              </div>

              <div className="bg-[#0e1828] p-3 rounded-xl border border-slate-800/60 space-y-2 text-[10px]">
                <div className="text-[11px] font-bold text-white">Kontribusi Pendapatan</div>
                <div className="space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Jasa Pengerjaan &amp; Mekanik (62%)</span>
                    <span className="font-mono text-emerald-400 font-bold">Rp 91.884.000</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[62%]"></div>
                  </div>
                </div>
                <div className="space-y-1 text-slate-300 pt-1">
                  <div className="flex justify-between">
                    <span>Margin Penjualan Sparepart (38%)</span>
                    <span className="font-mono text-blue-400 font-bold">Rp 56.316.000</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[38%]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PENGATURAN (Settings) */}
          {activeMenu === 'Pengaturan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Pengaturan Workspace &amp; Hak Akses
                  </h3>
                  <p className="text-[10px] text-slate-400">Konfigurasi profil bengkel, struk printer thermal &amp; integrasi WhatsApp</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                  Multi-Tenant
                </span>
              </div>

              <div className="bg-[#0e1828] p-3 rounded-xl border border-slate-800/60 space-y-2.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Profil Bengkel &amp; Branding</div>
                    <div className="text-slate-400 text-[9px]">Nama resmi, logo bengkel pada nota &amp; alamat Google Maps</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px]">Lengkap</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/40 pt-2">
                  <div>
                    <div className="font-bold text-white">Printer Struk Thermal 58mm / 80mm</div>
                    <div className="text-slate-400 text-[9px]">Format otomatis cetak struk kasir tanpa dialog browser</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[9px]">Siap Cetak</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/40 pt-2">
                  <div>
                    <div className="font-bold text-white">Gateway Tautan WhatsApp</div>
                    <div className="text-slate-400 text-[9px]">Format link tracking instan tanpa perlu simpan nomor</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px]">Tersambung</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Footer hint inside mockup */}
          <div className="pt-1 flex items-center justify-between text-[9px] text-slate-500 border-t border-slate-800/40">
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>BengkelOS Multi-Tenant Cloud</span>
            </span>
            <span className="font-mono text-slate-400">Modul: {activeMenu}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
