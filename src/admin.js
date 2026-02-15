import { socket } from './socket.js';

export async function loadAdminTrackers() {
    const res = await fetch('/api/trackers');
    const trackers = await res.json();

    // Clear list before rendering to avoid duplicates
    document.getElementById('trackerList').innerHTML = "";
    trackers.forEach(renderManagerCard);
}

export async function addNewManager(managerName) {
    await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: managerName, is_new: true })
    });
    loadAdminTrackers(); // Refresh the list
}

export function renderManagerCard(tracker) {
    const list = document.getElementById('trackerList');
    if (!list) return; // Safety check

    const card = document.createElement('div');
    card.className = "manager-card";

    card.innerHTML = `
        <span>${tracker.name}</span>
        ${tracker.is_new ? '<span class="badge-new">NEW</span>' : ''}
        <button onclick="spectate(${tracker.id})">
            Spectate
        </button>
    `;

    list.appendChild(card);
}

export function spectate(user_tracker_id) {
    console.log("Joined Live Spectate Room:", user_tracker_id);
    socket.emit("joinSpectate", user_tracker_id);
    
    // Listen for live updates from the user
    socket.on("liveUpdate", (data) => {
        updateSpectateUI(data); 
    });
}

// --- ADD THESE LINES TO FIX THE ERRORS ---
window.loadAdminTrackers = loadAdminTrackers;
window.renderManagerCard = renderManagerCard;
window.spectate = spectate;

