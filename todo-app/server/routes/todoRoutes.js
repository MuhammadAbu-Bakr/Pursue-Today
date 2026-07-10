const express = require("express");
const Todo = require("../models/Todo");
const requireAuth = require("../middleware/auth");
const { assertWithinQuota, adjustUsage, getTodoSize } = require("../utils/storage");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newContent = { text: req.body.text, completed: false };
    const size = await assertWithinQuota(req.user.id, newContent);

    const todo = await Todo.create({
      text: req.body.text,
      user: req.user.id,
    });

    await adjustUsage(req.user.id, size);

    res.status(201).json(todo);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!existing) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const previousSize = getTodoSize(existing);
    const newContent = {
      text: req.body.text ?? existing.text,
      completed: req.body.completed ?? existing.completed,
    };
    const newSize = await assertWithinQuota(req.user.id, newContent, previousSize);

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    await adjustUsage(req.user.id, newSize - previousSize);

    res.status(200).json(todo);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.completed = !todo.completed;
    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await adjustUsage(req.user.id, -getTodoSize(todo));

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
