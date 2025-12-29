import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import {
  getProfilCapillaireByClientId,
  saveProfilCapillaire,
} from "../../../services/ProfileCapillaireService";
import Icon from "react-native-vector-icons/MaterialIcons";

const ProfilCapillaireScreen = ({ navigation, route }) => {
  const { clientId, clientName } = route.params || {};
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // État pour gérer le modal actif
  const [activeModal, setActiveModal] = useState(null); // null, 'typeCheveux', 'etatCheveux', etc.
  const [modalOptions, setModalOptions] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  // Données du formulaire selon le diagramme de classe
  // Dans le useState de formData, ajoutez:
  const [formData, setFormData] = useState({
    typeCheveux: "",
    etatCheveux: "",
    textureCheveux: "",
    longueurCheveux: "",
    couleurNaturelle: "",
    allergies: "",
    traitementsActuels: "",
    produitsUtilises: "",
    objectifs: "",
    notesSupplementaires: "",
    // Ajoutez cette ligne:
    couleurYeux: "", // Nouveau champ
  });

  useEffect(() => {
    loadProfil();
  }, [clientId]);

  const loadProfil = async () => {
    try {
      const profilData = await getProfilCapillaireByClientId(clientId);
      if (profilData) {
        setProfil(profilData);
        setFormData({
          typeCheveux: profilData.typeCheveux || "",
          etatCheveux: profilData.etatCheveux || "",
          textureCheveux: profilData.textureCheveux || "",
          longueurCheveux: profilData.longueurCheveux || "",
          couleurNaturelle: profilData.couleurNaturelle || "",
          allergies: profilData.allergies || "",
          traitementsActuels: profilData.traitementsActuels || "",
          produitsUtilises: profilData.produitsUtilises || "",
          objectifs: profilData.objectifs || "",
          notesSupplementaires: profilData.notesSupplementaires || "",
        });
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.typeCheveux) {
      Alert.alert("Erreur", "Le type de cheveux est requis");
      return;
    }

    setSaving(true);
    try {
      await saveProfilCapillaire(clientId, formData);
      Alert.alert("Succès", profil ? "Profil mis à jour" : "Profil créé");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour ouvrir le modal
  const openModal = (field, options, title) => {
    setActiveModal(field);
    setModalOptions(options);
    setModalTitle(title);
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
    setActiveModal(null);
    setModalOptions([]);
    setModalTitle("");
  };

  // Fonction pour sélectionner une option
  const selectOption = (option) => {
    setFormData((prev) => ({ ...prev, [activeModal]: option }));
    closeModal();
  };

  // Fonction pour rendre un champ select
  const renderSelectField = (label, field, options) => {
    const fieldValue = formData[field];
    const displayValue = fieldValue || "Sélectionner...";

    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={styles.selectInput}
          onPress={() => openModal(field, options, label)}
        >
          <Text
            style={[styles.selectText, !fieldValue && styles.placeholderText]}
          >
            {displayValue}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderTextField = (label, field, placeholder, multiline = false) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={formData[field]}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, [field]: text }))
        }
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Profil Capillaire</Text>
          <Text style={styles.headerSubtitle}>{clientName}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color="#4CAF50" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Renseignez le profil capillaire du client pour un suivi personnalisé
            des soins.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques des cheveux</Text>

          {renderSelectField("Type de cheveux", "typeCheveux", [
            "Normal",
            "Sec",
            "Gras",
            "Mixte",
          ])}
          {renderSelectField("État des cheveux", "etatCheveux", [
            "Abimé",
            "Normal",
            "Sain",
          ])}
          {renderSelectField("Texture des cheveux", "textureCheveux", [
            "Raide",
            "Ondulé",
            "Bouclé",
            "Frisé",
          ])}
          {renderSelectField("Longueur des cheveux", "longueurCheveux", [
            "Court",
            "Moyen",
            "Long",
          ])}
          {renderTextField(
            "Couleur naturelle",
            "couleurNaturelle",
            "Ex: Brun clair, Châtain..."
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Santé et traitements</Text>
          {renderTextField(
            "Allergies connues",
            "allergies",
            "Ex: Produits chimiques, Parfums..."
          )}
          {renderTextField(
            "Traitements actuels",
            "traitementsActuels",
            "Ex: Kératine, Coloration..."
          )}
          {renderTextField(
            "Produits utilisés",
            "produitsUtilises",
            "Shampoings, après-shampoings..."
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectifs et notes</Text>
          {renderSelectField("Objectifs principaux", "objectifs", [
            "Coupe",
            "Coloration",
            "Soin",
            "Lissage",
            "Autre",
          ])}
          {renderTextField(
            "Notes supplémentaires",
            "notesSupplementaires",
            "Autres informations importantes...",
            true
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {profil ? "Mettre à jour le profil" : "Créer le profil"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal unique pour toutes les sélections */}
      <Modal
        visible={activeModal !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Sélectionner {modalTitle.toLowerCase()}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {modalOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    formData[activeModal] === option &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => selectOption(option)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      formData[activeModal] === option &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {formData[activeModal] === option && (
                    <Icon name="check" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Les styles restent les mêmes
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#4CAF50",
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 2,
  },
  headerRight: {
    width: 30,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#2E7D32",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  modalOptionSelected: {
    backgroundColor: "#F0F9FF",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalOptionTextSelected: {
    color: "#4CAF50",
    fontWeight: "500",
  },
});

export default ProfilCapillaireScreen;
