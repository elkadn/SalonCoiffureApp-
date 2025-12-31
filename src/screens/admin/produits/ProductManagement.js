// screens/admin/ProductManagement.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ProductManagement = ({ navigation }) => {
  const menuItems = [
    {
      title: "Gestion des Catégories",
      description: "Ajouter, modifier, supprimer des catégories",
      screen: "CategoryList",
      icon: "category",
      color: "#4CAF50",
    },
    {
      title: "Gestion des Produits",
      description: "Voir, ajouter et gérer les produits",
      screen: "ProductList",
      icon: "inventory",
      color: "#2196F3",
    },
    {
      title: "Gestion des Fournisseurs",
      description: "Gérer les fournisseurs de produits",
      screen: "SupplierList",
      icon: "local-shipping",
      color: "#FF9800",
    },
    {
      title: "Ajouter un Produit",
      description: "Créer un nouveau produit",
      screen: "ProductForm",
      icon: "add-circle",
      color: "#9C27B0",
    },
    {
      title: "Gestion des Commandes",
      description: "Créer et suivre les commandes fournisseurs",
      screen: "OrderList", // Nouvel écran
      icon: "shopping-cart",
      color: "#FF5722",
    },
    {
      title: "Nouvelle Commande",
      description: "Créer une nouvelle commande fournisseur",
      screen: "OrderForm", // Nouvel écran
      icon: "add-shopping-cart",
      color: "#795548",
    },
    {
      title: "Stocks & Inventaire",
      description: "Suivi des niveaux de stock",
      screen: "InventoryScreen",
      icon: "assessment",
      color: "#E91E63",
    },
  ];

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
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Options de Gestion</Text>
        
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={24} color="#fff" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        ))}
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
    paddingTop: 45,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingHorizontal: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
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
});

export default ProductManagement;