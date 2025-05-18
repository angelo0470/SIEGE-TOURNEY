// === Firebase Configuration ===
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

// === Tab Switching ===
const tabs = document.querySelectorAll(".tab-link");
const sections = document.querySelectorAll(".tab");

tabs.forEach(tab => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    if (tab.classList.contains("pin-protected") && !localStorage.getItem("authenticated")) {
      document.getElementById("pinPromptOverlay").style.display = "flex";
      document.getElementById("pinPrompt").dataset.targetTab = tab.dataset.tab;
    } else {
      activateTab(tab.dataset.tab);
    }
  });
});

function activateTab(tabId) {
  tabs.forEach(t => t.classList.remove("active"));
  sections.forEach(s => s.classList.remove("active"));

  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
  document.getElementById(tabId).classList.add("active");

  if (tabId === "brackets") loadRegisteredPlayers();
  if (tabId === "admin") loadAdminPlayers();
}

// === PIN Handling ===
let adminPIN = localStorage.getItem("adminPIN") || "1234";

document.getElementById("pinSubmitBtn").addEventListener("click", () => {
  const enteredPin = document.getElementById("pinInput").value;
  if (enteredPin === adminPIN) {
    localStorage.setItem("authenticated", true);
    const targetTab = document.getElementById("pinPrompt").dataset.targetTab;
    activateTab(targetTab);
    document.getElementById("pinPromptOverlay").style.display = "none";
    document.getElementById("pinError").textContent = "";
  } else {
    document.getElementById("pinError").textContent = "Incorrect PIN";
  }
});

document.getElementById("pinCancelBtn").addEventListener("click", () => {
  document.getElementById("pinPromptOverlay").style.display = "none";
  document.getElementById("pinInput").value = "";
});

// === Register Form Submit ===
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const teamName = document.getElementById("teamName").value;
  const contactInfo = document.getElementById("contactInfo").value;

  try {
    await db.collection("registrations").add({ teamName, contactInfo, timestamp: Date.now() });
    alert("Registration submitted!");
    document.getElementById("registerForm").reset();
  } catch (err) {
    alert("Error saving registration.");
    console.error(err);
  }
});

// === Load Players to Brackets Tab ===
async function loadRegisteredPlayers() {
  const list = document.getElementById("registeredList");
  list.innerHTML = "";
  const snapshot = await db.collection("registrations").orderBy("timestamp").get();
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = `${doc.data().teamName} - ${doc.data().contactInfo}`;
    list.appendChild(li);
  });
}

// === Load Players to Admin Tab ===
async function loadAdminPlayers() {
  const list = document.getElementById("adminRegisteredList");
  list.innerHTML = "";
  const snapshot = await db.collection("registrations").orderBy("timestamp").get();
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = `${doc.data().teamName} - ${doc.data().contactInfo}`;
    list.appendChild(li);
  });
}

// === Reset Registered Players ===
document.getElementById("resetRegisteredBtn").addEventListener("click", async () => {
  const confirmReset = confirm("Are you sure you want to delete all registrations?");
  if (!confirmReset) return;

  const snapshot = await db.collection("registrations").get();
  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  loadRegisteredPlayers();
  loadAdminPlayers();
});

// === Change Admin PIN ===
document.getElementById("changePinBtn").addEventListener("click", () => {
  const newPin = document.getElementById("newPin").value;
  if (newPin.length >= 4) {
    localStorage.setItem("adminPIN", newPin);
    adminPIN = newPin;
    document.getElementById("pinChangeMsg").textContent = "PIN changed successfully.";
    setTimeout(() => {
      document.getElementById("pinChangeMsg").textContent = "";
    }, 2000);
  } else {
    document.getElementById("pinChangeMsg").textContent = "PIN must be at least 4 digits.";
  }
});
