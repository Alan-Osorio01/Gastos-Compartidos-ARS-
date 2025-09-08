const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Group = require("../models/Group");
const Expense = require("../models/Expense");

// GET /api/expenses?group=:groupId -> lista gastos del grupo
router.get("/", auth, async (req, res) => {
  try {
    const { group: groupId } = req.query;
    if (!groupId) return res.status(400).json({ msg: "Falta group" });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Grupo no encontrado" });

    const myId = req.user.id.toString();
    if (!(group.members || []).map(String).includes(myId)) {
      return res.status(403).json({ msg: "No autorizado" });
    }

    const expenses = await Expense.find({ group: groupId })
      .sort({ date: -1, createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    console.error("❌ Error listando gastos:", err);
    res.status(500).json({ msg: "Error de servidor" });
  }
});

// POST /api/expenses -> crear gasto
router.post("/", auth, async (req, res) => {
  try {
    let {
      group: groupId,
      title,
      category = "Otro",
      amount,
      currency = "COP",
      paidBy,
      date,
      splitEvenly = true,
      splitAmong = []
    } = req.body;

    if (!groupId || !title || !amount || !paidBy) {
      return res.status(400).json({ msg: "Faltan campos requeridos" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ msg: "Grupo no encontrado" });

    const members = (group.members || []).map((m) => m.toString());
    const myId = req.user.id.toString();
    if (!members.includes(myId)) {
      return res.status(403).json({ msg: "No autorizado" });
    }

    // Validaciones de pertenencia
    if (!members.includes(paidBy.toString())) {
      return res.status(400).json({ msg: "paidBy no pertenece al grupo" });
    }
    splitAmong = Array.from(
      new Set((splitAmong || []).map((id) => id && id.toString()).filter(Boolean))
    );
    for (const pid of splitAmong) {
      if (!members.includes(pid)) {
        return res.status(400).json({ msg: `Miembro inválido en splitAmong: ${pid}` });
      }
    }

    // Normalizar
    const ALLOWED = new Set(["COP", "USD", "EUR"]);
    currency = (currency || "COP").toUpperCase();
    if (!ALLOWED.has(currency)) currency = "COP";

    const expense = await Expense.create({
      group: groupId,
      title: title.trim(),
      category: (category || "Otro").trim(),
      amount: Number(amount),
      currency,
      paidBy,
      date: date ? new Date(date) : new Date(),
      splitEvenly: !!splitEvenly,
      splitAmong
    });

    // actualizar actividad del grupo
    group.lastActivity = Date.now();
    await group.save();

    res.status(201).json({ msg: "Gasto creado", expense });
  } catch (err) {
    console.error("❌ Error creando gasto:", err);
    res.status(500).json({ msg: "Error de servidor" });
  }
});

module.exports = router;
