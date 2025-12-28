// src/screens/AdminDashboard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logoutAdmin } from '../services/authService';

export default function AdminDashboard({ navigation }) {
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutAdmin();
            } catch (error) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      title: 'Gestion des Utilisateurs',
      description: 'Ajouter, modifier, supprimer des utilisateurs',
      icon: 'people',
      screen: 'UserManagement',
      color: '#4CAF50'
    },
    {
      title: 'Gestion des Rendez-vous',
      description: 'Voir et gérer les rendez-vous',
      icon: 'calendar',
      screen: 'Appointments',
      color: '#2196F3'
    },
    {
      title: 'Services & Prix',
      description: 'Gérer les services et tarifs',
      icon: 'cut',
      screen: 'Services',
      color: '#FF9800'
    },
    {
      title: 'Statistiques',
      description: 'Voir les statistiques du salon',
      icon: 'stats-chart',
      screen: 'Statistics',
      color: '#9C27B0'
    },
    {
      title: 'Promotions',
      description: 'Gérer les offres spéciales',
      icon: 'pricetag',
      screen: 'Promotions',
      color: '#F44336'
    },
    {
      title: 'Paramètres',
      description: 'Configurer les paramètres du salon',
      icon: 'settings',
      screen: 'Settings',
      color: '#607D8B'
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tableau de Bord Admin</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>152</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>RDV Aujourd'hui</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>€1,850</Text>
            <Text style={styles.statLabel}>Revenus</Text>
          </View>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={28} color="#fff" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6d4c41',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  menuGrid: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
});