import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

// Fonction pour vérifier si Firebase est configuré
const checkFirebaseConfig = () => {
  if (!auth) {
    throw new Error('Firebase Auth n\'est pas initialisé');
  }
  if (!db) {
    throw new Error('Firestore n\'est pas initialisé');
  }
};

// Créer un compte administrateur par défaut (version améliorée)
export const createDefaultAdmin = async () => {
  try {
    checkFirebaseConfig();
    
    const adminEmail = "admin@salon.com";
    const adminPassword = "Admin123@";
    
    console.log('🔧 Tentative de création admin...');
    
    // Vérifier d'abord si l'admin existe déjà dans Auth
    try {
      // Tenter de créer l'utilisateur dans Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        adminEmail, 
        adminPassword
      );
      
      console.log('✅ Admin créé dans Auth:', userCredential.user.uid);
      
      // Créer le document dans Firestore
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
      
      console.log('✅ Document admin créé dans Firestore');
      
      return userCredential.user.uid;
      
    } catch (authError) {
      // Si l'utilisateur existe déjà (code d'erreur auth/email-already-in-use)
      if (authError.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Admin existe déjà dans Auth');
        
        // Essayer de se connecter pour récupérer l'UID
        try {
          const signInResult = await signInWithEmailAndPassword(
            auth, 
            adminEmail, 
            adminPassword
          );
          
          const uid = signInResult.user.uid;
          
          // Vérifier si le document existe dans Firestore
          const adminDoc = await getDoc(doc(db, "users", uid));
          
          if (!adminDoc.exists()) {
            // Créer le document manquant
            await setDoc(doc(db, "users", uid), {
              uid: uid,
              email: adminEmail,
              nom: "Administrateur",
              prenom: "Admin",
              telephone: "0600000000",
              role: "admin",
              dateCreation: new Date().toISOString(),
              actif: true
            });
            console.log('✅ Document admin créé dans Firestore (utilisateur existant)');
          } else {
            console.log('✅ Document admin existe déjà dans Firestore');
          }
          
          // Se déconnecter après la vérification
          await signOut(auth);
          
          return uid;
          
        } catch (signInError) {
          console.error('Erreur connexion admin existant:', signInError);
          throw signInError;
        }
      } else {
        throw authError;
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur création admin:', error.code, error.message);
    
    // Afficher des informations détaillées pour le débogage
    if (error.code === 'auth/configuration-not-found') {
      console.error('🛠️ Solution: Vérifiez votre configuration Firebase dans firebaseConfig.js');
      console.error('🛠️ Assurez-vous que vos clés Firebase sont correctes');
    } else if (error.code === 'auth/network-request-failed') {
      console.error('🛠️ Solution: Vérifiez votre connexion Internet');
    }
    
    throw error;
  }
};

// Connexion (version simplifiée)
export const loginUser = async (email, password) => {
  try {
    checkFirebaseConfig();
    
    console.log('🔐 Tentative de connexion:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Connexion réussie:', user.uid);
    
    // Récupérer les infos supplémentaires depuis Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ Données utilisateur récupérées:', userData.role);
      return {
        ...userData,
        uid: user.uid,
        email: user.email
      };
    } else {
      console.log('⚠️ Aucun document utilisateur trouvé dans Firestore');
      // Créer un document par défaut si inexistant
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        nom: "Utilisateur",
        prenom: "Sans nom",
        role: "client",
        dateCreation: new Date().toISOString(),
        actif: true
      });
      
      return {
        uid: user.uid,
        email: user.email,
        nom: "Utilisateur",
        prenom: "Sans nom",
        role: "client"
      };
    }
  } catch (error) {
    console.error('❌ Erreur connexion:', error.code, error.message);
    
    // Messages d'erreur utilisateur-friendly
    let errorMessage = "Échec de la connexion";
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = "Email invalide";
        break;
      case 'auth/user-disabled':
        errorMessage = "Compte désactivé";
        break;
      case 'auth/user-not-found':
        errorMessage = "Utilisateur non trouvé";
        break;
      case 'auth/wrong-password':
        errorMessage = "Mot de passe incorrect";
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

// Vérifier si l'utilisateur est admin
export const isAdminUser = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    return false;
  }
};