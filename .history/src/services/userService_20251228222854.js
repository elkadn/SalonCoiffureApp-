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
import { auth, db } from '../firebase/firebaseConfig';

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

// Créer un nouvel utilisateur
export const createUser = async (userData) => {
  try {
    let uid = userData.uid;
    
    // NE PAS créer dans Authentication depuis l'admin
    // Laissez l'utilisateur se créer son compte lui-même
    // OU créez un système d'invitation
    
    if (!uid) {
      // Générer un ID temporaire ou utiliser email comme ID
      uid = `temp_${Date.now()}`;
    }
    
    // Juste créer dans Firestore
    const { password, ...userDataWithoutPassword } = userData;
    
    const userDoc = {
      ...userDataWithoutPassword,
      uid,
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp(),
      actif: true,
      // Marquer comme "à activer" ou "invité"
      status: 'pending'
    };
    
    await setDoc(doc(db, "users", uid), userDoc);
    
    console.log("✅ Utilisateur créé (pending) avec ID :", uid);
    return uid;
    
  } catch (error) {
    console.error("❌ Erreur création utilisateur :", error);
    throw error;
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (userId, userData) => {
  try {
    // Ne pas mettre à jour l'email ici (c'est géré par Authentication)
    const { email, password, ...dataToUpdate } = userData;
    
    await updateDoc(doc(db, "users", userId), {
      ...dataToUpdate,
      dateModification: serverTimestamp()
    });
    
    console.log("Utilisateur mis à jour :", userId);
    return userId;
  } catch (error) {
    console.error("Erreur mise à jour utilisateur:", error);
    throw error;
  }
};

// Supprimer (désactiver) un utilisateur
export const deleteUser = async (userId) => {
  try {
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

// Rechercher des utilisateurs
export const searchUsers = async (searchTerm) => {
  try {
    const allUsers = await getAllUsers();
    
    return allUsers.filter(user => 
      user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telephone?.includes(searchTerm)
    );
  } catch (error) {
    console.error("Erreur recherche utilisateurs:", error);
    throw error;
  }
};

// Filtrer par rôle
export const getUsersByRole = async (role) => {
  try {
    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", role),
      where("actif", "==", true)
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