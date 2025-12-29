// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
// } from "react-native";
// import { loginUser } from "../../services/authService";
// import { useAuth } from "../../context/AuthContext";

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { login } = useAuth();

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert("Erreur", "Veuillez remplir tous les champs");
//       return;
//     }

//     setLoading(true);
//     try {
//       // 1. Connexion via Firebase
//       const user = await loginUser(email, password);

//       // 2. Mettre à jour le contexte Auth avec les données utilisateur
//       login(user);

//       // 3. Rediriger selon le rôle
//       switch (user.role) {
//         case "admin":
//           navigation.replace("Dashboard");
//           break;
//         case "stylist":
//           navigation.replace("StylistDashboard");
//           break;
//         case "client":
//           navigation.replace("Home");
//           break;
//         default:
//           navigation.replace("Home");
//       }
//     } catch (error) {
//       Alert.alert("Erreur", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const navigateToRegister = () => {
//     navigation.navigate("Register");
//   };

//   const navigateToForgotPassword = () => {
//     navigation.navigate("ForgotPassword");
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Salon de Coiffure</Text>
//           <Text style={styles.headerSubtitle}>Connexion</Text>
//         </View>

//         <View style={styles.formContainer}>
//           <Text style={styles.formTitle}>Connectez-vous</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             value={email}
//             onChangeText={setEmail}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             editable={!loading}
//           />

//           <TextInput
//             style={styles.input}
//             placeholder="Mot de passe"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry
//             editable={!loading}
//           />

//           <TouchableOpacity
//             style={styles.forgotPassword}
//             onPress={navigateToForgotPassword}
//           >
//             <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.button, loading && styles.buttonDisabled]}
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? "Connexion..." : "Se connecter"}
//             </Text>
//           </TouchableOpacity>

//           <View style={styles.registerContainer}>
//             <Text style={styles.registerText}>
//               Vous n'avez pas de compte ?{" "}
//             </Text>
//             <TouchableOpacity onPress={navigateToRegister}>
//               <Text style={styles.registerLink}>S'inscrire</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: "center",
//     padding: 20,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 40,
//   },
//   headerTitle: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   headerSubtitle: {
//     fontSize: 18,
//     color: "#4CAF50",
//     marginTop: 5,
//   },
//   formContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 15,
//     padding: 25,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   formTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 25,
//     textAlign: "center",
//   },
//   input: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     fontSize: 16,
//   },
//   forgotPassword: {
//     alignSelf: "flex-end",
//     marginBottom: 20,
//   },
//   forgotPasswordText: {
//     color: "#4CAF50",
//     fontSize: 14,
//   },
//   button: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   buttonDisabled: {
//     backgroundColor: "#a5d6a7",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   registerContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   registerText: {
//     color: "#666",
//     fontSize: 14,
//   },
//   registerLink: {
//     color: "#4CAF50",
//     fontSize: 14,
//     fontWeight: "bold",
//     marginLeft: 5,
//   },
//   demoCredentials: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: "#F5F5F5",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#E0E0E0",
//   },
//   demoTitle: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   demoRole: {
//     marginBottom: 15,
//     padding: 10,
//     backgroundColor: "#fff",
//     borderRadius: 6,
//   },
//   demoRoleTitle: {
//     fontSize: 13,
//     fontWeight: "bold",
//     color: "#4CAF50",
//     marginBottom: 5,
//   },
//   demoText: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 2,
//   },
// });

// export default LoginScreen;


// screens/auth/LoginScreen.js - VERSION GOOGLE
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { loginWithGoogle } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      
      // Rediriger selon le rôle
      switch (user.role) {
        case "admin":
          navigation.replace("Dashboard");
          break;
        case "stylist":
          navigation.replace("StylistDashboard");
          break;
        default:
          navigation.replace("Home");
      }
    } catch (error) {
      if (error.message !== 'Connexion annulée') {
        Alert.alert("Erreur", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Salon de Coiffure</Text>
        <Text style={styles.headerSubtitle}>Bienvenue</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💇‍♀️</Text>
        </View>

        <Text style={styles.welcomeText}>
          Connectez-vous pour prendre rendez-vous, gérer vos préférences et bénéficier de nos offres exclusives.
        </Text>

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Image
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>
                Continuer avec Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Pourquoi Google ?</Text>
          <Text style={styles.infoText}>
            • Connexion en 1 clic{"\n"}
            • Pas de mot de passe à retenir{"\n"}
            • Plus sécurisé{"\n"}
            • Email vérifié automatiquement
          </Text>
        </View>

        <Text style={styles.privacyText}>
          En vous connectant, vous acceptez nos{" "}
          <Text style={styles.link}>Conditions d'utilisation</Text> et notre{" "}
          <Text style={styles.link}>Politique de confidentialité</Text>.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
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
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 60,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  buttonDisabled: {
    backgroundColor: "#90CAF9",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  privacyText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});

export default LoginScreen;