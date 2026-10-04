import React, { useState } from 'react';

/**
 * Format currency to IDR
 */
function formatRupiah(val) {
  const num = Math.round(Number(val) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Modern Flat Pure SVG P&L Bar Chart
 * Zero external libraries, zero blur/glassmorphism, high contrast and lightweight.
 */
export default function PnlChart({ data = [] }) {
  const [activeItem, setActiveItem] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-400 text-sm">
        Tidak ada data grafik laba rugi
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => Math.max(d.income || 0, d.expense || 0)), 1000000);
  const chartHeight = 160;
  const chartWidth = 560;
  const startX = 40;
  const availableWidth = chartWidth - startX - 20;
  const groupWidth = availableWidth / data.length;
  const barWidth = Math.min(22, (groupWidth - 14) / 2);

  return (
    <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tren Laba Rugi Bulanan (P&L)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Komparasi Pemasukan vs Pengeluaran 6 Bulan Terakhir</p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300">Pemasukan</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300">Pengeluaran</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} 220`}
          className="w-full h-56 select-none font-sans"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.5, 1].map((pct, idx) => {
            const y = chartHeight - (chartHeight * pct) + 20;
            const val = maxVal * pct;
            return (
              <g key={idx}>
                <line
                  x1={startX}
                  y1={y}
                  x2={chartWidth - 10}
                  y2={y}
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-700"
                  strokeDasharray={pct > 0 ? "3 3" : "none"}
                  strokeWidth="1"
                />
                <text
                  x={startX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {val >= 1000000 ? `${(val / 1000000).toFixed(0)}Jt` : `${(val / 1000).toFixed(0)}Rb`}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, idx) => {
            const groupX = startX + (idx * groupWidth) + ((groupWidth - (barWidth * 2 + 4)) / 2);
            const incomeHeight = ((item.income || 0) / maxVal) * chartHeight;
            const expenseHeight = ((item.expense || 0) / maxVal) * chartHeight;

            const incomeY = chartHeight - incomeHeight + 20;
            const expenseY = chartHeight - expenseHeight + 20;

            const isHovered = activeItem === item;

            return (
              <g 
                key={item.month || idx} 
                className="cursor-pointer"
                onMouseEnter={() => setActiveItem(item)}
                onMouseLeave={() => setActiveItem(null)}
                onClick={() => setActiveItem(activeItem === item ? null : item)}
              >
                {/* Hit area */}
                <rect
                  x={startX + (idx * groupWidth)}
                  y={10}
                  width={groupWidth}
                  height={chartHeight + 35}
                  fill="transparent"
                />

                {/* Income Bar (Green) */}
                <rect
                  x={groupX}
                  y={incomeY}
                  width={barWidth}
                  height={Math.max(incomeHeight, 2)}
                  rx="2"
                  className={`transition-colors ${isHovered ? 'fill-emerald-400' : 'fill-emerald-500 dark:fill-emerald-400'}`}
                />

                {/* Expense Bar (Red) */}
                <rect
                  x={groupX + barWidth + 4}
                  y={expenseY}
                  width={barWidth}
                  height={Math.max(expenseHeight, 2)}
                  rx="2"
                  className={`transition-colors ${isHovered ? 'fill-rose-400' : 'fill-rose-500 dark:fill-rose-400'}`}
                />

                {/* Month Label */}
                <text
                  x={groupX + barWidth + 2}
                  y={chartHeight + 38}
                  textAnchor="middle"
                  className={`text-[10px] ${isHovered ? 'fill-blue-600 dark:fill-blue-400 font-bold' : 'fill-slate-600 dark:fill-slate-400'}`}
                >
                  {item.label || item.month}
                </text>

                {/* Net Badge (Above bars) */}
                <text
                  x={groupX + barWidth + 2}
                  y={Math.min(incomeY, expenseY) - 5}
                  textAnchor="middle"
                  className={`text-[8.5px] font-bold ${item.net >= 0 ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}`}
                >
                  {item.net >= 0 ? `+${(item.net / 1000000).toFixed(1)}Jt` : `-${(Math.abs(item.net) / 1000000).toFixed(1)}Jt`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Detail Box */}
        {activeItem && (
          <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700/80 rounded border border-slate-200 dark:border-slate-600 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-bold text-slate-800 dark:text-white">
              Periode: {activeItem.label || activeItem.month}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Pemasukan: {formatRupiah(activeItem.income)}
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Pengeluaran: {formatRupiah(activeItem.expense)}
              </span>
              <span className={`font-bold ${activeItem.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                Saldo Bersih: {formatRupiah(activeItem.net)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
