export type CategoryType = 'Aves' | 'Mamíferos' | 'Reptiles' | 'Flora';

export type ConservationStatus = 
  | 'En Peligro Crítico (CR)'
  | 'En Peligro (EN)'
  | 'Vulnerable (VU)'
  | 'Casi Amenazada (NT)'
  | 'Preocupación Menor (LC)'
  | 'Datos Insuficientes (DD)'
  | 'Doméstico';

export interface TaxonSpecies {
  common: string;
  scientific: string;
  order: string;
  family: string;
  status: ConservationStatus;
}

export interface NestInfo {
  status: 'Sin Nido / No aplica' | 'Nido Completo' | 'Nido Destruido' | 'En Construcción';
  content: 'Sin Registro / N/A' | 'Vacío' | 'Con Huevos' | 'Con Crías Vivas' | 'Con Huevos y Crías';
  observableCount: number;
  distanceM: number;
  eggsCount: number;
  chicksAlive: number;
  chicksDead: number;
}

export type BirdStage = 'Adulto' | 'Subadulto' | 'Juvenil' | 'Cría / Polluelo' | 'Huevo';
export type FloraHabit = 'Árbol' | 'Arbusto' | 'Pastizal' | 'Cactácea / Suculenta' | 'Hierba / Cojín';
export type FloraCondition = 'Vivo' | 'Seco' | 'Destruido';
export type FloraStage = 'En floración' | 'Con frutos' | 'Invernando' | 'En desarrollo';

export interface EnvironmentalParams {
  noiseLevelDba?: number;
  pm25?: number;
  pm10?: number;
  temperatureC?: number;
  humidityPct?: number;
  windSpeedMs?: number;
  waterPh?: number;
  conductivityUs?: number;
}

export type CoordinateFormat = 'decimal' | 'utm';

export interface UTMCoordinate {
  easting: number;
  northing: number;
  zone: string;
  formatted: string;
}

export interface PhotoDetail {
  id: string;
  url: string; // base64 or url
  description: string;
  pointCode?: string;
  speciesName?: string;
  timestamp?: string;
}

export interface CampaignInfo {
  name: string; // Nombre del Muestreo / Campaña
  startDate: string; // Fecha de Inicio
  endDate: string; // Fecha de Término
  location?: string;
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  targetPoints: number;
  isLocked: boolean;
  createdAt: string;
}

export interface SamplingRecord {
  id: number;
  pointCode: string; // e.g. P-001
  pointType: 'Punto Nuevo' | 'Punto Fijo';
  fixedPointNum?: string; // e.g. PF-01
  category: CategoryType;
  commonName: string;
  scientificName: string;
  order: string;
  family: string;
  sex?: 'Macho' | 'Hembra' | 'Indeterminado / No aplica';
  stage?: 'Adulto' | 'Cría / Polluelo' | 'Juvenil' | 'Subadulto' | 'Huevo' | FloraStage | string;
  // Flora specific attributes
  floraHabit?: FloraHabit;
  floraHeightM?: number;
  floraCircumferenceM?: number;
  floraCondition?: FloraCondition;
  floraStage?: FloraStage;
  lat: number;
  lng: number;
  utmZone: string;
  utmEasting: number;
  utmNorthing: number;
  utmFormatted: string;
  datetime: string;
  campaign: string;
  campaignStartDate?: string;
  campaignEndDate?: string;
  method: 'Prospección Visual' | 'Playback / Acústica' | 'Visor Térmico' | 'Cámara Trampa' | 'Cámara Sonda' | 'Parcela / Transecto' | 'Sonda Multiparámetro' | string;
  abundance: number;
  status: ConservationStatus;
  nestInfo?: NestInfo;
  envParams?: EnvironmentalParams;
  photos: string[]; // base64 or object URLs
  photoDetails?: PhotoDetail[]; // photos with descriptions
  notes: string;
  observer: string;
  synced: boolean;
  syncTimestamp?: string;
}

