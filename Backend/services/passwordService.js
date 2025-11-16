// services/passwordService.js
const dbPool = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Built-in Node.js module

class PasswordService {
  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  // --- 1. Forgot Password (Create Token) ---
  async createResetToken(email) {
    if (!email) {
      throw new Error('Email is required.');
    }

    // 1. Check if user exists
    const [existingUser] = await this.dbPool.execute(
      'SELECT email FROM patients WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUser.length === 0) {
      // For security, don't tell the user if the email exists.
      // We just won't send an email.
      return null; 
    }

    // 2. Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');

    // 3. Set expiry time (e.g., 1 hour from now)
    const expires_at = new Date(Date.now() + 3600000); // 1 hour

    // 4. Store the token (hashed or plain, for this demo we store it plain)
    // In a high-security app, you'd hash this token too.
    const insertQuery = `
      INSERT INTO password_resets (email, token, expires_at)
      VALUES (?, ?, ?)
    `;
    await this.dbPool.execute(insertQuery, [email, token, expires_at]);

    return token;
  }

  // --- 2. Validate Token ---
  async validateResetToken(token) {
    if (!token) {
      throw new Error('Token is missing.');
    }

    const [results] = await this.dbPool.execute(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (results.length === 0) {
      throw new Error('Token is invalid or has expired.');
    }

    return { message: 'Token is valid.' };
  }

  // --- 3. Reset Password (Update DB) ---
  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      throw new Error('Token and new password are required.');
    }

    // 1. Find the token and make sure it's valid
    const [results] = await this.dbPool.execute(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (results.length === 0) {
      throw new Error('Token is invalid or has expired.');
    }

    const email = results[0].email;

    // 2. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // 3. Update the user's password in the 'patients' table
    await this.dbPool.execute(
      'UPDATE patients SET password_hash = ? WHERE email = ?',
      [passwordHash, email]
    );

    // 4. Invalidate the token by deleting it
    await this.dbPool.execute(
      'DELETE FROM password_resets WHERE token = ?',
      [token]
    );

    return { message: 'Password has been reset successfully.' };
  }
}

const passwordServiceInstance = new PasswordService(dbPool);
module.exports = passwordServiceInstance;
