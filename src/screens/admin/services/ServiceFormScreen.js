import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  FlatList,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { serviceService } from "../../../services/serviceService";
import { productService } from "../../../services/productService";
import { pickImage, uploadToCloudinary } from "../../../services/cloudinaryService";

const ServiceFormScreen = ({ route, navigation }) => {
  const { serviceId } = route.params || {};
  const isEditMode = !!serviceId;

  // États du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    duree: "30",
    categorie: "",
    produitsIds: [],
    stylistesIds: [],
    images: [],
  });

  // États des données
  const [produits, setProduits] = useState([]);
  const [stylistes, setStylistes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProduits, setSelectedProduits] = useState([]);
  const [selectedStylistes, setSelectedStylistes] = useState([]);
  const [modalProduitsVisible, setModalProduitsVisible] = useState(false);
  const [modalStylistesVisible, setModalStylistesVisible] = useState(false);
  const [searchProduit, setSearchProduit] = useState("");
  const [searchStyliste, setSearchStyliste] = useState("");
  const [filteredProduits, setFilteredProduits] = useState([]);
  const [filteredStylistes, setFilteredStylistes] = useState([]);
  const [totalProduitsPrix, setTotalProduitsPrix] = useState(0);
  const [categories, setCategories] = useState([
    "Coiffure",
    "Coloration",
    "Soin",
    "Beauté",
    "Barbier",
    "Autre",
  ]);
  const [modalCategorieVisible, setModalCategorieVisible] = useState(false);

  useEffect(() => {
    loadData();
    if (isEditMode) {
      loadServiceData();
    }
  }, []);

  useEffect(() => {
    filterProduits();
    filterStylistes();
  }, [searchProduit, searchStyliste, produits, stylistes]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Chargement des données...");

      const [produitsData, stylistesData] = await Promise.all([
        productService.getAllProducts(),
        serviceService.getAllStylistes(),
      ]);

      console.log("Produits chargés:", produitsData.length);
      console.log("Stylistes chargés:", stylistesData.length);

      setProduits(produitsData.filter((p) => p.actif !== false));
      setStylistes(stylistesData);

      // Charger les catégories existantes des services si en mode édition
      if (isEditMode) {
        const allServices = await serviceService.getAllServices();
        const existingCategories = [
          ...new Set(
            allServices
              .filter((s) => s.categorie && s.actif !== false)
              .map((s) => s.categorie)
          ),
        ];

        // Fusionner avec les catégories par défaut
        const mergedCategories = [
          ...new Set([...categories, ...existingCategories]),
        ];
        setCategories(mergedCategories);
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les données: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategorie = (categorie) => {
    setFormData((prev) => ({
      ...prev,
      categorie: categorie,
    }));
    setModalCategorieVisible(false);
  };

  const loadServiceData = async () => {
    try {
      setLoading(true);
      const service = await serviceService.getServiceById(serviceId);

      if (service) {
        console.log("Service chargé:", service);
        console.log("Stylistes IDs:", service.stylistesIds);

        setFormData({
          nom: service.nom || "",
          description: service.description || "",
          prix: service.prix?.toString() || "",
          duree: service.duree?.toString() || "30",
          categorie: service.categorie || "",
          produitsIds: service.produitsIds || [],
          stylistesIds: service.stylistesIds || [],
          images: service.images || [],
        });

        // Charger les produits sélectionnés
        if (service.produitsIds && service.produitsIds.length > 0) {
          console.log("Chargement produits...");
          const produitsSelectionnes = await serviceService.getProductsByIds(
            service.produitsIds
          );
          console.log("Produits chargés:", produitsSelectionnes.length);
          setSelectedProduits(produitsSelectionnes);

          const total = produitsSelectionnes.reduce((sum, produit) => {
            return sum + (produit.prixVente || 0);
          }, 0);
          setTotalProduitsPrix(total);
        }

        // Charger les stylistes sélectionnés - CORRECTION ICI
        if (service.stylistesIds && service.stylistesIds.length > 0) {
          console.log("Chargement stylistes avec IDs:", service.stylistesIds);

          // D'abord, récupérer tous les stylistes
          const allStylistes = await serviceService.getAllStylistes();
          console.log("Tous les stylistes disponibles:", allStylistes.length);

          // Filtrer pour ne garder que ceux dont l'ID est dans stylistesIds
          const stylistesSelectionnes = allStylistes.filter((styliste) =>
            service.stylistesIds.includes(styliste.id)
          );

          console.log(
            "Stylistes trouvés pour ce service:",
            stylistesSelectionnes.length
          );
          console.log("Détails:", stylistesSelectionnes);

          setSelectedStylistes(stylistesSelectionnes);

          // S'assurer que les IDs sont bien mis à jour
          setFormData((prev) => ({
            ...prev,
            stylistesIds: stylistesSelectionnes.map((s) => s.id),
          }));
        } else {
          console.log("Aucun styliste ID dans le service");
        }
      }
    } catch (error) {
      console.error("Erreur chargement service:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les données du service: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const filterProduits = () => {
    let filtered = produits;

    if (searchProduit) {
      filtered = filtered.filter(
        (produit) =>
          produit.nom?.toLowerCase().includes(searchProduit.toLowerCase()) ||
          produit.code?.toLowerCase().includes(searchProduit.toLowerCase())
      );
    }

    setFilteredProduits(filtered);
  };

  const filterStylistes = () => {
    let filtered = stylistes;

    if (searchStyliste) {
      filtered = filtered.filter(
        (styliste) =>
          styliste.prenom
            ?.toLowerCase()
            .includes(searchStyliste.toLowerCase()) ||
          styliste.nom?.toLowerCase().includes(searchStyliste.toLowerCase())
      );
    }

    setFilteredStylistes(filtered);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddImage = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageUri], // URI temporaire locale
        }));
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };
  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const handleSelectProduit = (produit) => {
    // Vérifier si le produit est déjà sélectionné
    if (selectedProduits.find((p) => p.id === produit.id)) {
      handleRemoveProduit(produit.id);
    } else {
      const newSelected = [...selectedProduits, produit];
      setSelectedProduits(newSelected);

      // Calculer le nouveau total
      const total = newSelected.reduce((sum, p) => sum + (p.prixVente || 0), 0);
      setTotalProduitsPrix(total);

      // Mettre à jour les IDs
      setFormData((prev) => ({
        ...prev,
        produitsIds: newSelected.map((p) => p.id),
      }));
    }
  };

  const handleRemoveProduit = (produitId) => {
    const newSelected = selectedProduits.filter((p) => p.id !== produitId);
    setSelectedProduits(newSelected);

    // Calculer le nouveau total
    const total = newSelected.reduce((sum, p) => sum + (p.prixVente || 0), 0);
    setTotalProduitsPrix(total);

    // Mettre à jour les IDs
    setFormData((prev) => ({
      ...prev,
      produitsIds: newSelected.map((p) => p.id),
    }));
  };

  const handleSelectStyliste = (styliste) => {
    if (selectedStylistes.find((s) => s.id === styliste.id)) {
      handleRemoveStyliste(styliste.id);
    } else {
      const newSelected = [...selectedStylistes, styliste];
      setSelectedStylistes(newSelected);
      setFormData((prev) => ({
        ...prev,
        stylistesIds: newSelected.map((s) => s.id),
      }));
    }
  };

  const handleRemoveStyliste = (stylisteId) => {
    const newSelected = selectedStylistes.filter((s) => s.id !== stylisteId);
    setSelectedStylistes(newSelected);
    setFormData((prev) => ({
      ...prev,
      stylistesIds: newSelected.map((s) => s.id),
    }));
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un nom pour le service");
      return false;
    }

    if (!formData.prix || parseFloat(formData.prix) <= 0) {
      Alert.alert("Erreur", "Veuillez saisir un prix valide");
      return false;
    }

    // Vérifier le prix minimum
    const prixSaisi = parseFloat(formData.prix);
    if (prixSaisi < totalProduitsPrix) {
      Alert.alert(
        "Erreur de prix",
        `Le prix du service (${prixSaisi} MAD) doit être au moins égal à la somme des produits (${totalProduitsPrix} MAD)`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Sauvegarder les images sur Cloudinary
      // Actuellement vous avez probablement ceci (ligne ~430-445) :
      const imagesCloudinary = [];
      for (const imageUri of formData.images) {
        try {
          // Vérifier si c'est déjà une URL Cloudinary ou une URI locale
          if (imageUri.includes("cloudinary.com")) {
            // C'est déjà une URL Cloudinary (en mode édition)
            imagesCloudinary.push(imageUri);
          } else {
            // Upload vers Cloudinary
            console.log("📤 Upload image service vers Cloudinary...");
            const cloudinaryResult = await uploadToCloudinary(
              imageUri,
              "service_images"
            );
            imagesCloudinary.push(cloudinaryResult.url);
          }
        } catch (error) {
          console.error("Erreur upload image:", error);
          Alert.alert(
            "Attention",
            `Une image n'a pas pu être uploadée: ${error.message}`
          );
          // Continuer avec les autres images
        }
      }

      const serviceToSave = {
        ...formData,
        images: imagesCloudinary, 
        prix: parseFloat(formData.prix),
        duree: parseInt(formData.duree),
      };

      if (isEditMode) {
        await serviceService.updateService(serviceId, serviceToSave);
        Alert.alert("Succès", "Service mis à jour avec succès");
      } else {
        await serviceService.createService(serviceToSave);
        Alert.alert("Succès", "Service créé avec succès");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const renderProduitModal = () => (
    <Modal
      visible={modalProduitsVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalProduitsVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner des produits</Text>
            <TouchableOpacity onPress={() => setModalProduitsVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchModalContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchModalInput}
              placeholder="Rechercher un produit..."
              value={searchProduit}
              onChangeText={setSearchProduit}
            />
          </View>

          <FlatList
            data={filteredProduits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedProduits.find((p) => p.id === item.id) &&
                    styles.modalItemSelected,
                ]}
                onPress={() => handleSelectProduit(item)}
              >
                <View style={styles.modalItemInfo}>
                  <Text style={styles.modalItemName}>{item.nom}</Text>
                  <Text style={styles.modalItemDetails}>
                    {item.code} • {item.prixVente} MAD
                  </Text>
                </View>
                <Ionicons
                  name={
                    selectedProduits.find((p) => p.id === item.id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color="#4CAF50"
                />
              </TouchableOpacity>
            )}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalPrimaryButton]}
              onPress={() => setModalProduitsVisible(false)}
            >
              <Text style={styles.modalButtonText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCategorieModal = () => (
    <Modal
      visible={modalCategorieVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalCategorieVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
            <TouchableOpacity onPress={() => setModalCategorieVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  formData.categorie === item && styles.modalItemSelected,
                ]}
                onPress={() => handleSelectCategorie(item)}
              >
                <Text style={styles.modalItemName}>{item}</Text>
                {formData.categorie === item && (
                  <Ionicons name="checkmark" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            )}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSecondaryButton]}
              onPress={() => {
                setModalCategorieVisible(false);
                // Option pour ajouter une nouvelle catégorie
                Alert.prompt(
                  "Nouvelle catégorie",
                  "Entrez le nom de la nouvelle catégorie:",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Ajouter",
                      onPress: (text) => {
                        if (text && text.trim()) {
                          const newCategorie = text.trim();
                          setCategories((prev) => [...prev, newCategorie]);
                          setFormData((prev) => ({
                            ...prev,
                            categorie: newCategorie,
                          }));
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.modalButtonText}>Nouvelle catégorie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalPrimaryButton]}
              onPress={() => setModalCategorieVisible(false)}
            >
              <Text style={styles.modalButtonText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStylisteModal = () => (
    <Modal
      visible={modalStylistesVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalStylistesVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner des stylistes</Text>
            <TouchableOpacity onPress={() => setModalStylistesVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchModalContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchModalInput}
              placeholder="Rechercher un styliste..."
              value={searchStyliste}
              onChangeText={setSearchStyliste}
            />
          </View>

          <FlatList
            data={filteredStylistes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedStylistes.find((s) => s.id === item.id) &&
                    styles.modalItemSelected,
                ]}
                onPress={() => handleSelectStyliste(item)}
              >
                <View style={styles.modalItemInfo}>
                  <Text style={styles.modalItemName}>
                    {item.prenom} {item.nom}
                  </Text>
                  {item.specialite && (
                    <Text style={styles.modalItemDetails}>
                      {item.specialite}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name={
                    selectedStylistes.find((s) => s.id === item.id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                  color="#4CAF50"
                />
              </TouchableOpacity>
            )}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalPrimaryButton]}
              onPress={() => setModalStylistesVisible(false)}
            >
              <Text style={styles.modalButtonText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Modifier le service" : "Nouveau service"}
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={saving}>
            <Text style={styles.saveButton}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Informations de base */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations de base</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du service *</Text>
            <TextInput
              style={styles.input}
              value={formData.nom}
              onChangeText={(text) => handleInputChange("nom", text)}
              placeholder="Ex: Coupe femme"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Décrivez le service..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Prix (MAD) *</Text>
              <TextInput
                style={styles.input}
                value={formData.prix}
                onChangeText={(text) => handleInputChange("prix", text)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Durée (min) *</Text>
              <TextInput
                style={styles.input}
                value={formData.duree}
                onChangeText={(text) => handleInputChange("duree", text)}
                placeholder="30"
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Catégorie - version dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie</Text>
            <TouchableOpacity
              style={styles.categorieInput}
              onPress={() => setModalCategorieVisible(true)}
            >
              <Text
                style={
                  formData.categorie
                    ? styles.categorieText
                    : styles.categoriePlaceholder
                }
              >
                {formData.categorie || "Sélectionner une catégorie..."}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Images */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Photos de référence</Text>
          <Text style={styles.sectionSubtitle}>
            Ajoutez des photos pour illustrer le service
          </Text>

          <ScrollView horizontal style={styles.imagesContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addImageButton}
              onPress={handleAddImage}
            >
              <Ionicons name="camera" size={30} color="#666" />
              <Text style={styles.addImageText}>Ajouter une photo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Produits */}
        {/* Produits */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>Produits associés</Text>
              <Text style={styles.sectionSubtitle}>
                Total produits: {totalProduitsPrix} MAD
                {totalProduitsPrix > 0 && (
                  <Text style={styles.priceWarning}>
                    {" "}
                    (Prix minimum requis: {totalProduitsPrix} MAD)
                  </Text>
                )}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setModalProduitsVisible(true)}
            >
              <Text style={styles.selectButtonText}>Sélectionner</Text>
            </TouchableOpacity>
          </View>

          {selectedProduits.length === 0 ? (
            <Text style={styles.emptySelection}>Aucun produit sélectionné</Text>
          ) : (
            <View style={styles.selectedItemsContainer}>
              {selectedProduits.map((produit) => (
                <View key={produit.id} style={styles.selectedItem}>
                  <View style={styles.selectedItemInfo}>
                    <Text style={styles.selectedItemName}>{produit.nom}</Text>
                    <Text style={styles.selectedItemPrice}>
                      {produit.prixVente} MAD
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveProduit(produit.id)}
                  >
                    <Ionicons name="close" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Stylistes */}
        {/* Stylistes */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>Stylistes assignés</Text>
              <Text style={styles.sectionSubtitle}>
                Sélectionnez les stylistes qui peuvent réaliser ce service
              </Text>
            </View>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setModalStylistesVisible(true)}
            >
              <Text style={styles.selectButtonText}>Sélectionner</Text>
            </TouchableOpacity>
          </View>

          {selectedStylistes.length === 0 ? (
            <Text style={styles.emptySelection}>
              Aucun styliste sélectionné
            </Text>
          ) : (
            <View style={styles.selectedItemsContainer}>
              {selectedStylistes.map((styliste) => (
                <View key={styliste.id} style={styles.selectedItem}>
                  <View style={styles.selectedItemInfo}>
                    <Text style={styles.selectedItemName}>
                      {styliste.prenom} {styliste.nom}
                    </Text>
                    {styliste.specialite && (
                      <Text style={styles.selectedItemDetails}>
                        {styliste.specialite}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveStyliste(styliste.id)}
                  >
                    <Ionicons name="close" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bouton de sauvegarde */}
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitButtonText}>
            {saving
              ? "Enregistrement en cours..."
              : isEditMode
              ? "Mettre à jour le service"
              : "Créer le service"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      {renderProduitModal()}
      {renderStylisteModal()}
      {renderCategorieModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingBottom: 40,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  saveButton: {
    fontSize: 16,
    color: "#FF5722",
    fontWeight: "600",
  },
  formSection: {
    backgroundColor: "#fff",
    marginTop: 15,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  imagesContainer: {
    flexDirection: "row",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  priceWarning: {
    color: "#FF5722",
    fontWeight: "600",
  },
  selectButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptySelection: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  selectedItemsContainer: {
    marginTop: 10,
  },
  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedItemPrice: {
    fontSize: 14,
    color: "#FF5722",
    marginTop: 2,
  },
  selectedItemDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: "#FF5722",
    marginHorizontal: 20,
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 15,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  searchModalContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchModalInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  modalItemSelected: {
    backgroundColor: "#E8F5E9",
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  modalItemDetails: {
    fontSize: 14,
    color: "#666",
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalPrimaryButton: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  categorieInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  categorieText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  categoriePlaceholder: {
    fontSize: 16,
    color: "#999",
    flex: 1,
  },
  modalSecondaryButton: {
    backgroundColor: "#757575",
    marginBottom: 10,
  },
  // Ajoutez après sectionHeader dans les styles
  sectionHeaderLeft: {
    flex: 1,
    marginRight: 10, // Espace entre le texte et le bouton
  },

  // Modifiez aussi ces styles existants si besoin
  selectedItemsContainer: {
    marginTop: 10,
    maxHeight: 200, // Limite la hauteur avec scroll
  },

  selectedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },

  selectButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100, // Largeur minimale fixe
    alignItems: "center",
  },
});

export default ServiceFormScreen;
