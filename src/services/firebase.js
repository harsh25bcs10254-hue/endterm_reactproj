import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuq-S2ksHibjfmsRFGFeXWpBBNgYcWSTk",
  authDomain: "studenthelper201a.firebaseapp.com",
  projectId: "studenthelper201a",
  storageBucket: "studenthelper201a.firebasestorage.app",
  messagingSenderId: "893119324736",
  appId: "1:893119324736:web:cfa2f982c1f313c75a75a5",
  measurementId: "G-B6K84EDQHT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optional: Initialize Analytics
const analytics = getAnalytics(app);

export default app;