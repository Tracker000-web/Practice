import { createSpreadsheet } from './spreadsheet.js';

export async function renderManagerCard(tracker) {

    const container = document.getElementById('userManagerCards');

    const card = document.createElement('div');
    card.className = "manager-card";

    card.innerHTML = `
        <h3>${tracker.name}</h3>
        <button onclick="createTracker(${tracker.id})">
            Add New Tracker
        </button>
    `;

    container.appendChild(card);
}

window.createTracker = async function(tracker_id) {

    const res = await fetch('/api/user_tracker', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            tracker_id,
            user_name: window.currentUser
        })
    });

    const data = await res.json();
    createSpreadsheet(data.id, data.created_at);
};
