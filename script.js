// Store registered players here
let registeredPlayers = [];

// Admin PIN (default)
let adminPin = localStorage.getItem('adminPin') || '1234';

// Elements
const registerForm = document.getElementById('registerForm');
const teamNameInput = document.getElementById('teamName');
const contactInfoInput = document.getElementById('contactInfo');
const registeredList = document.getElementById('registeredList');
const adminRegisteredList = document.getElementById('adminRegisteredList');

const pinPromptOverlay = document.getElementById('pinPromptOverlay');
const pinInput = document.getElementById('pinInput');
const pinSubmitBtn = document.getElementById('pinSubmitBtn');
const pinCancelBtn = document.getElementById('pinCancelBtn');
const pinError = document.getElementById('pinError');

const adminContent = document.getElementById('adminContent');
const adminStatus = document.getElementById('adminStatus');

const newPinInput = document.getElementById('newPin');
const changePinBtn = document.getElementById('changePinBtn');
const pinChangeMsg = document.getElementById('pinChangeMsg');

const bracketTypeSelect = document.getElementById('bracketType');
const generateBracketsBtn = document.getElementById('generateBracketsBtn');
const bracketOutput = document.getElementById('bracketOutput');

const resetRegisteredBtn = document.getElementById('resetRegisteredBtn');

// Tab navigation
const tabLinks = document.querySelectorAll('.tab-link');
const tabs = document.querySelectorAll('.tab');

tabLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tabName = link.getAttribute('data-tab');

    // If tab is pin protected, prompt for PIN first
    if (link.classList.contains('pin-protected')) {
      showPinPrompt(tabName);
    } else {
      showTab(tabName);
    }
  });
});

function showTab(tabName) {
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.id === tabName);
  });
  tabLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-tab') === tabName);
  });
}

// Show PIN prompt overlay and store target tab
let pendingTab = null;
function showPinPrompt(tabName) {
  pendingTab = tabName;
  pinInput.value = '';
  pinError.textContent = '';
  pinPromptOverlay.style.display = 'flex';
  pinInput.focus();
}

pinSubmitBtn.addEventListener('click', () => {
  const enteredPin = pinInput.value;
  if (enteredPin === adminPin) {
    pinPromptOverlay.style.display = 'none';
    pinError.textContent = '';
    showTab(pendingTab);
    if (pendingTab === 'admin') {
      showAdminPanel();
    }
    pendingTab = null;
  } else {
    pinError.textContent = 'Incorrect PIN. Try again.';
    pinInput.focus();
  }
});

pinCancelBtn.addEventListener('click', () => {
  pinPromptOverlay.style.display = 'none';
  pendingTab = null;
});

function showAdminPanel() {
  adminStatus.style.display = 'none';
  adminContent.style.display = 'block';
  updateAdminRegisteredList();
}

// Register form submit
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const teamName = teamNameInput.value.trim();
  const contactInfo = contactInfoInput.value.trim();

  if (teamName && contactInfo) {
    const newPlayer = { teamName, contactInfo };
    registeredPlayers.push(newPlayer);
    saveRegisteredPlayers();
    updateRegisteredLists();
    registerForm.reset();
    alert('Registration successful!');
  }
});

// Update the registered players lists (both views)
function updateRegisteredLists() {
  // User view
  registeredList.innerHTML = '';
  registeredPlayers.forEach((player, idx) => {
    const li = document.createElement('li');
    li.textContent = `${player.teamName} - ${player.contactInfo}`;
    registeredList.appendChild(li);
  });

  // Admin view
  updateAdminRegisteredList();
}

function updateAdminRegisteredList() {
  adminRegisteredList.innerHTML = '';
  registeredPlayers.forEach((player, idx) => {
    const li = document.createElement('li');
    li.textContent = `${player.teamName} - ${player.contactInfo}`;
    adminRegisteredList.appendChild(li);
  });
}

// Save to localStorage
function saveRegisteredPlayers() {
  localStorage.setItem('registeredPlayers', JSON.stringify(registeredPlayers));
}

// Load from localStorage
function loadRegisteredPlayers() {
  const stored = localStorage.getItem('registeredPlayers');
  if (stored) {
    registeredPlayers = JSON.parse(stored);
  } else {
    registeredPlayers = [];
  }
}

// Change admin PIN
changePinBtn.addEventListener('click', () => {
  const newPin = newPinInput.value.trim();
  if (newPin.length >= 4) {
    adminPin = newPin;
    localStorage.setItem('adminPin', adminPin);
    pinChangeMsg.textContent = 'PIN changed successfully.';
    newPinInput.value = '';
  } else {
    pinChangeMsg.textContent = 'PIN must be at least 4 characters.';
  }
});

// Generate brackets (simple example)
generateBracketsBtn.addEventListener('click', () => {
  const type = bracketTypeSelect.value;
  if (registeredPlayers.length === 0) {
    alert('No registered players to generate brackets.');
    return;
  }
  // Simple output: just list players grouped by bracket type
  let output = `Bracket Type: ${type}\n\n`;
  registeredPlayers.forEach((player, idx) => {
    output += `${idx + 1}. ${player.teamName} (${player.contactInfo})\n`;
  });
  bracketOutput.textContent = output;
});

// Reset registered players - visible in brackets tab and Admin tab
resetRegisteredBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all registered players?')) {
    registeredPlayers = [];
    saveRegisteredPlayers();
    updateRegisteredLists();
    bracketOutput.textContent = '';
  }
});

// Initialize on page load
loadRegisteredPlayers();
updateRegisteredLists();
