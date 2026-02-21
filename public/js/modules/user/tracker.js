

export const state = {
    currentUser: null,
    activeTemplates: [],
    trackerRows: [],
    isSubmitted: true
};

/* =========================================
   INIT TRACKERS MODULE
========================================= */
export function initTrackers(userId) {
    state.currentUser = userId;

    loadUserTemplates();
    loadUserHistory();
    registerSocketListeners();
}

/* =========================================
   SOCKET LISTENERS
========================================= */
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

/* =========================================
   LOAD TEMPLATES
========================================= */
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

/* =========================================
   RENDER MANAGER CARD
========================================= */
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
   OPEN SPREADSHEET
========================================= */
function openSpreadsheet(template) {
    if (!template) return;

    state.trackerRows = [];
    state.isSubmitted = false;

    const container = document.getElementById("trackerSheetContainer");
    container.innerHTML = `
        <div class="sheet-header">
            <h2>${template.title}</h2>
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

    if (template.status === "New") {
        document.getElementById("addRowBtn").addEventListener("click", () => addTrackerRow(template));
    }

    document.getElementById("submitAllBtn").addEventListener("click", () => submitAllTrackers(template));
}

/* =========================================
   ADD TRACKER ROW
========================================= */
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

/* =========================================
   SUBMIT ALL TRACKERS
========================================= */
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

/* =========================================
   LOAD USER HISTORY
========================================= */
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

/* =========================================
   UNSUBMITTED GUARD
========================================= */
window.addEventListener("beforeunload", e => {
    if (!state.isSubmitted) {
        e.preventDefault();
        e.returnValue = "Tracker not submitted!";
    }
});
