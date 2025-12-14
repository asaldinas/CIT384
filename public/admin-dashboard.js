// public/admin-dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const ticketsContainer = document.getElementById("tickets-container");
  const emptyStateEl = document.getElementById("empty-state");
  const filterButtons = document.querySelectorAll(".filter-chip");

  let allTickets = [];
  let currentFilter = "all";

  // Fetch all tickets on load
  fetchTickets();

  // Setup filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.status;
      renderTickets();
    });
  });

  async function fetchTickets() {
    try {
      const res = await fetch("/api/admin/tickets");
      const data = await res.json();

      if (!res.ok || !data.ok) {
        console.error("Failed to load tickets:", data.message);
        ticketsContainer.innerHTML = "";
        emptyStateEl.textContent = data.message || "Unable to load tickets.";
        emptyStateEl.style.display = "block";
        return;
      }

      allTickets = data.tickets || [];
      renderTickets();
    } catch (err) {
      console.error("Error fetching tickets:", err);
      ticketsContainer.innerHTML = "";
      emptyStateEl.textContent = "An error occurred while loading tickets.";
      emptyStateEl.style.display = "block";
    }
  }

  function renderTickets() {
    ticketsContainer.innerHTML = "";

    let ticketsToShow = allTickets;
    if (currentFilter !== "all") {
      ticketsToShow = allTickets.filter(t => t.status === currentFilter);
    }

    if (!ticketsToShow.length) {
      emptyStateEl.style.display = "block";
      return;
    } else {
      emptyStateEl.style.display = "none";
    }

    ticketsToShow.forEach(ticket => {
      const card = createTicketCard(ticket);
      ticketsContainer.appendChild(card);
    });
  }

  function createTicketCard(ticket) {
    const {
      id,
      description,
      location,
      category,
      comments,
      status,
      created_at,
      image_paths,
      user
    } = ticket;

    const card = document.createElement("article");
    card.className = "ticket-card";
    card.dataset.ticketId = id;
    card.dataset.status = status;

    // --- Image section ---
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "ticket-image-wrapper";

    if (Array.isArray(image_paths) && image_paths.length > 0) {
      const mainImg = document.createElement("img");
      mainImg.src = image_paths[0];
      mainImg.alt = "Ticket image";
      imageWrapper.appendChild(mainImg);
    } else {
      const noImg = document.createElement("div");
      noImg.className = "ticket-no-image";
      noImg.textContent = "No images attached.";
      imageWrapper.appendChild(noImg);
    }

    // --- Body ---
    const body = document.createElement("div");
    body.className = "ticket-body";

    // Header (user + status)
    const header = document.createElement("div");
    header.className = "ticket-header";

    const userWrapper = document.createElement("div");
    userWrapper.className = "ticket-user";

    const avatar = document.createElement("div");
    avatar.className = "user-avatar";
    const nameForInitials = (user?.username || user?.email || "U").toUpperCase();
    avatar.textContent = nameForInitials[0] || "U";

    const userMeta = document.createElement("div");
    userMeta.className = "user-meta";

    const userName = document.createElement("div");
    userName.className = "user-name";
    userName.textContent = user?.username || "Unknown user";

    const userEmail = document.createElement("div");
    userEmail.className = "user-email";
    userEmail.textContent = user?.email || "";

    userMeta.appendChild(userName);
    userMeta.appendChild(userEmail);

    userWrapper.appendChild(avatar);
    userWrapper.appendChild(userMeta);

    const statusPill = document.createElement("div");
    statusPill.className = `ticket-status-pill status-${status}`;
    statusPill.textContent =
      status === "open"
        ? "Open"
        : status === "in_progress"
        ? "In Progress"
        : "Completed";

    header.appendChild(userWrapper);
    header.appendChild(statusPill);

    // Meta info
    const meta = document.createElement("div");
    meta.className = "ticket-meta";

    const locLine = document.createElement("div");
    locLine.className = "ticket-meta-item";
    locLine.innerHTML = `<span class="label">Location:</span> ${location}`;

    const catLine = document.createElement("div");
    catLine.className = "ticket-meta-item";
    catLine.innerHTML = `<span class="label">Category:</span> ${category}`;

    meta.appendChild(locLine);
    meta.appendChild(catLine);

    // Description
    const descEl = document.createElement("div");
    descEl.className = "ticket-description";
    descEl.textContent = description || "";

    // Comments
    if (comments) {
      const commentsEl = document.createElement("div");
      commentsEl.className = "ticket-comments";
      commentsEl.textContent = `Comments: ${comments}`;
      body.appendChild(commentsEl);
    }

    // Thumbnails (if more than 1 image)
    let thumbnailsRow = null;
    if (Array.isArray(image_paths) && image_paths.length > 1) {
      thumbnailsRow = document.createElement("div");
      thumbnailsRow.className = "ticket-thumbnails";

      image_paths.slice(1).forEach(path => {
        const thumb = document.createElement("img");
        thumb.className = "ticket-thumbnail-img";
        thumb.src = path;
        thumb.alt = "Additional ticket image";
        thumb.addEventListener("click", () => {
          // Swap into main image on click
          const mainImg = imageWrapper.querySelector("img");
          if (mainImg) {
            const tmp = mainImg.src;
            mainImg.src = thumb.src;
            thumb.src = tmp;
          }
        });
        thumbnailsRow.appendChild(thumb);
      });
    }

    // Footer (timestamps + buttons)
    const footer = document.createElement("div");
    footer.className = "ticket-footer";

    const tsEl = document.createElement("div");
    tsEl.className = "ticket-timestamp";
    tsEl.textContent = formatTimestamp(created_at);

    const actions = document.createElement("div");
    actions.className = "ticket-actions";

    const inProgressBtn = document.createElement("button");
    inProgressBtn.className = "btn-small btn-in-progress";
    inProgressBtn.textContent = "Mark In Progress";
    inProgressBtn.addEventListener("click", () =>
      updateTicketStatus(id, "in_progress")
    );

    const completeBtn = document.createElement("button");
    completeBtn.className = "btn-small btn-complete";
    completeBtn.textContent = "Mark Complete";
    completeBtn.addEventListener("click", () =>
      updateTicketStatus(id, "closed")
    );

    actions.appendChild(inProgressBtn);
    actions.appendChild(completeBtn);

    footer.appendChild(tsEl);
    footer.appendChild(actions);

    // Assemble card body
    body.appendChild(header);
    body.appendChild(meta);
    body.appendChild(descEl);
    if (thumbnailsRow) body.appendChild(thumbnailsRow);
    body.appendChild(footer);

    card.appendChild(imageWrapper);
    card.appendChild(body);

    return card;
  }

  function formatTimestamp(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleString();
  }

  async function updateTicketStatus(ticketId, newStatus) {
    if (!confirm(`Update ticket #${ticketId} to "${newStatus.replace("_", " ")}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        alert(data.message || "Failed to update ticket status.");
        return;
      }

      // Update local state
      const idx = allTickets.findIndex(t => t.id === ticketId);
      if (idx !== -1) {
        allTickets[idx].status = newStatus;
      }

      renderTickets();
    } catch (err) {
      console.error("Error updating ticket status:", err);
      alert("An error occurred while updating ticket status.");
    }
  }
});
