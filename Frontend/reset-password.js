// reset-password.js
document.addEventListener('DOMContentLoaded', () => {

  const resetForm = document.getElementById('resetPasswordForm');
  const submitBtn = document.getElementById('submit-btn');
  const feedbackContainer = document.getElementById('feedback-container');
  const loginLinkContainer = document.getElementById('login-link-container');

  const VALIDATE_URL = 'http://localhost:3000/api/password/validate';
  const RESET_URL = 'http://localhost:3000/api/password/reset';

  // 1. Get the token from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // 2. Validate the token on page load
  async function validateToken() {
    if (!token) {
      displayFeedback('Invalid or missing reset token.', true);
      return;
    }

    try {
      const response = await fetch(`${VALIDATE_URL}?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // If token is valid, show the form
      displayFeedback('Token validated. Please enter your new password.', false);
      resetForm.style.display = 'flex';

    } catch (err) {
      displayFeedback(`Error: ${err.message}. This link may be invalid or expired.`, true);
      showLoginLink();
    }
  }

  // 3. Handle the form submission
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('newpassword').value;
    const confirmPassword = document.getElementById('password').value;

    if (newPassword !== confirmPassword) {
      displayFeedback('Passwords do not match.', true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';

    try {
      const response = await fetch(RESET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Success!
      displayFeedback(data.message, false);
      resetForm.style.display = 'none';
      showLoginLink();

    } catch (err) {
      displayFeedback(`Error: ${err.message}`, true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Set New Password';
    }
  });

  // --- Utility Functions ---
  function displayFeedback(message, isError = true) {
      feedbackContainer.innerHTML = ''; // Clear old messages
      const p = document.createElement('div');
      p.className = `feedback-message ${isError ? 'error' : ''}`;
      p.innerHTML = message;
      feedbackContainer.appendChild(p);
  }

  function showLoginLink() {
    loginLinkContainer.innerHTML = '<a href="Login.html" class="login-button">Back to Login</a>';
  }
  
  // --- Run validation on page load ---
  validateToken();
});