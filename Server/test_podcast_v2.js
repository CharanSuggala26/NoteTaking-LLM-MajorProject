const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testPodcast() {
    console.log("Testing Podcast Generation with gemini-2.0-flash...");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
        You are a podcast script writer. Convert the following note content into an engaging podcast dialogue between two hosts.
        Title: Test
        Content: "Hello world"
        Format: JSON array of {speaker, text}.
    `;

    try {
        const result = await model.generateContent(prompt);
        console.log("SUCCESS");
        console.log(result.response.text().substring(0, 100) + "...");
    } catch (error) {
        console.error("FAILED:", error.message);
    }
}

testPodcast();
