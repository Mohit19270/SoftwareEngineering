// controllers/passwordController.js
const passwordService = require('../services/passwordService');

// POST /api/password/forgot
const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const token = await passwordService.createResetToken(email);

    if (token) {
      // --- MOCKING THE EMAIL ---
      // In a real app, you'd email this link.
      // We will log it to the backend terminal for development.
      const resetLink = `http://127.0.0.1:5500/ResetPassword.html?token=${token}`;
      
      console.log(`=================================================`);
      console.log(` MOCK PASSWORD RESET LINK (Copy to browser)`);
      console.log(resetLink);
      console.log(`=================================================`);
    }

    // Always send a generic success message for security
    res.status(200).json({ 
      message: 'If your email is registered, you will receive a password reset link.' 
    });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// GET /api/password/validate
const handleValidateToken = async (req, res) => {
  try {
    const { token } = req.query;
    await passwordService.validateResetToken(token);
    res.status(200).json({ message: 'Token is valid.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/password/reset
const handleResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await passwordService.resetPassword(token, newPassword);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  handleForgotPassword,
  handleValidateToken,
  handleResetPassword
};
