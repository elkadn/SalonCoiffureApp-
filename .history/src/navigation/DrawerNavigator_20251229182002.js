import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

// Importez TOUS vos écrans
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import DashboardScreen from "../screens/admin/DashboardScreen";
import UserListScreen from "../screens/admin/users/UserListScreen";
import CoiffeurManagement from "../screens/admin/CoiffeurManagement";
import ProductManagement from "../screens/admin/produits/ProductManagement";
import UserFormScreen from "../screens/admin/users/UserFormScreen";
import UserDetailScreen from "../screens/admin/users/UserDetailScreen";
import StylisteCreneauxScreen from "../screens/admin/users/StylisteCreneauxScreen";
import ProfilCapillaireScreen from "../screens/admin/users/ProfilCapillaireScreen";
import SpecialiteList from "../screens/admin/specialites/SpecialiteList";
import SpecialiteForm from "../screens/admin/specialites/SpecialiteForm";
import AffectSpecialites from "../screens/admin/specialites/AffectSpecialites";
import StylisteList from "../screens/admin/specialites/StylistList";
import CategoryForm from "../screens/admin/produits/categories/CategoryForm";
import CategoryList from "../screens/admin/produits/categories/CategoryList";
import SupplierList from "../screens/admin/produits/fournisseurs/SupplierList";
import SupplierForm from "../screens/admin/produits/fournisseurs/SupplierForm";
import ProductList from "../screens/admin/produits/produits/ProductList";
import ProductForm from "../screens/admin/produits/produits/ProductForm";
import InventoryScreen from "../screens/admin/produits/produits/InventoryScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

const Stack = createNativeStackNavigator();

// Composant Drawer personnalisé (exporté pour être utilisé partout)
// Dans DrawerNavigator.js, modifiez le CustomDrawer pour utiliser les props
export const CustomDrawer = ({
  navigation,
  drawerVisible, // Reçu en props
  closeDrawer, // Reçu en props
}) => {
  // RETIREZ le useState local pour drawerVisible
  const { currentUser, userData, logout } = useAuth();

  const menuItems = [
    { label: "Accueil", screen: "Home", icon: "🏠" },
    ...(!currentUser
      ? [{ label: "Connexion", screen: "Login", icon: "🔐" }]
      : []),
    ...(userData?.role === "admin"
      ? [
          { label: "Tableau de bord", screen: "Dashboard", icon: "📊" },
          { label: "Gestion Utilisateurs", screen: "UserList", icon: "👥" },
          {
            label: "Gestion Coiffeurs",
            screen: "CoiffeurManagement",
            icon: "💇",
          },
          {
            label: "Gestion Produits",
            screen: "ProductManagement",
            icon: "📦",
          },
        ]
      : []),
    ...(currentUser
      ? [
          {
            label: "Déconnexion",
            action: () => {
              logout();
              navigation.replace("Home");
            },
            icon: "🚪",
          },
        ]
      : []),
  ];

  const handleMenuItemPress = (item) => {
    closeDrawer(); // Utilisez la fonction passée en props
    if (item.action) {
      item.action();
    } else {
      navigation.navigate(item.screen);
    }
  };

  return (
    <Modal
      transparent
      visible={drawerVisible} // Utilisez la prop
      animationType="slide"
      onRequestClose={closeDrawer} // Utilisez la prop
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={closeDrawer} // Utilisez la prop
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
                    {userData.role === "admin"
                      ? "Administrateur"
                      : userData.role === "stylist"
                      ? "Styliste"
                      : "Client"}
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
  );
};
// HOC (Higher-Order Component) pour wrapper n'importe quel écran avec le drawer
// Dans DrawerNavigator.js
// Dans DrawerNavigator.js, modifiez le withDrawer
export const withDrawer = (Component, options = {}) => {
  return (props) => (
    <LayoutWrapper
      navigation={props.navigation}
      showAppBar={options.showAppBar !== false}
      appBarTitle={options.title}
      showLogo={options.showLogo !== false}
    >
      <Component {...props} />
    </LayoutWrapper>
  );
};

