import React from 'react';
import {View, Text} from 'react-native';
import {Button} from './Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  emoji = '🍽️',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-6xl mb-4">{emoji}</Text>
      <Text className="text-xl font-bold text-gray-800 text-center mb-2">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm text-gray-500 text-center mb-6">
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} className="px-8" />
      )}
    </View>
  );
}
