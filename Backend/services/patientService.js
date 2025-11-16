// services/patientService.js (Complete & Corrected)
const bcrypt = require('bcryptjs');
const dbPool = require('../config/db'); 

class PatientService {
  constructor(dbPool) {
    this.dbPool = dbPool;
    this.mockOTPs = {}; // In-memory OTP store
  }

  // --- OTP Logic (MOCKED) ---
  sendOTP(phoneNumber) {
    if (!phoneNumber || phoneNumber.length !== 10) {
      throw new Error('A valid 10-digit phone number is required.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.mockOTPs[phoneNumber] = otp;

    console.log(`=================================================`);
    console.log(` MOCK OTP for ${phoneNumber}: ${otp}`);
    console.log(`=================================================`);

    return otp;
  }
  
  // --- Registration Logic ---
  async register({ fullName, email, phoneNumber, dateOfBirth, password }) {
    if (!email || !password || !fullName || !dateOfBirth || !phoneNumber) {
      throw new Error('Essential fields are required.');
    }

    const [existingUser] = await this.dbPool.execute(
      'SELECT email FROM patients WHERE email = ? OR phoneNumber = ?',
      [email.toLowerCase(), phoneNumber]
    );

    if (existingUser.length > 0) {
      throw new Error('A patient with this email or phone number is already registered.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const namePart = fullName.substring(0, 3).toUpperCase();
    const randomDigits = Math.floor(10 + Math.random() * 90);
    const userId = `${namePart}${randomDigits}`.padEnd(5, '0');

    const insertQuery = `
      INSERT INTO patients (id, fullName, email, phoneNumber, dateOfBirth, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.dbPool.execute(insertQuery, [
      userId, fullName, email.toLowerCase(), phoneNumber, dateOfBirth, passwordHash
    ]);

    return { userId, password }; 
  }

  // -------------------------------------------------------------------
  // --- CRITICAL LOGIN FIXES ARE HERE ---
  // -------------------------------------------------------------------
  async login(username, password) {
    if (!username || !password) {
      throw new Error('User ID/Email and Password are required.');
    }

    const [patients] = await this.dbPool.execute(
      'SELECT * FROM patients WHERE email = ? OR id = ?',
      [username.toLowerCase(), username] // Search by email (lowercase) or ID
    );

    const patient = patients[0];
    if (!patient) {
      throw new Error('Invalid username or password.');
    }

    const isMatch = await bcrypt.compare(password, patient.password_hash);
    if (!isMatch) {
      // FIX 1: Ensure 'new Error' is capitalized. This was the likely original typo.
      throw new Error('Invalid username or password.'); 
    }

    // FIX 2: Ensure we return the patientName.
    return {
      message: 'Login successful.',
      token: 'MOCK_JWT_TOKEN',
      patientId: patient.id,
      patientName: patient.fullName
    };
  }
}

const patientServiceInstance = new PatientService(dbPool); 
module.exports = patientServiceInstance;
