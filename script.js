// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiNxXtfGy4YbywG4WfsKo-i0oVDz_NTbM",
  authDomain: "loswingin-r6.firebaseapp.com",
  projectId: "loswingin-r6",
  storageBucket: "loswingin-r6.firebasestorage.app",
  messagingSenderId: "44769835884",
  appId: "1:44769835884:web:157c7aed1b98442532d149",
  measurementId: "G-LF4DE76P16"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Tab Switching
function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.style.display = "none");
  document.getElementById(tabId).style.display = "block";
}

// PIN Entry
function enterPin(section) {
  const entered = prompt("Enter PIN:");
  if (entered === "1234") {
    showTab(section);
    if (section === "brackets") fetchRegisteredPlayers();
  } else {
    alert("Incorrect PIN");
  }
}

// Registration Submission
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const teamName = document.getElementById("teamName").value;
  const gamertags = document.getElementById("gamertags").value;
  const contact = document.getElementById("contact").value;

  try {
    await db.collection("registrations").add({ teamName, gamertags, contact });
    document.getElementById("confirmation").textContent = "Registration successful!";
    document.getElementById("registerForm").reset();
  } catch (error) {
    console.error("Registration Error:", error);
    alert("Failed to register.");
  }
});

// Fetch Registered Players
async function fetchRegisteredPlayers() {
  const list = document.getElementById("registeredPlayersList");
  list.innerHTML = "";
  const snapshot = await db.collection("registrations").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const item = document.createElement("li");
    item.textContent = `${data.teamName} | ${data.gamertags} | ${data.contact}`;
    list.appendChild(item);
  });
}

// Admin Reset
async function resetRegistrations() {
  if (!confirm("Are you sure you want to delete all registrations?")) return;
  const snapshot = await db.collection("registrations").get();
  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  alert("All players removed.");
  fetchRegisteredPlayers();
}
