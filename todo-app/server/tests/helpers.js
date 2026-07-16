
const mongoose = require("mongoose");
const request = require("supertest");


let _app;
function getApp() {
  if (!_app) {
    
    _app = require("../app"); 
  }
  return _app;
}
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
}

async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}


const User = require("../models/User");


async function createVerifiedUser({
  name = "Test User",
  email = "test@example.com",
  password = "password123",
} = {}) {
  const user = new User({ name, email, password, isVerified: true });
  await user.save();
  return user;
}


async function loginAs(app, email, password) {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/login")
    .send({ email, password })
    .expect(200);
  return agent;
}

module.exports = { getApp, connectDB, clearDB, createVerifiedUser, loginAs };
