// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Route for sending OTP
router.post('/send-otp', patientController.sendOTP);

// Route for registering a new patient
router.post('/register', patientController.registerPatient);

// Route for patient login
router.post('/login', patientController.loginPatient);

module.exports = router;