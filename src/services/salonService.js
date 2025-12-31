// // services/salonService.js
// import { 
//   doc, 
//   getDoc, 
//   setDoc, 
//   updateDoc,
//   serverTimestamp 
// } from 'firebase/firestore';
// import { db } from '../firebase/firebaseConfig';
// import * as FileSystem from 'expo-file-system/legacy';

// const SALON_DOC_ID = 'salon_config';
// const LOGOS_DIR = FileSystem.documentDirectory + 'salon_logos/';

// // Initialiser le dossier logos
// const initLogosDirectory = async () => {
//   try {
//     const dirInfo = await FileSystem.getInfoAsync(LOGOS_DIR);
//     if (!dirInfo.exists) {
//       await FileSystem.makeDirectoryAsync(LOGOS_DIR, { intermediates: true });
//     }
//     return LOGOS_DIR;
//   } catch (error) {
//     console.error('Erreur création dossier logos:', error);
//     throw error;
//   }
// };

// // Obtenir les informations du salon
// export const getSalonInfo = async () => {
//   try {
//     const salonDoc = await getDoc(doc(db, 'salon_info', SALON_DOC_ID));
    
//     if (salonDoc.exists()) {
//       return {
//         id: salonDoc.id,
//         ...salonDoc.data()
//       };
//     } else {
//       // Créer la configuration par défaut si elle n'existe pas
//       const defaultConfig = {
//         nom: 'Salon de Coiffure Excellence',
//         telephone: '+212 6XX-XXXXXX',
//         email: 'contact@salon-coiffure.com',
//         adresse: '123 Avenue Hassan II, Casablanca',
//         horaires: {
//           lundi: '09:00 - 19:00',
//           mardi: '09:00 - 19:00',
//           mercredi: '09:00 - 19:00',
//           jeudi: '09:00 - 19:00',
//           vendredi: '09:00 - 19:00',
//           samedi: '09:00 - 17:00',
//           dimanche: 'Fermé'
//         },
//         description: 'Votre salon de coiffure de confiance',
//         logoPath: null,
//         facebook: '',
//         instagram: '',
//         whatsapp: '',
//         dateCreation: serverTimestamp(),
//         dateModification: serverTimestamp()
//       };
      
//       await setDoc(doc(db, 'salon_info', SALON_DOC_ID), defaultConfig);
      
//       return {
//         id: SALON_DOC_ID,
//         ...defaultConfig,
//         dateCreation: new Date().toISOString(),
//         dateModification: new Date().toISOString()
//       };
//     }
//   } catch (error) {
//     console.error('Erreur récupération infos salon:', error);
//     throw error;
//   }
// };

// // Mettre à jour les informations du salon
// export const updateSalonInfo = async (updates) => {
//   try {
//     const salonRef = doc(db, 'salon_info', SALON_DOC_ID);
    
//     await updateDoc(salonRef, {
//       ...updates,
//       dateModification: serverTimestamp()
//     });
    
//     return await getSalonInfo();
//   } catch (error) {
//     console.error('Erreur mise à jour salon:', error);
//     throw error;
//   }
// };

// // Sauvegarder le logo du salon
// export const saveSalonLogo = async (imageUri) => {
//   try {
//     await initLogosDirectory();
    
//     const timestamp = Date.now();
//     const fileName = `salon_logo_${timestamp}.jpg`;
//     const destinationPath = LOGOS_DIR + fileName;
    
//     // Copier l'image
//     await FileSystem.copyAsync({
//       from: imageUri,
//       to: destinationPath
//     });
    
//     // Mettre à jour dans Firestore
//     const salonRef = doc(db, 'salon_info', SALON_DOC_ID);
//     await updateDoc(salonRef, {
//       logoPath: destinationPath,
//       dateModification: serverTimestamp()
//     });
    
//     return destinationPath;
//   } catch (error) {
//     console.error('Erreur sauvegarde logo:', error);
//     throw error;
//   }
// };

// // Charger le logo
// export const loadSalonLogo = async () => {
//   try {
//     const salonInfo = await getSalonInfo();
    
//     if (salonInfo.logoPath) {
//       const fileInfo = await FileSystem.getInfoAsync(salonInfo.logoPath);
//       if (fileInfo.exists) {
//         return salonInfo.logoPath;
//       }
//     }
    
//     return null;
//   } catch (error) {
//     console.error('Erreur chargement logo:', error);
//     return null;
//   }
// };

// // Supprimer le logo
// export const deleteSalonLogo = async () => {
//   try {
//     const salonInfo = await getSalonInfo();
    
//     if (salonInfo.logoPath) {
//       const fileInfo = await FileSystem.getInfoAsync(salonInfo.logoPath);
//       if (fileInfo.exists) {
//         await FileSystem.deleteAsync(salonInfo.logoPath);
//       }
      
//       const salonRef = doc(db, 'salon_info', SALON_DOC_ID);
//       await updateDoc(salonRef, {
//         logoPath: null,
//         dateModification: serverTimestamp()
//       });
//     }
    
//     return true;
//   } catch (error) {
//     console.error('Erreur suppression logo:', error);
//     throw error;
//   }
// };

// // Exporter le service
// export const salonService = {
//   getSalonInfo,
//   updateSalonInfo,
//   saveSalonLogo,
//   loadSalonLogo,
//   deleteSalonLogo
// };

