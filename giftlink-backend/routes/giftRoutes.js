/*jshint esversion: 8 */
const express = require("express");
const { connectToDatabase } = require("../models/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

// GET /api/gifts  - list gifts
router.get("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const gifts = await db.collection("gifts").find().toArray();
    res.json(gifts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to list gifts" });
  }
});

// GET /api/gifts/:id - get a single gift by id
router.get("/:id", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const gift = await db
      .collection("gifts")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.json(gift);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to get gift" });
  }
});

// POST /api/gifts - create a gift
router.post("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const payload = req.body || {};
    const result = await db
      .collection("gifts")
      .insertOne({ ...payload, createdAt: new Date() });
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create gift" });
  }
});

module.exports = router;
