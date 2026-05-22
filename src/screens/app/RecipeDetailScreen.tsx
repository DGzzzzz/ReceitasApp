import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {ErrorModal} from '../../components/ErrorModal';
import {ConfirmModal} from '../../components/ConfirmModal';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {RecipesStackParamList} from '../../types/navigation';
import {Recipe} from '../../types';
import {getRecipeById} from '../../services/recipeService';
import {useRecipes} from '../../hooks/useRecipes';
import {LoadingSpinner} from '../../components/LoadingSpinner';
import {Icon} from '../../components/Icon';
import {UNIT_LABELS} from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RecipesStackParamList, 'RecipeDetail'>;
  route: RouteProp<RecipesStackParamList, 'RecipeDetail'>;
};

export function RecipeDetailScreen({navigation, route}: Props) {
  const {recipeId} = route.params;
  const {removeRecipe} = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{title: string; message: string} | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setLoadError(null);
      getRecipeById(recipeId)
        .then(setRecipe)
        .catch(e => setLoadError(e.message))
        .finally(() => setLoading(false));
    }, [recipeId]),
  );

  const handleDelete = () => setDeleteConfirm(true);

  const confirmDelete = async () => {
    setDeleteConfirm(false);
    setDeleting(true);
    try {
      await removeRecipe(recipeId, recipe?.photo_url ?? null);
      setDeleteSuccess(true);
    } catch (e: any) {
      setErrorModal({title: 'Erro', message: e.message});
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!recipe) return;
    navigation.setOptions({
      title: recipe.name,
      headerRight: () => (
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('EditRecipe', {recipeId: recipe.id})
            }>
            <Icon name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} disabled={deleting}>
            <Icon name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, deleting]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (loadError) {
    return (
      <View className="flex-1 bg-white">
        <ErrorModal
          visible
          title="Erro"
          message={loadError}
          onClose={() => navigation.goBack()}
        />
      </View>
    );
  }
  if (!recipe) return null;

  return (
    <>
    <ErrorModal
      visible={!!errorModal}
      title={errorModal?.title ?? ''}
      message={errorModal?.message ?? ''}
      onClose={() => setErrorModal(null)}
    />
    <ErrorModal
      visible={deleteSuccess}
      type="success"
      title="Receita excluída"
      message="A receita foi removida com sucesso."
      onClose={() => navigation.goBack()}
    />
    <ConfirmModal
      visible={deleteConfirm}
      title="Excluir receita"
      message={`Deseja excluir "${recipe?.name}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      destructive
      onConfirm={confirmDelete}
      onCancel={() => setDeleteConfirm(false)}
    />
    <ScrollView className="flex-1 bg-white">
      {recipe.photo_url ? (
        <Image
          source={{uri: recipe.photo_url}}
          className="w-full h-64"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 bg-primary-100 items-center justify-center">
          <Icon name="plate-utensils" size={56} color="#fed7aa" />
        </View>
      )}

      <View className="p-5">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          {recipe.name}
        </Text>

        {recipe.description ? (
          <Text className="text-gray-500 mb-4">{recipe.description}</Text>
        ) : null}

        <View className="flex-row gap-4 mb-6">
          {recipe.prep_time_min ? (
            <View className="flex-row items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
              <Icon name="clock" size={14} color="#c2410c" />
              <Text className="text-primary-700 text-sm font-medium">
                {recipe.prep_time_min} min
              </Text>
            </View>
          ) : null}
          {recipe.servings ? (
            <View className="flex-row items-center gap-2 bg-primary-50 rounded-lg px-3 py-2">
              <Icon name="utensils" size={14} color="#c2410c" />
              <Text className="text-primary-700 text-sm font-medium">
                {recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}
              </Text>
            </View>
          ) : null}
        </View>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Ingredientes
            </Text>
            {recipe.ingredients.map((ing, i) => (
              <View
                key={ing.id}
                className={`flex-row items-center py-3 ${
                  i < recipe.ingredients!.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                }`}>
                <View className="w-2 h-2 rounded-full bg-primary-400 mr-3" />
                <Text className="text-gray-700 flex-1">
                  {ing.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {ing.quantity} {UNIT_LABELS[ing.unit]}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Modo de preparo
          </Text>
          <Text className="text-gray-700 leading-6">{recipe.instructions}</Text>
        </View>
      </View>
    </ScrollView>
    </>
  );
}
