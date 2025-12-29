// services/localImageService.js
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';



export const saveImagePermanently = async (uri, productId) => {
  try {
    console.log('Début sauvegarde image permanente...');
    console.log('URI source:', uri);
    console.log('Product ID:', productId);
    
    // 1. Utiliser le dossier Documents (persistant)
    const documentsDir = FileSystem.documentDirectory;
    console.log('Documents directory:', documentsDir);
    
    // 2. Créer un nom de fichier unique
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(7);
    const fileName = `product_${productId}_${timestamp}_${randomPart}.jpg`;
    const permanentPath = `${documentsDir}product_images/${fileName}`;
    
    console.log('Chemin permanent:', permanentPath);
    
    // 3. Créer le dossier product_images s'il n'existe pas
    const imagesDir = `${documentsDir}product_images/`;
    const dirInfo = await FileSystem.getInfoAsync(imagesDir);
    
    if (!dirInfo.exists) {
      console.log('Création du dossier product_images...');
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
      console.log('Dossier créé avec succès');
    }
    
    // 4. Vérifier si le fichier source existe
    const sourceInfo = await FileSystem.getInfoAsync(uri);
    if (!sourceInfo.exists) {
      throw new Error('Fichier source non trouvé: ' + uri);
    }
    console.log('Taille fichier source:', sourceInfo.size, 'bytes');
    
    // 5. Copier l'image dans le dossier permanent
    console.log('Copie de l\'image...');
    await FileSystem.copyAsync({
      from: uri,
      to: permanentPath,
    });
    
    // 6. Vérifier que la copie a réussi
    const destInfo = await FileSystem.getInfoAsync(permanentPath);
    if (!destInfo.exists) {
      throw new Error('Échec de la copie');
    }
    console.log('Copie réussie! Taille:', destInfo.size, 'bytes');
    
    console.log('Image sauvegardée permanentement:', permanentPath);
    return permanentPath;
    
  } catch (error) {
    console.error('Erreur détaillée sauvegarde permanente:', error);
    console.error('Stack trace:', error.stack);
    throw new Error(`Échec sauvegarde image: ${error.message}`);
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