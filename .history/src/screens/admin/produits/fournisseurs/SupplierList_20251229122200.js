// screens/admin/SupplierList.js
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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { productService } from '../../../../services/productService';


const SupplierList = ({ navigation }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Utiliser useFocusEffect pour recharger automatiquement
  useFocusEffect(
    useCallback(() => {
      loadSuppliers();
      return () => {
        // Cleanup si nécessaire
      };
    }, [])
  );

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier =>
        supplier.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        supplier.telephone?.includes(searchText)
      );
      setFilteredSuppliers(filtered);
    }
  }, [searchText, suppliers]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllSuppliers();
      // Filtrer uniquement les fournisseurs actifs
      const activeSuppliers = data.filter(supplier => supplier.actif !== false);
      setSuppliers(activeSuppliers);
      setFilteredSuppliers(activeSuppliers);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les fournisseurs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSuppliers();
  };

  const handleDelete = (id, nom) => {
    Alert.alert(
      "Supprimer le fournisseur",
      `Êtes-vous sûr de vouloir supprimer "${nom}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteSupplier(id),
        },
      ]
    );
  };

  const deleteSupplier = async (id) => {
    try {
      // Vérifier si le fournisseur a des produits
      // Note: Vous devrez peut-être implémenter getProductsBySupplier dans le service
      // Pour l'instant, on supprime directement
      await deleteDoc(doc(db, "suppliers", id));
      Alert.alert("Succès", "Fournisseur supprimé avec succès");
      loadSuppliers(); // Recharger la liste
    } catch (error) {
      Alert.alert("Erreur", error.message || "Impossible de supprimer le fournisseur");
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Chargement des fournisseurs...</Text>
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
        <Text style={styles.headerTitle}>Gestion des Fournisseurs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("SupplierForm")}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un fournisseur..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.infoCard}>
          <Icon name="info" size={20} color="#FF9800" />
          <Text style={styles.infoText}>
            Gérez ici vos fournisseurs. Chaque fournisseur doit avoir un nom et un email uniques.
          </Text>
        </View>

        {filteredSuppliers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="local-shipping" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText ? "Aucun fournisseur trouvé" : "Aucun fournisseur enregistré"}
            </Text>
            {!searchText && (
              <Text style={styles.emptySubtext}>
                Ajoutez votre premier fournisseur
              </Text>
            )}
          </View>
        ) : (
          filteredSuppliers.map((supplier) => (
            <View key={supplier.id} style={styles.supplierCard}>
              <View style={styles.supplierAvatar}>
                <Icon name="business" size={24} color="#fff" />
              </View>
              <View style={styles.supplierInfo}>
                <View style={styles.supplierHeader}>
                  <Text style={styles.supplierName}>{supplier.nom}</Text>
                  <View style={styles.productCountBadge}>
                    <Text style={styles.productCountText}>
                      {supplier.nombreProduits || 0} produits
                    </Text>
                  </View>
                </View>
                <Text style={styles.supplierEmail}>{supplier.email}</Text>
                <View style={styles.supplierDetails}>
                  {supplier.telephone ? (
                    <View style={styles.detailRow}>
                      <Icon name="phone" size={14} color="#666" />
                      <Text style={styles.supplierTelephone}>
                        {supplier.telephone}
                      </Text>
                    </View>
                  ) : null}
                  {supplier.adresse ? (
                    <View style={styles.detailRow}>
                      <Icon name="location-on" size={14} color="#666" />
                      <Text style={styles.supplierAddress} numberOfLines={1}>
                        {supplier.adresse}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate("SupplierForm", {
                      supplierId: supplier.id,
                    })
                  }
                >
                  <Icon name="edit" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(supplier.id, supplier.nom)}
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
    backgroundColor: "#FF9800",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: "#FFF3E0",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#E65100",
    fontSize: 12,
    lineHeight: 16,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  supplierCard: {
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
  supplierAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  productCountBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  productCountText: {
    fontSize: 12,
    color: "#E65100",
    fontWeight: "600",
  },
  supplierEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  supplierDetails: {
    flexDirection: "column",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  supplierTelephone: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  supplierAddress: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
    flex: 1,
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

export default SupplierList;