// screens/admin/SupplierForm.js
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { productService } from '../../../../services/productService';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/firebaseConfig';
// En haut de SupplierList.js et SupplierForm.js
import { deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const SupplierForm = ({ navigation, route }) => {
  const { supplierId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const isEditMode = !!supplierId;

  useEffect(() => {
    if (isEditMode) {
      loadSupplier();
    }
  }, [supplierId]);

  const loadSupplier = async () => {
    try {
      setLoading(true);
      const supplierDoc = await getDoc(doc(db, "suppliers", supplierId));
      
      if (supplierDoc.exists()) {
        const supplier = supplierDoc.data();
        setNom(supplier.nom || "");
        setEmail(supplier.email || "");
        setTelephone(supplier.telephone || "");
        setAdresse(supplier.adresse || "");
        setNotes(supplier.notes || "");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger le fournisseur");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    // Validation du nom
    if (!nom.trim()) {
      newErrors.nom = "Le nom du fournisseur est requis";
    } else if (nom.trim().length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation de l'email
    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email invalide";
    }

    // Validation du téléphone
    if (telephone && !isValidPhone(telephone)) {
      newErrors.telephone = "Numéro de téléphone invalide";
    }

    setErrors(newErrors);
    
    // Vérifier l'unicité uniquement si pas d'erreurs de validation
    if (Object.keys(newErrors).length === 0) {
      try {
        // Vérifier si le fournisseur existe déjà (sauf en mode édition)
        if (!isEditMode) {
          const exists = await productService.checkSupplierExists(nom, email);
          if (exists) {
            newErrors.nom = "Ce fournisseur existe déjà (nom ou email)";
          }
        }
      } catch (error) {
        newErrors.nom = "Erreur de vérification";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const isValidPhone = (phone) => {
    const re = /^[0-9\s\+\(\)-]{10,15}$/;
    return re.test(phone);
  };

  const handleSave = async () => {
    if (!(await validateForm())) return;

    try {
      setSaving(true);
      const supplierData = {
        nom: nom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        adresse: adresse.trim(),
        notes: notes.trim(),
      };

      if (isEditMode) {
        // Mettre à jour le fournisseur existant
        // Note: Vous devez implémenter updateSupplier dans le service
        // Pour l'instant, on utilise une mise à jour directe
        await updateDoc(doc(db, "suppliers", supplierId), {
          ...supplierData,
          dateModification: serverTimestamp()
        });
        Alert.alert("Succès", "Fournisseur modifié avec succès");
      } else {
        await productService.createSupplier(supplierData);
        Alert.alert("Succès", "Fournisseur créé avec succès");
      }

      // Retourner à la liste avec un message de succès
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
        <ActivityIndicator size="large" color="#FF9800" />
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
            {isEditMode ? "Modifier le Fournisseur" : "Nouveau Fournisseur"}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            {/* Champ Nom */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Nom du fournisseur <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.nom && styles.inputError]}
                value={nom}
                onChangeText={setNom}
                placeholder="Ex: L'Oréal Professionnel"
                maxLength={100}
                editable={!saving}
              />
              {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
              <Text style={styles.helperText}>
                Nom complet de l'entreprise
              </Text>
            </View>

            {/* Champ Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="contact@fournisseur.com"
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
                editable={!saving}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              <Text style={styles.helperText}>
                Email de contact principal
              </Text>
            </View>

            {/* Champ Téléphone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={[styles.input, errors.telephone && styles.inputError]}
                value={telephone}
                onChangeText={setTelephone}
                placeholder="01 23 45 67 89"
                keyboardType="phone-pad"
                maxLength={15}
                editable={!saving}
              />
              {errors.telephone && (
                <Text style={styles.errorText}>{errors.telephone}</Text>
              )}
              <Text style={styles.helperText}>
                Numéro de contact (optionnel)
              </Text>
            </View>

            {/* Champ Adresse */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Adresse</Text>
              <TextInput
                style={[styles.textArea, errors.adresse && styles.inputError]}
                value={adresse}
                onChangeText={setAdresse}
                placeholder="Adresse complète..."
                multiline
                numberOfLines={3}
                maxLength={200}
                editable={!saving}
              />
              {errors.adresse && (
                <Text style={styles.errorText}>{errors.adresse}</Text>
              )}
              <Text style={styles.helperText}>
                {adresse.length}/200 caractères
              </Text>
            </View>

            {/* Champ Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes & Informations</Text>
              <TextInput
                style={[styles.textArea, errors.notes && styles.inputError]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Informations complémentaires..."
                multiline
                numberOfLines={4}
                maxLength={500}
                editable={!saving}
              />
              {errors.notes && <Text style={styles.errorText}>{errors.notes}</Text>}
              <Text style={styles.helperText}>
                {notes.length}/500 caractères
              </Text>
            </View>

            {/* Informations */}
            <View style={styles.infoBox}>
              <Icon name="info" size={18} color="#666" />
              <Text style={styles.infoText}>
                Les fournisseurs sont essentiels pour gérer votre inventaire. 
                Assurez-vous que chaque produit soit associé à un fournisseur.
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
    minHeight: 80,
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
    backgroundColor: "#FF9800",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#FFCC80",
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

export default SupplierForm;