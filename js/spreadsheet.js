let unsaved = false;

export function createSpreadsheet(user_tracker_id, timestamp) {

    const container = document.createElement('div');
    container.className = "sheet-container";

    container.innerHTML = `
        <div class="sheet-topbar">
            <input type="text" id="searchInput" placeholder="Search...">
            <select id="statusFilter">
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
            </select>
            <button onclick="submitTracker(${user_tracker_id})">
                Submit Tracker
            </button>
        </div>

        <div class="timestamp">
            Created: ${new Date(timestamp).toLocaleString()}
        </div>

        <table id="sheetTable"></table>
    `;

    document.body.appendChild(container);
    generateGrid();
}

function generateGrid(rows = 100, cols = 10) {

    const table = document.getElementById("sheetTable");

    for (let r = 0; r < rows; r++) {
        const tr = document.createElement("tr");

        for (let c = 0; c < cols; c++) {
            const td = document.createElement("td");
            td.contentEditable = true;
            td.addEventListener("input", () => unsaved = true);
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }
}

window.submitTracker = async function(user_tracker_id) {

    await fetch('/api/submit_tracker', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({user_tracker_id})
    });

    unsaved = false;
    alert("Tracker submitted!");
};

window.addEventListener("beforeunload", e => {
    if (unsaved) {
        e.preventDefault();
        e.returnValue = '';
    }
});
