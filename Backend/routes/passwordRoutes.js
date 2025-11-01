// routes/passwordRoutes.js
const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

// POST /api/password/forgot
router.post('/forgot', passwordController.handleForgotPassword);

// GET /api/password/validate?token=...
router.get('/validate', passwordController.handleValidateToken);

// POST /api/password/reset
router.post('/reset', passwordController.handleResetPassword);

module.exports = router;