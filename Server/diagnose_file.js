const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const util = require('util');
require('dotenv').config();

const logFile = fs.createWriteStream('debug_log.txt', { flags: 'w' });
const logStdout = process.stdout;

console.log = function () {
    logFile.write(util.format.apply(null, arguments) + '\n');
    logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

async function check() {
    const key = process.env.GOOGLE_API_KEY;
    console.log("Checking API Key: " + (key ? key.substring(0, 8) + "..." : "MISSING"));

    // 1. Try REST API v1beta
    try {
        console.log("\n--- REST API (v1beta) ---");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await res.json();

        if (data.error) {
            console.log("Error:", JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            console.log(`Found ${data.models.length} models.`);
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`  [AVAILABLE] ${m.name}`);
                }
            });
        } else {
            console.log("No 'models' property in response:", JSON.stringify(data));
        }
    } catch (e) {
        console.log("Fetch Error:", e.message);
    }
}

check();
