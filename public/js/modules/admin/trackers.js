import { socket } from "../../core/socket-client.js"; // import socket for live updates

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
    } catch (err) {
        console.error("Trackers init failed:", err);
        trackerList.innerHTML = "<p>Failed to load trackers.</p>";
    }
}

function renderAdminCard(template) {
    const list = document.getElementById("trackerList");
    const card = document.createElement("div");
    card.className = "manager-card admin-view";

    card.innerHTML = `
        <div class="card-info">
            <span>${template.title}</span> 
            ${template.status === 'live' ? '<span class="badge-live">LIVE</span>' : '<span class="badge-draft">DRAFT</span>'}
        </div>
        <div class="card-actions">
            <button class="spectate-btn">Spectate</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;
    list.appendChild(card);

    card.querySelector(".spectate-btn").addEventListener("click", () => {
        socket.emit("joinSpectate", template.id);
    });

    card.querySelector(".delete-btn").addEventListener("click", async () => {
        if (!confirm(`Delete "${template.title}"?`)) return;
        const res = await fetch(`/api/admin/templates/${template.id}`, { method: "DELETE" });
        if (res.ok) renderAdminCard(); // refresh list
    });
}

function initTrackerSockets() {
    socket.on("refreshManagerCards", initTrackers);
    socket.on("trackerSubmitted", initTrackers);
}
