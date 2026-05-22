import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {IngredientFormData, UnitType} from '../types';
import {IngredientRow} from './IngredientRow';

const defaultIngredient = (): IngredientFormData => ({
  name: '',
  quantity: '',
  unit: 'unidade',
});

interface IngredientListProps {
  ingredients: IngredientFormData[];
  onChange: (ingredients: IngredientFormData[]) => void;
}

export function IngredientList({ingredients, onChange}: IngredientListProps) {
  const handleChange = (
    index: number,
    field: keyof IngredientFormData,
    value: string | UnitType,
  ) => {
    const updated = ingredients.map((ing, i) =>
      i === index ? {...ing, [field]: value} : ing,
    );
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...ingredients, defaultIngredient()]);
  };

  return (
    <View>
      <Text className="text-base font-semibold text-gray-900 mb-3">
        Ingredientes
      </Text>

      {ingredients.map((ing, index) => (
        <IngredientRow
          key={index}
          ingredient={ing}
          index={index}
          onChange={handleChange}
          onRemove={handleRemove}
        />
      ))}

      <TouchableOpacity
        onPress={handleAdd}
        className="border-2 border-dashed border-primary-300 rounded-xl py-3 items-center mt-1">
        <Text className="text-primary-600 font-semibold">+ Adicionar ingrediente</Text>
      </TouchableOpacity>
    </View>
  );
}
