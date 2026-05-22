import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CommunityStackParamList} from '../../types/navigation';
import {PublicRecipe, Profile} from '../../types';
import {
  searchPublicRecipes,
  searchProfiles,
  COMMUNITY_PAGE_SIZE,
} from '../../services/communityService';
import {useAuth} from '../../contexts/AuthContext';
import {RecipeCard} from '../../components/RecipeCard';
import {ErrorModal} from '../../components/ErrorModal';
import {SearchInput} from '../../components/SearchInput';
import {Icon} from '../../components/Icon';

type Props = {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'Community'>;
};

type SearchMode = 'recipes' | 'people';

export function CommunityScreen({navigation}: Props) {
  const {user} = useAuth();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('recipes');
  const [recipeResults, setRecipeResults] = useState<PublicRecipe[]>([]);
  const [peopleResults, setPeopleResults] = useState<Profile[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(
    async (q: string, m: SearchMode, p: number, append: boolean) => {
      if (!user?.id) return;
      if (append) setLoadingMore(true);
      else setSearching(true);
      try {
        if (m === 'recipes') {
          const data = await searchPublicRecipes(q, user.id, p);
          setRecipeResults(prev => (append ? [...prev, ...data] : data));
          setHasMore(data.length === COMMUNITY_PAGE_SIZE);
        } else {
          const data = await searchProfiles(q, user.id, p);
          setPeopleResults(prev => (append ? [...prev, ...data] : data));
          setHasMore(data.length === COMMUNITY_PAGE_SIZE);
        }
        setPage(p);
        setSearched(true);
      } catch (e: any) {
        setErrorModal(e.message ?? 'Erro na busca');
      } finally {
        setSearching(false);
        setLoadingMore(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    if (!query.trim()) {
      setRecipeResults([]);
      setPeopleResults([]);
      setSearched(false);
      setPage(0);
      setHasMore(false);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      performSearch(query.trim(), mode, 0, false);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query, mode, performSearch]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore || searching || !query.trim()) return;
    performSearch(query.trim(), mode, page + 1, true);
  }, [hasMore, loadingMore, searching, query, mode, page, performSearch]);

  const hasQuery = query.trim().length > 0;
  const listFooter = loadingMore ? (
    <View className="py-4">
      <ActivityIndicator color="#f97316" />
    </View>
  ) : null;

  return (
    <>
      <ErrorModal
        visible={!!errorModal}
        title="Erro"
        message={errorModal ?? ''}
        onClose={() => setErrorModal(null)}
      />
      <View className="flex-1 bg-gray-50">
        <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
          <SearchInput
            value={query}
            onChangeText={setQuery}
            placeholder={mode === 'recipes' ? 'Buscar receitas...' : 'Buscar pessoas...'}
          />

          <View className="flex-row mt-3 gap-2">
            <TouchableOpacity
              onPress={() => setMode('recipes')}
              className={`flex-1 py-2 rounded-lg items-center ${
                mode === 'recipes' ? 'bg-primary-500' : 'bg-gray-100'
              }`}>
              <Text
                className={`text-sm font-semibold ${
                  mode === 'recipes' ? 'text-white' : 'text-gray-500'
                }`}>
                Receitas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('people')}
              className={`flex-1 py-2 rounded-lg items-center ${
                mode === 'people' ? 'bg-primary-500' : 'bg-gray-100'
              }`}>
              <Text
                className={`text-sm font-semibold ${
                  mode === 'people' ? 'text-white' : 'text-gray-500'
                }`}>
                Pessoas
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!hasQuery ? (
          <View className="flex-1 items-center justify-center px-8">
            <Icon name="search" size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-base font-medium mt-4 text-center">
              Descubra receitas e pessoas
            </Text>
            <Text className="text-gray-300 text-sm mt-1 text-center">
              {mode === 'recipes'
                ? 'Busque por nome de receita'
                : 'Busque pelo nome de um usuário'}
            </Text>
          </View>
        ) : searching ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : mode === 'people' ? (
          <FlatList
            data={peopleResults}
            keyExtractor={item => item.id}
            contentContainerStyle={{padding: 16, flexGrow: 1}}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={listFooter}
            ListEmptyComponent={
              searched ? (
                <View className="flex-1 items-center justify-center py-16">
                  <Icon name="users" size={48} color="#d1d5db" />
                  <Text className="text-gray-400 mt-3 text-center">
                    Nenhuma pessoa encontrada
                  </Text>
                </View>
              ) : null
            }
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('UserPublicProfile', {
                    userId: item.id,
                    userName: item.full_name ?? 'Usuário',
                  })
                }
                className="bg-white rounded-2xl mb-3 px-4 py-4 flex-row items-center gap-3 shadow-sm border border-gray-100 active:opacity-80">
                <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                  <Icon name="user" size={22} color="#fb923c" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {item.full_name ?? 'Usuário'}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">{item.email}</Text>
                </View>
                <Icon name="angle-right" size={16} color="#d1d5db" />
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            data={recipeResults}
            keyExtractor={item => item.id}
            contentContainerStyle={{padding: 16, flexGrow: 1}}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={listFooter}
            ListEmptyComponent={
              searched ? (
                <View className="flex-1 items-center justify-center py-16">
                  <Icon name="salad" size={48} color="#d1d5db" />
                  <Text className="text-gray-400 mt-3 text-center">
                    Nenhuma receita encontrada
                  </Text>
                </View>
              ) : null
            }
            renderItem={({item}) => (
              <RecipeCard
                recipe={item}
                authorName={item.author_name}
                onPress={() =>
                  navigation.navigate('PublicRecipeDetail', {
                    recipeId: item.id,
                    authorName: item.author_name,
                    authorId: item.user_id,
                  })
                }
                onAuthorPress={() =>
                  navigation.navigate('UserPublicProfile', {
                    userId: item.user_id,
                    userName: item.author_name,
                  })
                }
              />
            )}
          />
        )}
      </View>
    </>
  );
}
