import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import appointmentService from '../../services/appointmentService';
import { format, isToday, isFuture, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

const StylistAppointments = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('today'); 

  const loadAppointments = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const data = await appointmentService.getStylistAppointments(currentUser.uid);
      setAppointments(data);
      applyFilter(data, filter);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
      Alert.alert('Erreur', 'Impossible de charger les rendez-vous');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (data, filterType) => {
    const now = new Date();
    
    switch (filterType) {
      case 'today':
        const filteredToday = data.filter(app => {
          try {
            const appDate = app.date?.toDate() || new Date();
            return isToday(appDate) && app.status !== 'cancelled';
          } catch (error) {
            return false;
          }
        });
        setFilteredAppointments(filteredToday.sort((a, b) => {
          const dateA = a.date?.toDate() || new Date(0);
          const dateB = b.date?.toDate() || new Date(0);
          return dateA - dateB; 
        }));
        break;
        
      case 'upcoming':
        const filteredUpcoming = data.filter(app => {
          try {
            const appDate = app.date?.toDate() || new Date();
            return isFuture(appDate) && app.status === 'confirmed';
          } catch (error) {
            return false;
          }
        });
        setFilteredAppointments(filteredUpcoming.sort((a, b) => {
          const dateA = a.date?.toDate() || new Date(0);
          const dateB = b.date?.toDate() || new Date(0);
          return dateA - dateB; 
        }));
        break;
        
      case 'past':
        const filteredPast = data.filter(app => {
          try {
            const appDate = app.date?.toDate() || new Date();
            return isPast(appDate) || app.status === 'completed' || app.status === 'cancelled';
          } catch (error) {
            return false;
          }
        });
        setFilteredAppointments(filteredPast.sort((a, b) => {
          const dateA = a.date?.toDate() || new Date(0);
          const dateB = b.date?.toDate() || new Date(0);
          return dateB - dateA;
        }));
        break;
        
      default:
        setFilteredAppointments([...data]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAppointments();
    }, [currentUser])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  useEffect(() => {
    applyFilter(appointments, filter);
  }, [filter, appointments]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "EEE dd MMM yyyy 'à' HH:mm", { locale: fr });
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

  const renderAppointment = ({ item }) => {
    let appDate;
    try {
      appDate = item.date?.toDate() || new Date();
    } catch (error) {
      appDate = new Date();
    }
    
    const isTodayApp = isToday(appDate);
    const isFutureApp = isFuture(appDate);
    
    return (
      <TouchableOpacity
        style={[
          styles.appointmentCard,
          isTodayApp && styles.todayCard,
          !isFutureApp && styles.pastCard,
        ]}
        onPress={() => {
          navigation.navigate('AppointmentDetail', { appointmentId: item.id })
        }}
      >
        <View style={styles.appointmentHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {item.serviceName || 'Service inconnu'}
            </Text>
            <Text style={styles.clientName}>
              {item.clientName || 'Client inconnu'}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'confirmed') }]}>
            <Text style={styles.statusText}>{getStatusText(item.status || 'confirmed')}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Icon name="access-time" size={16} color="#666" />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color="#666" />
            <Text style={styles.detailText}>
              Durée: {item.serviceDuration || 30} min
            </Text>
            
            <Icon name="attach-money" size={16} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.servicePrice?.toFixed(2) || '0.00'} MAD</Text>
          </View>
          
          {item.notes && (
            <View style={styles.detailRow}>
              <Icon name="notes" size={16} color="#666" />
              <Text style={styles.notesText} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getStats = () => {
    const todayAppointments = appointments.filter(app => {
      try {
        const appDate = app.date?.toDate() || new Date();
        return isToday(appDate) && app.status === 'confirmed';
      } catch (error) {
        return false;
      }
    });
    
    const upcomingAppointments = appointments.filter(app => {
      try {
        const appDate = app.date?.toDate() || new Date();
        return isFuture(appDate) && app.status === 'confirmed';
      } catch (error) {
        return false;
      }
    });
    
    const completedAppointments = appointments.filter(app => 
      app.status === 'completed'
    );
    
    return {
      today: todayAppointments.length,
      upcoming: upcomingAppointments.length,
      completed: completedAppointments.length,
      total: appointments.length,
    };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Rendez-vous</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.today}</Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.upcoming}</Text>
          <Text style={styles.statLabel}>À venir</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Terminés</Text>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'today' && styles.filterButtonActive]}
          onPress={() => setFilter('today')}
        >
          <Text style={[styles.filterText, filter === 'today' && styles.filterTextActive]}>
            Aujourd'hui
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            À venir
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'past' && styles.filterButtonActive]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Passés
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tous
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="event" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {loading ? 'Chargement...' : `Aucun rendez-vous ${getFilterLabel(filter)}`}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const getFilterLabel = (filter) => {
  switch (filter) {
    case 'today': return "pour aujourd'hui";
    case 'upcoming': return "à venir";
    case 'past': return "passé";
    default: return "";
  }
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#FF5722',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  pastCard: {
    opacity: 0.8,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  clientName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 15,
  },
  detailIcon: {
    marginLeft: 20,
  },
  notesText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default StylistAppointments;