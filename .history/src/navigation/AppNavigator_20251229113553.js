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
import CoiffeurManagement from "../screens/admin/CoiffeurManagement";
import SpecialiteList from "../screens/admin/specialites/SpecialiteList";
import SpecialiteForm from "../screens/admin/specialites/SpecialiteForm";
import AffectSpecialites from "../screens/admin/specialites/AffectSpecialites";

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
        <Stack.Screen
          name="CoiffeurManagement"
          component={CoiffeurManagement}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SpecialiteList"
          component={SpecialiteList}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SpecialiteForm"
          component={SpecialiteForm}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
  name="CoiffeurList" 
  component={CoiffeurList}
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="AffectSpecialites" 
  component={AffectSpecialites}
  options={{ headerShown: false }}
/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
