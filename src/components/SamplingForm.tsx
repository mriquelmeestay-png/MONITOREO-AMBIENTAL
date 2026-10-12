import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Crosshair,
  Camera,
  FolderOpen,
  X,
  Egg,
  Save,
  RotateCcw,
  CheckCircle2,
  User,
  ArrowRight,
  Lock,
  Plus,
  Sprout
} from 'lucide-react';
import {
  SamplingRecord,
  CategoryType,
  NestInfo,
  PhotoDetail,
  FloraHabit,
  FloraCondition,
  FloraStage,
  CoordinateFormat
} from '../types/sampling';
import { TAXONOMY_DB } from '../data/taxonomy';
import {
  latLngToUTM,
  utmToLatLng,
  getCurrentDateTimeLocal
} from '../utils/geoUtils';
import { incrementPointCode } from '../utils/codeUtils';
import { compressImageFile } from '../utils/imageUtils';

interface SamplingFormProps {
  initialRecord: SamplingRecord | null;
  onSaveRecord: (record: Omit<SamplingRecord, 'id'>, editId?: number) => void;
  onCancelEdit: () => void;
  nextPointCode: string;
  nextFixedPointNum?: string;
  externalCoords: { lat: number; lng: number } | null;
  defaultObserver?: string;
  onObserverChange?: (name: string) => void;
  targetPoints?: number;
  currentPoints?: number;
  onIncreaseTarget?: () => void;
  campaignName?: string;
  campaignStartDate?: string;
  campaignEndDate?: string;
  isCampaignLocked?: boolean;
  coordFormat?: CoordinateFormat;
}

