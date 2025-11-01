// server.js
require('dotenv').config(); 

const express = require('express');
const bodyParser = require('body-parser');
const dbPool = require('./config/db');
const corsMiddleware = require('./middleware/cors');

const patientRoutes = require('./routes/patientRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const passwordRoutes = require('./routes/passwordRoutes'); // <-- NEW

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(corsMiddleware);    
app.use(bodyParser.json()); 

// --- Routes ---
app.use('/api', patientRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/password', passwordRoutes); // <-- NEW

// --- Start Server ---
const startServer = async () => {
  // ... (rest of the file is unchanged) ...
  // ...
  
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  // ...
};

startServer();