import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';


const checkUserExistsByEmail = async (email) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Erreur vérification email:', error);
    return false;
  }
};

// Connexion
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Récupérer données Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Vérifier si c'est un admin
      if (userData.role !== 'admin') {
        throw new Error('Accès réservé aux administrateurs');
      }
      
      return {
        ...userData,
        uid: user.uid,
        email: user.email
      };
    } else {
      // Créer le document si inexistant
      const isAdminEmail = email === "admin@salon.com";
      const userData = {
        uid: user.uid,
        email: user.email,
        nom: isAdminEmail ? "Administrateur" : "Utilisateur",
        prenom: isAdminEmail ? "Admin" : "Nouveau",
        role: isAdminEmail ? "admin" : "client",
        telephone: "",
        dateCreation: new Date().toISOString(),
        actif: true
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
      
      if (!isAdminEmail) {
        throw new Error('Accès réservé aux administrateurs');
      }
      
      return userData;
    }
  } catch (error) {
    console.error('Erreur connexion:', error);
    
    // Messages d'erreur personnalisés
    switch (error.code || error.message) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        throw new Error('Email ou mot de passe incorrect');
      case 'auth/user-not-found':
        throw new Error('Email non trouvé');
      case 'auth/invalid-email':
        throw new Error('Email invalide');
      case 'Accès réservé aux administrateurs':
        throw error;
      default:
        throw new Error('Erreur de connexion');
    }
  }
};

// Déconnexion
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    throw error;
  }
};

// Écouter les changements d'auth
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Vérifier l'état actuel
export const getCurrentUser = () => {
  return auth.currentUser;
};