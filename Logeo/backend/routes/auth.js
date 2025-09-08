const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../middleware/validators');
const auth = require('../middleware/auth');

router.post('/login',    validate.body(loginSchema),    authController.login);
router.post('/register', validate.body(registerSchema), authController.register);
router.get('/me', auth, authController.me);
router.post('/logout', auth, authController.logout);

module.exports = router;
