// login.js (Complete & Corrected)
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('login-btn');
  const feedbackContainer = document.getElementById('feedback-container');

  const API_URL = 'http://localhost:3000/api/login'; 

  // --- Utility Function: Display Feedback ---
  function displayFeedback(message, isError = true) {
      feedbackContainer.innerHTML = '';
      const p = document.createElement('div');
      p.className = `feedback-message ${isError ? 'error' : 'success'}`;
      p.style.color = isError ? 'red' : 'green';
      p.style.padding = '10px';
      p.style.border = `1px solid ${isError ? 'red' : 'green'}`;
      p.style.borderRadius = '5px';
      p.innerHTML = message;
      feedbackContainer.appendChild(p);
  }

  // --- Form Submission Handler ---
  loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      loginBtn.disabled = true;
      loginBtn.textContent = 'Logging in...';
      
      // Ensure these IDs match your Login.html inputs
      const username = document.getElementById('username').value; 
      const password = document.getElementById('password').value; 

      try {
          const response = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
          });

          const data = await response.json();

          if (!response.ok) {
              // This handles errors from the server (e.g., Invalid username/password)
              throw new Error(data.message || 'Login failed.');
          }

          // CRITICAL: Save patient data upon successful login
          localStorage.setItem('patientId', data.patientId);
          localStorage.setItem('patientName', data.patientName);
          
          displayFeedback('Login successful! Redirecting to dashboard...', false);
          
          // Redirect to patient dashboard
          setTimeout(() => {
              window.location.href = 'DashBoard.html';
          }, 1500);

      } catch (err) {
          // ERROR
          displayFeedback(err.message || 'An unknown error occurred.', true);
      } finally {
          loginBtn.disabled = false;
          loginBtn.textContent = 'LOG IN';
      }
  });
});
