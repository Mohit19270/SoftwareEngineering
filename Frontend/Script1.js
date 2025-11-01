/* * Script1.js - Full Registration Logic with Mobile OTP */

document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const sendOtpButton = document.getElementById('send-otp-btn');
    const newPasswordInput = document.getElementById('newpassword');
    const confirmPasswordInput = document.getElementById('password'); 
    const phoneInput = document.getElementById('phone');
    const otpInput = document.getElementById('otp');
    const registerButton = document.querySelector('button[type="submit"]');
    const feedbackContainer = document.getElementById('feedback-container');

    const SEND_OTP_API_URL = 'http://localhost:3000/api/send-otp';
    const REGISTRATION_API_URL = 'http://localhost:3000/api/register'; 
    const LOGIN_PAGE_URL = 'Login.html';
    
    let mockOtp = ''; // This will store the OTP from the server

    // --- Utility Function: Display Feedback ---
    function displayFeedback(message, isError = true) {
        feedbackContainer.innerHTML = ''; // Clear previous messages

        const p = document.createElement('div');
        p.classList.add('feedback-message');
        if (isError) {
            p.classList.add('error');
        }
        p.innerHTML = message;
        
        feedbackContainer.appendChild(p);
    }

    // --- 1. Send OTP Button Click ---
    sendOtpButton.addEventListener('click', async function() {
        const phoneNumber = phoneInput.value.trim();
        
        if (phoneNumber.length !== 10) {
            displayFeedback('Please enter a valid 10-digit phone number.', true);
            return;
        }

        sendOtpButton.disabled = true;
        sendOtpButton.textContent = 'Sending...';

        try {
            const response = await fetch(SEND_OTP_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber })
            });

            const data = await response.json();

            if (response.ok) {
                displayFeedback('OTP sent to your mobile. Please check your messages.', false);
                mockOtp = data.mockOtp; // Store the OTP
                otpInput.focus();
            } else {
                displayFeedback(`Error: ${data.message}`, true);
            }

        } catch (error) {
            displayFeedback('Connection error. Could not send OTP.', true);
        } finally {
            sendOtpButton.disabled = false;
            sendOtpButton.textContent = 'Send OTP';
        }
    });

    // --- 2. Registration Form Submit ---
    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        // --- Validations ---
        if (newPasswordInput.value !== confirmPasswordInput.value) {
            displayFeedback('Passwords do not match.', true);
            return;
        }

        if (otpInput.value.trim() !== mockOtp) {
            displayFeedback('Invalid or incorrect OTP.', true);
            return;
        }

        if (mockOtp === '') {
            displayFeedback('Please request and verify an OTP first.', true);
            return;
        }

        // --- All checks passed, proceed to register ---
        registerButton.disabled = true;
        registerButton.textContent = 'Registering...';

        const formData = {
            fullName: document.getElementById('fullname').value.trim(),
            email: document.getElementById('email').value.trim(),
            phoneNumber: phoneInput.value.trim(),
            dateOfBirth: document.getElementById('dob').value.trim(), 
            password: newPasswordInput.value // Send the plain password
        };

        try {
            const response = await fetch(REGISTRATION_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && response.status === 201) {
                
                const successMessage = `
                    <p style="font-size: 1.4em; color: #28a745; margin-bottom: 10px;">✅ REGISTRATION COMPLETE!</p>
                    <p>Your User ID: <strong style="color: #007BFF;">${data.userId}</strong></p>
                    <p>Your Password: <strong style="color: #007BFF;">${data.password}</strong></p>
                    <p>Please save these details securely.</p>
                    <a href="${LOGIN_PAGE_URL}" class="login-button">GO TO LOGIN PAGE</a>
                `;

                displayFeedback(successMessage, false);
                registrationForm.style.display = 'none'; // Hide form on success
                
            } else {
                displayFeedback(`Registration Failed: ${data.message || 'Server error occurred.'}`, true);
            }

        } catch (error) {
            displayFeedback('A connection error occurred. Check your Node.js server terminal.', true);
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = 'REGISTER';
        }
    });
});