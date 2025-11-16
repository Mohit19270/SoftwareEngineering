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

// ----------------------------------------------------------------
// 🏥 CRITICAL FIX: PATIENT DASHBOARD (My Appointments) ROUTE
// This route fetches the appointments for the logged-in patient.
// ----------------------------------------------------------------
router.get('/appointments/:patientId', bookingController.getPatientAppointments); 


// ----------------------------------------------------------------
// 👨‍⚕️ DOCTOR DASHBOARD ROUTES
// ----------------------------------------------------------------
// GET /api/booking/doctor-appointments/:doctorId
router.get('/doctor-appointments/:doctorId', bookingController.getDoctorAppointments);

// PUT /api/booking/appointments/complete/:id
router.put('/appointments/complete/:id', bookingController.completeAppointment); 

module.exports = router;
