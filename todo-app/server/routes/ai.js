const express = require("express");
const { ai } = require("../services/gemini");

const router = express.Router();

router.post("/correct", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Correct the spelling and grammar only.

Do NOT:
- change the meaning
- rewrite the sentence
- add extra words

Text:
${text}`,
    });

    res.json({
      corrected: response.text(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "AI failed",
    });
  }
});

module.exports = router;