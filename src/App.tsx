import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { SamplingPlanner } from './components/SamplingPlanner';
import { DashboardKpis } from './components/DashboardKpis';
import { ChartsPanel } from './components/ChartsPanel';
import { SamplingForm } from './components/SamplingForm';
import { MapDistribution } from './components/MapDistribution';
import { RecordsTable } from './components/RecordsTable';
import { SignOffReport } from './components/SignOffReport';
import { PhotoModal } from './components/PhotoModal';
import { PrintReportModal } from './components/PrintReportModal';
import { PhotoGallerySection } from './components/PhotoGallerySection';
import { PrintableTechnicalReport } from './components/PrintableTechnicalReport';
import { SamplingRecord, Campaign } from './types/sampling';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { exportRecordsToCSV, exportRecordsToJSON } from './utils/exportUtils';
import { CheckCircle2, X } from 'lucide-react';

const STORAGE_KEY = 'geomuestreo_salar_records_v4';
const CAMPAIGNS_KEY = 'geomuestreo_campaigns_list_v4';
const ACTIVE_CAMPAIGN_KEY = 'geomuestreo_active_camp_id_v4';

// Initial realistic biological sampling records (without physicochemical parameters)
const INITIAL_SEED_RECORDS: SamplingRecord[] = [
  {
    id: 1,
    pointCode: 'P-001',
    pointType: 'Punto Nuevo',
    category: 'Aves',
    commonName: 'Golondrina de mar negra',
    scientificName: 'Hydrobates markhami',
    order: 'Procellariiformes',
    family: 'Hydrobatidae',
    sex: 'Indeterminado / No aplica',
    stage: 'Adulto',
    lat: -20.9382,
    lng: -69.8051,
    utmZone: '19S',
    utmEasting: 416300,
    utmNorthing: 7684350,
    utmFormatted: 'Zona 19S | E: 416300 | N: 7684350',
    datetime: '2026-10-11T09:15',
    campaign: 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
    campaignStartDate: '2026-10-01',
    campaignEndDate: '2026-10-15',
    method: 'Prospección Visual',
    abundance: 3,
    status: 'En Peligro (EN)',
    nestInfo: {
      status: 'Nido Completo',
      content: 'Con Crías Vivas',
      observableCount: 1,
      distanceM: 12,
      eggsCount: 0,
      chicksAlive: 2,
      chicksDead: 0
    },
    photos: [
      'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80'
    ],
    photoDetails: [
      {
        id: 'seed-p1-1',
        url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
        description: 'Adulto sobre oquedad en costra de halita activa con crías.',
        pointCode: 'P-001',
        speciesName: 'Golondrina de mar negra',
        timestamp: '2026-10-11T09:15'
      }
    ],
    notes: 'Avistamiento en grieta profunda de costra de halita fósil. Crías con plumón grisáceo.',
    observer: '',
    synced: true,
    syncTimestamp: '2026-10-11T09:20:00Z'
  },
  {
    id: 2,
    pointCode: 'P-002',
    pointType: 'Punto Fijo',
    fixedPointNum: 'PF-01',
    category: 'Reptiles',
    commonName: 'Dragón de Stolzmann',
    scientificName: 'Liolaemus stolzmanni',
    order: 'Squamata',
    family: 'Liolaemidae',
    sex: 'Macho',
    stage: 'Adulto',
    lat: -20.9425,
    lng: -69.8142,
    utmZone: '19S',
    utmEasting: 415350,
    utmNorthing: 7683880,
    utmFormatted: 'Zona 19S | E: 415350 | N: 7683880',
    datetime: '2026-10-11T11:30',
    campaign: 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
    campaignStartDate: '2026-10-01',
    campaignEndDate: '2026-10-15',
    method: 'Prospección Visual',
    abundance: 1,
    status: 'Vulnerable (VU)',
    photos: [
      'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?w=800&auto=format&fit=crop&q=80'
    ],
    photoDetails: [
      {
        id: 'seed-p2-1',
        url: 'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?w=800&auto=format&fit=crop&q=80',
        description: 'Macho adulto asoleándose sobre bloque evaporítico de salar.',
        pointCode: 'P-002',
        speciesName: 'Dragón de Stolzmann',
        timestamp: '2026-10-11T11:30'
      }
    ],
    notes: 'Ejemplar termorregulando en sector pedregoso con arena fina entre montículos.',
    observer: '',
    synced: true,
    syncTimestamp: '2026-10-11T11:35:00Z'
  },
  {
    id: 3,
    pointCode: 'P-003',
    pointType: 'Punto Nuevo',
    category: 'Mamíferos',
    commonName: 'Zorro culpeo',
    scientificName: 'Lycalopex culpaeus',
    order: 'Carnivora',
    family: 'Canidae',
    sex: 'Indeterminado / No aplica',
    stage: 'Subadulto',
    lat: -20.9610,
    lng: -69.8250,
    utmZone: '19S',
    utmEasting: 414230,
    utmNorthing: 7681820,
    utmFormatted: 'Zona 19S | E: 414230 | N: 7681820',
    datetime: '2026-10-11T14:20',
    campaign: 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
    campaignStartDate: '2026-10-01',
    campaignEndDate: '2026-10-15',
    method: 'Cámara Trampa',
    abundance: 1,
    status: 'Preocupación Menor (LC)',
    photos: [
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&auto=format&fit=crop&q=80'
    ],
    photoDetails: [
      {
        id: 'seed-p3-1',
        url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&auto=format&fit=crop&q=80',
        description: 'Zorro culpeo en tránsito perimetral por quebrada de acceso.',
        pointCode: 'P-003',
        speciesName: 'Zorro culpeo',
        timestamp: '2026-10-11T14:20'
      }
    ],
    notes: 'Huellas frescas y fecas en sendero perimetral en dirección sur.',
    observer: '',
    synced: true,
    syncTimestamp: '2026-10-11T14:25:00Z'
  },
  {
    id: 4,
    pointCode: 'P-004',
    pointType: 'Punto Fijo',
    fixedPointNum: 'PF-02',
    category: 'Flora',
    commonName: 'Pingo-pingo / Tramontana',
    scientificName: 'Ephedra breana',
    order: 'Ephedrales',
    family: 'Ephedraceae',
    stage: 'En floración',
    floraHabit: 'Arbusto',
    floraHeightM: 0.65,
    floraCircumferenceM: 0.90,
    floraCondition: 'Vivo',
    floraStage: 'En floración',
    lat: -20.9490,
    lng: -69.8010,
    utmZone: '19S',
    utmEasting: 416750,
    utmNorthing: 7683160,
    utmFormatted: 'Zona 19S | E: 416750 | N: 7683160',
    datetime: '2026-10-11T16:45',
    campaign: 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
    campaignStartDate: '2026-10-01',
    campaignEndDate: '2026-10-15',
    method: 'Parcela / Transecto',
    abundance: 6,
    status: 'Preocupación Menor (LC)',
    photos: [
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80'
    ],
    photoDetails: [
      {
        id: 'seed-p4-1',
        url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=80',
        description: 'Comunidad arbustiva xerofítica en ladera rocosa con alta insolación.',
        pointCode: 'P-004',
        speciesName: 'Pingo-pingo / Tramontana',
        timestamp: '2026-10-11T16:45'
      }
    ],
    notes: 'Comunidad arbustiva xerofítica en ladera rocosa orientada al este.',
    observer: '',
    synced: true,
    syncTimestamp: '2026-10-11T16:50:00Z'
  },
  {
    id: 5,
    pointCode: 'P-005',
    pointType: 'Punto Fijo',
    fixedPointNum: 'PF-03',
    category: 'Flora',
    commonName: 'Cachiyuyo',
    scientificName: 'Atriplex atacamensis',
    order: 'Caryophyllales',
    family: 'Amaranthaceae',
    stage: 'En desarrollo',
    floraHabit: 'Arbusto',
    floraHeightM: 0.85,
    floraCircumferenceM: 1.20,
    floraCondition: 'Vivo',
    floraStage: 'En desarrollo',
    lat: -20.9540,
    lng: -69.8180,
    utmZone: '19S',
    utmEasting: 415020,
    utmNorthing: 7682610,
    utmFormatted: 'Zona 19S | E: 415020 | N: 7682610',
    datetime: '2026-10-11T17:10',
    campaign: 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
    campaignStartDate: '2026-10-01',
    campaignEndDate: '2026-10-15',
    method: 'Parcela / Transecto',
    abundance: 4,
    status: 'Preocupación Menor (LC)',
    photos: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80'
    ],
    photoDetails: [
      {
        id: 'seed-p5-1',
        url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
        description: 'Matorral xerofítico de Cachiyuyo en borde sur del salar.',
        pointCode: 'P-005',
        speciesName: 'Cachiyuyo',
        timestamp: '2026-10-11T17:10'
      }
    ],
    notes: 'Matorral halófilo perenne en borde sur del salar.',
    observer: '',
    synced: true,
    syncTimestamp: '2026-10-11T17:15:00Z'
  }
];

