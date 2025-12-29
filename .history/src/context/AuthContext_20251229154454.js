

// // context/AuthContext.js
// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { auth } from '../firebase/firebaseConfig';
// import { onAuthStateChanged, signOut } from 'firebase/auth';

// const AuthContext = createContext({});

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [userData, setUserData] = useState(null); // Nouveau: données utilisateur complètes
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     console.log('AuthProvider: Setting up auth listener...');
    
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       console.log('AuthProvider: Auth state changed:', user?.uid);
//       setCurrentUser(user);
      
//       // Si l'utilisateur est connecté, récupérez ses données complètes
//       if (user) {
//         // Ici vous devriez récupérer les données utilisateur depuis votre base de données
//         // Pour l'instant, on simule avec les données par défaut
//         fetchUserData(user.uid);
//       } else {
//         setUserData(null);
//       }
      
//       setLoading(false);
//     }, (error) => {
//       console.error('AuthProvider: Auth state error:', error);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   // Fonction pour récupérer les données utilisateur
//   const fetchUserData = async (userId) => {
//     try {
//       // Ici, vous devriez faire un appel à votre base de données
//       // Pour l'instant, on simule avec des données par défaut
//       const simulatedUserData = {
//         id: userId,
//         email: "admin@salon.com",
//         role: userId === "xJTdERWLUfME1a8AKMWaq3yUHHM2" ? "admin" : "client",
//         // Ajoutez d'autres données selon votre structure
//       };
//       setUserData(simulatedUserData);
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     }
//   };

//   // Fonction de connexion
//   const login = (user) => {
//     setCurrentUser(user);
//     // Récupérer les données utilisateur après connexion
//     if (user?.uid) {
//       fetchUserData(user.uid);
//     }
//   };

//   // Fonction de déconnexion
//   const logout = async () => {
//     try {
//       await signOut(auth);
//       setCurrentUser(null);
//       setUserData(null);
//       console.log('Déconnexion réussie');
//     } catch (error) {
//       console.error('Erreur de déconnexion:', error);
//     }
//   };

//   // Fonction pour forcer un refresh
//   const refreshUser = () => {
//     const user = auth.currentUser;
//     console.log('AuthProvider: Refreshing user:', user?.uid);
//     setCurrentUser(user);
//     if (user?.uid) {
//       fetchUserData(user.uid);
//     }
//   };

//   const value = {
//     currentUser,
//     userData, // Ajouté
//     loading,
//     login, // Ajouté
//     logout, // Ajouté
//     refreshUser
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };