// services/doctorService.js
const dbPool = require('../config/db'); // Path to your db.js
const bcrypt = require('bcryptjs');

class DoctorService {
  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  // --- Doctor Registration ---
  async register(doctorData) {
    const { name, email, department, phone_number, password } = doctorData;
    
    // 1. Basic validation
    if (!name || !email || !department || !phone_number || !password) {
      throw new Error('All fields are required for doctor registration.');
    }

    // 2. Check if email already exists
    const [existingDoctors] = await this.dbPool.execute(
      'SELECT doctor_id FROM doctors WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingDoctors.length > 0) {
      throw new Error('A doctor with this email is already registered.');
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // 4. Insert data into the 'doctors' table
    const insertQuery = `
      INSERT INTO doctors (name, email, department, phone_number, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await this.dbPool.execute(insertQuery, [
        name,
        email.toLowerCase(),
        department,
        phone_number,
        passwordHash
      ]);

      // Assuming the doctors table has an auto-increment primary key 'doctor_id'
      return { 
        message: 'Doctor registration successful!', 
        doctorId: result.insertId 
      };

    } catch (error) {
        console.error('Database error during doctor registration:', error);
        throw new Error('Could not register doctor due to a database error.');
    }
  }
}

const doctorServiceInstance = new DoctorService(dbPool); 

module.exports = doctorServiceInstance;