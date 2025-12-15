// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0r5HUgGV24_a9qbokijtTRM",
  authDomain: "saloncoiffseapp.com",
  projectId: "saloncoiffureapp",
  storageBucket: "saloncotorage.app",
  messagingSenderId: "920472",
  appId: "1:92894825047221a4fe18dd",
  measurementId: "G-FFBBE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;