// book-slot.js
document.addEventListener('DOMContentLoaded', () => {

  const deptSelect = document.getElementById('department');
  const doctorSelect = document.getElementById('doctor');
  const dateInput = document.getElementById('date');
  const slotsContainer = document.getElementById('slots-container');
  const bookingForm = document.getElementById('bookingForm');
  const bookNowBtn = document.getElementById('book-now-btn');
  const feedbackContainer = document.getElementById('feedback-container');

  const API_URL = 'http://localhost:3000/api/booking';
  let allDoctors = [];
  let selectedSlot = null; // Stores the selected time slot

  // --- 0. Check if user is logged in ---
  const patientId = localStorage.getItem('patientId');
  if (!patientId) {
    displayFeedback('You are not logged in. Redirecting to login...', true);
    setTimeout(() => {
      window.location.href = 'Login.html';
    }, 2000);
    return;
  }
  
  // Set minimum date for date input to today
  dateInput.min = new Date().toISOString().split('T')[0];

  // --- 1. Fetch all doctors on page load ---
  async function fetchDoctors() {
    try {
      const response = await fetch(`${API_URL}/doctors`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
      
      allDoctors = await response.json();
      populateDepartments(allDoctors);
    } catch (err) {
      displayFeedback(err.message, true);
    }
  }

  // --- 2. Populate Departments Dropdown ---
  function populateDepartments(doctors) {
    const uniqueDepartments = [...new Set(doctors.map(d => d.department))];
    deptSelect.innerHTML = '<option value="">-- Please select a department --</option>';
    
    uniqueDepartments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = dept;
      deptSelect.appendChild(option);
    });
  }

  // --- 3. Populate Doctors Dropdown based on Department ---
  function populateDoctors(department) {
    doctorSelect.innerHTML = '<option value="">-- Select a doctor --</option>';
    doctorSelect.disabled = true;
    dateInput.disabled = true;
    
    if (!department) return;

    const filteredDoctors = allDoctors.filter(d => d.department === department);

    if (filteredDoctors.length > 0) {
      filteredDoctors.forEach(d => {
        const option = document.createElement('option');
        // CRITICAL: Ensure the value is the doctor_id (integer)
        option.value = d.doctor_id; 
        option.textContent = d.name;
        doctorSelect.appendChild(option);
      });
      doctorSelect.disabled = false;
    } else {
      displayFeedback('No doctors found for this department.', true);
    }
  }

  // --- 4. Fetch Available Slots ---
  async function fetchSlots() {
    const doctorId = doctorSelect.value;
    const date = dateInput.value;
    
    // Clear previous slots and selection
    slotsContainer.innerHTML = '';
    selectedSlot = null;
    bookNowBtn.disabled = true;

    if (!doctorId || !date) {
      slotsContainer.innerHTML = '<p>Select a doctor and date to see available slots.</p>';
      return;
    }

    try {
      const url = `${API_URL}/slots?doctorId=${doctorId}&date=${date}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch slots.');
      }
      
      const slots = await response.json();
      renderSlots(slots);

    } catch (err) {
      displayFeedback(err.message, true);
      slotsContainer.innerHTML = `<p class="feedback-message error">${err.message}</p>`;
    }
  }

  // --- 5. Render Slot Buttons ---
  function renderSlots(slots) {
    if (slots.length === 0) {
      slotsContainer.innerHTML = '<p>No available slots for this date.</p>';
      return;
    }

    slots.forEach(slot => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slot-button';
      button.textContent = slot;
      button.dataset.time = slot;
      
      button.addEventListener('click', () => {
        // Remove 'selected' class from all buttons
        document.querySelectorAll('.slot-button').forEach(btn => {
          btn.classList.remove('selected');
        });
        
        // Add 'selected' class to the clicked button
        button.classList.add('selected');
        selectedSlot = slot;
        bookNowBtn.disabled = false;
      });
      
      slotsContainer.appendChild(button);
    });
  }
  
  // --- Event Listeners ---
  deptSelect.addEventListener('change', (e) => {
    populateDoctors(e.target.value);
    dateInput.value = ''; // Reset date when department changes
  });
  
  doctorSelect.addEventListener('change', (e) => {
    // Enable date input only if a doctor is selected
    const doctorSelected = !!e.target.value;
    dateInput.disabled = !doctorSelected;
    dateInput.value = ''; // Reset date when doctor changes
    fetchSlots(); // Call fetchSlots here to reset the container initially
  });
  
  dateInput.addEventListener('change', fetchSlots);

  // --- Form Submission (THE FIX FOR 'undefined' doctor_id) ---
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const doctorId = doctorSelect.value;
    const date = dateInput.value;

    // **1. CRITICAL VALIDATION** (Prevents sending 'undefined' to MySQL)
    if (!doctorId || doctorId === "" || isNaN(parseInt(doctorId))) {
        displayFeedback('Please select a doctor.', true);
        return;
    }
    if (!date || date === "") {
        displayFeedback('Please select an appointment date.', true);
        return;
    }
    if (!selectedSlot) {
      displayFeedback('Please select a time slot.', true);
      return;
    }
    
    bookNowBtn.disabled = true;
    bookNowBtn.textContent = 'Booking...';

    const bookingData = {
        patientId: patientId, 
        // **Parse to integer to ensure correct data type for MySQL**
        doctorId: parseInt(doctorId), 
        date: date,
        time: selectedSlot
    };

    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Booking failed');
        }

        displayFeedback(`Success! ${data.message} Your appointment is confirmed.`, false);
        bookingForm.style.display = 'none';

    } catch (err) {
        displayFeedback(err.message, true);
    } finally {
        bookNowBtn.disabled = false;
        bookNowBtn.textContent = 'Book Appointment';
    }
  });
  
  // --- Utility Function: Display Feedback ---
  function displayFeedback(message, isError = true) {
      feedbackContainer.innerHTML = '';
      const p = document.createElement('div');
      p.className = `feedback-message ${isError ? 'error' : ''}`;
      p.innerHTML = message;
      feedbackContainer.appendChild(p);
  }
  
  // Initial data fetch
  fetchDoctors();
});