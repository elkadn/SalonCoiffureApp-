// services/imageService.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '..';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const pickImage = async () => {
  try {
    // Demander la permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission refusée pour accéder à la galerie');
    }

    // Ouvrir le sélecteur d'image
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
    return uri; // Retourner l'original en cas d'erreur
  }
};

export const uploadImage = async (uri, productId) => {
  try {
    // Convertir l'URI en blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Créer une référence dans Firebase Storage
    const imageRef = ref(storage, `products/${productId}/${Date.now()}.jpg`);
    
    // Uploader l'image
    await uploadBytes(imageRef, blob);
    
    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(imageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Erreur upload image:', error);
    throw error;
  }
};