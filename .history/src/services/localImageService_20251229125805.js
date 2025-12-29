// services/localImageService.js
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const pickImage = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission refusée pour accéder à la galerie');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur sélection image:', error);
    throw error;
  }
};

export const compressImage = async (uri) => {
  try {
    const compressedImage = await manipulateAsync(
      uri,
      [{ resize: { width: 800, height: 800 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );
    return compressedImage.uri;
  } catch (error) {
    console.error('Erreur compression image:', error);
    return uri;
  }
};