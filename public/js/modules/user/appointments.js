// User appointments module
import { api } from "../../core/api.js";

export function initAppointments(userId) {
    const container = document.querySelector("[data-page='appointments']");
    if (!container) return;

    container.innerHTML = "<p>Loading appointments...</p>";

    loadAppointments(userId, container);
}

async function loadAppointments(userId, container) {
    try {
        const appointments = await api.get(`/user/${userId}/appointments`);
        if (!appointments.length) {
            container.innerHTML = "<p>No appointments scheduled.</p>";
            return;
        }

        container.innerHTML = appointments
            .map(a => `
                <div class="appointment">
                    <strong>${a.client_name}</strong> - ${a.phone}
                    <p>Date: ${new Date(a.date).toLocaleString()}</p>
                    <p>Status: ${a.status}</p>
                </div>
            `)
            .join("");
    } catch (err) {
        console.error("Error loading appointments:", err);
        container.innerHTML = "<p>Error loading appointments.</p>";
    }
}
