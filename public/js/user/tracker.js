// js/user/tracker.js

import { initSpreadsheet } from './spreadsheet.js'; // Optional: replace with your Handsontable/SheetJS init

// --- SOCKET.IO SETUP ---
const socket = io();

// --- CURRENT USER INFO ---
// Replace these with your actual authentication/user system
const currentUser = {
    id: 1,             // Logged-in user ID
    name: "Glenn",     // Logged-in user name
    workspace_id: 2    // User workspace ID
};

// --- TRACKER STATE ---
let currentManagercard = null;

// --- OPEN TRACKER FUNCTION ---
export function openTracker(managercard) {
    currentManagercard = managercard;

    // Join socket room to see companions
    socket.emit("join-managercard", {
        workspaceId: currentUser.workspace_id,
        managercardId: currentManagercard.id,
        user: {
            id: currentUser.id,
            name: currentUser.name
        }
    });

    // Initialize tracker spreadsheet
    initSpreadsheet(managercard.id);

    // Optional: show tracker list or any UI updates
    const trackerListEl = document.getElementById("trackerList");
    if (trackerListEl) {
        trackerListEl.innerHTML = `<p>Tracker for Manager: ${managercard.name}</p>`;
    }
}

// --- CLOSE TRACKER FUNCTION ---
export function closeTracker() {
    if (!currentManagercard) return;

    socket.emit("leave-managercard");
    currentManagercard = null;
}

// --- LISTEN FOR DIALERS UPDATE ---
socket.on("dialers-update", (dialers) => {
    if (!currentManagercard) return;

    // Remove self from list
    const companions = dialers
        .filter(u => u.userId !== currentUser.id)
        .map(u => u.name);

    const el = document.getElementById("dialersList");
    if (el) {
        el.innerText = companions.length ? companions.join(", ") : "You're alone";
    }
});

// --- AUTO LEAVE ON PAGE UNLOAD ---
window.addEventListener("beforeunload", () => {
    closeTracker();
});

// --- OPTIONAL: INIT FUNCTION FOR FIRST LOAD ---
export function initTrackerPage() {
    // Example: add click listeners for managercards in tracker list
    const managercardEls = document.querySelectorAll(".managercard-item");
    managercardEls.forEach(el => {
        el.addEventListener("click", () => {
            const managercard = {
                id: el.dataset.id,
                name: el.dataset.name
            };
            openTracker(managercard);
        });
    });
}