import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (uid) => {
    try {
      console.log('🔍 Chargement des données utilisateur pour:', uid);
      
      if (!uid) {
        setUserData(null);
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('✅ Données utilisateur chargées:', { uid, role: data.role });
        
        const normalizedData = {
          ...data,
          uid,
          dateCreation: data.dateCreation?.toDate ? data.dateCreation.toDate().toISOString() : data.dateCreation,
          dateModification: data.dateModification?.toDate ? data.dateModification.toDate().toISOString() : data.dateModification,
        };
        
        setUserData(normalizedData);
        return normalizedData;
      } else {
        console.log('⚠️ Aucun document utilisateur trouvé pour:', uid);
        setUserData(null);
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur chargement données utilisateur:', error);
      setUserData(null);
      return null;
    }
  }, []);

  const login = useCallback((user) => {
    console.log('🔐 Login context appelé avec:', user?.email);
    setCurrentUser(user);
    if (user?.uid) {
      loadUserData(user.uid);
    } else {
      setUserData(user);
    }
  }, [loadUserData]);

  const logout = useCallback(async () => {
    console.log('🚪 Logout context appelé');
    try {
      await signOut(auth);
    } catch (error) {
      console.error('❌ Erreur logout:', error);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 AuthProvider: Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 AuthProvider: Auth state changed:', firebaseUser?.uid || 'undefined');
      
      if (firebaseUser) {
        const basicUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };
        setCurrentUser(basicUser);
        
        await loadUserData(firebaseUser.uid);
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🔄 AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, [loadUserData]);

  const value = {
    currentUser,
    userData,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};