const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Database Connection
const connectDB = require("./config/database");

// Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

// Load Environment Variables
dotenv.config();

const app = express();

// ==============================
// DATABASE CONNECTION
// ==============================

// MongoDB is temporarily disabled while we fix Atlas.
// Uncomment the line below once Atlas is working.

// connectDB();

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());

// ==============================
// ROUTES
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

// ==============================
// HOME ROUTE
// ==============================

app.get("/", (req, res) => {
    res.send("🚀 ROOMEO Backend Running");
});

// ==============================
// START SERVER
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
