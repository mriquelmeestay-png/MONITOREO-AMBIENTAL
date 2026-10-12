import React, { useState } from 'react';
import { BarChart3, PieChart, Calendar } from 'lucide-react';
import { SamplingRecord } from '../types/sampling';

interface ChartsPanelProps {
  records: SamplingRecord[];
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ records }) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // 1. Data: Abundance by Category
  const categories = [
    { label: 'Aves', key: 'Aves', color: '#0284c7' },
    { label: 'Mamíferos', key: 'Mamíferos', color: '#6366f1' },
    { label: 'Reptiles', key: 'Reptiles', color: '#d97706' },
    { label: 'Flora', key: 'Flora', color: '#10b981' }
  ];

  const catValues = categories.map((c) => {
    const sum = records
      .filter((r) => r.category === c.key)
      .reduce((acc, r) => acc + (r.abundance || 1), 0);
    return { ...c, value: sum };
  });

  const maxCatVal = Math.max(1, ...catValues.map((c) => c.value));

  // 2. Data: Conservation Status
  const statusConfig = [
    { label: 'Preocupación Menor (LC)', short: 'LC', color: '#10b981' },
    { label: 'Vulnerable (VU)', short: 'VU', color: '#f59e0b' },
    { label: 'En Peligro (EN)', short: 'EN', color: '#ef4444' },
    { label: 'En Peligro Crítico (CR)', short: 'CR', color: '#991b1b' },
    { label: 'Otros / DD / Doméstico', short: 'Otros', color: '#64748b' }
  ];

  const statusValues = statusConfig.map((sc) => {
    let count = 0;
    if (sc.short === 'Otros') {
      count = records.filter(
        (r) =>
          !r.status.includes('LC') &&
          !r.status.includes('VU') &&
          !r.status.includes('EN') &&
          !r.status.includes('CR')
      ).length;
    } else {
      count = records.filter((r) => r.status.includes(sc.short)).length;
    }
    return { ...sc, value: count };
  });

  const totalStatus = Math.max(1, records.length);

  // Compute SVG Doughnut slices
  let cumulativeAngle = 0;
  const doughnutSlices = statusValues.map((item) => {
    const fraction = item.value / totalStatus;
    const angle = fraction * 360;
    const start = cumulativeAngle;
    cumulativeAngle += angle;
    return {
      ...item,
      startAngle: start,
      endAngle: cumulativeAngle,
      fraction
    };
  });

  // Helper for polar to cartesian
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  const getDoughnutPath = (cx: number, cy: number, rOut: number, rIn: number, startAngle: number, endAngle: number) => {
    if (endAngle - startAngle >= 359.9) {
      // Full circle with inner cutout
      return `M ${cx} ${cy - rOut} A ${rOut} ${rOut} 0 1 0 ${cx} ${cy + rOut} A ${rOut} ${rOut} 0 1 0 ${cx} ${cy - rOut} M ${cx} ${cy - rIn} A ${rIn} ${rIn} 0 1 1 ${cx} ${cy + rIn} A ${rIn} ${rIn} 0 1 1 ${cx} ${cy - rIn} Z`;
    }
    const p1 = polarToCartesian(cx, cy, rOut, endAngle);
    const p2 = polarToCartesian(cx, cy, rOut, startAngle);
    const p3 = polarToCartesian(cx, cy, rIn, startAngle);
    const p4 = polarToCartesian(cx, cy, rIn, endAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 ${largeArc} 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 ${largeArc} 1 ${p4.x} ${p4.y} Z`;
  };

  // 3. Data: Campaign Breakdown
  const campaigns = ['Campaña 1', 'Campaña 2', 'Campaña 3', 'Campaña 4'];
  const campaignValues = campaigns.map((cmp) => {
    const count = records.filter((r) => r.campaign === cmp).length;
    return { label: cmp, value: count };
  });
  const maxCmpVal = Math.max(1, ...campaignValues.map((c) => c.value));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Chart 1: Abundancia por Categoría */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm card-box flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-800">Abundancia por Categoría</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Total ind.</span>
        </div>

        {/* SVG Horizontal Bar Chart */}
        <div className="space-y-2.5 my-auto">
          {catValues.map((item) => {
            const barPct = Math.round((item.value / maxCatVal) * 100);
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">{item.label}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {item.value} <span className="text-[10px] text-slate-400 font-normal">ind.</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${barPct}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Mayor registro:</span>
          <span className="font-medium text-slate-800">
            {catValues.reduce((prev, cur) => (cur.value > prev.value ? cur : prev)).label}
          </span>
        </div>
      </div>

      {/* Chart 2: Estado de Conservación */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm card-box flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-800">Estado de Conservación</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">RCE / UICN</span>
        </div>

        <div className="flex items-center gap-4 my-auto">
          {/* Doughnut SVG */}
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {doughnutSlices.map((slice, idx) => {
                if (slice.value === 0) return null;
                const path = getDoughnutPath(50, 50, 46, 28, slice.startAngle, slice.endAngle);
                return (
                  <path
                    key={idx}
                    d={path}
                    fill={slice.color}
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                    onMouseEnter={() => setHoveredSlice(slice.label)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}
              {records.length === 0 && (
                <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="18" />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                {records.length}
              </span>
              <span className="text-[9px] text-slate-400">pts</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1 text-xs w-full">
            {statusValues.map((item) => (
              <div
                key={item.short}
                className={`flex items-center justify-between py-0.5 px-1 rounded transition-colors ${
                  hoveredSlice === item.label ? 'bg-slate-100 font-semibold' : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] text-slate-700">{item.short}</span>
                </div>
                <span className="font-mono text-slate-800 text-[11px] tabular-nums">
                  {item.value} ({totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Especies amenazadas:</span>
          <span className="font-medium text-red-600 font-mono">
            {records.filter((r) => r.status.includes('VU') || r.status.includes('EN') || r.status.includes('CR')).length} pts
          </span>
        </div>
      </div>

      {/* Chart 3: Muestreos por Campaña */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm card-box flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800">Muestreos por Campaña</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Estacional</span>
        </div>

        {/* Vertical Columns */}
        <div className="grid grid-cols-4 gap-2 items-end h-32 pt-4 px-2 my-auto">
          {campaignValues.map((cmp) => {
            const heightPct = Math.max(8, Math.round((cmp.value / maxCmpVal) * 100));
            return (
              <div key={cmp.label} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[11px] font-mono font-bold text-slate-800 tabular-nums">
                  {cmp.value}
                </span>
                <div className="w-full bg-slate-100 rounded-t h-full max-h-24 flex items-end">
                  <div
                    className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all rounded-t"
                    style={{ height: `${heightPct}%` }}
                    title={`${cmp.label}: ${cmp.value} puntos`}
                  />
                </div>
                <span className="text-[10px] text-slate-600 font-medium text-center truncate w-full">
                  {cmp.label.replace('Campaña ', 'C')}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Campaña activa:</span>
          <span className="font-medium text-emerald-700">Campaña 1 (Verano)</span>
        </div>
      </div>
    </div>
  );
};
