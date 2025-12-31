import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllServices } from "../services/serviceService";
import { getSalonInfo } from "../services/salonService";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salonInfo, setSalonInfo] = useState(null); // ← NOUVEAU ÉTAT
  const [salonLoading, setSalonLoading] = useState(true); // ← NOUVEAU ÉTAT

  useEffect(() => {
    loadFeaturedServices();
    loadSalonInfo(); // ← Appeler la fonction
  }, []);

  const loadSalonInfo = async () => {
    try {
      setSalonLoading(true);
      const info = await getSalonInfo();
      setSalonInfo(info);
    } catch (error) {
      console.error("Erreur chargement infos salon:", error);
    } finally {
      setSalonLoading(false);
    }
  };

  const loadFeaturedServices = async () => {
    try {
      const services = await getAllServices();
      // Prendre les 4 premiers services actifs comme services en vedette
      const featured = services
        .filter((service) => service.actif !== false)
        .slice(0, 4);
      setFeaturedServices(featured);
    } catch (error) {
      console.error("Erreur chargement services:", error);
    } finally {
      setLoading(false);
    }
  };

  // Données des pubs
  const promotions = [
    {
      id: "1",
      title: "Première visite",
      description: "-20% sur votre première coupe",
      icon: "cut-outline",
      color: "#FF6B6B",
    },
    {
      id: "2",
      title: "Package complet",
      description: "Coupe + Brushing + Soin",
      icon: "sparkles-outline",
      color: "#4ECDC4",
    },
    {
      id: "3",
      title: "Loyalty Program",
      description: "10€ offerts après 5 visites",
      icon: "gift-outline",
      color: "#FFD166",
    },
  ];

  const renderPromotionCard = ({ item }) => (
    <View style={[styles.promoCard, { backgroundColor: item.color }]}>
      <Ionicons name={item.icon} size={30} color="white" />
      <Text style={styles.promoTitle}>{item.title}</Text>
      <Text style={styles.promoDesc}>{item.description}</Text>
    </View>
  );

  const renderServiceCard = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() =>
        navigation.navigate("ServiceDetails", { serviceId: item.id })
      }
    >
      <View style={styles.serviceIcon}>
        <Ionicons name="cut" size={24} color="#333" />
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.nom}</Text>
        <Text style={styles.servicePrice}>{item.prix}€</Text>
        <Text style={styles.serviceDuration}>{item.duree} min</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeTitle}>
            {salonInfo?.nom || "Salon Élégance"}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {salonInfo?.description || "Votre beauté, notre passion"}
          </Text>
        </View>

        {/* Section promotions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Promotions du moment</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Promotions")}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={promotions}
            renderItem={renderPromotionCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoList}
          />
        </View>

        {/* Section fonctionnalités */}
        <View style={styles.featuresSection}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate("Services")}
          >
            <View style={styles.featureIcon}>
              <Ionicons name="calendar" size={28} color="#FF6B6B" />
            </View>
            <Text style={styles.featureText}>Prendre RDV</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name="receipt" size={28} color="#4ECDC4" />
            </View>
            <Text style={styles.featureText}>Facturation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate("MyReviews")}
          >
            <View style={styles.featureIcon}>
              <Ionicons name="star" size={28} color="#FFD166" />
            </View>
            <Text style={styles.featureText}>Mes avis</Text>
          </TouchableOpacity>
        </View>

        {/* Section services populaires */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services populaires</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Services")}>
              <Text style={styles.seeAll}>Voir tous</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : (
            <FlatList
              data={featuredServices}
              renderItem={renderServiceCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Call to Action */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate("Services")}
        >
          <Text style={styles.ctaText}>Découvrir tous nos services</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Footer info */}
        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={24} color="#333" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Horaires d'ouverture</Text>

            {salonInfo?.horaires ? (
              <>
                <Text style={styles.infoContent}>
                  Lun-Ven: {salonInfo.horaires.lundi || "9h-19h"}
                </Text>
                <Text style={styles.infoContent}>
                  Sam: {salonInfo.horaires.samedi || "9h-17h"}
                </Text>
                <Text style={styles.infoContent}>
                  Dim: {salonInfo.horaires.dimanche || "Fermé"}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.infoContent}>Lun-Sam: 9h-19h</Text>
                <Text style={styles.infoContent}>Dim: 10h-16h</Text>
              </>
            )}
          </View>
        </View>
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
    padding: 20,
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: 50,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  seeAll: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  promoList: {
    paddingRight: 20,
  },
  promoCard: {
    width: width * 0.7,
    padding: 20,
    borderRadius: 15,
    marginRight: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
    marginBottom: 5,
  },
  promoDesc: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  featureCard: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    width: width * 0.25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  serviceCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  serviceDuration: {
    fontSize: 14,
    color: "#666",
  },
  ctaButton: {
    flexDirection: "row",
    backgroundColor: "#333",
    marginHorizontal: 20,
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  ctaText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  infoContent: {
    fontSize: 14,
    color: "#666",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    paddingVertical: 20,
  },
});

export default HomeScreen;
