import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {useImagePicker} from '../hooks/useImagePicker';
import {ErrorModal} from './ErrorModal';
import {OptionsModal, ModalOption} from './OptionsModal';
import {Icon} from './Icon';

interface PhotoPickerProps {
  uri: string | null;
  onSelect: (uri: string | null) => void;
}

export function PhotoPicker({uri, onSelect}: PhotoPickerProps) {
  const {imageUri, imageError, clearImageError, pickFromCamera, pickFromGallery} = useImagePicker();
  const [optionsVisible, setOptionsVisible] = useState(false);

  useEffect(() => {
    if (imageUri) onSelect(imageUri);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri]);

  const options: ModalOption[] = [
    {label: 'Câmera', onPress: pickFromCamera},
    {label: 'Galeria', onPress: pickFromGallery},
    ...(uri ? [{label: 'Remover foto', onPress: () => onSelect(null), destructive: true}] : []),
  ];

  return (
    <>
    <ErrorModal
      visible={!!imageError}
      title="Erro"
      message={imageError ?? ''}
      onClose={clearImageError}
    />
    <OptionsModal
      visible={optionsVisible}
      title="Foto da receita"
      options={options}
      onCancel={() => setOptionsVisible(false)}
    />
    <TouchableOpacity onPress={() => setOptionsVisible(true)} className="mb-4">
      {uri ? (
        <View>
          <Image
            source={{uri}}
            className="w-full h-52 rounded-2xl"
            resizeMode="cover"
          />
          <View className="absolute bottom-2 right-2 bg-black/50 rounded-lg px-3 py-1">
            <Text className="text-white text-xs font-medium">Alterar foto</Text>
          </View>
        </View>
      ) : (
        <View className="w-full h-40 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 items-center justify-center">
          <Icon name="camera" size={36} color="#9ca3af" />
          <Text className="text-sm text-gray-500 font-medium mt-3">Adicionar foto</Text>
          <Text className="text-xs text-gray-400 mt-1">Câmera ou galeria</Text>
        </View>
      )}
    </TouchableOpacity>
    </>
  );
}
