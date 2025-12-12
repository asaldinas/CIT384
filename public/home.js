// home.js – login logic
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("user-form");
  const user = document.getElementById("username");
  const password = document.getElementById("user-password");
  const submitButton = document.getElementById("submit");

  // Basic existence checks (helps during development)
  if (!form) {
    console.error("Login form with id 'user-form' not found.");
    return;
  }
  if (!user) {
    console.error("Username input with id 'username' not found.");
    return;
  }
  if (!password) {
    console.error("Password input with id 'user-password' not found.");
    return;
  }
  if (!submitButton) {
    console.error("Submit button with id 'submit' not found.");
    return;
  }

  // Handle form submit (preferred over button click)
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // prevent browser from going directly to form.html

    const usernameValue = user.value.trim();
    const passwordValue = password.value.trim();

    // Front-end validation
    if (usernameValue === "") {
      alert("Please enter a username or email.");
      user.focus();
      return;
    }

    if (passwordValue === "") {
      alert("Please enter a password.");
      password.focus();
      return;
    }

    if (passwordValue.length < 8) {
      alert("Password must be at least 8 characters long.");
      password.focus();
      return;
    }

    try {
      // Call your backend login API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameValue,  // can be username OR email (server handles both)
          password: passwordValue,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        // Show server message if provided, otherwise generic
        alert(data.message || "Login failed. Please check your credentials and try again.");
        return;
      }

      // ✅ Login successful – redirect to the protected page
      window.location.href = "home.html";
    } catch (err) {
      console.error("Login request error:", err);
      alert("An error occurred while logging in. Please try again.");
    }
  });
});
