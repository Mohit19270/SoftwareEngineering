// doctor-dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const appointmentsList = document.getElementById('appointments-list');
    const feedbackContainer = document.getElementById('feedback-container');
    const welcomeDoctor = document.getElementById('welcome-doctor');

    // NOTE: In a real app, a Doctor login would set a doctorId in localStorage.
    // We are mocking this for simplicity. You must log in a doctor first.
    const doctorId = localStorage.getItem('doctorId');
    const API_URL = 'http://localhost:3000/api/booking';

    if (!doctorId) {
        displayFeedback('You are not logged in as a Doctor. Redirecting...', true);
        setTimeout(() => {
            window.location.href = 'Login.html';
        }, 2000);
        return;
    }
    
    // Check for doctor name (if stored during doctor login)
    const doctorName = localStorage.getItem('doctorName') || 'Doctor';
    welcomeDoctor.textContent = `Welcome, Dr. ${doctorName}!`;

    // --- Utility Function ---
    function displayFeedback(message, isError = true) {
        const p = document.createElement('div');
        p.className = `feedback-message ${isError ? 'status-cancelled' : 'status-completed'}`;
        p.style.padding = '10px';
        p.style.marginTop = '10px';
        p.innerHTML = message;
        feedbackContainer.appendChild(p);
    }

    // --- 1. Fetch Appointments ---
    async function fetchAppointments() {
        appointmentsList.innerHTML = '<li>Fetching appointments...</li>';
        feedbackContainer.innerHTML = '';
        try {
            const response = await fetch(`${API_URL}/doctor-appointments/${doctorId}`);
            if (!response.ok) throw new Error('Failed to fetch appointments.');
            
            const appointments = await response.json();
            renderAppointments(appointments);

        } catch (err) {
            appointmentsList.innerHTML = `<li>Error: ${err.message}</li>`;
            displayFeedback(`Failed to load appointments. Check if Doctor ID ${doctorId} is valid.`, true);
        }
    }

    // --- 2. Render Appointments ---
    function renderAppointments(appointments) {
        appointmentsList.innerHTML = '';
        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<li>You have no scheduled appointments.</li>';
            return;
        }

        appointments.forEach(app => {
            const li = document.createElement('li');
            li.className = 'appointment-item';
            
            const statusClass = `status-${app.status.toLowerCase()}`;
            const isBooked = app.status === 'Booked';

            li.innerHTML = `
                <div class="appointment-info">
                    <h4>${app.appointment_date} @ ${app.appointment_time}</h4>
                    <p>Patient: ${app.patient_name}</p>
                    <p>Contact: ${app.patient_phone}</p>
                    <p>Status: <span class="${statusClass}">${app.status}</span></p>
                </div>
                <div class="appointment-actions">
                    ${isBooked ? `<button class="btn-complete" data-id="${app.appointment_id}">Complete</button>` : ''}
                </div>
            `;
            appointmentsList.appendChild(li);
        });

        // Add event listeners to the new 'Complete' buttons
        appointmentsList.querySelectorAll('.btn-complete').forEach(button => {
            button.addEventListener('click', handleCompleteClick);
        });
    }

    // --- 3. Handle Complete Button Click (The Core Action) ---
    async function handleCompleteClick(event) {
        const button = event.target;
        const appointmentId = button.dataset.id;
        
        button.disabled = true;
        button.textContent = 'Updating...';

        try {
            const response = await fetch(`${API_URL}/appointments/complete/${appointmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to complete appointment.');
            }

            displayFeedback(`Appointment #${appointmentId} marked as COMPLETED!`, false);
            // Refresh the list to show the new status
            fetchAppointments(); 

        } catch (err) {
            displayFeedback(err.message, true);
            button.disabled = false;
            button.textContent = 'Complete';
        }
    }

    // --- 4. Handle Logout ---
    const handleLogout = () => {
        localStorage.removeItem('doctorId');
        localStorage.removeItem('doctorName');
        window.location.href = 'Login.html';
    };
    document.querySelector('.logout-btn').addEventListener('click', handleLogout);

    // Initial load
    fetchAppointments();
});
