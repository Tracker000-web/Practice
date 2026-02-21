import { api } from "../../core/api.js";

// Define Milestone thresholds (You can also fetch these from an API)
const MILESTONES = {
    dials: [100, 500, 1000],
    contacts: [50, 200, 500],
    appointments: [10, 50, 100]
};

export function initAchievements(userId) {
    const container = document.querySelector("[data-page='achievements']");
    if (!container) return;

    container.innerHTML = "<p>Loading your performance...</p>";
    loadDashboard(userId, container);
}

async function loadDashboard(userId, container) {
    try {
        // Fetching both achievements and specific stats
        const [achievements, stats] = await Promise.all([
            api.get(`/user/${userId}/achievements`),
            api.get(`/user/${userId}/stats`) 
        ]);

        renderDashboard(container, stats, achievements);
    } catch (err) {
        console.error("Error loading dashboard:", err);
        container.innerHTML = "<p>Error loading data. Please try again later.</p>";
    }
}

function renderDashboard(container, stats, achievements) {
    container.innerHTML = `
        <section class="stats-summary">
            <h2>Performance Stats</h2>
            ${renderStatsTable(stats)}
        </section>

        <section class="milestones">
            <h2>Milestones</h2>
            ${renderMilestoneProgress(stats)}
        </section>

        <section class="achievements-list">
            <h2>Earned Badges</h2>
            ${achievements.length ? achievements.map(a => `
                <div class="achievement">
                    <strong>${a.title}</strong>
                    <p>${a.description}</p>
                    <small>Earned: ${new Date(a.date).toLocaleDateString()}</small>
                </div>
            `).join("") : "<p>No badges earned yet.</p>"}
        </section>
    `;
}

function renderStatsTable(stats) {
    // Expecting stats format: { weekly: { dials: 0, ... }, monthly: {...}, quarterly: {...} }
    const periods = ['weekly', 'monthly', 'quarterly'];
    const metrics = ['dials', 'contacts', 'appointments'];

    return `
        <table class="stats-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Weekly</th>
                    <th>Monthly</th>
                    <th>Quarterly</th>
                </tr>
            </thead>
            <tbody>
                ${metrics.map(m => `
                    <tr>
                        <td class="capitalize">${m}</td>
                        <td>${stats.weekly[m] || 0}</td>
                        <td>${stats.monthly[m] || 0}</td>
                        <td>${stats.quarterly[m] || 0}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function renderMilestoneProgress(stats) {
    // Using Monthly stats for milestone tracking
    const metrics = ['dials', 'contacts', 'appointments'];
    
    return metrics.map(m => {
        const current = stats.monthly[m] || 0;
        const nextMilestone = MILESTONES[m].find(goal => goal > current) || MILESTONES[m].slice(-1)[0];
        const progressPercent = Math.min((current / nextMilestone) * 100, 100);

        return `
            <div class="milestone-card">
                <label>${m.toUpperCase()}: ${current} / ${nextMilestone}</label>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>
        `;
    }).join("");
}