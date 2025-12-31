import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { serviceService } from "../../../services/serviceService";
import { productService } from "../../../services/productService";
import { useFocusEffect } from "@react-navigation/native";

const ServiceListScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadServices();
      loadCategories();
    }, [])
  );

  useEffect(() => {
    filterServices();
  }, [searchTerm, selectedCategory, services]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await serviceService.getAllServices();
      const activeServices = servicesData.filter((s) => s.actif !== false);
      setServices(activeServices);
      setFilteredServices(activeServices);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les services");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategories = () => {
    const uniqueCategories = [
      ...new Set(services.filter((s) => s.categorie).map((s) => s.categorie)),
    ];
    setCategories(["all", ...uniqueCategories]);
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) => service.categorie === selectedCategory
      );
    }

    setFilteredServices(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const handleDeleteService = (serviceId) => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce service ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await serviceService.deleteService(serviceId);
              Alert.alert("Succès", "Service supprimé avec succès");
              loadServices();
            } catch (error) {
              Alert.alert("Erreur", error.message);
            }
          },
        },
      ]
    );
  };

  const viewServiceDetails = async (service) => {
    try {
      // Charger les détails complets
      const fullService = await serviceService.getServiceById(service.id);

      if (fullService.produitsIds && fullService.produitsIds.length > 0) {
        const produits = await serviceService.getProductsByIds(
          fullService.produitsIds
        );
        fullService.produits = produits;
      }

      if (fullService.stylistesIds && fullService.stylistesIds.length > 0) {
        const stylistes = await serviceService.getStylistesByIds(
          fullService.stylistesIds
        );
        fullService.stylistes = stylistes;
      }

      setSelectedService(fullService);
      setModalVisible(true);
    } catch (error) {
      console.error("Erreur chargement détails:", error);
    }
  };

  const renderServiceCard = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        {item.images && item.images.length > 0 && (
          <Image source={{ uri: item.images[0] }} style={styles.serviceImage} />
        )}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.nom}</Text>
          <Text style={styles.servicePrice}>{item.prix} €</Text>
          <Text style={styles.serviceDuration}>{item.duree} min</Text>
          {item.categorie && (
            <Text style={styles.serviceCategory}>{item.categorie}</Text>
          )}
        </View>
      </View>

      {item.description && (
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          {item.produitsIds?.length || 0} produits
        </Text>
        <Text style={styles.statText}>
          {item.stylistesIds?.length || 0} stylistes
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => viewServiceDetails(item)}
        >
          <Text style={styles.buttonText}>Voir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() =>
            navigation.navigate("ServiceForm", { serviceId: item.id })
          }
        >
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteService(item.id)}
        >
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion des Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("ServiceForm")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filtres et recherche */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category === "all" ? "Tous" : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste des services */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      ) : filteredServices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cut-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Aucun service trouvé</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate("ServiceForm")}
          >
            <Text style={styles.emptyButtonText}>Ajouter un service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal de détails */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedService && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedService.nom}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Description</Text>
                    <Text style={styles.modalText}>
                      {selectedService.description || "Aucune description"}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Informations</Text>
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalLabel}>Prix:</Text>
                      <Text style={styles.modalValue}>
                        {selectedService.prix} €
                      </Text>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalLabel}>Durée:</Text>
                      <Text style={styles.modalValue}>
                        {selectedService.duree} minutes
                      </Text>
                    </View>
                    {selectedService.categorie && (
                      <View style={styles.modalInfoRow}>
                        <Text style={styles.modalLabel}>Catégorie:</Text>
                        <Text style={styles.modalValue}>
                          {selectedService.categorie}
                        </Text>
                      </View>
                    )}
                  </View>

                  {selectedService.produits &&
                    selectedService.produits.length > 0 && (
                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>
                          Produits inclus
                        </Text>
                        {selectedService.produits.map((produit) => (
                          <View key={produit.id} style={styles.produitItem}>
                            <Text style={styles.produitName}>
                              {produit.nom}
                            </Text>
                            <Text style={styles.produitPrice}>
                              {produit.prixVente} €
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                  {selectedService.stylistes &&
                    selectedService.stylistes.length > 0 && (
                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>
                          Stylistes assignés
                        </Text>
                        {selectedService.stylistes.map((styliste) => (
                          <View key={styliste.id} style={styles.stylisteItem}>
                            <Text style={styles.stylisteName}>
                              {styliste.prenom} {styliste.nom}
                            </Text>
                            {styliste.specialite && (
                              <Text style={styles.stylisteSpecialite}>
                                {styliste.specialite}
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    )}

                  {selectedService.images &&
                    selectedService.images.length > 0 && (
                      <View style={styles.modalSection}>
                        <Text style={styles.modalSectionTitle}>
                          Photos de référence
                        </Text>
                        <ScrollView horizontal style={styles.imagesContainer}>
                          {selectedService.images.map((image, index) => (
                            <Image
                              key={index}
                              source={{ uri: image }}
                              style={styles.modalImage}
                            />
                          ))}
                        </ScrollView>
                      </View>
                    )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.editModalButton]}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate("ServiceForm", {
                        serviceId: selectedService.id,
                      });
                    }}
                  >
                    <Text style={styles.modalButtonText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.closeModalButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Fermer</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 45,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF5722",
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: "row",
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryChip: {
    backgroundColor: "#FF5722",
  },
  categoryText: {
    color: "#666",
    fontSize: 14,
  },
  selectedCategoryText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContainer: {
    padding: 15,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF5722",
    marginBottom: 5,
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  serviceCategory: {
    fontSize: 12,
    color: "#4CAF50",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  statText: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  viewButton: {
    backgroundColor: "#2196F3",
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 20,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 16,
    color: "#666",
  },
  modalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  produitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  produitName: {
    fontSize: 16,
    color: "#333",
  },
  produitPrice: {
    fontSize: 16,
    color: "#FF5722",
    fontWeight: "600",
  },
  stylisteItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  stylisteName: {
    fontSize: 16,
    color: "#333",
  },
  stylisteSpecialite: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  imagesContainer: {
    flexDirection: "row",
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  editModalButton: {
    backgroundColor: "#4CAF50",
  },
  closeModalButton: {
    backgroundColor: "#757575",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ServiceListScreen;
