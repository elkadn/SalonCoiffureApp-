import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { salonService } from "../services/salonService";
import Icon from "react-native-vector-icons/MaterialIcons";

const SplashScreen = ({ navigation }) => {
  const [loadingText, setLoadingText] = useState("Chargement...");
  const [logoUri, setLogoUri] = useState(null);
  const [salonName, setSalonName] = useState("");

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoadingText("Chargement du salon...");
        const salonInfo = await salonService.getSalonInfo();
        setSalonName(salonInfo.nom);

        if (salonInfo.logoUrl) {
          setLoadingText("Chargement du logo...");
          setLogoUri(salonInfo.logoUrl);
        } else if (salonInfo.logoPath) {
          setLoadingText("Chargement du logo...");
          const logo = await salonService.loadSalonLogo();
          if (logo) {
            setLogoUri(logo);
          }
        }

        setTimeout(() => {
          setLoadingText("Préparation de l'application...");
        }, 500);

        setTimeout(() => {
          navigation.replace("Main");
        }, 2000);
      } catch (error) {
        console.error("Erreur initialisation:", error);
        setTimeout(() => {
          navigation.replace("Main");
        }, 2000);
      }
    };

    initialize();
  }, [navigation]);

  return (
    <View style={styles.container}>
      {logoUri ? (
        <Image
          source={{ uri: logoUri }}
          style={styles.logo}
          resizeMode="contain"
          onError={() => setLogoUri(null)} 
        />
      ) : (
        <View style={styles.logoFallback}>
          <Icon name="content-cut" size={80} color="#4CAF50" />
          <Text style={styles.logoText}>
            {salonName || "Salon de Coiffure"}
          </Text>
        </View>
      )}

      <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />

      <Text style={styles.loadingText}>{loadingText}</Text>

      {salonName && (
        <View style={styles.salonInfo}>
          <Text style={styles.salonName}>{salonName}</Text>
          <Text style={styles.welcomeText}>Bienvenue !</Text>
        </View>
      )}

      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
  logoFallback: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 15,
    textAlign: "center",
  },
  spinner: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  salonInfo: {
    alignItems: "center",
    marginTop: 20,
    padding: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    width: "100%",
  },
  salonName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 5,
    fontStyle: "italic",
  },
  version: {
    position: "absolute",
    bottom: 30,
    fontSize: 12,
    color: "#999",
  },
});

export default SplashScreen;
