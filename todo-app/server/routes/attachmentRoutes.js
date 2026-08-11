const express = require("express");
const multer  = require("multer");
const { Readable } = require("stream");

const Todo        = require("../models/Todo");
const requireAuth = require("../middleware/auth");
const cloudinary  = require("../utils/cloudinary");

const MAX_FILE_SIZE_KB    = Number(process.env.MAX_FILE_SIZE_KB)   ;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024;
const MAX_FILES_PER_TASK  = Number(process.env.MAX_FILES_PER_TASK) ;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES_PER_TASK,
  },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

const router = express.Router({ mergeParams: true });
router.use(requireAuth);

router.post("/", upload.array("files", MAX_FILES_PER_TASK), async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files provided" });
    }

    const currentCount = todo.attachments?.length || 0;
    if (currentCount + req.files.length > MAX_FILES_PER_TASK) {
      return res.status(400).json({
        message: `Cannot add ${req.files.length} file(s). Task already has ${currentCount} attachment(s) (max ${MAX_FILES_PER_TASK}).`,
      });
    }

    const uploaded = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file, req.user.id))
    );

    todo.attachments.push(...uploaded);
    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: `File too large. Maximum size is ${MAX_FILE_SIZE_KB} KB per file.`,
      });
    }
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:attachId", async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    const attachment = todo.attachments.id(req.params.attachId);
    if (!attachment) return res.status(404).json({ message: "Attachment not found" });

    const resourceType = attachment.mimetype.startsWith("image/") ? "image" : "raw";

    try {
      await cloudinary.uploader.destroy(attachment.publicId, { resource_type: resourceType });
    } catch {
      console.error("Cloudinary deletion failed for", attachment.publicId);
    }

    attachment.deleteOne();
    await todo.save();

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function uploadToCloudinary(file, userId) {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("image/") ? "image" : "raw";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `pursue-today/${userId}`,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          publicId:  result.public_id,
          url:       result.secure_url,
          filename:  file.originalname,
          mimetype:  file.mimetype,
          size:      file.size,
        });
      }
    );

    const readable = new Readable();
    readable.push(file.buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

module.exports = router;
