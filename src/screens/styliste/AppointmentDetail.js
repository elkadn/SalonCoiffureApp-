import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import appointmentService from '../../services/appointmentService';

const AppointmentDetail = ({ navigation, route }) => {
  const { appointmentId } = route.params;
  const { currentUser } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAppointmentDetails();
  }, [appointmentId]);

  const loadAppointmentDetails = async () => {
    try {
      setLoading(true);
      
      // Récupérer les détails du rendez-vous
      const appointmentData = await appointmentService.getAppointmentById(appointmentId);
      
      if (appointmentData) {
        setAppointment(appointmentData);
        
        // Récupérer les informations du client
        if (appointmentData.clientId) {
          const clientData = await appointmentService.getClientInfoForAppointment(appointmentData.clientId);
          setClientInfo(clientData);
        }
      } else {
        Alert.alert('Erreur', 'Rendez-vous non trouvé');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erreur chargement détail:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du rendez-vous');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  // Obtenir le numéro de téléphone (priorité aux données client puis au rendez-vous)
  const getClientPhone = () => {
    if (clientInfo?.telephone) return clientInfo.telephone;
    // Vous pourriez stocker le téléphone dans le rendez-vous aussi
    return appointment?.clientPhone || 'Non renseigné';
  };

  // Obtenir l'email du client
  const getClientEmail = () => {
    if (clientInfo?.email) return clientInfo.email;
    return 'Non renseigné';
  };

  // Formater la durée
  const formatDuration = (minutes) => {
    if (!minutes) return '30 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h${remainingMinutes.toString().padStart(2, '0')}` 
      : `${hours}h`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail Rendez-vous</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détail Rendez-vous</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="error" size={60} color="#F44336" />
          <Text style={styles.errorText}>Rendez-vous non trouvé</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail Rendez-vous</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Carte de statut */}
        <View style={styles.statusCard}>
          <Text style={styles.serviceName}>{appointment.serviceName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
          </View>
        </View>

        {/* Informations du rendez-vous */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du rendez-vous</Text>
          
          <View style={styles.infoRow}>
            <Icon name="access-time" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date et heure</Text>
              <Text style={styles.infoValue}>{formatDate(appointment.date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="schedule" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Durée</Text>
              <Text style={styles.infoValue}>{formatDuration(appointment.serviceDuration)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="attach-money" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Prix</Text>
              <Text style={styles.infoValue}>{appointment.servicePrice?.toFixed(2) || '0.00'} MAD</Text>
            </View>
          </View>

          {appointment.time && (
            <View style={styles.infoRow}>
              <Icon name="schedule" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Heure prévue</Text>
                <Text style={styles.infoValue}>{appointment.time}</Text>
              </View>
            </View>
          )}

          {appointment.dateString && (
            <View style={styles.infoRow}>
              <Icon name="event" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{appointment.dateString}</Text>
              </View>
            </View>
          )}

          {appointment.paymentStatus && (
            <View style={styles.infoRow}>
              <Icon name="payment" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Statut paiement</Text>
                <Text style={styles.infoValue}>
                  {appointment.paymentStatus === 'paid' ? 'Payé' : 
                   appointment.paymentStatus === 'pending' ? 'En attente' : 
                   appointment.paymentStatus === 'refunded' ? 'Remboursé' : 
                   appointment.paymentStatus}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Informations client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          
          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nom</Text>
              <Text style={styles.infoValue}>
                {appointment.clientName || clientInfo?.displayName || 'Non spécifié'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{getClientPhone()}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="email" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{getClientEmail()}</Text>
            </View>
          </View>

          {clientInfo?.adresse && (
            <View style={styles.infoRow}>
              <Icon name="location-on" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={styles.infoValue}>{clientInfo.adresse}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Informations styliste */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Styliste</Text>
          
          <View style={styles.infoRow}>
            <Icon name="person" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nom</Text>
              <Text style={styles.infoValue}>{appointment.stylistName || 'Non assigné'}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesContainer}>
              <Icon name="notes" size={20} color="#666" style={styles.notesIcon} />
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        {/* Informations techniques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations techniques</Text>
          
          <View style={styles.infoRow}>
            <Icon name="fingerprint" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ID Rendez-vous</Text>
              <Text style={styles.technicalValue}>{appointment.id}</Text>
            </View>
          </View>

          {appointment.serviceId && (
            <View style={styles.infoRow}>
              <Icon name="business-center" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ID Service</Text>
                <Text style={styles.technicalValue}>{appointment.serviceId}</Text>
              </View>
            </View>
          )}

          {appointment.clientId && (
            <View style={styles.infoRow}>
              <Icon name="person-pin" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ID Client</Text>
                <Text style={styles.technicalValue}>{appointment.clientId}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          {/* Vous pouvez ajouter des boutons d'action ici si besoin
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Marquer comme terminé</Text>
          </TouchableOpacity>
          */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  technicalValue: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  notesContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notesIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  actionsContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppointmentDetail;