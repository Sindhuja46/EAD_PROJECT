const express = require("express");
const router = express.Router();

// Simple in-memory session
let loggedIn = false;

// POST /api/admin/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    loggedIn = true;
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// GET /api/admin/check
router.get("/check", (req, res) => {
  res.json({ loggedIn });
});

// POST /api/admin/logout
router.post("/logout", (req, res) => {
  loggedIn = false;
  res.json({ message: "Logged out successfully" });
});

module.exports = { router, isAdmin: () => loggedIn };