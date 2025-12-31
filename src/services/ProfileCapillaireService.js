import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const getProfilCapillaireByClientId = async (clientId) => {
  try {
    const profilCollection = collection(db, "profils_capillaires");
    const q = query(
      profilCollection,
      where("clientId", "==", clientId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      const docData = snapshot.docs[0];
      return {
        id: docData.id,
        ...docData.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération du profil capillaire:", error);
    return null;
  }
};

export const saveProfilCapillaire = async (clientId, profilData) => {
  try {
    const existingProfil = await getProfilCapillaireByClientId(clientId);
    
    const profilDoc = {
      ...profilData,
      clientId,
      dateModification: serverTimestamp()
    };
    
    if (existingProfil) {
      await updateDoc(doc(db, "profils_capillaires", existingProfil.id), profilDoc);
      return { success: true, id: existingProfil.id, message: "Profil mis à jour" };
    } else {
      const newDocRef = doc(collection(db, "profils_capillaires"));
      profilDoc.dateCreation = serverTimestamp();
      await setDoc(newDocRef, profilDoc);
      return { success: true, id: newDocRef.id, message: "Profil créé" };
    }
  } catch (error) {
    console.error("Erreur sauvegarde profil capillaire:", error);
    throw error;
  }
};

export const deleteProfilCapillaire = async (profilId) => {
  try {
    await deleteDoc(doc(db, "profils_capillaires", profilId));
    return { success: true, message: "Profil supprimé" };
  } catch (error) {
    console.error("Erreur suppression profil:", error);
    throw error;
  }
};