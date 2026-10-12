import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface PhotoModalProps {
  isOpen: boolean;
  photoSrc: string | null;
  title: string;
  onClose: () => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  photoSrc,
  title,
  onClose
}) => {
  if (!isOpen || !photoSrc) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold truncate max-w-sm">{title}</h4>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Container */}
        <div className="p-3 bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
          <img
            src={photoSrc}
            alt={title}
            className="max-h-[65vh] w-auto max-w-full object-contain rounded"
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
          <span>Registro fotográfico de terreno</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
