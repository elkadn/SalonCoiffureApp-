import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import orderService from "../../../services/orderService";
import productService from "../../../services/productService";
import { format } from "date-fns";

const OrderForm = ({ navigation, route }) => {
  const isEdit = route.params?.orderId;

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [orderNumber, setOrderNumber] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadSuppliers();
    loadProducts();

    if (isEdit) {
      loadOrderData();
    } else {
      setOrderNumber(generateOrderNumber());
    }
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await productService.getAllSuppliers();
      setSuppliers(data.filter((s) => s.actif !== false));
    } catch (error) {
      console.error("Erreur chargement fournisseurs:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data.filter((p) => p.actif !== false));
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    }
  };

  const loadOrderData = async () => {
    try {
      const order = await orderService.getOrderById(route.params.orderId);
      if (order) {
        setSelectedSupplier(order.supplierId);
        setOrderNumber(order.orderNumber);
        setNotes(order.notes || "");
        setSelectedProducts(order.items || []);

        if (order.expectedDeliveryDate) {
          const date = order.expectedDeliveryDate.toDate
            ? order.expectedDeliveryDate.toDate()
            : new Date(order.expectedDeliveryDate);
          setExpectedDeliveryDate(date);
        }
      }
    } catch (error) {
      console.error("Erreur chargement commande:", error);
    }
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    return `CMD-${year}${month}${day}-${random}`;
  };

  const handleAddProduct = (product) => {
    const existing = selectedProducts.find((p) => p.productId === product.id);

    if (existing) {
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId: product.id,
          productName: product.nom,
          productCode: product.code || "",
          unitPrice: product.prixAchat || 0,
          quantity: 1,
          totalPrice: product.prixAchat || 0,
        },
      ]);
    }

    setShowProductModal(false);
  };

  const updateQuantity = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity) || 1;

    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? {
              ...p,
              quantity: Math.max(1, quantity),
              totalPrice: Math.max(1, quantity) * p.unitPrice,
            }
          : p
      )
    );
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productId !== productId)
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const validateForm = () => {
    if (!selectedSupplier) {
      Alert.alert("Erreur", "Veuillez sélectionner un fournisseur");
      return false;
    }

    if (selectedProducts.length === 0) {
      Alert.alert("Erreur", "Veuillez ajouter au moins un produit");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const supplier = suppliers.find((s) => s.id === selectedSupplier);

      const orderData = {
        supplierId: selectedSupplier,
        supplierName: supplier?.nom || "",
        orderNumber: orderNumber,
        expectedDeliveryDate: expectedDeliveryDate,
        totalAmount: calculateTotal(),
        notes: notes,
        items: selectedProducts,
      };

      if (isEdit) {
        await orderService.updateOrder(route.params.orderId, orderData);
        Alert.alert("Succès", "Commande mise à jour avec succès");
      } else {
        await orderService.createOrder(orderData);
        Alert.alert("Succès", "Commande créée avec succès");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      Alert.alert("Erreur", error.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const renderSelectedProduct = ({ item }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.productCode}>{item.productCode}</Text>
        <Text style={styles.productPrice}>
          {item.unitPrice.toFixed(2)} € × {item.quantity} ={" "}
          {item.totalPrice.toFixed(2)} €
        </Text>
      </View>

      <View style={styles.productActions}>
        <TextInput
          style={styles.quantityInput}
          value={item.quantity.toString()}
          onChangeText={(text) => updateQuantity(item.productId, text)}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeProduct(item.productId)}
        >
          <Icon name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductOption = ({ item }) => (
    <TouchableOpacity
      style={styles.productOption}
      onPress={() => handleAddProduct(item)}
    >
      <View style={styles.productOptionInfo}>
        <Text style={styles.productOptionName}>{item.nom}</Text>
        <Text style={styles.productOptionDetails}>
          Code: {item.code || "N/A"} | Stock: {item.quantite || 0} | Prix:{" "}
          {item.prixAchat?.toFixed(2) || "0.00"} €
        </Text>
      </View>
      <Icon name="add" size={24} color="#4CAF50" />
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
        <Text style={styles.headerTitle}>
          {isEdit ? "Modifier Commande" : "Nouvelle Commande"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Commande</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro de commande</Text>
            <TextInput
              style={styles.input}
              value={orderNumber}
              onChangeText={setOrderNumber}
              placeholder="CMD-YYYYMMDD-XXX"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fournisseur *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSupplier}
                onValueChange={setSelectedSupplier}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionner un fournisseur..." value="" />
                {suppliers.map((supplier) => (
                  <Picker.Item
                    key={supplier.id}
                    label={supplier.nom}
                    value={supplier.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date de livraison prévue</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar-today" size={20} color="#666" />
              <Text style={styles.dateText}>
                {format(expectedDeliveryDate, "dd/MM/yyyy")}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={expectedDeliveryDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setExpectedDeliveryDate(date);
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes sur la commande..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produits commandés</Text>
            <TouchableOpacity
              style={styles.addProductButton}
              onPress={() => setShowProductModal(true)}
            >
              <Icon name="add" size={20} color="#fff" />
              <Text style={styles.addProductText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {selectedProducts.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Icon name="shopping-cart" size={40} color="#ccc" />
              <Text style={styles.emptyProductsText}>Aucun produit ajouté</Text>
              <Text style={styles.emptyProductsSubtext}>
                Cliquez sur "Ajouter" pour sélectionner des produits
              </Text>
            </View>
          ) : (
            <FlatList
              data={selectedProducts}
              renderItem={renderSelectedProduct}
              keyExtractor={(item) => item.productId}
              scrollEnabled={false}
            />
          )}

          {selectedProducts.length > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total commande:</Text>
              <Text style={styles.totalAmount}>
                {calculateTotal().toFixed(2)} €
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.saveButtonText}>Enregistrement...</Text>
          ) : (
            <>
              <Icon name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {isEdit ? "Mettre à jour" : "Créer la commande"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowProductModal(false)}
              style={styles.modalCloseButton}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sélectionner un produit</Text>
            <View style={styles.placeholder} />
          </View>

          <FlatList
            data={products}
            renderItem={renderProductOption}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalContent}
          />
        </SafeAreaView>
      </Modal>
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
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  dateButton: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  addProductButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addProductText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
  },
  emptyProducts: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyProductsText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
  emptyProductsSubtext: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 5,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  productCode: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    color: "#2196F3",
  },
  productActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    width: 50,
    paddingVertical: 5,
    textAlign: "center",
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF5722",
  },
  saveButton: {
    backgroundColor: "#FF5722",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: "#FFAB91",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
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
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    padding: 20,
  },
  productOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productOptionInfo: {
    flex: 1,
  },
  productOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  productOptionDetails: {
    fontSize: 12,
    color: "#666",
  },
});

export default OrderForm;
