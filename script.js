// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBiNxXtfGy4YbywG4WfsKo-i0oVDz_NTbM",
  authDomain: "loswingin-r6.firebaseapp.com",
  projectId: "loswingin-r6",
  storageBucket: "loswingin-r6.firebasestorage.app",
  messagingSenderId: "44769835884",
  appId: "1:44769835884:web:157c7aed1b98442532d149",
  measurementId: "G-LF4DE76P16"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const registerForm = document.getElementById('registerForm');
const confirmation = document.getElementById('confirmation');
const registeredTeams = document.getElementById('registeredTeams');
const tabs = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    contents.forEach(c => {
      c.classList.remove('active');
      if (c.id === target) c.classList.add('active');
    });
  });
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const team = document.getElementById('teamName').value;
  const contact = document.getElementById('contactInfo').value;
  await db.collection("Registered").add({ team, contact });
  confirmation.classList.remove('hidden');
  registerForm.reset();
  setTimeout(() => confirmation.classList.add('hidden'), 3000);
});

function checkBracketsPin() {
  const pin = document.getElementById('bracketsPin').value;
  if (pin === "1234") {
    document.getElementById('bracketsContent').classList.remove('hidden');
    document.getElementById('bracketsPinInput').classList.add('hidden');
    loadRegisteredTeams();
  } else {
    alert("Incorrect PIN");
  }
}

function checkAdminPin() {
  const pin = document.getElementById('adminPin').value;
  if (pin === "1234") {
    document.getElementById('adminContent').classList.remove('hidden');
    document.getElementById('adminPinInput').classList.add('hidden');
  } else {
    alert("Incorrect PIN");
  }
}

async function loadRegisteredTeams() {
  registeredTeams.innerHTML = "";
  const snapshot = await db.collection("Registered").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    li.textContent = `${data.team} - ${data.contact}`;
    registeredTeams.appendChild(li);
  });
}

async function resetRegistrations() {
  const snapshot = await db.collection("Registered").get();
  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  alert("All registrations have been reset.");
  registeredTeams.innerHTML = "";
}
