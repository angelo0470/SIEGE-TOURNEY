// Firebase setup
const db = firebase.firestore();

// Tab switching
function switchTab(tabId) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.style.display = 'none');
  document.getElementById(tabId).style.display = 'block';
}

// PIN protection for Admin and Brackets
function promptPIN(tabId) {
  const pin = prompt("Enter PIN:");
  if (pin === "1234") {
    switchTab(tabId);
    if (tabId === "bracketsTab") {
      loadRegisteredPlayers();
    }
  } else {
    alert("Incorrect PIN.");
  }
}

// Handle registration form
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const teamName = document.getElementById("teamName").value.trim();
  const playerNames = document.getElementById("playerNames").value.trim();

  if (!teamName || !playerNames) return;

  try {
    await db.collection("registered").add({ teamName, playerNames });
    document.getElementById("confirmation").style.display = "block";
    document.getElementById("registerForm").reset();
    setTimeout(() => {
      document.getElementById("confirmation").style.display = "none";
    }, 3000);
  } catch (error) {
    console.error("Registration error:", error);
  }
});

// Load registered players into Brackets tab
async function loadRegisteredPlayers() {
  const list = document.getElementById("registeredTeams");
  list.innerHTML = "";
  try {
    const snapshot = await db.collection("registered").get();
    snapshot.forEach(doc => {
      const { teamName, playerNames } = doc.data();
      const li = document.createElement("li");
      li.textContent = `${teamName} - ${playerNames}`;
      list.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading registered teams:", error);
  }
}

// Reset players from Firebase
async function resetPlayers() {
  if (!confirm("Are you sure you want to reset all registrations?")) return;

  try {
    const snapshot = await db.collection("registered").get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    alert("All registrations have been cleared.");
    loadRegisteredPlayers();
  } catch (error) {
    console.error("Error resetting players:", error);
  }
}
