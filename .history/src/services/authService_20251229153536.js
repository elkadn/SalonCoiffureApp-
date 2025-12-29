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
        role: "client", // Rôle par défaut
        telephone: "",
        dateCreation: new Date().toISOString(),
        actif: true
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
      
      return userData;
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
    // Créer l'utilisateur dans Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Préparer les données utilisateur complètes
    const completeUserData = {
      uid: user.uid,
      email: email,
      nom: userData.nom || "",
      prenom: userData.prenom || "",
      role: userData.role || "client", // Rôle par défaut "client"
      telephone: userData.telephone || "",
      dateCreation: new Date().toISOString(),
      actif: true,
      ...userData // Inclure d'autres données spécifiques
    };
    
    // Sauvegarder dans Firestore
    await setDoc(doc(db, "users", user.uid), completeUserData);
    
    return {
      ...completeUserData,
      uid: user.uid,
      email: user.email
    };
  } catch (error) {
    console.error('Erreur inscription:', error);
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('Cet email est déjà utilisé');
      case 'auth/invalid-email':
        throw new Error('Email invalide');
      case 'auth/weak-password':
        throw new Error('Mot de passe trop faible');
      default:
        throw new Error('Erreur lors de l\'inscription');
    }
  }
};

// Créer un compte admin par défaut (pour initialisation)
export const createDefaultUsers = async () => {
  try {
    const defaultUsers = [
      {
        email: "admin@salon.com",
        password: "Admin123@",
        data: {
          nom: "Administrateur",
          prenom: "Admin",
          role: "admin",
          telephone: "0600000000"
        }
      },
      {
        email: "styliste@salon.com",
        password: "Styliste123@",
        data: {
          nom: "Styliste",
          prenom: "Jean",
          role: "stylist",
          telephone: "0612345678",
          specialites: ["Coupe homme", "Coloration"]
        }
      },
      {
        email: "client@salon.com",
        password: "Client123@",
        data: {
          nom: "Client",
          prenom: "Marie",
          role: "client",
          telephone: "0698765432"
        }
      }
    ];

    for (const user of defaultUsers) {
      const exists = await checkUserExistsByEmail(user.email);
      if (!exists) {
        try {
          await registerUser(user.email, user.password, user.data);
          console.log(`✅ Utilisateur ${user.email} créé`);
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            console.log(`ℹ️ ${user.email} existe déjà`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Erreur création utilisateurs par défaut:', error);
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

// Réinitialiser mot de passe
export const resetPassword = async (email) => {
  try {
    // Vous aurez besoin d'importer sendPasswordResetEmail
    // import { sendPasswordResetEmail } from 'firebase/auth';
    // await sendPasswordResetEmail(auth, email);
    // Pour l'instant, on simule
    return true;
  } catch (error) {
    console.error('Erreur réinitialisation:', error);
    throw error;
  }
};