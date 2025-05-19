// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBiNxXtfGy4YbywG4WfsKo-i0oVDz_NTbM",
  authDomain: "loswingin-r6.firebaseapp.com",
  projectId: "loswingin-r6",
  storageBucket: "loswingin-r6.appspot.com",
  messagingSenderId: "44769835884",
  appId: "1:44769835884:web:157c7aed1b98442532d149",
  measurementId: "G-LF4DE76P16"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Tab switching with PIN protection for Admin and Brackets
document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    if (tab === "admin" || tab === "brackets") {
      const pin = prompt("Enter PIN to access this section:");
      if (pin !== "1234") {
        alert("Incorrect PIN.");
        return;
      }
    }

    document.querySelectorAll(".tab").forEach(tabContent => {
      tabContent.style.display = "none";
    });
    document.getElementById(tab).style.display = "block";
  });
});

// Registration form submission
document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault();

  const playerName = document.getElementById("playerName").value;
  const teamName = document.getElementById("teamName").value;
  const contact = document.getElementById("contact").value;

  try {
    await db.collection("registered").add({
      playerName,
      teamName,
      contact,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Registration submitted!");
    document.getElementById("registerForm").reset();
    loadPlayers();
  } catch (err) {
    alert("Error submitting registration.");
    console.error(err);
  }
});

// Load players under Brackets tab
async function loadPlayers() {
  const playersList = document.getElementById("playersList");
  playersList.innerHTML = "";

  try {
    const snapshot = await db.collection("registered").orderBy("timestamp", "desc").get();
    snapshot.forEach(doc => {
      const data = doc.data();
      const playerDiv = document.createElement("div");
      playerDiv.className = "player-entry";
      playerDiv.textContent = `${data.teamName} - ${data.playerName} (${data.contact})`;
      playersList.appendChild(playerDiv);
    });
  } catch (err) {
    console.error("Error loading players:", err);
    playersList.innerHTML = "<p>Error loading player list.</p>";
  }
}

// Reset registered players (Admin tab)
document.getElementById("resetPlayers").addEventListener("click", async () => {
  if (confirm("Are you sure you want to delete all registered players?")) {
    try {
      const snapshot = await db.collection("registered").get();
      const batch = db.batch();
      snapshot.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      alert("All players have been reset.");
      loadPlayers();
    } catch (err) {
      alert("Failed to reset players.");
      console.error(err);
    }
  }
});

// Load players on page load if Brackets is visible
window.addEventListener("load", () => {
  if (document.getElementById("brackets").style.display === "block") {
    loadPlayers();
  }
});
