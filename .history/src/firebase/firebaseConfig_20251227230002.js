import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialiser Auth avec AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialiser les autres services
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;