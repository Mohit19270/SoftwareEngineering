// Login.js
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const feedbackContainer = document.getElementById('feedback-container');
    const API_URL = 'http://localhost:3000/api/login'; 

    // Utility to display feedback to the user
    function displayFeedback(message, isError = true) {
        feedbackContainer.innerHTML = '';
        const p = document.createElement('p');
        p.style.color = isError ? '#dc3545' : '#28a745'; // Red for error, Green for success
        p.textContent = message;
        feedbackContainer.appendChild(p);
    }
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = loginForm.querySelector('.login-button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging In...';

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
                // Handle 400 errors (Invalid credentials, etc.)
                throw new Error(data.message || 'Login failed.');
            }

            // SUCCESS: Save user info and redirect
            localStorage.setItem('patientId', data.patientId);
            localStorage.setItem('patientName', data.patientName);
            // localStorage.setItem('token', data.token); // Assuming you use JWT later

            displayFeedback('Login successful! Redirecting to Dashboard...', false);
            setTimeout(() => {
                window.location.href = 'DashBoard.html';
            }, 500);

        } catch (err) {
            // ERROR
            displayFeedback(err.message || 'An unknown error occurred.', true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'LOGIN';
        }
    });
});