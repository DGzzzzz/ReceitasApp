import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import { IngredientFormData, UnitType, UNIT_OPTIONS, UNIT_LABELS } from '../types';

interface IngredientRowProps {
  ingredient: IngredientFormData;
  index: number;
  onChange: (index: number, field: keyof IngredientFormData, value: string | UnitType) => void;
  onRemove: (index: number) => void;
}

export function IngredientRow({ ingredient, index, onChange, onRemove }: IngredientRowProps) {
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);

  return (
    <View className="bg-gray-50 rounded-xl p-3 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-gray-600">
          Ingrediente {index + 1}
        </Text>
        <TouchableOpacity
          onPress={() => onRemove(index)}
          className="p-1">
          <Text className="text-red-500 text-sm font-medium">Remover</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm text-gray-900 mb-2"
        placeholder="Nome do ingrediente"
        placeholderTextColor="#9ca3af"
        value={ingredient.name}
        onChangeText={text => onChange(index, 'name', text)}
      />

      <View className="flex-row gap-2">
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm text-gray-900 flex-1"
          placeholder="Qtd"
          placeholderTextColor="#9ca3af"
          keyboardType="default"
          value={ingredient.quantity}
          onChangeText={text => onChange(index, 'quantity', text)}
        />
        <TouchableOpacity
          className="border border-primary-500 rounded-lg px-3 py-2 bg-white min-w-[80px] items-center justify-center"
          onPress={() => setUnitPickerVisible(true)}>
          <Text className="text-primary-600 text-sm font-medium">
            {UNIT_LABELS[ingredient.unit]}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={unitPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUnitPickerVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl pb-8">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <Text className="text-base font-semibold text-gray-900">Unidade</Text>
              <TouchableOpacity onPress={() => setUnitPickerVisible(false)}>
                <Text className="text-primary-500 font-medium">Fechar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={UNIT_OPTIONS}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`px-4 py-3 border-b border-gray-50 ${ingredient.unit === item.value ? 'bg-primary-50' : ''}`}
                  onPress={() => {
                    onChange(index, 'unit', item.value);
                    setUnitPickerVisible(false);
                  }}>
                  <Text
                    className={`text-base ${ingredient.unit === item.value ? 'text-primary-600 font-semibold' : 'text-gray-700'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
