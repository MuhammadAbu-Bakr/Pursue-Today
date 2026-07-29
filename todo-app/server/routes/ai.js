const express = require("express");
const { ai } = require("../services/gemini");

const router = express.Router();

const PROMPTS = {
  correct: (text) =>
    `Correct the spelling and grammar only.\n\nDo NOT:\n- change the meaning\n- rewrite the sentence\n- add extra words\n\nText:\n${text}`,
  formal: (text) =>
    `Rewrite the following text in a formal, professional tone. Keep the original meaning and length roughly the same. Return only the rewritten text, nothing else.\n\nText:\n${text}`,
  casual: (text) =>
    `Rewrite the following text in a casual, relaxed, conversational tone. Keep the original meaning. Return only the rewritten text, nothing else.\n\nText:\n${text}`,
  summarize: (text) =>
    `Summarize the following text concisely, keeping only the key point(s). Return only the summary, nothing else.\n\nText:\n${text}`,
  enhance: (text) =>
    `Improve the clarity, word choice, and flow of the following text without changing its meaning or significantly changing its length. Return only the improved text, nothing else.\n\nText:\n${text}`,
};

router.post("/transform", async (req, res) => {
  try {
    const { text, action } = req.body;

    if (!text) {
      return res.status(400).json({ message: "No text provided" });
    }

    const buildPrompt = PROMPTS[action];
    if (!buildPrompt) {
      return res.status(400).json({ message: `Unknown action: ${action}` });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: buildPrompt(text),
    });

    res.json({
      result: response.text,
    });
  } catch (err) {
    console.error("AI /transform error:", err?.message || err);

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