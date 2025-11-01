// services/bookingService.js
const dbPool = require('../config/db');

// Define the "business hours" or all possible slots
// This makes the logic much simpler
const ALL_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

class BookingService {
  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  // --- Get All Doctors ---
  async getAllDoctors() {
    const [doctors] = await this.dbPool.execute(
      'SELECT * FROM doctors ORDER BY department, name'
    );
    return doctors;
  }

  // --- Get Available Slots ---
  async getAvailableSlots(doctorId, date) {
    if (!doctorId || !date) {
      throw new Error('Doctor ID and date are required.');
    }

    // 1. Get all slots that are *already booked*
    const [bookedSlotsResult] = await this.dbPool.execute(
      'SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ?',
      [doctorId, date]
    );
    
    const bookedTimes = bookedSlotsResult.map(slot => slot.appointment_time);

    // 2. Filter the full list of slots to find the available ones
    const availableSlots = ALL_SLOTS.filter(slot => !bookedTimes.includes(slot));
    
    return availableSlots;
  }

  // --- Create an Appointment ---
  async createAppointment({ patientId, doctorId, date, time }) {
    if (!patientId || !doctorId || !date || !time) {
      throw new Error('Patient ID, Doctor ID, date, and time are required.');
    }

    // Check if the slot is still available (prevent race conditions)
    try {
      const insertQuery = `
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time)
        VALUES (?, ?, ?, ?)
      `;
      await this.dbPool.execute(insertQuery, [patientId, doctorId, date, time]);
      
      return { message: 'Appointment booked successfully!' };

    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('This slot has just been booked. Please select another time.');
      }
      // Re-throw other errors
      throw err;
    }
  }
}

const bookingServiceInstance = new BookingService(dbPool);
module.exports = bookingServiceInstance;