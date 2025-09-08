// middleware/auth.js
const jwt = require('jsonwebtoken');

let Blacklist;
try { Blacklist = require('../models/Blacklist'); } catch (_) {}

module.exports = async function (req, res, next) {
  const bearer = req.header('Authorization') || '';
  const tokenFromAuth = typeof bearer === 'string' && bearer.startsWith('Bearer ')
    ? bearer.slice(7)
    : null;
  const token = req.header('x-auth-token') || tokenFromAuth;

  if (!token) return res.status(401).json({ msg: 'No autenticado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (Blacklist) {
      const revoked = await Blacklist.exists({ token });
      if (revoked) return res.status(401).json({ msg: 'Token revocado' });
    }

    // sin role
    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch (e) {
    console.error('Error del token:', e.message);
    return res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};
