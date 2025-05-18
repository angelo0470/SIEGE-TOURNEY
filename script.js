// Firebase config and initialization (replace with your own config)
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

const PIN_ADMIN = "admin123";  // Change to your admin PIN
const PIN_BRACKETS = "1234";

// --- TAB SWITCHING ---
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab');
    if (tab === "brackets" && !bracketsAccess) {
      alert("Enter PIN to access Brackets tab.");
      return;
    }
    if (tab === "admin" && !adminAccess) {
      alert("Enter Admin PIN to access Admin tab.");
      return;
    }
    activateTab(tab);
  });
});

function activateTab(tabName) {
  tabButtons.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName));
  tabContents.forEach(tc => tc.classList.toggle('active', tc.id === tabName));
  // Hide register form when brackets is active
  if (tabName === 'brackets') {
    document.getElementById('register').style.display = 'none';
  } else {
    document.getElementById('register').style.display = 'block';
  }
}

// --- PIN Access ---
let adminAccess = false;
let bracketsAccess = false;

document.getElementById('adminPinButton').addEventListener('click', () => {
  const pin = document.getElementById('adminPinInput').value.trim();
  if (pin === PIN_ADMIN) {
    adminAccess = true;
    alert("Admin access granted.");
    document.getElementById('adminPinContainer').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    activateTab('admin');
  } else {
    alert("Incorrect Admin PIN.");
  }
});

document.getElementById('bracketsPinButton').addEventListener('click', () => {
  const pin = document.getElementById('bracketsPinInput').value.trim();
  if (pin === PIN_BRACKETS) {
    bracketsAccess = true;
    alert("Brackets access granted.");
    document.getElementById('bracketsPinContainer').style.display = 'none';
    document.getElementById('registeredPlayersList').style.display = 'block';
    loadRegisteredPlayers();
    activateTab('brackets');
  } else {
    alert("Incorrect Brackets PIN.");
  }
});

// --- REGISTER FORM ---
document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('playerName').value.trim();
  const email = document.getElementById('playerEmail').value.trim();

  if (!name || !email) {
    alert("Please enter name and email.");
    return;
  }

  db.collection('registeredPlayers').add({
    name,
    email,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById('registerConfirmation').textContent = "Registered successfully!";
    document.getElementById('registerForm').reset();
  }).catch(err => {
    alert("Error registering: " + err.message);
  });
});

// --- LOAD REGISTERED PLAYERS ---
function loadRegisteredPlayers() {
  const playersUl = document.getElementById('playersUl');
  playersUl.innerHTML = '';

  db.collection('registeredPlayers').orderBy('timestamp', 'asc').get()
    .then(snapshot => {
      if (snapshot.empty) {
        playersUl.innerHTML = '<li>No registered players yet.</li>';
        return;
      }
      snapshot.forEach(doc => {
        const player = doc.data();
        const li = document.createElement('li');
        li.textContent = `${player.name} - ${player.email}`;
        playersUl.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Error fetching players:", err);
      playersUl.innerHTML = '<li>Error loading players.</li>';
    });
}

// --- RESET REGISTERED PLAYERS (ADMIN ONLY) ---
document.getElementById('resetPlayersBtn').addEventListener('click', () => {
  if (!adminAccess) {
    alert("Admin access required.");
    return;
  }
  if (!confirm("Are you sure you want to reset all registered players?")) return;

  // Delete all documents from 'registeredPlayers' collection
  db.collection('registeredPlayers').get()
    .then(snapshot => {
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      return batch.commit();
    })
    .then(() => {
      alert("All registered players have been reset.");
      if (bracketsAccess) loadRegisteredPlayers();
    })
    .catch(err => {
      alert("Error resetting players: " + err.message);
    });
});
