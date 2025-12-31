

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
    return salonInfo.logoUrl; 
  } catch (error) {
    console.error('Erreur chargement logo:', error);
    return null;
  }
};

export const getSalonInfo = async () => {
  try {
    const salonDoc = await getDoc(doc(db, 'salon_info', SALON_DOC_ID));
    
    if (salonDoc.exists()) {
      return {
        id: salonDoc.id,
        ...salonDoc.data()
      };
    } else {
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
        logoUrl: null, 
        logoPublicId: null, 
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

export const saveSalonLogo = async (imageUri) => {
  try {
    console.log('📤 Upload logo vers Cloudinary...');
    
    const cloudinaryResult = await uploadToCloudinary(imageUri, 'salon_logos');
    
    const logoData = {
      logoUrl: cloudinaryResult.url,
      logoPublicId: cloudinaryResult.public_id,
      logoFormat: cloudinaryResult.format,
      logoWidth: cloudinaryResult.width,
      logoHeight: cloudinaryResult.height,
    };
    
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

export const deleteSalonLogo = async () => {
  try {
    const salonInfo = await getSalonInfo();
    
    if (salonInfo.logoPublicId) {
      try {
        await deleteFromCloudinary(salonInfo.logoPublicId);
      } catch (cloudinaryError) {
        console.warn('⚠️ Impossible de supprimer de Cloudinary:', cloudinaryError);
      }
    }
    
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

export const getOptimizedLogoUrl = (salonInfo, size = 300) => {
  if (!salonInfo?.logoUrl) return null;
  
  if (salonInfo.logoPublicId) {
    return `https://res.cloudinary.com/${process.env.CLOUD_NAME || 'votre_cloud_name'}/image/upload/w_${size},c_limit,q_auto/${salonInfo.logoPublicId}`;
  }
  
  return salonInfo.logoUrl;
};

export const salonService = {
  getSalonInfo,
  updateSalonInfo,
  saveSalonLogo,
  deleteSalonLogo,
  getOptimizedLogoUrl,
  loadSalonLogo 
};

export default salonService;