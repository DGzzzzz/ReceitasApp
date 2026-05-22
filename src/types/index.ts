export type UnitType =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'xicara'
  | 'colher_sopa'
  | 'colher_cha'
  | 'unidade'
  | 'pitada'
  | 'a_gosto';

export const UNIT_LABELS: Record<UnitType, string> = {
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  l: 'L',
  xicara: 'xícara',
  colher_sopa: 'col. sopa',
  colher_cha: 'col. chá',
  unidade: 'unid.',
  pitada: 'pitada',
  a_gosto: 'a gosto',
};

export const UNIT_OPTIONS: {label: string; value: UnitType}[] = [
  {label: 'g', value: 'g'},
  {label: 'kg', value: 'kg'},
  {label: 'ml', value: 'ml'},
  {label: 'L', value: 'l'},
  {label: 'Xícara', value: 'xicara'},
  {label: 'Colher de sopa', value: 'colher_sopa'},
  {label: 'Colher de chá', value: 'colher_cha'},
  {label: 'Unidade', value: 'unidade'},
  {label: 'Pitada', value: 'pitada'},
  {label: 'A gosto', value: 'a_gosto'},
];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: string;
  unit: UnitType;
  sort_order: number;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  instructions: string;
  photo_url: string | null;
  prep_time_min: number | null;
  servings: number | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  ingredients?: Ingredient[];
}

export interface PublicRecipe extends Recipe {
  author_name: string;
}

export type IngredientFormData = {
  name: string;
  quantity: string;
  unit: UnitType;
};

export type RecipeFormData = {
  name: string;
  description: string;
  instructions: string;
  prep_time_min: string;
  servings: string;
  photo_uri: string | null;
  ingredients: IngredientFormData[];
  is_public: boolean;
};
