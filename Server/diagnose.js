const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function check() {
    const key = process.env.GOOGLE_API_KEY;
    console.log("Checking API Key: " + key.substring(0, 8) + "...");

    // 1. Try REST API v1beta
    try {
        console.log("\n--- REST API (v1beta) ---");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await res.json();

        if (data.error) {
            console.log("Error:", data.error.message);
        } else if (data.models) {
            console.log(`Found ${data.models.length} models.`);
            data.models.forEach(m => {
                // Filter for generateContent support
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`  [AVAILABLE] ${m.name}`);
                }
            });
        }
    } catch (e) { console.log("Fetch Error:", e.message); }

    // 2. Try SDK with 'gemini-1.5-flash' explicitly
    try {
        console.log("\n--- SDK Test (gemini-1.5-flash) ---");
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview", });
        const result = await model.generateContent("Hello");
        console.log("SUCCESS! Response:", result.response.text());
    } catch (e) {
        console.log("SDK Failed:", e.message);
    }
}

check();
