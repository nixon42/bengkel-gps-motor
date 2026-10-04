import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

export default function StatusVisualizer({ stages = [], currentStatus = 'PENGERJAAN' }) {
  if (!stages || stages.length === 0) {
    return null;
  }

  return (
    <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Tahapan Pengerjaan Servis</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Proses 6 langkah transparan dari unit masuk hingga serah terima
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono text-xs font-bold">
          Status: {currentStatus}
        </span>
      </div>

      {/* Stepper Grid / Timeline */}
      <div className="relative">
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-6 md:gap-3">
          {stages.map((stage, idx) => {
            const isCompleted = stage.isCompleted;
            const isCurrent = stage.isCurrent;

            return (
              <div key={stage.key} className="flex md:flex-col items-start md:items-center relative">
                
                {/* Horizontal Connector Line for Desktop */}
                {idx < stages.length - 1 && (
                  <div
                    className={`hidden md:block absolute top-4 left-1/2 w-full h-1 -z-0 ${
                      isCompleted && !isCurrent
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-blue-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}

                {/* Vertical Connector Line for Mobile */}
                {idx < stages.length - 1 && (
                  <div
                    className={`md:hidden absolute top-8 left-4 w-0.5 h-12 -z-0 ${
                      isCompleted && !isCurrent
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}

                {/* Step Circle Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-colors ${
                    isCompleted && !isCurrent
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                    </span>
                  ) : (
                    <span>{stage.step || idx + 1}</span>
                  )}
                </div>

                {/* Step Label & Meta */}
                <div className="ml-4 md:ml-0 md:mt-3 md:text-center w-full">
                  <div
                    className={`text-xs sm:text-sm font-bold ${
                      isCurrent
                        ? 'text-blue-600 dark:text-blue-400'
                        : isCompleted
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 md:hidden lg:block">
                    {stage.description}
                  </p>

                  {/* Timestamp if logged */}
                  {stage.timestamp && (
                    <div className="inline-flex items-center space-x-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{new Date(stage.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                    </div>
                  )}

                  {/* Special note for current stage */}
                  {stage.notes && isCurrent && (
                    <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-left md:text-center text-[11px] text-blue-900 dark:text-blue-200">
                      <span className="font-semibold block">Catatan Terkini:</span>
                      <span>{stage.notes}</span>
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
