import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  StyleSheet
} from 'react-native';

export default function TestScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [text, setText] = useState('');
  
  // Test 1: Switch (problème commun boolean/string)
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  
  // Test 2: Bouton simple
  const handlePress = () => Alert.alert('Test', 'Bouton fonctionnel');
  
  // Test 3: Input
  const handleInput = (value) => setText(value);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test de Composants</Text>
      
      {/* Test Switch */}
      <View style={styles.testItem}>
        <Text>Switch (boolean test):</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled} // ⚠️ C'est souvent ici le problème
        />
        <Text>État: {isEnabled.toString()}</Text>
      </View>
      
      {/* Test TextInput */}
      <View style={styles.testItem}>
        <Text>TextInput:</Text>
        <TextInput
          style={styles.input}
          onChangeText={handleInput}
          value={text}
          placeholder="Tapez quelque chose..."
        />
      </View>
      
      {/* Test Bouton */}
      <View style={styles.testItem}>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Tester l'alerte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center'
  },
  testItem: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 10
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});