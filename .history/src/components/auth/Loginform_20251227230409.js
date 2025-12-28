import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { loginUser, createDefaultAdmin, testAdminConnection } from '../../services/authService';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@salon.com'); // Pré-rempli pour test
  const [password, setPassword] = useState('Admin123@'); // Pré-rempli pour test
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    initializeAdmin();
  }, []);

  const initializeAdmin = async () => {
    try {
      console.log('🚀 Initialisation application...');
      await createDefaultAdmin();
      console.log('✅ Initialisation terminée');
    } catch (error) {
      console.log('ℹ️ Initialisation note:', error.message);
    } finally {
      setInitLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);
      
      if (user) {
        console.log('✅ Connexion réussie pour:', user.email);
        console.log('👤 Rôle:', user.role);
        
        if (user.role === 'admin') {
          onLoginSuccess(user);
        } else {
          Alert.alert(
            'Accès refusé', 
            'Seuls les administrateurs peuvent accéder à cette application. Votre rôle: ' + user.role
          );
        }
      }
    } catch (error) {
      Alert.alert('Erreur de connexion', error.message || 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const success = await testAdminConnection();
      Alert.alert(
        'Test de connexion',
        success ? '✅ Connexion test réussie !' : '❌ Échec du test de connexion'
      );
    } catch (error) {
      Alert.alert('Erreur test', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      await createDefaultAdmin();
      Alert.alert(
        'Création admin',
        '✅ Admin créé avec succès !\nEmail: admin@salon.com\nMot de passe: Admin123@'
      );
    } catch (error) {
      Alert.alert(
        'Création admin',
        error.code === 'auth/email-already-in-use' 
          ? '✅ Admin existe déjà' 
          : '❌ Erreur: ' + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Initialisation...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Salon de Coiffure - Admin</Text>
      <Text style={styles.subtitle}>Connexion Administrateur</Text>
      
      <View style={styles.formCard}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="admin@salon.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Admin123@"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Identifiants par défaut :</Text>
        <Text style={styles.infoText}>Email: admin@salon.com</Text>
        <Text style={styles.infoText}>Mot de passe: Admin123@</Text>
      </View>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleTestConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Tester connexion</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={handleCreateAdmin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Créer/Réinitialiser Admin</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instructions :</Text>
        <Text style={styles.instruction}>1. Cliquez sur "Créer/Réinitialiser Admin"</Text>
        <Text style={styles.instruction}>2. Utilisez les identifiants par défaut</Text>
        <Text style={styles.instruction}>3. Cliquez sur "Se connecter"</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333'
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666'
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    marginTop: 15
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  primaryButton: {
    backgroundColor: '#4CAF50'
  },
  secondaryButton: {
    backgroundColor: '#2196F3'
  },
  warningButton: {
    backgroundColor: '#FF9800'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3'
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1565C0'
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  instructions: {
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107'
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF8F00'
  },
  instruction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    marginLeft: 10
  }
});

export default LoginForm;