
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const Todo = require("../models/Todo");
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


async function seedTodo(userId, text = "Sample task", completed = false) {
  return Todo.create({ text, completed, user: userId });
}


describe("Todo routes — auth guard", () => {
  it("GET / returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(401);
  });

  it("POST / returns 401 when not authenticated", async () => {
    const res = await request(app).post("/api/todos").send({ text: "hello" });
    expect(res.status).toBe(401);
  });
});


describe("GET /api/todos", () => {
  it("returns an empty array for a new user", async () => {
    await createVerifiedUser({ email: "user1@example.com", password: "password123" });
    const agent = await loginAs(app, "user1@example.com", "password123");

    const res = await agent.get("/api/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns only the authenticated user's todos", async () => {
    const userA = await createVerifiedUser({ email: "a@example.com", password: "password123" });
    const userB = await createVerifiedUser({ name: "User B", email: "b@example.com", password: "password123" });

    await seedTodo(userA._id, "User A task");
    await seedTodo(userB._id, "User B task");

    const agent = await loginAs(app, "a@example.com", "password123");
    const res = await agent.get("/api/todos");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].text).toBe("User A task");
  });

  it("returns todos sorted newest-first", async () => {
    const user = await createVerifiedUser({ email: "sorted@example.com", password: "password123" });
    await seedTodo(user._id, "First");
 
    await new Promise((r) => setTimeout(r, 20));
    await seedTodo(user._id, "Second");

    const agent = await loginAs(app, "sorted@example.com", "password123");
    const res = await agent.get("/api/todos");

    expect(res.status).toBe(200);
    expect(res.body[0].text).toBe("Second");
    expect(res.body[1].text).toBe("First");
  });
});

// ─── POST / ───────────────────────────────────────────────────────────────────
describe("POST /api/todos", () => {
  it("creates a todo and returns 201 with the created document", async () => {
    await createVerifiedUser({ email: "creator@example.com", password: "password123" });
    const agent = await loginAs(app, "creator@example.com", "password123");

    const res = await agent
      .post("/api/todos")
      .set("Content-Type", "application/json")
      .send({ text: "Buy groceries" });

    expect(res.status).toBe(201);
    expect(res.body.text).toBe("Buy groceries");
    expect(res.body.completed).toBe(false);
    expect(res.body._id).toBeDefined();
  });

  it("returns 400 when text is empty", async () => {
    await createVerifiedUser({ email: "creator2@example.com", password: "password123" });
    const agent = await loginAs(app, "creator2@example.com", "password123");

    const res = await agent
      .post("/api/todos")
      .set("Content-Type", "application/json")
      .send({ text: "" });

    expect(res.status).toBe(400);
  });

  it("returns 413 when storage quota is exceeded", async () => {
    // Artificially set the user's dataUsageBytes to near the quota
    const user = await createVerifiedUser({ email: "quota@example.com", password: "password123" });
    const MAX = Number(process.env.MAX_STORAGE_BYTES) || 5 * 1024 * 1024;
    await User.findByIdAndUpdate(user._id, { dataUsageBytes: MAX - 1 }); // 1 byte short of limit

    const agent = await loginAs(app, "quota@example.com", "password123");

    // This todo will push it over the limit
    const res = await agent
      .post("/api/todos")
      .set("Content-Type", "application/json")
      .send({ text: "This will exceed the quota because the user is already at the limit" });

    expect(res.status).toBe(413);
    expect(res.body.message).toMatch(/storage limit/i);
  });
});


describe("GET /api/todos/:id", () => {
  it("returns the correct todo by ID", async () => {
    const user = await createVerifiedUser({ email: "getter@example.com", password: "password123" });
    const todo = await seedTodo(user._id, "My specific task");
    const agent = await loginAs(app, "getter@example.com", "password123");

    const res = await agent.get(`/api/todos/${todo._id}`);
    expect(res.status).toBe(200);
    expect(res.body.text).toBe("My specific task");
  });

  it("returns 404 for a todo belonging to another user", async () => {
    const userA = await createVerifiedUser({ email: "owner@example.com", password: "password123" });
    await createVerifiedUser({ name: "Thief", email: "thief@example.com", password: "password123" });
    const todo = await seedTodo(userA._id, "Secret task");

    const agent = await loginAs(app, "thief@example.com", "password123");
    const res = await agent.get(`/api/todos/${todo._id}`);
    expect(res.status).toBe(404);
  });
});


