// Redirect to login page if not logged in
document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/auth/check");
  const data = await res.json();

  if (!data.loggedIn) {
    alert("You must be logged in to submit a maintenance request.");
    window.location.href = "index.html"; // redirect to login page
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("maintenance_form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const response = await fetch("/api/tickets", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.ok) {
      alert("Ticket submitted successfully!");
      form.reset();
    } else {
      alert("Error: " + result.message);
    }
  });
});
