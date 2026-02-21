// js/modules/user/tracker.js

/* ===================================================
   STATE
=================================================== */
export const state = {
    currentUser: null,
    activeTemplates: [],
    trackerRows: [],
    isSubmitted: true
};

let socket = null;
let currentManagercardId = null;

/* ===================================================
   INIT TRACKERS MODULE
=================================================== */
export function initTrackers(userId) {
    state.currentUser = userId;

    socket = io(); // Initialize socket

    loadUserTemplates();
    loadUserHistory();
    registerSocketListeners();
    registerCompanionSockets();
}

/* ===================================================
   SOCKET LISTENERS (submission & admin updates)
=================================================== */
function registerSocketListeners() {
    socket.emit("joinUserRoom", state.currentUser);

    socket.on("trackerUpdated", (rowData) => {
        console.log("Tracker updated by admin:", rowData);
    });

    socket.on("trackerSubmitted", () => {
        console.log("Admin detected submission!");
        alert("Your tracker was successfully submitted!");
        state.isSubmitted = true;
    });

    socket.on("newTemplateAssigned", async ({ templateId }) => {
        const res = await fetch(`/api/user/${state.currentUser}/template`);
        if (!res.ok) return console.error("Failed to load template after assignment");
        const data = await res.json();

        if (data.template) {
            const templates = Array.isArray(data.template) ? data.template : [data.template];
            templates.forEach(t => {
                if (!state.activeTemplates.find(temp => temp.id === t.id)) {
                    state.activeTemplates.push(t);
                    renderManagerCard(t);
                    alert(`A new tracker "${t.title}" has been assigned to you!`);
                }
            });
        }
    });
}

/* ===================================================
   COMPANION / DIALER SOCKETS
=================================================== */
function registerCompanionSockets() {
    socket.on("dialers-update", (dialers) => {
        if (!currentManagercardId) return;

        const companions = dialers
            .filter(u => u.userId !== state.currentUser)
            .map(u => u.name);

        const el = document.getElementById("dialersList");
        if (el) el.innerText = companions.length ? companions.join(", ") : "You're alone";
    });

    window.addEventListener("beforeunload", () => {
        if (!state.isSubmitted) {
            alert("Tracker not submitted!");
        }
        if (currentManagercardId) socket.emit("leave-managercard");
    });
}

/* ===================================================
   LOAD TEMPLATES
=================================================== */
async function loadUserTemplates() {
    const container = document.getElementById("trackerList");
    if (!container) return;

    container.innerHTML = "Loading...";

    try {
        const res = await fetch(`/api/user/${state.currentUser}/template`);
        if (!res.ok) throw new Error(res.status);

        const data = await res.json();
        container.innerHTML = "";

        if (!data.template || data.template.status !== "New") {
            container.innerHTML = "<p>No tracker assigned.</p>";
            return;
        }

        state.activeTemplates = Array.isArray(data.template) ? data.template : [data.template];
        state.activeTemplates.forEach(renderManagerCard);

    } catch (err) {
        console.error("Template load error:", err);
        container.innerHTML = "<p>Server error loading template.</p>";
    }
}

/* ===================================================
   RENDER MANAGER CARD
=================================================== */
function renderManagerCard(template) {
    const container = document.getElementById("trackerList");
    if (document.querySelector(`.manager-card[data-id="${template.id}"]`)) return;

    const card = document.createElement("div");
    card.className = "manager-card";
    card.dataset.id = template.id;

    card.innerHTML = `
        <h3>${template.title}</h3>
        <button class="open-sheet-btn">Open Spreadsheet</button>
    `;

    container.appendChild(card);

    card.querySelector(".open-sheet-btn").addEventListener("click", () => openSpreadsheet(template));
}

