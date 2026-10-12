import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Map, Layers, Filter, Compass } from 'lucide-react';
import { SamplingRecord, CategoryType, CoordinateFormat } from '../types/sampling';
import { CATEGORY_COLORS } from '../data/taxonomy';
import { calculateConvexHull, latLngToUTM } from '../utils/geoUtils';

interface MapDistributionProps {
  records: SamplingRecord[];
  activeCategoryTab: string;
  onMapClick: (lat: number, lng: number) => void;
  selectedLocation: { lat: number; lng: number } | null;
  onEditRecord: (id: number) => void;
  coordFormat?: CoordinateFormat;
}

export const MapDistribution: React.FC<MapDistributionProps> = ({
  records,
  activeCategoryTab,
  onMapClick,
  selectedLocation,
  onEditRecord,
  coordFormat = 'decimal'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polygonGroupRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.CircleMarker | null>(null);

  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('ALL');
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Filter records based on active taxonomic tab
  const tabFilteredRecords =
    activeCategoryTab === 'ALL'
      ? records
      : records.filter((r) => r.category === activeCategoryTab);

  // Unique species list within current tab
  const uniqueSpecies = Array.from(
    new Set(tabFilteredRecords.map((r) => r.scientificName))
  ).filter(Boolean);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = -20.948;
    const initialLng = -69.812;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 11,
      zoomControl: true
    });

    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri World Imagery, Maxar, Earthstar Geographics'
      }
    );

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });

    satellite.addTo(map);

    L.control
      .layers(
        {
          'Satelital HD (Esri)': satellite,
          'Callejero Topo (OSM)': osm
        },
        {},
        { position: 'topright' }
      )
      .addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const polygonGroup = L.layerGroup().addTo(map);

    markersGroupRef.current = markersGroup;
    polygonGroupRef.current = polygonGroup;
    mapInstanceRef.current = map;

    // Map click listener for field coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      onMapClick(lat, lng);
    });

    // Track cursor coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setHoverCoords({
        lat: parseFloat(e.latlng.lat.toFixed(6)),
        lng: parseFloat(e.latlng.lng.toFixed(6))
      });
    });

    map.on('mouseout', () => {
      setHoverCoords(null);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onMapClick]);

  // Update Click Marker when selectedLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (clickMarkerRef.current) {
      map.removeLayer(clickMarkerRef.current);
      clickMarkerRef.current = null;
    }

    if (selectedLocation) {
      const utm = latLngToUTM(selectedLocation.lat, selectedLocation.lng);
      const popupHtml =
        coordFormat === 'decimal'
          ? `<div style="font-size: 11px; line-height: 1.4; color: #1e293b; min-width: 160px;">
              <strong style="color: #065f46;">Ubicación Seleccionada</strong><br>
              <strong>Lat:</strong> ${selectedLocation.lat.toFixed(6)}°<br>
              <strong>Lng:</strong> ${selectedLocation.lng.toFixed(6)}°<br>
              <span style="color: #64748b; font-size: 10px;">${utm.formatted}</span>
            </div>`
          : `<div style="font-size: 11px; line-height: 1.4; color: #1e293b; min-width: 160px;">
              <strong style="color: #065f46;">Ubicación Seleccionada</strong><br>
              <strong style="color: #047857;">UTM (19S):</strong><br/>
              <span style="font-family: monospace; font-weight: 600;">E: ${utm.easting} | N: ${utm.northing}</span><br>
              <span style="color: #64748b; font-size: 10px;">Decimal: ${selectedLocation.lat.toFixed(6)}°, ${selectedLocation.lng.toFixed(6)}°</span>
            </div>`;

      const marker = L.circleMarker([selectedLocation.lat, selectedLocation.lng], {
        radius: 8,
        fillColor: '#ef4444',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95
      })
        .addTo(map)
        .bindPopup(popupHtml);

      clickMarkerRef.current = marker;
      map.setView([selectedLocation.lat, selectedLocation.lng], Math.max(map.getZoom(), 12));
    }
  }, [selectedLocation, coordFormat]);

  // Render sampling markers and distribution polygon
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const polygonGroup = polygonGroupRef.current;

    if (!map || !markersGroup || !polygonGroup) return;

    markersGroup.clearLayers();
    polygonGroup.clearLayers();

    // Determine records to show based on species filter
    const displayRecords =
      selectedSpeciesFilter === 'ALL'
        ? tabFilteredRecords
        : tabFilteredRecords.filter((r) => r.scientificName === selectedSpeciesFilter);

    displayRecords.forEach((rec) => {
      const color = CATEGORY_COLORS[rec.category] || '#64748b';
      const marker = L.circleMarker([rec.lat, rec.lng], {
        radius: selectedSpeciesFilter !== 'ALL' ? 8 : 6,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.9
      });

      // Nest block if available
      let nestHTML = '';
      if (rec.category === 'Aves' && rec.nestInfo && rec.nestInfo.status !== 'Sin Nido / No aplica') {
        nestHTML = `
          <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 4px; border-radius: 4px; margin-top: 4px; font-size: 10px; color: #92400e;">
            <strong>Nido:</strong> ${rec.nestInfo.status} (${rec.nestInfo.content})<br/>
            Huevos: ${rec.nestInfo.eggsCount} | Crías: ${rec.nestInfo.chicksAlive}
          </div>
        `;
      }

      // Photos preview
      let photoHTML = '';
      if (rec.photos && rec.photos.length > 0) {
        photoHTML = `
          <div style="margin-top: 4px; display: flex; gap: 4px;">
            <img src="${rec.photos[0]}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1;" />
            ${rec.photos.length > 1 ? `<span style="font-size: 10px; align-self: center; color: #64748b;">+${rec.photos.length - 1} fotos</span>` : ''}
          </div>
        `;
      }

      const coordHTML =
        coordFormat === 'decimal'
          ? `
            <div style="margin-top: 3px; color: #065f46; font-size: 10.5px; font-weight: 700;">
              Lat: ${rec.lat.toFixed(5)}° · Lng: ${rec.lng.toFixed(5)}°
            </div>
            <div style="color: #64748b; font-size: 9.5px; font-family: monospace;">
              ${rec.utmFormatted || '-'}
            </div>
          `
          : `
            <div style="margin-top: 3px; color: #065f46; font-size: 10.5px; font-weight: 700; font-family: monospace;">
              ${rec.utmFormatted || `Zona ${rec.utmZone} | E:${rec.utmEasting} | N:${rec.utmNorthing}`}
            </div>
            <div style="color: #64748b; font-size: 9.5px;">
              Lat: ${rec.lat.toFixed(5)}°, Lng: ${rec.lng.toFixed(5)}°
            </div>
          `;

      const popupContent = `
        <div style="font-family: inherit; font-size: 11px; line-height: 1.4; color: #1e293b; min-width: 170px;">
          <div style="font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px;">
            ${rec.pointCode} <span style="font-weight: 400; color: #64748b; font-size: 10px;">(${rec.pointType}${rec.fixedPointNum ? ': ' + rec.fixedPointNum : ''})</span>
          </div>
          <div style="margin-top: 3px; font-weight: 600; color: #065f46;">${rec.commonName}</div>
          <div style="font-style: italic; color: #475569; font-size: 10px;">${rec.scientificName}</div>
          ${coordHTML}
          <div style="color: #334155; font-size: 10px; margin-top: 2px;">
            <strong>Demografía:</strong> ${rec.sex} · ${rec.stage}
          </div>
          <div style="color: #334155; font-size: 10px;">
            <strong>Abundancia:</strong> ${rec.abundance} ind. (${rec.campaign})
          </div>
          ${rec.observer ? `<div style="color: #334155; font-size: 10px;"><strong>Observador:</strong> ${rec.observer}</div>` : ''}
          ${nestHTML}
          ${photoHTML}
          <div style="margin-top: 6px; text-align: right;">
            <button id="btn-edit-${rec.id}" style="background: #0284c7; color: white; border: none; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 600; cursor: pointer;">
              Editar
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-edit-${rec.id}`);
        if (btn) {
          btn.onclick = () => onEditRecord(rec.id);
        }
      });

      markersGroup.addLayer(marker);
    });

    // Draw convex hull distribution polygon if single species is selected and has >= 3 points
    if (selectedSpeciesFilter !== 'ALL' && displayRecords.length >= 3) {
      const coords = displayRecords.map((r) => [r.lat, r.lng] as [number, number]);
      const hull = calculateConvexHull(coords);
      const polygon = L.polygon(hull, {
        color: '#ef4444',
        weight: 2,
        dashArray: '5, 5',
        fillColor: '#f87171',
        fillOpacity: 0.25
      });
      polygon.bindTooltip(`Área de Distribución: ${selectedSpeciesFilter}`, {
        permanent: false
      });
      polygonGroup.addLayer(polygon);
      map.fitBounds(polygon.getBounds().pad(0.2));
    } else if (selectedSpeciesFilter !== 'ALL' && displayRecords.length > 0) {
      const bounds = L.latLngBounds(displayRecords.map((r) => [r.lat, r.lng]));
      map.fitBounds(bounds.pad(0.3));
    }
  }, [tabFilteredRecords, selectedSpeciesFilter, onEditRecord, coordFormat]);

  return (
    <div id="mapa" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm card-box space-y-3">
      {/* Map Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Mapa Georreferenciado de Muestreo</h2>
            <p className="text-[11px] text-slate-500">
              Coordenadas WGS84 UTM y distribución de especies en Salar Grande
            </p>
          </div>
        </div>

        {/* Filter Species and Format Tag on Map */}
        <div className="flex items-center gap-2 no-print">
          <span
            className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded font-bold border transition-colors ${
              coordFormat === 'decimal'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-sky-50 text-sky-800 border-sky-300'
            }`}
            title="Formato de coordenadas global configurado desde la cabecera"
          >
            <Compass className="w-3 h-3 text-emerald-600" />
            <span>{coordFormat === 'decimal' ? 'Visualizando Decimal (°)' : 'Visualizando UTM (19S)'}</span>
          </span>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg py-0.5 px-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSpeciesFilter}
              onChange={(e) => setSelectedSpeciesFilter(e.target.value)}
              className="text-xs bg-transparent border-0 font-medium text-slate-800 focus:ring-0 py-0.5 pr-2"
            >
              <option value="ALL">Todas las especies ({tabFilteredRecords.length} pts)</option>
              {uniqueSpecies.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaflet Map DOM Element */}
      <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 shadow-inner">
        <div
          ref={mapContainerRef}
          id="map"
          className="h-[440px] w-full z-0 cursor-crosshair"
          style={{ height: '440px' }}
        />

        {/* Real-time Coordinate HUD Bar (ArcGIS/GIS Desktop Style) */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-md text-[10.5px] font-mono border border-slate-700 shadow-md pointer-events-none max-w-[calc(100%-16px)] overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span className="text-slate-400 text-[10px] shrink-0">
            {hoverCoords ? 'Cursor:' : selectedLocation ? 'Punto fijado:' : 'Clic para capturar:'}
          </span>

          {hoverCoords ? (
            coordFormat === 'decimal' ? (
              <span className="font-bold text-emerald-300 tabular-nums truncate">
                Lat: {hoverCoords.lat.toFixed(5)}° · Lng: {hoverCoords.lng.toFixed(5)}°
              </span>
            ) : (
              (() => {
                const u = latLngToUTM(hoverCoords.lat, hoverCoords.lng);
                return (
                  <span className="font-bold text-emerald-300 tabular-nums truncate">
                    Zona {u.zone} · E: {u.easting} · N: {u.northing}
                  </span>
                );
              })()
            )
          ) : selectedLocation ? (
            coordFormat === 'decimal' ? (
              <span className="font-bold text-amber-300 tabular-nums truncate">
                Lat: {selectedLocation.lat.toFixed(5)}° · Lng: {selectedLocation.lng.toFixed(5)}°
              </span>
            ) : (
              (() => {
                const u = latLngToUTM(selectedLocation.lat, selectedLocation.lng);
                return (
                  <span className="font-bold text-amber-300 tabular-nums truncate">
                    Zona {u.zone} · E: {u.easting} · N: {u.northing}
                  </span>
                );
              })()
            )
          ) : (
            <span className="text-slate-300 text-[10px] truncate">
              {coordFormat === 'decimal' ? 'Modo Grados Decimales WGS84' : 'Modo WGS84 UTM Huso 19S'}
            </span>
          )}
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <span className="font-semibold text-slate-700 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          Simbología de Campo:
        </span>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
            <span>Aves</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
            <span>Mamíferos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            <span>Reptiles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Flora</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 border border-dashed border-red-500 bg-red-100 inline-block" />
            <span>Polígono Distribución</span>
          </div>
        </div>
      </div>
    </div>
  );
};
