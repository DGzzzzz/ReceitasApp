import {useState, useCallback} from 'react';
import {Recipe, RecipeFormData} from '../types';
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../services/recipeService';
import {useAuth} from '../contexts/AuthContext';

export function useRecipes() {
  const {user} = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipes(user.id);
      setRecipes(data);
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addRecipe = useCallback(
    async (form: RecipeFormData) => {
      if (!user) throw new Error('Usuário não autenticado');
      const recipe = await createRecipe(form, user.id);
      setRecipes(prev => [recipe, ...prev]);
      return recipe;
    },
    [user],
  );

  const editRecipe = useCallback(
    async (
      recipeId: string,
      form: RecipeFormData,
      currentPhotoUrl: string | null,
    ) => {
      if (!user) throw new Error('Usuário não autenticado');
      const updated = await updateRecipe(
        recipeId,
        form,
        user.id,
        currentPhotoUrl,
      );
      setRecipes(prev => prev.map(r => (r.id === recipeId ? updated : r)));
      return updated;
    },
    [user],
  );

  const removeRecipe = useCallback(
    async (recipeId: string, photoUrl: string | null) => {
      await deleteRecipe(recipeId, photoUrl);
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
    },
    [],
  );

  return {recipes, loading, error, fetchRecipes, addRecipe, editRecipe, removeRecipe};
}
