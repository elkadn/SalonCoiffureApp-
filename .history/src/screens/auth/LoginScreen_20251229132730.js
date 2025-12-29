// import React, { useEffect } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { createDefaultAdmin } from '../services/authService';
// import LoginForm from '../components/Auth/LoginForm';

// const LoginScreen = ({ navigation }) => {
//   useEffect(() => {
//     // Créer l'admin par défaut au démarrage
//     createDefaultAdmin();
//   }, []);

//   const handleLoginSuccess = (user) => {
//     navigation.replace('Dashboard', { user });
//   };

//   return (
//     <View style={styles.container}>
//       <LoginForm />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5'
//   }
// });

// export default LoginScreen;

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
import { loginUser, initializeAdmin } from "../../services/authService";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("admin@salon.com");
  const [password, setPassword] = useState("Admin123@");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initializeAdmin();
    } catch (error) {
      console.log("Initialisation:", error.message);
    } finally {
      setInitializing(false);
    }
  };

  // const handleLogin = async () => {
  //   if (!email || !password) {
  //     Alert.alert('Erreur', 'Veuillez remplir tous les champs');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const user = await loginUser(email, password);

  //     // Si login réussi, naviguer vers le dashboard
  //     navigation.replace('Dashboard', { user });
  //   } catch (error) {
  //     Alert.alert('Erreur', error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Dans LoginScreen.js, modifiez la fonction handleLogin :
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      // Utilisez votre service d'authentification
      const user = await loginUser(email, password);

      // Mettez à jour le contexte Auth
      login(user); // Cette fonction devrait être dans votre AuthContext

      // La navigation se fera automatiquement via le Drawer
      // car le Drawer détectera que l'utilisateur est connecté
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initialisation...</Text>
      </View>
    );
  }

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
