export async function loadAnalytics() {
    const container = document.getElementById('analytics-content');
    if (!container) return;

    try {
        const res = await fetch('/api/analytics');
        const data = await res.json();

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Total Submissions</h4>
                    <p class="stat-number">${data.totalSubmissions}</p>
                </div>
                <div class="stat-card">
                    <h4>Active Users</h4>
                    <p class="stat-number">${data.activeUsers}</p>
                </div>
            </div>

            <h3>Submissions by Manager</h3>
            <table class="analytics-table">
                <thead>
                    <tr>
                        <th>Manager Name</th>
                        <th>Completed Trackers</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.breakdown.map(m => `
                        <tr>
                            <td>${m.name}</td>
                            <td>${m.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (err) {
        console.error("Failed to load analytics:", err);
    }
}

window.loadAnalytics = loadAnalytics;