import { CategoryType, TaxonSpecies } from '../types/sampling';

export const TAXONOMY_DB: Record<CategoryType, TaxonSpecies[]> = {
  Aves: [
    { common: "Golondrina de mar negra", scientific: "Hydrobates markhami", order: "Procellariiformes", family: "Hydrobatidae", status: "En Peligro (EN)" },
    { common: "Golondrina de mar chica", scientific: "Oceanites gracilis", order: "Procellariiformes", family: "Oceanitidae", status: "Datos Insuficientes (DD)" },
    { common: "Golondrina de mar de collar", scientific: "Oceanodroma hornbyi", order: "Procellariiformes", family: "Hydrobatidae", status: "En Peligro (EN)" },
    { common: "Gaviota garuma", scientific: "Leucophaeus modestus", order: "Charadriiformes", family: "Laridae", status: "Preocupación Menor (LC)" },
    { common: "Jote de cabeza colorada", scientific: "Cathartes aura", order: "Cathartiformes", family: "Cathartidae", status: "Preocupación Menor (LC)" },
    { common: "Jote de cabeza negra", scientific: "Coragyps atratus", order: "Cathartiformes", family: "Cathartidae", status: "Preocupación Menor (LC)" },
    { common: "Aguilucho", scientific: "Geranoaetus polyosoma", order: "Accipitriformes", family: "Accipitridae", status: "Preocupación Menor (LC)" },
    { common: "Halcón peregrino", scientific: "Falco peregrinus", order: "Falconiformes", family: "Falconidae", status: "Preocupación Menor (LC)" },
    { common: "Halcón perdiguero", scientific: "Falco femoralis", order: "Falconiformes", family: "Falconidae", status: "Preocupación Menor (LC)" },
    { common: "Cernícalo", scientific: "Falco sparverius", order: "Falconiformes", family: "Falconidae", status: "Preocupación Menor (LC)" },
    { common: "Lechuza", scientific: "Tyto alba", order: "Strigiformes", family: "Tytonidae", status: "Preocupación Menor (LC)" },
    { common: "Flamenco andino", scientific: "Phoenicoparrus andinus", order: "Phoenicopteriformes", family: "Phoenicopteridae", status: "Vulnerable (VU)" },
    { common: "Flamenco de James", scientific: "Phoenicoparrus jamesi", order: "Phoenicopteriformes", family: "Phoenicopteridae", status: "Casi Amenazada (NT)" },
    { common: "Flamenco chileno", scientific: "Phoenicopterus chilensis", order: "Phoenicopteriformes", family: "Phoenicopteridae", status: "Casi Amenazada (NT)" },
    { common: "Suri / Ñandú del norte", scientific: "Rhea pennata tarapacensis", order: "Rheiformes", family: "Rheidae", status: "En Peligro (EN)" }
  ],
  Reptiles: [
    { common: "Dragón de Stolzmann", scientific: "Liolaemus stolzmanni", order: "Squamata", family: "Liolaemidae", status: "Vulnerable (VU)" },
    { common: "Salamanqueja del Norte Grande", scientific: "Phyllodactylus gerrhopygus", order: "Squamata", family: "Phyllodactylidae", status: "Preocupación Menor (LC)" },
    { common: "Lagarto de James", scientific: "Liolaemus jamesi", order: "Squamata", family: "Liolaemidae", status: "Preocupación Menor (LC)" },
    { common: "Lagartija de la puna / pintada", scientific: "Liolaemus ornatus", order: "Squamata", family: "Liolaemidae", status: "Preocupación Menor (LC)" },
    { common: "Lagartija de líneas claras", scientific: "Liolaemus alticolor", order: "Squamata", family: "Liolaemidae", status: "Preocupación Menor (LC)" },
    { common: "Lagartija de Fabián", scientific: "Liolaemus fabiani", order: "Squamata", family: "Liolaemidae", status: "Vulnerable (VU)" },
    { common: "Lagartija de Paulina", scientific: "Liolaemus paulinae", order: "Squamata", family: "Liolaemidae", status: "En Peligro (EN)" },
    { common: "Dragón de oído cubierto", scientific: "Liolaemus audituvelatus", order: "Squamata", family: "Liolaemidae", status: "Preocupación Menor (LC)" },
    { common: "Corredor de cuatro bandas", scientific: "Microlophus quadrivittatus", order: "Squamata", family: "Tropiduridae", status: "Preocupación Menor (LC)" },
    { common: "Corredor de Tarapacá", scientific: "Microlophus theresioides", order: "Squamata", family: "Tropiduridae", status: "Preocupación Menor (LC)" },
    { common: "Culebra del Perú / Puna", scientific: "Tachymenis peruviana", order: "Squamata", family: "Dipsadidae", status: "Vulnerable (VU)" }
  ],
  Mamíferos: [
    { common: "Zorro culpeo", scientific: "Lycalopex culpaeus", order: "Carnivora", family: "Canidae", status: "Preocupación Menor (LC)" },
    { common: "Zorro chilla", scientific: "Lycalopex griseus", order: "Carnivora", family: "Canidae", status: "Preocupación Menor (LC)" },
    { common: "Ratón amarillo", scientific: "Phyllotis limatus", order: "Rodentia", family: "Cricetidae", status: "Preocupación Menor (LC)" },
    { common: "Ratón oliváceo", scientific: "Abrothrix olivaceus", order: "Rodentia", family: "Cricetidae", status: "Preocupación Menor (LC)" },
    { common: "Vicuña", scientific: "Vicugna vicugna", order: "Artiodactyla", family: "Camelidae", status: "Preocupación Menor (LC)" },
    { common: "Guanaco", scientific: "Lama guanicoe", order: "Artiodactyla", family: "Camelidae", status: "Vulnerable (VU)" },
    { common: "Llama", scientific: "Lama glama", order: "Artiodactyla", family: "Camelidae", status: "Doméstico" },
    { common: "Alpaca", scientific: "Lama pacos", order: "Artiodactyla", family: "Camelidae", status: "Doméstico" },
    { common: "Taruca o Huemul del norte", scientific: "Hippocamelus antisensis", order: "Artiodactyla", family: "Cervidae", status: "En Peligro (EN)" },
    { common: "Puma", scientific: "Puma concolor", order: "Carnivora", family: "Felidae", status: "Casi Amenazada (NT)" },
    { common: "Gato andino", scientific: "Leopardus jacobita", order: "Carnivora", family: "Felidae", status: "En Peligro Crítico (CR)" },
    { common: "Zorrino / Chingue del altiplano", scientific: "Conepatus chinga", order: "Carnivora", family: "Mephitidae", status: "Preocupación Menor (LC)" },
    { common: "Vizcacha de la sierra", scientific: "Lagidium viscacia", order: "Rodentia", family: "Chinchillidae", status: "Preocupación Menor (LC)" },
    { common: "Chinchilla de cola corta", scientific: "Chinchilla chinchilla", order: "Rodentia", family: "Chinchillidae", status: "En Peligro Crítico (CR)" },
    { common: "Quirquincho de la puna", scientific: "Chaetophractus nationi", order: "Cingulata", family: "Chlamyphoridae", status: "En Peligro (EN)" }
  ],
  Flora: [
    { common: "Llareta / Yareta", scientific: "Azorella compacta", order: "Apiales", family: "Apiaceae", status: "Vulnerable (VU)" },
    { common: "Queñoa de altura", scientific: "Polylepis tarapacana", order: "Rosales", family: "Rosaceae", status: "Vulnerable (VU)" },
    { common: "Tola / Ñakat'ula", scientific: "Baccharis tola", order: "Asterales", family: "Asteraceae", status: "Preocupación Menor (LC)" },
    { common: "Tola chusca o Tolilla", scientific: "Baccharis boliviensis", order: "Asterales", family: "Asteraceae", status: "Preocupación Menor (LC)" },
    { common: "Kopa / Salvia blanca", scientific: "Artemisia copa", order: "Asterales", family: "Asteraceae", status: "Casi Amenazada (NT)" },
    { common: "Chachacoma", scientific: "Senecio nutans", order: "Asterales", family: "Asteraceae", status: "Preocupación Menor (LC)" },
    { common: "Pingo-pingo / Tramontana", scientific: "Ephedra breana", order: "Ephedrales", family: "Ephedraceae", status: "Preocupación Menor (LC)" },
    { common: "Brea", scientific: "Pluchea absinthioides", order: "Asterales", family: "Asteraceae", status: "Preocupación Menor (LC)" },
    { common: "Paja brava / Ichu", scientific: "Festuca orthophylla", order: "Poales", family: "Poaceae", status: "Preocupación Menor (LC)" },
    { common: "Grama salada", scientific: "Distichlis spicata", order: "Poales", family: "Poaceae", status: "Preocupación Menor (LC)" },
    { common: "Junco", scientific: "Juncus balticus", order: "Poales", family: "Juncaceae", status: "Preocupación Menor (LC)" },
    { common: "Oxychloe", scientific: "Oxychloe andina", order: "Poales", family: "Juncaceae", status: "Preocupación Menor (LC)" },
    { common: "Cachiyuyo", scientific: "Atriplex atacamensis", order: "Caryophyllales", family: "Amaranthaceae", status: "Preocupación Menor (LC)" }
  ]
};

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  Aves: '#0284c7', // Sky blue
  Mamíferos: '#6366f1', // Indigo
  Reptiles: '#d97706', // Amber
  Flora: '#10b981' // Emerald
};

export const CONSERVATION_COLORS: Record<string, string> = {
  'CR': '#b91c1c', // red-700
  'EN': '#ef4444', // red-500
  'VU': '#f59e0b', // amber-500
  'NT': '#eab308', // yellow-500
  'LC': '#10b981', // emerald-500
  'DD': '#94a3b8', // slate-400
  'Doméstico': '#64748b' // slate-500
};
