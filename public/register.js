// register.js

document.getElementById("user-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Stop default form submission

  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const password2 = document.getElementById("password2").value.trim();
  const msg = document.getElementById("msg");

  // Clear previous message
  msg.textContent = "";

  // Check if all fields are filled
  if (!email || !username || !password || !password2) {
    msg.textContent = "Please fill in all fields.";
    msg.style.color = "red";
    return;
  }

  // Check if passwords match
  if (password !== password2) {
    msg.textContent = "Passwords do not match.";
    msg.style.color = "red";
    return;
  }

  // If all checks pass, redirect to form.html
  window.location.href = "form.html";
});
