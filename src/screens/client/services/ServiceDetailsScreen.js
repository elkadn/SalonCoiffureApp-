import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getServiceById,
  getAllStylistes,
  getProductsByIds,
} from "../../../services/serviceService";
import { useAuth } from "../../../context/AuthContext";
import {
  addReview,
  getReviewsByService,
} from "../../../services/reviewService";
import {
  checkAvailability,
  createAppointment,
  getAvailableSlots,
} from "../../../services/appointmentService";

const { width } = Dimensions.get("window");

const ServiceDetailsScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [service, setService] = useState(null);
  const [stylists, setStylists] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const { userData, isAuthenticated } = useAuth();

  useEffect(() => {
    loadServiceDetails();
    loadReviews();
  }, [serviceId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadServiceDetails = async () => {
    try {
      setLoading(true);
      const serviceData = await getServiceById(serviceId);
      setService(serviceData);

      if (serviceData?.stylistesIds?.length > 0) {
        const allStylists = await getAllStylistes();
        const assignedStylists = allStylists.filter((stylist) =>
          serviceData.stylistesIds.includes(stylist.id)
        );
        setStylists(assignedStylists);
      }

      if (serviceData?.produitsIds?.length > 0) {
        const serviceProducts = await getProductsByIds(serviceData.produitsIds);
        setProducts(serviceProducts);
      }
    } catch (error) {
      console.error("Erreur chargement service:", error);
      Alert.alert("Erreur", "Impossible de charger les détails du service");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const reviewsData = await getReviewsByService(serviceId, true);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Erreur chargement avis:", error);
      
      setReviews([]);
    }
  };

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour prendre un rendez-vous.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Se connecter",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
      return;
    }

    setBookingModalVisible(true);
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;

    try {
      setLoadingSlots(true);
      const slots = await getAvailableSlots(serviceId, selectedDate);
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Erreur chargement créneaux:", error);
      Alert.alert("Erreur", "Impossible de charger les créneaux disponibles");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Erreur", "Veuillez sélectionner une date et une heure");
      return;
    }

    try {
      setBookingInProgress(true);

      const availability = await checkAvailability(
        serviceId,
        selectedDate,
        selectedTime
      );

      if (!availability.available) {
        Alert.alert(
          "Succès !",
          `Votre rendez-vous est confirmé avec ${appointment.stylistName} le ${selectedDate} à ${selectedTime}`,
          [
            {
              text: "Voir mes rendez-vous",
              onPress: () => navigation.navigate("Appointments"),
            },
            {
              text: "OK",
              style: "default",
            },
          ]
        );
        return;
      }

      const clientName =
        `${userData?.prenom || ""} ${userData?.nom || ""}`.trim() ||
        userData?.email ||
        "Client";

      const appointment = await createAppointment({
        serviceId,
        clientId: userData?.uid,
        clientName,
        date: selectedDate,
        time: selectedTime,
        notes: appointmentNotes,
      });

      setSelectedDate("");
      setSelectedTime("");
      setAppointmentNotes("");
      setBookingModalVisible(false);

      Alert.alert(
        "Succès !",
        `Votre rendez-vous est confirmé avec ${appointment.stylistName} le ${selectedDate} à ${selectedTime}`,
        [
          {
            text: "Voir mes rendez-vous",
            onPress: () => navigation.navigate("Appointments"), 
          },
          {
            text: "OK",
            style: "default",
          },
        ]
      );
    } catch (error) {
      console.error("Erreur réservation:", error);
      Alert.alert(
        "Erreur",
        error.message || "Impossible de réserver ce rendez-vous"
      );
    } finally {
      setBookingInProgress(false);
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      if (date.getDay() !== 0) {
        dates.push({
          value: date.toISOString().split("T")[0],
          label: date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
        });
      }
    }

    return dates;
  };

  const handleAddReview = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour ajouter un avis.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Se connecter",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
      return;
    }

    if (!newReview.comment.trim()) {
      Alert.alert("Erreur", "Veuillez écrire un commentaire");
      return;
    }

    try {
      const clientName =
        `${userData?.prenom || ""} ${userData?.nom || ""}`.trim() ||
        userData?.email ||
        "Client";

      await addReview(serviceId, {
        ...newReview,
        clientName,
        clientId: userData?.uid,
        date: new Date().toISOString().split("T")[0],
        status: "pending",
      });

      Alert.alert(
        "Merci !",
        "Votre avis a été soumis et sera visible après validation par l'administrateur.",
        [
          {
            text: "OK",
            onPress: () => {
              setReviewModalVisible(false);
              setNewReview({ rating: 5, comment: "" });
              setTimeout(() => {
                loadReviews();
              }, 1000);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur ajout avis:", error);
      Alert.alert("Erreur", "Impossible d'ajouter l'avis");
    }
  };

  const handleImagePress = (imageUri) => {
    setSelectedImage(imageUri);
    setImageModalVisible(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color="#FFD700"
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewClientName}>{item.clientName}</Text>
          <Text style={styles.reviewDate}>
            {item.date ||
              (item.createdAt?.toDate
                ? item.createdAt.toDate().toLocaleDateString()
                : "")}
          </Text>
        </View>
        {renderStars(item.rating)}
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productIcon}>
        <Ionicons name="flask-outline" size={24} color="#4ECDC4" />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nom}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description || "Description non disponible"}
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.productBrand}>{item.marque || "Marque"}</Text>
          <Text style={styles.productPrice}>
            {item.prixVente || item.prix || 0}MAD
          </Text>
        </View>
      </View>
    </View>
  );

  const renderThumbnailItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.thumbnailContainer}
      onPress={() => handleImagePress(item)}
    >
      <Image
        source={{ uri: item }}
        style={styles.thumbnailImage}
      />
    </TouchableOpacity>
  );

  const renderRatingSelector = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setNewReview({ ...newReview, rating: i })}
        >
          <Ionicons
            name={i <= newReview.rating ? "star" : "star-outline"}
            size={32}
            color="#FFD700"
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingSelector}>{stars}</View>;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="sad-outline" size={60} color="#ccc" />
        <Text style={styles.errorText}>Service non trouvé</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.serviceTitle}>{service.nom}</Text>
          <Text style={styles.servicePrice}>{service.prix}MAD</Text>
          <View style={styles.serviceMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text style={styles.metaText}>{service.duree} min</Text>
            </View>
            {service.categorie && (
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={18} color="#666" />
                <Text style={styles.metaText}>{service.categorie}</Text>
              </View>
            )}
          </View>
        </View>

        {service.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{service.description}</Text>
          </View>
        )}

        {products.length > 0 && (
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Produits utilisés</Text>
            <Text style={styles.sectionSubtitle}>
              Découvrez la qualité de nos produits
            </Text>
            <FlatList
              data={products}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>Aucun produit associé</Text>
              )}
            />
          </View>
        )}

        {stylists.length > 0 && (
          <View style={styles.stylistsSection}>
            <Text style={styles.sectionTitle}>Nos spécialistes</Text>
            <View style={styles.stylistsList}>
              {stylists.map((stylist) => (
                <View key={stylist.id} style={styles.stylistCard}>
                  <View style={styles.stylistAvatar}>
                    <Text style={styles.stylistInitial}>
                      {stylist.prenom?.charAt(0) ||
                        stylist.nom?.charAt(0) ||
                        "S"}
                    </Text>
                  </View>
                  <View style={styles.stylistInfo}>
                    <Text style={styles.stylistName}>
                      {stylist.prenom} {stylist.nom}
                    </Text>
                    <Text style={styles.stylistSpecialty}>
                      {stylist.specialite || "Styliste expert"}
                    </Text>
                    {stylist.experience && (
                      <Text style={styles.stylistExperience}>
                        {stylist.experience} ans d'expérience
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {service.images && service.images.length > 0 && (
          <View style={styles.gallerySection}>
            <Text style={styles.sectionTitle}>Galerie photos</Text>
            <FlatList
              data={service.images}
              renderItem={renderThumbnailItem}
              keyExtractor={(item, index) => `image-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryList}
            />
            <Text style={styles.galleryHint}>
              Cliquez sur une image pour l'agrandir
            </Text>
          </View>
        )}

        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <View>
              <Text style={styles.sectionTitle}>Avis clients</Text>
              <Text style={styles.reviewsCount}>({reviews.length} avis)</Text>
            </View>
            {userData?.role === "client" && (
              <TouchableOpacity
                style={styles.addReviewButton}
                onPress={() => setReviewModalVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={22} color="#FF6B6B" />
                <Text style={styles.addReviewText}>Ajouter un avis</Text>
              </TouchableOpacity>
            )}
          </View>

          {reviews.length > 0 ? (
            <FlatList
              data={reviews}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.reviewsList}
            />
          ) : (
            <View style={styles.noReviews}>
              <Ionicons name="chatbubble-outline" size={40} color="#ccc" />
              <Text style={styles.noReviewsText}>
                Soyez le premier à donner votre avis !
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {userData?.role === "client" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookAppointment}
          >
            <Ionicons name="calendar" size={24} color="white" />
            <Text style={styles.bookButtonText}>Prendre rendez-vous</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Donnez votre avis</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {!isAuthenticated ? (
              <View style={styles.loginRequired}>
                <Ionicons name="lock-closed" size={50} color="#FF6B6B" />
                <Text style={styles.loginRequiredTitle}>Connexion requise</Text>
                <Text style={styles.loginRequiredText}>
                  Vous devez être connecté pour ajouter un avis.
                </Text>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => {
                    setReviewModalVisible(false);
                    navigation.navigate("Login");
                  }}
                >
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>Notez ce service</Text>
                {renderRatingSelector()}

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Votre commentaire..."
                  value={newReview.comment}
                  onChangeText={(text) =>
                    setNewReview({ ...newReview, comment: text })
                  }
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setReviewModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleAddReview}
                  >
                    <Text style={styles.submitButtonText}>Soumettre</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={bookingModalVisible}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prendre rendez-vous</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>Choisissez une date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.datesScrollView}
              >
                {generateAvailableDates().map((date) => (
                  <TouchableOpacity
                    key={date.value}
                    style={[
                      styles.dateButton,
                      selectedDate === date.value && styles.dateButtonSelected,
                    ]}
                    onPress={() => setSelectedDate(date.value)}
                  >
                    <Text
                      style={[
                        styles.dateButtonText,
                        selectedDate === date.value &&
                          styles.dateButtonTextSelected,
                      ]}
                    >
                      {date.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedDate && (
                <>
                  <Text style={styles.modalSubtitle}>Choisissez une heure</Text>
                  {loadingSlots ? (
                    <ActivityIndicator
                      size="small"
                      color="#FF6B6B"
                      style={styles.slotsLoading}
                    />
                  ) : availableSlots.length > 0 ? (
                    <View style={styles.timeSlotsGrid}>
                      {availableSlots.map((slot, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.timeSlot,
                            selectedTime === slot.time &&
                              styles.timeSlotSelected,
                          ]}
                          onPress={() => setSelectedTime(slot.time)}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              selectedTime === slot.time &&
                                styles.timeSlotTextSelected,
                            ]}
                          >
                            {slot.time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noSlotsText}>
                      Aucun créneau disponible pour cette date
                    </Text>
                  )}
                </>
              )}

              {selectedDate && selectedTime && (
                <>
                  <Text style={styles.modalSubtitle}>Notes (optionnel)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Précisions sur le rendez-vous..."
                    value={appointmentNotes}
                    onChangeText={setAppointmentNotes}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />

                  <Text style={styles.appointmentSummary}>
                    Service: {service?.nom}
                    {"\n"}Durée: {service?.duree} minutes
                    {"\n"}Prix: {service?.prix} MAD
                  </Text>
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setBookingModalVisible(false)}
                  disabled={bookingInProgress}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    (!selectedDate || !selectedTime || bookingInProgress) &&
                      styles.confirmButtonDisabled,
                  ]}
                  onPress={handleConfirmBooking}
                  disabled={!selectedDate || !selectedTime || bookingInProgress}
                >
                  {bookingInProgress ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirmer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    color: "#666",
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  serviceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 15,
  },
  serviceMeta: {
    flexDirection: "row",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  descriptionCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  productsSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  productsList: {
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  productIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0F7F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginBottom: 5,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productBrand: {
    fontSize: 12,
    color: "#999",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4ECDC4",
  },
  stylistsSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  stylistsList: {
  },
  stylistCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  stylistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  stylistInitial: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  stylistInfo: {
    flex: 1,
  },
  stylistName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  stylistSpecialty: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  stylistExperience: {
    fontSize: 12,
    color: "#999",
  },
  gallerySection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  galleryList: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  thumbnailContainer: {
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  galleryHint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  reviewsSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 100,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  reviewsCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addReviewText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  reviewsList: {
  },
  reviewCard: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewClientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  starsContainer: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  noReviews: {
    alignItems: "center",
    paddingVertical: 30,
  },
  noReviewsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bookButton: {
    backgroundColor: "#333",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 15,
  },
  bookButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
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
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  ratingSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    minHeight: 120,
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
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginRequired: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loginRequiredTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  loginRequiredText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
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
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  fullSizeImage: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 10,
  },
  datesScrollView: {
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    minWidth: 120,
    alignItems: "center",
  },
  dateButtonSelected: {
    backgroundColor: "#333",
  },
  dateButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  dateButtonTextSelected: {
    color: "white",
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  timeSlot: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 80,
    alignItems: "center",
  },
  timeSlotSelected: {
    backgroundColor: "#333",
  },
  timeSlotText: {
    color: "#666",
    fontWeight: "600",
  },
  timeSlotTextSelected: {
    color: "white",
  },
  slotsLoading: {
    marginVertical: 20,
  },
  noSlotsText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginVertical: 20,
  },
  appointmentSummary: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ServiceDetailsScreen;
