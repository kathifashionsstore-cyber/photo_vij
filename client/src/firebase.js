// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAJ8LPot0WLtCxehvgHa9dMpTjWbaozSQM",
  authDomain: "snaplicaphoto.firebaseapp.com",
  projectId: "snaplicaphoto",
  storageBucket: "snaplicaphoto.firebasestorage.app",
  messagingSenderId: "84640464540",
  appId: "1:84640464540:web:f025795575dba8eb57f759",
  measurementId: "G-ZRYL99PCJX"
};

const app = initializeApp(firebaseConfig);

export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
