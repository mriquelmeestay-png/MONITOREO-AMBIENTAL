import React, { useState } from 'react';
import {
  Target,
  Plus,
  Minus,
  CloudUpload,
  Calendar,
  Briefcase,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  FolderPlus,
  X,
  Check
} from 'lucide-react';
import { Campaign } from '../types/sampling';

interface SamplingPlannerProps {
  targetPoints: number;
  currentPoints: number;
  onTargetChange: (newTarget: number) => void;
  campaigns: Campaign[];
  activeCampaignId: string;
  onSelectCampaign: (id: string) => void;
  onAddCampaign: (newCamp: { name: string; startDate: string; endDate: string; targetPoints: number }) => void;
  onUpdateActiveCampaign: (updates: Partial<Campaign>) => void;
  onToggleLockCampaign: () => void;
  onDeleteCampaign: (id: string) => void;
  isCampaignLocked: boolean;
  onSyncAll: () => void;
  isSyncing: boolean;
  isOnline: boolean;
  onClearAllRecords?: () => void;
}

export const SamplingPlanner: React.FC<SamplingPlannerProps> = ({
  targetPoints,
  currentPoints,
  onTargetChange,
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onAddCampaign,
  onUpdateActiveCampaign,
  onToggleLockCampaign,
  onDeleteCampaign,
  isCampaignLocked,
  onSyncAll,
  isSyncing,
  isOnline,
  onClearAllRecords
}) => {
  const percentage = Math.min(100, Math.round((currentPoints / (targetPoints || 1)) * 100));
  const isLimitReached = currentPoints >= targetPoints;

  // Active campaign
  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0] || {
    id: 'camp-default',
    name: 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
    startDate: '2026-10-01',
    endDate: '2026-10-15',
    targetPoints: 25,
    isLocked: false,
    createdAt: ''
  };

  // State for modals
  const [showNewCampaignModal, setShowNewCampaignModal] = useState<boolean>(false);
  const [showDeleteCampaignModal, setShowDeleteCampaignModal] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // New campaign form fields
  const [newCampName, setNewCampName] = useState<string>('');
  const [newCampStart, setNewCampStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newCampEnd, setNewCampEnd] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [newCampTarget, setNewCampTarget] = useState<number>(30);

  // Compute days difference for active campaign
  let totalDays = 1;
  try {
    const start = new Date(activeCampaign.startDate).getTime();
    const end = new Date(activeCampaign.endDate).getTime();
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
  } catch {
    totalDays = 1;
  }

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;
    onAddCampaign({
      name: newCampName.trim(),
      startDate: newCampStart,
      endDate: newCampEnd,
      targetPoints: newCampTarget
    });
    setShowNewCampaignModal(false);
    setNewCampName('');
  };

  return (
    <section id="planificacion" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm no-print space-y-4">
      {/* Top Row: Plan Title, Sampling Count Controls & Global Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        {/* Title & Goal info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Planificación y Campaña de Muestreo</h2>
              {isCampaignLocked ? (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>Campaña Bloqueada</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  <span>Campaña Desbloqueada</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Control de avance, rango de fechas y protección contra eliminación accidental · Salar Grande
            </p>
          </div>
        </div>

        {/* Stepper, Sync & Delete Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* N° de Muestreos Stepper */}
          <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 px-2 whitespace-nowrap">N° de Muestreos:</span>
            <button
              type="button"
              onClick={() => onTargetChange(Math.max(1, targetPoints - 1))}
              className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              aria-label="Disminuir N° de muestreos"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              min={1}
              max={500}
              value={targetPoints}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1) onTargetChange(val);
              }}
              className="w-14 bg-white border border-slate-200 rounded mx-1 p-1 text-xs text-center font-mono font-bold text-slate-800"
            />
            <button
              type="button"
              onClick={() => onTargetChange(targetPoints + 1)}
              className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
              aria-label="Aumentar N° de muestreos"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress pill container with Lock indicator if limit reached */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-colors ${
              isLimitReached
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-slate-600">Avance:</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                isLimitReached ? 'text-amber-800 font-extrabold' : 'text-emerald-700'
              }`}
            >
              {currentPoints} / {targetPoints} ({percentage}%)
            </span>
            {isLimitReached && (
              <span
                className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-200/90 px-1.5 py-0.5 rounded shadow-xs"
                title="Se ha alcanzado el N° de muestreos seleccionado. El registro está bloqueado hasta que aumente el N° de muestreos."
              >
                <span>🔒 Límite Alcanzado</span>
              </span>
            )}
          </div>

          {/* Sync All button ("Sincronizar Lote") */}
          <button
            type="button"
            onClick={onSyncAll}
            disabled={isSyncing}
            title="Sincronizar lote completo de datos y asegurar persistencia local y servidor"
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm whitespace-nowrap active:scale-95 cursor-pointer ${
              isSyncing
                ? 'bg-emerald-800 text-white cursor-wait'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Lote'}</span>
          </button>

          {/* Clear / Delete All Data button with Lock Protection */}
          {onClearAllRecords && (
            <button
              type="button"
              disabled={isCampaignLocked}
              onClick={() => setShowClearConfirm(true)}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                isCampaignLocked
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border-rose-200 cursor-pointer'
              }`}
              title={
                isCampaignLocked
                  ? 'Campaña bloqueada: desbloquee la campaña para poder borrar datos'
                  : 'Borrar todos los puntos registrados'
              }
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar Datos</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
        <div
          className={`h-2 rounded-full transition-all duration-300 ease-out ${
            isLimitReached ? 'bg-amber-500' : 'bg-emerald-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* CATEGORÍA DE CAMPAÑA: Gestión, Rango de Fechas, Bloqueo/Desbloqueo y Nueva Campaña */}
      <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2 text-slate-800">
            <Briefcase className="w-4 h-4 text-emerald-700 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Categoría de Campaña de Terreno
            </h3>
            {campaigns.length > 1 && (
              <select
                value={activeCampaignId}
                onChange={(e) => onSelectCampaign(e.target.value)}
                className="ml-2 bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-slate-800"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isLocked ? '🔒' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Campaign Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Botón Agregar Nueva Campaña */}
            <button
              type="button"
              onClick={() => setShowNewCampaignModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Agregar Nueva Campaña</span>
            </button>

            {/* Botón Bloquear / Desbloquear Campaña */}
            <button
              type="button"
              onClick={onToggleLockCampaign}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer border ${
                isCampaignLocked
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title={
                isCampaignLocked
                  ? 'Haga clic para desbloquear la campaña y permitir modificaciones o eliminaciones'
                  : 'Haga clic para bloquear la campaña y proteger los datos contra eliminación accidental'
              }
            >
              {isCampaignLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Desbloquear Campaña</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Bloquear Campaña</span>
                </>
              )}
            </button>

            {/* Botón Eliminar Campaña (Borra todos los datos con confirmación) */}
            <button
              type="button"
              disabled={isCampaignLocked}
              onClick={() => setShowDeleteCampaignModal(true)}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition ${
                isCampaignLocked
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 cursor-pointer'
              }`}
              title={
                isCampaignLocked
                  ? 'Campaña bloqueada contra eliminación accidental. Desbloquee para eliminar.'
                  : 'Eliminar esta campaña y borrar todos sus datos asociados'
              }
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Eliminar Campaña</span>
            </button>
          </div>
        </div>

        {/* Campaign Info Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Nombre del Muestreo / Campaña (7 cols) */}
          <div className="md:col-span-7 space-y-1">
            <label className="block font-semibold text-slate-700 text-[11px]">
              Nombre del Muestreo / Denominación de Campaña:
            </label>
            <input
              type="text"
              disabled={isCampaignLocked}
              value={activeCampaign.name}
              onChange={(e) => onUpdateActiveCampaign({ name: e.target.value })}
              placeholder="Ej: Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026"
              className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 ${
                isCampaignLocked
                  ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                  : 'text-slate-900 border-slate-300'
              }`}
            />
          </div>

          {/* Rango de Fechas: Inicio (2.5 cols) */}
          <div className="md:col-span-2 space-y-1">
            <label className="block font-semibold text-slate-700 text-[11px] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Fecha Inicio:</span>
            </label>
            <input
              type="date"
              disabled={isCampaignLocked}
              value={activeCampaign.startDate}
              onChange={(e) => onUpdateActiveCampaign({ startDate: e.target.value })}
              className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 ${
                isCampaignLocked
                  ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                  : 'text-slate-800 border-slate-300'
              }`}
            />
          </div>

          {/* Rango de Fechas: Término (2.5 cols) */}
          <div className="md:col-span-3 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700 text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Fecha Término:</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                {totalDays} {totalDays === 1 ? 'día' : 'días'}
              </span>
            </div>
            <input
              type="date"
              disabled={isCampaignLocked}
              value={activeCampaign.endDate}
              onChange={(e) => onUpdateActiveCampaign({ endDate: e.target.value })}
              className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 ${
                isCampaignLocked
                  ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                  : 'text-slate-800 border-slate-300'
              }`}
            />
          </div>
        </div>

        {/* Accidental deletion protection notice */}
        {isCampaignLocked && (
          <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Campaña Protegida:</strong> Los botones de borrar datos y eliminar campaña están bloqueados para evitar pérdidas accidentales. Para hacer cambios, presione <em>"Desbloquear Campaña"</em>.
            </span>
          </div>
        )}
      </div>

      {/* Modal: AGREGAR NUEVA CAMPAÑA */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <FolderPlus className="w-5 h-5 text-emerald-700" />
                <h4 className="text-sm font-bold">Agregar Nueva Campaña de Muestreo</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCampaignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Muestreo / Campaña <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  placeholder="Ej: Campaña 2 - Monitoreo Otoño Salar Grande 2026"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio:</label>
                  <input
                    type="date"
                    required
                    value={newCampStart}
                    onChange={(e) => setNewCampStart(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Término:</label>
                  <input
                    type="date"
                    required
                    value={newCampEnd}
                    onChange={(e) => setNewCampEnd(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  N° de Muestreos Objetivo:
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={newCampTarget}
                  onChange={(e) => setNewCampTarget(parseInt(e.target.value, 10) || 30)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewCampaignModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Crear e Iniciar Campaña</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: ELIMINAR CAMPAÑA CON MENSAJE DE CONFIRMACIÓN */}
      {showDeleteCampaignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Eliminar campaña y borrar todos los datos?
              </h4>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-rose-50 p-3 rounded-lg border border-rose-200">
              <p className="font-semibold text-rose-950">
                Campaña a eliminar: <em>{activeCampaign.name}</em>
              </p>
              <p>
                Esta acción eliminará de forma irreversible la campaña y <strong>borrará todos los {currentPoints} registros de muestreo y fotografías asociadas</strong> a esta campaña.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteCampaignModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteCampaignModal(false);
                  onDeleteCampaign(activeCampaign.id);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, Confirmar y Eliminar Campaña</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: BORRAR TODOS LOS DATOS CON CONFIRMACIÓN */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">¿Borrar todos los datos de muestreo?</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Esta acción eliminará todos los puntos y fotografías registrados en el sistema, permitiendo iniciar un nuevo conjunto de muestreos completamente en blanco.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirm(false);
                  if (onClearAllRecords) onClearAllRecords();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-sm"
              >
                Sí, Borrar Todos los Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
