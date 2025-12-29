import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { onAuthStateChange } from '../../services/authService';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Vérifier l'état d'authentification
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // Vérifier si c'est un admin
        // On naviguera vers le dashboard après vérification dans Login
        navigation.replace('Login');
      } else {
        navigation.replace('Login');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salon de Coiffure</Text>
      <Text style={styles.subtitle}>Administration</Text>
      <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40
  },
  loader: {
    marginTop: 20
  }
});

export default SplashScreen;