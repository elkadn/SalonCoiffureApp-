import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { addUser, getUserById, updateUser } from '../../services/userService';

const UserForm = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const isEditing = !!userId;
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'client',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const user = await getUserById(userId);
      if (user) {
        setFormData({
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          telephone: user.telephone || '',
          role: user.role || 'client',
          password: '' // Ne pas charger le mot de passe
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom || !formData.email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }
    
    if (!isEditing && !formData.password) {
      Alert.alert('Erreur', 'Le mot de passe est requis pour un nouvel utilisateur');
      return false;
    }
    
    if (formData.password && formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing) {
        // Mise à jour - ne pas envoyer le mot de passe s'il est vide
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        
        await updateUser(userId, dataToUpdate);
        Alert.alert('Succès', 'Utilisateur mis à jour');
      } else {
        // Création
        await addUser(formData);
        Alert.alert('Succès', 'Utilisateur créé');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isEditing ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nom *</Text>
        <TextInput
          style={styles.input}
          value={formData.nom}
          onChangeText={(value) => handleInputChange('nom', value)}
          placeholder="Entrez le nom"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Prénom *</Text>
        <TextInput
          style={styles.input}
          value={formData.prenom}
          onChangeText={(value) => handleInputChange('prenom', value)}
          placeholder="Entrez le prénom"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="email@exemple.com"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isEditing}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={formData.telephone}
          onChangeText={(value) => handleInputChange('telephone', value)}
          placeholder="06XXXXXXXX"
          keyboardType="phone-pad"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Rôle</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.role}
            style={styles.picker}
            onValueChange={(value) => handleInputChange('role', value)}
          >
            <Picker.Item label="Administrateur" value="admin" />
            <Picker.Item label="Coiffeur" value="coiffeur" />
            <Picker.Item label="Client" value="client" />
          </Picker>
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          {isEditing ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
        </Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          placeholder="********"
          secureTextEntry
        />
      </View>
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {isEditing ? 'Mettre à jour' : 'Créer l\'utilisateur'}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333'
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  picker: {
    height: 50
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default UserForm;