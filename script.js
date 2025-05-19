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

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Tab switching
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  });
});

// Register player
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const team = document.getElementById("team").value;

  try {
    await db.collection("registered").add({ name, team });
    document.getElementById("confirmation").classList.remove("hidden");
    document.getElementById("registerForm").reset();
    setTimeout(() => {
      document.getElementById("confirmation").classList.add("hidden");
    }, 3000);
  } catch (err) {
    alert("Registration failed.");
  }
});

// PIN-protected access
function checkBracketPin() {
  const pin = document.getElementById("bracketPin").value;
  if (pin === "1234") {
    document.getElementById("bracketProtected").classList.add("hidden");
    document.getElementById("bracketContent").classList.remove("hidden");
    loadPlayers();
  } else {
    alert("Incorrect PIN");
  }
}

function checkAdminPin() {
  const pin = document.getElementById("adminPin").value;
  if (pin === "1234") {
    document.getElementById("adminProtected").classList.add("hidden");
    document.getElementById("adminContent").classList.remove("hidden");
  } else {
    alert("Incorrect PIN");
  }
}

// Load registered players
async function loadPlayers() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  const snapshot = await db.collection("registered").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.name} - ${data.team}`;
    list.appendChild(li);
  });
}

// Admin reset
async function resetPlayers() {
  const snapshot = await db.collection("registered").get();
  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  alert("All registered players have been cleared.");
  loadPlayers();
}
