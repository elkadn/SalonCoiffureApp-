// screens/admin/CoiffeurList.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getUsersByRole } from '../../../services/userService';

const CoiffeurList = ({ navigation }) => {
  const [coiffeurs, setCoiffeurs] = useState([]);
  const [filteredCoiffeurs, setFilteredCoiffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadCoiffeurs();
  }, []);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredCoiffeurs(coiffeurs);
    } else {
      const filtered = coiffeurs.filter(coiffeur =>
        coiffeur.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
        coiffeur.prenom?.toLowerCase().includes(searchText.toLowerCase()) ||
        coiffeur.email?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCoiffeurs(filtered);
    }
  }, [searchText, coiffeurs]);

  const loadCoiffeurs = async () => {
    try {
      setLoading(true);
      const data = await getUsersByRole("coiffeur");
      setCoiffeurs(data);
      setFilteredCoiffeurs(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les coiffeurs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCoiffeurs();
  };

  const handleAffectSpecialites = (coiffeur) => {
    navigation.navigate("AffectSpecialites", { coiffeurId: coiffeur.id, coiffeurName: `${coiffeur.prenom} ${coiffeur.nom}` });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des coiffeurs...</Text>
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
        <Text style={styles.headerTitle}>Liste des Coiffeurs</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un coiffeur..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredCoiffeurs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="content-paste-off" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText ? "Aucun coiffeur trouvé" : "Aucun coiffeur enregistré"}
            </Text>
            {!searchText && (
              <Text style={styles.emptySubtext}>
                Ajoutez des coiffeurs pour commencer
              </Text>
            )}
          </View>
        ) : (
          filteredCoiffeurs.map((coiffeur) => (
            <View key={coiffeur.id} style={styles.coiffeurCard}>
              <View style={styles.coiffeurAvatar}>
                <Icon name="person" size={30} color="#666" />
              </View>
              <View style={styles.coiffeurInfo}>
                <Text style={styles.coiffeurName}>
                  {coiffeur.prenom} {coiffeur.nom}
                </Text>
                <Text style={styles.coiffeurEmail}>{coiffeur.email}</Text>
                <Text style={styles.coiffeurTelephone}>
                  {coiffeur.telephone || "Téléphone non renseigné"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.affectButton}
                onPress={() => handleAffectSpecialites(coiffeur)}
              >
                <Icon name="assignment" size={20} color="#fff" />
                <Text style={styles.affectButtonText}>Affecter</Text>
              </TouchableOpacity>
            </View>
          ))
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 50,
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
  coiffeurCard: {
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
  coiffeurAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  coiffeurInfo: {
    flex: 1,
  },
  coiffeurName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  coiffeurEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  coiffeurTelephone: {
    fontSize: 12,
    color: "#888",
  },
  affectButton: {
    backgroundColor: "#E91E63",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  affectButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
});

export default CoiffeurList;