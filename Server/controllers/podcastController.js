const geminiService = require('../services/gemini');

const generatePodcastScript = async (req, res) => {
    try {
        const { content, title } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const prompt = `
        You are a podcast script writer. Convert the following note content into an engaging podcast dialogue between two hosts, "Alex" (Host A) and "Sam" (Host B).
        
        Title: ${title || 'Untitled Note'}
        Content: "${content}"

        Format the output purely as a JSON array of objects, where each object has "speaker" and "text" fields. 
        Do not include markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON string.
        
        Example format:
        [
            { "speaker": "Sai", "text": "Welcome back to the VNR notes podcast. Today we are discussing..." },
            { "speaker": "Charan", "text": "That's right, Sai. It's a fascinating topic because..." }
        ]

        use speaker names Sai and Charan, but don't use "Host A" or "Host B", just "Sai" and "Charan".
        Make it sound natural, conversational, and enthusiastic.
        `;

        let result = await geminiService.generateText(prompt, "gemini-3-flash-preview");

        // Sanitize output in case the model adds markdown
        result = result.replace(/```json/g, '').replace(/```/g, '').trim();

        let script;
        try {
            script = JSON.parse(result);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Raw Output:", result);
            // Fallback: try to just return the text if JSON fails, or return a simpler structure
            return res.status(500).json({ message: 'Failed to generate valid script format', raw: result });
        }

        res.json({ script });

    } catch (error) {
        console.error('Podcast Generation Error:', error);
        console.error('Stack:', error.stack);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        res.status(500).json({ message: 'Error generating podcast script', error: error.message });
    }
};

module.exports = { generatePodcastScript };

