import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getAllAppointments, updateAppointmentStatus } from "../../../services/appointmentService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const VisitManagement = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const appointmentsData = await getAllAppointments();
      setAppointments(appointmentsData);
      
      const completedAppointments = appointmentsData.filter(
        app => app.status === 'completed'
      );
      setVisits(completedAppointments);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMarkAsVisit = async (appointmentId) => {
    try {
      await updateAppointmentStatus(appointmentId, 'completed');
      Alert.alert("Succès", "Rendez-vous marqué comme visite effectuée");
      loadData();
    } catch (error) {
      console.error("Erreur:", error);
      Alert.alert("Erreur", "Impossible de marquer comme visite");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'completed': return '#2196F3';
      default: return '#666';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
    } catch (error) {
      return '';
    }
  };

  const renderAppointmentCard = (appointment) => {
    const isCompleted = appointment.status === 'completed';
    const canMarkComplete = appointment.status === 'confirmed';

    return (
      <View key={appointment.id} style={styles.appointmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{appointment.serviceName}</Text>
            <Text style={styles.clientName}>{appointment.clientName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
              {isCompleted ? 'Visite' : 'À venir'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.detailText}>Styliste: {appointment.stylistName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="event" size={16} color="#666" />
            <Text style={styles.detailText}>{formatDate(appointment.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="attach-money" size={16} color="#666" />
            <Text style={styles.detailText}>{appointment.servicePrice} MAD</Text>
          </View>
        </View>

        {canMarkComplete && (
          <TouchableOpacity
            style={styles.visitButton}
            onPress={() => handleMarkAsVisit(appointment.id)}
          >
            <Icon name="check-circle" size={20} color="#2196F3" />
            <Text style={styles.visitButtonText}>Marquer comme visite</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderVisitCard = (visit) => (
    <View key={visit.id} style={[styles.visitCard, styles.completedCard]}>
      <View style={styles.visitHeader}>
        <View style={styles.visitInfo}>
          <Text style={styles.visitServiceName}>{visit.serviceName}</Text>
          <Text style={styles.visitClientName}>{visit.clientName}</Text>
        </View>
        <Icon name="check-circle" size={24} color="#4CAF50" />
      </View>
      
      <View style={styles.visitDetails}>
        <Text style={styles.visitDetailText}>Styliste: {visit.stylistName}</Text>
        <Text style={styles.visitDetailText}>Date: {formatDate(visit.date)}</Text>
        <Text style={styles.visitDetailText}>Montant: {visit.servicePrice} MAD</Text>
      </View>
      
      {visit.notes && (
        <View style={styles.visitNotes}>
          <Text style={styles.visitNotesTitle}>Notes:</Text>
          <Text style={styles.visitNotesText}>{visit.notes}</Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-note" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Aucune donnée</Text>
      <Text style={styles.emptyStateText}>
        {searchText ? "Aucun résultat trouvé" : "Aucun rendez-vous ou visite"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion des Visites</Text>
        <Text style={styles.headerSubtitle}>
          {visits.length} visites effectuées
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une visite..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Visites effectuées</Text>
            <Text style={styles.sectionCount}>({visits.length})</Text>
          </View>
          
          {visits.length === 0 ? (
            <View style={styles.noVisits}>
              <Text style={styles.noVisitsText}>Aucune visite effectuée</Text>
            </View>
          ) : (
            visits.map(renderVisitCard)
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="event" size={24} color="#FF9800" />
            <Text style={styles.sectionTitle}>Rendez-vous à venir</Text>
            <Text style={styles.sectionCount}>({appointments.filter(a => a.status === 'confirmed').length})</Text>
          </View>
          
          {appointments.filter(a => a.status === 'confirmed').length === 0 ? (
            <View style={styles.noAppointments}>
              <Text style={styles.noAppointmentsText}>Aucun rendez-vous à venir</Text>
            </View>
          ) : (
            appointments
              .filter(a => a.status === 'confirmed')
              .map(renderAppointmentCard)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 16, color: "#666" },
  header: {
    backgroundColor: "white",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#333" },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 5 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 16 },
  content: { flex: 1 },
  section: { padding: 15, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginLeft: 10 },
  sectionCount: { marginLeft: 10, fontSize: 14, color: "#666" },
  appointmentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: "#F0F9FF",
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  clientName: { fontSize: 14, color: "#666" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  cardDetails: { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 12, marginBottom: 12 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: { fontSize: 14, color: "#666", marginLeft: 8 },
  visitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  visitButtonText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  visitCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  visitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  visitInfo: { flex: 1 },
  visitServiceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  visitClientName: { fontSize: 14, color: "#666" },
  visitDetails: { marginBottom: 12 },
  visitDetailText: { fontSize: 14, color: "#666", marginBottom: 4 },
  visitNotes: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  visitNotesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  visitNotesText: { fontSize: 14, color: "#666" },
  noVisits: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
  },
  noVisitsText: { fontSize: 16, color: "#666", textAlign: "center" },
  noAppointments: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
  },
  noAppointmentsText: { fontSize: 16, color: "#666", textAlign: "center" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyStateTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginTop: 20, marginBottom: 10 },
  emptyStateText: { fontSize: 16, color: "#666", textAlign: "center", lineHeight: 22 },
});

export default VisitManagement;