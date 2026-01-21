const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) {
        console.log("No API Key found");
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                // Filter for just gemini models to keep logs clean
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found in response:", data);
        }
    } catch (error) {
        console.error("List Models Error:", error.message);
    }
}

listModels();