/* =========================================
   OPEN SPREADSHEET (with companion view)
========================================= */
function openSpreadsheet(template) {
    if (!template) return;

    state.trackerRows = [];
    state.isSubmitted = false;

    const container = document.getElementById("trackerSheetContainer");
    container.innerHTML = `
        <div class="sheet-header">
            <h2>${template.title} ${template.status === "New" ? '' : ''}</h2>
            <div id="companionList" class="companion-list">Companions: None</div>
            ${template.status === "New" ? '<button id="addRowBtn">+ Add New Tracker</button>' : ''}
            <button id="submitAllBtn">Submit All</button>
        </div>
        <table id="trackerTable">
            <thead>
                <tr>${template.fields.map(f => `<th>${f}</th>`).join("")}</tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    // Remove "New" tag after opening
    if (template.status === "New") {
        template.status = "Opened"; // Update state so tag disappears
        const card = document.querySelector(`.manager-card[data-id="${template.id}"]`);
        if (card) card.classList.remove("new"); // Optional: remove CSS class
    }

    if (template.status === "Opened" || template.status === "New") {
        document.getElementById("addRowBtn")?.addEventListener("click", () => addTrackerRow(template));
    }

    document.getElementById("submitAllBtn").addEventListener("click", () => submitAllTrackers(template));

    // Join socket room for companion view
    socket.emit("join-managercard", {
        workspaceId: template.workspaceId,
        managercardId: template.id,
        user: { id: state.currentUser, name: state.currentUserName }
    });

    // Listen for dialer updates
    socket.on("dialers-update", (dialers) => {
        const companionDiv = document.getElementById("companionList");
        if (!companionDiv) return;

        const otherDialers = dialers
            .filter(u => u.userId !== state.currentUser)
            .map(u => u.name);

        companionDiv.textContent = otherDialers.length
            ? `Companions: ${otherDialers.join(", ")}`
            : "Companions: None";
    });
}

/* =========================================
   CLOSE SPREADSHEET / CLEANUP
========================================= */
function closeSpreadsheet(template) {
    // Leave the companion room when closing
    socket.emit("leave-managercard");
    document.getElementById("trackerSheetContainer").innerHTML = "";
}

/* ===================================================
   ADD TRACKER ROW
=================================================== */
function addTrackerRow(template) {
    const tbody = document.querySelector("#trackerTable tbody");
    if (!tbody || !template) return;

    const row = document.createElement("tr");
    const rowData = {};

    template.fields.forEach(field => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.addEventListener("input", e => {
            rowData[field] = e.target.value;

            // Emit live update to admins
            socket.emit("trackerUpdate", {
                templateId: template.id,
                rowData
            });
        });

        td.appendChild(input);
        row.appendChild(td);
    });

    state.trackerRows.push(rowData);
    tbody.appendChild(row);
}

/* ===================================================
   SUBMIT ALL TRACKERS
=================================================== */
async function submitAllTrackers(template) {
    if (!state.trackerRows.length) return alert("Add at least one tracker row.");

    try {
        const res = await fetch("/api/user/submit-tracker", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: state.currentUser,
                templateId: template.id,
                rows: state.trackerRows
            })
        });

        if (!res.ok) throw new Error();

        alert("Submitted successfully!");
        state.isSubmitted = true;
        document.getElementById("trackerSheetContainer").innerHTML = "";

        // Notify admins in real-time
        socket.emit("trackerSubmitted", template.id);

        loadUserHistory();

    } catch (err) {
        console.error("Submit failed:", err);
        alert("Submission failed.");
    }
}

/* ===================================================
   LOAD USER HISTORY
=================================================== */
async function loadUserHistory() {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;

    try {
        const res = await fetch(`/api/user/${state.currentUser}/history`);
        if (!res.ok) throw new Error();

        const history = await res.json();
        historyList.innerHTML = history.length
            ? history.map(renderHistoryItem).join("")
            : "<p>No history yet.</p>";

    } catch (err) {
        console.error("History load error:", err);
        historyList.innerHTML = "<p>Error loading history.</p>";
    }
}

function renderHistoryItem(h) {
    return `
        <div class="history-item">
            <strong>ID:</strong> ${h.id}
            <span>${new Date(h.created_at).toLocaleDateString()}</span>
        </div>
    `;
}