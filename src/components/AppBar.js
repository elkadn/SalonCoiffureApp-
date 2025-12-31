// components/AppBar.js - VERSION DYNAMIQUE
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { salonService } from "../services/salonService";

export const AppBar = ({
  navigation,
  title,
  showLogo = true,
  showMenuButton = true,
  openDrawer,
}) => {
  const { currentUser, userData } = useAuth();
  const [salonInfo, setSalonInfo] = useState(null);
  const [logoUri, setLogoUri] = useState(null);

  useEffect(() => {
    loadSalonInfo();
  }, []);

  const loadSalonInfo = async () => {
    try {
      const info = await salonService.getSalonInfo();
      setSalonInfo(info);

      // Priorité à logoUrl (Cloudinary), fallback à logoPath (ancien système)
      if (info.logoUrl) {
        setLogoUri(info.logoUrl); // URL Cloudinary directe
      } else if (info.logoPath) {
        setLogoUri(info.logoPath);
      }
    } catch (error) {
      console.error("Erreur chargement info salon:", error);
    }
  };

  const handleMenuPress = () => {
    if (openDrawer && typeof openDrawer === "function") {
      openDrawer();
    }
  };

  const displayTitle = title || salonInfo?.nom || "Salon de Coiffure";

  return (
    <View style={styles.appBarContainer}>
      <View style={styles.appBar}>
        {/* Bouton Menu à gauche */}
        {showMenuButton && (
          <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        )}

        {/* Logo/Titre au centre */}
        <View style={styles.logoContainer}>
          {showLogo && logoUri ? (
            <Image
              source={{ uri: logoUri }}
              style={styles.logoImage}
              onError={() => setLogoUri(null)} // Fallback si erreur
            />
          ) : (
            <Text style={styles.title} numberOfLines={1}>
              {displayTitle}
            </Text>
          )}
        </View>

        {/* Badge utilisateur à droite */}
        {currentUser && (
          <View style={styles.rightSection}>
            <View style={styles.userBadge}>
              <TouchableOpacity onPress={handleMenuPress}>
                <Text style={styles.userInitial}>
                  {userData?.prenom?.charAt(0) ||
                    userData?.email?.charAt(0) ||
                    "U"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 15,
    marginTop: 40,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  menuIcon: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  logoImage: {
    width: 120,
    height: 30,
    resizeMode: "contain",
  },
  rightSection: {
    width: 40,
    alignItems: "flex-end",
  },
  userBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  userInitial: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
