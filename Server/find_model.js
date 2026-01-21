const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function findWorkingModel() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro",
        "gemini-1.5-flash-latest"
    ];

    console.log("Testing text generation models...");

    for (const modelName of candidates) {
        try {
            process.stdout.write(`Testing ${modelName}... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log("SUCCESS! ✅");
            console.log(`Working Model Found: ${modelName}`);
            return; // Stop after finding first working one
        } catch (error) {
            console.log(`FAILED ❌ (${error.message.split('[')[0].trim()})`); // concise error
        }
    }

    console.log("No working text generation models found in snippets.");
}

findWorkingModel();
