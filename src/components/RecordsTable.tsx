import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileCode,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { SamplingRecord, CategoryType, CoordinateFormat } from '../types/sampling';
import { CATEGORY_COLORS } from '../data/taxonomy';
import { formatDateTime } from '../utils/geoUtils';

interface RecordsTableProps {
  records: SamplingRecord[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEditRecord: (id: number) => void;
  onDeleteRecord: (id: number) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onViewPhoto: (photoSrc: string, title: string) => void;
  isCampaignLocked?: boolean;
  coordFormat?: CoordinateFormat;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  activeTab,
  onTabChange,
  onEditRecord,
  onDeleteRecord,
  onExportCSV,
  onExportJSON,
  onViewPhoto,
  isCampaignLocked = false,
  coordFormat = 'decimal'
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [recordToDelete, setRecordToDelete] = useState<{ id: number; pointCode: string; name: string } | null>(null);

  // Tab definitions
  const tabs: { key: string; label: string; icon?: string }[] = [
    { key: 'ALL', label: 'Todos los Muestreos' },
    { key: 'Aves', label: 'Aves' },
    { key: 'Mamíferos', label: 'Mamíferos' },
    { key: 'Reptiles', label: 'Reptiles' },
    { key: 'Flora', label: 'Flora & Veg.' }
  ];

  // Tab count helper
  const getTabCount = (tabKey: string) => {
    if (tabKey === 'ALL') return records.length;
    return records.filter((r) => r.category === tabKey).length;
  };

  // Filter records by tab
  const tabFiltered =
    activeTab === 'ALL' ? records : records.filter((r) => r.category === activeTab);

  // Filter records by search query
  const searchFiltered = tabFiltered.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.pointCode.toLowerCase().includes(q) ||
      (r.pointType && r.pointType.toLowerCase().includes(q)) ||
      (r.fixedPointNum && r.fixedPointNum.toLowerCase().includes(q)) ||
      r.commonName.toLowerCase().includes(q) ||
      r.scientificName.toLowerCase().includes(q) ||
      (r.order && r.order.toLowerCase().includes(q)) ||
      (r.family && r.family.toLowerCase().includes(q)) ||
      r.utmFormatted.toLowerCase().includes(q) ||
      r.method.toLowerCase().includes(q) ||
      r.campaign.toLowerCase().includes(q) ||
      (r.observer && r.observer.toLowerCase().includes(q))
    );
  });

  return (
    <div id="registros" className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm card-box space-y-4">
      {/* Header & Export CTAs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Registros Obtenidos en Terreno</span>
          </h2>
          <p className="text-xs text-slate-500">
            Listado georreferenciado con coordenadas WGS84 UTM, taxonomía, demografía y registros fotográficos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print w-full sm:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar punto, especie, UTM..."
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm whitespace-nowrap active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onExportJSON}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-2.5 py-1.5 rounded-lg transition-colors border border-slate-300 whitespace-nowrap active:scale-95"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-600" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Taxonomic Segmented Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 no-print pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = getTabCount(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'border-b-2 border-emerald-600 text-emerald-800 bg-slate-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead className="bg-slate-100 uppercase text-[10px] text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-2.5">Punto / Tipo</th>
              <th className="p-2.5">Categoría</th>
              <th className="p-2.5">Nombre Común / Científico</th>
              <th className="p-2.5">Orden / Familia</th>
              <th className="p-2.5">Demografía</th>
              <th className="p-2.5">
                <div className="flex items-center gap-1">
                  <span>Coordenadas</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-tight uppercase ${
                      coordFormat === 'decimal'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-sky-100 text-sky-800 border border-sky-300'
                    }`}
                  >
                    {coordFormat === 'decimal' ? 'Decimal (°)' : 'UTM (19S)'}
                  </span>
                </div>
              </th>
              <th className="p-2.5">Fecha / Campaña</th>
              <th className="p-2.5">Observador</th>
              <th className="p-2.5">Nidos (Aves)</th>
              <th className="p-2.5">Fotos</th>
              <th className="p-2.5">Estado</th>
              <th className="p-2.5 text-center no-print">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {searchFiltered.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-8 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="font-semibold text-slate-600">No se encontraron registros de muestreo</p>
                    <p className="text-xs">
                      {searchTerm
                        ? 'Prueba modificando el término de búsqueda.'
                        : 'Utiliza el formulario de arriba o haz clic en "Generar Lote Exploratorio" para cargar puntos.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              searchFiltered.map((rec) => {
                const catColor = CATEGORY_COLORS[rec.category] || '#64748b';

                // Nest summary
                let nestContent = <span className="text-slate-400">N/A</span>;
                if (rec.category === 'Aves' && rec.nestInfo && rec.nestInfo.status !== 'Sin Nido / No aplica') {
                  nestContent = (
                    <div className="space-y-0.5 text-[10px] leading-tight">
                      <span className="font-semibold text-amber-800">{rec.nestInfo.status}</span>
                      <div className="text-slate-500">
                        {rec.nestInfo.eggsCount} huevos · {rec.nestInfo.chicksAlive} crías vivas
                      </div>
                      {rec.nestInfo.distanceM > 0 && (
                        <div className="text-slate-400 font-mono">Dist: {rec.nestInfo.distanceM}m</div>
                      )}
                    </div>
                  );
                }

                // Photos summary
                let photoContent = <span className="text-slate-400">0</span>;
                if (rec.photos && rec.photos.length > 0) {
                  photoContent = (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onViewPhoto(rec.photos[0], `${rec.pointCode}: ${rec.commonName}`)}
                        className="relative group w-8 h-8 rounded border border-slate-300 overflow-hidden cursor-pointer"
                        title="Ver fotografía en alta resolución"
                      >
                        <img
                          src={rec.photos[0]}
                          alt={rec.pointCode}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </button>
                      {rec.photos.length > 1 && (
                        <span className="text-[10px] font-mono font-bold text-slate-600">
                          +{rec.photos.length - 1}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    {/* Point Code & Type */}
                    <td className="p-2.5 font-mono">
                      <div className="font-bold text-emerald-800 text-xs">{rec.pointCode}</div>
                      <div className="text-[9px] text-slate-500 font-semibold">
                        {rec.pointType}
                        {rec.fixedPointNum ? ` (${rec.fixedPointNum})` : ''}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap"
                        style={{ backgroundColor: catColor }}
                      >
                        {rec.category}
                      </span>
                    </td>

                    {/* Common & Scientific Name */}
                    <td className="p-2.5">
                      <div className="font-bold text-slate-800">{rec.commonName}</div>
                      <div className="italic text-emerald-900 font-medium text-[10px]">
                        {rec.scientificName}
                      </div>
                    </td>

                    {/* Order & Family */}
                    <td className="p-2.5 text-slate-600">
                      <div className="font-semibold text-slate-700">{rec.order || '-'}</div>
                      <div className="text-[10px] text-slate-500">{rec.family || '-'}</div>
                    </td>

                    {/* Demography / Flora Biometrics */}
                    <td className="p-2.5 text-slate-700">
                      {rec.category === 'Flora' ? (
                        <div>
                          <div className="font-semibold text-emerald-900 text-xs">
                            {rec.floraHabit || 'Vegetación'}
                            {rec.floraCondition ? ` (${rec.floraCondition})` : ''}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {rec.floraStage || rec.stage || 'En desarrollo'}
                            {rec.floraHeightM ? ` · Alt: ${rec.floraHeightM}m` : ''}
                            {rec.floraCircumferenceM ? ` · Circ: ${rec.floraCircumferenceM}m` : ''}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div>{rec.sex || 'Indet.'}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{rec.stage}</div>
                        </div>
                      )}
                    </td>

                    {/* Coordinates Lat/Lng & UTM */}
                    <td className="p-2.5 font-mono text-[10px]">
                      {coordFormat === 'decimal' ? (
                        <>
                          <div className="font-bold text-emerald-900 tracking-tight">
                            Lat: {rec.lat.toFixed(5)}° · Lng: {rec.lng.toFixed(5)}°
                          </div>
                          <div className="text-[9.5px] text-slate-500 font-medium truncate max-w-[210px]" title={rec.utmFormatted}>
                            {rec.utmFormatted || '-'}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-emerald-900 tracking-tight">
                            {rec.utmFormatted || `Zona ${rec.utmZone} | E:${rec.utmEasting} | N:${rec.utmNorthing}`}
                          </div>
                          <div className="text-[9.5px] text-slate-500 font-medium">
                            Lat: {rec.lat.toFixed(5)}°, Lng: {rec.lng.toFixed(5)}°
                          </div>
                        </>
                      )}
                    </td>

                    {/* Date, Time & Campaign */}
                    <td className="p-2.5 text-slate-700">
                      <div className="font-medium text-[10px]">{formatDateTime(rec.datetime)}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{rec.campaign}</div>
                    </td>

                    {/* Observador */}
                    <td className="p-2.5 text-slate-700">
                      <div
                        className="font-semibold text-slate-800 text-[11px] truncate max-w-[120px]"
                        title={rec.observer || 'No asignado'}
                      >
                        {rec.observer?.trim() || <span className="text-slate-400 font-normal italic">-</span>}
                      </div>
                    </td>

                    {/* Nest Info */}
                    <td className="p-2.5">{nestContent}</td>

                    {/* Photos */}
                    <td className="p-2.5">{photoContent}</td>

                    {/* Status */}
                    <td className="p-2.5">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-slate-100 border border-slate-300 font-semibold text-slate-700 whitespace-nowrap">
                        {rec.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-2.5 text-center no-print whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditRecord(rec.id)}
                          title="Editar punto"
                          className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={isCampaignLocked}
                          onClick={() =>
                            setRecordToDelete({
                              id: rec.id,
                              pointCode: rec.pointCode,
                              name: rec.commonName
                            })
                          }
                          title={
                            isCampaignLocked
                              ? 'Campaña bloqueada: desbloquee para poder eliminar puntos'
                              : 'Eliminar punto'
                          }
                          className={`p-1.5 rounded transition-colors ${
                            isCampaignLocked
                              ? 'text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-50'
                              : 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer active:scale-95'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal for Individual Record Deletion */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-700">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">¿Eliminar punto de muestreo?</h4>
                <p className="text-[11px] font-mono text-emerald-800 font-bold">{recordToDelete.pointCode} - {recordToDelete.name}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              Este punto será eliminado permanentemente del conjunto de datos y de los informes técnicos.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRecord(recordToDelete.id);
                  setRecordToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
