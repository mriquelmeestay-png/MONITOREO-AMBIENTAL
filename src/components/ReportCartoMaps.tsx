import React from 'react';
import { SamplingRecord } from '../types/sampling';
import { OsmPrintableMap, MapTileProvider } from './OsmPrintableMap';

interface ReportCartoMapsProps {
  records: SamplingRecord[];
  type: 'general' | 'aves' | 'mamiferos' | 'reptiles' | 'flora' | 'nidos';
  title?: string;
  height?: number;
  mapId?: string;
  initialProvider?: MapTileProvider;
  enableLayerToggle?: boolean;
}

export const ReportCartoMaps: React.FC<ReportCartoMapsProps> = ({
  records,
  type,
  title,
  height = 340,
  mapId,
  initialProvider = 'arcgis-satellite',
  enableLayerToggle = true
}) => {
  const generatedId = mapId || `report-${type}-${Math.random().toString(36).substring(2, 7)}`;
  return (
    <OsmPrintableMap
      records={records}
      type={type}
      title={title}
      height={height}
      mapId={generatedId}
      initialProvider={initialProvider}
      enableLayerToggle={enableLayerToggle}
    />
  );
};
