import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import {
  getUserById,
  createUser,
  updateUser,
  changeUserPassword,
} from "../../../services/userService";
import Icon from "react-native-vector-icons/MaterialIcons";

const UserFormScreen = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const isEditing = !!userId;

  // Liste des postes disponibles pour les assistantes
  const postesOptions = [
    { id: "receptionniste", label: "Réceptionniste" },
    { id: "assistante_coiffeur", label: "Assistante coiffeur" },
    { id: "assistante_styliste", label: "Assistante styliste" },
    { id: "assistante_admin", label: "Assistante administrative" },
    { id: "gestionnaire", label: "Gestionnaire de salon" },
    { id: "autre", label: "Autre poste" },
  ];

  // État initial avec les champs spécifiques pour chaque rôle
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "client",
    password: "",
    actif: true, // Par défaut actif
    // Champs spécifiques aux rôles
    pointsFidelite: "0", // Pour les clients
    experience: "", // Pour les stylistes (nombre d'années)
    poste: "", // Pour les assistantes
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [modalPosteVisible, setModalPosteVisible] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const user = await getUserById(userId);
      if (user) {
        setFormData({
          nom: user.nom || "",
          prenom: user.prenom || "",
          email: user.email || "",
          telephone: user.telephone || "",
          role: user.role || "client",
          password: "",
          // AJOUTE cette ligne :
          actif: user.actif !== false, // Si non défini, true par défaut
          pointsFidelite: user.pointsFidelite?.toString() || "0",
          experience: user.experience?.toString() || "",
          poste: user.poste || "",
        });
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    try {
      const newStatus = !formData.actif;

      // Mettre à jour juste le statut
      await updateUser(userId, { actif: newStatus });

      // Mettre à jour l'état local
      setFormData((prev) => ({ ...prev, actif: newStatus }));

      Alert.alert(
        "Succès",
        newStatus ? "Utilisateur activé" : "Utilisateur désactivé"
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de changer le statut");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
      // Réinitialiser les champs spécifiques lorsque le rôle change
      pointsFidelite: role === "client" ? "0" : "",
      experience: "",
      poste: "",
    }));
  };

  const validateForm = () => {
    // Validation des champs de base
    if (!formData.nom || !formData.prenom) {
      Alert.alert("Erreur", "Le nom et prénom sont requis");
      return false;
    }

    if (!isEditing && (!formData.email || !formData.password)) {
      Alert.alert(
        "Erreur",
        "L'email et le mot de passe sont requis pour un nouvel utilisateur"
      );
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 6 caractères"
      );
      return false;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert("Erreur", "Format d'email invalide");
      return false;
    }

    // Validation des champs spécifiques selon le rôle
    if (formData.role === "styliste" && formData.experience) {
      const experienceNum = parseInt(formData.experience);
      if (isNaN(experienceNum) || experienceNum < 0) {
        Alert.alert("Erreur", "L'expérience doit être un nombre positif");
        return false;
      }
    }

    if (formData.role === "assistante" && !formData.poste) {
      Alert.alert("Erreur", "Le poste est requis pour une assistante");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        role: formData.role,
      };

      if (isEditing && formData.password) {
        // Si mot de passe fourni en édition, le changer
        await changeUserPassword(userId, formData.password);
        Alert.alert("Succès", "Mot de passe mis à jour");
      } else if (!isEditing && formData.password) {
        // Nouvel utilisateur
        userData.password = formData.password;
      }

      // Ajouter les champs spécifiques selon le rôle
      switch (formData.role) {
        case "client":
          userData.pointsFidelite = parseInt(formData.pointsFidelite) || 0;
          break;
        case "styliste":
          userData.experience = parseInt(formData.experience) || 0;
          break;
        case "assistante":
          userData.poste = formData.poste;
          break;
      }

      if (isEditing) {
        await updateUser(userId, userData);
        Alert.alert("Succès", "Utilisateur mis à jour");
      } else {
        await createUser(userData);
        Alert.alert("Succès", "Utilisateur créé");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async () => {
  //   if (!validateForm()) return;

  //   setLoading(true);
  //   try {
  //     // Préparer les données à envoyer selon le rôle
  //     const userData = {
  //       nom: formData.nom,
  //       prenom: formData.prenom,
  //       email: formData.email,
  //       telephone: formData.telephone,
  //       role: formData.role,
  //       ...(formData.password && { password: formData.password }),
  //     };

  //     // Ajouter les champs spécifiques selon le rôle
  //     switch (formData.role) {
  //       case "client":
  //         userData.pointsFidelite = parseInt(formData.pointsFidelite) || 0;
  //         break;
  //       case "styliste":
  //         userData.experience = parseInt(formData.experience) || 0;
  //         break;
  //       case "assistante":
  //         userData.poste = formData.poste;
  //         break;
  //     }

  //     if (isEditing) {
  //       await updateUser(userId, userData);
  //       Alert.alert("Succès", "Utilisateur mis à jour");
  //     } else {
  //       await createUser(userData);
  //       Alert.alert("Succès", "Utilisateur créé");
  //     }

  //     navigation.goBack();
  //   } catch (error) {
  //     Alert.alert("Erreur", error.message || "Une erreur est survenue");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const renderField = (label, field, placeholder, options = {}) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label} {options.required && "*"}
      </Text>
      <TextInput
        style={[styles.input, options.multiline && styles.multilineInput]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        editable={options.editable !== false}
        secureTextEntry={field === "password"}
        multiline={options.multiline}
        numberOfLines={options.multiline ? 3 : 1}
        keyboardType={options.keyboardType}
      />
    </View>
  );

  if (initialLoading) {
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
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Modifier Utilisateur" : "Nouvel Utilisateur"}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          {renderField("Nom", "nom", "Entrez le nom", { required: true })}
          {renderField("Prénom", "prenom", "Entrez le prénom", {
            required: true,
          })}
          {renderField("Email", "email", "email@exemple.com", {
            required: !isEditing,
            editable: !isEditing,
            keyboardType: "email-address",
          })}
          {renderField("Téléphone", "telephone", "06XXXXXXXX", {
            keyboardType: "phone-pad",
          })}

          {/* {!isEditing &&
            renderField("Mot de passe", "password", "********", {
              required: true,
            })} */}

          {renderField(
            "Mot de passe",
            "password",
            isEditing ? "Laisser vide pour ne pas changer" : "********",
            {
              required: !isEditing,
            }
          )}

          {/* Sélecteur de rôle avec les 4 options */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Rôle *</Text>
            <View style={styles.roleSelector}>
              {[
                { value: "admin", label: "👑 Administrateur" },
                { value: "client", label: "👤 Client" },
                { value: "styliste", label: "✂️ Styliste" },
                { value: "assistante", label: "💼 Assistante" },
              ].map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    formData.role === role.value && styles.roleButtonActive,
                  ]}
                  onPress={() => handleRoleChange(role.value)}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === role.value &&
                        styles.roleButtonTextActive,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Champs spécifiques selon le rôle */}

          {/* Pour les clients : Points de fidélité */}
          {formData.role === "client" &&
            renderField("Points de fidélité", "pointsFidelite", "0", {
              keyboardType: "numeric",
              editable: false, // Initialisé à 0 et non modifiable à la création
            })}

          {/* Pour les stylistes : Années d'expérience */}
          {formData.role === "styliste" &&
            renderField("Années d'expérience", "experience", "0", {
              required: true,
              keyboardType: "numeric",
            })}

          {/* Pour les assistantes : Poste */}
          {/* Pour les assistantes : Poste - CORRIGE CETTE PARTIE : */}
          {formData.role === "assistante" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Poste *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setModalPosteVisible(true)} // SIMPLIFIE ICI
              >
                <Text
                  style={[
                    styles.selectText,
                    !formData.poste && styles.placeholderText,
                  ]}
                >
                  {formData.poste
                    ? postesOptions.find((p) => p.id === formData.poste)
                        ?.label || formData.poste
                    : "Sélectionner un poste..."}
                </Text>
                <Icon name="arrow-drop-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? "Mettre à jour" : "Créer l'utilisateur"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal pour sélectionner le poste */}
      <Modal
        visible={modalPosteVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalPosteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un poste</Text>
              <TouchableOpacity onPress={() => setModalPosteVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {postesOptions.map((poste) => (
                <TouchableOpacity
                  key={poste.id}
                  style={[
                    styles.modalOption,
                    formData.poste === poste.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    handleInputChange("poste", poste.id);
                    setModalPosteVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      formData.poste === poste.id &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {poste.label}
                  </Text>
                  {formData.poste === poste.id && (
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    width: 30,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
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
  roleSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  roleButton: {
    width: "48%",
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  roleButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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

export default UserFormScreen;
