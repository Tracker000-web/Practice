import { socket } from './socket.js';

export async function loadAdminTrackers() {

    const res = await fetch('/api/trackers');
    const trackers = await res.json();

    trackers.forEach(renderManagerCard);
}

export function renderManagerCard(tracker) {

    const list = document.getElementById('trackerList');
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
    socket.emit("joinSpectate", user_tracker_id);
}
