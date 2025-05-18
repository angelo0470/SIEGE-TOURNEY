// Firebase configuration
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

const defaultPIN = "1234";
let currentPIN = localStorage.getItem("adminPIN") || defaultPIN;

document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById(button.dataset.tab).style.display = 'block';
  });
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("playerName").value;
  const email = document.getElementById("playerEmail").value;
  try {
    await db.collection("Registered").add({ name, email });
    document.getElementById("register-message").textContent = "Registration successful!";
    document.getElementById("register-form").reset();
  } catch (err) {
    document.getElementById("register-message").textContent = "Error saving registration.";
  }
});

function checkBracketPIN() {
  const input = document.getElementById("bracket-pin-input").value;
  if (input === currentPIN) {
    document.getElementById("brackets-lock").style.display = "none";
    document.getElementById("brackets-content").style.display = "block";
    loadRegisteredPlayers();
  } else {
    document.getElementById("bracket-pin-msg").textContent = "Incorrect PIN.";
  }
}

function checkAdminPIN() {
  const input = document.getElementById("admin-pin-input").value;
  if (input === currentPIN) {
    document.getElementById("admin-lock").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
  } else {
    document.getElementById("admin-pin-msg").textContent = "Incorrect PIN.";
  }
}

function changePIN() {
  const newPin = document.getElementById("newPin").value;
  if (newPin) {
    currentPIN = newPin;
    localStorage.setItem("adminPIN", newPin);
    document.getElementById("pin-change-msg").textContent = "PIN changed!";
  }
}

async function loadRegisteredPlayers() {
  const list = document.getElementById("registered-players-list");
  list.innerHTML = "";
  const snapshot = await db.collection("Registered").get();
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = `${doc.data().name} (${doc.data().email})`;
    list.appendChild(li);
  });
}

async function resetPlayers() {
  const snapshot = await db.collection("Registered").get();
  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  loadRegisteredPlayers();
  alert("All registered players have been reset.");
}

function generateBrackets() {
  alert("Bracket generation coming soon!");
}
