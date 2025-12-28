// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthProvider: Auth state changed:', user?.uid);
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error('AuthProvider: Auth state error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fonction pour forcer un refresh
  const refreshUser = () => {
    const user = auth.currentUser;
    console.log('AuthProvider: Refreshing user:', user?.uid);
    setCurrentUser(user);
  };

  const value = {
    currentUser,
    loading,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};