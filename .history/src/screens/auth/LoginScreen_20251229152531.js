import React, { useState, useEffect } from "react";
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
} from "react-native";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext"; // Importez useAuth

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("admin@salon.com");
  const [password, setPassword] = useState("Admin123@");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth(); // Utilisez la fonction login du contexte

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      // 1. Connexion via Firebase
      const user = await loginUser(email, password);

      // 2. Mettre à jour le contexte Auth avec les données utilisateur
      login(user);

      // 3. Vérifier le rôle et rediriger
      if (user.role === 'admin') {
        // Rediriger DIRECTEMENT vers Dashboard pour les admins
        navigation.replace("Dashboard");
      } else {
        // Pour les autres rôles, rediriger vers Home
        navigation.replace("Home");
      }
      
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Salon de Coiffure</Text>
          <Text style={styles.headerSubtitle}>Espace Administrateur</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Connexion</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Connexion..." : "Se connecter"}
            </Text>
          </TouchableOpacity>

          <View style={styles.credentialsBox}>
            <Text style={styles.credentialsTitle}>
              Identifiants par défaut :
            </Text>
            <Text style={styles.credentialsText}>Email: admin@salon.com</Text>
            <Text style={styles.credentialsText}>Mot de passe: Admin123@</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 18,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  credentialsBox: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  credentialsText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 3,
  },
});

export default LoginScreen;
