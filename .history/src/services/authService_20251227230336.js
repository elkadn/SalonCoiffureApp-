import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  collection,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

// Vérifier si un utilisateur existe par email
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

// Vérifier si l'admin existe déjà par email
const checkAdminExists = async () => {
  try {
    const adminEmail = "admin@salon.com";
    return await checkUserExistsByEmail(adminEmail);
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    return false;
  }
};

// Créer un compte administrateur par défaut
export const createDefaultAdmin = async () => {
  try {
    console.log('⏳ Début création admin...');
    
    const adminEmail = "admin@salon.com";
    const adminPassword = "Admin123@";
    
    // Vérifier si l'admin existe déjà par email
    const adminExists = await checkAdminExists();
    
    if (adminExists) {
      console.log('✅ Admin existe déjà');
      return;
    }
    
    console.log('🔄 Création nouvel admin...');
    
    // Créer l'utilisateur dans Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminEmail, 
      adminPassword
    );
    
    console.log('✅ Authentication réussi, UID:', userCredential.user.uid);
    
    // Créer le document utilisateur dans Firestore
    const userData = {
      uid: userCredential.user.uid,
      email: adminEmail,
      nom: "Administrateur",
      prenom: "Admin",
      telephone: "0600000000",
      role: "admin",
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
      actif: true
    };
    
    await setDoc(doc(db, "users", userCredential.user.uid), userData);
    
    console.log('✅ Admin créé avec succès dans Firestore');
    console.log('📋 Données admin:', userData);
    
    return userCredential.user.uid;
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
    console.error('Code erreur:', error.code);
    console.error('Message erreur:', error.message);
    
    // Vérifier si l'admin existe déjà dans Authentication
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin existe déjà dans Authentication');
    }
    
    throw error;
  }
};

// Tester la connexion admin
export const testAdminConnection = async () => {
  try {
    const adminEmail = "admin@salon.com";
    const adminPassword = "Admin123@";
    
    console.log('🧪 Test connexion admin...');
    
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      adminEmail, 
      adminPassword
    );
    
    console.log('✅ Test connexion réussi');
    
    // Récupérer les données Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    
    if (userDoc.exists()) {
      console.log('✅ Données Firestore trouvées:', userDoc.data());
    } else {
      console.log('⚠️ Aucune donnée Firestore trouvée');
    }
    
    // Se déconnecter après le test
    await signOut(auth);
    
    return true;
  } catch (error) {
    console.error('❌ Test connexion échoué:', error);
    return false;
  }
};

// Connexion utilisateur
export const loginUser = async (email, password) => {
  try {
    console.log('🔑 Tentative connexion:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Authentication réussie, UID:', user.uid);
    
    // Récupérer les infos supplémentaires depuis Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ Données Firestore récupérées:', userData);
      
      return {
        ...userData,
        uid: user.uid,
        email: user.email
      };
    } else {
      console.log('⚠️ Aucune donnée Firestore trouvée');
      // Créer un document par défaut si non trouvé
      const defaultUserData = {
        uid: user.uid,
        email: user.email,
        nom: "Utilisateur",
        prenom: "Nouveau",
        role: "client",
        dateCreation: new Date().toISOString(),
        actif: true
      };
      
      await setDoc(doc(db, "users", user.uid), defaultUserData);
      
      return {
        ...defaultUserData,
        uid: user.uid,
        email: user.email
      };
    }
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    console.error('Code erreur:', error.code);
    console.error('Message erreur:', error.message);
    
    // Messages d'erreur plus conviviaux
    let errorMessage = "Échec de la connexion";
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "Email non trouvé";
        break;
      case 'auth/wrong-password':
        errorMessage = "Mot de passe incorrect";
        break;
      case 'auth/invalid-email':
        errorMessage = "Email invalide";
        break;
      case 'auth/user-disabled':
        errorMessage = "Compte désactivé";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Trop de tentatives. Réessayez plus tard";
        break;
    }
    
    throw new Error(errorMessage);
  }
};

// Déconnexion
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log('✅ Déconnexion réussie');
  } catch (error) {
    console.error('❌ Erreur déconnexion:', error);
    throw error;
  }
};

// Vérifier l'état d'authentification
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Écouter les changements d'authentification
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Réinitialiser mot de passe
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Email de réinitialisation envoyé');
  } catch (error) {
    console.error('❌ Erreur réinitialisation:', error);
    throw error;
  }
};