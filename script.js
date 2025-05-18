// Firebase initialization
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

// Default admin PIN (can be changed in admin panel)
let adminPIN = localStorage.getItem('adminPIN') || '1234';

// Tab switching
document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', function () {
    if (this.classList.contains('pin-protected')) {
      showPinPrompt(this.dataset.tab);
    } else {
      switchTab(this.dataset.tab);
    }
  });
});

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelector(`#${tabId}`).classList.add('active');

  document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
  document.querySelector(`.tab-link[data-tab="${tabId}"]`).classList.add('active');

  if (tabId === 'brackets') {
    fetchRegistrations('registeredList');
  } else if (tabId === 'admin') {
    fetchRegistrations('adminRegisteredList');
  }
}

// PIN prompt logic
function showPinPrompt(tabId) {
  const overlay = document.getElementById('pinPromptOverlay');
  overlay.style.display = 'flex';

  document.getElementById('pinSubmitBtn').onclick = function () {
    const enteredPin = document.getElementById('pinInput').value;
    if (enteredPin === adminPIN) {
      overlay.style.display = 'none';
      document.getElementById('pinInput').value = '';
      document.getElementById('pinError').innerText = '';
      if (tabId === 'admin') {
        document.getElementById('adminContent').style.display = 'block';
      }
      switchTab(tabId);
    } else {
      document.getElementById('pinError').innerText = 'Incorrect PIN';
    }
  };

  document.getElementById('pinCancelBtn').onclick = function () {
    overlay.style.display = 'none';
    document.getElementById('pinInput').value = '';
    document.getElementById('pinError').innerText = '';
  };
}

// Registration form
document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('teamName').value;
  const contact = document.getElementById('contactInfo').value;

  if (!name || !contact) return;

  db.collection('registrations').add({
    name,
    contact,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert('Registered successfully!');
    document.getElementById('registerForm').reset();
  }).catch(console.error);
});

// Fetch registrations to display
function fetchRegistrations(targetId) {
  const list = document.getElementById(targetId);
  list.innerHTML = '';

  db.collection('registrations')
    .orderBy('timestamp', 'asc')
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        list.innerHTML = '<li>No players registered yet.</li>';
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement('li');
        li.textContent = `${data.name} (${data.contact})`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Error fetching registrations:', err);
      list.innerHTML = '<li>Error loading registrations.</li>';
    });
}

// Generate brackets (simple shuffle example)
document.getElementById('generateBracketsBtn').addEventListener('click', () => {
  db.collection('registrations')
    .get()
    .then(snapshot => {
      const players = snapshot.docs.map(doc => doc.data().name);
      const shuffled = players.sort(() => 0.5 - Math.random());
      const output = shuffled.join(' vs ');
      document.getElementById('bracketOutput').textContent = output || 'No players to bracket.';
    });
});

// Reset registrations
document.getElementById('resetRegisteredBtn').addEventListener('click', () => {
  if (!confirm('Are you sure you want to reset all registered players?')) return;

  db.collection('registrations')
    .get()
    .then(snapshot => {
      const batch = db.batch();
      snapshot.forEach(doc => batch.delete(doc.ref));
      return batch.commit();
    })
    .then(() => {
      alert('All registrations deleted.');
      fetchRegistrations('registeredList');
      fetchRegistrations('adminRegisteredList');
    })
    .catch(console.error);
});

// Change PIN
document.getElementById('changePinBtn').addEventListener('click', () => {
  const newPin = document.getElementById('newPin').value;
  if (newPin) {
    adminPIN = newPin;
    localStorage.setItem('adminPIN', newPin);
    document.getElementById('pinChangeMsg').textContent = 'PIN updated!';
  }
});
