export async function initTrackers() {
    const trackerList = document.getElementById("trackerList");
    if (!trackerList) return;

    try {
        const res = await fetch("/api/admin/templates");
        if (!res.ok) throw new Error("Failed to fetch manager cards");
        const templates = await res.json();

        trackerList.innerHTML = "";
        templates.forEach(renderAdminCard);

        initTrackerSockets();

        // ===============================
        // INIT TRACKER TEMPLATE HEADER
        // ===============================
        initTrackerTemplateHeader();

    } catch (err) {
        console.error("Trackers init failed:", err);
        trackerList.innerHTML = "<p>Failed to load trackers.</p>";
    }
}

function initTrackerTemplateHeader() {
    // Grab template header elements
    const shiftSelect = document.getElementById("shiftSelect");
    const trackerDate = document.getElementById("trackerDate");
    const trackerHours = document.getElementById("trackerHours");
    const additionalAppointments = document.getElementById("additionalAppointments");
    const addRowBtn = document.getElementById("addRowBtn");
    const submitAllBtn = document.getElementById("submitAllBtn");
    const trackerList = document.getElementById("trackerList");

    if (!shiftSelect || !trackerDate || !trackerHours || !additionalAppointments) return;

    // Set default date
    trackerDate.value = new Date().toISOString().split('T')[0];

    // In-memory rows
    let trackerRows = [];

    // Add a new row
    addRowBtn.addEventListener("click", () => {
        const newRow = {
            phone_number: "",
            no_answer: 0,
            voicemail: 0,
            not_in_service: 0,
            left_message: 0,
            call_backs: 0,
            appointments: 0,
            preset_appointments: 0,
            confirmed_presets: 0
        };
        trackerRows.push(newRow);
        renderRows();
    });

    // Render rows function
    function renderRows() {
        trackerList.innerHTML = trackerRows.map((row, index) => `
            <div class="tracker-row" data-index="${index}" style="display:flex; gap:10px; margin-bottom:5px;">
                <input type="text" placeholder="Phone Number" value="${row.phone_number}" class="phoneInput">
                <input type="number" value="${row.no_answer}" min="0" class="noAnswer">
                <input type="number" value="${row.voicemail}" min="0" class="voicemail">
                <input type="number" value="${row.not_in_service}" min="0" class="notInService">
                <input type="number" value="${row.left_message}" min="0" class="leftMessage">
                <input type="number" value="${row.call_backs}" min="0" class="callBacks">
                <input type="number" value="${row.appointments}" min="0" class="appointments">
                <button class="removeRowBtn">✕</button>
            </div>
        `).join("");

        // Remove row handler
        document.querySelectorAll(".removeRowBtn").forEach((btn, i) => {
            btn.onclick = () => {
                trackerRows.splice(i, 1);
                renderRows();
            };
        });

        // Update input values on change
        document.querySelectorAll(".tracker-row").forEach((rowDiv, i) => {
            rowDiv.querySelectorAll("input").forEach(input => {
                input.onchange = (e) => {
                    const className = e.target.className;
                    if (className === "phoneInput") trackerRows[i].phone_number = e.target.value;
                    if (className === "noAnswer") trackerRows[i].no_answer = Number(e.target.value);
                    if (className === "voicemail") trackerRows[i].voicemail = Number(e.target.value);
                    if (className === "notInService") trackerRows[i].not_in_service = Number(e.target.value);
                    if (className === "leftMessage") trackerRows[i].left_message = Number(e.target.value);
                    if (className === "callBacks") trackerRows[i].call_backs = Number(e.target.value);
                    if (className === "appointments") trackerRows[i].appointments = Number(e.target.value);
                };
            });
        });
    }

    // Submit tracker to backend
    submitAllBtn.addEventListener("click", async () => {
        const payload = {
            user_id: window.currentUserId, // set this from session or global variable
            manager_card_id: null, // optional: link to a manager card template
            shift: shiftSelect.value,
            date: trackerDate.value,
            hours: Number(trackerHours.value),
            additional_appointment: additionalAppointments.value,
            data: trackerRows
        };

        try {
            const res = await fetch("/api/trackers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                alert("Tracker submitted successfully!");
                trackerRows = [];
                renderRows();
            }
        } catch (err) {
            console.error("Failed to submit tracker:", err);
        }
    });

    // Initial render
    renderRows();
}

