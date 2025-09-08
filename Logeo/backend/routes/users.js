// backend/routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userController');

// Obtener usuarios
router.get('/', usersController.getUsers);

// ⚠️ Ya no existe createUser (lo quitamos porque no hay admin)
// router.post('/', usersController.createUser); ❌ quítalo

// Actualizar usuario
router.put('/:id', usersController.updateUser);

// Eliminar usuario
router.delete('/:id', usersController.deleteUser);

// Cambiar contraseña
router.put('/:id/password', usersController.updatePassword);

module.exports = router;
