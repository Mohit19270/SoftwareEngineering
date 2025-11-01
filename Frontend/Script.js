/* * script.js - JavaScript Logic for Login */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const LOGIN_API_URL = 'http://localhost:3000/api/login';
    const SUCCESS_REDIRECT_URL = 'DashBoard.html'; // Corrected filename
    
    function displayFeedback(message, isError = true) {
        const container = loginForm.parentElement;
        let feedbackElement = container.querySelector('.feedback-message');
        if (feedbackElement) feedbackElement.remove();

        const p = document.createElement('p');
        p.classList.add('feedback-message');
        p.textContent = message;
        p.style.fontWeight = 'bold';
        p.style.marginTop = '15px';
        p.style.padding = '10px';
        p.style.borderRadius = '5px';
        p.style.textAlign = 'center';

        if (isError) {
            p.style.color = 'white';
            p.style.backgroundColor = '#dc3545';
        } else {
            p.style.color = '#155724'; 
            p.style.backgroundColor = '#d4edda';
        }

        loginForm.insertAdjacentElement('afterend', p);
    }

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        const formButton = loginForm.querySelector('.login-button');
        formButton.disabled = true;
        formButton.textContent = 'Authenticating...';

        const formData = {
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value
        };
        
        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // --- THIS IS THE NEW CODE YOU ARE MISSING ---
                // Store user info in localStorage for other pages to use
                localStorage.setItem('patientId', data.patientId);
                localStorage.setItem('patientName', data.patientName);
                // --- END OF NEW CODE ---

                displayFeedback('Login successful! Redirecting to Dashboard...', false);
                
                // Redirect logic
                setTimeout(() => {
                    window.location.href = SUCCESS_REDIRECT_URL; 
                }, 1000); 

            } else {
                displayFeedback(data.message || 'Invalid username or password. Please try again.', true);
            }

        } catch (error) {
            displayFeedback('A connection error occurred. Please try again later.', true); 
        } finally {
            formButton.disabled = false;
            formButton.textContent = 'LOGIN';
        }
    });
});