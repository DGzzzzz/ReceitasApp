import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {CommunityStackParamList} from '../../types/navigation';
import {Recipe, UNIT_LABELS} from '../../types';
import {getRecipeById} from '../../services/recipeService';
import {copyRecipe} from '../../services/communityService';
import {useAuth} from '../../contexts/AuthContext';
import {LoadingSpinner} from '../../components/LoadingSpinner';
import {ErrorModal} from '../../components/ErrorModal';
import {Icon} from '../../components/Icon';

type Props = {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'PublicRecipeDetail'>;
  route: RouteProp<CommunityStackParamList, 'PublicRecipeDetail'>;
};

export function PublicRecipeDetailScreen({navigation, route}: Props) {
  const {recipeId, authorName} = route.params;
  const {user} = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    getRecipeById(recipeId)
      .then(setRecipe)
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [recipeId]);

  useEffect(() => {
    if (!recipe) return;
    navigation.setOptions({title: recipe.name});
  }, [recipe, navigation]);

  const handleCopy = async () => {
    if (!user?.id) return;
    setCopying(true);
    try {
      await copyRecipe(recipeId, user.id);
      setSuccessModal(true);
    } catch (e: any) {
      setErrorModal(e.message ?? 'Erro ao copiar receita');
    } finally {
      setCopying(false);
    }
  };

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
        title="Erro ao copiar"
        message={errorModal ?? ''}
        onClose={() => setErrorModal(null)}
      />
      <ErrorModal
        visible={successModal}
        type="success"
        title="Receita copiada!"
        message="A receita foi adicionada às suas receitas."
        onClose={() => {
          setSuccessModal(false);
          navigation.goBack();
        }}
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
          <Text className="text-sm text-primary-500 font-medium mb-3">
            por {authorName}
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
                  {recipe.servings}{' '}
                  {recipe.servings === 1 ? 'porção' : 'porções'}
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
                    i < (recipe.ingredients?.length ?? 0) - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}>
                  <View className="w-2 h-2 rounded-full bg-primary-400 mr-3" />
                  <Text className="text-gray-700 flex-1">{ing.name}</Text>
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

      <View className="bg-white border-t border-gray-100 px-5 py-4">
        <TouchableOpacity
          onPress={handleCopy}
          disabled={copying}
          className="bg-primary-500 rounded-xl py-4 flex-row items-center justify-center gap-2 active:opacity-80"
          style={{opacity: copying ? 0.6 : 1}}>
          <Icon name="copy" size={18} color="#fff" />
          <Text className="text-white font-bold text-base">
            {copying ? 'Copiando...' : 'Copiar receita'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
