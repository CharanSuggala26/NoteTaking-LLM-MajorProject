const Note = require('../models/Note');
const geminiService = require('../services/gemini');

const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({});

// @desc    Get all notes
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find().sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single note
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (note) res.json(note);
        else res.status(404).json({ message: 'Note not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a note
const createNote = async (req, res) => {
    const { title, content, tags } = req.body;
    try {
        // Step 1: Generate Embedding
        const textToEmbed = `${title} ${content}`;
        const vectorEmbedding = await geminiService.generateEmbedding(textToEmbed);

        const note = new Note({
            title,
            content,
            tags,
            vectorEmbedding
        });

        const createdNote = await note.save();
        res.status(201).json(createdNote);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a note
const updateNote = async (req, res) => {
    const { title, content, tags } = req.body;
    try {
        const note = await Note.findById(req.params.id);
        if (note) {
            note.title = title || note.title;
            note.content = content || note.content;
            note.tags = tags || note.tags;
            note.updatedAt = Date.now();

            // Re-generate embedding if content changed
            if (title || content) {
                const textToEmbed = `${note.title} ${note.content}`;
                const newEmbedding = await geminiService.generateEmbedding(textToEmbed);
                if (newEmbedding.length > 0) {
                    note.vectorEmbedding = newEmbedding;
                }
            }

            const updatedNote = await note.save();
            res.json(updatedNote);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a note
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (note) {
            await note.deleteOne();
            res.json({ message: 'Note removed' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate Mind Map
// const generateMindMap = async (req, res) => {
//     const { noteId, content } = req.body;

//     // 1. Get Content
//     let noteContent = content;
//     if (noteId) {
//         try {
//             const note = await Note.findById(noteId);
//             if (!note) return res.status(404).json({ message: "Note not found" });
//             noteContent = `Title: ${note.title}\n\n${note.content}`;
//         } catch (err) {
//             return res.status(500).json({ message: "Error fetching note" });
//         }
//     }
//     if (!noteContent) return res.status(400).json({ message: "No content provided" });

//     // 2. Build Prompt
//     const prompt = `You are a specialized AI that generates hierarchical mind map data structure from text.
//     GOAL: Analyze the provided text and output a JSON array representing the mind map nodes.

//     OUTPUT FORMAT (Strict JSON Array):
//     [
//       { "id": "1", "label": "Main Topic", "parentId": null },
//       { "id": "2", "label": "Subtopic A", "parentId": "1" }
//     ]

//     CONSTRAINTS:
//     1. "id" must be a unique string.
//     2. Root "parentId" is null.
//     3. Generate 5-15 nodes.
//     4. NO markdown. JUST raw JSON.

//     TEXT: "${noteContent.replace(/"/g, '\\"').substring(0, 3000)}"`;

//     // 3. Generate
//     try {
//         console.log("Generating MindMap...");
//         const textResult = await ai.models.generateContent({
//             model: "gemini-3-flash-preview",
//             contents: prompt,
//             temperature: 0.7,
//             topP: 0.5,
//         });

//         // 4. Parse JSON
        // let cleanText = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
        // const start = cleanText.indexOf('[');
        // const end = cleanText.lastIndexOf(']');
        // if (start !== -1 && end !== -1) cleanText = cleanText.substring(start, end + 1);

        // res.json(JSON.parse(cleanText));

//     } catch (error) {
//         console.error("MindMap Gen Error:", error.message);
//         res.status(500).json({
//             message: "MindMap Generation Failed: " + error.message,
//             details: error.response // Pass through 429 details if present
//         });
//     }
// };

module.exports = {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    // generateMindMap
};
