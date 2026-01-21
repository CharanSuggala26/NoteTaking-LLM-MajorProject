require('dotenv').config();
const OpenAI = require("openai");

async function testDeepSeek() {
    console.log("Testing DeepSeek API Connection...");

    if (!process.env.DEEPSEEK_API_KEY) {
        console.error("❌ DEEPSEEK_API_KEY is missing from .env");
        return;
    }

    const client = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY
    });

    try {
        const completion = await client.chat.completions.create({
            messages: [{ role: "user", content: "Say 'Hello from DeepSeek!'" }],
            model: "deepseek-chat",
        });

        console.log("✅ Custom DeepSeek Check Passed!");
        console.log("Response:", completion.choices[0].message.content);
    } catch (e) {
        console.error("❌ DeepSeek Check Failed:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        }
    }
}

testDeepSeek();
