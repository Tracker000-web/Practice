// User achievements module
import { api } from "../../core/api.js";

export function initAchievements(userId) {
    const container = document.querySelector("[data-page='achievements']");
    if (!container) return;

    container.innerHTML = "<p>Loading achievements...</p>";

    loadAchievements(userId, container);
}

async function loadAchievements(userId, container) {
    try {
        const achievements = await api.get(`/user/${userId}/achievements`);
        if (!achievements.length) {
            container.innerHTML = "<p>No achievements yet.</p>";
            return;
        }

        container.innerHTML = achievements
            .map(a => `
                <div class="achievement">
                    <strong>${a.title}</strong>
                    <p>${a.description}</p>
                    <small>Earned: ${new Date(a.date).toLocaleDateString()}</small>
                </div>
            `)
            .join("");
    } catch (err) {
        console.error("Error loading achievements:", err);
        container.innerHTML = "<p>Error loading achievements.</p>";
    }
}
