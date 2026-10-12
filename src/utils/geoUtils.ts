import { UTMCoordinate } from '../types/sampling';

/**
 * Converts Decimal Latitude and Longitude to WGS84 UTM coordinates.
 */
export function latLngToUTM(lat: number, lng: number): UTMCoordinate {
  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
    return { easting: 0, northing: 0, zone: '19S', formatted: 'Sin datos' };
  }
  const a = 6378137.0; // WGS84 Semi-major axis
  const f = 1 / 298.257223563; // Flattening
  const k0 = 0.9996; // Scale factor

  const zoneNumber = Math.floor((lng + 180) / 6) + 1;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const lng0 = ((zoneNumber - 1) * 6 - 180 + 3) * (Math.PI / 180);

  const e2 = 2 * f - f * f;
  const e2prime = e2 / (1 - e2);

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = e2prime * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lngRad - lng0);

  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * Math.pow(e2, 3)) / 256) * latRad -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * Math.pow(e2, 3)) / 1024) * Math.sin(2 * latRad) +
      ((15 * e2 * e2) / 256 + (45 * Math.pow(e2, 3)) / 1024) * Math.sin(4 * latRad) -
      ((35 * Math.pow(e2, 3)) / 3072) * Math.sin(6 * latRad));

  const easting =
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * e2prime) * Math.pow(A, 5)) / 120) +
    500000.0;

  let northing =
    k0 *
    (M +
      N *
        Math.tan(latRad) *
        (Math.pow(A, 2) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * e2prime) * Math.pow(A, 6)) / 720));

  if (lat < 0) {
    northing += 10000000.0;
  }

  const zoneStr = `${zoneNumber}${lat >= 0 ? 'N' : 'S'}`;
  const eastRound = Math.round(easting);
  const northRound = Math.round(northing);

  return {
    easting: eastRound,
    northing: northRound,
    zone: zoneStr,
    formatted: `Zona ${zoneStr} | E: ${eastRound} | N: ${northRound}`
  };
}

/**
 * Converts WGS84 UTM coordinates back to Decimal Degrees Lat/Lng.
 */
export function utmToLatLng(
  easting: number,
  northing: number,
  zoneStr: string
): { lat: number; lng: number } | null {
  if (!easting || !northing || !zoneStr) return null;

  const match = zoneStr.trim().match(/^(\d+)\s*([NnSs])?$/);
  if (!match) return null;

  const zoneNum = parseInt(match[1], 10);
  const hemi = (match[2] || 'S').toUpperCase();

  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const e2 = 2 * f - f * f;
  const e2prime = e2 / (1 - e2);

  const x = easting - 500000.0;
  let y = northing;
  if (hemi === 'S') {
    y -= 10000000.0;
  }

  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * Math.pow(e2, 3)) / 256));

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu) +
    ((1097 * Math.pow(e1, 4)) / 512) * Math.sin(8 * mu);

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) * Math.sin(phi1));
  const T1 = Math.tan(phi1) * Math.tan(phi1);
  const C1 = e2prime * Math.cos(phi1) * Math.cos(phi1);
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * Math.sin(phi1) * Math.sin(phi1), 1.5);
  const D = x / (N1 * k0);

  let lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e2prime) * Math.pow(D, 4)) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e2prime - 3 * C1 * C1) * Math.pow(D, 6)) / 720);

  const lng0 = ((zoneNum - 1) * 6 - 180 + 3) * (Math.PI / 180);
  let lng =
    lng0 +
    (D -
      ((1 + 2 * T1 + C1) * Math.pow(D, 3)) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e2prime + 24 * T1 * T1) * Math.pow(D, 5)) / 120) /
      Math.cos(phi1);

  lat = (lat * 180) / Math.PI;
  lng = (lng * 180) / Math.PI;

  return {
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6))
  };
}

export function getCurrentDateTimeLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatDateTime(dtStr: string): string {
  if (!dtStr) return 'N/R';
  const dt = new Date(dtStr);
  if (isNaN(dt.getTime())) return dtStr;
  return dt.toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Andrew's monotone chain 2D convex hull algorithm to calculate polygon bounding of species points.
 */
export function calculateConvexHull(points: [number, number][]): [number, number][] {
  if (points.length <= 2) return points;

  const sorted = [...points].sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);

  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
