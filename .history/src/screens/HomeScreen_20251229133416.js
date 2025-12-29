import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Salon de Coiffure</Text>
        {user && (
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Message de bienvenue */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            {user
              ? `Bonjour, ${user.prenom} ${user.nom} !`
              : "Bienvenue au Salon de Coiffure"}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {user
              ? `Vous êtes connecté en tant que ${
                  user.role === "admin"
                    ? "Administrateur"
                    : user.role === "stylist"
                    ? "Styliste"
                    : "Client"
                }`
              : "Veuillez vous connecter pour accéder aux fonctionnalités"}
          </Text>
        </View>

        {/* Bouton de connexion si non connecté */}
        {!user && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        )}

        {/* Menu selon le rôle */}
        {user && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Menu Principal</Text>

            {/* Menu pour Admin */}
            {user.role === "admin" && (
              <>
                <TouchableOpacity
                  style={styles.menuCard}
                  onPress={() => handleNavigation("Dashboard")}
                >
                  <Text style={styles.menuIcon}>📊</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Tableau de bord</Text>
                    <Text style={styles.menuDescription}>
                      Statistiques et vue d'ensemble
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuCard}
                  onPress={() => handleNavigation("UserList")}
                >
                  <Text style={styles.menuIcon}>👥</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Gestion Utilisateurs</Text>
                    <Text style={styles.menuDescription}>
                      Gérer tous les utilisateurs
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuCard}
                  onPress={() => handleNavigation("CoiffeurManagement")}
                >
                  <Text style={styles.menuIcon}>💇</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Gestion Coiffeurs</Text>
                    <Text style={styles.menuDescription}>
                      Gérer les coiffeurs et spécialités
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuCard}
                  onPress={() => handleNavigation("ProductManagement")}
                >
                  <Text style={styles.menuIcon}>📦</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Gestion Produits</Text>
                    <Text style={styles.menuDescription}>
                      Produits, catégories et fournisseurs
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Menu pour Styliste */}
            {user.role === "stylist" && (
              <>
                <TouchableOpacity style={styles.menuCard}>
                  <Text style={styles.menuIcon}>📅</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Mes Rendez-vous</Text>
                    <Text style={styles.menuDescription}>
                      Voir mes rendez-vous du jour
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuCard}>
                  <Text style={styles.menuIcon}>🕒</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Mon Planning</Text>
                    <Text style={styles.menuDescription}>
                      Gérer mon emploi du temps
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Menu pour Client */}
            {user.role === "client" && (
              <>
                <TouchableOpacity style={styles.menuCard}>
                  <Text style={styles.menuIcon}>📅</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Prendre Rendez-vous</Text>
                    <Text style={styles.menuDescription}>
                      Réserver avec un styliste
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuCard}>
                  <Text style={styles.menuIcon}>📋</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Mes Rendez-vous</Text>
                    <Text style={styles.menuDescription}>
                      Voir mes réservations
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  logoutButton: {
    backgroundColor: "#F44336",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  menuSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  menuCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: "#666",
  },
});

export default HomeScreen;