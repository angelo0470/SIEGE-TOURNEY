// --- Persistent Registered Players ---
let registeredPlayers = JSON.parse(localStorage.getItem('registeredPlayers')) || [];

// --- Elements ---
const registerForm = document.getElementById('registerForm');
const registeredList = document.getElementById('registeredList');
const adminRegisteredList = document.getElementById('adminRegisteredList');
const resetRegisteredBtn = document.getElementById('resetRegisteredBtn');
const generateBracketsBtn = document.getElementById('generateBracketsBtn');
const bracketOutput = document.getElementById('bracketOutput');
const bracketTypeSelect = document.getElementById('bracketType');

// PIN and Admin elements
const pinPromptOverlay = document.getElementById('pinPromptOverlay');
const pinInput = document.getElementById('pinInput');
const pinSubmitBtn = document.getElementById('pinSubmitBtn');
const pinCancelBtn = document.getElementById('pinCancelBtn');
const pinError = document.getElementById('pinError');
const adminContent = document.getElementById('adminContent');
const adminStatus = document.getElementById('adminStatus');
const changePinBtn = document.getElementById('changePinBtn');
const newPinInput = document.getElementById('newPin');
const pinChangeMsg = document.getElementById('pinChangeMsg');
const tabLinks = document.querySelectorAll('.tab-link');

// --- Admin PIN storage ---
let adminPIN = localStorage.getItem('adminPIN') || '1234'; // default PIN

// --- Utility Functions ---

function updateRegisteredLists() {
  registeredList.innerHTML = '';
  adminRegisteredList.innerHTML = '';
  registeredPlayers.forEach(({ teamName, contactInfo }) => {
    const liUser = document.createElement('li');
    liUser.textContent = `${teamName} — ${contactInfo}`;
    registeredList.appendChild(liUser);

    const liAdmin = liUser.cloneNode(true);
    adminRegisteredList.appendChild(liAdmin);
  });
}

function saveRegisteredPlayers() {
  localStorage.setItem('registeredPlayers', JSON.stringify(registeredPlayers));
}

function clearBracketOutput() {
  bracketOutput.textContent = '';
}

// --- Event Listeners ---

// Register form submission
registerForm.addEventListener('submit', e => {
  e.preventDefault();
  const teamName = document.getElementById('teamName').value.trim();
  const contactInfo = document.getElementById('contactInfo').value.trim();

  if (!teamName || !contactInfo) return;

  registeredPlayers.push({ teamName, contactInfo });
  saveRegisteredPlayers();
  updateRegisteredLists();
  registerForm.reset();
  alert('Registration successful!');
});

// Reset registered players
resetRegisteredBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all registered players?')) {
    registeredPlayers = [];
    saveRegisteredPlayers();
    updateRegisteredLists();
    clearBracketOutput();
  }
});

// PIN Prompt handlers
pinSubmitBtn.addEventListener('click', () => {
  const enteredPIN = pinInput.value.trim();
  if (enteredPIN === adminPIN) {
    pinError.textContent = '';
    pinPromptOverlay.style.display = 'none';
    pinInput.value = '';
    pinError.textContent = '';
    openTab(lockedTab);
    if (lockedTab === 'admin') {
      adminStatus.style.display = 'none';
      adminContent.style.display = 'block';
    }
  } else {
    pinError.textContent = 'Incorrect PIN. Try again.';
  }
});

pinCancelBtn.addEventListener('click', () => {
  pinPromptOverlay.style.display = 'none';
  pinInput.value = '';
  pinError.textContent = '';
  lockedTab = null;
  openTab('register');
});

// Tab switching with PIN protection
let lockedTab = null;
tabLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const tab = link.dataset.tab;

    if (link.classList.contains('pin-protected')) {
      lockedTab = tab;
      pinPromptOverlay.style.display = 'flex';
      pinInput.focus();
    } else {
      openTab(tab);
    }
  });
});

function openTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.id === tabName);
  });
  tabLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabName);
  });

  // Reset admin view if leaving admin tab
  if (tabName !== 'admin') {
    adminStatus.style.display = 'block';
    adminContent.style.display = 'none';
  }
  lockedTab = null;
  clearBracketOutput();
}

// Change Admin PIN
changePinBtn.addEventListener('click', () => {
  const newPin = newPinInput.value.trim();
  if (newPin.length < 4) {
    pinChangeMsg.style.color = 'red';
    pinChangeMsg.textContent = 'PIN must be at least 4 digits.';
    return;
  }
  adminPIN = newPin;
  localStorage.setItem('adminPIN', adminPIN);
  pinChangeMsg.style.color = 'lime';
  pinChangeMsg.textContent = 'Admin PIN changed successfully.';
  newPinInput.value = '';
});

// Generate brackets (simple random pairing)
generateBracketsBtn.addEventListener('click', () => {
  if (registeredPlayers.length === 0) {
    alert('No registered players to generate brackets.');
    return;
  }

  const bracketType = bracketTypeSelect.value;
  let playersNeeded = 0;

  switch (bracketType) {
    case '5v5':
      playersNeeded = 10;
      break;
    case '2v2':
      playersNeeded = 4;
      break;
    case '1v1':
      playersNeeded = 2;
      break;
  }

  if (registeredPlayers.length < playersNeeded) {
    alert(`Not enough players for ${bracketType} bracket (need ${playersNeeded}).`);
    return;
  }

  // Shuffle players
  const shuffled = registeredPlayers.slice().sort(() => Math.random() - 0.5);

  // Take the needed number
  const bracketPlayers = shuffled.slice(0, playersNeeded);

  // Format output
  let outputText = `${bracketType} Bracket:\n\n`;

  for (let i = 0; i < bracketPlayers.length; i += (bracketType === '1v1' ? 2 : bracketType === '2v2' ? 2 : 10)) {
    if (bracketType === '5v5') {
      outputText += `Match ${i / 10 + 1}:\n`;
      outputText += 'Team 1:\n';
      bracketPlayers.slice(i, i + 5).forEach(p => outputText += `  - ${p.teamName}\n`);
      outputText += 'Team 2:\n';
      bracketPlayers.slice(i + 5, i + 10).forEach(p => outputText += `  - ${p.teamName}\n`);
      outputText += '\n';
    } else if (bracketType === '2v2') {
      outputText += `Match ${i / 4 + 1}:\n`;
      outputText += 'Team 1:\n';
      bracketPlayers.slice(i, i + 2).forEach(p => outputText += `  - ${p.teamName}\n`);
      outputText += 'Team 2:\n';
      bracketPlayers.slice(i + 2, i + 4).forEach(p => outputText += `  - ${p.teamName}\n`);
      outputText += '\n';
    } else if (bracketType === '1v1') {
      outputText += `Match ${i / 2 + 1}:\n`;
      outputText += `  ${bracketPlayers[i].teamName} VS ${bracketPlayers[i + 1].teamName}\n\n`;
    }
  }

  bracketOutput.textContent = outputText;
});

// Initialize UI
updateRegisteredLists();
openTab('register');
