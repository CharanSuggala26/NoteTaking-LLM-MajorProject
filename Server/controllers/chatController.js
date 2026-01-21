const Note = require('../models/Note');
const geminiService = require('../services/gemini');

// Helper: Cosine Similarity
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    return (magA === 0 || magB === 0) ? 0 : dot / (magA * magB);
}

// @desc    Chat with notes (RAG)
// @route   POST /api/chat
// @access  Public
const chat = async (req, res) => {
    const { message } = req.body;


};

module.exports = { chat };
