// models/User.js
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name:   { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email:  { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform(_doc, ret) {
      // ocultar por si alguien hizo select('+passwordHash') sin querer
      delete ret.passwordHash;
      // formateo cómodo del id
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// refuerza índice único por si el de 'unique: true' no se creó aún
userSchema.index({ email: 1 }, { unique: true });

module.exports = model('User', userSchema);
