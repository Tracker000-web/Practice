// User practice module
import { api } from "../../core/api.js";

export function initPractice(userId) {
    const container = document.querySelector("[data-page='practice']");
    if (!container) return;

    container.innerHTML = "<p>Loading practice tasks...</p>";

    loadPracticeTasks(userId, container);
}

async function loadPracticeTasks(userId, container) {
    try {
        const tasks = await api.get(`/user/${userId}/practice`);
        if (!tasks.length) {
            container.innerHTML = "<p>No practice tasks assigned.</p>";
            return;
        }

        container.innerHTML = tasks
            .map(t => `
                <div class="practice-task">
                    <strong>${t.title}</strong>
                    <p>${t.description}</p>
                    <small>Deadline: ${new Date(t.due_date).toLocaleDateString()}</small>
                </div>
            `)
            .join("");
    } catch (err) {
        console.error("Error loading practice tasks:", err);
        container.innerHTML = "<p>Error loading practice tasks.</p>";
    }
}
