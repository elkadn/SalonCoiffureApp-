// services/affectationService.js
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { incrementCoiffeurCount, decrementCoiffeurCount } from './specialiteService';

const COLLECTION_NAME = "coiffeur_specialites";

// Récupérer toutes les affectations d'un coiffeur
export const getSpecialitesByCoiffeur = async (coiffeurId) => {
  try {
    const affectationsCollection = collection(db, COLLECTION_NAME);
    const q = query(
      affectationsCollection,
      where("coiffeurId", "==", coiffeurId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération affectations:", error);
    throw error;
  }
};

// Récupérer tous les coiffeurs d'une spécialité
export const getCoiffeursBySpecialite = async (specialiteId) => {
  try {
    const affectationsCollection = collection(db, COLLECTION_NAME);
    const q = query(
      affectationsCollection,
      where("specialiteId", "==", specialiteId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération coiffeurs par spécialité:", error);
    throw error;
  }
};

// Vérifier si une affectation existe
export const checkAffectationExists = async (coiffeurId, specialiteId) => {
  try {
    const affectationsCollection = collection(db, COLLECTION_NAME);
    const q = query(
      affectationsCollection,
      where("coiffeurId", "==", coiffeurId),
      where("specialiteId", "==", specialiteId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Erreur vérification affectation:", error);
    throw error;
  }
};

// Ajouter une affectation
export const addAffectation = async (coiffeurId, specialiteId) => {
  try {
    // Vérifier si l'affectation existe déjà
    const exists = await checkAffectationExists(coiffeurId, specialiteId);
    if (exists) {
      throw new Error("Cette affectation existe déjà");
    }

    // Créer l'affectation
    const affectationDoc = {
      coiffeurId,
      specialiteId,
      dateAffectation: new Date().toISOString(),
      actif: true
    };

    // Créer une référence de document
    const newDocRef = doc(collection(db, COLLECTION_NAME));
    
    // Sauvegarder dans Firestore
    await setDoc(newDocRef, affectationDoc);
    
    // Incrémenter le compteur de coiffeurs dans la spécialité
    await incrementCoiffeurCount(specialiteId);
    
    console.log("Affectation créée avec ID :", newDocRef.id);
    return {
      id: newDocRef.id,
      ...affectationDoc
    };
  } catch (error) {
    console.error("Erreur création affectation :", error);
    throw new Error(error.message || "Erreur lors de l'affectation");
  }
};

// Supprimer une affectation
export const removeAffectation = async (affectationId, specialiteId) => {
  try {
    // Supprimer l'affectation
    await deleteDoc(doc(db, COLLECTION_NAME, affectationId));
    
    // Décrémenter le compteur de coiffeurs dans la spécialité
    await decrementCoiffeurCount(specialiteId);
    
    console.log("Affectation supprimée :", affectationId);
    return affectationId;
  } catch (error) {
    console.error("Erreur suppression affectation:", error);
    throw error;
  }
};

// Mettre à jour plusieurs affectations pour un coiffeur
export const updateCoiffeurSpecialites = async (coiffeurId, specialiteIds) => {
  try {
    const batch = writeBatch(db);
    
    // Récupérer les affectations existantes
    const existingAffectations = await getSpecialitesByCoiffeur(coiffeurId);
    
    // Supprimer les affectations qui ne sont plus dans la nouvelle liste
    const affectationsToRemove = existingAffectations.filter(
      affectation => !specialiteIds.includes(affectation.specialiteId)
    );
    
    for (const affectation of affectationsToRemove) {
      batch.delete(doc(db, COLLECTION_NAME, affectation.id));
      await decrementCoiffeurCount(affectation.specialiteId);
    }
    
    // Ajouter les nouvelles affectations
    const existingSpecialiteIds = existingAffectations.map(a => a.specialiteId);
    const specialitesToAdd = specialiteIds.filter(
      specialiteId => !existingSpecialiteIds.includes(specialiteId)
    );
    
    for (const specialiteId of specialitesToAdd) {
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      const affectationDoc = {
        coiffeurId,
        specialiteId,
        dateAffectation: new Date().toISOString(),
        actif: true
      };
      batch.set(newDocRef, affectationDoc);
      await incrementCoiffeurCount(specialiteId);
    }
    
    // Exécuter le batch
    await batch.commit();
    
    console.log(`Affectations mises à jour pour coiffeur ${coiffeurId}`);
    return specialiteIds;
  } catch (error) {
    console.error("Erreur mise à jour affectations:", error);
    throw error;
  }
};

// Récupérer les spécialités avec info d'affectation pour un coiffeur
export const getSpecialitesWithAffectation = async (coiffeurId) => {
  try {
    const [specialites, affectations] = await Promise.all([
      getAllSpecialites(),
      getSpecialitesByCoiffeur(coiffeurId)
    ]);
    
    const affectationIds = affectations.map(a => a.specialiteId);
    
    return specialites.map(specialite => ({
      ...specialite,
      isAssigned: affectationIds.includes(specialite.id)
    }));
  } catch (error) {
    console.error("Erreur récupération spécialités avec affectation:", error);
    throw error;
  }
};