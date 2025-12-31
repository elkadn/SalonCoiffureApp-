// screens/client/reviews/MyReviewsScreen.js
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
import { getAllReviews, deleteReview } from "../../../services/reviewService";

const MyReviewsScreen = ({ navigation }) => {
  const { userData, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadReviews();
    }
  }, [isAuthenticated]);

  const loadReviews = async () => {
    try {
      if (!userData?.email) return;

      const allReviews = await getAllReviews();
      // Filtrer les avis de l'utilisateur connecté
      const userReviews = allReviews.filter(
        (review) =>
          review.clientName.includes(userData.prenom) ||
          review.clientName.includes(userData.email) ||
          (review.clientId && review.clientId === userData.uid)
      );

      setReviews(userReviews);
    } catch (error) {
      console.error("Erreur chargement avis:", error);
      Alert.alert("Erreur", "Impossible de charger vos avis");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const handleDeleteReview = async () => {
    if (!selectedReview || !userData?.uid) return;

    try {
      // Appeler la fonction deleteReview avec vérification de propriétaire
      await deleteReview(selectedReview.id, userData.uid);

      Alert.alert("Succès", "L'avis a été supprimé avec succès", [
        {
          text: "OK",
          onPress: () => {
            // Recharger la liste
            loadReviews();
          },
        },
      ]);
    } catch (error) {
      console.error("Erreur suppression:", error);
      Alert.alert(
        "Erreur",
        error.message || "Impossible de supprimer cet avis"
      );
    } finally {
      setDeleteModalVisible(false);
      setSelectedReview(null);
    }
  };

  // Modifiez la fonction canDeleteReview
  const canDeleteReview = (review) => {
    // L'utilisateur peut supprimer son avis s'il est en attente ou approuvé
    // ET s'il est le propriétaire (vérifié par clientId)
    return (
      (review.status === "pending" || review.status === "approved") &&
      review.clientId === userData?.uid
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#4CAF50"; // Vert
      case "pending":
        return "#FF9800"; // Orange
      case "rejected":
        return "#F44336"; // Rouge
      default:
        return "#666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Approuvé";
      case "pending":
        return "En attente";
      case "rejected":
        return "Rejeté";
      default:
        return status;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      if (timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      return "";
    } catch (error) {
      return "";
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color="#FFD700"
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderReviewCard = (review) => {
    const deletable = canDeleteReview(review);

    return (
      <View key={review.id} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewInfo}>
            <Text style={styles.serviceName}>
              {review.serviceId || "Service"}
            </Text>
            <Text style={styles.reviewDate}>
              {formatDate(review.date || review.createdAt)}
            </Text>
          </View>
          <View style={styles.reviewMeta}>
            {renderStars(review.rating)}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(review.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(review.status) },
                ]}
              >
                {getStatusText(review.status)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.reviewComment}>{review.comment}</Text>

        {deletable && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              setSelectedReview(review);
              setDeleteModalVisible(true);
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#F44336" />
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="star-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Aucun avis</Text>
      <Text style={styles.emptyStateText}>
        Vous n'avez pas encore donné d'avis.
      </Text>
      <TouchableOpacity
        style={styles.addReviewButton}
        onPress={() => navigation.navigate("Services")}
      >
        <Text style={styles.addReviewButtonText}>Donner un avis</Text>
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
            Connectez-vous pour voir vos avis
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
          <Text style={styles.headerTitle}>Mes avis</Text>
          <Text style={styles.headerSubtitle}>
            {reviews.length} avis au total
          </Text>
        </View>

        {reviews.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.reviewsList}>
            {reviews.map(renderReviewCard)}
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmation de suppression */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name="warning-outline"
              size={50}
              color="#F44336"
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>Supprimer l'avis</Text>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer cet avis ?
            </Text>

            {selectedReview && (
              <View style={styles.reviewSummary}>
                <Text style={styles.summaryText}>
                  Note: {selectedReview.rating}/5
                </Text>
                <Text style={styles.summaryText} numberOfLines={3}>
                  {selectedReview.comment}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmDeleteButton]}
                onPress={handleDeleteReview}
              >
                <Text style={styles.confirmDeleteButtonText}>Supprimer</Text>
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
  reviewsList: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  reviewInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 14,
    color: "#666",
  },
  reviewMeta: {
    alignItems: "flex-end",
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  reviewComment: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 15,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  deleteButtonText: {
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
  addReviewButton: {
    backgroundColor: "#333",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addReviewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
  reviewSummary: {
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
  confirmDeleteButton: {
    backgroundColor: "#F44336",
  },
  cancelModalButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmDeleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MyReviewsScreen;
