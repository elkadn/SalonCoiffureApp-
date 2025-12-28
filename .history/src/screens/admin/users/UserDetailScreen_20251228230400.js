import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { getUserById, deleteUser } from "../../../services/userService";
import Icon from "react-native-vector-icons/MaterialIcons";
import { auth } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";

const UserDetailScreen = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid;

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userData = await getUserById(userId);
      setUser(userData);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  const handleActivate = async () => {
    Alert.alert(
      "Confirmer l'activation",
      `Activer l'utilisateur ${user?.prenom} ${user?.nom} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Activer",
          style: "default",
          onPress: async () => {
            try {
              await updateUser(userId, { actif: true });
              Alert.alert("Succès", "Utilisateur activé");
              loadUserData(); // Recharger les données
            } catch (error) {
              Alert.alert("Erreur", "Impossible d'activer l'utilisateur");
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmer la désactivation",
      `Désactiver l'utilisateur ${user?.prenom} ${user?.nom} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Désactiver",
          style: "destructive",
          onPress: async () => {
            try {
              await updateUser(userId, { actif: false });
              Alert.alert("Succès", "Utilisateur désactivé");
              loadUserData(); // Recharger les données
            } catch (error) {
              Alert.alert("Erreur", "Impossible de désactiver l'utilisateur");
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (user?.telephone) {
      Linking.openURL(`tel:${user.telephone}`);
    }
  };

  const handleEmail = () => {
    if (user?.email) {
      Linking.openURL(`mailto:${user.email}`);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#FF5252";
      case "styliste":
        return "#FF9800";
      case "client":
        return "#4CAF50";
      case "assistante":
        return "#9C27B0";
      default:
        return "#9E9E9E";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return "👑";
      case "styliste":
        return "✂️";
      case "client":
        return "👤";
      case "assistante":
        return "💼";
      default:
        return "👤";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "styliste":
        return "Styliste";
      case "client":
        return "Client";
      case "assistante":
        return "Assistante";
      default:
        return role;
    }
  };

  // PAR cette version corrigée :
  const formatDate = (timestamp) => {
    if (!timestamp) return "Non spécifié";

    let date;

    // Si c'est un timestamp Firestore (avec seconds/nanoseconds)
    if (timestamp.seconds !== undefined) {
      date = new Date(timestamp.seconds * 1000);
    }
    // Si c'est un objet Date standard
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Si c'est une chaîne de caractères
    else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    }
    // Si c'est un nombre (timestamp en millisecondes)
    else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    }
    // Sinon, retourne une valeur par défaut
    else {
      return "Date invalide";
    }

    // Vérifie si la date est valide
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails Utilisateur</Text>
        <TouchableOpacity
          disabled={userId === currentUserId}
          style={styles.editButton}
          onPress={() => navigation.navigate("UserForm", { userId })}
        >
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Photo/Initiales */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user.prenom?.[0]}
              {user.nom?.[0]}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user.prenom} {user.nom}
          </Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleColor(user.role) },
            ]}
          >
            <Text style={styles.roleBadgeText}>
              {getRoleIcon(user.role)} {getRoleLabel(user.role)}
            </Text>
          </View>
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Personnelles</Text>

          <View style={styles.infoRow}>
            <Icon name="email" size={20} color="#666" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            <TouchableOpacity onPress={handleEmail}>
              <Icon name="mail-outline" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>

          {user.telephone && (
            <View style={styles.infoRow}>
              <Icon
                name="phone"
                size={20}
                color="#666"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{user.telephone}</Text>
              </View>
              <TouchableOpacity onPress={handleCall}>
                <Icon name="call" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoRow}>
            <Icon
              name="person"
              size={20}
              color="#666"
              style={styles.infoIcon}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ID Utilisateur</Text>
              <Text
                style={styles.infoValue}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {user.uid || user.id}
              </Text>
            </View>
          </View>
        </View>

        {/* Informations spécifiques selon le rôle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Spécifiques</Text>

          {user.role === "client" && user.pointsFidelite !== undefined && (
            <View style={styles.specificInfoRow}>
              <Icon
                name="star"
                size={20}
                color="#FFD700"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Points de fidélité</Text>
                <Text style={styles.infoValue}>
                  {user.pointsFidelite} points
                </Text>
              </View>
            </View>
          )}

          {user.role === "styliste" && user.experience !== undefined && (
            <View style={styles.specificInfoRow}>
              <Icon
                name="work"
                size={20}
                color="#FF9800"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Expérience</Text>
                <Text style={styles.infoValue}>{user.experience} années</Text>
              </View>
            </View>
          )}

          {user.role === "assistante" && user.poste && (
            <View style={styles.specificInfoRow}>
              <Icon
                name="badge"
                size={20}
                color="#9C27B0"
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Poste</Text>
                <Text style={styles.infoValue}>{user.poste}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Statut */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut</Text>

          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Statut</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      user.actif !== false ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {user.actif !== false ? "Actif" : "Inactif"}
                </Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Date de création</Text>
              <Text style={styles.statusValue}>
                {formatDate(user.dateCreation)}
              </Text>
            </View>

            {user.dateModification && (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Dernière modification</Text>
                <Text style={styles.statusValue}>
                  {formatDate(user.dateModification)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions spécifiques pour les stylistes */}
        {user.role === "styliste" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestion des créneaux</Text>
            <TouchableOpacity
              style={styles.creneauButton}
              onPress={() =>
                navigation.navigate("StylisteCreneaux", {
                  stylisteId: userId,
                  stylisteName: `${user.prenom} ${user.nom}`,
                })
              }
            >
              <Icon
                name="schedule"
                size={24}
                color="#FF9800"
                style={styles.creneauIcon}
              />
              <View style={styles.creneauContent}>
                <Text style={styles.creneauTitle}>
                  Gérer les créneaux horaires
                </Text>
                <Text style={styles.creneauDescription}>
                  Définir les disponibilités du styliste
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* NOUVELLE SECTION : Profil capillaire pour les clients */}
        {user.role === "client" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profil Capillaire</Text>
            <TouchableOpacity
              style={styles.profilButton}
              onPress={() =>
                navigation.navigate("ProfilCapillaire", {
                  clientId: userId,
                  clientName: `${user.prenom} ${user.nom}`,
                })
              }
            >
              <Icon
                name="content-cut"
                size={24}
                color="#4CAF50"
                style={styles.profilIcon}
              />
              <View style={styles.profilContent}>
                <Text style={styles.profilTitle}>
                  Gérer le profil capillaire
                </Text>
                <Text style={styles.profilDescription}>
                  Informations sur les cheveux, traitements, etc.
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {/* Ajoute ce bouton pour les clients */}
          {user.role === "client" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.profilAction]}
              onPress={() =>
                navigation.navigate("ProfilCapillaire", {
                  clientId: userId,
                  clientName: `${user.prenom} ${user.nom}`,
                })
              }
            >
              <Icon
                name="content-cut"
                size={20}
                color="#fff"
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Profil</Text>
            </TouchableOpacity>
          )}
          {user.role === "styliste" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.creneauAction]}
              onPress={() =>
                navigation.navigate("StylisteCreneaux", {
                  stylisteId: userId,
                  stylisteName: `${user.prenom} ${user.nom}`,
                })
              }
            >
              <Icon
                name="schedule"
                size={20}
                color="#fff"
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Créneaux</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.editAction]}
            onPress={() => {
              if (userId === currentUserId) {
                Alert.alert(
                  "Information",
                  "Vous ne pouvez pas modifier votre propre compte depuis cette interface"
                );
              } else {
                navigation.navigate("UserForm", { userId });
              }
            }}
            disabled={userId === currentUserId}
          >
            <Icon
              name="edit"
              size={20}
              color={userId === currentUserId ? "#ccc" : "#fff"}
              style={styles.actionIcon}
            />
            <Text
              style={[
                styles.actionText,
                userId === currentUserId && { color: "#ccc" },
              ]}
            >
              Modifier
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              user.actif !== false
                ? styles.deleteAction
                : styles.activateAction,
            ]}
            onPress={() => {
              if (userId === currentUserId) {
                Alert.alert(
                  "Information",
                  "Vous ne pouvez pas modifier votre propre compte"
                );
              } else {
                // Si actif, désactiver ; si inactif, activer
                if (user.actif !== false) {
                  handleDelete();
                } else {
                  handleActivate();
                }
              }
            }}
            disabled={userId === currentUserId}
          >
            <Icon
              name={user.actif !== false ? "delete" : "check-circle"}
              size={20}
              color={userId === currentUserId ? "#ccc" : "#fff"}
              style={styles.actionIcon}
            />
            <Text
              style={[
                styles.actionText,
                userId === currentUserId && { color: "#ccc" },
              ]}
            >
              {user.actif !== false ? "Désactiver" : "Activer"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#4CAF50",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  editButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarLargeText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  specificInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statusItem: {
    width: "50%",
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  creneauButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  creneauIcon: {
    marginRight: 15,
  },
  creneauContent: {
    flex: 1,
  },
  creneauTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  creneauDescription: {
    fontSize: 12,
    color: "#666",
  },
  actionsSection: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  creneauAction: {
    backgroundColor: "#FF9800",
  },
  editAction: {
    backgroundColor: "#2196F3",
  },
  deleteAction: {
    backgroundColor: "#F44336",
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  profilButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  profilIcon: {
    marginRight: 15,
  },
  profilContent: {
    flex: 1,
  },
  profilTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  profilDescription: {
    fontSize: 12,
    color: "#666",
  },
  profilAction: {
    backgroundColor: "#4CAF50",
  },
  activateAction: {
    backgroundColor: "#4CAF50", // Vert pour activer
  },
});

export default UserDetailScreen;
