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

const StylisteList = ({ navigation }) => {
  const [stylistes, setStylistes] = useState([]);
  const [filteredStylistes, setFilteredStylistes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadStylistes();
  }, []);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredStylistes(stylistes);
    } else {
      const filtered = stylistes.filter(styliste =>
        styliste.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
        styliste.prenom?.toLowerCase().includes(searchText.toLowerCase()) ||
        styliste.email?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredStylistes(filtered);
    }
  }, [searchText, stylistes]);

  const loadStylistes = async () => {
    try {
      setLoading(true);
      const data = await getUsersByRole("styliste");
      const activeStylistes = data.filter(user => user.actif !== false);
      setStylistes(activeStylistes);
      setFilteredStylistes(activeStylistes);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les stylistes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStylistes();
  };

  const handleAffectSpecialites = (styliste) => {
    navigation.navigate("AffectSpecialites", { 
      stylisteUid: styliste.uid,
      stylisteId: styliste.id,
      stylisteName: `${styliste.prenom} ${styliste.nom}`
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des stylistes...</Text>
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
        <Text style={styles.headerTitle}>Liste des Stylistes</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un styliste..."
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
        {filteredStylistes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="content-paste-off" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText ? "Aucun styliste trouvé" : "Aucun styliste enregistré"}
            </Text>
            {!searchText && (
              <Text style={styles.emptySubtext}>
                Ajoutez des stylistes pour commencer
              </Text>
            )}
          </View>
        ) : (
          filteredStylistes.map((styliste) => (
            <View key={styliste.uid} style={styles.stylisteCard}>
              <View style={styles.stylisteAvatar}>
                <Text style={styles.avatarText}>
                  {styliste.prenom?.charAt(0)}{styliste.nom?.charAt(0)}
                </Text>
              </View>
              <View style={styles.stylisteInfo}>
                <Text style={styles.stylisteName}>
                  {styliste.prenom} {styliste.nom}
                </Text>
                <Text style={styles.stylisteEmail}>{styliste.email}</Text>
                <View style={styles.stylisteDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="phone" size={12} color="#666" />
                    <Text style={styles.stylisteTelephone}>
                      {styliste.telephone || "Non renseigné"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="star" size={12} color="#666" />
                    <Text style={styles.stylisteExperience}>
                      {styliste.experience || 0} ans d'expérience
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.affectButton}
                onPress={() => handleAffectSpecialites(styliste)}
              >
                <Icon name="assignment" size={18} color="#fff" />
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
  stylisteCard: {
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
  stylisteAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stylisteInfo: {
    flex: 1,
  },
  stylisteName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  stylisteEmail: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  stylisteDetails: {
    flexDirection: "column",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  stylisteTelephone: {
    fontSize: 11,
    color: "#666",
    marginLeft: 5,
  },
  stylisteExperience: {
    fontSize: 11,
    color: "#666",
    marginLeft: 5,
  },
  affectButton: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
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

export default StylisteList;