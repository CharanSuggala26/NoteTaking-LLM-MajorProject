// Native fetch in Node 18+

async function testMindMap() {
    console.log("Testing MindMap Endpoint...");

    // Create a dummy note content
    const body = {
        content: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water. Photosynthesis in plants generally involves the green pigment chlorophyll and generates oxygen as a byproduct."
    };

    try {
        // Native fetch (Node 18+)
        const response = await fetch("http://localhost:5000/api/notes/mindmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            console.log("SUCCESS ✅");
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log("FAILED ❌ Status:", response.status);
            console.log("Error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log("Request Error:", e.message);
    }
}

testMindMap();
