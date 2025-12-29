// services/salonService.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import * as FileSystem from 'expo-file-system/legacy';

const SALON_DOC_ID = 'salon_config';
const LOGOS_DIR = FileSystem.documentDirectory + 'salon_logos/';

// Initialiser le dossier logos
const initLogosDirectory = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(LOGOS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOGOS_DIR, { intermediates: true });
    }
    return LOGOS_DIR;
  } catch (error) {
    console.error('Erreur création dossier logos:', error);
    throw error;
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
      // Créer la configuration par défaut si elle n'existe pas
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
        logoPath: null,
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

// Sauvegarder le logo du salon
export const saveSalonLogo = async (imageUri) => {
  try {
    await initLogosDirectory();
    
    const timestamp = Date.now();
    const fileName = `salon_logo_${timestamp}.jpg`;
    const destinationPath = LOGOS_DIR + fileName;
    
    // Copier l'image
    await FileSystem.copyAsync({
      from: imageUri,
      to: destinationPath
    });
    
    // Mettre à jour dans Firestore
    const salonRef = doc(db, 'salon_info', SALON_DOC_ID);
    await updateDoc(salonRef, {
      logoPath: destinationPath,
      dateModification: serverTimestamp()
    });
    
    return destinationPath;
  } catch (error) {
    console.error('Erreur sauvegarde logo:', error);
    throw error;
  }
};

// Charger le logo
export const loadSalonLogo = async () => {
  try {
    const salonInfo = await getSalonInfo();
    
    if (salonInfo.logoPath) {
      const fileInfo = await FileSystem.getInfoAsync(salonInfo.logoPath);
      if (fileInfo.exists) {
        return salonInfo.logoPath;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erreur chargement logo:', error);
    return null;
  }
};

// Supprimer le logo
export const deleteSalonLogo = async () => {
  try {
    const salonInfo = await getSalonInfo();
    
    if (salonInfo.logoPath) {
      const fileInfo = await FileSystem.getInfoAsync(salonInfo.logoPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(salonInfo.logoPath);
      }
      
      const salonRef = doc(db, 'salon_info', SALON_DOC_ID);
      await updateDoc(salonRef, {
        logoPath: null,
        dateModification: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erreur suppression logo:', error);
    throw error;
  }
};

// Exporter le service
export const salonService = {
  getSalonInfo,
  updateSalonInfo,
  saveSalonLogo,
  loadSalonLogo,
  deleteSalonLogo
};

export default salonService;