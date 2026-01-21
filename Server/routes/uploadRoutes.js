const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractText } = require('../controllers/uploadController');

// Multer setup for memory storage (we process text immediately, no need to save to disk)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Route
router.post('/', upload.single('file'), extractText);

module.exports = router;
