const express = require("express");
const { ai } = require("../services/gemini");

const router = express.Router();

router.post("/correct", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "No text provided" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Correct the spelling and grammar only.\n\nDo NOT:\n- change the meaning\n- rewrite the sentence\n- add extra words\n\nText:\n${text}`,
    });

    res.json({
      corrected: response.text,
    });
  } catch (err) {
    console.error("AI /correct error:", err?.message || err);

    const isQuotaError =
      err?.status === 429 ||
      err?.code === 429 ||
      err?.status === "RESOURCE_EXHAUSTED" ||
      (err?.message || "").includes("RESOURCE_EXHAUSTED") ||
      (err?.message || "").includes("quota") ||
      (err?.message || "").toLowerCase().includes("rate limit");

    if (isQuotaError) {
      return res.status(429).json({
        message: "AI quota exceeded. Please try again later.",
        detail: err?.message,
      });
    }

    res.status(500).json({
      message: "AI failed",
      detail: err?.message,
    });
  }
});

module.exports = router;