// Navigateur principal
const DrawerNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Home avec drawer */}
      <Stack.Screen name="Home">
        {(props) => {
          const HomeWithDrawer = withDrawer(HomeScreen);
          return <HomeWithDrawer {...props} />;
        }}
      </Stack.Screen>

      {/* Login avec drawer */}
      <Stack.Screen name="Login">
        {(props) => {
          const LoginWithDrawer = withDrawer(LoginScreen);
          return <LoginWithDrawer {...props} />;
        }}
      </Stack.Screen>

      {/* Register avec drawer */}
      <Stack.Screen name="Register">
        {(props) => {
          const RegisterWithDrawer = withDrawer(RegisterScreen);
          return <RegisterWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="ForgotPassword">
        {(props) => {
          const ForgotPasswordScreenWithDrawer =
            withDrawer(ForgotPasswordScreen);
          return <ForgotPasswordScreenWithDrawer {...props} />;
        }}
      </Stack.Screen>

      {/* Dashboard avec drawer */}
      <Stack.Screen name="Dashboard">
        {(props) => {
          const DashboardWithDrawer = withDrawer(DashboardScreen);
          return <DashboardWithDrawer {...props} />;
        }}
      </Stack.Screen>

      {/* Tous les autres écrans admin avec drawer */}
      <Stack.Screen name="UserList">
        {(props) => {
          const UserListWithDrawer = withDrawer(UserListScreen);
          return <UserListWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="UserForm">
        {(props) => {
          const UserFormWithDrawer = withDrawer(UserFormScreen);
          return <UserFormWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="UserDetail">
        {(props) => {
          const UserDetailWithDrawer = withDrawer(UserDetailScreen);
          return <UserDetailWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="CoiffeurManagement">
        {(props) => {
          const CoiffeurManagementWithDrawer = withDrawer(CoiffeurManagement);
          return <CoiffeurManagementWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="ProductManagement">
        {(props) => {
          const ProductManagementWithDrawer = withDrawer(ProductManagement);
          return <ProductManagementWithDrawer {...props} />;
        }}
      </Stack.Screen>

      {/* Ajoutez tous vos autres écrans de la même manière */}
      <Stack.Screen name="StylisteCreneaux">
        {(props) => {
          const StylisteCreneauxWithDrawer = withDrawer(StylisteCreneauxScreen);
          return <StylisteCreneauxWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="ProfilCapillaire">
        {(props) => {
          const ProfilCapillaireWithDrawer = withDrawer(ProfilCapillaireScreen);
          return <ProfilCapillaireWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="SpecialiteList">
        {(props) => {
          const SpecialiteListWithDrawer = withDrawer(SpecialiteList);
          return <SpecialiteListWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="SpecialiteForm">
        {(props) => {
          const SpecialiteFormWithDrawer = withDrawer(SpecialiteForm);
          return <SpecialiteFormWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="AffectSpecialites">
        {(props) => {
          const AffectSpecialitesWithDrawer = withDrawer(AffectSpecialites);
          return <AffectSpecialitesWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="StylisteList">
        {(props) => {
          const StylisteListWithDrawer = withDrawer(StylisteList);
          return <StylisteListWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="CategoryList">
        {(props) => {
          const CategoryListWithDrawer = withDrawer(CategoryList);
          return <CategoryListWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="CategoryForm">
        {(props) => {
          const CategoryFormWithDrawer = withDrawer(CategoryForm);
          return <CategoryFormWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="SupplierList">
        {(props) => {
          const SupplierListWithDrawer = withDrawer(SupplierList);
          return <SupplierListWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="SupplierForm">
        {(props) => {
          const SupplierFormWithDrawer = withDrawer(SupplierForm);
          return <SupplierFormWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="ProductList">
        {(props) => {
          const ProductListWithDrawer = withDrawer(ProductList);
          return <ProductListWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="ProductForm">
        {(props) => {
          const ProductFormWithDrawer = withDrawer(ProductForm);
          return <ProductFormWithDrawer {...props} />;
        }}
      </Stack.Screen>

      <Stack.Screen name="InventoryScreen">
        {(props) => {
          const InventoryScreenWithDrawer = withDrawer(InventoryScreen);
          return <InventoryScreenWithDrawer {...props} />;
        }}
      </Stack.Screen>
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
  //   drawerButton: {
  //   position: "absolute",
  //   top: 40, // Ajustez selon votre statut bar
  //   left: 15,
  //   zIndex: 9999, // Valeur très élevée
  //   backgroundColor: "#fff",
  //   width: 44,
  //   height: 44,
  //   borderRadius: 22,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   elevation: 10, // Augmentez l'elevation pour Android
  //   shadowColor: "red",
  //   shadowOffset: { width: 0, height: 3 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 5,
  // },

  // screenContainer: {
  //   flex: 1,
  //   paddingTop: 10, // Ajoutez un padding pour éviter que le contenu soit caché
  // },
});

export default DrawerNavigator;
