const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({});
const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    // generateMindMap
} = require('../controllers/noteController');

router.route('/').get(getNotes).post(createNote);
router.post('/mindmap', async (req, res) => {
    const { noteId, content } = req.body;
    const prompt = `You are a specialized AI that generates hierarchical mind map data structure from text.
    GOAL: Analyze the provided text and output a JSON array representing the mind map nodes.
    
    OUTPUT FORMAT (Strict JSON Array):
    [
      { "id": "1", "label": "Main Topic", "parentId": null },
      { "id": "2", "label": "Subtopic A", "parentId": "1" }
    ]
    
    CONSTRAINTS:
    1. "id" must be a unique string.
    2. Root "parentId" is null.
    3. Generate 5-15 nodes.
    4. NO markdown. JUST raw JSON.

    TEXT: "${content}"`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            temperature: 0.7,
            topP: 0.5,
        });
        let cleanText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const start = cleanText.indexOf('[');
        const end = cleanText.lastIndexOf(']');
        if (start !== -1 && end !== -1) cleanText = cleanText.substring(start, end + 1);

        res.json(JSON.parse(cleanText));
    } catch (error) {
        console.error('Error generating mind map:', error);
        if (error.response) {
            console.error('Response Error Data:', await error.response.text());
        }
        res.status(500).json({ error: 'Failed to generate mind map', details: error.message });
    }
});
router.route('/:id').get(getNoteById).put(updateNote).delete(deleteNote);

module.exports = router;




