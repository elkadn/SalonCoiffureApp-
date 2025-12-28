import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';

// Configuration Firebase minimale sans auth pour test
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC0r5HUgGVp1JyRGBcf24_a9qbokijtTRM",
  authDomain: "saloncoiffureapp.firebaseapp.com",
  projectId: "saloncoiffureapp",
  storageBucket: "saloncoiffureapp.firebasestorage.app",
  messagingSenderId: "928948250472",
  appId: "1:928948250472:web:cf3a2464ebcd21a4fe18dd",
  measurementId: "G-FFBBN3CTQE"
};

export default function App() {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [appName, setAppName] = useState('');

  useEffect(() => {
    initializeFirebase();
  }, []);

  const initializeFirebase = async () => {
    try {
      console.log("Tentative d'initialisation Firebase...");
      
      // Initialiser Firebase sans autres services
      const app = initializeApp(firebaseConfig);
      
      console.log("Firebase initialisé avec succès!");
      console.log("Nom de l'app:", app.name);
      
      setAppName(app.name);
      setFirebaseInitialized(true);
      setError(null);
      
    } catch (err) {
      console.error("Erreur d'initialisation Firebase:", err);
      console.error("Message d'erreur:", err.message);
      console.error("Stack trace:", err.stack);
      
      setError(err.message);
      setFirebaseInitialized(false);
    }
  };

  if (!firebaseInitialized && !error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.text}>Initialisation de Firebase...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        {error ? (
          <>
            <Text style={styles.errorTitle}>Erreur Firebase</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.instructions}>
              Vérifiez votre configuration Firebase
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.successTitle}>✅ Firebase Initialisé!</Text>
            <Text style={styles.text}>Nom de l'application: {appName}</Text>
            <Text style={styles.text}>Projet: saloncoiffureapp</Text>
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                La connexion à Firebase fonctionne correctement
              </Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
  },
  successBox: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  successText: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
});