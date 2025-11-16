// controllers/patientController.js
const patientService = require('../services/patientService');

// Controller for /api/send-otp
const sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const otp = await patientService.sendOTP(phoneNumber);
    
    // NOTE: Sending the OTP back in the response is a security risk.
    // It is only done here because your original frontend (Script1.js) expects it.
    // In production, the response should just be:
    // res.status(200).json({ message: 'OTP sent successfully!' });
    res.status(200).json({ message: 'OTP sent successfully!', mockOtp: otp });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller for /api/register
const registerPatient = async (req, res) => {
  try {
    const userData = req.body;
    const result = await patientService.register(userData);
    res.status(201).json({
      message: 'Registration successful!',
      userId: result.userId,
      password: result.password
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller for /api/login
const loginPatient = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await patientService.login(username, password);
    res.status(200).json(result);
  } catch (err) {
    // 401 Unauthorized is more appropriate for login failure
    res.status(401).json({ message: err.message }); 
  }
};

module.exports = {
  sendOTP,
  registerPatient,
  loginPatient
};
