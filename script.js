document.addEventListener("DOMContentLoaded", () => {
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabs = document.querySelectorAll(".tab");
  const pinProtectedLinks = document.querySelectorAll(".pin-protected");
  const pinOverlay = document.getElementById("pinPromptOverlay");
  const pinInput = document.getElementById("pinInput");
  const pinError = document.getElementById("pinError");

  let adminPin = "1234";

  function showTab(tabId) {
    tabs.forEach((tab) => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");

    tabLinks.forEach((link) => link.classList.remove("active"));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
  }

  tabLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = link.getAttribute("data-tab");

      if (link.classList.contains("pin-protected")) {
        pinOverlay.style.display = "flex";
        pinInput.focus();

        document.getElementById("pinSubmitBtn").onclick = () => {
          if (pinInput.value === adminPin) {
            pinOverlay.style.display = "none";
            pinInput.value = "";
            pinError.textContent = "";
            showTab(tabId);
            if (tabId === "admin") {
              document.getElementById("adminContent").style.display = "block";
            }
          } else {
            pinError.textContent = "Incorrect PIN.";
          }
        };

        document.getElementById("pinCancelBtn").onclick = () => {
          pinOverlay.style.display = "none";
          pinInput.value = "";
          pinError.textContent = "";
        };
      } else {
        showTab(tabId);
      }
    });
  });

  // Registration
  const registerForm = document.getElementById("registerForm");
  const registeredList = document.getElementById("registeredList");
  const adminRegisteredList = document.getElementById("adminRegisteredList");

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("teamName").value;
    const contact = document.getElementById("contactInfo").value;

    const entry = document.createElement("li");
    entry.textContent = `${name} (${contact})`;
    registeredList.appendChild(entry);
    adminRegisteredList.appendChild(entry.cloneNode(true));

    registerForm.reset();
  });

  // PIN Change
  document.getElementById("changePinBtn").addEventListener("click", () => {
    const newPin = document.getElementById("newPin").value.trim();
    if (newPin) {
      adminPin = newPin;
      document.getElementById("pinChangeMsg").textContent = "PIN updated!";
    }
  });

  // Bracket Generation
  document.getElementById("generateBracketsBtn").addEventListener("click", () => {
    const players = Array.from(registeredList.children).map((li) => li.textContent);
    const bracketType = document.getElementById("bracketType").value;
    const bracketOutput = document.getElementById("bracketOutput");

    const shuffled = players.sort(() => 0.5 - Math.random());
    let output = `Bracket (${bracketType}):\n`;

    for (let i = 0; i < shuffled.length; i += 2) {
      output += `${shuffled[i]} vs ${shuffled[i + 1] || 'BYE'}\n`;
    }

    bracketOutput.textContent = output;
  });

  document.getElementById("resetRegisteredBtn").addEventListener("click", () => {
    registeredList.innerHTML = "";
    adminRegisteredList.innerHTML = "";
    document.getElementById("bracketOutput").textContent = "";
  });
});