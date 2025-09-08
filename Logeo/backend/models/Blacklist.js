// backend/models/Blacklist.js

const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
    // Cambia userId por email
    email: {
        type: String,
        required: true,
        unique: true
    },
    deletedAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Blacklist', BlacklistSchema);