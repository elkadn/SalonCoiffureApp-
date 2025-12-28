import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { getAllUsers, deleteUser } from '../../services/userService';

const UserList = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous désactiver l'utilisateur ${userName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              fetchUsers();
              Alert.alert('Succès', 'Utilisateur désactivé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de désactiver l\'utilisateur');
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.prenom} {item.nom}
        </Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userDetails}>
          <Text style={[styles.userRole, getRoleStyle(item.role)]}>
            {item.role}
          </Text>
          <Text style={styles.userPhone}>{item.telephone}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditUser', { userId: item.id })}
        >
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item.id, `${item.prenom} ${item.nom}`)}
        >
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin':
        return styles.roleAdmin;
      case 'coiffeur':
        return styles.roleCoiffeur;
      case 'client':
        return styles.roleClient;
      default:
        return styles.roleDefault;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion des Utilisateurs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddUser')}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  listContent: {
    padding: 10
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  userInfo: {
    marginBottom: 10
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userRole: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden'
  },
  roleAdmin: {
    backgroundColor: '#FF5252',
    color: '#fff'
  },
  roleCoiffeur: {
    backgroundColor: '#2196F3',
    color: '#fff'
  },
  roleClient: {
    backgroundColor: '#4CAF50',
    color: '#fff'
  },
  roleDefault: {
    backgroundColor: '#9E9E9E',
    color: '#fff'
  },
  userPhone: {
    fontSize: 12,
    color: '#666'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10
  },
  editButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 4,
    marginRight: 10
  },
  editButtonText: {
    color: '#333',
    fontSize: 12
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 4
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12
  }
});

export default UserList;