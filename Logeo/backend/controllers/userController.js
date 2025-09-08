// backend/controllers/userController.js
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const Whitelist = require('../models/Whitelist');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (sin password)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.json(users);
    } catch (err) {
        res.status(500).send('Error del servidor');
    }
};

// Actualizar email de usuario
exports.updateUser = async (req, res) => {
    const { email } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { email },
            { new: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(500).send('Error del servidor');
    }
};

// Eliminar usuario (soft delete + blacklist)
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // marcar como eliminado
        user.status = 'deleted';
        await user.save();

        // quitar de whitelist
        await Whitelist.deleteOne({ email: user.email });

        // agregar a blacklist
        await Blacklist.create({ email: user.email });

        res.json({ msg: 'Usuario eliminado (soft delete) y agregado a blacklist' });
    } catch (err) {
        res.status(500).send('Error del servidor');
    }
};

// Cambiar contraseña
exports.updatePassword = async (req, res) => {
    const { newPassword } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { passwordHash: hashedPassword },
            { new: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json({ msg: 'Contraseña actualizada con éxito' });
    } catch (err) {
        res.status(500).send('Error del servidor');
    }
};
