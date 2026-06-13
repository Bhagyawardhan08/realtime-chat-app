require("dotenv").config();

const express    = require("express");
const http       = require("http");       // needed to share one server between Express + Socket.io
const { Server } = require("socket.io");
const cors       = require("cors");

const connectDB  = require("./src/config/db");
const healthRoute   = require("./src/routes/health");
const authRoutes    = require("./src/routes/auth");
const messageRoutes = require("./src/routes/messages");
const chatHandler   = require("./src/socket/chatHandler");

// ─── App + HTTP server ────────────────────────────────────────────────────────
// Express alone cannot handle WebSockets.
// We wrap it in a plain Node http.Server so Socket.io can attach to the same port.
const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;

// ─── Socket.io setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "*",          // allow connections from the Expo app on any IP
    methods: ["GET", "POST"],
  },
});

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Express Middleware ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── REST Routes ──────────────────────────────────────────────────────────────
app.use("/", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ─── Socket.io Events ─────────────────────────────────────────────────────────
chatHandler(io);

// ─── Start Server ─────────────────────────────────────────────────────────────
// server.listen instead of app.listen — this starts both Express and Socket.io
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});