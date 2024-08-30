// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZEzzVgfK__oh6fp6tc8zkXlgeO9AzgVI",
  authDomain: "ix14-c72ec.firebaseapp.com",
  projectId: "ix14-c72ec",
  storageBucket: "ix14-c72ec.appspot.com",
  messagingSenderId: "624123436624",
  appId: "1:624123436624:web:c60a7b4739704a699dfb55",
  measurementId: "G-XSPCR8WDH8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { db, auth };
