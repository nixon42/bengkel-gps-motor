import React, { useState } from 'react';
import { Cpu, ShieldCheck, Zap, ChevronDown, ChevronUp, Sparkles, SlidersHorizontal } from 'lucide-react';

export const VARIANTS = [
  {
    id: 'telemetry',
    number: '1',
    name: 'Presisi & Telemetri',
    tagline: 'Konsol Diagnostik & Standar Pabrikan',
    description: 'Didesain untuk pemilik mobil yang mengutamakan kepresisian teknis: visual triage gejala mesin, data scanner OBD2 live, toleransi torsi pabrik, dan terminal plat nomor tactile.',
    icon: Cpu,
    accent: 'blue',
    badge: 'Mekanik & Engineering'
  },
  {
    id: 'trust',
    number: '2',
    name: 'Trust & Transparansi',
    tagline: 'Jaminan Integritas & Bebas Was-Was',
    description: 'Fokus menghilangkan ketakutan konsumen (biaya membengkak/part ditukar): 4 pilar jaminan tertulis, simulasi pelacakan RO 6 tahap, dan estimasi biaya transparan.',
    icon: ShieldCheck,
    accent: 'emerald',
    badge: 'Pilihan Terpilih • Customer Assurance'
  },
  {
    id: 'express',
    number: '3',
    name: 'Express Pitstop',
    tagline: 'Aksi Kilat & Reservasi Slot Lift',
    description: 'Arsitektur berkecepatan tinggi untuk pemilik mobil sibuk: command strip serba cepat, radar ketersediaan lift hari ini, dan komposer WhatsApp booking instan.',
    icon: Zap,
    accent: 'sky',
    badge: 'High-Velocity Booking'
  }
];

export default function VariantSelectorBar({ currentVariant, onSelectVariant }) {
  const [collapsed, setCollapsed] = useState(false);

  const activeMeta = VARIANTS.find(v => v.id === currentVariant) || VARIANTS[0];

  return (
    <aside 
      aria-label="Panel Pemilih Varian Desain Landing Page"
      className="bg-slate-900 text-white border-b-2 border-blue-600 transition-all select-none print:hidden z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true"></span>
              <span className="text-xs font-black tracking-wider uppercase text-blue-400 font-mono">
                Redesign Review Mode
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="touch-target inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Buka panel varian" : "Tutup panel varian"}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{collapsed ? 'Buka Detail Varian' : 'Ringkas'}</span>
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* 3 Variant Pill Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0" role="tablist" aria-label="Pilihan Varian">
            {VARIANTS.map((v) => {
              const Icon = v.icon;
              const isActive = currentVariant === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectVariant(v.id)}
                  className={`touch-target whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-none ring-2 ring-blue-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-mono text-[11px] px-1 rounded bg-black/30">V{v.number}</span>
                  <span>{v.name}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Expanded Details Pane */}
        {!collapsed && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start md:items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold text-[11px] uppercase tracking-wide border border-blue-700 shrink-0">
                {activeMeta.badge}
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                <strong className="text-white font-semibold">{activeMeta.tagline}:</strong>{' '}
                {activeMeta.description}
              </p>
            </div>
            <div className="text-[11px] text-slate-400 font-mono shrink-0 hidden lg:block">
              Pilihan tersimpan otomatis di browser
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
