// screens/admin/ProductForm.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import { productService } from "../../../../services/productService";
import {
  pickImage,
  compressImage,
  uploadImage,
} from "../../../../services/imageService";
import * as FileSystem from 'expo-file-system';


const ProductForm = ({ navigation, route }) => {
  const { productId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // États pour les données du produit
  const [nom, setNom] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [quantite, setQuantite] = useState("");
  const [seuilAlerte, setSeuilAlerte] = useState("10");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  // États pour les modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [errors, setErrors] = useState({});

  const isEditMode = !!productId;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les catégories et fournisseurs
      const [categoriesData, suppliersData] = await Promise.all([
        productService.getAllCategories(),
        productService.getAllSuppliers(),
      ]);

      setCategories(categoriesData);
      setSuppliers(suppliersData);

      // Si en mode édition, charger le produit
      if (isEditMode) {
        const product = await productService.getProductById(productId);
        if (product) {
          setNom(product.nom || "");
          setCode(product.code || "");
          setDescription(product.description || "");
          setPrixAchat(product.prixAchat?.toString() || "");
          setPrixVente(product.prixVente?.toString() || "");
          setQuantite(product.quantite?.toString() || "");
          setSeuilAlerte(product.seuilAlerte?.toString() || "10");
          setSelectedCategory(product.categorieId);
          setSelectedSupplier(product.fournisseurId);
          setImageUrl(product.imageUrl || null);

          // Trouver et sélectionner la catégorie et le fournisseur correspondants
          const category = categoriesData.find(
            (c) => c.id === product.categorieId
          );
          const supplier = suppliersData.find(
            (s) => s.id === product.fournisseurId
          );

          if (category) setSelectedCategory(category.id);
          if (supplier) setSelectedSupplier(supplier.id);
        }
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const uri = await pickImage();
      if (uri) {
        // Compresser l'image
        const compressedUri = await compressImage(uri);
        setImageUri(compressedUri);
      }
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible de sélectionner l'image"
      );
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!nom.trim()) {
      newErrors.nom = "Le nom du produit est requis";
    }

    if (!selectedCategory) {
      newErrors.category = "Veuillez sélectionner une catégorie";
    }

    if (!selectedSupplier) {
      newErrors.supplier = "Veuillez sélectionner un fournisseur";
    }

    if (
      !prixAchat ||
      isNaN(parseFloat(prixAchat)) ||
      parseFloat(prixAchat) <= 0
    ) {
      newErrors.prixAchat = "Prix d'achat invalide";
    }

    if (
      !prixVente ||
      isNaN(parseFloat(prixVente)) ||
      parseFloat(prixVente) <= 0
    ) {
      newErrors.prixVente = "Prix de vente invalide";
    }

    if (parseFloat(prixVente) < parseFloat(prixAchat)) {
      newErrors.prixVente =
        "Le prix de vente doit être supérieur au prix d'achat";
    }

    if (!quantite || isNaN(parseInt(quantite)) || parseInt(quantite) < 0) {
      newErrors.quantite = "Quantité invalide";
    }

    if (
      !seuilAlerte ||
      isNaN(parseInt(seuilAlerte)) ||
      parseInt(seuilAlerte) < 0
    ) {
      newErrors.seuilAlerte = "Seuil d'alerte invalide";
    }

    // Vérifier l'unicité du code (sauf en mode édition)
    if (code.trim() && !isEditMode) {
      try {
        const exists = await productService.checkProductCodeExists(code);
        if (exists) {
          newErrors.code = "Ce code produit existe déjà";
        }
      } catch (error) {
        console.error("Erreur vérification code:", error);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



// Dans handleSave, remplacez la partie image par :
const handleSave = async () => {
  if (!(await validateForm())) return;

  try {
    setSaving(true);

    const category = categories.find(c => c.id === selectedCategory);
    const supplier = suppliers.find(s => s.id === selectedSupplier);

    if (!category || !supplier) {
      throw new Error("Catégorie ou fournisseur invalide");
    }

    const productData = {
      nom: nom.trim(),
      code: code.trim(),
      description: description.trim(),
      prixAchat: parseFloat(prixAchat),
      prixVente: parseFloat(prixVente),
      quantite: parseInt(quantite),
      seuilAlerte: parseInt(seuilAlerte),
      categorieId: category.id,
      categorieNom: category.nom,
      fournisseurId: supplier.id,
      fournisseurNom: supplier.nom,
    };

    // SAUVEGARDE IMAGE LOCALE
    if (imageUri) {
      try {
        // Générer un nom de fichier unique
        const productIdForFile = isEditMode ? productId : `temp_${Date.now()}`;
        const fileName = `product_${productIdForFile}.jpg`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        
        // Copier l'image dans le dossier de l'application
        await FileSystem.copyAsync({
          from: imageUri,
          to: newPath,
        });
        
        // Stocker le chemin local dans Firestore
        productData.localImagePath = newPath;
        console.log('Image sauvegardée localement:', newPath);
      } catch (imageError) {
        console.error('Erreur sauvegarde image locale:', imageError);
        // Continuer sans image si erreur
      }
    } else if (imageUrl && imageUrl.startsWith('file://')) {
      // Si déjà un chemin local
      productData.localImagePath = imageUrl;
    }

    if (isEditMode) {
      await productService.updateProduct(productId, productData);
      Alert.alert("Succès", "Produit modifié avec succès");
    } else {
      await productService.createProduct(productData);
      Alert.alert("Succès", "Produit créé avec succès");
    }

    navigation.goBack();
  } catch (error) {
    Alert.alert("Erreur", error.message || "Une erreur est survenue");
  } finally {
    setSaving(false);
  }
};

  const getSelectedCategoryName = () => {
    const category = categories.find((c) => c.id === selectedCategory);
    return category ? category.nom : "Sélectionner une catégorie";
  };

  const getSelectedSupplierName = () => {
    const supplier = suppliers.find((s) => s.id === selectedSupplier);
    return supplier ? supplier.nom : "Sélectionner un fournisseur";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Modifier le Produit" : "Nouveau Produit"}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            {/* Section Image */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Image du produit</Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={handleImagePick}
                disabled={saving}
              >
                {imageUri || imageUrl ? (
                  <Image
                    source={{ uri: imageUri || imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="add-a-photo" size={40} color="#ccc" />
                    <Text style={styles.imagePlaceholderText}>
                      Ajouter une photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Informations de base */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations de base</Text>

              {/* Nom */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Nom du produit <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.nom && styles.inputError]}
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Ex: Shampooing Éclat Brillant"
                  maxLength={100}
                  editable={!saving}
                />
                {errors.nom && (
                  <Text style={styles.errorText}>{errors.nom}</Text>
                )}
              </View>

              {/* Code */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Code produit</Text>
                <TextInput
                  style={[styles.input, errors.code && styles.inputError]}
                  value={code}
                  onChangeText={setCode}
                  placeholder="Ex: SH-ECLAT-001"
                  maxLength={50}
                  editable={!saving}
                />
                {errors.code && (
                  <Text style={styles.errorText}>{errors.code}</Text>
                )}
                <Text style={styles.helperText}>
                  Code unique d'identification (optionnel)
                </Text>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    errors.description && styles.inputError,
                  ]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description détaillée du produit..."
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  editable={!saving}
                />
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
                <Text style={styles.helperText}>
                  {description.length}/500 caractères
                </Text>
              </View>
            </View>

            {/* Catégorie et Fournisseur */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Classification</Text>

              {/* Catégorie */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Catégorie <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectInput,
                    errors.category && styles.inputError,
                  ]}
                  onPress={() => setShowCategoryModal(true)}
                  disabled={saving}
                >
                  <Text
                    style={
                      selectedCategory
                        ? styles.selectText
                        : styles.selectPlaceholder
                    }
                  >
                    {getSelectedCategoryName()}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}
              </View>

              {/* Fournisseur */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Fournisseur <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectInput,
                    errors.supplier && styles.inputError,
                  ]}
                  onPress={() => setShowSupplierModal(true)}
                  disabled={saving}
                >
                  <Text
                    style={
                      selectedSupplier
                        ? styles.selectText
                        : styles.selectPlaceholder
                    }
                  >
                    {getSelectedSupplierName()}
                  </Text>
                  <Icon name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
                {errors.supplier && (
                  <Text style={styles.errorText}>{errors.supplier}</Text>
                )}
              </View>
            </View>

            {/* Prix et Stock */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prix & Stock</Text>

              <View style={styles.row}>
                {/* Prix d'achat */}
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>
                    Prix d'achat (€) <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.prixAchat && styles.inputError,
                    ]}
                    value={prixAchat}
                    onChangeText={setPrixAchat}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    editable={!saving}
                  />
                  {errors.prixAchat && (
                    <Text style={styles.errorText}>{errors.prixAchat}</Text>
                  )}
                </View>

                {/* Prix de vente */}
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>
                    Prix de vente (€) <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.prixVente && styles.inputError,
                    ]}
                    value={prixVente}
                    onChangeText={setPrixVente}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    editable={!saving}
                  />
                  {errors.prixVente && (
                    <Text style={styles.errorText}>{errors.prixVente}</Text>
                  )}
                </View>
              </View>

              <View style={styles.row}>
                {/* Quantité */}
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>
                    Quantité en stock <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.quantite && styles.inputError]}
                    value={quantite}
                    onChangeText={setQuantite}
                    placeholder="0"
                    keyboardType="number-pad"
                    editable={!saving}
                  />
                  {errors.quantite && (
                    <Text style={styles.errorText}>{errors.quantite}</Text>
                  )}
                </View>

                {/* Seuil d'alerte */}
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>
                    Seuil d'alerte <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.seuilAlerte && styles.inputError,
                    ]}
                    value={seuilAlerte}
                    onChangeText={setSeuilAlerte}
                    placeholder="10"
                    keyboardType="number-pad"
                    editable={!saving}
                  />
                  {errors.seuilAlerte && (
                    <Text style={styles.errorText}>{errors.seuilAlerte}</Text>
                  )}
                  <Text style={styles.helperText}>
                    Alerte quand ≤ ce nombre
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Boutons d'action */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon
                  name={isEditMode ? "save" : "add"}
                  size={20}
                  color="#fff"
                  style={styles.saveIcon}
                />
                <Text style={styles.saveButtonText}>
                  {isEditMode ? "Mettre à jour" : "Créer le produit"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Modal Catégories */}
        <Modal
          visible={showCategoryModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Sélectionner une catégorie
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedCategory === item.id && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(item.id);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedCategory === item.id &&
                          styles.modalItemTextSelected,
                      ]}
                    >
                      {item.nom}
                    </Text>
                    {item.description ? (
                      <Text style={styles.modalItemDescription}>
                        {item.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <Text style={styles.modalEmptyText}>
                      Aucune catégorie disponible
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>

        {/* Modal Fournisseurs */}
        <Modal
          visible={showSupplierModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSupplierModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Sélectionner un fournisseur
                </Text>
                <TouchableOpacity onPress={() => setShowSupplierModal(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={suppliers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      selectedSupplier === item.id && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedSupplier(item.id);
                      setShowSupplierModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selectedSupplier === item.id &&
                          styles.modalItemTextSelected,
                      ]}
                    >
                      {item.nom}
                    </Text>
                    <Text style={styles.modalItemDescription}>
                      {item.email}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.modalEmpty}>
                    <Text style={styles.modalEmptyText}>
                      Aucun fournisseur disponible
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  safeArea: {
    flex: 1,
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
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 25,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 5,
    color: "#666",
    fontSize: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#F44336",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  inputError: {
    borderColor: "#F44336",
    backgroundColor: "#FFF5F5",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
    minHeight: 100,
    textAlignVertical: "top",
  },
  selectInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fafafa",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectText: {
    fontSize: 16,
    color: "#333",
  },
  selectPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 5,
  },
  helperText: {
    color: "#666",
    fontSize: 12,
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Styles pour les modals
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalItemSelected: {
    backgroundColor: "#E3F2FD",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalItemTextSelected: {
    color: "#2196F3",
    fontWeight: "600",
  },
  modalItemDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  modalEmpty: {
    padding: 40,
    alignItems: "center",
  },
  modalEmptyText: {
    color: "#666",
    fontSize: 16,
  },
});

export default ProductForm;
