// Firebase config (already initialized in HTML)
const db = firebase.firestore();

let adminPin = '1234';

// Tab Switching
document.querySelectorAll('.tab-link').forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    if (tab.classList.contains('pin-protected')) {
      document.getElementById('pinPromptOverlay').style.display = 'flex';
      document.getElementById('pinInput').dataset.tabTarget = tab.dataset.tab;
    } else {
      switchTab(tab.dataset.tab);
    }
  });
});

// PIN Submission
document.getElementById('pinSubmitBtn').addEventListener('click', () => {
  const enteredPin = document.getElementById('pinInput').value;
  const targetTab = document.getElementById('pinInput').dataset.tabTarget;
  if (enteredPin === adminPin) {
    document.getElementById('pinPromptOverlay').style.display = 'none';
    document.getElementById('pinInput').value = '';
    document.getElementById('pinError').textContent = '';
    switchTab(targetTab);
    if (targetTab === 'admin') showAdminContent();
  } else {
    document.getElementById('pinError').textContent = 'Incorrect PIN.';
  }
});

document.getElementById('pinCancelBtn').addEventListener('click', () => {
  document.getElementById('pinPromptOverlay').style.display = 'none';
  document.getElementById('pinInput').value = '';
  document.getElementById('pinError').textContent = '';
});

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');

  document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
  document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('active');

  if (tabId === 'brackets') loadRegisteredPlayers();
}

// Registration Form
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const teamName = document.getElementById('teamName').value.trim();
  const contactInfo = document.getElementById('contactInfo').value.trim();
  if (teamName && contactInfo) {
    await db.collection('registrations').add({ teamName, contactInfo, timestamp: Date.now() });
    document.getElementById('registerForm').reset();
    alert('Registered successfully!');
  }
});

async function loadRegisteredPlayers() {
  const list = document.getElementById('registeredList');
  list.innerHTML = '';
  const snapshot = await db.collection('registrations').orderBy('timestamp', 'desc').get();
  snapshot.forEach(doc => {
    const li = document.createElement('li');
    li.textContent = `${doc.data().teamName} - ${doc.data().contactInfo}`;
    list.appendChild(li);
  });
}

// Admin Content
function showAdminContent() {
  document.getElementById('adminContent').style.display = 'block';
  loadAdminList();
}

async function loadAdminList() {
  const list = document.getElementById('adminRegisteredList');
  list.innerHTML = '';
  const snapshot = await db.collection('registrations').orderBy('timestamp', 'desc').get();
  snapshot.forEach(doc => {
    const li = document.createElement('li');
    li.textContent = `${doc.data().teamName} - ${doc.data().contactInfo}`;
    list.appendChild(li);
  });
}

// Change Admin PIN
document.getElementById('changePinBtn').addEventListener('click', () => {
  const newPin = document.getElementById('newPin').value.trim();
  if (newPin) {
    adminPin = newPin;
    document.getElementById('pinChangeMsg').textContent = 'PIN updated!';
    document.getElementById('newPin').value = '';
  }
});

// Reset Players
document.getElementById('resetRegisteredBtn').addEventListener('click', async () => {
  const confirmReset = confirm('Are you sure you want to delete all registrations?');
  if (!confirmReset) return;

  const snapshot = await db.collection('registrations').get();
  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  loadRegisteredPlayers();
  loadAdminList();
  alert('All registrations deleted.');
});

// Placeholder for bracket generation
document.getElementById('generateBracketsBtn').addEventListener('click', () => {
  const type = document.getElementById('bracketType').value;
  document.getElementById('bracketOutput').textContent = `Bracket for ${type} will be generated here.`;
});
