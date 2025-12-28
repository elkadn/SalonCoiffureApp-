import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Alert } from "react-native";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./src/firebase/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./src/screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fonction pour nettoyer AsyncStorage si nécessaire
    // Modifiez la fonction checkAndClearCorruptData dans App.js :

    const checkAndClearCorruptData = async () => {
      try {
        const allKeys = await AsyncStorage.getAllKeys();

        // Ciblez TOUTES les clés Firebase
        const firebaseKeys = allKeys.filter(
          (key) =>
            key.includes("firebase") ||
            key.includes("Firebase") ||
            key.includes("auth") ||
            key.includes("persistence")
        );

        if (firebaseKeys.length > 0) {
          console.log("Nettoyage des clés Firebase:", firebaseKeys);

          // Supprimez DIRECTEMENT toutes les clés Firebase
          await AsyncStorage.multiRemove(firebaseKeys);
          console.log("Toutes les données Firebase ont été nettoyées");
        }
      } catch (error) {
        console.log("Erreur lors du nettoyage:", error);
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
            console.error("Erreur onAuthStateChanged:", error);
            // Si erreur de parsing, nettoyez tout
            if (error.message.includes("String cannot be cast to Boolean")) {
              Alert.alert(
                "Erreur",
                "Données de session corrompues. Réinitialisation...",
                [
                  {
                    text: "OK",
                    onPress: async () => {
                      await AsyncStorage.clear();
                      setUser(null);
                      setLoading(false);
                    },
                  },
                ]
              );
            } else {
              setLoading(false);
            }
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Erreur setupAuth:", error);
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribePromise = setupAuth();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
            <Stack.Screen
              name="UserManagement"
              component={UserManagementScreen}
            />
            <Stack.Screen name="AddEditUser" component={AddEditUserScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
