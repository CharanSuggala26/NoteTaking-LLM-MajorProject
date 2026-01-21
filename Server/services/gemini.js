const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Configuration
const MODEL_NAME = "gemini-2.0-flash-lite"; // Lighter model to avoid rate limits
const EMBEDDING_MODEL = "text-embedding-004";

const geminiService = {
    // Generate Embeddings for Vector Search
    generateEmbedding: async (text) => {
        try {
            if (!process.env.GOOGLE_API_KEY) return [];

            const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
            const result = await model.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            console.error("Gemini Embedding Error:", error.message);
            return []; // Return empty on failure to not block app
        }
    },

    // Generate Content (MindMap, Chat, etc.)
    generateText: async (prompt, modelName = MODEL_NAME) => {
        try {
            if (!process.env.GOOGLE_API_KEY) throw new Error("API Key missing");

            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Gemini Generation Error:", error.message);
            throw error; // Rethrow to handle in controller
        }
    }
};

module.exports = geminiService;
