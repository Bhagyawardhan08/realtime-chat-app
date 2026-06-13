const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ─── GET /api/messages ────────────────────────────────────────────────────────
// Returns the full global chat history, oldest message first.
// Protected — client must send a valid JWT to access.
// .populate() swaps the sender ObjectId for the actual { _id, username } object
// so the React Native app can display the sender's name without a second request.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: 1 })              // oldest → newest (correct chat order)
      .populate("sender", "username")      // only fetch username, not email/password
      .lean();                             // returns plain JS objects, faster than Mongoose docs

    res.status(200).json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;