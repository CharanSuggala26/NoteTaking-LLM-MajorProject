const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testPodcast() {
    console.log("Testing Podcast Generation...");
    if (!process.env.GOOGLE_API_KEY) {
        console.error("ERROR: GOOGLE_API_KEY is missing in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        You are a podcast script writer. Convert the following note content into an engaging podcast dialogue between two hosts, "Alex" (Host A) and "Sam" (Host B).
        
        Title: Test Note
        Content: "Artificial Intelligence is transforming the way we work. It helps in automation and creativity."

        Format the output purely as a JSON array of objects, where each object has "speaker" and "text" fields. 
        Do not include markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON string.
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("Raw Response:", text);

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleanText);
        console.log("Parsed JSON:", json);
        console.log("SUCCESS");
    } catch (error) {
        console.error("FAILED:", error);
    }
}

testPodcast();
