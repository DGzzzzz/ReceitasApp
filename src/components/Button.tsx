import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, {container: string; text: string}> = {
  primary: {
    container: 'bg-primary-500 active:bg-primary-700',
    text: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-gray-200 active:bg-gray-300',
    text: 'text-gray-800 font-semibold',
  },
  danger: {
    container: 'bg-red-500 active:bg-red-700',
    text: 'text-white font-semibold',
  },
  outline: {
    container: 'border border-primary-500 bg-transparent',
    text: 'text-primary-500 font-semibold',
  },
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const {container, text} = variantClasses[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`rounded-xl py-3 px-6 items-center justify-center ${container} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      disabled={isDisabled}
      {...props}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#f97316' : '#fff'} />
      ) : (
        <Text className={`text-base ${text}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
