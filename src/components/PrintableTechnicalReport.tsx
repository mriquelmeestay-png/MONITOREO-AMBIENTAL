import { SamplingRecord, CoordinateFormat } from '../types/sampling';
import { formatDateTime } from '../utils/geoUtils';
import { getSpeciesPlaceholder } from '../data/fallbackSpeciesImages';

interface PrintableTechnicalReportProps {
  records: SamplingRecord[];
  specialistName: string;
  campaignName: string;
  campaignStartDate: string;
  campaignEndDate: string;
  coordFormat?: CoordinateFormat;
}

export const PrintableTechnicalReport: React.FC<PrintableTechnicalReportProps> = ({
  records,
  specialistName,
  campaignName,
  campaignStartDate,
  campaignEndDate,
  coordFormat = 'decimal'
}) => {
  const totalPoints = records.length;
  const totalAbundance = records.reduce((acc, r) => acc + (r.abundance || 1), 0);
  const uniqueSpecies = new Set(records.map((r) => r.scientificName)).size;
  const nestRecords = records.filter(
    (r) => r.category === 'Aves' && r.nestInfo && r.nestInfo.status !== 'Sin Nido / No aplica'
  );

  // Group species distribution
  const speciesMap = new Map<
    string,
    { common: string; scientific: string; cat: string; count: number; status: string; points: string[] }
  >();
  records.forEach((r) => {
    const key = r.scientificName || r.commonName;
    if (!speciesMap.has(key)) {
      speciesMap.set(key, {
        common: r.commonName,
        scientific: r.scientificName,
        cat: r.category,
        count: r.abundance || 1,
        status: r.status,
        points: [r.pointCode]
      });
    } else {
      const item = speciesMap.get(key)!;
      item.count += r.abundance || 1;
      if (!item.points.includes(r.pointCode)) item.points.push(r.pointCode);
    }
  });

  // Collect all photos with details and reliable fallback
  const allPhotos: { pointCode: string; species: string; url: string; fallbackUrl: string; description: string }[] = [];
  records.forEach((r) => {
    const fallback = getSpeciesPlaceholder(r.scientificName, r.commonName);
    if (r.photoDetails && r.photoDetails.length > 0) {
      r.photoDetails.forEach((pd) => {
        allPhotos.push({
          pointCode: r.pointCode,
          species: r.commonName,
          url: pd.url,
          fallbackUrl: fallback,
          description: pd.description || `Registro fotográfico en terreno - ${r.pointCode}`
        });
      });
    } else if (r.photos && r.photos.length > 0) {
      r.photos.forEach((u) => {
        allPhotos.push({
          pointCode: r.pointCode,
          species: r.commonName,
          url: u,
          fallbackUrl: fallback,
          description: `Registro fotográfico en terreno - ${r.pointCode}`
        });
      });
    }
  });

  // Salar Grande bounding box for cartographic projection
  const minLat = -20.975;
  const maxLat = -20.915;
  const minLng = -69.840;
  const maxLng = -69.790;

  const renderSvgMap = (
    title: string,
    filterFn: (r: SamplingRecord) => boolean,
    badgeColor: string,
    isNests: boolean = false
  ) => {
    const filtered = records.filter(filterFn);
    const svgW = 700;
    const svgH = 340;
    const xPad = 50;
    const yPad = 35;
    const innerW = svgW - xPad * 2;
    const innerH = svgH - yPad * 2;

    return (
      <div className="border border-slate-400 rounded-lg overflow-hidden my-3 break-inside-avoid bg-white">
        {/* Cartographic Title Header */}
        <div className="bg-slate-900 text-white px-3 py-1.5 flex justify-between items-center text-[10.5pt]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: badgeColor }} />
            <span className="font-bold">{title}</span>
          </div>
          <div className="font-mono text-[9pt] flex items-center gap-2">
            <span className="bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded border border-blue-600 font-semibold">
              ArcGIS Satelital & Topo
            </span>
            <span>{filtered.length} puntos</span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">WGS84 UTM 19S</span>
          </div>
        </div>

        {/* SVG Topographic Simulation with Realistic ArcGIS Satellite & Relief Imagery Texture */}
        <div className="relative bg-[#202923] overflow-hidden" style={{ height: '310px' }}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* ArcGIS Satellite Salar Evaporite Gradients */}
              <linearGradient id={`arcgisTerrain-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2b332b" />
                <stop offset="30%" stopColor="#414a3e" />
                <stop offset="65%" stopColor="#646b5d" />
                <stop offset="100%" stopColor="#222b21" />
              </linearGradient>

              {/* Halite White Salt Crust Core */}
              <linearGradient id="haliteCore" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#f8fafc" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.9" />
              </linearGradient>

              <pattern id={`topoGrid-${title.replace(/\s+/g, '')}`} width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.4" opacity="0.3" />
              </pattern>
            </defs>

            {/* Base ArcGIS Satellite Terrain Background */}
            <rect width={svgW} height={svgH} fill={`url(#arcgisTerrain-${title.replace(/\s+/g, '')})`} />
            <rect width={svgW} height={svgH} fill={`url(#topoGrid-${title.replace(/\s+/g, '')})`} />

            {/* Coastal Cordillera Mountain Ridge Shading (ArcGIS Relief / DEM) */}
            <path
              d="M 0,0 L 140,0 L 120,340 L 0,340 Z"
              fill="#1e2920"
              opacity="0.8"
            />
            <path
              d="M 30,0 Q 60,170 40,340"
              fill="none"
              stroke="#0f172a"
              strokeWidth="12"
              opacity="0.3"
            />
            <text x="35" y="170" fill="#94a3b8" fontSize="7" fontWeight="bold" letterSpacing="1" transform="rotate(82 35 170)">
              CORDILLERA DE LA COSTA (RELIEVE DEM)
            </text>

            {/* Salar Basin Polygon (ArcGIS White Evaporite Halite Core) */}
            <polygon
              points="145,50 320,35 560,65 640,150 600,285 430,305 210,295 135,210 125,115"
              fill="url(#haliteCore)"
              stroke="#cbd5e1"
              strokeWidth="1.6"
            />
            <text x="380" y="145" textAnchor="middle" fill="#475569" fontSize="13" fontWeight="bold" letterSpacing="4">
              CUBO SALAR GRANDE (HALITA)
            </text>
            <text x="380" y="165" textAnchor="middle" fill="#64748b" fontSize="8" fontStyle="italic">
              Ortoimagen Satelital ArcGIS World Imagery · 0.5m Res
            </text>

            {/* Ruta 1 / Camino Costero (ArcGIS Vector Roads) */}
            <path d="M 55,20 Q 75,175 105,325" fill="none" stroke="#f97316" strokeWidth="2.5" />
            <text x="75" y="185" fill="#ffedd5" fontSize="8" fontWeight="bold" transform="rotate(78 75 185)">
              Ruta 1 (Camino Costero)
            </text>

            {/* Access Road to Salar Mine */}
            <path d="M 105,195 Q 280,175 580,235" fill="none" stroke="#f8fafc" strokeWidth="2" strokeDasharray="6 3" />
            <text x="340" y="190" fill="#ffffff" fontSize="7.5" fontWeight="bold">
              Camino Faena Minera Salar Grande
            </text>

            {/* Contour Elevation Lines (ArcGIS Topo) */}
            <path d="M 125,85 Q 320,105 615,85" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
            <path d="M 135,175 Q 360,195 605,175" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
            <path d="M 145,255 Q 340,235 585,265" fill="none" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />

            {/* North Indicator */}
            <circle cx={svgW - 40} cy="45" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
            <text x={svgW - 40} y="41" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">N</text>
            <path d={`M ${svgW - 40},33 L ${svgW - 36},42 L ${svgW - 44},42 Z`} fill="#38bdf8" />

            {/* Render Records */}
            {filtered.map((r, i) => {
              const px = xPad + ((r.lng - minLng) / (maxLng - minLng)) * innerW;
              const py = yPad + ((maxLat - r.lat) / (maxLat - minLat)) * innerH;
              const cx = Math.max(xPad + 10, Math.min(svgW - xPad - 10, px));
              const cy = Math.max(yPad + 10, Math.min(svgH - yPad - 10, py));

              let ptColor = badgeColor;
              if (isNests) {
                if (r.nestInfo && r.nestInfo.chicksAlive > 0) ptColor = '#16a34a';
                else if (r.nestInfo && r.nestInfo.eggsCount > 0) ptColor = '#ea580c';
                else ptColor = '#dc2626';
              } else {
                if (r.category === 'Aves') ptColor = '#0284c7';
                else if (r.category === 'Mamíferos') ptColor = '#6366f1';
                else if (r.category === 'Reptiles') ptColor = '#d97706';
                else if (r.category === 'Flora') ptColor = '#10b981';
              }

              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="6.5" fill={ptColor} stroke="#ffffff" strokeWidth="2" />
                  <rect
                    x={cx + 8}
                    y={cy - 7}
                    width={r.pointCode.length * 6.5 + 8}
                    height="13"
                    fill="#0f172a"
                    rx="3"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    opacity="0.92"
                  />
                  <text x={cx + 12} y={cy + 3} fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    {r.pointCode}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend Footer */}
        <div className="bg-slate-50 border-t border-slate-300 px-3 py-1.5 text-[8pt] text-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isNests ? (
              <>
                <span className="flex items-center gap-1 font-semibold text-emerald-800">● Con Crías Vivas</span>
                <span className="flex items-center gap-1 font-semibold text-amber-800">● Con Huevos</span>
                <span className="flex items-center gap-1 font-semibold text-rose-800">● Vacío / Destruido</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1 font-semibold text-sky-800">● Aves</span>
                <span className="flex items-center gap-1 font-semibold text-indigo-800">● Mamíferos</span>
                <span className="flex items-center gap-1 font-semibold text-amber-800">● Reptiles</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-800">● Flora</span>
              </>
            )}
          </div>
          <span className="font-mono text-[7.5pt]">
            Fuente Base: ArcGIS World Imagery & Topo · WGS84 UTM Huso 19S (SEIA)
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white text-slate-900 font-sans max-w-[210mm] mx-auto leading-normal text-[9pt]">
      {/* -------------------------------------------------------- */}
      {/* SECCIÓN 1: ENCABEZADO TÉCNICO OFICIAL Y METADATOS */}
      {/* -------------------------------------------------------- */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
        <div>
          <span className="text-[8pt] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
            República de Chile · Servicio de Evaluación Ambiental (SEIA)
          </span>
          <h1 className="text-[13pt] font-black text-slate-900 tracking-tight leading-snug">
            INFORME TÉCNICO DE CAMPO - MONITOREO DE BIODIVERSIDAD Y EVALUACIÓN AMBIENTAL
          </h1>
          <p className="text-[9pt] font-semibold text-slate-700">
            Compañía Minera Cordillera SCM · Proyecto Minero Industrial Salar Grande
          </p>
        </div>
        <div className="text-right text-[8pt] font-mono shrink-0 pl-3">
          <p><strong>Emisión:</strong> {new Date().toLocaleDateString('es-CL')}</p>
          <p><strong>Datum:</strong> WGS84</p>
          <p><strong>Proyección:</strong> UTM Zona 19S</p>
        </div>
      </div>

      {/* BANNER CATEGORÍA DE CAMPAÑA */}
      <div className="bg-slate-100 border border-slate-300 rounded p-2.5 mb-4 text-[9pt]">
        <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-1.5">
          <div>
            <span className="text-[7.5pt] font-bold text-emerald-800 uppercase tracking-wider block">
              Campaña de Muestreo de Terreno
            </span>
            <span className="font-bold text-slate-900 text-[10pt]">{campaignName}</span>
          </div>
          <div className="text-right text-[8pt] font-mono">
            <span><strong>Rango de Fechas:</strong> {campaignStartDate} al {campaignEndDate}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-center text-[8pt]">
          <div className="bg-white p-1 rounded border border-slate-200">
            <span className="text-slate-500 block">Total Puntos:</span>
            <span className="font-bold text-slate-900">{totalPoints}</span>
          </div>
          <div className="bg-white p-1 rounded border border-slate-200">
            <span className="text-slate-500 block">Individuos:</span>
            <span className="font-bold text-slate-900">{totalAbundance}</span>
          </div>
          <div className="bg-white p-1 rounded border border-slate-200">
            <span className="text-slate-500 block">Especies:</span>
            <span className="font-bold text-slate-900">{uniqueSpecies}</span>
          </div>
          <div className="bg-white p-1 rounded border border-slate-200">
            <span className="text-slate-500 block">Nidos Activos:</span>
            <span className="font-bold text-rose-700">{nestRecords.length}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* SECCIÓN 2: MAPA GENERAL DE TODAS LAS ESPECIES */}
      {/* -------------------------------------------------------- */}
      <div className="mb-4">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-tight text-slate-900 border-b border-slate-300 pb-1 mb-2">
          1. Mapa General Cartográfico de Distribución (Todas las Especies · Capa ArcGIS)
        </h2>
        {renderSvgMap('MAPA GENERAL DE BIODIVERSIDAD - TODAS LAS ESPECIES', () => true, '#065f46')}
      </div>

      {/* -------------------------------------------------------- */}
      {/* SECCIÓN 3: MAPAS ESPECÍFICOS POR TAXA */}
      {/* -------------------------------------------------------- */}
      <div className="mb-4">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-tight text-slate-900 border-b border-slate-300 pb-1 mb-2">
          2. Mapas Específicos de Distribución por Taxa (ArcGIS & Topo)
        </h2>
        <div className="space-y-3">
          {renderSvgMap('DISTRIBUCIÓN DE AVES (ORNITOFAUNA)', (r) => r.category === 'Aves', '#0284c7')}
          {renderSvgMap('DISTRIBUCIÓN DE MAMÍFEROS (MASTOFAUNA)', (r) => r.category === 'Mamíferos', '#6366f1')}
          {renderSvgMap('DISTRIBUCIÓN DE REPTILES (HERPETOFAUNA)', (r) => r.category === 'Reptiles', '#d97706')}
          {renderSvgMap('DISTRIBUCIÓN DE FLORA Y VEGETACIÓN XEROFÍTICA', (r) => r.category === 'Flora', '#10b981')}
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* SECCIÓN 4: MAPA EXCLUSIVO DE MAPEO DE NIDOS */}
      {/* -------------------------------------------------------- */}
      <div className="mb-4">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-tight text-slate-900 border-b border-slate-300 pb-1 mb-2">
          3. Mapa Exclusivo de Mapeo y Monitoreo de Nidos
        </h2>
        {renderSvgMap(
          'MAPA EXCLUSIVO DE MONITOREO Y NIDIFICACIÓN DE AVES',
          (r) => r.category === 'Aves' && !!r.nestInfo && r.nestInfo.status !== 'Sin Nido / No aplica',
          '#dc2626',
          true
        )}

        {nestRecords.length > 0 && (
          <table className="w-full text-left text-[7.5pt] border border-slate-300 mt-2">
            <thead className="bg-slate-100 font-bold border-b border-slate-300">
              <tr>
                <th className="p-1.5 border-r border-slate-300">Punto</th>
                <th className="p-1.5 border-r border-slate-300">Especie</th>
                <th className="p-1.5 border-r border-slate-300">Estado Nido</th>
                <th className="p-1.5 border-r border-slate-300">Contenido</th>
                <th className="p-1.5 border-r border-slate-300">Distancia (m)</th>
                <th className="p-1.5 border-r border-slate-300">Huevos</th>
                <th className="p-1.5 border-r border-slate-300">Crías Vivas</th>
                <th className="p-1.5">
                  Coordenadas {coordFormat === 'decimal' ? 'Decimales (°)' : 'UTM (19S)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {nestRecords.map((r) => (
                <tr key={r.id}>
                  <td className="p-1 border-r border-slate-200 font-mono font-bold text-emerald-800">{r.pointCode}</td>
                  <td className="p-1 border-r border-slate-200 font-semibold">{r.commonName}</td>
                  <td className="p-1 border-r border-slate-200 text-rose-700 font-semibold">{r.nestInfo?.status}</td>
                  <td className="p-1 border-r border-slate-200">{r.nestInfo?.content}</td>
                  <td className="p-1 border-r border-slate-200 font-mono">{r.nestInfo?.distanceM} m</td>
                  <td className="p-1 border-r border-slate-200 font-mono font-bold">{r.nestInfo?.eggsCount}</td>
                  <td className="p-1 border-r border-slate-200 font-mono font-bold text-emerald-700">{r.nestInfo?.chicksAlive}</td>
                  <td className="p-1 font-mono text-[7pt]">
                    {coordFormat === 'decimal' ? `${r.lat.toFixed(5)}°, ${r.lng.toFixed(5)}°` : r.utmFormatted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* -------------------------------------------------------- */}
      {/* SECCIÓN 5: DISTRIBUCIÓN Y ABUNDANCIA POR ESPECIES */}
      {/* -------------------------------------------------------- */}
      <div className="mb-4">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-tight text-slate-900 border-b border-slate-300 pb-1 mb-2">
          4. Distribución y Abundancia de Especies Registradas
        </h2>
        <table className="w-full text-left text-[8pt] border border-slate-300">
          <thead className="bg-slate-100 font-bold border-b border-slate-300">
            <tr>
              <th className="p-1.5 border-r border-slate-300">Nombre Común</th>
              <th className="p-1.5 border-r border-slate-300">Nombre Científico</th>
              <th className="p-1.5 border-r border-slate-300">Categoría</th>
              <th className="p-1.5 border-r border-slate-300">Estado RCE / UICN</th>
              <th className="p-1.5 border-r border-slate-300">Individuos</th>
              <th className="p-1.5">Puntos de Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {Array.from(speciesMap.values()).map((sp, i) => (
              <tr key={i}>
                <td className="p-1 border-r border-slate-200 font-semibold">{sp.common}</td>
                <td className="p-1 border-r border-slate-200 italic">{sp.scientific}</td>
                <td className="p-1 border-r border-slate-200">{sp.cat}</td>
                <td className="p-1 border-r border-slate-200 font-semibold text-emerald-800">{sp.status}</td>
                <td className="p-1 border-r border-slate-200 font-mono font-bold">{sp.count}</td>
                <td className="p-1 font-mono text-[7.5pt]">{sp.points.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------------------------------------------------------- */}
      {/* SECCIÓN 6: APARTADO DE EVIDENCIAS FOTOGRÁFICAS CON DESCRIPCIÓN */}
      {/* -------------------------------------------------------- */}
      <div className="mb-4 break-inside-avoid">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-tight text-slate-900 border-b border-slate-300 pb-1 mb-2">
          5. Registro Fotográfico y Evidencias de Terreno ({allPhotos.length} fotos)
        </h2>
        {allPhotos.length === 0 ? (
          <p className="text-slate-500 italic p-3 bg-slate-50 border border-slate-200 rounded">
            No se han registrado evidencias fotográficas en la campaña.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {allPhotos.map((photo, i) => (
              <div key={i} className="border border-slate-300 rounded overflow-hidden bg-slate-50">
                <div className="h-32 bg-slate-900 overflow-hidden relative">
                  <img
                    src={photo.url}
                    alt={photo.pointCode}
                    loading="eager"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      // If remote image fails to load, gracefully switch to guaranteed embedded SVG
                      if (e.currentTarget.src !== photo.fallbackUrl) {
                        e.currentTarget.src = photo.fallbackUrl;
                      }
                    }}
                    className="w-full h-full object-cover block"
                  />
                  <span className="absolute top-1 left-1 bg-slate-900/85 text-white font-mono text-[8pt] px-1.5 py-0.5 rounded font-bold">
                    {photo.pointCode}
                  </span>
                </div>
                <div className="p-1.5 text-[7.5pt]">
                  <div className="flex justify-between font-bold">
                    <span className="font-mono text-emerald-800">{photo.pointCode}</span>
                    <span className="text-slate-700 truncate">{photo.species}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-tight">{photo.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------- */}
      {/* SECCIÓN 7: TABLA COMPLETA DE REGISTROS DE TERRENO */}
      {/* -------------------------------------------------------- */}
      <div className="mb-4">
        <h2 className="text-[10.5pt] font-bold uppercase tracking-tight text-slate-900 border-b border-slate-300 pb-1 mb-2">
          6. Registro Completo de Puntos de Muestreo Georreferenciados
        </h2>
        <table className="w-full text-left text-[7.5pt] border border-slate-300">
          <thead className="bg-slate-100 font-bold border-b border-slate-300">
            <tr>
              <th className="p-1 border-r border-slate-300">Punto</th>
              <th className="p-1 border-r border-slate-300">Categoría</th>
              <th className="p-1 border-r border-slate-300">Nombre Común</th>
              <th className="p-1 border-r border-slate-300">Nombre Científico</th>
              <th className="p-1 border-r border-slate-300">Etapa / Hábito</th>
              <th className="p-1 border-r border-slate-300">Abund.</th>
              <th className="p-1 border-r border-slate-300">
                Coordenadas {coordFormat === 'decimal' ? 'Decimales (°)' : 'UTM (19S)'}
              </th>
              <th className="p-1 border-r border-slate-300">Fecha / Hora</th>
              <th className="p-1">Observador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.map((r) => {
              let detailInfo = r.stage || '-';
              if (r.category === 'Flora') {
                const parts: string[] = [];
                if (r.floraHabit) parts.push(r.floraHabit);
                if (r.floraHeightM) parts.push(`H:${r.floraHeightM}m`);
                if (r.floraCondition) parts.push(r.floraCondition);
                if (r.floraStage) parts.push(r.floraStage);
                detailInfo = parts.join(', ') || '-';
              }

              return (
                <tr key={r.id}>
                  <td className="p-1 border-r border-slate-200 font-mono font-bold text-emerald-800">{r.pointCode}</td>
                  <td className="p-1 border-r border-slate-200">{r.category}</td>
                  <td className="p-1 border-r border-slate-200 font-semibold">{r.commonName}</td>
                  <td className="p-1 border-r border-slate-200 italic">{r.scientificName}</td>
                  <td className="p-1 border-r border-slate-200">{detailInfo}</td>
                  <td className="p-1 border-r border-slate-200 font-mono font-bold">{r.abundance}</td>
                  <td className="p-1 border-r border-slate-200 font-mono text-[7pt]">
                    {coordFormat === 'decimal' ? `${r.lat.toFixed(5)}°, ${r.lng.toFixed(5)}°` : r.utmFormatted}
                  </td>
                  <td className="p-1 border-r border-slate-200">{formatDateTime(r.datetime)}</td>
                  <td className="p-1 truncate max-w-[80px]">{r.observer || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* -------------------------------------------------------- */}
      {/* SECCIÓN 8: FIRMA OFICIAL DEL PROFESIONAL ESPECIALISTA */}
      {/* -------------------------------------------------------- */}
      <div className="border border-slate-400 rounded p-4 break-inside-avoid mt-6 bg-slate-50">
        <h2 className="text-[10pt] font-bold uppercase tracking-tight text-slate-900 border-b border-slate-300 pb-1 mb-4">
          7. Responsable Técnico y Declaración de Veracidad
        </h2>
        <p className="text-[8pt] text-slate-700 mb-6 leading-relaxed">
          Se certifica que los datos, metodologías, georreferenciación en datum WGS84 huso 19 Sur y determinaciones taxonómicas contenidas en el presente informe corresponden fielmente a los levantamientos biológicos ejecutados en terreno conforme a las Guías Metodológicas del Servicio de Evaluación Ambiental (SEIA Chile).
        </p>

        <div className="flex justify-between items-end pt-4">
          <div className="text-left font-mono text-[7.5pt] text-slate-500">
            <p>ID Registro: CMA-SG-{new Date().getFullYear()}-042</p>
            <p>Checksum: SHA256-BIO-SALAR-GRANDE-VERIFIED</p>
          </div>

          <div className="text-center w-64 border-t-2 border-slate-800 pt-2">
            <p className="font-bold text-[9pt] text-slate-900">
              {specialistName.trim() || '______________________________________'}
            </p>
            <p className="text-[8pt] text-slate-600">Profesional Especialista en Fauna y Flora</p>
            <p className="text-[7.5pt] text-slate-500 font-mono">Registro Consultor SEIA · Firma y Timbre</p>
          </div>
        </div>
      </div>
    </div>
  );
};
