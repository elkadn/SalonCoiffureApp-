// screens/auth/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation du prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    } else if (formData.prenom.trim().length < 2) {
      newErrors.prenom = "Le prénom doit contenir au moins 2 caractères";
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer un email valide";
    }

    // Validation du téléphone
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est requis";
    } else if (!phoneRegex.test(formData.telephone)) {
      newErrors.telephone = "Veuillez entrer un numéro de téléphone valide (ex: 0612345678)";
    }

    // Validation du mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    } else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une majuscule et un chiffre";
    }

    // Validation de la confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert("Erreur", "Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);
    try {
      // Données utilisateur pour l'inscription
      const userData = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        telephone: formData.telephone.trim(),
        role: "client", // Toujours "client" pour les inscriptions
        pointsFidelite: 0, // Points de fidélité initiaux
        actif: true,
      };

      // Appel au service d'inscription
      const user = await registerUser(
        formData.email.trim(),
        formData.password,
        userData
      );

      // Connexion automatique après inscription
      login(user);

      Alert.alert(
        "Inscription réussie",
        `Bienvenue ${user.prenom} ${user.nom} ! Votre compte a été créé avec succès.`,
        [
          {
            text: "OK",
            onPress: () => navigation.replace("Home"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Erreur d'inscription", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const navigateToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Salon de Coiffure</Text>
          <Text style={styles.headerSubtitle}>Créer un compte</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Inscription Client</Text>

          {/* Nom */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={[styles.input, errors.nom && styles.inputError]}
              placeholder="Votre nom"
              value={formData.nom}
              onChangeText={(value) => handleInputChange("nom", value)}
              editable={!loading}
            />
            {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
          </View>

          {/* Prénom */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={[styles.input, errors.prenom && styles.inputError]}
              placeholder="Votre prénom"
              value={formData.prenom}
              onChangeText={(value) => handleInputChange("prenom", value)}
              editable={!loading}
            />
            {errors.prenom && (
              <Text style={styles.errorText}>{errors.prenom}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="exemple@email.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <TextInput
              style={[styles.input, errors.telephone && styles.inputError]}
              placeholder="0612345678"
              value={formData.telephone}
              onChangeText={(value) => handleInputChange("telephone", value)}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
            />
            {errors.telephone && (
              <Text style={styles.errorText}>{errors.telephone}</Text>
            )}
          </View>

          {/* Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Au moins 6 caractères"
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry
              editable={!loading}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
            <Text style={styles.hint}>
              Doit contenir au moins une majuscule et un chiffre
            </Text>
          </View>

          {/* Confirmation mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              placeholder="Retapez votre mot de passe"
              value={formData.confirmPassword}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
              secureTextEntry
              editable={!loading}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Bouton d'inscription */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          {/* Lien vers connexion */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>

          {/* Informations */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Informations :</Text>
            <Text style={styles.infoText}>
              • Votre compte client vous permettra de prendre rendez-vous, gérer
              vos réservations et accumuler des points de fidélité.
            </Text>
            <Text style={styles.infoText}>
              • Les champs marqués d'un * sont obligatoires.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#4CAF50",
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
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
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#F44336",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 5,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  infoBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 5,
    lineHeight: 18,
  },
});

export default RegisterScreen;