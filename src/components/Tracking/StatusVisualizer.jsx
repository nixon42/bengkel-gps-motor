import React from 'react';
import { 
  ClipboardList, 
  FileCheck, 
  Wrench, 
  Cog, 
  CheckCircle, 
  Car,
  Check, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

const STAGE_ICONS = {
  1: ClipboardList,
  2: FileCheck,
  3: Wrench,
  4: Cog,
  5: CheckCircle,
  6: Car,
  MASUK: ClipboardList,
  DIAGNOSA: FileCheck,
  PENGERJAAN: Wrench,
  MENUNGGU_PART: Cog,
  SELESAI: CheckCircle,
  DIAMBIL: Car
};

export default function StatusVisualizer({ stages = [], currentStatus = 'PENGERJAAN' }) {
  if (!stages || stages.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Pantau Proses Perbaikan (Staging Repair Order)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sistem pelacakan pengerjaan 6-tahap transparan berstandar bengkel resmi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold uppercase tracking-wide">
            Tahap Aktif: {currentStatus}
          </span>
        </div>
      </div>

      {/* Stepper Grid / Timeline matching Mockup */}
      <div className="relative">
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-6 md:gap-2">
          {stages.map((stage, idx) => {
            const isCompleted = stage.isCompleted;
            const isCurrent = stage.isCurrent;
            const IconComponent = STAGE_ICONS[stage.step] || STAGE_ICONS[stage.key] || Wrench;

            return (
              <div 
                key={stage.key || idx} 
                className={`flex md:flex-col items-start md:items-center relative p-2.5 md:p-2 rounded-lg transition-colors ${
                  isCurrent ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80' : ''
                }`}
              >
                
                {/* Horizontal Connector Line for Desktop */}
                {idx < stages.length - 1 && (
                  <div
                    className={`hidden md:block absolute top-6 left-1/2 w-full h-1 -z-0 ${
                      isCompleted && !isCurrent
                        ? 'bg-[#0c2b5e]'
                        : isCurrent
                        ? 'bg-[#00a86b]'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}

                {/* Vertical Connector Line for Mobile */}
                {idx < stages.length - 1 && (
                  <div
                    className={`md:hidden absolute top-10 left-5 w-0.5 h-12 -z-0 ${
                      isCompleted
                        ? 'bg-[#0c2b5e]'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}

                {/* Step Circle Badge */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-colors border-2 ${
                    isCurrent
                      ? 'bg-[#00a86b] border-emerald-500 text-white ring-2 ring-emerald-200 dark:ring-emerald-950 shadow-none'
                      : isCompleted
                      ? 'bg-[#0c2b5e] border-[#0c2b5e] text-white shadow-none'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Step Label & Meta */}
                <div className="ml-4 md:ml-0 md:mt-2.5 md:text-center w-full">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    Tahap {stage.step || idx + 1}
                  </span>

                  <div
                    className={`text-xs leading-tight block mt-0.5 ${
                      isCurrent
                        ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                        : isCompleted
                        ? 'text-slate-900 dark:text-white font-bold'
                        : 'text-slate-500 dark:text-slate-400 font-medium'
                    }`}
                  >
                    {stage.label}
                  </div>

                  {isCurrent && (
                    <span className="mt-1 px-1.5 py-0.5 inline-block rounded bg-emerald-600 text-white text-[11px] font-mono font-bold tracking-wider uppercase">
                      Aktif
                    </span>
                  )}

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 md:hidden lg:block">
                    {stage.description}
                  </p>

                  {/* Timestamp if logged */}
                  {stage.timestamp && (
                    <div className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1 flex items-center md:justify-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{stage.timestamp.substring(11, 16)} WIB</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
