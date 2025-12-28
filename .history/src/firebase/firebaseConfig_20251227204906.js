import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC0r5HUgGVp1JyRGBcf24_a9qbokijtTRM",
  authDomain: "saloncoiffureapp.firebaseapp.com",
  projectId: "saloncoiffureapp",
  storageBucket: "saloncoiffureapp.firebasestorage.app",
  messagingSenderId: "928948250472",
  appId: "1:928948250472:web:cf3a2464ebcd21a4fe18dd",
  measurementId: "G-FFBBN3CTQE"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;