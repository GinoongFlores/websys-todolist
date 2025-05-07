// Firebase Modules
// Think of these like different tools we need for our digital notebook (Firestore)
import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  collection, // Like creating a new section in our notebook
  addDoc, // Like writing a new page
  query, // Like creating a search filter
  where, // Like specifying what to search for
  onSnapshot, // Like having someone watch the notebook for changes
  doc, // Like referring to a specific page
  updateDoc, // Like editing an existing page
  deleteDoc, // Like removing a page
  orderBy, // Like arranging pages in a specific order
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * Main Todo List Setup
 * Think of this like setting up a smart bulletin board that:
 * - Only shows your notes (authentication)
 * - Updates in real-time (like magic!)
 * - Keeps everything organized (newest first)
 */
export function initializeTodos() {
  // First, check if someone is logged in
  // This is like checking for a visitor's badge
  auth.onAuthStateChanged((user) => {
    if (!user) {
      // No badge? Go back to reception (login page)
      window.location.href = "login.html";
    } else {
      // Show who's logged in (like wearing a name tag)
      document.getElementById("userEmail").textContent = user.email;
      setupTodoListeners(user.uid);
    }
  });

  // Set up the exit button (logout)
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
}

/**
 * Handle User Logout
 * Like checking out when leaving the building:
 * - Return your visitor's badge (sign out)
 * - Go back to reception (login page)
 */
async function handleLogout() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

/**
 * Setup Todo List Functionality
 * This is like setting up a personal bulletin board where:
 * - Only you can see your notes (userId filter)
 * - Notes are always organized (newest on top)
 * - Changes appear instantly (real-time updates)
 *
 * @param {string} userId - Like your personal ID badge number
 */
function setupTodoListeners(userId) {
  // Get references to our UI elements (like getting thumbtacks ready)
  const todoList = document.getElementById("todoList");
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const spinner = document.querySelector(".loading-spinner");

  // Show "loading" while we get the notes (like a "please wait" sign)
  loadingState.style.display = "block";
  if (spinner) spinner.style.display = "inline-block";
  errorState.style.display = "none";

  /**
   * Create a Firestore Query
   * This is like telling our assistant:
   * 1. Look in the todos section (collection)
   * 2. Find only MY notes (where userId matches)
   * 3. Arrange them newest first (orderBy timestamp)
   */
  const q = query(
    collection(db, "todos"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );

  /**
   * Set up Real-time Updates
   * Think of this like having a helpful assistant who:
   * - Watches your bulletin board
   * - Updates it whenever something changes
   * - Keeps everything organized
   */
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      // Hide our "please wait" signs
      loadingState.style.display = "none";
      if (spinner) spinner.style.display = "none";
      errorState.style.display = "none";
      todoList.innerHTML = "";

      // If there are no notes, show a friendly message
      if (snapshot.empty) {
        todoList.innerHTML =
          '<div style="text-align: center; padding: 1rem;">No tasks yet. Add your first task above!</div>';
        return;
      }

      // For each todo (like each note on the board)
      snapshot.forEach((doc) => {
        const todo = doc.data();
        const div = document.createElement("div");
        div.className = `todo-item ${todo.completed ? "completed" : ""}`;

        // Create the visual todo item (like a sticky note)
        div.innerHTML = `
                    <input type="checkbox" class="checkbox" ${
                      todo.completed ? "checked" : ""
                    }>
                    <span class="text">${todo.text}</span>
                    <div class="actions">
                        <button class="delete-btn">Delete</button>
                    </div>
                `;

        /**
         * Handle Task Completion
         * Like flipping a note over to mark it "done"
         */
        div.querySelector(".checkbox").addEventListener("change", async (e) => {
          try {
            await updateDoc(doc.ref, {
              completed: e.target.checked,
            });
          } catch (error) {
            console.error("Error updating todo:", error);
            errorState.textContent = "Failed to update task. Please try again.";
            errorState.style.display = "block";
            e.target.checked = !e.target.checked; // Undo the checkbox if update fails
          }
        });

        /**
         * Handle Task Deletion
         * Like removing a note from the board
         * (but asks for confirmation first!)
         */
        div.querySelector(".delete-btn").addEventListener("click", async () => {
          const confirmed = confirm(
            "Are you sure you want to delete this task?"
          );
          if (confirmed) {
            try {
              await deleteDoc(doc.ref);
            } catch (error) {
              console.error("Error deleting todo:", error);
              errorState.textContent =
                "Failed to delete task. Please try again.";
              errorState.style.display = "block";
            }
          }
        });

        todoList.appendChild(div);
      });
    },
    // Handle any errors (like when something goes wrong with our "assistant")
    (error) => {
      console.error("Error fetching todos:", error);
      loadingState.style.display = "none";
      if (spinner) spinner.style.display = "none";

      // Special handling for missing index errors
      // (like when our filing system needs to be set up)
      if (
        error.code === "failed-precondition" &&
        error.message.includes("index")
      ) {
        errorState.innerHTML =
          "Setting up the database... This might take a few minutes. " +
          '<a href="javascript:location.reload()">refresh the page</a> to try again.';
      } else {
        errorState.textContent =
          "Failed to load tasks. Please refresh the page.";
      }
      errorState.style.display = "block";
    }
  );

  /**
   * Handle Adding New Tasks
   * Like getting a new sticky note and putting it on the board
   */
  document.getElementById("todoForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("todoInput");
    const text = input.value.trim();
    errorState.style.display = "none";

    if (text) {
      try {
        // Add new todo to Firestore (like sticking a new note on the board)
        await addDoc(collection(db, "todos"), {
          text, // What to do
          completed: false, // Not done yet
          userId, // Who's note it is
          timestamp: new Date(), // When it was added
        });
        input.value = ""; // Clear the input (like getting a fresh sticky note)
      } catch (error) {
        console.error("Error adding todo:", error);
        errorState.textContent = "Failed to add task. Please try again.";
        errorState.style.display = "block";
      }
    }
  });

  // Clean up when leaving the page
  // (like telling our assistant they can stop watching the board)
  window.addEventListener("unload", () => unsubscribe());
}
