// Firebase config and initialization
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

// Globals
const tabs = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');
const registerForm = document.getElementById('registerForm');
const confirmation = document.getElementById('confirmation');
const playersList = document.getElementById('playersList');
const adminPinInput = document.getElementById('adminPin');
const adminPinBtn = document.getElementById('adminPinBtn');
const resetBtn = document.getElementById('resetPlayersBtn');
const ADMIN_PIN = '1234';

window.authorized = false;

// Tab switching with PIN protection
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    if ((target === 'admin' || target === 'brackets') && !window.authorized) {
      alert('Please unlock Admin first with PIN.');
      return;
    }
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(target).classList.add('active');
    if(target === 'brackets') loadPlayers();
  });
});

// Admin PIN unlock
adminPinBtn.addEventListener('click', () => {
  if (adminPinInput.value === ADMIN_PIN) {
    window.authorized = true;
    alert('Admin unlocked!');
    resetBtn.disabled = false;
    adminPinInput.value = '';
    // Auto switch to admin tab on unlock
    document.querySelector('.tab-button[data-tab="admin"]').click();
  } else {
    alert('Incorrect PIN');
  }
});

// Reset players in Firestore
resetBtn.addEventListener('click', async () => {
  if (!window.authorized) return alert('Unauthorized!');
  if (!confirm('Are you sure you want to reset all registered players?')) return;
  try {
    const snapshot = await db.collection('registeredPlayers').get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    alert('All registered players have been reset.');
    playersList.innerHTML = '';
  } catch (error) {
    console.error('Reset error:', error);
    alert('Failed to reset players.');
  }
});

// Register player
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('playerName').value.trim();
  const email = document.getElementById('playerEmail').value.trim();
  const team = document.getElementById('playerTeam').value.trim();
  if (!name || !email || !team) {
    alert('Please fill all fields');
    return;
  }
  try {
    await db.collection('registeredPlayers').add({
      name,
      email,
      team,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    confirmation.style.display = 'block';
    setTimeout(() => { confirmation.style.display = 'none'; }, 4000);
    registerForm.reset();
  } catch (error) {
    console.error('Error adding player:', error);
    alert('Registration failed, try again.');
  }
});

// Load players from Firestore for brackets tab
async function loadPlayers() {
  playersList.innerHTML = '<p>Loading players...</p>';
  try {
    const snapshot = await db.collection('registeredPlayers').orderBy('timestamp').get();
    if (snapshot.empty) {
      playersList.innerHTML = '<p>No players registered yet.</p>';
      return;
    }
    playersList.innerHTML = '';
    snapshot.forEach(doc => {
      const player = doc.data();
      const div = document.createElement('div');
      div.classList.add('player-item');
      div.textContent = `${player.name} — Team: ${player.team} — Email: ${player.email}`;
      playersList.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading players:', error);
    playersList.innerHTML = '<p>Error loading players.</p>';
  }
}
