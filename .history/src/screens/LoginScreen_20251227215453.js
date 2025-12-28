import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createDefaultAdmin } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  useEffect(() => {
    // Créer l'admin par défaut au démarrage
    createDefaultAdmin();
  }, []);

  const handleLoginSuccess = (user) => {
    navigation.replace('Dashboard', { user });
  };

  return (
    <View style={styles.container}>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  }
});

export default LoginScreen;