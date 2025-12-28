import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";


const firebaseConfig = {
  apiKey: "AIzaSyC0cf24_a9qbokijtTRM",
  authDomain: "sa",
  projectId: "saloncoiffureapp",
  storageBucket: "saloncoiffureapp.firebasestorage.app",
  messagingSenderId: "",
  appId: "1:928948250472:web:",
  measurementId: "G-"
};



const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);


export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export default app;