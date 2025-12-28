import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import UserForm from '../components/Users/UserForm';
import UserDetailsScreen from '../screens/UserDetailsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ title: 'Tableau de bord' }}
        />
        
        <Stack.Screen 
          name="UserManagement" 
          component={UserManagementScreen}
          options={{ title: 'Gestion des Utilisateurs' }}
        />
        
        <Stack.Screen 
          name="AddUser" 
          component={UserForm}
          options={{ title: 'Ajouter Utilisateur' }}
        />
        
        <Stack.Screen 
          name="EditUser" 
          component={UserForm}
          options={{ title: 'Modifier Utilisateur' }}
        />
        
        {/* <Stack.Screen 
          name="UserDetails" 
          component={UserDetailsScreen}
          options={{ title: 'Détails Utilisateur' }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;