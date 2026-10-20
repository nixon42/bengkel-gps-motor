import React from 'react';
import { Package, Receipt, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function PartsListCard({ repairOrder, spareparts = [] }) {
  if (!repairOrder) return null;

  const serviceFee = Number(repairOrder.service_fee || repairOrder.serviceFee || 0);
  const sparepartFee = Number(repairOrder.sparepart_fee || repairOrder.sparepartFee || 0);
  const totalCost = Number(repairOrder.total_cost || repairOrder.totalCost || 0);

  return (
    <div className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 sm:p-6 space-y-5 shadow-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Rincian Biaya &amp; Suku Cadang
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          Transparan &amp; Bergaransi
        </span>
      </div>

      {/* Parts Table / List */}
      {spareparts && spareparts.length > 0 ? (
        <div>
          {/* Mobile Card List (< 640px) */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-700">
            {spareparts.map((item, idx) => (
              <div key={item.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {item.item_name || item.itemName}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {item.quantity} × Rp {Number(item.unit_price || item.unitPrice || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="font-black font-mono text-slate-900 dark:text-white shrink-0">
                  Rp {Number(item.subtotal || 0).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 640px) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono uppercase">
                  <th className="py-2 font-bold">Nama Sparepart</th>
                  <th className="py-2 text-center font-bold">Qty</th>
                  <th className="py-2 text-right font-bold">Harga Satuan</th>
                  <th className="py-2 text-right font-bold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {spareparts.map((item, idx) => (
                  <tr key={item.id || idx} className="text-slate-800 dark:text-slate-200">
                    <td className="py-2.5 font-bold pr-2">{item.item_name || item.itemName}</td>
                    <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono">
                      Rp {Number(item.unit_price || item.unitPrice || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
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

      {/* Transparency Guarantee Banner */}
      <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>Jaminan Integritas Bengkel:</strong> Seluruh suku cadang bekas yang diganti wajib dikemas rapi dan diserahkan kembali kepada Anda.
        </span>
      </div>

      {/* Cost Summary Box */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Biaya Jasa Servis Mekanik:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            Rp {serviceFee.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Total Suku Cadang:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            Rp {sparepartFee.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700">
          <span>Total Estimasi Biaya:</span>
          <span className="font-mono text-[#0c2b5e] dark:text-emerald-400 text-lg">
            Rp {totalCost.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
}
