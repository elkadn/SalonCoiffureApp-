import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

// Importez vos écrans
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import DashboardScreen from "../screens/admin/DashboardScreen";
import UserListScreen from "../screens/admin/users/UserListScreen";
import CoiffeurManagement from "../screens/admin/CoiffeurManagement";
import ProductManagement from "../screens/admin/produits/ProductManagement";

const Drawer = createDrawerNavigator();

// Contenu personnalisé du Drawer
const CustomDrawerContent = (props) => {
  const { user, logout } = useAuth();

  const menuItems = [
    // Items pour tous
    {
      label: "Accueil",
      screen: "Home",
      icon: "🏠",
    },
    
    // Si non connecté
    ...(!user
      ? [
          {
            label: "Connexion",
            screen: "Login",
            icon: "🔐",
          },
        ]
      : []),
    
    // Si admin connecté
    ...(user?.role === 'admin'
      ? [
          {
            label: "Tableau de bord",
            screen: "Dashboard",
            icon: "📊",
          },
          {
            label: "Gestion Utilisateurs",
            screen: "UserList",
            icon: "👥",
          },
          {
            label: "Gestion Coiffeurs",
            screen: "CoiffeurManagement",
            icon: "💇",
          },
          {
            label: "Gestion Produits",
            screen: "ProductManagement",
            icon: "📦",
          },
        ]
      : []),
    
    // Si connecté
    ...(user
      ? [
          {
            label: "Déconnexion",
            action: logout,
            icon: "🚪",
          },
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Salon de Coiffure</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.prenom} {user.nom}
            </Text>
            <Text style={styles.userRole}>
              {user.role === 'admin' ? 'Administrateur' : 
               user.role === 'stylist' ? 'Styliste' : 'Client'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.menuItems}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (item.action) {
                item.action();
              } else {
                props.navigation.navigate(item.screen);
              }
              props.navigation.closeDrawer();
            }}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          drawerLabel: "Accueil",
        }}
      />
      
      <Drawer.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          drawerLabel: "Connexion",
        }}
      />
      
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          drawerLabel: "Tableau de bord",
        }}
      />
      
      <Drawer.Screen 
        name="UserList" 
        component={UserListScreen}
        options={{
          drawerLabel: "Gestion Utilisateurs",
        }}
      />
      
      <Drawer.Screen 
        name="CoiffeurManagement" 
        component={CoiffeurManagement}
        options={{
          drawerLabel: "Gestion Coiffeurs",
        }}
      />
      
      <Drawer.Screen 
        name="ProductManagement" 
        component={ProductManagement}
        options={{
          drawerLabel: "Gestion Produits",
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  userInfo: {
    marginTop: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userRole: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 2,
  },
  menuItems: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  menuLabel: {
    fontSize: 16,
    color: "#333",
  },
});

export default DrawerNavigator;