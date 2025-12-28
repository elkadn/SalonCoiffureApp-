import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyC0r5GBcf24_a9qbokijtTRM",
  authDomain: "saloncoiffureapp.firebaseapp.com",
  projectId: "saloncoiffureapp",
  storageBucket: "saloncoirebasestorage.app",
  messagingSenderId: "928948250472",
  appId: "1:92894825464ebcd21a4fe18dd",
  measurementId: "G-FBN3CTQE"
};



const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export default app;