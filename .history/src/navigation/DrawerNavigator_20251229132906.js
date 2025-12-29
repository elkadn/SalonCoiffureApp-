import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

// Importez vos écrans admin existants
import DashboardScreen from "../screens/admin/DashboardScreen";
import UserListScreen from "../screens/";
// ... importez tous vos autres écrans admin

const Drawer = createDrawerNavigator();

// Écran d'accueil simple
const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenue au Salon de Coiffure</Text>
      <Text style={styles.subtitle}>
        Application de gestion pour clients, administrateurs et stylistes
      </Text>
      
      {!user ? (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>
            Bonjour, {user.prenom} {user.nom}!
          </Text>
          <Text style={styles.roleText}>
            {user.role === 'admin' ? 'Administrateur' : 
             user.role === 'stylist' ? 'Styliste' : 'Client'}
          </Text>
        </View>
      )}
    </View>
  );
};

// Écran de login (séparé du drawer)
const LoginScreenWrapper = ({ navigation }) => {
  // Utilisez votre écran Login existant mais avec la navigation passée
  // Vous devrez peut-être adapter votre LoginScreen existant
  return <LoginScreen navigation={navigation} />;
};

// Drawer personnalisé
const CustomDrawerContent = (props) => {
  const { user, logout } = useAuth();

  const menuItems = [
    // Items pour utilisateur non connecté
    ...(!user
      ? [
          {
            label: "Connexion",
            screen: "Login",
            icon: "🔐",
          },
        ]
      : []),
    
    // Items pour admin
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
          // ... ajoutez tous les autres écrans admin
        ]
      : []),
    
    // Items pour styliste
    ...(user?.role === 'stylist'
      ? [
          {
            label: "Mes Rendez-vous",
            screen: "StylisteRendezVous",
            icon: "📅",
          },
          {
            label: "Mon Planning",
            screen: "StylistePlanning",
            icon: "🕒",
          },
        ]
      : []),
    
    // Items pour client
    ...(user?.role === 'client'
      ? [
          {
            label: "Prendre Rendez-vous",
            screen: "Reservation",
            icon: "📅",
          },
          {
            label: "Mes Rendez-vous",
            screen: "MesRendezVous",
            icon: "📋",
          },
        ]
      : []),
    
    // Item commun (déconnexion si connecté)
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
    <View style={drawerStyles.container}>
      <View style={drawerStyles.header}>
        <Text style={drawerStyles.headerTitle}>Salon de Coiffure</Text>
        {user && (
          <View style={drawerStyles.userInfo}>
            <Text style={drawerStyles.userName}>
              {user.prenom} {user.nom}
            </Text>
            <Text style={drawerStyles.userRole}>
              {user.role === 'admin' ? 'Administrateur' : 
               user.role === 'stylist' ? 'Styliste' : 'Client'}
            </Text>
          </View>
        )}
      </View>

      <View style={drawerStyles.menuItems}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={drawerStyles.menuItem}
            onPress={() => {
              if (item.action) {
                item.action();
              } else if (item.screen) {
                props.navigation.navigate(item.screen);
              }
              props.navigation.closeDrawer();
            }}
          >
            <Text style={drawerStyles.menuIcon}>{item.icon}</Text>
            <Text style={drawerStyles.menuLabel}>{item.label}</Text>
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
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Login" component={LoginScreenWrapper} />
      
      {/* Écrans admin */}
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="UserList" component={UserListScreen} />
      <Drawer.Screen name="CoiffeurManagement" component={CoiffeurManagement} />
      <Drawer.Screen name="ProductManagement" component={ProductManagement} />
      {/* ... ajoutez tous vos autres écrans admin */}
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  welcome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfo: {
    alignItems: "center",
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
});

const drawerStyles = StyleSheet.create({
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