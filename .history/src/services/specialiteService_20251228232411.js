// services/specialiteService.js
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '';

const COLLECTION_NAME = "specialites";

// Récupérer toutes les spécialités
export const getAllSpecialites = async () => {
  try {
    const specialitesCollection = collection(db, COLLECTION_NAME);
    const q = query(specialitesCollection, orderBy("nom"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération spécialités:", error);
    throw error;
  }
};

// Récupérer une spécialité par ID
export const getSpecialiteById = async (specialiteId) => {
  try {
    const specialiteDoc = await getDoc(doc(db, COLLECTION_NAME, specialiteId));
    
    if (specialiteDoc.exists()) {
      return {
        id: specialiteDoc.id,
        ...specialiteDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération spécialité:", error);
    throw error;
  }
};

// Créer une nouvelle spécialité
export const createSpecialite = async (specialiteData) => {
  try {
    // Vérifier si le nom est unique
    const isUnique = await checkUniqueName(specialiteData.nom);
    if (!isUnique) {
      throw new Error("Ce nom de spécialité existe déjà");
    }

    // Préparer les données
    const specialiteDoc = {
      ...specialiteData,
      nom: specialiteData.nom.trim(),
      description: specialiteData.description?.trim() || "",
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp(),
      actif: true,
      nombreCoiffeurs: 0 // Initialiser à 0
    };

    // Créer une référence de document avec ID auto-généré
    const newDocRef = doc(collection(db, COLLECTION_NAME));
    
    // Sauvegarder dans Firestore
    await setDoc(newDocRef, specialiteDoc);
    
    console.log("Spécialité créée avec ID :", newDocRef.id);
    return {
      id: newDocRef.id,
      ...specialiteDoc
    };
  } catch (error) {
    console.error("Erreur création spécialité :", error);
    
    // Gérer les erreurs spécifiques
    if (error.message.includes("existe déjà")) {
      throw new Error(error.message);
    }
    
    throw new Error("Erreur lors de la création de la spécialité");
  }
};

// Mettre à jour une spécialité
export const updateSpecialite = async (specialiteId, specialiteData) => {
  try {
    // Vérifier si le nom est unique (en excluant la spécialité actuelle)
    const isUnique = await checkUniqueName(specialiteData.nom, specialiteId);
    if (!isUnique) {
      throw new Error("Ce nom de spécialité existe déjà");
    }

    const dataToUpdate = {
      nom: specialiteData.nom.trim(),
      description: specialiteData.description?.trim() || "",
      dateModification: serverTimestamp()
    };

    await updateDoc(doc(db, COLLECTION_NAME, specialiteId), dataToUpdate);
    
    console.log("Spécialité mise à jour :", specialiteId);
    
    // Retourner les données mises à jour
    return await getSpecialiteById(specialiteId);
  } catch (error) {
    console.error("Erreur mise à jour spécialité:", error);
    
    // Gérer les erreurs spécifiques
    if (error.message.includes("existe déjà")) {
      throw new Error(error.message);
    }
    
    throw new Error("Erreur lors de la mise à jour de la spécialité");
  }
};

// Supprimer (désactiver) une spécialité
export const deleteSpecialite = async (specialiteId) => {
  try {
    // Option 1: Marquer comme inactif (soft delete)
    await updateDoc(doc(db, COLLECTION_NAME, specialiteId), {
      actif: false,
      dateModification: serverTimestamp()
    });
    
    // Option 2: Supprimer définitivement (décommenter si nécessaire)
    // await deleteDoc(doc(db, COLLECTION_NAME, specialiteId));
    
    console.log("Spécialité désactivée :", specialiteId);
    return specialiteId;
  } catch (error) {
    console.error("Erreur suppression spécialité:", error);
    throw new Error("Erreur lors de la suppression de la spécialité");
  }
};

// Vérifier si le nom est unique
export const checkUniqueName = async (nom, excludeId = null) => {
  try {
    const specialitesCollection = collection(db, COLLECTION_NAME);
    const nomLower = nom.trim().toLowerCase();
    
    // Construire la requête
    let q = query(
      specialitesCollection,
      where("nom", ">=", nomLower),
      where("nom", "<=", nomLower + "\uf8ff")
    );
    
    const snapshot = await getDocs(q);
    
    // Vérifier les résultats
    const existingSpecialites = snapshot.docs
      .filter(doc => {
        // Exclure la spécialité actuelle si on est en mode édition
        if (excludeId) {
          return doc.id !== excludeId;
        }
        return true;
      })
      .filter(doc => {
        const data = doc.data();
        // Vérifier si actif et nom similaire (insensible à la casse)
        return data.actif !== false && 
               data.nom.toLowerCase() === nomLower;
      });
    
    return existingSpecialites.length === 0;
  } catch (error) {
    console.error("Erreur vérification nom unique:", error);
    throw error;
  }
};

// Rechercher des spécialités
export const searchSpecialites = async (searchTerm) => {
  try {
    const allSpecialites = await getAllSpecialites();
    
    return allSpecialites.filter(specialite => 
      specialite.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialite.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Erreur recherche spécialités:", error);
    throw error;
  }
};

// Récupérer les spécialités actives
export const getActiveSpecialites = async () => {
  try {
    const specialitesCollection = collection(db, COLLECTION_NAME);
    const q = query(
      specialitesCollection,
      where("actif", "==", true),
      orderBy("nom")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération spécialités actives:", error);
    throw error;
  }
};

// Compter le nombre de spécialités
export const countSpecialites = async () => {
  try {
    const allSpecialites = await getAllSpecialites();
    return allSpecialites.length;
  } catch (error) {
    console.error("Erreur comptage spécialités:", error);
    throw error;
  }
};

// Incrémenter le nombre de coiffeurs pour une spécialité
export const incrementCoiffeurCount = async (specialiteId) => {
  try {
    const specialite = await getSpecialiteById(specialiteId);
    if (!specialite) return;
    
    await updateDoc(doc(db, COLLECTION_NAME, specialiteId), {
      nombreCoiffeurs: (specialite.nombreCoiffeurs || 0) + 1,
      dateModification: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur incrémentation compteur coiffeurs:", error);
    throw error;
  }
};

// Décrémenter le nombre de coiffeurs pour une spécialité
export const decrementCoiffeurCount = async (specialiteId) => {
  try {
    const specialite = await getSpecialiteById(specialiteId);
    if (!specialite) return;
    
    const newCount = Math.max(0, (specialite.nombreCoiffeurs || 0) - 1);
    
    await updateDoc(doc(db, COLLECTION_NAME, specialiteId), {
      nombreCoiffeurs: newCount,
      dateModification: serverTimestamp()
    });
  } catch (error) {
    console.error("Erreur décrémentation compteur coiffeurs:", error);
    throw error;
  }
};

// Service complet pour compatibilité avec les composants existants
export const specialiteService = {
  // Méthodes principales (compatibles avec les composants)
  getAll: getAllSpecialites,
  getById: getSpecialiteById,
  create: createSpecialite,
  update: updateSpecialite,
  delete: deleteSpecialite,
  
  // Méthodes supplémentaires
  checkUniqueName: checkUniqueName,
  search: searchSpecialites,
  getActive: getActiveSpecialites,
  count: countSpecialites,
  
  // Méthodes de gestion des coiffeurs
  incrementCoiffeurCount: incrementCoiffeurCount,
  decrementCoiffeurCount: decrementCoiffeurCount
};

export default specialiteService;