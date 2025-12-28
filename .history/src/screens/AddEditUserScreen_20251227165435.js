// src/screens/AddEditUserScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addUser, updateUser } from '../services/userService';

export default function AddEditUserScreen({ route, navigation }) {
  const { user } = route.params || {};
  const isEditMode = !!user;

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'client',
    adresse: '',
    dateNaissance: '',
    pointsFidelite: '0'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        role: user.role || 'client',
        adresse: user.adresse || '',
        dateNaissance: user.dateNaissance || '',
        pointsFidelite: user.pointsFidelite?.toString() || '0'
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nom || !formData.prenom || !formData.email || !formData.telephone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.telephone.replace(/\s/g, ''))) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide (10 chiffres)');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        ...formData,
        pointsFidelite: parseInt(formData.pointsFidelite) || 0
      };

      if (isEditMode) {
        await updateUser(user.id, userData);
        Alert.alert('Succès', 'Utilisateur modifié avec succès', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        const result = await addUser(userData);
        Alert.alert(
          'Succès',
          `Utilisateur créé avec succès\n\nMot de passe généré : ${result.password}`,
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'client', label: 'Client' },
    { value: 'coiffeur', label: 'Coiffeur' },
    { value: 'admin', label: 'Administrateur' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={formData.nom}
              onChangeText={(value) => handleChange('nom', value)}
              placeholder="Entrez le nom"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              value={formData.prenom}
              onChangeText={(value) => handleChange('prenom', value)}
              placeholder="Entrez le prénom"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="email@exemple.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isEditMode}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              value={formData.telephone}
              onChangeText={(value) => handleChange('telephone', value)}
              placeholder="0612345678"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Rôle</Text>
            <View style={styles.roleContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    formData.role === role.value && styles.roleButtonSelected
                  ]}
                  onPress={() => handleChange('role', role.value)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === role.value && styles.roleButtonTextSelected
                  ]}>
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.adresse}
              onChangeText={(value) => handleChange('adresse', value)}
              placeholder="Entrez l'adresse"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de naissance</Text>
            <TextInput
              style={styles.input}
              value={formData.dateNaissance}
              onChangeText={(value) => handleChange('dateNaissance', value)}
              placeholder="JJ/MM/AAAA"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Points de fidélité</Text>
            <TextInput
              style={styles.input}
              value={formData.pointsFidelite}
              onChangeText={(value) => handleChange('pointsFidelite', value.replace(/[^0-9]/g, ''))}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'En cours...' : isEditMode ? 'Modifier' : 'Créer'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: '#6d4c41',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  roleButtonTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#6d4c41',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});