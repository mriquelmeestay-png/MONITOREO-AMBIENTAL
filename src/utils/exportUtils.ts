import { SamplingRecord } from '../types/sampling';

export function exportRecordsToCSV(records: SamplingRecord[], filenamePrefix = 'Reporte_Muestreo_Ambiental'): void {
  const headers = [
    'CodigoPunto',
    'TipoPunto',
    'NumPuntoFijo',
    'Categoria',
    'NombreComun',
    'NombreCientifico',
    'Orden',
    'Familia',
    'Sexo',
    'Etapa',
    'FloraHabito',
    'FloraAltura_m',
    'FloraCircunferencia_m',
    'FloraCondicion',
    'FloraEtapaFenologica',
    'Latitud',
    'Longitud',
    'UTM_Zona',
    'UTM_Este',
    'UTM_Norte',
    'FechaHora',
    'Campana',
    'Metodo',
    'Abundancia',
    'EstadoNido',
    'ContenidoNido',
    'NidosVisiblesDistancia',
    'DistanciaM',
    'Huevos',
    'CriasVivas',
    'CriasMuertas',
    'NumFotos',
    'EstadoConservacion',
    'Observador',
    'Sincronizado',
    'Notas'
  ];

  let csvContent = headers.join(',') + '\n';

  records.forEach((r) => {
    const nest = r.nestInfo || {
      status: 'Sin Nido / No aplica',
      content: 'Sin Registro / N/A',
      observableCount: 0,
      distanceM: 0,
      eggsCount: 0,
      chicksAlive: 0,
      chicksDead: 0
    };

    const row = [
      `"${r.pointCode}"`,
      `"${r.pointType}"`,
      `"${r.fixedPointNum || ''}"`,
      `"${r.category}"`,
      `"${r.commonName}"`,
      `"${r.scientificName}"`,
      `"${r.order || ''}"`,
      `"${r.family || ''}"`,
      `"${r.sex || ''}"`,
      `"${r.stage || ''}"`,
      `"${r.floraHabit || ''}"`,
      r.floraHeightM !== undefined ? r.floraHeightM : '',
      r.floraCircumferenceM !== undefined ? r.floraCircumferenceM : '',
      `"${r.floraCondition || ''}"`,
      `"${r.floraStage || ''}"`,
      r.lat,
      r.lng,
      `"${r.utmZone}"`,
      r.utmEasting,
      r.utmNorthing,
      `"${r.datetime}"`,
      `"${r.campaign}"`,
      `"${r.method}"`,
      r.abundance,
      `"${nest.status}"`,
      `"${nest.content}"`,
      nest.observableCount,
      nest.distanceM,
      nest.eggsCount,
      nest.chicksAlive,
      nest.chicksDead,
      (r.photos || []).length,
      `"${r.status}"`,
      `"${r.observer || ''}"`,
      r.synced ? 'Si' : 'No',
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ];

    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRecordsToJSON(records: SamplingRecord[]): void {
  const jsonStr = JSON.stringify(records, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `GeoMuestreo_Dataset_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
