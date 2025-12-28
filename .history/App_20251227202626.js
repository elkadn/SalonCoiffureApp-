import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './src/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import AdminDashboard from './src/screens/AdminDashboard';
import UserManagementScreen from './src/screens/UserManagementScreen';
import AddEditUserScreen from './src/screens/AddEditUserScreen';

const Stack = createNativeStackNavigator();

// Clé pour stocker manuellement l'état de connexion
const AUTH_STORAGE_KEY = 'app_auth_state';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔄 Vérification auth...');
        
        // 1. Nettoyer TOUTES les anciennes données Firebase d'AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();
        const firebaseKeys = allKeys.filter(key => 
          key.includes('firebase') || 
          key.includes('Firebase') ||
          key.includes('auth') ||
          key.startsWith('@')
        );
        
        if (firebaseKeys.length > 0) {
          console.log(`🧹 Suppression ${firebaseKeys.length} clés Firebase`);
          await AsyncStorage.multiRemove(firebaseKeys);
        }
        
        // 2. Vérifier NOTRE propre stockage
        const savedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        
        // 3. Configurer l'écouteur Firebase (avec timeout de sécurité)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout auth')), 5000)
        );
        
        const authPromise = new Promise((resolve, reject) => {
          const unsubscribe = onAuthStateChanged(
            auth,
            async (firebaseUser) => {
              console.log('🔥 Firebase auth state:', firebaseUser ? 'User found' : 'No user');
              
              if (firebaseUser) {
                // Sauvegarder dans NOTRE stockage
                await AsyncStorage.setItem(AUTH_STORAGE_KEY, 'true');
                setUser(firebaseUser);
              } else {
                await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
                setUser(null);
              }
              
              unsubscribe();
              resolve();
              setLoading(false);
            },
            (error) => {
              console.error('💥 Firebase auth error:', error);
              
              // IGNORER l'erreur et continuer sans auth Firebase
              unsubscribe();
              
              // Vérifier notre stockage manuel
              if (savedAuth === 'true') {
                console.log('⚠️ Utilisation du cache manuel');
                // L'utilisateur devra se reconnecter
              }
              
              setUser(null);
              setLoading(false);
              resolve(); // On résout quand même pour continuer
            }
          );
        });
        
        await Promise.race([authPromise, timeoutPromise]);
        
      } catch (error) {
        console.error('❌ Erreur checkAuth:', error);
        setUser(null);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    }
  };

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
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLoginSuccess={() => setUser({})} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="AdminDashboard">
              {(props) => <AdminDashboard {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="AddEditUser" component={AddEditUserScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}