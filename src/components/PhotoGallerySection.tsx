import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Edit3, Check, Trash2, ExternalLink, Plus } from 'lucide-react';
import { SamplingRecord, PhotoDetail } from '../types/sampling';
import { getSpeciesPlaceholder } from '../data/fallbackSpeciesImages';

interface PhotoGallerySectionProps {
  records: SamplingRecord[];
  onUpdatePhotoDescription?: (recordId: number, photoIndex: number, newDescription: string) => void;
  onDeletePhoto?: (recordId: number, photoIndex: number) => void;
  onViewPhoto: (photoSrc: string, title: string) => void;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({
  records,
  onUpdatePhotoDescription,
  onDeletePhoto,
  onViewPhoto
}) => {
  // Extract all photos with metadata from records
  const allPhotos: {
    recordId: number;
    pointCode: string;
    species: string;
    scientific: string;
    category: string;
    date: string;
    photoIndex: number;
    url: string;
    description: string;
  }[] = [];

  records.forEach((rec) => {
    // If record has photoDetails
    if (rec.photoDetails && rec.photoDetails.length > 0) {
      rec.photoDetails.forEach((pd, idx) => {
        allPhotos.push({
          recordId: rec.id,
          pointCode: rec.pointCode,
          species: rec.commonName,
          scientific: rec.scientificName,
          category: rec.category,
          date: rec.datetime,
          photoIndex: idx,
          url: pd.url,
          description: pd.description || `Fotografía de registro en ${rec.pointCode} (${rec.commonName})`
        });
      });
    } else if (rec.photos && rec.photos.length > 0) {
      rec.photos.forEach((url, idx) => {
        allPhotos.push({
          recordId: rec.id,
          pointCode: rec.pointCode,
          species: rec.commonName,
          scientific: rec.scientificName,
          category: rec.category,
          date: rec.datetime,
          photoIndex: idx,
          url,
          description: `Registro fotográfico en terreno - Punto ${rec.pointCode}: ${rec.commonName}`
        });
      });
    }
  });

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredPhotos = filterCategory === 'ALL'
    ? allPhotos
    : allPhotos.filter((p) => p.category === filterCategory);

  const startEdit = (key: string, currentDesc: string) => {
    setEditingKey(key);
    setEditText(currentDesc);
  };

  const saveEdit = (recordId: number, photoIndex: number) => {
    if (onUpdatePhotoDescription) {
      onUpdatePhotoDescription(recordId, photoIndex, editText);
    }
    setEditingKey(null);
  };

  return (
    <section id="fotos" className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm card-box space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Registro y Galería Fotográfica de Campo</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                {allPhotos.length} {allPhotos.length === 1 ? 'Foto' : 'Fotos'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Evidencias fotográficas georreferenciadas con descripciones técnicas (incluidas en el informe impreso)
            </p>
          </div>
        </div>

        {/* Filter by Category */}
        <div className="flex items-center gap-1.5 no-print text-xs">
          <span className="text-slate-500 font-medium">Filtrar:</span>
          {['ALL', 'Aves', 'Mamíferos', 'Reptiles', 'Flora'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                filterCategory === cat
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Photos with Descriptions */}
      {filteredPhotos.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-600">No hay fotografías registradas aún en esta categoría</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Al registrar un punto de muestreo en el formulario, adjunte fotografías y escriba una descripción. Se guardarán aquí y en el informe oficial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const itemKey = `${photo.recordId}-${photo.photoIndex}`;
            const isEditing = editingKey === itemKey;

            return (
              <div
                key={itemKey}
                className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                {/* Image preview with click to zoom */}
                <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.pointCode}
                    loading="eager"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const fallback = getSpeciesPlaceholder(photo.scientific, photo.species);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() =>
                      onViewPhoto(
                        photo.url,
                        `${photo.pointCode}: ${photo.species} (${photo.scientific})`
                      )
                    }
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                    {photo.pointCode}
                  </div>
                  <div className="absolute top-2 right-2 bg-emerald-800/90 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">
                    {photo.category}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onViewPhoto(
                        photo.url,
                        `${photo.pointCode}: ${photo.species} (${photo.scientific})`
                      )
                    }
                    className="absolute bottom-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1 rounded transition opacity-0 group-hover:opacity-100"
                    title="Ver en pantalla completa"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Metadata & Description */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-bold text-xs text-slate-800 truncate" title={photo.species}>
                        {photo.species}
                      </span>
                    </div>
                    <span className="text-[10px] italic text-slate-500 block truncate">
                      {photo.scientific}
                    </span>
                  </div>

                  {/* Photo Description with In-place Edit */}
                  <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-700 flex-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Descripción de la Evidencia:
                    </span>
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={2}
                          className="w-full text-xs p-1.5 border border-emerald-400 rounded focus:ring-1 focus:ring-emerald-500"
                          placeholder="Escriba descripción..."
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(photo.recordId, photo.photoIndex)}
                            className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>Guardar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-1 group/desc">
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {photo.description}
                        </p>
                        {onUpdatePhotoDescription && (
                          <button
                            type="button"
                            onClick={() => startEdit(itemKey, photo.description)}
                            className="text-slate-400 hover:text-emerald-700 p-0.5 shrink-0 transition opacity-80 group-hover/desc:opacity-100"
                            title="Editar descripción"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer date & delete */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>{photo.date ? photo.date.replace('T', ' ') : 'Sin fecha'}</span>
                    {onDeletePhoto && (
                      <button
                        type="button"
                        onClick={() => onDeletePhoto(photo.recordId, photo.photoIndex)}
                        className="text-red-400 hover:text-red-700 transition"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
