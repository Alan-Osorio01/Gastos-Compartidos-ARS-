const Group = require("../models/Group");

// Obtener solo los grupos del usuario autenticado
exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }); // 👈 filtrado por usuario
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};
