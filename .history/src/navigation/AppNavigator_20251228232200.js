import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import SplashScreen from "../screens/auth/SplashScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import DashboardScreen from "../screens/admin/DashboardScreen";
import UserListScreen from "../screens/admin/users/UserListScreen";
import UserFormScreen from "../screens/admin/users/UserFormScreen";
import UserDetailScreen from "../screens/admin/users/UserDetailScreen";
import StylisteCreneauxScreen from "../screens/admin/users/StylisteCreneauxScreen";
import ProfilCapillaireScreen from "../screens/admin/users/ProfilCapillaireScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        {/* Auth Screens */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        {/* Admin Screens */}
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: "Tableau de bord",
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="UserList"
          component={UserListScreen}
          options={{
            title: "Gestion des Utilisateurs",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="UserForm"
          component={UserFormScreen}
          options={{
            title: "Utilisateur",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="UserDetail"
          component={UserDetailScreen}
          options={{
            title: "Détails",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="StylisteCreneaux"
          component={StylisteCreneauxScreen}
          options={{ title: "Créneaux horaires" }}
        />
        <Stack.Screen
          name="ProfilCapillaire"
          component={ProfilCapillaireScreen}
          options={{ title: "Profil Capillaire" }}
        />
      </Stack.Navigator>
      <Stack.Screen name="CoiffeurManagement" component={CoiffeurManagement} />
<Stack.Screen name="SpecialiteList" component={SpecialiteList} />
<Stack.Screen name="SpecialiteForm" component={SpecialiteForm} />
    </NavigationContainer>
  );
};

export default AppNavigator;
