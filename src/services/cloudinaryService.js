import { Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';

// Configuration Cloudinary - Remplacez par vos credentials
const CLOUD_NAME = "dsxlslezn";
const UPLOAD_PRESET = "salon_app";

// URL de base pour l'upload
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `logo_${timestamp}_${randomPart}`;
};

export const uploadToCloudinary = async (imageUri, folder = "salon_logos") => {
  try {
    console.log("📤 Début upload Cloudinary");
    console.log("📱 URI image:", imageUri);
    console.log("☁️ Cloud name:", CLOUD_NAME);
    console.log("⚙️ Upload preset:", UPLOAD_PRESET);

    // Vérifications simples
    if (!CLOUD_NAME) {
      throw new Error("CLOUD_NAME non configuré");
    }
    if (!UPLOAD_PRESET) {
      // SIMPLIFIÉ : juste vérifier si défini
      throw new Error("UPLOAD_PRESET non configuré");
    }

    const fileName = generateUniqueId();

    // Créer FormData
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: `${fileName}.jpg`,
    });
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);
    formData.append("public_id", fileName);
    formData.append("tags", "salon");

    console.log("📋 FormData créé, envoi vers Cloudinary...");

    // Upload
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const responseText = await response.text();
    console.log("📡 Réponse Cloudinary:", responseText);

    if (!response.ok) {
      console.error("❌ Erreur Cloudinary détaillée:", responseText);

      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error && errorData.error.message) {
          throw new Error(`Cloudinary: ${errorData.error.message}`);
        }
      } catch (parseError) {
        // Ignorer si pas JSON
      }

      throw new Error(`Échec upload: ${response.status}`);
    }

    const data = JSON.parse(responseText);
    console.log("✅ Upload réussi! URL:", data.secure_url);

    return {
      url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error("❌ Erreur upload Cloudinary:", error);
    throw new Error(`Impossible d'uploader l'image: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  console.log("🗑️ Suppression Cloudinary (simulée pour le moment):", publicId);
  return { success: true, message: "Image marquée pour suppression" };
};

export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 500,
    height = 500,
    quality = "auto",
    crop = "limit",
  } = options;

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},h_${height},c_${crop},q_${quality}/${publicId}`;
};

export const isValidCloudinaryUrl = (url) => {
  return url && url.includes("cloudinary.com");
};

export const uploadServiceImage = async (imageUri, serviceName = "service") => {
  try {
    console.log(`📤 Upload image service: ${serviceName}`);

    // Générer un nom unique avec le nom du service
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 9);
    const fileName = `service_${serviceName.replace(
      /\s+/g,
      "_"
    )}_${timestamp}_${randomPart}`;

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: `${fileName}.jpg`,
    });
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "service_images"); // Dossier spécifique
    formData.append("public_id", fileName);
    formData.append("tags", `service,${serviceName}`);

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Image service uploadée:", data.secure_url);
      return {
        url: data.secure_url,
        public_id: data.public_id,
      };
    } else {
      console.error("❌ Erreur upload image service:", data);
      throw new Error(data.error?.message || "Erreur d'upload");
    }
  } catch (error) {
    console.error("❌ Exception upload image service:", error);
    throw error;
  }
};

export const pickImage = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      throw new Error("Permission refusée pour accéder à la galerie");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // NOUVEAU FORMAT
      // ou mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error("Erreur sélection image:", error);
    throw error;
  }
};

// Ajoutez cette fonction à cloudinaryService.js
export const uploadProductImage = async (imageUri, productName = "product") => {
  try {
    console.log(`📤 Upload image produit: ${productName}`);

    // Générer un nom unique avec le nom du produit
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 9);
    const fileName = `product_${productName
      .replace(/\s+/g, "_")
      .substring(0, 30)}_${timestamp}_${randomPart}`;

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: `${fileName}.jpg`,
    });
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "product_images"); // Dossier spécifique
    formData.append("public_id", fileName);
    formData.append("tags", `product,${productName}`);

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Image produit uploadée:", data.secure_url);
      return {
        url: data.secure_url,
        public_id: data.public_id,
      };
    } else {
      console.error("❌ Erreur upload image produit:", data);
      throw new Error(data.error?.message || "Erreur d'upload");
    }
  } catch (error) {
    console.error("❌ Exception upload image produit:", error);
    throw error;
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  isValidCloudinaryUrl,
  uploadServiceImage,
  pickImage,
  uploadProductImage,
};