describe("PUT /api/todos/:id", () => {
  it("updates the text of a todo", async () => {
    const user = await createVerifiedUser({ email: "updater@example.com", password: "password123" });
    const todo = await seedTodo(user._id, "Original text");
    const agent = await loginAs(app, "updater@example.com", "password123");

    const res = await agent
      .put(`/api/todos/${todo._id}`)
      .set("Content-Type", "application/json")
      .send({ text: "Updated text" });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe("Updated text");
  });

  it("returns 404 when trying to update another user's todo", async () => {
    const userA = await createVerifiedUser({ email: "owner2@example.com", password: "password123" });
    await createVerifiedUser({ name: "Other", email: "other@example.com", password: "password123" });
    const todo = await seedTodo(userA._id, "Owner's task");

    const agent = await loginAs(app, "other@example.com", "password123");
    const res = await agent
      .put(`/api/todos/${todo._id}`)
      .set("Content-Type", "application/json")
      .send({ text: "Hacked!" });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/todos/:id/toggle", () => {
  it("toggles completed from false to true", async () => {
    const user = await createVerifiedUser({ email: "toggler@example.com", password: "password123" });
    const todo = await seedTodo(user._id, "Toggle me", false);
    const agent = await loginAs(app, "toggler@example.com", "password123");

    const res = await agent.patch(`/api/todos/${todo._id}/toggle`);
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("toggles completed from true back to false", async () => {
    const user = await createVerifiedUser({ email: "toggler2@example.com", password: "password123" });
    const todo = await seedTodo(user._id, "Toggle me back", true);
    const agent = await loginAs(app, "toggler2@example.com", "password123");

    const res = await agent.patch(`/api/todos/${todo._id}/toggle`);
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
  });

  it("returns 404 for a non-existent todo", async () => {
    await createVerifiedUser({ email: "toggler3@example.com", password: "password123" });
    const agent = await loginAs(app, "toggler3@example.com", "password123");
    const fakeId = new mongoose.Types.ObjectId();

    const res = await agent.patch(`/api/todos/${fakeId}/toggle`);
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/todos/:id", () => {
  it("deletes a todo and returns success message", async () => {
    const user = await createVerifiedUser({ email: "deleter@example.com", password: "password123" });
    const todo = await seedTodo(user._id, "Delete me");
    const agent = await loginAs(app, "deleter@example.com", "password123");

    const res = await agent.delete(`/api/todos/${todo._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

   
    const gone = await Todo.findById(todo._id);
    expect(gone).toBeNull();
  });

  it("returns 404 when deleting another user's todo", async () => {
    const userA = await createVerifiedUser({ email: "owner3@example.com", password: "password123" });
    await createVerifiedUser({ name: "Other2", email: "other2@example.com", password: "password123" });
    const todo = await seedTodo(userA._id, "Don't delete me");

    const agent = await loginAs(app, "other2@example.com", "password123");
    const res = await agent.delete(`/api/todos/${todo._id}`);
    expect(res.status).toBe(404);

    
    const still = await Todo.findById(todo._id);
    expect(still).not.toBeNull();
  });

  it("adjusts dataUsageBytes downward after deletion", async () => {
    const user = await createVerifiedUser({ email: "usage@example.com", password: "password123" });
    const agent = await loginAs(app, "usage@example.com", "password123");

    
    const createRes = await agent
      .post("/api/todos")
      .set("Content-Type", "application/json")
      .send({ text: "Track my size" });
    const todoId = createRes.body._id;

    const userBefore = await User.findById(user._id);
    expect(userBefore.dataUsageBytes).toBeGreaterThan(0);

    await agent.delete(`/api/todos/${todoId}`);

    const userAfter = await User.findById(user._id);
    expect(userAfter.dataUsageBytes).toBe(0);
  });
});
