// controllers/doctorController.js
const doctorService = require('../services/doctorService');

// POST /api/doctor/register
const registerDoctor = async (req, res) => {
  try {
    const doctorData = req.body;
    const result = await doctorService.register(doctorData);
    
    res.status(201).json({
      message: result.message,
      doctorId: result.doctorId
    });
  } catch (err) {
    // 400 for client-side errors (validation, existing email)
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  registerDoctor
};
