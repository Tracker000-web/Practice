import { socket } from './socket.js';


// 1️⃣ Add New Manager (Modal Logic)
window.saveNewManager = async function() {
    const nameInput = document.getElementById('newManagerName');
    const managerName = nameInput.value.trim();

    if (!managerName) return alert("Please enter a name");

    const res = await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: managerName, is_new: true })
    });

    if (res.ok) {
        nameInput.value = "";
        toggleModal('addManagerModal'); // Close modal
        loadAdminTrackers(); // Refresh the list of cards
    }
};

window.handlePush = async function(event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById('trackerInput');
    const managerName = nameInput.value ? nameInput.value.trim() : "";

    if (!managerName) return alert("Please enter a name");

    try {
        // 1. Save to Database via your API
        const res = await fetch('/api/managers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: managerName, 
                is_new: true // This triggers the "NEW" badge on user end
            })
        });

        if (res.ok) {
            // 2. TRIGGER WORKFLOW: Tell the server to alert all users
            socket.emit("adminPushedCard");

            // 3. UI Cleanup
            nameInput.value = "";
            toggleModal(trackerModal); // Close the modal
            
            // Refresh the admin's own list to see the new manager
            if (typeof loadAdminTrackers === 'function') loadAdminTrackers();
            
            console.log(`Successfully pushed ${managerName}`);
        } else {
            const errorData = await res.json();
            alert(`Error: ${errorData.error || 'Server rejected the request'}`);
        }
    } catch (err) {
        console.error("Push failed:", err);
        alert("Network error. Please check if the server is running.");
    }
};

export function renderAdminCard(tracker) {
    const list = document.getElementById('trackerList');
    const card = document.createElement('div');
    card.className = "manager-card admin-view";

    card.innerHTML = `
        <div class="card-info">
            <span>${tracker.name}</span>
            ${tracker.is_new ? '<span class="badge-new">NEW</span>' : ''}
        </div>
        <div class="card-actions">
            <button class="spectate-btn" onclick="spectate(${tracker.id})">
                Spectate
            </button>
            <button class="delete-btn" onclick="deleteManager(${tracker.id}, '${tracker.name}')" style="background: #ff4d4d; color: white;">
                Delete
            </button>
        </div>
    `;

    list.appendChild(card);
}

// 2️⃣ New Delete Function
window.deleteManager = async function(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove it from all users.`)) {
        return;
    }

    try {
        const res = await fetch(`/api/managers/${id}`, { method: 'DELETE' });

        if (res.ok) {
            // Tell users to refresh so the card disappears for them too
            socket.emit("adminPushedCard"); 
            
            // Refresh admin's own list
            loadAdminTrackers(); 
            alert("Manager deleted successfully.");
        } else {
            alert("Error deleting manager.");
        }
    } catch (err) {
        console.error("Delete failed:", err);
    }
};

// 2️⃣ Spectate Live Logic
window.spectate = function(user_tracker_id) {
    console.log("Viewing Live Tracker:", user_tracker_id);
    
    // Join the specific room for this tracker
    socket.emit("joinSpectate", user_tracker_id);

    // Switch to the 'Spectate' tab/view in your Admin UI
    document.querySelector('[data-page="spectate"]').click(); 

    // Listen for live updates from the user's end
    socket.on("liveUpdate", (data) => {
        const liveView = document.getElementById('live-spectate-content');
        if (liveView) {
            liveView.innerHTML = data.content; // Injects the user's table HTML live
        }
    });
};

// 3️⃣ Helper: Global Modal Toggle
window.toggleModal = function(modalId = 'trackerModal') {
    // If modalId is an Event object (sometimes happens with listeners), default it
    if (typeof modalId !== 'string') modalId = 'trackerModal';
    
    const modal = document.getElementById(modalId);
    if (modal) {
        // Switch between display styles to match your inline HTML style
        const isHidden = modal.style.display === 'none';
        modal.style.display = isHidden ? 'flex' : 'none';
        
        // Also toggle the 'active' class for CSS animations if you have them
        modal.classList.toggle('active');
    } else {
        console.error("Modal not found with ID:", modalId);
    }
};

export async function loadAdminTrackers() {
    try {
        const res = await fetch('/api/trackers');
        
        // If the server returns 404, this will catch the error before the JSON crash
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const trackers = await res.json();

        const list = document.getElementById('trackerList');
        if (list) {
            list.innerHTML = "";
            // Make sure this function name matches what you wrote for the admin cards
            trackers.forEach(renderAdminCard); 
        }
    } catch (err) {
        console.error("Failed to load trackers:", err);
    }
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

