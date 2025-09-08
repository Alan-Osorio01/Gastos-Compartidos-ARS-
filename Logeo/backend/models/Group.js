// backend/models/Group.js
const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 👇 NUEVO
    currency: {
      type: String,
      enum: ["COP", "USD", "EUR"], // amplía si quieres
      default: "COP",
    },
    isFavorite: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
