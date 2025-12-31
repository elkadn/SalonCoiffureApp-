// screens/admin/SpecialiteList.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
// En haut du fichier SpecialiteList.js et SpecialiteForm.js
import {
  getAllSpecialites,
  deleteSpecialite,
} from "../../../services/specialiteService";
import { useFocusEffect } from "@react-navigation/native";

const SpecialiteList = ({ navigation }) => {
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSpecialites();
    }, [])
  );

  // Remplacer la fonction loadSpecialites :
  const loadSpecialites = async () => {
    try {
      setLoading(true);
      const data = await getAllSpecialites(); // Utilise directement la fonction
      // Ou avec l'objet service :
      // const data = await specialiteService.getAll();

      // Filtrer pour n'afficher que les spécialités actives
      const activeSpecialites = data.filter(
        (specialite) => specialite.actif !== false
      );
      setSpecialites(activeSpecialites);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les spécialités");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteSpecialite = async (id) => {
    try {
      setLoading(true); // Ajouter un indicateur de chargement

      await deleteSpecialite(id);

      // Petit délai pour laisser le temps à l'UI de se mettre à jour
      setTimeout(() => {
        Alert.alert("Succès", "Spécialité supprimée avec succès");
        loadSpecialites();
      }, 100);
    } catch (error) {
      console.error("Erreur détaillée suppression:", error);

      // Afficher un message d'erreur plus spécifique
      let errorMessage = "Impossible de supprimer la spécialité";
      if (error.message.includes("suppression")) {
        errorMessage = "Erreur lors de la suppression de la spécialité";
      }

      Alert.alert("Erreur", errorMessage);
      setLoading(false);
    }
  };

  const confirmDelete = (id, nom) => {
    Alert.alert(
      "Supprimer la spécialité",
      `Êtes-vous sûr de vouloir supprimer "${nom}" ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
          onPress: () => console.log("Suppression annulée"),
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => handleDeleteSpecialite(id),
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSpecialites();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des spécialités...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Spécialités</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("SpecialiteForm")}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.infoCard}>
          <Icon name="info" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Gérez ici les spécialités des coiffeurs. Chaque spécialité doit
            avoir un nom unique.
          </Text>
        </View>

        {specialites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="style" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune spécialité trouvée</Text>
            <Text style={styles.emptySubtext}>
              Commencez par ajouter une nouvelle spécialité
            </Text>
          </View>
        ) : (
          specialites.map((specialite) => (
            <View key={specialite.id} style={styles.specialiteCard}>
              <View style={styles.specialiteContent}>
                <View style={styles.specialiteHeader}>
                  <Text style={styles.specialiteName}>{specialite.nom}</Text>
                  <Text style={styles.specialiteId}>ID: {specialite.id}</Text>
                </View>
                <Text style={styles.specialiteDescription}>
                  {specialite.description || "Pas de description"}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("SpecialiteForm", {
                      specialiteId: specialite.id,
                    })
                  }
                >
                  <Icon name="edit" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(specialite.id, specialite.nom)} 
                >
                  <Icon name="delete" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#2196F3",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#1565C0",
    fontSize: 12,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  specialiteCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  specialiteContent: {
    flex: 1,
  },
  specialiteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  specialiteName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  specialiteId: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  specialiteDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    marginLeft: 10,
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
  },
});

export default SpecialiteList;
