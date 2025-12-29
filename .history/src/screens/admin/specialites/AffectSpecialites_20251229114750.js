// screens/admin/AffectSpecialites.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getAllSpecialites } from '../../services/specialiteService';
import { getSpecialitesWithAffectation, updateStylisteSpecialites } from '../../../services/affectationService';

const AffectSpecialites = ({ navigation, route }) => {
  const params = route?.params || {};
  const stylisteUid = params.stylisteUid;
  const stylisteId = params.stylisteId;
  const stylisteName = params.stylisteName || "Styliste";
  
  const [specialites, setSpecialites] = useState([]);
  const [selectedSpecialites, setSelectedSpecialites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (stylisteUid) {
      loadData();
    } else {
      Alert.alert("Erreur", "Aucun styliste sélectionné");
      navigation.goBack();
    }
  }, [stylisteUid]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les spécialités avec info d'affectation
      const specialitesWithAffectation = await getSpecialitesWithAffectation(stylisteUid);
      
      const selectedIds = specialitesWithAffectation
        .filter(s => s.isAssigned)
        .map(s => s.id);
      
      setSpecialites(specialitesWithAffectation);
      setSelectedSpecialites(selectedIds);
      
    } catch (error) {
      console.error("Erreur de chargement:", error);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleSpecialite = (specialiteId) => {
    setSpecialites(prev =>
      prev.map(specialite =>
        specialite.id === specialiteId
          ? { ...specialite, isAssigned: !specialite.isAssigned }
          : specialite
      )
    );

    setSelectedSpecialites(prev => {
      if (prev.includes(specialiteId)) {
        return prev.filter(id => id !== specialiteId);
      } else {
        return [...prev, specialiteId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!stylisteUid) {
        throw new Error("Aucun styliste sélectionné");
      }
      
      await updateStylisteSpecialites(stylisteUid, selectedSpecialites);
      
      Alert.alert(
        "Succès",
        "Spécialités affectées avec succès",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      Alert.alert("Erreur", error.message || "Impossible de sauvegarder les affectations");
    } finally {
      setSaving(false);
    }
  };

  if (!stylisteUid) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
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
        <Text style={styles.headerTitle}>Affecter des Spécialités</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.stylisteInfo}>
        <View style={styles.stylisteAvatar}>
          <Text style={styles.avatarText}>
            {stylisteName.split(' ').map(n => n.charAt(0)).join('')}
          </Text>
        </View>
        <View style={styles.stylisteDetails}>
          <Text style={styles.stylisteName}>{stylisteName}</Text>
          <Text style={styles.stylisteId}>ID: {stylisteUid.substring(0, 8)}...</Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {selectedSpecialites.length} / {specialites.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.infoCard}>
          <Icon name="info" size={18} color="#2196F3" />
          <Text style={styles.infoText}>
            Sélectionnez les spécialités pour {stylisteName}. Un styliste peut avoir plusieurs spécialités.
          </Text>
        </View>

        {specialites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="style" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune spécialité disponible</Text>
            <Text style={styles.emptySubtext}>
              Créez d'abord des spécialités dans la gestion des spécialités
            </Text>
          </View>
        ) : (
          specialites.map((specialite) => (
            <View key={specialite.id} style={styles.specialiteItem}>
              <View style={styles.specialiteContent}>
                <View style={styles.specialiteHeader}>
                  <Text style={styles.specialiteName}>{specialite.nom}</Text>
                  <Text style={styles.specialiteId}>ID: {specialite.id.substring(0, 8)}...</Text>
                </View>
                <Text style={styles.specialiteDescription}>
                  {specialite.description || "Pas de description"}
                </Text>
                {specialite.nombreCoiffeurs !== undefined && (
                  <Text style={styles.stylisteCount}>
                    {specialite.nombreCoiffeurs} styliste(s) ont cette spécialité
                  </Text>
                )}
              </View>
              <Switch
                value={specialite.isAssigned}
                onValueChange={() => toggleSpecialite(specialite.id)}
                trackColor={{ false: "#ddd", true: "#2196F3" }}
                thumbColor={specialite.isAssigned ? "#fff" : "#f4f3f4"}
                disabled={saving}
              />
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || selectedSpecialites.length === 0}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="save" size={20} color="#fff" style={styles.saveIcon} />
              <Text style={styles.saveButtonText}>
                Enregistrer ({selectedSpecialites.length})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  stylisteInfo: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stylisteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  stylisteDetails: {
    flex: 1,
  },
  stylisteName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  stylisteId: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  counterBadge: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#1565C0",
    fontSize: 12,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 10,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  specialiteItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  specialiteContent: {
    flex: 1,
    marginRight: 15,
  },
  specialiteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  specialiteName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  specialiteId: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  specialiteDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginBottom: 5,
  },
  stylisteCount: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AffectSpecialites;