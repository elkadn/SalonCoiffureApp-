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
  FlatList,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { productService } from "../../../../services/productService";
import { BarChart, PieChart } from "react-native-chart-kit";

const InventoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all"); 
  const [filteredProducts, setFilteredProducts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadInventoryData();
      return () => {};
    }, [])
  );

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      
      const inventoryStats = await productService.getInventoryStats();
      setStats(inventoryStats);
      
      const [lowStock, outOfStock] = await Promise.all([
        productService.getProductsByStockLevel('low'),
        productService.getProductsByStockLevel('out')
      ]);
      
      setLowStockProducts(lowStock);
      setOutOfStockProducts(outOfStock);
      
      const filtered = await productService.getProductsByStockLevel(selectedFilter);
      setFilteredProducts(filtered);
      
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données d'inventaire");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInventoryData();
  };

  const handleFilterChange = async (filter) => {
    setSelectedFilter(filter);
    try {
      const filtered = await productService.getProductsByStockLevel(filter);
      setFilteredProducts(filtered);
    } catch (error) {
      console.error("Erreur filtrage:", error);
    }
  };

  const handleAdjustStock = (product) => {
    Alert.prompt(
      "Ajuster le stock",
      `Ajuster la quantité pour "${product.nom}"\nStock actuel: ${product.quantite}`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Mettre à jour",
          onPress: async (newQuantity) => {
            try {
              const quantity = parseInt(newQuantity);
              if (isNaN(quantity) || quantity < 0) {
                Alert.alert("Erreur", "Veuillez entrer un nombre valide");
                return;
              }

              await productService.updateProductQuantity(product.id, quantity);
              
              await productService.addStockMovement({
                productId: product.id,
                productName: product.nom,
                oldQuantity: product.quantite,
                newQuantity: quantity,
                type: "adjustment",
                date: new Date().toISOString(),
                user: "admin"
              });
              
              Alert.alert("Succès", "Stock mis à jour avec succès");
              loadInventoryData();
            } catch (error) {
              Alert.alert("Erreur", "Impossible de mettre à jour le stock");
            }
          },
        },
      ],
      "plain-text",
      product.quantite.toString()
    );
  };

  const getStockStatusColor = (quantite, seuilAlerte) => {
    if (quantite === 0) return "#F44336";
    if (quantite <= seuilAlerte) return "#FF9800";
    return "#4CAF50";
  };

  const getStockStatusText = (quantite, seuilAlerte) => {
    if (quantite === 0) return "RUPTURE";
    if (quantite <= seuilAlerte) return "FAIBLE";
    return "NORMAL";
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Chargement de l'inventaire...</Text>
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
        <Text style={styles.headerTitle}>Inventaire & Stocks</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Aperçu de l'Inventaire</Text>
            
            <View style={styles.mainStats}>
              <View style={styles.statCard}>
                <Icon name="inventory" size={30} color="#E91E63" />
                <Text style={styles.statNumber}>{stats.totalProducts}</Text>
                <Text style={styles.statLabel}>Produits</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="euro-symbol" size={30} color="#4CAF50" />
                <Text style={styles.statNumber}>{stats.totalValeurStock} €</Text>
                <Text style={styles.statLabel}>Valeur stock</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="trending-up" size={30} color="#2196F3" />
                <Text style={styles.statNumber}>{stats.profitPotentiel} €</Text>
                <Text style={styles.statLabel}>Marge potentielle</Text>
              </View>
            </View>

            <View style={styles.alertsContainer}>
              <View style={[styles.alertCard, { backgroundColor: "#FFF3E0" }]}>
                <Icon name="warning" size={24} color="#FF9800" />
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: "#FF9800" }]}>
                    Stock faible
                  </Text>
                  <Text style={styles.alertCount}>{stats.lowStockCount} produits</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleFilterChange("low")}
                >
                  <Icon name="chevron-right" size={24} color="#FF9800" />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.alertCard, { backgroundColor: "#FFEBEE" }]}>
                <Icon name="error" size={24} color="#F44336" />
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: "#F44336" }]}>
                    Rupture de stock
                  </Text>
                  <Text style={styles.alertCount}>{stats.outOfStockCount} produits</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleFilterChange("out")}
                >
                  <Icon name="chevron-right" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Valeur par catégorie</Text>
              {stats.categories && stats.categories.length > 0 ? (
                <View style={styles.categoryList}>
                  {stats.categories.slice(0, 5).map((category, index) => (
                    <View key={index} style={styles.categoryItem}>
                      <View style={styles.categoryHeader}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryValue}>
                          {category.totalValue.toFixed(2)} €
                        </Text>
                      </View>
                      <View style={styles.categoryDetails}>
                        <Text style={styles.categoryCount}>
                          {category.count} produits
                        </Text>
                        {category.lowStock > 0 && (
                          <Text style={styles.lowStockBadge}>
                            {category.lowStock} en alerte
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>Aucune donnée disponible</Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Filtrer par niveau de stock</Text>
          <View style={styles.filterButtons}>
            {[
              { key: "all", label: "Tous", icon: "list" },
              { key: "low", label: "Faible", icon: "warning", color: "#FF9800" },
              { key: "out", label: "Rupture", icon: "error", color: "#F44336" },
              { key: "normal", label: "Normal", icon: "check-circle", color: "#4CAF50" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive,
                  filter.color && { borderColor: filter.color }
                ]}
                onPress={() => handleFilterChange(filter.key)}
              >
                <Icon
                  name={filter.icon}
                  size={18}
                  color={selectedFilter === filter.key ? "#fff" : (filter.color || "#666")}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter.key && styles.filterButtonTextActive,
                    filter.color && !(selectedFilter === filter.key) && { color: filter.color }
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.productsContainer}>
          <View style={styles.productsHeader}>
            <Text style={styles.sectionTitle}>
              Produits ({filteredProducts.length})
            </Text>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => Alert.alert("Info", "Fonction export à venir")}
            >
              <Icon name="file-download" size={20} color="#2196F3" />
              <Text style={styles.exportButtonText}>Exporter</Text>
            </TouchableOpacity>
          </View>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="inventory" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                Aucun produit correspondant au filtre
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.productRow}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.nom}
                    </Text>
                    <View style={styles.productDetails}>
                      <Text style={styles.productCategory}>
                        {item.categorieNom} • {item.fournisseurNom}
                      </Text>
                      <View style={styles.stockInfo}>
                        <View
                          style={[
                            styles.stockBadge,
                            {
                              backgroundColor: getStockStatusColor(
                                item.quantite,
                                item.seuilAlerte
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.stockBadgeText}>
                            {getStockStatusText(item.quantite, item.seuilAlerte)}
                          </Text>
                        </View>
                        <Text style={styles.stockQuantity}>
                          {item.quantite} unités
                        </Text>
                        <Text style={styles.seuilAlerte}>
                          (Seuil: {item.seuilAlerte})
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.productActions}>
                    <Text style={styles.productValue}>
                      {item.prixVente ? `${item.prixVente.toFixed(2)} €` : "-"}
                    </Text>
                    <TouchableOpacity
                      style={styles.adjustButton}
                      onPress={() => handleAdjustStock(item)}
                    >
                      <Icon name="edit" size={18} color="#2196F3" />
                      <Text style={styles.adjustButtonText}>Ajuster</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("ProductForm")}
            >
              <Icon name="add-circle" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Nouveau produit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              onPress={() => {
                Alert.alert("Info", "Fonction d'import à venir");
              }}
            >
              <Icon name="file-upload" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Import CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Icon name="info" size={20} color="#666" />
          <Text style={styles.infoText}>
            L'inventaire est mis à jour en temps réel. Les produits en rouge sont en rupture,
            ceux en orange sont en stock faible. Vérifiez régulièrement les niveaux de stock.
          </Text>
        </View>
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
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  mainStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  alertsContainer: {
    marginBottom: 20,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  alertContent: {
    flex: 1,
    marginLeft: 10,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  alertCount: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  categoryList: {},
  categoryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
  },
  categoryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryCount: {
    fontSize: 12,
    color: "#666",
  },
  lowStockBadge: {
    fontSize: 12,
    color: "#FF9800",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    padding: 20,
  },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: "#E91E63",
    borderColor: "#E91E63",
  },
  filterButtonText: {
    marginLeft: 5,
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  productsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  exportButtonText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  productDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
    marginRight: 10,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 5,
  },
  stockBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  stockQuantity: {
    fontSize: 12,
    color: "#666",
    marginRight: 5,
  },
  seuilAlerte: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  productActions: {
    alignItems: "flex-end",
  },
  productValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 8,
  },
  adjustButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#E3F2FD",
  },
  adjustButtonText: {
    color: "#2196F3",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  quickActions: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E91E63",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#666",
    fontSize: 12,
    lineHeight: 16,
  },
});

export default InventoryScreen;