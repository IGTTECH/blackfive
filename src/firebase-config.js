// src/firebase-config.js

// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase project configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBGBL3C-zTw6vwvIhktUE6mFfanLa-emJA",
  authDomain: "igt-project-12443.firebaseapp.com",
  projectId: "igt-project-12443",
  storageBucket: "igt-project-12443.firebasestorage.app",
  messagingSenderId: "458543900333",
  appId: "1:458543900333:web:5781a612406ef2dfe3c824"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase instances
export { auth, db };
