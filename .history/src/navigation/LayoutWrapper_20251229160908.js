// LayoutWrapper.js
import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { AppBar } from './AppBar';
import { CustomDrawer } from './DrawerNavigator';

export const LayoutWrapper = ({ children, navigation, showAppBar = true, appBarTitle, showLogo = true }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* AppBar fixe en haut */}
      {showAppBar && (
        <AppBar 
          navigation={navigation} 
          title={appBarTitle}
          showLogo={showLogo}
        />
      )}
      
      {/* Contenu principal avec espacement pour l'AppBar */}
      <View style={[
        styles.content,
        showAppBar && styles.contentWithAppBar
      ]}>
        {children}
      </View>
      
      {/* Drawer (s'ouvre par-dessus tout) */}
      <CustomDrawer navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  contentWithAppBar: {
    paddingTop: 60, // Hauteur de l'AppBar
  },
});