import React from 'react';
import { View, StyleSheet } from 'react-native';
import UserList from '../components/Users/UserList';

const UserManagementScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <UserList navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  }
});

export default UserManagementScreen;