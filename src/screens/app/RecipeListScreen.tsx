import React, {useEffect, useCallback, useState, useMemo} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {RecipesStackParamList} from '../../types/navigation';
import {useRecipes} from '../../hooks/useRecipes';
import {RecipeCard} from '../../components/RecipeCard';
import {EmptyState} from '../../components/EmptyState';
import {LoadingSpinner} from '../../components/LoadingSpinner';
import {ErrorModal} from '../../components/ErrorModal';
import {SearchInput} from '../../components/SearchInput';
import {Icon} from '../../components/Icon';

type Props = {
  navigation: NativeStackNavigationProp<RecipesStackParamList, 'RecipeList'>;
};

export function RecipeListScreen({navigation}: Props) {
  const {recipes, loading, error, fetchRecipes} = useRecipes();
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [fetchRecipes]),
  );

  useEffect(() => {
    if (error) setErrorModal(error);
  }, [error]);

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(r => r.name.toLowerCase().includes(q));
  }, [recipes, searchQuery]);

  if (loading && recipes.length === 0) {
    return <LoadingSpinner fullScreen message="Carregando receitas..." />;
  }

  return (
    <>
      <ErrorModal
        visible={!!errorModal}
        title="Erro"
        message={errorModal ?? ''}
        onClose={() => setErrorModal(null)}
      />
      <View className="flex-1 bg-gray-50">
        <FlatList
          data={filteredRecipes}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: 16, flexGrow: 1}}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchRecipes}
              colors={['#f97316']}
              tintColor="#f97316"
            />
          }
          ListHeaderComponent={
            recipes.length > 0 ? (
              <View className="mb-4">
                <SearchInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Filtrar receitas..."
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            recipes.length === 0 ? (
              <EmptyState
                title="Nenhuma receita ainda"
                subtitle="Crie sua primeira receita e comece a colecionar!"
                actionLabel="Criar receita"
                onAction={() => navigation.navigate('CreateRecipe')}
              />
            ) : (
              <EmptyState
                title="Nenhuma receita encontrada"
                subtitle={`Nenhuma receita corresponde a "${searchQuery.trim()}"`}
              />
            )
          }
          renderItem={({item}) => (
            <RecipeCard
              recipe={item}
              showVisibility
              onPress={() =>
                navigation.navigate('RecipeDetail', {recipeId: item.id})
              }
            />
          )}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('CreateRecipe')}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 items-center justify-center shadow-lg"
          style={{elevation: 6}}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
}
