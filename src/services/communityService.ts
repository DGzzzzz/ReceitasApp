import {supabase} from './supabase';
import {Recipe, PublicRecipe, Profile, Ingredient} from '../types';

async function attachAuthorNames(recipes: Recipe[]): Promise<PublicRecipe[]> {
  if (!recipes.length) return [];
  const userIds = [...new Set(recipes.map(r => r.user_id))];
  const {data: profiles} = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);
  const nameMap = new Map(
    (profiles ?? []).map(p => [p.id, p.full_name ?? 'Usuário']),
  );
  return recipes.map(r => ({
    ...r,
    author_name: nameMap.get(r.user_id) ?? 'Usuário',
  }));
}

export async function getFeedRecipes(): Promise<PublicRecipe[]> {
  const {data, error} = await supabase
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .order('created_at', {ascending: false})
    .limit(30);
  if (error) throw error;
  return attachAuthorNames((data as Recipe[]) ?? []);
}

export const COMMUNITY_PAGE_SIZE = 10;

export async function searchPublicRecipes(
  query: string,
  excludeUserId: string,
  page: number = 0,
): Promise<PublicRecipe[]> {
  const from = page * COMMUNITY_PAGE_SIZE;
  const to = from + COMMUNITY_PAGE_SIZE - 1;
  const {data, error} = await supabase
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .neq('user_id', excludeUserId)
    .ilike('name', `%${query}%`)
    .order('created_at', {ascending: false})
    .range(from, to);
  if (error) throw error;
  return attachAuthorNames((data as Recipe[]) ?? []);
}

export async function searchProfiles(
  query: string,
  excludeUserId: string,
  page: number = 0,
): Promise<Profile[]> {
  const from = page * COMMUNITY_PAGE_SIZE;
  const to = from + COMMUNITY_PAGE_SIZE - 1;
  const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .neq('id', excludeUserId)
    .ilike('full_name', `%${query}%`)
    .range(from, to);
  if (error) throw error;
  return (data as Profile[]) ?? [];
}

export async function getUserPublicRecipes(userId: string): Promise<PublicRecipe[]> {
  const {data: profile} = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();
  const authorName = profile?.full_name ?? 'Usuário';

  const {data, error} = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', {ascending: false});
  if (error) throw error;

  return ((data as Recipe[]) ?? []).map(r => ({...r, author_name: authorName}));
}

export async function copyRecipe(
  recipeId: string,
  targetUserId: string,
): Promise<void> {
  const {data: recipe, error: fetchError} = await supabase
    .from('recipes')
    .select('*, ingredients(*)')
    .eq('id', recipeId)
    .single();
  if (fetchError) throw fetchError;

  const {data: newRecipe, error: insertError} = await supabase
    .from('recipes')
    .insert({
      user_id: targetUserId,
      name: recipe.name,
      description: recipe.description,
      instructions: recipe.instructions,
      photo_url: recipe.photo_url,
      prep_time_min: recipe.prep_time_min,
      servings: recipe.servings,
      is_public: false,
    })
    .select()
    .single();
  if (insertError) throw insertError;

  const ingredients: Ingredient[] = recipe.ingredients ?? [];
  if (ingredients.length > 0) {
    const {error: ingError} = await supabase.from('ingredients').insert(
      ingredients.map((ing, i) => ({
        recipe_id: newRecipe.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        sort_order: i,
      })),
    );
    if (ingError) throw ingError;
  }
}
