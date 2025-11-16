// controllers/bookingController.js
const bookingService = require('../services/bookingService');

// --- Existing Controllers ---

// Controller for /api/booking/doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await bookingService.getAllDoctors();
    res.status(200).json(doctors);
  } catch (err) {
    // Standard server error handling for fetching data
    res.status(500).json({ message: 'Error fetching doctors.' });
  }
};

// Controller for /api/booking/slots
const getSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query; 
    const slots = await bookingService.getAvailableSlots(doctorId, date);
    res.status(200).json(slots);
  } catch (err) {
    // 400 for client-side errors (missing doctorId/date)
    res.status(400).json({ message: err.message });
  }
};

// Controller for /api/booking/appointments
const bookSlot = async (req, res) => {
  try {
    // patientId, doctorId, date, time
    const bookingData = req.body; 
    const result = await bookingService.createAppointment(bookingData);
    res.status(201).json(result);
  } catch (err) {
    // 400 for client-side errors (validation, slot taken)
    res.status(400).json({ message: err.message });
  }
};

// --- NEW Controller for Patient Dashboard (REQUIRED FOR "MY APPOINTMENTS") ---

// Controller for GET /api/booking/appointments/:patientId
const getPatientAppointments = async (req, res) => {
    try {
        // The patient ID is passed as a route parameter, e.g., /appointments/P123
        const { patientId } = req.params; 
        const appointments = await bookingService.getPatientAppointments(patientId);
        res.status(200).json(appointments);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// --- NEW Controllers for Doctor Dashboard ---

// Controller for GET /api/booking/doctor-appointments/:doctorId
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await bookingService.getDoctorAppointments(doctorId);
        res.status(200).json(appointments);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Controller for PUT /api/booking/appointments/complete/:id
const completeAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await bookingService.completeAppointment(id);
        res.status(200).json(result);
    } catch (err) {
        // 400 for specific service errors like 'not found' or 'already completed'
        res.status(400).json({ message: err.message });
    }
};


module.exports = {
  getDoctors,
  getSlots,
  bookSlot,
  // Ensure the new patient controller is exported
  getPatientAppointments, 
  // Export the doctor controllers
  getDoctorAppointments,
  completeAppointment
};
