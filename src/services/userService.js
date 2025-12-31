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
import { createUserWithEmailAndPassword,signInWithEmailAndPassword  } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';

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


export const createUser = async (userData) => {
  try {
    let uid = userData.uid;
    
    if (userData.email && userData.password && !uid) {
      try {
        const adminBefore = auth.currentUser;
        console.log('Admin avant création:', adminBefore?.email);
        
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        uid = userCredential.user.uid;
        
        console.log('Nouveau user créé:', userData.email);
        
    
        if (adminBefore && adminBefore.email) {
          try {
            await auth.signOut(); 

            await signInWithEmailAndPassword(auth, "admin@salon.com", "Admin123@");
            console.log('Reconnecté avec admin');
          } catch (reconnectError) {
            console.log('Note: Admin reste déconnecté');
          }
        }
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          throw new Error('Cet email est déjà utilisé');
        }
        throw error;
      }
    }
    
    if (!uid) {
      throw new Error("UID requis pour créer un utilisateur");
    }
    
    const { password, ...userDataWithoutPassword } = userData;
    
    const userDoc = {
      ...userDataWithoutPassword,
      uid,
      dateCreation: serverTimestamp(),
      dateModification: serverTimestamp(),
      actif: true
    };
    
    await setDoc(doc(db, "users", uid), userDoc);
    
    console.log("Utilisateur créé avec ID :", uid);
    return uid;
  } catch (error) {
    console.error("Erreur création utilisateur :", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
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

