// screens/admin/CategoryList.js
import React, { useState, useEffect } from "react";
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
import { productService } from '../../../../services/productService';

const CategoryList = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

 useFocusEffect(
  useCallback(() => {
    loadCategories();
  }, [])
);


  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllCategories();
      setCategories(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les catégories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const handleDelete = (id, nom) => {
    Alert.alert(
      "Supprimer la catégorie",
      `Êtes-vous sûr de vouloir supprimer "${nom}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteCategory(id),
        },
      ]
    );
  };

  const deleteCategory = async (id) => {
    try {
      await productService.deleteCategory(id);
      Alert.alert("Succès", "Catégorie supprimée avec succès");
      loadCategories();
    } catch (error) {
      Alert.alert("Erreur", error.message || "Impossible de supprimer la catégorie");
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des catégories...</Text>
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
        <Text style={styles.headerTitle}>Gestion des Catégories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CategoryForm")}
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
          <Icon name="info" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            Les catégories permettent d'organiser vos produits. Chaque catégorie doit avoir un nom unique.
          </Text>
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="category" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune catégorie trouvée</Text>
            <Text style={styles.emptySubtext}>
              Commencez par ajouter une nouvelle catégorie
            </Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryContent}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.nom}</Text>
                  <View style={styles.categoryStats}>
                    <Text style={styles.productCount}>
                      {category.nombreProduits || 0} produits
                    </Text>
                  </View>
                </View>
                <Text style={styles.categoryDescription}>
                  {category.description || "Pas de description"}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("CategoryForm", {
                      categoryId: category.id,
                    })
                  }
                >
                  <Icon name="edit" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(category.id, category.nom)}
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
    backgroundColor: "#4CAF50",
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
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#2E7D32",
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
  categoryCard: {
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
  categoryContent: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  categoryStats: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  productCount: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
  categoryDescription: {
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

export default CategoryList;