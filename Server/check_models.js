const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listAllModels() {
    const key = process.env.GOOGLE_API_KEY;
    console.log("Using Key:", key ? "Found (Starts with " + key.substring(0, 4) + ")" : "MISSING");

    try {
        // Use REST API directly to be sure, avoiding SDK assumptions
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        console.log("\n--- AVAILABLE MODELS ---");
        const generativeModels = [];

        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`✅ ${m.name} (${m.displayName})`);
                    generativeModels.push(m.name.replace("models/", ""));
                } else {
                    console.log(`❌ ${m.name} (Not for generateContent)`);
                }
            });
        }

        console.log("\n--- RECOMMENDATION ---");
        if (generativeModels.length > 0) {
            console.log(`Please update your code to use one of these exact strings:`);
            console.log(JSON.stringify(generativeModels, null, 2));
        } else {
            console.log("No content generation models found for this API Key.");
        }

    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

listAllModels();
