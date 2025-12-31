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
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const COLLECTION_NAME = "specialites";

export const getAllSpecialites = async () => {
  try {
    const specialitesCollection = collection(db, COLLECTION_NAME);
    const q = query(specialitesCollection, orderBy("nom"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur récupération spécialités:", error);
    throw error;
  }
};

export const getSpecialiteById = async (specialiteId) => {
  try {
    const specialiteDoc = await getDoc(doc(db, COLLECTION_NAME, specialiteId));

    if (specialiteDoc.exists()) {
      return {
        id: specialiteDoc.id,
        ...specialiteDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération spécialité:", error);
    throw error;
  }
};

export const createSpecialite = async (specialiteData) => {
  try {
    const isUnique = await checkUniqueName(specialiteData.nom);
    if (!isUnique) {
      throw new Error("Ce nom de spécialité existe déjà");
    }

    const specialiteDoc = {
      ...specialiteData,
      nom: specialiteData.nom.trim(),
      description: specialiteData.description?.trim() || "",
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp(),
      actif: true,
      nombreCoiffeurs: 0, 
    };

    const newDocRef = doc(collection(db, COLLECTION_NAME));

    await setDoc(newDocRef, specialiteDoc);

    console.log("Spécialité créée avec ID :", newDocRef.id);
    return {
      id: newDocRef.id,
      ...specialiteDoc,
    };
  } catch (error) {
    console.error("Erreur création spécialité :", error);

    if (error.message.includes("existe déjà")) {
      throw new Error(error.message);
    }

    throw new Error("Erreur lors de la création de la spécialité");
  }
};

export const updateSpecialite = async (specialiteId, specialiteData) => {
  try {
    const isUnique = await checkUniqueName(specialiteData.nom, specialiteId);
    if (!isUnique) {
      throw new Error("Ce nom de spécialité existe déjà");
    }

    const dataToUpdate = {
      nom: specialiteData.nom.trim(),
      description: specialiteData.description?.trim() || "",
      dateModification: serverTimestamp(),
    };

    await updateDoc(doc(db, COLLECTION_NAME, specialiteId), dataToUpdate);

    console.log("Spécialité mise à jour :", specialiteId);

    return await getSpecialiteById(specialiteId);
  } catch (error) {
    console.error("Erreur mise à jour spécialité:", error);

    if (error.message.includes("existe déjà")) {
      throw new Error(error.message);
    }

    throw new Error("Erreur lors de la mise à jour de la spécialité");
  }
};

export const deleteSpecialite = async (specialiteId) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, specialiteId), {
      actif: false,
      dateModification: serverTimestamp(),
    });


    console.log("Spécialité désactivée :", specialiteId);
    return specialiteId;
  } catch (error) {
    console.error("Erreur suppression spécialité:", error);
    throw new Error("Erreur lors de la suppression de la spécialité");
  }
};

export const checkUniqueName = async (nom, excludeId = null) => {
  try {
    const specialitesCollection = collection(db, COLLECTION_NAME);

    const q = query(specialitesCollection, where("actif", "==", true));

    const snapshot = await getDocs(q);
    const nomLower = nom.trim().toLowerCase();

    const existingSpecialites = snapshot.docs
      .filter((doc) => {
        if (excludeId && doc.id === excludeId) {
          return false;
        }
        return true;
      })
      .filter((doc) => {
        const data = doc.data();
        return data.nom && data.nom.toLowerCase() === nomLower;
      });

    return existingSpecialites.length === 0;
  } catch (error) {
    console.error("Erreur vérification nom unique:", error);
    throw error;
  }
};

export const searchSpecialites = async (searchTerm) => {
  try {
    const allSpecialites = await getAllSpecialites();

    return allSpecialites.filter(
      (specialite) =>
        specialite.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialite.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Erreur recherche spécialités:", error);
    throw error;
  }
};

export const getActiveSpecialites = async () => {
  try {
    const specialitesCollection = collection(db, COLLECTION_NAME);
    const q = query(
      specialitesCollection,
      where("actif", "==", true),
      orderBy("nom")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Erreur récupération spécialités actives:", error);
    throw error;
  }
};

export const countSpecialites = async () => {
  try {
    const allSpecialites = await getAllSpecialites();
    return allSpecialites.length;
  } catch (error) {
    console.error("Erreur comptage spécialités:", error);
    throw error;
  }
};

export const incrementCoiffeurCount = async (specialiteId) => {
  try {
    const specialite = await getSpecialiteById(specialiteId);
    if (!specialite) return;

    await updateDoc(doc(db, COLLECTION_NAME, specialiteId), {
      nombreCoiffeurs: (specialite.nombreCoiffeurs || 0) + 1,
      dateModification: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erreur incrémentation compteur coiffeurs:", error);
    throw error;
  }
};

export const decrementCoiffeurCount = async (specialiteId) => {
  try {
    const specialite = await getSpecialiteById(specialiteId);
    if (!specialite) return;

    const newCount = Math.max(0, (specialite.nombreCoiffeurs || 0) - 1);

    await updateDoc(doc(db, COLLECTION_NAME, specialiteId), {
      nombreCoiffeurs: newCount,
      dateModification: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erreur décrémentation compteur coiffeurs:", error);
    throw error;
  }
};

export const specialiteService = {
  getAll: getAllSpecialites,
  getById: getSpecialiteById,
  create: createSpecialite,
  update: updateSpecialite,
  delete: deleteSpecialite,

  checkUniqueName: checkUniqueName,
  search: searchSpecialites,
  getActive: getActiveSpecialites,
  count: countSpecialites,

  incrementCoiffeurCount: incrementCoiffeurCount,
  decrementCoiffeurCount: decrementCoiffeurCount,
};

export default specialiteService;
