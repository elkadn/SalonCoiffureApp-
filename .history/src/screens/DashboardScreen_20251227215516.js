import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { logoutUser } from '../services/authService';

const DashboardScreen = ({ navigation, route }) => {
  const { user } = route.params || {};

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      title: '👥 Gestion Utilisateurs',
      description: 'Ajouter, modifier, supprimer des utilisateurs',
      screen: 'UserManagement',
      color: '#4CAF50'
    },
    {
      title: '💇 Gestion Coiffeurs',
      description: 'Gérer les coiffeurs et leurs spécialités',
      screen: 'Coiffeurs',
      color: '#2196F3'
    },
    {
      title: '📅 Réservations',
      description: 'Voir et gérer les rendez-vous',
      screen: 'Reservations',
      color: '#FF9800'
    },
    {
      title: '💰 Gestion Financière',
      description: 'Suivi des revenus et dépenses',
      screen: 'Finance',
      color: '#9C27B0'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bienvenue,</Text>
          <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
          <Text style={styles.userRole}>{user?.role === 'admin' ? 'Administrateur' : user?.role}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Tableau de bord</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Clients actifs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Coiffeurs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Réservations/mois</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Gestion</Text>
        
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  welcomeText: {
    fontSize: 14,
    color: '#666'
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  userRole: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2
  },
  logoutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  menuCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    flex: 2,
    marginHorizontal: 10
  },
  menuArrow: {
    fontSize: 20,
    color: '#666'
  }
});

export default DashboardScreen;