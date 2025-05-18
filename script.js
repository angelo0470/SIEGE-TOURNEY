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

// Cached DOM elements
const tabs = document.querySelectorAll('.tab-link');
const tabSections = document.querySelectorAll('.tab');
const pinPromptOverlay = document.getElementById('pinPromptOverlay');
const pinInput = document.getElementById('pinInput');
const pinSubmitBtn = document.getElementById('pinSubmitBtn');
const pinCancelBtn = document.getElementById('pinCancelBtn');
const pinError = document.getElementById('pinError');

const registerForm = document.getElementById('registerForm');
const teamNameInput = document.getElementById('teamName');
const contactInfoInput = document.getElementById('contactInfo');

const registeredList = document.getElementById('registeredList');
const adminRegisteredList = document.getElementById('adminRegisteredList');

const bracketTypeSelect = document.getElementById('bracketType');
const generateBracketsBtn = document.getElementById('generateBracketsBtn');
const resetRegisteredBtn = document.getElementById('resetRegisteredBtn');

const bracketOutput = document.getElementById('bracketOutput');

const adminStatus = document.getElementById('adminStatus');
const adminContent = document.getElementById('adminContent');

const newPinInput = document.getElementById('newPin');
const changePinBtn = document.getElementById('changePinBtn');
const pinChangeMsg = document.getElementById('pinChangeMsg');

// Variables
let currentTab = 'register';
let accessGrantedFor = null; // "brackets" or "admin" or null
const PIN_STORAGE_KEY = 'adminPin';
const DEFAULT_PIN = '1234'; // default PIN, recommend you change this

// Helper functions

// Get saved PIN or default
function getStoredPin() {
  return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
}

// Save new PIN
function setStoredPin(pin) {
  localStorage.setItem(PIN_STORAGE_KEY, pin);
}

// Show PIN prompt for specific tab
function showPinPrompt(tabName) {
  pinPromptOverlay.style.display = 'flex';
  pinInput.value = '';
  pinError.textContent = '';
  pinSubmitBtn.onclick = () => {
    const enteredPin = pinInput.value.trim();
    if (enteredPin === getStoredPin()) {
      accessGrantedFor = tabName;
      pinPromptOverlay.style.display = 'none';
      activateTab(tabName);
      if (tabName === 'admin') {
        adminContent.style.display = 'block';
        adminStatus.style.display = 'none';
      }
      if (tabName === 'brackets') {
        adminContent.style.display = 'none';
        adminStatus.style.display = 'none';
      }
      loadRegisteredPlayers();
    } else {
      pinError.textContent = 'Incorrect PIN. Try again.';
    }
  };
  pinCancelBtn.onclick = () => {
    pinPromptOverlay.style.display = 'none';
    // revert to register tab
    activateTab('register');
  };
}

// Activate tab by name
function activateTab(tabName) {
  currentTab = tabName;
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  tabSections.forEach(section => {
    if (section.id === tabName) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });
}

// Load registered players from Firestore and show in brackets and admin list
async function loadRegisteredPlayers() {
  registeredList.innerHTML = '';
  adminRegisteredList.innerHTML = '';
  bracketOutput.textContent = '';

  try {
    const snapshot = await db.collection('registrations').orderBy('timestamp').get();
    if (snapshot.empty) {
      registeredList.innerHTML = '<li>No registered players yet.</li>';
      adminRegisteredList.innerHTML = '<li>No registered players yet.</li>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement('li');
      li.textContent = `${data.teamName} - ${data.contactInfo}`;
      registeredList.appendChild(li.cloneNode(true));
      adminRegisteredList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading registrations:", error);
  }
}

// Add new registration to Firestore
async function addRegistration(teamName, contactInfo) {
  try {
    await db.collection('registrations').add({
      teamName,
      contactInfo,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    loadRegisteredPlayers();
  } catch (error) {
    console.error("Error adding registration:", error);
  }
}

// Reset all registered players
async function resetRegisteredPlayers() {
  if (!confirm("Are you sure you want to reset all registered players? This cannot be undone.")) {
    return;
  }
  try {
    const snapshot = await db.collection('registrations').get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    loadRegisteredPlayers();
    bracketOutput.textContent = '';
  } catch (error) {
    console.error("Error resetting registrations:", error);
  }
}

// Generate brackets (simple random grouping based on bracket type)
async function generateBrackets() {
  try {
    const snapshot = await db.collection('registrations').orderBy('timestamp').get();
    if (snapshot.empty) {
      bracketOutput.textContent = 'No registered players to generate brackets.';
      return;
    }
    let players = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      players.push(data.teamName);
    });

    // Shuffle players
    players = players.sort(() => Math.random() - 0.5);

    const type = bracketTypeSelect.value;
    let groups = [];
    if (type === '5v5') {
      groups = chunkArray(players, 5);
    } else if (type === '2v2') {
      groups = chunkArray(players, 2);
    } else if (type === '1v1') {
      groups = chunkArray(players, 1);
    }

    let output = '';
    groups.forEach((group, i) => {
      output += `Group ${i + 1}:\n`;
      group.forEach(player => {
        output += `  - ${player}\n`;
      });
      output += '\n';
    });

    bracketOutput.textContent = output;
  } catch (error) {
    console.error("Error generating brackets:", error);
    bracketOutput.textContent = 'Error generating brackets.';
  }
}

// Utility: chunk array into groups of size n
function chunkArray(array, n) {
  const result = [];
  for (let i = 0; i < array.length; i += n) {
    result.push(array.slice(i, i + n));
  }
  return result;
}

// Event Listeners

// Tab click
tabs.forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const tabName = tab.dataset.tab;
    // If tab requires PIN protection
    if (tab.classList.contains('pin-protected')) {
      if (accessGrantedFor === tabName) {
        activateTab(tabName);
      } else {
        showPinPrompt(tabName);
      }
    } else {
      accessGrantedFor = null;
      adminContent.style.display = 'none';
      adminStatus.style.display = 'block';
      activateTab(tabName);
    }
  });
});

// Register form submit
registerForm.addEventListener('submit', e => {
  e.preventDefault();
  const teamName = teamNameInput.value.trim();
  const contactInfo = contactInfoInput.value.trim();
  if (!teamName || !contactInfo) return;
  addRegistration(teamName, contactInfo);
  registerForm.reset();
  alert('Registration submitted!');
});

// Generate brackets button
generateBracketsBtn.addEventListener('click', () => {
  if (accessGrantedFor === 'brackets') {
    generateBrackets();
  } else {
    alert('Please enter PIN to generate brackets.');
  }
});

// Reset registered players button (admin only)
resetRegisteredBtn.addEventListener('click', () => {
  if (accessGrantedFor === 'admin') {
    resetRegisteredPlayers();
  } else {
    alert('Please enter PIN to reset registered players.');
  }
});

// Change PIN button (admin only)
changePinBtn.addEventListener('click', () => {
  if (accessGrantedFor !== 'admin') {
    alert('Please enter admin PIN to change PIN.');
    return;
  }
  const newPin = newPinInput.value.trim();
  if (!newPin) {
    pinChangeMsg.textContent = 'Please enter a new PIN.';
    return;
  }
  setStoredPin(newPin);
  pinChangeMsg.textContent = 'PIN changed successfully!';
  newPinInput.value = '';
});

// On page load, show register tab and load players (if any)
window.onload = () => {
  activateTab('register');
  loadRegisteredPlayers();
};
