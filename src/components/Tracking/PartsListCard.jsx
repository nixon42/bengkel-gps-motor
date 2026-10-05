import React from 'react';
import { Package, Receipt, CheckCircle2 } from 'lucide-react';

export default function PartsListCard({ repairOrder, spareparts = [] }) {
  if (!repairOrder) return null;

  const serviceFee = Number(repairOrder.service_fee || repairOrder.serviceFee || 0);
  const sparepartFee = Number(repairOrder.sparepart_fee || repairOrder.sparepartFee || 0);
  const totalCost = Number(repairOrder.total_cost || repairOrder.totalCost || 0);

  return (
    <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Rincian Biaya & Suku Cadang
          </h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          Transparan & Jelas
        </span>
      </div>

      {/* Parts Table / List */}
      {spareparts && spareparts.length > 0 ? (
        <div>
          {/* Mobile Card List (< 640px) */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-750">
            {spareparts.map((item, idx) => (
              <div key={item.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.item_name || item.itemName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {item.quantity} × Rp {Number(item.unit_price || item.unitPrice || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="font-bold font-mono text-slate-900 dark:text-white shrink-0">
                  Rp {Number(item.subtotal || 0).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 640px) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-2 font-semibold">Nama Sparepart</th>
                  <th className="py-2 text-center font-semibold">Qty</th>
                  <th className="py-2 text-right font-semibold">Harga Satuan</th>
                  <th className="py-2 text-right font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                {spareparts.map((item, idx) => (
                  <tr key={item.id || idx} className="text-slate-800 dark:text-slate-200">
                    <td className="py-2.5 font-medium pr-2">{item.item_name || item.itemName}</td>
                    <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono">
                      Rp {Number(item.unit_price || item.unitPrice || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      Rp {Number(item.subtotal || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          Belum ada suku cadang tambahan yang dicatat untuk servis ini.
        </p>
      )}

      {/* Cost Summary Box */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Biaya Jasa Servis Mekanik:</span>
          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
            Rp {serviceFee.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Total Suku Cadang:</span>
          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
            Rp {sparepartFee.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
          <span>Total Estimasi Biaya:</span>
          <span className="font-mono text-blue-600 dark:text-blue-400">
            Rp {totalCost.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
}
