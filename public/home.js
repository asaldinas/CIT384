document.addEventListener("DOMContentLoaded", () => {
  const submitButton = document.getElementById("submit");
  const user = document.getElementById("username");
  const password = document.getElementById("user-password");

  // Validate element existence
  if (!user) {
    console.error("Username field not found.");
    return;
  }
  if (!password) {
    console.error("Password field not found.");
    return;
  }
  if (!submitButton) {
    console.error("Submit button not found.");
    return;
  }

  // Add click event listener
  submitButton.addEventListener("click", (event) => {
    event.preventDefault(); // prevent form from submitting immediately

    const usernameValue = user.value.trim();
    const passwordValue = password.value.trim();

    // Validation checks
    if (usernameValue === "") {
      alert("Please enter a username.");
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

    // If everything is valid, go to next page
    window.location.href = "form.html";
  });
});
