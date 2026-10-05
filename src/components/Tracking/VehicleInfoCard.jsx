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
    <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6 space-y-6">
      
      {/* Top Header with Masked Plate & Privacy Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Car className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-slate-900 dark:text-white px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                {repairOrder.maskedPlate || repairOrder.plate_masked || 'AG **** **'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                Plat Disamarkan
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              No. RO: <span className="font-mono text-slate-700 dark:text-slate-300">{repairOrder.ro_number || repairOrder.roNumber || '-'}</span>
            </div>
          </div>
        </div>

        {/* Privacy Shield Pill */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Privasi Pelanggan Terlindungi (E01-E06)</span>
        </div>
      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        {/* Customer Masked Name */}
        <div className="p-3 rounded border border-slate-100 dark:border-slate-750 bg-slate-50 dark:bg-slate-750/50">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold">Nama Pemilik</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            {repairOrder.maskedCustomerName || repairOrder.customer_name_masked || 'Pelanggan'}
          </span>
        </div>

        {/* Car Details */}
        <div className="p-3 rounded border border-slate-100 dark:border-slate-750 bg-slate-50 dark:bg-slate-750/50">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Car className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold">Kendaraan</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {repairOrder.car_brand || repairOrder.carBrand} {repairOrder.car_model || repairOrder.carModel}
          </span>
          <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tahun {repairOrder.car_year || repairOrder.carYear || '-'} • {repairOrder.car_color || repairOrder.carColor || '-'}
          </span>
        </div>

        {/* Entry Date & Odometer */}
        <div className="p-3 rounded border border-slate-100 dark:border-slate-750 bg-slate-50 dark:bg-slate-750/50">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold">Tanggal Masuk</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            {repairOrder.entry_date || repairOrder.entryDate || '-'}
          </span>
          {repairOrder.odometer_in && (
            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Odo: {Number(repairOrder.odometer_in).toLocaleString('id-ID')} km
            </span>
          )}
        </div>

        {/* Estimated Completion */}
        <div className="p-3 rounded border border-slate-100 dark:border-slate-750 bg-slate-50 dark:bg-slate-750/50">
          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold">Estimasi Selesai</span>
          </div>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400 font-mono">
            {formatEstimatedDate(repairOrder.estimated_completion || repairOrder.estimatedCompletion)}
          </span>
          <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Mekanik: {repairOrder.mechanic_name || 'Tim Mekanik GPS'}
          </span>
        </div>

      </div>

      {/* Complaint / Keluhan Box */}
      {repairOrder.complaint && (
        <div className="p-3.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750/30">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Keluhan Awal Saat Masuk:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic">
            "{repairOrder.complaint}"
          </p>
        </div>
      )}

    </div>
  );
}
