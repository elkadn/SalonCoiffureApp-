// services/authService.js
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
  getDocs,
  serverTimestamp // IMPORTANT: Pour les timestamps Firestore
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

// Connexion pour TOUS les utilisateurs
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Récupérer données Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Retourner les données utilisateur quelle que soit son rôle
      return {
        ...userData,
        uid: user.uid,
        email: user.email
      };
    } else {
      // Créer le document si inexistant avec rôle "client" par défaut
      const userData = {
        uid: user.uid,
        email: user.email,
        nom: "",
        prenom: "",
        role: "client",
        telephone: "",
        pointsFidelite: 0,
        actif: true,
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp(),
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
      
      return {
        ...userData,
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Erreur connexion:', error);
    
    // Messages d'erreur personnalisés
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        throw new Error('Email ou mot de passe incorrect');
      case 'auth/user-not-found':
        throw new Error('Email non trouvé');
      case 'auth/invalid-email':
        throw new Error('Email invalide');
      case 'auth/user-disabled':
        throw new Error('Compte désactivé');
      case 'auth/too-many-requests':
        throw new Error('Trop de tentatives. Réessayez plus tard');
      default:
        throw new Error('Erreur de connexion. Vérifiez vos identifiants');
    }
  }
};

// Inscription pour les nouveaux utilisateurs
export const registerUser = async (email, password, userData) => {
  try {
    // Vérifier si l'email existe déjà
    const emailExists = await checkUserExistsByEmail(email);
    if (emailExists) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Créer l'utilisateur dans Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Préparer les données utilisateur complètes avec structure cohérente
    const completeUserData = {
      uid: user.uid,
      email: email.toLowerCase().trim(),
      nom: userData.nom?.trim() || "",
      prenom: userData.prenom?.trim() || "",
      role: "client", // Toujours client pour les inscriptions publiques
      telephone: userData.telephone?.trim() || "",
      pointsFidelite: 0, // Initialisation des points
      actif: true,
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp(),
      // Vous pouvez ajouter d'autres champs spécifiques ici
      preferences: {
        notifications: true,
        newsletter: false,
      }
    };
    
    // Sauvegarder dans Firestore
    await setDoc(doc(db, "users", user.uid), completeUserData);
    
    // Retourner les données formatées pour le contexte
    return {
      ...completeUserData,
      uid: user.uid,
      email: user.email,
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erreur inscription:', error);
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('Cet email est déjà utilisé');
      case 'auth/invalid-email':
        throw new Error('Email invalide');
      case 'auth/weak-password':
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      case 'auth/operation-not-allowed':
        throw new Error('L\'inscription par email/mot de passe n\'est pas activée');
      default:
        if (error.message.includes('déjà utilisé')) {
          throw error;
        }
        throw new Error(`Erreur lors de l'inscription: ${error.message}`);
    }
  }
};

// Mettre à jour les données utilisateur
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...updates,
      dateModification: serverTimestamp(),
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    throw error;
  }
};

// Fonctions utilitaires
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Réinitialiser mot de passe (à implémenter avec Firebase)
export const resetPassword = async (email) => {
  try {
    // Implémentez avec sendPasswordResetEmail si nécessaire
    // import { sendPasswordResetEmail } from 'firebase/auth';
    // await sendPasswordResetEmail(auth, email);
    throw new Error('Fonctionnalité non implémentée');
  } catch (error) {
    console.error('Erreur réinitialisation:', error);
    throw error;
  }
};