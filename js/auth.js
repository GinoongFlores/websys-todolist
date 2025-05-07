// Firebase Authentication Modules
// Think of these imports like getting special tools from a toolbox - each tool has a specific job
import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword, // Tool for creating new user accounts
  signInWithEmailAndPassword, // Tool for logging in existing users
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

function showMessage(message, isError = true) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";

  // Choose the right style (red for errors, green for success)
  errorDiv.className = isError ? "error-message" : "success-message";

  // Make the message disappear after 5 seconds (like a self-destructing note)
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 5000);
}

/**
 * Main Authentication Setup
 * Think of this like setting up a secure entrance to a building:
 * - We need a way for people to sign up (register)
 * - We need a way for members to enter (login)
 * - We need to check if someone is already inside (auth state)
 */
export function initializeAuth() {
  // Get all our UI elements (like getting all parts of a form)
  const authForm = document.getElementById("authForm");
  const authTitle = document.getElementById("authTitle");
  const switchText = document.getElementById("switchText");
  const submitBtn = document.getElementById("submitBtn");
  const errorDiv = document.getElementById("error");

  // Track if we're in login or register mode (like a switch that flips between two options)
  let isLoginMode = true;

  /**
   * Updates the form's appearance based on mode
   * This is like changing the signs on a door:
   * - "Enter" for login mode
   * - "Sign Up" for register mode
   */
  function updateFormUI() {
    // Change the form's title and button text
    authTitle.textContent = isLoginMode ? "Login" : "Register";
    submitBtn.textContent = isLoginMode ? "Login" : "Register";

    // Update the text that lets users switch modes
    switchText.innerHTML = isLoginMode
      ? 'Don\'t have an account? <a href="#" class="switch-auth">Register</a>'
      : 'Already have an account? <a href="#" class="switch-auth">Login</a>';

    // Reset everything to a clean state
    authForm.reset(); // Clear the form (like erasing all entries)
    errorDiv.style.display = "none"; // Hide any error messages
    submitBtn.disabled = false; // Make sure the button is usable
  }

  /**
   * Handle switching between login and register modes
   * Uses event delegation (like having one security guard watch all doors
   * instead of one guard per door - more efficient!)
   */
  document.addEventListener("click", (e) => {
    if (e.target.matches(".switch-auth")) {
      e.preventDefault(); // Stop the normal link behavior
      isLoginMode = !isLoginMode; // Flip the mode switch
      updateFormUI(); // Update what the user sees
    }
  });

  /**
   * Handle form submission (login or register)
   * This is like processing someone's entry at a security desk:
   * - Check their credentials
   * - Either let them in or tell them what's wrong
   */
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop the form from refreshing the page

    // Get what the user typed in (their credentials)
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // For new accounts, make sure the password is strong enough
    if (!isLoginMode && password.length < 6) {
      showMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      // Show "working on it" state
      submitBtn.disabled = true; // Prevent multiple clicks
      submitBtn.textContent = isLoginMode
        ? "Logging in..."
        : "Creating Account...";
      errorDiv.style.display = "none"; // Hide any old error messages

      if (isLoginMode) {
        // Try to log in (like checking if their key works)
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "index.html"; // Success! Go to main page
      } else {
        // Try to create new account (like making a new key)
        await createUserWithEmailAndPassword(auth, email, password);
        showMessage("Account created successfully! Redirecting...", false);

        // Wait 2 seconds before going to main page (so they can see success message)
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      }
    } catch (error) {
      // Something went wrong - tell the user what happened
      showMessage(error.message);

      // Reset the button to try again
      submitBtn.disabled = false;
      submitBtn.textContent = isLoginMode ? "Login" : "Register";
    }
  });

  /**
   * Check if someone is already logged in
   * Like checking if someone already has an active pass -
   * no need to check in again if they're already inside!
   */
  auth.onAuthStateChanged((user) => {
    if (user) {
      window.location.href = "index.html"; // Already logged in, go to main page
    }
  });

  // Start with a clean, proper UI
  updateFormUI();
}
