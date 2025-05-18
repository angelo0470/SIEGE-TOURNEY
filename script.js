// Firebase config (your credentials)
const firebaseConfig = {
  apiKey: "AIzaSyBiNxXtfGy4YbywG4WfsKo-i0oVDz_NTbM",
  authDomain: "loswingin-r6.firebaseapp.com",
  projectId: "loswingin-r6",
  storageBucket: "loswingin-r6.appspot.com",
  messagingSenderId: "44769835884",
  appId: "1:44769835884:web:157c7aed1b98442532d149",
  measurementId: "G-LF4DE76P16"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables
let adminPin = localStorage.getItem('adminPin') || '1234';
let authenticatedTabs = { admin: false, brackets: false };
let pendingTab = null;

// Elements
const tabs = document.querySelectorAll('.tab-link');
const sections = document.querySelectorAll('.tab');
const pinPromptOverlay = document.getElementById('pinPromptOverlay');
const pinInput = document.getElementById('pinInput');
const pinError = document.getElementById('pinError');

const registerForm = document.getElementById('registerForm');
const registerMsg = document.getElementById('registerMsg');

const adminStatus = document.getElementById('adminStatus');
const adminContent = document.getElementById('adminContent');
const adminRegisteredList = document.getElementById('adminRegisteredList');

const registeredList = document.getElementById('registeredList');

const pinSubmitBtn = document.getElementById('pinSubmitBtn');
const pinCancelBtn = document.getElementById('pinCancelBtn');

const changePinBtn = document.getElementById('changePinBtn');
const newPinInput = document.getElementById('newPin');
const pinChangeMsg = document.getElementById('pinChangeMsg');

const generateBracketsBtn = document.getElementById('generateBracketsBtn');
const resetRegisteredBtn = document.getElementById('resetRegisteredBtn');
const bracketOutput = document.getElementById('bracketOutput');
const bracketTypeSelect = document.getElementById('bracketType');

// --- TAB SWITCHING ---

tabs.forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const targetTab = tab.dataset.tab;

    // PIN protected tabs: brackets and admin
    if ((targetTab === 'admin' || targetTab === 'brackets') && !authenticatedTabs[targetTab]) {
      showPinPrompt(targetTab);
      return;
    }

    activateTab(targetTab);
  });
});

function activateTab(tabName) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  sections.forEach(s => s.classList.toggle('active', s.id === tabName));

  if (tabName === 'brackets') {
    loadRegistrationsToBrackets();
  }
  if (tabName === 'admin') {
    loadRegistrationsToAdmin();
    adminContent.style.display = 'block';
  } else {
    adminContent.style.display = 'none';
  }
}

// --- PIN PROMPT ---

function showPinPrompt(tabName) {
  pendingTab = tabName;
  pinPromptOverlay.style.display = 'flex';
  pinInput.value = '';
  pinError.textContent = '';
  pinInput.focus();
}

pinSubmitBtn.addEventListener('click', () => {
  const pin = pinInput.value.trim();
  if (pin === adminPin) {
    authenticatedTabs[pendingTab] = true;
    pinPromptOverlay.style.display = 'none';
    pinError.textContent = '';
    activateTab(pendingTab);
    pendingTab = null;
    adminStatus.textContent = "Admin access granted.";
  } else {
    pinError.textContent = 'Incorrect PIN.';
  }
});

pinCancelBtn.addEventListener('click', () => {
  pinPromptOverlay.style.display = 'none';
  pinError.textContent = '';
  pendingTab = null;
  activateTab('register');
});

// --- CHANGE PIN ---

changePinBtn.addEventListener('click', () => {
  const newPin = newPinInput.value.trim();
  if (newPin.length < 4) {
    pinChangeMsg.textContent = 'PIN must be at least 4 characters.';
    return;
  }
  adminPin = newPin;
  localStorage.setItem('adminPin', adminPin);
  pinChangeMsg.textContent = 'PIN changed successfully.';
  newPinInput.value = '';
  setTimeout(() => pinChangeMsg.textContent = '', 3000);
});

// --- REGISTER FORM SUBMISSION ---

registerForm.addEventListener('submit', async e => {
  e.preventDefault();

  const teamName = document.getElementById('teamName').value.trim();
  const contactInfo = document.getElementById('contactInfo').value.trim();

  if (!teamName || !contactInfo) {
    registerMsg.textContent = "Please fill in all fields.";
    return;
  }

  try {
    await db.collection('registrations').add({
      teamName,
      contactInfo,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    registerMsg.textContent = "Registration successful!";
    registerForm.reset();

    if (authenticatedTabs.brackets && document.getElementById('brackets').classList.contains('active')) {
      loadRegistrationsToBrackets();
    }
  } catch (err) {
    console.error("Error registering:", err);
    registerMsg.textContent = "Failed to register. Try again.";
  }

  setTimeout(() => registerMsg.textContent = '', 3000);
});

// --- LOAD REGISTRATIONS TO BRACKETS ---

async function loadRegistrationsToBrackets() {
  registeredList.innerHTML = '<li>Loading...</li>';
  try {
    const snapshot = await db.collection('registrations').orderBy('timestamp').get();
    if (snapshot.empty) {
      registeredList.innerHTML = '<li>No registrations yet.</li>';
      return;
    }
    registeredList.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement('li');
      li.textContent = `${data.teamName} — ${data.contactInfo}`;
      registeredList.appendChild(li);
    });
  } catch (err) {
    registeredList.innerHTML = '<li>Error loading registrations.</li>';
    console.error(err);
  }
}

// --- LOAD REGISTRATIONS TO ADMIN ---

async function loadRegistrationsToAdmin() {
  adminRegisteredList.innerHTML = '<li>Loading...</li>';
  try {
    const snapshot = await db.collection('registrations').orderBy('timestamp').get();
    if (snapshot.empty) {
      adminRegisteredList.innerHTML = '<li>No registrations yet.</li>';
      return;
    }
    adminRegisteredList.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement('li');
      li.textContent = `${data.teamName} — ${data.contactInfo}`;
      adminRegisteredList.appendChild(li);
    });
  } catch (err) {
    adminRegisteredList.innerHTML = '<li>Error loading registrations.</li>';
    console.error(err);
  }
}

// --- RESET REGISTERED PLAYERS ---

resetRegisteredBtn.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to reset all registered players? This cannot be undone.')) return;

  try {
    const snapshot = await db.collection('registrations').get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    bracketOutput.textContent = '';
    loadRegistrationsToBrackets();
    if (authenticatedTabs.admin) loadRegistrationsToAdmin();

    alert('All registrations have been reset.');
  } catch (err) {
    console.error("Error resetting registrations:", err);
    alert('Failed to reset registrations.');
  }
});

// --- BRACKET GENERATION (placeholder) ---

generateBracketsBtn.addEventListener('click', () => {
  const type = bracketTypeSelect.value;
  bracketOutput.textContent = `Generating ${type} brackets...\n\n(Bracket logic not implemented yet)`;
});

// --- INITIALIZATION ---

activateTab('register');
pinPromptOverlay.style.display = 'none';
adminContent.style.display = 'none';
