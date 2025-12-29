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
import { LayoutWrapper } from "./LayoutWrapper";

const Stack = createNativeStackNavigator();

// Composant Drawer personnalisé (exporté pour être utilisé partout)
export const CustomDrawer = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
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
    </>
  );
};

// HOC (Higher-Order Component) pour wrapper n'importe quel écran avec le drawer
// Dans DrawerNavigator.js
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
 
});

export default DrawerNavigator;
