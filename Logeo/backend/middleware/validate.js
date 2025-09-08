// middleware/validate.js
const makeValidator = (where = 'body') => (schema) => (req, res, next) => {
  try {
    const data = schema.parse(req[where]);   // valida y normaliza
    req[where] = data;
    next();
  } catch (e) {
    return res.status(422).json({ msg: 'Datos inválidos', details: e.errors });
  }
};

module.exports = {
  body: makeValidator('body'),
  query: makeValidator('query'),
  params: makeValidator('params'),
};
