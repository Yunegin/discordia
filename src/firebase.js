import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkebOU0g7FRoBztDs8lY95AnPZnhQgUcg",
  authDomain: "discordancias.firebaseapp.com",
  projectId: "discordancias",
  storageBucket: "discordancias.firebasestorage.app",
  messagingSenderId: "900358460787",
  appId: "1:900358460787:web:22e63392a815a83f74e106",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
