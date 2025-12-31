// screens/client/profile/UserProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { updateUser, deleteUser } from "../services/userService";

const UserProfileScreen = ({ navigation }) => {
  const { userData, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        nom: userData.nom || "",
        prenom: userData.prenom || "",
        telephone: userData.telephone || "",
        email: userData.email || "",
      });
    }
  }, [userData]);

  const handleUpdateProfile = async () => {
    if (!userData?.uid) return;

    try {
      setLoading(true);
      
      // Validation
      if (!formData.nom.trim() || !formData.prenom.trim()) {
        Alert.alert("Erreur", "Le nom et prénom sont obligatoires");
        return;
      }

      await updateUser(userData.uid, {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        telephone: formData.telephone.trim(),
      });

      Alert.alert("Succès", "Profil mis à jour avec succès");
      setEditMode(false);
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userData?.uid) return;

    try {
      setLoading(true);
      await deleteUser(userData.uid);
      
      Alert.alert(
        "Compte désactivé",
        "Votre compte a été désactivé avec succès",
        [
          {
            text: "OK",
            onPress: () => {
              logout();
              navigation.replace("Home");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur suppression:", error);
      Alert.alert("Erreur", "Impossible de supprimer le compte");
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
    }
  };

  const renderInfoCard = (title, value, icon, editable = false) => (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon} size={20} color="#666" />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      {editable && editMode ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            if (title === "Nom") setFormData({ ...formData, nom: text });
            else if (title === "Prénom") setFormData({ ...formData, prenom: text });
            else if (title === "Téléphone") setFormData({ ...formData, telephone: text });
          }}
          placeholder={`Entrez votre ${title.toLowerCase()}`}
        />
      ) : (
        <Text style={styles.infoValue}>{value || "Non renseigné"}</Text>
      )}
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notAuthenticated}>
          <Ionicons name="lock-closed" size={60} color="#ccc" />
          <Text style={styles.notAuthenticatedTitle}>Connexion requise</Text>
          <Text style={styles.notAuthenticatedText}>
            Connectez-vous pour accéder à votre profil
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userData?.prenom?.charAt(0) || userData?.nom?.charAt(0) || "U"}
            </Text>
          </View>
          <Text style={styles.userName}>
            {userData?.prenom} {userData?.nom}
          </Text>
          <Text style={styles.userRole}>
            {userData?.role === "admin" ? "Administrateur" : 
             userData?.role === "stylist" ? "Styliste" : "Client"}
          </Text>
          {userData?.pointsFidelite !== undefined && (
            <View style={styles.pointsContainer}>
              <Ionicons name="trophy" size={16} color="#FFD166" />
              <Text style={styles.pointsText}>
                {userData.pointsFidelite} points de fidélité
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Informations personnelles */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
              <TouchableOpacity
                onPress={() => setEditMode(!editMode)}
                disabled={loading}
              >
                <Text style={styles.editButton}>
                  {editMode ? "Annuler" : "Modifier"}
                </Text>
              </TouchableOpacity>
            </View>

            {renderInfoCard("Nom", formData.nom, "person", true)}
            {renderInfoCard("Prénom", formData.prenom, "person", true)}
            {renderInfoCard("Email", formData.email, "mail", false)}
            {renderInfoCard("Téléphone", formData.telephone, "call", true)}

            {editMode && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="save" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Actions rapides */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("MyReviews")}
            >
              <Ionicons name="star" size={22} color="#FFD166" />
              <Text style={styles.actionButtonText}>Voir mes avis</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Appointments")}
            >
              <Ionicons name="calendar" size={22} color="#FF6B6B" />
              <Text style={styles.actionButtonText}>Mes rendez-vous</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Services")}
            >
              <Ionicons name="cut" size={22} color="#4ECDC4" />
              <Text style={styles.actionButtonText}>Prendre rendez-vous</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Section sécurité */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sécurité</Text>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => setDeleteModalVisible(true)}
            >
              <Ionicons name="trash" size={22} color="#F44336" />
              <Text style={[styles.actionButtonText, styles.dangerText]}>
                Supprimer mon compte
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#F44336" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={logout}
            >
              <Ionicons name="log-out" size={22} color="#666" />
              <Text style={styles.actionButtonText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>
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
            <Ionicons name="warning" size={50} color="#F44336" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Supprimer le compte</Text>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer votre compte ?
              Cette action est irréversible et toutes vos données seront perdues.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelModalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmDeleteButton]}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Supprimer</Text>
                )}
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
    alignItems: "center",
    padding: 30,
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: "#4CAF50",
    marginBottom: 10,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 14,
    color: "#FF9800",
    fontWeight: "600",
    marginLeft: 5,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  infoCard: {
    marginBottom: 15,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  infoTitle: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    marginLeft: 28,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginLeft: 28,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  dangerButton: {
    borderBottomColor: "#FFCDD2",
  },
  dangerText: {
    color: "#F44336",
  },
  logoutButton: {
    borderBottomWidth: 0,
    marginTop: 10,
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
    marginBottom: 25,
    lineHeight: 22,
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

export default UserProfileScreen;