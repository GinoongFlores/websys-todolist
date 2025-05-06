import { auth, db } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export function initializeTodos() {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      document.getElementById("userEmail").textContent = user.email;
      setupTodoListeners(user.uid);
    }
  });

  // Logout functionality
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
}

async function handleLogout() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

function setupTodoListeners(userId) {
  const todoList = document.getElementById("todoList");
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const spinner = document.querySelector(".loading-spinner");

  loadingState.style.display = "block";
  if (spinner) spinner.style.display = "inline-block";
  errorState.style.display = "none";

  const q = query(
    collection(db, "todos"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );

  // Real-time updates
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      loadingState.style.display = "none";
      if (spinner) spinner.style.display = "none";
      errorState.style.display = "none";
      todoList.innerHTML = "";

      if (snapshot.empty) {
        todoList.innerHTML =
          '<div style="text-align: center; padding: 1rem;">No tasks yet. Add your first task above!</div>';
        return;
      }

      snapshot.forEach((doc) => {
        const todo = doc.data();
        const div = document.createElement("div");
        div.className = `todo-item ${todo.completed ? "completed" : ""}`;
        div.innerHTML = `
                    <input type="checkbox" class="checkbox" ${
                      todo.completed ? "checked" : ""
                    }>
                    <span class="text">${todo.text}</span>
                    <div class="actions">
                        <button class="delete-btn">Delete</button>
                    </div>
                `;

        // Toggle completion
        div.querySelector(".checkbox").addEventListener("change", async (e) => {
          try {
            await updateDoc(doc.ref, {
              completed: e.target.checked,
            });
          } catch (error) {
            console.error("Error updating todo:", error);
            errorState.textContent = "Failed to update task. Please try again.";
            errorState.style.display = "block";
            e.target.checked = !e.target.checked; // Revert the checkbox
          }
        });

        // Delete todo with confirmation
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
    (error) => {
      console.error("Error fetching todos:", error);
      loadingState.style.display = "none";
      if (spinner) spinner.style.display = "none";

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

  // Add new todo
  document.getElementById("todoForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("todoInput");
    const text = input.value.trim();
    errorState.style.display = "none";

    if (text) {
      try {
        await addDoc(collection(db, "todos"), {
          text,
          completed: false,
          userId,
          timestamp: new Date(),
        });
        input.value = "";
      } catch (error) {
        console.error("Error adding todo:", error);
        errorState.textContent = "Failed to add task. Please try again.";
        errorState.style.display = "block";
      }
    }
  });

  // Cleanup listener on page unload
  window.addEventListener("unload", () => unsubscribe());
}
