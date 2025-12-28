import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Alert } from 'react-native';
import { onAuthStateChanged, signOut, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { auth as originalAuth } from './src/firebase/firebaseConfig'; // Renomme l'import
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import UserManagementScreen from './src/screens/UserManagementScreen';
import AddEditUserScreen from './src/screens/AddEditUserScreen';
import { initializeApp } from 'firebase/app'; // Ajoute cet import

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const NUCLEAR_CLEANUP = async () => {
      try {
        console.log('🚀 DÉBUT DU NETTOYAGE NUCLÉAIRE');
        
        // 1. FORCE SIGNOUT d'abord
        try {
          await signOut(originalAuth);
          console.log('✅ Déconnexion forcée');
        } catch (e) {
          console.log('ℹ️ Pas de session active:', e.message);
        }
        
        // 2. NETTOYAGE COMPLET d'AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();
        console.log(`🗑️ Suppression de ${allKeys.length} clés...`);
        
        if (allKeys.length > 0) {
          await AsyncStorage.multiRemove(allKeys);
          console.log('✅ AsyncStorage complètement vidé');
        }
        
        // 3. Attendre 500ms
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 4. RÉINITIALISER Firebase Auth
        // Importe la configuration depuis ton fichier
        const firebaseConfig = {
          apiKey: "AIzaSyC0r5HUgGVp1JyRGBcf24_a9qbokijtTRM",
          authDomain: "saloncoiffureapp.firebaseapp.com",
          projectId: "saloncoiffureapp",
          storageBucket: "saloncoiffureapp.firebasestorage.app",
          messagingSenderId: "928948250472",
          appId: "1:928948250472:web:cf3a2464ebcd21a4fe18dd",
          measurementId: "G-FFBBN3CTQE"
        };
        
        const app = initializeApp(firebaseConfig, "FreshAppInstance");
        const cleanAuth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage)
        });
        
        console.log('✅ Firebase Auth réinitialisé');
        
        return cleanAuth;
      } catch (error) {
        console.error('💥 ERREUR NETTOYAGE:', error);
        return originalAuth;
      }
    };

    const initializeAppAuth = async () => {
      try {
        // ÉTAPE 1 : NETTOYAGE TOTAL
        const cleanAuth = await NUCLEAR_CLEANUP();
        
        // ÉTAPE 2 : Configuration de l'écouteur
        const unsubscribe = onAuthStateChanged(
          cleanAuth,
          (user) => {
            console.log('👤 État auth:', user ? 'Connecté' : 'Déconnecté');
            setUser(user);
            setLoading(false);
          },
          (error) => {
            console.error('🔥 ERREUR CRITIQUE:', error);
            
            // Si toujours l'erreur, on cache tout et force login
            Alert.alert(
              'Réinitialisation',
              'Les données de session sont corrompues. Redémarrage...',
              [{
                text: 'OK',
                onPress: async () => {
                  await AsyncStorage.clear();
                  setUser(null);
                  setLoading(false);
                }
              }]
            );
          }
        );
        
        return unsubscribe;
      } catch (error) {
        console.error('💣 INIT FAILED:', error);
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribePromise = initializeAppAuth();
    
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="AddEditUser" component={AddEditUserScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}