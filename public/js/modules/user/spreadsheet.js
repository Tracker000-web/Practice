// Handles rendering the tracker spreadsheet and submission
import { api } from "../../core/api.js";
import { socket } from "../../core/socket.js";
import { areaCodeMap } from "../../core/areaCodeMap.js";

export function openSpreadsheet(template, state, onSubmitSuccess) {
    const container = document.getElementById('trackerSheetContainer');
    if (!container) return;

    // Reset state for this template
    state.trackerRows = [];
    state.isSubmitted = false;

    // Render spreadsheet UI
    container.innerHTML = `
        <div class="sheet-header">
            <h2>${template.title}</h2>
            ${template.status === 'New' ? '<button id="addRowBtn">+ Add Row</button>' : ''}
            <button id="submitAllBtn">Submit All</button>
        </div>
        <table id="trackerTable">
            <thead>
                <tr>${template.fields.map(f => `<th>${f}</th>`).join('')}</tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    // Attach Add Row button if allowed
    if (template.status === 'New') {
        document.getElementById('addRowBtn')
            .addEventListener('click', () => addTrackerRow(template, state));
    }

    // Attach Submit All button
    document.getElementById('submitAllBtn')
        .addEventListener('click', () => submitAllTrackers(template, state, onSubmitSuccess));
}

/* =========================================
   AREA CODE MAP
========================================= */
function addTrackerRow(template, state) {
    const tbody = document.querySelector("#trackerTable tbody");
    const row = document.createElement("tr");
    const rowData = {};

    template.fields.forEach(field => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";

        // Auto detect state from phone numbers
        if (field === "States") {
            input.addEventListener("input", e => {
                const area = e.target.value.slice(0,3); // first 3 digits
                input.value = areaCodeMap[area] || "Unknown";
                rowData[field] = input.value;
            });
        } else {
            input.addEventListener("input", e => rowData[field] = e.target.value);
        }

        td.appendChild(input);
        row.appendChild(td);
    });

    state.trackerRows.push(rowData);
    tbody.appendChild(row);
}

/* =========================================
   ADD A ROW TO THE SPREADSHEET
========================================= */
function addTrackerRow(template, state) {
    const tbody = document.querySelector('#trackerTable tbody');
    if (!tbody) return;

    const row = document.createElement('tr');
    const rowData = {};

    template.fields.forEach(field => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';

        input.addEventListener('input', e => {
            rowData[field] = e.target.value;

            // Live update to admins watching this tracker
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
   SUBMIT ALL ROWS
========================================= */
async function submitAllTrackers(template, state, callback) {
    if (!state.trackerRows.length) {
        alert("Add at least one row before submitting.");
        return;
    }

    try {
        await api.post(`/user/submit-tracker`, {
            userId: state.currentUser,
            templateId: template.id,
            rows: state.trackerRows
        });

        state.isSubmitted = true;
        document.getElementById('trackerSheetContainer').innerHTML = "";

        // Notify admins in real-time
        socket.emit("trackerSubmitted", template.id);

        if (callback) callback();

    } catch (err) {
        console.error("Submission failed:", err);
        alert("Failed to submit tracker rows.");
    }
}
