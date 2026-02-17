import { socket } from '../public/socket.js';

/* =========================================
   CONFIG
========================================= */
const API = {
    templates: 'http://localhost:3000/api/admin/templates',
    createTemplate: 'http://localhost:3000/api/admin/create-template',
    deleteTemplate: (id) => `http://localhost:3000/api/admin/create-template/${id}`
};

/* =========================================
   INITIALIZATION
========================================= */
document.addEventListener("DOMContentLoaded", () => {
    loadAdminTemplates();
    registerSocketListeners();
});

/* =========================================
   SOCKET LISTENERS
========================================= */
function registerSocketListeners() {
    socket.on("refreshManagerCards", loadAdminTemplates);
    socket.on("trackerSubmitted", loadAdminTemplates);
}

/* =========================================
   PUBLISH TEMPLATE
========================================= */
window.handlePublish = async function(event) {
    if (event) event.preventDefault();
    const input = document.getElementById("trackerInput");
    const name = input?.value?.trim();

    if (!name) return alert("Please enter a name");

    try {
        const res = await fetch(API.createTemplate, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                title: name,
                fields: [],
                status: 'live'  // Published templates visible to users
            })
        });

        if (!res.ok) throw new Error(await res.text());

        input.value = "";
        await loadAdminTemplates();
        console.log(`Template published: ${name}`);
    } catch (err) {
        console.error("Publish failed:", err);
        alert("Failed to publish template.");
    }
};

/* =========================================
   LOAD TEMPLATES
========================================= */
export async function loadAdminTemplates() {
    try {
        const res = await fetch(API.templates);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const templates = await res.json();
        const list = document.getElementById("trackerList");
        if (!list) return;

        list.innerHTML = "";
        if (!Array.isArray(templates)) throw new Error("Templates not array");

        templates.forEach(renderAdminCard);
    } catch (err) {
        console.error("Failed to load templates:", err);
    }
}

/* =========================================
   RENDER ADMIN CARD
========================================= */
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
            <button class="spectate-btn" data-id="${template.id}">Spectate</button>
            <button class="delete-btn" data-id="${template.id}">Delete</button>
        </div>
    `;

    list.appendChild(card);

    card.querySelector(".spectate-btn").addEventListener("click", () => spectate(template.id));
    card.querySelector(".delete-btn").addEventListener("click", () => deleteTemplate(template.id, template.title));
}

/* =========================================
   DELETE TEMPLATE
========================================= */
async function deleteTemplate(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
        const res = await fetch(API.deleteTemplate(id), { method: "DELETE" });
        if (!res.ok) throw new Error();
        await loadAdminTemplates();
        console.log(`Deleted template: ${title}`);
    } catch (err) {
        console.error("Delete failed:", err);
        alert("Delete failed.");
    }
}

/* =========================================
   SPECTATE USER TRACKER
========================================= */
function spectate(templateId) {
    console.log("Joining spectate room:", templateId);
    socket.emit("joinSpectate", templateId);

    // Navigate to spectate page (if you have one)
    const pageButton = document.querySelector('[data-page="spectate"]');
    if (pageButton) pageButton.click();
}

window.spectate = spectate;

/* =========================================
   MODAL TOGGLE
========================================= */
window.toggleModal = function(modalId = "trackerModal") {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const isHidden = modal.style.display === "none";
    modal.style.display = isHidden ? "flex" : "none";
    modal.classList.toggle("active");
};
