// services/patientService.js
const bcrypt = require('bcryptjs');
const dbPool = require('../config/db'); // Import the DB pool

// --- All Twilio and Msg91 code has been removed ---

class PatientService {
  constructor(dbPool) {
    this.dbPool = dbPool;
    this.mockOTPs = {}; // In-memory OTP store
  }

  // --- OTP Logic (MOCKED) ---
  // This is no longer an 'async' function
  sendOTP(phoneNumber) {
    if (!phoneNumber || phoneNumber.length !== 10) {
      throw new Error('A valid 10-digit phone number is required.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.mockOTPs[phoneNumber] = otp;

    // --- THIS IS THE MOST IMPORTANT PART ---
    // It prints the OTP to your terminal so you can use it
    console.log(`=================================================`);
    console.log(` MOCK OTP for ${phoneNumber}: ${otp}`);
    console.log(`=================================================`);
    // --- No API call is made ---

    return otp;
  }
  
  // ... (rest of the file is unchanged) ...

  // --- Registration Logic (NO CHANGES) ---
  async register({ fullName, email, phoneNumber, dateOfBirth, password }) {
    if (!email || !password || !fullName || !dateOfBirth || !phoneNumber) {
      throw new Error('Essential fields are required.');
    }

    // 1. Check if user exists
    const [existingUser] = await this.dbPool.execute(
      'SELECT email FROM patients WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUser.length > 0) {
      throw new Error('This email is already registered.');
    }

    // 2. Hash password & generate ID
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const namePart = fullName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const randomDigits = Math.floor(10 + Math.random() * 90);
    const userId = `${namePart}${randomDigits}`;

    // 3. Insert record
    const insertQuery = `
      INSERT INTO patients (id, fullName, email, phoneNumber, dateOfBirth, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.dbPool.execute(insertQuery, [
      userId, fullName, email.toLowerCase(), phoneNumber, dateOfBirth, passwordHash
    ]);

    // Your frontend expects the plain password back to display it.
    return { userId, password }; 
  }

  // --- Login Logic (NO CHANGES) ---
  // --- Login Logic (MODIFIED) ---
  async login(username, password) {
    if (!username || !password) {
      throw new Error('User ID/Email and Password are required.');
    }

    const [patients] = await this.dbPool.execute(
      'SELECT * FROM patients WHERE email = ? OR id = ?',
      [username.toLowerCase(), username.toLowerCase()]
    );

    const patient = patients[0];
    if (!patient) {
      throw new Error('Invalid username or password.');
    }

    const isMatch = await bcrypt.compare(password, patient.password_hash);
    if (!isMatch) {
      throw newError('Invalid username or password.');
    }

    return {
      message: 'Login successful.',
      token: 'MOCK_JWT_TOKEN',
      patientId: patient.id,
      patientName: patient.fullName // <-- ADD THIS LINE
    };
  }
}


// Create and export a single instance of the service
const patientServiceInstance = new PatientService(dbPool);
module.exports = patientServiceInstance;