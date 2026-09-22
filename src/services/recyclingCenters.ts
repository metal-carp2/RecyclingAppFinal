import { MaterialKey } from '../data/materials';

// OpenStreetMap's Overpass API is free and keyless. Coverage is crowd-sourced and
// varies a lot by region: some areas have richly tagged recycling centers with
// per-material info, others only have generic unnamed drop-off bins, and some
// have nothing mapped nearby at all. We surface exactly what's there rather than
// padding results with invented data.
const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const SEARCH_RADIUS_METERS = 40000; // ~25 miles
const RESULT_LIMIT = 30;

export type LiveRecyclingCenter = {
  id: number;
  name: string;
  recyclingType: 'centre' | 'container' | 'unknown';
  lat: number;
  lon: number;
  distanceMiles: number;
  materials: MaterialKey[];
  /** True if OSM had no material-specific tags at all for this point. */
  materialsUnknown: boolean;
};

export type NearbySearchResult =
  | { status: 'ok'; centers: LiveRecyclingCenter[] }
  | { status: 'permission_denied' }
  | { status: 'error'; message: string };

// Maps OpenStreetMap's recycling:* tags to our calculator categories.
// See https://wiki.openstreetmap.org/wiki/Key:recycling
const TAG_TO_MATERIAL: [substring: string, material: MaterialKey][] = [
  ['glass', 'glass'],
  ['aluminium', 'aluminum'],
  ['cans', 'aluminum'],
  ['scrap_metal', 'steel'],
  ['metal', 'steel'],
  ['paper', 'paper'],
  ['cardboard', 'paper'],
  ['plastic', 'plastics'],
  ['green_waste', 'compostables'],
  ['organic', 'compostables'],
  ['garden_waste', 'compostables'],
];

function materialsFromTags(tags: Record<string, string>): { materials: MaterialKey[]; unknown: boolean } {
  const found = new Set<MaterialKey>();
  let sawAnyRecyclingTag = false;

  for (const [key, value] of Object.entries(tags)) {
    if (!key.startsWith('recycling:') || value !== 'yes') continue;
    sawAnyRecyclingTag = true;
    const suffix = key.slice('recycling:'.length);
    for (const [substring, material] of TAG_TO_MATERIAL) {
      if (suffix.includes(substring)) {
        found.add(material);
        break;
      }
    }
  }

  return { materials: Array.from(found), unknown: !sawAnyRecyclingTag };
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function labelFor(tags: Record<string, string>): string {
  if (tags.name) return tags.name;
  if (tags.recycling_type === 'centre') return 'Recycling Center (unnamed)';
  if (tags.recycling_type === 'container') return 'Recycling Drop-off Point';
  return 'Recycling Point';
}

export async function fetchNearbyRecyclingCenters(lat: number, lon: number): Promise<NearbySearchResult> {
  const query = `[out:json][timeout:25];node["amenity"="recycling"](around:${SEARCH_RADIUS_METERS},${lat},${lon});out body ${RESULT_LIMIT * 3};`;

  let response: Response;
  try {
    response = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query,
    });
  } catch {
    return { status: 'error', message: 'Could not reach OpenStreetMap. Check your connection.' };
  }

  if (!response.ok) {
    return { status: 'error', message: `Lookup failed (HTTP ${response.status}). The Overpass API is a shared free service and is sometimes busy — try again shortly.` };
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    return { status: 'error', message: 'Unexpected response from OpenStreetMap.' };
  }

  const elements: any[] = Array.isArray(data.elements) ? data.elements : [];

  const centers: LiveRecyclingCenter[] = elements.map((el) => {
    const tags: Record<string, string> = el.tags ?? {};
    const { materials, unknown } = materialsFromTags(tags);
    return {
      id: el.id,
      name: labelFor(tags),
      recyclingType: tags.recycling_type === 'centre' || tags.recycling_type === 'container' ? tags.recycling_type : 'unknown',
      lat: el.lat,
      lon: el.lon,
      distanceMiles: haversineMiles(lat, lon, el.lat, el.lon),
      materials,
      materialsUnknown: unknown,
    };
  });

  centers.sort((a, b) => a.distanceMiles - b.distanceMiles);

  return { status: 'ok', centers: centers.slice(0, RESULT_LIMIT) };
}

export function directionsUrl(center: LiveRecyclingCenter): string {
  return `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lon}`;
}
