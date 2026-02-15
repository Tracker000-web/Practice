import { socket } from './socket.js'; // Ensure this is here!

let isSubmitted = true; 

// 1️⃣ Render the Manager Card
export async function renderManagerCard(tracker) {
    const container = document.getElementById('userManagerCards');
    if (!container) return;
    const card = document.createElement('div');
    card.className = "manager-card";
    card.innerHTML = `
        <h3>${tracker.name}</h3>
        ${tracker.is_new ? '<span class="badge-new">NEW</span>' : ''}
        <button onclick="createTracker(${tracker.id}, '${tracker.name}')">
            Add New Tracker
        </button>
    `;
    container.appendChild(card);
}

// 2️⃣ Create Tracker
window.createTracker = async function(tracker_id, managerName) {
    const res = await fetch('/api/user_tracker', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            tracker_id,
            user_name: window.currentUser
        })
    });
    const data = await res.json();
    isSubmitted = false; 
    renderTrackerUI(data.id, data.created_at, managerName);
};

// 3️⃣ Render UI
function renderTrackerUI(id, timestamp, managerName) {
    const container = document.getElementById('spreadsheet-area');
    const timeString = new Date(timestamp).toLocaleString();
    container.innerHTML = `
        <div class="tracker-container" id="tracker-container-${id}">
            <div class="tracker-header">
                <div class="header-info">
                    <strong>Manager: ${managerName}</strong>
                    <span>Started: ${timeString}</span>
                </div>
                <div class="header-controls">
                    <input type="text" id="trackerSearch" placeholder="Search data..." onkeyup="filterTable()">
                    <select id="statusFilter" onchange="filterByStatus()">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button class="submit-btn" onclick="submitTracker(${id})">Submit Tracker</button>
                </div>
            </div>
            <div id="spreadsheet-grid" class="spreadsheet-content" contenteditable="true">
                <table>
                    <thead><tr><th>Data</th><th>Status</th><th>Notes</th></tr></thead>
                    <tbody><tr><td></td><td>pending</td><td></td></tr></tbody>
                </table>
            </div>
        </div>
    `;
}

// 4️⃣ Submit
window.submitTracker = async function(user_tracker_id) {
    const res = await fetch(`/api/submit_tracker/${user_tracker_id}`, { method: 'POST' });
    if (res.ok) {
        isSubmitted = true;
        alert("✅ Tracker submitted successfully!");
        document.getElementById('spreadsheet-area').innerHTML = ""; 
        loadUserHistory(window.currentUser);
    }
};

// 5️⃣ History & Filter History
export async function loadUserHistory(user) {
    if (!user || user === 'undefined') return;
    const res = await fetch(`/api/user_history/${user}`);
    const history = await res.json();
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    historyList.innerHTML = `
        <div class="filter-bar">
            <button onclick="filterHistory('all')">All</button>
        </div>
        <div id="historyItems">
            ${history.map(h => `
                <div class="history-item" data-manager="${h.manager_name}">
                    <span>${h.manager_name}</span>
                    <span>${new Date(h.submitted_at).toLocaleDateString()}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Basic History Filter
window.filterHistory = function(type) {
    console.log("Filtering history by:", type);
    // You can add logic here to filter the #historyItems div
};

// 6️⃣ Guard & Filters & Sockets
window.addEventListener('beforeunload', (e) => {
    if (!isSubmitted) {
        e.preventDefault();
        e.returnValue = "Tracker not submitted!";
    }
});

window.filterTable = function() {
    const input = document.getElementById("trackerSearch");
    const filter = input.value.toUpperCase();
    const tr = document.querySelectorAll("#spreadsheet-grid table tr");
    tr.forEach((row, index) => {
        if (index === 0) return;
        const td = row.getElementsByTagName("td")[0];
        if (td) {
            row.style.display = td.textContent.toUpperCase().includes(filter) ? "" : "none";
        }
    });
};

window.filterByStatus = function() {
    const filter = document.getElementById("statusFilter").value;
    const tr = document.querySelectorAll("#spreadsheet-grid table tr");
    tr.forEach((row, index) => {
        if (index === 0) return;
        const statusTd = row.getElementsByTagName("td")[1];
        if (statusTd) {
            const statusValue = statusTd.textContent.trim();
            row.style.display = (filter === "all" || statusValue === filter) ? "" : "none";
        }
    });
};

document.addEventListener('input', (e) => {
    if (e.target.closest('#spreadsheet-grid')) {
        const grid = document.getElementById('spreadsheet-grid');
        const container = e.target.closest('.tracker-container');
        const trackerId = container.id.split('-').pop();
        socket.emit("userTyping", { tracker_id: trackerId, content: grid.innerHTML });
    }
});

window.loadUserHistory = loadUserHistory;