import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { addUser, getUserById, updateUser } from "../../services/userService";

const UserForm = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const isEditing = !!userId;

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "client",
    password: "",
    pointsFidelite: "0", // Pour client
    experience: "", // Pour styliste
    poste: "", // Pour assistante
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

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
          password: "", // Ne pas charger le mot de passe
          pointsFidelite: user.pointsFidelite ? user.pointsFidelite.toString() : "0",
          experience: user.experience ? user.experience.toString() : "",
          poste: user.poste || "",
        });
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    // Validation des champs communs
    if (!formData.nom || !formData.prenom || !formData.email) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return false;
    }

    // Validation pour nouvelle création
    if (!isEditing && !formData.password) {
      Alert.alert(
        "Erreur",
        "Le mot de passe est requis pour un nouvel utilisateur"
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

    // Validation spécifique selon le rôle
    if (formData.role === "styliste" && !formData.experience) {
      Alert.alert("Erreur", "Le nombre d'années d'expérience est requis pour un styliste");
      return false;
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
      // Préparer les données selon le rôle
      let dataToSend = { 
        ...formData,
        pointsFidelite: formData.role === "client" ? parseInt(formData.pointsFidelite) || 0 : undefined,
        experience: formData.role === "styliste" ? parseInt(formData.experience) || 0 : undefined,
        poste: formData.role === "assistante" ? formData.poste : undefined,
      };

      // Nettoyer les données (retirer les champs non utilisés selon le rôle)
      if (formData.role !== "client") delete dataToSend.pointsFidelite;
      if (formData.role !== "styliste") delete dataToSend.experience;
      if (formData.role !== "assistante") delete dataToSend.poste;

      if (isEditing) {
        // Mise à jour - ne pas envoyer le mot de passe s'il est vide
        if (!dataToSend.password) {
          delete dataToSend.password;
        }

        await updateUser(userId, dataToSend);
        Alert.alert("Succès", "Utilisateur mis à jour");
      } else {
        // Création
        await addUser(dataToSend);
        Alert.alert("Succès", "Utilisateur créé");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const renderAdditionalFields = () => {
    switch (formData.role) {
      case "client":
        return (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Points de fidélité *</Text>
            <TextInput
              style={styles.input}
              value={formData.pointsFidelite}
              onChangeText={(value) => handleInputChange("pointsFidelite", value)}
              placeholder="0"
              keyboardType="numeric"
              editable={isEditing} // Permettre la modification si édition
            />
            <Text style={styles.helperText}>
              Pour un nouveau client, les points seront initialisés à 0
            </Text>
          </View>
        );

      case "styliste":
        return (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Années d'expérience *</Text>
            <TextInput
              style={styles.input}
              value={formData.experience}
              onChangeText={(value) => handleInputChange("experience", value)}
              placeholder="Nombre d'années d'expérience"
              keyboardType="numeric"
            />
          </View>
        );

      case "assistante":
        return (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Poste *</Text>
            <TextInput
              style={styles.input}
              value={formData.poste}
              onChangeText={(value) => handleInputChange("poste", value)}
              placeholder="Ex: Assistante senior, Stagiaire..."
            />
          </View>
        );

      case "admin":
        // Administrateur n'a pas de champs supplémentaires
        return null;

      default:
        return null;
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isEditing ? "Modifier Utilisateur" : "Ajouter Utilisateur"}
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nom *</Text>
        <TextInput
          style={styles.input}
          value={formData.nom}
          onChangeText={(value) => handleInputChange("nom", value)}
          placeholder="Entrez le nommmmm"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Prénom *</Text>
        <TextInput
          style={styles.input}
          value={formData.prenom}
          onChangeText={(value) => handleInputChange("prenom", value)}
          placeholder="Entrez le prénom"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange("email", value)}
          placeholder="email@exemple.com"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isEditing}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={formData.telephone}
          onChangeText={(value) => handleInputChange("telephone", value)}
          placeholder="06XXXXXXXX"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Rôle *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.role}
            onValueChange={(value) => handleInputChange("role", value)}
          >
            <Picker.Item label="Administrateur" value="admin" />
            <Picker.Item label="Styliste" value="styliste" />
            <Picker.Item label="Assistante" value="assistante" />
            <Picker.Item label="Client" value="client" />
          </Picker>
        </View>
      </View>

      {/* Champs supplémentaires selon le rôle */}
      {renderAdditionalFields()}

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {isEditing
            ? "Nouveau mot de passe (laisser vide pour ne pas changer)"
            : "Mot de passe *"}
        </Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleInputChange("password", value)}
          placeholder="********"
          secureTextEntry={true}
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
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

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
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
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#9E9E9E",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserForm;