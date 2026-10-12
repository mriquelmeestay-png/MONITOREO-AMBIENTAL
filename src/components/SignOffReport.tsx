import React, { useState } from 'react';
import { FileSignature, ShieldCheck, Calendar, Download } from 'lucide-react';

interface SignOffReportProps {
  specialistName?: string;
  onSpecialistNameChange?: (name: string) => void;
  onOpenPrintModal?: () => void;
}

export const SignOffReport: React.FC<SignOffReportProps> = ({
  specialistName,
  onSpecialistNameChange,
  onOpenPrintModal
}) => {
  const [internalName, setInternalName] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const currentOfficer = specialistName !== undefined ? specialistName : internalName;
  const handleNameChange = (name: string) => {
    if (onSpecialistNameChange) {
      onSpecialistNameChange(name);
    } else {
      setInternalName(name);
    }
  };

  return (
    <section id="informe" className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm card-box space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
            <FileSignature className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Responsabilidad Técnica y Validaciones del Informe Ambiental
            </h3>
            <p className="text-xs text-slate-500">
              Firma del especialista y recepción técnica según Guías Metodológicas del SEIA Chile
            </p>
          </div>
        </div>

        {onOpenPrintModal && (
          <button
            onClick={onOpenPrintModal}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-sm active:scale-95 no-print"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Informe Técnico PDF</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Left: Officer Signature */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1">
              Especialista / Profesional Responsable de Campo:
            </label>
            <input
              type="text"
              value={currentOfficer}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Escriba manualmente el nombre y cargo del especialista..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Ingreso manual (no automático). Debe escribir el nombre del profesional a cargo.
            </p>
          </div>

          <div className="pt-6 text-center border-t border-dashed border-slate-300 mt-4">
            <p className="text-xs font-bold text-slate-900 font-mono">
              {currentOfficer.trim() || '_______________________________'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Firma del Profesional Responsable</p>
            <p className="text-[10px] text-emerald-700 mt-1 font-semibold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verificación de Integridad de Datos en Terreno</span>
            </p>
          </div>
        </div>

        {/* Right: Mining Company & Delivery Date */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Fecha de Entrega Oficial del Informe:</span>
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-6 text-center border-t border-dashed border-slate-300 mt-4">
            <p className="text-xs font-bold text-slate-900">Compañía Minera Cordillera SCM</p>
            <p className="text-[11px] text-slate-500 font-medium">
              Gerencia de Medio Ambiente y Sustentabilidad
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Aprobación y Recepción Técnica Línea de Base EIA
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
