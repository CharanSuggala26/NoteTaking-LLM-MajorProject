const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testQuota() {
    console.log("Testing gemini-1.5-flash with current key...");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        process.stdout.write("Generating content... ");
        const result = await model.generateContent("Hello!");
        console.log("SUCCESS! ✅");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.log("FAILED ❌");
        console.log("Error:", e.message);
    }
}

testQuota();
