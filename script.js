// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBiNxXtfGy4YbywG4WfsKo-i0oVDz_NTbM",
  authDomain: "loswingin-r6.firebaseapp.com",
  projectId: "loswingin-r6",
  storageBucket: "loswingin-r6.firebasestorage.app",
  messagingSenderId: "44769835884",
  appId: "1:44769835884:web:157c7aed1b98442532d149",
  measurementId: "G-LF4DE76P16"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const adminPin = "1234";
let adminUnlocked = false;

// Tab switching
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.getAttribute('data-tab');

    if ((tab === "admin" || tab === "brackets") && !adminUnlocked) {
      alert("Enter the PIN under Admin to access this section.");
      return;
    }

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    button.classList.add('active');
    document.getElementById(tab).classList.add('active');

    if (tab === "brackets") {
      fetchRegisteredPlayers();
    }
  });
});

// Registration form
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("playerName").value.trim();
  const email = document.getElementById("playerEmail").value.trim();
  const team = document.getElementById("playerTeam").value.trim();

  if (!name || !email || !team) return alert("Please fill out all fields.");

  try {
    await db.collection("registeredPlayers").add({
      name, email, team,
      timestamp: Date.now()
    });

    document.getElementById("confirmation").style.display = "block";
    document.getElementById("registerForm").reset();
    setTimeout(() => {
      document.getElementById("confirmation").style.display = "none";
    }, 3000);
  } catch (err) {
    console.error("Registration failed:", err);
  }
});

// PIN access
document.getElementById("adminPinBtn").addEventListener("click", () => {
  const input = document.getElementById("adminPin").value;
  if (input === adminPin) {
    adminUnlocked = true;
    alert("Access granted.");
    document.getElementById("resetPlayersBtn").disabled = false;
  } else {
    alert("Incorrect PIN.");
  }
});

// Reset registered players
document.getElementById("resetPlayersBtn").addEventListener("click", async () => {
  const confirmed = confirm("Delete all registered players?");
  if (!confirmed) return;

  const snapshot = await db.collection("registeredPlayers").get();
  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  document.getElementById("playersList").innerHTML = "<p>All players have been reset.</p>";
});

// Load players under brackets tab
async function fetchRegisteredPlayers() {
  const list = document.getElementById("playersList");
  list.innerHTML = "<p>Loading...</p>";

  try {
    const snapshot = await db.collection("registeredPlayers").orderBy("timestamp", "desc").get();
    if (snapshot.empty) {
      list.innerHTML = "<p>No players registered yet.</p>";
      return;
    }

    list.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "player-entry";
      div.innerHTML = `<strong>${data.name}</strong> (${data.team}) - ${data.email}`;
      list.appendChild(div);
    });
  } catch (error) {
    list.innerHTML = "<p>Error loading players.</p>";
    console.error(error);
  }
}
