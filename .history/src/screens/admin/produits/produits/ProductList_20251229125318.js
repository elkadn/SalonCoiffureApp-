// screens/admin/ProductList.js
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
  TextInput,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { productService } from "../../../../services/productService";

const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
      return () => {};
    }, [])
  );

  useEffect(() => {
    let filtered = products;

    if (searchText.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
          product.code?.toLowerCase().includes(searchText.toLowerCase()) ||
          product.categorieNom?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterLowStock) {
      filtered = filtered.filter(
        (product) => product.quantite <= product.seuilAlerte
      );
    }

    setFilteredProducts(filtered);
  }, [searchText, products, filterLowStock]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      // Filtrer uniquement les produits actifs
      const activeProducts = data.filter((product) => product.actif !== false);
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les produits");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleDelete = (id, nom) => {
    Alert.alert(
      "Supprimer le produit",
      `Êtes-vous sûr de vouloir supprimer "${nom}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteProduct(id),
        },
      ]
    );
  };

  const deleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      Alert.alert("Succès", "Produit supprimé avec succès");
      loadProducts();
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible de supprimer le produit"
      );
    }
  };

  const getStockStatusColor = (quantite, seuilAlerte) => {
    if (quantite === 0) return "#F44336"; // Rouge pour rupture
    if (quantite <= seuilAlerte) return "#FF9800"; // Orange pour alerte
    return "#4CAF50"; // Vert pour bon stock
  };

  const getStockStatusText = (quantite, seuilAlerte) => {
    if (quantite === 0) return "Rupture";
    if (quantite <= seuilAlerte) return "Faible";
    return "Disponible";
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
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
        <Text style={styles.headerTitle}>Gestion des Produits</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("ProductForm")}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche et filtres */}
      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterLowStock && styles.filterButtonActive,
          ]}
          onPress={() => setFilterLowStock(!filterLowStock)}
        >
          <Icon
            name="warning"
            size={18}
            color={filterLowStock ? "#fff" : "#FF9800"}
          />
          <Text
            style={[
              styles.filterButtonText,
              filterLowStock && styles.filterButtonTextActive,
            ]}
          >
            Stock faible
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Produits</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {products.filter((p) => p.quantite <= p.seuilAlerte).length}
            </Text>
            <Text style={styles.statLabel}>Stock faible</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {products.filter((p) => p.quantite === 0).length}
            </Text>
            <Text style={styles.statLabel}>Rupture</Text>
          </View>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText || filterLowStock
                ? "Aucun produit trouvé"
                : "Aucun produit enregistré"}
            </Text>
            {!searchText && !filterLowStock && (
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={() => navigation.navigate("ProductForm")}
              >
                <Icon name="add" size={18} color="#fff" />
                <Text style={styles.addFirstButtonText}>
                  Ajouter un produit
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() =>
                navigation.navigate("ProductForm", { productId: product.id })
              }
            >
              {/* Image du produit */}
              <View style={styles.productImageContainer}>
                {product.localImagePath ? (
                  <Image
                    source={{ uri: product.localImagePath }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Icon name="image" size={30} color="#ccc" />
                  </View>
                )}
              </View>

              {/* Informations du produit */}
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.nom}
                  </Text>
                  <Text style={styles.productCode}>
                    {product.code || "Sans code"}
                  </Text>
                </View>

                <View style={styles.productDetails}>
                  <Text style={styles.productCategory}>
                    {product.categorieNom}
                  </Text>
                  <Text style={styles.productSupplier}>
                    {product.fournisseurNom}
                  </Text>
                </View>

                <View style={styles.productFooter}>
                  <View style={styles.stockContainer}>
                    <View
                      style={[
                        styles.stockBadge,
                        {
                          backgroundColor: getStockStatusColor(
                            product.quantite,
                            product.seuilAlerte
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.stockText}>
                        {getStockStatusText(
                          product.quantite,
                          product.seuilAlerte
                        )}
                      </Text>
                    </View>
                    <Text style={styles.stockQuantity}>
                      {product.quantite} unités
                    </Text>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>
                      {parseFloat(product.prixVente).toFixed(2)} €
                    </Text>
                    <Text style={styles.priceLabel}>Prix vente</Text>
                  </View>
                </View>
              </View>

              {/* Bouton d'action */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate("ProductForm", { productId: product.id })
                }
              >
                <Icon name="edit" size={20} color="#2196F3" />
              </TouchableOpacity>
            </TouchableOpacity>
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9800",
    backgroundColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: "#FF9800",
  },
  filterButtonText: {
    marginLeft: 5,
    color: "#FF9800",
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  statSeparator: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  addFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  addFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 15,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  productCode: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  productDetails: {
    marginBottom: 10,
  },
  productCategory: {
    fontSize: 14,
    color: "#666",
  },
  productSupplier: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  stockText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  stockQuantity: {
    fontSize: 12,
    color: "#666",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },
  priceLabel: {
    fontSize: 10,
    color: "#888",
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
});

export default ProductList;
