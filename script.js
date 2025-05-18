// Firebase configuration
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

const tabs = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab");
const pinOverlay = document.getElementById("pinPromptOverlay");
const pinInput = document.getElementById("pinInput");
const pinSubmitBtn = document.getElementById("pinSubmitBtn");
const pinCancelBtn = document.getElementById("pinCancelBtn");
const pinError = document.getElementById("pinError");

let currentTab = "register";
let pinRequiredTab = "";
let adminPin = "1234";

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    const target = tab.dataset.tab;

    if (tab.classList.contains("pin-protected")) {
      pinRequiredTab = target;
      pinOverlay.style.display = "flex";
      pinInput.value = "";
      pinError.textContent = "";
    } else {
      switchTab(target);
    }
  });
});

function switchTab(target) {
  tabs.forEach(t => t.classList.remove("active"));
  tabContents.forEach(c => c.classList.remove("active"));
  document.querySelector(`[data-tab="${target}"]`).classList.add("active");
  document.getElementById(target).classList.add("active");
  currentTab = target;

  if (target === "brackets") {
    loadRegistered();
  }
  if (target === "admin") {
    document.getElementById("adminStatus").textContent = "Access granted.";
    document.getElementById("adminContent").style.display = "block";
    loadAdminRegistered();
  }
}

// PIN submission
pinSubmitBtn.addEventListener("click", () => {
  if (pinInput.value === adminPin) {
    pinOverlay.style.display = "none";
    switchTab(pinRequiredTab);
  } else {
    pinError.textContent = "Incorrect PIN.";
  }
});
pinCancelBtn.addEventListener("click", () => {
  pinOverlay.style.display = "none";
});

// Registration form
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("teamName").value.trim();
  const contact = document.getElementById("contactInfo").value.trim();

  if (!name || !contact) return;

  await db.collection("registrations").add({ name, contact });
  document.getElementById("teamName").value = "";
  document.getElementById("contactInfo").value = "";
  alert("Registration submitted!");
});

// Load registrations in Brackets tab
async function loadRegistered() {
  const list = document.getElementById("registeredList");
  list.innerHTML = "";
  const snapshot = await db.collection("registrations").get();
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = `${doc.data().name} (${doc.data().contact})`;
    list.appendChild(li);
  });
}

// Load registrations in Admin tab
async function loadAdminRegistered() {
  const list = document.getElementById("adminRegisteredList");
  list.innerHTML = "";
  const snapshot = await db.collection("registrations").get();
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = `${doc.data().name} (${doc.data().contact})`;
    list.appendChild(li);
  });
}

// Change admin PIN
document.getElementById("changePinBtn").addEventListener("click", () => {
  const newPin = document.getElementById("newPin").value.trim();
  if (newPin.length >= 4) {
    adminPin = newPin;
    document.getElementById("pinChangeMsg").textContent = "PIN updated!";
  } else {
    document.getElementById("pinChangeMsg").textContent = "PIN must be at least 4 digits.";
  }
});

// Bracket generation (simple randomizer)
document.getElementById("generateBracketsBtn").addEventListener("click", async () => {
  const type = document.getElementById("bracketType").value;
  const snapshot = await db.collection("registrations").get();
  const names = snapshot.docs.map(doc => doc.data().name);
  shuffle(names);

  const matches = [];
  for (let i = 0; i < names.length; i += 2) {
    const p1 = names[i];
    const p2 = names[i + 1] || "BYE";
    matches.push(`${p1} vs ${p2}`);
  }

  document.getElementById("bracketOutput").textContent = `Bracket (${type}):\n\n` + matches.join("\n");
});

// Shuffle helper
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Reset registrations
document.getElementById("resetRegisteredBtn").addEventListener("click", async () => {
  const snapshot = await db.collection("registrations").get();
  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  loadRegistered();
  loadAdminRegistered();
  document.getElementById("bracketOutput").textContent = "";
});
