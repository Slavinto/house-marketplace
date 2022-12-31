// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-7PG4JsBErF1OYExmDaEGP67MrhvT4kc",
  authDomain: "house-marketplace-app-76173.firebaseapp.com",
  projectId: "house-marketplace-app-76173",
  storageBucket: "house-marketplace-app-76173.appspot.com",
  messagingSenderId: "643898674937",
  appId: "1:643898674937:web:5c4c8858e2846cd5635c28",
};

// Initialize Firebase
initializeApp(firebaseConfig);

export const db = getFirestore();
