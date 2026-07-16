const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const { connectDB, clearDB, createVerifiedUser } = require("./helpers");

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await mongoose.disconnect();
});


describe("POST /api/auth/signup", () => {
  it("creates a new user and returns 201", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/account created/i);

    const user = await User.findOne({ email: "alice@example.com" });
    expect(user).not.toBeNull();
    expect(user.isVerified).toBe(true);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      email: "alice@example.com",
      password: "password123",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("returns 400 when password is shorter than 8 chars", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Alice",
      email: "alice@example.com",
      password: "short",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8 characters/i);
  });

  it("returns 409 when email already exists", async () => {
    await createVerifiedUser({ email: "alice@example.com" });

    const res = await request(app).post("/api/auth/signup").send({
      name: "Alice Again",
      email: "alice@example.com",
      password: "password123",
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });
});


describe("POST /api/auth/login", () => {
  it("returns 200 and sets a cookie on valid credentials", async () => {
    await createVerifiedUser({ email: "bob@example.com", password: "password123" });

    const res = await request(app).post("/api/auth/login").send({
      email: "bob@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: "bob@example.com" });
  
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/token=/);
  });

  it("returns 401 when password is wrong", async () => {
    await createVerifiedUser({ email: "bob@example.com", password: "password123" });

    const res = await request(app).post("/api/auth/login").send({
      email: "bob@example.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it("returns 401 when user does not exist", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "bob@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("returns 403 when user is not verified", async () => {
  
    const user = new User({
      name: "Unverified",
      email: "unverified@example.com",
      password: "password123",
      isVerified: false,
    });
    await user.save();

    const res = await request(app).post("/api/auth/login").send({
      email: "unverified@example.com",
      password: "password123",
    });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/verify/i);
  });
});

describe("POST /api/auth/logout", () => {
  it("returns 200 and clears the token cookie", async () => {
    await createVerifiedUser({ email: "carol@example.com", password: "password123" });
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: "carol@example.com", password: "password123" });

    const res = await agent.post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
    
    const cookieHeader = res.headers["set-cookie"]?.[0] ?? "";
    expect(cookieHeader).toMatch(/token=;|max-age=0/i);
  });
});


describe("GET /api/auth/me", () => {
  it("returns the authenticated user's info", async () => {
    await createVerifiedUser({ name: "Dave", email: "dave@example.com", password: "password123" });
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: "dave@example.com", password: "password123" });

    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ name: "Dave", email: "dave@example.com" });
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
