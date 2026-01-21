const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    tags: [String],
    isFavorite: {
        type: Boolean,
        default: false,
    },
    vectorEmbedding: {
        type: [Number], // For vector search
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Create index for vector search if needed (depends on Atlas capabilities/setup, usually done in Atlas UI for vector search)
// But we can define standard text index here
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);
