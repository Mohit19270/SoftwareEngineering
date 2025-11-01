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
  let selectedSlot = null;

  // --- 0. Check if user is logged in ---
  const patientId = localStorage.getItem('patientId');
  if (!patientId) {
    displayFeedback('You are not logged in. Redirecting...', true);
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
    const departments = [...new Set(doctors.map(doc => doc.department))];
    deptSelect.innerHTML = '<option value="">-- Select a department --</option>';
    
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = dept;
      deptSelect.appendChild(option);
    });
  }

  // --- 3. Populate Doctors Dropdown (on department change) ---
  deptSelect.addEventListener('change', () => {
    const selectedDept = deptSelect.value;
    doctorSelect.innerHTML = '<option value="">-- Select a doctor --</option>';
    doctorSelect.disabled = true;
    dateInput.disabled = true;
    resetSlots();

    if (selectedDept) {
      const doctorsInDept = allDoctors.filter(doc => doc.department === selectedDept);
      doctorsInDept.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.name;
        doctorSelect.appendChild(option);
      });
      doctorSelect.disabled = false;
    }
  });

  // --- 4. Fetch Available Slots (on doctor or date change) ---
  async function fetchSlots() {
    const doctorId = doctorSelect.value;
    const date = dateInput.value;

    if (!doctorId || !date) {
      resetSlots();
      return;
    }

    resetSlots('<p>Loading slots...</p>');
    
    try {
      const response = await fetch(`${API_URL}/slots?doctorId=${doctorId}&date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch slots');
      
      const slots = await response.json();
      
      if (slots.length === 0) {
        resetSlots('<p>No available slots for this date.</p>');
      } else {
        slotsContainer.innerHTML = ''; // Clear loading message
        slots.forEach(slot => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'slot-button';
          button.textContent = slot;
          button.dataset.slot = slot;
          button.addEventListener('click', selectSlot);
          slotsContainer.appendChild(button);
        });
      }
    } catch (err) {
      displayFeedback(err.message, true);
    }
  }
  
  doctorSelect.addEventListener('change', () => {
    dateInput.disabled = !doctorSelect.value;
    fetchSlots();
  });
  
  dateInput.addEventListener('change', fetchSlots);

  // --- 5. Handle Slot Selection ---
  function selectSlot(e) {
    // Remove 'selected' from all buttons
    document.querySelectorAll('.slot-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Add 'selected' to the clicked button
    const button = e.target;
    button.classList.add('selected');
    selectedSlot = button.dataset.slot;
    
    bookNowBtn.disabled = false;
  }
  
  function resetSlots(message = '<p>Please select a doctor and date.</p>') {
    slotsContainer.innerHTML = message;
    selectedSlot = null;
    bookNowBtn.disabled = true;
  }

  // --- 6. Handle Form Submission ---
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      displayFeedback('Please select a time slot.', true);
      return;
    }
    
    bookNowBtn.disabled = true;
    bookNowBtn.textContent = 'Booking...';

    const bookingData = {
      patientId: patientId, // From localStorage
      doctorId: doctorSelect.value,
      date: dateInput.value,
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

  // --- Initial call to fetch doctors ---
  fetchDoctors();
});