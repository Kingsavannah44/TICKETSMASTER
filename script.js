// API Base URL for MongoDB backend
const API_URL = "http://localhost:3000/api";

// Sample events data (will be replaced with MongoDB data)
let events = [];
let adminToken = localStorage.getItem("adminToken");
let isAdminUser = false;

// Fetch events from MongoDB
async function fetchEvents() {
  try {
    const response = await fetch(`${API_URL}/events`);
    if (response.ok) {
      events = await response.json();
    } else {
      // Fallback to sample data if API is not available
      events = [
        {
          id: 1,
          name: "Concert Night",
          date: "2023-12-01",
          location: "Stadium A",
          price: 50,
          availableTickets: 100,
        },
        { id: 2, name: "Festival Fun", date: "2023-12-15", location: "Park B", price: 35, availableTickets: 200 },
        {
          id: 3,
          name: "Theater Show",
          date: "2023-12-20",
          location: "Theater C",
          price: 75,
          availableTickets: 50,
        },
      ];
    }
  } catch (error) {
    console.log("Using sample events data (MongoDB not connected)");
    events = [
      {
        id: 1,
        name: "Concert Night",
        date: "2023-12-01",
        location: "Stadium A",
        price: 50,
        availableTickets: 100,
      },
      { id: 2, name: "Festival Fun", date: "2023-12-15", location: "Park B", price: 35, availableTickets: 200 },
      {
        id: 3,
        name: "Theater Show",
        date: "2023-12-20",
        location: "Theater C",
        price: 75,
        availableTickets: 50,
      },
    ];
  }
}

// Auth Modal Toggle Functionality
document.getElementById("show-login").addEventListener("click", function () {
  document.getElementById("login-form").style.display = "flex";
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("show-login").classList.add("active");
  document.getElementById("show-signup").classList.remove("active");
});

document.getElementById("show-signup").addEventListener("click", function () {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "flex";
  document.getElementById("show-login").classList.remove("active");
  document.getElementById("show-signup").classList.add("active");
});

// Close auth modal is no longer needed - users must login to access the app

// Payment Method Button functionality
document
  .getElementById("payment-method-btn")
  .addEventListener("click", function () {
    document.getElementById("payment-modal").style.display = "block";
    document.getElementById("auth-modal").style.display = "none";
  });

// Close payment modal when clicking the close button
document.querySelector(".close-payment").addEventListener("click", function () {
  document.getElementById("payment-modal").style.display = "none";
});

// Navigate from signup to login
document
  .getElementById("go-to-login-from-signup")
  .addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("login-form").style.display = "flex";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("show-login").classList.add("active");
    document.getElementById("show-signup").classList.remove("active");
  });

// Navigate from login to payment
document
  .getElementById("go-to-payment")
  .addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("auth-modal").style.display = "none";
    document.getElementById("payment-modal").style.display = "block";
  });

// Navigate to admin login
document
  .getElementById("go-to-admin-login")
  .addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("auth-modal").style.display = "none";
    document.getElementById("admin-modal").style.display = "block";
  });

// Navigate back to user login from admin
document
  .getElementById("go-to-user-login")
  .addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("admin-modal").style.display = "none";
    document.getElementById("auth-modal").style.display = "block";
    document.getElementById("login-form").style.display = "flex";
  });

// Close admin modal
document.querySelector(".close-admin").addEventListener("click", function () {
  document.getElementById("admin-modal").style.display = "none";
});

// Admin login form submission
document
  .getElementById("admin-login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        adminToken = data.token;
        localStorage.setItem("adminToken", adminToken);
        isAdminUser = true;
        document.getElementById("admin-modal").style.display = "none";
        document.getElementById("auth-modal").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        document.getElementById("admin-dashboard-btn").style.display = "inline-block";
        loadEvents();
        alert("Admin login successful!");
      } else {
        alert(data.message || "Invalid admin credentials");
      }
    } catch (error) {
      // Demo mode - accept admin/admin123
      if (username === "admin" && password === "admin123") {
        adminToken = "demo-token";
        localStorage.setItem("adminToken", adminToken);
        isAdminUser = true;
        document.getElementById("admin-modal").style.display = "none";
        document.getElementById("auth-modal").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        document.getElementById("admin-dashboard-btn").style.display = "inline-block";
        loadEvents();
        alert("Admin login successful! (Demo mode)");
      } else {
        alert("Invalid admin credentials (Demo mode: use admin/admin123)");
      }
    }
  });

