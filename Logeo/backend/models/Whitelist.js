const mongoose = require('mongoose');
const WhitelistSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
});
module.exports = mongoose.model('Whitelist', WhitelistSchema);