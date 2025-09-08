// models/User.js
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
}, { timestamps: true, versionKey: false });

module.exports = model('User', userSchema);
