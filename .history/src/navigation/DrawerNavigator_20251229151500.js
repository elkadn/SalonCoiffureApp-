import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView 
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

// Importez vos écrans
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import DashboardScreen from "../screens/admin/DashboardScreen";
import UserListScreen from "../screens/admin/users/UserListScreen";
import CoiffeurManagement from "../screens/admin/CoiffeurManagement";
import ProductManagement from "../screens/admin/produits/ProductManagement";

const Stack = createNativeStackNavigator();

// Composant Drawer personnalisé
export const CustomDrawer = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { currentUser, userData, logout } = useAuth(); // CHANGÉ: utilisez userData

  const menuItems = [
    { label: "Accueil", screen: "Home", icon: "🏠" },
    ...(!currentUser ? [{ label: "Connexion", screen: "Login", icon: "🔐" }] : []),
    ...(userData?.role === "admin"
      ? [
          { label: "Tableau de bord", screen: "Dashboard", icon: "📊" },
          { label: "Gestion Utilisateurs", screen: "UserList", icon: "👥" },
          { label: "Gestion Coiffeurs", screen: "CoiffeurManagement", icon: "💇" },
          { label: "Gestion Produits", screen: "ProductManagement", icon: "📦" },
        ]
      : []),
    ...(currentUser ? [{ label: "Déconnexion", action: logout, icon: "🚪" }] : []),
  ];

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const handleMenuItemPress = (item) => {
    closeDrawer();
    if (item.action) {
      item.action();
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <>
      {/* Bouton pour ouvrir le drawer */}
      <TouchableOpacity style={styles.drawerButton} onPress={openDrawer}>
        <Text style={styles.drawerButtonIcon}>☰</Text>
      </TouchableOpacity>

      {/* Drawer Modal */}
      <Modal
        transparent
        visible={drawerVisible}
        animationType="slide"
        onRequestClose={closeDrawer}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={closeDrawer}
        >
          <View style={styles.drawerContainer}>
            <View style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <Text style={styles.headerTitle}>Salon de Coiffure</Text>
                {currentUser && userData ? (
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {userData.email || currentUser.email}
                    </Text>
                    <Text style={styles.userRole}>
                      {userData.role === "admin" ? "Administrateur" : 
                       userData.role === "stylist" ? "Styliste" : "Client"}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.notConnected}>Non connecté</Text>
                )}
                <TouchableOpacity onPress={closeDrawer}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => handleMenuItemPress(item)}
                  >
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// Écran avec drawer
const ScreenWithDrawer = ({ component: Component, ...props }) => {
  return (
    <View style={styles.screenContainer}>
      <CustomDrawer navigation={props.navigation} />
      <Component {...props} />
    </View>
  );
};

// Navigateur principal
const DrawerNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home">
        {(props) => <ScreenWithDrawer {...props} component={HomeScreen} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
      />
      <Stack.Screen 
        name="UserList" 
        component={UserListScreen}
      />
      <Stack.Screen 
        name="CoiffeurManagement" 
        component={CoiffeurManagement}
      />
      <Stack.Screen 
        name="ProductManagement" 
        component={ProductManagement}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: "#fff",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  drawerButtonIcon: {
    fontSize: 24,
    fontWeight: "bold",
  },
  screenContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawerContainer: {
    flex: 1,
    flexDirection: "row",
  },
  drawerContent: {
    width: 280,
    backgroundColor: "#fff",
    height: "100%",
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  userInfo: {
    marginTop: 10,
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userRole: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 2,
  },
  notConnected: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
  closeIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    fontSize: 24,
    color: "#666",
  },
  menuItems: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  menuLabel: {
    fontSize: 16,
    color: "#333",
  },
});

export default DrawerNavigator;