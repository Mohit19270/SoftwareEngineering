// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET /api/booking/doctors
router.get('/doctors', bookingController.getDoctors);

// GET /api/booking/slots
router.get('/slots', bookingController.getSlots);

// POST /api/booking/appointments
router.post('/appointments', bookingController.bookSlot);

module.exports = router;