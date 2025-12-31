import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { getDashboardStats } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";

const DashboardScreen = ({ navigation }) => {
  const { userData } = useAuth(); // CHANGÉ: utilisez userData depuis AuthContext
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les statistiques");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const menuItems = [
    {
      title: "👥 Gestion des Utilisateurs",
      description: "Ajouter, modifier, supprimer des utilisateurs",
      screen: "UserList",
      icon: "👥",
      color: "#4CAF50",
    },
    {
      title: "💇 Gestion des Coiffeurs",
      description: "Gérer les coiffeurs et leurs spécialités",
      screen: "CoiffeurManagement",
      icon: "💇",
      color: "#2196F3",
    },
    {
      title: "📦 Gestion des Produits",
      description: "Gérer produits, catégories et fournisseurs",
      screen: "ProductManagement",
      icon: "📦",
      color: "#673AB7",
    },
    {
      title: "✂️ Gestion des Services",
      description: "Ajouter, modifier, supprimer les services",
      screen: "ServiceManagement",
      icon: "✂️",
      color: "#FF5722",
    },
    {
      title: "📅 Gestion des Rendez-vous",
      description: "Voir et gérer les réservations",
      screen: "AppointmentManagement",
      icon: "📅",
      color: "#FF9800",
    },
    {
      title: "🏢 Paramètres du Salon",
      description: "Logo, coordonnées, horaires",
      screen: "SalonSettings",
      icon: "🏢",
      color: "#607D8B",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Aperçu du Salon</Text>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={[styles.statCard, { backgroundColor: "#4CAF50" }]}>
                <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Utilisateurs</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: "#9C27B0" }]}>
                <Text style={styles.statNumber}>{stats.clients}</Text>
                <Text style={styles.statLabel}>Clients</Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu de gestion */}
        <Text style={styles.sectionTitle}>Gestion</Text>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 10 }}></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginBottom: 80,
  },

  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 5,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconText: {
    fontSize: 20,
  },
  menuContent: {
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
  menuArrow: {
    fontSize: 24,
    color: "#999",
    marginLeft: 10,
  },
});

export default DashboardScreen;
