// forgot-password.js
document.addEventListener('DOMContentLoaded', () => {

  const forgotForm = document.getElementById('forgotPasswordForm');
  const submitBtn = document.getElementById('submit-btn');
  const feedbackContainer = document.getElementById('feedback-container');

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const email = document.getElementById('email').value;
    const API_URL = 'http://localhost:3000/api/password/forgot';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      // We show the same success message even if the email doesn't exist
      // This is a security best practice.
      displayFeedback(data.message, false);
      forgotForm.style.display = 'none';

      // Add a note about the mock process
      displayFeedback(
        'If this email is registered, a reset link has been printed to your **backend terminal**. Please copy and paste it into your browser.',
        false
      );

    } catch (err) {
      displayFeedback('An error occurred. Please try again.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Reset Link';
    }
  });

  // --- Utility Function: Display Feedback ---
  function displayFeedback(message, isError = true) {
      const p = document.createElement('div');
      p.className = `feedback-message ${isError ? 'error' : ''}`;
      p.innerHTML = message;
      feedbackContainer.appendChild(p);
  }
});
