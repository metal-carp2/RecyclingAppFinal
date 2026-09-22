import { MaterialKey } from '../data/materials';

// Open Food Facts is a free, keyless, crowd-sourced product database.
// Docs: https://world.openfoodfacts.org/data
const API_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = 'status,product_name,image_front_small_url,packagings,packaging_materials_tags';

export type PackagingComponent = {
  /** Raw Open Food Facts tag, e.g. "en:clear-glass". Kept for display/debugging. */
  rawMaterialTag: string;
  /** Our internal category, or null if we don't have a mapping for this tag. */
  material: MaterialKey | null;
  shape?: string;
  /**
   * Measured (preferred) or specified packaging weight in grams, when the
   * community has actually recorded it. Frequently absent — most packaging
   * components in Open Food Facts have a material tag but no weight.
   */
  weightGrams?: number;
};

export type ScannedProduct = {
  barcode: string;
  name: string;
  imageUrl?: string;
  components: PackagingComponent[];
};

export type LookupResult =
  | { status: 'found'; product: ScannedProduct }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

// Maps Open Food Facts packaging material tags to our calculator categories.
// OFF's material taxonomy is deep (e.g. "en:pet-1-polyethylene-terephthalate" is a
// child of "en:plastic"), so we match on substrings rather than an exact list.
function mapMaterialTag(tag: string): MaterialKey | null {
  const t = tag.toLowerCase();
  if (t.includes('glass')) return 'glass';
  if (t.includes('aluminium') || t.includes('aluminum')) return 'aluminum';
  if (t.includes('steel') || t.includes('tin') || (t.includes('metal') && !t.includes('aluminium'))) {
    return 'steel';
  }
  if (t.includes('plastic') || t.includes('pet-') || t.includes('pe-') || t.includes('pp-')) {
    return 'plastics';
  }
  if (t.includes('cardboard') || t.includes('paper')) return 'paper';
  if (t.includes('compost') || t.includes('organic')) return 'compostables';
  return null;
}

export async function fetchProductByBarcode(barcode: string): Promise<LookupResult> {
  const trimmed = barcode.trim();
  if (!trimmed) return { status: 'error', message: 'Enter a barcode.' };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/${encodeURIComponent(trimmed)}.json?fields=${FIELDS}`);
  } catch {
    return { status: 'error', message: 'Could not reach Open Food Facts. Check your connection.' };
  }

  if (!response.ok) {
    return { status: 'error', message: `Lookup failed (HTTP ${response.status}).` };
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    return { status: 'error', message: 'Unexpected response from Open Food Facts.' };
  }

  if (data.status !== 1 || !data.product) {
    return { status: 'not_found' };
  }

  const p = data.product;
  const rawPackagings: any[] = Array.isArray(p.packagings) ? p.packagings : [];

  const components: PackagingComponent[] = rawPackagings
    .filter((pkg) => typeof pkg.material === 'string')
    .map((pkg) => ({
      rawMaterialTag: pkg.material as string,
      material: mapMaterialTag(pkg.material as string),
      shape: typeof pkg.shape === 'string' ? pkg.shape.replace('en:', '') : undefined,
      weightGrams:
        typeof pkg.weight_measured === 'number'
          ? pkg.weight_measured
          : typeof pkg.weight_specified === 'number'
          ? pkg.weight_specified
          : undefined,
    }));

  // Fall back to packaging_materials_tags (no weight/shape) if the detailed
  // packagings array is empty — many products only have the coarser tag list.
  if (components.length === 0 && Array.isArray(p.packaging_materials_tags)) {
    for (const tag of p.packaging_materials_tags as string[]) {
      components.push({ rawMaterialTag: tag, material: mapMaterialTag(tag) });
    }
  }

  return {
    status: 'found',
    product: {
      barcode: trimmed,
      name: typeof p.product_name === 'string' && p.product_name ? p.product_name : 'Unknown product',
      imageUrl: typeof p.image_front_small_url === 'string' ? p.image_front_small_url : undefined,
      components,
    },
  };
}
