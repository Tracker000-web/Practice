// Handles Appointments page
export function initAppointments(userId) {
    if (!userId) return;
    loadAppointments(userId);
}

/* =========================================
   LOAD APPOINTMENTS
========================================= */
async function loadAppointments(userId) {
    const container = document.getElementById("appointmentsContainer");
    if (!container) return;

    try {
        const res = await fetch(`/api/user/${userId}/appointments`);
        if (!res.ok) throw new Error();

        const appointments = await res.json();
        container.innerHTML = appointments.length
            ? appointments.map(renderAppointment).join("")
            : "<p>No upcoming appointments.</p>";

    } catch (err) {
        console.error("Appointments load error:", err);
        container.innerHTML = "<p>Error loading appointments.</p>";
    }
}

function renderAppointment(a) {
    return `
        <div class="appointment-card">
            <strong>${new Date(a.date).toLocaleDateString()}</strong>
            <span>${a.time}</span>
            <p>${a.description}</p>
        </div>
    `;
}
