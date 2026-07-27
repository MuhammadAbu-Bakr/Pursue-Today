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
      model: "gemini-2.0-flash",
      contents: `Correct the spelling and grammar only.\n\nDo NOT:\n- change the meaning\n- rewrite the sentence\n- add extra words\n\nText:\n${text}`,
    });

    res.json({
      corrected: response.text,
    });
  } catch (err) {
    console.error("AI /correct error:", err?.message || err);
    res.status(500).json({
      message: "AI failed",
      detail: err?.message,
    });
  }
});

module.exports = router;