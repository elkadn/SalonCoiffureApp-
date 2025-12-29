// services/localImageService.js
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';


// services/permanentImageService.js

export const saveImagePermanently = async (uri, productId) => {
  try {
    // 1. Utiliser le dossier Documents (persistant)
    const documentsDir = FileSystem.documentDirectory;
    
    // 2. Créer un nom de fichier unique
    const timestamp = Date.now();
    const fileName = `product_${productId}_${timestamp}.jpg`;
    const permanentPath = `${documentsDir}permanent_images/${fileName}`;
    
    // 3. Créer le dossier si nécessaire
    const dir = `${documentsDir}permanent_images/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    
    // 4. Copier l'image dans le dossier permanent
    await FileSystem.copyAsync({
      from: uri,
      to: permanentPath,
    });
    
    console.log('Image sauvegardée permanentement:', permanentPath);
    return permanentPath;
    
  } catch (error) {
    console.error('Erreur sauvegarde permanente:', error);
    throw error;
  }
};

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