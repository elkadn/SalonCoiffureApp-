import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import { getUserById, createUser, updateUser } from '../';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserFormScreen = ({ navigation, route }) => {
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
          password: ''
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
    if (!formData.nom || !formData.prenom) {
      Alert.alert('Erreur', 'Le nom et prénom sont requis');
      return false;
    }
    
    if (!isEditing && (!formData.email || !formData.password)) {
      Alert.alert('Erreur', 'L\'email et le mot de passe sont requis pour un nouvel utilisateur');
      return false;
    }
    
    if (formData.password && formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Erreur', 'Format d\'email invalide');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await updateUser(userId, formData);
        Alert.alert('Succès', 'Utilisateur mis à jour');
      } else {
        await createUser(formData);
        Alert.alert('Succès', 'Utilisateur créé');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, field, placeholder, options = {}) => (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label} {options.required && '*'}
      </Text>
      <TextInput
        style={[styles.input, options.multiline && styles.multilineInput]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        editable={options.editable !== false}
        secureTextEntry={field === 'password'}
        multiline={options.multiline}
        numberOfLines={options.multiline ? 3 : 1}
        keyboardType={options.keyboardType}
      />
    </View>
  );

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          {renderField('Nom', 'nom', 'Entrez le nom', { required: true })}
          {renderField('Prénom', 'prenom', 'Entrez le prénom', { required: true })}
          {renderField('Email', 'email', 'email@exemple.com', { 
            required: !isEditing,
            editable: !isEditing,
            keyboardType: 'email-address'
          })}
          {renderField('Téléphone', 'telephone', '06XXXXXXXX', { keyboardType: 'phone-pad' })}
          
          {!isEditing && renderField('Mot de passe', 'password', '********', { 
            required: true 
          })}
          
          {/* Sélecteur de rôle */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Rôle *</Text>
            <View style={styles.roleSelector}>
              {['admin', 'coiffeur', 'client'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    formData.role === role && styles.roleButtonActive
                  ]}
                  onPress={() => handleInputChange('role', role)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.role === role && styles.roleButtonTextActive
                  ]}>
                    {role === 'admin' && '👑 Administrateur'}
                    {role === 'coiffeur' && '💇 Coiffeur'}
                    {role === 'client' && '👤 Client'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
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
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  backButton: {
    padding: 5
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  headerRight: {
    width: 30
  },
  content: {
    flex: 1
  },
  formContainer: {
    padding: 20
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
    borderColor: '#ddd',
    fontSize: 16
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top'
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  roleButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50'
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  },
  roleButtonTextActive: {
    color: '#fff'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  submitButtonDisabled: {
    backgroundColor: '#a5d6a7'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default UserFormScreen;