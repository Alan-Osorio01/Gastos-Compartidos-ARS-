// backend/controllers/expenseController
const Expense = require('../models/Expense');

// ➤ Crear un gasto
exports.addExpense = async (req, res) => {
  try {
    const { description, amount, groupId, paidBy, splitAmong } = req.body;

    // Asociamos al usuario autenticado
    const newExpense = new Expense({
      description,
      amount,
      group: groupId,
      paidBy,
      splitAmong,
      user: req.user.id, // 👈 muy importante
      receiptUrl: 'URL_de_Cloudinary' // reemplazar con la URL real
    });

    await newExpense.save();
    res.status(201).json({ msg: 'Gasto agregado con éxito', expense: newExpense });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};

// ➤ Obtener SOLO los gastos del usuario autenticado
exports.getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).populate('group');
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
};
