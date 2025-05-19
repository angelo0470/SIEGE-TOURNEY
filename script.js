// Your Firebase config
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

// Constants
const ADMIN_PIN = "admin123"; // Change to your desired admin pin
const BRACKETS_PIN = "1234";  // Brackets pin as you requested

// Tabs & content elements
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

const registerForm = document.getElementById("registerForm");
const confirmationMessage = document.getElementById("confirmationMessage");

const bracketsPinInput = document.getElementById("bracketsPinInput");
const bracketsPinBtn = document.getElementById("bracketsPinBtn");
const bracketsPinError = document.getElementById("bracketsPinError");
const bracketsContent = document.getElementById("bracketsContent");
const teamList = document.getElementById("teamList");
const bracketLogin = document.getElementById("bracketLogin");

const adminPinInput = document.getElementById("adminPinInput");
const adminPinBtn = document.getElementById("adminPinBtn");
const
