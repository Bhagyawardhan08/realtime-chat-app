require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const healthRoute = require("./src/routes/health");
const authRoute = require("./src/routes/auth");
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());          // Allow requests from the React Native app
app.use(express.json());  // Parse incoming JSON request bodies

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/", healthRoute);
app.use("/api/auth", authRoute);
// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
