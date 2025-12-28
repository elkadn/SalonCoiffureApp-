// import React, { useState, useEffect } from 'react';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from './src/firebase/firebaseConfig';
// import { ActivityIndicator, View, StyleSheet } from 'react-native';
// import AppNavigator from './src/navigation/AppNavigator';

// export default function App() {
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (authUser) => {
//      // setUser(authUser);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//         <StatusBar style="auto" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaProvider>
//       <AppNavigator />
//       <StatusBar style="auto" />
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff'
//   }
// });

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeAdmin } from './src/services/authService';
import { AuthProvider } from './src/context/AuthContext';

//initializeAdmin().catch(console.error);

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider></AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}