// homepage.js

// Wait until the page is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Map of navigation items to their corresponding pages
  const pageLinks = {
    about: "about.html",
    teams: "teams.html",
    projects: "projects.html",
    settings: "settings.html",
    contacts: "contacts.html",
    siteName: "home.html",
  };

  // Loop through each navigation item
  for (let id in pageLinks) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", () => {
        // Navigate to the corresponding page
        window.location.href = pageLinks[id];
      });
    }
  }
});
