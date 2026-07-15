const User = require("../models/User");

const MAX_STORAGE_BYTES = Number(process.env.MAX_STORAGE_BYTES) || 5 * 1024 * 1024; // 30MB default


function getTodoSize({ text = "", completed = false }) {
  return Buffer.byteLength(text, "utf8") + Buffer.byteLength(String(completed), "utf8");
}


async function assertWithinQuota(userId, newContent, previousSize = 0) {
  const user = await User.findById(userId).select("dataUsageBytes");
  const newSize = getTodoSize(newContent);
  const projectedUsage = user.dataUsageBytes - previousSize + newSize;

  if (projectedUsage > MAX_STORAGE_BYTES) {
    const err = new Error(
      `Storage limit reached (${(MAX_STORAGE_BYTES / (1024 * 1024)).toFixed(0)}MB max). ` +
      `Delete some todos or shorten this one to continue.`
    );
    err.status = 413; 
    throw err;
  }

  return newSize;
}


async function adjustUsage(userId, delta) {
  await User.findByIdAndUpdate(userId, {
    $inc: { dataUsageBytes: Math.max(0, delta) >= 0 ? delta : delta },
  });
}
async function recalculateUsage(userId) {
  const Todo = require("../models/Todo");
  const todos = await Todo.find({ user: userId }).select("text completed");
  const total = todos.reduce((sum, t) => sum + getTodoSize(t), 0);
  await User.findByIdAndUpdate(userId, { dataUsageBytes: total });
  return total;
}

module.exports = {
  MAX_STORAGE_BYTES,
  getTodoSize,
  assertWithinQuota,
  adjustUsage,
  recalculateUsage,
};
