const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Expect header:  Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify signature and expiry — throws if invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req so route handlers can read req.user
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;