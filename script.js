// Initial admin PIN (can be changed)
let adminPin = localStorage.getItem('adminPin') || '1234';

// Elements
const tabs = document.querySelectorAll('.tab-link');
const tabSections = document.querySelectorAll('.tab');
const registerForm = document.getElementById('registerForm');
const registeredList = document.getElementById('registeredList');
const adminRegisteredList = document.getElementById('adminRegisteredList');
const resetRegisteredBtn = document.getElementById('resetRegisteredBtn');
const resetRegisteredBtnAdmin = document.createElement('button'); // Will create a reset button in admin too
const adminContent = document.getElementById('adminContent');
const adminStatus = document.getElementById('adminStatus');
const pinPromptOverlay = document.getElementById('pinPromptOverlay');
const pinInput = document.getElementById('pinInput');
const pinSubmitBtn = document.getElementById('pinSubmitBtn');
const pinCancelBtn = document.getElementById('pinCancelBtn');
const pinError = document.getElementById('pinError');
const newPinInput = document.getElementById('newPin');
const changePinBtn = document.getElementById('changePinBtn');
const pinChangeMsg = document.getElementById('pinChangeMsg');

let currentPinProtectedTab = null;

// Helper: Get registrations from localStorage
function getRegistrations() {
  return JSON.parse(localStorage.getItem('registrations') || '[]');
}

// Helper: Save registrations to localStorage
function saveRegistrations(regs) {
  localStorage.setItem('registrations', JSON.stringify(regs));
}

// Render registrations list in given UL element
function renderRegistrationsList(ulElement) {
  const regs = getRegistrations();
  ulElement.innerHTML = '';
  if (regs.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No registered players or teams yet.';
    ulElement.appendChild(li);
    return;
  }
  regs.forEach(({teamName, contactInfo}, index) => {
    const li = document.createElement('li');
    li.textContent = `${teamName} — ${contactInfo}`;
    ulElement.appendChild(li);
  });
}

// Switch tabs
tabs.forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const targetTab = tab.getAttribute('data-tab');

    if (tab.classList.contains('pin-protected')) {
      // Show PIN prompt overlay
      currentPinProtectedTab = targetTab;
      pinError.textContent = '';
      pinInput.value = '';
      pinPromptOverlay.style.display = 'flex';
      pinInput.focus();
      return;
    }

    // Show the tab directly
    showTab(targetTab);
  });
});

function showTab(tabName) {
  tabSections.forEach(section => {
    section.classList.toggle('active', section.id === tabName);
  });
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
  });

  if (tabName === 'brackets') {
    renderRegistrationsList(registeredList);
  }
  if (tabName === 'admin') {
    renderRegistrationsList(adminRegisteredList);
  }
}

// Handle PIN submission
pinSubmitBtn.addEventListener('click', () => {
  const enteredPin = pinInput.value.trim();
  if (enteredPin === adminPin) {
    pinPromptOverlay.style.display = 'none';
    pinError.textContent = '';
    showTab(currentPinProtectedTab);
    if (currentPinProtectedTab === 'admin') {
      adminContent.style.display = 'block';
      adminStatus.style.display = 'none';
    }
    if (currentPinProtectedTab === 'brackets') {
      renderRegistrationsList(registeredList);
    }
  } else {
    pinError.textContent = 'Incorrect PIN. Try again.';
  }
});

pinCancelBtn.addEventListener('click', () => {
  pinPromptOverlay.style.display = 'none';
  currentPinProtectedTab = null;
});

// Register form submit
registerForm.addEventListener('submit', e => {
  e.preventDefault();
  const teamName = document.getElementById('teamName').value.trim();
  const contactInfo = document.getElementById('contactInfo').value.trim();

  if (!teamName || !contactInfo) return;

  const regs = getRegistrations();
  regs.push({ teamName, contactInfo });
  saveRegistrations(regs);

  registerForm.reset();
  alert('Registration successful!');

  // Update displayed lists if visible
  if (document.getElementById('brackets').classList.contains('active')) {
    renderRegistrationsList(registeredList);
  }
  if (document.getElementById('admin').classList.contains('active')) {
    renderRegistrationsList(adminRegisteredList);
  }
});

// Reset registered players button (Brackets tab)
resetRegisteredBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all registered players? This cannot be undone.')) {
    localStorage.removeItem('registrations');
    renderRegistrationsList(registeredList);
    renderRegistrationsList(adminRegisteredList);
  }
});

// Also add reset button in admin panel below registered list
resetRegisteredBtnAdmin.textContent = 'Reset Registered Players';
resetRegisteredBtnAdmin.classList.add('danger');
resetRegisteredBtnAdmin.style.marginTop = '10px';
adminContent.appendChild(resetRegisteredBtnAdmin);

resetRegisteredBtnAdmin.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all registered players? This cannot be undone.')) {
    localStorage.removeItem('registrations');
    renderRegistrationsList(registeredList);
    renderRegistrationsList(adminRegisteredList);
  }
});

// Change Admin PIN
changePinBtn.addEventListener('click', () => {
  const newPin = newPinInput.value.trim();
  if (newPin.length < 4) {
    pinChangeMsg.style.color = 'red';
    pinChangeMsg.textContent = 'PIN must be at least 4 digits.';
    return;
  }
  adminPin = newPin;
  localStorage.setItem('adminPin', adminPin);
  pinChangeMsg.style.color = 'green';
  pinChangeMsg.textContent = 'Admin PIN updated successfully.';
  newPinInput.value = '';
});

// On initial load, show the Register tab by default
showTab('register');
