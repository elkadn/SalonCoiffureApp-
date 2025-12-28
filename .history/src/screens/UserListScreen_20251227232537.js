import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl
} from 'react-native';
import { getAllUsers, deleteUser, searchUsers } from '../../../services/userService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText, selectedRole]);

  const loadUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtrer par recherche
    if (searchText) {
      filtered = filtered.filter(user =>
        user.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.prenom?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtrer par rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Confirmer la suppression',
      `Désactiver l'utilisateur ${userName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              loadUsers();
              Alert.alert('Succès', 'Utilisateur désactivé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de désactiver l\'utilisateur');
            }
          }
        }
      ]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#FF5252';
      case 'coiffeur': return '#2196F3';
      case 'client': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.prenom?.[0]}{item.nom?.[0]}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {item.prenom} {item.nom}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>
        
        <View style={styles.userMeta}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
          {item.telephone && (
            <Text style={styles.userPhone}>{item.telephone}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('UserForm', { userId: item.id })}
        >
          <Icon name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteUser(item.id, `${item.prenom} ${item.nom}`)}
        >
          <Icon name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people" size={80} color="#e0e0e0" />
      <Text style={styles.emptyStateText}>Aucun utilisateur trouvé</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Utilisateurs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('UserForm', { userId: null })}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un utilisateur..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <View style={styles.roleFilter}>
          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'all' && styles.roleButtonActive]}
            onPress={() => setSelectedRole('all')}
          >
            <Text style={[styles.roleButtonText, selectedRole === 'all' && styles.roleButtonTextActive]}>
              Tous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'admin' && styles.roleButtonActive]}
            onPress={() => setSelectedRole('admin')}
          >
            <Text style={[styles.roleButtonText, selectedRole === 'admin' && styles.roleButtonTextActive]}>
              Admins
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'coiffeur' && styles.roleButtonActive]}
            onPress={() => setSelectedRole('coiffeur')}
          >
            <Text style={[styles.roleButtonText, selectedRole === 'coiffeur' && styles.roleButtonTextActive]}>
              Coiffeurs
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.roleButton, selectedRole === 'client' && styles.roleButtonActive]}
            onPress={() => setSelectedRole('client')}
          >
            <Text style={[styles.roleButtonText, selectedRole === 'client' && styles.roleButtonTextActive]}>
              Clients
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16
  },
  roleFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f5f5f5'
  },
  roleButtonActive: {
    backgroundColor: '#4CAF50'
  },
  roleButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  roleButtonTextActive: {
    color: '#fff'
  },
  listContent: {
    padding: 15
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  userInfo: {
    flex: 1
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  userEmail: {
    fontSize: 12,
    color: '#666'
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  userPhone: {
    fontSize: 12,
    color: '#666'
  },
  actions: {
    flexDirection: 'row'
  },
  actionButton: {
    padding: 8,
    marginLeft: 5
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyStateText: {
    marginTop: 20,
    fontSize: 16,
    color: '#999'
  }
});

export default UserListScreen;