const express = require('express');
const router = express.Router();
const { generatePodcastScript } = require('../controllers/podcastController');

router.post('/generate', generatePodcastScript);

module.exports = router;
