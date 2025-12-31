import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import orderService from "../../../services/orderService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const OrderList = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les commandes
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
      Alert.alert("Erreur", "Impossible de charger les commandes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recharger quand l'écran est focus
  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [])
  );

  // Rafraîchir
  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Rechercher
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplierName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  // Formater la date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "dd MMM yyyy", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FF9800";
      case "confirmed":
        return "#2196F3";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmée";
      case "delivered":
        return "Livrée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  // Confirmer la suppression
  const confirmDelete = (order) => {
    Alert.alert(
      "Supprimer la commande",
      `Êtes-vous sûr de vouloir supprimer la commande ${order.orderNumber} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteOrder(order.id),
        },
      ]
    );
  };

  // Supprimer une commande
  const deleteOrder = async (orderId) => {
    try {
      await orderService.deleteOrder(orderId);
      Alert.alert("Succès", "Commande supprimée avec succès");
      loadOrders();
    } catch (error) {
      console.error("Erreur suppression:", error);
      Alert.alert("Erreur", "Impossible de supprimer la commande");
    }
  };

  // Rendu d'un item de commande
  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.supplierName}>{item.supplierName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Icon name="date-range" size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(item.orderDate)}</Text>

          <Icon
            name="shopping-cart"
            size={16}
            color="#666"
            style={styles.detailIcon}
          />
          <Text style={styles.detailText}>{item.itemCount || 0} articles</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="attach-money" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.totalAmount?.toFixed(2) || "0.00"} €
          </Text>

          {item.expectedDeliveryDate && (
            <>
              <Icon
                name="local-shipping"
                size={16}
                color="#666"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>
                Livraison: {formatDate(item.expectedDeliveryDate)}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("OrderEdit", { orderId: item.id })}
        >
          <Icon name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => confirmDelete(item)}
        >
          <Icon name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Commandes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("OrderForm")}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une commande..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm("")}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des commandes */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="shopping-cart" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {loading ? "Chargement..." : "Aucune commande trouvée"}
            </Text>
            {!loading && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate("OrderForm")}
              >
                <Text style={styles.emptyButtonText}>
                  Créer une première commande
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
    backgroundColor: "#FF5722",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  supplierName: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  orderDetails: {
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    marginRight: 20,
  },
  detailIcon: {
    marginLeft: 20,
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default OrderList;
