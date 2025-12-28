// src/services/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';


export const registerAdmin = async (email, password, adminData) => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour le profil
    await updateProfile(userCredential.user, {
      displayName: adminData.nom
    });

    // Créer le document dans Firestore
    await setDoc(doc(db, "admins", userCredential.user.uid), {
      email: email,
      nom: adminData.nom,
      prenom: adminData.prenom,
      telephone: adminData.telephone,
      role: 'admin',
      dateCreation: new Date(),
      actif: true
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    throw error;
  }
};

export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Vérifier si c'est un admin
    const adminDoc = await getDoc(doc(db, "admins", userCredential.user.uid));
    
    if (!adminDoc.exists()) {
      await signOut(auth);
      throw new Error("Accès réservé aux administrateurs");
    }

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Erreur de connexion:", error);
    throw error;
  }
};

export const logoutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur de déconnexion:", error);
    throw error;
  }
};