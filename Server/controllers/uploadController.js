const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

const extractText = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileBuffer = req.file.buffer;
        const fileType = req.file.mimetype;
        const originalName = req.file.originalname;

        let extractedText = '';

        if (fileType === 'application/pdf') {
            const data = await pdfParse(fileBuffer);
            extractedText = data.text;
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            originalName.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;
        } else if (fileType === 'text/plain' || originalName.endsWith('.txt')) {
            extractedText = fileBuffer.toString('utf8');
        } else {
            return res.status(400).json({ message: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' });
        }

        // Clean up text if necessary (optional)
        // extractedText = extractedText.replace(/\n+/g, '\n').trim();

        res.json({ text: extractedText });

    } catch (error) {
        console.error('Error extracting text:', error);
        // Log stack trace for deeper debugging
        console.error(error.stack);
        res.status(500).json({ message: 'Error extracting text from file', error: error.message });
    }
};

module.exports = { extractText };
