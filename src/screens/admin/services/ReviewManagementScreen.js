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
  FlatList,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { getAllReviews, approveReview, rejectReview } from "../../../services/reviewService";
import { getServiceById } from "../../../services/serviceService";

const ReviewManagementScreen = ({ navigation }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviewsData = await getAllReviews();
      
      // Enrichir les avis avec les informations du service
      const enrichedReviews = await Promise.all(
        reviewsData.map(async (review) => {
          try {
            const service = await getServiceById(review.serviceId);
            return {
              ...review,
              serviceName: service?.nom || "Service inconnu",
            };
          } catch (error) {
            return {
              ...review,
              serviceName: "Service inconnu",
            };
          }
        })
      );
      
      setReviews(enrichedReviews);
    } catch (error) {
      console.error("Erreur chargement avis:", error);
      Alert.alert("Erreur", "Impossible de charger les avis");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const handleApproveReview = async (reviewId) => {
    try {
      Alert.alert(
        "Approuver l'avis",
        "Êtes-vous sûr de vouloir approuver cet avis ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Approuver",
            onPress: async () => {
              await approveReview(reviewId);
              Alert.alert("Succès", "Avis approuvé avec succès");
              loadReviews();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur approbation avis:", error);
      Alert.alert("Erreur", "Impossible d'approuver l'avis");
    }
  };

  const handleRejectReview = async (reviewId) => {
    try {
      Alert.alert(
        "Rejeter l'avis",
        "Êtes-vous sûr de vouloir rejeter cet avis ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Rejeter",
            onPress: async () => {
              await rejectReview(reviewId);
              Alert.alert("Succès", "Avis rejeté avec succès");
              loadReviews();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur rejet avis:", error);
      Alert.alert("Erreur", "Impossible de rejeter l'avis");
    }
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
        return "#757575"; // Gris
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return "check-circle";
      case "pending":
        return "access-time";
      case "rejected":
        return "cancel";
      default:
        return "help";
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
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const formatDate = (date) => {
    if (!date) return "";
    if (date.toDate) {
      return date.toDate().toLocaleDateString("fr-FR");
    }
    if (typeof date === "string") {
      return new Date(date).toLocaleDateString("fr-FR");
    }
    return "";
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    return review.status === filter;
  });

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.clientName?.charAt(0) || "C"}
            </Text>
          </View>
          <View>
            <Text style={styles.clientName}>{item.clientName}</Text>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Icon name={getStatusIcon(item.status)} size={14} color="#fff" />
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.reviewContent}>
        <View style={styles.ratingRow}>
          {renderStars(item.rating)}
          <Text style={styles.dateText}>{formatDate(item.date || item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>

      {item.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveReview(item.id)}
          >
            <Icon name="check" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Approuver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectReview(item.id)}
          >
            <Icon name="close" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Rejeter</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status !== "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => navigation.navigate("ServiceDetails", { serviceId: item.serviceId })}
          >
            <Icon name="visibility" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Voir service</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStats = () => {
    const total = reviews.length;
    const pending = reviews.filter(r => r.status === "pending").length;
    const approved = reviews.filter(r => r.status === "approved").length;
    const rejected = reviews.filter(r => r.status === "rejected").length;

    return { total, pending, approved, rejected };
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
        <Text style={styles.headerTitle}>Gestion des avis</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
            <Text style={[styles.statNumber, { color: "#FF9800" }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.statNumber, { color: "#4CAF50" }]}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approuvés</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFEBEE" }]}>
            <Text style={[styles.statNumber, { color: "#F44336" }]}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Rejetés</Text>
          </View>
        </View>

        {/* Filtres */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filtrer par statut:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
              onPress={() => setFilter("all")}
            >
              <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
                Tous ({stats.total})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === "pending" && styles.filterChipActive]}
              onPress={() => setFilter("pending")}
            >
              <Text style={[styles.filterText, filter === "pending" && styles.filterTextActive]}>
                En attente ({stats.pending})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === "approved" && styles.filterChipActive]}
              onPress={() => setFilter("approved")}
            >
              <Text style={[styles.filterText, filter === "approved" && styles.filterTextActive]}>
                Approuvés ({stats.approved})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filter === "rejected" && styles.filterChipActive]}
              onPress={() => setFilter("rejected")}
            >
              <Text style={[styles.filterText, filter === "rejected" && styles.filterTextActive]}>
                Rejetés ({stats.rejected})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Liste des avis */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Chargement des avis...</Text>
          </View>
        ) : filteredReviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="reviews" size={80} color="#e0e0e0" />
            <Text style={styles.emptyTitle}>Aucun avis trouvé</Text>
            <Text style={styles.emptyText}>
              {filter === "all"
                ? "Aucun avis n'a été soumis pour le moment."
                : `Aucun avis avec le statut "${getStatusText(filter)}".`}
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadReviews}
            >
              <Text style={styles.refreshButtonText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredReviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.reviewsList}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  reviewsList: {
    padding: 20,
  },
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  reviewContent: {
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  viewButton: {
    backgroundColor: "#2196F3",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ReviewManagementScreen;