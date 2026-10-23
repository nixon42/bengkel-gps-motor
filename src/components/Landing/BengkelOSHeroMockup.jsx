import React from 'react';
import { 
  Search, Bell, ChevronDown, Check, AlertTriangle, 
  ArrowRight, LayoutDashboard, Wrench, Users, Car, 
  Database, Wallet, FileText, Settings 
} from 'lucide-react';
import { BengkelOSLogoIcon } from './BengkelOSIcons';

/**
 * High-Fidelity Vector-Crisp Dashboard Mockup Component
 * Exactly reproduces the Canva BengkelOS dashboard window at native 4K/Retina sharpness.
 */
export default function BengkelOSHeroMockup({ onOpenDemo }) {
  return (
    <div 
      className="relative rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-[#070e1b] shadow-[0_0_50px_rgba(37,99,235,0.28)] text-left select-none transition-all group"
      onClick={onOpenDemo}
    >
      {/* Window Titlebar */}
      <div className="bg-[#0b1424] px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <BengkelOSLogoIcon className="w-5 h-5" />
          <span className="font-bold text-white text-xs tracking-tight">BengkelOS</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 bg-[#070e1b] border border-slate-800 rounded-md px-2 py-0.5 text-[11px] text-slate-400">
            <Search className="w-3 h-3 text-slate-500" />
            <span>Cari plat / SPK...</span>
          </div>

          <div className="relative">
            <Bell className="w-3.5 h-3.5 text-slate-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          </div>

          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-[10px] font-bold text-white">
            A
          </div>

          <span className="hidden md:inline font-mono text-[11px] text-slate-400 border-l border-slate-800 pl-3">
            Selasa, 21 Mei 2026
          </span>

          <div className="hidden sm:flex items-center space-x-1 bg-[#070e1b] border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 font-medium">
            <span>Hari Ini</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Window Body: Sidebar + Main Content */}
      <div className="grid grid-cols-12 min-h-[360px]">
        
        {/* Left Mini Sidebar */}
        <div className="col-span-3 sm:col-span-3 bg-[#08101e] border-r border-slate-800/80 p-2.5 sm:p-3 space-y-1">
          <div className="bg-blue-600 text-white rounded-md px-2.5 py-1.5 flex items-center space-x-2 text-[11px] font-bold shadow-xs">
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Ringkasan</span>
          </div>

          <div className="text-slate-400 hover:text-white rounded-md px-2.5 py-1.5 flex items-center space-x-2 text-[11px] font-medium transition-colors">
            <Wrench className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Pekerjaan</span>
          </div>

          <div className="text-slate-400 hover:text-white rounded-md px-2.5 py-1.5 flex items-center space-x-2 text-[11px] font-medium transition-colors">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Pelanggan</span>
          </div>

          <div className="text-slate-400 hover:text-white rounded-md px-2.5 py-1.5 flex items-center space-x-2 text-[11px] font-medium transition-colors">
            <Car className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Kendaraan</span>
          </div>

          <div className="text-slate-400 hover:text-white rounded-md px-2.5 py-1.5 flex items-center space-x-2 text-[11px] font-medium transition-colors">
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Inventori</span>
          </div>

          <div className="text-slate-400 hover:text-white rounded-md px-2.5 py-1.5 flex items-center space-x-2 text-[11px] font-medium transition-colors">
            <Wallet className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Keuangan</span>
          </div>

          <div className="text-slate-400 hover:text-white rounded-md px-2.5 py-1.5 flex items-center space-x-2 text-[11px] font-medium transition-colors">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Laporan</span>
          </div>

          <div className="text-slate-400 hover:text-white rounded-md px-2.5 py-1.5 flex items-center space-x-2 text-[11px] font-medium transition-colors">
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Pengaturan</span>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="col-span-9 sm:col-span-9 p-3 sm:p-4 space-y-3 bg-[#060c18]">
          
          {/* Header Title & 4 KPI Cards */}
          <div>
            <div className="text-xs font-bold text-white mb-2">Ringkasan Hari Ini</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              <div className="bg-[#0b1424] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Pekerjaan Masuk</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">24</div>
              </div>

              <div className="bg-[#0b1424] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Sedang Dikerjakan</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">11</div>
              </div>

              <div className="bg-[#0b1424] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Selesai Hari Ini</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">18</div>
                <div className="text-[9px] text-emerald-400 font-mono">+18% dari kemarin</div>
              </div>

              <div className="bg-[#0b1424] p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Pendapatan</div>
                <div className="text-[11px] sm:text-xs md:text-sm font-black text-white font-mono mt-0.5 whitespace-nowrap">
                  Rp 36,450,000
                </div>
                <div className="text-[9px] text-emerald-400 font-mono">+15% dari kemarin</div>
              </div>

            </div>
          </div>

          {/* Lower Grid: Status Pekerjaan (Table) + Chart + Stok Menipis */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            
            {/* Status Pekerjaan (Col 7) */}
            <div className="sm:col-span-7 bg-[#0b1424] p-3 rounded-lg border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-white mb-2">Status Pekerjaan</div>
                <div className="space-y-1.5 text-[11px]">
                  
                  {/* Row 1 */}
                  <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1b] border border-slate-800/80">
                    <div>
                      <span className="font-bold font-mono text-white mr-1.5">B 1234 ABC</span>
                      <span className="text-[10px] text-slate-400">Innova</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-600/50">
                      Sedang Dikerjakan
                    </span>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1b] border border-slate-800/80">
                    <div>
                      <span className="font-bold font-mono text-white mr-1.5">D 5678 DEF</span>
                      <span className="text-[10px] text-slate-400">Brio</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-600/50">
                      Menunggu Sparepart
                    </span>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1b] border border-slate-800/80">
                    <div>
                      <span className="font-bold font-mono text-white mr-1.5">F 9012 GHI</span>
                      <span className="text-[10px] text-slate-400">Xpander</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/50">
                      Selesai
                    </span>
                  </div>

                  {/* Row 4 */}
                  <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1b] border border-slate-800/80">
                    <div>
                      <span className="font-bold font-mono text-white mr-1.5">L 3456 JKL</span>
                      <span className="text-[10px] text-slate-400">Ertiga</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-600/50">
                      Pemeriksaan
                    </span>
                  </div>

                </div>
              </div>

              <div className="pt-1 flex items-center text-[10px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer">
                <span>Lihat Semua Pekerjaan</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>

            {/* Right Mini Column: Chart & Stok Menipis (Col 5) */}
            <div className="sm:col-span-5 space-y-2.5">
              
              {/* Ringkasan Pendapatan (SVG Area Chart) */}
              <div className="bg-[#0b1424] p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-bold text-white text-[10px]">Ringkasan Pendapatan</span>
                  <span className="text-[9px] text-slate-400">Minggu Ini ▾</span>
                </div>

                {/* Vector SVG Chart with Glowing Curve */}
                <div className="relative h-16 w-full">
                  <svg viewBox="0 0 160 55" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="neon-line" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Horizontal Reference Lines */}
                    <line x1="0" y1="10" x2="160" y2="10" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.5" />
                    <line x1="0" y1="28" x2="160" y2="28" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.5" />
                    <line x1="0" y1="46" x2="160" y2="46" stroke="#1e293b" strokeDasharray="2 2" strokeWidth="0.5" />

                    {/* Gradient Fill under Curve */}
                    <path 
                      d="M 5,42 Q 25,25 45,36 T 85,20 T 120,24 T 155,8 L 155,50 L 5,50 Z" 
                      fill="url(#chart-area-grad)" 
                    />

                    {/* Glowing Emerald Stroke Line */}
                    <path 
                      d="M 5,42 Q 25,25 45,36 T 85,20 T 120,24 T 155,8" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      filter="url(#neon-line)" 
                    />

                    {/* Data Points */}
                    <circle cx="5" cy="42" r="2" fill="#10b981" />
                    <circle cx="30" cy="31" r="2" fill="#10b981" />
                    <circle cx="55" cy="34" r="2" fill="#10b981" />
                    <circle cx="80" cy="22" r="2" fill="#10b981" />
                    <circle cx="105" cy="27" r="2" fill="#10b981" />
                    <circle cx="130" cy="21" r="2" fill="#10b981" />
                    <circle cx="155" cy="8" r="2.5" fill="#34d399" stroke="#ffffff" strokeWidth="1" />
                  </svg>
                </div>

                <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-0.5">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span>Sab</span>
                  <span>Min</span>
                </div>
              </div>

              {/* Stok Menipis Widget */}
              <div className="bg-[#0b1424] p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-white">Stok Menipis</span>
                  <span className="text-[9px] text-blue-400 font-semibold cursor-pointer">Lihat Semua</span>
                </div>

                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center justify-between p-1 rounded bg-[#070e1b] border border-slate-800">
                    <span className="text-slate-300 font-medium truncate max-w-[90px]">Oli 5W-30</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center">
                      <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Stok: 1
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-1 rounded bg-[#070e1b] border border-slate-800">
                    <span className="text-slate-300 font-medium truncate max-w-[90px]">Kampas Depan</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center">
                      <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Stok: 2
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Floating Interactive Trigger */}
      <div className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-md bg-[#060b17]/95 border border-emerald-500/40 text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Uji Coba Live Demo Bengkel →</span>
      </div>
    </div>
  );
}