// Handle signup form submission
document
  .getElementById("signup-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully! Please login.");
        // Switch to login form
        document.getElementById("login-form").style.display = "flex";
        document.getElementById("signup-form").style.display = "none";
        document.getElementById("show-login").classList.add("active");
        document.getElementById("show-signup").classList.remove("active");
        // Clear the form
        document.getElementById("signup-form").reset();
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      // If backend is not available, simulate successful registration
      console.log("Backend not available, simulating registration");
      alert("Account created successfully! (Demo mode)");
      // Switch to login form
      document.getElementById("login-form").style.display = "flex";
      document.getElementById("signup-form").style.display = "none";
      document.getElementById("show-login").classList.add("active");
      document.getElementById("show-signup").classList.remove("active");
      document.getElementById("signup-form").reset();
    }
  });

// Login functionality
document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        document.getElementById("auth-modal").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        loadEvents();
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      // Fallback to demo login if backend is not available
      if (username === "user" && password === "pass") {
        document.getElementById("auth-modal").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        loadEvents();
      } else {
        alert("Invalid credentials (Demo mode: use user/pass)");
      }
    }
  });

// Logout functionality
document.getElementById("logout-btn").addEventListener("click", function () {
  document.getElementById("main-content").style.display = "none";
  document.getElementById("auth-modal").style.display = "block";
  document.getElementById("login-form").style.display = "flex";
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("show-login").classList.add("active");
  document.getElementById("show-signup").classList.remove("active");
  document.getElementById("admin-dashboard-btn").style.display = "none";
  document.getElementById("admin-dashboard").style.display = "none";
  // Clear login form
  document.getElementById("login-form").reset();
  // Clear admin token
  adminToken = null;
  localStorage.removeItem("adminToken");
  isAdminUser = false;
});

// Admin Dashboard button
document.getElementById("admin-dashboard-btn").addEventListener("click", function () {
  document.getElementById("admin-dashboard").style.display = "block";
  loadAdminEvents();
  loadAdminUsers();
  // Scroll to admin dashboard
  document.getElementById("admin-dashboard").scrollIntoView({ behavior: "smooth" });
});

// Admin tabs functionality
document.querySelectorAll(".admin-tab").forEach((tab) => {
  tab.addEventListener("click", function () {
    // Remove active class from all tabs
    document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
    // Add active class to clicked tab
    this.classList.add("active");
    // Hide all tab content
    document.querySelectorAll(".admin-tab-content").forEach((content) => content.classList.remove("active"));
    // Show selected tab content
    const tabId = this.getAttribute("data-tab");
    document.getElementById(tabId).classList.add("active");
  });
});

// Handle payment form submission
document
  .getElementById("payment-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const cardNumber = document.getElementById("payment-card-number").value;
    const cardExpiry = document.getElementById("payment-card-expiry").value;
    const cardCvv = document.getElementById("payment-card-cvv").value;
    const cardName = document.getElementById("payment-card-name").value;

    try {
      const response = await fetch(`${API_URL}/users/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentInfo: {
            cardNumber,
            cardExpiry,
            cardCvv,
            cardName,
            cardType: "Mastercard",
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Payment method saved successfully!");
        document.getElementById("payment-modal").style.display = "none";
        document.getElementById("payment-form").reset();
      } else {
        alert(data.message || "Failed to save payment method.");
      }
    } catch (error) {
      // Demo mode
      console.log("Backend not available, simulating payment save");
      alert("Payment method saved successfully! (Demo mode)");
      document.getElementById("payment-modal").style.display = "none";
      document.getElementById("payment-form").reset();
    }
  });

// Close modals when clicking outside
window.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

// Load events into the page
function loadEvents() {
  const eventList = document.getElementById("event-list");
  const buySelect = document.getElementById("event-select");
  const sellSelect = document.getElementById("sell-event-select");

  // Clear existing content
  eventList.innerHTML = "";
  buySelect.innerHTML = '<option value="">Choose an event</option>';
  sellSelect.innerHTML = '<option value="">Choose an event</option>';

  events.forEach((event) => {
    // Add to event list
    const eventDiv = document.createElement("div");
    eventDiv.className = "event";
    eventDiv.innerHTML = `
      <h3>${event.name}</h3>
      <p>Date: ${event.date}</p>
      <p>Location: ${event.location}</p>
      <p class="event-price">Price: $${event.price || 0}</p>
      <p class="event-tickets">Available Tickets: ${event.availableTickets || 0}</p>
      <a href="https://twitter.com/intent/tweet?text=Check out ${event.name} on ${event.date}!" class="share-twitter">Share on Twitter</a>
      <a href="https://t.me/share/url?url=https://example.com&text=Check out ${event.name}" class="telegram-link">Share on Telegram</a>
    `;
    eventList.appendChild(eventDiv);

    // Add to select options
    const option = document.createElement("option");
    option.value = event._id || event.id;
    option.textContent = event.name;
    buySelect.appendChild(option.cloneNode(true));
    sellSelect.appendChild(option);
  });
}

// Load admin events
async function loadAdminEvents() {
  const adminEventList = document.getElementById("admin-event-list");
  adminEventList.innerHTML = "";

  try {
    const response = await fetch(`${API_URL}/events`);
    const adminEvents = await response.json();

    if (adminEvents.length === 0) {
      adminEventList.innerHTML = "<p>No events found.</p>";
      return;
    }

    const table = document.createElement("table");
    table.className = "admin-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Event Name</th>
          <th>Date</th>
          <th>Location</th>
          <th>Price</th>
          <th>Tickets</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${adminEvents
          .map(
            (event) => `
          <tr>
            <td>${event.name}</td>
            <td>${event.date}</td>
            <td>${event.location}</td>
            <td>$${event.price || 0}</td>
            <td>${event.availableTickets || 0}</td>
            <td>
              <button class="edit-btn" data-id="${event._id}">Edit</button>
              <button class="delete-btn" data-id="${event._id}">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;
    adminEventList.appendChild(table);

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const eventId = this.getAttribute("data-id");
        openEditEventModal(eventId);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const eventId = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this event?")) {
          deleteEvent(eventId);
        }
      });
    });
  } catch (error) {
    console.error("Error loading admin events:", error);
    adminEventList.innerHTML = "<p>Error loading events.</p>";
  }
}