// export default salonService;


import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinaryService';

const SALON_DOC_ID = 'salon_config';



export const loadSalonLogo = async () => {
  try {
    const salonInfo = await getSalonInfo();
    return salonInfo.logoUrl; // Retourne l'URL Cloudinary
  } catch (error) {
    console.error('Erreur chargement logo:', error);
    return null;
  }
};

// Obtenir les informations du salon
export const getSalonInfo = async () => {
  try {
    const salonDoc = await getDoc(doc(db, 'salon_info', SALON_DOC_ID));
    
    if (salonDoc.exists()) {
      return {
        id: salonDoc.id,
        ...salonDoc.data()
      };
    } else {
      // Créer la configuration par défaut
      const defaultConfig = {
        nom: 'Salon de Coiffure Excellence',
        telephone: '+212 6XX-XXXXXX',
        email: 'contact@salon-coiffure.com',
        adresse: '123 Avenue Hassan II, Casablanca',
        horaires: {
          lundi: '09:00 - 19:00',
          mardi: '09:00 - 19:00',
          mercredi: '09:00 - 19:00',
          jeudi: '09:00 - 19:00',
          vendredi: '09:00 - 19:00',
          samedi: '09:00 - 17:00',
          dimanche: 'Fermé'
        },
        description: 'Votre salon de coiffure de confiance',
        logoUrl: null, // Changé de logoPath à logoUrl
        logoPublicId: null, // Ajouté pour stocker l'ID Cloudinary
        facebook: '',
        instagram: '',
        whatsapp: '',
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp()
      };
      
      await setDoc(doc(db, 'salon_info', SALON_DOC_ID), defaultConfig);
      
      return {
        id: SALON_DOC_ID,
        ...defaultConfig,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Erreur récupération infos salon:', error);
    throw error;
  }
};

// Mettre à jour les informations du salon
export const updateSalonInfo = async (updates) => {
  try {
    const salonRef = doc(db, 'salon_info', SALON_DOC_ID);
    
    await updateDoc(salonRef, {
      ...updates,
      dateModification: serverTimestamp()
    });
    
    return await getSalonInfo();
  } catch (error) {
    console.error('Erreur mise à jour salon:', error);
    throw error;
  }
};

// Uploader et sauvegarder le logo vers Cloudinary
export const saveSalonLogo = async (imageUri) => {
  try {
    console.log('📤 Upload logo vers Cloudinary...');
    
    // Upload vers Cloudinary
    const cloudinaryResult = await uploadToCloudinary(imageUri, 'salon_logos');
    
    // Préparer les données pour Firestore
    const logoData = {
      logoUrl: cloudinaryResult.url,
      logoPublicId: cloudinaryResult.public_id,
      logoFormat: cloudinaryResult.format,
      logoWidth: cloudinaryResult.width,
      logoHeight: cloudinaryResult.height,
    };
    
    // Mettre à jour dans Firestore
    const salonRef = doc(db, 'salon_info', SALON_DOC_ID);
    await updateDoc(salonRef, {
      ...logoData,
      dateModification: serverTimestamp()
    });
    
    console.log('✅ Logo sauvegardé:', cloudinaryResult.url);
    
    return cloudinaryResult.url;
  } catch (error) {
    console.error('❌ Erreur sauvegarde logo Cloudinary:', error);
    throw new Error(`Impossible de sauvegarder le logo: ${error.message}`);
  }
};

// Supprimer le logo de Cloudinary et Firestore
export const deleteSalonLogo = async () => {
  try {
    // Récupérer les informations actuelles
    const salonInfo = await getSalonInfo();
    
    if (salonInfo.logoPublicId) {
      // Supprimer de Cloudinary (si implémenté côté serveur)
      try {
        await deleteFromCloudinary(salonInfo.logoPublicId);
      } catch (cloudinaryError) {
        console.warn('⚠️ Impossible de supprimer de Cloudinary:', cloudinaryError);
        // Continuer quand même pour supprimer de Firestore
      }
    }
    
    // Mettre à jour Firestore
    const salonRef = doc(db, 'salon_info', SALON_DOC_ID);
    await updateDoc(salonRef, {
      logoUrl: null,
      logoPublicId: null,
      logoFormat: null,
      logoWidth: null,
      logoHeight: null,
      dateModification: serverTimestamp()
    });
    
    console.log('✅ Logo supprimé');
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression logo:', error);
    throw new Error(`Impossible de supprimer le logo: ${error.message}`);
  }
};

// Obtenir l'URL optimisée du logo
export const getOptimizedLogoUrl = (salonInfo, size = 300) => {
  if (!salonInfo?.logoUrl) return null;
  
  // Si on a un publicId, on peut générer une URL optimisée
  if (salonInfo.logoPublicId) {
    return `https://res.cloudinary.com/${process.env.CLOUD_NAME || 'votre_cloud_name'}/image/upload/w_${size},c_limit,q_auto/${salonInfo.logoPublicId}`;
  }
  
  // Sinon retourner l'URL originale
  return salonInfo.logoUrl;
};

// Service complet
export const salonService = {
  getSalonInfo,
  updateSalonInfo,
  saveSalonLogo,
  deleteSalonLogo,
  getOptimizedLogoUrl,
  loadSalonLogo 
};

export default salonService;