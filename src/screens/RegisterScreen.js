import React from 'react';
import { View, Button, Text } from 'react-native';
import { addClient } from '../services/userService';

const RegisterScreen = () => {
  const handleAddClient = async () => {
    try {
      const id = await addClient();
      console.log("Client ajouté avec l'ID :", id);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ marginBottom: 20 }}>Ajouter un client :</Text>
      <Button title="Ajouter un client" onPress={handleAddClient} />
    </View>
  );
};

export default RegisterScreen;
