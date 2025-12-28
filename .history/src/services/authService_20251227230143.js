import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { addUser } from './userService';

// Créer un compte administrateur par défaut
export const createDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@salon.com";
    const adminPassword = "Admin123@";
    
    // Vérifier si l'admin existe déjà
    const adminDoc = await getDoc(doc(db, "users", "admin_uid"));
    
    if (!adminDoc.exists()) {
      // Créer l'utilisateur dans Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminEmail, 
        adminPassword
      );
      
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: adminEmail,
        nom: "Administrateur",
        prenom: "Admin",
        telephone: "0600000000",
        role: "admin",
        dateCreation: new Date().toISOString(),
        actif: true
      });
      
      console.log("Admin créé avec succès");
      return userCredential.user.uid;
    }
  } catch (error) {
    console.error("Erreur création admin:", error);
  }
};

// Connexion
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Récupérer les infos supplémentaires depuis Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      return {
        ...userDoc.data(),
        uid: user.uid,
        email: user.email
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur connexion:", error);
    throw error;
  }
};

// Déconnexion
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur déconnexion:", error);
    throw error;
  }
};

// Vérifier l'état d'authentification
export const getCurrentUser = () => {
  return auth.currentUser;
};