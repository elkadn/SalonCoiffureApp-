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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import {
  getClientAppointments,
  cancelAppointment,
} from "../../../services/appointmentService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { printToFileAsync } from "expo-print";
import { shareAsync } from "expo-sharing";

const AppointmentsScreen = ({ navigation }) => {
  const { userData, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
    }
  }, [isAuthenticated]);

  const generateInvoice = async (appointment) => {
    try {
      if (!appointment) return;

      const appointmentDate = appointment.date.toDate();
      const formattedDate = format(appointmentDate, "dd/MM/yyyy");
      const formattedTime = format(appointmentDate, "HH:mm");

      // Générer un numéro de facture unique
      const invoiceNumber = `FAC-${appointment.id
        .substring(0, 8)
        .toUpperCase()}`;

      // HTML pour la facture
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Facture - ${invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .invoice-number {
            font-size: 16px;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: 600;
            width: 40%;
          }
          .info-value {
            width: 60%;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .table th {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
          }
          .table td {
            padding: 10px;
            border: 1px solid #ddd;
          }
          .total-row {
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .qr-code-placeholder {
            width: 100px;
            height: 100px;
            background-color: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px auto;
            border: 1px dashed #ccc;
            color: #999;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="invoice-title">FACTURE</div>
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
        
        <div class="section">
          <div class="section-title">MÉTHODE DE PAIEMENT</div>
          <div class="info-row">
            <div class="info-label">Statut:</div>
            <div class="info-value">${
              appointment.paymentStatus === "paid" ? "Payé" : "À régler"
            }</div>
          </div>
          <div class="info-row">
            <div class="info-label">Mode de paiement:</div>
            <div class="info-value">Sur place</div>
          </div>
        </div>
        
        <div class="qr-code-placeholder">
          Code QR pour paiement
        </div>
        
        <div class="footer">
          <p>Merci pour votre confiance !</p>
          <p>Cette facture est générée électroniquement et ne nécessite pas de signature.</p>
          <p>Pour toute question, contactez-nous au +212 600 000 000</p>
        </div>
      </body>
      </html>
    `;

      // Générer le fichier PDF
      const { uri } = await printToFileAsync({
        html: html,
        base64: false,
      });

      // Partager/ouvrir le PDF
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

  const loadAppointments = async () => {
    try {
      if (!userData?.uid) return;

      const appointmentsData = await getClientAppointments(userData.uid);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Erreur chargement rendez-vous:", error);
      Alert.alert("Erreur", "Impossible de charger vos rendez-vous");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      // Vérifier si on peut annuler (au moins 24h avant)
      const appointmentDate = selectedAppointment.date.toDate();
      const now = new Date();
      const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        Alert.alert(
          "Annulation impossible",
          "Vous ne pouvez annuler un rendez-vous que 24 heures à l'avance.",
          [{ text: "OK" }]
        );
        setCancelModalVisible(false);
        return;
      }

      await cancelAppointment(selectedAppointment.id);

      Alert.alert("Succès", "Le rendez-vous a été annulé avec succès.", [
        { text: "OK" },
      ]);

      // Recharger la liste
      loadAppointments();
    } catch (error) {
      console.error("Erreur annulation:", error);
      Alert.alert("Erreur", "Impossible d'annuler ce rendez-vous");
    } finally {
      setCancelModalVisible(false);
      setSelectedAppointment(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50"; // Vert
      case "pending":
        return "#FF9800"; // Orange
      case "cancelled":
        return "#F44336"; // Rouge
      case "completed":
        return "#2196F3"; // Bleu
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
      return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (error) {
      return "";
    }
  };

  const renderAppointmentCard = (appointment) => {
    const appointmentDate = appointment.date?.toDate();
    const isPast = appointmentDate && appointmentDate < new Date();
    const canCancel = appointment.status === "confirmed" && !isPast;
    const canPrintInvoice =
      appointment.status === "completed" || appointment.status === "confirmed";

    return (
      <View key={appointment.id} style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View>
            <Text style={styles.serviceName}>{appointment.serviceName}</Text>
            <View style={styles.appointmentMeta}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.metaText}>
                {formatDate(appointment.date)}
              </Text>
            </View>
            <View style={styles.appointmentMeta}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.metaText}>
                {appointment.serviceDuration} min
              </Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
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

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Avec: {appointment.stylistName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Prix: {appointment.servicePrice} MAD
            </Text>
          </View>

          {appointment.notes && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={2}>
                Notes: {appointment.notes}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          {canPrintInvoice && (
            <TouchableOpacity
              style={[styles.actionButton, styles.printButton]}
              onPress={() => generateInvoice(appointment)}
            >
              <Ionicons name="print-outline" size={18} color="#4CAF50" />
              <Text style={styles.printButtonText}>Facture</Text>
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setSelectedAppointment(appointment);
                setCancelModalVisible(true);
              }}
            >
              <Ionicons name="close-circle-outline" size={18} color="#F44336" />
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Aucun rendez-vous</Text>
      <Text style={styles.emptyStateText}>
        Vous n'avez pas encore de rendez-vous.
      </Text>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate("Services")}
      >
        <Text style={styles.bookButtonText}>Prendre un rendez-vous</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notAuthenticated}>
          <Ionicons name="lock-closed" size={60} color="#ccc" />
          <Text style={styles.notAuthenticatedTitle}>Connexion requise</Text>
          <Text style={styles.notAuthenticatedText}>
            Connectez-vous pour voir vos rendez-vous
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes rendez-vous</Text>
          <Text style={styles.headerSubtitle}>
            {appointments.length} rendez-vous au total
          </Text>
        </View>

        {appointments.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.appointmentsList}>
            {appointments.map(renderAppointmentCard)}
          </View>
        )}

        {/* Bouton pour prendre un nouveau rendez-vous */}
        <TouchableOpacity
          style={styles.newAppointmentButton}
          onPress={() => navigation.navigate("Services")}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.newAppointmentText}>Nouveau rendez-vous</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de confirmation d'annulation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name="warning-outline"
              size={50}
              color="#F44336"
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>Annuler le rendez-vous</Text>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir annuler ce rendez-vous ?
            </Text>

            {selectedAppointment && (
              <View style={styles.appointmentSummary}>
                <Text style={styles.summaryText}>
                  {selectedAppointment.serviceName}
                </Text>
                <Text style={styles.summaryText}>
                  {formatDate(selectedAppointment.date)}
                </Text>
                <Text style={styles.summaryText}>
                  Avec: {selectedAppointment.stylistName}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Non, garder</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  notAuthenticated: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notAuthenticatedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    marginTop: 50,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  appointmentsList: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  appointmentCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    flex: 1,
  },
  appointmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  statusBadge: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  appointmentDetails: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  cancelButtonText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  bookButton: {
    backgroundColor: "#333",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  newAppointmentButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  newAppointmentText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  // Modal styles
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
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  appointmentSummary: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    width: "100%",
  },
  summaryText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelModalButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmCancelButton: {
    backgroundColor: "#F44336",
  },
  cancelModalButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmCancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 5,
  },
  printButton: {
    backgroundColor: "#F0F9F0",
    borderColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FFCDD2",
  },
  printButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  cancelButtonText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
});

export default AppointmentsScreen;
