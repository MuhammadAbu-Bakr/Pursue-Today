
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const { connectDB, clearDB, createVerifiedUser, loginAs } = require("./helpers");

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await mongoose.disconnect();
});


describe("GET /api/usage", () => {
  it("returns usedBytes and maxBytes for an authenticated user", async () => {
    await createVerifiedUser({ email: "usage1@example.com", password: "password123" });
    const agent = await loginAs(app, "usage1@example.com", "password123");

    const res = await agent.get("/api/usage");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("usedBytes");
    expect(res.body).toHaveProperty("maxBytes");
    expect(typeof res.body.usedBytes).toBe("number");
    expect(typeof res.body.maxBytes).toBe("number");
    expect(res.body.maxBytes).toBeGreaterThan(0);
  });

  it("reflects 0 used bytes for a fresh account", async () => {
    await createVerifiedUser({ email: "usage2@example.com", password: "password123" });
    const agent = await loginAs(app, "usage2@example.com", "password123");

    const res = await agent.get("/api/usage");
    expect(res.status).toBe(200);
    expect(res.body.usedBytes).toBe(0);
  });

  it("reflects usage after creating todos", async () => {
    await createVerifiedUser({ email: "usage3@example.com", password: "password123" });
    const agent = await loginAs(app, "usage3@example.com", "password123");

   
    await agent
      .post("/api/todos")
      .set("Content-Type", "application/json")
      .send({ text: "A measurable todo" });

    const res = await agent.get("/api/usage");
    expect(res.status).toBe(200);
    expect(res.body.usedBytes).toBeGreaterThan(0);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/usage");
    expect(res.status).toBe(401);
  });
});

 
describe("POST /api/usage/recalculate", () => {
  it("recalculates and returns the correct byte count", async () => {
    const user = await createVerifiedUser({ email: "recalc@example.com", password: "password123" });
    const agent = await loginAs(app, "recalc@example.com", "password123");

    
    await agent
      .post("/api/todos")
      .set("Content-Type", "application/json")
      .send({ text: "Task one" });
    await agent
      .post("/api/todos")
      .set("Content-Type", "application/json")
      .send({ text: "Task two" });

    
    await User.findByIdAndUpdate(user._id, { dataUsageBytes: 0 });

    
    const res = await agent.post("/api/usage/recalculate");
    expect(res.status).toBe(200);
    expect(res.body.usedBytes).toBeGreaterThan(0);
    expect(res.body.maxBytes).toBeGreaterThan(0);

    
    const updated = await User.findById(user._id);
    expect(updated.dataUsageBytes).toBe(res.body.usedBytes);
  });

  it("returns 0 when the user has no todos", async () => {
    await createVerifiedUser({ email: "recalc2@example.com", password: "password123" });
    const agent = await loginAs(app, "recalc2@example.com", "password123");

    const res = await agent.post("/api/usage/recalculate");
    expect(res.status).toBe(200);
    expect(res.body.usedBytes).toBe(0);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).post("/api/usage/recalculate");
    expect(res.status).toBe(401);
  });
});
