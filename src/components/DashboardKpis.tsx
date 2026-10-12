import React from 'react';
import { MapPin, Users, Dna, Egg } from 'lucide-react';
import { SamplingRecord } from '../types/sampling';

interface DashboardKpisProps {
  records: SamplingRecord[];
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ records }) => {
  const totalPoints = records.length;
  const totalAbundance = records.reduce((acc, r) => acc + (r.abundance || 1), 0);
  const uniqueSpecies = new Set(
    records.map((r) => r.scientificName).filter(Boolean)
  ).size;

  const totalNests = records.reduce((acc, r) => {
    if (r.category === 'Aves' && r.nestInfo && r.nestInfo.status !== 'Sin Nido / No aplica') {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div id="dashboard" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Points */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm card-box flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">Puntos Registrados</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {totalPoints}
            <span className="text-xs font-normal text-slate-500 ml-1">pts</span>
          </div>
        </div>
      </div>

      {/* 2. Total Individuals */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm card-box flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">Total Individuos (N)</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {totalAbundance}
            <span className="text-xs font-normal text-slate-500 ml-1">ind.</span>
          </div>
        </div>
      </div>

      {/* 3. Species Richness */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm card-box flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
          <Dna className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">Riqueza Específica</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {uniqueSpecies}
            <span className="text-xs font-normal text-slate-500 ml-1">spp.</span>
          </div>
        </div>
      </div>

      {/* 4. Avian Nests */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm card-box flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
          <Egg className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">Nidos Monitoreados</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-amber-700 tabular-nums">
            {totalNests}
            <span className="text-xs font-normal text-slate-500 ml-1">nidos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