// Load admin users
async function loadAdminUsers() {
  const adminUserList = document.getElementById("admin-user-list");
  adminUserList.innerHTML = "";

  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await response.json();

    if (users.length === 0) {
      adminUserList.innerHTML = "<p>No users found.</p>";
      return;
    }

    const table = document.createElement("table");
    table.className = "admin-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Username</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users
          .map(
            (user) => `
          <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
              ${user.role !== "admin" ? `<button class="delete-user-btn" data-id="${user._id}">Delete</button>` : "-"}
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    `;
    adminUserList.appendChild(table);

    // Add event listeners for delete user buttons
    document.querySelectorAll(".delete-user-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const userId = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this user?")) {
          deleteUser(userId);
        }
      });
    });
  } catch (error) {
    console.error("Error loading admin users:", error);
    adminUserList.innerHTML = "<p>Error loading users.</p>";
  }
}

// Open edit event modal
async function openEditEventModal(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    const event = await response.json();

    document.getElementById("edit-event-id").value = event._id;
    document.getElementById("edit-event-name").value = event.name;
    document.getElementById("edit-event-date").value = event.date;
    document.getElementById("edit-event-location").value = event.location;
    document.getElementById("edit-event-description").value = event.description || "";
    document.getElementById("edit-event-price").value = event.price || 0;
    document.getElementById("edit-event-available-tickets").value = event.availableTickets || 100;

    document.getElementById("edit-event-modal").style.display = "block";
  } catch (error) {
    console.error("Error fetching event:", error);
    alert("Error loading event details.");
  }
}

// Close edit event modal
document.querySelector(".close-edit-event").addEventListener("click", function () {
  document.getElementById("edit-event-modal").style.display = "none";
});

// Handle edit event form submission
document
  .getElementById("edit-event-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const eventId = document.getElementById("edit-event-id").value;
    const eventData = {
      name: document.getElementById("edit-event-name").value,
      date: document.getElementById("edit-event-date").value,
      location: document.getElementById("edit-event-location").value,
      description: document.getElementById("edit-event-description").value,
      price: parseFloat(document.getElementById("edit-event-price").value),
      availableTickets: parseInt(document.getElementById("edit-event-available-tickets").value),
    };

    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        alert("Event updated successfully!");
        document.getElementById("edit-event-modal").style.display = "none";
        loadAdminEvents();
        fetchEvents().then(() => loadEvents());
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update event.");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Event updated successfully! (Demo mode)");
      document.getElementById("edit-event-modal").style.display = "none";
      // Update local events array
      const eventIndex = events.findIndex((e) => e._id === eventId || e.id === eventId);
      if (eventIndex !== -1) {
        events[eventIndex] = { ...events[eventIndex], ...eventData };
      }
      loadAdminEvents();
      loadEvents();
    }
  });

