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
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import {
  getAllAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} from "../../../services/appointmentService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";

const AppointmentList = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchText, statusFilter]);

  const loadAppointments = async () => {
    try {
      const appointmentsData = await getAllAppointments();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Erreur chargement rendez-vous:", error);
      Alert.alert("Erreur", "Impossible de charger les rendez-vous");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (searchText.trim() !== "") {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.clientName.toLowerCase().includes(searchLower) ||
          app.serviceName.toLowerCase().includes(searchLower) ||
          app.stylistName.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      Alert.alert("Succès", `Statut mis à jour: ${getStatusText(newStatus)}`);
      loadAppointments();
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le statut");
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await cancelAppointment(selectedAppointment.id);
      Alert.alert("Succès", "Le rendez-vous a été annulé.");
      loadAppointments();
    } catch (error) {
      console.error("Erreur annulation:", error);
      Alert.alert("Erreur", "Impossible d'annuler ce rendez-vous");
    } finally {
      setCancelModalVisible(false);
      setSelectedAppointment(null);
    }
  };

  const generateInvoice = async (appointment) => {
    try {
      const appointmentDate = appointment.date.toDate();
      const formattedDate = format(appointmentDate, "dd/MM/yyyy");
      const formattedTime = format(appointmentDate, "HH:mm");
      const invoiceNumber = `FAC-${appointment.id
        .substring(0, 8)
        .toUpperCase()}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Facture - ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .invoice-number { font-size: 16px; color: #666; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .info-label { font-weight: 600; width: 40%; }
            .info-value { width: 60%; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th { background-color: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; }
            .table td { padding: 10px; border: 1px solid #ddd; }
            .total-row { font-weight: bold; font-size: 16px; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="invoice-title">FACTURE ADMIN</div>
            <div class="invoice-number">N° ${invoiceNumber}</div>
          </div>
          
          <div class="section">
            <div class="section-title">INFORMATIONS CLIENT</div>
            <div class="info-row">
              <div class="info-label">Client:</div>
              <div class="info-value">${appointment.clientName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Date d'émission:</div>
              <div class="info-value">${new Date().toLocaleDateString(
                "fr-FR"
              )}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">DÉTAILS DU RENDEZ-VOUS</div>
            <div class="info-row">
              <div class="info-label">Date:</div>
              <div class="info-value">${formattedDate}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Heure:</div>
              <div class="info-value">${formattedTime}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Styliste:</div>
              <div class="info-value">${appointment.stylistName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Statut:</div>
              <div class="info-value">${getStatusText(appointment.status)}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">DÉTAILS DE LA PRESTATION</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Durée</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${appointment.serviceName}</td>
                  <td>${appointment.serviceDuration} min</td>
                  <td>${appointment.servicePrice} MAD</td>
                  <td>${appointment.servicePrice} MAD</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">TOTAL TTC:</td>
                  <td>${appointment.servicePrice} MAD</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Facture générée par l'administrateur</p>
            <p>Salon de Coiffure - Administration</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await printToFileAsync({ html, base64: false });
      await shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: "Télécharger la facture",
      });
    } catch (error) {
      console.error("Erreur génération facture:", error);
      Alert.alert("Erreur", "Impossible de générer la facture");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      case "completed":
        return "#2196F3";
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmé";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulé";
      case "completed":
        return "Terminé";
      default:
        return status;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate();
      return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
    } catch (error) {
      return "";
    }
  };

  const renderAppointmentCard = (appointment) => {
    const appointmentDate = appointment.date?.toDate();
    const isPast = appointmentDate && appointmentDate < new Date();
    const canCancel = appointment.status === "confirmed" && !isPast;
    const canMarkComplete = appointment.status === "confirmed" && isPast;

    return (
      <TouchableOpacity
        key={appointment.id}
        style={styles.appointmentCard}
        onPress={() => {
          setSelectedAppointment(appointment);
          setActionModalVisible(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{appointment.serviceName}</Text>
            <Text style={styles.clientName}>{appointment.clientName}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(appointment.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(appointment.status) },
              ]}
            >
              {getStatusText(appointment.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.detailText}>
              Styliste: {appointment.stylistName}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="event" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(appointment.date)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="access-time" size={16} color="#666" />
            <Text style={styles.detailText}>
              {appointment.serviceDuration} min
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="attach-money" size={16} color="#666" />
            <Text style={styles.detailText}>
              {appointment.servicePrice} MAD
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-busy" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Aucun rendez-vous</Text>
      <Text style={styles.emptyStateText}>
        Aucun rendez-vous trouvé avec ces critères.
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
        <Text style={styles.headerTitle}>Tous les rendez-vous</Text>
        <Text style={styles.headerSubtitle}>
          {filteredAppointments.length} rendez-vous trouvés
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un rendez-vous..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFilters}
        >
          {["all", "confirmed", "pending", "cancelled", "completed"].map(
            (status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusFilterButton,
                  statusFilter === status && styles.statusFilterButtonActive,
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.statusFilterText,
                    statusFilter === status && styles.statusFilterTextActive,
                  ]}
                >
                  {status === "all" ? "Tous" : getStatusText(status)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAppointments.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.appointmentsList}>
            {filteredAppointments.map(renderAppointmentCard)}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Actions sur le rendez-vous</Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedAppointment && (
              <View style={styles.appointmentInfo}>
                <Text style={styles.modalAppointmentTitle}>
                  {selectedAppointment.serviceName}
                </Text>
                <Text style={styles.modalAppointmentText}>
                  Client: {selectedAppointment.clientName}
                </Text>
                <Text style={styles.modalAppointmentText}>
                  Styliste: {selectedAppointment.stylistName}
                </Text>
                <Text style={styles.modalAppointmentText}>
                  Date: {formatDate(selectedAppointment.date)}
                </Text>
                <Text style={styles.modalAppointmentText}>
                  Prix: {selectedAppointment.servicePrice} MAD
                </Text>
                <Text style={styles.modalAppointmentText}>
                  Statut: {getStatusText(selectedAppointment.status)}
                </Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.invoiceButton]}
                onPress={() => {
                  setActionModalVisible(false);
                  generateInvoice(selectedAppointment);
                }}
              >
                <Icon name="receipt" size={20} color="#4CAF50" />
                <Text style={styles.invoiceButtonText}>Facture</Text>
              </TouchableOpacity>

              {selectedAppointment?.status === "confirmed" && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => {
                      setActionModalVisible(false);
                      handleStatusChange(selectedAppointment.id, "completed");
                    }}
                  >
                    <Icon name="check-circle" size={20} color="#2196F3" />
                    <Text style={styles.completeButtonText}>Terminer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelActionButton]}
                    onPress={() => {
                      setActionModalVisible(false);
                      setCancelModalVisible(true);
                    }}
                  >
                    <Icon name="cancel" size={20} color="#F44336" />
                    <Text style={styles.cancelActionButtonText}>Annuler</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon
              name="warning"
              size={50}
              color="#F44336"
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>Annuler le rendez-vous</Text>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est
              irréversible.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Non</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmCancelButton]}
                onPress={handleCancelAppointment}
              >
                <Text style={styles.confirmCancelButtonText}>Oui, annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  filtersContainer: { backgroundColor: "white", padding: 15 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  statusFilters: { flexDirection: "row" },
  statusFilterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  statusFilterButtonActive: { backgroundColor: "#4CAF50" },
  statusFilterText: { color: "#666", fontSize: 14 },
  statusFilterTextActive: { color: "white" },
  content: { flex: 1 },
  appointmentsList: { padding: 15 },
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
  cardDetails: { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 12 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: { fontSize: 14, color: "#666", marginLeft: 8 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  modalIcon: { alignSelf: "center", marginBottom: 15 },
  modalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  appointmentInfo: { marginBottom: 25 },
  modalAppointmentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  modalAppointmentText: { fontSize: 14, color: "#666", marginBottom: 5 },
  actionButtons: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  invoiceButton: {
    backgroundColor: "#F0F9F0",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  completeButton: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  cancelActionButton: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#F44336",
  },
  invoiceButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  completeButtonText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  cancelActionButtonText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelModalButton: { backgroundColor: "#f0f0f0" },
  confirmCancelButton: { backgroundColor: "#F44336" },
  cancelModalButtonText: { color: "#666", fontSize: 16, fontWeight: "600" },
  confirmCancelButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});

export default AppointmentList;
