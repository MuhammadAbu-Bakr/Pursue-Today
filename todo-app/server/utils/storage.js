const User = require("../models/User");

const DEFAULT_MAX_STORAGE_BYTES = 30 * 1024 * 1024;


function getTodoSize({ text = "", completed = false, dueDate = null, priority = "", category = "", tags = [], attachments = [] }) {
  let size = Buffer.byteLength(text, "utf8") + Buffer.byteLength(String(completed), "utf8");
  if (dueDate) size += Buffer.byteLength(String(dueDate), "utf8");
  if (priority) size += Buffer.byteLength(priority, "utf8");
  if (category) size += Buffer.byteLength(category, "utf8");
  if (tags && tags.length > 0) size += Buffer.byteLength(tags.join(","), "utf8");
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      if (att.url)      size += Buffer.byteLength(att.url, "utf8");
      if (att.filename) size += Buffer.byteLength(att.filename, "utf8");
      if (att.publicId) size += Buffer.byteLength(att.publicId, "utf8");
    }
  }
  return size;
}



async function assertWithinQuota(userId, newContent, previousSize = 0) {
  const MAX_STORAGE_BYTES = Number(process.env.MAX_STORAGE_BYTES) || DEFAULT_MAX_STORAGE_BYTES;
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
  const todos = await Todo.find({ user: userId }).select("text completed dueDate priority category tags");
  const total = todos.reduce((sum, t) => sum + getTodoSize(t), 0);
  await User.findByIdAndUpdate(userId, { dataUsageBytes: total });
  return total;
}

module.exports = {
  MAX_STORAGE_BYTES: DEFAULT_MAX_STORAGE_BYTES,
  getTodoSize,
  assertWithinQuota,
  adjustUsage,
  recalculateUsage,
};
