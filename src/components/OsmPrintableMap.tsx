import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers } from 'lucide-react';
import { SamplingRecord } from '../types/sampling';

export type MapTileProvider = 'osm' | 'arcgis-satellite' | 'arcgis-topo' | 'arcgis-terrain';

interface OsmPrintableMapProps {
  records: SamplingRecord[];
  type: 'general' | 'aves' | 'mamiferos' | 'reptiles' | 'flora' | 'nidos';
  title?: string;
  height?: number;
  mapId: string;
  initialProvider?: MapTileProvider;
  enableLayerToggle?: boolean;
}

export const OsmPrintableMap: React.FC<OsmPrintableMapProps> = ({
  records,
  type,
  title,
  height = 360,
  mapId,
  initialProvider = 'arcgis-satellite',
  enableLayerToggle = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [activeProvider, setActiveProvider] = useState<MapTileProvider>(initialProvider);

  // Filter records based on taxon / type
  let filteredRecords: SamplingRecord[] = [];
  let mapTitle = title || 'Mapa Cartográfico';
  let badgeColor = '#065f46';

  if (type === 'general') {
    filteredRecords = records;
    mapTitle = title || 'Mapa General de Distribución - Todas las Especies';
    badgeColor = '#065f46';
  } else if (type === 'aves') {
    filteredRecords = records.filter((r) => r.category === 'Aves');
    mapTitle = title || 'Mapa Específico: Distribución de Aves (Ornitofauna)';
    badgeColor = '#0284c7';
  } else if (type === 'mamiferos') {
    filteredRecords = records.filter((r) => r.category === 'Mamíferos');
    mapTitle = title || 'Mapa Específico: Mastofauna (Mamíferos)';
    badgeColor = '#6366f1';
  } else if (type === 'reptiles') {
    filteredRecords = records.filter((r) => r.category === 'Reptiles');
    mapTitle = title || 'Mapa Específico: Herpetofauna (Reptiles)';
    badgeColor = '#d97706';
  } else if (type === 'flora') {
    filteredRecords = records.filter((r) => r.category === 'Flora');
    mapTitle = title || 'Mapa Específico: Flora y Vegetación Xerofítica';
    badgeColor = '#10b981';
  } else if (type === 'nidos') {
    filteredRecords = records.filter(
      (r) => r.category === 'Aves' && r.nestInfo && r.nestInfo.status !== 'Sin Nido / No aplica'
    );
    mapTitle = title || 'Mapa Exclusivo de Monitoreo y Mapeo de Nidos';
    badgeColor = '#dc2626';
  }

  // Provider layer definitions
  const getTileConfig = (provider: MapTileProvider) => {
    switch (provider) {
      case 'arcgis-satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Esri, Maxar, Earthstar Geographics · ArcGIS World Imagery',
          label: 'ArcGIS Satelital HD',
          maxZoom: 19
        };
      case 'arcgis-topo':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Esri, HERE, Garmin, Intermap · ArcGIS Topo',
          label: 'ArcGIS Topográfico',
          maxZoom: 19
        };
      case 'arcgis-terrain':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Esri, USGS, NOAA · ArcGIS Relieve Terreno',
          maxZoom: 13
        };
      case 'osm':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors · Topo Callejero',
          label: 'Callejero Topo (OSM)',
          maxZoom: 18
        };
    }
  };

  // Switch tile layer dynamically
  const switchProvider = (newProv: MapTileProvider) => {
    setActiveProvider(newProv);
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const cfg = getTileConfig(newProv);
    const newLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      crossOrigin: true
    });
    newLayer.addTo(mapRef.current);
    tileLayerRef.current = newLayer;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean previous instance if exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const defaultCenter: [number, number] = [-20.948, -69.812]; // Salar Grande
    const map = L.map(containerRef.current, {
      center: defaultCenter,
      zoom: 11,
      zoomControl: false,
      attributionControl: true
    });

    const cfg = getTileConfig(activeProvider);
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      crossOrigin: true
    });
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Add scale bar
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Marker colors mapping
    const getMarkerColor = (r: SamplingRecord): string => {
      if (type === 'nidos') {
        if (r.nestInfo && r.nestInfo.chicksAlive > 0) return '#16a34a'; // green
        if (r.nestInfo && r.nestInfo.eggsCount > 0) return '#ea580c'; // orange
        return '#dc2626'; // red
      }
      if (r.category === 'Aves') return '#0284c7';
      if (r.category === 'Mamíferos') return '#6366f1';
      if (r.category === 'Reptiles') return '#d97706';
      if (r.category === 'Flora') return '#10b981';
      return '#64748b';
    };

    const markersGroup = L.featureGroup();

    filteredRecords.forEach((r) => {
      if (!r.lat || !r.lng || isNaN(r.lat) || isNaN(r.lng)) return;
      const color = getMarkerColor(r);

      const marker = L.circleMarker([r.lat, r.lng], {
        radius: 7,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95
      });

      marker.bindPopup(
        `<div style="font-size:11px; font-family:sans-serif; line-height:1.3;">
          <strong style="color:#0f172a;">${r.pointCode} · ${r.commonName}</strong><br/>
          <span style="color:#475569; font-style:italic;">${r.scientificName}</span><br/>
          <span style="color:#065f46; font-weight:600;">${r.utmFormatted}</span><br/>
          <span>Abundancia: ${r.abundance} | Estado: ${r.status}</span>
        </div>`
      );

      marker.bindTooltip(r.pointCode, {
        permanent: true,
        direction: 'right',
        className: 'osm-point-tooltip'
      });

      markersGroup.addLayer(marker);
    });

    markersGroup.addTo(map);

    // Fit map bounds nicely with padding
    if (filteredRecords.length > 0) {
      try {
        const bounds = markersGroup.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
        }
      } catch {
        map.setView(defaultCenter, 11);
      }
    } else {
      map.setView(defaultCenter, 11);
    }

    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, [type, filteredRecords.length, mapId]);

  const currentCfg = getTileConfig(activeProvider);

  return (
    <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs space-y-0.5 print-avoid-break">
      {/* Map Header with ArcGIS / OSM indicators & Selector */}
      <div className="bg-slate-900 text-white px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
            style={{ backgroundColor: badgeColor }}
          />
          <span className="font-bold tracking-tight">{mapTitle}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
          {enableLayerToggle && (
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded border border-slate-700">
              <Layers className="w-3 h-3 text-emerald-400 ml-1 shrink-0" />
              <select
                value={activeProvider}
                onChange={(e) => switchProvider(e.target.value as MapTileProvider)}
                className="bg-transparent text-emerald-300 text-[10px] font-bold py-0.5 px-1 rounded cursor-pointer border-none focus:outline-hidden"
              >
                <option value="arcgis-satellite" className="bg-slate-900 text-white">ArcGIS Satelital HD</option>
                <option value="arcgis-topo" className="bg-slate-900 text-white">ArcGIS Topográfico</option>
                <option value="arcgis-terrain" className="bg-slate-900 text-white">ArcGIS Terreno</option>
                <option value="osm" className="bg-slate-900 text-white">Callejero Topo (OSM)</option>
              </select>
            </div>
          )}
          {!enableLayerToggle && (
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.5 rounded font-bold">
              {currentCfg.label}
            </span>
          )}
          <span>{filteredRecords.length} puntos</span>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">UTM 19S</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div
        ref={containerRef}
        id={`map-canvas-${mapId}`}
        className="relative bg-slate-100 w-full"
        style={{ height: `${height}px`, minHeight: `${height}px` }}
      />

      {/* Cartographic Legend Strip */}
      <div className="bg-slate-50 border-t border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-sans">
        {type === 'nidos' ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Con Crías Vivas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> Con Huevos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> Vacío / Construcción
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" /> Aves
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> Mamíferos
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> Reptiles
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Flora
            </span>
          </div>
        )}
        <span className="text-[10px] text-slate-500 font-mono">
          Capa: {currentCfg.label} · Datum: WGS84 · UTM Huso 19S
        </span>
      </div>
    </div>
  );
};
