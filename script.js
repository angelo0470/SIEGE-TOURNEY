// Initialize Firebase (make sure to include your Firebase config here)
const firebaseConfig = {
  apiKey: "AIzaSyBiNxXtfGy4YbywG4WfsKo-i0oVDz_NTbM",
  authDomain: "loswingin-r6.firebaseapp.com",
  projectId: "loswingin-r6",
  storageBucket: "loswingin-r6.firebasestorage.app",
  messagingSenderId: "44769835884",
  appId: "1:44769835884:web:157c7aed1b98442532d149",
  measurementId: "G-LF4DE76P16"
};

// Firebase compat initialization
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Admin and Brackets PINs
const ADMIN_PIN = "1234";
const BRACKETS_PIN = "4321";

// DOM Elements
const tabs = document.querySelectorAll('.tab');
const registerTabContent = document.getElementById('register');
const bracketsTabContent = document.getElementById('brackets');
const adminTabContent = document.getElementById('admin');
const playersTableBody = document.querySelector('#playersTable tbody');
const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');
const adminPinInput = document.getElementById('adminPinInput');
const adminPinBtn = document.getElementById('adminPinBtn');
const adminControls = document.getElementById('adminControls');
const adminMessage = document.getElementById('adminMessage');

let isAdminAuthenticated = false;
let isBracketsAuthenticated = false;

// Tab switching with PIN protection
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const selected = tab.getAttribute('data-tab');

    if ((selected === 'admin' && !isAdminAuthenticated) ||
        (selected === 'brackets' && !isBracketsAuthenticated)) {
      alert('Please enter the correct PIN to access this tab.');
      return;
    }

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    registerTabContent.classList.add('hidden');
    bracketsTabContent.classList.add('hidden');
    adminTabContent.classList.add('hidden');

    if (selected === 'register') {
      registerTabContent.classList.remove('hidden');
    } else if (selected === 'brackets') {
      bracketsTabContent.classList.remove('hidden');
      loadRegisteredPlayers();
    } else if (selected === 'admin') {
      adminTabContent.classList.remove('hidden');
    }
  });
});

// Register form submit handler
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerMessage.textContent = "";
  registerMessage.style.color = "#0f0";

  const playerName = document.getElementById('playerName').value.trim();
  const teamName = document.getElementById('teamName').value.trim();

  if (!playerName) {
    registerMessage.style.color = "#f00";
    registerMessage.textContent = "Player name is required.";
    return;
  }

  try {
    await db.collection("registeredPlayers").add({
      playerName,
      teamName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    registerMessage.textContent = "Registration successful!";
    registerForm.reset();
  } catch (error) {
    registerMessage.style.color = "#f00";
    registerMessage.textContent = "Error registering: " + error.message;
  }
});

// Load registered players from Firestore
async function loadRegisteredPlayers() {
  playersTableBody.innerHTML = "";
  try {
    const snapshot = await db.collection("registeredPlayers").orderBy("timestamp").get();
    if (snapshot.empty) {
      playersTableBody.innerHTML = `<tr><td colspan="2">No registered players found.</td></tr>`;
      return;
    }
    snapshot.forEach(doc => {
      const data = doc.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${data.playerName || ''}</td>
        <td>${data.teamName || ''}</td>
      `;
      playersTableBody.appendChild(tr);
    });
  } catch (error) {
    playersTableBody.innerHTML = `<tr><td colspan="2">Error loading players: ${error.message}</td></tr>`;
  }
}

// Admin PIN button handler
adminPinBtn.addEventListener('click', () => {
  const pin = adminPinInput.value.trim();
  if (pin === ADMIN_PIN) {
    isAdminAuthenticated = true;
    adminControls.classList.remove('hidden');
    adminMessage.style.color = "#0f0";
    adminMessage.textContent = "Admin access granted.";
    adminPinInput.value = "";
  } else if (pin === BRACKETS_PIN) {
    isBracketsAuthenticated = true;
    alert("Brackets access granted.");
    adminPinInput.value = "";
    // Switch to brackets tab automatically
    document.querySelector('.tab[data-tab="brackets"]').click();
  } else {
    adminMessage.style.color = "#f00";
    adminMessage.textContent = "Incorrect PIN.";
    adminControls.classList.add('hidden');
  }
});

// Reset registered players button handler
document.getElementById('resetPlayersBtn').addEventListener('click', async () => {
  if (!confirm("Are you sure you want to reset all registered players?")) return;

  try {
    const snapshot = await db.collection("registeredPlayers").get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    adminMessage.style.color = "#0f0";
    adminMessage.textContent = "All registered players have been reset.";
    loadRegisteredPlayers();
  } catch (error) {
    adminMessage.style.color = "#f00";
    adminMessage.textContent = "Error resetting players: " + error.message;
  }
});

// Initial load of players if brackets authenticated
if (isBracketsAuthenticated) {
  loadRegisteredPlayers();
}
