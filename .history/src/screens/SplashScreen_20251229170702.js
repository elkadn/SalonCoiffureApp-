import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Main");
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <Image
        source={require("../../assets/logo.png")} 
        style={styles.logo}
        resizeMode="contain"
      />

      <ActivityIndicator
        size="large"
        color="#4CAF50"
        style={styles.spinner}
      />

      <Text style={styles.slogan}>Chargement...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  spinner: {
    marginVertical: 20,
  },
  slogan: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});

export default SplashScreen;
