const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testSpecific() {
    const key = process.env.GOOGLE_API_KEY;
    console.log(`Key Prefix: ${key ? key.substring(0, 4) : "MISSING"}... Length: ${key ? key.length : 0}`);

    const genAI = new GoogleGenerativeAI(key);

    const candidates = [
        "gemini-1.5-flash",
        "gemini-pro"
    ];

    console.log("Testing models with DETAILED logs...");

    for (const name of candidates) {
        try {
            process.stdout.write(`Testing ${name}... `);
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent("Hi");
            console.log("SUCCESS ✅");
            return;
        } catch (e) {
            console.log("FAILED ❌");
            console.log(`   Error: ${e.message}`);
            if (e.response) {
                console.log(`   Status: ${e.response.status}`);
                console.log(`   Details: ${JSON.stringify(e.response)}`);
            }
        }
    }
}

testSpecific();
