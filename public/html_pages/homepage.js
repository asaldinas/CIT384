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
    submit: "form.html",
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
(function () {
  const toggleBtn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('options');

  if (!toggleBtn || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    nav.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
  };

  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('open')) return;
    const withinToggle = toggleBtn.contains(e.target);
    const withinNav = nav.contains(e.target);
    if (!withinToggle && !withinNav) closeMenu();
  });

  // Reset state on resize (e.g., rotate phone or go back to desktop)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.matchMedia('(min-width: 769px)').matches) {
        // desktop: ensure nav is visible and not animated
        nav.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }, 100);
  });
})();
