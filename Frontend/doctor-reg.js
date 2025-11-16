// doctor-reg.js
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('doctorRegistrationForm');
    const registerBtn = document.getElementById('register-btn');
    const feedbackContainer = document.getElementById('feedback-container');

    const API_URL = 'http://localhost:3000/api/doctor/register'; 

    // --- Utility Function: Display Feedback ---
    function displayFeedback(message, isError = true) {
        feedbackContainer.innerHTML = ''; 
        const p = document.createElement('div');
        // Uses the styling from Reg-style.css
        p.className = `feedback-message ${isError ? 'error' : ''}`;
        p.innerHTML = message;
        feedbackContainer.appendChild(p);
    }

    // --- Form Submission Handler ---
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        registerBtn.disabled = true;
        registerBtn.textContent = 'Registering...';
        
        // Collect all form data
        const formData = new FormData(registrationForm);
        const doctorData = {};
        for (let [key, value] of formData.entries()) {
            doctorData[key] = value;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(doctorData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed.');
            }

            // SUCCESS
            displayFeedback(`Registration successful! Your Doctor ID is: ${data.doctorId}. Redirecting to login...`, false);
            registrationForm.style.display = 'none';
            
            // Redirect to login page after a delay
            setTimeout(() => {
                window.location.href = 'Login.html';
            }, 3000);

        } catch (err) {
            // ERROR
            displayFeedback(err.message, true);
        } finally {
            registerBtn.disabled = false;
            registerBtn.textContent = 'REGISTER DOCTOR';
        }
    });
});
