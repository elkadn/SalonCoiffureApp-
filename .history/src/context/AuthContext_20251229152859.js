// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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
  const [navigation, setNavigation] = useState(null);

  // Fonction pour définir la navigation (appelée depuis les écrans)
  const setNavigationInstance = (nav) => {
    setNavigation(nav);
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('AuthProvider: Auth state changed:', firebaseUser?.uid);
      setCurrentUser(firebaseUser);
      
      if (firebaseUser) {
        // Ici, vous devriez récupérer les données depuis votre base de données
        // Pour l'instant, on simule avec des données par défaut pour l'admin
        fetchUserData(firebaseUser.uid);
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

  const fetchUserData = async (userId) => {
    try {
      // Simulation de données utilisateur
      // Dans la réalité, faites un appel à votre base de données
      const simulatedUserData = {
        id: userId,
        email: "admin@salon.com",
        role: "admin",
        nom: "Administrateur",
        prenom: "Admin"
      };
      setUserData(simulatedUserData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fonction de connexion
  const login = (userData) => {
    console.log('AuthContext: Login called with user:', userData);
    setUserData(userData);
  };

  // Fonction de déconnexion avec redirection
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
      console.log('Déconnexion réussie');
      
      // Rediriger vers Home après déconnexion
      if (navigation) {
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    logout,
    setNavigationInstance // Ajouté
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};