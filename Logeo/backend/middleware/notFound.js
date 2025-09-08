// backend/middleware/notFound.js
module.exports = (req, res) => {
  res.status(404).json({ msg: 'Ruta no encontrada' });
};
