// public/admin-login.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admin-login-form');
  const msgEl = document.getElementById('admin-msg');
  const usernameInput = document.getElementById('admin-username');
  const passwordInput = document.getElementById('admin-password');
 const pageLinks = {
    about: "about.html",
    projects: "projects.html",
    admin: "admin.html",
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
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    msgEl.textContent = '';
    msgEl.classList.remove('error', 'success');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      msgEl.textContent = 'Please enter both username/email and password.';
      msgEl.classList.add('error');
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        msgEl.textContent = data.message || 'Admin login failed.';
        msgEl.classList.add('error');
        return;
      }

      msgEl.textContent = 'Login successful. Redirecting...';
      msgEl.classList.add('success');

      // TODO: change this to your real admin dashboard page
      window.location.href = '/admin-dashboard.html';
    } catch (err) {
      console.error('Admin login fetch error:', err);
      msgEl.textContent = 'An error occurred while logging in. Please try again.';
      msgEl.classList.add('error');
    }
  });
});
