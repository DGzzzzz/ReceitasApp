import React from 'react';
import {Modal, View, Text, TouchableOpacity, Pressable} from 'react-native';

export interface ModalOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface OptionsModalProps {
  visible: boolean;
  title: string;
  options: ModalOption[];
  onCancel: () => void;
}

export function OptionsModal({visible, title, options, onCancel}: OptionsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <Pressable
        className="flex-1 justify-end bg-black/50"
        onPress={onCancel}>
        <Pressable className="bg-white rounded-t-2xl pb-8">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900">{title}</Text>
            <TouchableOpacity onPress={onCancel}>
              <Text className="text-primary-500 font-medium">Fechar</Text>
            </TouchableOpacity>
          </View>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              className="px-4 py-4 border-b border-gray-50"
              onPress={() => {
                onCancel();
                opt.onPress();
              }}>
              <Text
                className={`text-base ${opt.destructive ? 'text-red-500' : 'text-gray-800'}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
