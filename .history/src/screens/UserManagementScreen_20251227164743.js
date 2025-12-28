// src/screens/UserManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUsers, deleteUser, toggleUserStatus } from '../services/userService';

export default function UserManagementScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchText, users]);

  // src/screens/UserManagementScreen.js - AJOUTE CES LOGS
const loadUsers = async () => {
  try {
    console.log("🚀 Début de loadUsers");
    const usersList = await getUsers();
    console.log("✅ Données brutes reçues:", usersList);
    
    // Vérifie chaque utilisateur
    usersList.forEach((user, index) => {
      console.log(`👤 Utilisateur ${index + 1}:`, {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        actif: user.actif,
        typeActif: typeof user.actif,
        actifValeur: user.actif,
        actifString: String(user.actif)
      });
      
      // Teste le casting
      try {
        const testBoolean = Boolean(user.actif);
        console.log(`✅ Cast réussi pour ${user.prenom}: ${testBoolean}`);
      } catch (error) {
        console.log(`❌ ERREUR CAST pour ${user.prenom}:`, error);
      }
    });
    
    setUsers(usersList);
    console.log("✅ Users mis à jour dans le state");
  } catch (error) {
    console.error("🔥 ERREUR COMPLÈTE dans loadUsers:", error);
    Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
  }
};

  const filterUsers = () => {
    if (!searchText) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user =>
      user.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.telephone?.includes(searchText)
    );
    
    setFilteredUsers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(selectedUser.id);
      setDeleteModalVisible(false);
      loadUsers();
      Alert.alert('Succès', 'Utilisateur supprimé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await toggleUserStatus(user.id, user.actif);
      loadUsers();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de changer le statut');
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.prenom} {item.nom}
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userPhone}>{item.telephone}</Text>
        <View style={styles.userMeta}>
          <Text style={[styles.badge, styles[`role${item.role}`]]}>
            {item.role}
          </Text>
          <Text style={[styles.status, item.actif ? styles.active : styles.inactive]}>
            {item.actif ? 'Actif' : 'Inactif'}
          </Text>
          {item.pointsFidelite > 0 && (
            <Text style={styles.points}>⭐ {item.pointsFidelite} pts</Text>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddEditUser', { user: item })}
        >
          <Ionicons name="create-outline" size={22} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleToggleStatus(item)}
        >
          <Ionicons 
            name={item.actif ? "eye-off-outline" : "eye-outline"} 
            size={22} 
            color="#FF9800" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteUser(item)}
        >
          <Ionicons name="trash-outline" size={22} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Utilisateurs</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEditUser')}
        >
          <Ionicons name="add-circle" size={32} color="#6d4c41" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
            </Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la suppression</Text>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur {' '}
              {selectedUser?.prenom} {selectedUser?.nom} ?
            </Text>
            <Text style={styles.warningText}>
              Cette action est irréversible !
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  addButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  roleclient: {
    backgroundColor: '#4CAF50',
  },
  roleadmin: {
    backgroundColor: '#2196F3',
  },
  rolecoiffeur: {
    backgroundColor: '#FF9800',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  active: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  inactive: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  points: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});