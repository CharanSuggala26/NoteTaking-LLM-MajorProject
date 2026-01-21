const express = require("express");
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");
const Note = require("../models/Note");
const ai = new GoogleGenAI({});
router.post("/", async (req, res) => {
  const { message } = req.body;
  const context = await Note.find().then((notes) => {
    return notes
      .map((note) => `${note.title}: ${note.content}`)
      .join("\n");
  });
  // "I play football on weekends and enjoy hiking in the mountains.";
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a smart AI assistant. Answer the user's question using the context below. If you don't know the answer, just say that you don't know. Answer the questions directly don't use as per the context phrases.

    Context:
    ${context}

    User's question:
    ${message}`,
    temperature: 0.7,
    topP: 0.5,
  });
  res.json({ response: response.text });
});

module.exports = router;
