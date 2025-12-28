import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase/firebaseConfig';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginForm from './src/components/Auth/LoginForm';
import DebugScreen from './src/screens/DebugScreen';

const App = () => {
  // Temporairement, affichez DebugScreen pour vérifier
  return (
    <View style={styles.container}>
      {/* Pour test, commentez/décommentez */}
      <LoginForm onLoginSuccess={(user) => console.log('Login success:', user)} />
      {/* <DebugScreen /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  }
});

export default App;
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});