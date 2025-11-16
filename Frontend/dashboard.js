// dashboard.js (Updated - includes Download Slip feature)
document.addEventListener('DOMContentLoaded', () => {
    const appointmentsList = document.getElementById('appointments-list');
    const welcomeMessage = document.getElementById('welcome-message');
    const bannerWelcome = document.getElementById('banner-welcome');

    // 1. Authentication Check
    const patientId = localStorage.getItem('patientId');
    const patientName = localStorage.getItem('patientName');
    const API_URL = 'http://localhost:3000/api/booking'; 

    if (!patientId) {
        // Redirect to Login if patientId is missing
        console.log('You are not logged in. Redirecting...');
        window.location.href = 'Login.html';
        return;
    }
    
    // Update welcome messages if logged in
    if (patientName) {
        const firstName = patientName.split(' ')[0];
        welcomeMessage.textContent = `Welcome, ${firstName}!`;
        bannerWelcome.textContent = `Good Afternoon, ${patientName}!`;
    }

    // --- 2. Fetch Appointments ---
    async function fetchAppointments() {
        appointmentsList.innerHTML = '<li><i class="fas fa-spinner fa-spin"></i> Fetching appointments...</li>';
        
        try {
            // Route: /api/booking/appointments/:patientId
            const response = await fetch(`${API_URL}/appointments/${patientId}`);
            
            if (!response.ok) throw new Error('Failed to fetch appointments.');
            
            const appointments = await response.json();
            renderAppointments(appointments);

        } catch (err) {
            appointmentsList.innerHTML = `<li>Error loading appointments: ${err.message}</li>`;
        }
    }

    // --- 3. Render Appointments ---
    function renderAppointments(appointments) {
        appointmentsList.innerHTML = '';
        if (!appointments || appointments.length === 0) {
            appointmentsList.innerHTML = '<li style="color: #555;">You have no scheduled appointments. Time to book one!</li>';
            return;
        }

        // Build list items (we will add a Download Slip button for each)
        appointments.forEach(app => {
            const li = document.createElement('li');
            li.className = 'appointment-item'; 
            
            const statusClass = `status-${app.status.toLowerCase()}`;

            // Use template string to generate the content
            li.innerHTML = `
                <div class="appointment-details" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #eee;">
                    <div>
                        <h4><i class="fas fa-user-md"></i> Dr. ${escapeHtml(app.doctor_name)} (${escapeHtml(app.department)})</h4>
                        <p><i class="fas fa-clock"></i> ${escapeHtml(app.appointment_date)} @ ${escapeHtml(app.appointment_time)}</p>
                    </div>
                    <div style="text-align: right;">
                        <div class="${statusClass}" style="font-weight: bold; color: ${app.status === 'Booked' ? '#007BFF' : app.status === 'Completed' ? '#28a745' : '#dc3545'};">
                            Status: ${escapeHtml(app.status)}
                        </div>
                        <div style="margin-top:10px;">
                            <button class="btn btn-primary download-slip-btn"
                                data-id="${escapeAttr(app.appointment_id)}"
                                data-doctor="${escapeAttr(app.doctor_name)}"
                                data-department="${escapeAttr(app.department)}"
                                data-date="${escapeAttr(app.appointment_date)}"
                                data-time="${escapeAttr(app.appointment_time)}"
                                data-status="${escapeAttr(app.status)}">
                                <i class="fas fa-download"></i> Download Slip
                            </button>
                        </div>
                    </div>
                </div>
            `;
            appointmentsList.appendChild(li);
        });
    }

    // -------------------------------
    // DOWNLOAD APPOINTMENT SLIP
    // -------------------------------
    // Event delegation: handle clicks on download buttons
    appointmentsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.download-slip-btn');
        if (!btn) return;
        
        // Collect appointment details from data- attributes
        const appointment = {
            id: btn.dataset.id,
            doctor: btn.dataset.doctor,
            department: btn.dataset.department,
            date: btn.dataset.date,
            time: btn.dataset.time,
            status: btn.dataset.status
        };
        downloadSlip(appointment);
    });

    // Create an HTML slip and trigger download
    function downloadSlip(appointment) {
        // Sanitize values (they are small strings already)
        const safePatientName = patientName ? escapeHtml(patientName) : 'Patient';
        const safeDoctor = escapeHtml(appointment.doctor || '');
        const safeDepartment = escapeHtml(appointment.department || '');
        const safeDate = escapeHtml(appointment.date || '');
        const safeTime = escapeHtml(appointment.time || '');
        const safeStatus = escapeHtml(appointment.status || '');

        const content = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Appointment Slip - ${safeDate} ${safeTime}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
    .card { max-width: 700px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; }
    h1 { margin: 0 0 8px 0; font-size: 20px; text-align: center; color: #007BFF; }
    hr { border: none; border-top: 1px solid #eee; margin: 16px 0; }
    .row { display:flex; justify-content: space-between; margin-bottom: 10px; }
    .label { font-weight: bold; color: #555; width: 35%; }
    .value { width: 60%; text-align: right; color: #111; }
    .footer { margin-top: 20px; text-align:center; color: #666; font-size: 0.9em; }
    @media print { .no-print { display:none; } }
    .print-btn { margin-top: 14px; padding: 8px 12px; border-radius: 5px; border:none; cursor:pointer; background-color:#007BFF; color:#fff; }
  </style>
</head>
<body>
  <div class="card">
    <h1>HealthCheck — Appointment Slip</h1>
    <hr>
    <div class="row"><div class="label">Patient Name</div><div class="value">${safePatientName}</div></div>
    <div class="row"><div class="label">Doctor</div><div class="value">Dr. ${safeDoctor}</div></div>
    <div class="row"><div class="label">Department</div><div class="value">${safeDepartment}</div></div>
    <div class="row"><div class="label">Date</div><div class="value">${safeDate}</div></div>
    <div class="row"><div class="label">Time</div><div class="value">${safeTime}</div></div>
    <div class="row"><div class="label">Status</div><div class="value">${safeStatus}</div></div>
    <hr>
    <div class="footer">
      <div>Generated by HealthCheck</div>
      <div style="margin-top:8px;">
        <button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>
      </div>
    </div>
  </div>
</body>
</html>
        `.trim();

        // Create blob and download as .html
        const blob = new Blob([content], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const filenameDate = safeDate ? safeDate.replace(/:/g, '-') : new Date().toISOString().split('T')[0];
        const filenameTime = safeTime ? safeTime.replace(/[: ]/g, '-') : 'time';
        a.href = url;
        a.download = `Appointment_Slip_${filenameDate}_${filenameTime}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    // --- Utility: escape HTML for safety ---
    function escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // For attributes (slightly different but reuse)
    function escapeAttr(s) {
        return escapeHtml(s).replace(/"/g, '&quot;');
    }

    // --- 4. Handle Logout ---
    const handleLogout = () => {
        localStorage.removeItem('patientId');
        localStorage.removeItem('patientName');
        window.location.href = 'Login.html';
    };

    // Attach logout handlers (some elements exist only after DOM ready)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) logoutLink.addEventListener('click', handleLogout);

    // Initial data load
    fetchAppointments();
});
