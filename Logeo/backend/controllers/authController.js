// controllers/authController.js
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const User = require('../models/User');
let Blacklist;
try { Blacklist = require('../models/Blacklist'); } catch (_) {}

const ACCESS_TTL = process.env.ACCESS_TTL || '20m';
const JWT_SECRET = process.env.JWT_SECRET;

function signAccess(user) {
  // solo id y email
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function publicUser(u) {
  if (!u) return null;
  const { _id, name, email, createdAt, updatedAt } = u;
  return { id: _id, name, email, createdAt, updatedAt };
}

exports.register = async (req, res) => {
  try {
    const name = req.body.name.trim();
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password;

    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(409).json({ msg: 'El email ya está registrado' });

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await User.create({ name, email, passwordHash });

    const token = signAccess(user);
    return res.status(201).json({ msg: 'Registro exitoso', token, user: publicUser(user) });
  } catch (err) {
    console.error('[AUTH] register error:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const password = req.body.password;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ msg: 'Credenciales inválidas' });

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) return res.status(401).json({ msg: 'Credenciales inválidas' });

    const token = signAccess(user);
    return res.json({ msg: 'Inicio de sesión exitoso', token, user: publicUser(user) });
  } catch (err) {
    console.error('[AUTH] login error:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

exports.me = async (req, res) => {
  try {
    const u = await User.findById(req.user.id).lean();
    if (!u) return res.status(404).json({ msg: 'Usuario no encontrado' });
    return res.json({ user: publicUser(u) });
  } catch (err) {
    console.error('[AUTH] me error:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};

exports.logout = async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token && Blacklist) {
      const decoded = jwt.decode(token);
      await Blacklist.create({ token, exp: decoded?.exp });
    }
    return res.json({ msg: 'Sesión cerrada' });
  } catch (err) {
    console.error('[AUTH] logout error:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
};
