import React from 'react';
import { 
  Search, Bell, Calendar, ChevronDown, AlertTriangle, 
  LayoutDashboard, Wrench, Users, Car, 
  Database, Wallet, FileText, Settings, User 
} from 'lucide-react';
import { BengkelOSLogoIcon } from './BengkelOSIcons';

/**
 * High-Fidelity Vector-Crisp Dashboard Mockup Component
 * Exactly reproduces the Canva BengkelOS dashboard window at native 4K/Retina sharpness.
 */
export default function BengkelOSHeroMockup({ onOpenDemo }) {
  return (
    <div 
      className="relative rounded-2xl overflow-hidden border border-[#1e3a8a]/70 bg-[#070e1c] shadow-[0_0_50px_rgba(37,99,235,0.22),0_0_20px_rgba(0,196,204,0.15)] text-left select-none transition-all group hover:border-blue-500/60"
      onClick={onOpenDemo}
    >
      {/* Window Body: Flex Layout matching Canva Slide 1 */}
      <div className="flex flex-col sm:flex-row min-h-[500px] lg:min-h-[530px]">
        
        {/* Left Sidebar (Full Height from Top to Bottom) */}
        <div className="w-full sm:w-44 md:w-48 lg:w-52 shrink-0 bg-[#08101e] border-b sm:border-b-0 sm:border-r border-slate-800/80 p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            {/* BengkelOS Brand Header in Sidebar */}
            <div className="flex items-center space-x-2.5 mb-5 px-1 pt-1">
              <BengkelOSLogoIcon className="w-6 h-6 shrink-0" />
              <span className="font-bold text-white text-sm sm:text-base tracking-tight font-sans">BengkelOS</span>
            </div>

            {/* Menu Items (Always visible with icons and full labels) */}
            <div className="space-y-1">
              {/* 1. Ringkasan (Active Blue) */}
              <div className="bg-[#2563eb] text-white rounded-lg px-3 py-2 flex items-center space-x-2.5 text-xs font-semibold shadow-sm">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Ringkasan</span>
              </div>

              {/* 2. Pekerjaan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-3 py-2 flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer">
                <Wrench className="w-4 h-4 shrink-0" />
                <span>Pekerjaan</span>
              </div>

              {/* 3. Pelanggan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-3 py-2 flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer">
                <Users className="w-4 h-4 shrink-0" />
                <span>Pelanggan</span>
              </div>

              {/* 4. Kendaraan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-3 py-2 flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer">
                <Car className="w-4 h-4 shrink-0" />
                <span>Kendaraan</span>
              </div>

              {/* 5. Inventori */}
              <div className="text-slate-400 hover:text-white rounded-lg px-3 py-2 flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer">
                <Database className="w-4 h-4 shrink-0" />
                <span>Inventori</span>
              </div>

              {/* 6. Keuangan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-3 py-2 flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer">
                <Wallet className="w-4 h-4 shrink-0" />
                <span>Keuangan</span>
              </div>

              {/* 7. Laporan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-3 py-2 flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Laporan</span>
              </div>

              {/* 8. Pengaturan */}
              <div className="text-slate-400 hover:text-white rounded-lg px-3 py-2 flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer">
                <Settings className="w-4 h-4 shrink-0" />
                <span>Pengaturan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Workspace Area */}
        <div className="flex-1 min-w-0 p-3.5 sm:p-5 lg:p-6 space-y-4 bg-[#060c18] flex flex-col justify-between">
          
          {/* Top Header Row: Ringkasan Hari Ini + Calendar + Filter + Search/Bell/Avatar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Ringkasan Hari Ini
            </h3>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Date with Calendar icon */}
              <div className="hidden md:flex items-center space-x-1.5 text-slate-400 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Selasa, 21 Mei 2024</span>
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center space-x-1 bg-[#0b1424] border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 font-medium">
                <span>Hari Ini</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>

              {/* Search */}
              <div className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <Search className="w-4 h-4" />
              </div>

              {/* Bell with red badge */}
              <div className="relative text-slate-400 hover:text-white p-1 cursor-pointer">
                <Bell className="w-4 h-4" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              </div>

              {/* User Avatar */}
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 4 KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Card 1 */}
            <div className="bg-[#0b1424] p-3 rounded-xl border border-slate-800/90 shadow-sm">
              <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Pekerjaan Masuk</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">24</div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0b1424] p-3 rounded-xl border border-slate-800/90 shadow-sm">
              <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Sedang Dikerjakan</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">11</div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0b1424] p-3 rounded-xl border border-slate-800/90 shadow-sm">
              <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Selesai Hari Ini</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">18</div>
              <div className="text-[10px] sm:text-[11px] text-emerald-400 font-mono mt-0.5">+18% dari kemarin</div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#0b1424] p-3 rounded-xl border border-slate-800/90 shadow-sm">
              <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Pendapatan</div>
              <div className="text-xs sm:text-sm lg:text-[15px] font-black text-white font-mono mt-1 whitespace-nowrap">
                Rp 36,450,000
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-400 font-mono mt-0.5">+15% dari kemarin</div>
            </div>
          </div>

          {/* Bottom 2 Columns: Status Pekerjaan (Left) & Chart + Stok (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-1">
            
            {/* Left Column: Status Pekerjaan (7 cols) */}
            <div className="lg:col-span-7 bg-[#0b1424] p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-2.5 flex flex-col justify-between">
              <div className="text-xs sm:text-sm font-bold text-white">Status Pekerjaan</div>

              <div className="space-y-2">
                {/* Row 1: B 1234 ABC */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#070e1b] border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-xs font-bold text-white tracking-wide">B 1234 ABC</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">Toyota Innova</div>
                  </div>
                  <div className="hidden sm:block text-[11px] text-slate-300 font-medium">Servis Berkala</div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/60 whitespace-nowrap">
                    Sedang Dikerjakan
                  </span>
                </div>

                {/* Row 2: D 5678 DEF */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#070e1b] border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-xs font-bold text-white tracking-wide">D 5678 DEF</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">Honda Brio</div>
                  </div>
                  <div className="hidden sm:block text-[11px] text-slate-300 font-medium">Ganti Oli</div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-700/60 whitespace-nowrap">
                    Menunggu Sparepart
                  </span>
                </div>

                {/* Row 3: F 9012 GHI */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#070e1b] border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-xs font-bold text-white tracking-wide">F 9012 GHI</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">Mitsubishi Xpander</div>
                  </div>
                  <div className="hidden sm:block text-[11px] text-slate-300 font-medium">Rem & Kaki-kaki</div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 whitespace-nowrap">
                    Selesai
                  </span>
                </div>

                {/* Row 4: L 3456 JKL */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#070e1b] border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="min-w-0 pr-2">
                    <div className="font-mono text-xs font-bold text-white tracking-wide">L 3456 JKL</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">Suzuki Ertiga</div>
                  </div>
                  <div className="hidden sm:block text-[11px] text-slate-300 font-medium">AC Service</div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-700/60 whitespace-nowrap">
                    Pemeriksaan
                  </span>
                </div>
              </div>

              {/* Bottom Link (Lihat Semua Pekerjaan) */}
              <div className="pt-1.5">
                <span className="text-[11px] sm:text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                  Lihat Semua Pekerjaan →
                </span>
              </div>
            </div>

            {/* Right Column: Chart + Stok (5 cols) */}
            <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
              
              {/* Ringkasan Pendapatan Card */}
              <div className="bg-[#0b1424] p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Ringkasan Pendapatan</span>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 bg-[#070e1b] border border-slate-800 px-1.5 py-0.5 rounded">
                    <span>Minggu Ini</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* SVG Area Chart with Y-axis */}
                <div className="flex items-stretch space-x-2 pt-1">
                  <div className="flex flex-col justify-between text-[8px] font-mono text-slate-500 py-0.5 text-right w-6 shrink-0">
                    <span>40jt</span>
                    <span>30jt</span>
                    <span>20jt</span>
                    <span>10jt</span>
                  </div>

                  <div className="flex-1 h-20 sm:h-22 relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 160 50" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradientHero" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#00c4cc" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="0" y1="5" x2="160" y2="5" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 2" />
                      <line x1="0" y1="18" x2="160" y2="18" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 2" />
                      <line x1="0" y1="32" x2="160" y2="32" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 2" />
                      <line x1="0" y1="46" x2="160" y2="46" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 2" />

                      {/* Area Fill */}
                      <path 
                        d="M 5,42 L 30,31 L 55,34 L 80,22 L 105,27 L 130,21 L 155,8 L 155,48 L 5,48 Z" 
                        fill="url(#chartGradientHero)" 
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
                <div className="flex justify-between text-[8px] font-mono text-slate-500 pl-8 pt-0.5">
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
              <div className="bg-[#0b1424] p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Stok Menipis</span>
                  <span className="text-[10px] text-blue-400 font-semibold cursor-pointer">Lihat Semua</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#070e1b] border border-slate-800">
                    <span className="text-slate-300 font-medium truncate max-w-[110px]">Oli Mesin 5W-30</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950/90 text-rose-300 border border-rose-800 flex items-center shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5 mr-1 text-rose-400" /> Stok: 3
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#070e1b] border border-slate-800">
                    <span className="text-slate-300 font-medium truncate max-w-[110px]">Kampas Rem Depan</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950/90 text-rose-300 border border-rose-800 flex items-center shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5 mr-1 text-rose-400" /> Stok: 2
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
