import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import app from './firebaseConfig';

export default function App() {
  useEffect(() => {
    console.log("Firebase app initialized:", app.name);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test Firebase Initialization</Text>
    </View>
  );
}