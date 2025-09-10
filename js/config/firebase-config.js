// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKORSxuutBkLR98kvYNE5jJa0TlGFGSqo",
  authDomain: "ecoquest-115da.firebaseapp.com",
  projectId: "ecoquest-115da",
  storageBucket: "ecoquest-115da.firebasestorage.app",
  messagingSenderId: "862557922154",
  appId: "1:862557922154:web:df6279c54e2735a4f6fb13",
  measurementId: "G-6G0W6T12K6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
