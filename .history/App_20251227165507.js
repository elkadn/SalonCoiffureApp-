import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, Alert } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './src/firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fonction pour nettoyer AsyncStorage si nécessaire
    const checkAndClearCorruptData = async () => {
      try {
        // Essayez de lire les clés Firebase
        const allKeys = await AsyncStorage.getAllKeys();
        const firebaseKeys = allKeys.filter(key => key.includes('firebase') || key.includes('Firebase'));
        
        if (firebaseKeys.length > 0) {
          // Essayez de lire les données
          const items = await AsyncStorage.multiGet(firebaseKeys);
          for (const [key, value] of items) {
            try {
              // Si c'est un JSON, vérifiez le parsing
              if (value) {
                JSON.parse(value);
              }
            } catch (e) {
              console.log(`Données corrompues trouvées dans ${key}, nettoyage...`);
              await AsyncStorage.removeItem(key);
            }
          }
        }
      } catch (error) {
        console.log('Erreur lors du nettoyage:', error);
      }
    };

    const setupAuth = async () => {
      try {
        // Nettoyez d'abord les données potentiellement corrompues
        await checkAndClearCorruptData();
        
        // Puis configurez l'écouteur d'authentification
        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            setUser(user);
            setLoading(false);
          },
          (error) => {
            console.error('Erreur onAuthStateChanged:', error);
            // Si erreur de parsing, nettoyez tout
            if (error.message.includes('String cannot be cast to Boolean')) {
              Alert.alert(
                'Erreur',
                'Données de session corrompues. Réinitialisation...',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      await AsyncStorage.clear();
                      setUser(null);
                      setLoading(false);
                    }
                  }
                ]
              );
            } else {
              setLoading(false);
            }
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('Erreur setupAuth:', error);
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribePromise = setupAuth();
    
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