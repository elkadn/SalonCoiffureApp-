import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

const CustomDrawer = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const menuItems = [
    // Toujours visible
    { label: "Accueil", screen: "Home", icon: "🏠" },
    
    // Si non connecté
    ...(!user ? [{ label: "Connexion", screen: "Login", icon: "🔐" }] : []),
    
    // Si admin connecté
    ...(user?.role === 'admin' ? [
      { label: "Tableau de bord", screen: "Dashboard", icon: "📊" },
      { label: "Gestion Utilisateurs", screen: "UserList", icon: "👥" },
      { label: "Gestion Coiffeurs", screen: "CoiffeurManagement", icon: "💇" },
      { label: "Gestion Produits", screen: "ProductManagement", icon: "📦" },
    ] : []),
    
    // Si connecté (tous rôles)
    ...(user ? [{ label: "Déconnexion", action: logout, icon: "🚪" }] : []),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Salon Menu</Text>
        {user && (
          <Text style={styles.userInfo}>
            {user.prenom} {user.nom}
          </Text>
        )}
      </View>
      
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (item.action) {
                item.action();
              } else {
                navigation.navigate(item.screen);
              }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  userInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  menu: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
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

export default CustomDrawer;