const express = require("express");
const requireAuth = require("../middleware/auth");
const { MAX_STORAGE_BYTES, recalculateUsage } = require("../utils/storage");

const router = express.Router();

router.use(requireAuth);


router.get("/", (req, res) => {
  res.status(200).json({
    usedBytes: req.user.dataUsageBytes,
    maxBytes: MAX_STORAGE_BYTES,
  });
});


router.post("/recalculate", async (req, res) => {
  try {
    const usedBytes = await recalculateUsage(req.user.id);
    res.status(200).json({ usedBytes, maxBytes: MAX_STORAGE_BYTES });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