export const SamplingForm: React.FC<SamplingFormProps> = ({
  initialRecord,
  onSaveRecord,
  onCancelEdit,
  nextPointCode,
  nextFixedPointNum,
  externalCoords,
  defaultObserver = '',
  onObserverChange,
  targetPoints,
  currentPoints,
  onIncreaseTarget,
  campaignName,
  campaignStartDate,
  campaignEndDate,
  isCampaignLocked = false,
  coordFormat = 'decimal'
}) => {
  // Manual point code input (with auto-advancing logic from manual value)
  const [pointCodeInput, setPointCodeInput] = useState<string>(nextPointCode);

  useEffect(() => {
    if (initialRecord) {
      setPointCodeInput(initialRecord.pointCode);
    } else if (!pointCodeInput || pointCodeInput === '') {
      setPointCodeInput(nextPointCode);
    }
  }, [initialRecord, nextPointCode]);

  // Basic point metadata
  const [pointType, setPointType] = useState<'Punto Nuevo' | 'Punto Fijo'>('Punto Nuevo');
  const [fixedPointNum, setFixedPointNum] = useState<string>('');
  const [category, setCategory] = useState<CategoryType>('Aves');

  // Taxonomy
  const [commonName, setCommonName] = useState<string>('');
  const [scientificName, setScientificName] = useState<string>('');
  const [order, setOrder] = useState<string>('');
  const [family, setFamily] = useState<string>('');
  const [conservationStatus, setConservationStatus] = useState<string>('');

  // Fauna Demography (for Aves, Mamíferos, Reptiles)
  const [sex, setSex] = useState<'Macho' | 'Hembra' | 'Indeterminado / No aplica'>('Indeterminado / No aplica');
  const [stage, setStage] = useState<string>('Adulto');

  // Flora Specific Parameters (Habit, Size, Vital Condition, Stage)
  const [floraHabit, setFloraHabit] = useState<FloraHabit>('Arbusto');
  const [floraHeightM, setFloraHeightM] = useState<string>('');
  const [floraCircumferenceM, setFloraCircumferenceM] = useState<string>('');
  const [floraCondition, setFloraCondition] = useState<FloraCondition>('Vivo');
  const [floraStage, setFloraStage] = useState<FloraStage>('En desarrollo');

  // Coordinates
  const [lat, setLat] = useState<number | ''>(-20.9500);
  const [lng, setLng] = useState<number | ''>(-69.8100);
  const [utmZone, setUtmZone] = useState<string>('19S');
  const [utmEasting, setUtmEasting] = useState<number | ''>(415809);
  const [utmNorthing, setUtmNorthing] = useState<number | ''>(7683050);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Date and Campaign
  const [datetime, setDatetime] = useState<string>(getCurrentDateTimeLocal());
  const [campaign, setCampaign] = useState<'Campaña 1' | 'Campaña 2' | 'Campaña 3' | 'Campaña 4'>('Campaña 1');
  const [method, setMethod] = useState<any>('Prospección Visual');
  const [abundance, setAbundance] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [observer, setObserver] = useState<string>(defaultObserver);
  const [rememberObserver, setRememberObserver] = useState<boolean>(true);

  // Nesting (for Aves)
  const [nestStatus, setNestStatus] = useState<NestInfo['status']>('Sin Nido / No aplica');
  const [nestContent, setNestContent] = useState<NestInfo['content']>('Sin Registro / N/A');
  const [observableNests, setObservableNests] = useState<number>(0);
  const [nestDistanceM, setNestDistanceM] = useState<number>(0);
  const [eggsCount, setEggsCount] = useState<number>(0);
  const [chicksAlive, setChicksAlive] = useState<number>(0);
  const [chicksDead, setChicksDead] = useState<number>(0);

  // Detailed photo items with descriptions and compressed URLs
  const [photoItems, setPhotoItems] = useState<{ id: string; url: string; description: string }[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  // Toast feedback
  const [savedToast, setSavedToast] = useState<{ title: string; message: string } | null>(null);

  // Last saved station coordinates
  const [lastSavedPoint, setLastSavedPoint] = useState<{
    pointCode: string;
    lat: number;
    lng: number;
    utmZone: string;
    utmEasting: number;
    utmNorthing: number;
  } | null>(null);

  // Synchronize when initialRecord is set
  useEffect(() => {
    if (initialRecord) {
      setPointType(initialRecord.pointType);
      setFixedPointNum(initialRecord.fixedPointNum || '');
      setCategory(initialRecord.category);
      setCommonName(initialRecord.commonName);
      setScientificName(initialRecord.scientificName);
      setOrder(initialRecord.order || '');
      setFamily(initialRecord.family || '');
      setConservationStatus(initialRecord.status);
      setSex(initialRecord.sex || 'Indeterminado / No aplica');
      setStage(initialRecord.stage || 'Adulto');

      // Flora fields
      if (initialRecord.floraHabit) setFloraHabit(initialRecord.floraHabit);
      if (initialRecord.floraHeightM !== undefined) setFloraHeightM(String(initialRecord.floraHeightM));
      if (initialRecord.floraCircumferenceM !== undefined) setFloraCircumferenceM(String(initialRecord.floraCircumferenceM));
      if (initialRecord.floraCondition) setFloraCondition(initialRecord.floraCondition);
      if (initialRecord.floraStage) setFloraStage(initialRecord.floraStage);

      setLat(initialRecord.lat);
      setLng(initialRecord.lng);
      setUtmZone(initialRecord.utmZone);
      setUtmEasting(initialRecord.utmEasting);
      setUtmNorthing(initialRecord.utmNorthing);
      setDatetime(initialRecord.datetime);
      setCampaign(initialRecord.campaign as any);
      setMethod(initialRecord.method);
      setAbundance(initialRecord.abundance);
      setNotes(initialRecord.notes || '');
      setObserver(initialRecord.observer || defaultObserver || '');

      if (initialRecord.photoDetails && initialRecord.photoDetails.length > 0) {
        setPhotoItems(
          initialRecord.photoDetails.map((pd, i) => ({
            id: pd.id || `photo-${i}-${Date.now()}`,
            url: pd.url,
            description: pd.description || ''
          }))
        );
        setPhotos(initialRecord.photoDetails.map((pd) => pd.url));
      } else if (initialRecord.photos && initialRecord.photos.length > 0) {
        setPhotoItems(
          initialRecord.photos.map((u, i) => ({
            id: `photo-${i}-${Date.now()}`,
            url: u,
            description: ''
          }))
        );
        setPhotos([...initialRecord.photos]);
      } else {
        setPhotoItems([]);
        setPhotos([]);
      }

      if (initialRecord.nestInfo) {
        setNestStatus(initialRecord.nestInfo.status);
        setNestContent(initialRecord.nestInfo.content);
        setObservableNests(initialRecord.nestInfo.observableCount);
        setNestDistanceM(initialRecord.nestInfo.distanceM);
        setEggsCount(initialRecord.nestInfo.eggsCount);
        setChicksAlive(initialRecord.nestInfo.chicksAlive);
        setChicksDead(initialRecord.nestInfo.chicksDead);
      }
    }
  }, [initialRecord]);

  // When external coords received from Map click
  useEffect(() => {
    if (externalCoords) {
      handleLatLngChange(externalCoords.lat, externalCoords.lng);
    }
  }, [externalCoords]);

  // Handle Category Change
  const handleCategoryChange = (newCat: CategoryType) => {
    setCategory(newCat);
    setCommonName('');
    setScientificName('');
    setOrder('');
    setFamily('');
    setConservationStatus('');
    if (newCat === 'Aves') {
      setStage('Adulto');
    } else if (newCat === 'Flora') {
      setFloraHabit('Arbusto');
      setFloraCondition('Vivo');
      setFloraStage('En desarrollo');
    }
  };

  // Handle Species Common Name Change
  const handleCommonNameChange = (newCommon: string) => {
    setCommonName(newCommon);
    if (!newCommon) {
      setScientificName('');
      setOrder('');
      setFamily('');
      setConservationStatus('');
      return;
    }

    const speciesList = TAXONOMY_DB[category];
    if (speciesList) {
      const found = speciesList.find((s) => s.common === newCommon);
      if (found) {
        setScientificName(found.scientific);
        setOrder(found.order);
        setFamily(found.family);
        setConservationStatus(found.status);
      }
    }
  };

  // Bidirectional Coordinate Handlers
  const handleLatLngChange = (newLatVal: number | '', newLngVal: number | '') => {
    setLat(newLatVal);
    setLng(newLngVal);
    if (
      typeof newLatVal === 'number' &&
      !isNaN(newLatVal) &&
      typeof newLngVal === 'number' &&
      !isNaN(newLngVal) &&
      newLatVal !== 0 &&
      newLngVal !== 0
    ) {
      const utm = latLngToUTM(newLatVal, newLngVal);
      setUtmZone(utm.zone);
      setUtmEasting(utm.easting);
      setUtmNorthing(utm.northing);
    } else {
      setUtmEasting('');
      setUtmNorthing('');
    }
  };

  const handleUTMChange = (newEastVal: number | '', newNorthVal: number | '', newZone: string) => {
    setUtmEasting(newEastVal);
    setUtmNorthing(newNorthVal);
    setUtmZone(newZone);
    if (
      typeof newEastVal === 'number' &&
      !isNaN(newEastVal) &&
      typeof newNorthVal === 'number' &&
      !isNaN(newNorthVal) &&
      newZone
    ) {
      const res = utmToLatLng(newEastVal, newNorthVal, newZone);
      if (res) {
        setLat(res.lat);
        setLng(res.lng);
      }
    } else {
      setLat('');
      setLng('');
    }
  };

  // Geolocation button
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por su navegador.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pLat = parseFloat(pos.coords.latitude.toFixed(6));
        const pLng = parseFloat(pos.coords.longitude.toFixed(6));
        handleLatLngChange(pLat, pLng);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setDatetime(getCurrentDateTimeLocal());
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert(`Error al obtener ubicación GPS: ${err.message}. Verifique permisos de ubicación.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Photos upload & camera with compression
  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    for (const file of fileList) {
      try {
        const compressed = await compressImageFile(file, 1024, 1024, 0.82);
        const newItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: compressed,
          description: ''
        };
        setPhotoItems((prev) => [...prev, newItem]);
        setPhotos((prev) => [...prev, compressed]);
      } catch (err) {
        console.error('Error cargando fotografía:', err);
      }
    }
  };

  const removePhoto = (idx: number) => {
    setPhotoItems((prev) => prev.filter((_, i) => i !== idx));
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePhotoDescription = (idx: number, desc: string) => {
    setPhotoItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, description: desc } : item))
    );
  };

  // Reset form completely for the next point (Clears ALL fields)
  const resetFormForNextPoint = (advCode?: string) => {
    if (advCode) {
      setPointCodeInput(advCode);
    } else {
      setPointCodeInput(nextPointCode);
    }
    setPointType('Punto Nuevo');
    setFixedPointNum('');
    setCategory('Aves');
    setCommonName('');
    setScientificName('');
    setOrder('');
    setFamily('');
    setConservationStatus('');
    setSex('Indeterminado / No aplica');
    setStage('Adulto');
    // Flora fields reset
    setFloraHabit('Arbusto');
    setFloraHeightM('');
    setFloraCircumferenceM('');
    setFloraCondition('Vivo');
    setFloraStage('En desarrollo');
    setAbundance(1);
    setNotes('');
    setPhotos([]);
    setPhotoItems([]);
    setGpsAccuracy(null);
    setDatetime(getCurrentDateTimeLocal());
    setNestStatus('Sin Nido / No aplica');
    setNestContent('Sin Registro / N/A');
    setObservableNests(0);
    setNestDistanceM(0);
    setEggsCount(0);
    setChicksAlive(0);
    setChicksDead(0);
    setLat('');
    setLng('');
    setUtmEasting('');
    setUtmNorthing('');
    setUtmZone('19S');

    if (!rememberObserver) {
      setObserver('');
      if (onObserverChange) onObserverChange('');
    }
  };

  // Check if target number of samplings is reached for new records
  const isLimitReached = Boolean(
    !initialRecord &&
    targetPoints !== undefined &&
    currentPoints !== undefined &&
    currentPoints >= targetPoints
  );

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCampaignLocked) {
      alert('Campaña bloqueada: Desbloquee la campaña en el panel superior para realizar registros o modificaciones.');
      return;
    }

    if (isLimitReached) {
      alert(
        `Registro bloqueado: Se ha alcanzado el N° de Muestreos establecido (${currentPoints} de ${targetPoints}). Para continuar ingresando nuevos puntos, aumente el N° de Muestreos en la sección de planificación.`
      );
      return;
    }

    if (lat === '' || lng === '' || isNaN(Number(lat)) || isNaN(Number(lng))) {
      alert(
        'Por favor capture o ingrese las coordenadas del punto de muestreo (use el botón "GPS Celular", haga clic en el mapa o escriba las coordenadas).'
      );
      return;
    }

    const numLat = Number(lat);
    const numLng = Number(lng);
    const utm = latLngToUTM(numLat, numLng);
    const utmFormatted = `Zona ${utm.zone} | E: ${utm.easting} | N: ${utm.northing}`;

    const nestInfo: NestInfo = {
      status: nestStatus,
      content: nestContent,
      observableCount: Number(observableNests) || 0,
      distanceM: Number(nestDistanceM) || 0,
      eggsCount: Number(eggsCount) || 0,
      chicksAlive: Number(chicksAlive) || 0,
      chicksDead: Number(chicksDead) || 0
    };

    const savedPointCode = pointCodeInput.trim() || nextPointCode;

    const photoDetailsData: PhotoDetail[] = photoItems.map((p) => ({
      id: p.id,
      url: p.url,
      description: p.description.trim() || `Registro fotográfico en terreno - ${savedPointCode} (${commonName || 'Muestra'})`,
      pointCode: savedPointCode,
      speciesName: commonName,
      timestamp: datetime
    }));

    const recordData: Omit<SamplingRecord, 'id'> = {
      pointCode: savedPointCode,
      pointType,
      fixedPointNum: pointType === 'Punto Fijo' ? fixedPointNum : undefined,
      category,
      commonName: commonName || 'Registro de Campo',
      scientificName: scientificName || 'Indeterminado',
      order: order || '-',
      family: family || '-',
      sex: category === 'Flora' ? undefined : sex,
      stage: category === 'Flora' ? floraStage : stage,
      // Flora specific parameters
      floraHabit: category === 'Flora' ? floraHabit : undefined,
      floraHeightM: category === 'Flora' && floraHeightM ? Number(floraHeightM) : undefined,
      floraCircumferenceM: category === 'Flora' && floraCircumferenceM ? Number(floraCircumferenceM) : undefined,
      floraCondition: category === 'Flora' ? floraCondition : undefined,
      floraStage: category === 'Flora' ? floraStage : undefined,
      lat: numLat,
      lng: numLng,
      utmZone: utm.zone,
      utmEasting: utm.easting,
      utmNorthing: utm.northing,
      utmFormatted,
      datetime,
      campaign: campaignName || campaign,
      campaignStartDate,
      campaignEndDate,
      method,
      abundance: Number(abundance) || 1,
      status: (conservationStatus as any) || 'Preocupación Menor (LC)',
      nestInfo: category === 'Aves' ? nestInfo : undefined,
      photos: photoItems.map((p) => p.url),
      photoDetails: photoDetailsData,
      notes,
      observer,
      synced: true,
      syncTimestamp: new Date().toISOString()
    };

    // Keep coordinates of the saved point for convenient quick reuse
    setLastSavedPoint({
      pointCode: savedPointCode,
      lat: numLat,
      lng: numLng,
      utmZone: utm.zone,
      utmEasting: utm.easting,
      utmNorthing: utm.northing
    });

    onSaveRecord(recordData, initialRecord ? initialRecord.id : undefined);

    // Auto-advance point code from the entered value (+1)
    const nextAdvCode = incrementPointCode(savedPointCode);
    resetFormForNextPoint(nextAdvCode);

    if (initialRecord) {
      onCancelEdit();
      setSavedToast({
        title: `Punto ${savedPointCode} actualizado con éxito.`,
        message: 'El formulario quedó restablecido para el siguiente punto.'
      });
    } else {
      setSavedToast({
        title: `Punto ${savedPointCode} guardado exitosamente.`,
        message: `Se borraron los datos del formulario y se avanzó automáticamente a ${nextAdvCode}.`
      });
    }
  };

  const isEditing = !!initialRecord;

  return (
    <div id="formulario" className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm no-print">
      {/* Save Toast Notification */}
      {savedToast && (
        <div className="mb-3.5 p-3 bg-emerald-50 border border-emerald-400 rounded-lg text-xs text-emerald-950 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">{savedToast.title}</span>
              <span className="ml-1 text-emerald-800">{savedToast.message}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSavedToast(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${
              isEditing ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                {isEditing ? `Modificando ${initialRecord.pointCode}` : 'Nuevo Registro de Muestreo'}
              </h2>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Punto: {isEditing ? initialRecord.pointCode : pointCodeInput || nextPointCode}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Carga en tiempo real y registro georreferenciado WGS84 UTM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* BOTÓN BORRAR DATOS */}
          <button
            type="button"
            onClick={() => {
              resetFormForNextPoint();
              if (isEditing) onCancelEdit();
              setSavedToast({
                title: 'Datos del Formulario Borrados',
                message: 'Se han limpiado todos los campos para iniciar un registro nuevo en blanco.'
              });
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded transition cursor-pointer"
            title="Borrar todos los datos del formulario e iniciar un punto en blanco"
          >
            <RotateCcw className="w-3 h-3 text-rose-600" />
            <span>Borrar Datos</span>
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                resetFormForNextPoint();
                onCancelEdit();
              }}
              className="flex items-center gap-1 text-[11px] font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded transition cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Cancelar Edición</span>
            </button>
          )}
        </div>
      </div>

      {/* Locked Campaign Banner */}
      {isCampaignLocked && (
        <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-400 rounded-xl text-amber-950 shadow-sm flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="text-xs">
            <strong>Campaña Bloqueada para Protección de Datos:</strong> Para ingresar o editar registros, desbloquee la campaña en el panel de planificación superior.
          </p>
        </div>
      )}

      {/* Locked Registration Alert Banner if N° de Muestreos is reached */}
      {isLimitReached && (
        <div className="mb-4 p-3.5 bg-amber-50 border-2 border-amber-400 rounded-xl text-amber-950 shadow-sm animate-in fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-amber-200 text-amber-900 rounded-lg shrink-0 mt-0.5">
              <Lock className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs uppercase tracking-wide text-amber-900">
                  Registro Bloqueado
                </span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                  {currentPoints} / {targetPoints} Muestreos
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-snug">
                Se ha alcanzado el <strong>N° de Muestreos ({targetPoints})</strong> seleccionado. Para desbloquear el registro y continuar guardando nuevos puntos, debe aumentar el N° de Muestreos.
              </p>
            </div>
          </div>

          {onIncreaseTarget && (
            <button
              type="button"
              onClick={onIncreaseTarget}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Aumentar N° de Muestreos (+1)</span>
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Row 1: Code & Point Type */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">Código de Registro</label>
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                  <span>Avanza auto (+1)</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
              <input
                type="text"
                value={pointCodeInput}
                onChange={(e) => setPointCodeInput(e.target.value)}
                placeholder={nextPointCode || 'Ej: P-001'}
                required
                className="w-full bg-white border border-emerald-400 focus:border-emerald-600 rounded-md p-1.5 font-mono font-bold text-emerald-950 text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Ingreso manual permitido; avanzará automáticamente al siguiente (+1) desde el valor ingresado.
              </p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo de Punto <span className="text-red-500">*</span>
              </label>
              <select
                value={pointType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setPointType(val);
                  if (val === 'Punto Fijo' && !fixedPointNum && nextFixedPointNum) {
                    setFixedPointNum(nextFixedPointNum);
                  }
                }}
                required
                className="w-full bg-white border border-slate-300 rounded-md p-1.5 font-medium text-slate-800"
              >
                <option value="Punto Nuevo">Punto Nuevo</option>
                <option value="Punto Fijo">Punto Fijo (Permanente)</option>
              </select>
            </div>
          </div>

          {pointType === 'Punto Fijo' && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-emerald-900">
                  Identificador de Punto Fijo <span className="text-red-500">*</span>
                </label>
                {nextFixedPointNum && (
                  <span className="text-[10px] text-slate-500">
                    Sugerido: <span className="font-mono font-bold text-emerald-700">{nextFixedPointNum}</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                value={fixedPointNum}
                onChange={(e) => setFixedPointNum(e.target.value)}
                placeholder={nextFixedPointNum || 'Ej: PF-01, PF-EST-04'}
                required
                className="w-full bg-white border border-emerald-300 rounded-md p-1.5 font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Row 2: Category & Taxonomic Data (Físicoquímico Eliminado) */}
        <div className="space-y-2.5">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Categoría de Estudio <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as CategoryType)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Aves">Aves (Fauna Alada & Nidificación)</option>
              <option value="Mamíferos">Mamíferos (Fauna Terrestre)</option>
              <option value="Reptiles">Reptiles (Herpetofauna)</option>
              <option value="Flora">Flora & Vegetación</option>
            </select>
          </div>

          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre Común <span className="text-red-500">*</span>
              </label>
              <select
                value={commonName}
                onChange={(e) => handleCommonNameChange(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-md p-2 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Seleccione Especie --</option>
                {TAXONOMY_DB[category]?.map((sp) => (
                  <option key={sp.common} value={sp.common}>
                    {sp.common}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre Científico (Autocompletado)
              </label>
              <input
                type="text"
                readOnly
                value={scientificName}
                placeholder="Se completa al seleccionar especie..."
                className="w-full bg-slate-100 border border-slate-300 rounded-md p-1.5 italic font-semibold text-emerald-900 cursor-not-allowed placeholder:font-normal placeholder:not-italic placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Orden</label>
                <input
                  type="text"
                  readOnly
                  value={order}
                  placeholder="-"
                  className="w-full bg-slate-100 border border-slate-300 rounded p-1 text-slate-700 cursor-not-allowed font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Familia</label>
                <input
                  type="text"
                  readOnly
                  value={family}
                  placeholder="-"
                  className="w-full bg-slate-100 border border-slate-300 rounded p-1 text-slate-700 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                Estado de Conservación (RCE / UICN)
              </label>
              <input
                type="text"
                readOnly
                value={conservationStatus}
                placeholder="-"
                className="w-full bg-slate-100 border border-slate-300 rounded p-1 text-emerald-800 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Demography (FAUNA vs FLORA) */}
        {category === 'Flora' ? (
          /* ESTRUCTURA ESPECÍFICA PARA FLORA: Sin sexo, con Árbol/Arbusto/Pastizal, tamaño, estado y etapa fenológica */
          <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 space-y-2.5">
            <span className="font-bold text-emerald-900 block text-xs flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-700" />
              <span>Estructura y Parámetros Biométricos de Flora</span>
            </span>

            {/* Hábito / Tipo de Planta */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-700 font-semibold mb-0.5">
                  Tipo / Hábito de la Flora <span className="text-red-500">*</span>
                </label>
                <select
                  value={floraHabit}
                  onChange={(e) => setFloraHabit(e.target.value as FloraHabit)}
                  className="w-full bg-white border border-emerald-300 rounded p-1.5 text-xs font-semibold text-emerald-950"
                >
                  <option value="Árbol">Árbol</option>
                  <option value="Arbusto">Arbusto</option>
                  <option value="Pastizal">Pastizal</option>
                  <option value="Cactácea / Suculenta">Cactácea / Suculenta</option>
                  <option value="Hierba / Cojín">Hierba / Cojín</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-700 font-semibold mb-0.5">
                  Estado / Condición Vital <span className="text-red-500">*</span>
                </label>
                <select
                  value={floraCondition}
                  onChange={(e) => setFloraCondition(e.target.value as FloraCondition)}
                  className="w-full bg-white border border-emerald-300 rounded p-1.5 text-xs font-semibold text-emerald-950"
                >
                  <option value="Vivo">Vivo</option>
                  <option value="Seco">Seco</option>
                  <option value="Destruido">Destruido</option>
                </select>
              </div>
            </div>

            {/* Tamaño en Metros: Altura y Circunferencia */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200">
              <div>
                <label className="block text-[10px] text-slate-700 font-semibold mb-0.5">
                  Altura (metros):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={floraHeightM}
                  onChange={(e) => setFloraHeightM(e.target.value)}
                  placeholder="Ej: 1.25 m"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-700 font-semibold mb-0.5">
                  Circunferencia (metros):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={floraCircumferenceM}
                  onChange={(e) => setFloraCircumferenceM(e.target.value)}
                  placeholder="Ej: 0.45 m (DAP/copa)"
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Etapa Fenológica para Flora */}
            <div className="pt-1 border-t border-emerald-200">
              <label className="block text-[10px] text-slate-700 font-semibold mb-0.5">
                Etapa Fenológica <span className="text-red-500">*</span>
              </label>
              <select
                value={floraStage}
                onChange={(e) => setFloraStage(e.target.value as FloraStage)}
                className="w-full bg-white border border-emerald-300 rounded p-1.5 text-xs font-semibold text-emerald-950"
              >
                <option value="En floración">En floración</option>
                <option value="Con frutos">Con frutos</option>
                <option value="Invernando">Invernando</option>
                <option value="En desarrollo">En desarrollo</option>
              </select>
            </div>
          </div>
        ) : (
          /* ESTRUCTURA PARA FAUNA (Aves, Mamíferos, Reptiles): con Sexo y Etapa/Edad (incluye "Huevo" en Aves) */
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-700 block mb-1.5 text-xs">
              Estructura Poblacional / Demografía
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Sexo</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded p-1 text-xs"
                >
                  <option value="Indeterminado / No aplica">Indeterminado / No aplica</option>
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Etapa / Edad</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded p-1 text-xs font-semibold text-slate-800"
                >
                  <option value="Adulto">Adulto</option>
                  <option value="Subadulto">Subadulto</option>
                  <option value="Juvenil">Juvenil</option>
                  <option value="Cría / Polluelo">Cría / Polluelo</option>
                  {category === 'Aves' && (
                    <option value="Huevo">Huevo (Postura / Nidada)</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Row 4: Georeferencing Bidirectional (Decimal <-> UTM) */}
        <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-1.5">
            <span className="font-semibold text-emerald-950 flex items-center gap-1 text-xs">
              <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
              <span>Georreferenciación Bidireccional</span>
            </span>

            <div className="flex items-center gap-2">
              {lastSavedPoint && (
                <button
                  type="button"
                  onClick={() => {
                    handleLatLngChange(lastSavedPoint.lat, lastSavedPoint.lng);
                  }}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title={`Reutilizar coordenadas de ${lastSavedPoint.pointCode}`}
                >
                  <MapPin className="w-3 h-3 text-emerald-700" />
                  <span>Misma ubicación de {lastSavedPoint.pointCode}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleGetGPS}
                disabled={isLocating}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Capturando GPS...' : 'GPS Celular'}</span>
              </button>
            </div>
          </div>

          {gpsAccuracy !== null && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Precisión GPS estimada: ±{gpsAccuracy}m</span>
            </div>
          )}

          {/* Active Coordinate Input Panels (Ordered by active global coordFormat) */}
          {coordFormat === 'utm' ? (
            <>
              {/* 1. Coordenadas Proyectadas UTM (Primary) */}
              <div className="space-y-1 bg-white/70 p-2 rounded-md border border-emerald-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-950 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>1. Coordenadas Proyectadas UTM (WGS84 - Primario)</span>
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                    Huso 19S
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Huso / Zona</span>
                    <input
                      type="text"
                      value={utmZone}
                      onChange={(e) => handleUTMChange(utmEasting, utmNorthing, e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded p-1 text-xs font-mono font-bold text-emerald-900 text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Este (X) m</span>
                    <input
                      type="number"
                      step="1"
                      value={utmEasting}
                      onChange={(e) =>
                        handleUTMChange(
                          e.target.value === '' ? '' : Math.round(parseFloat(e.target.value)),
                          utmNorthing,
                          utmZone
                        )
                      }
                      placeholder="415800"
                      className="w-full bg-white border border-emerald-400 focus:border-emerald-600 rounded p-1 text-xs font-mono font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Norte (Y) m</span>
                    <input
                      type="number"
                      step="1"
                      value={utmNorthing}
                      onChange={(e) =>
                        handleUTMChange(
                          utmEasting,
                          e.target.value === '' ? '' : Math.round(parseFloat(e.target.value)),
                          utmZone
                        )
                      }
                      placeholder="7683100"
                      className="w-full bg-white border border-emerald-400 focus:border-emerald-600 rounded p-1 text-xs font-mono font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Coordenadas Decimales (Secondary) */}
              <div className="space-y-1 pt-1 border-t border-emerald-100">
                <span className="text-[10px] text-slate-600 font-medium block">
                  2. Grados Decimales (Calculados automáticamente: Lat / Lng)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Latitud (°)</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={lat}
                      onChange={(e) =>
                        handleLatLngChange(e.target.value === '' ? '' : parseFloat(e.target.value), lng)
                      }
                      placeholder="-20.948000"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-xs font-mono font-semibold text-slate-700"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Longitud (°)</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={lng}
                      onChange={(e) =>
                        handleLatLngChange(lat, e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      placeholder="-69.812000"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-xs font-mono font-semibold text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 1. Coordenadas Decimales (Primary) */}
              <div className="space-y-1 bg-white/70 p-2 rounded-md border border-emerald-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-950 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>1. Grados Decimales (WGS84 Lat / Lng - Primario)</span>
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                    WGS84
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Latitud (°)</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={lat}
                      onChange={(e) =>
                        handleLatLngChange(e.target.value === '' ? '' : parseFloat(e.target.value), lng)
                      }
                      placeholder="-20.948000"
                      required
                      className="w-full bg-white border border-emerald-400 focus:border-emerald-600 rounded p-1 text-xs font-mono font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Longitud (°)</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={lng}
                      onChange={(e) =>
                        handleLatLngChange(lat, e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      placeholder="-69.812000"
                      required
                      className="w-full bg-white border border-emerald-400 focus:border-emerald-600 rounded p-1 text-xs font-mono font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Coordenadas Proyectadas UTM (Secondary) */}
              <div className="space-y-1 pt-1 border-t border-emerald-100">
                <span className="text-[10px] text-slate-600 font-medium block">
                  2. Coordenadas Proyectadas UTM (Calculadas automáticamente)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Huso / Zona</span>
                    <input
                      type="text"
                      value={utmZone}
                      onChange={(e) => handleUTMChange(utmEasting, utmNorthing, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-xs font-mono font-bold text-emerald-900 text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Este (X) m</span>
                    <input
                      type="number"
                      step="1"
                      value={utmEasting}
                      onChange={(e) =>
                        handleUTMChange(
                          e.target.value === '' ? '' : Math.round(parseFloat(e.target.value)),
                          utmNorthing,
                          utmZone
                        )
                      }
                      placeholder="415800"
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-xs font-mono font-semibold text-slate-700"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-medium">Norte (Y) m</span>
                    <input
                      type="number"
                      step="1"
                      value={utmNorthing}
                      onChange={(e) =>
                        handleUTMChange(
                          utmEasting,
                          e.target.value === '' ? '' : Math.round(parseFloat(e.target.value)),
                          utmZone
                        )
                      }
                      placeholder="7683100"
                      className="w-full bg-slate-50 border border-slate-300 rounded p-1 text-xs font-mono font-semibold text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Row 5: Nesting Specific Section (for Aves) */}
        {category === 'Aves' && (
          <div className="bg-rose-50/70 p-3 rounded-lg border border-rose-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
              <Egg className="w-4 h-4 text-rose-600" />
              <span>Monitoreo de Nidificación y Nidos (SEIA Aves)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Estado del Nido</label>
                <select
                  value={nestStatus}
                  onChange={(e) => setNestStatus(e.target.value as any)}
                  className="w-full bg-white border border-rose-300 rounded p-1 text-xs text-rose-950 font-semibold"
                >
                  <option value="Sin Nido / No aplica">Sin Nido / No aplica</option>
                  <option value="Nido Completo">Nido Completo (Estructura Activa)</option>
                  <option value="Nido Destruido">Nido Destruido / Inactivo</option>
                  <option value="En Construcción">En Construcción / Plataforma</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">Contenido</label>
                <select
                  value={nestContent}
                  onChange={(e) => setNestContent(e.target.value as any)}
                  className="w-full bg-white border border-rose-300 rounded p-1 text-xs text-rose-950 font-semibold"
                >
                  <option value="Sin Registro / N/A">Sin Registro / N/A</option>
                  <option value="Vacío">Vacío</option>
                  <option value="Con Huevos">Con Huevos</option>
                  <option value="Con Crías Vivas">Con Crías Vivas</option>
                  <option value="Con Huevos y Crías">Con Huevos y Crías</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-rose-200">
              <div>
                <label className="block text-[9px] text-slate-600 font-semibold">Distancia (m)</label>
                <input
                  type="number"
                  min="0"
                  value={nestDistanceM}
                  onChange={(e) => setNestDistanceM(Number(e.target.value))}
                  className="w-full bg-white border border-rose-200 rounded p-1 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-600 font-semibold">N° Huevos</label>
                <input
                  type="number"
                  min="0"
                  value={eggsCount}
                  onChange={(e) => setEggsCount(Number(e.target.value))}
                  className="w-full bg-white border border-rose-200 rounded p-1 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-600 font-semibold">Crías Vivas</label>
                <input
                  type="number"
                  min="0"
                  value={chicksAlive}
                  onChange={(e) => setChicksAlive(Number(e.target.value))}
                  className="w-full bg-white border border-rose-200 rounded p-1 text-xs font-mono font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Row 7: Date, Method, Abundance */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">Fecha y Hora</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">Método</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-800"
            >
              <option value="Prospección Visual">Prospección Visual</option>
              <option value="Playback / Acústica">Playback / Acústica</option>
              <option value="Visor Térmico">Visor Térmico</option>
              <option value="Cámara Trampa">Cámara Trampa</option>
              <option value="Cámara Sonda">Cámara Sonda</option>
              <option value="Parcela / Transecto">Parcela / Transecto</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-0.5">Abundancia</label>
            <input
              type="number"
              min="1"
              value={abundance}
              onChange={(e) => setAbundance(parseInt(e.target.value, 10) || 1)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Row 8: Photos & Camera with Descriptions */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>Evidencias Fotográficas ({photoItems.length})</span>
            </span>

            <div className="flex items-center gap-2">
              {/* Camera take photo button */}
              <label className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition shadow-2xs">
                <Camera className="w-3 h-3" />
                <span>Tomar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handlePhotoFiles(e.target.files)}
                />
              </label>

              {/* Upload gallery image button */}
              <label className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition">
                <FolderOpen className="w-3 h-3 text-slate-600" />
                <span>Galería</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoFiles(e.target.files)}
                />
              </label>
            </div>
          </div>

          {/* Photo Items with Description */}
          {photoItems.length > 0 && (
            <div className="space-y-2 pt-1">
              {photoItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs"
                >
                  <div className="relative w-14 h-14 bg-slate-900 rounded overflow-hidden shrink-0">
                    <img src={item.url} alt={`Evidencia ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-0.5 right-0.5 bg-red-600/90 hover:bg-red-700 text-white p-0.5 rounded-full"
                      title="Eliminar foto"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <label className="block text-[9px] font-semibold text-slate-600">
                      Descripción de la foto {idx + 1}:
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updatePhotoDescription(idx, e.target.value)}
                      placeholder="Ej: Ejemplar adulto sobre roca halita, detalle del nido, floración..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400 focus:bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 9: Observador (Nombre y Apellido) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block font-semibold text-slate-800 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>Observador (Nombre y Apellido)</span>
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberObserver}
                onChange={(e) => setRememberObserver(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Recordar para siguientes puntos</span>
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={observer}
              onChange={(e) => {
                setObserver(e.target.value);
                if (onObserverChange) onObserverChange(e.target.value);
              }}
              placeholder="Escriba aquí el nombre y apellido del observador de campo..."
              className="w-full bg-white border border-slate-300 rounded-md p-2 pr-7 text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
            />
            {observer && (
              <button
                type="button"
                onClick={() => {
                  setObserver('');
                  if (onObserverChange) onObserverChange('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                title="Borrar observador"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 10: Observations & Notes */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Observaciones de Terreno / Hábitat y Sustrato
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Descripción del sustrato salino, microtopografía, comportamiento, refugio..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLimitReached || isCampaignLocked}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-white shadow-sm transition flex items-center justify-center gap-2 ${
            isCampaignLocked
              ? 'bg-amber-800/80 cursor-not-allowed opacity-85'
              : isLimitReached
              ? 'bg-slate-400 cursor-not-allowed opacity-85'
              : isEditing
              ? 'bg-amber-600 hover:bg-amber-700 active:scale-95 cursor-pointer'
              : 'bg-emerald-700 hover:bg-emerald-800 active:scale-95 cursor-pointer'
          }`}
        >
          {isCampaignLocked ? (
            <>
              <Lock className="w-4 h-4 text-amber-200" />
              <span>Campaña Bloqueada (Desbloquee en la parte superior)</span>
            </>
          ) : isLimitReached ? (
            <>
              <Lock className="w-4 h-4 text-amber-200" />
              <span>Registro Bloqueado (Aumente N° de Muestreos para Desbloquear)</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>
                {isEditing
                  ? `Guardar Cambios del Punto ${initialRecord.pointCode}`
                  : `Guardar Punto ${pointCodeInput || nextPointCode} en Tiempo Real`}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
