import {supabase} from './supabase';
import {Recipe, Ingredient, RecipeFormData} from '../types';
import {uploadPhoto, deletePhoto} from './storageService';

export async function getRecipes(userId: string): Promise<Recipe[]> {
  const {data, error} = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data as Recipe[];
}

export async function getRecipeById(recipeId: string): Promise<Recipe> {
  const {data: recipe, error: recipeError} = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();
  if (recipeError) throw recipeError;

  const {data: ingredients, error: ingError} = await supabase
    .from('ingredients')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('sort_order', {ascending: true});
  if (ingError) throw ingError;

  return {...(recipe as Recipe), ingredients: ingredients as Ingredient[]};
}

export async function createRecipe(
  form: RecipeFormData,
  userId: string,
): Promise<Recipe> {
  let photo_url: string | null = null;

  if (form.photo_uri) {
    photo_url = await uploadPhoto(form.photo_uri, userId);
  }

  const {data: recipe, error: recipeError} = await supabase
    .from('recipes')
    .insert({
      user_id: userId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      instructions: form.instructions.trim(),
      photo_url,
      prep_time_min: form.prep_time_min ? Number(form.prep_time_min) : null,
      servings: form.servings ? Number(form.servings) : null,
      is_public: form.is_public,
    })
    .select()
    .single();

  if (recipeError) throw recipeError;

  if (form.ingredients.length > 0) {
    const {error: ingError} = await supabase.from('ingredients').insert(
      form.ingredients.map((ing, index) => ({
        recipe_id: (recipe as Recipe).id,
        name: ing.name.trim(),
        quantity: ing.quantity.trim(),
        unit: ing.unit,
        sort_order: index,
      })),
    );

    if (ingError) {
      await supabase.from('recipes').delete().eq('id', (recipe as Recipe).id);
      throw ingError;
    }
  }

  return recipe as Recipe;
}

export async function updateRecipe(
  recipeId: string,
  form: RecipeFormData,
  userId: string,
  currentPhotoUrl: string | null,
): Promise<Recipe> {
  let photo_url = currentPhotoUrl;

  if (form.photo_uri && form.photo_uri !== currentPhotoUrl) {
    if (currentPhotoUrl) {
      await deletePhoto(currentPhotoUrl).catch(() => {});
    }
    photo_url = await uploadPhoto(form.photo_uri, userId);
  }

  const {data: recipe, error: recipeError} = await supabase
    .from('recipes')
    .update({
      name: form.name.trim(),
      description: form.description.trim() || null,
      instructions: form.instructions.trim(),
      photo_url,
      prep_time_min: form.prep_time_min ? Number(form.prep_time_min) : null,
      servings: form.servings ? Number(form.servings) : null,
      is_public: form.is_public,
    })
    .eq('id', recipeId)
    .select()
    .single();

  if (recipeError) throw recipeError;

  await supabase.from('ingredients').delete().eq('recipe_id', recipeId);

  if (form.ingredients.length > 0) {
    const {error: ingError} = await supabase.from('ingredients').insert(
      form.ingredients.map((ing, index) => ({
        recipe_id: recipeId,
        name: ing.name.trim(),
        quantity: ing.quantity.trim(),
        unit: ing.unit,
        sort_order: index,
      })),
    );
    if (ingError) throw ingError;
  }

  return recipe as Recipe;
}

export async function deleteRecipe(
  recipeId: string,
  photoUrl: string | null,
) {
  if (photoUrl) {
    await deletePhoto(photoUrl).catch(() => {});
  }
  const {error} = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId);
  if (error) throw error;
}
