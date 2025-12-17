/*jshint esversion: 8 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectToDatabase } = require("../models/db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const db = connectToDatabase.getDb
      ? connectToDatabase.getDb()
      : await connectToDatabase();
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const users = db.collection("users");
    const existing = await users.findOne({ username });
    if (existing) return res.status(409).json({ error: "user exists" });

    const hash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      username,
      password: hash,
      createdAt: new Date(),
    });
    res.status(201).json({ id: result.insertedId, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "register failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const db = connectToDatabase.getDb
      ? connectToDatabase.getDb()
      : await connectToDatabase();
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });

    const users = db.collection("users");
    const user = await users.findOne({ username });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign({ sub: user._id.toString(), username }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "login failed" });
  }
});

module.exports = router;
