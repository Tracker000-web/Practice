// User tracker history module
import { api } from "../../core/api.js";

export function initHistory(userId) {
    const container = document.getElementById("historyList");
    if (!container) return;

    container.innerHTML = "Loading history...";

    loadHistory(userId, container);
}

async function loadHistory(userId, container) {
    try {
        const history = await api.get(`/user/${userId}/history`);
        if (!history.length) {
            container.innerHTML = "<p>No history yet.</p>";
            return;
        }

        container.innerHTML = history
            .map(h => renderHistoryItem(h))
            .join("");
    } catch (err) {
        console.error("Error loading history:", err);
        container.innerHTML = "<p>Error loading history.</p>";
    }
}

function renderHistoryItem(item) {
    return `
        <div class="history-item">
            <strong>ID:</strong> ${item.id}
            <span>${new Date(item.created_at).toLocaleString()}</span>
            <p>Status: ${item.status}</p>
            <p>Comment: ${item.comment || "-"}</p>
        </div>
    `;
}
