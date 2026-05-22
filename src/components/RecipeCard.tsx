import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {Recipe} from '../types';
import {Icon} from './Icon';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  showVisibility?: boolean;
  authorName?: string;
  onAuthorPress?: () => void;
}

export function RecipeCard({
  recipe,
  onPress,
  showVisibility,
  authorName,
  onAuthorPress,
}: RecipeCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100 active:opacity-80">
      {recipe.photo_url ? (
        <Image
          source={{uri: recipe.photo_url}}
          className="w-full h-44"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-44 bg-primary-100 items-center justify-center">
          <Icon name="plate-utensils" size={48} color="#fed7aa" />
        </View>
      )}

      {showVisibility && (
        <View className={`absolute top-2 right-2 flex-row items-center gap-1 px-2 py-1 rounded-lg ${recipe.is_public ? 'bg-primary-500/90' : 'bg-black/50'}`}>
          <Icon name={recipe.is_public ? 'globe' : 'lock'} size={11} color="#fff" />
          <Text className="text-white text-xs font-medium">
            {recipe.is_public ? 'Público' : 'Privado'}
          </Text>
        </View>
      )}

      <View className="p-4">
        <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
          {recipe.name}
        </Text>

        {authorName && (
          <TouchableOpacity
            onPress={onAuthorPress}
            disabled={!onAuthorPress}
            hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}>
            <Text className="text-xs text-primary-500 font-medium mt-0.5">
              por {authorName}
            </Text>
          </TouchableOpacity>
        )}

        {recipe.description ? (
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
            {recipe.description}
          </Text>
        ) : null}

        <View className="flex-row mt-3 gap-4">
          {recipe.prep_time_min ? (
            <View className="flex-row items-center gap-1">
              <Icon name="clock" size={12} color="#9ca3af" />
              <Text className="text-xs text-gray-500">{recipe.prep_time_min} min</Text>
            </View>
          ) : null}
          {recipe.servings ? (
            <View className="flex-row items-center gap-1">
              <Icon name="utensils" size={12} color="#9ca3af" />
              <Text className="text-xs text-gray-500">{recipe.servings} porções</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
