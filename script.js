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

const tabs = document.querySelectorAll('.tab-link');
const sections = document.querySelectorAll('.tab');

tabs.forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    if (tab.classList.contains('pin-protected') && !adminAuthenticated) {
      showPinPrompt(tab.dataset.tab);
      return;
    }
    activateTab(tab.dataset.tab);
  });
});

function activateTab(tabName) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  sections.forEach(s => s.classList.toggle('active', s.id === tabName));
  if (tabName === 'brackets') loadRegistrationsToBrackets();
  if (tabName === 'admin' && adminAuthenticated) loadRegistrationsToAdmin();
}

let adminAuthenticated = false;

const pinPromptOverlay = document.getElementById('pinPromptOverlay');
const pinInput = document.getElementById('pinInput');
const pinError = document.getElementById('pinError');
let pendingTab = null;

document.getElementById('pinSubmitBtn').addEventListener('click', () => {
  const pin = pinInput.value.trim();
  if (pin === adminPin) {
    adminAuthenticated = true;
    pinPromptOverlay.style.display = 'none';
    pinError.textContent = '';
    activateTab(pendingTab);
    pendingTab = null;
    document.getElementById('adminStatus').textContent = "Admin access granted.";
    document.getElementById('adminContent').style.display = 'block';
    loadRegistrationsToAdmin();
  } else {
    pinError.textContent = 'Incorrect PIN.';
  }
  pinInput.value = '';
});

document.getElementById('pinCancelBtn').addEventListener('click', () => {
  pinPromptOverlay.style.display = 'none';
  pinError.textContent = '';
  pendingTab = null;
  activateTab('register');
});

function showPinPrompt(tabName) {
  pendingTab = tabName;
  pinPromptOverlay.style.display = 'flex';
  pinInput.focus();
}

let adminPin = localStorage.getItem('adminPin') || '1234';

// Change admin PIN
document.getElementById('changePinBtn').addEventListener('click', () => {
  const newPin = document.getElementById('newPin').value.trim();
  if (newPin.length < 4) {
    document.getElementById('pinChangeMsg').textContent = 'PIN must be at least 4 characters.';
    return;
  }
  adminPin = newPin;
  localStorage.setItem('adminPin', adminPin);
  document.getElementById('pinChangeMsg').textContent = 'PIN changed successfully.';
  document.getElementById('newPin').value = '';
});

// Register form submission
const registerForm = document.getElementById('registerForm');
const registerMsg = document.getElementById('registerMsg');

registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const teamName = document.getElementById('teamName').value.trim();
  const contactInfo = document.getElementById('contactInfo').value.trim();

  if (!teamName || !contactInfo) return;

  try {
    await db.collection('registrations').add({
      teamName,
      contactInfo,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    registerMsg.textContent = "Registration successful!";
    registerForm.reset();
    if (document.getElementById('brackets').classList.contains('active')) {
      loadRegistrationsToBrackets();
    }
  } catch (err) {
    registerMsg.textContent = "Failed to register. Try again.";
    console.error(err);
  }
  setTimeout(() => registerMsg.textContent = '', 3000);
});

// Load registrations for Brackets tab
async function loadRegistrationsToBrackets() {
  const list = document.getElementById('registeredList');
  list.innerHTML = 'Loading...';
  try {
    const snapshot = await db.collection('registrations').orderBy('timestamp', 'asc').get();
    if (snapshot.empty) {
      list.innerHTML = '<li>No registrations yet.</li>';
      return;
    }
    list.innerHTML = '';
    snapshot.forEach(doc
