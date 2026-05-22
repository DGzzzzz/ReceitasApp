import React from 'react';
import {Modal, View, Text, TouchableOpacity, Pressable} from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <Pressable
        className="flex-1 justify-center items-center bg-black/50 px-6"
        onPress={onCancel}>
        <Pressable className="bg-white rounded-2xl w-full p-6">
          <Text className="text-lg font-bold text-gray-900 text-center mb-2">
            {title}
          </Text>
          <Text className="text-gray-500 text-center mb-6">{message}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 border border-gray-200 rounded-xl py-3 items-center"
              onPress={onCancel}>
              <Text className="text-gray-700 font-semibold text-base">
                {cancelLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 items-center ${destructive ? 'bg-red-500' : 'bg-primary-500'}`}
              onPress={onConfirm}>
              <Text className="text-white font-semibold text-base">
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
