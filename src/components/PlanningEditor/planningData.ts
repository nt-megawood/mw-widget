// Planning editor data for the terrace planner — mirrors DIELEN_VARIANTS / DIELEN_COLORS in script.js

export type ShapeVariant = 'rechteck' | 'lform' | 'uform' | 'oform';

export interface PlanningFormField {
  key: string;
  label: string;
}

export const PLANNING_FORM_FIELDS: Record<ShapeVariant, PlanningFormField[]> = {
  rechteck: [
    { key: 'rechteck_mass_1', label: 'Breite (m)' },
    { key: 'rechteck_mass_2', label: 'Länge (m)' },
  ],
  lform: [
    { key: 'l_width_1', label: 'L Breite 1 (m)' },
    { key: 'l_length_1', label: 'L Länge 1 (m)' },
    { key: 'l_width_2', label: 'L Breite 2 (m)' },
    { key: 'l_length_2', label: 'L Länge 2 (m)' },
  ],
  uform: [
    { key: 'u_width_1', label: 'U Breite 1 (m)' },
    { key: 'u_length_1', label: 'U Länge 1 (m)' },
    { key: 'u_width_2', label: 'U Breite 2 (m)' },
    { key: 'u_length_2', label: 'U Länge 2 (m)' },
    { key: 'u_width_3', label: 'U Breite 3 (m)' },
    { key: 'u_length_3', label: 'U Länge 3 (m)' },
  ],
  oform: [
    { key: 'o_length_1', label: 'O Länge 1 (m)' },
    { key: 'o_length_2', label: 'O Länge 2 (m)' },
    { key: 'o_length_3', label: 'O Länge 3 (m)' },
    { key: 'o_length_4', label: 'O Länge 4 (m)' },
    { key: 'o_width_1', label: 'O Breite 1 (m)' },
    { key: 'o_width_2', label: 'O Breite 2 (m)' },
  ],
};

export interface DielenVariant {
  name: string;
  masse: string;
  colors: number[];
}

export const DIELEN_VARIANTS: Record<number, DielenVariant> = {
  1:  { name: 'PREMIUM',      masse: '21x145', colors: [1, 2, 3] },
  2:  { name: 'PREMIUM',      masse: '21x242', colors: [1, 2, 3] },
  3:  { name: 'PREMIUM PLUS', masse: '21x145', colors: [4, 5] },
  4:  { name: 'PREMIUM PLUS', masse: '21x242', colors: [4, 5] },
  5:  { name: 'CLASSIC',      masse: '21x145', colors: [1, 2, 3, 4, 5, 36, 37, 38] },
  13: { name: 'SIGNUM',       masse: '21x242', colors: [6, 7] },
  14: { name: 'SIGNUM',       masse: '21x145', colors: [6, 7, 26, 31, 32, 33] },
  22: { name: 'DYNUM',        masse: '21x242', colors: [12, 13, 16, 17, 18] },
  23: { name: 'DYNUM',        masse: '25x293', colors: [12, 13] },
  49: { name: 'DELTA',        masse: '21x145', colors: [16, 17, 18, 24, 26] },
};

export const DIELEN_COLORS: Record<number, string> = {
  1: 'Naturbraun',
  2: 'Nussbraun',
  3: 'Basaltgrau',
  4: 'Lavabraun',
  5: 'Schiefergrau',
  6: 'Muskat',
  7: 'Tonka',
  8: 'Terra',
  9: 'Graphit',
  10: 'Braun',
  11: 'Grau',
  12: 'Cardamom',
  13: 'Nigella',
  16: 'Sel gris',
  17: 'Ingwer',
  18: 'Lorbeer',
  19: 'Ecru',
  20: 'Jade',
  21: 'Platin',
  22: 'Umbra',
  23: 'Titan',
  24: 'Varia Grau',
  25: 'Varia Braun',
  26: 'Varia Schokoschwarz',
  27: 'Fokus grün',
  28: 'Fokus braun',
  29: 'Fokus grau',
  30: 'Fokus Schokoschwarz',
  31: 'Malui grau',
  32: 'Mentha Nigra',
  33: 'Anise',
  34: 'Grünschwarz',
  35: 'Sandbraun',
  36: 'Amber Tan',
  37: 'Amber Chocolate',
  38: 'Amber Grey',
};

export const SHAPE_LABELS: Record<ShapeVariant, string> = {
  rechteck: 'Rechteck',
  lform: 'L-Form',
  uform: 'U-Form',
  oform: 'O-Form',
};

export const PROFIL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silber' },
  { value: 'anthracite', label: 'Anthrazit' },
];

export const UK_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'standard', label: 'Betonrandstein' },
  { value: 'variofix1', label: 'VARIO FIX I' },
  { value: 'variofix2', label: 'VARIO FIX II' },
];

export function normalizePlanningForm(rawForm: unknown): ShapeVariant {
  const cleaned = String(rawForm || '').trim().toLowerCase();
  if (PLANNING_FORM_FIELDS[cleaned as ShapeVariant]) return cleaned as ShapeVariant;
  return 'rechteck';
}

export function parseGroesseValue(rawValue: unknown): Record<string, unknown> {
  if (typeof rawValue === 'object' && rawValue !== null) return rawValue as Record<string, unknown>;
  if (typeof rawValue !== 'string' || !rawValue.trim()) return {};
  try {
    return JSON.parse(rawValue) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function toPositiveNumber(value: unknown): number | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Number(num.toFixed(3));
}
