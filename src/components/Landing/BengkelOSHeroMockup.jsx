import React from 'react';
import { 
  Search, Bell, Calendar, ChevronDown, AlertTriangle, 
  LayoutDashboard, Wrench, Users, Car, 
  Database, Wallet, FileText, Settings, User 
} from 'lucide-react';
import { BengkelOSLogoIcon } from './BengkelOSIcons';

/**
 * High-Fidelity Vector-Crisp Dashboard Mockup Component
 * 100% exact reproduction of Canva Slide 1 BengkelOS dashboard window at native Retina/4K sharpness.
 */
export default function BengkelOSHeroMockup({ onOpenDemo }) {
  return (
    <div 
      className="relative rounded-2xl border border-cyan-500/30 bg-[#091120] shadow-[0_0_0_1px_rgba(56,189,248,0.2),0_0_50px_rgba(37,99,235,0.4),0_0_90px_rgba(6,182,212,0.25),0_25px_50px_-12px_rgba(0,0,0,0.85)] overflow-hidden text-left select-none transition-all group hover:border-cyan-400/50 cursor-pointer"
      onClick={onOpenDemo}
    >
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

            {/* Menu Items (Always visible with crisp icons and full labels) */}
            <div className="space-y-1">
              {/* 1. Ringkasan (Active Blue Pill) */}
              <div className="bg-[#1d4ed8] text-white rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] sm:text-xs font-semibold shadow-xs">
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>Ringkasan</span>
              </div>

              {/* 2. Pekerjaan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] sm:text-xs font-medium transition-colors">
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                <span>Pekerjaan</span>
              </div>

              {/* 3. Pelanggan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] sm:text-xs font-medium transition-colors">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Pelanggan</span>
              </div>

              {/* 4. Kendaraan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] sm:text-xs font-medium transition-colors">
                <Car className="w-3.5 h-3.5 shrink-0" />
                <span>Kendaraan</span>
              </div>

              {/* 5. Inventori */}
              <div className="text-slate-400 hover:text-white rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] sm:text-xs font-medium transition-colors">
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>Inventori</span>
              </div>

              {/* 6. Keuangan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] sm:text-xs font-medium transition-colors">
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span>Keuangan</span>
              </div>

              {/* 7. Laporan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] sm:text-xs font-medium transition-colors">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Laporan</span>
              </div>

              {/* 8. Pengaturan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] sm:text-xs font-medium transition-colors">
                <Settings className="w-3.5 h-3.5 shrink-0" />
                <span>Pengaturan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Workspace Area */}
        <div className="flex-1 min-w-0 p-3 sm:p-4 lg:p-4.5 space-y-3 bg-[#0a1220] flex flex-col justify-between">
          
          {/* Top Header Row: Ringkasan Hari Ini + Calendar + Filter + Search/Bell/Avatar */}
          <div className="flex items-center justify-between gap-2 pb-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              Ringkasan Hari Ini
            </h3>

            <div className="flex items-center space-x-2 sm:space-x-2.5">
              {/* Date with Calendar icon */}
              <div className="hidden sm:flex items-center space-x-1.5 text-slate-400 text-[10px] sm:text-[11px] font-medium">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Selasa, 21 Mei 2024</span>
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center space-x-1 bg-[#0e1828] border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 font-medium">
                <span>Hari Ini</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </div>

              {/* Search */}
              <div className="text-slate-400 hover:text-white p-0.5">
                <Search className="w-3.5 h-3.5" />
              </div>

              {/* Bell with red badge */}
              <div className="relative text-slate-400 hover:text-white p-0.5">
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              </div>

              {/* User Avatar with Green Ring */}
              <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <User className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* 4 KPI Cards Grid (Direct Canva Style, Sleek Dark Containers) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Card 1: Pekerjaan Masuk */}
            <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 shadow-xs">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Pekerjaan Masuk</div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">24</div>
            </div>

            {/* Card 2: Sedang Dikerjakan */}
            <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 shadow-xs">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Sedang Dikerjakan</div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">11</div>
            </div>

            {/* Card 3: Selesai Hari Ini */}
            <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 shadow-xs">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Selesai Hari Ini</div>
              <div className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">18</div>
              <div className="text-[9px] text-emerald-400 font-mono mt-0.5">+18% dari kemarin</div>
            </div>

            {/* Card 4: Pendapatan */}
            <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 shadow-xs">
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Pendapatan</div>
              <div className="text-[11px] sm:text-xs lg:text-[13px] font-bold text-white font-mono mt-0.5 whitespace-nowrap">
                Rp 36,450,000
              </div>
              <div className="text-[9px] text-emerald-400 font-mono mt-0.5">+15% dari kemarin</div>
            </div>
          </div>

          {/* Bottom 2 Columns: Status Pekerjaan (Left) & Chart + Stok (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 pt-0.5">
            
            {/* Left Column: Status Pekerjaan (7 cols) - Clean Table without heavy boxes */}
            <div className="lg:col-span-7 bg-[#0e1828] p-3 rounded-xl border border-slate-800/60 space-y-2 flex flex-col justify-between">
              <div className="text-xs font-bold text-white">Status Pekerjaan</div>

              <div className="space-y-1.5 divide-y divide-slate-800/40">
                {/* Row 1: B 1234 ABC */}
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

                {/* Row 2: D 5678 DEF */}
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

                {/* Row 3: F 9012 GHI */}
                <div className="flex items-center justify-between pt-1.5">
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-[11px] font-bold text-white tracking-wide">F 9012 GHI</div>
                    <div className="text-[9px] text-slate-400 truncate">Mitsubishi Xpander</div>
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium hidden sm:block">Rem & Kaki-kaki</div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#064e3b]/70 text-[#6ee7b7] border border-emerald-600/30 whitespace-nowrap">
                    Selesai
                  </span>
                </div>

                {/* Row 4: L 3456 JKL */}
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

              {/* Bottom Link (Lihat Semua Pekerjaan) */}
              <div className="pt-1">
                <span className="text-[10px] sm:text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                  Lihat Semua Pekerjaan →
                </span>
              </div>
            </div>

            {/* Right Column: Chart + Stok (5 cols) */}
            <div className="lg:col-span-5 space-y-2 flex flex-col justify-between">
              
              {/* Ringkasan Pendapatan Card */}
              <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">Ringkasan Pendapatan</span>
                  <div className="flex items-center space-x-1 text-[9px] text-slate-400 bg-[#070e1a] border border-slate-800 px-1.5 py-0.5 rounded">
                    <span>Minggu Ini</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* SVG Area Chart with Y-axis */}
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

                      {/* Horizontal Grid lines */}
                      <line x1="0" y1="5" x2="160" y2="5" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="2 2" />
                      <line x1="0" y1="18" x2="160" y2="18" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="2 2" />
                      <line x1="0" y1="32" x2="160" y2="32" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="2 2" />
                      <line x1="0" y1="46" x2="160" y2="46" stroke="#1e293b" strokeWidth="0.7" strokeDasharray="2 2" />

                      {/* Area Fill */}
                      <path 
                        d="M 5,42 L 30,31 L 55,34 L 80,22 L 105,27 L 130,21 L 155,8 L 155,48 L 5,48 Z" 
                        fill="url(#chartGradientHeroDirect)" 
                      />

                      {/* Neon Green Stroke Line */}
                      <path 
                        d="M 5,42 L 30,31 L 55,34 L 80,22 L 105,27 L 130,21 L 155,8" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Point Nodes */}
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

                {/* X-axis days */}
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

              {/* Stok Menipis Widget */}
              <div className="bg-[#0e1828] p-2.5 rounded-xl border border-slate-800/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white">Stok Menipis</span>
                  <span className="text-[9px] text-blue-400 font-semibold cursor-pointer">Lihat Semua</span>
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

        </div>

      </div>

    </div>
  );
}
