import {useState, useCallback} from 'react';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {Platform} from 'react-native';

export function useImagePicker() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleResponse = useCallback((response: ImagePickerResponse) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      setImageError(response.errorMessage ?? 'Erro ao selecionar imagem');
      return;
    }
    const asset = response.assets?.[0];
    if (asset?.uri) setImageUri(asset.uri);
  }, []);

  const pickFromGallery = useCallback(async () => {
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.8, maxWidth: 1280, maxHeight: 1280},
      handleResponse,
    );
  }, [handleResponse]);

  const pickFromCamera = useCallback(async () => {
    launchCamera(
      {mediaType: 'photo', quality: 0.8, maxWidth: 1280, maxHeight: 1280, saveToPhotos: false},
      handleResponse,
    );
  }, [handleResponse]);

  const clearImage = useCallback(() => setImageUri(null), []);
  const clearImageError = useCallback(() => setImageError(null), []);

  return {imageUri, imageError, pickFromGallery, pickFromCamera, clearImage, clearImageError, setImageUri};
}
