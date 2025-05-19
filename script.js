// Firebase Configuration
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

// Tab Switching with PIN Protection
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  document.getElementById(tabId).style.display = 'block';
}

function promptPIN(tabId) {
  const pin = prompt("Enter PIN:");
  if (pin === "1234") {
    switchTab(tabId);
    if (tabId === "bracketsTab") {
      loadRegisteredPlayers();
    }
  } else {
    alert("Incorrect PIN.");
  }
}

// Handle Registration
document.getElementById("registrationForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const contact = document.getElementById("contact").value;

  db.collection("registrations").add({
    name: name,
    contact: contact,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("Registration submitted!");
    document.getElementById("registrationForm").reset();
  }).catch((error) => {
    alert("Error submitting registration: " + error.message);
  });
});

// Load Players to Brackets
function loadRegisteredPlayers() {
  const container = document.getElementById("registeredPlayers");
  container.innerHTML = "<p>Loading...</p>";
  db.collection("registrations").orderBy("timestamp", "desc").get()
    .then((querySnapshot) => {
      container.innerHTML = "";
      if (querySnapshot.empty) {
        container.innerHTML = "<p>No registered players yet.</p>";
        return;
      }
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "player-entry";
        div.textContent = `${data.name} - ${data.contact}`;
        container.appendChild(div);
      });
    })
    .catch((error) => {
      container.innerHTML = "<p>Error loading players.</p>";
      console.error("Error getting documents: ", error);
    });
}

// Reset Players (Admin)
function resetRegisteredPlayers() {
  if (!confirm("Are you sure you want to delete all registered players?")) return;
  db.collection("registrations").get().then((querySnapshot) => {
    const batch = db.batch();
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    return batch.commit();
  }).then(() => {
    alert("All registered players deleted.");
    loadRegisteredPlayers();
  }).catch((error) => {
    alert("Error deleting players: " + error.message);
  });
}
