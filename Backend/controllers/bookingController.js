// controllers/bookingController.js
const bookingService = require('../services/bookingService');

// Controller for /api/booking/doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await bookingService.getAllDoctors();
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors.' });
  }
};

// Controller for /api/booking/slots
const getSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query; // e.g., ?doctorId=1&date=2025-10-27
    const slots = await bookingService.getAvailableSlots(doctorId, date);
    res.status(200).json(slots);
  } catch (err) {
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
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getDoctors,
  getSlots,
  bookSlot
};