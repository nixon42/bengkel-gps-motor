import React from 'react';
import { 
  LogIn, 
  Stethoscope, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  KeyRound,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

export default function RoWorkflowDiagram({ activeStage = null, className = '' }) {
  const stages = [
    {
      key: 'MASUK',
      num: 1,
      name: '1. Masuk',
      title: 'Penerimaan',
      desc: 'Unit tiba, catat km odometer, keluhan pemilik',
      icon: LogIn,
      color: 'bg-slate-700 text-white dark:bg-slate-600',
      border: 'border-slate-500'
    },
    {
      key: 'DIAGNOSA',
      num: 2,
      name: '2. Diagnosa',
      title: 'Inspeksi & Scan',
      desc: 'OBD2 scan, tes fisik, estimasi jasa & part',
      icon: Stethoscope,
      color: 'bg-sky-600 text-white',
      border: 'border-sky-500'
    },
    {
      key: 'PENGERJAAN',
      num: 3,
      name: '3. Pengerjaan',
      title: 'Servis Aktif',
      desc: 'Bongkar mesin, tune up, pasang suku cadang',
      icon: Wrench,
      color: 'bg-amber-600 text-white',
      border: 'border-amber-500'
    },
    {
      key: 'MENUNGGU_PART',
      num: 4,
      name: '4. Tunggu Part',
      title: 'Inden Suku Cadang',
      desc: 'Menunggu kiriman part khusus dari supplier',
      icon: Clock,
      color: 'bg-purple-600 text-white',
      border: 'border-purple-500'
    },
    {
      key: 'SELESAI',
      num: 5,
      name: '5. Selesai',
      title: 'Quality Check',
      desc: 'Test drive oke, unit bersih, foto after diunggah',
      icon: CheckCircle2,
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-500'
    },
    {
      key: 'DIAMBIL',
      num: 6,
      name: '6. Diambil',
      title: 'Serah Terima',
      desc: 'Pelunasan di kasir, auto-record kas, cetak nota',
      icon: KeyRound,
      color: 'bg-blue-600 text-white',
      border: 'border-blue-500'
    }
  ];

  return (
    <div className={`rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 my-4 ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Siklus Hidup Servis Mobil (6-Stage RO Lifecycle)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Alur pengerjaan baku kendaraan dari tiba hingga serah terima kunci
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
          6 Tahapan
        </span>
      </div>

      {/* Desktop Horizontal Stepper (hidden on mobile) */}
      <div className="hidden lg:grid grid-cols-6 gap-2">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = activeStage === stage.key;
          return (
            <div key={stage.key} className="relative flex flex-col items-center text-center">
              {idx < stages.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />
              )}
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow-none border-2 ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                } ${stage.color} ${stage.border}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                {stage.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                {stage.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Vertical Stepper (block on screens < lg) */}
      <div className="lg:hidden space-y-3 relative before:absolute before:top-3 before:bottom-3 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isSelected = activeStage === stage.key;
          return (
            <div 
              key={stage.key} 
              className={`relative flex items-start space-x-3 p-2.5 rounded border ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                  : 'border-slate-200 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-900/50'
              }`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-none ${stage.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {stage.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Tahap {stage.num}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
