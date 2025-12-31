// screens/client/promotions/PromotionsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { salonService } from "../services/salonService";
import { getAllServices } from "../services/serviceService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PromotionsScreen = ({ navigation }) => {
  const [promotions, setPromotions] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salonInfo, setSalonInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les informations du salon
      const salonData = await salonService.getSalonInfo();
      setSalonInfo(salonData);
      
      // Charger les services pour les associer aux promotions
      const servicesData = await getAllServices();
      const activeServices = servicesData.filter(s => s.actif !== false);
      setServices(activeServices);
      
      // Générer les promotions dynamiques
      const generatedPromotions = generatePromotions(activeServices, salonData);
      setPromotions(generatedPromotions);
      
    } catch (error) {
      console.error("Erreur chargement données:", error);
      Alert.alert("Erreur", "Impossible de charger les promotions");
    } finally {
      setLoading(false);
    }
  };

  // Générer des promotions dynamiques basées sur les services et infos salon
  const generatePromotions = (servicesList, salonData) => {
    const currentDate = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Promotions fixes
    const fixedPromotions = [
      {
        id: "1",
        type: "premiere-visite",
        title: "Première Visite Offerte !",
        subtitle: "Bienvenue dans notre salon",
        description: "Profitez de -20% sur votre première coupe dans notre salon. Une façon de vous remercier de nous avoir choisi.",
        discount: "20%",
        color1: "#FF6B6B",
        color2: "#FF8E8E",
        icon: "local-offer",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(nextMonth, "yyyy-MM-dd"),
        featured: true,
        conditions: "Valable uniquement pour la première visite. Non cumulable avec d'autres offres.",
        applicableServices: servicesList.filter(s => s.categorie === "coupe").map(s => s.id),
      },
      {
        id: "2",
        type: "package-complet",
        title: "Package Élégance",
        subtitle: "L'expérience complète",
        description: "Coupe + Brushing + Soin capillaire. Profitez de notre package complet à prix réduit pour une beauté totale.",
        discount: "15%",
        color1: "#4ECDC4",
        color2: "#6EDBD4",
        icon: "spa",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0), "yyyy-MM-dd"),
        featured: true,
        conditions: "Minimum 3 services requis. Réservation 48h à l'avance.",
        applicableServices: servicesList.slice(0, 3).map(s => s.id),
      },
      {
        id: "3",
        type: "loyalty",
        title: "Programme Fidélité",
        subtitle: "10€ offerts après 5 visites",
        description: "Cumulez des points à chaque visite et obtenez 10€ de réduction sur votre 5ème prestation.",
        discount: "10€",
        color1: "#FFD166",
        color2: "#FFE08C",
        icon: "loyalty",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 0), "yyyy-MM-dd"),
        featured: true,
        conditions: "Carte fidélité obligatoire. Valable sur toutes les prestations.",
      },
    ];

    // Promotion du mois (basée sur les services les moins réservés)
    if (servicesList.length > 0) {
      const monthlyService = servicesList[Math.floor(Math.random() * servicesList.length)];
      fixedPromotions.push({
        id: "4",
        type: "mois-special",
        title: "Service du Mois",
        subtitle: `Découvrez ${monthlyService.nom}`,
        description: `Ce mois-ci, profitez d'une réduction spéciale sur notre service "${monthlyService.nom}".`,
        discount: "25%",
        color1: "#9C89B8",
        color2: "#B5A8D9",
        icon: "star",
        startDate: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), "yyyy-MM-dd"),
        endDate: format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), "yyyy-MM-dd"),
        featured: false,
        conditions: `Valable uniquement pour "${monthlyService.nom}". Limité à une utilisation par client.`,
        applicableServices: [monthlyService.id],
        servicePrice: monthlyService.prix,
        discountedPrice: monthlyService.prix * 0.75,
      });
    }

    // Promotion anniversaire du salon
    if (salonData?.dateCreation) {
      const salonCreationDate = new Date(salonData.dateCreation);
      const currentMonth = currentDate.getMonth();
      const creationMonth = salonCreationDate.getMonth();
      
      if (currentMonth === creationMonth) {
        fixedPromotions.push({
          id: "5",
          type: "anniversaire",
          title: "Anniversaire du Salon",
          subtitle: "Célébrez avec nous !",
          description: `Pour fêter nos ${currentDate.getFullYear() - salonCreationDate.getFullYear()} ans, bénéficiez d'une offre exceptionnelle.`,
          discount: "30%",
          color1: "#EF476F",
          color2: "#FF6B8B",
          icon: "cake",
          startDate: format(new Date(currentDate.getFullYear(), currentMonth, 1), "yyyy-MM-dd"),
          endDate: format(new Date(currentDate.getFullYear(), currentMonth + 1, 0), "yyyy-MM-dd"),
          featured: true,
          conditions: "Offre limitée au mois d'anniversaire. Réservation obligatoire.",
        });
      }
    }

    return fixedPromotions;
  };

  // Formater la date
  const formatDateDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  // Calculer les jours restants
  const getDaysRemaining = (endDateString) => {
    try {
      const endDate = new Date(endDateString);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      return 0;
    }
  };

  // Afficher une promotion
  const renderPromotion = (promotion) => (
    <TouchableOpacity
      key={promotion.id}
      style={styles.promotionCard}
      onPress={() => navigation.navigate("Services")}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[promotion.color1, promotion.color2]}
        style={styles.promotionGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Badge featured */}
        {promotion.featured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={14} color="#FFF" />
            <Text style={styles.featuredText}>À LA UNE</Text>
          </View>
        )}

        {/* Contenu de la promotion */}
        <View style={styles.promotionHeader}>
          <View style={styles.promotionIconContainer}>
            <Icon name={promotion.icon} size={30} color="#FFF" />
          </View>
          <View style={styles.promotionTitleContainer}>
            <Text style={styles.promotionTitle}>{promotion.title}</Text>
            <Text style={styles.promotionSubtitle}>{promotion.subtitle}</Text>
          </View>
        </View>

        {/* Discount badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{promotion.discount}</Text>
        </View>

        {/* Description */}
        <Text style={styles.promotionDescription}>
          {promotion.description}
        </Text>

        {/* Détails */}
        <View style={styles.promotionDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={16} color="#FFF" />
            <Text style={styles.detailText}>
              Du {formatDateDisplay(promotion.startDate)} au {formatDateDisplay(promotion.endDate)}
            </Text>
          </View>
          
          {promotion.conditions && (
            <View style={styles.detailRow}>
              <Icon name="info" size={16} color="#FFF" />
              <Text style={styles.detailText}>{promotion.conditions}</Text>
            </View>
          )}

          {/* Jours restants */}
          <View style={styles.daysRemainingContainer}>
            <Icon name="timer" size={16} color="#FFF" />
            <Text style={styles.daysRemainingText}>
              {getDaysRemaining(promotion.endDate) > 0 
                ? `${getDaysRemaining(promotion.endDate)} jours restants`
                : "Expiré"}
            </Text>
          </View>
        </View>

        {/* Bouton d'action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (promotion.applicableServices) {
              // Naviguer vers les services avec filtre
              navigation.navigate("Services", { 
                highlightServices: promotion.applicableServices 
              });
            } else {
              navigation.navigate("Services");
            }
          }}
        >
          <Text style={styles.actionButtonText}>Profiter de l'offre</Text>
          <Icon name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Stats des promotions
  const getPromotionStats = () => {
    const activePromotions = promotions.filter(p => getDaysRemaining(p.endDate) > 0);
    const totalDiscount = promotions.reduce((sum, p) => {
      const discountValue = parseInt(p.discount) || 0;
      return sum + discountValue;
    }, 0);
    
    return {
      active: activePromotions.length,
      total: promotions.length,
      averageDiscount: promotions.length > 0 ? Math.round(totalDiscount / promotions.length) : 0,
      expiringSoon: promotions.filter(p => getDaysRemaining(p.endDate) <= 7 && getDaysRemaining(p.endDate) > 0).length,
    };
  };

  const stats = getPromotionStats();

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
          <Text style={styles.headerTitle}>Promotions</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Icon name="local-offer" size={60} color="#FF6B6B" />
          <Text style={styles.loadingText}>Chargement des offres...</Text>
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
        <Text style={styles.headerTitle}>Promotions</Text>
        <TouchableOpacity onPress={loadData}>
          <Icon name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Bannière principale */}
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.heroContent}>
            <Icon name="local-offer" size={50} color="#FFF" />
            <Text style={styles.heroTitle}>Nos Meilleures Offres</Text>
            <Text style={styles.heroSubtitle}>
              {stats.active} promotions actives • Jusqu'à {stats.averageDiscount}% de réduction
            </Text>
          </View>
        </LinearGradient>

        {/* Statistiques rapides */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>Actives</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Au total</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.expiringSoon}</Text>
            <Text style={styles.statLabel}>Bientôt expirées</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.infoBox}>
          <Icon name="info" size={24} color="#4ECDC4" style={styles.infoIcon} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Comment utiliser les promotions ?</Text>
            <Text style={styles.infoText}>
              1. Choisissez une promotion ci-dessous
              2. Cliquez sur "Profiter de l'offre"
              3. Sélectionnez un service éligible
              4. La réduction sera appliquée automatiquement lors du paiement
            </Text>
          </View>
        </View>

        {/* Liste des promotions */}
        <Text style={styles.sectionTitle}>Toutes nos promotions</Text>
        
        {promotions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="sentiment-dissatisfied" size={60} color="#CCC" />
            <Text style={styles.emptyText}>Aucune promotion disponible</Text>
            <Text style={styles.emptySubtext}>
              Revenez bientôt pour découvrir nos nouvelles offres
            </Text>
          </View>
        ) : (
          promotions.map(renderPromotion)
        )}

        {/* Informations importantes */}
        <View style={styles.importantInfo}>
          <Text style={styles.importantTitle}>Informations importantes</Text>
          <Text style={styles.importantText}>
            • Les promotions ne sont pas cumulables entre elles
            • Valable uniquement sur réservation en ligne
            • Les prix indiqués incluent déjà les réductions
            • Offres valables dans la limite des stocks disponibles
          </Text>
        </View>

        {/* Bouton pour réserver */}
        <TouchableOpacity
          style={styles.reservationButton}
          onPress={() => navigation.navigate("Services")}
        >
          <Icon name="event-available" size={24} color="#FFF" />
          <Text style={styles.reservationButtonText}>
            Réserver maintenant
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#FFF",
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
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  heroBanner: {
    margin: 20,
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 15,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFF",
    opacity: 0.9,
    marginTop: 5,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#E8F4F8",
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#4ECDC4",
  },
  infoIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 20,
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#CCC",
    textAlign: "center",
  },
  promotionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  promotionGradient: {
    padding: 25,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  featuredText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 5,
    letterSpacing: 1,
  },
  promotionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  promotionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  promotionTitleContainer: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  promotionSubtitle: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
  },
  discountBadge: {
    position: "absolute",
    top: 25,
    right: 25,
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  discountText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  promotionDescription: {
    fontSize: 15,
    color: "#FFF",
    lineHeight: 22,
    marginBottom: 20,
  },
  promotionDetails: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 13,
    color: "#FFF",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  daysRemainingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  daysRemainingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginLeft: 10,
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  importantInfo: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD166",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  importantTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  importantText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  reservationButton: {
    flexDirection: "row",
    backgroundColor: "#FF6B6B",
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginTop: 10,
    marginBottom: 30,
  },
  reservationButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default PromotionsScreen;