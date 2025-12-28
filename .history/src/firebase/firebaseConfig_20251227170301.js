import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC0r5HUgGVp1JyRGBcf24_a9qbokijtTRM",
  authDomain: "saloncoiffureapp.firebaseapp.com",
  projectId: "saloncoiffureapp",
  storageBucket: "saloncoiffureapp.firebasestorage.app",
  messagingSenderId: "928948250472",
  appId: "1:928948250472:web:cf3a2464ebcd21a4fe18dd",
  measurementId: "G-FFBBN3CTQE"
};

// Désactiver la persistence en mémoire (peut causer l'erreur String/Boolean)
try {
  const app = initializeApp(firebaseConfig);
  
  // Initialiser Auth avec persistance
  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  
  const db = getFirestore(app);
  
  export { auth, db };
  export default app;
} catch (error) {
  console.error("Firebase initialization error:", error);
}