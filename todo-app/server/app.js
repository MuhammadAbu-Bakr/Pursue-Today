/**
 * app.js — Express application setup (no DB connection, no listen).
 * Imported by server.js (production) and by tests (via helpers).
 */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const todoRoutes = require("./routes/todoRoutes");
const authRoutes = require("./routes/authRoutes");
const usageRoutes = require("./routes/usageRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 1000 : 20, // relax limit in tests
  message: { message: "Too many attempts, please try again later." },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/usage", usageRoutes);

module.exports = app;
