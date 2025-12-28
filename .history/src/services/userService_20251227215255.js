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
  serverTimestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase/firebaseConfig';

// Ajouter un utilisateur
export const addUser = async (userData) => {
  try {
    // Créer l'utilisateur dans Authentication si email/mot de passe fournis
    let uid = userData.uid;
    
    if (userData.email && userData.password && !uid) {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      uid = userCredential.user.uid;
    }
    
    if (!uid) {
      throw new Error("UID requis pour créer un utilisateur");
    }
    
    // Préparer les données pour Firestore (sans le mot de passe)
    const { password, ...userDataWithoutPassword } = userData;
    
    const userDoc = {
      ...userDataWithoutPassword,
      uid,
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp(),
      actif: true
    };
    
    // Créer le document dans Firestore
    await setDoc(doc(db, "users", uid), userDoc);
    
    console.log("Utilisateur ajouté avec ID :", uid);
    return uid;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", error);
    throw error;
  }
};

// Récupérer tous les utilisateurs
export const getAllUsers = async () => {
  try {
    const usersCollection = collection(db, "users");
    const snapshot = await getDocs(usersCollection);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    throw error;
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error);
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (userId, userData) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...userData,
      dateModification: serverTimestamp()
    });
    
    console.log("Utilisateur mis à jour :", userId);
    return userId;
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error);
    throw error;
  }
};

// Supprimer un utilisateur (désactiver)
export const deleteUser = async (userId) => {
  try {
    // Au lieu de supprimer, on désactive
    await updateDoc(doc(db, "users", userId), {
      actif: false,
      dateModification: serverTimestamp()
    });
    
    console.log("Utilisateur désactivé :", userId);
    return userId;
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    throw error;
  }
};

// Filtrer les utilisateurs par rôle
export const getUsersByRole = async (role) => {
  try {
    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", role)
    );
    
    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erreur filtre par rôle:", error);
    throw error;
  }
};