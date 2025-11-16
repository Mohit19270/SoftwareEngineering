// middleware/cors.js
module.exports = (req, res, next) => {
  // 1. Allow all origins (for development)
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  
  // 2. Allow all methods used in your app (GET, POST, PUT)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
  
  // 3. Allow necessary headers
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 4. Handle preflight requests (The most critical part for POST/PUT)
  // The browser sends OPTIONS first. If we hit this, we send a 200 response and stop.
  if (req.method === 'OPTIONS') {
    // This tells the browser which headers/methods are allowed
    return res.sendStatus(200); 
  }

  next();
};
