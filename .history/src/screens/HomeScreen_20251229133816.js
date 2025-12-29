import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Bouton menu en haut à gauche */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => navigation.openDrawer?.() || alert("Drawer non disponible")}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      
      <Text style={styles.welcomeText}>Bienvenue au Salon de Coiffure</Text>
      <Text style={styles.subText}>
        Application de gestion pour clients, administrateurs et stylistes
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 100,
  },
  menuIcon: {
    fontSize: 28,
    color: "#333",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default HomeScreen;