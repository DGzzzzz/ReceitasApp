import React from 'react';
import {View, ActivityIndicator, Text} from 'react-native';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingSpinner({fullScreen = false, message}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        {message && <Text className="mt-3 text-gray-500">{message}</Text>}
      </View>
    );
  }

  return (
    <View className="py-8 items-center justify-center">
      <ActivityIndicator size="large" color="#f97316" />
      {message && <Text className="mt-3 text-gray-500">{message}</Text>}
    </View>
  );
}
