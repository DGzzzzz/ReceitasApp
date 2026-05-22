import React from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {Icon} from './Icon';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  autoFocus = false,
}: SearchInputProps) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
      <Icon name="search" size={16} color="#9ca3af" />
      <TextInput
        className="flex-1 text-sm text-gray-800"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text className="text-gray-400 text-base leading-none">×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
