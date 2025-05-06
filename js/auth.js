import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

let isLoginMode = true;

export function initializeAuth() {
  const authForm = document.getElementById("authForm");
  const switchAuth = document.getElementById("switchAuth");
  const authTitle = document.getElementById("authTitle");
  const switchText = document.getElementById("switchText");
  const submitBtn = document.getElementById("submitBtn");
  const errorDiv = document.getElementById("error");

  switchAuth.addEventListener("click", (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? "Login" : "Register";
    submitBtn.textContent = isLoginMode ? "Login" : "Register";
    switchAuth.textContent = isLoginMode ? "Register" : "Login";
    switchText.innerHTML = isLoginMode
      ? 'Don\'t have an account? <a href="#" id="switchAuth">Register</a>'
      : 'Already have an account? <a href="#" id="switchAuth">Login</a>';
    errorDiv.textContent = "";
  });

  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      window.location.href = "index.html";
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  });

  // Check if user is already logged in
  auth.onAuthStateChanged((user) => {
    if (user) {
      window.location.href = "index.html";
    }
  });
}
