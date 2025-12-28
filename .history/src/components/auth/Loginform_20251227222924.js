import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { loginUser, createDefaultAdmin } from "../../services/authService";

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);

      if (user && user.role === "admin") {
        onLoginSuccess(user);
      } else {
        Alert.alert(
          "Accès refusé",
          "Seuls les administrateurs peuvent accéder"
        );
      }
    } catch (error) {
      Alert.alert("Erreur", error.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      await createDefaultAdmin();
      Alert.alert(
        "Succès",
        "Admin créé avec email: admin@salon.com / mot de passe: Admin123@"
      );
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    // <View style={styles.container}>
    //   <Text style={styles.title}>Connexion Admin</Text>

    //   <TextInput
    //     secureTextEntry={true}
    //     style={styles.input}
    //     placeholder="Email"
    //     value={email}
    //     onChangeText={setEmail}
    //     keyboardType="email-address"
    //     autoCapitalize="none"
    //   />

    //   <TextInput
    //     style={styles.input}
    //     placeholder="Mot de passe"
    //     value={password}
    //     onChangeText={setPassword}
    //     secureTextEntry
    //   />

    //   <TouchableOpacity
    //     style={styles.button}
    //     onPress={handleLogin}
    //     disabled={loading}
    //   >
    //     {loading ? (
    //       <ActivityIndicator color="#fff" />
    //     ) : (
    //       <Text style={styles.buttonText}>Se connecter</Text>
    //     )}
    //   </TouchableOpacity>

    //   <TouchableOpacity
    //     style={[styles.button, styles.secondaryButton]}
    //     onPress={handleCreateAdmin}
    //     disabled={loading}
    //   >
    //     <Text style={styles.secondaryButtonText}>Créer Admin par défaut</Text>
    //   </TouchableOpacity>
    // </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#2196F3",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LoginForm;
