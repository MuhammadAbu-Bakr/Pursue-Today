const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

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
  max: 20, 
  message: { message: "Too many attempts, please try again later." },
});
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/todos", todoRoutes);
app.use("/api/usage", usageRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err=> console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
});
