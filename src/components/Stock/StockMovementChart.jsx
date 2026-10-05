import React, { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, TrendingUp, BarChart2 } from 'lucide-react';

export default function StockMovementChart({ movements = [] }) {
  // Aggregate last 14 days of stock movements
  const chartData = useMemo(() => {
    const daysMap = new Map();
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      daysMap.set(dateKey, {
        date: dateKey,
        label: dateKey.slice(5), // MM-DD
        inQty: 0,
        outQty: 0
      });
    }

    for (const m of movements) {
      if (!m.date) continue;
      const dateKey = m.date.slice(0, 10);
      if (daysMap.has(dateKey)) {
        const item = daysMap.get(dateKey);
        const qty = Number(m.quantity) || 0;
        if (m.type === 'IN') {
          item.inQty += qty;
        } else if (m.type === 'OUT') {
          item.outQty += qty;
        }
      }
    }

    return Array.from(daysMap.values());
  }, [movements]);

  const totalIn = chartData.reduce((acc, d) => acc + d.inQty, 0);
  const totalOut = chartData.reduce((acc, d) => acc + d.outQty, 0);
  const maxQty = Math.max(...chartData.map(d => Math.max(d.inQty, d.outQty)), 10);

  // SVG Geometry
  const width = 580;
  const height = 150;
  const paddingBottom = 26;
  const paddingTop = 16;
  const chartHeight = height - paddingBottom - paddingTop;
  const groupWidth = (width - 40) / chartData.length;
  const barWidth = Math.max(6, (groupWidth - 8) / 2);

  return (
    <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4 mb-6 shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-700 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Grafik Alur Mutasi Stok (14 Hari Terakhir)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbandingan volume unit suku cadang masuk (restock) vs keluar (servis)
            </p>
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Masuk:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{totalIn} pcs</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Keluar:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{totalOut} pcs</span>
          </div>
        </div>
      </div>

      {/* Pure SVG Bar Chart */}
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40 select-none font-sans"
        >
          {/* Horizontal grid lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = height - paddingBottom - (ratio * chartHeight);
            const val = Math.round(maxQty * ratio);
            return (
              <g key={idx}>
                <line
                  x1="30"
                  y1={y}
                  x2={width - 10}
                  y2={y}
                  className="stroke-slate-100 dark:stroke-slate-700"
                  strokeDasharray={ratio > 0 ? "3 3" : "none"}
                />
                <text
                  x="24"
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Dual Bars for Each Day */}
          {chartData.map((d, i) => {
            const groupX = 35 + i * groupWidth;
            const inBarH = (d.inQty / maxQty) * chartHeight;
            const outBarH = (d.outQty / maxQty) * chartHeight;
            const inY = height - paddingBottom - inBarH;
            const outY = height - paddingBottom - outBarH;

            return (
              <g key={d.date} className="group cursor-default">
                {/* IN bar (Emerald) */}
                {d.inQty > 0 && (
                  <rect
                    x={groupX}
                    y={inY}
                    width={barWidth}
                    height={inBarH}
                    className="fill-emerald-500 hover:fill-emerald-600 transition-colors"
                    rx="1.5"
                  >
                    <title>{`${d.date}: ${d.inQty} unit masuk`}</title>
                  </rect>
                )}

                {/* OUT bar (Blue) */}
                {d.outQty > 0 && (
                  <rect
                    x={groupX + barWidth + 2}
                    y={outY}
                    width={barWidth}
                    height={outBarH}
                    className="fill-blue-500 hover:fill-blue-600 transition-colors"
                    rx="1.5"
                  >
                    <title>{`${d.date}: ${d.outQty} unit keluar`}</title>
                  </rect>
                )}

                {/* X axis date label */}
                <text
                  x={groupX + barWidth}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
