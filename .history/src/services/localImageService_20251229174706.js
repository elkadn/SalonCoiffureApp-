// services/localImageService.js - VERSION SIMPLIFIÉE
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

// Créer un dossier permanent pour les images
const IMAGES_DIR = FileSystem.documentDirectory + 'products_images/';

// Initialiser le dossier
export const initImagesDirectory = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
      console.log('✅ Dossier images créé:', IMAGES_DIR);
    }
    return IMAGES_DIR;
  } catch (error) {
    console.error('❌ Erreur création dossier:', error);
    throw error;
  }
};

// Sauvegarder une image
export const saveProductImage = async (imageUri, productId) => {
  try {
    // Initialiser le dossier si besoin
    await initImagesDirectory();
    
    // Créer un nom de fichier unique
    const timestamp = Date.now();
    const fileName = `product_${productId}_${timestamp}.jpg`;
    const destinationPath = IMAGES_DIR + fileName;
    
    console.log('📤 Copie image de:', imageUri);
    console.log('📥 Vers:', destinationPath);
    
    // Copier l'image dans le dossier permanent
    await FileSystem.copyAsync({
      from: imageUri,
      to: destinationPath,
    });
    
    console.log('✅ Image sauvegardée:', destinationPath);
    return destinationPath;
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde image:', error);
    throw new Error(`Impossible de sauvegarder l'image: ${error.message}`);
  }
};

// Charger une image d'un produit
export const loadProductImage = async (imagePath) => {
  try {
    if (!imagePath) return null;
    
    const fileInfo = await FileSystem.getInfoAsync(imagePath);
    if (fileInfo.exists) {
      return imagePath;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur chargement image:', error);
    return null;
  }
};

// Supprimer une image
export const deleteProductImage = async (imagePath) => {
  try {
    if (!imagePath) return;
    
    const fileInfo = await FileSystem.getInfoAsync(imagePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(imagePath);
      console.log('🗑️ Image supprimée:', imagePath);
    }
  } catch (error) {
    console.error('Erreur suppression image:', error);
  }
};

// Nettoyer les images orphelines
export const cleanOrphanImages = async (existingImagePaths = []) => {
  try {
    await initImagesDirectory();
    const files = await FileSystem.readDirectoryAsync(IMAGES_DIR);
    
    for (const file of files) {
      const filePath = IMAGES_DIR + file;
      if (!existingImagePaths.includes(filePath)) {
        await FileSystem.deleteAsync(filePath);
        console.log('🧹 Image orpheline supprimée:', file);
      }
    }
  } catch (error) {
    console.error('Erreur nettoyage images:', error);
  }
};

// Fonction pour sélectionner une image (inchangée)
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