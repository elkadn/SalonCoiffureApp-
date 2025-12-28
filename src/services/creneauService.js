// Dans services/creneauService.js
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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Récupérer tous les créneaux d'un styliste
// Dans services/creneauService.js - Modifie cette fonction
export const getStylisteCreneaux = async (stylisteId) => {
  try {
    const creneauxCollection = collection(db, "creneaux");
    const q = query(
      creneauxCollection,
      where("stylisteId", "==", stylisteId)
      // Retire temporairement les orderBy
      // orderBy("jour"),
      // orderBy("heureDebut")
    );
    
    const snapshot = await getDocs(q);
    
    // Trie manuellement côté client
    const creneaux = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Trie par jour puis par heure
    return creneaux.sort((a, b) => {
      // Trie par jour de la semaine
      const joursOrdre = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
      const jourA = joursOrdre.indexOf(a.jour);
      const jourB = joursOrdre.indexOf(b.jour);
      
      if (jourA !== jourB) {
        return jourA - jourB;
      }
      
      // Si même jour, trie par heure de début
      return a.heureDebut.localeCompare(b.heureDebut);
    });
    
  } catch (error) {
    console.error("Erreur récupération des créneaux:", error);
    // Ajoute un log plus détaillé
    console.error("Détails erreur:", error.message, error.code);
    throw error;
  }
};

// Récupérer un créneau par ID
export const getCreneauById = async (creneauId) => {
  try {
    const creneauDoc = await getDoc(doc(db, "creneaux", creneauId));
    
    if (creneauDoc.exists()) {
      return {
        id: creneauDoc.id,
        ...creneauDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération du créneau:", error);
    throw error;
  }
};

// Créer un nouveau créneau
export const addCreneau = async (creneauData) => {
  try {
    // Générer un ID unique
    const creneauId = `${creneauData.stylisteId}_${creneauData.jour}_${Date.now()}`;
    
    // Convertir les heures en format standard
    const heureDebut = creneauData.heureDebut.includes(':') 
      ? creneauData.heureDebut 
      : `${creneauData.heureDebut}:00`;
    
    const heureFin = creneauData.heureFin.includes(':') 
      ? creneauData.heureFin 
      : `${creneauData.heureFin}:00`;
    
    const creneauDoc = {
      ...creneauData,
      heureDebut,
      heureFin,
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp()
    };
    
    // Ajouter dans Firestore
    await setDoc(doc(db, "creneaux", creneauId), creneauDoc);
    
    console.log("Créneau créé avec ID :", creneauId);
    return { 
      success: true, 
      id: creneauId,
      message: "Créneau ajouté avec succès"
    };
  } catch (error) {
    console.error("Erreur création du créneau :", error);
    throw error;
  }
};

// Mettre à jour un créneau
export const updateCreneau = async (creneauId, creneauData) => {
  try {
    // Convertir les heures si nécessaire
    const updateData = { ...creneauData };
    
    if (creneauData.heureDebut && !creneauData.heureDebut.includes(':')) {
      updateData.heureDebut = `${creneauData.heureDebut}:00`;
    }
    
    if (creneauData.heureFin && !creneauData.heureFin.includes(':')) {
      updateData.heureFin = `${creneauData.heureFin}:00`;
    }
    
    await updateDoc(doc(db, "creneaux", creneauId), {
      ...updateData,
      dateModification: serverTimestamp()
    });
    
    console.log("Créneau mis à jour :", creneauId);
    return { 
      success: true, 
      message: "Créneau mis à jour avec succès"
    };
  } catch (error) {
    console.error("Erreur mise à jour du créneau:", error);
    throw error;
  }
};

// Supprimer un créneau
export const deleteCreneau = async (creneauId) => {
  try {
    await deleteDoc(doc(db, "creneaux", creneauId));
    
    console.log("Créneau supprimé :", creneauId);
    return { 
      success: true, 
      message: "Créneau supprimé avec succès"
    };
  } catch (error) {
    console.error("Erreur suppression du créneau:", error);
    throw error;
  }
};

// Récupérer les créneaux disponibles pour un jour spécifique
export const getCreneauxDisponibles = async (stylisteId, jour, date) => {
  try {
    const creneauxCollection = collection(db, "creneaux");
    const q = query(
      creneauxCollection,
      where("stylisteId", "==", stylisteId),
      where("jour", "==", jour),
      where("actif", "==", true),
      orderBy("heureDebut")
    );
    
    const snapshot = await getDocs(q);
    
    // Ici tu pourrais ajouter la logique pour filtrer les créneaux déjà réservés
    // en consultant une collection "rendezvous"
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération des créneaux disponibles:", error);
    throw error;
  }
};

// Récupérer tous les créneaux de tous les stylistes (pour l'admin)
export const getAllCreneaux = async () => {
  try {
    const creneauxCollection = collection(db, "creneaux");
    const q = query(
      creneauxCollection,
      orderBy("stylisteId"),
      orderBy("jour")
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération de tous les créneaux:", error);
    throw error;
  }
};

// Vérifier si un créneau existe déjà pour un styliste à un jour/heure donné
export const checkCreneauExists = async (stylisteId, jour, heureDebut, heureFin, excludeCreneauId = null) => {
  try {
    const creneauxCollection = collection(db, "creneaux");
    const q = query(
      creneauxCollection,
      where("stylisteId", "==", stylisteId),
      where("jour", "==", jour)
    );
    
    const snapshot = await getDocs(q);
    
    const creneaux = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Vérifier les chevauchements
    const chevauchements = creneaux.filter(creneau => {
      // Exclure le créneau en cours d'édition
      if (excludeCreneauId && creneau.id === excludeCreneauId) return false;
      
      const debutExist = creneau.heureDebut;
      const finExist = creneau.heureFin;
      
      // Vérifier si les créneaux se chevauchent
      return (heureDebut < finExist && heureFin > debutExist);
    });
    
    return {
      exists: chevauchements.length > 0,
      chevauchements
    };
  } catch (error) {
    console.error("Erreur vérification des créneaux:", error);
    throw error;
  }
};

// Mettre à jour le statut d'un créneau (actif/inactif)
export const toggleCreneauStatus = async (creneauId, actif) => {
  try {
    await updateDoc(doc(db, "creneaux", creneauId), {
      actif: actif,
      dateModification: serverTimestamp()
    });
    
    console.log(`Statut du créneau ${creneauId} mis à jour à:`, actif);
    return { 
      success: true, 
      message: `Créneau ${actif ? 'activé' : 'désactivé'} avec succès`
    };
  } catch (error) {
    console.error("Erreur changement de statut du créneau:", error);
    throw error;
  }
};