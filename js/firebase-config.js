// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5NcVKMI-6Ey9Kp9Fo7CZTsPfVre_ANug",
  authDomain: "websys-todo-list.firebaseapp.com",
  projectId: "websys-todo-list",
  storageBucket: "websys-todo-list.firebasestorage.app",
  messagingSenderId: "523166003580",
  appId: "1:523166003580:web:bcb06b259d0e6ab652f4f9",
  measurementId: "G-0LMD5YTFG1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
