import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const addUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      dateAjout: serverTimestamp(),
      actif: true
    });
    console.log("Utilisateur ajouté avec ID :", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", e);
    throw e;
  }
};

export const addClient = async () => {
  return addUser({
    email: "client@example.com",
    prenom: "Adnane",
    nom: "Elkihel",
    telephone: "0612345678",
    role: "client",
    motDePasse: "hash_du_mot_de_passe",
    pointsFidelite: 150
  });
};
