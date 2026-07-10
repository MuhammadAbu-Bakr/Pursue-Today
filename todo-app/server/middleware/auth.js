const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {

    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before continuing" });
    }

    req.user = user; 
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

module.exports = requireAuth;
