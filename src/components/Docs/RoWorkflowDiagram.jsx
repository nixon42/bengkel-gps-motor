import React from 'react';
import { 
  ClipboardList, 
  FileCheck, 
  Wrench, 
  Cog, 
  CheckCircle, 
  Car,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

export default function RoWorkflowDiagram({ activeStage = null, className = '' }) {
  const stages = [
    {
      key: 'MASUK',
      num: 1,
      name: '1. Pendaftaran & Diagnosa',
      title: 'Penerimaan',
      desc: 'Unit tiba, cek fisik, scan OBD2, catat km',
      icon: ClipboardList,
      color: 'bg-[#0c2b5e] text-white',
      border: 'border-[#0c2b5e]'
    },
    {
      key: 'DIAGNOSA',
      num: 2,
      name: '2. Estimasi Disetujui',
      title: 'Transparansi',
      desc: 'Rincian jasa & part disetujui di awal via WA',
      icon: FileCheck,
      color: 'bg-[#0c2b5e] text-white',
      border: 'border-[#0c2b5e]'
    },
    {
      key: 'PENGERJAAN',
      num: 3,
      name: '3. Pengerjaan Dimulai',
      title: 'Stall Servis',
      desc: 'Mobil naik pit lift 4-ton, servis aktif',
      icon: Wrench,
      color: 'bg-[#0c2b5e] text-white',
      border: 'border-[#0c2b5e]'
    },
    {
      key: 'MENUNGGU_PART',
      num: 4,
      name: '4. Suku Cadang Diganti',
      title: 'Part Asli',
      desc: 'Part baru dipasang, part bekas disimpan kembali',
      icon: Cog,
      color: 'bg-[#00a86b] text-white ring-2 ring-emerald-200 dark:ring-emerald-950',
      border: 'border-emerald-500'
    },
    {
      key: 'SELESAI',
      num: 5,
      name: '5. Quality Control',
      title: 'Uji Kelayakan',
      desc: 'Test drive, cek sensor, foto final pengerjaan',
      icon: CheckCircle,
      color: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-600'
    },
    {
      key: 'DIAMBIL',
      num: 6,
      name: '6. Kendaraan Siap',
      title: 'Serah Terima',
      desc: 'Pelunasan transparan, cetak nota, unit siap jalan',
      icon: Car,
      color: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-600'
    }
  ];

  return (
    <div className={`rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-6 my-4 shadow-none ${className}`}>
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Siklus Hidup Servis Mobil (6-Stage RO Lifecycle)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Alur pengerjaan baku kendaraan dari pendaftaran hingga serah terima kunci
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          6 Tahapan Resmi
        </span>
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden lg:grid grid-cols-6 gap-2">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = activeStage === stage.key;
          return (
            <div key={stage.key} className="relative flex flex-col items-center text-center">
              {idx < stages.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />
              )}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow-none border-2 ${
                  isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                } ${stage.color} ${stage.border}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {stage.name}
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {stage.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Vertical Stepper */}
      <div className="lg:hidden space-y-3 relative before:absolute before:top-3 before:bottom-3 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isSelected = activeStage === stage.key;
          return (
            <div 
              key={stage.key} 
              className={`relative flex items-start space-x-3 p-3 rounded-lg border ${
                isSelected 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'
              }`}
            >
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 shadow-none ${stage.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {stage.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Tahap {stage.num}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
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
