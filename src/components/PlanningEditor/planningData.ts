// Planning editor data for the terrace planner

export type ShapeVariant = 'rechteck' | 'lform' | 'uform' | 'oform';

export interface DielenProduct {
  id: string;
  name: string;
  sizes: string[];
  colors: string[];
}

export const COLORS = [
  'Naturbraun', 'Basaltgrau', 'Teak', 'Zedernrot', 'Anthrazit', 'Elfenbein',
  'Schokoladenbraun', 'Silbergrau', 'Eiche', 'Goldbraun', 'Graphit', 'Creme',
  'Mocca', 'Sandstein', 'Kastanie', 'Dunkelgrau', 'Hellgrau', 'Nussbaum',
  'Mahagoni', 'Pinie', 'Lärche', 'Ahorn', 'Esche', 'Wenge', 'Bamboo',
  'Birnbaum', 'Buche', 'Douglasie', 'Fichte', 'Kiefer', 'Kirsche', 'Linde',
  'Olive', 'Robinie', 'Tanne', 'Ulme', 'Zirbe', 'Zwiebel'
];

export const DIELEN_PRODUCTS: DielenProduct[] = [
  { id: 'eco145', name: 'ECO 145', sizes: ['145x21'], colors: COLORS.slice(0, 10) },
  { id: 'eco195', name: 'ECO 195', sizes: ['195x21'], colors: COLORS.slice(0, 10) },
  { id: 'style145', name: 'STYLE 145', sizes: ['145x24'], colors: COLORS.slice(0, 15) },
  { id: 'style195', name: 'STYLE 195', sizes: ['195x24'], colors: COLORS.slice(0, 15) },
  { id: 'premium145', name: 'PREMIUM 145', sizes: ['145x27'], colors: COLORS },
  { id: 'premium195', name: 'PREMIUM 195', sizes: ['195x27'], colors: COLORS },
];

export const SHAPE_LABELS: Record<ShapeVariant, string> = {
  rechteck: 'Rechteck',
  lform: 'L-Form',
  uform: 'U-Form',
  oform: 'O-Form',
};

export const PROFIL_OPTIONS = ['Voll', 'Hohl', 'Massiv'];
export const UK_OPTIONS = ['Alu', 'Holz', 'Stahl'];
