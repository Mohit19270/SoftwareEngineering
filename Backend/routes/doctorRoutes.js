// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Route for registering a new doctor
// POST /api/doctor/register
router.post('/register', doctorController.registerDoctor);

module.exports = router;
