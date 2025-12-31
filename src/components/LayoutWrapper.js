import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { CustomDrawer } from '../navigation/DrawerNavigator';
import { AppBar } from './AppBar';

export const LayoutWrapper = ({ children, navigation, showAppBar = true, appBarTitle, showLogo = true }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {showAppBar && (
        <AppBar
          navigation={navigation} 
          title={appBarTitle}
          showLogo={showLogo}
          openDrawer={openDrawer} 
        />
      )}
      
      <View style={[
        styles.content,
        showAppBar && styles.contentWithAppBar
      ]}>
        {children}
      </View>
      
      <CustomDrawer 
        navigation={navigation} 
        drawerVisible={drawerVisible} 
        closeDrawer={closeDrawer} 
      />
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
    paddingTop: 60, 
  },
});