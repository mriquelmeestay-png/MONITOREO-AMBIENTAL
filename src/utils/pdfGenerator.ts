import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SamplingRecord } from '../types/sampling';
import { formatDateTime } from './geoUtils';
import { getSpeciesPlaceholder } from '../data/fallbackSpeciesImages';

interface GeneratePDFOptions {
  specialistName?: string;
  deliveryDate?: string;
  campaignName?: string;
  campaignStartDate?: string;
  campaignEndDate?: string;
}

function drawPdfCartoMap(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  recordsToDraw: SamplingRecord[],
  mode: 'general' | 'aves' | 'mamiferos' | 'reptiles' | 'flora' | 'nidos'
) {
  // Salar Grande bounding box
  const minLat = -20.975;
  const maxLat = -20.915;
  const minLng = -69.840;
  const maxLng = -69.790;

  // Background box - ArcGIS Satellite Deep Tone
  doc.setFillColor(34, 43, 33);
  doc.setDrawColor(71, 85, 105);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');

  // Title bar
  doc.setFillColor(15, 23, 42);
  doc.rect(x, y, w, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(title, x + 3, y + 4.8);

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(56, 189, 248);
  doc.text(`${recordsToDraw.length} pts · ArcGIS Satelital HD & Topo · UTM 19S`, x + w - 3, y + 4.8, { align: 'right' });

  // Salar halite basin evaporite contour (ArcGIS White Core)
  doc.setFillColor(235, 242, 250);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x + 10, y + 10, w - 20, h - 16, 3, 3, 'FD');

  // Coastal ridge shading (DEM / Relieve)
  doc.setFillColor(25, 33, 25);
  doc.rect(x + 2, y + 8, 8, h - 14, 'F');

  // Grid lines
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(x + w * 0.35, y + 7, x + w * 0.35, y + h);
  doc.line(x + w * 0.65, y + 7, x + w * 0.65, y + h);
  doc.line(x, y + h * 0.4, x + w, y + h * 0.4);
  doc.line(x, y + h * 0.7, x + w, y + h * 0.7);
  doc.setLineDashPattern([], 0);

  // Basin label
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text('CUBO SALAR GRANDE', x + w / 2, y + h / 2, { align: 'center' });

  // North arrow symbol
  doc.setFillColor(15, 23, 42);
  doc.circle(x + w - 8, y + 14, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.text('N ^', x + w - 8, y + 15.2, { align: 'center' });

  // Project coordinates and draw points
  const innerX = x + 12;
  const innerY = y + 13;
  const innerW = w - 24;
  const innerH = h - 22;

  recordsToDraw.forEach((r) => {
    const px = innerX + ((r.lng - minLng) / (maxLng - minLng)) * innerW;
    const py = innerY + ((maxLat - r.lat) / (maxLat - minLat)) * innerH;

    const clampedX = Math.max(innerX, Math.min(innerX + innerW, px));
    const clampedY = Math.max(innerY, Math.min(innerY + innerH, py));

    if (mode === 'nidos') {
      const isChicks = r.nestInfo && r.nestInfo.chicksAlive > 0;
      const isEggs = r.nestInfo && r.nestInfo.eggsCount > 0;
      if (isChicks) {
        doc.setFillColor(22, 163, 74);
      } else if (isEggs) {
        doc.setFillColor(234, 88, 12);
      } else {
        doc.setFillColor(220, 38, 38);
      }
      doc.setDrawColor(255, 255, 255);
      doc.circle(clampedX, clampedY, 2.2, 'FD');
      doc.setFontSize(4.5);
      doc.setTextColor(15, 23, 42);
      doc.text(r.pointCode, clampedX + 3, clampedY + 1);
    } else {
      if (r.category === 'Aves') doc.setFillColor(2, 132, 199);
      else if (r.category === 'Mamíferos') doc.setFillColor(217, 119, 6);
      else if (r.category === 'Reptiles') doc.setFillColor(124, 58, 237);
      else if (r.category === 'Flora') doc.setFillColor(5, 150, 105);
      else doc.setFillColor(100, 116, 139);

      doc.setDrawColor(255, 255, 255);
      doc.circle(clampedX, clampedY, 1.8, 'FD');
      doc.setFontSize(4);
      doc.setTextColor(30, 41, 59);
      doc.text(r.pointCode, clampedX + 2.5, clampedY + 1);
    }
  });

  // Legend bar at bottom
  doc.setFillColor(255, 255, 255);
  doc.rect(x + 2, y + h - 5, w - 4, 4, 'F');
  doc.setFontSize(4.5);
  doc.setTextColor(71, 85, 105);
  if (mode === 'nidos') {
    doc.text('Verde: Con Crías · Naranjo: Con Huevos · Rojo: Vacío/Construcción', x + 4, y + h - 2);
  } else {
    doc.text('Azul: Aves · Naranjo: Mamíferos · Morado: Reptiles · Verde: Flora', x + 4, y + h - 2);
  }
}

export function generateSamplingReportPDF(
  records: SamplingRecord[],
  specialistNameOrOptions: string | GeneratePDFOptions = '',
  maybeDeliveryDate: string = new Date().toISOString().slice(0, 10)
): void {
  let specialistName = '';
  let deliveryDate = maybeDeliveryDate;
  let campaignName = 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026';
  let campaignStartDate = '2026-10-01';
  let campaignEndDate = '2026-10-15';

  if (typeof specialistNameOrOptions === 'object' && specialistNameOrOptions !== null) {
    specialistName = specialistNameOrOptions.specialistName || '';
    deliveryDate = specialistNameOrOptions.deliveryDate || deliveryDate;
    campaignName = specialistNameOrOptions.campaignName || campaignName;
    campaignStartDate = specialistNameOrOptions.campaignStartDate || campaignStartDate;
    campaignEndDate = specialistNameOrOptions.campaignEndDate || campaignEndDate;
  } else {
    specialistName = specialistNameOrOptions || '';
  }

  // Landscape orientation gives superior width for field sampling tables and dual maps
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryEmerald = [6, 95, 70];
  const darkSlate = [15, 23, 42];
  const textMuted = [100, 116, 139];

  // Helper Header
  const drawPageHeader = (pageTitle: string) => {
    doc.setFillColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
    doc.rect(0, 0, pageWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('INFORME TÉCNICO DE CAMPO - MONITOREO DE BIODIVERSIDAD Y EVALUACIÓN AMBIENTAL', 14, 8.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Compañía Minera Cordillera SCM · ${pageTitle}`, 14, 14.5);

    const printDateStr = new Date().toLocaleDateString('es-CL');
    doc.setFontSize(7.5);
    doc.text(`Emisión: ${printDateStr}`, pageWidth - 14, 8.5, { align: 'right' });
    doc.text('Datum / Proyección: WGS84 / UTM Zona 19S', pageWidth - 14, 14.5, { align: 'right' });
  };

  // -------------------------------------------------------------
  // PÁGINA 1: Carátula, Metadatos de Campaña, KPIs y Mapa General
  // -------------------------------------------------------------
  drawPageHeader('Línea de Base Salar Grande & Zona Norte de Chile (SEIA)');

  // Banner Categoría de Campaña y Rango de Fechas
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 23, pageWidth - 28, 12, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(`CAMPAÑA: ${campaignName}`, 18, 30.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text(`Rango de Fechas: ${campaignStartDate} al ${campaignEndDate}`, pageWidth - 18, 30.5, { align: 'right' });

  // Summary KPI Strip
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

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, pageWidth - 28, 11, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

  const colW = (pageWidth - 28) / 4;
  doc.text(`Puntos Registrados: ${totalPoints} pts`, 18, 45);
  doc.text(`Abundancia Total: ${totalAbundance} ind.`, 18 + colW, 45);
  doc.text(`Riqueza Específica: ${uniqueSpecies} especies`, 18 + colW * 2, 45);
  doc.text(`Nidos Monitoreados: ${totalNests} nidos`, 18 + colW * 3, 45);

  // Layout: Left = Mapa General (Todas las Especies), Right = Tabla de Distribución por Especies
  const splitW = (pageWidth - 32) / 2;
  const mapH = 130;

  // 1. Mapa General de Todas las Especies
  drawPdfCartoMap(
    doc,
    14,
    52,
    splitW,
    mapH,
    'MAPA GENERAL DE DISTRIBUCIÓN (TODAS LAS ESPECIES)',
    records,
    'general'
  );

  // 2. Tabla Resumen de Distribución por Especie (Derecha)
  const speciesMap = new Map<string, { common: string; scientific: string; cat: string; count: number; status: string; points: string[] }>();
  records.forEach((r) => {
    const key = r.scientificName;
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

  const speciesTableRows = Array.from(speciesMap.values()).map((sp) => [
    sp.common,
    sp.scientific,
    sp.cat,
    `${sp.count}`,
    sp.status,
    sp.points.join(', ')
  ]);

  autoTable(doc, {
    startY: 52,
    margin: { left: 14 + splitW + 4, right: 14 },
    tableWidth: splitW,
    head: [['Nombre Común', 'Nombre Científico', 'Taxa', 'Cant.', 'Estado', 'Puntos']],
    body: speciesTableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 6.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 6,
      textColor: [30, 41, 59],
      cellPadding: 1.3
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 28, fontStyle: 'italic' },
      2: { cellWidth: 15 },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 20 },
      5: { cellWidth: 'auto' }
    }
  });

  // Footer page 1
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Página 1 · GeoMuestreo Ambiental Salar Grande', pageWidth - 14, pageHeight - 6, { align: 'right' });

  // -------------------------------------------------------------
  // PÁGINA 2: Mapas Específicos por Taxa (Aves, Mamíferos, Reptiles, Flora)
  // -------------------------------------------------------------
  doc.addPage();
  drawPageHeader('Cartografía Específica por Grupos Taxonómicos');

  const halfW = (pageWidth - 32) / 2;
  const quadH = 82;

  // Mapa 1: Aves
  const avesRecords = records.filter((r) => r.category === 'Aves');
  drawPdfCartoMap(doc, 14, 24, halfW, quadH, 'MAPA ESPECÍFICO: AVES (ORNITOFAUNA)', avesRecords, 'aves');

  // Mapa 2: Mamíferos
  const mamiferosRecords = records.filter((r) => r.category === 'Mamíferos');
  drawPdfCartoMap(doc, 14 + halfW + 4, 24, halfW, quadH, 'MAPA ESPECÍFICO: MAMÍFEROS (MASTOFAUNA)', mamiferosRecords, 'mamiferos');

  // Mapa 3: Reptiles
  const reptilesRecords = records.filter((r) => r.category === 'Reptiles');
  drawPdfCartoMap(doc, 14, 24 + quadH + 4, halfW, quadH, 'MAPA ESPECÍFICO: REPTILES (HERPETOFAUNA)', reptilesRecords, 'reptiles');

  // Mapa 4: Flora
  const floraRecords = records.filter((r) => r.category === 'Flora');
  drawPdfCartoMap(doc, 14 + halfW + 4, 24 + quadH + 4, halfW, quadH, 'MAPA ESPECÍFICO: FLORA Y VEGETACIÓN', floraRecords, 'flora');

  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Página 2 · Cartografía Específica por Taxa', pageWidth - 14, pageHeight - 6, { align: 'right' });

  // -------------------------------------------------------------
  // PÁGINA 3: Mapa Exclusivo de Mapeo de Nidos y Tabla Reproductiva
  // -------------------------------------------------------------
  doc.addPage();
  drawPageHeader('Mapeo Exclusivo de Nidos y Actividad Reproductiva');

  const nestRecords = records.filter(
    (r) => r.category === 'Aves' && r.nestInfo && r.nestInfo.status !== 'Sin Nido / No aplica'
  );

  // Left = Mapa exclusivo nidos
  drawPdfCartoMap(doc, 14, 24, splitW, 160, 'MAPA EXCLUSIVO: MONITOREO Y DISTRIBUCIÓN DE NIDOS', nestRecords, 'nidos');

  // Right = Tabla de nidos detallada
  const nestRows = nestRecords.map((r) => {
    const nest = r.nestInfo!;
    return [
      r.pointCode,
      r.commonName,
      nest.status,
      nest.content,
      `${nest.distanceM} m`,
      `${nest.eggsCount}`,
      `${nest.chicksAlive}`,
      `${nest.chicksDead}`,
      r.utmFormatted || `${r.lat}, ${r.lng}`
    ];
  });

  autoTable(doc, {
    startY: 24,
    margin: { left: 14 + splitW + 4, right: 14 },
    tableWidth: splitW,
    head: [['Punto', 'Especie', 'Estado Nido', 'Contenido', 'Dist.', 'Huevos', 'Crías V.', 'Crías M.', 'UTM WGS84']],
    body: nestRows.length > 0 ? nestRows : [['-', 'Sin registros de nidos activos en esta campaña', '-', '-', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [185, 28, 28], // Red for nests
      textColor: [255, 255, 255],
      fontSize: 6.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 6,
      textColor: [30, 41, 59],
      cellPadding: 1.4
    },
    columnStyles: {
      0: { cellWidth: 14, fontStyle: 'bold' },
      1: { cellWidth: 26 },
      2: { cellWidth: 18 },
      3: { cellWidth: 18 },
      4: { cellWidth: 12 },
      5: { cellWidth: 10, halign: 'center' },
      6: { cellWidth: 10, halign: 'center' },
      7: { cellWidth: 10, halign: 'center' },
      8: { cellWidth: 'auto', fontStyle: 'italic' }
    }
  });

  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Página 3 · Mapeo Exclusivo de Nidos', pageWidth - 14, pageHeight - 6, { align: 'right' });

  // -------------------------------------------------------------
  // PÁGINA 4: Apartado de Evidencias Fotográficas de Campo
  // -------------------------------------------------------------
  // Collect all photos with metadata
  const allPhotos: { pointCode: string; species: string; date: string; url: string; description: string }[] = [];
  records.forEach((r) => {
    if (r.photoDetails && r.photoDetails.length > 0) {
      r.photoDetails.forEach((pd) => {
        allPhotos.push({
          pointCode: r.pointCode,
          species: r.commonName,
          date: r.datetime,
          url: pd.url,
          description: pd.description || `Registro fotográfico en ${r.pointCode} (${r.commonName})`
        });
      });
    } else if (r.photos && r.photos.length > 0) {
      r.photos.forEach((u) => {
        allPhotos.push({
          pointCode: r.pointCode,
          species: r.commonName,
          date: r.datetime,
          url: u,
          description: `Registro fotográfico en terreno - ${r.pointCode}: ${r.commonName}`
        });
      });
    }
  });

  doc.addPage();
  drawPageHeader('Apartado de Registro Fotográfico y Evidencias de Terreno');

  if (allPhotos.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 30, pageWidth - 28, 40, 2, 2, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('No se han registrado fotografías de terreno para esta campaña aún.', pageWidth / 2, 50, { align: 'center' });
  } else {
    // Render photos in a 3x2 grid per page
    const photosPerPage = 6;
    const photoBoxW = (pageWidth - 36) / 3;
    const photoBoxH = 75;

    for (let i = 0; i < Math.min(12, allPhotos.length); i++) {
      if (i > 0 && i % photosPerPage === 0) {
        doc.addPage();
        drawPageHeader('Apartado de Registro Fotográfico (Continuación)');
      }

      const pIndex = i % photosPerPage;
      const col = pIndex % 3;
      const row = Math.floor(pIndex / 3);

      const px = 14 + col * (photoBoxW + 4);
      const py = 26 + row * (photoBoxH + 4);

      const photoItem = allPhotos[i];

      // Outer border box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(px, py, photoBoxW, photoBoxH, 1.5, 1.5, 'FD');

      // Top caption bar
      doc.setFillColor(15, 23, 42);
      doc.rect(px, py, photoBoxW, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text(`${photoItem.pointCode}: ${photoItem.species}`, px + 2.5, py + 4.2);

      // Photo Image embed
      const imgH = 44;
      try {
        const imgSource = photoItem.url.startsWith('data:image')
          ? photoItem.url
          : getSpeciesPlaceholder(photoItem.species, photoItem.species);

        if (imgSource.startsWith('data:image/svg+xml')) {
          // Draw high-contrast photographic evidence graphic for SVG data URL
          doc.setFillColor(15, 23, 42);
          doc.rect(px + 2, py + 7, photoBoxW - 4, imgH, 'F');
          // Add topographic contour in photo frame
          doc.setFillColor(30, 41, 59);
          doc.rect(px + 4, py + 9, photoBoxW - 8, imgH - 4, 'F');
          doc.setTextColor(56, 189, 248);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(`[ REGISTRO FOTOGRÁFICO: ${photoItem.pointCode} ]`, px + photoBoxW / 2, py + 24, { align: 'center' });
          doc.setFontSize(6.5);
          doc.setTextColor(255, 255, 255);
          doc.text(photoItem.species, px + photoBoxW / 2, py + 31, { align: 'center' });
          doc.setFontSize(5.5);
          doc.setTextColor(148, 163, 184);
          doc.text('Verificado con coordenadas UTM en terreno', px + photoBoxW / 2, py + 38, { align: 'center' });
        } else if (imgSource.startsWith('data:image')) {
          doc.addImage(imgSource, 'JPEG', px + 2, py + 7, photoBoxW - 4, imgH);
        } else {
          doc.setFillColor(15, 23, 42);
          doc.rect(px + 2, py + 7, photoBoxW - 4, imgH, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.text(`Foto: ${photoItem.species}`, px + photoBoxW / 2, py + 28, { align: 'center' });
        }
      } catch {
        doc.setFillColor(241, 245, 249);
        doc.rect(px + 2, py + 7, photoBoxW - 4, imgH, 'F');
      }

      // Bottom description
      doc.setFillColor(248, 250, 252);
      doc.rect(px + 2, py + 52, photoBoxW - 4, 20, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(51, 65, 85);

      const splitDesc = doc.splitTextToSize(`Descripción: ${photoItem.description}`, photoBoxW - 8);
      doc.text(splitDesc, px + 4, py + 56);

      doc.setFontSize(5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Fecha: ${photoItem.date ? photoItem.date.replace('T', ' ') : '-'}`, px + 4, py + 70);
    }
  }

  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Apartado Fotográfico y Evidencias', pageWidth - 14, pageHeight - 6, { align: 'right' });

  // -------------------------------------------------------------
  // PÁGINA 5+: Tabla Completa de Registros de Muestreo de Terreno
  // -------------------------------------------------------------
  doc.addPage();
  drawPageHeader('Registros Georreferenciados de Muestreo de Terreno');

  const tableData = records.map((r) => {
    const pointStr = `${r.pointCode}\n${r.pointType}${r.fixedPointNum ? ' (' + r.fixedPointNum + ')' : ''}`;
    const nameStr = `${r.commonName}\n${r.scientificName}`;
    const taxStr = `${r.order || '-'}\n${r.family || '-'}`;
    const demoStr = `${r.sex}\n${r.stage}`;
    const coordStr = `${r.utmFormatted || `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`}`;
    const dateStr = `${formatDateTime(r.datetime)}\n${r.campaign}`;

    let nestStr = '-';
    if (r.category === 'Aves' && r.nestInfo && r.nestInfo.status !== 'Sin Nido / No aplica') {
      nestStr = `${r.nestInfo.status}\nHuevos: ${r.nestInfo.eggsCount} | Crías: ${r.nestInfo.chicksAlive}`;
    }

    const obsStr = r.notes ? (r.notes.length > 40 ? r.notes.slice(0, 37) + '...' : r.notes) : '-';
    const observerStr = r.observer?.trim() || '-';

    return [
      pointStr,
      r.category,
      nameStr,
      taxStr,
      demoStr,
      coordStr,
      dateStr,
      observerStr,
      `${r.abundance}`,
      r.status,
      nestStr,
      obsStr
    ];
  });

  autoTable(doc, {
    startY: 24,
    head: [[
      'Punto / Tipo',
      'Categoría',
      'Nombre Común / Científico',
      'Orden / Familia',
      'Demografía',
      'Coordenadas (WGS84 UTM)',
      'Fecha / Campaña',
      'Observador',
      'Cant.',
      'Estado Cons.',
      'Nidos (Aves)',
      'Observaciones'
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [6, 95, 70],
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: [30, 41, 59],
      valign: 'top',
      cellPadding: 1.6
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 15 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20 },
      4: { cellWidth: 18 },
      5: { cellWidth: 38 },
      6: { cellWidth: 22 },
      7: { cellWidth: 22 },
      8: { cellWidth: 9, halign: 'center' },
      9: { cellWidth: 22 },
      10: { cellWidth: 24 },
      11: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  // Sign-off block
  let finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 120;
  if (finalY + 36 > pageHeight) {
    doc.addPage();
    drawPageHeader('Validación y Responsabilidad Técnica del Estudio');
    finalY = 28;
  }

  const signBoxWidth = (pageWidth - 36) / 2;

  // Left Signature: Specialist (Blank line for physical or manual writing)
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, signBoxWidth, 28, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('PROFESIONAL RESPONSABLE DE CAMPO', 18, finalY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const specialistDisplay = specialistName.trim() || '_______________________________';
  doc.text(specialistDisplay, 18, finalY + 14);

  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(18, finalY + 22, 14 + signBoxWidth - 4, finalY + 22);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Firma y Verificación de Integridad de Datos en Terreno', 18, finalY + 26);

  // Right Signature: Company
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(22 + signBoxWidth, finalY, signBoxWidth, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('COMPAÑÍA MINERA CORDILLERA SCM', 26 + signBoxWidth, finalY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Gerencia de Medio Ambiente y Sustentabilidad', 26 + signBoxWidth, finalY + 14);

  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(26 + signBoxWidth, finalY + 22, 22 + signBoxWidth * 2 - 4, finalY + 22);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Fecha Entrega Informe: ${deliveryDate} · Aprobación EIA`, 26 + signBoxWidth, finalY + 26);

  // Save / Download PDF
  const filename = `Informe_Tecnico_Muestreo_Salar_Grande_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
