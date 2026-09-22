export type MaterialKey = 'paper' | 'aluminum' | 'steel' | 'plastics' | 'compostables';

export type MaterialDef = {
  key: MaterialKey;
  label: string;
  // Cash-back rate in dollars per pound.
  ratePerPound: number;
};

// Rates derived from the original app's demo: 45 lbs of aluminum -> $22.50 (=$0.50/lb).
// Other materials' rates are estimated from typical scrap recycling cash-back values.
export const MATERIALS: MaterialDef[] = [
  { key: 'paper', label: 'Paper', ratePerPound: 0.09 },
  { key: 'aluminum', label: 'Aluminum', ratePerPound: 0.5 },
  { key: 'steel', label: 'Steel', ratePerPound: 0.25 },
  { key: 'plastics', label: 'Plastics', ratePerPound: 0.1 },
  { key: 'compostables', label: 'Compostables', ratePerPound: 0 },
];

export type WeightUnit = 'lbs' | 'g' | 'kg' | 'oz';

export const WEIGHT_UNITS: WeightUnit[] = ['lbs', 'g', 'kg', 'oz'];

export function toPounds(value: number, unit: WeightUnit): number {
  switch (unit) {
    case 'lbs':
      return value;
    case 'g':
      return value / 453.592;
    case 'kg':
      return value * 2.20462;
    case 'oz':
      return value / 16;
    default:
      return value;
  }
}
