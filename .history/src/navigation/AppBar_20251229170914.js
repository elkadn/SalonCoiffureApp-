import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Platform  
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const AppBar = ({ navigation, title, showLogo = true, showMenuButton = true, openDrawer }) => {
  const { currentUser, userData } = useAuth();

  // Vérifiez que openDrawer est une fonction
  const handleMenuPress = () => {
    if (openDrawer && typeof openDrawer === 'function') {
      openDrawer();
    }
  };

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
          {showLogo ? (
            <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
          ) : (
            <Text style={styles.title}>{title || 'Salon de Coiffure'}</Text>
          )}
        </View>

        {/* Espace vide à droite pour équilibrer */}
        <View style={styles.rightSection}>
          {currentUser && (
            <View style={styles.userBadge}>
              <Text style={styles.userInitial}>
                {userData?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 15,
    marginTop: Platform.OS === 'ios' ? 40 : 10,
    marginBottom :
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  menuIcon: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // AJOUTEZ CE STYLE QUI MANQUE
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  logoImage: {
    width: 120,
    height: 30,
    resizeMode: 'contain',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  userBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});