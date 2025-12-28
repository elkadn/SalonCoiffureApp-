// src/services/userService.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

export const addUser = async (userData) => {
  try {
    const password = userData.motDePasse || Math.random().toString(36).slice(-8);
    
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      password
    );

    // Assurez-vous que tous les champs ont le bon type
    const firestoreData = {
      uid: userCredential.user.uid,
      email: userData.email,
      nom: userData.nom,
      prenom: userData.prenom,
      telephone: userData.telephone,
      role: userData.role || 'client',
      pointsFidelite: parseInt(userData.pointsFidelite) || 0,
      dateCreation: serverTimestamp(),
      actif: true, // Bien un booléen, pas une chaîne
      adresse: userData.adresse || '',
      dateNaissance: userData.dateNaissance || null
    };

    // Nettoyez les propriétés undefined
    Object.keys(firestoreData).forEach(key => {
      if (firestoreData[key] === undefined) {
        delete firestoreData[key];
      }
    });

    const docRef = await addDoc(collection(db, "users"), firestoreData);

    return { 
      success: true, 
      id: docRef.id, 
      userId: userCredential.user.uid,
      password: password
    };
  } catch (e) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", e);
    throw e;
  }
};

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return users;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Utilisateur non trouvé");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, {
      ...userData,
      dateModification: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la modification de l'utilisateur:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const docRef = doc(db, "users", id);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
};

export const toggleUserStatus = async (id, currentStatus) => {
  try {
    const docRef = doc(db, "users", id);
    await updateDoc(docRef, {
      actif: !currentStatus,
      dateModification: serverTimestamp()
    });
    
    return { success: true, newStatus: !currentStatus };
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    throw error;
  }
};