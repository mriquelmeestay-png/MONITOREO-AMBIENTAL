import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Map as MapIcon,
  Layers,
  Egg,
  Camera,
  Calendar,
  Briefcase
} from 'lucide-react';
import { SamplingRecord } from '../types/sampling';
import { generateSamplingReportPDF } from '../utils/pdfGenerator';
import { formatDateTime } from '../utils/geoUtils';
import { ReportCartoMaps } from './ReportCartoMaps';
import { getSpeciesPlaceholder } from '../data/fallbackSpeciesImages';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SamplingRecord[];
  specialistName: string;
  onSpecialistNameChange?: (name: string) => void;
  campaignName?: string;
  campaignStartDate?: string;
  campaignEndDate?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  records,
  specialistName,
  onSpecialistNameChange,
  campaignName = 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
  campaignStartDate = '2026-10-01',
  campaignEndDate = '2026-10-15'
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'general' | 'taxa' | 'nidos' | 'fotos' | 'tabla'>('resumen');

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    try {
      generateSamplingReportPDF(records, {
        specialistName,
        campaignName,
        campaignStartDate,
        campaignEndDate,
        deliveryDate: new Date().toISOString().slice(0, 10)
      });
      setDownloadSuccess(true);
      setPrintNotice(null);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      alert(`Error al generar el archivo PDF: ${err?.message || 'Error desconocido'}`);
    }
  };

  const handleBrowserPrint = () => {
    setPrintNotice(null);
    try {
      // Standard window.print()
      window.print();
    } catch (err: any) {
      // Sandboxed iframes block window.print()
      setPrintNotice(
        'El visor web restringió la ventana emergente de impresión directa. Descargando automáticamente el PDF oficial de alta resolución con todos los mapas y fotografías...'
      );
      setTimeout(() => {
        handleDownloadPDF();
      }, 400);
    }
  };

  const totalPoints = records.length;
  const totalAbundance = records.reduce((acc, r) => acc + (r.abundance || 1), 0);
  const uniqueSpecies = new Set(
    records.map((r) => r.scientificName).filter(Boolean)
  ).size;
  const nestRecords = records.filter(
    (r) => r.category === 'Aves' && r.nestInfo && r.nestInfo.status !== 'Sin Nido / No aplica'
  );

  // All photos with description and guaranteed fallback
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
          description: pd.description || `Fotografía de registro en ${r.pointCode} (${r.commonName})`
        });
      });
    } else if (r.photos && r.photos.length > 0) {
      r.photos.forEach((u) => {
        allPhotos.push({
          pointCode: r.pointCode,
          species: r.commonName,
          url: u,
          fallbackUrl: fallback,
          description: `Registro fotográfico en terreno - ${r.pointCode}: ${r.commonName}`
        });
      });
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in modal-backdrop-screen"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Informe Técnico Oficial y Cartografía · SEIA Chile</h3>
              <p className="text-[11px] text-slate-400">
                Línea de Base Salar Grande & Tarapacá · Compañía Minera Cordillera SCM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Header Strip: PDF Download & Browser Print Buttons */}
        <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF Oficial (.pdf)</span>
            </button>

            <button
              onClick={handleBrowserPrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir desde el Navegador</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-1 rounded font-bold border border-emerald-300">
            WGS84 / UTM Zona 19S
          </span>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-2 border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs shrink-0">
          {[
            { id: 'resumen', label: 'Resumen & Campaña', icon: Briefcase },
            { id: 'general', label: 'Mapa General', icon: MapIcon },
            { id: 'taxa', label: 'Mapas Específicos Taxa', icon: Layers },
            { id: 'nidos', label: 'Mapeo de Nidos', icon: Egg },
            { id: 'fotos', label: `Evidencias (${allPhotos.length})`, icon: Camera },
            { id: 'tabla', label: 'Tabla Puntos', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-900 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Success / Feedback alerts */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>¡Archivo PDF descargado exitosamente!</strong> Incluye los 6 mapas cartográficos, evidencias fotográficas completas y tablas de terreno.
              </span>
            </div>
          )}

          {printNotice && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{printNotice}</span>
            </div>
          )}

          {/* TAB 1: RESUMEN Y METADATOS DE CAMPAÑA */}
          {activeTab === 'resumen' && (
            <div className="space-y-4">
              {/* Campaign Category Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      Categoría de Campaña de Terreno
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{campaignName}</h4>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <span className="font-semibold block flex items-center gap-1 sm:justify-end">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Rango de Fechas: {campaignStartDate} al {campaignEndDate}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Puntos</span>
                    <span className="text-sm font-bold text-slate-800">{totalPoints}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Individuos</span>
                    <span className="text-sm font-bold text-slate-800">{totalAbundance}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Especies</span>
                    <span className="text-sm font-bold text-slate-800">{uniqueSpecies}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Nidos</span>
                    <span className="text-sm font-bold text-rose-700">{nestRecords.length}</span>
                  </div>
                </div>
              </div>

              {/* Responsible Officer Signature Manual Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 text-xs block">
                  Profesional Especialista Responsable de Campo (Ingreso Manual):
                </span>
                <p className="text-[11px] text-slate-500">
                  Este campo se mantiene en blanco por defecto y debe ser ingresado manualmente para la firma del informe oficial.
                </p>
                <div className="max-w-md">
                  {onSpecialistNameChange ? (
                    <input
                      type="text"
                      value={specialistName}
                      onChange={(e) => onSpecialistNameChange(e.target.value)}
                      placeholder="Escriba manualmente nombre y cargo del especialista..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="p-2 bg-white rounded border border-slate-200 font-semibold font-mono">
                      {specialistName.trim() || '_______________________________'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MAPA GENERAL DE TODAS LAS ESPECIES */}
          {activeTab === 'general' && (
            <div className="space-y-3">
              <ReportCartoMaps
                records={records}
                type="general"
                title="Mapa General de Distribución - Todas las Especies (Salar Grande)"
                height={380}
              />
              <p className="text-[11px] text-slate-500 italic">
                Cartografía general con coordenadas WGS84 UTM Zona 19S y todos los puntos de muestreo georreferenciados.
              </p>
            </div>
          )}

          {/* TAB 3: MAPAS ESPECÍFICOS POR TAXA */}
          {activeTab === 'taxa' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReportCartoMaps records={records} type="aves" height={280} />
                <ReportCartoMaps records={records} type="mamiferos" height={280} />
                <ReportCartoMaps records={records} type="reptiles" height={280} />
                <ReportCartoMaps records={records} type="flora" height={280} />
              </div>
            </div>
          )}

          {/* TAB 4: MAPA EXCLUSIVO DE MAPEO DE NIDOS */}
          {activeTab === 'nidos' && (
            <div className="space-y-3">
              <ReportCartoMaps
                records={records}
                type="nidos"
                title="Mapa Exclusivo de Mapeo y Monitoreo de Nidos de Aves"
                height={350}
              />
              {nestRecords.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 font-semibold text-slate-700">
                      <tr>
                        <th className="p-2">Punto</th>
                        <th className="p-2">Especie</th>
                        <th className="p-2">Estado Nido</th>
                        <th className="p-2">Contenido</th>
                        <th className="p-2">Distancia</th>
                        <th className="p-2">Huevos</th>
                        <th className="p-2">Crías Vivas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {nestRecords.map((r) => (
                        <tr key={r.id}>
                          <td className="p-2 font-mono font-bold text-emerald-800">{r.pointCode}</td>
                          <td className="p-2 font-medium">{r.commonName}</td>
                          <td className="p-2 font-semibold text-rose-700">{r.nestInfo?.status}</td>
                          <td className="p-2">{r.nestInfo?.content}</td>
                          <td className="p-2 font-mono">{r.nestInfo?.distanceM} m</td>
                          <td className="p-2 font-mono font-bold">{r.nestInfo?.eggsCount}</td>
                          <td className="p-2 font-mono font-bold text-emerald-700">{r.nestInfo?.chicksAlive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic p-3 bg-slate-50 rounded">
                  No se han registrado nidos activos en los puntos actuales de la campaña.
                </p>
              )}
            </div>
          )}

          {/* TAB 5: APARTADO DE EVIDENCIAS FOTOGRÁFICAS */}
          {activeTab === 'fotos' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">
                Registro Fotográfico y Evidencias de Campo ({allPhotos.length} fotos registradas):
              </h4>
              {allPhotos.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-400">
                  No hay fotografías registradas aún. Adjunte fotografías en el formulario para incluirlas en el informe.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allPhotos.map((photo, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.pointCode}
                          loading="eager"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            if (e.currentTarget.src !== photo.fallbackUrl) {
                              e.currentTarget.src = photo.fallbackUrl;
                            }
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-slate-900/85 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                          {photo.pointCode}
                        </span>
                      </div>
                      <div className="p-2 space-y-1">
                        <span className="font-bold text-[11px] text-slate-800 block truncate">
                          {photo.species}
                        </span>
                        <p className="text-[10px] text-slate-600 line-clamp-2">
                          {photo.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TABLA COMPLETA DE PUNTOS */}
          {activeTab === 'tabla' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                Total de Puntos de Muestreo ({records.length}):
              </span>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-[10px] text-slate-700">
                  <thead className="bg-slate-100 font-semibold text-slate-600 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-1.5">Código</th>
                      <th className="p-1.5">Categoría</th>
                      <th className="p-1.5">Especie</th>
                      <th className="p-1.5">UTM (WGS84)</th>
                      <th className="p-1.5">Fecha</th>
                      <th className="p-1.5">Observador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-1.5 font-mono font-bold text-emerald-800">{r.pointCode}</td>
                        <td className="p-1.5 font-medium">{r.category}</td>
                        <td className="p-1.5">
                          <span className="font-semibold">{r.commonName}</span>
                          <span className="italic text-slate-500 ml-1">({r.scientificName})</span>
                        </td>
                        <td className="p-1.5 font-mono text-[9px]">{r.utmFormatted || '-'}</td>
                        <td className="p-1.5">{formatDateTime(r.datetime)}</td>
                        <td className="p-1.5 font-medium truncate max-w-[90px]">{r.observer || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs shrink-0">
          <span className="text-slate-500 text-[11px]">
            Cumplimiento Guías Metodológicas SEIA Chile (2022-2026)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
