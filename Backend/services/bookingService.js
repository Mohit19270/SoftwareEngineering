// services/bookingService.js
const dbPool = require('../config/db');
const { log } = require('console');

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

  // --- 1. Get All Doctors ---
  async getAllDoctors() {
    const [doctors] = await this.dbPool.execute(
      'SELECT * FROM doctors ORDER BY department, name'
    );
    return doctors;
  }

  // --- 2. Get Available Slots ---
  async getAvailableSlots(doctorId, date) {
    if (!doctorId || !date) {
      throw new Error('Doctor ID and date are required.');
    }

    // 1. Get all slots that are *already booked* for the specific doctor and date
    const [bookedSlotsResult] = await this.dbPool.execute(
      'SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status = "Booked"',
      [doctorId, date]
    );
    
    const bookedTimes = bookedSlotsResult.map(slot => slot.appointment_time);

    // 2. Filter the full list of slots to find the available ones
    const availableSlots = ALL_SLOTS.filter(slot => !bookedTimes.includes(slot));
    
    return availableSlots;
  }

  // --- 3. Create an Appointment ---
  async createAppointment({ patientId, doctorId, date, time }) {
    if (!patientId || !doctorId || !date || !time) {
      throw new Error('Patient ID, Doctor ID, date, and time are required.');
    }

    // Check if the slot is still available (prevent race conditions)
    try {
      const insertQuery = `
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
        VALUES (?, ?, ?, ?, 'Booked')
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
  
  // ------------------------------------------------------------------
  // 🧑‍💻 NEW: Patient Dashboard Function
  // ------------------------------------------------------------------
  async getPatientAppointments(patientId) {
    if (!patientId) {
      throw new Error('Patient ID is required.');
    }

    const query = `
      SELECT 
        a.id AS appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        d.name AS doctor_name,
        d.department 
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time ASC
    `;
    
    const [appointments] = await this.dbPool.execute(query, [patientId]);
    return appointments;
  }
  
  // ------------------------------------------------------------------
  // 👨‍⚕️ NEW: Doctor Dashboard Functions
  // ------------------------------------------------------------------
  
  // Get all appointments for a specific doctor
  async getDoctorAppointments(doctorId) {
    if (!doctorId) {
      throw new Error('Doctor ID is required.');
    }

    const query = `
      SELECT 
        a.id AS appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        p.fullName AS patient_name,
        p.phoneNumber 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `;
    
    const [appointments] = await this.dbPool.execute(query, [doctorId]);
    return appointments;
  }
  
  // Mark an appointment as completed
  async completeAppointment(appointmentId) {
    if (!appointmentId) {
      throw new Error('Appointment ID is required.');
    }
    
    const updateQuery = `
      UPDATE appointments
      SET status = 'Completed'
      WHERE id = ? AND status = 'Booked'
    `;

    const [result] = await this.dbPool.execute(updateQuery, [appointmentId]);
    
    if (result.affectedRows === 0) {
      // Check if the appointment exists at all (if result.insertId is 0, it means the ID was not found)
      const [check] = await this.dbPool.execute('SELECT id FROM appointments WHERE id = ?', [appointmentId]);
      if (check.length === 0) {
         throw new Error('Appointment not found.');
      }
      // If found but affectedRows is 0, it means it's already 'Completed' or another status
      throw new Error('Appointment status is not "Booked" or it has already been completed.');
    }

    return { message: 'Appointment successfully marked as Completed.' };
  }
}


// Create and export a single instance of the service
const bookingServiceInstance = new BookingService(dbPool); 

module.exports = bookingServiceInstance;
