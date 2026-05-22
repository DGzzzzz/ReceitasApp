import React from 'react';
import {Modal, View, Text, TouchableOpacity, Pressable} from 'react-native';
import {Icon} from './Icon';

type ModalType = 'error' | 'success' | 'info';

const TYPE_CONFIG: Record<ModalType, {icon: 'triangle-warning' | 'check-circle' | 'info'; bgClass: string; iconColor: string}> = {
  error:   {icon: 'triangle-warning', bgClass: 'bg-red-100',   iconColor: '#ef4444'},
  success: {icon: 'check-circle',     bgClass: 'bg-green-100', iconColor: '#22c55e'},
  info:    {icon: 'info',             bgClass: 'bg-blue-100',  iconColor: '#3b82f6'},
};

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: ModalType;
  onClose: () => void;
}

export function ErrorModal({visible, title, message, type = 'error', onClose}: ErrorModalProps) {
  const {icon, bgClass, iconColor} = TYPE_CONFIG[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center items-center bg-black/50 px-6"
        onPress={onClose}>
        <Pressable className="bg-white rounded-2xl w-full p-6">
          <View className={`w-12 h-12 rounded-full ${bgClass} items-center justify-center mb-4 self-center`}>
            <Icon name={icon} size={24} color={iconColor} />
          </View>
          <Text className="text-lg font-bold text-gray-900 text-center mb-2">
            {title}
          </Text>
          <Text className="text-gray-500 text-center mb-6">{message}</Text>
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-3 items-center"
            onPress={onClose}>
            <Text className="text-white font-semibold text-base">OK</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