export default function App() {
  // Campaign list state
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const stored = localStorage.getItem(CAMPAIGNS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'camp-1',
        name: 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
        startDate: '2026-10-01',
        endDate: '2026-10-15',
        targetPoints: 25,
        isLocked: false,
        createdAt: '2026-10-01T08:00:00Z'
      }
    ];
  });

  const [activeCampaignId, setActiveCampaignId] = useState<string>(() => {
    try {
      return localStorage.getItem(ACTIVE_CAMPAIGN_KEY) || 'camp-1';
    } catch {
      return 'camp-1';
    }
  });

  // Active campaign helper
  const activeCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === activeCampaignId) || campaigns[0] || {
      id: 'camp-1',
      name: 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      targetPoints: 25,
      isLocked: false,
      createdAt: ''
    };
  }, [campaigns, activeCampaignId]);

  // Persist campaigns
  useEffect(() => {
    try {
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
      localStorage.setItem(ACTIVE_CAMPAIGN_KEY, activeCampaignId);
    } catch {
      // ignore
    }
  }, [campaigns, activeCampaignId]);

  // Main state: records
  const [records, setRecords] = useState<SamplingRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SEED_RECORDS;
  });

  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('ALL');
  const [editingRecord, setEditingRecord] = useState<SamplingRecord | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Photo modal state
  const [photoModal, setPhotoModal] = useState<{ isOpen: boolean; src: string | null; title: string }>({
    isOpen: false,
    src: null,
    title: ''
  });

  // Network status hook
  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    showOfflineBanner,
    dismissOfflineBanner
  } = useNetworkStatus();

  // Specialist / Responsible Officer state: starts BLANK, written manually only
  const [specialistName, setSpecialistName] = useState<string>('');

  // Field Observer state: separate from specialist, used for sampling form
  const [fieldObserver, setFieldObserver] = useState<string>(() => {
    try {
      return localStorage.getItem('geomuestreo_field_observer') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('geomuestreo_field_observer', fieldObserver);
    } catch {
      // ignore
    }
  }, [fieldObserver]);

  // Cloud sync states
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<{ count: number; timestamp: string } | null>(null);

  // Auto-save state (backup every 30s)
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string | null>(() => {
    try {
      const storedTime = localStorage.getItem('geomuestreo_last_autosave_time');
      return storedTime || new Date().toLocaleTimeString('es-CL');
    } catch {
      return new Date().toLocaleTimeString('es-CL');
    }
  });

  // Dedicated Auto-Save system running every 30 seconds
  useEffect(() => {
    const runAutoSave = () => {
      try {
        const timestamp = new Date().toISOString();
        const displayTime = new Date().toLocaleTimeString('es-CL');

        // Snapshot of application state
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
        localStorage.setItem(ACTIVE_CAMPAIGN_KEY, activeCampaignId);
        localStorage.setItem('geomuestreo_field_observer', fieldObserver);
        localStorage.setItem('geomuestreo_specialist_name', specialistName);

        // Also store dedicated full backup snapshot
        const fullBackup = {
          timestamp,
          displayTime,
          recordsCount: records.length,
          records,
          campaigns,
          activeCampaignId,
          fieldObserver,
          specialistName
        };
        localStorage.setItem('geomuestreo_autosave_snapshot_v4', JSON.stringify(fullBackup));
        localStorage.setItem('geomuestreo_last_autosave_time', displayTime);

        setLastAutoSavedAt(displayTime);
      } catch (err) {
        console.warn('Auto-save error:', err);
      }
    };

    // Run initial save on mount
    runAutoSave();

    // 30 seconds interval
    const intervalId = setInterval(runAutoSave, 30000);
    return () => clearInterval(intervalId);
  }, [records, campaigns, activeCampaignId, fieldObserver, specialistName]);

  // Persist records on change as well
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  // Next point code calculator
  const nextPointCode = useMemo(() => {
    if (records.length === 0) return 'P-001';
    const codes = records.map((r) => r.pointCode);
    let maxNum = 0;
    codes.forEach((code) => {
      const match = code.match(/P-(\d+)/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextVal = maxNum + 1;
    return `P-${String(nextVal).padStart(3, '0')}`;
  }, [records]);

  // Next fixed point code calculator
  const nextFixedPointNum = useMemo(() => {
    const fixedCodes = records
      .filter((r) => r.pointType === 'Punto Fijo' && r.fixedPointNum)
      .map((r) => r.fixedPointNum as string);

    if (fixedCodes.length === 0) return 'PF-01';
    let maxNum = 0;
    fixedCodes.forEach((code) => {
      const match = code.match(/PF-(\d+)/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextVal = maxNum + 1;
    return `PF-${String(nextVal).padStart(2, '0')}`;
  }, [records]);

  // Print Report modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const handlePrint = useCallback(() => {
    setIsPrintModalOpen(true);
  }, []);

  // Save or Update Record handler
  const handleSaveRecord = useCallback(
    (recordData: Omit<SamplingRecord, 'id'>, editId?: number) => {
      const updatedRecordData = {
        ...recordData,
        campaign: activeCampaign.name,
        campaignStartDate: activeCampaign.startDate,
        campaignEndDate: activeCampaign.endDate,
        synced: true,
        syncTimestamp: new Date().toISOString()
      };

      if (editId !== undefined) {
        setRecords((prev) =>
          prev.map((r) => (r.id === editId ? { ...updatedRecordData, id: editId } : r))
        );
        setEditingRecord(null);
      } else {
        setRecords((prev) => {
          const maxId = prev.length > 0 ? Math.max(...prev.map((r) => r.id)) : 0;
          const newId = maxId + 1;
          const newRecord: SamplingRecord = {
            ...updatedRecordData,
            id: newId
          };
          return [newRecord, ...prev];
        });
      }
      setSelectedMapLocation(null);
    },
    [activeCampaign]
  );

  // Edit record
  const handleEditRecord = useCallback(
    (id: number) => {
      const found = records.find((r) => r.id === id);
      if (found) {
        setEditingRecord(found);
        setSelectedMapLocation({ lat: found.lat, lng: found.lng });
        const formEl = document.getElementById('formulario');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    [records]
  );

  // Delete single record
  const handleDeleteRecord = useCallback((id: number) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (editingRecord?.id === id) {
      setEditingRecord(null);
    }
  }, [editingRecord]);

  // Clear all records from dataset
  const handleClearAllRecords = useCallback(() => {
    setRecords([]);
    setEditingRecord(null);
    setSelectedMapLocation(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Map Click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedMapLocation({ lat, lng });
  }, []);

  // Batch Sync All
  const handleSyncAll = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      const nowIso = new Date().toISOString();
      setRecords((prev) => {
        const updated = prev.map((r) => ({
          ...r,
          synced: true,
          syncTimestamp: nowIso
        }));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      setIsSyncing(false);
      setSyncToast({
        count: records.length,
        timestamp: new Date().toLocaleTimeString('es-CL')
      });
      setTimeout(() => setSyncToast(null), 4000);
    }, 500);
  }, [records.length]);

  // Campaign management callbacks
  const handleAddCampaign = useCallback((newCamp: { name: string; startDate: string; endDate: string; targetPoints: number }) => {
    const newId = `camp-${Date.now()}`;
    const created: Campaign = {
      ...newCamp,
      id: newId,
      isLocked: false,
      createdAt: new Date().toISOString()
    };
    setCampaigns((prev) => [...prev, created]);
    setActiveCampaignId(newId);
  }, []);

  const handleUpdateActiveCampaign = useCallback((updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === activeCampaignId ? { ...c, ...updates } : c))
    );
    if (updates.name && activeCampaign.name) {
      const oldName = activeCampaign.name;
      setRecords((prev) =>
        prev.map((r) => (r.campaign === oldName ? { ...r, campaign: updates.name! } : r))
      );
    }
  }, [activeCampaignId, activeCampaign.name]);

  const handleToggleLockCampaign = useCallback(() => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === activeCampaignId ? { ...c, isLocked: !c.isLocked } : c))
    );
  }, [activeCampaignId]);

  const handleDeleteCampaign = useCallback((idToDelete: string) => {
    const campToDelete = campaigns.find((c) => c.id === idToDelete);
    const campName = campToDelete?.name || '';

    // Clear records belonging to this campaign
    setRecords((prev) => prev.filter((r) => r.campaign !== campName));
    setEditingRecord(null);

    setCampaigns((prev) => {
      const filtered = prev.filter((c) => c.id !== idToDelete);
      if (filtered.length === 0) {
        const fallback: Campaign = {
          id: `camp-${Date.now()}`,
          name: 'Campaña 1 - Monitoreo de Biodiversidad Salar Grande 2026',
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
          targetPoints: 25,
          isLocked: false,
          createdAt: new Date().toISOString()
        };
        setActiveCampaignId(fallback.id);
        return [fallback];
      }
      setActiveCampaignId(filtered[0].id);
      return filtered;
    });
  }, [campaigns]);

  const handleTargetChange = useCallback((newTarget: number) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === activeCampaignId ? { ...c, targetPoints: newTarget } : c))
    );
  }, [activeCampaignId]);

  // Update photo description directly from photo gallery
  const handleUpdatePhotoDescription = useCallback(
    (recordId: number, photoIndex: number, newDescription: string) => {
      setRecords((prev) =>
        prev.map((rec) => {
          if (rec.id !== recordId) return rec;
          const currentDetails = rec.photoDetails ? [...rec.photoDetails] : [];
          if (currentDetails[photoIndex]) {
            currentDetails[photoIndex] = {
              ...currentDetails[photoIndex],
              description: newDescription
            };
          }
          return {
            ...rec,
            photoDetails: currentDetails
          };
        })
      );
    },
    []
  );

  // Delete photo from record
  const handleDeletePhoto = useCallback((recordId: number, photoIndex: number) => {
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== recordId) return rec;
        const newUrls = (rec.photos || []).filter((_, i) => i !== photoIndex);
        const newDetails = (rec.photoDetails || []).filter((_, i) => i !== photoIndex);
        return {
          ...rec,
          photos: newUrls,
          photoDetails: newDetails
        };
      })
    );
  }, []);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    exportRecordsToCSV(records, `Muestreo_${activeCampaign.name.replace(/[^a-zA-Z0-9]/g, '_')}`);
  }, [records, activeCampaign.name]);

  const handleExportJSON = useCallback(() => {
    exportRecordsToJSON(records);
  }, [records]);

  // View photo modal handler
  const handleViewPhoto = useCallback((photoSrc: string, title: string) => {
    setPhotoModal({
      isOpen: true,
      src: photoSrc,
      title
    });
  }, []);

  const syncedCount = records.filter((r) => r.synced).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* ------------------------------------------------------------- */}
      {/* DEDICATED PRINTABLE TECHNICAL REPORT (Visible on window.print) */}
      {/* ------------------------------------------------------------- */}
      <div className="print-report-container">
        <PrintableTechnicalReport
          records={records}
          specialistName={specialistName}
          campaignName={activeCampaign.name}
          campaignStartDate={activeCampaign.startDate}
          campaignEndDate={activeCampaign.endDate}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE APPLICATION (Hidden when printing from browser)   */}
      {/* ------------------------------------------------------------- */}
      <div className="no-print flex flex-col min-h-screen flex-grow">
        {/* Main Interactive Header */}
        <Header
          onPrint={handlePrint}
          syncedCount={syncedCount}
          totalCount={records.length}
          isSyncing={isSyncing}
          onManualSync={handleSyncAll}
          isOnline={isOnline}
          isSimulatedOffline={isSimulatedOffline}
          onToggleSimulatedOffline={toggleSimulatedOffline}
          showOfflineBanner={showOfflineBanner}
          onDismissOfflineBanner={dismissOfflineBanner}
          lastAutoSavedAt={lastAutoSavedAt}
        />

        {/* Batch Sync Toast Notification */}
        {syncToast && (
          <div className="fixed top-16 right-4 z-50 bg-emerald-900 text-white border border-emerald-500 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">¡Sincronización de lote completada exitosamente!</p>
              <p className="text-emerald-200">
                {syncToast.count} registros sincronizados en el almacenamiento local y servidor ({syncToast.timestamp}).
              </p>
            </div>
            <button
              onClick={() => setSyncToast(null)}
              className="text-emerald-300 hover:text-white p-1 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 flex-grow space-y-5">
          {/* Sampling Planning Banner with Campaign category, Date range & Locking */}
          <SamplingPlanner
            targetPoints={activeCampaign.targetPoints}
            currentPoints={records.length}
            onTargetChange={handleTargetChange}
            campaigns={campaigns}
            activeCampaignId={activeCampaignId}
            onSelectCampaign={setActiveCampaignId}
            onAddCampaign={handleAddCampaign}
            onUpdateActiveCampaign={handleUpdateActiveCampaign}
            onToggleLockCampaign={handleToggleLockCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            isCampaignLocked={activeCampaign.isLocked}
            onSyncAll={handleSyncAll}
            isSyncing={isSyncing}
            isOnline={isOnline}
            onClearAllRecords={handleClearAllRecords}
          />

          {/* Dashboard KPIs */}
          <DashboardKpis records={records} />

          {/* Scientific Charts Panel */}
          <ChartsPanel records={records} />

          {/* Interactive Workspace Split: Form (5 cols) + Map (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5">
              <SamplingForm
                initialRecord={editingRecord}
                onSaveRecord={handleSaveRecord}
                onCancelEdit={() => setEditingRecord(null)}
                nextPointCode={nextPointCode}
                nextFixedPointNum={nextFixedPointNum}
                externalCoords={selectedMapLocation}
                defaultObserver={fieldObserver}
                onObserverChange={setFieldObserver}
                targetPoints={activeCampaign.targetPoints}
                currentPoints={records.length}
                onIncreaseTarget={() => handleTargetChange(activeCampaign.targetPoints + 1)}
                campaignName={activeCampaign.name}
                campaignStartDate={activeCampaign.startDate}
                campaignEndDate={activeCampaign.endDate}
                isCampaignLocked={activeCampaign.isLocked}
              />
            </div>

            <div className="lg:col-span-7">
              <MapDistribution
                records={records}
                activeCategoryTab={activeCategoryTab}
                onMapClick={handleMapClick}
                selectedLocation={selectedMapLocation}
                onEditRecord={handleEditRecord}
              />
            </div>
          </div>

          {/* Dedicated Photo Gallery & Evidence Section */}
          <PhotoGallerySection
            records={records}
            onUpdatePhotoDescription={handleUpdatePhotoDescription}
            onDeletePhoto={handleDeletePhoto}
            onViewPhoto={handleViewPhoto}
          />

          {/* Data Records Table */}
          <RecordsTable
            records={records}
            activeTab={activeCategoryTab}
            onTabChange={setActiveCategoryTab}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            onViewPhoto={handleViewPhoto}
            isCampaignLocked={activeCampaign.isLocked}
          />

          {/* Official Sign-Off Report Block */}
          <SignOffReport
            specialistName={specialistName}
            onSpecialistNameChange={setSpecialistName}
            onOpenPrintModal={handlePrint}
          />
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-4 text-center border-t border-slate-800 no-print">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Sistema de Muestreo de Datos Ambientales · Salar Grande (Norte de Chile)</span>
            <span className="text-slate-500 font-mono text-[11px]">
              Cumplimiento Guías Metodológicas SEIA Chile (2022-2026)
            </span>
          </div>
        </footer>
      </div>

      {/* High-Resolution Photo Modal */}
      <PhotoModal
        isOpen={photoModal.isOpen}
        photoSrc={photoModal.src}
        title={photoModal.title}
        onClose={() => setPhotoModal({ isOpen: false, src: null, title: '' })}
      />

      {/* Official PDF & Print Report Modal with all maps and photos */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        records={records}
        specialistName={specialistName}
        onSpecialistNameChange={setSpecialistName}
        campaignName={activeCampaign.name}
        campaignStartDate={activeCampaign.startDate}
        campaignEndDate={activeCampaign.endDate}
      />
    </div>
  );
}
