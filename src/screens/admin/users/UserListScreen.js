import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  ScrollView,
} from "react-native";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  searchUsers,
} from "../../../services/userService";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { auth } from "../../../firebase/firebaseConfig";
import { useAuth } from "../../../context/AuthContext";

const UserListScreen = ({ navigation, route }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    loadUsers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUsers();
    }, [])
  );
  useEffect(() => {
    filterUsers();
  }, [users, searchText, selectedRole]);

  const loadUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          user.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.prenom?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      "Confirmer la suppression",
      `Désactiver l'utilisateur ${userName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Désactiver",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(userId);
              loadUsers();
              Alert.alert("Succès", "Utilisateur désactivé");
            } catch (error) {
              Alert.alert("Erreur", "Impossible de désactiver l'utilisateur");
            }
          },
        },
      ]
    );
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

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.userCard,
        !item.actif && styles.userCardInactive, 
      ]}
      onPress={() =>
        navigation.navigate("UserDetail", {
          userId: item.id,
          currentUserId: currentUserId,
        })
      }
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <View style={[styles.avatar, !item.actif && styles.avatarInactive]}>
            <Text style={styles.avatarText}>
              {item.prenom?.[0]}
              {item.nom?.[0]}
            </Text>
            {!item.actif && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>X</Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text
              style={[styles.userName, !item.actif && styles.userNameInactive]}
            >
              {item.prenom} {item.nom}
              {!item.actif && " (Désactivé)"}
            </Text>
            <Text
              style={[
                styles.userEmail,
                !item.actif && styles.userEmailInactive,
              ]}
            >
              {item.email}
            </Text>
          </View>
        </View>

        <View style={styles.userMeta}>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleColor(item.role) },
              !item.actif && styles.roleBadgeInactive,
            ]}
          >
            <Text style={styles.roleText}>
              {getRoleIcon(item.role)} {getRoleLabel(item.role)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.actif ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <Text style={styles.statusText}>
              {item.actif ? "✅ Actif" : "❌ Inactif"}
            </Text>
          </View>

          {item.role === "client" && item.pointsFidelite !== undefined && (
            <Text
              style={[
                styles.specificInfo,
                !item.actif && styles.specificInfoInactive,
              ]}
            >
              🎯 {item.pointsFidelite} points
            </Text>
          )}

          {item.role === "styliste" && item.experience !== undefined && (
            <Text
              style={[
                styles.specificInfo,
                !item.actif && styles.specificInfoInactive,
              ]}
            >
              📅 {item.experience} ans exp.
            </Text>
          )}

          {item.role === "assistante" && item.poste && (
            <Text
              style={[
                styles.specificInfo,
                !item.actif && styles.specificInfoInactive,
              ]}
            >
              💼 {item.poste}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        {item.role === "styliste" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("StylisteCreneaux", {
                stylisteId: item.id,
                stylisteName: `${item.prenom} ${item.nom}`,
              })
            }
          >
            <Icon name="schedule" size={20} color="#FF9800" />
          </TouchableOpacity>
        )}

        {item.role === "client" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("ProfilCapillaire", {
                clientId: item.id,
                clientName: `${item.prenom} ${item.nom}`,
              })
            }
          >
            <Icon name="content-cut" size={20} color="#4CAF50" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (item.id === currentUserId) {
              Alert.alert(
                "Information",
                "Vous ne pouvez pas modifier votre propre compte depuis cette interface"
              );
            } else {
              navigation.navigate("UserForm", { userId: item.id });
            }
          }}
          disabled={item.id === currentUserId} 
        >
          <Icon
            name="edit"
            size={20}
            color={item.id === currentUserId ? "#ccc" : "#2196F3"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (item.id === currentUserId) {
              Alert.alert(
                "Information",
                "Vous ne pouvez pas modifier l'état de votre propre compte"
              );
            } else if (!item.actif) {
              handleActivateUser(item.id, `${item.prenom} ${item.nom}`);
            } else {
              handleDeleteUser(item.id, `${item.prenom} ${item.nom}`);
            }
          }}
          disabled={item.id === currentUserId}
        >
          <Icon
            name={item.actif ? "delete" : "check-circle"}
            size={20}
            color={
              item.id === currentUserId
                ? "#ccc"
                : item.actif
                ? "#F44336"
                : "#4CAF50"
            }
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleActivateUser = async (userId, userName, user) => {
    Alert.alert(
      "Confirmer l'activation",
      `Activer l'utilisateur ${userName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Activer",
          style: "default",
          onPress: async () => {
            try {
              await updateUser(userId, { actif: true });
              Alert.alert("Succès", "Utilisateur activé");
              loadUsers(); 
            } catch (error) {
              Alert.alert("Erreur", "Impossible d'activer l'utilisateur");
            }
          },
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people" size={80} color="#e0e0e0" />
      <Text style={styles.emptyStateText}>Aucun utilisateur trouvé</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Utilisateurs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("UserForm", { userId: null })}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un utilisateur..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.roleFilter}
        >
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === "all" && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole("all")}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === "all" && styles.roleButtonTextActive,
              ]}
            >
              👥 Tous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === "admin" && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole("admin")}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === "admin" && styles.roleButtonTextActive,
              ]}
            >
              👑 Admins
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === "styliste" && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole("styliste")}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === "styliste" && styles.roleButtonTextActive,
              ]}
            >
              ✂️ Stylistes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === "client" && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole("client")}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === "client" && styles.roleButtonTextActive,
              ]}
            >
              👤 Clients
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === "assistante" && styles.roleButtonActive,
            ]}
            onPress={() => setSelectedRole("assistante")}
          >
            <Text
              style={[
                styles.roleButtonText,
                selectedRole === "assistante" && styles.roleButtonTextActive,
              ]}
            >
              💼 Assistantes
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop : 50,
    paddingBottom : 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  roleFilter: {
    flexDirection: "row",
  },
  roleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  roleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  roleButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 15,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#666",
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 5,
  },
  roleText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  specificInfo: {
    fontSize: 11,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 5,
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyStateText: {
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },

  userCardInactive: {
    backgroundColor: "#f8f8f8",
    opacity: 0.8,
  },

  avatarInactive: {
    backgroundColor: "#999",
    opacity: 0.7,
  },

  userNameInactive: {
    color: "#999",
    fontStyle: "italic",
  },

  userEmailInactive: {
    color: "#aaa",
  },

  roleBadgeInactive: {
    opacity: 0.6,
  },

  specificInfoInactive: {
    color: "#aaa",
    backgroundColor: "#e8e8e8",
  },

  inactiveBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#F44336",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  inactiveBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 5,
  },

  statusActive: {
    backgroundColor: "#E8F5E9",
  },

  statusInactive: {
    backgroundColor: "#FFEBEE",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  activateButton: {
    backgroundColor: "#4CAF50",
  },

  filterButtonsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },

  statusFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },

  statusFilterButtonActive: {
    backgroundColor: "#4CAF50",
  },

  statusFilterButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  statusFilterButtonTextActive: {
    color: "#fff",
  },
});

export default UserListScreen;
