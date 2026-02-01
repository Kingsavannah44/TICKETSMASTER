require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "ticketsmaster-secret-key";

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ticketsmaster";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user", enum: ["user", "admin"] },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Event Schema
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  position: {
    lat: { type: Number },
    lng: { type: Number }
  },
  description: { type: String },
  price: { type: Number, default: 0 },
  availableTickets: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", eventSchema);

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

// Auth Routes

// Register
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully", userId: user._id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin user
    const user = await User.findOne({ username, role: "admin" });
    if (!user) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Event Routes

// Get all events (public)
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create event (public - for now, can be restricted later)
app.post("/api/events", async (req, res) => {
  try {
    const { name, date, location, description, position, price, availableTickets } = req.body;
    const event = new Event({ name, date, location, description, position, price, availableTickets });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single event
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update event (admin only)
app.put("/api/events/:id", isAdmin, async (req, res) => {
  try {
    const { name, date, location, description, position, price, availableTickets } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { name, date, location, description, position, price, availableTickets },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete event (admin only)
app.delete("/api/events/:id", isAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset and seed events (admin only)
app.post("/api/events/reset", isAdmin, async (req, res) => {
  try {
    await Event.deleteMany({});
    await seedEvents();
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ message: "Events reset successfully", events });
  } catch (error) {
    console.error("Error resetting events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin only)
app.get("/api/admin/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user (admin only)
app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Seed sample events if database is empty
const seedEvents = async () => {
  try {
    const count = await Event.countDocuments();
    if (count === 0) {
      const sampleEvents = [
        { name: "Valentine's Day Gala", date: "2026-02-14", location: "Grand Ballroom", description: "Romantic evening with live music and dinner", price: 150, availableTickets: 50 },
        { name: "Couple's Night Out", date: "2026-02-14", location: "City Center", description: "Special Valentine's couple event", price: 75, availableTickets: 100 },
        { name: "Sweetheart Concert", date: "2026-02-14", location: "Music Hall", description: "Love songs and romantic melodies", price: 120, availableTickets: 75 },
        { name: "Tech Conference 2026", date: "2026-04-05", location: "Convention Center", description: "Latest technology trends and innovations", price: 299, availableTickets: 200 },
        { name: "Spring Music Festival", date: "2026-03-20", location: "Central Park", description: "Annual spring music celebration", price: 85, availableTickets: 500 },
        { name: "Championship Finals", date: "2026-05-15", location: "Mega Arena", description: "Sports championship final match", price: 200, availableTickets: 1000 },
        { name: "Summer Beach Party", date: "2026-06-21", location: "Sunset Beach", description: "Beach party with live DJ", price: 50, availableTickets: 300 },
        { name: "Corporate Summit", date: "2026-07-10", location: "Business Tower", description: "Annual corporate networking event", price: 500, availableTickets: 150 },
        { name: "Food & Wine Festival", date: "2026-08-15", location: "Expo Center", description: "Culinary delights and wine tasting", price: 95, availableTickets: 400 },
        { name: "Halloween Horror Night", date: "2026-10-31", location: "Haunted Mansion", description: "Spooky Halloween celebration", price: 65, availableTickets: 200 },
      ];
      await Event.insertMany(sampleEvents);
      console.log("Sample events seeded");
    }
  } catch (error) {
    console.error("Error seeding events:", error);
  }
};

// Create default admin user if not exists
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const adminUser = new User({
        name: "System Administrator",
        email: "admin@ticketsmaster.com",
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });
      await adminUser.save();
      console.log("Default admin user created (username: admin, password: admin123)");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  seedEvents();
  createDefaultAdmin();
});
