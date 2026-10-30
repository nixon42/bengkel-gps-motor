import React from 'react';

/**
 * 100% Vector-Crisp SVG Icons for BengkelOS Design System.
 * Recreates all Canva assets with pristine resolution and radiant neon glows.
 */

// 1. BengkelOS Diamond Brandmark
export function BengkelOSLogoIcon({ className = "w-8 h-8" }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="bengkelos-gem" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="logo-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#10b981" floodOpacity="0.8" />
        </filter>
      </defs>
      {/* Outer Diamond */}
      <rect 
        x="20" y="3" 
        width="24" height="24" 
        rx="4" 
        transform="rotate(45 20 3)" 
        stroke="url(#bengkelos-gem)" 
        strokeWidth="3.5" 
        fill="#04121a" 
        filter="url(#logo-glow)"
      />
      {/* Inner Accent Line */}
      <path 
        d="M20 12 L28 20 L23 25" 
        stroke="#34d399" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

// 1b. Workshop / Bengkel Vector Crossed Wrench Brandmark (Ultra Crisp SVG)
export function WorkshopLogoIcon({ className = "w-6 h-6" }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="emWrench1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#20a62f" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="emWrench2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <filter id="neonWrench" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#22c55e" floodOpacity="0.7" />
        </filter>
      </defs>

      <g filter="url(#neonWrench)">
        {/* Wrench Left to Right */}
        <path 
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
          fill="url(#emWrench1)" 
          stroke="#10b981" 
          strokeWidth="0.5" 
          strokeLinejoin="round" 
        />

        {/* Wrench Right to Left (Mirrored horizontally around center x=12) */}
        <g transform="translate(24, 0) scale(-1, 1)">
          <path 
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" 
            fill="url(#emWrench2)" 
            stroke="#10b981" 
            strokeWidth="0.5" 
            strokeLinejoin="round" 
          />
        </g>

        {/* Center Pivot Accent with Star Sparkle */}
        <circle cx="12" cy="12" r="2.5" fill="#041a10" stroke="#4ade80" strokeWidth="1" />
        <polygon points="12,9.2 12.7,11.3 14.8,12 12.7,12.7 12,14.8 11.3,12.7 9.2,12 11.3,11.3" fill="#ffffff" />
      </g>
    </svg>
  );
}

// 2. Feature Icons (5 Cards matching Canva exactly)

// 2a. Manfaat Operasional (Emerald Glowing Gear)
export function IconOperational({ className = "w-10 h-10" }) {
  return (
    <div className={`rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center p-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </div>
  );
}

// 2b. Transparansi Finansial (Electric Blue Glowing Shield Check)
export function IconFinancial({ className = "w-10 h-10" }) {
  return (
    <div className={`rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center p-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    </div>
  );
}

// 2c. Alur Kerja Standard (Royal Purple Glowing Clipboard Checklist)
export function IconWorkflow({ className = "w-10 h-10" }) {
  return (
    <div className={`rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center p-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    </div>
  );
}

// 2d. Laporan Operasional (Vivid Amber Glowing Trend Bar Chart)
export function IconReports({ className = "w-10 h-10" }) {
  return (
    <div className={`rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center p-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <path d="M3 13l6-6 4 4 8-8" />
        <polyline points="17 3 21 3 21 7" />
      </svg>
    </div>
  );
}

// 2e. Kepuasan Pelanggan (Teal / Cyan Glowing Community Users)
export function IconSatisfaction({ className = "w-10 h-10" }) {
  return (
    <div className={`rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center p-2 shadow-[0_0_20px_rgba(20,184,166,0.3)] ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_8px_rgba(20,184,166,0.9)]">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
  );
}

// 3. Social Proof Metric Icons (4 Items matching Canva)

// 3a. 2.500+ Bengkel Aktif (Emerald Users Group)
export function MetricWorkshops({ className = "w-11 h-11" }) {
  return (
    <div className={`rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center p-2.5 shadow-[0_0_25px_rgba(16,185,129,0.35)] shrink-0 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
  );
}

// 3b. 120K+ Pekerjaan Terselesaikan (Cobalt Blue Crossed Wrench & Screwdriver)
export function MetricJobs({ className = "w-11 h-11" }) {
  return (
    <div className={`rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center p-2.5 shadow-[0_0_25px_rgba(59,130,246,0.35)] shrink-0 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    </div>
  );
}

// 3c. 98% Pelanggan Puas (Purple Trending Chart Arrow)
export function MetricRating({ className = "w-11 h-11" }) {
  return (
    <div className={`rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center p-2.5 shadow-[0_0_25px_rgba(168,85,247,0.35)] shrink-0 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    </div>
  );
}

// 3d. 99.9% Keamanan Data (Emerald Shield Check)
export function MetricSecurity({ className = "w-11 h-11" }) {
  return (
    <div className={`rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center p-2.5 shadow-[0_0_25px_rgba(16,185,129,0.35)] shrink-0 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    </div>
  );
}
