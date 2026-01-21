const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testMindMap() {
    console.log("Testing MindMap Generation...");
    if (!process.env.GOOGLE_API_KEY) {
        console.error("Error: GOOGLE_API_KEY not found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const content = "Project Management involves planning, executing, monitoring, controlling, and closing projects. Key phases include Initiation, Planning, Execution, and Closure.";

    const prompt = `Generate a JSON mind map for this content: "${content}". 
    Format: [{"id": "1", "label": "Root", "parentId": null}, ...]. 
    No markdown.`;

    try {
        const result = await model.generateContent(prompt);
        console.log("\n--- Raw Response ---");
        console.log(result.response.text());
        console.log("--------------------\n");
    } catch (error) {
        console.error("Generation Failed:", error.message);
    }
}

testMindMap();
