const API = "http://localhost:5000/api";

const ADMIN_API = "http://localhost:5000/api/admin";

// Check if logged in
async function checkLogin() {
  try {
    const res = await fetch(`${ADMIN_API}/check`);
    const { loggedIn } = await res.json();
    if (!loggedIn) {
      alert("Session expired. Please login again.");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Login check error:", error);
    alert("Failed to verify login status. Please login again.");
    window.location.href = "login.html";
  }
}
// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await fetch(`${ADMIN_API}/logout`, { method: "POST" });
    alert("Logged out successfully!");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Logout failed, but redirecting to login page");
    window.location.href = "login.html";
  }
});

checkLogin();

const form = document.getElementById("registerForm");
const tbody = document.getElementById("tbody");
const submitBtn = document.getElementById("submitBtn");
const exportBtn = document.getElementById("exportBtn");
const cancelEditBtn = document.getElementById("cancelEdit");
const editingIdInput = document.getElementById("editingId");
const statsBtn = document.getElementById("statsBtn");

// Load all registrations
async function loadRegistrations() {
  try {
    console.log("Loading registrations...");
    const res = await fetch(`${API}/getAll`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Loaded registrations:", data);
    
    tbody.innerHTML = "";
    data.forEach(d => {
      tbody.innerHTML += `
        <tr data-id="${d._id}">
          <td>${escapeHtml(d.name)}</td>
          <td>${escapeHtml(d.roll)}</td>
          <td>${escapeHtml(d.department || "")}</td>
          <td>${escapeHtml(d.event)}</td>
          <td>${escapeHtml(d.contact || "")}</td>
          <td class="actions-btn">
            <button class="small-btn edit-btn" onclick="startEdit('${d._id}')">Edit</button>
            <button class="small-btn del-btn" onclick="deleteReg('${d._id}')">Delete</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error("Failed to load registrations:", err);
    alert("Failed to load registrations: " + err.message);
  }
}
loadRegistrations();

// helper: escape
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

// Submit form - create or update
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fm = new FormData(form);
  const payload = Object.fromEntries(fm.entries());

  const editingId = editingIdInput.value;
  try {
    if (editingId) {
      // update
      const res = await fetch(`${API}/update/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok) {
        alert("Updated successfully");
      } else {
        // Handle duplicate error specifically
        if (json.code === "DUPLICATE_REGISTRATION") {
          alert("⚠️ Duplicate Registration!\n\n" + json.error);
        } else {
          alert(json.error || json.message || "Update failed");
        }
      }
    } else {
      // create
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("✅ Registered successfully!");
      } else {
        const j = await res.json();
        // Handle duplicate error specifically
        if (j.code === "DUPLICATE_REGISTRATION") {
          alert("⚠️ Duplicate Registration!\n\n" + j.error + "\n\nNote: A student can register for multiple events with the same roll number, but cannot register twice for the same event.");
        } else {
          alert(j.error || "Failed to register");
        }
      }
    }
    form.reset();
    editingIdInput.value = "";
    cancelEditBtn.style.display = "none";
    submitBtn.textContent = "Register";
    loadRegistrations();
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
});

// Start edit
window.startEdit = async function(id) {
  try {
    const res = await fetch(`${API}/getAll`);
    const all = await res.json();
    const record = all.find(r => r._id === id);
    if (!record) return alert("Record not found");
    // populate form
    form.name.value = record.name || "";
    form.roll.value = record.roll || "";
    form.department.value = record.department || "";
    form.event.value = record.event || "";
    form.contact.value = record.contact || "";
    editingIdInput.value = id;
    submitBtn.textContent = "Update";
    cancelEditBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(err);
    alert("Failed to start edit");
  }
};

// Cancel edit
cancelEditBtn.addEventListener("click", () => {
  form.reset();
  editingIdInput.value = "";
  submitBtn.textContent = "Register";
  cancelEditBtn.style.display = "none";
});

// Delete
window.deleteReg = async function(id) {
  if (!confirm("Delete this registration?")) return;
  try {
    const res = await fetch(`${API}/delete/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Deleted");
      loadRegistrations();
    } else {
      const j = await res.json();
      alert(j.error || "Delete failed");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to delete");
  }
};

// Export
exportBtn.addEventListener("click", () => {
  // open in new tab to download
  window.open(`${API}/export`, "_blank");
});

// Statistics
statsBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${API}/stats`);
    if (res.ok) {
      const stats = await res.json();
      
      let statsMessage = `Registration Statistics\n\n`;
      statsMessage += `Total Registrations: ${stats.totalRegistrations}\n\n`;
      
      statsMessage += ` Event-wise Registrations:\n`;
      stats.eventStats.forEach(event => {
        statsMessage += `• ${event._id}: ${event.count} students\n`;
      });
      
      if (stats.studentsInMultipleEvents > 0) {
        statsMessage += `\n👥 Students in Multiple Events: ${stats.studentsInMultipleEvents}\n`;
        
      }
      
      alert(statsMessage);
    } else {
      alert("Failed to fetch statistics");
    }
  } catch (error) {
    console.error("Stats error:", error);
    alert("Failed to load statistics");
  }
});