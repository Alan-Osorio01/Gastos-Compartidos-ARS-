const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    title: { type: String, required: true },
    category: { type: String, default: "Otro" },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["COP", "USD", "EUR"], default: "COP" },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },

    // división
    splitEvenly: { type: Boolean, default: true },
    splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
