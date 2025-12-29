// screens/admin/CategoryForm.js
import React, { useState, useEffect } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { productService } from '../../services/productService';

const CategoryForm = ({ navigation, route }) => {
  const { categoryId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const isEditMode = !!categoryId;

  useEffect(() => {
    if (isEditMode) {
      loadCategory();
    }
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const category = await productService.getCategoryById(categoryId);
      if (category) {
        setNom(category.nom);
        setDescription(category.description || "");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger la catégorie");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!nom.trim()) {
      newErrors.nom = "Le nom est requis";
    } else if (nom.trim().length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    } else {
      try {
        const isUnique = await productService.checkUniqueCategoryName(
          nom.trim(),
          isEditMode ? categoryId : null
        );
        if (!isUnique) {
          newErrors.nom = "Cette catégorie existe déjà";
        }
      } catch (error) {
        newErrors.nom = "Erreur de vérification";
      }
    }

    if (description.trim().length > 500) {
      newErrors.description = "La description ne doit pas dépasser 500 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!(await validateForm())) return;

    try {
      setSaving(true);
      const categoryData = {
        nom: nom.trim(),
        description: description.trim(),
      };

      if (isEditMode) {
        await productService.updateCategory(categoryId, categoryData);
        Alert.alert("Succès", "Catégorie modifiée avec succès");
      } else {
        await productService.createCategory(categoryData);
        Alert.alert("Succès", "Catégorie créée avec succès");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement...</Text>
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
        <Text style={styles.headerTitle}>
          {isEditMode ? "Modifier la Catégorie" : "Nouvelle Catégorie"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          {/* Champ Nom */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Nom de la catégorie <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.nom && styles.inputError]}
              value={nom}
              onChangeText={setNom}
              placeholder="Ex: Shampooings, Colorations, Soins..."
              maxLength={50}
              editable={!saving}
            />
            {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
            <Text style={styles.helperText}>
              Doit être unique parmi toutes les catégories
            </Text>
          </View>

          {/* Champ Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez cette catégorie..."
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

          {/* Informations */}
          <View style={styles.infoBox}>
            <Icon name="info" size={18} color="#666" />
            <Text style={styles.infoText}>
              Les catégories permettent d'organiser vos produits par type. 
              Assurez-vous que chaque produit appartient à une catégorie.
            </Text>
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
                {isEditMode ? "Mettre à jour" : "Créer"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  formGroup: {
    marginBottom: 25,
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
  infoBox: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#666",
    fontSize: 12,
    lineHeight: 16,
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
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CategoryForm;