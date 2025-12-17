/*jshint esversion: 8 */
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const { connectToDatabase } = require("./models/db");
const authRoutes = require("./routes/AuthRoutes");
const giftRoutes = require("./routes/giftRoutes");
const searchRoutes = require("./routes/searchRoutes");
const { loadData } = require("./util/import-mongo/index");

const app = express();

app.use(cors());
app.use(express.json());

// --- IMPORTANT: register API routes BEFORE static / fallback ---
app.use("/api/auth", authRoutes);
app.use("/api/gifts", giftRoutes);
app.use("/api/search", searchRoutes);

// simple root healthcheck
app.get("/", (req, res) => {
  res.send("Inside the server");
});

// Serve frontend build if present (optional)
const frontendBuild = path.join(__dirname, "..", "giftlink-frontend", "build");
if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));

  // Any non-API route should serve index.html (SPA)
  app.get("/*splat", (req, res) => {
    if (req.path.startsWith("/api/")) {
      // ensure API paths don't accidentally serve index.html
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(path.join(frontendBuild, "index.html"));
  });
}

// Connect DB and optionally import sample data
(async () => {
  try {
    await connectToDatabase();
    // load sample gifts if collection empty
    if (typeof loadData === "function") {
      await loadData().catch((e) =>
        console.warn("import-mongo loadData:", e.message)
      );
    }
  } catch (err) {
    console.error("DB connect failed", err);
    process.exit(1);
  }
})();

const port = process.env.PORT || 3060;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
