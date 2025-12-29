// screens/admin/SalonSettingsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { salonService } from "../../../services/salonService";
import { pickImage } from "../../../services/localImageService";
import Icon from "react-native-vector-icons/MaterialIcons";
import IconFA from "react-native-vector-icons/FontAwesome"; // Pour Facebook, Instagram, WhatsApp
// OU
import IconMCI from "react-native-vector-icons/MaterialCommunityIcons"

const DAYS_OF_WEEK = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' }
];

const SalonSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [salonInfo, setSalonInfo] = useState(null);
  const [formData, setFormData] = useState({});
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [tempHours, setTempHours] = useState('');

  useEffect(() => {
    loadSalonInfo();
  }, []);

  const loadSalonInfo = async () => {
    try {
      setLoading(true);
      const info = await salonService.getSalonInfo();
      setSalonInfo(info);
      setFormData(info);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les informations du salon");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day, hours) => {
    setFormData(prev => ({
      ...prev,
      horaires: {
        ...prev.horaires,
        [day]: hours
      }
    }));
  };

  const handleSelectLogo = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        setSaving(true);
        const logoPath = await salonService.saveSalonLogo(imageUri);
        setFormData(prev => ({ ...prev, logoPath }));
        Alert.alert("Succès", "Logo mis à jour");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    Alert.alert(
      "Supprimer le logo",
      "Êtes-vous sûr de vouloir supprimer le logo ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await salonService.deleteSalonLogo();
              setFormData(prev => ({ ...prev, logoPath: null }));
              Alert.alert("Succès", "Logo supprimé");
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer le logo");
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.nom?.trim()) {
      Alert.alert("Erreur", "Le nom du salon est requis");
      return;
    }

    setSaving(true);
    try {
      await salonService.updateSalonInfo(formData);
      Alert.alert("Succès", "Paramètres mis à jour");
      loadSalonInfo(); // Recharger les données
    } catch (error) {
      Alert.alert("Erreur", error.message || "Impossible de sauvegarder");
    } finally {
      setSaving(false);
    }
  };

  const openHoursModal = (day) => {
    setSelectedDay(day);
    setTempHours(formData.horaires?.[day] || '');
    setShowHoursModal(true);
  };

  const saveHours = () => {
    if (selectedDay) {
      handleHoursChange(selectedDay, tempHours);
      setShowHoursModal(false);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres du Salon</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Section Logo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo du Salon</Text>
          <View style={styles.logoSection}>
            {formData.logoPath ? (
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: formData.logoPath }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <View style={styles.logoActions}>
                  <TouchableOpacity
                    style={styles.logoActionButton}
                    onPress={handleSelectLogo}
                  >
                    <Icon name="edit" size={20} color="#2196F3" />
                    <Text style={styles.logoActionText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.logoActionButton}
                    onPress={handleDeleteLogo}
                  >
                    <Icon name="delete" size={20} color="#F44336" />
                    <Text style={styles.logoActionText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.logoPlaceholder}
                onPress={handleSelectLogo}
              >
                <Icon name="add-a-photo" size={40} color="#ccc" />
                <Text style={styles.logoPlaceholderText}>Ajouter un logo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section Informations de base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de base</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom du salon *</Text>
            <TextInput
              style={styles.input}
              value={formData.nom || ''}
              onChangeText={(text) => handleChange('nom', text)}
              placeholder="Nom du salon"
              editable={!saving}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description || ''}
              onChangeText={(text) => handleChange('description', text)}
              placeholder="Description du salon"
              multiline
              numberOfLines={3}
              editable={!saving}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={styles.input}
              value={formData.adresse || ''}
              onChangeText={(text) => handleChange('adresse', text)}
              placeholder="Adresse complète"
              editable={!saving}
            />
          </View>
        </View>

        {/* Section Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coordonnées</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              value={formData.telephone || ''}
              onChangeText={(text) => handleChange('telephone', text)}
              placeholder="+212 6XX-XXXXXX"
              keyboardType="phone-pad"
              editable={!saving}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email || ''}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="contact@salon.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />
          </View>
        </View>

        {/* Section Horaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
          
          {DAYS_OF_WEEK.map((day) => (
            <TouchableOpacity
              key={day.key}
              style={styles.hoursItem}
              onPress={() => openHoursModal(day.key)}
            >
              <Text style={styles.hoursDay}>{day.label}</Text>
              <View style={styles.hoursValueContainer}>
                <Text style={styles.hoursValue}>
                  {formData.horaires?.[day.key] || 'Non défini'}
                </Text>
                <Icon name="edit" size={18} color="#666" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section Réseaux sociaux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réseaux sociaux</Text>
          
          <View style={styles.formGroup}>
            <View style={styles.socialInputContainer}>
              <Icon name="facebook" size={20} color="#1877F2" style={styles.socialIcon} />
              <TextInput
                style={styles.socialInput}
                value={formData.facebook || ''}
                onChangeText={(text) => handleChange('facebook', text)}
                placeholder="Lien Facebook"
                autoCapitalize="none"
                editable={!saving}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.socialInputContainer}>
              <Icon name="instagram" size={20} color="#E4405F" style={styles.socialIcon} />
              <TextInput
                style={styles.socialInput}
                value={formData.instagram || ''}
                onChangeText={(text) => handleChange('instagram', text)}
                placeholder="Lien Instagram"
                autoCapitalize="none"
                editable={!saving}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.socialInputContainer}>
              <Icon name="whatsapp" size={20} color="#25D366" style={styles.socialIcon} />
              <TextInput
                style={styles.socialInput}
                value={formData.whatsapp || ''}
                onChangeText={(text) => handleChange('whatsapp', text)}
                placeholder="Numéro WhatsApp"
                keyboardType="phone-pad"
                editable={!saving}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal pour modifier les horaires */}
      <Modal
        visible={showHoursModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHoursModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Horaires - {selectedDay && DAYS_OF_WEEK.find(d => d.key === selectedDay)?.label}
              </Text>
              <TouchableOpacity onPress={() => setShowHoursModal(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              value={tempHours}
              onChangeText={setTempHours}
              placeholder="Ex: 09:00 - 19:00"
              autoFocus
            />
            
            <View style={styles.modalExamples}>
              <Text style={styles.examplesTitle}>Exemples :</Text>
              <Text style={styles.example}>09:00 - 19:00</Text>
              <Text style={styles.example}>10:00 - 20:00</Text>
              <Text style={styles.example}>Fermé</Text>
              <Text style={styles.example}>Sur rendez-vous</Text>
            </View>
            
            <TouchableOpacity style={styles.modalSaveButton} onPress={saveHours}>
              <Text style={styles.modalSaveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
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
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logoSection: {
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
  },
  logoActions: {
    flexDirection: "row",
    gap: 20,
  },
  logoActionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  logoActionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  logoPlaceholderText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  hoursItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  hoursDay: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  hoursValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  hoursValue: {
    fontSize: 14,
    color: "#666",
    marginRight: 10,
  },
  socialInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    paddingHorizontal: 15,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
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
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalExamples: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  example: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
    fontStyle: "italic",
  },
  modalSaveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  modalSaveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SalonSettingsScreen;