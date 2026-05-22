import React, {useState, useCallback, useMemo} from 'react';
import {View, Text, FlatList} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {CommunityStackParamList} from '../../types/navigation';
import {PublicRecipe} from '../../types';
import {getUserPublicRecipes} from '../../services/communityService';
import {RecipeCard} from '../../components/RecipeCard';
import {LoadingSpinner} from '../../components/LoadingSpinner';
import {ErrorModal} from '../../components/ErrorModal';
import {SearchInput} from '../../components/SearchInput';
import {Icon} from '../../components/Icon';

type Props = {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'UserPublicProfile'>;
  route: RouteProp<CommunityStackParamList, 'UserPublicProfile'>;
};

export function UserPublicProfileScreen({navigation, route}: Props) {
  const {userId, userName} = route.params;
  const [recipes, setRecipes] = useState<PublicRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getUserPublicRecipes(userId)
        .then(setRecipes)
        .catch(e => setErrorModal(e.message ?? 'Erro ao carregar perfil'))
        .finally(() => setLoading(false));
    }, [userId]),
  );

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(r => r.name.toLowerCase().includes(q));
  }, [recipes, searchQuery]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <>
      <ErrorModal
        visible={!!errorModal}
        title="Erro"
        message={errorModal ?? ''}
        onClose={() => setErrorModal(null)}
      />
      <FlatList
        className="flex-1 bg-gray-50"
        data={filteredRecipes}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 16, flexGrow: 1}}
        ListHeaderComponent={
          <View>
            <View className="items-center py-6 mb-4">
              <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
                <Icon name="user" size={36} color="#fb923c" />
              </View>
              <Text className="text-xl font-bold text-gray-900">{userName}</Text>
              <Text className="text-sm text-gray-400 mt-1">
                {recipes.length}{' '}
                {recipes.length === 1 ? 'receita pública' : 'receitas públicas'}
              </Text>
            </View>
            {recipes.length > 0 && (
              <View className="mb-4">
                <SearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Filtrar receitas..."
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <Icon name="salad" size={48} color="#d1d5db" />
            <Text className="text-gray-400 mt-3 text-center">
              {searchQuery.trim()
                ? 'Nenhuma receita encontrada'
                : 'Nenhuma receita pública'}
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <RecipeCard
            recipe={item}
            onPress={() =>
              navigation.navigate('PublicRecipeDetail', {
                recipeId: item.id,
                authorName: userName,
                authorId: userId,
              })
            }
          />
        )}
      />
    </>
  );
}
