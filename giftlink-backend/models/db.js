// db.js
require("dotenv").config();
const { MongoClient } = require("mongodb");

// Create MongoClient without deprecated options for driver v4+
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGO_URL ||
  "mongodb://localhost:27017/giftlink";
const client = new MongoClient(MONGO_URI);

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  await client.connect(); // <- required line
  // determine database name from URI or fallback to 'giftlink'
  const dbName = client.options?.dbName || "giftlink";
  cachedDb = client.db(dbName);
  return cachedDb;
}

exports.connectToDatabase = connectToDatabase;
