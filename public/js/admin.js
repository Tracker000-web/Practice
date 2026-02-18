// public/js/admin.js
import { socket } from './socket.js';
import { initLayout } from "./layout.js";

/* =========================================
   CONFIG
========================================= */
const API = {
    templates: 'http://localhost:3000/api/admin/templates',
    createTemplate: 'http://localhost:3000/api/admin/create-template',
    deleteTemplate: (id) => `http://localhost:3000/api/admin/templates/${id}`
};

/* =========================================
   INIT
========================================= */
document.addEventListener("DOMContentLoaded", () => {
    initLayout();  
    loadAdminTemplates();
    registerSocketListeners();
});

/* =========================================
   SOCKET LISTENERS
========================================= */
function registerSocketListeners() {
    socket.on("refreshManagerCards", loadAdminTemplates);
    socket.on("trackerSubmitted", (templateId) => {
        console.log("Tracker submitted for template:", templateId);
        loadAdminTemplates();
    });
}

/* =========================================
   CREATE TEMPLATE
========================================= */
/* =========================================
   PUBLISH TEMPLATE
========================================= */
window.handlePublish = async function(event) {
    if (event) event.preventDefault();

    const input = document.getElementById("trackerInput");
    const name = input?.value?.trim();

    if (!name) {
        return alert("Please enter a template name.");
    }

    try {
        const res = await fetch("http://localhost:3000/api/admin/create-template", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: name,
                fields: [],       // you can customize later
                status: "live"
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText);
        }

        const data = await res.json();

        alert(`Template "${name}" published successfully!`);
        input.value = "";

        await loadAdminTemplates(); // reload admin cards

    } catch (err) {
        console.error("Publish failed:", err);
        alert("Publish failed. Check server logs.");
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

card.querySelector('.assign-btn').addEventListener('click', async () => {
    if (!confirm("Assign this template to ALL users?")) return;
    try {
        const res = await fetch('http://localhost:3000/api/admin/assign-template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateId: template.id })
        });

        if (!res.ok) throw new Error();
        alert(`Template "${template.title}" assigned to all users!`);
    } catch (err) {
        console.error(err);
        alert("Failed to assign template to all users.");
    }
});


/* =========================================
   DELETE TEMPLATE
========================================= */
async function deleteTemplate(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
        const res = await fetch(API.deleteTemplate(id), { method: "DELETE" });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Server error');
        }
        await loadAdminTemplates();
        console.log(`Deleted template: ${title}`);
    } catch (err) {
        console.error("Delete failed:", err);
        alert(`Delete failed: ${err.message}`);
    }
}


/* =========================================
   SPECTATE USER TRACKER
========================================= */
function spectate(templateId) {
    console.log("Joining spectate room:", templateId);
    socket.emit("joinSpectate", templateId);
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
