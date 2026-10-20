import React from 'react';
import { Car, User, Calendar, Gauge, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

function formatEstimatedDate(val) {
  if (!val) return 'Dalam Konfirmasi';
  const isoMatch = String(val).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/);
  if (isoMatch) {
    const [_, y, m, d, hh, mm] = isoMatch;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthName = months[parseInt(m, 10) - 1] || m;
    const dateStr = `${parseInt(d, 10)} ${monthName} ${y}`;
    if (hh !== undefined && mm !== undefined) {
      return `${dateStr}, ${hh}:${mm} WIB`;
    }
    return dateStr;
  }
  return val;
}

export default function VehicleInfoCard({ repairOrder }) {
  if (!repairOrder) return null;

  return (
    <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6 space-y-6 shadow-none">
      
      {/* Top Header with Masked Plate & Privacy Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-[#0c2b5e] text-white flex items-center justify-center shrink-0 shadow-none">
            <Car className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-[#0c2b5e] dark:text-blue-300 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800">
                {repairOrder.maskedPlate || repairOrder.plate_masked || 'AG **** **'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-bold uppercase">
                Sensor Privasi
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              No. SPK / RO: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{repairOrder.ro_number || repairOrder.roNumber || '-'}</span>
            </div>
          </div>
        </div>

        {/* Privacy Shield Pill */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Nama &amp; HP Disensor Otomatis</span>
        </div>
      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        {/* Customer Masked Name */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <User className="w-3.5 h-3.5 text-[#0c2b5e] dark:text-blue-400" />
            <span className="font-bold uppercase tracking-wider text-xs">Nama Pemilik</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono block">
            {repairOrder.maskedCustomerName || repairOrder.customer_name_masked || 'Pelanggan'}
          </span>
        </div>

        {/* Car Details */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Car className="w-3.5 h-3.5 text-[#0c2b5e] dark:text-blue-400" />
            <span className="font-bold uppercase tracking-wider text-xs">Unit Kendaraan</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white block">
            {repairOrder.car_brand || repairOrder.carBrand} {repairOrder.car_model || repairOrder.carModel}
          </span>
          <span className="block text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            Tahun {repairOrder.car_year || repairOrder.carYear || '-'} • {repairOrder.car_color || repairOrder.carColor || '-'}
          </span>
        </div>

        {/* Entry Date & Odometer */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#0c2b5e] dark:text-blue-400" />
            <span className="font-bold uppercase tracking-wider text-xs">Tanggal Masuk</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono block">
            {repairOrder.entry_date || repairOrder.entryDate || '-'}
          </span>
          {repairOrder.odometer_in && (
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Odo: {Number(repairOrder.odometer_in).toLocaleString('id-ID')} km
            </span>
          )}
        </div>

        {/* Estimated Completion */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold uppercase tracking-wider text-xs">Estimasi Selesai</span>
          </div>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400 font-mono block">
            {formatEstimatedDate(repairOrder.estimated_completion || repairOrder.estimatedCompletion)}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Mekanik: {repairOrder.mechanic_name || 'Tim Mekanik GPS'}
          </span>
        </div>

      </div>

      {/* Complaint / Keluhan Box */}
      {repairOrder.complaint && (
        <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 mb-1 uppercase font-mono">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Keluhan Awal Saat Masuk Bengkel:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
            "{repairOrder.complaint}"
          </p>
        </div>
      )}

    </div>
  );
}
