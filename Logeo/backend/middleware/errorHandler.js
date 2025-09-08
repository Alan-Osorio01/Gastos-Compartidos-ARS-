// backend/middleware/errorHandler.js
const { ZodError } = require('zod');

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Default
  let status = err.status || err.statusCode || 500;
  let body = { msg: 'Error interno' };

  // JSON mal formado (express.json)
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    status = 400;
    body = { msg: 'JSON inválido' };
  }

  // Mongoose: ID inválido
  if (err.name === 'CastError') {
    status = 400;
    body = { msg: 'ID inválido' };
  }

  // Mongoose: validación de schema
  if (err.name === 'ValidationError') {
    status = 422;
    body = {
      msg: 'Datos inválidos',
      details: Object.entries(err.errors).map(([k, v]) => ({ path: k, message: v.message }))
    };
  }

  // Mongo: clave duplicada
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    const value = err.keyValue ? err.keyValue[field] : undefined;
    body = { msg: 'Duplicado', field, value };
  }

  // JWT
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    body = { msg: 'Token inválido' };
  }
  if (err.name === 'TokenExpiredError') {
    status = 401;
    body = { msg: 'Token expirado' };
  }

  // Zod
  if (err instanceof ZodError) {
    status = 422;
    body = { msg: 'Datos inválidos', details: err.errors };
  }

  // En dev muestra más contexto
  if (process.env.NODE_ENV !== 'production') {
    body.msg = body.msg === 'Error interno' ? (err.message || body.msg) : body.msg;
    body.stack = err.stack;
  }

  return res.status(status).json(body);
};
