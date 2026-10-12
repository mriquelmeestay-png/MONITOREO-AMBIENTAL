// SVG data URIs for realistic regional wildlife and flora photographic placeholders
// This ensures that even offline or when external image URLs fail to load, images render crisply in browser print and PDF reports.

export const FALLBACK_SPECIES_IMAGES: Record<string, string> = {
  // Golondrina de mar negra (Aves)
  'Golondrina de mar negra': createSvgPhotoDataUrl(
    '#0f172a',
    '#1e293b',
    '#38bdf8',
    'Golondrina de mar negra',
    'Hydrobates markhami',
    'AVE MARINA · NIDIFICANTE'
  ),
  // Dragón de Stolzmann (Reptiles)
  'Dragón de Stolzmann': createSvgPhotoDataUrl(
    '#451a03',
    '#78350f',
    '#f59e0b',
    'Dragón de Stolzmann',
    'Liolaemus stolzmanni',
    'REPTIL ENDÉMICO · SALAR'
  ),
  // Zorro culpeo (Mamíferos)
  'Zorro culpeo': createSvgPhotoDataUrl(
    '#431407',
    '#7c2d12',
    '#fb923c',
    'Zorro culpeo',
    'Lycalopex culpaeus',
    'MASTOFAUNA · CARNÍVORO'
  ),
  // Pingo-pingo / Tramontana (Flora)
  'Pingo-pingo / Tramontana': createSvgPhotoDataUrl(
    '#064e3b',
    '#065f46',
    '#34d399',
    'Pingo-pingo / Tramontana',
    'Ephedra breana',
    'FLORA XEROFÍTICA · ARBUSTO'
  ),
  // Cachiyuyo (Flora)
  'Cachiyuyo': createSvgPhotoDataUrl(
    '#064e3b',
    '#047857',
    '#10b981',
    'Cachiyuyo',
    'Atriplex atacamensis',
    'FLORA HALÓFILA · SALAR'
  )
};

export function getSpeciesPlaceholder(speciesName?: string, commonName?: string): string {
  if (speciesName && FALLBACK_SPECIES_IMAGES[speciesName]) {
    return FALLBACK_SPECIES_IMAGES[speciesName];
  }
  if (commonName && FALLBACK_SPECIES_IMAGES[commonName]) {
    return FALLBACK_SPECIES_IMAGES[commonName];
  }
  return createSvgPhotoDataUrl(
    '#0f172a',
    '#1e293b',
    '#10b981',
    commonName || speciesName || 'Evidencia Biológica',
    'Registro Fotográfico Terreno',
    'MONITOREO BIOLÓGICO'
  );
}

function createSvgPhotoDataUrl(
  bgDark: string,
  bgLight: string,
  accentColor: string,
  name: string,
  scientific: string,
  tag: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgDark}" />
        <stop offset="60%" stop-color="${bgLight}" />
        <stop offset="100%" stop-color="${bgDark}" />
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" stroke-width="0.3" opacity="0.15" />
      </pattern>
    </defs>
    <!-- Background terrain fill -->
    <rect width="600" height="450" fill="url(#grad)" />
    <rect width="600" height="450" fill="url(#grid)" />
    
    <!-- Topographic / Landscape Silhouette -->
    <path d="M 0,320 Q 140,250 280,300 T 600,280 L 600,450 L 0,450 Z" fill="#020617" opacity="0.6" />
    <path d="M 0,360 Q 180,310 360,350 T 600,340 L 600,450 L 0,450 Z" fill="#020617" opacity="0.8" />
    
    <!-- Camera Target / Reticle -->
    <circle cx="300" cy="180" r="55" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-dasharray="6 4" opacity="0.8" />
    <circle cx="300" cy="180" r="28" fill="${accentColor}" fill-opacity="0.2" stroke="${accentColor}" stroke-width="1.5" />
    <line x1="300" y1="110" x2="300" y2="135" stroke="${accentColor}" stroke-width="2" />
    <line x1="300" y1="225" x2="300" y2="250" stroke="${accentColor}" stroke-width="2" />
    <line x1="230" y1="180" x2="255" y2="180" stroke="${accentColor}" stroke-width="2" />
    <line x1="345" y1="180" x2="370" y2="180" stroke="${accentColor}" stroke-width="2" />

    <!-- Tag Badge -->
    <rect x="25" y="25" width="${tag.length * 9.5 + 20}" height="26" rx="5" fill="#0f172a" opacity="0.9" stroke="${accentColor}" stroke-width="1.2" />
    <text x="35" y="42" fill="${accentColor}" font-size="11" font-weight="bold" font-family="monospace">${tag}</text>

    <!-- Geographic Coordinates Stamp -->
    <rect x="25" y="60" width="180" height="20" rx="3" fill="#000000" opacity="0.5" />
    <text x="32" y="74" fill="#94a3b8" font-size="9.5" font-family="monospace">WGS84 UTM 19S · SALAR GRANDE</text>

    <!-- Species Information Card Overlay -->
    <rect x="25" y="340" width="550" height="85" rx="8" fill="#0f172a" fill-opacity="0.92" stroke="#334155" stroke-width="1.5" />
    <text x="45" y="372" fill="#ffffff" font-size="20" font-weight="bold" font-family="sans-serif">${name}</text>
    <text x="45" y="396" fill="${accentColor}" font-size="14" font-style="italic" font-family="sans-serif">${scientific}</text>
    <text x="45" y="415" fill="#94a3b8" font-size="10.5" font-family="sans-serif">Registro fotográfico georreferenciado verificado en terreno</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
