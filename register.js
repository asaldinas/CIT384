// register.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("user-form");
  const msg = document.getElementById("msg");

  const popup = (text) => alert(text);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

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

    // Send data to backend
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Email: email,
          username,
          password,
          password2,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        msg.textContent = data.message || "Something went wrong.";
        msg.style.color = "red";
        if (res.status === 409) popup("That email or username already exists.");
        else popup(data.message || "Error. Please try again.");
        return;
      }

      // ✅ Registration successful
      msg.textContent = "Registration successful! Redirecting...";
      msg.style.color = "green";
      popup("Registration successful!");

      // Redirect after 1.5 seconds (adjust delay as you like)
      setTimeout(() => {
        window.location.href = "form.html";
      }, 1500);
    } catch (err) {
      console.error(err);
      msg.textContent = "Network error.";
      msg.style.color = "red";
      popup("Network error. Please try again.");
    }
  });
});
