

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import RegisterScreen from './src/screens/RegisterScreen'; // importer ton écran

export default function App() {
  return (
    <View style={styles.container}>
      <RegisterScreen />  {/* afficher l'écran d'inscription */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