// Delete event
async function deleteEvent(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.ok) {
      alert("Event deleted successfully!");
      loadAdminEvents();
      fetchEvents().then(() => loadEvents());
    } else {
      const data = await response.json();
      alert(data.message || "Failed to delete event.");
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    alert("Event deleted successfully! (Demo mode)");
    // Remove from local events array
    events = events.filter((e) => e._id !== eventId && e.id !== eventId);
    loadAdminEvents();
    loadEvents();
  }
}

// Delete user
async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.ok) {
      alert("User deleted successfully!");
      loadAdminUsers();
    } else {
      const data = await response.json();
      alert(data.message || "Failed to delete user.");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("User deleted successfully! (Demo mode)");
    loadAdminUsers();
  }
}

// Handle admin create event form submission
document
  .getElementById("admin-create-event-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const eventData = {
      name: document.getElementById("admin-event-name").value,
      date: document.getElementById("admin-event-date").value,
      location: document.getElementById("admin-event-location").value,
      description: document.getElementById("admin-event-description").value,
      price: parseFloat(document.getElementById("admin-event-price").value),
      availableTickets: parseInt(document.getElementById("admin-event-available-tickets").value),
    };

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        alert("Event created successfully!");
        document.getElementById("admin-create-event-form").reset();
        loadAdminEvents();
        fetchEvents().then(() => loadEvents());
      } else {
        const data = await response.json();
        alert(data.message || "Failed to create event.");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Event created successfully! (Demo mode)");
      document.getElementById("admin-create-event-form").reset();
      // Add to local events array
      events.push({
        id: Date.now(),
        ...eventData,
      });
      loadAdminEvents();
      loadEvents();
    }
  });

// Handle buy form submission
document.getElementById("buy-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const eventId = document.getElementById("event-select").value;
  const quantity = document.getElementById("quantity").value;
  alert(`Buying ${quantity} tickets for event ${eventId}`);
});

// Handle sell form submission
document.getElementById("sell-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const eventId = document.getElementById("sell-event-select").value;
  const quantity = document.getElementById("sell-quantity").value;
  const price = document.getElementById("sell-price").value;
  alert(`Listing ${quantity} tickets for event ${eventId} at ${price} each`);
});

// Geolocation functionality
document.getElementById("get-current-location").addEventListener("click", function () {
  if (navigator.geolocation) {
    this.textContent = "Getting location...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        document.getElementById("event-lat").value = position.coords.latitude.toFixed(6);
        document.getElementById("event-lng").value = position.coords.longitude.toFixed(6);
        this.textContent = "📍 Location Found!";
        setTimeout(() => {
          this.textContent = "📍 Use My Location";
        }, 2000);
      },
      (error) => {
        this.textContent = "📍 Location Failed";
        alert("Unable to get your location. Please enter coordinates manually.");
        setTimeout(() => {
          this.textContent = "📍 Use My Location";
        }, 2000);
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

// Handle create event form submission
document
  .getElementById("create-event-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("event-name").value;
    const date = document.getElementById("event-date").value;
    const location = document.getElementById("event-location").value;
    const description = document.getElementById("event-description").value;
    const lat = document.getElementById("event-lat").value;
    const lng = document.getElementById("event-lng").value;
    const price = document.getElementById("event-price")?.value || 0;
    const availableTickets = document.getElementById("event-available-tickets")?.value || 100;

    const eventData = {
      name,
      date,
      location,
      description,
      price: parseFloat(price),
      availableTickets: parseInt(availableTickets),
    };

    // Add position if provided
    if (lat && lng) {
      eventData.position = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
    }

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Event created successfully!");
        document.getElementById("create-event-form").reset();
        fetchEvents().then(() => loadEvents());
      } else {
        alert(data.message || "Failed to create event.");
      }
    } catch (error) {
      // Demo mode
      console.log("Backend not available, simulating event creation");
      alert("Event created successfully! (Demo mode)");
      document.getElementById("create-event-form").reset();
      // Add demo event to list
      events.push({
        id: Date.now(),
        name,
        date,
        location,
        description,
        price: parseFloat(price),
        availableTickets: parseInt(availableTickets),
        position: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
      });
      loadEvents();
    }
  });

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  // Show auth modal initially
  document.getElementById("auth-modal").style.display = "block";
  fetchEvents();
});
