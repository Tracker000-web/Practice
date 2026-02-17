/* =========================================
   CONFIG
========================================= */
const API_BASE = 'http://localhost:3000';

const API = {
    getTemplate: (userId) => `${API_BASE}/api/user/${userId}/template`,
    submitTracker: `${API_BASE}/api/user/submit-tracker`,
    getHistory: (userId) => `${API_BASE}/api/user/history/${userId}`
};

/* =========================================
   STATE
========================================= */
const state = {
    currentUser: "JohnDoe",
    activeTemplate: null,
    trackerRows: [],
    isSubmitted: true
};

/* =========================================
   INIT
========================================= */
export function initUser(userId = "JohnDoe") {
    state.currentUser = userId;
    loadUserTemplate();
    loadUserHistory();
}

/* =========================================
   LOAD TEMPLATE
========================================= */
async function loadUserTemplate() {
    const container = document.getElementById('trackerList');
    if (!container) return;

    container.innerHTML = "Loading...";

    try {
        const res = await fetch(API.getTemplate(state.currentUser));
        if (!res.ok) throw new Error(res.status);

        const data = await res.json();
        container.innerHTML = "";

        if (!data.template || data.template.status !== 'live') {
            container.innerHTML = "<p>No tracker assigned.</p>";
            return;
        }

        state.activeTemplate = data.template;
        renderManagerCard(data.template);

    } catch (err) {
        console.error("Template load error:", err);
        container.innerHTML = "<p>Server error loading template.</p>";
    }
}

/* =========================================
   RENDER MANAGER CARD
========================================= */
function renderManagerCard(template) {
    const container = document.getElementById('trackerList');
    const card = document.createElement('div');
    card.className = 'manager-card';

    card.innerHTML = `
        <h3>${template.title}</h3>
        <button class="open-sheet-btn">Open Spreadsheet</button>
    `;

    container.appendChild(card);

    // Event binding
    card.querySelector('.open-sheet-btn').addEventListener('click', () => openSpreadsheet(template));
}

/* =========================================
   OPEN SPREADSHEET
========================================= */
function openSpreadsheet(template) {
    if (!template) return;

    state.trackerRows = [];
    state.isSubmitted = false;

    const container = document.getElementById('trackerSheetContainer');
    container.innerHTML = `
        <div class="sheet-header">
            <h2>${template.title}</h2>
            ${
                template.status === 'live'
                    ? '<button id="addRowBtn">+ Add New Tracker</button>'
                    : '<p class="info-text">This tracker is not yet published.</p>'
            }
            <button id="submitAllBtn">Submit All</button>
        </div>
        <table id="trackerTable">
            <thead>
                <tr>${template.fields.map(f => `<th>${f}</th>`).join('')}</tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    if (template.status === 'live') {
        document.getElementById('addRowBtn').addEventListener('click', () => addTrackerRow(template));
    }

    document.getElementById('submitAllBtn').addEventListener('click', () => submitAllTrackers(template));
}

/* =========================================
   ADD TRACKER ROW
========================================= */
function addTrackerRow(template) {
    const tbody = document.querySelector('#trackerTable tbody');
    if (!tbody || !template) return;

    const row = document.createElement('tr');
    const rowData = {};

    template.fields.forEach(field => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';

        input.addEventListener('input', e => rowData[field] = e.target.value);

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
        const res = await fetch(API.submitTracker, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.currentUser,
                templateId: template.id,
                rows: state.trackerRows
            })
        });

        if (!res.ok) throw new Error();

        alert("Submitted successfully!");
        state.isSubmitted = true;
        document.getElementById('trackerSheetContainer').innerHTML = "";
        loadUserHistory();

    } catch (err) {
        console.error("Submit failed:", err);
        alert("Submission failed.");
    }
}

/* =========================================
   LOAD HISTORY
========================================= */
async function loadUserHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    try {
        const res = await fetch(API.getHistory(state.currentUser));
        if (!res.ok) throw new Error();

        const history = await res.json();
        historyList.innerHTML = history.length
            ? history.map(renderHistoryItem).join('')
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
window.addEventListener('beforeunload', (e) => {
    if (!state.isSubmitted) {
        e.preventDefault();
        e.returnValue = "Tracker not submitted!";
    }
});
