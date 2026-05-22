import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RecipesStackParamList} from '../../types/navigation';
import {RecipeFormData} from '../../types';
import {getRecipeById} from '../../services/recipeService';
import {useRecipes} from '../../hooks/useRecipes';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {IngredientList} from '../../components/IngredientList';
import {PhotoPicker} from '../../components/PhotoPicker';
import {LoadingSpinner} from '../../components/LoadingSpinner';
import {ErrorModal} from '../../components/ErrorModal';
import {Icon} from '../../components/Icon';

type Props = {
  navigation: NativeStackNavigationProp<RecipesStackParamList, 'EditRecipe'>;
  route: RouteProp<RecipesStackParamList, 'EditRecipe'>;
};

export function EditRecipeScreen({navigation, route}: Props) {
  const {recipeId} = route.params;
  const {editRecipe} = useRecipes();
  const [form, setForm] = useState<RecipeFormData | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{name?: string; instructions?: string}>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{title: string; message: string} | null>(null);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    getRecipeById(recipeId)
      .then(recipe => {
        setCurrentPhotoUrl(recipe.photo_url);
        setForm({
          name: recipe.name,
          description: recipe.description ?? '',
          instructions: recipe.instructions,
          prep_time_min: recipe.prep_time_min?.toString() ?? '',
          servings: recipe.servings?.toString() ?? '',
          photo_uri: recipe.photo_url,
          is_public: recipe.is_public,
          ingredients: (recipe.ingredients ?? []).map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })),
        });
      })
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [recipeId]);

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
  if (!form) return null;

  const set = (field: keyof RecipeFormData, value: any) =>
    setForm(prev => (prev ? {...prev, [field]: value} : prev));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Nome da receita é obrigatório';
    if (!form.instructions.trim()) e.instructions = 'Modo de preparo é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const validIngredients = form.ingredients.filter(
      ing => ing.name.trim() && ing.quantity.trim(),
    );
    setSaving(true);
    try {
      await editRecipe(recipeId, {...form, ingredients: validIngredients}, currentPhotoUrl);
      setSuccessModal(true);
    } catch (e: any) {
      setErrorModal({title: 'Erro ao salvar', message: e.message ?? 'Tente novamente'});
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <ErrorModal
      visible={!!errorModal}
      title={errorModal?.title ?? ''}
      message={errorModal?.message ?? ''}
      onClose={() => setErrorModal(null)}
    />
    <ErrorModal
      visible={successModal}
      type="success"
      title="Alterações salvas!"
      message="Sua receita foi atualizada com sucesso."
      onClose={() => navigation.goBack()}
    />
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{padding: 16}}
        keyboardShouldPersistTaps="handled">
        <PhotoPicker
          uri={form.photo_uri}
          onSelect={uri => set('photo_uri', uri)}
        />

        <Input
          label="Nome da receita *"
          placeholder="Ex: Bolo de cenoura"
          value={form.name}
          onChangeText={v => set('name', v)}
          error={errors.name}
        />

        <Input
          label="Descrição"
          placeholder="Breve descrição da receita"
          value={form.description}
          onChangeText={v => set('description', v)}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          style={{minHeight: 72}}
        />

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Input
              label="Tempo (min)"
              placeholder="Ex: 45"
              keyboardType="number-pad"
              value={form.prep_time_min}
              onChangeText={v => set('prep_time_min', v)}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Porções"
              placeholder="Ex: 8"
              keyboardType="number-pad"
              value={form.servings}
              onChangeText={v => set('servings', v)}
            />
          </View>
        </View>

        <IngredientList
          ingredients={form.ingredients}
          onChange={ings => set('ingredients', ings)}
        />

        <View className="mt-6">
          <Input
            label="Modo de preparo *"
            placeholder="Descreva o passo a passo..."
            value={form.instructions}
            onChangeText={v => set('instructions', v)}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            style={{minHeight: 160}}
            error={errors.instructions}
          />
        </View>

        <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 mt-2 mb-2">
          <View className="flex-row items-center gap-2">
            <Icon
              name={form.is_public ? 'globe' : 'lock'}
              size={16}
              color={form.is_public ? '#f97316' : '#9ca3af'}
            />
            <View>
              <Text className="text-sm font-semibold text-gray-800">
                {form.is_public ? 'Receita pública' : 'Receita privada'}
              </Text>
              <Text className="text-xs text-gray-400">
                {form.is_public
                  ? 'Visível para todos na comunidade'
                  : 'Só você pode ver'}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-1">
            <TouchableOpacity
              onPress={() => set('is_public', false)}
              className={`px-3 py-1.5 rounded-lg ${!form.is_public ? 'bg-gray-300' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-semibold ${!form.is_public ? 'text-gray-800' : 'text-gray-400'}`}>
                Privada
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => set('is_public', true)}
              className={`px-3 py-1.5 rounded-lg ${form.is_public ? 'bg-primary-500' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-semibold ${form.is_public ? 'text-white' : 'text-gray-400'}`}>
                Pública
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          label="Salvar alterações"
          onPress={handleSave}
          loading={saving}
          className="mt-4 mb-8"
        />
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  );
}
