

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
