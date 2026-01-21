const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const dotenv = require('dotenv');
dotenv.config();

async function testLangChain() {
    console.log("Testing LangChain with Gemini...");
    const model = new ChatGoogleGenerativeAI({
        modelName: "gemini-1.5-flash",
        maxOutputTokens: 2048,
        apiKey: process.env.GOOGLE_API_KEY,
    });

    try {
        const res = await model.invoke([
            ["human", "Hello, who are you?"],
        ]);
        console.log("Success:", res.content);
    } catch (e) {
        console.error("LangChain Error:", e.message);
    }
}

testLangChain();
