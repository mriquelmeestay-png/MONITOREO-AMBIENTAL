import React from 'react';
import {
  Compass,
  Printer,
  CloudCheck,
  CloudUpload,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  X,
  Globe,
  MapPin
} from 'lucide-react';
import { CoordinateFormat } from '../types/sampling';

interface HeaderProps {
  onPrint: () => void;
  syncedCount: number;
  totalCount: number;
  isSyncing: boolean;
  onManualSync: () => void;
  isOnline: boolean;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
  showOfflineBanner: boolean;
  onDismissOfflineBanner: () => void;
  lastAutoSavedAt?: string | null;
  coordFormat: CoordinateFormat;
  onCoordFormatChange: (format: CoordinateFormat) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onPrint,
  syncedCount,
  totalCount,
  isSyncing,
  onManualSync,
  isOnline,
  isSimulatedOffline,
  onToggleSimulatedOffline,
  showOfflineBanner,
  onDismissOfflineBanner,
  lastAutoSavedAt,
  coordFormat,
  onCoordFormatChange
}) => {
  const isAllSynced = totalCount > 0 && syncedCount === totalCount;
  const isSyncDisabled = isSyncing;

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand Wordmark (single element) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              GeoMuestreo Salar Grande
            </a>
          </div>

          {/* Zone 2: Navigation Links (concise, single-line) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#planificacion" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
              Planificación
            </a>
            <a href="#dashboard" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
              Dashboard
            </a>
            <a href="#formulario" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
              Registro Campo
            </a>
            <a href="#mapa" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
              Georreferenciación
            </a>
            <a href="#registros" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
              Tabla Registros
            </a>
            <a href="#informe" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
              Validación EIA
            </a>
          </nav>

          {/* Zone 3: Primary Actions, Coordinate Selector, Network Status & Cloud Sync */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Global Coordinate Format Selector (Decimal vs UTM) */}
            <div
              className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-0.5 shadow-xs"
              role="group"
              aria-label="Selector de formato de coordenadas"
            >
              <span className="hidden lg:inline-block text-[10px] font-bold text-slate-400 px-1.5 uppercase tracking-wider">
                Coord:
              </span>
              <button
                type="button"
                onClick={() => onCoordFormatChange('decimal')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold font-mono transition-all ${
                  coordFormat === 'decimal'
                    ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
                title="Formato de coordenadas global: Grados Decimales (° Lat/Lng, WGS84)"
              >
                <Globe className={`w-3 h-3 ${coordFormat === 'decimal' ? 'text-emerald-100' : 'text-slate-400'}`} />
                <span>Decimal</span>
              </button>
              <button
                type="button"
                onClick={() => onCoordFormatChange('utm')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold font-mono transition-all ${
                  coordFormat === 'utm'
                    ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
                title="Formato de coordenadas global: Proyección UTM Huso 19S (WGS84 Este/Norte)"
              >
                <MapPin className={`w-3 h-3 ${coordFormat === 'utm' ? 'text-emerald-100' : 'text-slate-400'}`} />
                <span>UTM</span>
              </button>
            </div>

            {/* Network Status Indicator */}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                  isOnline
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/90 border-rose-500/60 text-rose-300 animate-pulse'
                }`}
                title={
                  isOnline
                    ? 'Conexión a internet activa: sincronización en tiempo real habilitada'
                    : 'Sin conexión a internet: modo fuera de línea activo. La sincronización está deshabilitada.'
                }
              >
                {isOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span className="font-semibold whitespace-nowrap text-[11px]">
                  {isOnline ? 'En Línea' : 'Sin Conexión'}
                </span>
              </div>

              {/* Toggle to simulate offline for testing in browser */}
              <button
                type="button"
                onClick={onToggleSimulatedOffline}
                className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors whitespace-nowrap ${
                  isSimulatedOffline
                    ? 'bg-rose-900/60 border-rose-500 text-rose-200 hover:bg-rose-800'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="Permite simular el estado sin conexión para probar el comportamiento de la app"
              >
                {isSimulatedOffline ? 'Reconectar' : 'Simular Offline'}
              </button>
            </div>

            {/* Auto-save Status Indicator (LocalStorage cada 30s) */}
            {lastAutoSavedAt && (
              <div
                className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-[10.5px] font-mono text-emerald-300"
                title={`Respaldo automático en LocalStorage cada 30 segundos. Último respaldo: ${lastAutoSavedAt}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">Auto-save:</span>
                <span className="font-semibold text-emerald-300 tabular-nums">{lastAutoSavedAt}</span>
              </div>
            )}

            {/* Cloud Sync Button (Disabled when offline) */}
            <button
              onClick={onManualSync}
              disabled={isSyncDisabled}
              title={
                !isOnline
                  ? 'Sin conexión a internet: sincronización en la nube desactivada'
                  : isAllSynced
                  ? 'Todos los puntos están sincronizados en la nube'
                  : 'Haz clic para sincronizar datos a la nube'
              }
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-all border ${
                !isOnline
                  ? 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                  : isAllSynced
                  ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300 cursor-default'
                  : 'bg-amber-950/60 border-amber-600/40 text-amber-300 hover:bg-amber-900/50 cursor-pointer active:scale-95'
              }`}
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
              ) : !isOnline ? (
                <WifiOff className="w-3.5 h-3.5 text-slate-500" />
              ) : isAllSynced ? (
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <CloudUpload className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="whitespace-nowrap tabular-nums">
                {isSyncing
                  ? 'Sincronizando...'
                  : !isOnline
                  ? 'Sinc. Desactivada'
                  : `${syncedCount}/${totalCount} Nube`}
              </span>
            </button>

            {/* Primary Action Button: Print / PDF */}
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Informe / PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Offline Alert Banner (shown when offline) */}
      {!isOnline && showOfflineBanner && (
        <div className="bg-amber-900/90 text-amber-100 border-b border-amber-700 px-4 py-2 text-xs flex items-center justify-between gap-3 no-print z-40 animate-in fade-in">
          <div className="max-w-7xl mx-auto flex items-center gap-2 flex-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="font-medium">
              <strong>Modo Fuera de Línea Activo:</strong> No se detectó conexión a internet. Los botones de sincronización están desactivados. Todos los registros y coordenadas se guardan localmente y se sincronizarán al restablecer la conexión.
            </p>
          </div>
          <button
            onClick={onDismissOfflineBanner}
            className="text-amber-300 hover:text-white p-1 rounded transition-colors"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
