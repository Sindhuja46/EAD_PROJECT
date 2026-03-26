require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const {router: adminRoutes, isAdmin} = require("./routes/admin");
const regRoutes = require("./routes/registrations");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Please set MONGO_URI in .env file");
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(" MongoDB connected"))
  .catch(err => {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  });

// Admin routes (authentication handled within admin routes)
app.use("/api/admin", adminRoutes);

//  Public routes (no authentication required) - for participants
app.use("/api/public", regRoutes);

// Protected admin routes (require authentication)
app.use("/api", (req, res, next) => {
  if (!isAdmin()) {
    return res.status(401).json({ message: "Unauthorized. Please login first." });
  }
  next();
}, regRoutes);

app.get("/", (req, res) => res.send("Event Registration API is running"));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));