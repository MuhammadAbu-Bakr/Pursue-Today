
const mongoose = require("mongoose");
const User = require("../models/User");
const Todo = require("../models/Todo");
const {
  getTodoSize,
  assertWithinQuota,
  adjustUsage,
  recalculateUsage,
  MAX_STORAGE_BYTES,
} = require("../utils/storage");
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


describe("getTodoSize", () => {
  it("returns the byte size of text + completed flag string", () => {
    const size = getTodoSize({ text: "Hello", completed: false });
    // "Hello" = 5 bytes, "false" = 5 bytes → 10 total
    expect(size).toBe(Buffer.byteLength("Hello", "utf8") + Buffer.byteLength("false", "utf8"));
  });

  it("correctly measures multi-byte UTF-8 characters", () => {
    const arabicText = "مرحبا"; // 5 Arabic characters, each 2 bytes in UTF-8 = 10 bytes
    const size = getTodoSize({ text: arabicText, completed: false });
    expect(size).toBe(Buffer.byteLength(arabicText, "utf8") + Buffer.byteLength("false", "utf8"));
  });

  it("returns a larger size for 'completed: true' than 'completed: false'", () => {
    const sizeTrue = getTodoSize({ text: "abc", completed: true });
    const sizeFalse = getTodoSize({ text: "abc", completed: false });
    // "true" = 4 bytes, "false" = 5 bytes → false should be larger
    expect(sizeFalse).toBeGreaterThan(sizeTrue);
  });

  it("handles empty text", () => {
    const size = getTodoSize({ text: "", completed: false });
    expect(size).toBe(Buffer.byteLength("", "utf8") + Buffer.byteLength("false", "utf8"));
  });
});

// ─── assertWithinQuota ────────────────────────────────────────────────────────
describe("assertWithinQuota", () => {
  it("resolves and returns the new size when within quota", async () => {
    const user = await createVerifiedUser({ email: "quota1@example.com" });
    const content = { text: "Small task", completed: false };

    const size = await assertWithinQuota(user._id, content);
    expect(size).toBe(getTodoSize(content));
  });

  it("throws a 413 error when projected usage exceeds MAX_STORAGE_BYTES", async () => {
    const user = await createVerifiedUser({ email: "quota2@example.com" });
    // Set usage just 1 byte below max
    await User.findByIdAndUpdate(user._id, { dataUsageBytes: MAX_STORAGE_BYTES - 1 });

    const hugeContent = { text: "X".repeat(1000), completed: false };

    await expect(assertWithinQuota(user._id, hugeContent)).rejects.toMatchObject({
      status: 413,
      message: expect.stringMatching(/storage limit/i),
    });
  });

  it("accounts for previousSize when updating an existing todo", async () => {
    const user = await createVerifiedUser({ email: "quota3@example.com" });
    const oldContent = { text: "Old text", completed: false };
    const previousSize = getTodoSize(oldContent);

    // Set usage equal to old todo's size (simulating the todo already exists)
    await User.findByIdAndUpdate(user._id, { dataUsageBytes: previousSize });

    // New content is the same size — net change is 0 → should pass
    const newContent = { text: "New text", completed: false };
    await expect(assertWithinQuota(user._id, newContent, previousSize)).resolves.toBeDefined();
  });
});

// ─── adjustUsage ─────────────────────────────────────────────────────────────
describe("adjustUsage", () => {
  it("increments dataUsageBytes by a positive delta", async () => {
    const user = await createVerifiedUser({ email: "adjust1@example.com" });
    await adjustUsage(user._id, 100);

    const updated = await User.findById(user._id);
    expect(updated.dataUsageBytes).toBe(100);
  });

  it("decrements dataUsageBytes by a negative delta", async () => {
    const user = await createVerifiedUser({ email: "adjust2@example.com" });
    await User.findByIdAndUpdate(user._id, { dataUsageBytes: 200 });

    await adjustUsage(user._id, -50);

    const updated = await User.findById(user._id);
    expect(updated.dataUsageBytes).toBe(150);
  });

  it("can drive dataUsageBytes to 0", async () => {
    const user = await createVerifiedUser({ email: "adjust3@example.com" });
    await User.findByIdAndUpdate(user._id, { dataUsageBytes: 100 });

    await adjustUsage(user._id, -100);

    const updated = await User.findById(user._id);
    expect(updated.dataUsageBytes).toBe(0);
  });
});

// ─── recalculateUsage ─────────────────────────────────────────────────────────
describe("recalculateUsage", () => {
  it("returns 0 for a user with no todos", async () => {
    const user = await createVerifiedUser({ email: "recalc1@example.com" });
    const total = await recalculateUsage(user._id);
    expect(total).toBe(0);

    const updated = await User.findById(user._id);
    expect(updated.dataUsageBytes).toBe(0);
  });

  it("sums the sizes of all todos and writes it to the user", async () => {
    const user = await createVerifiedUser({ email: "recalc2@example.com" });
    const t1 = await Todo.create({ text: "Task 1", completed: false, user: user._id });
    const t2 = await Todo.create({ text: "Task 2", completed: true, user: user._id });

    const expected = getTodoSize(t1) + getTodoSize(t2);
    const total = await recalculateUsage(user._id);

    expect(total).toBe(expected);

    const updated = await User.findById(user._id);
    expect(updated.dataUsageBytes).toBe(expected);
  });

  it("corrects a corrupted dataUsageBytes value", async () => {
    const user = await createVerifiedUser({ email: "recalc3@example.com" });
    await Todo.create({ text: "Real todo", completed: false, user: user._id });

    // Corrupt the counter
    await User.findByIdAndUpdate(user._id, { dataUsageBytes: 99999 });

    const total = await recalculateUsage(user._id);
    const updated = await User.findById(user._id);

    expect(updated.dataUsageBytes).toBe(total);
    expect(total).toBeLessThan(99999);
  });
});
