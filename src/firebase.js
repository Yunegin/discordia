// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkebOU0g7FRoBztDs8lY95AnPZnhQgUcg",
  authDomain: "discordancias.firebaseapp.com",
  projectId: "discordancias",
  storageBucket: "discordancias.firebasestorage.app",
  messagingSenderId: "900358460787",
  appId: "1:900358460787:web:22e63392a815a83f74e106",
  measurementId: "G-7FHZQQYYNC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);