import React, {forwardRef} from 'react';
import {View, Text, TextInput, TextInputProps} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({label, error, helper, ...props}, ref) => {
    return (
      <View className="mb-4">
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
        )}
        <TextInput
          ref={ref}
          className={`border rounded-xl px-4 py-3 text-base text-gray-900 bg-white ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        {error && (
          <Text className="text-sm text-red-500 mt-1">{error}</Text>
        )}
        {!error && helper && (
          <Text className="text-sm text-gray-500 mt-1">{helper}</Text>
        )}
      </View>
    );
  },
);
