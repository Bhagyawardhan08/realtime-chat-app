const jwt = require("jsonwebtoken");
const Message = require("../models/message");

const chatHandler = (io) => {

  // ─── JWT Authentication on every socket connection ──────────────────────────
  // This runs BEFORE the "connection" event.
  // If the token is missing or invalid, the socket is rejected immediately.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // attach { id, username } to the socket for later use
      next();                // token is valid — allow the connection
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  // ─── Handle each connected client ───────────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.username} (${socket.id})`);

    // ── sendMessage ────────────────────────────────────────────────────────────
    // Client emits: { content: "hello world" }
    // Server saves to DB, then broadcasts to ALL connected clients
    socket.on("sendMessage", async (data) => {
      try {
        const { content } = data;

        // 1. Basic validation
        if (!content || content.trim() === "") {
          return socket.emit("error", { message: "Message content is required" });
        }
        if (content.length > 1000) {
          return socket.emit("error", { message: "Message is too long" });
        }

        // 2. Save to MongoDB
        const message = await Message.create({
          sender: socket.user.id,
          content: content.trim(),
        });

        // 3. Populate sender username before broadcasting
        // We need this so clients can display the sender's name immediately
        const populated = await message.populate("sender", "username");

        // 4. Broadcast to ALL connected clients (including the sender)
        // This way the sender sees their own message via the same code path
        // as every other client — no special handling needed on the frontend
        io.emit("receiveMessage", {
          _id: populated._id,
          content: populated.content,
          sender: {
            _id: populated.sender._id,
            username: populated.sender.username,
          },
          createdAt: populated.createdAt,
        });

      } catch (error) {
        console.error("sendMessage error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.username} (${socket.id})`);
    });
  });
io.on("connection", (socket) => {
  console.log("Connected:", socket.user.username);

  socket.on("sendMessage", (data) => {
    console.log("Message received:", data);
  });
});

};

module.exports = chatHandler;