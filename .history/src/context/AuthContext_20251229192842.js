// context/AuthContext.js - VERSION CORRIGÉE
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // IMPORTANT: Ajoutez cette importation

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthProvider: Auth state changed:', user?.uid);
      setCurrentUser(user);
      
      if (user) {
        // Récupérer les VRAIES données utilisateur depuis Firestore
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('AuthProvider: Auth state error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fonction pour récupérer les VRAIES données utilisateur
  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        setUserData({
          id: userId,
          ...userDoc.data()
        });
        console.log('✅ Données utilisateur chargées:', userDoc.data());
      } else {
        console.log('❌ Document utilisateur non trouvé pour:', userId);
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    }
  };

  // Fonction de connexion (utilisée dans LoginScreen)
  const login = async (userCredential) => {
    setCurrentUser(userCredential.user);
    
    if (userCredential.user?.uid) {
      await fetchUserData(userCredential.user.uid);
    }
    
    console.log('✅ Utilisateur connecté:', userCredential.user?.email);
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
    }
  };

  // Fonction pour forcer un refresh
  const refreshUser = async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      setCurrentUser(user);
      if (user.uid) {
        await fetchUserData(user.uid);
      }
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};